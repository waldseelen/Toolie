# ◈ TOOLIE v1.0 — Retro Araç Kataloğu

**Toolie**, 378'den fazla aracı 7 ana kategoride toplayan, modern Next.js 15 altyapısıyla çalışan ancak 90'ların pixel-art ve CRT estetiğini taşıyan dinamik bir katalog uygulamasıdır.

![Toolie Icon](/public/icons/icon-192.png)

---

## 🚀 Öne Çıkan Özellikler

- 🎨 **Soft & Pastel Estetik:** Göz yormayan pastel tonlar, pixel-art ikonlar ve retro CRT görsel efektleri.
- 🌓 **Tema Desteği:** Aydınlık ve Karanlık mod (Kullanıcı tercihine göre otomatik veya manuel).
- 🌐 **i18n (Çoklu Dil):** Tam Türkçe ve İngilizce desteği.
- 📂 **Dinamik Veri Yapısı:** SQLite ve Prisma ORM ile yönetilen kategori ve araç hiyerarşisi.
- 🔍 **Gelişmiş Arama:** Debounced search, URL senkronizasyonu ve `Ctrl+K` kısayolu.
- 📱 **PWA Desteği:** Çevrimdışı kullanım için Service Worker ve mobil kurulum için Manifest.
- ⭐ **Favoriler:** Seçilen araçların tarayıcıda kalıcı olarak saklanması.
- ⚡ **Performans:** Server Component tabanlı veri çekme ve optimize edilmiş statik varlıklar.

---

## 🛠️ Teknik Yığın (Tech Stack)

| Katman | Teknoloji |
| :--- | :--- |
| **Framework** | Next.js 15 (App Router) |
| **Dil** | TypeScript |
| **Stil** | CSS Modules + Custom Properties |
| **Veritabanı** | SQLite |
| **ORM** | Prisma |
| **I18n** | Custom Hook Layer (TR/EN) |
| **PWA** | Custom Service Worker + Native Web Manifest |

---

## 📂 Proje İskeleti

```text
/
├── prisma/                  # Veritabanı şeması ve seed scriptleri
│   ├── schema.prisma        # SQLite tablo modelleri
│   ├── seed.ts              # Başlangıç verisi (378 araç) yükleyici
│   └── dev.db               # SQLite veritabanı dosyası
├── public/                  # Statik varlıklar
│   ├── icons/               # PWA ikonları (pixel-art)
│   ├── manifest.json        # PWA konfigürasyonu
│   └── sw.js                # Offline caching service worker
├── src/
│   ├── app/                 # Next.js App Router (Rotalar ve API)
│   │   ├── api/             # CRUD ve Favicon Proxy rotaları
│   │   ├── ToolieApp.tsx    # Ana uygulama orkestratörü
│   │   └── layout.tsx       # Root layout (SEO, SEO, Theme logic)
│   ├── components/          # Atomik UI bileşenleri
│   │   ├── Header/          # ASCII art ve başlık
│   │   ├── ToolCard/        # Akıllı metin kaydırmalı araç kartı
│   │   └── ...              # SearchBar, CategoryNav, Grid, Footer
│   ├── hooks/               # Özel React hook'ları
│   │   ├── useTheme.ts      # Tema yönetimi (Dark/Light)
│   │   ├── useLanguage.ts   # i18n çeviri hook'u
│   │   └── useFavorites.ts  # Favori araç yönetimi
│   ├── lib/                 # Paylaşılan mantık ve sabitler
│   │   ├── prisma.ts        # Database client singleton
│   │   └── i18n.ts          # Çeviri sözlükleri
│   └── styles/              # Global CSS ve Design System
└── .env                     # Çevresel değişkenler (DB URL)
```

---

## 🛠️ Kurulum ve Çalıştırma

### 1. Bağımlılıkları Yükle
```bash
npm install
```

### 2. Veritabanını Hazırla
```bash
npx prisma db push
npx prisma db seed
```

### 3. Geliştirme Sunucusunu Başlat
```bash
npm run dev
```

Uygulama artık **http://localhost:3000** adresinde hazır!

---

## 📜 Lisans
Bu proje geliştirme ve eğitim amaçlı oluşturulmuştur. Tüm içerikler (araç linkleri ve açıklamaları) katalog niteliğindedir.
