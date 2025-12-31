import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import '@solana/wallet-adapter-react-ui/styles.css';
import { WalletContextProvider } from '../contexts/WalletContextProvider';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Solana Token Vesting Platform | Create & Manage Vesting Schedules',
  description: 'Decentralized token vesting platform on Solana. Create vesting schedules with customizable cliff periods and linear unlocking for employees, investors, and advisors.',
  keywords: ['Solana', 'Token Vesting', 'DeFi', 'Blockchain', 'Cryptocurrency'],
  authors: [{ name: 'Solana Token Vesting' }],
  openGraph: {
    title: 'Solana Token Vesting Platform',
    description: 'Create and manage token vesting schedules on Solana',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <script src="https://cdn.tailwindcss.com"></script>
      </head>
      <body className={inter.className}>
        <WalletContextProvider>{children}</WalletContextProvider>
      </body>
    </html>
  );
}
