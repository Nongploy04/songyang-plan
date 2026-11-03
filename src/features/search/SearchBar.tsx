'use client';

import React from 'react';
import { IconSearch, IconX } from '../../components/icons/index.tsx';

interface SearchBarProps {
  value: string;
  onChange: (val: string) => void;
  totalCount: number;
  totalDatasetCount: number;
  totalBudgetFormatted: string;
}

const QUICK_KEYWORDS = [
  'หินคลุก',
  'คสล.',
  'ประปา',
  'โซล่าเซลล์',
  'กล้องวงจรปิด',
  'ผู้สูงอายุ',
  'ศพด.',
];

export function SearchBar({
  value,
  onChange,
  totalCount,
  totalDatasetCount,
  totalBudgetFormatted,
}: SearchBarProps) {
  return (
    <div className="rounded-2xl bg-white/95 dark:bg-[#0c1222]/95 [backdrop-filter:blur(28px)_saturate(190%)] [-webkit-backdrop-filter:blur(28px)_saturate(190%)] border border-black/[0.08] dark:border-white/[0.12] shadow-sm p-3.5 sm:p-4 space-y-3">
      {/* Main Search Input */}
      <div className="relative flex items-center">
        <div className="absolute left-3.5 text-slate-400 dark:text-slate-500 pointer-events-none">
          <IconSearch className="w-4 h-4 sm:w-5 sm:h-5" />
        </div>

        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="ค้นหาชื่อโครงการ, หมู่บ้าน (เช่น บ้านสงยาง, ม.1), ถนน คสล., เลขหน้า..."
          className="w-full pl-10 pr-10 py-2.5 sm:py-3 rounded-xl bg-slate-100/80 dark:bg-slate-800/80 border border-transparent focus:border-sky-500 focus:bg-white dark:focus:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 text-sm sm:text-base font-medium outline-none transition-all"
          aria-label="ค้นหาโครงการในแผนพัฒนาท้องถิ่น"
        />

        {value.trim().length > 0 && (
          <button
            type="button"
            onClick={() => onChange('')}
            title="ล้างคำค้นหา"
            aria-label="ล้างคำค้นหา"
            className="absolute right-2.5 w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/70 dark:hover:bg-slate-700/70 transition-colors"
          >
            <IconX className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Quick Keyword Chips & Live Summary Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-0.5">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 mr-0.5">
            คำค้นด่วน:
          </span>
          {QUICK_KEYWORDS.map((kw) => {
            const active = value === kw;
            return (
              <button
                key={kw}
                type="button"
                onClick={() => onChange(active ? '' : kw)}
                className={`px-2.5 py-0.5 rounded-lg text-xs font-medium transition-all ${
                  active
                    ? 'bg-sky-600 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800/90 text-slate-600 dark:text-slate-300 hover:bg-sky-50 dark:hover:bg-sky-950/80 hover:text-sky-700 dark:hover:text-sky-300'
                }`}
              >
                {kw}
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-2.5 text-xs text-slate-500 dark:text-slate-400 ml-auto">
          <span>
            แสดง{' '}
            <strong className="font-extrabold text-slate-900 dark:text-slate-100 tabular-nums">
              {totalCount.toLocaleString('en-US')}
            </strong>{' '}
            / {totalDatasetCount.toLocaleString('en-US')} โครงการ
          </span>
          <span className="text-slate-300 dark:text-slate-700">•</span>
          <span>
            งบรวม{' '}
            <strong className="font-extrabold text-sky-600 dark:text-sky-400 tabular-nums">
              {totalBudgetFormatted}
            </strong>{' '}
            บาท
          </span>
        </div>
      </div>
    </div>
  );
}
