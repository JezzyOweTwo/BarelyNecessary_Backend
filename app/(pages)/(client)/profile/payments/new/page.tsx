"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

export default function NewPaymentPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    cardholder_name: "",
    card_number: "",
    card_brand: "",
    expiry_month: "",
    expiry_year: "",
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

      const res = await fetch("/api/profile/payments", {
        method: "POST",
        credentials: "include",
        headers,
        body: JSON.stringify({
          ...form,
          expiry_month: Number(form.expiry_month),
          expiry_year: Number(form.expiry_year),
        }),
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.message ?? "Could not save payment method.");
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
          <h1 className="mt-2 text-4xl font-bold tracking-tight">Add Card</h1>
          <p className="mt-4 text-gray-600">Save a payment method to your account.</p>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-6 py-10 lg:px-8">
        <form
          onSubmit={handleSubmit}
          className="rounded-3xl border border-gray-200 bg-white p-8 shadow-sm"
        >
          <div className="grid gap-6 md:grid-cols-2">
            <div className="md:col-span-2">
              <label htmlFor="cardholder_name" className="text-sm font-medium text-gray-700">
                Cardholder Name
              </label>
              <input
                id="cardholder_name"
                type="text"
                value={form.cardholder_name}
                onChange={(e) => setForm({ ...form, cardholder_name: e.target.value })}
                className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-black"
                required
              />
            </div>

            <div className="md:col-span-2">
              <label htmlFor="card_number" className="text-sm font-medium text-gray-700">
                Card Number
              </label>
              <input
                id="card_number"
                type="text"
                value={form.card_number}
                onChange={(e) => setForm({ ...form, card_number: e.target.value })}
                className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-black"
                required
              />
            </div>

            <div>
              <label htmlFor="card_brand" className="text-sm font-medium text-gray-700">
                Card Brand
              </label>
              <input
                id="card_brand"
                type="text"
                value={form.card_brand}
                onChange={(e) => setForm({ ...form, card_brand: e.target.value })}
                placeholder="Visa, Mastercard..."
                className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-black"
              />
            </div>

            <div>
              <label htmlFor="expiry_month" className="text-sm font-medium text-gray-700">
                Expiry Month
              </label>
              <input
                id="expiry_month"
                type="number"
                min={1}
                max={12}
                value={form.expiry_month}
                onChange={(e) => setForm({ ...form, expiry_month: e.target.value })}
                className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-black"
                required
              />
            </div>

            <div>
              <label htmlFor="expiry_year" className="text-sm font-medium text-gray-700">
                Expiry Year
              </label>
              <input
                id="expiry_year"
                type="number"
                min={2026}
                value={form.expiry_year}
                onChange={(e) => setForm({ ...form, expiry_year: e.target.value })}
                className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-black"
                required
              />
            </div>
          </div>

          <div className="mt-6">
            <label htmlFor="payment_is_default" className="flex items-center gap-3 text-sm text-gray-700">
              <input
                id="payment_is_default"
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
              {saving ? "Saving..." : "Save card"}
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