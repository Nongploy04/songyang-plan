'use client';

import React, { useState } from 'react';
import { type LocalPlanProject } from '../../domain/types.ts';
import { toArabic, formatCurrency } from '../../domain/thaiNumerals.ts';
import { getVillageLabel } from '../../domain/villages.ts';
import { generateOfficialCitation } from '../../domain/citation.ts';
import { LiquidTooltip } from '../../components/LiquidTooltip.tsx';
import {
  IconPrint,
  IconCopy,
  IconCheck,
  IconMapPin,
  IconChevronRight,
} from '../../components/icons/index.tsx';

interface ProjectCardProps {
  project: LocalPlanProject;
  onSelect: (p: LocalPlanProject) => void;
  onPrintDirect: (p: LocalPlanProject) => void;
}

export function getCompactDocBadge(project: LocalPlanProject): {
  label: string;
  isModified: boolean;
} {
  const lineage = project.lineage;
  const isModified = Boolean(lineage?.hasBeenModified);
  const rawStatus = toArabic(lineage?.statusLabel || project.documentTitle || '');

  if (rawStatus.includes('2571-2575') && !isModified) {
    return { label: 'แผนหลัก 71-75', isModified: false };
  }
  if (rawStatus.includes('2566-2570') && !isModified) {
    return { label: 'แผนหลัก 66-70', isModified: false };
  }
  const compact = rawStatus
    .replace('แผนพัฒนาท้องถิ่น ', '')
    .replace('พ.ศ. ', '')
    .replace('ฉบับ', '')
    .replace('ครั้งที่ ', '#')
    .trim();
  return {
    label: compact.length > 22 ? `${compact.slice(0, 22)}…` : compact || 'แผนพัฒนาฯ',
    isModified,
  };
}

