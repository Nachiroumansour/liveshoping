import type { OrderStatus, NotificationType } from './index';

/** Vendeur — champs renvoyés par GET /api/auth/profile */
export interface Seller {
  id: number;
  name: string;
  phone_number: string;
  public_link_id: string;
  role?: string;
  is_active?: boolean;
  credit_balance?: number;
  payment_settings?: Record<string, { phone?: string; enabled?: boolean }> | null;
  logo_url?: string | null;
}

export interface ProductVariant {
  id: number;
  product_id: number;
  name: string;
  price: number | null;
  stock_quantity: number;
  attributes?: Record<string, string>;
}

export interface Product {
  id: number;
  seller_id: number;
  name: string;
  description?: string | null;
  price: number;
  stock_quantity: number;
  images: Array<string | { url: string }>;
  category?: string | null;
  is_pinned?: boolean;
  variants?: ProductVariant[];
}

export interface Order {
  id: number;
  seller_id: number;
  product_id: number;
  product?: Product;
  customer_name: string;
  customer_phone: string;
  customer_address?: string | null;
  quantity: number;
  total_price: number;
  status: OrderStatus;
  payment_method?: string | null;
  comment?: string | null;
  created_at: string;
}

export interface AppNotification {
  id: number;
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, unknown>;
  read: boolean;
  created_at: string;
}
