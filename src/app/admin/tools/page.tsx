import { getAllTools } from "@/lib/db";
import Link from "next/link";
import styles from "@/styles/admin.module.css";

export default async function AdminToolsPage() {
  const tools = await getAllTools();
  // Sort by createdAt desc for admin tools overview
  tools.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());

  return (
    <section>
      <div className={styles.header}>
        <h2 className={styles.sectionTitle}>Manage Tools ({tools.length})</h2>
        <div className={styles.actions}>
          <Link href="/admin/tools/new" className={styles.navLink}>
            Create Tool
          </Link>
          <Link href="/admin/broken" className={styles.navLink}>
            View Broken Links
          </Link>
        </div>
      </div>
      <div className={styles.tableWrap}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Name</th>
            <th>Category</th>
            <th>Featured</th>
            <th>Link</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {tools.map((tool) => (
            <tr key={tool.id}>
              <td>{tool.name}</td>
              <td className={styles.dim}>
                {tool.category?.name || "GENERAL"} &gt; {tool.subcategory?.name || "GENERAL"}
              </td>
              <td>
                {tool.featured ? (
                  <span className={styles.pill}>
                    ⭐ {tool.featuredLabel || "Featured"}
                  </span>
                ) : (
                  "-"
                )}
              </td>
              <td>
                <a href={tool.link} target="_blank" rel="noreferrer" className={styles.link}>
                  Visit
                </a>
              </td>
              <td>
                <Link href={`/admin/tools/${tool.id}/edit`} className={styles.navLink}>
                  Edit
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>
    </section>
  );
}

