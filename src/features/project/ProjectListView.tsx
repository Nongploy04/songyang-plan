'use client';

import React, { useState } from 'react';
import { type LocalPlanProject } from '../../domain/types.ts';
import { toArabic, formatCurrency } from '../../domain/thaiNumerals.ts';
import { getVillageLabel } from '../../domain/villages.ts';
import { generateOfficialCitation } from '../../domain/citation.ts';
import { getCompactDocBadge } from './ProjectCard.tsx';
import {
  IconPrint,
  IconCopy,
  IconCheck,
  IconMapPin,
} from '../../components/icons/index.tsx';

interface ProjectListViewProps {
  projects: LocalPlanProject[];
  onSelect: (p: LocalPlanProject) => void;
  onPrintDirect: (p: LocalPlanProject) => void;
}

export function ProjectListView({
  projects,
  onSelect,
  onPrintDirect,
}: ProjectListViewProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (e: React.MouseEvent, project: LocalPlanProject) => {
    e.stopPropagation();
    const displayPrintedPage = toArabic(project.printedPage);
    const text = generateOfficialCitation({
      planTitle: toArabic(project.documentTitle),
      strategyNo: project.strategyNo,
      seq: project.seq,
      printedPage: displayPrintedPage,
      useThaiNumerals: false,
    });

    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
        navigator.clipboard.writeText(text).catch(() => {});
      }
    } catch {
      // Ignore clipboard errors
    }

    setCopiedId(project.id);
    setTimeout(() => {
      setCopiedId((prev) => (prev === project.id ? null : prev));
    }, 2000);
  };

  return (
    <div className="rounded-2xl bg-white/95 dark:bg-[#0c1222]/95 [backdrop-filter:blur(28px)_saturate(190%)] [-webkit-backdrop-filter:blur(28px)_saturate(190%)] border border-black/[0.08] dark:border-white/[0.12] shadow-sm overflow-hidden">
      {/* Desktop Table Header */}
      <div className="hidden md:grid md:grid-cols-12 gap-3 px-4 py-3 bg-slate-100/80 dark:bg-slate-800/80 border-b border-slate-200/80 dark:border-slate-800 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
        <div className="col-span-1">ลำดับ</div>
        <div className="col-span-6">ชื่อโครงการ / สถานที่ดำเนินการ</div>
        <div className="col-span-2">เล่มแผน • หน้า</div>
        <div className="col-span-2 text-right">งบประมาณรวม</div>
        <div className="col-span-1 text-right">จัดการ</div>
      </div>

      {/* Rows */}
      <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
        {projects.map((project) => {
          const displaySeq = toArabic(project.seq);
          const displayPrintedPage = toArabic(project.printedPage);
          const displayTotal = formatCurrency(project.totalBudget, false);
          const cleanName = toArabic(project.name);
          const docBadge = getCompactDocBadge(project);
          const isCopied = copiedId === project.id;

          const villageLabels =
            project.villages.length >= 8
              ? 'ทุกหมู่บ้าน (ม.1 - ม.8)'
              : project.villages.map((no) => getVillageLabel(no)).join(', ');

          return (
            <div
              key={project.id}
              onClick={() => onSelect(project)}
              className="group grid grid-cols-1 md:grid-cols-12 gap-2 md:gap-3 px-4 py-3.5 items-center hover:bg-sky-50/50 dark:hover:bg-sky-950/30 transition-colors cursor-pointer"
            >
              {/* Col 1: Sequence Badge */}
              <div className="md:col-span-1 flex items-center justify-between md:justify-start">
                <span
                  className="px-2 py-0.5 rounded-lg text-xs font-extrabold bg-sky-500/10 dark:bg-sky-500/15 text-sky-700 dark:text-sky-300 border border-sky-500/20 tabular-nums"
                  title={`ลำดับที่ ${displaySeq}`}
                >
                  #{displaySeq}
                </span>
                <span className="md:hidden text-xs font-semibold text-slate-500 dark:text-slate-400">
                  หน้า {displayPrintedPage}
                </span>
              </div>

              {/* Col 2: Project Name + Village + Strategy */}
              <div className="md:col-span-6 min-w-0">
                <div className="text-sm font-bold text-slate-900 dark:text-slate-100 group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors line-clamp-1">
                  {cleanName}
                </div>
                <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-500 dark:text-slate-400 min-w-0">
                  <span className="inline-flex items-center gap-1 truncate">
                    <IconMapPin className="w-3 h-3 text-sky-500 shrink-0" />
                    <span className="truncate">{villageLabels}</span>
                  </span>
                  <span className="text-slate-300 dark:text-slate-700 shrink-0">•</span>
                  <span className="shrink-0 text-slate-400 dark:text-slate-500">
                    ด้านที่ {project.strategyNo}
                  </span>
                </div>
              </div>

              {/* Col 3: Document & Page */}
              <div className="md:col-span-2 flex items-center gap-1.5 flex-wrap">
                <span
                  className={`px-2 py-0.5 rounded-md text-[11px] font-semibold truncate max-w-[130px] ${
                    docBadge.isModified
                      ? 'bg-amber-500/15 text-amber-800 dark:text-amber-300 border border-amber-500/30'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                  }`}
                  title={project.lineage?.statusLabel || toArabic(project.documentTitle)}
                >
                  {docBadge.label}
                </span>
                <span className="hidden md:inline text-xs font-semibold text-slate-500 dark:text-slate-400 tabular-nums">
                  หน้า {displayPrintedPage}
                </span>
              </div>

              {/* Col 4: Total Budget */}
              <div className="md:col-span-2 md:text-right flex items-center justify-between md:block pt-1 md:pt-0">
                <span className="md:hidden text-xs text-slate-500 dark:text-slate-400">
                  งบรวม:
                </span>
                <div>
                  <span className="text-sm font-extrabold text-sky-600 dark:text-sky-400 tabular-nums">
                    {displayTotal}
                  </span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 ml-1">
                    ฿
                  </span>
                </div>
              </div>

              {/* Col 5: Icon-Only Actions */}
              <div
                className="md:col-span-1 flex items-center justify-end gap-1"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  type="button"
                  onClick={(e) => handleCopy(e, project)}
                  title={isCopied ? 'คัดลอกคำอ้างอิงแล้ว' : 'คัดลอกคำอ้างอิงราชการ'}
                  aria-label="คัดลอกคำอ้างอิงราชการ"
                  className={`w-8 h-8 rounded-xl flex items-center justify-center border transition-all ${
                    isCopied
                      ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-300 dark:border-emerald-700 text-emerald-600 dark:text-emerald-400'
                      : 'bg-transparent border-transparent text-slate-400 hover:text-sky-600 dark:hover:text-sky-400 hover:bg-sky-50 dark:hover:bg-sky-950/60 hover:border-sky-200 dark:hover:border-sky-800/60'
                  }`}
                >
                  {isCopied ? (
                    <IconCheck className="w-4 h-4" />
                  ) : (
                    <IconCopy className="w-4 h-4" />
                  )}
                </button>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onPrintDirect(project);
                  }}
                  title="ปริ้นหน้าเอกสารสแกนต้นฉบับจริง (A4)"
                  aria-label="ปริ้นหน้าเอกสารสแกนต้นฉบับจริง"
                  className="w-8 h-8 rounded-xl flex items-center justify-center bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 border border-sky-200/70 dark:border-sky-800/70 hover:bg-sky-600 hover:text-white dark:hover:bg-sky-500 dark:hover:text-white transition-all"
                >
                  <IconPrint className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
