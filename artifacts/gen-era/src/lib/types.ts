export interface Product {
  _id: string;
  slug: string;
  name: string;
  shortDescription: string;
  description: string;
  price: number;
  category: 'clothing' | 'accessories';
  tags: string[];
  image: string;
  gallery: string[];
  modelPath: string;
  texturePath?: string;
  stock: number;
  featured: boolean;
  active: boolean;
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
