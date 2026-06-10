import type { Metadata } from "next";
import { getToolById } from "@/lib/db";
import { getRequestLocale } from "@/lib/request-locale";
import { absoluteUrl } from "@/lib/site";
import { splitPlatforms } from "@/lib/tool-data";
import { ComparePageClient } from "@/components/ComparePageClient/ComparePageClient";
import styles from "./ComparePage.module.css";
import type { ToolData } from "@/lib/types";

interface ComparePageProps {
  searchParams: Promise<{ ids?: string }>;
}

export const metadata: Metadata = {
  title: "Compare Tools — TOOLIE",
};

export default async function ComparePage({ searchParams }: ComparePageProps) {
  const locale = await getRequestLocale();
  const { ids = "" } = await searchParams;
  const requestedIds = ids
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean)
    .slice(0, 4);

  const toolsRaw = await Promise.all(
    requestedIds.map((id) => getToolById(id))
  );
  const tools = toolsRaw.filter(Boolean) as ToolData[];

  const compareUrl = absoluteUrl(`/compare?ids=${requestedIds.join(",")}`);


  return (
    <main className={styles.page}>
      <div className={styles.header}>
        <div>
          <p className={styles.eyebrow}>
            {locale === "en" ? "COMPARE" : "KARSILASTIR"}
          </p>
          <h1 className={styles.title}>
            {locale === "en" ? "Tool Comparison" : "Araç Karşılaştırması"}
          </h1>
        </div>
        <ComparePageClient locale={locale} url={compareUrl} />
      </div>

      {tools.length > 0 ? (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th className={`${styles.cell} ${styles.headCell}`}>
                  {locale === "en" ? "Field" : "Alan"}
                </th>
                {tools.map((tool) => (
                  <th
                    key={tool.id}
                    className={`${styles.cell} ${styles.toolHead}`}
                  >
                    {tool.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                {
                  label: locale === "en" ? "Pricing" : "Fiyatlandırma",
                  values: tools.map((tool) => tool.pricingModel || "-"),
                },
                {
                  label: locale === "en" ? "Platforms" : "Platformlar",
                  values: tools.map((tool) => splitPlatforms(tool.platforms).join(", ") || "-"),
                },
                {
                  label: locale === "en" ? "Has API" : "API Var",
                  values: tools.map((tool) => (tool.hasApi ? "Yes" : "No")),
                },
                {
                  label: locale === "en" ? "Open Source" : "Açık Kaynak",
                  values: tools.map((tool) => (tool.isOpenSource ? "Yes" : "No")),
                },
                {
                  label: locale === "en" ? "Description" : "Açıklama",
                  values: tools.map((tool) =>
                    locale === "en"
                      ? tool.descriptionEn || tool.description
                      : tool.description
                  ),
                },
              ].map((row) => (
                <tr key={row.label}>
                  <td className={`${styles.cell} ${styles.headCell}`}>
                    {row.label}
                  </td>
                  {row.values.map((value, index) => (
                    <td key={`${row.label}-${tools[index].id}`} className={styles.cell}>
                      {value}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className={styles.empty}>
          {locale === "en"
            ? "Select up to four tools to compare."
            : "Karşılaştırmak için en fazla dört araç seçin."}
        </p>
      )}
    </main>
  );
}
