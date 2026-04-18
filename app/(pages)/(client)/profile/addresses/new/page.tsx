"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

export default function NewAddressPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    address_type: "shipping",
    street: "",
    city: "",
    province: "",
    postal_code: "",
    country: "Canada",
    is_default: false,
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("auth") : null;
      const headers: HeadersInit = {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      };

      const res = await fetch("/api/profile/addresses", {
        method: "POST",
        credentials: "include",
        headers,
        body: JSON.stringify(form),
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.message ?? "Could not save address.");
      }

      router.push("/profile");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="min-h-screen bg-gray-50 text-gray-900">
      <section className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-3xl px-6 py-14 lg:px-8">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gray-500">
            Account
          </p>
          <h1 className="mt-2 text-4xl font-bold tracking-tight">Add Address</h1>
          <p className="mt-4 text-gray-600">Save a shipping or billing address to your account.</p>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-6 py-10 lg:px-8">
        <form
          onSubmit={handleSubmit}
          className="rounded-3xl border border-gray-200 bg-white p-8 shadow-sm"
        >
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <label htmlFor="address_type" className="text-sm font-medium text-gray-700">
                Address Type
              </label>
              <select
                id="address_type"
                value={form.address_type}
                onChange={(e) => setForm({ ...form, address_type: e.target.value as "shipping" | "billing" })}
                className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-black"
              >
                <option value="shipping">Shipping</option>
                <option value="billing">Billing</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label htmlFor="street" className="text-sm font-medium text-gray-700">
                Street
              </label>
              <input
                id="street"
                type="text"
                value={form.street}
                onChange={(e) => setForm({ ...form, street: e.target.value })}
                className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-black"
                required
              />
            </div>

            <div>
              <label htmlFor="city" className="text-sm font-medium text-gray-700">
                City
              </label>
              <input
                id="city"
                type="text"
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
                className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-black"
                required
              />
            </div>

            <div>
              <label htmlFor="province" className="text-sm font-medium text-gray-700">
                Province
              </label>
              <input
                id="province"
                type="text"
                value={form.province}
                onChange={(e) => setForm({ ...form, province: e.target.value })}
                className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-black"
                required
              />
            </div>

            <div>
              <label htmlFor="postal_code" className="text-sm font-medium text-gray-700">
                Postal Code
              </label>
              <input
                id="postal_code"
                type="text"
                value={form.postal_code}
                onChange={(e) => setForm({ ...form, postal_code: e.target.value })}
                className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-black"
                required
              />
            </div>

            <div>
              <label htmlFor="country" className="text-sm font-medium text-gray-700">
                Country
              </label>
              <input
                id="country"
                type="text"
                value={form.country}
                onChange={(e) => setForm({ ...form, country: e.target.value })}
                className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-black"
                required
              />
            </div>
          </div>

          <div className="mt-6">
            <label htmlFor="is_default" className="flex items-center gap-3 text-sm text-gray-700">
              <input
                id="is_default"
                type="checkbox"
                checked={form.is_default}
                onChange={(e) => setForm({ ...form, is_default: e.target.checked })}
              />
              Set as default
            </label>
          </div>

          {error && (
            <div className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="mt-8 flex gap-3">
            <button
              type="submit"
              disabled={saving}
              className="rounded-xl bg-black px-6 py-3 text-sm font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:bg-gray-400"
            >
              {saving ? "Saving..." : "Save address"}
            </button>

            <Link
              href="/profile"
              className="rounded-xl border border-gray-300 bg-white px-6 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
            >
              Cancel
            </Link>
          </div>
        </form>
      </section>
    </main>
  );
}