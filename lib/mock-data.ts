import { Category, Product, User, Order, CartItem, Address, PaymentMethod } from "./types";

export const categories: Category[] = [
  { category_id: 1, category_name: "Monitors", description: "High-resolution displays" },
  { category_id: 2, category_name: "Laptops", description: "Portable computing devices" },
  { category_id: 3, category_name: "Accessories", description: "Mice, keyboards, and more" },
];

export const products: Product[] = [
  {
    product_id: 1,
    category_id: 1,
    name: "AeroView 27” Monitor",
    brand: "Visionix",
    model: "AV27",
    short_tagline: "Clean display for work and play",
    description: "A 27-inch IPS monitor with crisp visuals and slim bezels.",
    price: 249.99,
    stock_quantity: 8,
    image_url: "/placeholder-product.jpg",
    is_featured: true,
    is_active: true,
  },
  {
    product_id: 2,
    category_id: 2,
    name: "NovaBook Pro 14",
    brand: "NovaTech",
    model: "NBP14",
    short_tagline: "Portable power in a sleek shell",
    description: "A lightweight laptop designed for productivity and daily use.",
    price: 1099.99,
    stock_quantity: 3,
    image_url: "/placeholder-product.jpg",
    is_featured: true,
    is_active: true,
  },
  {
    product_id: 3,
    category_id: 3,
    name: "QuietType Mechanical Keyboard",
    brand: "KeyForge",
    model: "QTK100",
    short_tagline: "Tactile feel, less noise",
    description: "A compact keyboard with a premium typing experience.",
    price: 129.99,
    stock_quantity: 20,
    image_url: "/placeholder-product.jpg",
    is_featured: false,
    is_active: true,
  },
];

export const mockUser: User = {
  user_id: 1,
  first_name: "Nadeen",
  last_name: "Houri",
  email: "nadeen@example.com",
  username: "ow0",
  password: "mock-password",
  phone: "647-000-0000",
  role: "customer",
  is_active: true,
};

export const mockAddresses: Address[] = [
  {
    address_id: 1,
    user_id: 1,
    address_type: "shipping",
    street: "123 Example St",
    city: "Toronto",
    province: "Ontario",
    postal_code: "M1M1M1",
    country: "Canada",
    is_default: true,
  },
  {
    address_id: 2,
    user_id: 1,
    address_type: "billing",
    street: "123 Example St",
    city: "Toronto",
    province: "Ontario",
    postal_code: "M1M1M1",
    country: "Canada",
    is_default: true,
  },
];

export const mockPaymentMethods: PaymentMethod[] = [
  {
    payment_id: 1,
    user_id: 1,
    cardholder_name: "Nadeen Houri",
    card_last4: "4242",
    card_brand: "Visa",
    expiry_month: 12,
    expiry_year: 2028,
    is_default: true,
  },
];

export const mockCartItems: CartItem[] = [
  {
    cart_item_id: 1,
    cart_id: 1,
    product_id: 1,
    quantity: 1,
    product: products[0],
  },
  {
    cart_item_id: 2,
    cart_id: 1,
    product_id: 3,
    quantity: 2,
    product: products[2],
  },
];

export const mockOrders: Order[] = [
  {
    order_id: 101,
    user_id: 1,
    shipping_address_id: 1,
    billing_address_id: 2,
    payment_id: 1,
    order_status: "completed",
    payment_status: "accepted",
    total_amount: 509.97,
    order_date: "2026-03-01T10:00:00Z",
    items: [
      {
        order_item_id: 1,
        order_id: 101,
        product_id: 1,
        quantity: 1,
        price_at_purchase: 249.99,
        subtotal: 249.99,
        product: products[0],
      },
      {
        order_item_id: 2,
        order_id: 101,
        product_id: 3,
        quantity: 2,
        price_at_purchase: 129.99,
        subtotal: 259.98,
        product: products[2],
      },
    ],
  },
];