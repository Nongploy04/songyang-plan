'use client';

import React, { useState, useEffect } from 'react';
import { type LocalPlanProject, getProjectFiscalYears } from '../../domain/types.ts';
import { toArabic, formatCurrency } from '../../domain/thaiNumerals.ts';
import { getVillageLabel } from '../../domain/villages.ts';
import { generateOfficialCitation } from '../../domain/citation.ts';
import {
  IconX,
  IconPrint,
  IconCopy,
  IconCheck,
  IconFileText,
  IconCalendar,
} from '../../components/icons/index.tsx';

interface ProjectDetailModalProps {
  project: LocalPlanProject | null;
  onClose: () => void;
  onPrint: (p: LocalPlanProject) => void;
}

export function ProjectDetailModal({
  project,
  onClose,
  onPrint,
}: ProjectDetailModalProps) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!project) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [project, onClose]);

  if (!project) return null;

  const displaySeq = toArabic(project.seq);
  const displayPrintedPage = toArabic(project.printedPage);
  const displayPdfPage = toArabic(project.pdfPage);
  const displayTotal = formatCurrency(project.totalBudget, false);
  const cleanName = toArabic(project.name);
  const cleanObjective = toArabic(project.objective);
  const cleanTarget = toArabic(project.target);
  const cleanExpected = toArabic(project.expectedResult);
  const cleanAgency = toArabic(project.agency);
  const cleanDocTitle = toArabic(project.documentTitle);
  const cleanStrategyName = toArabic(project.strategyName);

  const officialCitation = generateOfficialCitation({
    planTitle: cleanDocTitle,
    strategyNo: project.strategyNo,
    seq: project.seq,
    printedPage: displayPrintedPage,
    useThaiNumerals: false,
  });

  const handleCopy = () => {
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
        navigator.clipboard.writeText(officialCitation).catch(() => {});
      }
    } catch {
      // Ignore clipboard error
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const years = getProjectFiscalYears(project);

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-fade-in no-print"
    >
      <div
        className="relative w-full max-w-2xl max-h-[90vh] flex flex-col rounded-3xl bg-white/95 dark:bg-[#0c1222]/95 [backdrop-filter:blur(28px)_saturate(190%)] [-webkit-backdrop-filter:blur(28px)_saturate(190%)] border border-black/[0.08] dark:border-white/[0.12] shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-200 dark:border-slate-800 flex items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-md text-xs font-semibold bg-sky-100 dark:bg-sky-950 text-sky-800 dark:text-sky-300">
                ลำดับที่ {displaySeq}
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                เอกสารหน้า {displayPrintedPage} (PDF หน้า {displayPdfPage})
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-100 leading-snug">
              {cleanName}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              ประเด็นการพัฒนาที่ {project.strategyNo}: {cleanStrategyName}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="ปิดหน้าต่าง"
          >
            <IconX className="w-5 h-5" />
          </button>
        </div>

        {/* Body Scroll */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          {/* Official Citation Box */}
          <div className="bg-sky-50/80 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800/80 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="space-y-0.5">
              <span className="text-2xs uppercase tracking-wider font-bold text-sky-700 dark:text-sky-300">
                คำอ้างอิงราชการ (Official Citation)
              </span>
              <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 font-medium">
                {officialCitation}
              </p>
            </div>
            <button
              type="button"
              onClick={handleCopy}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-sky-300 dark:border-sky-700 text-sky-700 dark:text-sky-300 text-xs font-semibold shadow-xs hover:bg-sky-50 dark:hover:bg-slate-700 transition-colors shrink-0"
            >
              {copied ? (
                <>
                  <IconCheck className="w-4 h-4 text-emerald-600" />
                  <span>คัดลอกแล้ว</span>
                </>
              ) : (
                <>
                  <IconCopy className="w-4 h-4" />
                  <span>คัดลอกข้อความ</span>
                </>
              )}
            </button>
          </div>

          {/* วัตถุประสงค์ & เป้าหมาย */}
          <div className="grid grid-cols-1 gap-4">
            <div className="bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-4 border border-slate-100 dark:border-slate-800">
              <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                <IconFileText className="w-4 h-4 text-sky-600" />
                วัตถุประสงค์
              </h4>
              <p className="text-sm text-slate-800 dark:text-slate-200 leading-relaxed">
                {cleanObjective}
              </p>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-4 border border-slate-100 dark:border-slate-800">
              <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                <IconFileText className="w-4 h-4 text-sky-600" />
                เป้าหมาย (ผลผลิตของโครงการ)
              </h4>
              <p className="text-sm text-slate-800 dark:text-slate-200 leading-relaxed">
                {cleanTarget}
              </p>
            </div>
          </div>

          {/* 5-Year Budget Table */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <IconCalendar className="w-4 h-4 text-sky-600" />
              งบประมาณรายปี (พ.ศ. {years[0]} - {years[years.length - 1]})
            </h4>

            <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700">
              <table className="w-full text-xs text-left border-collapse">
                <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                  <tr>
                    {years.map((y) => (
                      <th key={y} className="p-2.5 text-center font-bold border-b border-slate-200 dark:border-slate-700">
                        ปี {y}
                      </th>
                    ))}
                    <th className="p-2.5 text-center font-bold bg-sky-50 dark:bg-sky-950 text-sky-900 dark:text-sky-200 border-b border-slate-200 dark:border-slate-700">
                      รวม 5 ปี
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                  <tr>
                    {years.map((y) => {
                      const amount = project.budgets[y];
                      return (
                        <td key={y} className="p-2.5 text-center text-slate-800 dark:text-slate-200">
                          {amount && amount > 0 ? formatCurrency(amount, false) : '-'}
                        </td>
                      );
                    })}
                    <td className="p-2.5 text-center font-bold bg-sky-50/50 dark:bg-sky-950/30 text-sky-700 dark:text-sky-300">
                      {displayTotal}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Meta Info: Village, Agency, Expected Result */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
              <span className="text-slate-400 block mb-0.5">สถานที่ / หมู่บ้าน</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                {project.villages.length >= 8
                  ? 'ทุกหมู่บ้านในตำบลสงยาง (ม.1 - ม.8)'
                  : project.villages.map((no) => getVillageLabel(no)).join(', ')}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
              <span className="text-slate-400 block mb-0.5">ผลที่คาดว่าจะได้รับ</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                {cleanExpected}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
              <span className="text-slate-400 block mb-0.5">หน่วยงานรับผิดชอบ</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                {cleanAgency}
              </span>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 border-t border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/80 flex items-center justify-between gap-3">
          <div className="text-xs text-slate-500 dark:text-slate-400">
            {cleanDocTitle}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              ปิดหน้าต่าง
            </button>
            <button
              type="button"
              onClick={() => onPrint(project)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs sm:text-sm font-semibold shadow-xs hover:shadow-md transition-all"
            >
              <IconPrint className="w-4 h-4" />
              <span>พิมพ์หน้านี้ (แบบ ผ.02)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
