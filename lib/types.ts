/**
 * GEN ERA — Type System
 * Single source of truth for all data shapes across the frontend.
 * Must match the MongoDB schema and API response contracts exactly.
 */

// ─── Product ───────────────────────────────────────────────────────────────
export interface Product {
  _id: string;
  slug: string;
  name: string;
  shortDescription: string;
  description: string;
  price: number;         // EGP stored as float, display with toLocaleString('ar-EG')
  category: 'clothing' | 'accessories';
  tags: string[];
  image: string;         // primary image path, relative to /public
  gallery: string[];     // additional image paths
  modelPath: string;     // e.g. /models/jacket.glb
  texturePath?: string;  // optional PBR texture
  stock: number;         // 0 = out of stock
  featured: boolean;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

// ─── Cart ──────────────────────────────────────────────────────────────────
/**
 * CartItem snapshots price and image at the moment addToCart() is called.
 * NEVER re-read from the live Product — mirrors the backend order snapshot pattern.
 */
export interface CartItem {
  productId: string;
  slug: string;
  name: string;
  price: number;     // SNAPSHOT at add-to-cart time
  image: string;     // SNAPSHOT at add-to-cart time
  quantity: number;
}

// ─── Order ─────────────────────────────────────────────────────────────────
export interface OrderItem {
  product: string;   // ObjectId ref — for analytics only
  name: string;      // SNAPSHOT
  price: number;     // SNAPSHOT
  image: string;     // SNAPSHOT
  sku: string;       // SNAPSHOT
  quantity: number;
}

export interface ShippingAddress {
  name?: string;
  street: string;
  city: string;
  country: string;
  phone?: string;
}

export interface Order {
  _id: string;
  user: string;
  items: OrderItem[];
  totalPrice: number;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  shippingAddress: ShippingAddress;
  paymentStatus: 'unpaid' | 'paid' | 'refunded';
  paymentRef?: string;
  createdAt: string;
  updatedAt: string;
}

// ─── Pagination ────────────────────────────────────────────────────────────
export interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

// ─── API Responses ─────────────────────────────────────────────────────────
export interface ApiSuccess<T> {
  success: true;
  data: T;
}

export interface ApiError {
  success: false;
  message: string;
  errors?: Array<{ msg: string; path: string }>;
}

export interface ProductListResponse {
  success: boolean;
  data: Product[];
  pagination: Pagination;
}

export interface ProductResponse {
  success: boolean;
  data: Product;
}

export interface OrderResponse {
  success: boolean;
  data: Order;
}

export interface OrderListResponse {
  success: boolean;
  data: Order[];
  pagination: Pagination;
}

// ─── User ──────────────────────────────────────────────────────────────────
export interface User {
  _id: string;
  name: string;
  email: string;
  avatar: string;
  role: 'user' | 'admin';
  createdAt: string;
}

export interface AuthResponse {
  success: boolean;
  token: string;
  user: User;
}
