import CatalogueClient from "../catalog/CatalogClient";

type Product = {
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

type Category = {
  category_id: number;
  category_name: string;
  description: string | null;
};

async function getProducts(): Promise<Product[]> {
  const res = await fetch("http://localhost:3000/api/products", {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error("Failed to fetch products");
  }

  const data = await res.json();
  return data.products ?? [];
}

async function getCategories(): Promise<Category[]> {
  const res = await fetch("http://localhost:3000/api/categories", {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error("Failed to fetch categories");
  }

  const data = await res.json();
  return data.categories ?? [];
}

export default async function CatalogPage() {
  const [products, categories] = await Promise.all([
    getProducts(),
    getCategories(),
  ]);

  return <CatalogueClient products={products} categories={categories} />;
}