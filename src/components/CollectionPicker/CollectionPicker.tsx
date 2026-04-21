"use client";

import { useState } from "react";
import styles from "./CollectionPicker.module.css";
import type { TranslationKey } from "@/lib/i18n";
import type { CollectionData } from "@/lib/types";

interface CollectionPickerProps {
  className?: string;
  collections: CollectionData[];
  onCreateCollection: (name: string, initialToolId?: string) => string | null;
  onToggleCollection: (collectionId: string, toolId: string) => void;
  t: (key: TranslationKey) => string;
  toolId: string;
}

export function CollectionPicker({
  className,
  collections,
  onCreateCollection,
  onToggleCollection,
  t,
  toolId,
}: CollectionPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState("");

  const handleCreate = () => {
    const createdId = onCreateCollection(newCollectionName, toolId);
    if (createdId) {
      setNewCollectionName("");
      setIsOpen(false);
    }
  };

  return (
    <div className={`${styles.wrap} ${className ?? ""}`.trim()}>
      <button
        type="button"
        className={`${styles.trigger} ${isOpen ? styles.active : ""}`}
        aria-label={t("addToCollection")}
        title={t("addToCollection")}
        onClick={() => setIsOpen((previous) => !previous)}
      >
        ⊞
      </button>

      {isOpen && (
        <div className={styles.panel}>
          <div className={styles.panelTitle}>{t("collectionsTitle")}</div>
          {collections.length > 0 ? (
            <div className={styles.list}>
              {collections.map((collection) => (
                <label key={collection.id} className={styles.option}>
                  <input
                    type="checkbox"
                    checked={collection.toolIds.includes(toolId)}
                    onChange={() => onToggleCollection(collection.id, toolId)}
                  />
                  {collection.name}
                </label>
              ))}
            </div>
          ) : (
            <p className={styles.empty}>{t("collectionsEmpty")}</p>
          )}

          <div className={styles.inputRow}>
            <input
              className={styles.input}
              type="text"
              value={newCollectionName}
              onChange={(event) => setNewCollectionName(event.target.value)}
              placeholder={t("newCollectionPlaceholder")}
            />
            <button type="button" className={styles.button} onClick={handleCreate}>
              +
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
