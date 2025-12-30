'use client';

import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { CreateVesting } from '../components/CreateVesting';
import { ClaimTokens } from '../components/ClaimTokens';
import { useState } from 'react';

export default function Home() {
  const [activeTab, setActiveTab] = useState<'create' | 'claim'>('create');

  return (
    <main style={{ minHeight: '100vh', padding: '2rem' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <header style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '3rem'
        }}>
          <h1 style={{
            fontSize: '2.5rem',
            fontWeight: 'bold',
            color: 'white',
            textShadow: '0 2px 4px rgba(0,0,0,0.2)'
          }}>
            Token Vesting Platform
          </h1>
          <WalletMultiButton />
        </header>

        <div style={{
          background: 'white',
          borderRadius: '16px',
          padding: '2rem',
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
        }}>
          <div style={{
            display: 'flex',
            gap: '1rem',
            marginBottom: '2rem',
            borderBottom: '2px solid #e5e7eb'
          }}>
            <button
              onClick={() => setActiveTab('create')}
              style={{
                padding: '1rem 2rem',
                background: 'none',
                border: 'none',
                borderBottom: activeTab === 'create' ? '3px solid #667eea' : 'none',
                fontWeight: activeTab === 'create' ? 'bold' : 'normal',
                color: activeTab === 'create' ? '#667eea' : '#6b7280',
                fontSize: '1.1rem'
              }}
            >
              Create Vesting Schedule
            </button>
            <button
              onClick={() => setActiveTab('claim')}
              style={{
                padding: '1rem 2rem',
                background: 'none',
                border: 'none',
                borderBottom: activeTab === 'claim' ? '3px solid #667eea' : 'none',
                fontWeight: activeTab === 'claim' ? 'bold' : 'normal',
                color: activeTab === 'claim' ? '#667eea' : '#6b7280',
                fontSize: '1.1rem'
              }}
            >
              Claim Tokens
            </button>
          </div>

          {activeTab === 'create' ? <CreateVesting /> : <ClaimTokens />}
        </div>

        <footer style={{
          marginTop: '3rem',
          textAlign: 'center',
          color: 'white',
          opacity: 0.9
        }}>
          <p>Token Mint: <code style={{
            background: 'rgba(255,255,255,0.2)',
            padding: '0.25rem 0.5rem',
            borderRadius: '4px'
          }}>AfLDWnWoBoXepiwkeDPq5jb7psUHT2zepHFA9MSS5Q31</code></p>
          <p style={{ marginTop: '0.5rem', fontSize: '0.9rem' }}>
            Program ID: YX7NekYqBdajibeV4uvToKjsNtgxCPQxJpPX2dJyS9X
          </p>
        </footer>
      </div>
    </main>
  );
}
