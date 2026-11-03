'use client';
import { catchError, type ErrorInfo } from 'next/error';
import type { ReactNode } from 'react';

function RetryFallback({ title }: { title: string }, { retry }: ErrorInfo) {
  const handleRetry = () => {
    try {
      if ('caches' in window) {
        caches.keys().then((keys) => Promise.all(keys.map((k) => caches.delete(k)))).catch(() => {});
      }
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.getRegistrations().then((regs) => Promise.all(regs.map((r) => r.unregister()))).catch(() => {});
      }
    } catch {}
    try {
      retry();
    } catch {
      window.location.reload();
    }
  };

  return (
    <section role="alert" className="mx-auto max-w-lg p-8 text-center flex flex-col items-center justify-center min-h-[50vh] gap-3">
      <h2 className="text-base font-bold text-slate-800 dark:text-slate-200">{title}</h2>
      <p className="text-xs text-slate-500 dark:text-slate-400">ระบบส่วนนี้มีปัญหาชั่วคราวหรือค้างแคชจากเวอร์ชันก่อนหน้า</p>
      <button
        type="button"
        onClick={handleRetry}
        className="mt-2 rounded-lg bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold px-4 py-2 shadow-sm transition-colors cursor-pointer"
      >
        รีโหลดเวอร์ชันล่าสุด
      </button>
    </section>
  );
}

export const RscRetryBoundary = catchError(RetryFallback);
export type RscRetryBoundaryProps = { title: string; children: ReactNode };
