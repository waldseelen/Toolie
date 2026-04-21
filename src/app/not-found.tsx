"use client";

import Link from "next/link";
import { useLanguage } from "@/hooks/useLanguage";

export default function NotFound() {
  const { t } = useLanguage();

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
        color: "var(--orange)",
      }}
    >
      <pre
        style={{
          fontSize: "8px",
          lineHeight: 1.4,
          color: "var(--dim)",
          marginBottom: "24px",
        }}
        aria-hidden="true"
      >
        {`
  ╔══════════════════════════════╗
  ║         ${t("notFoundTitle")}           ║
  ║                              ║
  ║      PAGE NOT FOUND          ║
  ║                              ║
  ╚══════════════════════════════╝
        `}
      </pre>

      <p
        style={{
          fontSize: "8px",
          color: "var(--dim)",
          marginBottom: "24px",
          maxWidth: "420px",
          letterSpacing: "1px",
        }}
      >
        {t("notFoundMessage")}
      </p>

      <Link
        href="/"
        style={{
          fontSize: "8px",
          border: "2px solid var(--orange)",
          color: "var(--orange)",
          padding: "10px 20px",
          letterSpacing: "2px",
        }}
      >
        {t("notFoundBack")}
      </Link>
    </div>
  );
}
