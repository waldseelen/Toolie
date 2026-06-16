"use client";

import { useState, useEffect } from "react";
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


  const getPricingLabel = (pricing?: string | null) => {
    if (!pricing) return "";
    const p = pricing.toLowerCase().trim();
    if (p === "free") return t("filterFree");
    if (p === "freemium") return t("filterFreemium");
    if (p === "paid") return t("filterPaid");
    return pricing;
  };

  const getPlatformLabel = (platform: string) => {
    const p = platform.toLowerCase().trim();
    if (p === "web") return t("filterWeb");
    if (p === "desktop") return t("filterDesktop");
    if (p === "mobile") return t("filterMobile");
    return platform;
  };

  const localizedDescription =
    locale === "en" ? tool.descriptionEn || tool.description : tool.description;
  const tooltipId = `tool-${tool.id}-tooltip`;

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

      {tool.verified && (
        <span
          className={styles.verifiedBadge}
          aria-label={`${tool.name} ${t("badgeVerified")}`}
          title={t("badgeVerified")}
        >
          ✓
        </span>
      )}

      {tool.isBroken && (
        <span
          className={styles.offlineBadge}
          aria-label={`${tool.name} ${t("offlineBadge")}`}
          title={t("offlineBadge")}
        >
          {t("offlineBadge")}
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
        href={tool.link}
        className={styles.card}
        target="_blank"
        rel="noopener noreferrer"
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
          <strong className={styles.tooltipName}>{tool.name}</strong>
          {/* Category & Subcategory Path */}
          {(tool.category || tool.subcategory) && (
            <div className={styles.tooltipPath}>
              {tool.category && (
                <span className={styles.tooltipCat}>
                  {tool.category.icon} {locale === "tr" ? tool.category.nameTr || tool.category.name : tool.category.nameEn || tool.category.name}
                </span>
              )}
              {tool.category && tool.subcategory && <span className={styles.pathSeparator}>/</span>}
              {tool.subcategory && (
                <span className={styles.tooltipSubcat}>
                  {locale === "tr" ? tool.subcategory.nameTr || tool.subcategory.name : tool.subcategory.nameEn || tool.subcategory.name}
                </span>
              )}
            </div>
          )}

          <p className={styles.tooltipDesc}>{localizedDescription}</p>

          {/* Pricing & Platforms Grid */}
          {(tool.pricingModel || tool.platforms) && (
            <div className={styles.tooltipMetaGrid}>
              {tool.pricingModel && (
                <div className={styles.tooltipMetaItem}>
                  <span className={styles.metaLabel}>{t("pricingModelLabel")}:</span>
                  <span className={styles.metaValue}>{getPricingLabel(tool.pricingModel)}</span>
                </div>
              )}
              {tool.platforms && (
                <div className={styles.tooltipMetaItem}>
                  <span className={styles.metaLabel}>{t("platformsLabel")}:</span>
                  <span className={styles.metaValue}>
                    {tool.platforms.split(",").map(p => getPlatformLabel(p)).join(", ")}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Badges & Tags */}
          <div className={styles.tooltipFooter}>
            {(tool.isOpenSource || tool.hasApi || tool.verified) && (
              <div className={styles.featureBadges}>
                {tool.isOpenSource && <span className={styles.featureBadge}>{t("badgeOpenSource")}</span>}
                {tool.hasApi && <span className={styles.featureBadge}>{t("badgeApi")}</span>}
                {tool.verified && <span className={styles.featureBadge}>{t("badgeVerified")}</span>}
              </div>
            )}

            {tool.tags && tool.tags.length > 0 && (
              <div className={styles.tagChips}>
                {tool.tags.slice(0, 3).map((tag) => (
                  <span key={tag.id} className={styles.tagChip}>
                    #{tag.slug}
                  </span>
                ))}
              </div>
            )}
          </div>
        </span>
      </a>
    </article>
  );
}
