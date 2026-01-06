import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'ChatGPT XLSX Analyzer',
  description: 'Minimalist chat interface with spreadsheet analysis capabilities',
};

// Force dynamic rendering to avoid SSR issues with AI SDK
export const dynamic = 'force-dynamic';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
