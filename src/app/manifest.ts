import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'แผนพัฒนาท้องถิ่น อบต.สงยาง',
    short_name: 'Songyang Plan',
    description: 'ระบบสืบค้นแผนพัฒนาท้องถิ่น อบต.สงยาง ตรวจสอบประวัติการแก้ไขและพิมพ์หน้าเอกสารสแกนจริง',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    background_color: '#f8fafc',
    theme_color: '#0c1829',
    icons: [
      { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
  };
}
