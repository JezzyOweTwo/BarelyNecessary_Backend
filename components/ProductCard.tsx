import Link from "next/link";
import type { Product } from "@/lib/types";
import AddToCartButton from "./AddToCartButton";
import {format_product_query} from "@/lib/image_store_handler";
import Image from "next/image";

type ProductCardProps = {
  product: Product;
};

export default function ProductCard({ product }: ProductCardProps) {
  const isLowStock = product.stock_quantity > 0 && product.stock_quantity <= 5;
  const isOutOfStock = product.stock_quantity <= 0;

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md">
      <div className="relative flex h-52 items-center justify-center bg-gray-100">
        <Image 
          src={format_product_query(product.product_id)}
          alt={product.name}
          fill
          className="object-contain object-center"
          sizes="(max-width: 1024px) 100vw, 50vw"
          unoptimized
        />  

        <div className="absolute left-3 top-3 flex gap-2">
          {product.is_featured && (
            <span className="rounded-full bg-black px-3 py-1 text-xs font-semibold text-white">
              Featured
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
      </div>

      <div className="flex flex-1 flex-col p-5">
        <div className="mb-2">
          <p className="text-xs uppercase tracking-wide text-gray-500">
            {product.brand || "Generic Brand"}
          </p>
          <h3 className="mt-1 text-lg font-semibold text-gray-900">
            {product.name}
          </h3>
          {product.model && (
            <p className="mt-1 text-sm text-gray-500">Model: {product.model}</p>
          )}
        </div>

        {product.short_tagline && (
          <p className="mb-3 text-sm text-gray-600">{product.short_tagline}</p>
        )}

        <p className="mb-4 line-clamp-3 text-sm text-gray-600">
          {product.description}
        </p>

        <div className="mt-auto">
          <div className="mb-4 flex items-center justify-between">
            <span className="text-2xl font-bold text-gray-900">
              ${product.price.toFixed(2)}
            </span>
            <span className="text-sm text-gray-500">
              Qty: {product.stock_quantity}
            </span>
          </div>

          <div className="flex gap-3">
            <Link
              href={`/product/${product.product_id}`}
              className="flex-1 rounded-xl border border-gray-300 px-4 py-2 text-center text-sm font-medium text-gray-700 transition hover:bg-gray-50"
            >
              View Details
            </Link>

            <AddToCartButton
              product={{product_id: product.product_id,
              name: product.name,
              price: product.price,
              image_url: format_product_query(product.product_id),
              stock_quantity: product.stock_quantity,}}/>
  
          </div>
        </div>
      </div>
    </div>
  );
}
