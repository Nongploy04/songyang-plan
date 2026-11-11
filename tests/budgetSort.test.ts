import { describe, it, expect } from 'vitest';
import { sortProjects, type ProjectSortField, type ProjectSortDirection } from '../src/domain/budgetUtils.ts';
import type { LocalPlanProject } from '../src/domain/types.ts';

function createMockProject(seq: number, name: string, budgets: Record<number, number>): LocalPlanProject {
  return {
    id: `proj_${seq}`,
    documentId: 'plan_2571_2575_main',
    documentTitle: 'แผนพัฒนาท้องถิ่น (พ.ศ. 2571 - 2575)',
    strategyNo: 1,
    strategyName: 'ด้านโครงสร้างพื้นฐาน',
    seq,
    seqRaw: String(seq),
    name,
    objective: 'เพื่อการสัญจร',
    target: 'ถนน คสล.',
    budgets,
    totalBudget: Object.values(budgets).reduce((sum, b) => sum + b, 0),
    expectedResult: 'ประชาชนสัญจรสะดวก',
    agency: 'กองช่าง',
    villages: [3],
    workCategory: 'road_concrete',
    pdfPage: 80,
    printedPage: 80,
    updatedAt: '2026-11-11T00:00:00Z',
  };
}

describe('sortProjects by Budget and Sequence', () => {
  const p1 = createMockProject(45, 'โครงการ A (งบ 1,047,303)', { 2571: 1047303 });
  const p2 = createMockProject(160, 'โครงการ B (งบ 108,000)', { 2571: 108000 });
  const p3 = createMockProject(254, 'โครงการ C (งบ 9,389,604)', { 2571: 9389604 });
  const p4 = createMockProject(255, 'โครงการ D (งบ 9,790,566)', { 2571: 9790566 });
  const pEqual = createMockProject(300, 'โครงการ E (งบ 108,000 ลำดับหลัง)', { 2571: 108000 });

  const dataset = [p1, p2, p3, p4, pEqual];

  it('sorts projects by budget descending (มากไปน้อย)', () => {
    const sorted = sortProjects(dataset, 'budget', 'desc', 2571);
    expect(sorted.map((p) => p.seq)).toEqual([255, 254, 45, 160, 300]);
    expect(sorted[0].budgets[2571]).toBe(9790566);
    expect(sorted[sorted.length - 1].budgets[2571]).toBe(108000);
  });

  it('sorts projects by budget ascending (น้อยไปมาก)', () => {
    const sorted = sortProjects(dataset, 'budget', 'asc', 2571);
    // 160 and 300 both have 108000 -> tie-break by seq ascending (160 before 300)
    expect(sorted.map((p) => p.seq)).toEqual([160, 300, 45, 254, 255]);
    expect(sorted[0].budgets[2571]).toBe(108000);
    expect(sorted[sorted.length - 1].budgets[2571]).toBe(9790566);
  });

  it('sorts projects by sequence ascending (ตามลำดับเดิม)', () => {
    const shuffled = [p3, p1, p4, p2];
    const sorted = sortProjects(shuffled, 'seq', 'asc', 2571);
    expect(sorted.map((p) => p.seq)).toEqual([45, 160, 254, 255]);
  });

  it('respects different fiscal year budgets when sorting', () => {
    // Project X has 2571: 100, 2572: 900
    // Project Y has 2571: 500, 2572: 200
    const pX = createMockProject(1, 'Proj X', { 2571: 100, 2572: 900 });
    const pY = createMockProject(2, 'Proj Y', { 2571: 500, 2572: 200 });

    // In 2571: Y (500) > X (100)
    const sorted2571 = sortProjects([pX, pY], 'budget', 'desc', 2571);
    expect(sorted2571[0].id).toBe('proj_2');

    // In 2572: X (900) > Y (200)
    const sorted2572 = sortProjects([pX, pY], 'budget', 'desc', 2572);
    expect(sorted2572[0].id).toBe('proj_1');
  });
});
