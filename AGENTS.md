<!-- BEGIN:songyang-production-topology -->
### Production topology
- Primary UI: Next.js App Router on Vercel at `https://songyang-plan.vercel.app`.
- Vercel-only: one canonical production app; historical snapshots are test fixtures, never deployment targets.
- Vercel Hobby releases use the exact pushed SHA from a git-free stage per workspace-root `AGENTS.md`.
- Production search policy: `noindex,nofollow`; `/robots.txt` disallows all crawlers per ADR 0006.
<!-- END:songyang-production-topology -->

# Workspace Rules & Directives for Songyang Projects

All autonomous agents and pair-programming assistants working in this repository MUST strictly comply with these 9 mandatory directives:

## 1. บังคับทำแผนงานก่อนแก้ไขไฟล์ทุกครั้ง (Mandatory Implementation Plan)
- ก่อนจะลงมือแก้โค้ดหรือแก้ไขไฟล์ใดๆ ในโปรเจกต์ **ต้องจัดทำและนำเสนอแผนการทำงาน (`implementation_plan.md`) ให้ผู้ใช้ตรวจสอบและอนุมัติก่อนเสมอทุกครั้ง**
- ห้ามแก้ไขไฟล์โค้ดโดยตรงก่อนได้รับความเห็นชอบจากผู้ใช้

## 2. ลิงก์พรีวิวที่คลิกได้ในทุกการสรุปงาน (Clickable Preview Links)
- เมื่อรายงานผลหรือสรุปความคืบหน้า ต้องแนบลิงก์พรีวิวในรูปแบบ Markdown Link ที่สามารถคลิกได้เสมอ เช่น:
  `👉 [คลิกเพื่อเปิดพรีวิว (URL)](URL)`

## 3. ทดสอบเบื้องหลังเสมอ (Headless / Background Testing)
- การรันทดสอบระบบต้องทำแบบ Headless ในเบื้องหลัง ห้ามเปิดหน้าต่างเบราว์เซอร์ป๊อปอัปขึ้นมารบกวนผู้ใช้

## 4. อัปเดต Build Version ทุกครั้งที่มีการแก้ไข (Mandatory Build Version Bump)
- ทุกครั้งที่มีการแก้ไขโค้ดหรือจบการทำงานในแต่ละรอบงาน **ต้องอัปเดตเลข `BUILD_VERSION` ใน `src/lib/build-version.js` ให้ตรงกับวันเวลาปัจจุบัน (เวลาประเทศไทย UTC+7: `YYYY-MM-DD HH:mm (v1.0.X)`) เสมอ**

## 5. วิเคราะห์ผลกระทบอย่างรอบคอบหลายรอบก่อนลบโค้ด (Mandatory Code Deletion Impact Analysis)
- ทุกครั้งที่จะมีการลบโค้ด ฟังก์ชัน ตัวแปร สไตล์ หรือตรรกะใดๆ ออกจากระบบ:
  1. **ต้องย้อนคิดและวิเคราะห์อย่างละเอียดซ้ำหลายๆ รอบ** ว่าจะส่งผลกระทบต่อส่วนอื่นๆ ของโปรเจกต์หรือไม่
  2. หากการลบนั้นมีผลกระทบ หรือมีความเสี่ยงต่อระบบ **ต้องแจ้งเตือนและระบุรายละเอียดผลกระทบให้ผู้ใช้ทราบอย่างชัดเจนในแผนงานเสมอ**

## 6. ห้ามใช้อิโมจิระบบเครื่องโดยเด็ดขาด 100% (Strict Zero System Emojis Directive)
- **ห้ามใช้ System Emojis หรือ OS Unicode Emojis ของระบบปฏิบัติการเครื่อง (เช่น `☀️`, `🌙`, `⚠️`, `✨`, `🔍`, `📍`, `⏳`, `📈`, `📉`, `⛽`, `🚗`, `📁`, `📄`, `📊`, `📋`, `📌`, `📷`, `🛠️` ฯลฯ) ใน Source Code, หน้าจอ UI, ข้อความแจ้งเตือน, หรือ Badge โดยเด็ดขาด 100% ในทุกโปรเจกต์**
- **ให้ใช้ Vector SVG Components แท้ที่ออกแบบเฉพาะและตรงตามธีมของแต่ละโปรเจกต์เสมอ** (เช่น `IconSun`, `IconMoon`, `IconSearch`, `IconMapPin`, `IconTrendingUp`, `IconTrendingDown`, `IconFuel`, `IconAlertTriangle`, `IconX` เป็นต้น)

