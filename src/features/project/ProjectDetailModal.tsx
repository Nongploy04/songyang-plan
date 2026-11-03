'use client';

import React, { useState, useEffect } from 'react';
import { type LocalPlanProject, getProjectFiscalYears } from '../../domain/types.ts';
import { getDocument } from '../../domain/documents.ts';
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
  IconAlertTriangle,
} from '../../components/icons/index.tsx';

export type PrintPackMode = 'table_only' | 'full_official_pack';

interface ProjectDetailModalProps {
  project: LocalPlanProject | null;
  onClose: () => void;
  onPrint: (p: LocalPlanProject, mode: PrintPackMode) => void;
}

export function ProjectDetailModal({
  project,
  onClose,
  onPrint,
}: ProjectDetailModalProps) {
  const [copied, setCopied] = useState(false);
  const [printMode, setPrintMode] = useState<PrintPackMode>('table_only');
  const [reportOpen, setReportOpen] = useState(false);
  const [reportNote, setReportNote] = useState('');
  const [reportCopied, setReportCopied] = useState(false);

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

  const docMeta = getDocument(project.documentId);
  const lineage = project.lineage;
  const allScanPages = lineage?.officialScanPages || [];
  const tableScanPages = allScanPages.filter(
    (pg) => pg.role === 'table_old' || pg.role === 'table_current'
  );
  const activePreviewPages =
    printMode === 'full_official_pack' ? allScanPages : tableScanPages.length > 0 ? tableScanPages : allScanPages;

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

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-fade-in no-print"
    >
      <div
        className="relative w-full max-w-4xl max-h-[92vh] flex flex-col rounded-3xl bg-white/95 dark:bg-[#0c1222]/95 [backdrop-filter:blur(28px)_saturate(190%)] [-webkit-backdrop-filter:blur(28px)_saturate(190%)] border border-black/[0.08] dark:border-white/[0.12] shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-200 dark:border-slate-800 flex items-start justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-md text-xs font-bold bg-sky-600 text-white">
                {lineage?.statusLabel || cleanDocTitle}
              </span>
              <span className="px-2.5 py-0.5 rounded-md text-xs font-semibold bg-sky-100 dark:bg-sky-950 text-sky-800 dark:text-sky-300">
                ลำดับที่ {displaySeq}
              </span>
              <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                เอกสารหน้า {displayPrintedPage} (ไฟล์ PDF หน้า {displayPdfPage})
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
          {/* SECTION 1: Project Lineage & Revision History (อยู่เล่มไหน / ผ่านการแก้ไขหรือไม่ / ล่าสุดอยู่เล่มไหน) */}
          {lineage && (
            <div className="rounded-2xl border-2 border-sky-200 dark:border-sky-800/80 bg-sky-50/50 dark:bg-sky-950/30 p-4 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <span className="text-2xs uppercase tracking-wider font-bold text-sky-700 dark:text-sky-300 block">
                    สถานะและประวัติการปรับปรุงแผนพัฒนาท้องถิ่น (Project Lineage)
                  </span>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                    เล่มที่ใช้อ้างอิงล่าสุด: {lineage.latestDocumentTitle} ({lineage.latestPageRef})
                  </h3>
                </div>
                <span
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
                    lineage.hasBeenModified
                      ? 'bg-amber-100 dark:bg-amber-900/70 text-amber-800 dark:text-amber-200'
                      : 'bg-emerald-100 dark:bg-emerald-900/70 text-emerald-800 dark:text-emerald-200'
                  }`}
                >
                  {lineage.hasBeenModified
                    ? 'ผ่านการแก้ไข / เปลี่ยนแปลง / เพิ่มเติม'
                    : 'โครงการตามแผนหลัก (ไม่มีการแก้ไขข้อความ)'}
                </span>
              </div>

              {/* Timeline Steps */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {lineage.steps.map((step) => (
                  <div
                    key={step.stepNo}
                    className={`p-3 rounded-xl border text-xs space-y-1 ${
                      step.isCurrentDocument
                        ? 'bg-white dark:bg-slate-800 border-sky-500 shadow-xs'
                        : 'bg-white/70 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-bold text-sky-700 dark:text-sky-300">
                        ขั้นที่ {step.stepNo}: {step.actionLabel}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-700 font-semibold text-slate-700 dark:text-slate-200">
                        {step.pageRef}
                      </span>
                    </div>
                    <div className="font-semibold text-slate-800 dark:text-slate-100">
                      {step.documentTitle}
                    </div>
                    <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                      {step.summary}
                    </p>
                    {step.reason && (
                      <p className="text-amber-700 dark:text-amber-300 font-medium pt-0.5">
                        เหตุผล: {step.reason}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SECTION 2: Real Scanned Document Preview & Print Selector */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 p-4 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                  <IconPrint className="w-4 h-4 text-sky-600" />
                  <span>เอกสารสแกนต้นฉบับจริงสำหรับสั่งพิมพ์ (Original PDF Scan)</span>
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  พิมพ์ภาพหน้าสแกนจริงจากเล่มแผนของ อบต.สงยาง ลงกระดาษ A4 ได้ทันทีโดยไม่เพี้ยนจากต้นฉบับ
                </p>
              </div>

              {docMeta?.officialPdfUrl && (
                <a
                  href={docMeta.officialPdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 transition-colors"
                >
                  <IconFileText className="w-3.5 h-3.5 text-sky-600" />
                  <span>เปิดไฟล์ PDF เล่มเต็ม ({docMeta.pageCount} หน้า)</span>
                </a>
              )}
            </div>

            {/* Print Pack Mode Selector */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => setPrintMode('table_only')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                  printMode === 'table_only'
                    ? 'bg-sky-600 text-white border-sky-600 shadow-xs'
                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                }`}
              >
                1. พิมพ์เฉพาะหน้าตารางโครงการจริง ({tableScanPages.length || 1} แผ่น)
              </button>
              <button
                type="button"
                onClick={() => setPrintMode('full_official_pack')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                  printMode === 'full_official_pack'
                    ? 'bg-sky-600 text-white border-sky-600 shadow-xs'
                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                }`}
              >
                2. พิมพ์ชุดแนบฎีกาครบชุด: หน้าปก + ประกาศนายก อบต. + หน้าโครงการ ({allScanPages.length} แผ่น)
              </button>
            </div>

            {/* Scanned Page Image Previews */}
            <div className="grid grid-cols-1 gap-3 pt-1">
              {activePreviewPages.map((pg) => (
                <div
                  key={`${pg.role}-${pg.pageNumber}`}
                  className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-3 space-y-2"
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
                  <div className="overflow-hidden rounded-lg border border-slate-200 dark:border-slate-800 bg-white flex justify-center">
                    <img
                      src={pg.imageUrl}
                      alt={pg.label}
                      loading="lazy"
                      className="max-h-[420px] w-auto object-contain"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Official Citation Box */}
          <div className="bg-sky-50/80 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800/80 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="space-y-0.5">
              <span className="text-2xs uppercase tracking-wider font-bold text-sky-700 dark:text-sky-300">
                คำอ้างอิงราชการสำหรับใส่บันทึกข้อความ (Official Citation)
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

          {/* SECTION 4: Report Data Discrepancy Box */}
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
        <div className="p-4 sm:p-5 border-t border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/80 flex flex-wrap items-center justify-between gap-3">
          <div className="text-xs text-slate-500 dark:text-slate-400">
            เล่มปัจจุบัน: <strong className="text-slate-800 dark:text-slate-200">{cleanDocTitle}</strong>
          </div>

          <div className="flex items-center gap-2">
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
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              ปิดหน้าต่าง
            </button>
            <button
              type="button"
              onClick={() => onPrint(project, printMode)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs sm:text-sm font-semibold shadow-xs hover:shadow-md transition-all"
            >
              <IconPrint className="w-4 h-4" />
              <span>
                {printMode === 'full_official_pack'
                  ? `สั่งปริ้นชุดแนบฎีกาครบชุด (${allScanPages.length} แผ่น)`
                  : `สั่งปริ้นหน้าเอกสารจริง (${tableScanPages.length || 1} แผ่น)`}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
