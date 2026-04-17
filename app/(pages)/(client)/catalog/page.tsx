import { api_get } from "@/lib/http_methods";
import CatalogClient from "../../../../components/CatalogClient";
import {Product,Category} from "@/lib/types";
import { redirect } from "next/navigation";
export const dynamic = "force-dynamic";

export default async function CatalogPage() {
  let products: Product[] = [];
  let categories: Category[] = [];

  try {
     products = await api_get<Product[]>("/api/product");
     categories = await api_get<Category[]>("/api/category");
    

  }
  
   catch (err: unknown) {
    // redirects user to a generic error page if fetching products or categories fails for any reason.
    console.error("Error fetching products or categories:", err instanceof Error ? err.message : String(err));
    const newurl = `/error?code=500&message=${encodeURIComponent("Error fetching products or categories.")}`;
    redirect(newurl);
  }

  return <CatalogClient products={products} categories={categories} />;
}