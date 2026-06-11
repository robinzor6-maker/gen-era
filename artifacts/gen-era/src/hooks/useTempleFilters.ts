import { useMemo } from 'react';
import type { Product } from '@/lib/types';
import { getDistrict } from '@/lib/lore/generateLore';
import type { TempleSearchState } from './useTempleSearch';

export function useTempleFilters(products: Product[], search: TempleSearchState): Product[] {
  return useMemo(() => {
    let out = products;

    if (search.activeDistrict) {
      out = out.filter(p => getDistrict(p) === search.activeDistrict);
    }

    const q = search.query.trim().toLowerCase();
    if (q) {
      out = out.filter(p =>
        p.name.toLowerCase().includes(q) ||
        (p.collection ?? '').toLowerCase().includes(q) ||
        (p.tags ?? []).some(t => t.toLowerCase().includes(q)) ||
        (p.category ?? '').toLowerCase().includes(q)
      );
    }

    return out;
  }, [products, search.query, search.activeDistrict]);
}
