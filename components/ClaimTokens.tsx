'use client';

import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import { Program, AnchorProvider } from '@coral-xyz/anchor';
import { TOKEN_PROGRAM_ID, getAssociatedTokenAddress } from '@solana/spl-token';
import { useState } from 'react';
import idl from '../token_vesting.json';

const PROGRAM_ID = new PublicKey('YX7NekYqBdajibeV4uvToKjsNtgxCPQxJpPX2dJyS9X');
const TOKEN_MINT = new PublicKey('AfLDWnWoBoXepiwkeDPq5jb7psUHT2zepHFA9MSS5Q31');

export function ClaimTokens() {
  const { connection } = useConnection();
  const wallet = useWallet();

  const [vestingScheduleAddress, setVestingScheduleAddress] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const [vestingInfo, setVestingInfo] = useState<any>(null);

  const fetchVestingInfo = async () => {
    if (!wallet.publicKey || !vestingScheduleAddress) {
      setStatus('Please connect wallet and enter vesting schedule address');
      return;
    }

    try {
      setLoading(true);
      setStatus('Fetching vesting information...');

      const provider = new AnchorProvider(
        connection,
        wallet as any,
        { commitment: 'confirmed' }
      );

      const program = new Program(idl as any, provider);

      const vestingSchedule = await program.account.vestingSchedule.fetch(
        new PublicKey(vestingScheduleAddress)
      );

      const currentTime = Math.floor(Date.now() / 1000);
      const totalAmount = vestingSchedule.totalAmount.toNumber() / 1e9;
      const claimedAmount = vestingSchedule.claimedAmount.toNumber() / 1e9;
      const startTime = vestingSchedule.startTime.toNumber();
      const cliffDuration = vestingSchedule.cliffDuration.toNumber();
      const vestingDuration = vestingSchedule.vestingDuration.toNumber();

      let unlocked = 0;
      if (currentTime >= startTime + cliffDuration) {
        if (currentTime >= startTime + vestingDuration) {
          unlocked = totalAmount;
        } else {
          const elapsed = currentTime - startTime;
          unlocked = (totalAmount * elapsed) / vestingDuration;
        }
      }

      const claimable = Math.max(0, unlocked - claimedAmount);

      setVestingInfo({
        totalAmount,
        claimedAmount,
        unlockedAmount: unlocked,
        claimableAmount: claimable,
        startTime: new Date(startTime * 1000).toLocaleString(),
        cliffDuration: `${cliffDuration / 86400} days`,
        vestingDuration: `${vestingDuration / 86400} days`,
        isRevoked: vestingSchedule.isRevoked,
        revocable: vestingSchedule.revocable,
      });

      setStatus('Vesting information loaded successfully');
    } catch (error: any) {
      console.error('Error:', error);
      setStatus(`Error: ${error.message}`);
      setVestingInfo(null);
    } finally {
      setLoading(false);
    }
  };

  const claimTokens = async () => {
    if (!wallet.publicKey || !wallet.signTransaction) {
      setStatus('Please connect your wallet');
      return;
    }

    try {
      setLoading(true);
      setStatus('Claiming tokens...');

      const provider = new AnchorProvider(
        connection,
        wallet as any,
        { commitment: 'confirmed' }
      );

      const program = new Program(idl as any, provider);

      const vestingSchedulePubkey = new PublicKey(vestingScheduleAddress);

      // Vault is an Associated Token Account owned by the vesting schedule PDA
      const vaultPda = await getAssociatedTokenAddress(
        TOKEN_MINT,
        vestingSchedulePubkey,
        true // allowOwnerOffCurve - PDAs are off-curve addresses
      );

      const beneficiaryTokenAccount = await getAssociatedTokenAddress(
        TOKEN_MINT,
        wallet.publicKey
      );

      const tx = await program.methods
        .claim()
        .accounts({
          beneficiary: wallet.publicKey,
          vestingSchedule: vestingSchedulePubkey,
          vault: vaultPda,
          beneficiaryTokenAccount,
          tokenProgram: TOKEN_PROGRAM_ID,
        })
        .rpc();

      setStatus(`Success! Tokens claimed. TX: ${tx}`);
      console.log('Transaction:', tx);

      setTimeout(() => fetchVestingInfo(), 2000);
    } catch (error: any) {
      console.error('Error:', error);
      setStatus(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', color: '#1f2937' }}>
        Claim Vested Tokens
      </h2>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
            Vesting Schedule Address
          </label>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <input
              type="text"
              value={vestingScheduleAddress}
              onChange={(e) => setVestingScheduleAddress(e.target.value)}
              placeholder="Enter vesting schedule address"
              style={{
                flex: 1,
                padding: '0.75rem',
                border: '2px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '1rem'
              }}
            />
            <button
              onClick={fetchVestingInfo}
              disabled={loading || !wallet.connected}
              style={{
                padding: '0.75rem 1.5rem',
                background: loading || !wallet.connected ? '#9ca3af' : '#667eea',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontWeight: 'bold',
                cursor: loading || !wallet.connected ? 'not-allowed' : 'pointer'
              }}
            >
              {loading ? 'Loading...' : 'Fetch Info'}
            </button>
          </div>
        </div>

        {vestingInfo && (
          <div style={{
            padding: '1.5rem',
            background: '#f9fafb',
            border: '2px solid #e5e7eb',
            borderRadius: '8px'
          }}>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem', color: '#1f2937' }}>
              Vesting Details
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', fontSize: '0.95rem' }}>
              <div>
                <p style={{ color: '#6b7280' }}>Total Amount:</p>
                <p style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>{vestingInfo.totalAmount.toFixed(2)} tokens</p>
              </div>
              <div>
                <p style={{ color: '#6b7280' }}>Claimed:</p>
                <p style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>{vestingInfo.claimedAmount.toFixed(2)} tokens</p>
              </div>
              <div>
                <p style={{ color: '#6b7280' }}>Unlocked:</p>
                <p style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>{vestingInfo.unlockedAmount.toFixed(2)} tokens</p>
              </div>
              <div>
                <p style={{ color: '#6b7280' }}>Claimable Now:</p>
                <p style={{ fontWeight: 'bold', fontSize: '1.1rem', color: '#10b981' }}>
                  {vestingInfo.claimableAmount.toFixed(2)} tokens
                </p>
              </div>
              <div>
                <p style={{ color: '#6b7280' }}>Start Time:</p>
                <p style={{ fontWeight: '500' }}>{vestingInfo.startTime}</p>
              </div>
              <div>
                <p style={{ color: '#6b7280' }}>Cliff Duration:</p>
                <p style={{ fontWeight: '500' }}>{vestingInfo.cliffDuration}</p>
              </div>
              <div>
                <p style={{ color: '#6b7280' }}>Vesting Duration:</p>
                <p style={{ fontWeight: '500' }}>{vestingInfo.vestingDuration}</p>
              </div>
              <div>
                <p style={{ color: '#6b7280' }}>Status:</p>
                <p style={{
                  fontWeight: 'bold',
                  color: vestingInfo.isRevoked ? '#ef4444' : '#10b981'
                }}>
                  {vestingInfo.isRevoked ? 'Revoked' : 'Active'}
                </p>
              </div>
            </div>
          </div>
        )}

        <button
          onClick={claimTokens}
          disabled={loading || !wallet.connected || !vestingInfo || vestingInfo.claimableAmount <= 0}
          style={{
            width: '100%',
            padding: '1rem',
            background: (loading || !wallet.connected || !vestingInfo || vestingInfo?.claimableAmount <= 0)
              ? '#9ca3af'
              : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '1.1rem',
            fontWeight: 'bold',
            cursor: (loading || !wallet.connected || !vestingInfo || vestingInfo?.claimableAmount <= 0)
              ? 'not-allowed'
              : 'pointer',
            transition: 'transform 0.2s'
          }}
          onMouseEnter={(e) => {
            if (!loading && wallet.connected && vestingInfo && vestingInfo.claimableAmount > 0) {
              e.currentTarget.style.transform = 'translateY(-2px)';
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
          }}
        >
          {loading ? 'Processing...' : 'Claim Tokens'}
        </button>

        {status && (
          <div style={{
            padding: '1rem',
            background: status.includes('Error') ? '#fee2e2' : '#d1fae5',
            border: `2px solid ${status.includes('Error') ? '#ef4444' : '#10b981'}`,
            borderRadius: '8px',
            color: status.includes('Error') ? '#991b1b' : '#065f46',
            wordBreak: 'break-all'
          }}>
            {status}
          </div>
        )}
      </div>
    </div>
  );
}
