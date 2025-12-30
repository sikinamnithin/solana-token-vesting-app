# Solana Token Vesting Platform

A decentralized token vesting platform built on Solana that allows companies to create vesting schedules for employees, investors, and advisors.

## Features

- **Create Vesting Schedules**: Set up token vesting with customizable parameters
- **Flexible Time Units**: Configure cliff and vesting periods in seconds, minutes, hours, or days
- **Linear Vesting**: Tokens unlock gradually over the vesting period
- **Cliff Period**: Optional waiting period before tokens start unlocking
- **Claim Interface**: Beneficiaries can view and claim unlocked tokens
- **Revocable Option**: Companies can optionally make vesting schedules revocable

## Tech Stack

- **Frontend**: Next.js 16, React, TypeScript
- **Blockchain**: Solana (Anchor Framework)
- **Wallet**: Solana Wallet Adapter (Phantom, Solflare, etc.)
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- A Solana wallet (Phantom recommended)
- Devnet SOL for testing

### Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Configuration

The app is configured for **Solana Devnet** by default.

**Program Details:**
- **Program ID**: `YX7NekYqBdajibeV4uvToKjsNtgxCPQxJpPX2dJyS9X`
- **Token Mint**: `AfLDWnWoBoXepiwkeDPq5jb7psUHT2zepHFA9MSS5Q31`
- **Network**: Devnet

To use on mainnet, update the configuration in:
- `contexts/WalletContextProvider.tsx` - Change network to Mainnet
- `components/CreateVesting.tsx` - Update PROGRAM_ID and TOKEN_MINT
- `components/ClaimTokens.tsx` - Update PROGRAM_ID and TOKEN_MINT

## Usage

### For Companies (Creating Vesting):

1. Connect your wallet (must have tokens to vest)
2. Fill in vesting schedule details:
   - **Beneficiary Address**: Wallet address of the recipient
   - **Amount**: Number of tokens to vest
   - **Start Time**: When vesting begins
   - **Cliff Duration**: Waiting period before any tokens unlock
   - **Vesting Duration**: Total time over which tokens unlock
   - **Revocable**: Whether the company can cancel the vesting
3. Click "Create Vesting Schedule"
4. Save the vesting schedule address for the beneficiary

### For Beneficiaries (Claiming Tokens):

1. Connect your wallet (the beneficiary wallet)
2. Enter the vesting schedule address
3. Click "Fetch Info" to view vesting details
4. Click "Claim Tokens" to claim unlocked tokens

## How Vesting Works

```
Start Time ──[Cliff Period]──> Unlock Begins ──[Linear Vesting]──> Fully Vested
    |              |                  |                                  |
   0%             0%            Tokens unlocking               All tokens unlocked
```

- **Before Cliff**: 0% of tokens are available
- **After Cliff**: Tokens unlock linearly over the vesting duration
- **Example**:
  - 1000 tokens
  - 1 day cliff
  - 30 day vesting
  - After 16 days total (1 cliff + 15 vesting): ~500 tokens unlocked

## Deployment on Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

1. Push to GitHub
2. Import repository in Vercel
3. Deploy (auto-detects Next.js)

## Security Notes

⚠️ **This app is configured for Devnet testing**

- Never send real funds to devnet addresses
- Always verify addresses and transactions
- Test thoroughly before mainnet deployment
- Audit the smart contract before production use

## License

MIT

## Support

For issues and questions, please open an issue on GitHub.
