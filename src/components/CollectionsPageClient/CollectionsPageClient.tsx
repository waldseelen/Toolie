"use client";

import { useMemo } from "react";
import { useFavorites } from "@/hooks/useFavorites";
import { useCompare } from "@/hooks/useCompare";
import { useCollections } from "@/hooks/useCollections";
import { useLanguage } from "@/hooks/useLanguage";
import { ToolCard } from "@/components/ToolCard/ToolCard";
import type { ToolData } from "@/lib/types";
import styles from "./CollectionsPageClient.module.css";

interface CollectionsPageClientProps {
  tools: ToolData[];
}

export function CollectionsPageClient({ tools }: CollectionsPageClientProps) {
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

  const toolMap = useMemo(
    () => new Map(tools.map((tool) => [tool.id, tool])),
    [tools]
  );

  return (
    <main className={styles.page}>
      <h1 className={styles.title}>
        {locale === "en" ? "Collections" : "Koleksiyonlar"}
      </h1>
      {collections.length > 0 ? (
        <div className={styles.collectionList}>
          {collections.map((collection) => (
            <section key={collection.id} className={styles.section}>
              <div className={styles.collectionHeader}>
                <h2 className={styles.collectionTitle}>{collection.name}</h2>
                <div className={styles.actions}>
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
        <p className={styles.empty}>
          {locale === "en"
            ? "Create a collection from any tool card."
            : "Herhangi bir araç kartından koleksiyon oluşturun."}
        </p>
      )}
    </main>
  );
}
