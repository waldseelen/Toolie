"use client";

import { useState } from "react";
import type { Locale } from "@/lib/i18n";

interface ComparePageClientProps {
  locale: Locale;
  url: string;
}

export function ComparePageClient({ locale, url }: ComparePageClientProps) {
  const [copied, setCopied] = useState(false);

  const label = copied
    ? locale === "en"
      ? "Copied"
      : "Kopyalandı"
    : locale === "en"
      ? "Copy compare link"
      : "Karşılaştırma bağlantısını kopyala";

  return (
    <button
      type="button"
      onClick={async () => {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }}
    >
      {label}
    </button>
  );
}
