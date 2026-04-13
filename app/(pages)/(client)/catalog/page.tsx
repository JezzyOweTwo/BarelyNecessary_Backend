import { api_get } from "@/lib/http_methods";
import CatalogClient from "../../../../components/CatalogClient";
import {Product,Category} from "@/lib/types";
import { redirect } from "next/navigation";
export const dynamic = "force-dynamic";

export default async function CatalogPage() {
  try{
    const products:Product[] = await api_get<Product[]>("/api/product");
    const categories:Category[] = await api_get<Category[]>("/api/category");
    return <CatalogClient products={products} categories={categories} />;
  } 
  
  catch (err:any){
    // redirects user to a generic error page if fetching products or categories fails for any reason.
    console.error("Error fetching products or categories:", err.message);
    const newurl = `/error?code=500&message=${encodeURIComponent("Error fetching products or categories.")}`;
    redirect(newurl);
  }
}