import type { LocalPlanProject } from './types.ts';
import { formatCurrency } from './thaiNumerals.ts';

export type FiscalYearSelection = number | 'current' | 'all' | null;

export interface FiscalYearDisplayInfo {
  effectiveYear: number | null;
  displayAmount: number;
  displayText: string;
  sublabel: string;
  isYearSpecific: boolean;
  isRange: boolean;
  minAmount?: number;
  maxAmount?: number;
}

/**
 * ดึงรายการปีงบประมาณที่มีการตั้งงบไว้จริง (> 0)
 */
function getActiveProjectFiscalYears(project: LocalPlanProject): number[] {
  if (!project.budgets) return [];
  return Object.keys(project.budgets)
    .map(Number)
    .filter((yr) => (project.budgets[yr] || 0) > 0)
    .sort((a, b) => a - b);
}

/**
 * ดึงข้อมูลวัน เดือน ปี ในเขตเวลาประเทศไทย (Asia/Bangkok, UTC+7) เสมอ
 * ป้องกันปัญหา Server บน Vercel หรือ Node.js เป็นเวลา UTC (GMT+0)
 * ซึ่งจะทำให้การเปลี่ยนผ่านรอบปีงบประมาณ 1 ตุลาคม คลาดเคลื่อนไป 7 ชั่วโมง
 */
export function getThaiDateParts(date: Date = new Date()): {
  yearCE: number;
  month: number; // 1 - 12
  day: number; // 1 - 31
} {
  try {
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: 'Asia/Bangkok',
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
    });
    const parts = formatter.formatToParts(date);
    let yearCE = date.getFullYear();
    let month = date.getMonth() + 1;
    let day = date.getDate();

    for (const part of parts) {
      if (part.type === 'year') yearCE = parseInt(part.value, 10);
      if (part.type === 'month') month = parseInt(part.value, 10);
      if (part.type === 'day') day = parseInt(part.value, 10);
    }

    return { yearCE, month, day };
  } catch {
    // Fallback: หากสภาพแวดล้อมไม่รองรับ timeZone ให้ปรับ offset +7 ชั่วโมงเองตรงๆ
    const utcTime = date.getTime() + date.getTimezoneOffset() * 60000;
    const bkkDate = new Date(utcTime + 7 * 3600000);
    return {
      yearCE: bkkDate.getFullYear(),
      month: bkkDate.getMonth() + 1,
      day: bkkDate.getDate(),
    };
  }
}

/**
 * คำนวณปีงบประมาณไทยปัจจุบัน (Thai Fiscal Year)
 * ตาม พระราชบัญญัติวิธีการงบประมาณ พ.ศ. 2561:
 * - เริ่มต้นวันที่ 1 ตุลาคม ของปีก่อนหน้า และสิ้นสุดวันที่ 30 กันยายน ของปีนั้น
 * - เดือน 10, 11, 12 นับเป็นปีงบประมาณถัดไป (พ.ศ. ปัจจุบัน + 1)
 * - เดือน 1 ถึง 9 นับเป็นปีงบประมาณตาม พ.ศ. ปัจจุบัน
 */
export function getCurrentThaiFiscalYear(date: Date = new Date()): number {
  const { yearCE, month } = getThaiDateParts(date);
  const thaiBuddhistYear = yearCE + 543;
  return month >= 10 ? thaiBuddhistYear + 1 : thaiBuddhistYear;
}

/**
 * คำนวณยอดงบประมาณเดี่ยวของโครงการให้สอดคล้องกับปีงบประมาณที่ต้องการแสดงผล
 *
 * @param project ข้อมูลโครงการ
 * @param selectedYear ปีที่ผู้ใช้เลือก (ตัวเลขปี, 'current', 'all', หรือ null)
 * @param currentFiscalYear ปีงบประมาณปัจจุบัน (ค่าเริ่มต้นคำนวณอัตโนมัติ)
 */
export function resolveProjectFiscalBudget(
  project: LocalPlanProject,
  selectedYear: FiscalYearSelection = 'current',
  currentFiscalYear: number = getCurrentThaiFiscalYear()
): FiscalYearDisplayInfo {
  const activeYears = getActiveProjectFiscalYears(project);

  // กรณีโครงการไม่มีงบประมาณเลย
  if (activeYears.length === 0 || !project.budgets) {
    return {
      effectiveYear: null,
      displayAmount: 0,
      displayText: '0',
      sublabel: 'ไม่ระบุงบประมาณ',
      isYearSpecific: false,
      isRange: false,
    };
  }

  // 1. กรณีผู้ใช้เลือกดูภาพรวมทุกปี (all)
  if (selectedYear === 'all') {
    const amounts = activeYears.map((yr) => project.budgets[yr] || 0);
    const minAmount = Math.min(...amounts);
    const maxAmount = Math.max(...amounts);

    if (minAmount === maxAmount) {
      return {
        effectiveYear: null,
        displayAmount: minAmount,
        displayText: formatCurrency(minAmount, false),
        sublabel: 'งบประมาณโครงการ',
        isYearSpecific: false,
        isRange: false,
      };
    }

    return {
      effectiveYear: null,
      displayAmount: minAmount,
      displayText: `${formatCurrency(minAmount, false)} - ${formatCurrency(maxAmount, false)}`,
      sublabel: 'กรอบงบประมาณ',
      isYearSpecific: false,
      isRange: true,
      minAmount,
      maxAmount,
    };
  }

  // 2. พิจารณาปีเป้าหมาย (Target Fiscal Year)
  let targetYear: number;

  if (typeof selectedYear === 'number') {
    // ผู้ใช้เลือกเจาะจงปีเองแบบ Manual
    targetYear = selectedYear;
  } else {
    // โหมด 'current' หรือ null (Default Auto)
    // ตรวจสอบว่าปีงบประมาณปัจจุบันมีในโครงการนี้หรือไม่
    if (activeYears.includes(currentFiscalYear)) {
      targetYear = currentFiscalYear;
    } else if (currentFiscalYear < activeYears[0]) {
      // โครงการเป็นแผนในอนาคต (เช่น แผน 2571-2575 แต่ปีปัจจุบันคือ 2570)
      // ให้แสดงยอดของปีแรกที่เริ่มตั้งงบประมาณ
      targetYear = activeYears[0];
    } else {
      // โครงการเป็นแผนในอดีต (ปีปัจจุบันเกินปีสุดท้ายของโครงการ)
      // ให้แสดงยอดของปีสุดท้ายที่มีการตั้งงบ
      targetYear = activeYears[activeYears.length - 1];
    }
  }

  const amount = project.budgets[targetYear] || 0;

  // หากปีนั้นมีการตั้งงบไว้จริง
  if (amount > 0) {
    const isCurrent = targetYear === currentFiscalYear;
    const sublabel = isCurrent
      ? `งบปีปัจจุบัน ${targetYear}`
      : `งบปี ${targetYear}`;

    return {
      effectiveYear: targetYear,
      displayAmount: amount,
      displayText: formatCurrency(amount, false),
      sublabel,
      isYearSpecific: true,
      isRange: false,
    };
  }

  // หากปีที่เลือกไม่มีการตั้งงบประมาณสำหรับโครงการนี้
  return {
    effectiveYear: targetYear,
    displayAmount: 0,
    displayText: '-',
    sublabel: `ไม่มีงบในปี ${targetYear}`,
    isYearSpecific: true,
    isRange: false,
  };
}
