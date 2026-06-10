export interface Product {
  _id: string;
  slug: string;
  name: string;
  shortDescription: string;
  description: string;
  price: number;
  category: "clothing" | "accessories";
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
  customerType: "guest" | "registered";
  customer: OrderCustomer;
  items: {
    product: string;
    name: string;
    price: number;
    image: string;
    sku: string;
    quantity: number;
  }[];
  totalPrice: number;
  notes?: string;
  status: "pending" | "paid" | "shipped" | "delivered";
  paymentStatus: "unpaid" | "paid" | "refunded";
  createdAt: string;
  updatedAt: string;
}

export interface User {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
  role: string;
}

export interface Pagination {
  total: number;
  page: number;
  limit: number;
  pages: number;
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

export interface AuthResponse {
  success: boolean;
  token: string;
  user: User;
}

export interface OrderResponse {
  success: boolean;
  data: Order;
}
