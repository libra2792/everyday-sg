import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { usePersistentState } from '@/lib/usePersistentState';
import { uid } from '@/lib/storage';
import { applyTheme, currentTheme, readStoredTheme, saveTheme, systemDefaultTheme, type ThemeId } from '@/lib/theme';

/* ---------------------------------------------------------------------- */
/* Types                                                                   */
/* ---------------------------------------------------------------------- */

export type AgeRange = '' | '18-24' | '25-34' | '35-44' | '45-54' | '55-64' | '65+';
export type Residency = '' | 'citizen' | 'pr' | 'other';
export type Household = '' | 'single' | 'partnered' | 'married' | 'parent' | 'supporting-parents';
export type HousingSituation = '' | 'with-family' | 'renting' | 'hdb-owner' | 'private-owner' | 'planning-to-buy';
export type Employment = '' | 'employed' | 'self-employed' | 'studying' | 'between-jobs' | 'retired';
export type Horizon = '' | 'next-3-months' | 'this-year' | '2-5-years' | 'long-term';

export const PRIORITY_OPTIONS = [
  { id: 'budget', label: 'Get my budget under control' },
  { id: 'debt', label: 'Clear debt or build savings' },
  { id: 'home', label: 'Buy or rent a home' },
  { id: 'baby', label: 'Prepare for a baby' },
  { id: 'parents', label: 'Support my parents' },
  { id: 'insurance', label: 'Sort out insurance' },
  { id: 'retirement', label: 'Plan for retirement' },
  { id: 'career', label: 'Change jobs or upskill' },
  { id: 'estate', label: 'Wills, LPA and nominations' },
  { id: 'admin', label: 'Sort out my life admin' },
] as const;

export type PriorityId = (typeof PRIORITY_OPTIONS)[number]['id'];

export interface Profile {
  ageRange: AgeRange;
  residency: Residency;
  household: Household[];
  housing: HousingSituation;
  employment: Employment;
  priorities: PriorityId[];
  horizon: Horizon;
  updatedAt: string;
}

export const EMPTY_PROFILE: Profile = {
  ageRange: '',
  residency: '',
  household: [],
  housing: '',
  employment: '',
  priorities: [],
  horizon: '',
  updatedAt: '',
};

export type SavedItemType = 'guide' | 'calculator' | 'tool' | 'snapshot';

export interface SavedItem {
  id: string;
  type: SavedItemType;
  refId: string; // guide id, calculator id or tool id
  title: string;
  subtitle?: string;
  path: string;
  savedAt: string;
  /** For snapshots: key results captured at save time */
  snapshot?: { label: string; value: string }[];
  note?: string;
}

export interface PlanTask {
  id: string;
  title: string;
  dueDate?: string; // YYYY-MM-DD
  done: boolean;
  path?: string;
  source: 'manual' | 'tax' | 'guide' | 'annual-admin';
  createdAt: string;
}

export type ChecklistProgress = Record<string, Record<string, boolean>>;

interface AppState {
  profile: Profile | null;
  profileDismissed: boolean;
  setProfile: (p: Profile) => void;
  clearProfile: () => void;
  dismissProfile: () => void;

  progress: ChecklistProgress;
  isChecked: (listId: string, itemId: string) => boolean;
  toggleItem: (listId: string, itemId: string) => void;
  setItems: (listId: string, itemIds: string[], value: boolean) => void;
  resetList: (listId: string) => void;
  listCompletion: (listId: string, itemIds: string[]) => { done: number; total: number };

  saved: SavedItem[];
  isSaved: (type: SavedItemType, refId: string) => boolean;
  toggleSaved: (item: Omit<SavedItem, 'id' | 'savedAt'>) => void;
  addSnapshot: (item: Omit<SavedItem, 'id' | 'savedAt' | 'type'>) => void;
  removeSaved: (id: string) => void;

  tasks: PlanTask[];
  addTask: (task: Omit<PlanTask, 'id' | 'createdAt' | 'done'> & { done?: boolean }) => void;
  updateTask: (id: string, patch: Partial<PlanTask>) => void;
  removeTask: (id: string) => void;

  theme: ThemeId;
  themeIsExplicit: boolean;
  setTheme: (theme: ThemeId) => void;
}

const AppStateContext = createContext<AppState | null>(null);

