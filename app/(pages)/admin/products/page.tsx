import { api_get } from "@/lib/http_methods";
import { Product } from "@/lib/types";
import BackButton from "@/components/BackButton";

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
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm ">
          <table className="w-full table-fixed text-left text-sm">
            <thead className="border-b border-gray-200 bg-gray-50">
              <tr>
                <th className="px-4 py-3 font-semibold">ID</th>
                <th className="px-4 py-3 font-semibold">Name</th>
                <th className="px-4 py-3 font-semibold">Price</th>
                <th className="px-4 py-3 font-semibold">Stock</th>
                <th className="px-4 py-3 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody>
              {products.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-gray-500">
                    No products found.
                  </td>
                </tr>
              ) : (
                products.map((p) => (
                  <tr key={p.product_id} className="border-b border-gray-100 ">
                    <td className="px-4 py-3">{p.product_id}</td>
                    <td className="px-4 py-3 font-medium">{p.name}</td>
                    <td className="px-4 py-3">${Number(p.price).toFixed(2)}</td>
                    <td className="px-4 py-3">{p.stock_quantity}</td>
                    <td className="px-4 py-3">
                      {p.is_active ? "Active" : "Hidden"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className= "py-2" >
            <BackButton />
        </div>
      </section>
    </main>
  );
}
