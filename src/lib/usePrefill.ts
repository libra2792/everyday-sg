import { useEffect, useRef, useState, type Dispatch, type SetStateAction } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';

/** Where a calculator's inputs came from when it opened: a guide's quick check, or a saved snapshot. */
export type PrefillSource = { from: 'guide' } | { from: 'snapshot'; title: string };

/** Query parameters that carry a snapshot's full input set and its title. */
const SNAPSHOT_PARAM = 'snapshot';
const SNAPSHOT_TITLE_PARAM = 'snapshotTitle';

/** The link that reopens a calculator with a snapshot's inputs, through the same mechanism as a guide's handoff. */
export function snapshotHref(path: string, inputs: unknown, title: string): string {
  return `${path}?${new URLSearchParams({ [SNAPSHOT_PARAM]: JSON.stringify(inputs), [SNAPSHOT_TITLE_PARAM]: title })}`;
}

/**
 * Lets a guide's quick check open a calculator with numbers already filled in, through
 * query parameters named after the calculator's state keys (e.g. ?price=620000&rate=2.6
 * mapped by the caller). A saved snapshot reopens the same way, with its whole input set
 * in one parameter. The parameters are applied once, then removed from the URL so a
 * refresh or a shared link does not re-apply them over edits.
 *
 * Returns where the values came from, or null when nothing was prefilled.
 */
export function usePrefill<T extends object>(setState: Dispatch<SetStateAction<T>>, map: Partial<Record<string, keyof T>>, custom?: (params: URLSearchParams, state: T) => T): PrefillSource | null {
  const [params, setParams] = useSearchParams();
  const location = useLocation();
  const applied = useRef(false);
  const [source, setSource] = useState<PrefillSource | null>(null);
  useEffect(() => {
    if (applied.current) return;
    const snapshot = params.get(SNAPSHOT_PARAM);
    const keys = Object.keys(map);
    const has = snapshot !== null || keys.some((k) => params.has(k)) || (custom !== undefined && [...params.keys()].length > 0);
    if (!has) return;
    applied.current = true;
    if (snapshot !== null) {
      let inputs: unknown = null;
      try {
        inputs = JSON.parse(snapshot);
      } catch {
        /* a damaged link: open the calculator as it was */
      }
      if (inputs && typeof inputs === 'object' && !Array.isArray(inputs)) {
        setState((s) => ({ ...s, ...(inputs as Partial<T>) }));
        setSource({ from: 'snapshot', title: params.get(SNAPSHOT_TITLE_PARAM) || 'Snapshot' });
      }
    } else {
      setState((s) => {
        let next: T = { ...s };
        for (const k of keys) {
          const raw = params.get(k);
          const target = map[k];
          if (raw === null || target === undefined) continue;
          const n = Number(raw);
          if (Number.isFinite(n)) (next as Record<keyof T, unknown>)[target] = n;
        }
        if (custom) next = custom(params, next);
        return next;
      });
      setSource({ from: 'guide' });
    }
    // Keep the navigation state (the trail bar's "from") when the query string is cleared.
    setParams({}, { replace: true, state: location.state });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return source;
}
