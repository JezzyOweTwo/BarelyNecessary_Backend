"use client";

import { addToCart } from "@/lib/cart";
import {format_product_query} from "@/lib/image_store_handler";

type Props = {
  product: {
    product_id: number;
    name: string;
    price: number;
    image_url: string | undefined;
  };
  disabled?:boolean;
  className?: string;
};

export default function AddToCartButton({ product }: Props) {
  const handleClick = () => {
    addToCart({
      ...product,
      image_url: format_product_query(product.product_id) ?? null,
      quantity: 1,
    });
  };

  return (
    <button
      onClick={handleClick}
      className="rounded-xl bg-black px-6 py-3 text-sm font-medium text-white hover:bg-gray-800"
    >
      Add to Cart
    </button>
  );
}