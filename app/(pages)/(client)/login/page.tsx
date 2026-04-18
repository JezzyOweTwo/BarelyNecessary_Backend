"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useMemo, useState } from "react";
import { AUTH_API } from "@/lib/auth_api";

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

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = useMemo(() => searchParams.get("next") ?? "/catalog", [searchParams]);

  const [emailOrUsername, setEmailOrUsername] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const registerHref = useMemo(() => {
    const n = searchParams.get("next");
    if (!n || n === "/catalog") return "/register";
    return `/register?next=${encodeURIComponent(n)}`;
  }, [searchParams]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch(AUTH_API.login, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: emailOrUsername.trim(), password }),
      });

      const json = (await res.json()) as LoginResponse;
      if (!res.ok) {
        const msg = "message" in json ? json.message : "Login failed.";
        throw new Error(msg);
      }

      if (!("data" in json)) throw new Error("Login failed.");
      const token = extractToken(json.data.authorization);
      if (!token) throw new Error("Login succeeded but no token returned.");

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
        <div className="mx-auto max-w-2xl px-6 py-16 lg:px-8">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gray-500">
            Account
          </p>
          <h1 className="mt-2 text-4xl font-bold tracking-tight">Login</h1>
          <p className="mt-4 text-gray-600">
            Sign in to view and manage your account and purchases.
          </p>
        </div>
      </section>

      <section className="mx-auto mt-10 max-w-2xl px-6 pb-16 pt-4 lg:px-8">
        <form
          onSubmit={onSubmit}
          className="rounded-3xl border border-gray-200 bg-white p-10 shadow-sm"
        >
          {error && (
            <div className="mb-8 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className=" p-6 gap-x-8 gap-y-6 lg:grid-cols-1">
            <div>
              <label className="mb-3 mt-5 block text-sm font-medium text-gray-700" htmlFor="email">
                Email or username
              </label>
              <input
                id="email"
                type="text"
                autoComplete="username"
                required
                value={emailOrUsername}
                onChange={(e) => setEmailOrUsername(e.target.value)}
                className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-black"
                placeholder="you@example.com or your_username"
              />
            </div>

            <div>
              <label
                className="mb-3 mt-6 block text-sm font-medium text-gray-700"
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
              className="mb-3 mt-6 rounded-xl bg-black px-6 py-3 text-sm font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? "Signing in..." : "Sign in"}
            </button>

            <p className="mb-3 mt-6 text-sm text-gray-600">
              Don’t have an account?{" "}
              <Link href={registerHref} className="font-medium text-black underline">
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

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-gray-50 p-10 text-center text-gray-600">Loading…</main>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
