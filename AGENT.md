# 🤖 AI Agent Guidelines for TOOLIE

Bu belge, **Toolie** projesi üzerinde çalışacak yapay zeka asistanları için teknik standartları, mimari kuralları ve tasarım prensiplerini belirler.

---

## 📋 Genel Bakış
**Toolie**, retro pixel-art estetiğine sahip dinamik bir araç kataloğudur. Proje hakkında detaylı teknik kurulum ve özellik listesi için lütfen önce **[README.md](file:///c:/Users/bugra/DEV/Toolie/README.md)** dosyasını okuyun.

---

## ⚖️ Temel Kurallar ve Kısıtlamalar

### 1. Dosya Uzunluğu
- **KRİTİK:** Hiçbir dosya **600 satırı** geçmemelidir. Eğer bir bileşen veya dosya bu sınıra yaklaşıyorsa, mantıksal olarak alt bileşenlere veya yardımcı fonksiyonlara (utils/hooks) bölünmelidir.

### 2. Teknoloji ve Stil
- **Framework:** Next.js 15 (App Router).
- **Stilleme:** Sadece **CSS Modules** ve **CSS Custom Properties** (Değişkenler) kullanılmalıdır.
- **Tailwind CSS:** Kullanıcı açıkça talep etmedikçe Tailwind kullanılmamalıdır. Retro estetik kuralları `src/styles/globals.css` içinde tanımlıdır.

### 3. Veri Yönetimi (Prisma & SQLite)
- Statik değişimler için `TOOLS.json` artık kullanılmamalıdır (sadece ilk seed için).
- Tüm CRUD işlemleri **Prisma ORM** üzerinden yapılmalı ve `/src/app/api/` altındaki rotalar kullanılmalıdır.
- Şema değişikliği yapıldığında `npx prisma generate` ve `npx prisma db push` komutları çalıştırılmalıdır.

### 4. Tasarım Sistemi (Soft & Pastel)
- Uygulama **"Soft & Pastel"** tasarım dilini takip eder.
- Neon ve yüksek kontrastlı renklerden kaçınılmalıdır.
- Yeni renk ekleniyorsa `globals.css` içindeki pastel değişkenlere (`--green`, `--cyan`, `--pink` vb.) sadık kalınmalıdır.
- **İkonlar:** 30px boyutunda ve `image-rendering: pixelated` özelliğine sahip olmalıdır.

### 5. I18n ve Yerelleştirme
- Tüm kullanıcı arayüzü metinleri `src/lib/i18n.ts` içine eklenmeli ve `useLanguage` hook'u ile tüketilmelidir.
- Hardcoded metinlerden (TR veya EN) kaçınılmalıdır.

---

## 🛠️ Geliştirme İş Akışı

1. **Araştırma:** Bir değişiklik yapmadan önce mevcut hook (`src/hooks`) ve bileşen (`src/components`) yapılarını inceleyin.
2. **Hydration Güvenliği:** DOM manipülasyonu yapan işlemler (Service Worker, LocalStorage) her zaman `useEffect` içinde veya Client Component'lerde yapılmalıdır (`removeChild` hatalarını önlemek için).
3. **SEO:** Sayfa bazlı metadata güncellemeleri `layout.tsx` veya ilgili `page.tsx` içinden yönetilmelidir.

---

> [!TIP]
> Bu proje "Retro ama Modern" bir denge üzerine kuruludur. ASCII art ve pixel-art detaylarını korurken Next.js'in SSR ve API avantajlarını maksimum seviyede kullanın.