## 7. รองรับ Reduce Motion และปรับแต่งเอฟเฟกต์อย่างยืดหยุ่น (Reduce Motion & Adaptive FX Directive)
- **เครื่องที่เปิดอนิเมชั่นปกติ (Motion Enabled)**: แสดงผลอนิเมชั่น, การเคลื่อนไหว, แสงเงา, และเอฟเฟกต์ตามธีมการออกแบบเฉพาะของแต่ละโปรเจกต์อย่างเต็มประสิทธิภาพ
- **เครื่องที่เปิดโหมด Reduce Motion (ตัดอนิเมชั่น/ลดเอฟเฟกต์) หรือสเปกจำกัด**:
  1. ต้องรองรับ `@media (prefers-reduced-motion: reduce)` อย่างเคร่งครัด 100% ในทุกไฟล์สไตล์
  2. สลับเป็นสีพื้นหลังทึบแสง (Solid Opaque) หรือลดความโปร่งใสลงทันทีเพื่อป้องกันตัวหนังสือซ้อนทับ
  3. ปิดหรือตัดความยาวของ Transitions/Animations ให้เหลือ 0 (`0.001ms`) และปิด Smooth Scroll เพื่อขจัดอาการกระพริบ (Flickering), การฉีกขาดของภาพ (Tearing) หรืออาการกระตุกของ GPU 100%

## 8. มาตรฐานกระจกใสต้องเบลอระดับลึกและคุมความทึบแสงป้องกันตัวหนังสือทะลุ (Frosted Glass Deep-Blur & Anti-Bleed Directive)
- **เมื่อใช้สไตล์กระจกใส (Frosted Glass / Glassmorphism)**:
  1. **ต้องใส่ค่าความเบลอระดับลึกเสมอ (Deep Blur)**: บังคับใช้ `backdrop-filter: blur(28px) saturate(190%)` (พร้อม `-webkit-backdrop-filter`) ขึ้นไป เพื่อให้ฉากหลังและตัวหนังสือข้างหลังละลายตัวสนิท ไม่เหลือโครงร่างมารบกวนสายตา
  2. **ควบคุมความทึบแสงของเนื้อสีพื้นหลัง (Calibrated Anti-Bleed Opacity)**: ปรับความทึบแสงให้อยู่ระหว่าง `0.92` – `0.96` (เช่น `bg-white/95` หรือ `bg-[#0c1222]/95`) ห้ามโปร่งใสบางเกินไป เพื่อป้องกันตัวหนังสือข้างหลังทะลุขึ้นมาซ้อนทับกันเด็ดขาด 100%
  3. **เส้นขอบและเงาต้องคมชัด (Specular Border & Elevation)**: ใส่เส้นขอบบาง `border border-black/[0.08] dark:border-white/[0.12]` พร้อมเงา `shadow-2xl` เพื่อแยกเลเยอร์ให้ลอยเด่นชัดเจน

## 9. มาตรฐานระบบแคชซ่อมแซมตัวเองอัตโนมัติ (Self-Healing Cache & Proactive Upgrade Directive)
- **สถาปัตยกรรมแคชที่ปลอดภัยและซ่อมแซมตัวเองได้ (Self-Healing Cache)**:
  1. **Safe-Parse & Auto-Purge**: ทุกจุดที่มีการอ่าน `localStorage` หรือ `sessionStorage` ต้องหุ้มด้วย `try...catch` เสมอ หากข้อมูลแคชในเครื่องเสียหาย, Invalid JSON, หรือไม่ตรง Schema ให้สั่งลบ Key นั้นทิ้งทันที (Auto-Purge) และดึงข้อมูลใหม่จากฐานข้อมูลมาเขียนทับใหม่โดยอัตโนมัติ
  2. **Authoritative Cloud Truth**: ฐานข้อมูลออนไลน์ (Supabase) คือแหล่งความจริงสูงสุดเสมอ แคชในเครื่องเป็นเพียงสำเนาชั่วคราวเพื่อความเร็ว
  3. **Zero Blocking Storage Alerts**: ห้ามใช้ `window.alert()` ในการจัดการ Storage เด็ดขาด เพื่อป้องกันปัญหา Alert Loop บล็อกหน้าจอ
  4. **In-Memory Fallback & Dedicated Outbox**: หากพื้นที่จัดเก็บของเบราว์เซอร์เต็ม (`QuotaExceededError`) ระบบต้องทำงานต่อบน In-Memory State ได้อย่างราบรื่นโดยไม่หยุดทำงาน และต้องแยก Key คิวงานออฟไลน์รอส่ง (Outbox) ออกจากแคชแสดงผลทั่วไปเพื่อป้องกันข้อมูลสูญหาย
- **การแนะนำระบบแคชที่ดีกว่าเชิงรุก (Proactive Recommendations)**:
  - หากผู้ช่วย AI หรือผู้พัฒนาพบเทคโนโลยีหรือสถาปัตยกรรมแคชที่มีประสิทธิภาพสูงกว่า (เช่น IndexedDB Sharding, OPFS, CRDTs, หรือ Web Locks API) **สามารถและควรแนะนำผู้ใช้งานเชิงรุก** เพื่อวางแผนอัปเกรดและปรับปรุงประสิทธิภาพระบบแคชให้ดียิ่งขึ้นได้เสมอ

## 10. ข้อกำหนดโครงสร้างระบบและสถาปัตยกรรมการเผยแพร่ (Production Topology & Toolchain Integrity)
- **Modern Stack**: Next.js 16.3.8, React 19.2.8, Turbopack, Node 24.x, TypeScript 6.0.3
- **Canonical Production URL**: https://songyang-plan.vercel.app
- **Local Development Port**: 3014

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
