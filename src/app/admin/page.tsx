import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { AdminLoginForm } from "@/components/Admin/AdminLoginForm";
import styles from "@/styles/admin.module.css";
import { ADMIN_SESSION_COOKIE, isValidAdminToken } from "@/lib/admin-auth";

export default async function AdminEntryPage() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;

  if (isValidAdminToken(sessionToken)) {
    redirect("/admin/tools");
  }

  return (
    <section className={styles.loginSection}>
      <h2 className={styles.sectionTitle}>Admin Access</h2>
      <p className={styles.dim}>
        Enter the configured admin token to access tool management.
      </p>
      <AdminLoginForm />
    </section>
  );
}
