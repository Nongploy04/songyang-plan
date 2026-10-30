import { describe, it, expect } from 'vitest';
import { toArabic, toThai, parseThaiNumber, formatCurrency } from '../src/domain/thaiNumerals';
import { generateOfficialCitation } from '../src/domain/citation';

describe('thaiNumerals domain tests', () => {
  it('converts thai digits to arabic', () => {
    expect(toArabic('๑๒๓๔๕๖๗๘๙๐')).toBe('1234567890');
    expect(toArabic('หมู่ที่ ๓ บ้านซำ')).toBe('หมู่ที่ 3 บ้านซำ');
    expect(toArabic('๑,๓๓๙,๓๙๑')).toBe('1,339,391');
  });

  it('converts arabic digits to thai', () => {
    expect(toThai('1234567890')).toBe('๑๒๓๔๕๖๗๘๙๐');
    expect(toThai('หมู่ที่ 2')).toBe('หมู่ที่ ๒');
  });

  it('parses thai number string correctly', () => {
    expect(parseThaiNumber('๑,๓๓๙,๓๙๑')).toBe(1339391);
    expect(parseThaiNumber('๕๐๐,๐๐๐')).toBe(500000);
    expect(parseThaiNumber('-')).toBeNull();
  });

  it('formats currency correctly', () => {
    expect(formatCurrency(500000, false)).toBe('500,000');
    expect(formatCurrency(500000, true)).toBe('๕๐๐,๐๐๐');
  });

  it('generates official citation string', () => {
    const citation = generateOfficialCitation({
      strategyNo: 1,
      seq: 125,
      printedPage: 116,
      useThaiNumerals: true,
    });
    expect(citation).toBe('ปรากฏในแผนพัฒนาท้องถิ่น (พ.ศ. ๒๕๗๑-๒๕๗๕) ประเด็นการพัฒนาที่ ๑ ลำดับที่ ๑๒๕ หน้า ๑๑๖');
  });
});
