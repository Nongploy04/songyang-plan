'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { INITIAL_PLAN_PROJECTS } from '../data/initialProjects.ts';
import type { LocalPlanProject } from '../domain/types.ts';
import { toArabic, formatCurrency } from '../domain/thaiNumerals.ts';
import { getVillageLabel } from '../domain/villages.ts';
import { PLAN_2571_2575_OFFICIAL_SUMMARY } from '../domain/documents.ts';
import { SearchBar } from '../features/search/SearchBar.tsx';
import { FilterPanel } from '../features/search/FilterPanel.tsx';
import { ProjectCard } from '../features/project/ProjectCard.tsx';
import { ProjectDetailModal, type PrintPackMode } from '../features/project/ProjectDetailModal.tsx';
import { PrintOfficialSheet } from '../features/project/PrintOfficialSheet.tsx';
import { safeGetJson, safeSetJson, safeGetText, safeSetText } from '../lib/safeBrowserStorage.ts';
import { formatBuildStamp } from '../lib/build-version.js';
import { IconLayers, IconFileText, IconSun, IconMoon, IconArrowLeft } from '../components/icons/index.tsx';

interface PersistedFilterPrefs {
  documentId: string | null;
  villageNo: number | null;
  strategyNo: number | null;
  workCategory: string | null;
  fiscalYear: number | null;
}

const FILTER_CACHE_KEY = 'songyang_plan_filters_v2';

function isValidFilterPrefs(val: unknown): val is PersistedFilterPrefs {
  if (!val || typeof val !== 'object') return false;
  const v = val as Record<string, unknown>;
  const isStrOrNull = (x: unknown) => x === null || typeof x === 'string';
  const isNumOrNull = (x: unknown) => x === null || (typeof x === 'number' && Number.isFinite(x));
  return (
    isStrOrNull(v.documentId) &&
    isNumOrNull(v.villageNo) &&
    isNumOrNull(v.strategyNo) &&
    isStrOrNull(v.workCategory) &&
    isNumOrNull(v.fiscalYear)
  );
}

