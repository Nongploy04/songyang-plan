import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { INITIAL_PLAN_PROJECTS } from '../src/data/initialProjects.ts';
import { PLAN_DOCUMENTS, PLAN_2571_2575_OFFICIAL_SUMMARY } from '../src/domain/documents.ts';
import { SONGYANG_VILLAGES } from '../src/domain/villages.ts';
import { SONGYANG_STRATEGIES } from '../src/domain/strategies.ts';
import { WORK_CATEGORIES } from '../src/domain/workCategories.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const baseDir = path.resolve(__dirname, '..');
const publicDir = path.join(baseDir, 'public');

const report = {
  totalProjects: INITIAL_PLAN_PROJECTS.length,
  duplicateIds: [],
  budgetMismatches: [],
  missingScanFiles: [],
  invalidVillages: [],
  invalidStrategies: [],
  invalidCategories: [],
  emptyFields: [],
  docCounts: {},
};

const allowedCategories = new Set(WORK_CATEGORIES.map(c => c.key));
const validDocIds = new Set(PLAN_DOCUMENTS.map(d => d.id));
const validVillageNos = new Set(SONGYANG_VILLAGES.map(v => v.no));
const validStrategyNos = new Set(SONGYANG_STRATEGIES.map(s => s.no));

const seenIds = new Set();

for (const p of INITIAL_PLAN_PROJECTS) {
  // 1. Duplicate ID check
  if (seenIds.has(p.id)) {
    report.duplicateIds.push(p.id);
  }
  seenIds.add(p.id);

  // 2. Document counts
  report.docCounts[p.documentId] = (report.docCounts[p.documentId] || 0) + 1;

  // 3. Document ID validity
  if (!validDocIds.has(p.documentId)) {
    report.emptyFields.push({ id: p.id, error: `Invalid documentId: ${p.documentId}` });
  }

  // 4. Required fields check
  const required = ['name', 'target', 'objective', 'agency', 'totalBudget', 'budgets', 'villages', 'strategyNo', 'workCategory', 'pdfPage', 'printedPage'];
  for (const f of required) {
    if (p[f] === undefined || p[f] === null || p[f] === '') {
      report.emptyFields.push({ id: p.id, field: f });
    }
  }

  // 5. Category check
  if (!allowedCategories.has(p.workCategory)) {
    report.invalidCategories.push({ id: p.id, category: p.workCategory });
  }

  // 6. Strategy check
  if (!validStrategyNos.has(p.strategyNo)) {
    report.invalidStrategies.push({ id: p.id, strategy: p.strategyNo });
  }

  // 7. Villages check
  if (!Array.isArray(p.villages) || p.villages.length === 0 || p.villages.some(v => !validVillageNos.has(v))) {
    report.invalidVillages.push({ id: p.id, villages: p.villages });
  }

  // 8. Budget math check
  const sumAnnual = Object.values(p.budgets || {}).reduce((acc, v) => acc + (Number(v) || 0), 0);
  if (sumAnnual > 0 && sumAnnual !== p.totalBudget) {
    report.budgetMismatches.push({ id: p.id, sumAnnual, totalBudget: p.totalBudget });
  }

  // 9. Scan pages check
  const scanPages = p.lineage?.officialScanPages || [];
  if (scanPages.length < 2) {
    report.missingScanFiles.push({ id: p.id, error: `Fewer than 2 scan pages: ${scanPages.length}` });
  }
  for (const sp of scanPages) {
    if (!sp.imageUrl) {
      report.missingScanFiles.push({ id: p.id, error: 'Missing imageUrl' });
      continue;
    }
    const cleanRel = sp.imageUrl.replace(/^\//, '');
    const diskPath = path.join(publicDir, cleanRel);
    if (!fs.existsSync(diskPath)) {
      report.missingScanFiles.push({ id: p.id, imgUrl: sp.imageUrl, diskPath });
    }
  }
}

console.log(JSON.stringify({
  totalProjects: report.totalProjects,
  duplicateIdsCount: report.duplicateIds.length,
  budgetMismatchesCount: report.budgetMismatches.length,
  missingScanFilesCount: report.missingScanFiles.length,
  invalidVillagesCount: report.invalidVillages.length,
  invalidStrategiesCount: report.invalidStrategies.length,
  invalidCategoriesCount: report.invalidCategories.length,
  emptyFieldsCount: report.emptyFields.length,
  docCounts: report.docCounts,
  missingScanFilesDetails: report.missingScanFiles.slice(0, 5),
  budgetMismatchDetails: report.budgetMismatches.slice(0, 5)
}, null, 2));
