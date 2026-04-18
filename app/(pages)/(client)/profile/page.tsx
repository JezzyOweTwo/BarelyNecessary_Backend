"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

type ProfileData = {
  first_name?: string;
  last_name?: string;
  email?: string;
  username?: string;
  phone?: string;
  role?: string;
  is_active?: boolean;
};
type Address = {
  address_id: number;
  address_type: "shipping" | "billing";
  street: string;
  city: string;
  province: string;
  postal_code: string;
  country: string;
  is_default: boolean;
};

type PaymentMethod = {
  payment_id: number;
  cardholder_name: string;
  card_last4: string;
  card_brand: string | null;
  expiry_month: number;
  expiry_year: number;
  is_default: boolean;
};
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
  shipping_address_id: number | null;
  billing_address_id: number | null;
  payment_id: number | null;
  items: OrderItem[];
};

export default function ProfilePage() {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [unauthorized, setUnauthorized] = useState(false);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [payments, setPayments] = useState<PaymentMethod[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);

  const loadProfile = useCallback(async () => {
  setLoading(true);
  setError(null);
  setUnauthorized(false);

  try {
    const token = typeof window !== "undefined" ? localStorage.getItem("auth") : null;

    const headers: HeadersInit = token
      ? { Authorization: `Bearer ${token}` }
      : {};

    const [profileRes, ordersRes, addressesRes, paymentsRes] = await Promise.all([
      fetch("/api/profile", { credentials: "include", headers }),
      fetch("/api/orders", { credentials: "include", headers }),
      fetch("/api/profile/addresses", { credentials: "include", headers }),
      fetch("/api/profile/payments", { credentials: "include", headers }),
    ]);

    if (
      profileRes.status === 401 || profileRes.status === 403 ||
      ordersRes.status === 401 || ordersRes.status === 403 ||
      addressesRes.status === 401 || addressesRes.status === 403 ||
      paymentsRes.status === 401 || paymentsRes.status === 403
    ) {
      setUnauthorized(true);
      setProfile(null);
      setOrders([]);
      setAddresses([]);
      setPayments([]);
      return;
    }

    const profileJson = await profileRes.json();
    const ordersJson = await ordersRes.json();
    const addressesJson = await addressesRes.json();
    const paymentsJson = await paymentsRes.json();

    setProfile(profileJson.data ?? null);
    setOrders(Array.isArray(ordersJson.data) ? ordersJson.data : []);
    setAddresses(Array.isArray(addressesJson.data) ? addressesJson.data : []);
    setPayments(Array.isArray(paymentsJson.data) ? paymentsJson.data : []);

  } catch (e) {
    setError(e instanceof Error ? e.message : "Something went wrong.");
  } finally {
    setLoading(false);
  }
}, []);

  useEffect(() => {
    void loadProfile();
  }, [loadProfile]);

  return (
    <main className="min-h-screen bg-gray-50 text-gray-900">
      <section className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-14 lg:px-8">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gray-500">
            Account
          </p>
          <h1 className="mt-2 text-4xl font-bold tracking-tight">
            My Account
          </h1>
          <p className="mt-4 max-w-2xl text-gray-600">
            View your profile details, contact information, saved addresses,
            payment methods, and recent orders.
          </p>
        </div>
      </section>

      <section className=" mx-auto max-w-7xl space-y-10 gap-10 px-6 py-10 lg:px-8">
        {loading && (
          <div className="rounded-3xl border border-gray-200 bg-white p-10 text-center text-gray-600 shadow-sm">
            Loading your profile…
          </div>
        )}

        {!loading && unauthorized && (
          <div className=" rounded-3xl border border-dashed border-gray-300 bg-white p-10 text-center shadow-sm">
            <h1 className=" mt-6 text-2xl font-semibold ">Sign in to view your account!</h1>
            {/* <p className="mt-4 text-sm text-gray-600">
              Your profile is loaded from your account after you log in.
            </p> */}
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/login?next=/profile"
                className="mb-8 inline-flex rounded-xl bg-black px-6 py-3 text-m font-medium text-white transition hover:bg-gray-800"
              >
                Log in
              </Link>
              <Link
                href="/register?next=/profile"
                className="mb-8 inline-flex rounded-xl border border-gray-300 bg-white px-6 py-3 text-m font-medium text-gray-700 transition hover:bg-gray-50"
              >
                Register
              </Link>
            </div>
          </div>
        )}

        {!loading && !unauthorized && error && (
          <div className="rounded-3xl border border-red-200 bg-red-50 p-8 shadow-sm">
            <p className="font-medium text-red-800">{error}</p>
            <button
              type="button"
              onClick={() => void loadProfile()}
              className="mt-6 rounded-xl border border-red-300 bg-white px-5 py-2 text-sm font-medium text-red-800 transition hover:bg-red-100"
            >
              Retry
            </button>
          </div>
        )}

        {!loading && !unauthorized && !error && profile && (
          <div className="space-y-9">
            <div className="rounded-3xl border border-gray-200 bg-white p-8">
              <div className="flex flex-col items-center justify-center text-center">
                <div>
                  <p className="text-m text-gray-500">Hi</p>
                  <h2 className="text-2xl font-semibold text-gray-900">
                    {profile.first_name} {profile.last_name}
                  </h2>
                  <p className="mt-1 text-sm text-gray-600">{profile.email}</p>
                </div>
              </div>
            </div>

            <div className="mt-8 space-y-8">
              <section
                id="overview"
                className="rounded-3xl border border-gray-200 bg-white p-8"
              >
                <h3 className="text-2xl font-semibold text-gray-900">Account Overview</h3>

                <div className="mt-5 grid gap-8 md:grid-cols-2">
                  <div>
                    <p className="mt-2 text-xs uppercase tracking-wide text-gray-500">Full Name</p>
                    <p className="mt-1 text-base font-medium text-gray-900">
                      {profile.first_name} {profile.last_name}
                    </p>
                  </div>

                  <div>
                    <p className="mt-3 text-xs uppercase tracking-wide text-gray-500">Username</p>
                    <p className="mt-1 text-base font-medium text-gray-900">
                      {profile.username || "-"}
                    </p>
                  </div>

                  <div>
                    <p className="mt-3 text-xs uppercase tracking-wide text-gray-500">Role</p>
                    <p className="mt-1 text-base font-medium capitalize text-gray-900">
                      {profile.role || "-"}
                    </p>
                  </div>

                  <div>
                    <p className="mt-3 text-xs uppercase tracking-wide text-gray-500">
                      Account Status
                    </p>
                    <p className="mt-1 text-base font-medium text-gray-900">
                      {profile.is_active ? "Active" : "Unavailable"}
                    </p>
                  </div>
                </div>
              </section>

              <section
                id="contact"
                className="mt-6 rounded-3xl border border-gray-200 bg-white p-8"
              >
                <h3 className="text-2xl font-semibold text-gray-900">Contact Information</h3>

                <div className="mt-5 grid gap-8 md:grid-cols-2">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-gray-500">Email</p>
                    <p className="mt-2 text-base font-medium text-gray-900">
                      {profile.email || "-"}
                    </p>
                  </div>

                  <div>
                    <p className="mt-3 text-xs uppercase tracking-wide text-gray-500">Phone</p>
                    <p className="mt-1 text-base font-medium text-gray-900">
                      {profile.phone || "-"}
                    </p>
                  </div>
                </div>
              </section>

              <section id="addresses"
                className="mt-6 rounded-3xl border border-gray-200 bg-white p-8"
              >
                <div className="flex items-center justify-between gap-4">
                  <h3 className="text-2xl font-semibold text-gray-900">Addresses</h3>
                  <Link
                    href="/profile/addresses/new"
                    className="rounded-xl bg-black px-4 py-2 text-sm font-medium text-white transition hover:bg-gray-800"
                  >
                    Add address
                  </Link>
                </div>

                {addresses.length === 0 ? (
                  <div className="mt-6 rounded-2xl border border-dashed border-gray-300 bg-gray-50 px-6 py-6">
                    <p className="text-sm font-medium text-gray-900">No saved addresses yet.</p>
                    <p className="mt-2 text-sm text-gray-600">
                      Shipping and billing addresses will appear here once added.
                    </p>
                  </div>
                ) : (
                  <div className="mt-6 grid gap-4 md:grid-cols-2">
                    {addresses.map((address) => (
                      <div
                        key={address.address_id}
                        className="rounded-2xl border border-gray-200 bg-gray-50 p-5"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-sm font-semibold capitalize text-gray-900">
                            {address.address_type}
                          </p>
                          {address.is_default && (
                            <span className="rounded-full bg-black px-3 py-1 text-xs font-medium text-white">
                              Default
                            </span>
                          )}
                        </div>
                        <p className="mt-3 text-sm text-gray-700">{address.street}</p>
                        <p className="text-sm text-gray-700">
                          {address.city}, {address.province}
                        </p>
                        <p className="text-sm text-gray-700">
                          {address.postal_code}, {address.country}
                        </p>
                      </div>
                            ))}
                          </div>
                        )}
                      </section>

              <section id="payments"
                  className="mt-6 rounded-3xl border border-gray-200 bg-white p-8"
                >
                  <div className="flex items-center justify-between gap-4">
                    <h3 className="text-2xl font-semibold text-gray-900">Payment Methods</h3>
                    <Link
                      href="/profile/payments/new"
                      className="rounded-xl bg-black px-4 py-2 text-sm font-medium text-white transition hover:bg-gray-800"
                    >
                      Add card
                    </Link>
                  </div>

                  {payments.length === 0 ? (
                    <div className="mt-6 rounded-2xl border border-dashed border-gray-300 bg-gray-50 px-6 py-6">
                      <p className="text-sm font-medium text-gray-900">No saved payment methods yet.</p>
                      <p className="mt-2 text-sm text-gray-600">
                        Saved cards will appear here once added.
                      </p>
                    </div>
                  ) : (
                    <div className="mt-6 grid gap-4 md:grid-cols-2">
                      {payments.map((payment) => (
                        <div
                          key={payment.payment_id}
                          className="rounded-2xl border border-gray-200 bg-gray-50 p-5"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <p className="text-sm font-semibold text-gray-900">
                              {payment.card_brand || "Card"} ending in {payment.card_last4}
                            </p>
                            {payment.is_default && (
                              <span className="rounded-full bg-black px-3 py-1 text-xs font-medium text-white">
                                Default
                              </span>
                            )}
                          </div>
                          <p className="mt-3 text-sm text-gray-700">{payment.cardholder_name}</p>
                          <p className="text-sm text-gray-700">
                            Expires {payment.expiry_month}/{payment.expiry_year}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </section>

              <section id="orders"
                className="mt-6 rounded-3xl border border-gray-200 bg-white p-8"
              >
                <div className="flex items-center justify-between gap-4">
                  <h3 className="text-2xl font-semibold text-gray-900">Recent Orders</h3>
                  <Link href="/orders" className="text-sm font-medium text-black underline">
                    View all
                  </Link>
                </div>

                {orders.length === 0 ? (
                  <div className="mt-6 rounded-2xl border border-dashed border-gray-300 bg-gray-50 px-6 py-6">
                    <p className="text-sm font-medium text-gray-900">No recent orders available.</p>
                    <p className="mt-2 text-sm text-gray-600">
                      Completed purchases from checkout will show up here.
                    </p>
                  </div>
                ) : (
                  <div className="mt-6 space-y-4">
                    {orders.slice(0, 3).map((order) => (
                      <div
                        key={order.order_id}
                        className="rounded-2xl border border-gray-200 bg-gray-50 p-5"
                      >
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                          <div>
                            <p className="text-sm font-semibold text-gray-900">
                              Order #{order.order_id}
                            </p>
                            <p className="text-sm text-gray-600">
                              {new Date(order.order_date).toLocaleString("en-CA")}
                            </p>
                          </div>
                          <div className="text-sm font-medium text-gray-900">
                            ${Number(order.total_amount).toFixed(2)}
                          </div>
                        </div>

                        <div className="mt-3 flex flex-wrap gap-2">
                          <span className="rounded-full bg-gray-200 px-3 py-1 text-xs font-medium capitalize text-gray-800">
                            {order.order_status}
                          </span>
                          <span className="rounded-full bg-gray-200 px-3 py-1 text-xs font-medium capitalize text-gray-800">
                            Payment: {order.payment_status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
