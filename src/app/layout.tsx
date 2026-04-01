import type { Metadata, Viewport } from "next";
import "@/styles/globals.css";
import { ServiceWorkerRegister } from "@/components/ServiceWorkerRegister";

export const metadata: Metadata = {
  title: "TOOLIE v1.0 — Retro Araç Kataloğu",
  description:
    "378+ araç, 7 kategori, pixel-art tasarım. Kullanıcıların çeşitli araçlara hızlıca ulaşmasını sağlayan dinamik bir katalog sitesi.",
  keywords: [
    "araç kataloğu",
    "AI araçları",
    "geliştirici araçları",
    "tasarım araçları",
    "retro",
    "pixel art",
  ],
  authors: [{ name: "Toolie" }],
  openGraph: {
    title: "TOOLIE v1.0 — Retro Araç Kataloğu",
    description:
      "378+ araç, 7 kategori, pixel-art tasarım. Retro tarzda dinamik araç kataloğu.",
    type: "website",
    locale: "tr_TR",
  },
  manifest: "/manifest.json",
  icons: {
    icon: "/icons/icon-192.png",
    apple: "/icons/icon-192.png",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
    { media: "(prefers-color-scheme: light)", color: "#f0e6d3" },
  ],
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr" data-theme="dark" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var t = localStorage.getItem('toolie-theme');
                  if (t === 'light' || t === 'dark') {
                    document.documentElement.setAttribute('data-theme', t);
                  } else if (window.matchMedia('(prefers-color-scheme: light)').matches) {
                    document.documentElement.setAttribute('data-theme', 'light');
                  }
                } catch(e) {}
              })();
            `,
          }}
        />
      </head>
      <body suppressHydrationWarning>
        <a href="#main-content" className="skipLink">
          İçeriğe geç / Skip to content
        </a>
        {children}
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}