/* ---------------------------------------------------------------------- */
/* Provider                                                                */
/* ---------------------------------------------------------------------- */

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [profile, setProfileState] = usePersistentState<Profile | null>('profile', null);
  const [profileDismissed, setProfileDismissed] = usePersistentState<boolean>('profile-dismissed', false);
  const [progress, setProgress] = usePersistentState<ChecklistProgress>('checklists', {});
  const [saved, setSaved] = usePersistentState<SavedItem[]>('saved', []);
  const [tasks, setTasks] = usePersistentState<PlanTask[]>('tasks', []);

  const setProfile = useCallback((p: Profile) => setProfileState({ ...p, updatedAt: new Date().toISOString() }), [setProfileState]);
  const clearProfile = useCallback(() => setProfileState(null), [setProfileState]);
  const dismissProfile = useCallback(() => setProfileDismissed(true), [setProfileDismissed]);

  const isChecked = useCallback((listId: string, itemId: string) => Boolean(progress[listId]?.[itemId]), [progress]);
  const toggleItem = useCallback(
    (listId: string, itemId: string) =>
      setProgress((prev) => {
        const list = { ...(prev[listId] || {}) };
        list[itemId] = !list[itemId];
        return { ...prev, [listId]: list };
      }),
    [setProgress],
  );
  const setItems = useCallback(
    (listId: string, itemIds: string[], value: boolean) =>
      setProgress((prev) => {
        const list = { ...(prev[listId] || {}) };
        for (const id of itemIds) list[id] = value;
        return { ...prev, [listId]: list };
      }),
    [setProgress],
  );
  const resetList = useCallback(
    (listId: string) =>
      setProgress((prev) => {
        const next = { ...prev };
        delete next[listId];
        return next;
      }),
    [setProgress],
  );
  const listCompletion = useCallback(
    (listId: string, itemIds: string[]) => {
      const list = progress[listId] || {};
      const done = itemIds.filter((id) => list[id]).length;
      return { done, total: itemIds.length };
    },
    [progress],
  );

  const isSaved = useCallback((type: SavedItemType, refId: string) => saved.some((s) => s.type === type && s.refId === refId), [saved]);
  const toggleSaved = useCallback(
    (item: Omit<SavedItem, 'id' | 'savedAt'>) =>
      setSaved((prev) => {
        const existing = prev.find((s) => s.type === item.type && s.refId === item.refId);
        if (existing) return prev.filter((s) => s.id !== existing.id);
        return [{ ...item, id: uid(), savedAt: new Date().toISOString() }, ...prev];
      }),
    [setSaved],
  );
  const addSnapshot = useCallback(
    (item: Omit<SavedItem, 'id' | 'savedAt' | 'type'>) => setSaved((prev) => [{ ...item, type: 'snapshot', id: uid(), savedAt: new Date().toISOString() }, ...prev]),
    [setSaved],
  );
  const removeSaved = useCallback((id: string) => setSaved((prev) => prev.filter((s) => s.id !== id)), [setSaved]);

  const addTask = useCallback(
    (task: Omit<PlanTask, 'id' | 'createdAt' | 'done'> & { done?: boolean }) =>
      setTasks((prev) => [...prev, { ...task, done: task.done ?? false, id: uid(), createdAt: new Date().toISOString() }]),
    [setTasks],
  );
  const updateTask = useCallback((id: string, patch: Partial<PlanTask>) => setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, ...patch } : t))), [setTasks]);
  const removeTask = useCallback((id: string) => setTasks((prev) => prev.filter((t) => t.id !== id)), [setTasks]);

  // Appearance: an explicit choice is saved; otherwise follow the system (dark) or use sage.
  const [theme, setThemeState] = useState<ThemeId>(() => currentTheme());
  const [themeIsExplicit, setThemeIsExplicit] = useState<boolean>(() => readStoredTheme() !== null);
  useEffect(() => {
    applyTheme(theme);
  }, [theme]);
  useEffect(() => {
    if (themeIsExplicit || typeof window === 'undefined' || !window.matchMedia) return;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = () => setThemeState(systemDefaultTheme());
    mq.addEventListener?.('change', onChange);
    return () => mq.removeEventListener?.('change', onChange);
  }, [themeIsExplicit]);
  const setTheme = useCallback((next: ThemeId) => {
    saveTheme(next);
    setThemeIsExplicit(true);
    setThemeState(next);
  }, []);

  const value = useMemo<AppState>(
    () => ({
      profile,
      profileDismissed,
      setProfile,
      clearProfile,
      dismissProfile,
      progress,
      isChecked,
      toggleItem,
      setItems,
      resetList,
      listCompletion,
      saved,
      isSaved,
      toggleSaved,
      addSnapshot,
      removeSaved,
      tasks,
      addTask,
      updateTask,
      removeTask,
      theme,
      themeIsExplicit,
      setTheme,
    }),
    [profile, profileDismissed, setProfile, clearProfile, dismissProfile, progress, isChecked, toggleItem, setItems, resetList, listCompletion, saved, isSaved, toggleSaved, addSnapshot, removeSaved, tasks, addTask, updateTask, removeTask, theme, themeIsExplicit, setTheme],
  );

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
}

export function useAppState(): AppState {
  const ctx = useContext(AppStateContext);
  if (!ctx) throw new Error('useAppState must be used within AppStateProvider');
  return ctx;
}
