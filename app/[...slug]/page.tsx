"use client";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4 text-center">
      <h1 className="text-6xl font-bold text-gray-900">404</h1>

      <h2 className="mt-4 text-2xl font-semibold text-gray-700">
        Page Not Found
      </h2>

      <p className="mt-2 max-w-md text-gray-500">
        The page you’re looking for doesn’t exist or may have been moved.
      </p>

      <div className="mt-6 flex gap-4">
        <Link
          href="/"
          className="rounded-xl bg-black px-5 py-2 text-white transition hover:bg-gray-800"
        >
          Go Home
        </Link>

        <button
          onClick={() => history.back()}
          className="rounded-xl border border-gray-300 px-5 py-2 text-gray-700 transition hover:bg-gray-100"
        >
          Go Back
        </button>
      </div>
    </div>
  );
}