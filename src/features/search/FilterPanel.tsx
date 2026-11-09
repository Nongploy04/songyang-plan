'use client';

import React, { useState, useMemo } from 'react';
import { SONGYANG_VILLAGES } from '../../domain/villages.ts';
import { SONGYANG_STRATEGIES } from '../../domain/strategies.ts';
import { WORK_CATEGORIES } from '../../domain/workCategories.ts';
import { PLAN_DOCUMENTS, type LocalPlanDocument } from '../../domain/documents.ts';
import { getCurrentThaiFiscalYear, type FiscalYearSelection } from '../../domain/fiscalYear.ts';
import { SongyangSelect, type SelectOption } from '../../components/SongyangSelect.tsx';
import {
  IconSliders,
  IconRotateCcw,
  IconGrid,
  IconList,
  IconX,
  IconArchive,
  IconExternalLink,
  IconFileText,
  IconMapPin,
  IconCalendar,
  IconLayers,
} from '../../components/icons/index.tsx';

export type ProjectViewMode = 'card' | 'list';
export type PlanPeriodFilter = '2571-2575' | '2566-2570' | null;

interface FilterPanelProps {
  selectedPeriod: PlanPeriodFilter;
  onSelectPeriod: (period: PlanPeriodFilter) => void;
  selectedDocumentId: string | null;
  onSelectDocumentId: (id: string | null) => void;
  selectedVillage: number | null;
  onSelectVillage: (village: number | null) => void;
  selectedStrategy: number | null;
  onSelectStrategy: (strategy: number | null) => void;
  selectedCategory: string | null;
  onSelectCategory: (cat: string | null) => void;
  selectedYear: FiscalYearSelection;
  onSelectYear: (year: FiscalYearSelection) => void;
  onReset: () => void;
  hasActiveFilters: boolean;
  projectCountsByDoc?: Record<string, number>;
  categoryCounts?: Record<string, number>;
  viewMode?: ProjectViewMode;
  onViewModeChange?: (mode: ProjectViewMode) => void;
}

const KIND_STYLES: Record<
  LocalPlanDocument['kind'],
  { pill: string; activePill: string; badge: string }
> = {
  main: {
    pill: 'bg-sky-50/90 dark:bg-sky-950/50 text-sky-800 dark:text-sky-200 border-sky-200 dark:border-sky-800/80 hover:border-sky-400',
    activePill: 'bg-sky-600 text-white border-sky-600 shadow-xs',
    badge: 'bg-sky-200/80 dark:bg-sky-900 text-sky-900 dark:text-sky-100',
  },
  review: {
    pill: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700',
    activePill: 'bg-slate-700 text-white border-slate-700 shadow-xs',
    badge: 'bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200',
  },
  edit: {
    pill: 'bg-amber-50/90 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 border-amber-200/90 dark:border-amber-800/70 hover:border-amber-400',
    activePill: 'bg-amber-600 text-white border-amber-600 shadow-xs',
    badge: 'bg-amber-200/80 dark:bg-amber-900/90 text-amber-950 dark:text-amber-100',
  },
  change: {
    pill: 'bg-violet-50/90 dark:bg-violet-950/40 text-violet-900 dark:text-violet-200 border-violet-200/90 dark:border-violet-800/70 hover:border-violet-400',
    activePill: 'bg-violet-600 text-white border-violet-600 shadow-xs',
    badge: 'bg-violet-200/80 dark:bg-violet-900/90 text-violet-950 dark:text-violet-100',
  },
  add: {
    pill: 'bg-emerald-50/90 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 border-emerald-200/90 dark:border-emerald-800/70 hover:border-emerald-400',
    activePill: 'bg-emerald-600 text-white border-emerald-600 shadow-xs',
    badge: 'bg-emerald-200/80 dark:bg-emerald-900/90 text-emerald-950 dark:text-emerald-100',
  },
};

