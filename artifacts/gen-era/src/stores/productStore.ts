import { create } from 'zustand';
import { productsApi } from '@/lib/products';
import { Product, Pagination } from '@/lib/types';

interface ProductStore {
  products: Product[];
  featuredProducts: Product[];
  selectedProduct: Product | null;
  loading: boolean;
  error: string | null;
  pagination: Pagination | null;

  fetchProducts: (params?: Record<string, string>) => Promise<void>;
  fetchProduct: (slug: string) => Promise<void>;
  fetchFeatured: () => Promise<void>;
  selectProduct: (product: Product) => void;
  clearSelection: () => void;
  clearError: () => void;
}

export const useProductStore = create<ProductStore>((set) => ({
  products: [],
  featuredProducts: [],
  selectedProduct: null,
  loading: false,
  error: null,
  pagination: null,

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

  fetchFeatured: async () => {
    try {
      const response = await productsApi.getFeatured();
      set({ featuredProducts: response.data });
    } catch (err: unknown) {
      console.error('Failed to fetch featured products:', err);
    }
  },

  selectProduct: (product) => set({ selectedProduct: product }),
  clearSelection: () => set({ selectedProduct: null }),
  clearError: () => set({ error: null }),
}));
