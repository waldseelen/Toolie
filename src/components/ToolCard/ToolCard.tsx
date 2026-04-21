"use client";

import { useState } from "react";
import styles from "./ToolCard.module.css";
import { CollectionPicker } from "@/components/CollectionPicker/CollectionPicker";
import type { CollectionData, ToolData } from "@/lib/types";
import type { Locale, TranslationKey } from "@/lib/i18n";
import { FAVICON_FALLBACK } from "@/lib/constants";

interface ToolCardProps {
  tool: ToolData;
  locale: Locale;
  accentColor: string;
  isFavorite: boolean;
  isCompared?: boolean;
  compareIds?: string[];
  collections?: CollectionData[];
  onCreateCollection?: (name: string, initialToolId?: string) => string | null;
  onToggleCollection?: (collectionId: string, toolId: string) => void;
  onToggleFavorite: (id: string) => void;
  onToggleCompare?: (id: string) => void;
  t: (key: TranslationKey) => string;
}

export function ToolCard({
  tool,
  locale,
  accentColor,
  isFavorite,
  isCompared = false,
  collections = [],
  onCreateCollection,
  onToggleCollection,
  onToggleFavorite,
  onToggleCompare,
  t,
}: ToolCardProps) {
  const [imgSrc, setImgSrc] = useState(tool.faviconUrl || FAVICON_FALLBACK);
  const localizedDescription =
    locale === "en" ? tool.descriptionEn || tool.description : tool.description;
  const tooltipId = `tool-${tool.id}-tooltip`;

  return (
    <article
      className={styles.cardWrap}
      role="listitem"
      style={{ "--accent-color": accentColor } as React.CSSProperties}
    >
      {onToggleCompare && (
        <label className={styles.compareToggle}>
          <input
            type="checkbox"
            checked={isCompared}
            onChange={() => onToggleCompare(tool.id)}
            aria-label={
              isCompared
                ? `${tool.name} ${t("compareToggleRemove")}`
                : `${tool.name} ${t("compareToggle")}`
            }
          />
          <span>{isCompared ? "CMP" : "CMP"}</span>
        </label>
      )}

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

      {tool.verified && (
        <span
          className={styles.verifiedBadge}
          aria-label={`${tool.name} ${t("badgeVerified")}`}
          title={t("badgeVerified")}
        >
          ✓
        </span>
      )}

      {onCreateCollection && onToggleCollection && (
        <CollectionPicker
          className={styles.collectionWrap}
          collections={collections}
          onCreateCollection={onCreateCollection}
          onToggleCollection={onToggleCollection}
          t={t}
          toolId={tool.id}
        />
      )}

      <a
        href={tool.slug ? `/tool/${tool.slug}` : tool.link}
        className={styles.card}
        target="_self"
        aria-label={`${tool.name} — ${localizedDescription}`}
        aria-describedby={tooltipId}
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

        <span id={tooltipId} className={styles.tooltip} role="tooltip">
          {localizedDescription}
          {tool.tags && tool.tags.length > 0 && (
            <div className={styles.tagChips}>
              {tool.tags.map((tag) => (
                <span key={tag.id} className={styles.tagChip}>
                  #{tag.slug}
                </span>
              ))}
            </div>
          )}
        </span>
      </a>
    </article>
  );
}
