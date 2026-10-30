export interface Strategy {
  no: number;
  name: string;
  shortName: string;
}

export const SONGYANG_STRATEGIES: Strategy[] = [
  {
    no: 1,
    name: 'การพัฒนาด้านโครงสร้างพื้นฐานทุกด้านอย่างสมดุล',
    shortName: 'โครงสร้างพื้นฐาน',
  },
  {
    no: 2,
    name: 'การพัฒนาด้านการส่งเสริมอาชีพอย่างยั่งยืน',
    shortName: 'ส่งเสริมอาชีพ',
  },
  {
    no: 3,
    name: 'การพัฒนาด้านการศึกษา ศาสนา ประเพณี และวัฒนธรรม',
    shortName: 'การศึกษาและวัฒนธรรม',
  },
  {
    no: 4,
    name: 'การพัฒนาด้านสาธารณสุข',
    shortName: 'สาธารณสุข',
  },
  {
    no: 5,
    name: 'การพัฒนาด้านการส่งเสริมคุณภาพชีวิต สวัสดิการสังคมและสังคมสงเคราะห์',
    shortName: 'คุณภาพชีวิตและสวัสดิการ',
  },
  {
    no: 6,
    name: 'การพัฒนาด้านการบริหารจัดการองค์กร',
    shortName: 'การบริหารจัดการองค์กร',
  },
  {
    no: 7,
    name: 'การพัฒนาด้านทรัพยากรธรรมชาติและสิ่งแวดล้อม',
    shortName: 'ทรัพยากรธรรมชาติและสิ่งแวดล้อม',
  },
];

export function getStrategy(no: number): Strategy | undefined {
  return SONGYANG_STRATEGIES.find((s) => s.no === no);
}
