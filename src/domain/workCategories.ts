export type WorkCategoryKey =
  | 'road_asphalt'
  | 'road_gravel'
  | 'road_concrete'
  | 'drainage_bridge'
  | 'water'
  | 'electric'
  | 'building'
  | 'agriculture'
  | 'equipment'
  | 'social'
  | 'other';

export interface WorkCategory {
  key: WorkCategoryKey;
  label: string;
}

export const WORK_CATEGORIES: WorkCategory[] = [
  { key: 'road_asphalt', label: 'ถนนลาดยาง / แอสฟัลต์' },
  { key: 'road_gravel', label: 'ถนนหินคลุก / ดิน / ลูกรัง' },
  { key: 'road_concrete', label: 'ถนน คสล.' },
  { key: 'drainage_bridge', label: 'สะพาน / ท่อลอด / รางระบายน้ำ' },
  { key: 'water', label: 'ประปาและแหล่งน้ำ' },
  { key: 'electric', label: 'ไฟฟ้าและไฟส่องสว่าง' },
  { key: 'building', label: 'อาคารและสิ่งก่อสร้าง' },
  { key: 'agriculture', label: 'การเกษตรและสิ่งแวดล้อม' },
  { key: 'equipment', label: 'ครุภัณฑ์และยานพาหนะ' },
  { key: 'social', label: 'คุณภาพชีวิตและสังคม' },
  { key: 'other', label: 'งานทั่วไปและอื่นๆ' },
];

export const WORK_CATEGORY_LABELS: Record<string, string> = {
  road_asphalt: 'ถนนลาดยาง / แอสฟัลต์',
  road_gravel: 'ถนนหินคลุก / ดิน / ลูกรัง',
  road_concrete: 'ถนน คสล.',
  drainage_bridge: 'สะพาน / ท่อลอด / รางระบายน้ำ',
  water: 'ประปาและแหล่งน้ำ',
  electric: 'ไฟฟ้าและไฟส่องสว่าง',
  building: 'อาคารและสิ่งก่อสร้าง',
  agriculture: 'การเกษตรและสิ่งแวดล้อม',
  equipment: 'ครุภัณฑ์และยานพาหนะ',
  social: 'คุณภาพชีวิตและสังคม',
  other: 'งานทั่วไปและอื่นๆ',
  // Backward compatibility aliases
  road: 'งานถนนทุกประเภท',
  drainage: 'สะพาน / ท่อลอด / รางระบายน้ำ',
};

/**
 * Strict Head-Noun & Context Aware Classifier
 * Accurately handles municipal engineering project names avoiding false positives:
 * 1. Separates "รางระบายน้ำ คสล." and "สะพาน คสล." from concrete roads
 * 2. Identifies asphalt roads without the word "ลาดยาง" (e.g. แอสฟัลท์ติก, เคปซีล, Over Lay)
 * 3. Prevents location landmarks (e.g. "ข้างประปา", "รอบสระหนองเลิง") from polluting primary category
 * 4. Categorizes solar-powered water systems (SmartPure) as water, not electric
 */
