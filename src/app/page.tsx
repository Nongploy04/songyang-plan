'use client';

import React, { useState, useMemo } from 'react';
import { INITIAL_PLAN_PROJECTS } from '../data/initialProjects.ts';
import { LocalPlanProject } from '../domain/types.ts';
import { toArabic, toThai, formatCurrency } from '../domain/thaiNumerals.ts';
import { SearchBar } from '../features/search/SearchBar.tsx';
import { FilterPanel } from '../features/search/FilterPanel.tsx';
import { ProjectCard } from '../features/project/ProjectCard.tsx';
import { ProjectDetailModal } from '../features/project/ProjectDetailModal.tsx';
import { PrintOfficialSheet } from '../features/project/PrintOfficialSheet.tsx';
import { formatBuildStamp } from '../lib/build-version.js';
import { IconLayers, IconPrint } from '../components/icons/index.tsx';

export default function PlanHomePage() {
  const [projects] = useState<LocalPlanProject[]>(INITIAL_PLAN_PROJECTS);
  const [query, setQuery] = useState('');
  const [selectedVillage, setSelectedVillage] = useState<number | null>(null);
  const [selectedStrategy, setSelectedStrategy] = useState<number | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [useThaiNumerals, setUseThaiNumerals] = useState(false);

  const [activeProject, setActiveProject] = useState<LocalPlanProject | null>(null);
  const [printProject, setPrintProject] = useState<LocalPlanProject | null>(null);

  // Filter & Search Logic
  const filteredProjects = useMemo(() => {
    const q = toArabic(query).toLowerCase().trim();

    return projects.filter((p) => {
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
        const amount = p.budgets[selectedYear as keyof typeof p.budgets];
        if (!amount || amount <= 0) return false;
      }

      // Query Search (matches project name, target, objective, seq, village, agency)
      if (q) {
        const normalizedName = toArabic(p.name).toLowerCase();
        const normalizedTarget = toArabic(p.target).toLowerCase();
        const normalizedObjective = toArabic(p.objective).toLowerCase();
        const normalizedSeq = toArabic(p.seqRaw);
        const normalizedAgency = toArabic(p.agency).toLowerCase();

        const match =
          normalizedName.includes(q) ||
          normalizedTarget.includes(q) ||
          normalizedObjective.includes(q) ||
          normalizedSeq === q ||
          normalizedAgency.includes(q);

        if (!match) return false;
      }

      return true;
    });
  }, [projects, query, selectedVillage, selectedStrategy, selectedCategory, selectedYear]);

  // Aggregate stats
  const totalBudget = useMemo(() => {
    return filteredProjects.reduce((acc, curr) => acc + (curr.totalBudget || 0), 0);
  }, [filteredProjects]);

  const totalBudgetFormatted = formatCurrency(totalBudget, useThaiNumerals);

  const hasActiveFilters =
    Boolean(query) ||
    selectedVillage !== null ||
    selectedStrategy !== null ||
    selectedCategory !== null ||
    selectedYear !== null;

  const handleResetFilters = () => {
    setQuery('');
    setSelectedVillage(null);
    setSelectedStrategy(null);
    setSelectedCategory(null);
    setSelectedYear(null);
  };

  const handlePrint = (p: LocalPlanProject) => {
    setPrintProject(p);
    setTimeout(() => {
      window.print();
    }, 150);
  };

  const handlePrintAllFiltered = () => {
    setPrintProject(null);
    setTimeout(() => {
      window.print();
    }, 150);
  };

  return (
    <>
      {/* On-screen Web UI */}
      <div className="no-print min-h-screen flex flex-col">
        {/* Top Header */}
        <header className="sticky top-0 z-30 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-sky-600 flex items-center justify-center text-white shadow-xs">
                <IconLayers className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 leading-tight">
                  แผนพัฒนาท้องถิ่น อบต.สงยาง
                </h1>
                <p className="text-2xs sm:text-xs text-slate-500 dark:text-slate-400">
                  อบต.สงยาง อ.มหาชนะชัย จ.ยโสธร • ฉบับ พ.ศ. ๒๕๗๑ - ๒๕๗๕
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handlePrintAllFiltered}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold transition-colors"
                title="พิมพ์รายการที่กรองทั้งหมดเป็นแบบ ผ.๐๒"
              >
                <IconPrint className="w-4 h-4 text-sky-600" />
                <span className="hidden sm:inline">พิมพ์ชุดข้อมูล (ผ.๐๒)</span>
              </button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 space-y-6">
          {/* Search Bar Section */}
          <section className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs">
            <SearchBar
              value={query}
              onChange={setQuery}
              useThaiNumerals={useThaiNumerals}
              onToggleThaiNumerals={() => setUseThaiNumerals(!useThaiNumerals)}
              totalCount={filteredProjects.length}
              totalBudgetFormatted={totalBudgetFormatted}
            />
          </section>

          {/* Filter Panel */}
          <FilterPanel
            selectedVillage={selectedVillage}
            onSelectVillage={setSelectedVillage}
            selectedStrategy={selectedStrategy}
            onSelectStrategy={setSelectedStrategy}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
            selectedYear={selectedYear}
            onSelectYear={setSelectedYear}
            useThaiNumerals={useThaiNumerals}
            onReset={handleResetFilters}
            hasActiveFilters={hasActiveFilters}
          />

          {/* Projects Results Grid */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                รายการโครงการ ({filteredProjects.length})
              </h2>
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
                    useThaiNumerals={useThaiNumerals}
                    onSelect={setActiveProject}
                    onPrintDirect={handlePrint}
                  />
                ))}
              </div>
            )}
          </section>
        </main>

        {/* Footer */}
        <footer className="mt-auto py-6 border-t border-slate-200 dark:border-slate-800 text-center text-xs text-slate-400">
          <div>ระบบสารสนเทศแผนพัฒนาท้องถิ่น องค์การบริหารส่วนตำบลสงยาง</div>
          <div className="mt-1 font-mono text-3xs text-slate-400">{formatBuildStamp()}</div>
        </footer>
      </div>

      {/* Project Detail Modal */}
      <ProjectDetailModal
        project={activeProject}
        useThaiNumerals={useThaiNumerals}
        onClose={() => setActiveProject(null)}
        onPrint={handlePrint}
      />

      {/* Official Print Sheet (Rendered only on print / paper) */}
      <PrintOfficialSheet
        project={printProject}
        projects={printProject ? undefined : filteredProjects}
        useThaiNumerals={useThaiNumerals}
      />
    </>
  );
}
