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
  'ถนนคอนกรีต',
  'หินคลุก',
  'ประปา',
  'พลังงานแสงอาทิตย์',
  'ระบายน้ำ',
  'ผู้สูงอายุ',
  'เด็กเล็ก',
];

export function SearchBar({
  value,
  onChange,
  totalCount,
  totalDatasetCount,
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
            placeholder="ค้นหาชื่อโครงการ, หมู่บ้าน (เช่น บ้านซำ, โพนจาน), สายทาง, งบประมาณ, หรือเลขลำดับ..."
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
      </div>

      {/* Quick Search Tags */}
      <div className="flex flex-wrap items-center gap-1.5 px-0.5">
        <span className="text-xs text-slate-400 dark:text-slate-500 mr-1">คำค้นยอดนิยม:</span>
        {QUICK_KEYWORDS.map((kw) => {
          const isActive = value.trim() === kw;
          return (
            <button
              key={kw}
              type="button"
              onClick={() => onChange(isActive ? '' : kw)}
              className={`px-2.5 py-0.5 rounded-full text-xs font-medium transition-all ${
                isActive
                  ? 'bg-sky-600 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {kw}
            </button>
          );
        })}
      </div>

      <div className="flex flex-wrap items-center justify-between text-xs sm:text-sm text-slate-500 dark:text-slate-400 px-1 pt-1 border-t border-slate-100 dark:border-slate-800/80">
        <div>
          แสดงผล <span className="font-bold text-slate-900 dark:text-slate-100">{totalCount.toLocaleString('en-US')}</span> โครงการ{' '}
          <span className="text-xs text-slate-400">(จากฐานข้อมูลในระบบ {totalDatasetCount.toLocaleString('en-US')} โครงการ)</span>
        </div>
        <div>
          งบประมาณรวมที่กรอง: <span className="font-bold text-sky-600 dark:text-sky-400">{totalBudgetFormatted}</span> บาท
        </div>
      </div>
    </div>
  );
}
