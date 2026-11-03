'use client';

import React, { useState, useEffect } from 'react';
import { type LocalPlanProject, getProjectFiscalYears } from '../../domain/types.ts';
import { getDocument } from '../../domain/documents.ts';
import { WORK_CATEGORY_LABELS, type WorkCategoryKey } from '../../domain/workCategories.ts';
import { toArabic, formatCurrency } from '../../domain/thaiNumerals.ts';
import { getProjectDisplayBudget } from '../../domain/budgetUtils.ts';
import { getVillageLabel } from '../../domain/villages.ts';
import { generateOfficialCitation } from '../../domain/citation.ts';
import {
  IconX,
  IconPrint,
  IconCopy,
  IconCheck,
  IconFileText,
  IconCalendar,
  IconAlertTriangle,
} from '../../components/icons/index.tsx';

export type PrintPackMode = 'table_only' | 'full_official_pack';

interface ProjectDetailModalProps {
  project: LocalPlanProject | null;
  selectedYear?: number | null;
  onClose: () => void;
  onPrint: (p: LocalPlanProject, mode: PrintPackMode) => void;
}

export function ProjectDetailModal({
  project,
  selectedYear,
  onClose,
  onPrint,
}: ProjectDetailModalProps) {
  const [activeTab, setActiveTab] = useState<'details' | 'scan'>('details');
  const [copied, setCopied] = useState(false);
  const [printMode, setPrintMode] = useState<PrintPackMode>('table_only');
  const [reportOpen, setReportOpen] = useState(false);
  const [reportNote, setReportNote] = useState('');
  const [reportCopied, setReportCopied] = useState(false);

  // Reset tab to 'details' whenever active project changes
  useEffect(() => {
    setActiveTab('details');
    setReportOpen(false);
    setReportNote('');
  }, [project?.id]);

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
  const cleanName = toArabic(project.name);
  const cleanObjective = toArabic(project.objective);
  const cleanTarget = toArabic(project.target);
  const cleanExpected = toArabic(project.expectedResult);
  const cleanAgency = toArabic(project.agency);
  const cleanDocTitle = toArabic(project.documentTitle);
  const cleanStrategyName = toArabic(project.strategyName);

  const budgetDisplay = getProjectDisplayBudget(project, selectedYear);
  const docMeta = getDocument(project.documentId);
  const lineage = project.lineage;
  const allScanPages = lineage?.officialScanPages || [];
  const tableScanPages = allScanPages.filter(
    (pg) => pg.role === 'table_old' || pg.role === 'table_current'
  );
  const activePreviewPages =
    printMode === 'full_official_pack'
      ? allScanPages
      : tableScanPages.length > 0
      ? tableScanPages
      : allScanPages;

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

  const handleCopyReport = () => {
    const textToCopy = `[แจ้งข้อมูลคลาดเคลื่อน แผนพัฒนาท้องถิ่น อบต.สงยาง]\nรหัสโครงการ: ${project.id}\nชื่อโครงการ: ${cleanName}\nเอกสารอ้างอิง: ${cleanDocTitle} (ลำดับที่ ${displaySeq} หน้า ${displayPrintedPage})\nข้อความที่ต้องการแจ้ง: ${reportNote.trim() || 'ขอให้เจ้าหน้าที่ตรวจสอบความถูกต้องเทียบกับเอกสารจริง'}`;
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
        navigator.clipboard.writeText(textToCopy).catch(() => {});
      }
    } catch {
      // Ignore clipboard error
    }
    setReportCopied(true);
    setTimeout(() => setReportCopied(false), 2500);
  };

  const years = getProjectFiscalYears(project);

  const villageLabels =
    project.villages.length >= 8
      ? 'ทุกหมู่บ้านในตำบลสงยาง (ม.1 - ม.8)'
      : project.villages.map((no) => getVillageLabel(no)).join(', ');

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-md animate-fade-in no-print"
    >
      <div
        className="relative w-full max-w-4xl max-h-[92vh] flex flex-col rounded-3xl bg-white/95 dark:bg-[#0c1222]/95 [backdrop-filter:blur(28px)_saturate(190%)] [-webkit-backdrop-filter:blur(28px)_saturate(190%)] border border-black/[0.08] dark:border-white/[0.12] shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* =====================================================================
            1. MODAL HEADER (Clean, Informative, Non-redundant)
        ===================================================================== */}
        <div className="p-5 sm:p-6 border-b border-slate-200 dark:border-slate-800 flex items-start justify-between gap-4 bg-slate-50/50 dark:bg-slate-900/30">
          <div className="space-y-2 flex-1 min-w-0">
            {/* Top Badge Row */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-lg text-xs font-bold bg-sky-600 text-white shadow-xs">
                {lineage?.statusLabel || cleanDocTitle}
              </span>
              <span className="px-2.5 py-0.5 rounded-lg text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700">
                {WORK_CATEGORY_LABELS[project.workCategory as WorkCategoryKey] || project.workCategory}
              </span>
              <span className="px-2.5 py-0.5 rounded-lg text-xs font-bold bg-sky-100 dark:bg-sky-950 text-sky-800 dark:text-sky-300">
                ลำดับที่ #{displaySeq}
              </span>
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                หน้าเอกสาร {displayPrintedPage} (PDF หน้า {displayPdfPage})
              </span>
            </div>

            {/* Project Title */}
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-100 leading-snug">
              {cleanName}
            </h2>

            {/* Strategy */}
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              ประเด็นการพัฒนาที่ {project.strategyNo}: {cleanStrategyName}
            </p>
          </div>

          {/* Quick Actions & Close Button */}
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={handleCopy}
              title={copied ? 'คัดลอกคำอ้างอิงแล้ว' : 'คัดลอกคำอ้างอิงราชการสำหรับใส่บันทึกข้อความ'}
              aria-label="คัดลอกคำอ้างอิงราชการ"
              className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer ${
                copied
                  ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-300 dark:border-emerald-700 text-emerald-700 dark:text-emerald-300'
                  : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:text-sky-600 hover:border-sky-300 dark:hover:border-sky-600'
              }`}
            >
              {copied ? (
                <>
                  <IconCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>คัดลอกแล้ว</span>
                </>
              ) : (
                <>
                  <IconCopy className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">คัดลอกคำอ้างอิง</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              aria-label="ปิดหน้าต่าง"
            >
              <IconX className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* =====================================================================
            2. IN-MODAL TAB NAVIGATION (Prevents Nested Modal Hell!)
        ===================================================================== */}
        <div className="px-5 sm:px-6 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center gap-4 text-xs font-bold">
          <button
            type="button"
            onClick={() => setActiveTab('details')}
            className={`py-3 border-b-2 flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'details'
                ? 'border-sky-600 text-sky-600 dark:text-sky-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <IconFileText className="w-4 h-4" />
            <span>รายละเอียดโครงการ</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('scan')}
            className={`py-3 border-b-2 flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'scan'
                ? 'border-sky-600 text-sky-600 dark:text-sky-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <IconPrint className="w-4 h-4" />
            <span>เอกสารสแกนต้นฉบับจริง (สั่งพิมพ์ A4)</span>
            <span className="px-1.5 py-0.2 rounded-md bg-sky-100 dark:bg-sky-950 text-sky-800 dark:text-sky-300 text-[10px]">
              {tableScanPages.length || 1} หน้า
            </span>
          </button>
        </div>

        {/* =====================================================================
            3. BODY SCROLL (Progressive Disclosure)
        ===================================================================== */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5 custom-scroll">
          {activeTab === 'details' ? (
            /* TAB 1: DETAILS VIEW */
            <>
              {/* Objectives & Target (2 Clean Columns) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-4 border border-slate-100 dark:border-slate-800 space-y-1.5">
                  <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <IconFileText className="w-4 h-4 text-sky-600" />
                    <span>วัตถุประสงค์</span>
                  </h4>
                  <p className="text-sm text-slate-800 dark:text-slate-200 leading-relaxed font-medium">
                    {cleanObjective}
                  </p>
                </div>

                <div className="bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-4 border border-slate-100 dark:border-slate-800 space-y-1.5">
                  <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <IconFileText className="w-4 h-4 text-sky-600" />
                    <span>เป้าหมาย (ผลผลิตของโครงการ)</span>
                  </h4>
                  <p className="text-sm text-slate-800 dark:text-slate-200 leading-relaxed font-medium">
                    {cleanTarget}
                  </p>
                </div>
              </div>

              {/* BUDGET SECTION: CORRECTED NON-ADDITIVE ANNUAL TABLE (No 5-Year Sum!) */}
              <div className="bg-sky-50/40 dark:bg-sky-950/20 border border-sky-100 dark:border-sky-900/60 rounded-2xl p-4 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                      <IconCalendar className="w-4 h-4 text-sky-600" />
                      <span>กรอบวงเงินงบประมาณรายปี (พ.ศ. {years[0]} - {years[years.length - 1]})</span>
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      * ตัวเลขในแต่ละปีแสดงกรอบวงเงินงบประมาณหากดำเนินโครงการในปีนั้นๆ (มิใช่นำ 5 ปีมารวมกัน)
                    </p>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-bold block">
                      {budgetDisplay.sublabel}
                    </span>
                    <span className="text-sm sm:text-base font-extrabold text-sky-700 dark:text-sky-300 tabular-nums">
                      {budgetDisplay.text} บาท
                    </span>
                  </div>
                </div>

                {/* 5-Year Columns (NO SUM 5 YEARS COLUMN!) */}
                <div className="overflow-x-auto rounded-xl border border-sky-200/80 dark:border-sky-800/80 bg-white dark:bg-slate-900">
                  <table className="w-full text-xs text-center border-collapse">
                    <thead className="bg-slate-100/80 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold border-b border-sky-200/80 dark:border-sky-800/80">
                      <tr>
                        {years.map((y) => {
                          const isYearMatch = selectedYear === y;
                          return (
                            <th
                              key={y}
                              className={`p-2.5 ${
                                isYearMatch
                                  ? 'bg-sky-100 dark:bg-sky-900 text-sky-900 dark:text-sky-100'
                                  : ''
                              }`}
                            >
                              ปี {y}
                            </th>
                          );
                        })}
                      </tr>
                    </thead>
                    <tbody className="font-bold text-slate-800 dark:text-slate-200 divide-x divide-slate-100 dark:divide-slate-800">
                      <tr>
                        {years.map((y) => {
                          const amount = project.budgets[y];
                          const isYearMatch = selectedYear === y;
                          return (
                            <td
                              key={y}
                              className={`p-2.5 tabular-nums ${
                                isYearMatch
                                  ? 'bg-sky-50 dark:bg-sky-950/80 text-sky-700 dark:text-sky-300 font-extrabold'
                                  : ''
                              }`}
                            >
                              {amount && amount > 0 ? (
                                `${formatCurrency(amount, false)} ฿`
                              ) : (
                                <span className="text-slate-300 dark:text-slate-600 font-normal">-</span>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Execution Details (3 Clean Cards) */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                  <span className="text-slate-400 dark:text-slate-500 block mb-0.5 font-medium">สถานที่ / หมู่บ้าน</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    {villageLabels}
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                  <span className="text-slate-400 dark:text-slate-500 block mb-0.5 font-medium">ผลที่คาดว่าจะได้รับ</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    {cleanExpected}
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                  <span className="text-slate-400 dark:text-slate-500 block mb-0.5 font-medium">หน่วยงานรับผิดชอบ</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    {cleanAgency}
                  </span>
                </div>
              </div>

              {/* Revision History (Rendered ONLY if modified to avoid clutter) */}
              {lineage?.hasBeenModified && (
                <div className="rounded-2xl border border-amber-300/80 dark:border-amber-800/80 bg-amber-50/40 dark:bg-amber-950/20 p-4 space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-amber-900 dark:text-amber-200">
                      ประวัติการแก้ไข / เปลี่ยนแปลงแผนพัฒนาท้องถิ่น
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-200 dark:bg-amber-900 text-amber-900 dark:text-amber-100">
                      มีการปรับปรุงข้อความ
                    </span>
                  </div>
                  <div className="space-y-1.5 text-xs">
                    {lineage.steps.map((step) => (
                      <div
                        key={step.stepNo}
                        className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2"
                      >
                        <div className="min-w-0">
                          <span className="font-bold text-sky-700 dark:text-sky-300">
                            ขั้นที่ {step.stepNo}: {step.actionLabel}
                          </span>
                          <span className="text-slate-500 dark:text-slate-400 ml-2">
                            ({step.documentTitle})
                          </span>
                        </div>
                        <span className="shrink-0 px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                          {step.pageRef}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            /* TAB 2: ORIGINAL SCAN VIEW */
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800/80">
                <div>
                  <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                    เอกสารสแกนต้นฉบับจริงสำหรับสั่งพิมพ์ (Original PDF Scan)
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    พิมพ์ภาพหน้าสแกนจริงจากเล่มแผนของ อบต.สงยาง ลงกระดาษ A4 ได้ทันทีโดยไม่เพี้ยนจากต้นฉบับ
                  </p>
                </div>

                {docMeta?.officialPdfUrl && (
                  <a
                    href={docMeta.officialPdfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                  >
                    <IconFileText className="w-3.5 h-3.5 text-sky-600" />
                    <span>เปิดไฟล์ PDF เล่มเต็ม ({docMeta.pageCount} หน้า)</span>
                  </a>
                )}
              </div>

              {/* Print Pack Mode Selector */}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPrintMode('table_only')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                    printMode === 'table_only'
                      ? 'bg-sky-600 text-white border-sky-600 shadow-xs'
                      : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-slate-400'
                  }`}
                >
                  1. พิมพ์เฉพาะหน้าตารางโครงการจริง ({tableScanPages.length || 1} แผ่น)
                </button>

                {allScanPages.length > tableScanPages.length && (
                  <button
                    type="button"
                    onClick={() => setPrintMode('full_official_pack')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                      printMode === 'full_official_pack'
                        ? 'bg-sky-600 text-white border-sky-600 shadow-xs'
                        : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-slate-400'
                    }`}
                  >
                    2. พิมพ์ชุดแนบฎีกาครบชุด: หน้าปก + ประกาศนายก อบต. + หน้าโครงการ ({allScanPages.length} แผ่น)
                  </button>
                )}
              </div>

              {/* Scanned Pages Preview List */}
              <div className="grid grid-cols-1 gap-4 pt-1">
                {activePreviewPages.map((pg) => (
                  <div
                    key={`${pg.role}-${pg.pageNumber}`}
                    className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-3.5 space-y-2"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-800 dark:text-slate-200">
                        {pg.label}
                      </span>
                      <a
                        href={pg.imageUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sky-600 dark:text-sky-400 hover:underline font-semibold"
                      >
                        เปิดภาพขนาดเต็มในแท็บใหม่
                      </a>
                    </div>
                    <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 bg-white flex justify-center p-2">
                      <img
                        src={pg.imageUrl}
                        alt={pg.label}
                        loading="lazy"
                        className="max-h-[500px] w-auto object-contain"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* =====================================================================
              COLLAPSIBLE REPORT DATA DISCREPANCY BOX
          ===================================================================== */}
          {reportOpen && (
            <div className="rounded-2xl border border-amber-300 dark:border-amber-800 bg-amber-50/70 dark:bg-amber-950/40 p-4 space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2 text-xs font-bold text-amber-900 dark:text-amber-200">
                  <IconAlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                  <span>แจ้งข้อมูลคลาดเคลื่อน / เสนอแนะแก้ไขสำหรับโครงการนี้</span>
                </div>
                <button
                  type="button"
                  onClick={() => setReportOpen(false)}
                  className="w-6 h-6 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                >
                  <IconX className="w-4 h-4" />
                </button>
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-400">
                หากพบว่าตัวสะกดจากเครื่องสแกนขาวดำของ อบต. เลือนราง หรือตัวเลขงบประมาณไม่ชัดเจน สามารถพิมพ์ระบุจุดที่ต้องการให้ตรวจสอบ และกดคัดลอกข้อความเพื่อส่งต่อให้เจ้าหน้าที่ อบต. ได้ทันที
              </p>
              <textarea
                value={reportNote}
                onChange={(e) => setReportNote(e.target.value)}
                placeholder="ระบุจุดที่ต้องการแจ้ง เช่น ตัวสะกดชื่อถนน, วรรณยุกต์ หรือตัวเลขงบประมาณ..."
                rows={2}
                className="w-full p-2.5 rounded-xl border border-amber-200 dark:border-amber-900/60 bg-white dark:bg-slate-900 text-xs text-slate-800 dark:text-slate-200 outline-none focus:border-amber-500"
              />
              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setReportOpen(false)}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  ยกเลิก
                </button>
                <button
                  type="button"
                  onClick={handleCopyReport}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
                >
                  {reportCopied ? (
                    <>
                      <IconCheck className="w-3.5 h-3.5" />
                      <span>คัดลอกข้อความสำเร็จ!</span>
                    </>
                  ) : (
                    <>
                      <IconCopy className="w-3.5 h-3.5" />
                      <span>คัดลอกข้อความแจ้งเรื่อง</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* =====================================================================
            4. MODAL FOOTER (Simplified, Essential Actions Only)
        ===================================================================== */}
        <div className="p-4 sm:p-5 border-t border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/80 flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => setReportOpen((prev) => !prev)}
            title="แจ้งข้อมูลคลาดเคลื่อนสำหรับโครงการนี้"
            className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-semibold transition-colors cursor-pointer ${
              reportOpen
                ? 'bg-amber-100 text-amber-900 border-amber-400 dark:bg-amber-950 dark:text-amber-200'
                : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <IconAlertTriangle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            <span>แจ้งข้อมูลคลาดเคลื่อน</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              ปิดหน้าต่าง
            </button>

            {activeTab === 'details' ? (
              <button
                type="button"
                onClick={() => setActiveTab('scan')}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs sm:text-sm font-semibold shadow-xs hover:shadow-md transition-all cursor-pointer"
              >
                <IconPrint className="w-4 h-4" />
                <span>สั่งพิมพ์ / ดูเอกสารสแกนจริง</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => onPrint(project, printMode)}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs sm:text-sm font-semibold shadow-xs hover:shadow-md transition-all cursor-pointer"
              >
                <IconPrint className="w-4 h-4" />
                <span>
                  {printMode === 'full_official_pack'
                    ? `สั่งพิมพ์ชุดแนบฎีกา (${allScanPages.length} แผ่น)`
                    : `สั่งพิมพ์หน้าเอกสารจริง (${tableScanPages.length || 1} แผ่น)`}
                </span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
