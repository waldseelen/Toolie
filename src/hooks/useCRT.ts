"use client";

import { useState, useEffect, useCallback } from "react";

const STORAGE_KEY = "toolie-crt";

export function useCRT() {
  const [crt, setCrt] = useState<"on" | "off">("off");

  // Read stored preference on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as "on" | "off" | null;
    if (stored === "on" || stored === "off") {
      setCrt(stored);
      document.documentElement.setAttribute("data-crt", stored);
    } else {
      document.documentElement.setAttribute("data-crt", "off");
    }
  }, []);

  const toggleCRT = useCallback(() => {
    setCrt((previous) => {
      const next = previous === "on" ? "off" : "on";
      localStorage.setItem(STORAGE_KEY, next);
      document.documentElement.setAttribute("data-crt", next);
      return next;
    });
  }, []);

  return { crt, toggleCRT };
}
