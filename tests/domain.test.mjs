import test from 'node:test';
import assert from 'node:assert/strict';

import { toArabic, toThai, parseThaiNumber, formatCurrency } from '../src/domain/thaiNumerals.ts';
import { generateOfficialCitation } from '../src/domain/citation.ts';
import { SONGYANG_VILLAGES, getVillageLabel } from '../src/domain/villages.ts';
import { SONGYANG_STRATEGIES, getStrategy } from '../src/domain/strategies.ts';
import { PLAN_DOCUMENTS, PLAN_2571_2575_OFFICIAL_SUMMARY, getDocument } from '../src/domain/documents.ts';
import { getProjectFiscalYears } from '../src/domain/types.ts';
import { INITIAL_PLAN_PROJECTS } from '../src/data/initialProjects.ts';
import { safeGetJson, safeSetText } from '../src/lib/safeBrowserStorage.ts';

test('toArabic converts thai digits to arabic', () => {
  assert.equal(toArabic('๑๒๓๔๕๖๗๘๙๐'), '1234567890');
  assert.equal(toArabic('หมู่ที่ ๓ บ้านซำ'), 'หมู่ที่ 3 บ้านซำ');
  assert.equal(toArabic('๑,๓๓๙,๓๙๑'), '1,339,391');
});

test('toThai converts arabic digits to thai', () => {
  assert.equal(toThai('1234567890'), '๑๒๓๔๕๖๗๘๙๐');
  assert.equal(toThai('หมู่ที่ 2'), 'หมู่ที่ ๒');
});

test('parseThaiNumber parses thai number string correctly', () => {
  assert.equal(parseThaiNumber('๑,๓๓๙,๓๙๑'), 1339391);
  assert.equal(parseThaiNumber('๕๐๐,๐๐๐'), 500000);
  assert.equal(parseThaiNumber('-'), null);
});

test('formatCurrency formats currency correctly in arabic', () => {
  assert.equal(formatCurrency(500000, false), '500,000');
  assert.equal(formatCurrency(500000, true), '๕๐๐,๐๐๐');
});

test('generateOfficialCitation defaults to Arabic numerals', () => {
  const citationArabic = generateOfficialCitation({
    strategyNo: 1,
    seq: 125,
    printedPage: 116,
  });
  assert.equal(
    citationArabic,
    'ปรากฏในแผนพัฒนาท้องถิ่น (พ.ศ. 2571-2575) ประเด็นการพัฒนาที่ 1 ลำดับที่ 125 หน้า 116'
  );
  assert.equal(/[๐-๙]/.test(citationArabic), false);
});

test('villages master data has 8 villages in Arabic numerals', () => {
  assert.equal(SONGYANG_VILLAGES.length, 8);
  assert.equal(getVillageLabel(3), 'หมู่ที่ 3 บ้านซำ');
  assert.equal(/[๐-๙]/.test(JSON.stringify(SONGYANG_VILLAGES)), false);
});

test('strategies master data has 7 strategies and official Pho 01 summary sums to 419 projects', () => {
  assert.equal(SONGYANG_STRATEGIES.length, 7);
  assert.equal(getStrategy(1)?.shortName, 'โครงสร้างพื้นฐาน');
  const totalSummaryProjects = PLAN_2571_2575_OFFICIAL_SUMMARY.reduce((s, r) => s + r.projectCount, 0);
  assert.equal(totalSummaryProjects, 419);
});

test('documents catalog has 20 official documents with zero Thai numerals', () => {
  assert.equal(PLAN_DOCUMENTS.length, 20);
  const doc71 = getDocument('plan_2571_2575_main');
  assert.equal(doc71?.period, '2571-2575');
  assert.equal(doc71?.pageCount, 252);
  assert.equal(/[๐-๙]/.test(JSON.stringify(PLAN_DOCUMENTS)), false);
});

test('getProjectFiscalYears resolves multi-period years accurately', () => {
  assert.deepEqual(
    getProjectFiscalYears({ documentId: 'plan_2571_2575_main', budgets: {} }),
    [2571, 2572, 2573, 2574, 2575]
  );
  assert.deepEqual(
    getProjectFiscalYears({ documentId: 'plan_2566_2570_edit_r3_2569', budgets: {} }),
    [2566, 2567, 2568, 2569, 2570]
  );
  assert.deepEqual(
    getProjectFiscalYears({ documentId: 'plan_2561_2565_main', budgets: {} }),
    [2561, 2562, 2563, 2564, 2565]
  );
});

test('INITIAL_PLAN_PROJECTS has zero Thai numerals and valid budget sums', () => {
  assert.ok(INITIAL_PLAN_PROJECTS.length > 0);
  for (const p of INITIAL_PLAN_PROJECTS) {
    assert.equal(
      /[๐-๙]/.test(JSON.stringify(p)),
      false,
      `Found Thai numeral in project ${p.id}: ${p.name}`
    );
    const sumAnnual = Object.values(p.budgets || {}).reduce((acc, v) => acc + (Number(v) || 0), 0);
    if (sumAnnual > 0) {
      assert.equal(
        p.totalBudget,
        sumAnnual,
        `Budget sum mismatch on ${p.id}: totalBudget=${p.totalBudget} vs sumAnnual=${sumAnnual}`
      );
    }
  }
});

test('safeBrowserStorage auto-purges corrupted JSON', () => {
  safeSetText('test_corrupt_key', '{corrupted_json');
  const val = safeGetJson('test_corrupt_key', () => true, { ok: true });
  assert.deepEqual(val, { ok: true });
});
