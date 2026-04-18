"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

type OrderItem = {
  order_item_id: number;
  product_id: number | null;
  quantity: number;
  price_at_purchase: number;
  line_total: number;
  product_name: string | null;
  product_image_url: string | null;
};

type Order = {
  order_id: number;
  order_status: string;
  payment_status: string;
  total_amount: number;
  order_date: string;
  items: OrderItem[];
};

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-CA", { style: "currency", currency: "CAD" }).format(amount);
}

function formatDate(iso: string) {
  try {
    return new Intl.DateTimeFormat("en-CA", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

function orderStatusPill(status: string) {
  const s = status.toLowerCase();
  const map: Record<string, string> = {
    pending: "bg-amber-100 text-amber-900",
    paid: "bg-emerald-100 text-emerald-900",
    shipped: "bg-sky-100 text-sky-900",
    completed: "bg-emerald-100 text-emerald-900",
    cancelled: "bg-gray-200 text-gray-800",
    failed: "bg-red-100 text-red-800",
  };
  return map[s] ?? "bg-gray-100 text-gray-800";
}

function paymentStatusPill(status: string) {
  const s = status.toLowerCase();
  const map: Record<string, string> = {
    pending: "bg-amber-100 text-amber-900",
    accepted: "bg-emerald-100 text-emerald-900",
    denied: "bg-red-100 text-red-800",
  };
  return map[s] ?? "bg-gray-100 text-gray-800";
}

export default function OrdersPage() {
  const pathname = usePathname();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [unauthorized, setUnauthorized] = useState(false);

  const loadOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    setUnauthorized(false);
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("auth") : null;
      const res = await fetch("/api/orders", {
        credentials: "include",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      if (res.status === 401 || res.status === 403) {
        setUnauthorized(true);
        setOrders([]);
        return;
      }

      const json = (await res.json()) as { success?: boolean; data?: Order[]; message?: string };
      if (!res.ok) {
        const fallback =
          typeof (json as { data?: unknown }).data === "string" ? (json as { data?: string }).data : null;
        throw new Error(json.message ?? fallback ?? "Could not load orders.");
      }
      setOrders(Array.isArray(json.data) ? json.data : []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadOrders();
  }, [loadOrders, pathname]);

  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState === "visible") void loadOrders();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, [loadOrders]);

  const hasOrders = orders.length > 0;

  const emptyHint = useMemo(
    () => "Completed purchases from checkout will show up here.",
    []
  );

  return (
    <main className="min-h-screen bg-gray-50 text-gray-900">
      <section className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-14 lg:px-8">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gray-500">Orders</p>
          <h1 className="mt-2 text-4xl font-bold tracking-tight">My Orders</h1>
          <p className="mt-4 max-w-2xl text-gray-600">
            Track order status, totals, and line items.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 pt-16 pb-20 lg:px-8">
        {loading && (
          <div className="rounded-3xl border border-gray-200 bg-white p-10 text-center text-gray-600 shadow-sm">
            Loading your orders…
          </div>
        )}

        {!loading && unauthorized && (
          <div className="mt-10 rounded-3xl border border-dashed border-gray-300 bg-white p-10 text-center shadow-sm">
            <h1 className="mt-6 text-2xl font-semibold">Sign in to view your orders!</h1>
            {/* <p className="mt-3 text-sm text-gray-600">
              Order history is available after you log in with an account that has placed orders.
            </p> */}
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/login?next=/orders"
                className="mb-8 inline-flex rounded-xl bg-black px-6 py-3 text-sm font-medium text-white transition hover:bg-gray-800"
              >
                Log in
              </Link>
              <Link
                href="/register"
                className="mb-8 inline-flex rounded-xl border border-gray-300 bg-white px-6 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
              >
                Register
              </Link>
            </div>
          </div>
        )}

        {!loading && !unauthorized && error && (
          <div className="rounded-3xl border border-red-200 bg-red-50 p-8 shadow-sm">
            <p className="font-medium text-red-800">{error}</p>
            <p className="mt-2 text-sm text-red-700">
              Check that the database is running and configured. You can try again in a moment.
            </p>
            <button
              type="button"
              onClick={() => void loadOrders()}
              className="mt-6 rounded-xl border border-red-300 bg-white px-5 py-2 text-sm font-medium text-red-800 transition hover:bg-red-100"
            >
              Retry
            </button>
          </div>
        )}

        {!loading && !unauthorized && !error && !hasOrders && (
          <div className="mt-5 mb-5 rounded-3xl border border-dashed border-gray-300 bg-white px-8 py-14 text-center shadow-sm sm:px-14 sm:py-16">
            <h2 className="text-xl font-semibold text-gray-900">No orders yet</h2>
            <p className="mx-auto mt-5 max-w-md text-sm leading-relaxed text-gray-600">{emptyHint}</p>
            <div className="mt-14 flex justify-center sm:mt-16">
              <Link
                href="/catalog"
                className="inline-flex rounded-xl bg-black px-8 py-3.5 text-sm font-medium text-white transition hover:bg-gray-800"
              >
                Browse catalog
              </Link>
            </div>
          </div>
        )}

        {!loading && !unauthorized && !error && hasOrders && (
          <div className="mt-5 mb-5 space-y-8">
            {orders.map((order) => (
              <article
                key={order.order_id}
                className="mt-5 mb-5 overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm"
              >
                <div className="mt-5 mb-5 flex flex-col gap-4 border-b border-gray-100 bg-gray-50/80 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="mt-5 mb-5 text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Order #{order.order_id}
                    </p>
                    <p className="mt-1 text-sm text-gray-600">{formatDate(order.order_date)}</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`mt-5 mb-5 rounded-full px-3 py-1 text-xs font-semibold capitalize ${orderStatusPill(order.order_status)}`}
                    >
                      {order.order_status}
                    </span>
                    <span
                      className={`mt-5 mb-5 rounded-full px-3 py-1 text-xs font-semibold capitalize ${paymentStatusPill(order.payment_status)}`}
                    >
                      Payment: {order.payment_status}
                    </span>
                    <span className="text-base font-semibold text-gray-900">
                      {formatCurrency(order.total_amount)}
                    </span>
                  </div>
                </div>

                <div className="px-6 py-6">
                  <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
                    Items
                  </h3>
                  <ul className="mt-5 space-y-5 divide-y divide-gray-100">
                    {order.items.length === 0 ? (
                      <li className="pt-1 text-sm text-gray-600">No line items stored for this order.</li>
                    ) : (
                      order.items.map((item) => (
                        <li
                          key={item.order_item_id}
                          className="flex flex-col gap-3 pt-5 first:pt-0 sm:flex-row sm:items-center sm:justify-between"
                        >
                          <div className="min-w-0 flex-1">
                            <p className="font-medium text-gray-900">
                              {item.product_name ?? `Product #${item.product_id ?? "?"}`}
                            </p>
                            <p className="mt-1 text-sm text-gray-600">
                              Qty {item.quantity} × {formatCurrency(item.price_at_purchase)}
                            </p>
                          </div>
                          <p className="text-sm font-semibold text-gray-900 sm:text-right">
                            {formatCurrency(item.line_total)}
                          </p>
                        </li>
                      ))
                    )}
                  </ul>

                  <div className="mt-8 flex flex-wrap gap-3 border-t border-gray-100 pt-6">
                    <Link
                      href="/catalog"
                      className="rounded-xl border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                    >
                      Continue shopping
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
