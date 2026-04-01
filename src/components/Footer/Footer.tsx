import styles from "./Footer.module.css";
import type { TranslationKey } from "@/lib/i18n";

interface FooterProps {
  t: (key: TranslationKey) => string;
}

export function Footer({ t }: FooterProps) {
  return (
    <footer className={styles.footer}>
      <span>[</span> TOOLIE v1.0 <span>]</span> — {t("footerText")} — <span>2025</span>
    </footer>
  );
}
