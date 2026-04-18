"use client";

import { useEffect, useRef, useState } from "react";

export type CartItemAddedDetail = {
  name: string;
  quantity: number;
};

export default function CartAddNotification() {
  const [payload, setPayload] = useState<CartItemAddedDetail | null>(null);
  const [visible, setVisible] = useState(false);
  const showTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const removeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const clearTimers = () => {
      if (showTimer.current) clearTimeout(showTimer.current);
      if (hideTimer.current) clearTimeout(hideTimer.current);
      if (removeTimer.current) clearTimeout(removeTimer.current);
    };

    const onAdded = (e: Event) => {
      const ce = e as CustomEvent<CartItemAddedDetail>;
      const detail = ce.detail;
      const qty = Number(detail?.quantity);
      if (!Number.isFinite(qty) || qty < 1) return;

      const name =
        typeof detail?.name === "string" && detail.name.trim()
          ? detail.name.trim()
          : "Item";

      clearTimers();
      setVisible(false);
      setPayload({ name, quantity: Math.floor(qty) });

      showTimer.current = window.setTimeout(() => setVisible(true), 0);

      hideTimer.current = setTimeout(() => setVisible(false), 3600);
      removeTimer.current = setTimeout(() => {
        setPayload(null);
      }, 4000);
    };

    document.addEventListener("cart:itemAdded", onAdded);
    return () => {
      document.removeEventListener("cart:itemAdded", onAdded);
      clearTimers();
    };
  }, []);

  if (!payload) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="rounded-2xl border border-gray-200 bg-white px-5 py-4 text-sm shadow-sm"
      style={{
        position: "fixed",
        right: "1.5rem",
        bottom: "1.5rem",
        zIndex: 10000,
        maxWidth: "min(22rem, calc(100vw - 2rem))",
        pointerEvents: "none",
        boxShadow:
          "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(0.5rem)",
        transition: "opacity 220ms ease-out, transform 220ms ease-out",
      }}
    >
      <p className="font-semibold text-gray-900">Added to cart</p>
      <p className="mt-1 text-gray-600">
        <span className="font-medium text-gray-900">{payload.name}</span>
        {" · "}
        {payload.quantity === 1
          ? "Qty 1 in your cart"
          : `Qty ${payload.quantity} in your cart`}
      </p>
    </div>
  );
}
