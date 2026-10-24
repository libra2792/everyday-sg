/**
 * Thin, defensive wrapper around localStorage.
 * All Everyday SG keys are namespaced so export / import / reset can find them.
 * Nothing here ever leaves the browser.
 */

export const STORAGE_PREFIX = 'everydaysg:';
export const EXPORT_FORMAT = 'everyday-sg-profile';
export const EXPORT_VERSION = 1;

function canUseStorage(): boolean {
  try {
    return typeof window !== 'undefined' && !!window.localStorage;
  } catch {
    return false;
  }
}

export function storageKey(name: string): string {
  return name.startsWith(STORAGE_PREFIX) ? name : `${STORAGE_PREFIX}${name}`;
}

export function readJSON<T>(name: string, fallback: T): T {
  if (!canUseStorage()) return fallback;
  try {
    const raw = window.localStorage.getItem(storageKey(name));
    if (raw === null) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function writeJSON(name: string, value: unknown): boolean {
  if (!canUseStorage()) return false;
  try {
    window.localStorage.setItem(storageKey(name), JSON.stringify(value));
    return true;
  } catch {
    // Quota exceeded or storage disabled: the app keeps working in memory.
    return false;
  }
}

export function removeKey(name: string): void {
  if (!canUseStorage()) return;
  try {
    window.localStorage.removeItem(storageKey(name));
  } catch {
    /* ignore */
  }
}

export function allKeys(): string[] {
  if (!canUseStorage()) return [];
  const keys: string[] = [];
  try {
    for (let i = 0; i < window.localStorage.length; i += 1) {
      const key = window.localStorage.key(i);
      if (key && key.startsWith(STORAGE_PREFIX)) keys.push(key);
    }
  } catch {
    /* ignore */
  }
  return keys;
}

export interface ExportBundle {
  format: typeof EXPORT_FORMAT;
  version: number;
  exportedAt: string;
  data: Record<string, unknown>;
}

/** Collect every Everyday SG key into a portable JSON bundle. */
export function exportAll(): ExportBundle {
  const data: Record<string, unknown> = {};
  for (const key of allKeys()) {
    try {
      const raw = window.localStorage.getItem(key);
      if (raw !== null) data[key] = JSON.parse(raw);
    } catch {
      /* skip unreadable entries */
    }
  }
  return { format: EXPORT_FORMAT, version: EXPORT_VERSION, exportedAt: new Date().toISOString(), data };
}

export interface ImportResult {
  ok: boolean;
  imported: number;
  error?: string;
}

/** Validate and restore a bundle produced by exportAll(). Existing keys are overwritten. */
export function importAll(input: unknown): ImportResult {
  if (!input || typeof input !== 'object') return { ok: false, imported: 0, error: 'The file is not a valid Everyday SG export.' };
  const bundle = input as Partial<ExportBundle>;
  if (bundle.format !== EXPORT_FORMAT || typeof bundle.data !== 'object' || bundle.data === null) {
    return { ok: false, imported: 0, error: 'The file is not a valid Everyday SG export.' };
  }
  let imported = 0;
  for (const [key, value] of Object.entries(bundle.data)) {
    if (!key.startsWith(STORAGE_PREFIX)) continue;
    if (writeJSON(key, value)) imported += 1;
  }
  return { ok: true, imported };
}

/** Remove every Everyday SG key. Other sites' data is untouched. */
export function clearAll(): number {
  const keys = allKeys();
  for (const key of keys) {
    try {
      window.localStorage.removeItem(key);
    } catch {
      /* ignore */
    }
  }
  return keys.length;
}

/** Approximate size of saved data in bytes, for the privacy panel. */
export function storageFootprintBytes(): number {
  let total = 0;
  for (const key of allKeys()) {
    try {
      total += (window.localStorage.getItem(key) || '').length + key.length;
    } catch {
      /* ignore */
    }
  }
  return total;
}

/** Trigger a file download of a JSON object. */
export function downloadJSON(filename: string, value: unknown): void {
  const blob = new Blob([JSON.stringify(value, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function uid(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID();
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}
