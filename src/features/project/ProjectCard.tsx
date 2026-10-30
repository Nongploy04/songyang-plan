'use client';

import React, { useState } from 'react';
import { LocalPlanProject } from '../../domain/types.ts';
import { toThai, formatCurrency } from '../../domain/thaiNumerals.ts';
import { getVillageLabel } from '../../domain/villages.ts';
import { generateOfficialCitation } from '../../domain/citation.ts';
import { IconCopy, IconCheck, IconPrint, IconFileText, IconMapPin } from '../../components/icons/index.tsx';

interface ProjectCardProps {
  project: LocalPlanProject;
  useThaiNumerals: boolean;
  onSelect: (p: LocalPlanProject) => void;
  onPrintDirect: (p: LocalPlanProject) => void;
}

export function ProjectCard({
  project,
  useThaiNumerals,
  onSelect,
  onPrintDirect,
}: ProjectCardProps) {
  const [copied, setCopied] = useState(false);

  const displaySeq = useThaiNumerals ? toThai(project.seq) : project.seq;
  const displayPage = useThaiNumerals ? toThai(project.printedPage) : project.printedPage;
  const displayTotal = formatCurrency(project.totalBudget, useThaiNumerals);

  const handleCopyCitation = (e: React.MouseEvent) => {
    e.stopPropagation();
    const citation = generateOfficialCitation({
      planTitle: project.documentTitle,
      strategyNo: project.strategyNo,
      seq: project.seq,
      printedPage: project.printedPage,
      useThaiNumerals,
    });
    navigator.clipboard.writeText(citation);
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
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold bg-sky-100 dark:bg-sky-900/60 text-sky-800 dark:text-sky-200">
              ลำดับที่ {displaySeq}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              หน้า {displayPage}
            </span>
          </div>
          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
            {project.strategyName.length > 28
              ? project.strategyName.slice(0, 28) + '...'
              : project.strategyName}
          </span>
        </div>

        {/* Project Title */}
        <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors leading-snug">
          {project.name}
        </h3>

        {/* Village Tags */}
        <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400">
          <IconMapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span>
            {project.villages.length === 8
              ? 'ทุกหมู่บ้าน (ม.๑ - ม.๘)'
              : project.villages.map((no) => getVillageLabel(no)).join(', ')}
          </span>
        </div>

        {/* Target summary snippet */}
        <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
          {project.target}
        </p>
      </div>

      {/* Bottom Footer: Budget & Actions */}
      <div className="mt-4 pt-3.5 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between">
        <div>
          <span className="block text-2xs uppercase tracking-wider text-slate-400 font-semibold">
            งบรวม ๕ ปี
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
            title="พิมพ์หน้านี้เป็นเอกสารราชการ ผ.๐๒"
            aria-label="พิมพ์เอกสาร"
          >
            <IconPrint className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
