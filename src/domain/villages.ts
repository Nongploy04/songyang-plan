export interface Village {
  no: number;
  name: string;
  fullName: string;
}

export const SONGYANG_VILLAGES: Village[] = [
  { no: 1, name: 'บ้านสงยาง', fullName: 'หมู่ที่ 1 บ้านสงยาง' },
  { no: 2, name: 'บ้านสร้างแป้น', fullName: 'หมู่ที่ 2 บ้านสร้างแป้น' },
  { no: 3, name: 'บ้านซำ', fullName: 'หมู่ที่ 3 บ้านซำ' },
  { no: 4, name: 'บ้านบ่อบึง', fullName: 'หมู่ที่ 4 บ้านบ่อบึง' },
  { no: 5, name: 'บ้านดงขวาง', fullName: 'หมู่ที่ 5 บ้านดงขวาง' },
  { no: 6, name: 'บ้านสร้างแป้น', fullName: 'หมู่ที่ 6 บ้านสร้างแป้น' },
  { no: 7, name: 'บ้านโพนจาน', fullName: 'หมู่ที่ 7 บ้านโพนจาน' },
  { no: 8, name: 'บ้านสงยาง', fullName: 'หมู่ที่ 8 บ้านสงยาง' },
];

export function getVillageLabel(no: number): string {
  const v = SONGYANG_VILLAGES.find((item) => item.no === no);
  return v ? v.fullName : `หมู่ที่ ${no}`;
}
