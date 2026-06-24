import styles from "./Footer.module.css";
import type { TranslationKey } from "@/lib/i18n";

interface FooterProps {
  t: (key: TranslationKey) => string;
}

export function Footer({ t }: FooterProps) {
  return (
    <footer className={styles.footer}>
      <div>
        <span>TOOLIE v1.0</span> — {t("footerText")} — <span>2026</span>
      </div>
      {process.env.NODE_ENV === "development" && (
        <div style={{ marginTop: "1rem" }}>
          <a href="/admin/tools" style={{ color: "var(--accent-color)", textDecoration: "none", fontSize: "0.875rem", fontWeight: 500 }}>
            Admin Panel
          </a>
        </div>
      )}
    </footer>
  );
}
