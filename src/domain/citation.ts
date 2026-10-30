import { toThai } from './thaiNumerals.ts';

export interface CitationParams {
  planTitle?: string;
  strategyNo: number;
  seq: number;
  printedPage: number | string;
  useThaiNumerals?: boolean;
}

export function generateOfficialCitation(params: CitationParams): string {
  const {
    planTitle = 'แผนพัฒนาท้องถิ่น (พ.ศ. ๒๕๗๑-๒๕๗๕)',
    strategyNo,
    seq,
    printedPage,
    useThaiNumerals = true,
  } = params;

  if (useThaiNumerals) {
    const sNo = toThai(strategyNo);
    const sSeq = toThai(seq);
    const sPage = toThai(printedPage);
    return `ปรากฏใน${planTitle} ประเด็นการพัฒนาที่ ${sNo} ลำดับที่ ${sSeq} หน้า ${sPage}`;
  }

  return `ปรากฏใน${planTitle} ประเด็นการพัฒนาที่ ${strategyNo} ลำดับที่ ${seq} หน้า ${printedPage}`;
}
