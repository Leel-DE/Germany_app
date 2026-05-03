"use client";
import { createContext, useContext, useEffect, useSyncExternalStore } from "react";

type Theme = "light" | "dark" | "system";

interface ThemeContextValue {
  theme: Theme;
  setTheme: (t: Theme) => void;
  resolvedTheme: "light" | "dark";
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: "system",
  setTheme: () => {},
  resolvedTheme: "light",
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const theme = useSyncExternalStore(subscribeTheme, getThemeSnapshot, getThemeServerSnapshot);
  const systemTheme = useSyncExternalStore(
    subscribeSystemTheme,
    getSystemThemeSnapshot,
    getSystemThemeServerSnapshot
  );

  const resolved = theme === "system" ? systemTheme : theme;

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("dark", resolved === "dark");
    localStorage.setItem("dm-theme", theme);
  }, [theme, resolved]);

  const setTheme = (t: Theme) => {
    localStorage.setItem("dm-theme", t);
    window.dispatchEvent(new Event("dm-theme-change"));
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, resolvedTheme: resolved }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);

function normalizeTheme(value: string | null): Theme {
  return value === "light" || value === "dark" || value === "system" ? value : "system";
}

function subscribeTheme(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener("dm-theme-change", callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener("dm-theme-change", callback);
  };
}

function getThemeSnapshot(): Theme {
  return normalizeTheme(localStorage.getItem("dm-theme"));
}

function getThemeServerSnapshot(): Theme {
  return "system";
}

function subscribeSystemTheme(callback: () => void) {
  const media = window.matchMedia("(prefers-color-scheme: dark)");
  media.addEventListener("change", callback);
  return () => media.removeEventListener("change", callback);
}

function getSystemThemeSnapshot(): "light" | "dark" {
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function getSystemThemeServerSnapshot(): "light" | "dark" {
  return "light";
}
