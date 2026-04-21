import { prisma } from "@/lib/prisma";
import styles from "@/styles/admin.module.css";
import { SubmissionActions } from "@/components/SubmissionActions/SubmissionActions";

export default async function AdminSubmissionsPage() {
  const submissions = await prisma.submission.findMany({
    where: { status: "pending" },
    orderBy: { submittedAt: "desc" },
  });

  return (
    <section>
      <h2 className={styles.sectionTitle}>Pending Submissions ({submissions.length})</h2>
      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Name</th>
              <th>Category Suggestion</th>
              <th>Submitted</th>
              <th>Description</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {submissions.map((submission) => (
              <tr key={submission.id}>
                <td>
                  <div>{submission.name}</div>
                  <a href={submission.link} target="_blank" rel="noreferrer" className={styles.link}>
                    {submission.link}
                  </a>
                </td>
                <td className={styles.dim}>{submission.categoryKey || "GENERAL"}</td>
                <td className={styles.dim}>{submission.submittedAt.toLocaleString()}</td>
                <td>{submission.description}</td>
                <td>
                  <div className={styles.actions}>
                    <SubmissionActions submissionId={submission.id} />
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
