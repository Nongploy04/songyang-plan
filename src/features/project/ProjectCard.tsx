'use client';

import React, { useState } from 'react';
import { type LocalPlanProject, getProjectFiscalYears } from '../../domain/types.ts';
import { toArabic, formatCurrency } from '../../domain/thaiNumerals.ts';
import { getVillageLabel } from '../../domain/villages.ts';
import { generateOfficialCitation } from '../../domain/citation.ts';
import { IconCopy, IconCheck, IconPrint, IconMapPin } from '../../components/icons/index.tsx';

interface ProjectCardProps {
  project: LocalPlanProject;
  onSelect: (p: LocalPlanProject) => void;
  onPrintDirect: (p: LocalPlanProject) => void;
}

function safeCopyText(text: string): void {
  try {
    if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(text).catch(() => {
        fallbackCopyText(text);
      });
      return;
    }
  } catch {
    // Fallback below
  }
  fallbackCopyText(text);
}

function fallbackCopyText(text: string): void {
  try {
    if (typeof document === 'undefined') return;
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
  } catch {
    // Ignore in restricted environments
  }
}

export function ProjectCard({
  project,
  onSelect,
  onPrintDirect,
}: ProjectCardProps) {
  const [copied, setCopied] = useState(false);

  const displaySeq = toArabic(project.seq);
  const displayPage = toArabic(project.printedPage);
  const displayTotal = formatCurrency(project.totalBudget, false);
  const cleanName = toArabic(project.name);
  const cleanTarget = toArabic(project.target);
  const cleanDocTitle = toArabic(project.documentTitle);
  const cleanStrategyName = toArabic(project.strategyName);

  const fiscalYears = getProjectFiscalYears(project);
  const fundedYears = fiscalYears.filter((yr) => (project.budgets[yr] || 0) > 0);

  const handleCopyCitation = (e: React.MouseEvent) => {
    e.stopPropagation();
    const citation = generateOfficialCitation({
      planTitle: cleanDocTitle,
      strategyNo: project.strategyNo,
      seq: project.seq,
      printedPage: displayPage,
      useThaiNumerals: false,
    });
    safeCopyText(citation);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      onClick={() => onSelect(project)}
      className="group relative bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700/80 p-5 shadow-xs hover:shadow-md hover:border-sky-300 dark:hover:border-sky-600 transition-all cursor-pointer flex flex-col justify-between"
    >
      <div className="space-y-3">
        {/* Top Badges */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold bg-sky-100 dark:bg-sky-900/60 text-sky-800 dark:text-sky-200">
              ลำดับที่ {displaySeq}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              หน้า {displayPage}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-2xs font-bold bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
              {cleanDocTitle
                .replace('แผนพัฒนาท้องถิ่น', '')
                .replace('องค์การบริหารส่วนตำบลสงยาง', '')
                .trim() || 'แผนหลัก'}
            </span>
            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
              ด้านที่ {project.strategyNo}
            </span>
          </div>
        </div>

        {/* Project Title */}
        <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors leading-snug">
          {cleanName}
        </h3>

        {/* Village Tags */}
        <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400">
          <IconMapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span>
            {project.villages.length >= 8
              ? 'ทุกหมู่บ้าน (ม.1 - ม.8)'
              : project.villages.map((no) => getVillageLabel(no)).join(', ')}
          </span>
        </div>

        {/* Target summary snippet */}
        <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
          {cleanTarget}
        </p>

        {/* Active Fiscal Year Pills */}
        {fundedYears.length > 0 && (
          <div className="flex flex-wrap gap-1 pt-0.5">
            {fundedYears.map((yr) => (
              <span
                key={yr}
                className="inline-flex items-center px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-700/70 text-2xs font-medium text-slate-600 dark:text-slate-300"
              >
                ปี {yr}: {formatCurrency(project.budgets[yr], false)}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Bottom Footer: Budget & Actions */}
      <div className="mt-4 pt-3.5 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between">
        <div>
          <span className="block text-2xs uppercase tracking-wider text-slate-400 font-semibold">
            งบรวม ({fiscalYears[0]}-{fiscalYears[fiscalYears.length - 1]}) • {toArabic(project.agency)}
          </span>
          <span className="text-base font-bold text-sky-600 dark:text-sky-400">
            {displayTotal} <span className="text-xs font-normal text-slate-500">บาท</span>
          </span>
        </div>

        <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
          <button
            type="button"
            onClick={handleCopyCitation}
            className="p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:text-sky-600 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            title="คัดลอกคำอ้างอิงราชการสำหรับบันทึกข้อความ"
            aria-label="คัดลอกคำอ้างอิง"
          >
            {copied ? (
              <IconCheck className="w-4 h-4 text-emerald-600" />
            ) : (
              <IconCopy className="w-4 h-4" />
            )}
          </button>

          <button
            type="button"
            onClick={() => onPrintDirect(project)}
            className="p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:text-sky-600 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            title="พิมพ์หน้านี้เป็นเอกสารราชการ แบบ ผ.02"
            aria-label="พิมพ์เอกสาร"
          >
            <IconPrint className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
