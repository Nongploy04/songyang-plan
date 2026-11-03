import { NextResponse } from 'next/server';
import { BUILD_VERSION } from '@/lib/build-version.js';
import { INITIAL_PLAN_PROJECTS } from '@/data/initialProjects';
import { PLAN_DOCUMENTS } from '@/domain/documents';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  const projectCount = INITIAL_PLAN_PROJECTS.length;
  const documentCount = PLAN_DOCUMENTS.length;
  const ok = projectCount > 0 && documentCount > 0;

  return NextResponse.json(
    {
      ok,
      status: ok ? 'healthy' : 'degraded',
      service: 'songyang-plan',
      buildVersion: BUILD_VERSION,
      data: {
        status: ok ? 'healthy' : 'degraded',
        projectCount,
        documentCount,
      },
    },
    {
      status: ok ? 200 : 503,
      headers: { 'Cache-Control': 'no-store' },
    },
  );
}
