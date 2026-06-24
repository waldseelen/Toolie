import { SpeedInsights } from '@vercel/speed-insights/next'
import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "@/styles/globals.css";
import { ServiceWorkerRegister } from "@/components/ServiceWorkerRegister";
import { siteUrl } from "@/lib/site";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "TOOLIE — Modern AI & Geliştirici Araçları Kataloğu",
  description:
    "AI asistanları, geliştirici araçları, tasarım ve üretkenlik uygulamaları için premium bento tasarımına sahip modern araç kataloğu.",
  keywords: [
    "araç kataloğu",
    "AI araçları",
    "geliştirici araçları",
    "tasarım araçları",
    "bento UI",
    "premium SaaS",
  ],
  authors: [{ name: "Toolie" }],
  openGraph: {
    title: "TOOLIE — Modern AI & Geliştirici Araçları Kataloğu",
    description:
      "Modern bento tasarımlı premium AI ve geliştirici araçları kataloğu.",
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
    <html lang="tr" data-theme="dark" data-crt="off" data-high-contrast="off" suppressHydrationWarning>
      <head>
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
                  
                  var crt = localStorage.getItem('toolie-crt');
                  if (crt === 'on') {
                    document.documentElement.setAttribute('data-crt', 'on');
                  } else {
                    document.documentElement.setAttribute('data-crt', 'off');
                  }

                  var hc = localStorage.getItem('toolie-high-contrast');
                  if (hc === 'on') {
                    document.documentElement.setAttribute('data-high-contrast', 'on');
                  } else {
                    document.documentElement.setAttribute('data-high-contrast', 'off');
                  }

                  var lang = localStorage.getItem('toolie-lang');
                  if (lang === 'tr' || lang === 'en') {
                    document.documentElement.setAttribute('lang', lang);
                  }
                } catch(e) {}
              })();
            `,
          }}
        />
      </head>
      <body className={`${inter.variable} ${jetbrainsMono.variable}`} suppressHydrationWarning>
        <a href="#main-content" className="skipLink">
          İçeriğe geç / Skip to content
        </a>
        {children}
        <ServiceWorkerRegister />
        <SpeedInsights />
      </body>
    </html>
  );
}
