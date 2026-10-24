import { readJSON, writeJSON } from './storage';

export type ThemeId = 'sage' | 'playful' | 'dark' | 'professional';

export interface ThemeMeta {
  id: ThemeId;
  name: string;
  description: string;
  /** Two swatch colours for the picker */
  swatch: [string, string];
}

export const THEMES: ThemeMeta[] = [
  { id: 'sage', name: 'Sage', description: 'Warm off-white with a muted green accent.', swatch: ['#f7f6f2', '#859681'] },
  { id: 'playful', name: 'Playful', description: 'Cream, soft yellow and pastel tiles with rounded corners.', swatch: ['#fce48d', '#7b6ce0'] },
  { id: 'dark', name: 'Dark', description: 'Low-light palette; follows your system setting by default.', swatch: ['#1c1f1d', '#9dbb96'] },
  { id: 'professional', name: 'Professional', description: 'Cool grey, navy and serif headings.', swatch: ['#10213a', '#5a83be'] },
];

export const THEME_KEY = 'theme';
const VALID = new Set<string>(THEMES.map((t) => t.id));

export function isThemeId(value: unknown): value is ThemeId {
  return typeof value === 'string' && VALID.has(value);
}

/** The theme to use when nothing has been chosen: dark if the OS prefers it, otherwise sage. */
export function systemDefaultTheme(): ThemeId {
  try {
    if (typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) return 'dark';
  } catch {
    /* ignore */
  }
  return 'sage';
}

export function readStoredTheme(): ThemeId | null {
  const saved = readJSON<unknown>(THEME_KEY, null);
  return isThemeId(saved) ? saved : null;
}

export function applyTheme(theme: ThemeId): void {
  if (typeof document === 'undefined') return;
  if (theme === 'sage') document.documentElement.removeAttribute('data-theme');
  else document.documentElement.setAttribute('data-theme', theme);
}

export function saveTheme(theme: ThemeId): void {
  writeJSON(THEME_KEY, theme);
  applyTheme(theme);
}

export function currentTheme(): ThemeId {
  return readStoredTheme() ?? systemDefaultTheme();
}
