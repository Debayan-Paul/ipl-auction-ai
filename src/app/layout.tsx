import type { Metadata } from 'next';
import '@/styles/globals.css';

export const metadata: Metadata = {
  title: 'IPL Auction Arena — AI-Powered Cricket Analytics & Live Auction',
  description:
    'The ultimate IPL analytics platform. AI-powered player predictions, real-time live auctions, team comparison, and franchise management. Built for cricket fans, analysts, and IPL team managers.',
  keywords: [
    'IPL',
    'cricket',
    'auction',
    'analytics',
    'AI predictions',
    'player stats',
    'team comparison',
    'live auction',
    'IPL 2027',
  ],
  authors: [{ name: 'IPL Auction Arena' }],
  openGraph: {
    title: 'IPL Auction Arena — AI-Powered Cricket Analytics',
    description: 'Real-time IPL auction platform with AI predictions and player analytics.',
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
      <body>{children}</body>
    </html>
  );
}
