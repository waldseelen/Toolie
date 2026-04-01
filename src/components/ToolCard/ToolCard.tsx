"use client";

import { useState } from "react";
import styles from "./ToolCard.module.css";
import type { ToolData } from "@/lib/types";
import type { Locale, TranslationKey } from "@/lib/i18n";
import { FAVICON_FALLBACK } from "@/lib/constants";

interface ToolCardProps {
  tool: ToolData;
  locale: Locale;
  accentColor: string;
  isFavorite: boolean;
  onToggleFavorite: (id: string) => void;
  t: (key: TranslationKey) => string;
}

export function ToolCard({
  tool,
  locale,
  accentColor,
  isFavorite,
  onToggleFavorite,
  t,
}: ToolCardProps) {
  const [imgSrc, setImgSrc] = useState(tool.faviconUrl || FAVICON_FALLBACK);
  const localizedDescription =
    locale === "en" ? tool.descriptionEn || tool.description : tool.description;

  return (
    <article
      className={styles.cardWrap}
      role="listitem"
      style={{ "--accent-color": accentColor } as React.CSSProperties}
    >
      <button
        type="button"
        className={`${styles.favBtn} ${isFavorite ? styles.favActive : ""}`}
        onClick={() => onToggleFavorite(tool.id)}
        aria-pressed={isFavorite}
        aria-label={
          isFavorite
            ? `${tool.name} ${t("removeFavorite")}`
            : `${tool.name} ${t("addFavorite")}`
        }
        title={isFavorite ? t("removeFavoriteTitle") : t("addFavoriteTitle")}
      >
        {isFavorite ? "★" : "☆"}
      </button>

      <a
        href={tool.link}
        className={styles.card}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`${tool.name} — ${localizedDescription}`}
        title={localizedDescription}
        data-name={tool.name.toLowerCase()}
        data-desc={localizedDescription.toLowerCase()}
      >
        <div className={styles.inner}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imgSrc}
            alt=""
            className={styles.favicon}
            aria-hidden="true"
            loading="lazy"
            width="30"
            height="30"
            onError={() => setImgSrc(FAVICON_FALLBACK)}
          />
          <span className={styles.name}>{tool.name}</span>
        </div>

        <span className={styles.tooltip}>{localizedDescription}</span>
      </a>
    </article>
  );
}
