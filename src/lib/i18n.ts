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
    badgeVerified: "Doğrulandı",
    compareToggle: "karşılaştırmaya ekle",
    compareToggleRemove: "karşılaştırmadan çıkar",
    addToCollection: "koleksiyona ekle",
    collectionsTitle: "Koleksiyonlar",
    collectionsEmpty: "Henüz koleksiyon yok",
    newCollectionPlaceholder: "Yeni koleksiyon adı",
    compareTrayTitle: "Karşılaştırma",
    clearCompare: "Temizle",
    compareAction: "Karşılaştır",

    /* Spotlight */
    featuredToolsTitle: "Editörün Seçimleri",
    featuredToolsCopy: "Öne çıkarılan araçlar, kategori renklerini koruyarak hızlı keşif için burada listelenir.",
    newAdditionsTitle: "Yeni Eklenenler",
    newAdditionsCopy: "Veritabanına son eklenen araçlar yatay akışta sunulur.",

    /* Detail */
    backToCatalog: "Kataloğa Dön",
    similarToolsTitle: "Benzer Araçlar",
    visitOfficialSite: "Resmi Siteyi Ziyaret Et",
    officialDocs: "Resmi Dokümanlar",
    sourceCode: "Kaynak Kodu",
    pricingModelLabel: "Fiyatlandırma",
    platformsLabel: "Platformlar",
    currentStatus: "Durum",
    lastChecked: "Son Kontrol",
    toolHealth: "Bağlantı Sağlığı",
    healthBroken: "Sorunlu",
    healthHealthy: "Sağlıklı",
    healthUnknown: "Bilinmiyor",
    badgeApi: "API",
    badgeOpenSource: "Açık Kaynak",
    statusActive: "Aktif",
    statusDead: "Pasif",
    statusRedirected: "Yönleniyor",

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

    /* Filters */
    filterPricing: "Fiyatlandırma",
    filterPlatform: "Platform",
    filterSort: "Sıralama",
    filterAll: "Tümü",
    filterFree: "Ücretsiz",
    filterPaid: "Ücretli",
    filterFreemium: "Freemium",
    filterWeb: "Web",
    filterDesktop: "Masaüstü",
    filterMobile: "Mobil",
    sortNewest: "En Yeni",
    sortAZ: "A-Z",

    /* Phase 3 */
    submissionsTitle: "Gönderiler",
    comparePageTitle: "Araç Karşılaştırması",
    collectionsPageTitle: "Koleksiyonlar",
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
    badgeVerified: "Verified",
    compareToggle: "add to compare",
    compareToggleRemove: "remove from compare",
    addToCollection: "add to collection",
    collectionsTitle: "Collections",
    collectionsEmpty: "No collections yet",
    newCollectionPlaceholder: "New collection name",
    compareTrayTitle: "Compare",
    clearCompare: "Clear",
    compareAction: "Compare",

    /* Spotlight */
    featuredToolsTitle: "Featured Tools",
    featuredToolsCopy: "Editor-picked tools, rendered with category accent colors for quick discovery.",
    newAdditionsTitle: "New Additions",
    newAdditionsCopy: "Recently added tools, presented as a horizontal discovery rail.",

    /* Detail */
    backToCatalog: "Back to Catalog",
    similarToolsTitle: "Similar Tools",
    visitOfficialSite: "Visit Official Site",
    officialDocs: "Official Docs",
    sourceCode: "Source Code",
    pricingModelLabel: "Pricing",
    platformsLabel: "Platforms",
    currentStatus: "Status",
    lastChecked: "Last Checked",
    toolHealth: "Link Health",
    healthBroken: "Broken",
    healthHealthy: "Healthy",
    healthUnknown: "Unknown",
    badgeApi: "API",
    badgeOpenSource: "Open Source",
    statusActive: "Active",
    statusDead: "Dead",
    statusRedirected: "Redirected",

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

    /* Filters */
    filterPricing: "Pricing",
    filterPlatform: "Platform",
    filterSort: "Sort",
    filterAll: "All",
    filterFree: "Free",
    filterPaid: "Paid",
    filterFreemium: "Freemium",
    filterWeb: "Web",
    filterDesktop: "Desktop",
    filterMobile: "Mobile",
    sortNewest: "Newest",
    sortAZ: "A-Z",

    /* Phase 3 */
    submissionsTitle: "Submissions",
    comparePageTitle: "Tool Comparison",
    collectionsPageTitle: "Collections",
  },
} as const;

export type TranslationKey = keyof (typeof translations)["tr"];

export function t(locale: Locale, key: TranslationKey): string {
  return translations[locale][key];
}
