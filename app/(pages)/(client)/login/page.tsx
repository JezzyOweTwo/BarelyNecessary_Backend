"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useMemo, useState } from "react";

type LoginResponse =
  | {
      message: string;
      data: {
        id: string;
        email: string;
        role: string;
        authorization: string; // "Bearer <token>"
      };
    }
  | { message: string };

function extractToken(authorization: string | undefined) {
  if (!authorization) return null;
  const trimmed = authorization.trim();
  if (!trimmed.toLowerCase().startsWith("bearer ")) return null;
  return trimmed.slice("Bearer ".length).trim() || null;
}

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = useMemo(() => searchParams.get("next") ?? "/catalog", [searchParams]);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/(public)/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const json = (await res.json()) as LoginResponse;
      if (!res.ok) {
        const msg = "message" in json ? json.message : "Login failed.";
        throw new Error(msg);
      }

      if (!("data" in json)) throw new Error("Login failed.");
      const token = extractToken(json.data.authorization);
      if (!token) throw new Error("Login succeeded but no token returned.");

      // Store for client usage + allow server-side validators to read cookie if needed.
      localStorage.setItem("auth", token);
      localStorage.setItem(
        "user",
        JSON.stringify({ id: json.data.id, email: json.data.email, role: json.data.role })
      );
      document.cookie = `auth=${encodeURIComponent(token)}; path=/; samesite=lax`;

      router.push(next);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-gray-50 text-gray-900">
      <section className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-2xl px-6 py-14 lg:px-8">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gray-500">
            Account
          </p>
          <h1 className="mt-2 text-4xl font-bold tracking-tight">Login</h1>
          <p className="mt-4 text-gray-600">
            Sign in to view protected pages and manage your account.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-2xl px-6 py-10 lg:px-8">
        <form
          onSubmit={onSubmit}
          className="rounded-3xl border border-gray-200 bg-white p-8 shadow-sm"
        >
          {error && (
            <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="grid gap-8">
            <div>
              <label className="mb-3 block text-sm font-medium text-gray-700" htmlFor="email">
                Email
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-black"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label
                className="mb-3 block text-sm font-medium text-gray-700"
                htmlFor="password"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-black"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="rounded-xl bg-black px-6 py-3 text-sm font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? "Signing in..." : "Sign in"}
            </button>

            <p className="text-sm text-gray-600">
              Don’t have an account?{" "}
              <Link href="/register" className="font-medium text-black underline">
                Create one
              </Link>
              .
            </p>
          </div>
        </form>
      </section>
    </main>
  );
}