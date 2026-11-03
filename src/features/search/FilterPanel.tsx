'use client';

import React from 'react';
import { SONGYANG_VILLAGES } from '../../domain/villages.ts';
import { SONGYANG_STRATEGIES } from '../../domain/strategies.ts';
import { WORK_CATEGORIES } from '../../domain/workCategories.ts';
import { PLAN_DOCUMENTS } from '../../domain/documents.ts';

interface FilterPanelProps {
  selectedDocumentId: string | null;
  onSelectDocumentId: (id: string | null) => void;
  selectedVillage: number | null;
  onSelectVillage: (village: number | null) => void;
  selectedStrategy: number | null;
  onSelectStrategy: (strategy: number | null) => void;
  selectedCategory: string | null;
  onSelectCategory: (cat: string | null) => void;
  selectedYear: number | null;
  onSelectYear: (year: number | null) => void;
  onReset: () => void;
  hasActiveFilters: boolean;
  projectCountsByDoc?: Record<string, number>;
}

export function FilterPanel({
  selectedDocumentId,
  onSelectDocumentId,
  selectedVillage,
  onSelectVillage,
  selectedStrategy,
  onSelectStrategy,
  selectedCategory,
  onSelectCategory,
  selectedYear,
  onSelectYear,
  onReset,
  hasActiveFilters,
  projectCountsByDoc = {},
}: FilterPanelProps) {
  const years66_70 = [2566, 2567, 2568, 2569, 2570];
  const years71_75 = [2571, 2572, 2573, 2574, 2575];

  return (
    <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
          ตัวกรองข้อมูลโครงการพัฒนาท้องถิ่น
        </h3>
        {hasActiveFilters && (
          <button
            type="button"
            onClick={onReset}
            className="text-xs text-sky-600 dark:text-sky-400 hover:underline font-semibold"
          >
            ล้างตัวกรองทั้งหมด
          </button>
        )}
      </div>

      {/* เลือกเล่มแผนพัฒนา */}
      <div>
        <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">
          เล่มแผนพัฒนาท้องถิ่น (สารบบ 20 ฉบับ อบต.สงยาง)
        </label>
        <div className="flex flex-wrap gap-1.5">
          <button
            type="button"
            onClick={() => onSelectDocumentId(null)}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
              selectedDocumentId === null
                ? 'bg-slate-900 text-white dark:bg-sky-600'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            ทุกฉบับ ({PLAN_DOCUMENTS.length})
          </button>
          {PLAN_DOCUMENTS.map((doc) => {
            const isSelected = selectedDocumentId === doc.id || selectedDocumentId === doc.slug;
            const count = projectCountsByDoc[doc.id] || 0;
            return (
              <button
                key={doc.id}
                type="button"
                onClick={() => onSelectDocumentId(isSelected ? null : doc.id)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all inline-flex items-center gap-1 ${
                  isSelected
                    ? 'bg-sky-600 text-white shadow-xs'
                    : count > 0
                    ? 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-200'
                    : 'bg-slate-50 dark:bg-slate-800/50 text-slate-400 dark:text-slate-500 hover:bg-slate-100'
                }`}
                title={`${doc.title} (${doc.pageCount} หน้า)`}
              >
                <span>{doc.shortTitle}</span>
                {count > 0 && (
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-2xs font-bold ${
                      isSelected
                        ? 'bg-white/20 text-white'
                        : 'bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300'
                    }`}
                  >
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* หมู่บ้าน */}
      <div>
        <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">
          หมู่บ้านเป้าหมาย (ตำบลสงยาง หมู่ที่ 1 - 8)
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
                หมู่ {v.no} {v.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* ยุทธศาสตร์ / ประเด็นการพัฒนา */}
      <div>
        <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">
          ยุทธศาสตร์ / ประเด็นการพัฒนา (7 ด้าน)
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
                ด้านที่ {s.no}: {s.shortName}
              </button>
            );
          })}
        </div>
      </div>

      {/* หมวดหมู่งาน */}
      <div>
        <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">
          ประเภทงาน / หมวดหมู่โครงการ
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
          ปีงบประมาณที่มีการตั้งงบ (พ.ศ. 2566 - 2575)
        </label>
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() => onSelectYear(null)}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
              selectedYear === null
                ? 'bg-slate-900 text-white dark:bg-sky-600'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            ทุกปีงบประมาณ
          </button>

          <span className="text-2xs font-semibold text-slate-400 ml-1">ช่วง 2566-2570:</span>
          {years66_70.map((y) => {
            const isSelected = selectedYear === y;
            return (
              <button
                key={y}
                type="button"
                onClick={() => onSelectYear(isSelected ? null : y)}
                className={`px-2 py-1 rounded-lg text-xs font-medium transition-all ${
                  isSelected
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'bg-amber-50/70 dark:bg-amber-950/30 text-amber-800 dark:text-amber-300 border border-amber-200/60 dark:border-amber-800/50 hover:bg-amber-100/80'
                }`}
              >
                {y}
              </button>
            );
          })}

          <span className="text-2xs font-semibold text-slate-400 ml-1">ช่วง 2571-2575:</span>
          {years71_75.map((y) => {
            const isSelected = selectedYear === y;
            return (
              <button
                key={y}
                type="button"
                onClick={() => onSelectYear(isSelected ? null : y)}
                className={`px-2 py-1 rounded-lg text-xs font-medium transition-all ${
                  isSelected
                    ? 'bg-sky-600 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                {y}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
