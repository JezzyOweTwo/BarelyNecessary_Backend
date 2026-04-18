"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { clearCart } from "@/lib/cart";

function SuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const [cleared, setCleared] = useState(false);
  const [fulfillStatus, setFulfillStatus] = useState<"idle" | "working" | "done" | "error">("idle");
  const [fulfillMessage, setFulfillMessage] = useState<string | null>(null);
  useEffect(() => {
    if (!cleared) {
      clearCart();
      setCleared(true);
    }
  }, [cleared]);

  useEffect(() => {
    if (!sessionId) return;
    const token = typeof window !== "undefined" ? localStorage.getItem("auth") : null;
    if (!token) {
      setFulfillStatus("idle");
      return;
    }

    let cancelled = false;

    async function fulfillWithRetries() {
      setFulfillStatus("working");
      const delays = [0, 800, 2000, 4000];
      for (let i = 0; i < delays.length; i++) {
        if (cancelled) return;
        if (delays[i] > 0) {
          await new Promise((r) => setTimeout(r, delays[i]));
        }
        if (cancelled) return;
        try {
          const res = await fetch("/api/stripe/fulfill-session", {
            method: "POST",
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ session_id: sessionId }),
          });
          const json = (await res.json()) as { success?: boolean; message?: string; data?: unknown };
          if (res.ok && json.success) {
            if (!cancelled) {
              setFulfillStatus("done");
              setFulfillMessage(null);
            }
            return;
          }
          if (res.status === 409 && json.message?.includes("Payment status")) {
            continue;
          }
          if (!cancelled) {
            setFulfillStatus("error");
            const fallback = typeof json.data === "string" ? json.data : null;
            setFulfillMessage(json.message ?? fallback ?? "Could not save your order.");
          }
          return;
        } catch {
          if (!cancelled) {
            setFulfillStatus("error");
            setFulfillMessage("Network error while saving your order.");
          }
          return;
        }
      }
      if (!cancelled) {
        setFulfillStatus("error");
        setFulfillMessage("Payment may still be processing. Check Orders in a minute or contact support.");
      }
    }

    void fulfillWithRetries();
    return () => {
      cancelled = true;
    };
  }, [sessionId]);

  return (
    <main className="min-h-screen bg-gray-50 text-gray-900">
      <section className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-2xl px-6 py-14 lg:px-8">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gray-500">Checkout</p>
          <h1 className="mt-2 text-4xl font-bold tracking-tight">Payment successful</h1>
          <p className="mt-4 text-gray-600">
            Thank you. Stripe confirmed your payment. We&apos;re saving your order to your account now.
          </p>
          {fulfillStatus === "working" && (
            <p className="mt-3 text-sm text-gray-600">Saving order…</p>
          )}
          {fulfillStatus === "error" && fulfillMessage && (
            <p className="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
              {fulfillMessage}
            </p>
          )}
          {fulfillStatus === "done" && (
            <p className="mt-3 text-sm text-emerald-800">Order saved. You can view it under Orders.</p>
          )}
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
