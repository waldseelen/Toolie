/* ═══════════════════════════════════════════════════════
   TOOLIE i18n — Turkish / English translations
   ═══════════════════════════════════════════════════════ */

export type Locale = "tr" | "en";

export const translations = {
  tr: {
    /* Header */
    headerSubtitle: "RETRO ARAÇ KATALOĞU — ARKADAŞLARLA PAYLAŞ",
    statsTools: "ARAÇ",
    statsCategories: "KATEGORİ",
    statsSubcategories: "ALT KATEGORİ",

    /* Search */
    searchPlaceholder: "> ARAÇ ARA...",
    searchAriaLabel: "Araçlarda ara",
    skipToContent: "Ana içeriğe geç",

    /* Category Nav */
    categoryAriaLabel: "Ana kategoriler",
    categorySwitch: "kategorisine geç",

    /* Tool Grid */
    toolCount: "araç",
    toolCountUpper: "ARAÇ",
    noResultsFor: "için sonuç bulunamadı",
    noToolsInCategory: "Bu kategoride araç yok",

    /* Tool Card */
    removeFavorite: "favorilerden çıkar",
    addFavorite: "favorilere ekle",
    removeFavoriteTitle: "Favorilerden çıkar",
    addFavoriteTitle: "Favorilere ekle",

    /* Theme Toggle */
    switchToLight: "Aydınlık temaya geç",
    switchToDark: "Karanlık temaya geç",
    lightTheme: "Aydınlık Tema",
    darkTheme: "Karanlık Tema",

    /* Language Toggle */
    switchLang: "Switch to English",
    langLabel: "TR",

    /* Footer */
    footerText: "RETRO ARAÇ KATALOĞU",

    /* Error Page */
    errorTitle: "[ HATA ]",
    errorMessage: "Bir şeyler yanlış gitti. Lütfen tekrar deneyin.",
    errorRetry: "[ YENİDEN DENE ]",
    errorSystem: "SİSTEM HATASI",
    errorFault: "BEKLENMEDİK ARIZA",
    notFoundTitle: "[ 404 ]",
    notFoundMessage: "Aradığın sayfa bulunamadı.",
    notFoundBack: "[ ANA SAYFAYA DÖN ]",

    /* Loading */
    loading: "Yükleniyor",
  },

  en: {
    /* Header */
    headerSubtitle: "RETRO TOOL CATALOG — SHARE WITH FRIENDS",
    statsTools: "TOOLS",
    statsCategories: "CATEGORIES",
    statsSubcategories: "SUBCATEGORIES",

    /* Search */
    searchPlaceholder: "> SEARCH TOOLS...",
    searchAriaLabel: "Search tools",
    skipToContent: "Skip to main content",

    /* Category Nav */
    categoryAriaLabel: "Main categories",
    categorySwitch: "switch to category",

    /* Tool Grid */
    toolCount: "tools",
    toolCountUpper: "TOOLS",
    noResultsFor: "no results found for",
    noToolsInCategory: "No tools in this category",

    /* Tool Card */
    removeFavorite: "remove from favorites",
    addFavorite: "add to favorites",
    removeFavoriteTitle: "Remove from favorites",
    addFavoriteTitle: "Add to favorites",

    /* Theme Toggle */
    switchToLight: "Switch to light theme",
    switchToDark: "Switch to dark theme",
    lightTheme: "Light Theme",
    darkTheme: "Dark Theme",

    /* Language Toggle */
    switchLang: "Türkçe'ye geç",
    langLabel: "EN",

    /* Footer */
    footerText: "RETRO TOOL CATALOG",

    /* Error Page */
    errorTitle: "[ ERROR ]",
    errorMessage: "Something went wrong. Please try again.",
    errorRetry: "[ RETRY ]",
    errorSystem: "SYSTEM ERROR",
    errorFault: "UNEXPECTED FAULT",
    notFoundTitle: "[ 404 ]",
    notFoundMessage: "The page you are looking for was not found.",
    notFoundBack: "[ BACK TO HOME ]",

    /* Loading */
    loading: "Loading",
  },
} as const;

export type TranslationKey = keyof (typeof translations)["tr"];

export function t(locale: Locale, key: TranslationKey): string {
  return translations[locale][key];
}
