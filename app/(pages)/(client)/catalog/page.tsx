import { api_get } from "@/lib/http_methods";
import CatalogClient from "../../../../components/CatalogClient";
import {Product,Category} from "@/lib/types";
export const dynamic = "force-dynamic";

export default async function CatalogPage() {
  const products:Product[] = await api_get<Product[]>("/api/protected/product");
  const categories:Category[] = await api_get<Category[]>("/api/protected/category");
  return <CatalogClient products={products} categories={categories} />;
}