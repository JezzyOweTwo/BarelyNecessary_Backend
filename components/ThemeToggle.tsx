"use client";

import { useEffect, useMemo, useState } from "react";

type ThemeMode = "light" | "dark" | "system";

function getSystemPrefersDark() {
  if (typeof window === "undefined") return false;
  return window.matchMedia?.("(prefers-color-scheme: dark)")?.matches ?? false;
}

function applyThemeClass(mode: ThemeMode) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  const isDark = mode === "dark" || (mode === "system" && getSystemPrefersDark());
  root.classList.toggle("dark", isDark);
}

function readStoredTheme(): ThemeMode {
  const saved = localStorage.getItem("theme");
  return saved === "light" || saved === "dark" || saved === "system" ? saved : "system";
}

export default function ThemeToggle() {
  // Must match SSR + first client paint so hydration succeeds; restore real preference after mount.
  const [mode, setMode] = useState<ThemeMode>("system");
  const [restored, setRestored] = useState(false);

  useEffect(() => {
    const initial = readStoredTheme();
    setMode(initial);
    applyThemeClass(initial);
    setRestored(true);
  }, []);

  useEffect(() => {
    if (!restored) return;
    localStorage.setItem("theme", mode);
    applyThemeClass(mode);
  }, [mode, restored]);

  useEffect(() => {
    const mq = window.matchMedia?.("(prefers-color-scheme: dark)");
    const onChange = () => {
      if (mode === "system") applyThemeClass("system");
    };
    mq?.addEventListener?.("change", onChange);
    return () => mq?.removeEventListener?.("change", onChange);
  }, [mode]);

  const label = useMemo(() => {
    if (mode === "system") return "Theme: System";
    if (mode === "dark") return "Theme: Dark";
    return "Theme: Light";
  }, [mode]);

  return (
    <div className="flex items-center gap-2">
      {/* <label className="sr-only text-sm text-gray-600" htmlFor="theme">
        Theme:
      </label> */}
      <select
        id="theme"
        value={mode}
        onChange={(e) => setMode(e.target.value as ThemeMode)}
        className="rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
        aria-label={label}
        title={label}
      >
        <option value="system">System</option>
        <option value="light">Light</option>
        <option value="dark">Dark</option>
      </select>
    </div>
  );
}

