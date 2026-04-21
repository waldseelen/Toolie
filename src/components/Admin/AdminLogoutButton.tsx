"use client";

import { useRouter } from "next/navigation";
import styles from "@/styles/admin.module.css";

export function AdminLogoutButton() {
  const router = useRouter();

  return (
    <button
      type="button"
      className={styles.navButton}
      onClick={async () => {
        await fetch("/api/admin/session", { method: "DELETE" });
        router.replace("/admin");
        router.refresh();
      }}
    >
      Sign Out
    </button>
  );
}
