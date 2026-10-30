export type WorkCategoryKey = 'road' | 'water' | 'electric' | 'drainage' | 'building' | 'agriculture' | 'social' | 'other';

export interface WorkCategory {
  key: WorkCategoryKey;
  label: string;
}

export const WORK_CATEGORIES: WorkCategory[] = [
  { key: 'road', label: 'ถนนและสะพาน' },
  { key: 'water', label: 'ประปาและแหล่งน้ำ' },
  { key: 'electric', label: 'ไฟฟ้าและไฟส่องสว่าง' },
  { key: 'drainage', label: 'รางระบายน้ำและท่อลอด' },
  { key: 'building', label: 'อาคารและสิ่งก่อสร้าง' },
  { key: 'agriculture', label: 'การเกษตรและสิ่งแวดล้อม' },
  { key: 'social', label: 'คุณภาพชีวิตและสังคม' },
  { key: 'other', label: 'งานทั่วไปและอื่นๆ' },
];

export function detectWorkCategory(text: string): WorkCategoryKey {
  const t = text.toLowerCase();
  if (t.includes('ถนน') || t.includes('หินคลุก') || t.includes('คสล') || t.includes('ลาดยาง') || t.includes('คอนกรีต') || t.includes('สะพาน')) {
    return 'road';
  }
  if (t.includes('ประปา') || t.includes('น้ำบาดาล') || t.includes('ท่อเมน') || t.includes('สระน้ำ') || t.includes('บ่อบาดาล') || t.includes('สูบน้ำ')) {
    return 'water';
  }
  if (t.includes('ไฟ') || t.includes('โซล่า') || t.includes('พลังงานแสงอาทิตย์') || t.includes('ส่องสว่าง')) {
    return 'electric';
  }
  if (t.includes('ระบายน้ำ') || t.includes('ท่อลอด') || t.includes('รางระบาย') || t.includes('คูน้ำ')) {
    return 'drainage';
  }
  if (t.includes('อาคาร') || t.includes('ศาลา') || t.includes('ศูนย์') || t.includes('โรงพยาบาล') || t.includes('ห้องน้ำ')) {
    return 'building';
  }
  if (t.includes('เกษตร') || t.includes('ปุ๋ย') || t.includes('ฮอร์โมน') || t.includes('ต้นไม้') || t.includes('สิ่งแวดล้อม') || t.includes('ขยะ')) {
    return 'agriculture';
  }
  if (t.includes('สงเคราะห์') || t.includes('ผู้สูงอายุ') || t.includes('เด็ก') || t.includes('ประเพณี') || t.includes('กีฬา')) {
    return 'social';
  }
  return 'other';
}
