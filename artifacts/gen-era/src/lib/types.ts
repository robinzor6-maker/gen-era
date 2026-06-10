export interface ProductColor {
  name: string;
  hex: string;
}

export interface Product {
  _id: string;
  slug: string;
  name: string;
  subtitle: string;
  collection: string;
  shortDescription: string;
  description: string;
  longDescription?: string;
  price: number;
  comparePrice?: number;
  category: 'clothing' | 'accessories';
  tags: string[];
  colors: ProductColor[];
  sizes: string[];
  image: string;
  gallery: string[];
  modelPath: string;
  texturePath?: string;
  material?: string;
  weight?: string;
  shippingInfo?: string;
  stock: number;
  featured: boolean;
  active: boolean;
  rating: number;
  reviewCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CartItem {
  productId: string;
  slug: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  selectedSize?: string;
  selectedColor?: string;
}

export interface OrderItem {
  product: string;
  name: string;
  price: number;
  image: string;
  sku: string;
  quantity: number;
}

export interface OrderCustomer {
  name: string;
  email: string;
  phone?: string;
  address: string;
  city: string;
}

export interface Order {
  _id: string;
  orderNumber: string;
  user: string | null;
  customerType: 'guest' | 'registered';
  customer: OrderCustomer;
  items: OrderItem[];
  totalPrice: number;
  notes?: string;
  status: 'pending' | 'paid' | 'shipped' | 'delivered';
  paymentStatus: 'unpaid' | 'paid' | 'refunded';
  paymentRef?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

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

export interface Collection {
  id: string;
  slug: string;
  name: string;
  description: string;
  season: string;
  year: number;
  coverGlyph: string;
  productCount: number;
}
