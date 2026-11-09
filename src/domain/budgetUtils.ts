import type { LocalPlanProject } from './types.ts';
import { formatCurrency } from './thaiNumerals.ts';
import {
  resolveProjectFiscalBudget,
  getCurrentThaiFiscalYear,
  type FiscalYearSelection,
} from './fiscalYear.ts';

export interface ProjectBudgetDisplay {
  text: string;
  sublabel: string;
  amount: number;
  isYearSpecific: boolean;
  isRange: boolean;
  effectiveYear?: number | null;
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
 * @param selectedYear ปีงบประมาณที่ผู้ใช้เลือก (ตัวเลขปี, 'current', 'all', หรือ null)
 */
export function getProjectDisplayBudget(
  project: LocalPlanProject,
  selectedYear?: FiscalYearSelection
): ProjectBudgetDisplay {
  const info = resolveProjectFiscalBudget(project, selectedYear);
  return {
    text: info.displayText,
    sublabel: info.sublabel,
    amount: info.displayAmount,
    isYearSpecific: info.isYearSpecific,
    isRange: info.isRange,
    effectiveYear: info.effectiveYear,
    minAmount: info.minAmount,
    maxAmount: info.maxAmount,
  };
}

/**
 * คำนวณงบประมาณรวมทั้งระบบตามหลักการคลังท้องถิ่น (ไม่บวกทบ 5 เท่า)
 * - หากเลือกปี: รวมงบของโครงการในปีนั้น
 * - หากดูทุกปี: รวมวงเงินฐานของแต่ละโครงการ
 */
export function calculateOverallBudget(
  projects: LocalPlanProject[],
  selectedYear?: FiscalYearSelection
): { total: number; formatted: string; label: string } {
  const effectiveYear =
    selectedYear === 'current'
      ? getCurrentThaiFiscalYear()
      : typeof selectedYear === 'number'
      ? selectedYear
      : null;

  if (effectiveYear) {
    const total = projects.reduce((sum, p) => sum + (p.budgets?.[effectiveYear] || 0), 0);
    return {
      total,
      formatted: formatCurrency(total, false),
      label: `งบประมาณปี ${effectiveYear}`,
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
