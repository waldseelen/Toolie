export type SupportedLocale = "tr" | "en";

export interface SubcategoryTaxonomy {
  oldName: string;
  key: string;
  slug: string;
  nameTr: string;
  nameEn: string;
}

export interface CategoryTaxonomy {
  key: string;
  slug: string;
  icon: string;
  color: string;
  nameTr: string;
  nameEn: string;
  subcategories: SubcategoryTaxonomy[];
}

export const TAXONOMY: CategoryTaxonomy[] = [
  {
    key: "GENERAL",
    slug: "general-use-ai",
    icon: "◈",
    color: "#39ff14",
    nameTr: "Genel Kullanım & AI",
    nameEn: "General Use & AI",
    subcategories: [
      {
        oldName: "Genel AI Platformları",
        key: "ai-platforms",
        slug: "general-ai-platforms",
        nameTr: "AI Asistanları & Platformlar",
        nameEn: "AI Assistants & Platforms",
      },
      {
        oldName: "Verimlilik & İş",
        key: "productivity-office",
        slug: "general-productivity-office",
        nameTr: "Verimlilik & Ofis",
        nameEn: "Productivity & Office",
      },
      {
        oldName: "Yazı & İçerik",
        key: "writing-content-translation",
        slug: "general-writing-content-translation",
        nameTr: "Yazı, İçerik & Çeviri",
        nameEn: "Writing, Content & Translation",
      },
      {
        oldName: "Elektrik, Elektronik & Robotik",
        key: "engineering-robotics",
        slug: "general-engineering-robotics",
        nameTr: "Mühendislik & Robotik",
        nameEn: "Engineering & Robotics",
      },
      {
        oldName: "Keşif & Karşılaştırma",
        key: "discovery-comparison",
        slug: "general-discovery-comparison",
        nameTr: "Tool Keşfi & Karşılaştırma",
        nameEn: "Tool Discovery & Comparison",
      },
      {
        oldName: "Haber & Teknoloji",
        key: "tech-news",
        slug: "general-tech-news",
        nameTr: "Teknoloji Haberleri",
        nameEn: "Tech News",
      },
      {
        oldName: "Sağlık & Wellness",
        key: "health-wellness",
        slug: "general-health-wellness",
        nameTr: "Sağlık & İyi Yaşam",
        nameEn: "Health & Wellness",
      },
      {
        oldName: "Finans & Bütçe",
        key: "finance-budget",
        slug: "general-finance-budget",
        nameTr: "Finans & Bütçe",
        nameEn: "Finance & Budget",
      },
      {
        oldName: "Freelance & İş",
        key: "career-freelance",
        slug: "general-career-freelance",
        nameTr: "Kariyer & Freelance",
        nameEn: "Career & Freelance",
      },
    ],
  },
  {
    key: "SOURCES",
    slug: "resources-research",
    icon: "◉",
    color: "#00d4ff",
    nameTr: "Kaynaklar & Araştırma",
    nameEn: "Resources & Research",
    subcategories: [
      {
        oldName: "Akademik & Araştırma",
        key: "academic-research",
        slug: "sources-academic-research",
        nameTr: "Akademik Araştırma",
        nameEn: "Academic Research",
      },
      {
        oldName: "Akademik & Çalışma",
        key: "learning-study",
        slug: "sources-learning-study",
        nameTr: "Öğrenme & Çalışma",
        nameEn: "Learning & Study",
      },
      {
        oldName: "Araştırma & Dataset",
        key: "datasets-data-sources",
        slug: "sources-datasets-data-sources",
        nameTr: "Dataset & Veri Kaynakları",
        nameEn: "Datasets & Data Sources",
      },
      {
        oldName: "Kitap & PDF Kaynakları",
        key: "books-pdfs-libraries",
        slug: "sources-books-pdfs-libraries",
        nameTr: "Kitap, PDF & Kütüphaneler",
        nameEn: "Books, PDFs & Libraries",
      },
    ],
  },
  {
    key: "DESIGN",
    slug: "design-visual",
    icon: "◆",
    color: "#ff6bff",
    nameTr: "Tasarım & Görsel",
    nameEn: "Design & Visual",
    subcategories: [
      {
        oldName: "AI Görsel Üretimi",
        key: "ai-image-generation",
        slug: "design-ai-image-generation",
        nameTr: "AI Görsel Üretimi",
        nameEn: "AI Image Generation",
      },
      {
        oldName: "Tasarım & Medya",
        key: "design-tools",
        slug: "design-tools",
        nameTr: "Tasarım Araçları",
        nameEn: "Design Tools",
      },
    ],
  },
  {
    key: "MEDIA",
    slug: "video-audio-media",
    icon: "◎",
    color: "#ff6b35",
    nameTr: "Video, Ses & Medya",
    nameEn: "Video, Audio & Media",
    subcategories: [
      {
        oldName: "Video & Animasyon",
        key: "video-animation",
        slug: "media-video-animation",
        nameTr: "Video & Animasyon",
        nameEn: "Video & Animation",
      },
      {
        oldName: "Ses, Müzik & Podcast",
        key: "audio-music-podcast",
        slug: "media-audio-music-podcast",
        nameTr: "Ses, Müzik & Podcast",
        nameEn: "Audio, Music & Podcast",
      },
      {
        oldName: "Medya & Playlist Araçları",
        key: "playlist-media-utilities",
        slug: "media-playlist-media-utilities",
        nameTr: "Playlist & Medya Yardımcıları",
        nameEn: "Playlist & Media Utilities",
      },
    ],
  },
  {
    key: "DEVELOP",
    slug: "development-automation",
    icon: "◑",
    color: "#ffdd00",
    nameTr: "Geliştirme & Otomasyon",
    nameEn: "Development & Automation",
    subcategories: [
      {
        oldName: "Kodlama & Geliştirme",
        key: "coding-tools",
        slug: "develop-coding-tools",
        nameTr: "Kodlama Araçları",
        nameEn: "Coding Tools",
      },
      {
        oldName: "No-Code & Builder",
        key: "no-code-builder",
        slug: "develop-no-code-builder",
        nameTr: "No-Code & Builder",
        nameEn: "No-Code & Builder",
      },
      {
        oldName: "Ajan & Model Geliştirme",
        key: "ai-agent-model-development",
        slug: "develop-ai-agent-model-development",
        nameTr: "AI Ajan & Model Geliştirme",
        nameEn: "AI Agent & Model Development",
      },
      {
        oldName: "Kodlama Öğrenme",
        key: "programming-learning",
        slug: "develop-programming-learning",
        nameTr: "Programlama Eğitimi",
        nameEn: "Programming Learning",
      },
    ],
  },
  {
    key: "CYBERSEC",
    slug: "cybersecurity",
    icon: "◒",
    color: "#ff2244",
    nameTr: "Siber Güvenlik",
    nameEn: "Cybersecurity",
    subcategories: [
      {
        oldName: "Genel",
        key: "security-tools-learning",
        slug: "cybersec-security-tools-learning",
        nameTr: "Güvenlik Araçları & Eğitim",
        nameEn: "Security Tools & Learning",
      },
    ],
  },
  {
    key: "SUPERUSER",
    slug: "system-power-user",
    icon: "◓",
    color: "#a0ff60",
    nameTr: "Sistem & Power User",
    nameEn: "System & Power User",
    subcategories: [
      {
        oldName: "Faydalı Siteler",
        key: "useful-web-utilities",
        slug: "superuser-useful-web-utilities",
        nameTr: "Faydalı Web Araçları",
        nameEn: "Useful Web Utilities",
      },
      {
        oldName: "Sistem & Yardımcı Araçlar",
        key: "system-utilities",
        slug: "superuser-system-utilities",
        nameTr: "Sistem Araçları",
        nameEn: "System Utilities",
      },
      {
        oldName: "Windows Optimizasyon",
        key: "windows-optimization",
        slug: "superuser-windows-optimization",
        nameTr: "Windows Optimizasyon",
        nameEn: "Windows Optimization",
      },
      {
        oldName: "GitHub & Açık Kaynak",
        key: "open-source-github",
        slug: "superuser-open-source-github",
        nameTr: "Açık Kaynak & GitHub",
        nameEn: "Open Source & GitHub",
      },
    ],
  },
];

export const TAXONOMY_BY_CATEGORY_KEY = Object.fromEntries(
  TAXONOMY.map((category) => [category.key, category])
);

export function getLocalizedName(
  locale: SupportedLocale,
  nameTr: string | null | undefined,
  nameEn: string | null | undefined,
  fallback: string
): string {
  if (locale === "en") {
    return nameEn || fallback;
  }

  return nameTr || fallback;
}
