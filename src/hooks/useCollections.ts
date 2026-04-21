"use client";

import { useCallback, useEffect, useState } from "react";
import type { CollectionData } from "@/lib/types";

const STORAGE_KEY = "toolie-collections";

function createCollectionId() {
  return `collection-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function useCollections() {
  const [collections, setCollections] = useState<CollectionData[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        return;
      }

      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        setCollections(
          parsed.filter(
            (item): item is CollectionData =>
              Boolean(item) &&
              typeof item.id === "string" &&
              typeof item.name === "string" &&
              Array.isArray(item.toolIds)
          )
        );
      }
    } catch {
      /* ignore invalid storage */
    }
  }, []);

  const persist = useCallback((nextCollections: CollectionData[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(nextCollections));
    } catch {
      /* ignore storage errors */
    }
  }, []);

  const updateCollections = useCallback(
    (updater: (previous: CollectionData[]) => CollectionData[]) => {
      setCollections((previous) => {
        const nextCollections = updater(previous);
        persist(nextCollections);
        return nextCollections;
      });
    },
    [persist]
  );

  const createCollection = useCallback(
    (name: string, initialToolId?: string) => {
      const trimmedName = name.trim();
      if (!trimmedName) {
        return null;
      }

      const nextCollection: CollectionData = {
        id: createCollectionId(),
        name: trimmedName,
        toolIds: initialToolId ? [initialToolId] : [],
      };

      updateCollections((previous) => [...previous, nextCollection]);
      return nextCollection.id;
    },
    [updateCollections]
  );

  const renameCollection = useCallback(
    (id: string, name: string) => {
      const trimmedName = name.trim();
      if (!trimmedName) {
        return;
      }

      updateCollections((previous) =>
        previous.map((collection) =>
          collection.id === id
            ? { ...collection, name: trimmedName }
            : collection
        )
      );
    },
    [updateCollections]
  );

  const deleteCollection = useCallback(
    (id: string) => {
      updateCollections((previous) =>
        previous.filter((collection) => collection.id !== id)
      );
    },
    [updateCollections]
  );

  const toggleTool = useCallback(
    (collectionId: string, toolId: string) => {
      updateCollections((previous) =>
        previous.map((collection) => {
          if (collection.id !== collectionId) {
            return collection;
          }

          const toolIds = collection.toolIds.includes(toolId)
            ? collection.toolIds.filter((id) => id !== toolId)
            : [...collection.toolIds, toolId];

          return { ...collection, toolIds };
        })
      );
    },
    [updateCollections]
  );

  return {
    collections,
    createCollection,
    renameCollection,
    deleteCollection,
    toggleTool,
  };
}
