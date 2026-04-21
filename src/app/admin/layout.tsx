import React from "react";
import Link from "next/link";
import type { Metadata } from "next";
import styles from "@/styles/admin.module.css";
import { AdminLogoutButton } from "@/components/Admin/AdminLogoutButton";

export const metadata: Metadata = {
  title: "Admin Panel — TOOLIE",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.heading}>
          [ TOOLIE ADMIN ]
        </h1>
        <nav className={styles.nav}>
          <Link href="/" className={styles.navLink}>← Back to Site</Link>
          <Link href="/admin/tools" className={styles.navLink}>Manage Tools</Link>
          <Link href="/admin/broken" className={styles.navLink}>Broken Links</Link>
          <Link href="/admin/submissions" className={styles.navLink}>Submissions</Link>
          <AdminLogoutButton />
        </nav>
      </header>
      <main>{children}</main>
    </div>
  );
}
