import { api } from '@/lib/api';
import { Product, ProductListResponse, ProductResponse } from '@/lib/types';

export const productsApi = {
  getAll: (params?: Record<string, string>) =>
    api.get<ProductListResponse>('/products', params),

  getBySlug: (slug: string) =>
    api.get<ProductResponse>(`/products/${slug}`),

  getFeatured: () =>
    api.get<ProductListResponse>('/products/featured'),

  getByCategory: (category: string, params?: Record<string, string>) =>
    api.get<ProductListResponse>(`/products/category/${category}`, params),

  search: (q: string, params?: Record<string, string>) =>
    api.get<ProductListResponse>('/products/search', { q, ...params }),

  create: (data: Partial<Product>) =>
    api.post<ProductResponse>('/products', data),
};
