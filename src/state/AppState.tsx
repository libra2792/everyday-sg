import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { usePersistentState } from '@/lib/usePersistentState';
import { snapshotHref } from '@/lib/usePrefill';
import { uid } from '@/lib/storage';
import { applyTheme, currentTheme, readStoredTheme, saveTheme, systemDefaultTheme, type ThemeId } from '@/lib/theme';

/* ---------------------------------------------------------------------- */
/* Types                                                                   */
/* ---------------------------------------------------------------------- */

export type AgeRange = '' | '18-24' | '25-34' | '35-44' | '45-54' | '55-64' | '65+';
export type Residency = '' | 'citizen' | 'pr' | 'other';
export type Household = '' | 'single' | 'partnered' | 'married' | 'parent' | 'supporting-parents';
export type HousingSituation = 'with-family' | 'renting' | 'hdb-owner' | 'private-owner' | 'planning-to-buy';
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
  { id: 'estate', label: 'Wills, LPA and nominations' },
  { id: 'admin', label: 'Sort out my life admin' },
] as const;

export type PriorityId = (typeof PRIORITY_OPTIONS)[number]['id'];

export interface Profile {
  ageRange: AgeRange;
  residency: Residency;
  household: Household[];
  /** Several can apply, most often renting and planning to buy. */
  housing: HousingSituation[];
  employment: Employment;
  priorities: PriorityId[];
  horizon: Horizon;
  updatedAt: string;
}

export const EMPTY_PROFILE: Profile = {
  ageRange: '',
  residency: '',
  household: [],
  housing: [],
  employment: '',
  priorities: [],
  horizon: '',
  updatedAt: '',
};

/**
 * Profiles saved before Housing allowed several answers stored a single string; read those
 * (and any import of them) as a one-item list. Priorities that are no longer offered (such
 * as the retired 'career') are dropped.
 */
export function migrateProfile(saved: unknown): Profile | null {
  if (!saved || typeof saved !== 'object') return null;
  const p = saved as Partial<Profile> & { housing?: unknown };
  const list = (v: unknown) => (Array.isArray(v) ? v : typeof v === 'string' && v ? [v] : []);
  const priorities = list(p.priorities).filter((id): id is PriorityId => PRIORITY_OPTIONS.some((o) => o.id === id));
  return { ...EMPTY_PROFILE, ...p, housing: list(p.housing) as HousingSituation[], household: list(p.household) as Household[], priorities };
}

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
  /** For snapshots: the calculator's full input set, so the scenario can be reopened. */
  inputs?: unknown;
  note?: string;
}

/** Where a saved item opens: snapshots reopen their calculator with the saved inputs. */
export function savedItemHref(item: SavedItem): string {
  return item.type === 'snapshot' && item.inputs ? snapshotHref(item.path, item.inputs, item.title) : item.path;
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

type NewTask = Omit<PlanTask, 'id' | 'createdAt' | 'done'> & { done?: boolean };

/**
 * A task is already in the plan when a guide's reminder points at the same guide, or when
 * any task has the same title (ignoring case and spacing) and the same date.
 */
export function findDuplicateTask(tasks: PlanTask[], task: Pick<PlanTask, 'title' | 'dueDate' | 'path' | 'source'>): PlanTask | undefined {
  const title = task.title.trim().replace(/\s+/g, ' ').toLowerCase();
  return tasks.find(
    (t) =>
      (task.source === 'guide' && t.source === 'guide' && task.path !== undefined && t.path === task.path) ||
      (t.title.trim().replace(/\s+/g, ' ').toLowerCase() === title && (t.dueDate ?? '') === (task.dueDate ?? '')),
  );
}

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
  /** Put a list's ticks back exactly as they were (used by Undo). */
  restoreList: (listId: string, items: Record<string, boolean> | undefined) => void;
  listCompletion: (listId: string, itemIds: string[]) => { done: number; total: number };

  saved: SavedItem[];
  isSaved: (type: SavedItemType, refId: string) => boolean;
  toggleSaved: (item: Omit<SavedItem, 'id' | 'savedAt'>) => void;
  addSnapshot: (item: Omit<SavedItem, 'id' | 'savedAt' | 'type'>) => void;
  removeSaved: (id: string) => void;

  tasks: PlanTask[];
  /** Adds the task unless it is already in the plan; returns whether it was added. */
  addTask: (task: NewTask) => boolean;
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

/**
 * Everything that has to outlive a reload of the state from storage: the reload itself
 * (bumping the store's key re-reads every saved value) and an Undo offered across it.
 */
interface StorageControl {
  reloadFromStorage: () => void;
  pendingUndo: { id: number; message: string; restore: () => void } | null;
  offerUndo: (message: string, restore: () => void) => void;
  clearUndo: () => void;
}

const StorageControlContext = createContext<StorageControl | null>(null);

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [generation, setGeneration] = useState(0);
  const [pendingUndo, setPendingUndo] = useState<StorageControl['pendingUndo']>(null);
  const reloadFromStorage = useCallback(() => setGeneration((g) => g + 1), []);
  const offerUndo = useCallback((message: string, restore: () => void) => setPendingUndo({ id: Date.now(), message, restore }), []);
  const clearUndo = useCallback(() => setPendingUndo(null), []);
  const control = useMemo(() => ({ reloadFromStorage, pendingUndo, offerUndo, clearUndo }), [reloadFromStorage, pendingUndo, offerUndo, clearUndo]);
  return (
    <StorageControlContext.Provider value={control}>
      <AppStateStore key={generation}>{children}</AppStateStore>
    </StorageControlContext.Provider>
  );
}

export function useStorageControl(): StorageControl {
  const ctx = useContext(StorageControlContext);
  if (!ctx) throw new Error('useStorageControl must be used within AppStateProvider');
  return ctx;
}

function AppStateStore({ children }: { children: ReactNode }) {
  const [profile, setProfileState] = usePersistentState<Profile | null>('profile', null, migrateProfile);
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
  const restoreList = useCallback(
    (listId: string, items: Record<string, boolean> | undefined) =>
      setProgress((prev) => {
        const next = { ...prev };
        if (items) next[listId] = items;
        else delete next[listId];
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
    (task: NewTask) => {
      if (findDuplicateTask(tasks, task)) return false;
      // Checked again against the latest list, in case two adds land in the same render.
      setTasks((prev) => (findDuplicateTask(prev, task) ? prev : [...prev, { ...task, done: task.done ?? false, id: uid(), createdAt: new Date().toISOString() }]));
      return true;
    },
    [tasks, setTasks],
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
      restoreList,
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
    [profile, profileDismissed, setProfile, clearProfile, dismissProfile, progress, isChecked, toggleItem, setItems, resetList, restoreList, listCompletion, saved, isSaved, toggleSaved, addSnapshot, removeSaved, tasks, addTask, updateTask, removeTask, theme, themeIsExplicit, setTheme],
  );

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
}

export function useAppState(): AppState {
  const ctx = useContext(AppStateContext);
  if (!ctx) throw new Error('useAppState must be used within AppStateProvider');
  return ctx;
}
