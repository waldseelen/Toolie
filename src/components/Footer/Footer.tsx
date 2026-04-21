import styles from "./Footer.module.css";
import type { TranslationKey } from "@/lib/i18n";

interface FooterProps {
  t: (key: TranslationKey) => string;
}

export function Footer({ t }: FooterProps) {
  return (
    <footer className={styles.footer}>
      <div>
        <span>[</span> TOOLIE v1.0 <span>]</span> — {t("footerText")} — <span>2025</span>
      </div>
      {process.env.NODE_ENV === "development" && (
        <div style={{ marginTop: "1rem" }}>
          <a href="/admin/tools" style={{ color: "var(--yellow)", textDecoration: "none", fontSize: "0.875rem", fontFamily: "var(--font-pixel)" }}>
            [ ADMIN ]
          </a>
        </div>
      )}
    </footer>
  );
}
