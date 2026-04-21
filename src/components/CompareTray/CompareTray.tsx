"use client";

import Link from "next/link";
import styles from "./CompareTray.module.css";
import type { TranslationKey } from "@/lib/i18n";
import type { ToolData } from "@/lib/types";

interface CompareTrayProps {
  comparedTools: ToolData[];
  onClear: () => void;
  t: (key: TranslationKey) => string;
}

export function CompareTray({
  comparedTools,
  onClear,
  t,
}: CompareTrayProps) {
  if (comparedTools.length === 0) {
    return null;
  }

  const compareUrl = `/compare?ids=${comparedTools.map((tool) => tool.id).join(",")}`;

  return (
    <aside className={styles.tray} aria-label={t("compareTrayTitle")}>
      <h2 className={styles.title}>{t("compareTrayTitle")}</h2>
      <div className={styles.list}>
        {comparedTools.map((tool) => (
          <span key={tool.id} className={styles.item}>
            {tool.name}
          </span>
        ))}
      </div>
      <div className={styles.actions}>
        <button type="button" className={styles.button} onClick={onClear}>
          {t("clearCompare")}
        </button>
        <Link href={compareUrl} className={`${styles.button} ${styles.primary}`}>
          {t("compareAction")}
        </Link>
      </div>
    </aside>
  );
}
