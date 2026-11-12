// =========================================================================
// MANDATORY AI RULE: bump BUILD_VERSION on EVERY code change before build/push.
// Format: 'YYYY-MM-DD HH:mm (v1.0.X)' — Asia/Bangkok (UTC+7), HH:mm.
// This is the ONLY place to edit the stamp for this module.
//
// Production: GitHub Actions runs the verified release pipeline on push to main.
// Vercel is the only production host. For emergency local deployment,
// follow the central DEPLOY.md and use a verified stage without .git metadata.
// =========================================================================
export const BUILD_VERSION = '2026-11-12 12:49 (v1.0.19)';

export const PWA_VERSION_KEY = 'so_plan_pwa_version';

function canApplyBuildUpdate() {
  return navigator.onLine !== false && window.dispatchEvent(new CustomEvent('songyang:before-update', {
    cancelable: true, detail: { buildVersion: BUILD_VERSION },
  }));
}

/** Quiet footer label: Build YYYY-MM-DD HH:mm · vX.Y.Z */
export function formatBuildStamp(version = BUILD_VERSION) {
  const m = /^(\d{4}-\d{2}-\d{2} \d{2}:\d{2}) \((v[\d.]+)\)$/.exec(String(version).trim());
  if (!m) return `Build ${version}`;
  return `Build ${m[1]} · ${m[2]}`;
}

const APP_CACHE_PREFIXES = ['so_plan_', 'songyang-plan'];
const APP_SCOPE_PATHS = ['/', '/plan/'];

function isOwnedCache(name) {
  return APP_CACHE_PREFIXES.some((prefix) => String(name).startsWith(prefix));
}

function isOwnedRegistration(registration) {
  try {
    const scope = new URL(registration.scope);
    return scope.origin === window.location.origin
      && APP_SCOPE_PATHS.some((path) => scope.pathname === path || (path !== '/' && scope.pathname.startsWith(path)));
  } catch {
    return false;
  }
}

async function clearOwnedRuntime() {
  const names = 'caches' in window ? await caches.keys() : [];
  const registrations = 'serviceWorker' in navigator ? await navigator.serviceWorker.getRegistrations() : [];
  if (!canApplyBuildUpdate()) return false;
  const results = await Promise.allSettled([
    ...names.filter(isOwnedCache).map((name) => Promise.resolve().then(() => caches.delete(name))),
    ...registrations.filter(isOwnedRegistration).map((registration) => Promise.resolve().then(() => registration.unregister())),
  ]);
  if (results.some((result) => result.status === 'rejected')) throw new Error('Update runtime cleanup failed');
  return canApplyBuildUpdate();
}

let applyingUpdate = null;
function applyOwnedBuildUpdate() {
  if (applyingUpdate) return applyingUpdate;
  applyingUpdate = (async () => {
    if (!canApplyBuildUpdate() || !await clearOwnedRuntime() || !canApplyBuildUpdate()) return false;
    try { localStorage.setItem(PWA_VERSION_KEY, BUILD_VERSION); } catch { /* Retained work remains usable if version storage is unavailable. */ }
    window.location.reload();
    return true;
  })().finally(() => { applyingUpdate = null; });
  return applyingUpdate;
}

/** Offer the React prompt without acknowledging deferred or unfinished work. */
export function runBuildVersionGate(onUpdateAvailable) {
  try {
    const previousVersion = localStorage.getItem(PWA_VERSION_KEY);
    if (!previousVersion) {
      localStorage.setItem(PWA_VERSION_KEY, BUILD_VERSION);
      return;
    }
    if (previousVersion === BUILD_VERSION) return;
    const ready = window.dispatchEvent(new CustomEvent('songyang:before-update', {
      cancelable: true, detail: { buildVersion: BUILD_VERSION },
    }));
    if (!ready) return;
    const update = {
      buildVersion: BUILD_VERSION,
      applyUpdate: applyOwnedBuildUpdate,
      deferUpdate: () => ({ status: 'deferred' }),
    };
    if (typeof onUpdateAvailable === 'function') onUpdateAvailable(update);
    window.dispatchEvent(new CustomEvent('songyang:update-available', { detail: update }));
    return { status: 'update-available' };
  } catch (error) {
    console.warn('PWA version check error:', error);
    return { status: 'storage-unavailable' };
  }
}
