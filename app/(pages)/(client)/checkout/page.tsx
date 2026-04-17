"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { clearCart, getCart, type CartItem } from "@/lib/cart";

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-CA", { style: "currency", currency: "CAD" }).format(amount);
}

export default function CheckoutPage() {
  const router = useRouter();
  const [items, setItems] = useState<CartItem[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);

  const [fullName, setFullName] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [province, setProvince] = useState("");
  const [postalCode, setPostalCode] = useState("");

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

  async function onPlaceOrder(e: FormEvent) {
    e.preventDefault();
    setSuccess(null);
    setSubmitting(true);
    try {
      // No order/stripe endpoint exists yet in this repo, so we complete checkout client-side for now.
      // When the backend order route is added, this is where we'd POST the cart + shipping info.
      await new Promise((r) => setTimeout(r, 400));

      clearCart();
      setSuccess("Order placed (demo). Your cart has been cleared.");
      router.refresh();
    } finally {
      setSubmitting(false);
    }
  }

  if (items.length === 0) {
    return (
      <main className="min-h-screen bg-gray-50 text-gray-900">
        <section className="border-b border-gray-200 bg-white">
          <div className="mx-auto max-w-2xl px-6 py-14 lg:px-8">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gray-500">
              Checkout
            </p>
            <h1 className="mt-2 text-4xl font-bold tracking-tight">Checkout</h1>
            <p className="mt-4 text-gray-600">Your cart is empty.</p>
          </div>
        </section>
        <section className="mx-auto max-w-2xl px-6 py-10 lg:px-8">
          <div className="rounded-3xl border border-dashed border-gray-300 bg-white p-10 text-center shadow-sm">
            <h2 className="text-xl font-semibold">Nothing to checkout</h2>
            <p className="mt-2 text-sm text-gray-600">
              Add products to your cart first.
            </p>
            <Link
              href="/catalog"
              className="mt-6 inline-flex rounded-xl bg-black px-6 py-3 text-sm font-medium text-white transition hover:bg-gray-800"
            >
              Go to catalog
            </Link>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 text-gray-900">
      <section className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-14 lg:px-8">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gray-500">Checkout</p>
          <h1 className="mt-2 text-4xl font-bold tracking-tight">Checkout</h1>
          <p className="mt-4 max-w-2xl text-gray-600">
            Enter shipping details and place your order.
          </p>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-8 px-6 py-10 lg:grid-cols-3 lg:px-8">
        <form
          onSubmit={onPlaceOrder}
          className="lg:col-span-2 rounded-3xl border border-gray-200 bg-white p-8 shadow-sm"
        >
          {success && (
            <div className="mb-6 rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
              {success}
            </div>
          )}

          <h2 className="text-xl font-semibold">Shipping info</h2>
          <div className="mt-6 grid gap-5">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700" htmlFor="fullName">
                Full name
              </label>
              <input
                id="fullName"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-black"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700" htmlFor="address">
                Address
              </label>
              <input
                id="address"
                required
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-black"
              />
            </div>
            <div className="grid gap-5 md:grid-cols-3">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700" htmlFor="city">
                  City
                </label>
                <input
                  id="city"
                  required
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-black"
                />
              </div>
              <div>
                <label
                  className="mb-2 block text-sm font-medium text-gray-700"
                  htmlFor="province"
                >
                  Province
                </label>
                <input
                  id="province"
                  required
                  value={province}
                  onChange={(e) => setProvince(e.target.value)}
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-black"
                />
              </div>
              <div>
                <label
                  className="mb-2 block text-sm font-medium text-gray-700"
                  htmlFor="postalCode"
                >
                  Postal code
                </label>
                <input
                  id="postalCode"
                  required
                  value={postalCode}
                  onChange={(e) => setPostalCode(e.target.value)}
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-black"
                />
              </div>
            </div>
          </div>

          <div className="mt-8 flex flex-col gap-3 md:flex-row md:items-center">
            <button
              type="submit"
              disabled={submitting}
              className="rounded-xl bg-black px-6 py-3 text-sm font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? "Placing order..." : "Place order"}
            </button>
            <Link
              href="/cart"
              className="rounded-xl border border-gray-300 px-6 py-3 text-center text-sm font-medium text-gray-700 transition hover:bg-gray-50"
            >
              Back to cart
            </Link>
          </div>
        </form>

        <aside className="h-fit rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold">Order summary</h2>
          <div className="mt-5 space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Items</span>
              <span className="font-medium">{itemCount}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Subtotal</span>
              <span className="font-medium">{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Shipping</span>
              <span className="font-medium">{formatCurrency(0)}</span>
            </div>
            <div className="flex items-center justify-between border-t border-gray-200 pt-3">
              <span className="text-gray-900">Total</span>
              <span className="text-base font-semibold">{formatCurrency(subtotal)}</span>
            </div>
          </div>

          <div className="mt-6 space-y-3">
            {items.slice(0, 5).map((item) => (
              <div key={item.product_id} className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-gray-900">{item.name}</p>
                  <p className="text-xs text-gray-600">Qty {item.quantity}</p>
                </div>
                <p className="text-sm font-semibold">
                  {formatCurrency(Number(item.price) * item.quantity)}
                </p>
              </div>
            ))}
            {items.length > 5 && (
              <p className="text-xs text-gray-500">+ {items.length - 5} more item(s)</p>
            )}
          </div>
        </aside>
      </section>
    </main>
  );
}