"use client";

import { useEffect } from "react";
import { useLanguage } from "@/hooks/useLanguage";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const { t } = useLanguage();

  useEffect(() => {
    console.error("Toolie Error:", error);
  }, [error]);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "60vh",
        padding: "32px",
        fontFamily: "'Press Start 2P', monospace",
        textAlign: "center",
        color: "var(--red, #ff2244)",
      }}
    >
      <pre
        style={{
          fontSize: "8px",
          lineHeight: 1.4,
          color: "var(--dim, #555)",
          marginBottom: "24px",
        }}
        aria-hidden="true"
      >
        {`
  ╔══════════════════════════════╗
  ║   ░░░ ${t("errorSystem")} ░░░      ║
  ║                              ║
  ║   ◈ TOOLIE v1.0             ║
  ║   ◈ ${t("errorFault")}        ║
  ║                              ║
  ╚══════════════════════════════╝
        `}
      </pre>

      <h2
        style={{
          fontSize: "12px",
          marginBottom: "8px",
          letterSpacing: "2px",
          textShadow: "0 0 12px var(--red, #ff2244)",
        }}
      >
        {t("errorTitle")}
      </h2>

      <p
        style={{
          fontSize: "8px",
          color: "var(--dim, #555)",
          marginBottom: "24px",
          maxWidth: "400px",
          letterSpacing: "1px",
        }}
      >
        {t("errorMessage")}
      </p>

      <button
        type="button"
        onClick={reset}
        style={{
          fontFamily: "'Press Start 2P', monospace",
          fontSize: "8px",
          background: "transparent",
          border: "2px solid var(--red, #ff2244)",
          color: "var(--red, #ff2244)",
          padding: "10px 20px",
          cursor: "pointer",
          letterSpacing: "2px",
        }}
        onMouseOver={(e) => {
          (e.target as HTMLElement).style.boxShadow =
            "3px 3px 0 var(--red, #ff2244)";
        }}
        onMouseOut={(e) => {
          (e.target as HTMLElement).style.boxShadow = "none";
        }}
      >
        {t("errorRetry")}
      </button>
    </div>
  );
}