export function ProjectCard({
  project,
  onSelect,
  onPrintDirect,
}: ProjectCardProps) {
  const [copied, setCopied] = useState(false);

  const displaySeq = toArabic(project.seq);
  const displayPrintedPage = toArabic(project.printedPage);
  const displayTotal = formatCurrency(project.totalBudget, false);
  const cleanName = toArabic(project.name);

  const handleCopyCitation = (e: React.MouseEvent) => {
    e.stopPropagation();
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
      // Ignore clipboard permission errors
    }

    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrintClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onPrintDirect(project);
  };

  const villageLabels =
    project.villages.length >= 8
      ? 'ทุกหมู่บ้านในตำบลสงยาง (ม.1 - ม.8)'
      : project.villages.map((no) => getVillageLabel(no)).join(', ');

  const docBadge = getCompactDocBadge(project);

  return (
    <article
      onClick={() => onSelect(project)}
      className="group relative rounded-2xl bg-white/95 dark:bg-[#0c1222]/95 [backdrop-filter:blur(28px)_saturate(190%)] [-webkit-backdrop-filter:blur(28px)_saturate(190%)] border border-black/[0.08] dark:border-white/[0.12] hover:border-sky-500/60 dark:hover:border-sky-500/60 shadow-sm hover:shadow-xl transition-all duration-200 p-5 flex flex-col justify-between gap-4 cursor-pointer"
    >
      <div className="space-y-3">
        {/* Top Row: Compact Badges + Icon-Only Action Buttons */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 flex-wrap min-w-0">
            <span
              className="px-2.5 py-1 rounded-lg text-xs font-extrabold bg-sky-500/10 dark:bg-sky-500/15 text-sky-700 dark:text-sky-300 border border-sky-500/20 tabular-nums"
              title={`ลำดับที่ ${displaySeq}`}
            >
              #{displaySeq}
            </span>

            <span
              className="px-2 py-1 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 tabular-nums"
              title={`หน้าเอกสาร ${displayPrintedPage} (ไฟล์ PDF หน้า ${toArabic(project.pdfPage)})`}
            >
              หน้า {displayPrintedPage}
            </span>

            <span
              className={`px-2 py-1 rounded-lg text-[11px] font-semibold truncate max-w-[140px] ${
                docBadge.isModified
                  ? 'bg-amber-500/15 text-amber-800 dark:text-amber-300 border border-amber-500/30'
                  : 'bg-slate-100/80 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400'
              }`}
              title={project.lineage?.statusLabel || toArabic(project.documentTitle)}
            >
              {docBadge.label}
            </span>
          </div>

          {/* Icon-Only Quick Actions (Copy Citation & Print Official Scan) */}
          <div
            className="flex items-center gap-1 shrink-0"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={handleCopyCitation}
              title={copied ? 'คัดลอกคำอ้างอิงแล้ว' : 'คัดลอกคำอ้างอิงราชการ'}
              aria-label="คัดลอกคำอ้างอิงราชการ"
              className={`w-8 h-8 rounded-xl flex items-center justify-center border transition-all ${
                copied
                  ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-300 dark:border-emerald-700 text-emerald-600 dark:text-emerald-400'
                  : 'bg-transparent border-transparent text-slate-400 hover:text-sky-600 dark:hover:text-sky-400 hover:bg-sky-50 dark:hover:bg-sky-950/60 hover:border-sky-200 dark:hover:border-sky-800/60'
              }`}
            >
              {copied ? (
                <IconCheck className="w-4 h-4" />
              ) : (
                <IconCopy className="w-4 h-4" />
              )}
            </button>

            <button
              type="button"
              onClick={handlePrintClick}
              title="ปริ้นหน้าเอกสารสแกนต้นฉบับจริง (A4)"
              aria-label="ปริ้นหน้าเอกสารสแกนต้นฉบับจริง"
              className="w-8 h-8 rounded-xl flex items-center justify-center bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 border border-sky-200/70 dark:border-sky-800/70 hover:bg-sky-600 hover:text-white dark:hover:bg-sky-500 dark:hover:text-white transition-all"
            >
              <IconPrint className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Project Name (High Readability, Generous Line Spacing) */}
        <LiquidTooltip
          title={`#${displaySeq} ${cleanName}`}
          description={`${villageLabels} • ด้านที่ ${project.strategyNo} (${docBadge.label} หน้า ${displayPrintedPage})`}
          badge={`งบ ${displayTotal} ฿`}
          placement="bottom"
          align="left"
          className="w-full"
        >
          <h3
            className="text-[15.5px] sm:text-base font-bold text-slate-900 dark:text-slate-100 group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors leading-relaxed line-clamp-2 cursor-help"
            title={cleanName}
          >
            {cleanName}
          </h3>
        </LiquidTooltip>

        {/* Single-Line Village & Strategy Metadata */}
        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 min-w-0">
          <span className="inline-flex items-center gap-1 font-medium truncate">
            <IconMapPin className="w-3.5 h-3.5 text-sky-500 shrink-0" />
            <span className="truncate">{villageLabels}</span>
          </span>
          <span className="text-slate-300 dark:text-slate-700 shrink-0">•</span>
          <span className="shrink-0 font-medium text-slate-400 dark:text-slate-500">
            ด้านที่ {project.strategyNo}
          </span>
        </div>
      </div>

      {/* Clean Footer: Total Budget + Subtle Detail Indicator */}
      <div className="pt-3.5 border-t border-slate-100 dark:border-slate-800/80 flex items-baseline justify-between gap-2">
        <div className="flex items-baseline gap-1.5">
          <span className="text-base sm:text-lg font-extrabold text-sky-600 dark:text-sky-400 tabular-nums">
            {displayTotal}
          </span>
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
            บาท
          </span>
        </div>

        <span className="inline-flex items-center gap-0.5 text-xs font-semibold text-slate-400 group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors shrink-0">
          <span>รายละเอียด</span>
          <IconChevronRight className="w-3.5 h-3.5" />
        </span>
      </div>
    </article>
  );
}
