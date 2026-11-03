import { toArabic, toThai } from './thaiNumerals.ts';

export interface CitationParams {
  planTitle?: string;
  strategyNo: number;
  seq: number;
  printedPage: number | string;
  useThaiNumerals?: boolean;
}

export function generateOfficialCitation(params: CitationParams): string {
  const {
    planTitle = 'แผนพัฒนาท้องถิ่น (พ.ศ. 2571-2575)',
    strategyNo,
    seq,
    printedPage,
    useThaiNumerals = false,
  } = params;

  if (useThaiNumerals) {
    const sNo = toThai(strategyNo);
    const sSeq = toThai(seq);
    const sPage = toThai(printedPage);
    return `ปรากฏใน${toThai(planTitle)} ประเด็นการพัฒนาที่ ${sNo} ลำดับที่ ${sSeq} หน้า ${sPage}`;
  }

  const arabicTitle = toArabic(planTitle);
  const arabicPage = toArabic(printedPage);
  return `ปรากฏใน${arabicTitle} ประเด็นการพัฒนาที่ ${strategyNo} ลำดับที่ ${seq} หน้า ${arabicPage}`;
}