export default function PlanHomePage() {
  const [projects] = useState<LocalPlanProject[]>(INITIAL_PLAN_PROJECTS);
  const [query, setQuery] = useState('');
  const [selectedDocumentId, setSelectedDocumentId] = useState<string | null>(null);
  const [selectedVillage, setSelectedVillage] = useState<number | null>(null);
  const [selectedStrategy, setSelectedStrategy] = useState<number | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [showSummaryTable, setShowSummaryTable] = useState<boolean>(false);
  const [darkMode, setDarkMode] = useState<boolean>(false);
  const [portalUrl, setPortalUrl] = useState<string>('https://songyang-portal.vercel.app');
  const [hydrated, setHydrated] = useState(false);

  const [activeProject, setActiveProject] = useState<LocalPlanProject | null>(null);
  const [printProject, setPrintProject] = useState<LocalPlanProject | null>(null);
  const [printMode, setPrintMode] = useState<PrintPackMode>('table_only');

  // Hydrate filter state & theme from Self-Healing Cache on mount
  useEffect(() => {
    const cached = safeGetJson<PersistedFilterPrefs>(
      FILTER_CACHE_KEY,
      isValidFilterPrefs,
      {
        documentId: null,
        villageNo: null,
        strategyNo: null,
        workCategory: null,
        fiscalYear: null,
      }
    );
    setSelectedDocumentId(cached.documentId);
    setSelectedVillage(cached.villageNo);
    setSelectedStrategy(cached.strategyNo);
    setSelectedCategory(cached.workCategory);
    setSelectedYear(cached.fiscalYear);

    const savedTheme = safeGetText('so_plan_theme', 'light');
    const isDark = savedTheme === 'dark';
    setDarkMode(isDark);
    document.documentElement.classList.toggle('dark', isDark);

    if (typeof window !== 'undefined') {
      const host = window.location.hostname;
      if (host === 'localhost' || host === '127.0.0.1') {
        setPortalUrl('http://localhost:3001');
      }
    }

    setHydrated(true);
  }, []);

  const toggleDarkMode = () => {
    setDarkMode((prev) => {
      const next = !prev;
      document.documentElement.classList.toggle('dark', next);
      safeSetText('so_plan_theme', next ? 'dark' : 'light');
      return next;
    });
  };

  // Save filter state to Self-Healing Cache on change
  useEffect(() => {
    if (!hydrated) return;
    safeSetJson<PersistedFilterPrefs>(FILTER_CACHE_KEY, {
      documentId: selectedDocumentId,
      villageNo: selectedVillage,
      strategyNo: selectedStrategy,
      workCategory: selectedCategory,
      fiscalYear: selectedYear,
    });
  }, [
    hydrated,
    selectedDocumentId,
    selectedVillage,
    selectedStrategy,
    selectedCategory,
    selectedYear,
  ]);

  // Clear single-project print state after printing finishes
  useEffect(() => {
    const handleAfterPrint = () => {
      setPrintProject(null);
    };
    window.addEventListener('afterprint', handleAfterPrint);
    return () => {
      window.removeEventListener('afterprint', handleAfterPrint);
    };
  }, []);

  // Project counts per document volume
  const projectCountsByDoc = useMemo(() => {
    const map: Record<string, number> = {};
    for (const p of projects) {
      map[p.documentId] = (map[p.documentId] || 0) + 1;
    }
    return map;
  }, [projects]);

  // Filter & Search Logic
  const filteredProjects = useMemo(() => {
    const q = toArabic(query).toLowerCase().trim();

    return projects.filter((p) => {
      // Document Filter
      if (selectedDocumentId !== null && p.documentId !== selectedDocumentId) {
        return false;
      }

      // Village Filter
      if (selectedVillage !== null && !p.villages.includes(selectedVillage)) {
        return false;
      }

      // Strategy Filter
      if (selectedStrategy !== null && p.strategyNo !== selectedStrategy) {
        return false;
      }

      // Category Filter
      if (selectedCategory !== null && p.workCategory !== selectedCategory) {
        return false;
      }

      // Fiscal Year Filter
      if (selectedYear !== null) {
        const amount = p.budgets[selectedYear];
        if (!amount || amount <= 0) return false;
      }

      // Query Search (matches project name, target, objective, seq, village names, document title, lineage origin, agency)
      if (q) {
        const villageText = p.villages.map((no) => getVillageLabel(no)).join(' ').toLowerCase();
        const lineageText = p.lineage
          ? [
              p.lineage.statusLabel,
              p.lineage.originReference || '',
              p.lineage.previousDetails || '',
              p.lineage.revisionReason || '',
            ].join(' ')
          : '';
        const searchable = [
          toArabic(p.name),
          toArabic(p.target),
          toArabic(p.objective),
          toArabic(p.agency),
          toArabic(p.documentTitle),
          toArabic(p.strategyName),
          villageText,
          toArabic(lineageText),
        ]
          .join(' ')
          .toLowerCase();

        const normalizedSeq = toArabic(p.seqRaw || String(p.seq));
        const match = searchable.includes(q) || normalizedSeq === q;

        if (!match) return false;
      }

      return true;
    });
  }, [
    projects,
    query,
    selectedDocumentId,
    selectedVillage,
    selectedStrategy,
    selectedCategory,
    selectedYear,
  ]);

  // Aggregate stats
  const totalBudget = useMemo(() => {
    return filteredProjects.reduce((acc, curr) => acc + (curr.totalBudget || 0), 0);
  }, [filteredProjects]);

  const totalBudgetFormatted = formatCurrency(totalBudget, false);

  const hasActiveFilters =
    Boolean(query) ||
    selectedDocumentId !== null ||
    selectedVillage !== null ||
    selectedStrategy !== null ||
    selectedCategory !== null ||
    selectedYear !== null;

  const handleResetFilters = () => {
    setQuery('');
    setSelectedDocumentId(null);
    setSelectedVillage(null);
    setSelectedStrategy(null);
    setSelectedCategory(null);
    setSelectedYear(null);
  };

  const handlePrint = (p: LocalPlanProject, mode: PrintPackMode = 'table_only') => {
    setPrintProject(p);
    setPrintMode(mode);

    // Preload scan images before triggering window.print()
    const allPages = p.lineage?.officialScanPages || [];
    const tablePages = allPages.filter((pg) => pg.role === 'table_old' || pg.role === 'table_current');
    const pagesToLoad = mode === 'full_official_pack' ? allPages : tablePages.length > 0 ? tablePages : allPages;

    Promise.all(
      pagesToLoad.map(
        (pg) =>
          new Promise<void>((resolve) => {
            const img = new Image();
            img.onload = () => resolve();
            img.onerror = () => resolve();
            img.src = pg.imageUrl;
          })
      )
    ).finally(() => {
      setTimeout(() => {
        window.print();
      }, 120);
    });
  };

  return (
    <>
      {/* On-screen Web UI */}
      <div className="no-print min-h-screen flex flex-col">
        {/* Top Header */}
        <header className="sticky top-0 z-30 bg-white/95 dark:bg-[#0c1222]/95 [backdrop-filter:blur(28px)_saturate(190%)] [-webkit-backdrop-filter:blur(28px)_saturate(190%)] border-b border-black/[0.08] dark:border-white/[0.12]">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
              <a
                href={portalUrl}
                title="กลับหน้าหลัก Songyang Portal"
                className="inline-flex items-center gap-1 px-2.5 py-2 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors shrink-0"
              >
                <IconArrowLeft className="w-4 h-4" />
                <span className="hidden md:inline">Portal</span>
              </a>
              <div className="w-10 h-10 rounded-xl bg-sky-600 flex items-center justify-center text-white shadow-xs shrink-0">
                <IconLayers className="w-5 h-5 text-white" />
              </div>
              <div className="min-w-0">
                <h1 className="text-sm sm:text-lg font-bold text-slate-900 dark:text-slate-100 leading-tight truncate">
                  ระบบสืบค้นและพิมพ์แผนพัฒนาท้องถิ่น อบต.สงยาง
                </h1>
                <p className="text-2xs sm:text-xs text-slate-500 dark:text-slate-400 truncate">
                  อบต.สงยาง อ.มหาชนะชัย จ.ยโสธร • ตรวจสอบเล่มแผน ประวัติการแก้ไข และสั่งปริ้นหน้าสแกนต้นฉบับจริง
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setShowSummaryTable((prev) => !prev)}
                className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-colors cursor-pointer ${
                  showSummaryTable
                    ? 'bg-sky-600 text-white border-sky-600'
                    : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700'
                }`}
              >
                <IconFileText className="w-4 h-4" />
                <span className="hidden sm:inline">ตารางสรุปยอดแผน (แบบ ผ.01)</span>
                <span className="sm:hidden">ผ.01</span>
              </button>

              <button
                type="button"
                onClick={toggleDarkMode}
                aria-label={darkMode ? 'สลับเป็นโหมดสว่าง' : 'สลับเป็นโหมดมืด'}
                title={darkMode ? 'สลับเป็นโหมดสว่าง' : 'สลับเป็นโหมดมืด'}
                className="inline-flex items-center justify-center w-9 h-9 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-amber-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors cursor-pointer"
              >
                {darkMode ? <IconSun className="w-4 h-4" /> : <IconMoon className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 space-y-6">
          {/* Collapsible Official Summary Table (แบบ ผ.01) */}
          {showSummaryTable && (
            <section className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-sky-200 dark:border-sky-900/60 shadow-sm space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100">
                    ตารางสรุปจำนวนโครงการและงบประมาณ แผนพัฒนาท้องถิ่น (พ.ศ. 2571 - 2575) ตามแบบ ผ.01 (หน้า 61)
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    คลิกที่แถวยุทธศาสตร์เพื่อกรองดูโครงการในด้านนั้นได้ทันที
                  </p>
                </div>
                <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-sky-100 dark:bg-sky-950 text-sky-800 dark:text-sky-300">
                  รวมทั้งเล่ม 419 โครงการ • 2,485,336,443 บาท
                </span>
              </div>

              <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
                <table className="w-full text-xs text-left border-collapse">
                  <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                    <tr>
                      <th className="p-2.5 border-b border-slate-200 dark:border-slate-700">ประเด็นการพัฒนา (ยุทธศาสตร์)</th>
                      <th className="p-2.5 text-center border-b border-slate-200 dark:border-slate-700">หน้าเอกสาร</th>
                      <th className="p-2.5 text-right border-b border-slate-200 dark:border-slate-700">จำนวนโครงการ</th>
                      <th className="p-2.5 text-right border-b border-slate-200 dark:border-slate-700">ปี 2571</th>
                      <th className="p-2.5 text-right border-b border-slate-200 dark:border-slate-700">ปี 2572</th>
                      <th className="p-2.5 text-right border-b border-slate-200 dark:border-slate-700">ปี 2573</th>
                      <th className="p-2.5 text-right border-b border-slate-200 dark:border-slate-700">ปี 2574</th>
                      <th className="p-2.5 text-right border-b border-slate-200 dark:border-slate-700">ปี 2575</th>
                      <th className="p-2.5 text-right border-b border-slate-200 dark:border-slate-700 bg-sky-50 dark:bg-sky-950/50">งบประมาณรวม 5 ปี</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {PLAN_2571_2575_OFFICIAL_SUMMARY.map((row) => {
                      const isSelected = selectedStrategy === row.strategyNo;
                      return (
                        <tr
                          key={row.strategyNo}
                          onClick={() => {
                            setSelectedDocumentId('plan_2571_2575_main');
                            setSelectedStrategy(isSelected ? null : row.strategyNo);
                          }}
                          className={`cursor-pointer transition-colors ${
                            isSelected
                              ? 'bg-sky-50 dark:bg-sky-950/60 font-semibold'
                              : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
                          }`}
                        >
                          <td className="p-2.5 font-medium text-slate-900 dark:text-slate-100">
                            ด้านที่ {row.strategyNo}: {row.strategyShortName}
                          </td>
                          <td className="p-2.5 text-center text-slate-500">หน้า {row.printedPageRange}</td>
                          <td className="p-2.5 text-right font-bold text-sky-600 dark:text-sky-400">
                            {row.projectCount.toLocaleString('en-US')}
                          </td>
                          <td className="p-2.5 text-right">{formatCurrency(row.budgets[2571], false)}</td>
                          <td className="p-2.5 text-right">{formatCurrency(row.budgets[2572], false)}</td>
                          <td className="p-2.5 text-right">{formatCurrency(row.budgets[2573], false)}</td>
                          <td className="p-2.5 text-right">{formatCurrency(row.budgets[2574], false)}</td>
                          <td className="p-2.5 text-right">{formatCurrency(row.budgets[2575], false)}</td>
                          <td className="p-2.5 text-right font-bold bg-sky-50/40 dark:bg-sky-950/30">
                            {formatCurrency(row.totalBudget, false)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {/* Search Bar Section */}
          <section className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs">
            <SearchBar
              value={query}
              onChange={setQuery}
              totalCount={filteredProjects.length}
              totalDatasetCount={projects.length}
              totalBudgetFormatted={totalBudgetFormatted}
            />
          </section>

          {/* Filter Panel */}
          <FilterPanel
            selectedDocumentId={selectedDocumentId}
            onSelectDocumentId={setSelectedDocumentId}
            selectedVillage={selectedVillage}
            onSelectVillage={setSelectedVillage}
            selectedStrategy={selectedStrategy}
            onSelectStrategy={setSelectedStrategy}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
            selectedYear={selectedYear}
            onSelectYear={setSelectedYear}
            onReset={handleResetFilters}
            hasActiveFilters={hasActiveFilters}
            projectCountsByDoc={projectCountsByDoc}
          />

          {/* Projects Results Grid */}
          <section className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                รายการโครงการ ({filteredProjects.length.toLocaleString('en-US')} โครงการ)
              </h2>
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="text-xs font-semibold text-sky-600 dark:text-sky-400 hover:underline"
                >
                  แสดงทั้งหมด ({projects.length.toLocaleString('en-US')} โครงการ)
                </button>
              )}
            </div>

            {filteredProjects.length === 0 ? (
              <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-300 dark:border-slate-800">
                <p className="text-slate-500 dark:text-slate-400 text-sm">
                  ไม่พบโครงการที่ตรงกับเงื่อนไขการค้นหา
                </p>
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="mt-3 px-4 py-2 rounded-xl text-xs font-semibold text-sky-600 hover:bg-sky-50 dark:hover:bg-slate-800 transition-colors"
                >
                  ล้างตัวกรองทั้งหมด
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredProjects.map((p) => (
                  <ProjectCard
                    key={p.id}
                    project={p}
                    onSelect={setActiveProject}
                    onPrintDirect={(proj) => handlePrint(proj, 'table_only')}
                  />
                ))}
              </div>
            )}
          </section>
        </main>

        {/* Footer */}
        <footer className="mt-auto py-6 border-t border-slate-200 dark:border-slate-800 text-center text-xs text-slate-400">
          <div>ระบบสารสนเทศแผนพัฒนาท้องถิ่น องค์การบริหารส่วนตำบลสงยาง อำเภอมหาชนะชัย จังหวัดยโสธร</div>
          <div className="mt-1 font-mono text-3xs text-slate-400">{formatBuildStamp()}</div>
        </footer>
      </div>

      {/* Project Detail Modal */}
      <ProjectDetailModal
        project={activeProject}
        onClose={() => setActiveProject(null)}
        onPrint={handlePrint}
      />

      {/* Official Scanned Document Print Sheet (Rendered only on print / paper) */}
      <PrintOfficialSheet
        project={printProject || activeProject}
        printMode={printMode}
      />
    </>
  );
}
