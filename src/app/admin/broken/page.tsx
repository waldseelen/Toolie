import Link from "next/link";
import { getBrokenTools } from "@/lib/db";
import styles from "@/styles/admin.module.css";

export default async function AdminBrokenToolsPage() {
  const tools = await getBrokenTools();

  return (
    <section>
      <h2 className={styles.sectionTitle}>Broken Links ({tools.length})</h2>
      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Name</th>
              <th>Taxonomy</th>
              <th>Status</th>
              <th>Last Checked</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {tools.map((tool) => (
              <tr key={tool.id}>
                <td>{tool.name}</td>
                <td className={styles.dim}>
                  {tool.subcategory?.category?.name || "GENERAL"} / {tool.subcategory?.name || "GENERAL"}
                </td>
                <td className={styles.statusBroken}>
                  {tool.lastStatusCode ?? "ERR"}
                </td>
                <td className={styles.dim}>
                  {tool.lastCheckedAt
                    ? new Date(tool.lastCheckedAt).toLocaleString()
                    : "Never"}
                </td>
                <td>
                  <div className={styles.actions}>
                    <a
                      href={tool.link}
                      target="_blank"
                      rel="noreferrer"
                      className={styles.link}
                    >
                      Visit
                    </a>
                    <Link href={`/admin/tools/${tool.id}/edit`} className={styles.navLink}>
                      Edit
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

