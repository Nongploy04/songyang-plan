'use client';

import React, { useState } from 'react';
import { LocalPlanProject } from '../../domain/types.ts';
import { toThai, formatCurrency } from '../../domain/thaiNumerals.ts';
import { getVillageLabel } from '../../domain/villages.ts';
import { generateOfficialCitation } from '../../domain/citation.ts';
import {
  IconX,
  IconPrint,
  IconCopy,
  IconCheck,
  IconMapPin,
  IconFileText,
  IconCalendar,
} from '../../components/icons/index.tsx';

interface ProjectDetailModalProps {
  project: LocalPlanProject | null;
  useThaiNumerals: boolean;
  onClose: () => void;
  onPrint: (p: LocalPlanProject) => void;
}

export function ProjectDetailModal({
  project,
  useThaiNumerals,
  onClose,
  onPrint,
}: ProjectDetailModalProps) {
  const [copied, setCopied] = useState(false);

  if (!project) return null;

  const displaySeq = useThaiNumerals ? toThai(project.seq) : project.seq;
  const displayPrintedPage = useThaiNumerals ? toThai(project.printedPage) : project.printedPage;
  const displayPdfPage = useThaiNumerals ? toThai(project.pdfPage) : project.pdfPage;
  const displayTotal = formatCurrency(project.totalBudget, useThaiNumerals);

  const officialCitation = generateOfficialCitation({
    planTitle: project.documentTitle,
    strategyNo: project.strategyNo,
    seq: project.seq,
    printedPage: project.printedPage,
    useThaiNumerals,
  });

  const handleCopy = () => {
    navigator.clipboard.writeText(officialCitation);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const years = [2571, 2572, 2573, 2574, 2575];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-fade-in no-print">
      <div
        className="relative w-full max-w-2xl max-h-[90vh] flex flex-col rounded-3xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl border border-black/10 dark:border-white/15 shadow-2xl overflow-hidden"
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
              {project.name}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {project.strategyName}
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
                {project.objective}
              </p>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-4 border border-slate-100 dark:border-slate-800">
              <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                <IconFileText className="w-4 h-4 text-sky-600" />
                เป้าหมาย (ผลผลิตของโครงการ)
              </h4>
              <p className="text-sm text-slate-800 dark:text-slate-200 leading-relaxed font-serif">
                {project.target}
              </p>
            </div>
          </div>

          {/* 5-Year Budget Table */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <IconCalendar className="w-4 h-4 text-sky-600" />
              งบประมาณรายปี (พ.ศ. ๒๕๗๑ - ๒๕๗๕)
            </h4>

            <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700">
              <table className="w-full text-xs text-left border-collapse">
                <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                  <tr>
                    {years.map((y) => (
                      <th key={y} className="p-2.5 text-center font-bold border-b border-slate-200 dark:border-slate-700">
                        {useThaiNumerals ? toThai(y) : y}
                      </th>
                    ))}
                    <th className="p-2.5 text-center font-bold bg-sky-50 dark:bg-sky-950 text-sky-900 dark:text-sky-200 border-b border-slate-200 dark:border-slate-700">
                      รวม ๕ ปี
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                  <tr>
                    {years.map((y) => {
                      const amount = project.budgets[y as keyof typeof project.budgets];
                      return (
                        <td key={y} className="p-2.5 text-center text-slate-800 dark:text-slate-200">
                          {formatCurrency(amount, useThaiNumerals)}
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
              <span className="text-slate-400 block mb-0.5">สถานที่ / หมู่บ้าน</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                {project.villages.length === 8
                  ? 'ทุกหมู่บ้านในตำบลสงยาง'
                  : project.villages.map((no) => getVillageLabel(no)).join(', ')}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
              <span className="text-slate-400 block mb-0.5">หน่วยงานรับผิดชอบ</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                {project.agency}
              </span>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 border-t border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/80 flex items-center justify-between gap-3">
          <div className="text-xs text-slate-500 dark:text-slate-400">
            {project.documentTitle}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onPrint(project)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs sm:text-sm font-semibold shadow-xs hover:shadow-md transition-all"
            >
              <IconPrint className="w-4 h-4" />
              <span>พิมพ์หน้านี้ (ผ.๐๒)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
