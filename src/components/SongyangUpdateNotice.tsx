'use client';

import React, { useEffect, useRef, useState } from 'react';

export interface BuildUpdateChoice {
  buildVersion: string;
  applyUpdate: () => Promise<boolean> | boolean;
  deferUpdate: () => void;
}

/**
 * Standard Songyang Update Notice (Bottom-docked prompt)
 * Reference: songyang-price canonical implementation
 */
export function SongyangUpdateNotice({
  pendingUpdate: propUpdate,
  onDismiss,
}: {
  pendingUpdate?: BuildUpdateChoice | null;
  onDismiss?: () => void;
}) {
  const [internalUpdate, setInternalUpdate] = useState<BuildUpdateChoice | null>(null);
  const pendingUpdate = propUpdate || internalUpdate;

  const [isUpdating, setIsUpdating] = useState(false);
  const [message, setMessage] = useState('รีโหลดเพื่อใช้ระบบล่าสุด หรือเลือกภายหลังหากกำลังทำงานค้าง');
  const applying = useRef(false);
  const laterButton = useRef<HTMLButtonElement | null>(null);
  const updateButton = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (propUpdate) return;
    const handleUpdate = (e: Event) => {
      const detail = (e as CustomEvent<BuildUpdateChoice>).detail;
      if (detail?.applyUpdate) setInternalUpdate(detail);
    };
    window.addEventListener('songyang:update-available', handleUpdate);
    return () => window.removeEventListener('songyang:update-available', handleUpdate);
  }, [propUpdate]);

  useEffect(() => {
    if (!pendingUpdate) return;
    const previousFocus = document.activeElement;
    updateButton.current?.focus();
    return () => {
      if (previousFocus instanceof HTMLElement && previousFocus.isConnected) previousFocus.focus();
    };
  }, [pendingUpdate]);

  if (!pendingUpdate) return null;

  const dismiss = () => {
    if (applying.current) return;
    pendingUpdate.deferUpdate?.();
    if (typeof onDismiss === 'function') onDismiss();
    setInternalUpdate(null);
  };

  const apply = async () => {
    if (applying.current) return;
    applying.current = true;
    setIsUpdating(true);
    try {
      const applied = await pendingUpdate.applyUpdate?.();
      if (!applied) setMessage('ยังมีงานที่บันทึกไม่เสร็จหรือเครือข่ายยังไม่พร้อม กรุณาบันทึกหรือส่งออกข้อมูลก่อนลองอีกครั้ง');
    } catch {
      setMessage('ยังอัปเดตไม่ได้ ข้อมูลเดิมยังอยู่ กรุณาลองอีกครั้งเมื่อพร้อม');
    } finally {
      applying.current = false;
      setIsUpdating(false);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      dismiss();
    }
    if (event.key === 'Tab') {
      const leavingEnd = !event.shiftKey && document.activeElement === updateButton.current;
      const leavingStart = event.shiftKey && document.activeElement === laterButton.current;
      if (isUpdating || leavingEnd || leavingStart) {
        event.preventDefault();
        if (!isUpdating) (leavingEnd ? laterButton : updateButton).current?.focus();
      }
    }
  };

  return (
    <aside
      className="fixed inset-x-4 bottom-[max(1.25rem,calc(env(safe-area-inset-bottom,0px)+1rem))] z-[12000] mx-auto max-w-md rounded-2xl border border-slate-200/90 bg-white/98 p-4 sm:p-5 text-slate-900 shadow-2xl backdrop-blur-2xl motion-reduce:transition-none motion-reduce:backdrop-blur-none motion-reduce:bg-white"
      id="songyang-update-notice"
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="songyang-update-title"
      onKeyDown={handleKeyDown}
      aria-live="polite"
    >
      <div className="absolute top-0 inset-x-6 h-[2px] bg-gradient-to-r from-transparent via-indigo-600 to-transparent opacity-80 rounded-t-full"></div>
      <div className="flex items-center gap-3 mb-2.5">
        <div className="relative shrink-0">
          <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5 z-10">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75 motion-reduce:hidden"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-indigo-600 ring-2 ring-white"></span>
          </span>
          <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
            <svg className="w-5 h-5 animate-spin [animation-duration:7s] motion-reduce:animate-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
              <path d="M3 3v5h5" />
              <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
              <path d="M16 16h5v5" />
            </svg>
          </div>
        </div>
        <div className="flex-1 min-w-0 flex items-center justify-between gap-2">
          <strong id="songyang-update-title" className="text-sm sm:text-base font-bold text-slate-900 leading-tight">มีเวอร์ชันใหม่พร้อมใช้งาน</strong>
          <span className="inline-flex items-center gap-1.5 text-[11px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 animate-pulse motion-reduce:animate-none"></span>
            อัปเดตระบบ
          </span>
        </div>
      </div>
      <p className="text-xs leading-relaxed text-slate-600 mb-3.5">{message}</p>
      <div className="flex gap-2.5">
        <button
          type="button"
          ref={laterButton}
          disabled={isUpdating}
          onClick={dismiss}
          className="min-h-11 flex-1 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs sm:text-sm font-semibold transition active:scale-[0.98] cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
        >
          ภายหลัง
        </button>
        <button
          type="button"
          ref={updateButton}
          aria-label="อัปเดตตอนนี้"
          disabled={isUpdating}
          onClick={apply}
          className="relative overflow-hidden min-h-11 flex-1 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-bold shadow-md shadow-indigo-700/20 transition active:scale-[0.98] cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 flex items-center justify-center gap-2"
        >
          <svg className={`w-4 h-4 ${isUpdating ? 'animate-spin motion-reduce:animate-none' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
            <path d="M3 3v5h5" />
            <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
            <path d="M16 16h5v5" />
          </svg>
          <span className="relative z-10 flex items-center gap-1">
            <span>{isUpdating ? 'กำลังเปิดใช้…' : 'อัปเดตตอนนี้'}</span>
          </span>
        </button>
      </div>
    </aside>
  );
}
