'use client';

import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { PublicKey, SystemProgram } from '@solana/web3.js';
import { Program, AnchorProvider, BN } from '@coral-xyz/anchor';
import { TOKEN_PROGRAM_ID, getAssociatedTokenAddress } from '@solana/spl-token';
import { useState } from 'react';
import idl from '../token_vesting.json';

const PROGRAM_ID = new PublicKey('YX7NekYqBdajibeV4uvToKjsNtgxCPQxJpPX2dJyS9X');
const TOKEN_MINT = new PublicKey('AfLDWnWoBoXepiwkeDPq5jb7psUHT2zepHFA9MSS5Q31');

export function CreateVesting() {
  const { connection } = useConnection();
  const wallet = useWallet();

  const [beneficiary, setBeneficiary] = useState('');
  const [amount, setAmount] = useState('');
  const [startTime, setStartTime] = useState('');
  const [cliffDuration, setCliffDuration] = useState('');
  const [cliffUnit, setCliffUnit] = useState<'seconds' | 'minutes' | 'hours' | 'days'>('days');
  const [vestingDuration, setVestingDuration] = useState('');
  const [vestingUnit, setVestingUnit] = useState<'seconds' | 'minutes' | 'hours' | 'days'>('days');
  const [revocable, setRevocable] = useState(true);
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);

  // Convert time to seconds based on unit
  const convertToSeconds = (value: string, unit: 'seconds' | 'minutes' | 'hours' | 'days'): number => {
    const num = parseFloat(value);
    if (isNaN(num)) return 0;

    switch (unit) {
      case 'seconds': return num;
      case 'minutes': return num * 60;
      case 'hours': return num * 3600;
      case 'days': return num * 86400;
      default: return num;
    }
  };

  const createVestingSchedule = async () => {
    if (!wallet.publicKey || !wallet.signTransaction) {
      setStatus('Please connect your wallet');
      return;
    }

    try {
      setLoading(true);
      setStatus('Creating vesting schedule...');

      const provider = new AnchorProvider(
        connection,
        wallet as any,
        { commitment: 'confirmed' }
      );

      const program = new Program(idl as any, provider);

      const beneficiaryPubkey = new PublicKey(beneficiary);

      // Derive the vesting schedule PDA (not a random keypair!)
      const [vestingSchedulePda] = PublicKey.findProgramAddressSync(
        [
          Buffer.from('vesting'),
          wallet.publicKey.toBuffer(),
          beneficiaryPubkey.toBuffer(),
          TOKEN_MINT.toBuffer()
        ],
        PROGRAM_ID
      );

      // Vault is an Associated Token Account owned by the vesting schedule PDA
      const vaultPda = await getAssociatedTokenAddress(
        TOKEN_MINT,
        vestingSchedulePda,
        true // allowOwnerOffCurve - PDAs are off-curve addresses
      );

      const companyTokenAccount = await getAssociatedTokenAddress(
        TOKEN_MINT,
        wallet.publicKey
      );

      const currentTime = Math.floor(Date.now() / 1000);
      const startTimestamp = startTime ? new Date(startTime).getTime() / 1000 : currentTime + 60;

      const cliffSeconds = convertToSeconds(cliffDuration, cliffUnit);
      const vestingSeconds = convertToSeconds(vestingDuration, vestingUnit);

      // @ts-ignore - IDL types are correct at runtime
      const tx = await program.methods
        .createVesting(
          new BN(parseFloat(amount) * 1e9),
          new BN(Math.floor(startTimestamp)),
          new BN(cliffSeconds),
          new BN(vestingSeconds),
          revocable
        )
        .accounts({
          company: wallet.publicKey,
          beneficiary: beneficiaryPubkey,
          vestingSchedule: vestingSchedulePda,
          vault: vaultPda,
          mint: TOKEN_MINT,
          companyTokenAccount,
          tokenProgram: TOKEN_PROGRAM_ID,
          systemProgram: SystemProgram.programId,
        })
        .rpc();

      setStatus(`Success! Vesting schedule created. TX: ${tx}`);
      console.log('Vesting Schedule PDA:', vestingSchedulePda.toString());
      console.log('Vault PDA:', vaultPda.toString());
      console.log('Transaction:', tx);

      setBeneficiary('');
      setAmount('');
      setStartTime('');
      setCliffDuration('');
      setVestingDuration('');
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
        Create Vesting Schedule
      </h2>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
            Beneficiary Address
          </label>
          <input
            type="text"
            value={beneficiary}
            onChange={(e) => setBeneficiary(e.target.value)}
            placeholder="Beneficiary wallet address"
            style={{
              width: '100%',
              padding: '0.75rem',
              border: '2px solid #e5e7eb',
              borderRadius: '8px',
              fontSize: '1rem'
            }}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
              Amount (tokens)
            </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="1000"
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '2px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '1rem'
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
              Start Time
            </label>
            <input
              type="datetime-local"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '2px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '1rem'
              }}
            />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
              Cliff Duration
            </label>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input
                type="number"
                value={cliffDuration}
                onChange={(e) => setCliffDuration(e.target.value)}
                placeholder="1"
                style={{
                  flex: 2,
                  padding: '0.75rem',
                  border: '2px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '1rem'
                }}
              />
              <select
                value={cliffUnit}
                onChange={(e) => setCliffUnit(e.target.value as any)}
                style={{
                  flex: 1,
                  padding: '0.75rem',
                  border: '2px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  background: 'white'
                }}
              >
                <option value="seconds">Seconds</option>
                <option value="minutes">Minutes</option>
                <option value="hours">Hours</option>
                <option value="days">Days</option>
              </select>
            </div>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
              Vesting Duration
            </label>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input
                type="number"
                value={vestingDuration}
                onChange={(e) => setVestingDuration(e.target.value)}
                placeholder="30"
                style={{
                  flex: 2,
                  padding: '0.75rem',
                  border: '2px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '1rem'
                }}
              />
              <select
                value={vestingUnit}
                onChange={(e) => setVestingUnit(e.target.value as any)}
                style={{
                  flex: 1,
                  padding: '0.75rem',
                  border: '2px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  background: 'white'
                }}
              >
                <option value="seconds">Seconds</option>
                <option value="minutes">Minutes</option>
                <option value="hours">Hours</option>
                <option value="days">Days</option>
              </select>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <input
            type="checkbox"
            id="revocable"
            checked={revocable}
            onChange={(e) => setRevocable(e.target.checked)}
            style={{ width: '1.25rem', height: '1.25rem' }}
          />
          <label htmlFor="revocable" style={{ fontWeight: '500' }}>
            Revocable (company can revoke vesting)
          </label>
        </div>

        <button
          onClick={createVestingSchedule}
          disabled={loading || !wallet.connected}
          style={{
            width: '100%',
            padding: '1rem',
            background: loading || !wallet.connected ? '#9ca3af' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '1.1rem',
            fontWeight: 'bold',
            cursor: loading || !wallet.connected ? 'not-allowed' : 'pointer',
            transition: 'transform 0.2s'
          }}
          onMouseEnter={(e) => {
            if (!loading && wallet.connected) {
              e.currentTarget.style.transform = 'translateY(-2px)';
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
          }}
        >
          {loading ? 'Creating...' : 'Create Vesting Schedule'}
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
