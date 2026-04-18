"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { clearCart } from "@/lib/cart";

function SuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const [cleared, setCleared] = useState(false);

  useEffect(() => {
    if (!cleared) {
      clearCart();
      setCleared(true);
    }
  }, [cleared]);

  return (
    <main className="min-h-screen bg-gray-50 text-gray-900">
      <section className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-2xl px-6 py-14 lg:px-8">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gray-500">Checkout</p>
          <h1 className="mt-2 text-4xl font-bold tracking-tight">Payment successful</h1>
          <p className="mt-4 text-gray-600">
            Thank you. Stripe confirmed your payment. Your order will show up under Orders once the
            server finishes saving it (usually within a few seconds).
          </p>
          {sessionId && (
            <p className="mt-2 text-xs text-gray-500">
              Reference: <span className="font-mono">{sessionId}</span>
            </p>
          )}
        </div>
      </section>

      <section className="mx-auto max-w-2xl px-6 py-10 lg:px-8">
        <div className="flex flex-col gap-3 sm:flex-row">
          <Link
            href="/orders"
            className="inline-flex justify-center rounded-xl bg-black px-6 py-3 text-sm font-medium text-white transition hover:bg-gray-800"
          >
            View orders
          </Link>
          <Link
            href="/catalog"
            className="inline-flex justify-center rounded-xl border border-gray-300 bg-white px-6 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
          >
            Continue shopping
          </Link>
        </div>
      </section>
    </main>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-gray-50 p-10 text-center text-gray-600">Loading…</main>
      }
    >
      <SuccessContent />
    </Suspense>
  );
}
