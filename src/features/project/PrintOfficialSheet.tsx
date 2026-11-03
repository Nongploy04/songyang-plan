'use client';

import React from 'react';
import { type LocalPlanProject, getProjectFiscalYears } from '../../domain/types.ts';
import { toArabic, formatCurrency } from '../../domain/thaiNumerals.ts';

interface PrintOfficialSheetProps {
  project: LocalPlanProject | null;
  projects?: LocalPlanProject[];
}

export function PrintOfficialSheet({
  project,
  projects,
}: PrintOfficialSheetProps) {
  const items = project ? [project] : projects || [];

  if (items.length === 0) return null;

  const firstItem = items[0];
  const currentStrategyName = toArabic(firstItem?.strategyName || 'การพัฒนาด้านโครงสร้างพื้นฐานทุกด้านอย่างสมดุล');
  const currentDocumentTitle = toArabic(firstItem?.documentTitle || 'แผนพัฒนาท้องถิ่น (พ.ศ. 2571 - 2575)');
  const currentPrintedPage = toArabic(firstItem?.printedPage || 62);
  const fiscalYears = getProjectFiscalYears(firstItem);

  return (
    <div className="print-only hidden p-6 bg-white text-black font-serif">
      {/* Official Top Right Tag */}
      <div className="text-right text-xs font-semibold mb-2">
        แบบ ผ.02
      </div>

      {/* Official Header */}
      <div className="text-center space-y-1 mb-5">
        <h2 className="text-sm font-bold tracking-wide">
          บัญชีรายละเอียดโครงการพัฒนาท้องถิ่น
        </h2>
        <h3 className="text-xs font-semibold">
          {currentDocumentTitle}
        </h3>
        <h4 className="text-xs font-medium">
          องค์การบริหารส่วนตำบลสงยาง อำเภอมหาชนะชัย จังหวัดยโสธร
        </h4>
      </div>

      {/* Strategy Category */}
      <div className="text-xs font-bold mb-2">
        ประเด็นการพัฒนาที่ {firstItem?.strategyNo} {currentStrategyName}
      </div>

      {/* Official Pho 02 Table */}
      <table className="print-table w-full border-collapse border border-black text-2xs leading-normal">
        <thead>
          <tr className="bg-slate-100 text-center font-bold">
            <th className="border border-black p-1.5 w-8">ที่</th>
            <th className="border border-black p-1.5 w-36">โครงการ</th>
            <th className="border border-black p-1.5 w-32">วัตถุประสงค์</th>
            <th className="border border-black p-1.5 w-44">เป้าหมาย<br/>(ผลผลิตของโครงการ)</th>
            <th className="border border-black p-1" colSpan={5}>
              งบประมาณ (บาท)
              <div className="grid grid-cols-5 border-t border-black mt-1 pt-1 font-semibold text-3xs">
                {fiscalYears.map((yr) => (
                  <span key={yr}>{yr}</span>
                ))}
              </div>
            </th>
            <th className="border border-black p-1.5 w-28">ผลที่คาด<br/>ว่าจะได้รับ</th>
            <th className="border border-black p-1.5 w-20">หน่วยงานที่<br/>รับผิดชอบ</th>
          </tr>
        </thead>
        <tbody>
          {items.map((p) => {
            const yrs = getProjectFiscalYears(p);
            return (
              <tr key={p.id} className="align-top">
                <td className="border border-black p-1.5 text-center font-bold">
                  {toArabic(p.seq)}
                </td>
                <td className="border border-black p-1.5 font-medium">
                  {toArabic(p.name)}
                </td>
                <td className="border border-black p-1.5">
                  {toArabic(p.objective)}
                </td>
                <td className="border border-black p-1.5">
                  {toArabic(p.target)}
                </td>
                {yrs.map((yr) => {
                  const val = p.budgets[yr];
                  return (
                    <td key={yr} className="border border-black p-1 text-right text-3xs whitespace-nowrap">
                      {val && val > 0 ? formatCurrency(val, false) : '-'}
                    </td>
                  );
                })}
                <td className="border border-black p-1.5">
                  {toArabic(p.expectedResult)}
                </td>
                <td className="border border-black p-1.5 text-center">
                  {toArabic(p.agency)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Official Page Number Footer */}
      <div className="mt-4 text-right text-xs font-semibold">
        หน้า {currentPrintedPage}
      </div>
    </div>
  );
}
