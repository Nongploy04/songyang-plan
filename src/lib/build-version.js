// =========================================================================
// MANDATORY AI RULE: bump BUILD_VERSION on EVERY code change before build/push.
// Format: 'YYYY-MM-DD HH:mm (v1.0.X)' Asia/Bangkok (UTC+7), HH:mm.
// =========================================================================
export const BUILD_VERSION = '2026-11-03 10:25 (v1.0.6)';

import { safeGetText, safeSetText } from './safeBrowserStorage';

export const PWA_VERSION_KEY = 'so_plan_pwa_version';

export function formatBuildStamp(version = BUILD_VERSION) {
  const m = /^(\d{4}-\d{2}-\d{2} \d{2}:\d{2}) \((v[\d.]+)\)$/.exec(String(version).trim());
  if (!m) return `Build ${version}`;
  return `Build ${m[1]} • ${m[2]}`;
}
