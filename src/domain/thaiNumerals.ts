const THAI_DIGITS = ['๐', '๑', '๒', '๓', '๔', '๕', '๖', '๗', '๘', '๙'];
const ARABIC_DIGITS = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];

const THAI_TO_ARABIC_MAP: Record<string, string> = {
  '๐': '0', '๑': '1', '๒': '2', '๓': '3', '๔': '4',
  '๕': '5', '๖': '6', '๗': '7', '๘': '8', '๙': '9',
};

const ARABIC_TO_THAI_MAP: Record<string, string> = {
  '0': '๐', '1': '๑', '2': '๒', '3': '๓', '4': '๔',
  '5': '๕', '6': '๖', '7': '๗', '8': '๘', '9': '๙',
};

export function toArabic(str: string | number | null | undefined): string {
  if (str === null || str === undefined) return '';
  return String(str).replace(/[๐-๙]/g, (ch) => THAI_TO_ARABIC_MAP[ch] || ch);
}

export function toThai(str: string | number | null | undefined): string {
  if (str === null || str === undefined) return '';
  return String(str).replace(/[0-9]/g, (ch) => ARABIC_TO_THAI_MAP[ch] || ch);
}

export function parseThaiNumber(str: string | null | undefined): number | null {
  if (!str) return null;
  const arabic = toArabic(str).replace(/,/g, '').trim();
  const num = parseFloat(arabic);
  return isNaN(num) ? null : num;
}

export function formatCurrency(amount: number | null | undefined, useThai = false): string {
  if (amount === null || amount === undefined || isNaN(amount)) return '-';
  const formatted = new Intl.NumberFormat('th-TH').format(amount);
  return useThai ? toThai(formatted) : formatted;
}
