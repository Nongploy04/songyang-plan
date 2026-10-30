'use client';

import React from 'react';
import { IconSearch, IconX } from '../../components/icons/index.tsx';

interface SearchBarProps {
  value: string;
  onChange: (val: string) => void;
  useThaiNumerals: boolean;
  onToggleThaiNumerals: () => void;
  totalCount: number;
  totalBudgetFormatted: string;
}

export function SearchBar({
  value,
  onChange,
  useThaiNumerals,
  onToggleThaiNumerals,
  totalCount,
  totalBudgetFormatted,
}: SearchBarProps) {
  return (
    <div className="w-full space-y-3">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <IconSearch className="w-5 h-5 text-slate-400" />
          </div>
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="ค้นหาชื่อโครงการ, สถานที่, หมู่บ้าน, งบประมาณ, หรือเลขลำดับ..."
            className="w-full pl-11 pr-10 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 text-base shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all"
          />
          {value && (
            <button
              type="button"
              onClick={() => onChange('')}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              aria-label="ล้างคำค้นหา"
            >
              <IconX className="w-4 h-4" />
            </button>
          )}
        </div>

        <button
          type="button"
          onClick={onToggleThaiNumerals}
          className={`px-4 py-3 rounded-xl font-medium text-sm border transition-all flex items-center justify-center gap-2 select-none ${
            useThaiNumerals
              ? 'bg-sky-50 dark:bg-sky-950/60 border-sky-300 dark:border-sky-700 text-sky-700 dark:text-sky-300 shadow-sm'
              : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50'
          }`}
          title="สลับการแสดงผลตัวเลขระหว่างเลขไทยและเลขอารบิก"
        >
          <span className="text-xs font-semibold px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200">
            {useThaiNumerals ? 'เลขไทย' : '123'}
          </span>
          <span>{useThaiNumerals ? 'แสดงเลขไทย' : 'เลขอารบิก'}</span>
        </button>
      </div>

      <div className="flex flex-wrap items-center justify-between text-xs sm:text-sm text-slate-500 dark:text-slate-400 px-1">
        <div>
          พบทั้งสิ้น <span className="font-semibold text-slate-800 dark:text-slate-200">{totalCount}</span> โครงการ
        </div>
        <div>
          งบประมาณรวม: <span className="font-semibold text-sky-600 dark:text-sky-400">{totalBudgetFormatted}</span> บาท
        </div>
      </div>
    </div>
  );
}
