import test from 'node:test';
import assert from 'node:assert/strict';

import { toArabic, toThai, parseThaiNumber, formatCurrency } from '../src/domain/thaiNumerals.ts';
import { generateOfficialCitation } from '../src/domain/citation.ts';
import { SONGYANG_VILLAGES, getVillageLabel } from '../src/domain/villages.ts';
import { SONGYANG_STRATEGIES, getStrategy } from '../src/domain/strategies.ts';

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

test('formatCurrency formats currency correctly', () => {
  assert.equal(formatCurrency(500000, false), '500,000');
  assert.equal(formatCurrency(500000, true), '๕๐๐,๐๐๐');
});

test('generateOfficialCitation generates official citation string', () => {
  const citation = generateOfficialCitation({
    strategyNo: 1,
    seq: 125,
    printedPage: 116,
    useThaiNumerals: true,
  });
  assert.equal(
    citation,
    'ปรากฏในแผนพัฒนาท้องถิ่น (พ.ศ. ๒๕๗๑-๒๕๗๕) ประเด็นการพัฒนาที่ ๑ ลำดับที่ ๑๒๕ หน้า ๑๑๖'
  );
});

test('villages master data has 8 villages', () => {
  assert.equal(SONGYANG_VILLAGES.length, 8);
  assert.equal(getVillageLabel(3), 'หมู่ที่ 3 บ้านซำ');
});

test('strategies master data has 7 strategies', () => {
  assert.equal(SONGYANG_STRATEGIES.length, 7);
  assert.equal(getStrategy(1)?.shortName, 'โครงสร้างพื้นฐาน');
});
