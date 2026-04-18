"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  clearCart,
  getCart,
  removeFromCart,
  setCartItemQuantity,
  type CartItem,
} from "@/lib/cart";

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-CA", { style: "currency", currency: "CAD" }).format(amount);
}

export default function CartPage() {
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    const sync = () => setItems(getCart());
    sync();
    window.addEventListener("cart:updated", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("cart:updated", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const subtotal = useMemo(() => {
    return items.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0);
  }, [items]);

  const itemCount = useMemo(() => items.reduce((sum, item) => sum + item.quantity, 0), [items]);

  return (
    <main className="min-h-screen bg-gray-50 text-gray-900">
      <section className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-14 lg:px-8">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gray-500">Cart</p>
          <h1 className="mt-2 text-4xl font-bold tracking-tight">Your Cart</h1>
          <p className="mt-4 max-w-2xl text-gray-600">
            Review items, update quantities, then head to checkout.
          </p>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl grid-cols-1 gap-10 px-6 py-10 lg:grid-cols-[minmax(0,1fr)_minmax(280px,22rem)] lg:gap-x-16 lg:gap-y-10 lg:px-8 xl:gap-x-24">
        <div className="mb-6 min-w-0">
          {items.length === 0 ? (
            <div className="flex flex-col items-center rounded-3xl border border-dashed border-gray-300 bg-white px-10 pb-14 pt-12 text-center shadow-sm">
              <h1 className="mt-6 text-xl font-semibold">Your cart is empty</h1>
              <p className="mt-4 text-sm text-gray-600">Browse products and add to cart!</p>
              <Link
                href="/catalog"
                className="mt-8 mb-6 rounded-xl bg-black px-6 py-3 text-sm font-medium text-white transition hover:bg-gray-800"
              >
                Go to catalog
              </Link>
            </div>
          ) : (
            <div className="space-y-8">
              {items.map((item) => (
                <div
                  key={item.product_id}
                  className="mb-6 flex flex-col gap-4 rounded-3xl border border-gray-200 bg-white p-6 shadow-sm sm:flex-row sm:items-center"
                >
                  <div className="relative h-24 w-24 overflow-hidden rounded-2xl border border-gray-200 bg-gray-50">
                    {item.image_url ? (
                      <Image
                        src={item.image_url}
                        alt={item.name}
                        fill
                        className="object-cover"
                        sizes="96px"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-xs text-gray-400">
                        No image
                      </div>
                    )}
                  </div>

                  <div className="flex-1">
                    <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                      <div>
                        <p className="text-sm text-gray-500">Product</p>
                        <p className="mt-1 text-lg font-semibold">{item.name}</p>
                        <p className="mt-1 text-sm text-gray-600">
                          {formatCurrency(Number(item.price))} each
                        </p>
                      </div>

                      <div className="flex items-center gap-3">
                        <label className="text-sm text-gray-600" htmlFor={`qty-${item.product_id}`}>
                          Qty
                        </label>
                        <input
                          id={`qty-${item.product_id}`}
                          type="number"
                          min={1}
                          value={item.quantity}
                          onChange={(e) =>
                            setCartItemQuantity(item.product_id, Number(e.target.value))
                          }
                          className="w-20 rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none transition focus:border-black"
                        />
                        <button
                          onClick={() => removeFromCart(item.product_id)}
                          className="rounded-xl border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                        >
                          Remove
                        </button>
                      </div>
                    </div>

                    <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-4">
                      <p className="text-sm text-gray-600">Line total</p>
                      <p className="text-sm font-semibold">
                        {formatCurrency(Number(item.price) * item.quantity)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <Link
                  href="/catalog"
                  className="rounded-xl border border-gray-300 bg-white px-6 py-3 text-center text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                >
                  Continue shopping
                </Link>
                <button
                  onClick={() => clearCart()}
                  className="rounded-xl border border-gray-300 bg-white px-6 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                >
                  Clear cart
                </button>
              </div>
            </div>
          )}
        </div>

        <aside className="h-fit w-full justify-self-end rounded-2xl border border-gray-200 bg-white p-6 shadow-sm lg:max-w-sm lg:sticky lg:top-24">
          <h2 className="text-xl font-semibold">Summary</h2>
          <div className="mt-5 space-y-5 text-sm">
            <div className="flex items-center justify-between py-0.5">
              <span className="text-gray-600">Items</span>
              <span className="font-medium">{itemCount}</span>
            </div>
            <div className="flex items-center justify-between py-0.5">
              <span className="text-gray-600">Subtotal</span>
              <span className="font-medium">{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex items-center justify-between py-0.5">
              <span className="text-gray-600">Estimated shipping</span>
              <span className="font-medium">{items.length ? formatCurrency(0) : formatCurrency(0)}</span>
            </div>
            <div className="flex items-center justify-between border-t border-gray-200 pt-4">
              <span className="text-gray-900">Total</span>
              <span className="text-base font-semibold">{formatCurrency(subtotal)}</span>
            </div>
          </div>

          <Link
            href="/checkout"
            aria-disabled={items.length === 0}
            className={`mt-6 block rounded-xl px-6 py-3 text-center text-sm font-medium text-white transition ${
              items.length === 0 ? "cursor-not-allowed bg-gray-400" : "bg-black hover:bg-gray-800"
            }`}
            onClick={(e) => {
              if (items.length === 0) e.preventDefault();
            }}
          >
            Go to checkout
          </Link>
        </aside>
      </section>
    </main>
  );
}