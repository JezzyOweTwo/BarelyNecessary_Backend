import Link from "next/link";
import { notFound } from "next/navigation";
import AddToCartButton from "@/components/AddToCartButton";
import { Product,Category } from "@/lib/types";
import { api_get } from "@/lib/http_methods";
import {format_product_query} from "@/lib/image_store_handler";
import Image from "next/image";

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function ProductDetailsPage({ params }: PageProps) {
  const { id } = await params;
  const productId = Number(id);

  if (Number.isNaN(productId)) {notFound();}

  const product:Product = await api_get<Product>(`/api/protected/product/${id}`);
  // const categories:Category[] = await api_get<Category[]>("/api/category");

  if (!product) {notFound();}

  const categoryID = product.category_id;
  const category:Category = await api_get<Category>(`/api/protected/category/${categoryID}`);
  const isFeatured = Boolean(product.is_featured);
  const isLowStock = product.stock_quantity > 0 && product.stock_quantity <= 5;
  const isOutOfStock = product.stock_quantity <= 0;
  const product_image_url = format_product_query(product.product_id);


  return (
    <main className="min-h-screen bg-gray-50 text-gray-900">
      <section className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-6 lg:px-8">
          <div className="flex flex-wrap items-center gap-2 text-sm text-gray-500">
            <Link href="/" className="hover:text-black">
              Home
            </Link>
            <span>/</span>
            <Link href="/catalog" className="hover:text-black">
              Catalog
            </Link>
            <span>/</span>
            <span className="text-gray-700">{product.name}</span>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-2">
          <div className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm">
            <div className="relative h-[420px] bg-gray-100">
              <Image 
                src={product_image_url}
                alt={product.name}
                fill
                className="object-contain object-center"
                sizes="(max-width: 1024px) 100vw, 50vw"
                unoptimized
              />
            </div>
          </div>

          <div>
            <div className="mb-4 flex flex-wrap gap-2">
              {isFeatured && (
                <span className="rounded-full bg-black px-3 py-1 text-xs font-semibold text-white">
                  Featured
                </span>
              )}

              {category && (
                <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700">
                  {category.category_name}
                </span>
              )}

              {isLowStock && !isOutOfStock && (
                <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
                  Low Stock
                </span>
              )}

              {isOutOfStock && (
                <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700">
                  Out of Stock
                </span>
              )}
            </div>

            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gray-500">
              {product.brand ?? "BarelyNecessary"}
            </p>

            <h1 className="mt-2 text-4xl font-bold tracking-tight">
              {product.name}
            </h1>

            {product.model && (
              <p className="mt-2 text-sm text-gray-500">Model: {product.model}</p>
            )}

            {product.short_tagline && (
              <p className="mt-5 text-lg text-gray-600">
                {product.short_tagline}
              </p>
            )}

            <div className="mt-6 flex items-center gap-4">
              <span className="text-3xl font-bold text-gray-900">
                ${Number(product.price).toFixed(2)}
              </span>
              <span className="text-sm text-gray-500">
                Available stock: {product.stock_quantity}
              </span>
            </div>

            <div className="mt-8 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold">Product Description</h2>
              <p className="mt-3 leading-7 text-gray-600">
                {product.description}
              </p>
            </div>

            <div className="mt-8 flex flex-wrap gap-4">
              <AddToCartButton
                product={{product_id: product.product_id,
                name: product.name,
                price: product.price,
                image_url: product_image_url ?? undefined,}}/>

              <Link
                href="/catalog"
                className="rounded-xl border border-gray-300 px-6 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-100"
              >
                Back to Catalog
              </Link>
            </div>

            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
                <p className="text-xs uppercase tracking-wide text-gray-500">
                  Shipping
                </p>
                <p className="mt-2 text-sm text-gray-700">
                  Shipping info shown here
                </p>
              </div>

              <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
                <p className="text-xs uppercase tracking-wide text-gray-500">
                  Payment
                </p>
                <p className="mt-2 text-sm text-gray-700">
                  Supports saved or new payment info
                </p>
              </div>

              <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
                <p className="text-xs uppercase tracking-wide text-gray-500">
                  Reviews
                </p>
                <p className="mt-2 text-sm text-gray-700">
                  Review section can be added later
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}