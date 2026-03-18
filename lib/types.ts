export type UserRole = "customer" | "admin";

export interface Address {
  address_id: number;
  user_id: number;
  address_type: "shipping" | "billing";
  street: string;
  city: string;
  province: string;
  postal_code: string;
  country: string;
  is_default: boolean;
}

export interface PaymentMethod {
  payment_id: number;
  user_id: number;
  cardholder_name: string;
  card_last4: string;
  card_brand: string;
  expiry_month: number;
  expiry_year: number;
  is_default: boolean;
}

export interface Category {
  category_id: number;
  category_name: string;
  description?: string;
}

export interface Product {
  product_id: number;
  category_id: number | null;
  name: string;
  brand?: string;
  model?: string;
  short_tagline?: string;
  description: string;
  price: number;
  stock_quantity: number;
  image_url?: string;
  is_featured: boolean;
  is_active: boolean;
}

export interface CartItem {
  cart_item_id: number;
  cart_id: number;
  product_id: number;
  quantity: number;
  product: Product;
}

export interface OrderItem {
  order_item_id: number;
  order_id: number;
  product_id: number | null;
  quantity: number;
  price_at_purchase: number;
  subtotal: number;
  product?: Product;
}

export interface Order {
  order_id: number;
  user_id: number;
  shipping_address_id?: number | null;
  billing_address_id?: number | null;
  payment_id?: number | null;
  order_status: "pending" | "paid" | "failed" | "cancelled" | "shipped" | "completed";
  payment_status: "pending" | "accepted" | "denied";
  total_amount: number;
  order_date: string;
  items?: OrderItem[];
}

export interface User {
  user_id: number;
  first_name: string;
  last_name: string;
  email: string;
  username?: string;
  password: string;
  phone?: string;
  role: UserRole;
  is_active: boolean;
}