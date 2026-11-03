import type { LocalPlanProject } from './types.ts';
import { formatCurrency } from './thaiNumerals.ts';

export interface ProjectBudgetDisplay {
  text: string;
  sublabel: string;
  amount: number;
  isYearSpecific: boolean;
  isRange: boolean;
  minAmount?: number;
  maxAmount?: number;
}

/**
 * ดึงรายการปีงบประมาณที่มีการตั้งงบไว้จริง (> 0)
 */
export function getActiveFiscalYears(project: LocalPlanProject): number[] {
  if (!project.budgets) return [];
  return Object.keys(project.budgets)
    .map(Number)
    .filter((yr) => (project.budgets[yr] || 0) > 0)
    .sort((a, b) => a - b);
}

/**
 * ดึงกรอบวงเงินงบประมาณฐานของโครงการ (Base Budget)
 * ในแผนพัฒนาท้องถิ่น (ผ.02) โครงการพัฒนา 1 โครงการ เป็นการดำเนินการครั้งเดียว
 * วงเงินฐานคือวงเงินปีเริ่มต้นที่มีการตั้งประมาณการไว้ (มิใช่นำ 5 ปีมารวมกัน)
 */
export function getProjectBaseBudget(project: LocalPlanProject): number {
  const activeYears = getActiveFiscalYears(project);
  if (activeYears.length === 0) return 0;
  // วงเงินของปีเริ่มต้นที่มีการตั้งงบ
  return project.budgets[activeYears[0]] || 0;
}

/**
 * ดึงข้อมูลการแสดงผลงบประมาณสำหรับโครงการ
 * @param project โครงการ
 * @param selectedYear ปีงบประมาณที่ผู้ใช้เลือกกรอง (ถ้ามี)
 */
export function getProjectDisplayBudget(
  project: LocalPlanProject,
  selectedYear?: number | null
): ProjectBudgetDisplay {
  // 1. กรณีผู้ใช้เลือกกรองปีเฉพาะเจาะจง
  if (selectedYear && project.budgets && (project.budgets[selectedYear] || 0) > 0) {
    const amount = project.budgets[selectedYear] || 0;
    return {
      text: formatCurrency(amount, false),
      sublabel: `งบปี ${selectedYear}`,
      amount,
      isYearSpecific: true,
      isRange: false,
    };
  }

  // 2. กรณีดูภาพรวมทุกปี
  const activeYears = getActiveFiscalYears(project);
  if (activeYears.length === 0) {
    return {
      text: '0',
      sublabel: 'ไม่ระบุงบประมาณ',
      amount: 0,
      isYearSpecific: false,
      isRange: false,
    };
  }

  const amounts = activeYears.map((yr) => project.budgets[yr] || 0);
  const minAmount = Math.min(...amounts);
  const maxAmount = Math.max(...amounts);

  // ถ้างบทุกปีเท่ากัน หรือมีแค่ปีเดียว
  if (minAmount === maxAmount) {
    return {
      text: formatCurrency(minAmount, false),
      sublabel: 'งบประมาณโครงการ',
      amount: minAmount,
      isYearSpecific: false,
      isRange: false,
    };
  }

  // ถ้างบแต่ละปีปรับตามเงินเฟ้อ/ดัชนีราคา (เช่น 309,163 - 321,716 บาท)
  return {
    text: `${formatCurrency(minAmount, false)} - ${formatCurrency(maxAmount, false)}`,
    sublabel: 'กรอบงบประมาณ',
    amount: minAmount, // ใช้วงเงินฐานในการคำนวณ
    isYearSpecific: false,
    isRange: true,
    minAmount,
    maxAmount,
  };
}

/**
 * คำนวณงบประมาณรวมทั้งระบบตามหลักการคลังท้องถิ่น (ไม่บวกทบ 5 เท่า)
 * - หากเลือกปี: รวมงบของโครงการในปีนั้น
 * - หากดูทุกปี: รวมวงเงินฐานของแต่ละโครงการ
 */
export function calculateOverallBudget(
  projects: LocalPlanProject[],
  selectedYear?: number | null
): { total: number; formatted: string; label: string } {
  if (selectedYear) {
    const total = projects.reduce((sum, p) => sum + (p.budgets?.[selectedYear] || 0), 0);
    return {
      total,
      formatted: formatCurrency(total, false),
      label: `งบประมาณปี ${selectedYear}`,
    };
  }

  // รวมวงเงินฐานของแต่ละโครงการ (1 โครงการ = 1 วงเงินดำเนินการ)
  const total = projects.reduce((sum, p) => sum + getProjectBaseBudget(p), 0);
  return {
    total,
    formatted: formatCurrency(total, false),
    label: 'กรอบงบประมาณโครงการรวม',
  };
}
