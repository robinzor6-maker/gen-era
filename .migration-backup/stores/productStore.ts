'use client';

import { create } from 'zustand';
import { productsApi } from '@/lib/products';
import { Product, Pagination } from '@/lib/types';

/**
 * GEN ERA — Product Store (TASK-003)
 * Manages the product catalog state: loading, errors, pagination, and selection.
 */

interface ProductStore {
  // ─── State ─────────────────────────────────────────────────────────────
  products: Product[];
  featuredProducts: Product[];
  selectedProduct: Product | null;
  loading: boolean;
  error: string | null;
  pagination: Pagination | null;

  // ─── Actions ───────────────────────────────────────────────────────────
  fetchProducts: (params?: Record<string, string>) => Promise<void>;
  fetchProduct: (slug: string) => Promise<void>;
  fetchFeatured: () => Promise<void>;
  selectProduct: (product: Product) => void;
  clearSelection: () => void;
  clearError: () => void;
}

export const useProductStore = create<ProductStore>((set) => ({
  // ─── Initial State ─────────────────────────────────────────────────────
  products: [],
  featuredProducts: [],
  selectedProduct: null,
  loading: false,
  error: null,
  pagination: null,

  // ─── Fetch paginated product list ──────────────────────────────────────
  fetchProducts: async (params) => {
    set({ loading: true, error: null });
    try {
      const response = await productsApi.getAll(params);
      set({
        products: response.data,
        pagination: response.pagination,
        loading: false,
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to fetch products';
      set({ error: message, loading: false });
    }
  },

  // ─── Fetch single product by slug ──────────────────────────────────────
  fetchProduct: async (slug) => {
    set({ loading: true, error: null });
    try {
      const response = await productsApi.getBySlug(slug);
      set({ selectedProduct: response.data, loading: false });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Product not found';
      set({ error: message, loading: false });
    }
  },

  // ─── Fetch featured products ───────────────────────────────────────────
  fetchFeatured: async () => {
    try {
      const response = await productsApi.getFeatured();
      set({ featuredProducts: response.data });
    } catch (err: unknown) {
      console.error('Failed to fetch featured products:', err);
    }
  },

  // ─── Selection (used when navigating from card → detail) ──────────────
  selectProduct: (product) => set({ selectedProduct: product }),
  clearSelection: () => set({ selectedProduct: null }),
  clearError: () => set({ error: null }),
}));
