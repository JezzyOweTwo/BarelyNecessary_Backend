import { api_get } from "@/lib/http_methods";
import { Product } from "@/lib/types";
import BackButton from "@/components/BackButton";
import AdminProductsTable from "@/components/AdminProductsTable";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  let products: Product[] = [];

  try {
    products = await api_get<Product[]>("/api/product");
  } catch (err) {
    console.error("Failed to fetch products:", err);
  }

  return (
    <main className="min-h-screen bg-gray-50 text-gray-900">
      <section className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-14 lg:px-8">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gray-500">
            Admin
          </p>
          <h1 className="mt-2 text-4xl font-bold tracking-tight">
            Product Management
          </h1>
          <p className="mt-4 text-gray-600">
            Manage your store inventory.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-10 lg:px-8">
        <AdminProductsTable products={products} />
        <div className="py-2">
          <BackButton />
        </div>
      </section>
    </main>
  );
}