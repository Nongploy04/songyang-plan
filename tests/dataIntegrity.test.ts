import fs from 'node:fs';
import path from 'node:path';
import { describe, it, expect } from 'vitest';
import { INITIAL_PLAN_PROJECTS } from '../src/data/initialProjects.ts';
import { PLAN_DOCUMENTS, PLAN_2571_2575_OFFICIAL_SUMMARY } from '../src/domain/documents.ts';
import { SONGYANG_VILLAGES } from '../src/domain/villages.ts';
import { SONGYANG_STRATEGIES } from '../src/domain/strategies.ts';
import { WORK_CATEGORIES } from '../src/domain/workCategories.ts';

describe('Data Integrity & Audit of 522 Local Plan Projects', () => {
  it('has exactly 522 projects without duplicates', () => {
    expect(INITIAL_PLAN_PROJECTS.length).toBe(522);

    const ids = new Set<string>();
    for (const p of INITIAL_PLAN_PROJECTS) {
      expect(ids.has(p.id)).toBe(false);
      ids.add(p.id);
    }
  });

  it('contains exactly 419 projects for 2571-2575 matching official Pho 01 and 103 for 2566-2570 amendments', () => {
    const mainProjects = INITIAL_PLAN_PROJECTS.filter(p => p.documentId === 'plan_2571_2575_main');
    const amendmentProjects = INITIAL_PLAN_PROJECTS.filter(p => p.documentId !== 'plan_2571_2575_main');

    expect(mainProjects.length).toBe(419);
    expect(amendmentProjects.length).toBe(103);

    const totalSummaryCount = PLAN_2571_2575_OFFICIAL_SUMMARY.reduce((acc, row) => acc + row.projectCount, 0);
    expect(totalSummaryCount).toBe(419);
  });

  it('guarantees budget math: sum of annual budgets equals totalBudget for every project', () => {
    for (const p of INITIAL_PLAN_PROJECTS) {
      const sumAnnual = Object.values(p.budgets || {}).reduce((acc, v) => acc + (Number(v) || 0), 0);
      if (sumAnnual > 0) {
        expect(p.totalBudget).toBe(sumAnnual);
      }
    }
  });

  it('guarantees valid villages, strategies, and categories for every project', () => {
    const validVillages = new Set(SONGYANG_VILLAGES.map(v => v.no));
    const validStrategies = new Set(SONGYANG_STRATEGIES.map(s => s.no));
    const validCategories = new Set(WORK_CATEGORIES.map(c => c.key));

    for (const p of INITIAL_PLAN_PROJECTS) {
      expect(validStrategies.has(p.strategyNo)).toBe(true);
      expect(validCategories.has(p.workCategory)).toBe(true);
      expect(Array.isArray(p.villages)).toBe(true);
      expect(p.villages.length).toBeGreaterThan(0);
      for (const v of p.villages) {
        expect(validVillages.has(v)).toBe(true);
      }
    }
  });

  it('guarantees all official scan pages exist on disk in public/', () => {
    const publicDir = path.resolve(process.cwd(), 'public');
    for (const p of INITIAL_PLAN_PROJECTS) {
      const scanPages = p.lineage?.officialScanPages || [];
      expect(scanPages.length).toBeGreaterThanOrEqual(2);
      for (const pg of scanPages) {
        const cleanRel = pg.imageUrl.replace(/^\//, '');
        const diskPath = path.join(publicDir, cleanRel);
        expect(fs.existsSync(diskPath)).toBe(true);
      }
    }
  });

  it('ensures zero Thai numerals in project names, targets, and objectives', () => {
    for (const p of INITIAL_PLAN_PROJECTS) {
      expect(/[๐-๙]/.test(JSON.stringify(p))).toBe(false);
    }
  });
});
