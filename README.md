# ◈ TOOLIE v1.0 — Retro Araç Kataloğu

**Toolie**, 370'ten fazla aracı (376 araç / 7 ana kategori) toplayan, modern Next.js 15 altyapısıyla çalışan ancak 90'ların pixel-art ve CRT estetiğini taşıyan dinamik bir katalog uygulamasıdır.

![Toolie Icon](/public/icons/icon-192.png)

---

## 🚀 Öne Çıkan Özellikler

- 🎨 **Soft & Pastel Estetik:** Göz yormayan pastel tonlar, pixel-art ikonlar ve retro CRT görsel efektleri.
- 🌓 **Tema Desteği:** Aydınlık ve Karanlık mod (Kullanıcı tercihine göre otomatik veya manuel).
- 🌐 **i18n (Çoklu Dil):** Tam Türkçe ve İngilizce desteği (`src/lib/i18n.ts`).
- 📂 **Dinamik Veri Yapısı:** Cloud Firestore (firebase-admin) ile yönetilen kategori/alt kategori/araç hiyerarşisi. Firebase yapılandırılmadığında `TOOLS.json` tabanlı yerel fallback devreye girer.
- 🔍 **Gelişmiş Arama:** MiniSearch tabanlı `/api/search` uç noktası, debounced arama, URL senkronizasyonu ve `Ctrl+K` kısayolu.
- 📱 **PWA Desteği:** Çevrimdışı kullanım için elle yazılmış Service Worker (`public/sw.js`) ve mobil kurulum için Web Manifest (`public/manifest.json`).
- ⭐ **Favoriler & Koleksiyonlar:** Zustand `persist` ile tarayıcıda (localStorage) kalıcı olarak saklanır.
- ⚖️ **Karşılaştırma:** Araçları yan yana karşılaştırma (compare tray + `/compare`).
- ⚡ **Performans:** Server Component tabanlı veri çekme ve optimize edilmiş statik varlıklar.

---

## 🛠️ Teknik Yığın (Tech Stack)

| Katman | Teknoloji |
| :--- | :--- |
| **Framework** | Next.js 15 (App Router), React 19 |
| **Dil** | TypeScript |
| **Stil** | CSS Modules + CSS Custom Properties |
| **Veritabanı** | Cloud Firestore (`firebase-admin` Admin SDK) |
| **Yerel Fallback** | `TOOLS.json` (Firebase yapılandırılmadığında bellek içi veri) |
| **Arama** | MiniSearch (sunucu tarafı, `/api/search`) |
| **İstemci Durumu** | Zustand (`persist` → localStorage) |
| **I18n** | Custom sözlük katmanı (`src/lib/i18n.ts`, TR/EN) |
| **PWA** | Elle yazılmış Service Worker + Web Manifest |
| **Test** | Vitest (birim) + Playwright (e2e) |

> Not: Bu proje **Prisma veya SQLite kullanmaz**. Veri katmanı Firestore + `TOOLS.json` fallback üzerine kuruludur.

---

## 📂 Proje İskeleti

```text
/
├── TOOLS.json               # Kaynak veri (7 kategori, 376 araç) — seed + yerel fallback
├── scripts/
│   ├── seed.ts              # TOOLS.json'u Firestore'a yükleyen seed script'i
│   └── linkChecker.ts       # Araç linklerinin durumunu kontrol eden script
├── public/                  # Statik varlıklar
│   ├── icons/               # PWA ikonları (pixel-art)
│   ├── manifest.json        # PWA konfigürasyonu
│   └── sw.js                # Offline caching service worker (elle yazılmış)
├── src/
│   ├── app/                 # Next.js App Router (Rotalar ve API)
│   │   ├── api/             # search, favicon proxy, tools CRUD, submissions, admin session
│   │   ├── admin/           # Yönetim paneli (tools, submissions, broken links)
│   │   ├── globals.css      # Global CSS ve Design System (pastel/CRT değişkenleri)
│   │   ├── ToolieApp.tsx    # Ana uygulama orkestratörü
│   │   └── layout.tsx       # Root layout (SEO, Theme, Service Worker kaydı)
│   ├── components/          # Atomik UI bileşenleri (co-located CSS Modules)
│   │   ├── Header/          # ASCII art ve başlık
│   │   ├── SearchBar/       # Ctrl+K odaklı arama girişi
│   │   ├── ToolCard/        # Akıllı metin kaydırmalı araç kartı
│   │   └── ...              # CategoryNav, ToolGrid, FilterBar, CompareTray, Footer
│   ├── hooks/               # Özel React hook'ları
│   │   ├── useToolSearch.ts # /api/search'e debounced istek
│   │   ├── useFavorites.ts  # Favori araç yönetimi (localStorage)
│   │   └── useLanguage.ts   # i18n çeviri hook'u
│   ├── store/
│   │   └── useAppStore.ts   # Zustand store (locale, favorites, collections)
│   └── lib/                 # Paylaşılan mantık ve sabitler
│       ├── db.ts            # Firestore veri erişimi + TOOLS.json fallback
│       ├── firebase.ts      # firebase-admin başlatma (getDb / isFirebaseConfigured)
│       ├── taxonomy.ts      # Kategori/alt kategori taksonomisi ve yerelleştirme
│       └── i18n.ts          # Çeviri sözlükleri (TR/EN)
└── .env                     # Çevresel değişkenler (Firebase kimlik bilgileri)
```

---

## 🛠️ Kurulum ve Çalıştırma

### 1. Bağımlılıkları Yükle
```bash
npm install
```

### 2. Veri Kaynağını Hazırla

**Seçenek A — Yerel fallback (Firebase gerektirmez):**
`TOOLS.json` deposu ile birlikte gelir. Firebase kimlik bilgileri tanımlı değilse uygulama `TOOLS.json`'u bellek içine yükler ve doğrudan çalışır. Ek bir adım gerekmez.

**Seçenek B — Firestore ile:**
`.env` içine Firebase Admin kimlik bilgilerini ekleyin (`FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY`) veya proje köküne `firebase-service-account.json` yerleştirin. Ardından katalogu Firestore'a yükleyin:
```bash
npm run db:seed        # tsx scripts/seed.ts — TOOLS.json'u Firestore'a yazar
```

### 3. Geliştirme Sunucusunu Başlat
```bash
npm run dev
```

Uygulama artık **http://localhost:3000** adresinde hazır!

### Faydalı Komutlar
```bash
npm run build       # Üretim derlemesi
npm run lint        # ESLint (max-warnings=0)
npm run typecheck   # tsc --noEmit
npm run test        # Vitest birim testleri
npm run test:e2e    # Playwright e2e testleri
npm run check-links # Araç linklerini kontrol et
```

---

## 📜 Lisans
Bu proje geliştirme ve eğitim amaçlı oluşturulmuştur. Tüm içerikler (araç linkleri ve açıklamaları) katalog niteliğindedir.
