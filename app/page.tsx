'use client';

import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { CreateVesting } from '../components/CreateVesting';
import { ClaimTokens } from '../components/ClaimTokens';
import { useState } from 'react';

export default function Home() {
  const [activeTab, setActiveTab] = useState<'create' | 'claim'>('create');

  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      {/* Devnet Warning Banner */}
      <div className="bg-yellow-500 text-black py-2 px-4 text-center font-semibold">
        ⚠️ DEVNET ONLY - For Testing Purposes
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12 mt-8">
          <div className="inline-block mb-4 px-4 py-2 bg-purple-500/20 backdrop-blur-sm rounded-full border border-purple-300/30">
            <span className="text-purple-200 text-sm font-medium">Powered by Solana</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-4 bg-clip-text text-transparent bg-gradient-to-r from-purple-200 to-blue-200">
            Token Vesting Platform
          </h1>
          <p className="text-xl text-purple-200 max-w-2xl mx-auto">
            Create and manage token vesting schedules with customizable cliff periods and linear unlocking
          </p>
        </div>

        {/* Wallet Connection */}
        <div className="flex justify-center mb-8">
          <WalletMultiButton className="!bg-gradient-to-r !from-purple-500 !to-blue-500 hover:!from-purple-600 hover:!to-blue-600" />
        </div>

        {/* Main Card */}
        <div className="bg-white/95 backdrop-blur-lg rounded-2xl shadow-2xl overflow-hidden border border-purple-100">
          {/* Tabs */}
          <div className="flex border-b border-gray-200 bg-gray-50/50">
            <button
              onClick={() => setActiveTab('create')}
              className={`flex-1 py-4 px-6 text-center font-semibold text-lg transition-all ${
                activeTab === 'create'
                  ? 'text-purple-600 border-b-4 border-purple-600 bg-white'
                  : 'text-gray-600 hover:text-purple-600 hover:bg-gray-100'
              }`}
            >
              <span className="inline-block mr-2">📝</span>
              Create Vesting Schedule
            </button>
            <button
              onClick={() => setActiveTab('claim')}
              className={`flex-1 py-4 px-6 text-center font-semibold text-lg transition-all ${
                activeTab === 'claim'
                  ? 'text-purple-600 border-b-4 border-purple-600 bg-white'
                  : 'text-gray-600 hover:text-purple-600 hover:bg-gray-100'
              }`}
            >
              <span className="inline-block mr-2">💰</span>
              Claim Tokens
            </button>
          </div>

          {/* Content */}
          <div className="p-8">
            {activeTab === 'create' ? <CreateVesting /> : <ClaimTokens />}
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-12 text-center text-purple-200 space-y-3">
          <div className="bg-white/10 backdrop-blur-sm rounded-lg px-6 py-4 inline-block">
            <p className="text-sm font-medium mb-2">Network Configuration</p>
            <div className="space-y-1 text-xs">
              <p>
                <span className="text-purple-300">Token Mint:</span>{' '}
                <code className="bg-black/20 px-2 py-1 rounded">
                  AfLDWnWoBoXepiwkeDPq5jb7psUHT2zepHFA9MSS5Q31
                </code>
              </p>
              <p>
                <span className="text-purple-300">Program ID:</span>{' '}
                <code className="bg-black/20 px-2 py-1 rounded">
                  YX7NekYqBdajibeV4uvToKjsNtgxCPQxJpPX2dJyS9X
                </code>
              </p>
            </div>
          </div>
        </footer>
      </div>
    </main>
  );
}
