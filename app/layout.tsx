import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'ChatGPT XLSX Analyzer',
  description: 'Minimalist chat interface with spreadsheet analysis capabilities',
};

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
