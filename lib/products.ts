/**
 * GEN ERA — Products API Client (TASK-002)
 * All functions call the Express /api/v1/products endpoints.
 */
import { api } from '@/lib/api';
import { Product, ProductListResponse, ProductResponse } from '@/lib/types';

export const productsApi = {
  /** Paginated list with optional filters */
  getAll: (params?: Record<string, string>) =>
    api.get<ProductListResponse>('/products', params),

  /** Single product by URL-safe slug */
  getBySlug: (slug: string) =>
    api.get<ProductResponse>(`/products/${slug}`),

  /** Featured products — max 6 */
  getFeatured: () =>
    api.get<ProductListResponse>('/products/featured'),

  /** Paginated products in a category */
  getByCategory: (category: string, params?: Record<string, string>) =>
    api.get<ProductListResponse>(`/products/category/${category}`, params),

  /** Full-text search */
  search: (q: string, params?: Record<string, string>) =>
    api.get<ProductListResponse>('/products/search', { q, ...params }),

  /** Admin: create product */
  create: (data: Partial<Product>) =>
    api.post<ProductResponse>('/products', data),

  /** Admin: partial update by ID */
  update: (id: string, data: Partial<Product>) =>
    api.put<ProductResponse>(`/products/${id}`, data),

  /** Admin: soft-delete by ID */
  delete: (id: string) =>
    api.delete(`/products/${id}`),
};
