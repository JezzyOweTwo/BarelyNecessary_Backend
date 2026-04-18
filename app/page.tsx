"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

function readUserRole(): string | null {
  try {
    const raw = localStorage.getItem("user");
    if (!raw) return null;
    const parsed = JSON.parse(raw) as unknown;
    if (typeof parsed !== "object" || parsed === null) return null;
    const role = (parsed as Record<string, unknown>).role;
    return typeof role === "string" ? role : null;
  } catch {
    return null;
  }
}

export default function Home() {
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const sync = () => setIsAdmin(readUserRole() === "admin");
    sync();
    window.addEventListener("storage", sync);
    return () => window.removeEventListener("storage", sync);
  }, []);

  return (
    <main className="justify-center min-h-screen bg-gray-50 text-gray-900">
      <section className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-14 lg:px-8">
          <h1 className="mt-2 text-4xl font-bold tracking-tight">Home</h1>
          <p className="mt-4 max-w-2xl text-gray-600">
            You will need it... one day :D
          </p>
        </div>
      </section>

      <section className="justify-center mx-auto max-w-7xl px-6 py-10 lg:px-8">
        <div className="justify-center grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          <Link
            href="/catalog"
            className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
          >
            <h2 className="text-xl font-semibold">Browse Catalog</h2>
            <p className="mt-2 text-sm text-gray-600">View all products.</p>
          </Link>

          <Link
            href="/cart"
            className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
          >
            <h2 className="text-xl font-semibold">View Cart</h2>
            <p className="mt-2 text-sm text-gray-600">
              Review items and checkout.
            </p>
          </Link>

          <Link
            href="/orders"
            className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
          >
            <h2 className="text-xl font-semibold">Orders</h2>
            <p className="mt-2 text-sm text-gray-600">
              Check order information.
            </p>
          </Link>

          <Link
            href="/login"
            className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
          >
            <h2 className="text-xl font-semibold">Login</h2>
            <p className="mt-2 text-sm text-gray-600">
              Sign in to your account.
            </p>
          </Link>

          <Link
            href="/register"
            className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
          >
            <h2 className="text-xl font-semibold">Register</h2>
            <p className="mt-2 text-sm text-gray-600">
              Create an account and verify by email.
            </p>
          </Link>

          <Link 
          href="/admin" 
          className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
          >
            <h2 className="text-xl font-semibold">Admin Dashboard</h2>
            <p className="mt-2 text-sm text-gray-600">Manage products and users.</p> 
          </Link>

          {isAdmin && (
            <Link
              href="/admin"
              className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
            >
              <h2 className="text-xl font-semibold">Admin Dashboard</h2>
              <p className="mt-2 text-sm text-gray-600">
                Manage products and users.
              </p>
            </Link>
          )}
        </div>
      </section>
    </main>
  );
}