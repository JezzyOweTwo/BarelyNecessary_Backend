"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useMemo, useState } from "react";
import { AUTH_API } from "@/lib/auth_api";

type SignupResponse = { message: string } | { data: unknown; message?: string };
type ValidateResponse =
  | { data: { message: string; authorization: string } }
  | { data: string }
  | { message: string };

function extractToken(authorization: string | undefined) {
  if (!authorization) return null;
  const trimmed = authorization.trim();
  if (!trimmed.toLowerCase().startsWith("bearer ")) return null;
  return trimmed.slice("Bearer ".length).trim() || null;
}

function getErrorMessage(payload: unknown, fallback: string) {
  if (typeof payload === "object" && payload !== null) {
    const maybe = payload as Record<string, unknown>;
    const msg = maybe.message ?? maybe.data;
    if (typeof msg === "string" && msg.trim().length > 0) return msg;
  }
  return fallback;
}

type Step = "signup" | "verify";

type FieldErrors = Partial<
  Record<
    | "firstName"
    | "lastName"
    | "email"
    | "username"
    | "password"
    | "confirmPassword",
    string
  >
>;

function isValidEmail(email: string) {
  // Simple, practical validation (covers most cases without being overly strict).
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = useMemo(() => searchParams.get("next") ?? "/catalog", [searchParams]);

  const loginHref = useMemo(() => {
    const n = searchParams.get("next");
    if (!n || n === "/catalog") return "/login";
    return `/login?next=${encodeURIComponent(n)}`;
  }, [searchParams]);

  const [step, setStep] = useState<Step>("signup");

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [code, setCode] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [attemptedSubmit, setAttemptedSubmit] = useState(false);

  const fieldErrors = useMemo((): FieldErrors => {
    const errors: FieldErrors = {};
    if (!firstName.trim()) errors.firstName = "First name is required.";
    if (!lastName.trim()) errors.lastName = "Last name is required.";
    if (!email.trim()) errors.email = "Email is required.";
    else if (!isValidEmail(email)) errors.email = "Please enter a valid email address.";
    if (!username.trim()) errors.username = "Username is required.";
    if (!password.trim()) errors.password = "Password is required.";
    if (!confirmPassword.trim()) errors.confirmPassword = "Please confirm your password.";
    if (password.trim() && confirmPassword.trim() && password !== confirmPassword) {
      errors.confirmPassword = "Passwords don’t match.";
    }
    return errors;
  }, [firstName, lastName, email, username, password, confirmPassword]);

  const canSubmitSignup = useMemo(() => {
    return Object.keys(fieldErrors).length === 0;
  }, [fieldErrors]);

  const passwordsMatch = useMemo(() => {
    if (!password && !confirmPassword) return true;
    return password === confirmPassword;
  }, [password, confirmPassword]);

  async function onSubmitSignup(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setAttemptedSubmit(true);
    if (!canSubmitSignup) return;

    setSubmitting(true);
    try {
      const res = await fetch(AUTH_API.signup, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          first_name: firstName,
          last_name: lastName,
          email,
          username,
          password,
          phone_number: phoneNumber.trim().length > 0 ? phoneNumber : undefined,
        }),
      });
      const json = (await res.json()) as unknown as SignupResponse;
      if (!res.ok) {
        throw new Error(getErrorMessage(json, "Signup failed. Please check your details."));
      }

      setStep("verify");
      setInfo("We emailed you a verification code. Enter it below to activate your account.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Signup failed.");
    } finally {
      setSubmitting(false);
    }
  }

  async function onSubmitVerify(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setSubmitting(true);
    try {
      const res = await fetch(AUTH_API.signupValidate, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code }),
      });

      const json = (await res.json()) as unknown as ValidateResponse;
      if (!res.ok) {
        throw new Error(getErrorMessage(json, "Verification failed."));
      }

      let auth: string | undefined;
      if (typeof json === "object" && json !== null && "data" in json) {
        const data = (json as { data: unknown }).data;
        if (typeof data === "object" && data !== null) {
          const maybeAuth = (data as Record<string, unknown>).authorization;
          if (typeof maybeAuth === "string") auth = maybeAuth;
        }
      }
      const token = extractToken(auth);
      if (!token) throw new Error("Verified, but no token returned.");

      localStorage.setItem("auth", token);
      localStorage.setItem("user", JSON.stringify({ email }));
      document.cookie = `auth=${encodeURIComponent(token)}; path=/; samesite=lax`;

      router.push(nextPath);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Verification failed.");
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
          <h1 className="mt-2 text-4xl font-bold tracking-tight">Register</h1>
          <p className="mt-4 text-gray-600">
            Create an account. You’ll receive a verification code by email.
          </p>
        </div>
      </section>

      <section className="mx-auto mt-10 max-w-2xl px-6 pb-16 pt-4 lg:px-8">
        <div className="rounded-3xl border border-gray-200 bg-white p-10 shadow-sm">
          {error && (
            <div className="mb-8 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}
          {info && (
            <div className="mb-8 rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-700">
              {info}
            </div>
          )}

          {step === "signup" ? (
           <form onSubmit={onSubmitSignup} className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8 lg:p-10">
              <div className="grid gap-x-6 gap-y-6 lg:grid-cols-2">
                <div>
                  <label
                    className="mb-3 mt-5 block text-sm font-medium text-gray-700"
                    htmlFor="firstName"
                  >
                    First Name <span className="text-red-700">*</span>
                  </label>
                  <input
                    id="firstName"
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className=" w-auto rounded-2xl border border-gray-300 px-4 py-3.5  outline-none transition focus:border-black"
                  />
                  {attemptedSubmit && fieldErrors.firstName && (
                    <p className="mt-2 text-sm text-red-700">{fieldErrors.firstName}</p>
                  )}
                </div>

                <div>
                  <label
                    className="mb-3 mt-5 block text-sm font-medium text-gray-700"
                    htmlFor="lastName"
                  >
                    Last Name <span className="text-red-700">*</span>
                  </label>
                  <input
                    id="lastName"
                    required
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-auto rounded-2xl border border-gray-300 px-4 py-3.5  outline-none transition focus:border-black"
                  />
                  {attemptedSubmit && fieldErrors.lastName && (
                    <p className="mt-2 text-sm text-red-700">{fieldErrors.lastName}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="mb-3 mt-6 block text-sm font-medium text-gray-700" htmlFor="email">
                  Email <span className="text-red-700">*</span>
                </label>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-2xl border border-gray-300 px-4 py-3.5 outline-none transition focus:border-black"
                  placeholder="you@example.com"
                />
                {attemptedSubmit && fieldErrors.email && (
                  <p className="mt-2 text-sm text-red-700">{fieldErrors.email}</p>
                )}
              </div>

              <div className="grid gap-x-6 gap-y-6 lg:grid-cols-2">
                <div>
                  <label
                    className="mb-3 mt-6 block text-sm font-medium text-gray-700"
                    htmlFor="username"
                  >
                    Username <span className="text-red-700">*</span>
                  </label>
                  <input
                    id="username"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-auto rounded-2xl border border-gray-300 px-4 py-3.5 outline-none transition focus:border-black"
                  />
                  {attemptedSubmit && fieldErrors.username && (
                    <p className="mt-2 text-sm text-red-700">{fieldErrors.username}</p>
                  )}
                </div>

                <div>
                  <label
                    className="mb-3 mt-6 block text-sm font-medium text-gray-700 "
                    htmlFor="phone"
                  >
                    Phone Number
                  </label>
                  <input
                    id="phone"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="w-auto rounded-2xl border border-gray-300 px-4 py-3.5 outline-none transition focus:border-black"
                    placeholder="(555) 555-5555"
                  />
                </div>
              </div>

              <div>
                <label
                  className="mb-3 mt-6 block text-sm font-medium text-gray-700"
                  htmlFor="password"
                >
                  Password <span className="text-red-700">*</span>
                </label>
                <input
                  id="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-2xl border border-gray-300 px-4 py-3.5 outline-none transition focus:border-black"
                  placeholder="••••••••"
                />
                {attemptedSubmit && fieldErrors.password && (
                  <p className="mt-2 text-sm text-red-700">{fieldErrors.password}</p>
                )}
              </div>

              <div>
                <label
                  className="mb-3 mt-6 block text-sm font-medium text-gray-700"
                  htmlFor="confirmPassword"
                >
                  Confirm Password <span className="mb-3 mt-6 text-red-700">*</span>
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full rounded-2xl border border-gray-300 px-4 py-3.5 outline-none transition focus:border-black"
                  placeholder="••••••••"
                />
                {attemptedSubmit && fieldErrors.confirmPassword ? (
                  <p className="mb-3 mt-6 mt-2 text-sm text-red-700">{fieldErrors.confirmPassword}</p>
                ) : (
                  !passwordsMatch && (
                    <p className="mb-3 mt-6 text-sm text-red-700">Passwords don’t match.</p>
                  )
                )}
              </div>

              <button
                type="submit"
                disabled={submitting || !canSubmitSignup}
                className="mb-3 mt-6 rounded-xl bg-black px-6 py-3 text-sm font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? "Creating account..." : "Create account"}
              </button>

              <p className="text-xs text-gray-600">
                <span className="text-red-700">*</span> means required (mandatory) field.
              </p>

              <p className="mb-3 mt-6 text-sm text-gray-600">
                Already have an account?{" "}
                <Link href={loginHref} className="font-medium text-black underline">
                  Sign in
                </Link>
                .
              </p>
            </form>
          ) : (
            <form onSubmit={onSubmitVerify} className="grid gap-12">
              <div>
                <p className="text-sm text-gray-600">
                  Verifying for <span className="font-medium text-gray-900">{email}</span>
                </p>
              </div>

              <div>
                <label className="mb-3 block text-sm font-medium text-gray-700" htmlFor="code">
                  Verification code
                </label>
                <input
                  id="code"
                  required
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-black"
                  placeholder="Enter the 5-digit code"
                />
              </div>

              <div className="flex flex-col gap-4 md:flex-row md:gap-5">
                <button
                  type="submit"
                  disabled={submitting || code.trim().length === 0}
                  className="rounded-xl bg-black px-6 py-3 text-sm font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {submitting ? "Verifying..." : "Verify & continue"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setStep("signup");
                    setCode("");
                    setError(null);
                    setInfo(null);
                  }}
                  className="rounded-xl border border-gray-300 px-6 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                >
                  Back
                </button>
              </div>
            </form>
          )}
        </div>
      </section>
    </main>
  );
}

export default function RegisterPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-gray-50 p-10 text-center text-gray-600">Loading…</main>
      }
    >
      <RegisterForm />
    </Suspense>
  );
}