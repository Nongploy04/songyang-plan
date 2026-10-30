'use client';

import React from 'react';
import { SONGYANG_VILLAGES } from '../../domain/villages.ts';
import { SONGYANG_STRATEGIES } from '../../domain/strategies.ts';
import { WORK_CATEGORIES } from '../../domain/workCategories.ts';
import { toThai } from '../../domain/thaiNumerals.ts';

interface FilterPanelProps {
  selectedVillage: number | null;
  onSelectVillage: (village: number | null) => void;
  selectedStrategy: number | null;
  onSelectStrategy: (strategy: number | null) => void;
  selectedCategory: string | null;
  onSelectCategory: (cat: string | null) => void;
  selectedYear: number | null;
  onSelectYear: (year: number | null) => void;
  useThaiNumerals: boolean;
  onReset: () => void;
  hasActiveFilters: boolean;
}

export function FilterPanel({
  selectedVillage,
  onSelectVillage,
  selectedStrategy,
  onSelectStrategy,
  selectedCategory,
  onSelectCategory,
  selectedYear,
  onSelectYear,
  useThaiNumerals,
  onReset,
  hasActiveFilters,
}: FilterPanelProps) {
  const years = [2571, 2572, 2573, 2574, 2575];

  return (
    <div className="bg-white dark:bg-slate-850 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
          ตัวกรองข้อมูล
        </h3>
        {hasActiveFilters && (
          <button
            type="button"
            onClick={onReset}
            className="text-xs text-sky-600 dark:text-sky-400 hover:underline font-medium"
          >
            ล้างตัวกรองทั้งหมด
          </button>
        )}
      </div>

      {/* หมู่บ้าน */}
      <div>
        <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">
          หมู่บ้าน (ตำบลสงยาง)
        </label>
        <div className="flex flex-wrap gap-1.5">
          <button
            type="button"
            onClick={() => onSelectVillage(null)}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
              selectedVillage === null
                ? 'bg-slate-900 text-white dark:bg-sky-600'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            ทุกหมู่บ้าน
          </button>
          {SONGYANG_VILLAGES.map((v) => {
            const isSelected = selectedVillage === v.no;
            const label = useThaiNumerals
              ? `หมู่ ${toThai(v.no)} ${v.name}`
              : `หมู่ ${v.no} ${v.name}`;
            return (
              <button
                key={v.no}
                type="button"
                onClick={() => onSelectVillage(isSelected ? null : v.no)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                  isSelected
                    ? 'bg-sky-600 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ยุทธศาสตร์ / ประเด็นการพัฒนา */}
      <div>
        <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">
          ยุทธศาสตร์ / ประเด็นการพัฒนา (๗ ด้าน)
        </label>
        <div className="flex flex-wrap gap-1.5">
          <button
            type="button"
            onClick={() => onSelectStrategy(null)}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
              selectedStrategy === null
                ? 'bg-slate-900 text-white dark:bg-sky-600'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            ทุกด้าน
          </button>
          {SONGYANG_STRATEGIES.map((s) => {
            const isSelected = selectedStrategy === s.no;
            const prefix = useThaiNumerals ? `ด้านที่ ${toThai(s.no)}: ` : `ด้าน ${s.no}: `;
            return (
              <button
                key={s.no}
                type="button"
                onClick={() => onSelectStrategy(isSelected ? null : s.no)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                  isSelected
                    ? 'bg-sky-600 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                {prefix}{s.shortName}
              </button>
            );
          })}
        </div>
      </div>

      {/* หมวดหมู่งาน */}
      <div>
        <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">
          ประเภทโครงการ
        </label>
        <div className="flex flex-wrap gap-1.5">
          <button
            type="button"
            onClick={() => onSelectCategory(null)}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
              selectedCategory === null
                ? 'bg-slate-900 text-white dark:bg-sky-600'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            ทั้งหมด
          </button>
          {WORK_CATEGORIES.map((c) => {
            const isSelected = selectedCategory === c.key;
            return (
              <button
                key={c.key}
                type="button"
                onClick={() => onSelectCategory(isSelected ? null : c.key)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                  isSelected
                    ? 'bg-sky-600 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                {c.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ปีงบประมาณ */}
      <div>
        <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">
          ปีงบประมาณที่มีการตั้งงบ
        </label>
        <div className="flex flex-wrap gap-1.5">
          <button
            type="button"
            onClick={() => onSelectYear(null)}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
              selectedYear === null
                ? 'bg-slate-900 text-white dark:bg-sky-600'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            ทุกปี
          </button>
          {years.map((y) => {
            const isSelected = selectedYear === y;
            const label = useThaiNumerals ? `พ.ศ. ${toThai(y)}` : `พ.ศ. ${y}`;
            return (
              <button
                key={y}
                type="button"
                onClick={() => onSelectYear(isSelected ? null : y)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                  isSelected
                    ? 'bg-sky-600 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
