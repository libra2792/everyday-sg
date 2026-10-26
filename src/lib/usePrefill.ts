import { useEffect, useRef, useState, type Dispatch, type SetStateAction } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';

/**
 * Lets a guide's quick check open a calculator with numbers already filled in, through
 * query parameters named after the calculator's state keys (e.g. ?price=620000&rate=2.6
 * mapped by the caller). The parameters are applied once, then removed from the URL so a
 * refresh or a shared link does not re-apply them over edits.
 *
 * Returns true when something was prefilled, so the page can say so.
 */
export function usePrefill<T extends object>(setState: Dispatch<SetStateAction<T>>, map: Partial<Record<string, keyof T>>, custom?: (params: URLSearchParams, state: T) => T): boolean {
  const [params, setParams] = useSearchParams();
  const location = useLocation();
  const applied = useRef(false);
  const [prefilled, setPrefilled] = useState(false);
  useEffect(() => {
    if (applied.current) return;
    const keys = Object.keys(map);
    const has = keys.some((k) => params.has(k)) || (custom !== undefined && [...params.keys()].length > 0);
    if (!has) return;
    applied.current = true;
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
    setPrefilled(true);
    // Keep the navigation state (the trail bar's "from") when the query string is cleared.
    setParams({}, { replace: true, state: location.state });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return prefilled;
}
