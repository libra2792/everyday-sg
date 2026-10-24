import { useCallback, useEffect, useRef, useState, type Dispatch, type SetStateAction } from 'react';
import { readJSON, removeKey, writeJSON } from './storage';

/**
 * useState that mirrors its value into localStorage under an Everyday SG key.
 * Returns [value, setValue, reset]. `reset` restores the initial value and clears the key.
 *
 * A `merge` function can migrate older saved shapes (e.g. when new fields are added).
 */
export function usePersistentState<T>(
  key: string,
  initial: T | (() => T),
  merge?: (saved: unknown, fallback: T) => T,
): [T, Dispatch<SetStateAction<T>>, () => void] {
  const initialRef = useRef<T | null>(null);
  const getInitial = (): T => {
    if (initialRef.current === null) {
      initialRef.current = typeof initial === 'function' ? (initial as () => T)() : initial;
    }
    return initialRef.current;
  };

  const [value, setValue] = useState<T>(() => {
    const fallback = getInitial();
    const saved = readJSON<unknown>(key, undefined);
    if (saved === undefined) return fallback;
    if (merge) return merge(saved, fallback);
    // Shallow-merge plain objects so newly added fields get defaults.
    if (saved && typeof saved === 'object' && !Array.isArray(saved) && fallback && typeof fallback === 'object' && !Array.isArray(fallback)) {
      return { ...(fallback as object), ...(saved as object) } as T;
    }
    return saved as T;
  });

  const firstRender = useRef(true);
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    // After a reset the value is the pristine initial object again: keep storage empty
    // rather than writing defaults back, so "reset" genuinely clears the saved entry.
    if (value === initialRef.current) {
      removeKey(key);
      return;
    }
    writeJSON(key, value);
  }, [key, value]);

  const reset = useCallback(() => {
    removeKey(key);
    setValue(getInitial());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  return [value, setValue, reset];
}
