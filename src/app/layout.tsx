import React from 'react';
import type { Metadata } from 'next';
import '../../fonts.css';
import '../tailwind.css';

export const metadata: Metadata = {
  title: 'แผนพัฒนาท้องถิ่น อบต.สงยาง | Songyang Plan',
  description: 'ระบบสืบค้นแผนพัฒนาท้องถิ่น องค์การบริหารส่วนตำบลสงยาง อำเภอมหาชนะชัย จังหวัดยโสธร',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="th">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
      </head>
      <body className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 antialiased selection:bg-sky-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}
