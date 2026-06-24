import styles from "./Skeleton.module.css";

export function SkeletonGrid() {
  return (
    <div className={styles.skeletonWrapper} aria-busy="true" aria-label="Yükleniyor">
      {/* Fake category header */}
      <div className={styles.skeletonHeader}>
        <div className={styles.skeletonHeaderBar} />
      </div>

      {/* Fake subheader */}
      <div className={styles.skeletonSubHeader} />

      {/* Fake card grid */}
      <div className={styles.skeletonGrid}>
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className={styles.skeletonCard}>
            <div className={styles.skeletonInner}>
              <div className={styles.skeletonIcon} />
              <div className={styles.skeletonTitle} />
            </div>
            <div className={styles.skeletonText} />
            <div className={styles.skeletonTextShort} />
            <div className={styles.skeletonTags}>
              <div className={styles.skeletonTag} />
              <div className={styles.skeletonTag} />
            </div>
          </div>
        ))}
      </div>

      {/* Second subcategory */}
      <div className={styles.skeletonSubHeader} />
      <div className={styles.skeletonGrid}>
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className={styles.skeletonCard}>
            <div className={styles.skeletonInner}>
              <div className={styles.skeletonIcon} />
              <div className={styles.skeletonTitle} />
            </div>
            <div className={styles.skeletonText} />
            <div className={styles.skeletonTextShort} />
            <div className={styles.skeletonTags}>
              <div className={styles.skeletonTag} />
              <div className={styles.skeletonTag} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
