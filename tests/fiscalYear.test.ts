import { describe, it, expect } from 'vitest';
import {
  getCurrentThaiFiscalYear,
  getThaiDateParts,
  resolveProjectFiscalBudget,
} from '../src/domain/fiscalYear.ts';
import type { LocalPlanProject } from '../src/domain/types.ts';

describe('Thai Fiscal Year Calculation (Asia/Bangkok UTC+7)', () => {
  it('correctly calculates fiscal year for November 2026 as 2570', () => {
    // 2026-11-09 in Thailand
    const date = new Date('2026-11-09T09:30:00Z'); // 16:30 Bangkok time
    expect(getCurrentThaiFiscalYear(date)).toBe(2570);
  });

  it('correctly shifts to new fiscal year on October 1st at 00:00:00 UTC+7', () => {
    // Exactly 2026-10-01 00:00:01 in Bangkok = 2026-09-30 17:00:01 UTC
    const oct1 = new Date('2026-09-30T17:00:01.000Z');
    expect(getCurrentThaiFiscalYear(oct1)).toBe(2570);

    // Exactly 2026-09-30 23:59:50 in Bangkok = 2026-09-30 16:59:50 UTC
    const sep30 = new Date('2026-09-30T16:59:50.000Z');
    expect(getCurrentThaiFiscalYear(sep30)).toBe(2569);
  });

  it('correctly handles server running in UTC without 7-hour timezone leakage', () => {
    // In UTC, this is September 30 18:00 UTC, but in Thailand it is October 1 01:00 AM!
    // A naive new Date().getMonth() in UTC would see month 8 (Sep) and fail.
    // getThaiDateParts MUST see month 10 (Oct)!
    const dateCrossBorder = new Date('2026-09-30T18:00:00.000Z');
    const parts = getThaiDateParts(dateCrossBorder);
    expect(parts.month).toBe(10);
    expect(parts.day).toBe(1);
    expect(parts.yearCE).toBe(2026);
    expect(getCurrentThaiFiscalYear(dateCrossBorder)).toBe(2570);
  });

  it('correctly handles mid-year January to September as current Buddhist year', () => {
    // 2027-01-15 -> Fiscal year 2570
    const jan2027 = new Date('2027-01-15T05:00:00.000Z');
    expect(getCurrentThaiFiscalYear(jan2027)).toBe(2570);

    // 2027-09-30 -> Still fiscal year 2570
    const sep2027 = new Date('2027-09-30T05:00:00.000Z');
    expect(getCurrentThaiFiscalYear(sep2027)).toBe(2570);

    // 2027-10-01 -> Fiscal year 2571!
    const oct2027 = new Date('2027-10-01T05:00:00.000Z');
    expect(getCurrentThaiFiscalYear(oct2027)).toBe(2571);
  });
});

describe('Dynamic Project Fiscal Budget Resolution', () => {
  const sample2571_2575Project: LocalPlanProject = {
    id: 'proj_193',
    seq: 193,
    documentId: 'plan_2571_2575_main',
    documentTitle: 'แผนพัฒนาท้องถิ่น (พ.ศ. 2571 - 2575)',
    name: 'ซ่อมสร้างเสริมผิวจราจรแอสฟัลท์ติกคอนกรีต',
    villages: [1],
    strategyNo: 1,
    strategyName: 'โครงสร้างพื้นฐาน',
    workCategory: 'road_asphalt',
    pdfPage: 150,
    printedPage: 145,
    budgets: {
      2571: 803296,
      2572: 811329,
      2573: 819442,
      2574: 827636,
      2575: 835913,
    },
    objective: '',
    target: '',
    expectedResult: '',
    agency: '',
  };

  it('resolves single value for auto current fiscal year (2570) falling back cleanly to plan start year 2571', () => {
    // Current year is 2570. Project is in 2571-2575 plan.
    const res = resolveProjectFiscalBudget(sample2571_2575Project, 'current', 2570);
    expect(res.effectiveYear).toBe(2571);
    expect(res.displayAmount).toBe(803296);
    expect(res.displayText).toBe('803,296');
    expect(res.sublabel).toBe('งบปี 2571');
    expect(res.isRange).toBe(false);
    expect(res.isYearSpecific).toBe(true);
  });

  it('resolves single value when user manually selects year 2573', () => {
    const res = resolveProjectFiscalBudget(sample2571_2575Project, 2573, 2570);
    expect(res.effectiveYear).toBe(2573);
    expect(res.displayAmount).toBe(819442);
    expect(res.displayText).toBe('819,442');
    expect(res.sublabel).toBe('งบปี 2573');
    expect(res.isRange).toBe(false);
  });

  it('resolves range display when user explicitly chooses all years', () => {
    const res = resolveProjectFiscalBudget(sample2571_2575Project, 'all', 2570);
    expect(res.isRange).toBe(true);
    expect(res.displayText).toBe('803,296 - 835,913');
    expect(res.sublabel).toBe('กรอบงบประมาณ');
  });

  it('marks current fiscal year label with "งบปีปัจจุบัน" when exact match occurs', () => {
    const res = resolveProjectFiscalBudget(sample2571_2575Project, 2571, 2571);
    expect(res.sublabel).toBe('งบปีปัจจุบัน 2571');
    expect(res.displayText).toBe('803,296');
  });
});
