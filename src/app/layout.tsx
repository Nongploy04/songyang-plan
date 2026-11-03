import React from 'react';
import type { Metadata } from 'next';
import { RscRetryBoundary } from '../components/RscRetryBoundary.tsx';
import '../../fonts.css';
import '../tailwind.css';

export const metadata: Metadata = {
  icons: { icon: '/favicon.ico', shortcut: '/favicon.svg', apple: '/apple-touch-icon.png' },
  title: 'แผนพัฒนาท้องถิ่น · อบต.สงยาง',
  description: 'ระบบสืบค้นแผนพัฒนาท้องถิ่น องค์การบริหารส่วนตำบลสงยาง อำเภอมหาชนะชัย จังหวัดยโสธร',
  robots: { index: false, follow: false, nocache: true, googleBot: { index: false, follow: false } },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="th" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
      </head>
      <body className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 antialiased selection:bg-sky-500 selection:text-white">
        <RscRetryBoundary title="ระบบแผนพัฒนาท้องถิ่นขัดข้อง">
          {children}
        </RscRetryBoundary>
      </body>
    </html>
  );
}
