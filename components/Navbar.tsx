"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { getCart } from "@/lib/cart";
import ThemeToggle from "@/components/ThemeToggle";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/catalog", label: "Catalog" },
  { href: "/orders", label: "Orders" },
  { href: "/profile", label: "Profile" },
  { href: "/admin", label: "Admin" },
];

function getAuthToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("auth");
}

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [cartCount, setCartCount] = useState(0);
  const [isAuthed, setIsAuthed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const updateCartCount = () => {
      const cart = getCart();
      const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
      setCartCount(totalItems);
    };

    updateCartCount();
    window.addEventListener("storage", updateCartCount);
    window.addEventListener("cart:updated", updateCartCount);

    return () => {
      window.removeEventListener("storage", updateCartCount);
      window.removeEventListener("cart:updated", updateCartCount);
    };
  }, []);

  useEffect(() => {
    const syncAuth = () => setIsAuthed(Boolean(getAuthToken()));
    syncAuth();
    window.addEventListener("storage", syncAuth);
    return () => window.removeEventListener("storage", syncAuth);
  }, [pathname]);

  const logout = () => {
    localStorage.removeItem("auth");
    localStorage.removeItem("user");
    document.cookie = "auth=; Max-Age=0; path=/; samesite=lax";
    setIsAuthed(false);
    router.push("/");
    router.refresh();
  };

  return (
    <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-8">
        <Link
          href="/"
          className="text-xl font-semibold uppercase tracking-[0.2em] text-gray-800"
        >
          Barely Necessary
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-gray-600 transition hover:text-black"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <ThemeToggle />

          <Link
            href="/cart"
            className="flex items-center gap-3 rounded-xl border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100"
          >
            <span>Cart</span>
            {cartCount > 0 ? (
              <span className="rounded-full bg-black px-2 py-1 text-center text-xs font-medium text-white">
                {cartCount}
              </span>
            ) : null}
          </Link>

          {isAuthed ? (
            <button
              type="button"
              onClick={logout}
              className="rounded-xl border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100"
            >
              Logout
            </button>
          ) : (
            <>
              <Link
                href="/login"
                className="rounded-xl border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100"
              >
                Login
              </Link>

              <Link
                href="/register"
                className="rounded-xl bg-black px-4 py-2 text-sm font-medium text-white transition hover:bg-gray-800"
              >
                Register
              </Link>
            </>
          )}

          <button
            type="button"
            className="rounded-xl border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100 md:hidden"
            onClick={() => setMobileOpen((v) => !v)}
            aria-expanded={mobileOpen}
            aria-controls="mobile-nav"
          >
            Menu
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div id="mobile-nav" className="border-t border-gray-200 bg-white/90 backdrop-blur md:hidden">
          <div className="mx-auto max-w-7xl px-6 py-4 lg:px-8">
            <nav className="grid gap-2">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="rounded-xl px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100"
                >
                  {link.label}
                </Link>
              ))}
              {!isAuthed ? (
                <div className="mt-2 grid gap-2">
                  <Link
                    href="/login"
                    onClick={() => setMobileOpen(false)}
                    className="rounded-xl border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100"
                  >
                    Login
                  </Link>
                  <Link
                    href="/register"
                    onClick={() => setMobileOpen(false)}
                    className="rounded-xl bg-black px-3 py-2 text-sm font-medium text-white transition hover:bg-gray-800"
                  >
                    Register
                  </Link>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={logout}
                  className="mt-2 rounded-xl border border-gray-300 px-3 py-2 text-left text-sm font-medium text-gray-700 transition hover:bg-gray-100"
                >
                  Logout
                </button>
              )}
            </nav>
          </div>
        </div>
      )}
    </header>
  );
}