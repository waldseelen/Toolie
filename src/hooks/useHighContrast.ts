"use client";

import { useState, useEffect, useCallback } from "react";

const STORAGE_KEY = "toolie-high-contrast";

export function useHighContrast() {
  const [highContrast, setHighContrast] = useState<"on" | "off">("off");

  // Read stored preference on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as "on" | "off" | null;
    if (stored === "on" || stored === "off") {
      setHighContrast(stored);
      document.documentElement.setAttribute("data-high-contrast", stored);
    } else {
      document.documentElement.setAttribute("data-high-contrast", "off");
    }
  }, []);

  const toggleHighContrast = useCallback(() => {
    setHighContrast((previous) => {
      const next = previous === "on" ? "off" : "on";
      localStorage.setItem(STORAGE_KEY, next);
      document.documentElement.setAttribute("data-high-contrast", next);
      return next;
    });
  }, []);

  return { highContrast, toggleHighContrast };
}
