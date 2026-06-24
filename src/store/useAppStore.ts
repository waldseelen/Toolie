import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Locale } from '@/lib/i18n';
import type { CollectionData } from '@/lib/types';

interface AppState {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  toggleLanguage: () => void;

  favorites: string[];
  toggleFavorite: (id: string) => void;
  isFavorite: (id: string) => boolean;

  collections: CollectionData[];
  createCollection: (name: string, initialToolId?: string) => string | null;
  renameCollection: (id: string, name: string) => void;
  deleteCollection: (id: string) => void;
  toggleCollectionTool: (collectionId: string, toolId: string) => void;
}

function createCollectionId() {
  return `collection-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // --- LANGUAGE ---
      locale: 'tr',
      setLocale: (locale) => set({ locale }),
      toggleLanguage: () => {
        const next = get().locale === 'tr' ? 'en' : 'tr';
        if (typeof document !== 'undefined') {
          document.documentElement.setAttribute('lang', next);
        }
        set({ locale: next });
      },

      // --- FAVORITES ---
      favorites: [],
      toggleFavorite: (id) => set((state) => {
        const next = state.favorites.includes(id)
          ? state.favorites.filter((f) => f !== id)
          : [...state.favorites, id];
        return { favorites: next };
      }),
      isFavorite: (id) => get().favorites.includes(id),

      // --- COLLECTIONS ---
      collections: [],
      createCollection: (name, initialToolId) => {
        const trimmed = name.trim();
        if (!trimmed) return null;
        const newCol: CollectionData = {
          id: createCollectionId(),
          name: trimmed,
          toolIds: initialToolId ? [initialToolId] : []
        };
        set((state) => ({ collections: [...state.collections, newCol] }));
        return newCol.id;
      },
      renameCollection: (id, name) => {
        const trimmed = name.trim();
        if (!trimmed) return;
        set((state) => ({
          collections: state.collections.map((c) =>
            c.id === id ? { ...c, name: trimmed } : c
          )
        }));
      },
      deleteCollection: (id) => set((state) => ({
        collections: state.collections.filter((c) => c.id !== id)
      })),
      toggleCollectionTool: (colId, toolId) => set((state) => ({
        collections: state.collections.map((c) => {
          if (c.id !== colId) return c;
          const toolIds = c.toolIds.includes(toolId)
            ? c.toolIds.filter((t) => t !== toolId)
            : [...c.toolIds, toolId];
          return { ...c, toolIds };
        })
      }))
    }),
    {
      name: 'toolie-app-storage',
      onRehydrateStorage: () => (state) => {
        if (state && typeof document !== 'undefined') {
           document.documentElement.setAttribute('lang', state.locale);
        }
      }
    }
  )
);
