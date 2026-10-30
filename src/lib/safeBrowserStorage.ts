/**
 * safeBrowserStorage.ts
 * Exception-safe wrapper for localStorage and sessionStorage with automatic schema validation,
 * corrupted JSON auto-purge, and in-memory Map fallback for blocked/private/quota-exceeded states.
 */

const memoryFallback = new Map<string, string>();

export interface BrowserStorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

const resilientWrappers = new WeakMap<object, BrowserStorageLike>();
let memoryOnlyStorage: BrowserStorageLike | null = null;

export function getStorage(storageType: 'local' | 'session' = 'local'): Storage | null {
  try {
    if (storageType === 'local') {
      if (typeof window !== 'undefined' && window.localStorage) return window.localStorage;
      if (typeof globalThis !== 'undefined' && (globalThis as any).localStorage) return (globalThis as any).localStorage;
    } else {
      if (typeof window !== 'undefined' && window.sessionStorage) return window.sessionStorage;
      if (typeof globalThis !== 'undefined' && (globalThis as any).sessionStorage) return (globalThis as any).sessionStorage;
    }
    return null;
  } catch {
    return null;
  }
}

function createResilientStorage(base: BrowserStorageLike | null): BrowserStorageLike {
  const shadow = new Map<string, string>();
  let degraded = base === null;
  return {
    getItem(key) {
      if (!degraded && base) {
        try {
          const value = base.getItem(key);
          if (value === null) shadow.delete(key);
          else shadow.set(key, value);
          return value;
        } catch {
          degraded = true;
        }
      }
      return shadow.get(key) ?? null;
    },
    setItem(key, value) {
      const normalized = String(value);
      shadow.set(key, normalized);
      if (base) {
        try {
          base.setItem(key, normalized);
          degraded = false;
        } catch {
          degraded = true;
        }
      }
    },
    removeItem(key) {
      shadow.delete(key);
      if (base) {
        try {
          base.removeItem(key);
          degraded = false;
        } catch {
          degraded = true;
        }
      }
    },
  };
}

export function getResilientStorage(customStorage?: BrowserStorageLike | null): BrowserStorageLike {
  const base = customStorage === undefined ? getStorage('local') : customStorage;
  if (!base) {
    memoryOnlyStorage ||= createResilientStorage(null);
    return memoryOnlyStorage;
  }
  const cached = resilientWrappers.get(base as object);
  if (cached) return cached;
  const wrapper = createResilientStorage(base);
  resilientWrappers.set(base as object, wrapper);
  return wrapper;
}

export function safeGetText(
  key: string,
  fallback: string = '',
  customStorage?: BrowserStorageLike | null
): string {
  try {
    const s = customStorage !== undefined ? customStorage : getStorage('local');
    if (s) {
      const val = s.getItem(key);
      if (val !== null) return val;
    }
  } catch {}
  return memoryFallback.has(key) ? (memoryFallback.get(key) as string) : fallback;
}

export function safeSetText(
  key: string,
  value: string,
  customStorage?: BrowserStorageLike | null
): boolean {
  memoryFallback.set(key, value);
  try {
    const s = customStorage !== undefined ? customStorage : getStorage('local');
    if (s) {
      s.setItem(key, value);
      return true;
    }
  } catch {}
  return false;
}

export function safeRemove(
  key: string,
  customStorage?: BrowserStorageLike | null
): void {
  memoryFallback.delete(key);
  try {
    const s = customStorage !== undefined ? customStorage : getStorage('local');
    if (s) {
      s.removeItem(key);
    }
  } catch {}
}

export function safeGetJson<T>(
  key: string,
  guard: (val: unknown) => boolean = () => true,
  fallback: T,
  customStorage?: BrowserStorageLike | null
): T {
  const raw = safeGetText(key, '', customStorage);
  if (!raw) return fallback;
  try {
    const parsed = JSON.parse(raw);
    if (guard(parsed)) return parsed as T;
    safeRemove(key, customStorage);
    return fallback;
  } catch {
    safeRemove(key, customStorage);
    return fallback;
  }
}

export function safeSetJson<T>(
  key: string,
  value: T,
  customStorage?: BrowserStorageLike | null
): boolean {
  try {
    const raw = JSON.stringify(value);
    return safeSetText(key, raw, customStorage);
  } catch {
    return false;
  }
}
