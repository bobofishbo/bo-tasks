import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { AppSwitcher } from './components/AppSwitcher';
import './globals.css';

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] });
const geistMono = Geist_Mono({ variable: '--font-geist-mono', subsets: ['latin'] });

export const metadata: Metadata = {
  title: "Bo's Space",
  description: 'Task manager and content planner',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <AppSwitcher />
        <main className="pt-14">{children}</main>
      </body>
    </html>
  );
}
