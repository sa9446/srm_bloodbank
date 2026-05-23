import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Blood Donation Camp — SRM MCH & RC',
  description: 'Online donor registration for SRM Medical College Hospital Blood Donation Camp',
  themeColor: '#9f1239',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen">
        {children}
      </body>
    </html>
  );
}
