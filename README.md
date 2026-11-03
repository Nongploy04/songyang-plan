# songyang-plan — ระบบสืบค้นแผนพัฒนาท้องถิ่น อบต.สงยาง (พ.ศ. 2561–2575)

เว็บแอปพลิเคชันสำหรับสืบค้นโครงการตามแผนพัฒนาท้องถิ่น ตรวจสอบสายพันธุ์การแก้ไข/เปลี่ยนแปลงโครงการ (Revision Lineage) และสั่งพิมพ์หน้าเอกสารสแกนต้นฉบับจริง (Official Scanned Document Print) ของ **องค์การบริหารส่วนตำบลสงยาง อำเภอมหาชนะชัย จังหวัดยโสธร**

- **Production URL**: https://songyang-plan.vercel.app
- **Portal Hub**: https://songyang-portal.vercel.app
- **Local Development Port**: `3014` (`http://localhost:3014`)
- **แหล่งข้อมูลต้นฉบับ**: ดาวน์โหลดจากเว็บไซต์ทางการ อบต.สงยาง (`https://www.songyang-yasothon.go.th/data_12228`)

---

## จุดเด่นของระบบ (Key Features)

1. **ฐานข้อมูลโครงการจริงครบถ้วน 100% (515 โครงการ / 20 เล่มเอกสาร)**
   - แผนพัฒนาท้องถิ่น (พ.ศ. 2571–2575) ฉบับหลัก ครบทั้ง 7 ยุทธศาสตร์ รวม **419 โครงการ** (ตรงตามตารางสรุปแบบ ผ.01 หน้า 66)
   - แผนพัฒนาท้องถิ่น (พ.ศ. 2566–2570) ฉบับแก้ไข/เพิ่มเติม/เปลี่ยนแปลง ปี พ.ศ. 2568–2569 รวม **96 โครงการ/รายการ**
   - แสดงผลด้วยตัวเลขอารบิก (`0-9`) ทั้งระบบ 100% เพื่อความชัดเจนในการอ่านงบประมาณ พ.ศ. และเลขหน้าอ้างอิง

2. **พิมพ์หน้าเอกสารสแกนต้นฉบับจริง (Real Official Scanned Page Print)**
   - ไม่ใช้การเรนเดอร์ตาราง HTML ใหม่ แต่สั่งพิมพ์ภาพสแกนหน้าเอกสารจริงจากเล่มแผนพัฒนาท้องถิ่นที่ตัดด้วยความละเอียดสูง (`288 หน้า` ใน `public/official-pages/<documentId>/p<page>.webp`) ลงบนกระดาษ A4 แบบเต็มหน้า
   - รองรับ 2 โหมดการพิมพ์เพื่อแนบเรื่องเบิกจ่าย/จัดซื้อจัดจ้าง:
     - **พิมพ์เฉพาะหน้าตารางโครงการ** (`table_only`)
     - **พิมพ์ชุดเอกสารแนบเบิกจ่ายครบชุด** (`full_official_pack`: หน้าปกเล่มแผน + หน้าประกาศนายก อบต.สงยาง พร้อมลายเซ็นและตราครุฑ + หน้าตารางโครงการจริง)

3. **ตรวจสอบสายพันธุ์และประวัติการแก้ไขโครงการ (Project Revision Lineage)**
   - ระบุชัดเจนว่าแต่ละโครงการอยู่เล่มใดเป็นต้นฉบับ ผ่านการแก้ไข/เปลี่ยนแปลง/เพิ่มเติมในฉบับใดบ้าง และปัจจุบันใช้ข้อมูลจากเล่มใดเป็นฉบับล่าสุด
   - แสดงตารางเปรียบเทียบข้อความเดิมเทียบกับข้อความที่แก้ไขใหม่ พร้อมเหตุผลความจำเป็นทางราชการ และปุ่มดูภาพสแกนตารางเดิมเทียบกับตารางใหม่

4. **สถาปัตยกรรมตามมาตรฐานเครือ Songyang (Fleet Standards)**
   - **Strict Zero System Emojis**: ใช้ Pure Vector SVG Icons (`src/components/Icons.tsx`) 100%
   - **Self-Healing Cache**: จัดการ `localStorage` ด้วย `safeBrowserStorage.ts` (`try...catch` + Auto-Purge เมื่อ JSON เสียหาย + In-Memory Fallback)
   - **Reduce Motion & Frosted Glass**: รองรับ `@media (prefers-reduced-motion: reduce)` และ Deep Blur (`backdrop-filter: blur(28px) saturate(190%)`)
   - **BFF Health Endpoint**: มี `/api/bff/health` สำหรับเชื่อมต่อระบบตรวจสอบสถานะของ `songyang-portal`

