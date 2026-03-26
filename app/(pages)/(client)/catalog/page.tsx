import CatalogClient from "../../../../components/CatalogClient";
import {Product,Category} from "@/lib/types";
export const dynamic = "force-dynamic";

export default async function CatalogPage() {
  var response:Response;

  response = await fetch(`http://${process.env.APP_HOST}:${process.env.APP_PORT}/api/product`);
  const products:Product[] = (await response.json()).products as Product[];
  
  response = await fetch(`http://${process.env.APP_HOST}:${process.env.APP_PORT}/api/category`);
  const categories:Category[] = (await response.json()).categories as Category[];

  return <CatalogClient products={products} categories={categories} />;
}