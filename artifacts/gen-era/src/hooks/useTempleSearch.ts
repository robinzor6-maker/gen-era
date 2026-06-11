import { useState, useCallback } from 'react';
import type { District } from '@/lib/lore/generateLore';

export interface TempleSearchState {
  query: string;
  activeDistrict: District | null;
  setQuery: (q: string) => void;
  setActiveDistrict: (d: District | null) => void;
  clearAll: () => void;
  isActive: boolean;
}

export function useTempleSearch(): TempleSearchState {
  const [query, setQueryRaw] = useState('');
  const [activeDistrict, setActiveDistrictRaw] = useState<District | null>(null);

  const setQuery = useCallback((q: string) => setQueryRaw(q), []);
  const setActiveDistrict = useCallback((d: District | null) => setActiveDistrictRaw(d), []);
  const clearAll = useCallback(() => { setQueryRaw(''); setActiveDistrictRaw(null); }, []);

  return {
    query,
    activeDistrict,
    setQuery,
    setActiveDistrict,
    clearAll,
    isActive: query.trim().length > 0 || activeDistrict !== null,
  };
}
