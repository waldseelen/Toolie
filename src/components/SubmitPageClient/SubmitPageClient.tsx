"use client";

import { useState } from "react";
import { useLanguage } from "@/hooks/useLanguage";
import { TAXONOMY } from "@/lib/taxonomy";
import styles from "./SubmitPageClient.module.css";

export function SubmitPageClient() {
  const { locale, t } = useLanguage();
  const [formData, setFormData] = useState({
    name: "",
    link: "",
    description: "",
    categoryKey: "GENERAL",
  });
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">(
    "idle"
  );
  const [scraping, setScraping] = useState(false);
  const [scrapeError, setScrapeError] = useState("");

  const handleScrape = async () => {
    if (!formData.link) return;
    setScraping(true);
    setScrapeError("");
    try {
      const response = await fetch(`/api/scrape?url=${encodeURIComponent(formData.link)}`);
      if (!response.ok) {
        throw new Error("Scrape failed");
      }
      const data = await response.json();
      if (data.error) {
        throw new Error(data.error);
      }
      setFormData((previous) => ({
        ...previous,
        name: data.title || previous.name,
        description: data.description || previous.description,
      }));
    } catch (err) {
      const message = err instanceof Error ? err.message : "Autofill failed.";
      setScrapeError(message);
    } finally {
      setScraping(false);
    }
  };

  const copy = {
    title: locale === "en" ? "Submit a Tool" : "Araç Gönder",
    description:
      locale === "en"
        ? "Suggest a tool for review and possible inclusion in the catalog."
        : "Kataloğa eklenmesi için bir araç önerin.",
    name: locale === "en" ? "Name" : "İsim",
    link: locale === "en" ? "Link" : "Bağlantı",
    toolDescription: locale === "en" ? "Description" : "Açıklama",
    category: locale === "en" ? "Category Suggestion" : "Kategori Önerisi",
    submit: locale === "en" ? "Submit" : "Gönder",
    success:
      locale === "en"
        ? "Submission received. It will appear in the admin review queue."
        : "Gönderim alındı. Yönetici inceleme kuyruğuna eklendi.",
    error:
      locale === "en"
        ? "Submission failed. Please try again."
        : "Gönderim başarısız oldu. Tekrar deneyin.",
  };

  return (
    <main className={styles.page}>
      <h1 className={styles.title}>{copy.title}</h1>
      <p className={styles.copy}>{copy.description}</p>
      <form
        className={styles.form}
        onSubmit={async (event) => {
          event.preventDefault();
          setStatus("saving");

          const response = await fetch("/api/submissions", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(formData),
          });

          setStatus(response.ok ? "saved" : "error");
          if (response.ok) {
            setFormData({
              name: "",
              link: "",
              description: "",
              categoryKey: "GENERAL",
            });
          }
        }}
      >
        <label className={styles.field}>
          <span>{copy.name}</span>
          <input
            className={styles.input}
            value={formData.name}
            onChange={(event) =>
              setFormData((previous) => ({ ...previous, name: event.target.value }))
            }
          />
        </label>
        <label className={styles.field}>
          <span>{copy.link}</span>
          <div className={styles.linkRow}>
            <input
              type="url"
              className={styles.input}
              value={formData.link}
              onChange={(event) =>
                setFormData((previous) => ({ ...previous, link: event.target.value }))
              }
              placeholder="https://..."
            />
            <button
              type="button"
              className={styles.scrapeBtn}
              onClick={handleScrape}
              disabled={scraping || !formData.link}
            >
              {scraping ? t("autoFillLoading") : t("autoFillButton")}
            </button>
          </div>
          {scrapeError && <span className={styles.scrapeError}>{scrapeError}</span>}
        </label>
        <label className={styles.field}>
          <span>{copy.toolDescription}</span>
          <textarea
            className={styles.textarea}
            value={formData.description}
            onChange={(event) =>
              setFormData((previous) => ({
                ...previous,
                description: event.target.value,
              }))
            }
          />
        </label>
        <label className={styles.field}>
          <span>{copy.category}</span>
          <select
            className={styles.select}
            value={formData.categoryKey}
            onChange={(event) =>
              setFormData((previous) => ({
                ...previous,
                categoryKey: event.target.value,
              }))
            }
            style={{ padding: "0.75rem", border: "1px solid var(--border-dim)", background: "var(--card-bg)", color: "var(--text)" }}
          >
            {TAXONOMY.map((category) => (
              <option key={category.key} value={category.key}>
                {locale === "en" ? category.nameEn : category.nameTr}
              </option>
            ))}
          </select>
        </label>
        <button
          className={styles.button}
          type="submit"
          disabled={status === "saving"}
        >
          {copy.submit}
        </button>
        {status === "saved" && <p className={styles.success}>{copy.success}</p>}
        {status === "error" && <p className={styles.error}>{copy.error}</p>}
      </form>
    </main>
  );
}
