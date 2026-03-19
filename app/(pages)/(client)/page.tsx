import Link from "next/link";
import ProductCard from "@/components/ProductCard";
import { categories, products } from "@/lib/mock-data";

export default function HomePage() {
  const featuredProducts = products.filter((product) => product.is_featured).slice(0, 3);

  return (
    <main className="min-h-screen bg-gray-50 text-gray-900">
      <section className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div>
              <p className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-gray-500">
                Barely Necessary
              </p>

              <h1 className="max-w-2xl text-4xl font-bold tracking-tight sm:text-5xl">
                Barely Necessary Store
              </h1>

              <p className="mt-6 max-w-xl text-lg text-gray-600">
                Browse products, explore categories, view details, manage a cart, and move through a full online store flow with frontend.
              </p>

              <div className="mt-8 flex flex-wrap gap-4">
                <Link
                  href="/catalog"
                  className="rounded-xl bg-black px-6 py-3 text-sm font-medium text-white transition hover:bg-gray-800"
                >
                  Shop Catalog
                </Link>

                <Link
                  href="/login"
                  className="rounded-xl border border-gray-300 px-6 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-100"
                >
                  Login
                </Link>
              </div>
            </div>

            <div className="rounded-3xl border border-gray-200 bg-gradient-to-br from-gray-100 to-white p-8 shadow-sm">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl bg-white p-5 shadow-sm">
                  <p className="text-sm text-gray-500">Main Features</p>
                  <h3 className="mt-2 text-lg font-semibold">Catalog + Cart</h3>
                  <p className="mt-2 text-sm text-gray-600">
                    Browse, filter, sort, and add products into a cart flow.
                  </p>
                </div>

                <div className="rounded-2xl bg-white p-5 shadow-sm">
                  <p className="text-sm text-gray-500">Customer Flow</p>
                  <h3 className="mt-2 text-lg font-semibold">Checkout Ready</h3>
                  <p className="mt-2 text-sm text-gray-600">
                    Supports account, profile, shipping, payment and order history views.
                  </p>
                </div>

                <div className="rounded-2xl bg-white p-5 shadow-sm">
                  <p className="text-sm text-gray-500">Admin Side</p>
                  <h3 className="mt-2 text-lg font-semibold">Management Pages</h3>
                  <p className="mt-2 text-sm text-gray-600">
                    Inventory, customers, and order pages are part of the structure.
                  </p>
                </div>

                <div className="rounded-2xl bg-white p-5 shadow-sm">
                  <p className="text-sm text-gray-500">Tech Stack</p>
                  <h3 className="mt-2 text-lg font-semibold">Next + TypeScript</h3>
                  <p className="mt-2 text-sm text-gray-600">
                    Uses reusable components and mock data for now, backend can be added later
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gray-500">
              Categories
            </p>
            <h2 className="mt-2 text-3xl font-bold">Shop by category</h2>
          </div>

          <Link
            href="/catalog"
            className="text-sm font-medium text-gray-700 underline underline-offset-4"
          >
            View all products
          </Link>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((category) => (
            <div
              key={category.category_id}
              className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"
            >
              <p className="text-sm uppercase tracking-wide text-gray-500">Category</p>
              <h3 className="mt-2 text-xl font-semibold">{category.category_name}</h3>
              <p className="mt-3 text-sm text-gray-600">
                {category.description || "Explore products in this category."}
              </p>
              <Link
                href="/catalog"
                className="mt-5 inline-block text-sm font-medium text-gray-800 underline underline-offset-4"
              >
                Browse now
              </Link>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-20 lg:px-8">
        <div className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gray-500">
            Featured
          </p>
          <h2 className="mt-2 text-3xl font-bold">Featured products</h2>
        </div>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {featuredProducts.map((product) => (
            <ProductCard key={product.product_id} product={product} />
          ))}
        </div>
      </section>
    </main>
  );
}