---

## การรันระบบในเครื่อง (Local Development)

```bash
cd songyang-plan
npm install
npm run dev
# เปิดเบราว์เซอร์ที่ http://localhost:3014
```

## การรันชุดทดสอบและตรวจสอบ (Testing & Verification)

```bash
# รันชุดทดสอบ Headless (ตรวจสอบตัวเลขอารบิก, ยอดรวมงบประมาณ, และความครบถ้วนของไฟล์ภาพสแกนทั้ง 288 หน้า)
npm test

# ทดสอบ Production Build
npm run build
```

---

## โครงสร้างโปรเจกต์ (Project Structure)

```text
songyang-plan/
├── pipeline/
│   ├── download_plans.py          # สคริปต์ดาวน์โหลดไฟล์ PDF แผนพัฒนาท้องถิ่นจากเว็บ อบต.สงยาง
│   └── slice_official_pages.py    # สคริปต์ตัดหน้า PDF ต้นฉบับเป็นภาพสแกน WebP ความละเอียดสูง
├── public/
│   └── official-pages/            # ภาพสแกนหน้าเอกสารจริง 288 หน้า แยกตามรหัสเล่มเอกสาร (20 เล่ม)
├── src/
│   ├── app/
│   │   ├── api/bff/health/        # BFF Health Endpoint สำหรับเชื่อมต่อกับ songyang-portal
│   │   ├── layout.tsx             # Root Layout + RscRetryBoundary + Metadata
│   │   ├── manifest.ts            # PWA Web App Manifest
│   │   ├── robots.ts              # นโยบาย noindex, nofollow (ADR 0006)
│   │   └── page.tsx               # หน้าจอหลักสืบค้นแผนพัฒนาท้องถิ่น + สรุปแบบ ผ.01 + ระบบพิมพ์หน้าจริง
│   ├── components/
│   │   ├── Icons.tsx              # Pure Vector SVG Icons ประจำระบบ
│   │   └── RscRetryBoundary.tsx   # Error Boundary และระบบล้างแคชอัตโนมัติ
│   ├── data/
│   │   └── initialProjects.ts     # ฐานข้อมูลโครงการจริง 515 โครงการ พร้อมพิกัดหน้าสแกนและประวัติแก้ไข
│   ├── domain/
│   │   ├── types.ts               # TypeScript Interfaces (LocalPlanProject, OfficialScanPage, ProjectLineage)
│   │   ├── documents.ts           # ทะเบียนเอกสารแผนพัฒนาท้องถิ่น 20 เล่ม และตารางสรุปแบบ ผ.01
│   │   ├── strategies.ts          # ข้อมูล 7 ยุทธศาสตร์การพัฒนาของ อบต.สงยาง
│   │   ├── villages.ts            # ข้อมูล 8 หมู่บ้านในตำบลสงยาง (หมู่ที่ 1–8)
│   │   ├── numerals.ts            # ฟังก์ชันแปลงและจัดรูปแบบตัวเลขอารบิกและงบประมาณ
│   │   └── citation.ts            # ฟังก์ชันสร้างข้อความอ้างอิงเอกสารราชการสำหรับแนบบันทึกข้อความ
│   ├── features/
│   │   ├── search/                # SearchBar และ FilterPanel (กรองตามเล่มแผน, ยุทธศาสตร์, หมู่บ้าน, ปีงบประมาณ)
│   │   └── project/               # ProjectCard, ProjectDetailModal และ PrintOfficialSheet
│   └── lib/
│       ├── build-version.js       # หมายเลข Build Version มาตรฐานเครือ Songyang
│       └── safeBrowserStorage.ts  # Self-Healing Cache สำหรับ localStorage
└── tests/
    └── domain.test.mjs            # ชุดทดสอบ Headless ตรวจสอบความถูกต้องของข้อมูลและไฟล์ภาพสแกน
```

ดูรายละเอียดบัญชีเอกสารทั้ง 20 เล่มใน [PLAN.md](PLAN.md) และแผนพัฒนาต่อยอดใน [ROADMAP.md](ROADMAP.md)
