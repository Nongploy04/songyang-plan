'use client';

import React from 'react';
import { LocalPlanProject } from '../../domain/types.ts';
import { toThai, formatCurrency } from '../../domain/thaiNumerals.ts';

interface PrintOfficialSheetProps {
  project: LocalPlanProject | null;
  projects?: LocalPlanProject[];
  useThaiNumerals?: boolean;
}

export function PrintOfficialSheet({
  project,
  projects,
  useThaiNumerals = true,
}: PrintOfficialSheetProps) {
  const items = project ? [project] : projects || [];

  if (items.length === 0) return null;

  const currentStrategyName = items[0]?.strategyName || 'การพัฒนาด้านโครงสร้างพื้นฐานทุกด้านอย่างสมดุล';
  const currentPrintedPage = items[0]?.printedPage || 62;
  const displayPrintedPage = useThaiNumerals ? toThai(currentPrintedPage) : currentPrintedPage;

  return (
    <div className="print-only hidden p-6 bg-white text-black font-serif">
      {/* Official Top Right Tag */}
      <div className="text-right text-xs font-semibold mb-2">
        แบบ ผ.๐๒
      </div>

      {/* Official Header */}
      <div className="text-center space-y-1 mb-5">
        <h2 className="text-sm font-bold tracking-wide">
          บัญชีรายละเอียดโครงการพัฒนาท้องถิ่น
        </h2>
        <h3 className="text-xs font-semibold">
          แผนพัฒนาท้องถิ่น (พ.ศ.๒๕๗๑-๒๕๗๕)
        </h3>
        <h4 className="text-xs font-medium">
          องค์การบริหารส่วนตำบลสงยาง อำเภอมหาชนะชัย จังหวัดยโสธร
        </h4>
      </div>

      {/* Strategy Category */}
      <div className="text-xs font-bold mb-2">
        ประเด็นการพัฒนาที่ {useThaiNumerals ? toThai(items[0]?.strategyNo) : items[0]?.strategyNo} {currentStrategyName}
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
                <span>{useThaiNumerals ? '๒๕๗๑' : '2571'}</span>
                <span>{useThaiNumerals ? '๒๕๗๒' : '2572'}</span>
                <span>{useThaiNumerals ? '๒๕๗๓' : '2573'}</span>
                <span>{useThaiNumerals ? '๒๕๗๔' : '2574'}</span>
                <span>{useThaiNumerals ? '๒๕๗๕' : '2575'}</span>
              </div>
            </th>
            <th className="border border-black p-1.5 w-28">ผลที่คาด<br/>ว่าจะได้รับ</th>
            <th className="border border-black p-1.5 w-20">หน่วยงานที่<br/>รับผิดชอบ</th>
          </tr>
        </thead>
        <tbody>
          {items.map((p) => {
            const seqStr = useThaiNumerals ? toThai(p.seq) : p.seq;
            const b71 = p.budgets[2571] ? formatCurrency(p.budgets[2571], useThaiNumerals) : '-';
            const b72 = p.budgets[2572] ? formatCurrency(p.budgets[2572], useThaiNumerals) : '-';
            const b73 = p.budgets[2573] ? formatCurrency(p.budgets[2573], useThaiNumerals) : '-';
            const b74 = p.budgets[2574] ? formatCurrency(p.budgets[2574], useThaiNumerals) : '-';
            const b75 = p.budgets[2575] ? formatCurrency(p.budgets[2575], useThaiNumerals) : '-';

            return (
              <tr key={p.id} className="align-top">
                <td className="border border-black p-1.5 text-center font-bold">
                  {seqStr}
                </td>
                <td className="border border-black p-1.5 font-medium">
                  {p.name}
                </td>
                <td className="border border-black p-1.5">
                  {p.objective}
                </td>
                <td className="border border-black p-1.5">
                  {p.target}
                </td>
                <td className="border border-black p-1 text-right text-3xs whitespace-nowrap">{b71}</td>
                <td className="border border-black p-1 text-right text-3xs whitespace-nowrap">{b72}</td>
                <td className="border border-black p-1 text-right text-3xs whitespace-nowrap">{b73}</td>
                <td className="border border-black p-1 text-right text-3xs whitespace-nowrap">{b74}</td>
                <td className="border border-black p-1 text-right text-3xs whitespace-nowrap">{b75}</td>
                <td className="border border-black p-1.5">
                  {p.expectedResult}
                </td>
                <td className="border border-black p-1.5 text-center">
                  {p.agency}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Official Page Number Footer */}
      <div className="mt-4 text-right text-xs font-semibold">
        หน้า {displayPrintedPage}
      </div>
    </div>
  );
}
