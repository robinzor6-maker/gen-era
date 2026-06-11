import { useState, useEffect, useRef } from 'react';
import { api } from '@/lib/api';
import { Product, ProductListResponse } from '@/lib/types';

let _cache: Product[] | null = null;

export function useTempleProducts() {
  const [products, setProducts] = useState<Product[]>(_cache ?? []);
  const [loading, setLoading] = useState(_cache === null);
  const [error, setError] = useState<string | null>(null);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;

    if (_cache !== null) {
      setProducts(_cache);
      setLoading(false);
      return;
    }

    setLoading(true);
    api
      .get<ProductListResponse>('/products', { limit: '9', page: '1' })
      .then((res) => {
        if (!mounted.current) return;
        _cache = res.data ?? [];
        setProducts(_cache);
        setLoading(false);
      })
      .catch((err: Error) => {
        if (!mounted.current) return;
        _cache = [];
        setError(err.message);
        setLoading(false);
      });

    return () => {
      mounted.current = false;
    };
  }, []);

  return { products, loading, error };
}
