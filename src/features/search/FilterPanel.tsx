'use client';

import React, { useState } from 'react';
import { SONGYANG_VILLAGES } from '../../domain/villages.ts';
import { SONGYANG_STRATEGIES } from '../../domain/strategies.ts';
import { WORK_CATEGORIES } from '../../domain/workCategories.ts';
import { PLAN_DOCUMENTS } from '../../domain/documents.ts';
import {
  IconSliders,
  IconRotateCcw,
  IconGrid,
  IconList,
  IconX,
} from '../../components/icons/index.tsx';

export type ProjectViewMode = 'card' | 'list';

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
  viewMode?: ProjectViewMode;
  onViewModeChange?: (mode: ProjectViewMode) => void;
}

const ALL_YEARS = [2566, 2567, 2568, 2569, 2570, 2571, 2572, 2573, 2574, 2575];

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
  viewMode = 'card',
  onViewModeChange,
}: FilterPanelProps) {
  const [advancedOpen, setAdvancedOpen] = useState(false);

  const activeAdvancedCount =
    (selectedStrategy !== null ? 1 : 0) +
    (selectedCategory !== null ? 1 : 0) +
    (selectedYear !== null ? 1 : 0);

  const categoryLabelMap = Object.fromEntries(
    WORK_CATEGORIES.map((c) => [c.key, c.label])
  );

  return (
    <div className="rounded-2xl bg-white/95 dark:bg-[#0c1222]/95 [backdrop-filter:blur(28px)_saturate(190%)] [-webkit-backdrop-filter:blur(28px)_saturate(190%)] border border-black/[0.08] dark:border-white/[0.12] shadow-sm p-3 sm:p-3.5 space-y-3">
      {/* Primary Compact Control Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        {/* Left: Quick Selects + Advanced Filter Icon Button + Reset Icon Button */}
        <div className="flex flex-wrap items-center gap-2 flex-1 min-w-0">
          {/* Village Select */}
          <select
            value={selectedVillage ?? ''}
            onChange={(e) =>
              onSelectVillage(e.target.value === '' ? null : Number(e.target.value))
            }
            aria-label="กรองตามหมู่บ้าน"
            className={`px-3 py-2 rounded-xl text-xs font-semibold border outline-none transition-colors cursor-pointer ${
              selectedVillage !== null
                ? 'bg-sky-50 dark:bg-sky-950/70 border-sky-400 dark:border-sky-600 text-sky-800 dark:text-sky-200'
                : 'bg-slate-100/80 dark:bg-slate-800/80 border-slate-200/80 dark:border-slate-700/80 text-slate-700 dark:text-slate-200 hover:border-slate-300'
            }`}
          >
            <option value="">ทุกหมู่บ้าน (ม.1 - ม.8)</option>
            {SONGYANG_VILLAGES.map((v) => (
              <option key={v.no} value={v.no}>
                หมู่ {v.no} {v.name}
              </option>
            ))}
          </select>

          {/* Plan Document Select */}
          <select
            value={selectedDocumentId ?? ''}
            onChange={(e) =>
              onSelectDocumentId(e.target.value === '' ? null : e.target.value)
            }
            aria-label="กรองตามเล่มแผนพัฒนาท้องถิ่น"
            className={`px-3 py-2 rounded-xl text-xs font-semibold border outline-none transition-colors cursor-pointer max-w-[230px] sm:max-w-[280px] truncate ${
              selectedDocumentId !== null
                ? 'bg-sky-50 dark:bg-sky-950/70 border-sky-400 dark:border-sky-600 text-sky-800 dark:text-sky-200'
                : 'bg-slate-100/80 dark:bg-slate-800/80 border-slate-200/80 dark:border-slate-700/80 text-slate-700 dark:text-slate-200 hover:border-slate-300'
            }`}
          >
            <option value="">ทุกเล่มแผน ({PLAN_DOCUMENTS.length} ฉบับ)</option>
            {PLAN_DOCUMENTS.map((doc) => {
              const count = projectCountsByDoc[doc.id] || 0;
              return (
                <option key={doc.id} value={doc.id}>
                  {doc.shortTitle} {count > 0 ? `(${count} โครงการ)` : ''}
                </option>
              );
            })}
          </select>

          {/* Icon-Only Advanced Filter Drawer Toggle */}
          <button
            type="button"
            onClick={() => setAdvancedOpen((prev) => !prev)}
            title="ตัวกรองขั้นสูง (ยุทธศาสตร์ / ประเภทงาน / ปีงบประมาณ)"
            aria-label="ตัวกรองขั้นสูง"
            aria-expanded={advancedOpen}
            className={`relative h-9 px-2.5 rounded-xl inline-flex items-center justify-center gap-1.5 border transition-all cursor-pointer ${
              advancedOpen || activeAdvancedCount > 0
                ? 'bg-sky-600 text-white border-sky-600 shadow-xs'
                : 'bg-slate-100/80 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 border-slate-200/80 dark:border-slate-700/80 hover:bg-sky-50 dark:hover:bg-sky-950/50 hover:text-sky-600'
            }`}
          >
            <IconSliders className="w-4 h-4" />
            {activeAdvancedCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-extrabold bg-white text-sky-700">
                {activeAdvancedCount}
              </span>
            )}
          </button>

          {/* Icon-Only Reset Filters Button */}
          {hasActiveFilters && (
            <button
              type="button"
              onClick={onReset}
              title="ล้างตัวกรองทั้งหมด"
              aria-label="ล้างตัวกรองทั้งหมด"
              className="w-9 h-9 rounded-xl inline-flex items-center justify-center bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800/70 hover:bg-rose-600 hover:text-white transition-all cursor-pointer"
            >
              <IconRotateCcw className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Right: View Mode Switcher (Card Grid vs List Table) */}
        {onViewModeChange && (
          <div
            className="inline-flex p-1 rounded-xl bg-slate-100 dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/80 shrink-0"
            role="group"
            aria-label="สลับมุมมองการแสดงผล"
          >
            <button
              type="button"
              onClick={() => onViewModeChange('card')}
              title="มุมมองการ์ด (Card View)"
              aria-label="มุมมองการ์ด"
              aria-pressed={viewMode === 'card'}
              className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all cursor-pointer ${
                viewMode === 'card'
                  ? 'bg-white dark:bg-slate-900 text-sky-600 dark:text-sky-400 shadow-xs'
                  : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
              }`}
            >
              <IconGrid className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={() => onViewModeChange('list')}
              title="มุมมองรายการตาราง (List View)"
              aria-label="มุมมองรายการตาราง"
              aria-pressed={viewMode === 'list'}
              className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all cursor-pointer ${
                viewMode === 'list'
                  ? 'bg-white dark:bg-slate-900 text-sky-600 dark:text-sky-400 shadow-xs'
                  : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
              }`}
            >
              <IconList className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Active Advanced Filter Chips (When drawer is closed but filters are active) */}
      {!advancedOpen && activeAdvancedCount > 0 && (
        <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-slate-100 dark:border-slate-800/80">
          {selectedStrategy !== null && (
            <button
              type="button"
              onClick={() => onSelectStrategy(null)}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-sky-50 dark:bg-sky-950/70 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800"
            >
              <span>ด้านที่ {selectedStrategy}</span>
              <IconX className="w-3 h-3" />
            </button>
          )}
          {selectedCategory !== null && (
            <button
              type="button"
              onClick={() => onSelectCategory(null)}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-sky-50 dark:bg-sky-950/70 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800"
            >
              <span>{categoryLabelMap[selectedCategory] || selectedCategory}</span>
              <IconX className="w-3 h-3" />
            </button>
          )}
          {selectedYear !== null && (
            <button
              type="button"
              onClick={() => onSelectYear(null)}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-sky-50 dark:bg-sky-950/70 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800"
            >
              <span>ปี {selectedYear}</span>
              <IconX className="w-3 h-3" />
            </button>
          )}
        </div>
      )}

      {/* Collapsible Advanced Filter Drawer */}
      {advancedOpen && (
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          {/* 1. Strategy Select */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1">
              ยุทธศาสตร์การพัฒนา (7 ด้าน)
            </label>
            <select
              value={selectedStrategy ?? ''}
              onChange={(e) =>
                onSelectStrategy(e.target.value === '' ? null : Number(e.target.value))
              }
              className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-medium outline-none focus:border-sky-500"
            >
              <option value="">ทุกด้านยุทธศาสตร์ (ด้านที่ 1 - 7)</option>
              {SONGYANG_STRATEGIES.map((s) => (
                <option key={s.no} value={s.no}>
                  ด้านที่ {s.no}: {s.shortName}
                </option>
              ))}
            </select>
          </div>

          {/* 2. Category Select */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1">
              ประเภทงาน / หมวดหมู่โครงการ
            </label>
            <select
              value={selectedCategory ?? ''}
              onChange={(e) =>
                onSelectCategory(e.target.value === '' ? null : e.target.value)
              }
              className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-medium outline-none focus:border-sky-500"
            >
              <option value="">ทุกประเภทงาน</option>
              {WORK_CATEGORIES.map((c) => (
                <option key={c.key} value={c.key}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>

          {/* 3. Fiscal Year Select */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1">
              ปีงบประมาณที่มีการตั้งงบ
            </label>
            <select
              value={selectedYear ?? ''}
              onChange={(e) =>
                onSelectYear(e.target.value === '' ? null : Number(e.target.value))
              }
              className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-medium outline-none focus:border-sky-500"
            >
              <option value="">ทุกปีงบประมาณ (2566 - 2575)</option>
              {ALL_YEARS.map((yr) => (
                <option key={yr} value={yr}>
                  ปีงบประมาณ พ.ศ. {yr}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}
    </div>
  );
}
