import CatalogClient from "./CatalogClient";
import pool from "@/lib/db";

export type Product = {
  product_id: number;
  category_id: number;
  name: string;
  brand: string | null;
  model: string | null;
  short_tagline: string | null;
  description: string;
  price: number;
  stock_quantity: number;
  image_url: string | null;
  is_featured: number | boolean;
  is_active: number | boolean;
};

export type Category = {
  category_id: number;
  category_name: string;
  description: string | null;
};

async function getAllProducts(): Promise<Product[]> {
  const [rows] = await pool.query(`
    SELECT
      product_id,
      category_id,
      name,
      brand,
      model,
      short_tagline,
      description,
      price,
      stock_quantity,
      image_url,
      is_featured,
      is_active
    FROM products
    WHERE is_active = 1
    ORDER BY product_id ASC
  `);

  return rows as Product[];
}

async function getAllCategories(): Promise<Category[]> {
  const [rows] = await pool.query(`
    SELECT
      category_id,
      category_name,
      description
    FROM categories
    ORDER BY category_id ASC
  `);

  return rows as Category[];
}

export default async function CatalogPage() {
  const [products, categories] = await Promise.all([
    getAllProducts(),
    getAllCategories(),
  ]);

  return <CatalogClient products={products} categories={categories} />;
}