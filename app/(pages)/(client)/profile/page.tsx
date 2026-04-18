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

export default function ProfilePage() {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [unauthorized, setUnauthorized] = useState(false);
  

  const loadProfile = useCallback(async () => {
    setLoading(true);
    setError(null);
    setUnauthorized(false);
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("auth") : null;
      const res = await fetch("/api/profile", {
        credentials: "include",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      if (res.status === 401 || res.status === 403) {
        setUnauthorized(true);
        setProfile(null);
        return;
      }

      const json = (await res.json()) as { data?: ProfileData; message?: string };
      if (!res.ok) {
        const fallback =
          typeof (json as { data?: unknown }).data === "string" ? (json as { data?: string }).data : null;
        throw new Error(json.message ?? fallback ?? "Could not load profile.");
      }
      if (!json.data) {
        throw new Error("Profile data was missing.");
      }
      setProfile(json.data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
      setProfile(null);
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

              <section
                id="addresses"
                className="mt-6 rounded-3xl border border-gray-200 bg-white p-8"
              >
                <h3 className="text-2xl font-semibold text-gray-900">Addresses</h3>

                <div className="mt-6 rounded-2xl border border-dashed border-gray-300 bg-gray-50 px-6 py-6">
                  <p className="text-sm font-medium text-gray-900">No saved addresses yet.</p>
                  <p className="mt-2 text-sm text-gray-600">
                    Shipping and billing addresses will appear here once connected.
                  </p>
                </div>
              </section>

              <section
                id="payments"
                className="mt-6 rounded-3xl border border-gray-200 bg-white p-8"
              >
                <h3 className="text-2xl font-semibold text-gray-900">Payment Methods</h3>

                <div className="mt-6 rounded-2xl border border-dashed border-gray-300 bg-gray-50 px-6 py-6">
                  <p className="text-sm font-medium text-gray-900">No saved payment methods yet.</p>
                  <p className="mt-2 text-sm text-gray-600">
                    Saved cards or other payment options will appear here once connected.
                  </p>
                </div>
              </section>

              <section
                id="orders"
                className="mt-6 rounded-3xl border border-gray-200 bg-white p-8"
              >
                <h3 className="text-2xl font-semibold text-gray-900">Recent Orders</h3>

                <div className="mt-6 rounded-2xl border border-dashed border-gray-300 bg-gray-50 px-6 py-6">
                  <p className="text-sm font-medium text-gray-900">No recent orders available.</p>
                  <p className="mt-2 text-sm text-gray-600">
                    See <Link href="/orders" className="font-medium text-black underline">Your orders</Link> for
                    order history.
                  </p>
                </div>
              </section>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
