import { useCallback, useMemo, useReducer } from 'react';

export type SortDir = 'asc' | 'desc' | null;

type SortState = { key: string | null; dir: SortDir };
type SortAction = { type: 'toggle'; key: string };

function sortReducer(state: SortState, action: SortAction): SortState {
  if (state.key !== action.key) return { key: action.key, dir: 'asc' };
  if (state.dir === 'asc') return { key: action.key, dir: 'desc' };
  return { key: null, dir: null };
}

export function useTableSort<T>(data: T[], compareFns: Record<string, (a: T, b: T) => number>) {
  const [state, dispatch] = useReducer(sortReducer, { key: null, dir: null });

  const toggleSort = useCallback((key: string) => dispatch({ type: 'toggle', key }), []);

  const sortedData = useMemo(() => {
    if (!state.key || !state.dir) return data;
    const fn = compareFns[state.key];
    if (!fn) return data;
    const sorted = [...data].sort(fn);
    return state.dir === 'desc' ? sorted.reverse() : sorted;
  }, [data, state, compareFns]);

  return { sortedData, sortKey: state.key, sortDir: state.dir, toggleSort };
}
