"use client";

import { useState } from "react";
import styles from "./ToolCard.module.css";
import { CollectionPicker } from "@/components/CollectionPicker/CollectionPicker";
import type { ToolData } from "@/lib/types";
import { t } from "@/lib/i18n";
import { FAVICON_FALLBACK } from "@/lib/constants";
import { useAppStore } from "@/store/useAppStore";

interface ToolCardProps {
  tool: ToolData;
  accentColor: string;
  isCompared?: boolean;
  onToggleCompare?: (id: string) => void;
}

export function ToolCard({
  tool,
  accentColor,
  isCompared = false,
  onToggleCompare,
}: ToolCardProps) {
  const [imgSrc, setImgSrc] = useState(tool.faviconUrl || FAVICON_FALLBACK);
  
  // Connect to Zustand store
  const locale = useAppStore((state) => state.locale);
  const isFavorite = useAppStore((state) => state.isFavorite(tool.id));
  const toggleFavorite = useAppStore((state) => state.toggleFavorite);
  const collections = useAppStore((state) => state.collections);
  const createCollection = useAppStore((state) => state.createCollection);
  const toggleCollectionTool = useAppStore((state) => state.toggleCollectionTool);

  const getPricingLabel = (pricing?: string | null) => {
    if (!pricing) return "";
    const p = pricing.toLowerCase().trim();
    if (p === "free") return t(locale, "filterFree");
    if (p === "freemium") return t(locale, "filterFreemium");
    if (p === "paid") return t(locale, "filterPaid");
    return pricing;
  };

  const getPlatformLabel = (platform: string) => {
    const p = platform.toLowerCase().trim();
    if (p === "web") return t(locale, "filterWeb");
    if (p === "desktop") return t(locale, "filterDesktop");
    if (p === "mobile") return t(locale, "filterMobile");
    return platform;
  };

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
        onClick={() => toggleFavorite(tool.id)}
        aria-pressed={isFavorite}
        aria-label={
          isFavorite
            ? `${tool.name} ${t(locale, "removeFavorite")}`
            : `${tool.name} ${t(locale, "addFavorite")}`
        }
        title={isFavorite ? t(locale, "removeFavoriteTitle") : t(locale, "addFavoriteTitle")}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill={isFavorite ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      </button>

      {onToggleCompare && (
        <button
          type="button"
          className={`${styles.compareBtn} ${isCompared ? styles.compareActive : ""}`}
          onClick={() => onToggleCompare(tool.id)}
          aria-pressed={isCompared}
          aria-label={
            isCompared
              ? `${tool.name} ${t(locale, "compareToggleRemove")}`
              : `${tool.name} ${t(locale, "compareToggle")}`
          }
          title={isCompared ? t(locale, "compareToggleRemove") : t(locale, "compareToggle")}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill={isCompared ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
          </svg>
        </button>
      )}


      <CollectionPicker
        className={styles.collectionWrap}
        collections={collections}
        onCreateCollection={createCollection}
        onToggleCollection={toggleCollectionTool}
        t={(key) => t(locale, key)}
        toolId={tool.id}
      />

      <a
        href={tool.link}
        className={styles.card}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`${tool.name} — ${localizedDescription}`}
      >
        <div className={styles.inner}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imgSrc}
            alt=""
            className={styles.favicon}
            aria-hidden="true"
            loading="lazy"
            width="40"
            height="40"
            onError={() => setImgSrc(FAVICON_FALLBACK)}
          />
          <div className={styles.nameRow}>
            <span className={styles.name}>
              {tool.name}
            </span>
            {tool.verified && (
              <span className={styles.verifiedBadge} title={t(locale, "badgeVerified")}>
                ✓
              </span>
            )}
          </div>
        </div>

        <p className={styles.description}>{localizedDescription}</p>

        {tool.tags && tool.tags.length > 0 && (
          <div className={styles.tagChips}>
            {tool.tags.slice(0, 3).map((tag) => (
              <span key={tag.id} className={styles.tagChip}>
                {tag.slug}
              </span>
            ))}
          </div>
        )}

        <div className={styles.meta}>
          {tool.pricingModel && (() => {
            const p = tool.pricingModel.toLowerCase().trim();
            const cls = p === 'free' ? styles.pricingFree
              : p === 'freemium' ? styles.pricingFreemium
              : styles.pricingPaid;
            return (
              <span className={`${styles.metaItem} ${cls}`}>
                {getPricingLabel(tool.pricingModel)}
              </span>
            );
          })()}
          {tool.pricingModel && tool.platforms && <span style={{ color: 'var(--border)' }}>·</span>}
          {tool.platforms && (
            <span className={styles.metaItem}>
               {tool.platforms.split(",").slice(0,2).map(p => getPlatformLabel(p)).join(", ")}
            </span>
          )}
        </div>
      </a>
    </article>
  );
}