export function FilterPanel({
  selectedPeriod,
  onSelectPeriod,
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
  categoryCounts = {},
  viewMode = 'card',
  onViewModeChange,
}: FilterPanelProps) {
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [archiveOpen, setArchiveOpen] = useState(false);

  const activeAdvancedCount =
    (selectedStrategy !== null ? 1 : 0) +
    (selectedCategory !== null ? 1 : 0);

  const categoryLabelMap = Object.fromEntries(
    WORK_CATEGORIES.map((c) => [c.key, c.label])
  );

  // Separate active indexed documents (with >0 extracted projects) vs historical archive PDFs
  const activeDocs = useMemo(
    () => PLAN_DOCUMENTS.filter((d) => d.isActive && (projectCountsByDoc[d.id] || 0) > 0),
    [projectCountsByDoc]
  );

  const archivedDocs = useMemo(
    () => PLAN_DOCUMENTS.filter((d) => !d.isActive),
    []
  );

  // Period project totals
  const count2571_2575 = projectCountsByDoc['plan_2571_2575_main'] || 419;
  const docs2566_2570 = useMemo(
    () => activeDocs.filter((d) => d.period === '2566-2570'),
    [activeDocs]
  );
  const count2566_2570 = useMemo(
    () =>
      docs2566_2570.reduce(
        (sum, d) => sum + (projectCountsByDoc[d.id] || 0),
        0
      ),
    [docs2566_2570, projectCountsByDoc]
  );
  const totalAllProjects = count2571_2575 + count2566_2570;

  // Group 2566-2570 amendments by revisionYear descending (2569 -> 2568 -> 2566)
  const amendmentsByYear = useMemo(() => {
    const years = [2569, 2568, 2566];
    return years
      .map((yr) => {
        const docs = docs2566_2570.filter((d) => d.revisionYear === yr);
        const totalProjects = docs.reduce(
          (acc, d) => acc + (projectCountsByDoc[d.id] || 0),
          0
        );
        return {
          year: yr,
          docs,
          totalProjects,
        };
      })
      .filter((g) => g.docs.length > 0);
  }, [docs2566_2570, projectCountsByDoc]);

  const handleSelectPeriodCard = (period: PlanPeriodFilter) => {
    onSelectPeriod(period);
    if (period === null) {
      onSelectDocumentId(null);
    } else if (period === '2571-2575') {
      onSelectDocumentId('plan_2571_2575_main');
    } else if (period === '2566-2570') {
      // If currently on 2571-2575 main, clear specific doc so all 14 amendments of 2566-2570 show
      if (selectedDocumentId === 'plan_2571_2575_main') {
        onSelectDocumentId(null);
      }
    }
  };

  const handleSelectDocButton = (doc: LocalPlanDocument) => {
    if (selectedDocumentId === doc.id) {
      // Toggle off specific document -> stay in its period
      onSelectDocumentId(null);
      onSelectPeriod(doc.period === '2571-2575' ? null : '2566-2570');
    } else {
      onSelectPeriod(doc.period === '2571-2575' ? '2571-2575' : '2566-2570');
      onSelectDocumentId(doc.id);
    }
  };

  // =========================================================================
  // CUSTOM THEMED DROPDOWN OPTIONS (SongyangSelect)
  // =========================================================================
  const villageOptions: SelectOption<number | null>[] = useMemo(() => [
    { value: null, label: 'ทุกหมู่บ้าน (ม.1 - ม.8)' },
    ...SONGYANG_VILLAGES.map((v) => ({
      value: v.no,
      label: `หมู่ ${v.no} ${v.name}`,
    })),
  ], []);

  const documentOptions: SelectOption<string | null>[] = useMemo(() => {
    const list: SelectOption<string | null>[] = [
      {
        value: null,
        label:
          selectedPeriod === '2566-2570'
            ? `ทุกฉบับในห้วง 2566-2570 (${docs2566_2570.length} ฉบับ)`
            : `ทุกเล่มแผนที่มีข้อมูล (${activeDocs.length} ฉบับ)`,
        badge: selectedPeriod === '2566-2570' ? count2566_2570 : totalAllProjects,
      },
      {
        value: 'plan_2571_2575_main',
        label: 'พ.ศ. 2571-2575 (เล่มหลัก)',
        badge: count2571_2575,
      },
    ];
    for (const group of amendmentsByYear) {
      for (const doc of group.docs) {
        const count = projectCountsByDoc[doc.id] || 0;
        list.push({
          value: doc.id,
          label: `${doc.shortTitle} (ปี ${group.year})`,
          badge: count,
        });
      }
    }
    return list;
  }, [
    selectedPeriod,
    docs2566_2570.length,
    count2566_2570,
    activeDocs.length,
    totalAllProjects,
    count2571_2575,
    amendmentsByYear,
    projectCountsByDoc,
  ]);

  const strategyOptions: SelectOption<number | null>[] = useMemo(() => [
    { value: null, label: 'ทุกด้านยุทธศาสตร์ (ด้านที่ 1 - 7)' },
    ...SONGYANG_STRATEGIES.map((s) => ({
      value: s.no,
      label: `ด้านที่ ${s.no}: ${s.shortName}`,
    })),
  ], []);

  const categoryOptions: SelectOption<string | null>[] = useMemo(() => [
    {
      value: null,
      label: 'ทุกประเภทงาน',
      badge:
        categoryCounts['all'] ||
        Object.values(categoryCounts).reduce((a, b) => a + b, 0) ||
        522,
    },
    ...WORK_CATEGORIES.map((c) => ({
      value: c.key,
      label: c.label,
      badge: categoryCounts[c.key] || 0,
    })),
  ], [categoryCounts]);

  const currentFiscalYear = useMemo(() => getCurrentThaiFiscalYear(), []);

  const fiscalYearOptions: SelectOption<FiscalYearSelection>[] = useMemo(
    () => [
      {
        value: 'current',
        label: `⚡ ปีงบประมาณปัจจุบัน (พ.ศ. ${currentFiscalYear})`,
      },
      {
        value: 2571,
        label: 'ปี 2571 (ปีแรกแผน 2571-2575)',
      },
      {
        value: 2572,
        label: 'ปี 2572',
      },
      {
        value: 2573,
        label: 'ปี 2573',
      },
      {
        value: 2574,
        label: 'ปี 2574',
      },
      {
        value: 2575,
        label: 'ปี 2575 (ปีสุดท้ายแผน 2571-2575)',
      },
      {
        value: 2570,
        label: 'ปี 2570 (แผน 2566-2570)',
      },
      {
        value: 2569,
        label: 'ปี 2569',
      },
      {
        value: 2568,
        label: 'ปี 2568',
      },
      {
        value: 2567,
        label: 'ปี 2567',
      },
      {
        value: 2566,
        label: 'ปี 2566',
      },
      {
        value: 'all',
        label: 'ทุกปีงบประมาณ (แสดงกรอบช่วงวงเงิน)',
      },
    ],
    [currentFiscalYear]
  );

  return (
    <div className="rounded-2xl bg-white/95 dark:bg-[#0c1222]/95 [backdrop-filter:blur(28px)_saturate(190%)] [-webkit-backdrop-filter:blur(28px)_saturate(190%)] border border-black/[0.08] dark:border-white/[0.12] shadow-sm p-3.5 sm:p-4 space-y-3.5">
      {/* =====================================================================
          TIER 1: 5-YEAR PLAN PERIOD SELECTOR CARDS (แบ่งตามห้วงแผนหลัก 5 ปี)
      ===================================================================== */}
      <div className="space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center justify-center w-5 h-5 rounded-md bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300 text-[11px] font-extrabold">
              1
            </span>
            <h3 className="text-xs font-extrabold text-slate-800 dark:text-slate-200">
              เลือกห้วงแผนพัฒนาท้องถิ่น (แผนหลัก 5 ปี และชุดแก้ไข/เพิ่มเติม)
            </h3>
          </div>

          {/* Archive PDF Drawer Trigger */}
          <button
            type="button"
            onClick={() => setArchiveOpen((prev) => !prev)}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition-colors cursor-pointer ${
              archiveOpen
                ? 'bg-slate-800 text-white dark:bg-slate-200 dark:text-slate-900 border-slate-800 dark:border-slate-200'
                : 'bg-slate-100/90 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 border-slate-200/80 dark:border-slate-700/80 hover:border-slate-400'
            }`}
          >
            <IconArchive className="w-3.5 h-3.5" />
            <span>คลังไฟล์ PDF เล่มเก่า/ทบทวนย้อนหลัง ({archivedDocs.length} เล่ม)</span>
          </button>
        </div>

        {/* 3 Period Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          {/* Card A: All Periods Combined */}
          <button
            type="button"
            onClick={() => handleSelectPeriodCard(null)}
            className={`card-calibrated btn-tactile text-left p-3 rounded-xl border cursor-pointer flex flex-col justify-between gap-1.5 ${
              selectedPeriod === null && selectedDocumentId === null
                ? 'bg-sky-50/90 dark:bg-sky-950/60 border-sky-500 dark:border-sky-500 ring-1 ring-sky-500/30 shadow-xs'
                : 'bg-slate-50/70 dark:bg-slate-900/50 border-slate-200/80 dark:border-slate-800 hover:border-sky-300 dark:hover:border-sky-800'
            }`}
          >
            <div className="flex items-center justify-between gap-1.5 w-full">
              <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-slate-200/80 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                ทุกห้วงแผนรวมกัน
              </span>
              <span className="text-[11px] font-extrabold text-sky-700 dark:text-sky-300 tabular-nums">
                {totalAllProjects.toLocaleString('en-US')} โครงการ
              </span>
            </div>
            <div>
              <div className="text-sm font-extrabold text-slate-900 dark:text-slate-100">
                ทุกเล่มแผน ({activeDocs.length} ฉบับที่มีข้อมูล)
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                ค้นหาข้ามเล่มหลัก 2571-2575 และฉบับแก้ไข 2566-2570
              </p>
            </div>
          </button>

          {/* Card B: 2571 - 2575 Master Plan */}
          <button
            type="button"
            onClick={() => handleSelectPeriodCard('2571-2575')}
            className={`card-calibrated btn-tactile text-left p-3 rounded-xl border cursor-pointer flex flex-col justify-between gap-1.5 ${
              selectedPeriod === '2571-2575' ||
              selectedDocumentId === 'plan_2571_2575_main'
                ? 'bg-sky-50/90 dark:bg-sky-950/60 border-sky-500 dark:border-sky-500 ring-1 ring-sky-500/30 shadow-xs'
                : 'bg-slate-50/70 dark:bg-slate-900/50 border-slate-200/80 dark:border-slate-800 hover:border-sky-300 dark:hover:border-sky-800'
            }`}
          >
            <div className="flex items-center justify-between gap-1.5 w-full">
              <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-sky-100 dark:bg-sky-900/80 text-sky-800 dark:text-sky-200">
                แผนหลัก 5 ปี • 1 เล่มหลัก
              </span>
              <span className="text-[11px] font-extrabold text-sky-700 dark:text-sky-300 tabular-nums">
                {count2571_2575.toLocaleString('en-US')} โครงการ
              </span>
            </div>
            <div>
              <div className="text-sm font-extrabold text-slate-900 dark:text-slate-100">
                ห้วงแผน พ.ศ. 2571 – 2575
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                แผนพัฒนาท้องถิ่น 5 ปี ฉบับหลัก (ยังไม่มีฉบับแก้ไข)
              </p>
            </div>
          </button>

          {/* Card C: 2566 - 2570 Amendments & Additions */}
          <button
            type="button"
            onClick={() => handleSelectPeriodCard('2566-2570')}
            className={`card-calibrated btn-tactile text-left p-3 rounded-xl border cursor-pointer flex flex-col justify-between gap-1.5 ${
              selectedPeriod === '2566-2570'
                ? 'bg-amber-50/90 dark:bg-amber-950/40 border-amber-500 dark:border-amber-500 ring-1 ring-amber-500/30 shadow-xs'
                : 'bg-slate-50/70 dark:bg-slate-900/50 border-slate-200/80 dark:border-slate-800 hover:border-amber-300 dark:hover:border-amber-800'
            }`}
          >
            <div className="flex items-center justify-between gap-1.5 w-full">
              <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-amber-100 dark:bg-amber-900/80 text-amber-900 dark:text-amber-200">
                แก้ไข/เพิ่มเติม • {docs2566_2570.length} ฉบับ
              </span>
              <span className="text-[11px] font-extrabold text-amber-700 dark:text-amber-300 tabular-nums">
                {count2566_2570.toLocaleString('en-US')} โครงการ
              </span>
            </div>
            <div>
              <div className="text-sm font-extrabold text-slate-900 dark:text-slate-100">
                ห้วงแผน พ.ศ. 2566 – 2570
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                รวมฉบับแก้ไข • เปลี่ยนแปลง • เพิ่มเติม (ปี 2566, 2568, 2569)
              </p>
            </div>
          </button>
        </div>
      </div>

      {/* =====================================================================
          TIER 2: SUB-VOLUME & AMENDMENT SELECTOR GROUPED BY YEAR (เมื่อเลือกห้วง 2566-2570 หรือดูรายละเอียดเล่ม)
      ===================================================================== */}
      {selectedPeriod === '2566-2570' && (
        <div className="rounded-xl bg-slate-50/90 dark:bg-slate-900/70 border border-slate-200/80 dark:border-slate-800 p-3 space-y-2.5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center justify-center w-5 h-5 rounded-md bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 text-[11px] font-extrabold">
                2
              </span>
              <span className="text-xs font-extrabold text-slate-800 dark:text-slate-200">
                เลือกเล่มการแก้ไข / เปลี่ยนแปลง / เพิ่มเติม ในห้วงแผน พ.ศ. 2566 – 2570 (แบ่งตามปีที่ประกาศ)
              </span>
            </div>

            <button
              type="button"
              onClick={() => onSelectDocumentId(null)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-all cursor-pointer ${
                selectedDocumentId === null
                  ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-amber-400'
              }`}
            >
              แสดงรวมทั้ง {docs2566_2570.length} ฉบับ ({count2566_2570} โครงการ)
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
            {amendmentsByYear.map((group) => (
              <div
                key={group.year}
                className="rounded-xl bg-white dark:bg-slate-950/70 border border-slate-200/80 dark:border-slate-800/90 p-2.5 space-y-2"
              >
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 pb-1.5">
                  <span className="text-xs font-extrabold text-slate-800 dark:text-slate-200">
                    ประกาศปี พ.ศ. {group.year}
                  </span>
                  <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 tabular-nums">
                    {group.docs.length} ฉบับ • {group.totalProjects} โครงการ
                  </span>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {group.docs.map((doc) => {
                    const count = projectCountsByDoc[doc.id] || 0;
                    const isSelected = selectedDocumentId === doc.id;
                    const style = KIND_STYLES[doc.kind];
                    return (
                      <button
                        key={doc.id}
                        type="button"
                        onClick={() => handleSelectDocButton(doc)}
                        title={doc.title}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold border pill-tactile cursor-pointer ${
                          isSelected ? style.activePill : style.pill
                        }`}
                      >
                        <span>{doc.shortTitle}</span>
                        <span
                          className={`px-1.5 py-0.2 rounded-md text-[10px] font-extrabold tabular-nums ${
                            isSelected
                              ? 'bg-white/25 text-white'
                              : style.badge
                          }`}
                        >
                          {count}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* =====================================================================
          COLLAPSIBLE HISTORICAL ARCHIVE PDF DRAWER (คลังไฟล์ PDF เล่มเก่า/ทบทวนย้อนหลัง 5 เล่ม)
      ===================================================================== */}
      {archiveOpen && (
        <div className="rounded-xl bg-slate-100/90 dark:bg-slate-900/90 border border-slate-300/80 dark:border-slate-700 p-3 space-y-2.5 animate-in fade-in-50 duration-200">
          <div className="flex items-start justify-between gap-2">
            <div className="space-y-0.5">
              <div className="flex items-center gap-1.5 text-xs font-extrabold text-slate-800 dark:text-slate-200">
                <IconArchive className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                <span>
                  คลังไฟล์ PDF ต้นฉบับเล่มเก่า / เล่มทบทวนประจำปีที่ถูกยกยอดโครงการไปเล่มใหม่แล้ว ({archivedDocs.length} เล่ม)
                </span>
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-400">
                เอกสารทั้ง {archivedDocs.length} เล่มด้านล่างเป็นไฟล์สแกนแผนฉบับเต็มในอดีต ซึ่งรายการโครงการได้ถูกทบทวนและยกยอดไปอยู่ในเล่มหลักปัจจุบันแล้ว จึงแยกไว้เป็นคลังเอกสารอ้างอิงเพื่อไม่ให้ปุ่มตัวกรองแสดง 0 โครงการ
              </p>
            </div>
            <button
              type="button"
              onClick={() => setArchiveOpen(false)}
              title="ปิดคลังไฟล์ PDF เล่มเก่า"
              aria-label="ปิดคลังไฟล์ PDF เล่มเก่า"
              className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-800 btn-tactile cursor-pointer shrink-0"
            >
              <IconX className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {archivedDocs.map((doc) => (
              <a
                key={doc.id}
                href={doc.officialPdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center justify-between gap-2 p-2.5 rounded-xl bg-white dark:bg-slate-950/80 border border-slate-200/90 dark:border-slate-800 hover:border-sky-400 dark:hover:border-sky-600 hover:-translate-y-0.5 transition-all duration-200"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <IconFileText className="w-3.5 h-3.5 text-slate-400 group-hover:text-sky-600 shrink-0" />
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                      {doc.shortTitle}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                    ห้วง พ.ศ. {doc.period} • สแกนเต็มเล่ม {doc.pageCount} หน้า
                  </div>
                </div>
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 group-hover:bg-sky-600 group-hover:text-white transition-colors shrink-0">
                  <span>เปิด PDF</span>
                  <IconExternalLink className="w-3 h-3" />
                </span>
              </a>
            ))}
          </div>
        </div>
      )}

      {/* =====================================================================
          PRIMARY COMPACT CONTROL BAR (หมู่บ้าน + เลือกเล่มด่วน + ตัวกรองขั้นสูง + สลับมุมมอง)
      ===================================================================== */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-100 dark:border-slate-800/80">
        {/* Left: Quick Selects + Advanced Filter Icon Button + Reset Icon Button */}
        <div className="flex flex-wrap items-center gap-2 flex-1 min-w-0">
          {/* Village Custom Dropdown */}
          <SongyangSelect<number | null>
            value={selectedVillage}
            onChange={onSelectVillage}
            options={villageOptions}
            placeholder="ทุกหมู่บ้าน (ม.1 - ม.8)"
            ariaLabel="กรองตามหมู่บ้าน"
            icon={<IconMapPin className="w-3.5 h-3.5" />}
          />

          {/* Grouped Plan Document Custom Dropdown */}
          <SongyangSelect<string | null>
            value={selectedDocumentId}
            onChange={(val) => {
              onSelectDocumentId(val);
              if (val === 'plan_2571_2575_main') {
                onSelectPeriod('2571-2575');
              } else if (val !== null) {
                onSelectPeriod('2566-2570');
              }
            }}
            options={documentOptions}
            placeholder={
              selectedPeriod === '2566-2570'
                ? `ทุกฉบับ 2566-2570 (${docs2566_2570.length} ฉบับ)`
                : `ทุกเล่มแผน (${activeDocs.length} ฉบับ)`
            }
            ariaLabel="กรองตามเล่มแผนพัฒนาท้องถิ่น"
            className="max-w-[260px] sm:max-w-[320px]"
            icon={<IconFileText className="w-3.5 h-3.5" />}
          />

          {/* Dynamic Thai Fiscal Year Custom Dropdown */}
          <SongyangSelect<FiscalYearSelection>
            value={selectedYear ?? 'current'}
            onChange={onSelectYear}
            options={fiscalYearOptions}
            placeholder={`⚡ ปีปัจจุบัน (${currentFiscalYear})`}
            ariaLabel="เลือกปีงบประมาณ"
            className="max-w-[200px] sm:max-w-[245px]"
            icon={<IconCalendar className="w-3.5 h-3.5" />}
          />

          {/* Icon-Only Advanced Filter Drawer Toggle */}
          <button
            type="button"
            onClick={() => setAdvancedOpen((prev) => !prev)}
            title="ตัวกรองขั้นสูง (ยุทธศาสตร์ / ประเภทงาน / ปีงบประมาณ)"
            aria-label="ตัวกรองขั้นสูง"
            aria-expanded={advancedOpen}
            className={`relative h-9 px-2.5 rounded-xl inline-flex items-center justify-center gap-1.5 border btn-tactile cursor-pointer ${
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
              className="w-9 h-9 rounded-xl inline-flex items-center justify-center bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800/70 hover:bg-rose-600 hover:text-white btn-tactile cursor-pointer"
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
              className={`w-8 h-8 rounded-lg flex items-center justify-center btn-tactile cursor-pointer ${
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
              className={`w-8 h-8 rounded-lg flex items-center justify-center btn-tactile cursor-pointer ${
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

      {/* Quick Work Category Filter Bar */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden pt-2 border-t border-slate-100 dark:border-slate-800/80">
        <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 shrink-0 mr-1">
          หมวดงาน:
        </span>
        <button
          type="button"
          onClick={() => onSelectCategory(null)}
          className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap pill-tactile shrink-0 cursor-pointer ${
            selectedCategory === null
              ? 'bg-sky-600 text-white shadow-xs'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
          }`}
        >
          ทั้งหมด
        </button>
        {WORK_CATEGORIES.map((cat) => {
          const isSelected = selectedCategory === cat.key;
          const count = categoryCounts[cat.key];
          return (
            <button
              key={cat.key}
              type="button"
              onClick={() => onSelectCategory(isSelected ? null : cat.key)}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap pill-tactile shrink-0 cursor-pointer ${
                isSelected
                  ? 'bg-sky-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              <span>{cat.label}</span>
              {count !== undefined && (
                <span
                  className={`ml-1 font-mono text-[10.5px] ${
                    isSelected ? 'text-sky-100' : 'text-slate-400 dark:text-slate-500'
                  }`}
                >
                  ({count})
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Active Advanced Filter Chips (When drawer is closed but filters are active) */}
      {!advancedOpen && activeAdvancedCount > 0 && (
        <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-slate-100 dark:border-slate-800/80">
          {selectedStrategy !== null && (
            <button
              type="button"
              onClick={() => onSelectStrategy(null)}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-sky-50 dark:bg-sky-950/70 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800 pill-tactile cursor-pointer"
            >
              <span>ด้านที่ {selectedStrategy}</span>
              <IconX className="w-3 h-3" />
            </button>
          )}
          {selectedCategory !== null && (
            <button
              type="button"
              onClick={() => onSelectCategory(null)}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-sky-50 dark:bg-sky-950/70 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800 pill-tactile cursor-pointer"
            >
              <span>{categoryLabelMap[selectedCategory] || selectedCategory}</span>
              <IconX className="w-3 h-3" />
            </button>
          )}
          {selectedYear !== null && selectedYear !== 'current' && (
            <button
              type="button"
              onClick={() => onSelectYear('current')}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-sky-50 dark:bg-sky-950/70 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800 pill-tactile cursor-pointer"
            >
              <span>{selectedYear === 'all' ? 'ทุกปีงบประมาณ' : `ปี ${selectedYear}`}</span>
              <IconX className="w-3 h-3" />
            </button>
          )}
        </div>
      )}

      {/* Collapsible Advanced Filter Drawer */}
      {advancedOpen && (
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs animate-in fade-in-50 duration-200">
          {/* 1. Strategy Select */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1">
              ยุทธศาสตร์การพัฒนา (7 ด้าน)
            </label>
            <SongyangSelect<number | null>
              value={selectedStrategy}
              onChange={onSelectStrategy}
              options={strategyOptions}
              placeholder="ทุกด้านยุทธศาสตร์ (ด้านที่ 1 - 7)"
              ariaLabel="ยุทธศาสตร์การพัฒนา"
              className="w-full"
              icon={<IconLayers className="w-3.5 h-3.5" />}
            />
          </div>

          {/* 2. Category Select */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1">
              ประเภทงาน / หมวดหมู่โครงการ
            </label>
            <SongyangSelect<string | null>
              value={selectedCategory}
              onChange={onSelectCategory}
              options={categoryOptions}
              placeholder="ทุกประเภทงาน"
              ariaLabel="ประเภทงาน / หมวดหมู่โครงการ"
              className="w-full"
              icon={<IconGrid className="w-3.5 h-3.5" />}
            />
          </div>
        </div>
      )}
    </div>
  );
}
