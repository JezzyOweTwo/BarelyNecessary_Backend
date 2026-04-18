"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

type AdminOrderItem = {
  order_item_id: number;
  product_id: number | null;
  quantity: number;
  price_at_purchase: number;
  line_total: number;
  product_name: string | null;
};

type AdminOrder = {
  order_id: number;
  user_id: string;
  customer_name: string;
  customer_email: string;
  order_status: string;
  payment_status: string;
  total_amount: number;
  order_date: string;
  shipping_address: string | null;
  billing_address: string | null;
  payment_summary: string | null;
  items: AdminOrderItem[];
};

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-CA", {
    style: "currency",
    currency: "CAD",
  }).format(amount);
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

export default function AdminOrdersPage() {
  const pathname = usePathname();
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [unauthorized, setUnauthorized] = useState(false);

  const loadOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    setUnauthorized(false);

    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("auth") : null;

      const res = await fetch("/api/admin/orders", {
        credentials: "include",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      if (res.status === 401 || res.status === 403) {
        setUnauthorized(true);
        setOrders([]);
        return;
      }

      const json = (await res.json()) as {
        success?: boolean;
        data?: AdminOrder[];
        message?: string;
      };

      if (!res.ok) {
        throw new Error(json.message ?? "Could not load admin orders.");
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

  const hasOrders = orders.length > 0;

  return (
    <main className="min-h-screen bg-gray-50 text-gray-900">
      <section className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-14 lg:px-8">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gray-500">
            Admin
          </p>
          <h1 className="mt-2 text-4xl font-bold tracking-tight">
            All Orders
          </h1>
          <p className="mt-4 max-w-2xl text-gray-600">
            View all customer orders, statuses, payment details, and items.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 pt-16 pb-20 lg:px-8">
        {loading && (
          <div className="rounded-3xl border border-gray-200 bg-white p-10 text-center text-gray-600 shadow-sm">
            Loading all orders...
          </div>
        )}

        {!loading && unauthorized && (
          <div className="rounded-3xl border border-dashed border-gray-300 bg-white p-10 text-center shadow-sm">
            <h2 className="text-2xl font-semibold text-gray-900">
              Admin access required
            </h2>
            <p className="mt-3 text-sm text-gray-600">
              You must be logged in as an admin to view all customer orders.
            </p>
            <div className="mt-6">
              <Link
                href="/login?next=/admin/orders"
                className="inline-flex rounded-xl bg-black px-6 py-3 text-sm font-medium text-white transition hover:bg-gray-800"
              >
                Log in
              </Link>
            </div>
          </div>
        )}

        {!loading && !unauthorized && error && (
          <div className="rounded-3xl border border-red-200 bg-red-50 p-8 shadow-sm">
            <p className="font-medium text-red-800">{error}</p>
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
          <div className="rounded-3xl border border-dashed border-gray-300 bg-white px-8 py-14 text-center shadow-sm">
            <h2 className="text-xl font-semibold text-gray-900">No orders found</h2>
            <p className="mt-4 text-sm text-gray-600">
              Once customers place orders, they will appear here.
            </p>
          </div>
        )}

        {!loading && !unauthorized && !error && hasOrders && (
          <div className="mt-8 space-y-8">
            {orders.map((order) => (
              <article
                key={order.order_id}
                className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm"
              >
                <div className="flex flex-col gap-4 border-b border-gray-100 bg-gray-50 px-6 py-5 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <p className=" mt-8  text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Order #{order.order_id}
                    </p>
                    <h2 className="mt-2 text-xl font-semibold text-gray-900">
                      {order.customer_name || "Unknown Customer"}
                    </h2>
                    <p className="mt-1 text-sm text-gray-600">{order.customer_email}</p>
                    <p className="mt-2 text-sm text-gray-600">
                      User ID: {order.user_id}
                    </p>
                    <p className="mt-2 text-sm text-gray-600">
                      Placed: {formatDate(order.order_date)}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${orderStatusPill(order.order_status)}`}
                    >
                      {order.order_status}
                    </span>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${paymentStatusPill(order.payment_status)}`}
                    >
                      Payment: {order.payment_status}
                    </span>
                    <span className="text-base font-semibold text-gray-900">
                      {formatCurrency(order.total_amount)}
                    </span>
                  </div>
                </div>

                <div className="grid gap-6 px-6 py-6 md:grid-cols-3">
                  <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
                    <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
                      Shipping Address
                    </h3>
                    <p className="mt-3 text-sm text-gray-700">
                      {order.shipping_address || "No shipping address stored."}
                    </p>
                  </div>

                  {/* <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
                    <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
                      Billing Address
                    </h3>
                    <p className="mt-3 text-sm text-gray-700">
                      {order.billing_address || "No billing address stored."}
                    </p>
                  </div> */}

                  {/* <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
                    <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
                      Payment Method
                    </h3>
                    <p className="mt-3 text-sm text-gray-700">
                      {order.payment_summary || "No payment method stored."}
                    </p>
                  </div> */}
                </div>

                <div className="border-t border-gray-100 px-6 py-6">
                  <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
                    Items
                  </h3>

                  <ul className="mt-5 space-y-5 divide-y divide-gray-100">
                    {order.items.length === 0 ? (
                      <li className="pt-1 text-sm text-gray-600">
                        No line items stored for this order.
                      </li>
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

                          <p className="text-sm font-semibold text-gray-900">
                            {formatCurrency(item.line_total)}
                          </p>
                        </li>
                      ))
                    )}
                  </ul>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}