export function classifySongyangProject(name: string, target: string = ''): WorkCategoryKey {
  const n = name.trim();

  // 1. DRAINAGE & BRIDGES (Must check before roads because names contain คสล.)
  if (
    n.includes('รางระบายน้ำ') ||
    n.includes('ท่อระบายน้ำ') ||
    n.includes('ท่อลอดเหลี่ยม') ||
    n.includes('ท่อลอดกลม') ||
    n.includes('วางท่อระบายน้ำ') ||
    (n.includes('สะพาน') && !n.includes('ถนน') && !n.includes('แอสฟัล') && !n.includes('ถึงบริเวณสะพาน') && !n.includes('เริ่มจากสะพาน'))
  ) {
    return 'drainage_bridge';
  }

  // 2. WATER RESOURCES & WATER SUPPLY
  if (
    n.includes('สมาร์ทเพียว') ||
    n.includes('คุณภาพน้ำ') ||
    n.includes('ป๊อกดริ้งค์') ||
    n.includes('pog drink') ||
    n.includes('น้ำดื่ม') ||
    n.includes('ประปา') ||
    n.includes('น้ำบาดาล') ||
    (n.includes('บ่อบาดาล') && !n.includes('เพื่อการเกษตร')) ||
    n.includes('ขุดลอก') ||
    n.includes('ฝายน้ำล้น') ||
    n.includes('ทำนบ') ||
    n.includes('สระน้ำ') ||
    n.includes('ถังกรองระบบประปา') ||
    n.includes('ท่อเมนประปา') ||
    n.includes('ระบบจ่ายน้ำประปา') ||
    n.includes('ธนาคารน้ำใต้ดิน') ||
    n.includes('ประตูระบายน้ำ') ||
    n.includes('คลองสวย น้ำใส')
  ) {
    // Avoid road landmarks e.g. "สายข้างประปา"
    if (!(n.includes('ถนน') && (n.includes('ข้างประปา') || n.includes('สายประปา') || n.includes('ไปประปา')))) {
      return 'water';
    }
  }

  // 3. ELECTRIC / SOLAR LIGHTING / CCTV
  if (
    n.includes('ชุดเสาไฟถนน') ||
    n.includes('ไฟกระพริบ') ||
    n.includes('สัญญาณไฟ') ||
    n.includes('กล้องโทรทัศน์วงจรปิด') ||
    n.includes('กล้องวงจรปิด') ||
    n.includes('cctv') ||
    n.includes('หม้อแปลง') ||
    n.includes('ไฟฟ้า') ||
    n.includes('ไฟส่องสว่าง') ||
    (n.includes('โซล่า') && !n.includes('เพื่อการเกษตร') && !n.includes('สมาร์ทเพียว')) ||
    (n.includes('โซลาร์') && !n.includes('เพื่อการเกษตร') && !n.includes('สมาร์ทเพียว'))
  ) {
    return 'electric';
  }

  // 4. ASPHALT ROADS (Must check before concrete because "แอสฟัลท์ติกคอนกรีต" contains "คอนกรีต"!)
  if (
    n.includes('แอสฟัล') ||
    n.includes('ลาดยาง') ||
    n.includes('เคปซีล') ||
    n.includes('cape seal') ||
    n.includes('overlay') ||
    n.includes('over lay') ||
    n.includes('พาราแอสฟัลท์')
  ) {
    return 'road_asphalt';
  }

  // 5. CONCRETE ROADS (คสล. / คอนกรีตเสริมเหล็ก เฉพาะผิวจราจร)
  if (
    n.includes('ถนนคอนกรีต') ||
    n.includes('ถนน คสล') ||
    n.includes('ผิวถนนคอนกรีต') ||
    (n.includes('คอนกรีตเสริมเหล็ก') && (n.includes('ถนน') || n.includes('สาย') || n.includes('ผิวจราจร') || n.includes('ทางหลวงท้องถิ่น')))
  ) {
    return 'road_concrete';
  }

  // 6. GRAVEL / CRUSHED ROCK / DIRT ROADS (หินคลุก / ดิน / ลูกรัง)
  // Check on name only (don't check target shoulder "พร้อมลูกรังไหล่ทาง"!)
  if (
    n.includes('หินคลุก') ||
    n.includes('ลูกรัง') ||
    n.includes('ถนนดิน') ||
    (n.includes('ถนน') && n.includes('บดอัด'))
  ) {
    return 'road_gravel';
  }

  // 7. BUILDINGS / COMMUNITY SPACES / DAYCARE / ROOF
  if (
    n.includes('อาคาร') ||
    n.includes('ศาลา') ||
    n.includes('ศูนย์พัฒนาเด็กเล็ก') ||
    n.includes('ศพด') ||
    n.includes('หอประชุม') ||
    n.includes('ห้องน้ำ') ||
    n.includes('รั้ว') ||
    n.includes('ป้าย') ||
    n.includes('สำนักงาน') ||
    n.includes('ลานกีฬา') ||
    n.includes('สนามกีฬา') ||
    n.includes('ลาน คสล') ||
    n.includes('หลังคา') ||
    n.includes('ปรับปรุงภูมิทัศน์ที่ทำการ')
  ) {
    return 'building';
  }

  // 8. AGRICULTURE & ENVIRONMENT (สูบน้ำเพื่อการเกษตร, ขยะ, ปุ๋ย, ปลูกพืช, กล้าไม้)
  if (
    n.includes('เพื่อการเกษตร') ||
    n.includes('เกษตร') ||
    n.includes('ขยะ') ||
    n.includes('ปุ๋ย') ||
    n.includes('ปลูกพืช') ||
    n.includes('สิ่งแวดล้อม') ||
    n.includes('รักษ์โลก') ||
    n.includes('พันธุ์พืช') ||
    n.includes('กล้าไม้') ||
    n.includes('ปลูกป่า') ||
    n.includes('ตอซัง') ||
    n.includes('ฮอร์โมน') ||
    n.includes('สมุนไพร') ||
    n.includes('ปลูกผัก') ||
    n.includes('หน่อไม้ฝรั่ง') ||
    n.includes('เลี้ยงกบ') ||
    n.includes('พันธุกรรมพืช') ||
    n.includes('รักป่า')
  ) {
    return 'agriculture';
  }

  // 9. EQUIPMENT / VEHICLES / HARDWARE (ครุภัณฑ์)
  if (
    n.includes('ครุภัณฑ์') ||
    n.includes('จัดซื้อรถ') ||
    n.includes('รถยนต์บรรทุก') ||
    n.includes('รถดับเพลิง') ||
    n.includes('รถบรรทุก') ||
    n.includes('เครื่องคอมพิวเตอร์') ||
    n.includes('เครื่องพิมพ์') ||
    n.includes('ตู้เย็น') ||
    n.includes('เครื่องตัดหญ้า') ||
    n.includes('เครื่องฉีดน้ำ') ||
    n.includes('เครื่องเจาะดิน') ||
    n.includes('เครื่องพ่นหมอกควัน') ||
    n.includes('ถังออกซิเจน') ||
    n.includes('กระจกโค้ง')
  ) {
    return 'equipment';
  }

  // 10. SOCIAL / HEALTH / WELFARE / EDUCATION / TRADITION
  if (
    n.includes('ผู้สูงอายุ') ||
    n.includes('สงเคราะห์') ||
    n.includes('ประเพณี') ||
    n.includes('การศึกษา') ||
    n.includes('กีฬา') ||
    n.includes('สาธารณสุข') ||
    n.includes('สุขภาพ') ||
    n.includes('เยาวชน') ||
    n.includes('ยาเสพติด') ||
    n.includes('อบรม') ||
    n.includes('ฝึกอบรม') ||
    n.includes('แข่งขัน') ||
    n.includes('โรค') ||
    n.includes('ครอบครัว') ||
    n.includes('เบี้ยยังชีพ') ||
    n.includes('คนพิการ') ||
    n.includes('ผู้ด้อยโอกาส') ||
    n.includes('คุณธรรม') ||
    n.includes('จิตอาสา') ||
    n.includes('สตรี') ||
    n.includes('เลือกตั้ง') ||
    n.includes('วันสถาปนา') ||
    n.includes('ท้องถิ่นไทย') ||
    n.includes('อบต. เคลื่อนที่') ||
    n.includes('หมวกนิรภัย') ||
    n.includes('อปพร') ||
    n.includes('บรรเทาสาธารณภัย') ||
    n.includes('ความปลอดภัยในสถานศึกษา') ||
    n.includes('ห้องเรียนคุณภาพ') ||
    n.includes('ความมั่นคงทางอาหาร') ||
    n.includes('ฝึกอาชีพ') ||
    n.includes('ช่วยบริจาคโลหิต') ||
    n.includes('กองทุนเลือด') ||
    n.includes('สวัสดิการชุมชน') ||
    n.includes('ช่วยเหลือประชาชน') ||
    n.includes('ยั่งยืน (sustainable village)') ||
    n.includes('เศรษฐกิจพอเพียง') ||
    n.includes('ทำความสะอาด') ||
    n.includes('ขับขี่ปลอดภัย')
  ) {
    return 'social';
  }

  return 'other';
}

/** Legacy alias */
export const detectWorkCategory = (text: string): WorkCategoryKey => classifySongyangProject(text);
