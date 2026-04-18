"use client";

import { addToCart } from "@/lib/cart";
import {format_product_query} from "@/lib/image_store_handler";

type Props = {
  product: {
    product_id: number;
    name: string;
    price: number;
    image_url: string | undefined;
    stock_quantity: number;
  };
  disabled?:boolean;
  className?: string;
};

export default function AddToCartButton({ product }: Props) {
  const handleClick = () => {
    if (product.stock_quantity <= 0) {
      if (typeof document !== "undefined") {
        document.dispatchEvent(
          new CustomEvent("cart:outOfStock", {
            bubbles: true,
            detail: { name: product.name },
          })
        );
      }
      return;
    }
    addToCart({
      ...product,
      image_url: format_product_query(product.product_id) ?? null,
      quantity: 1,
    });
  };

  return (
    <button
      onClick={handleClick}
      disabled={product.stock_quantity <= 0}
      className="rounded-xl bg-black px-6 py-3 text-sm font-medium text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:bg-gray-300 disabled:text-gray-600 disabled:hover:bg-gray-300"
    >
      {product.stock_quantity <= 0 ? "Out of stock" : "Add to Cart"}
    </button>
  );
}