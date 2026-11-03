'use client';

import React from 'react';
import { type LocalPlanProject } from '../../domain/types.ts';
import type { PrintPackMode } from './ProjectDetailModal.tsx';

interface PrintOfficialSheetProps {
  project: LocalPlanProject | null;
  printMode?: PrintPackMode;
}

export function PrintOfficialSheet({
  project,
  printMode = 'table_only',
}: PrintOfficialSheetProps) {
  if (!project) return null;

  const allPages = project.lineage?.officialScanPages || [];
  const tablePages = allPages.filter(
    (pg) => pg.role === 'table_old' || pg.role === 'table_current'
  );
  const pagesToPrint =
    printMode === 'full_official_pack'
      ? allPages
      : tablePages.length > 0
      ? tablePages
      : allPages;

  if (pagesToPrint.length === 0) {
    const fallbackUrl = `/official-pages/${project.documentId}/p${String(project.pdfPage).padStart(3, '0')}.webp`;
    return (
      <div className="print-only hidden bg-white text-black m-0 p-0">
        <div className="print-scan-page">
          <img
            src={fallbackUrl}
            alt={project.name}
            className="w-full h-auto object-contain"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="print-only hidden bg-white text-black m-0 p-0">
      {pagesToPrint.map((pg, idx) => (
        <div
          key={`${pg.role}-${pg.pageNumber}`}
          className="print-scan-page"
          style={{
            pageBreakAfter: idx < pagesToPrint.length - 1 ? 'always' : 'auto',
            breakAfter: idx < pagesToPrint.length - 1 ? 'page' : 'auto',
          }}
        >
          <img
            src={pg.imageUrl}
            alt={pg.label}
            className="w-full h-full max-h-[190mm] object-contain mx-auto block"
          />
        </div>
      ))}
    </div>
  );
}
