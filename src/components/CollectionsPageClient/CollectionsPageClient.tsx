"use client";

import { useMemo, useState, useEffect } from "react";
import { useFavorites } from "@/hooks/useFavorites";
import { useCompare } from "@/hooks/useCompare";
import { useCollections } from "@/hooks/useCollections";
import { useLanguage } from "@/hooks/useLanguage";
import { ToolCard } from "@/components/ToolCard/ToolCard";
import type { ToolData } from "@/lib/types";
import styles from "./CollectionsPageClient.module.css";

interface CollectionsPageClientProps {
  tools: ToolData[];
  sharedIds?: string;
  sharedName?: string;
}

export function CollectionsPageClient({ tools, sharedIds = "", sharedName = "" }: CollectionsPageClientProps) {
  const { locale, t } = useLanguage();
  const { favorites, toggleFavorite } = useFavorites();
  const { ids: comparedIds, toggle: toggleCompare } = useCompare();
  const {
    collections,
    createCollection,
    renameCollection,
    deleteCollection,
    toggleTool,
  } = useCollections();

  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const toolMap = useMemo(
    () => new Map(tools.map((tool) => [tool.id, tool])),
    [tools]
  );

  const sharedTools = useMemo(() => {
    if (!sharedIds) return [];
    const parts = sharedIds.split(",").map((p) => p.trim().toLowerCase());
    return tools.filter(
      (tool) =>
        parts.includes(tool.id.toLowerCase()) ||
        (tool.slug && parts.includes(tool.slug.toLowerCase()))
    );
  }, [sharedIds, tools]);

  const handleShare = async (collection: { id: string; name: string; toolIds: string[] }) => {
    const slugsOrIds = collection.toolIds
      .map((id) => toolMap.get(id)?.slug || id)
      .filter(Boolean);
    const url = `${window.location.origin}/collections?name=${encodeURIComponent(
      collection.name
    )}&share=${slugsOrIds.join(",")}`;
    await navigator.clipboard.writeText(url);
    setCopiedId(collection.id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const sharedTitle = sharedName || (locale === "en" ? "Shared Collection" : "Paylaşılan Koleksiyon");

  return (
    <main className={styles.page}>
      <h1 className={styles.title}>
        {locale === "en" ? "Collections" : "Koleksiyonlar"}
      </h1>

      {sharedTools.length > 0 && (
        <section className={`${styles.section} ${styles.sharedSection}`}>
          <div className={styles.collectionHeader}>
            <h2 className={styles.collectionTitle}>★ {sharedTitle}</h2>
          </div>
          <div role="list" className={styles.grid}>
            {sharedTools.map((tool) => (
              <ToolCard
                key={tool.id}
                tool={tool}
                locale={locale}
                accentColor={tool.category?.color ?? "var(--green)"}
                isFavorite={favorites.includes(tool.id)}
                onToggleFavorite={toggleFavorite}
                isCompared={comparedIds.includes(tool.id)}
                onToggleCompare={toggleCompare}
                collections={collections}
                compareIds={comparedIds}
                onCreateCollection={createCollection}
                onToggleCollection={toggleTool}
                t={t}
              />
            ))}
          </div>
        </section>
      )}

      {mounted && collections.length > 0 ? (
        <div className={styles.collectionList}>
          {collections.map((collection) => (
            <section key={collection.id} className={styles.section}>
              <div className={styles.collectionHeader}>
                <h2 className={styles.collectionTitle}>{collection.name}</h2>
                <div className={styles.actions}>
                  <button
                    className={styles.button}
                    type="button"
                    onClick={() => handleShare(collection)}
                  >
                    {copiedId === collection.id ? t("copied") : t("shareBtn")}
                  </button>
                  <button
                    className={styles.button}
                    type="button"
                    onClick={() => {
                      const nextName = prompt(
                        locale === "en" ? "Rename collection" : "Koleksiyonu yeniden adlandır",
                        collection.name
                      );
                      if (nextName) {
                        renameCollection(collection.id, nextName);
                      }
                    }}
                  >
                    {locale === "en" ? "Rename" : "Yeniden Adlandır"}
                  </button>
                  <button
                    className={styles.button}
                    type="button"
                    onClick={() => deleteCollection(collection.id)}
                  >
                    {locale === "en" ? "Delete" : "Sil"}
                  </button>
                </div>
              </div>

              {collection.toolIds.length > 0 ? (
                <div role="list" className={styles.grid}>
                  {collection.toolIds
                    .map((id) => toolMap.get(id))
                    .filter((tool): tool is ToolData => Boolean(tool))
                    .map((tool) => (
                      <ToolCard
                        key={tool.id}
                        tool={tool}
                        locale={locale}
                        accentColor={tool.category?.color ?? "var(--green)"}
                        isFavorite={favorites.includes(tool.id)}
                        onToggleFavorite={toggleFavorite}
                        isCompared={comparedIds.includes(tool.id)}
                        onToggleCompare={toggleCompare}
                        collections={collections}
                        compareIds={comparedIds}
                        onCreateCollection={createCollection}
                        onToggleCollection={toggleTool}
                        t={t}
                      />
                    ))}
                </div>
              ) : (
                <p className={styles.empty}>
                  {locale === "en"
                    ? "No tools in this collection yet."
                    : "Bu koleksiyonda henüz araç yok."}
                </p>
              )}
            </section>
          ))}
        </div>
      ) : (
        mounted && sharedTools.length === 0 && (
          <p className={styles.empty}>
            {locale === "en"
              ? "Create a collection from any tool card."
              : "Herhangi bir araç kartından koleksiyon oluşturun."}
          </p>
        )
      )}
    </main>
  );
}
