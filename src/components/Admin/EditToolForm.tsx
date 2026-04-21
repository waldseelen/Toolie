"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./EditToolForm.module.css";
import {
  PRICING_MODE_VALUES,
  STATUS_VALUES,
} from "@/lib/tool-data";
import type { SubcategorySummaryData, TagData } from "@/lib/types";

interface ToolData {
  id: string;
  name: string;
  link: string;
  description: string;
  descriptionEn: string | null;
  subcategoryId: string;
  featured: boolean;
  featuredLabel?: string | null;
  pricingModel: string | null;
  platforms: string | null;
  hasApi?: boolean;
  isOpenSource?: boolean;
  officialDocsUrl?: string | null;
  githubUrl?: string | null;
  logoUrl?: string | null;
  status?: string;
  verified?: boolean;
  tags: TagData[];
}

interface SubcategoryOption extends SubcategorySummaryData {
  categoryName: string;
}

interface EditToolFormProps {
  mode: "create" | "edit";
  tool: ToolData;
  allTags: TagData[];
  allSubcategories: SubcategoryOption[];
}

export function EditToolForm({
  mode,
  tool,
  allTags,
  allSubcategories,
}: EditToolFormProps) {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: tool.name,
    link: tool.link,
    description: tool.description,
    descriptionEn: tool.descriptionEn || "",
    subcategoryId: tool.subcategoryId,
    featured: tool.featured,
    featuredLabel: tool.featuredLabel || "",
    pricingModel: tool.pricingModel || "",
    platforms: tool.platforms || "",
    hasApi: tool.hasApi || false,
    isOpenSource: tool.isOpenSource || false,
    officialDocsUrl: tool.officialDocsUrl || "",
    githubUrl: tool.githubUrl || "",
    logoUrl: tool.logoUrl || "",
    status: tool.status || "active",
    verified: tool.verified || false,
    tags: tool.tags.map(t => t.id)
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const endpoint = mode === "create" ? "/api/tools" : `/api/tools/${tool.id}`;
      const method = mode === "create" ? "POST" : "PUT";

      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      
      if (!res.ok) throw new Error("Failed to update tool");
      
      alert(mode === "create" ? "Tool created successfully!" : "Tool updated successfully!");
      router.push("/admin/tools");
      router.refresh();
    } catch (err) {
      alert("Error saving tool");
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const toggleTag = (tagId: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.includes(tagId) 
        ? prev.tags.filter(id => id !== tagId)
        : [...prev.tags, tagId]
    }));
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <div className={styles.grid}>
      <div className={styles.field}>
        <label className={styles.label}>Name</label>
        <input 
          className={styles.input}
          type="text" 
          value={formData.name} 
          onChange={e => setFormData({...formData, name: e.target.value})}
        />
      </div>

      <div className={styles.field}>
        <label className={styles.label}>Link</label>
        <input 
          className={styles.input}
          type="text" 
          value={formData.link} 
          onChange={e => setFormData({...formData, link: e.target.value})}
        />
      </div>

      <div className={`${styles.field} ${styles.fieldFull}`}>
        <label className={styles.label}>Subcategory</label>
        <select
          className={styles.select}
          value={formData.subcategoryId}
          onChange={(e) => setFormData({ ...formData, subcategoryId: e.target.value })}
        >
          <option value="">Select a subcategory</option>
          {allSubcategories.map((subcategory) => (
            <option key={subcategory.id} value={subcategory.id}>
              {subcategory.categoryName} / {subcategory.name}
            </option>
          ))}
        </select>
      </div>

      <div className={`${styles.field} ${styles.fieldFull}`}>
        <label className={styles.label}>Description (TR)</label>
        <textarea 
          className={styles.textarea}
          value={formData.description} 
          onChange={e => setFormData({...formData, description: e.target.value})}
        />
      </div>

      <div className={`${styles.field} ${styles.fieldFull}`}>
        <label className={styles.label}>Description (EN)</label>
        <textarea 
          className={styles.textarea}
          value={formData.descriptionEn} 
          onChange={e => setFormData({...formData, descriptionEn: e.target.value})}
        />
      </div>

      <div className={styles.field}>
          <label className={styles.label}>Pricing Model</label>
          <select 
            className={styles.select}
            value={formData.pricingModel} 
            onChange={e => setFormData({...formData, pricingModel: e.target.value})}
          >
            <option value="">None</option>
            {PRICING_MODE_VALUES.map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.field}>
          <label className={styles.label}>Platforms</label>
          <input 
            className={styles.input}
            type="text" 
            value={formData.platforms} 
            onChange={e => setFormData({...formData, platforms: e.target.value})}
            placeholder="web, mobile, desktop..."
          />
      </div>

      <div className={styles.field}>
        <label className={styles.label}>Featured Label</label>
        <input
          className={styles.input}
          type="text"
          value={formData.featuredLabel}
          onChange={(e) => setFormData({ ...formData, featuredLabel: e.target.value })}
          placeholder="Optional label for featured tools"
        />
      </div>

      <div className={styles.field}>
        <label className={styles.label}>Status</label>
        <select
          className={styles.select}
          value={formData.status}
          onChange={(e) => setFormData({ ...formData, status: e.target.value })}
        >
          {STATUS_VALUES.map((value) => (
            <option key={value} value={value}>
              {value}
            </option>
          ))}
        </select>
      </div>

      <div className={`${styles.field} ${styles.fieldFull}`}>
        <div className={styles.checkboxRow}>
        <label className={styles.checkbox}>
          <input 
            type="checkbox" 
            checked={formData.featured}
            onChange={e => setFormData({...formData, featured: e.target.checked})}
          />
          ⭐ Featured Tool
        </label>
        <label className={styles.checkbox}>
          <input
            type="checkbox"
            checked={formData.hasApi}
            onChange={(e) => setFormData({ ...formData, hasApi: e.target.checked })}
          />
          API Available
        </label>
        <label className={styles.checkbox}>
          <input
            type="checkbox"
            checked={formData.isOpenSource}
            onChange={(e) =>
              setFormData({ ...formData, isOpenSource: e.target.checked })
            }
          />
          Open Source
        </label>
        <label className={styles.checkbox}>
          <input
            type="checkbox"
            checked={formData.verified}
            onChange={(e) => setFormData({ ...formData, verified: e.target.checked })}
          />
          Verified
        </label>
        </div>
      </div>

      <div className={styles.field}>
        <label className={styles.label}>Official Docs URL</label>
        <input
          className={styles.input}
          type="url"
          value={formData.officialDocsUrl}
          onChange={(e) =>
            setFormData({ ...formData, officialDocsUrl: e.target.value })
          }
        />
      </div>

      <div className={styles.field}>
        <label className={styles.label}>GitHub URL</label>
        <input
          className={styles.input}
          type="url"
          value={formData.githubUrl}
          onChange={(e) => setFormData({ ...formData, githubUrl: e.target.value })}
        />
      </div>

      <div className={`${styles.field} ${styles.fieldFull}`}>
        <label className={styles.label}>Logo URL</label>
        <input
          className={styles.input}
          type="url"
          value={formData.logoUrl}
          onChange={(e) => setFormData({ ...formData, logoUrl: e.target.value })}
        />
        <span className={styles.hint}>
          Optional. Leave empty to keep using the generated favicon.
        </span>
      </div>

      <div className={`${styles.field} ${styles.fieldFull}`}>
        <label className={styles.label}>Tags</label>
        <div className={styles.tagGrid}>
          {allTags.map(tag => (
            <label key={tag.id} className={styles.tagOption}>
              <input 
                type="checkbox" 
                checked={formData.tags.includes(tag.id)}
                onChange={() => toggleTag(tag.id)}
              />
              {tag.name}
            </label>
          ))}
        </div>
      </div>
      </div>

      <div className={styles.actions}>
        <button 
          type="button"
          className={styles.button}
          onClick={() => router.push("/admin/tools")}
          disabled={isSaving}
        >
          Cancel
        </button>
        <button 
          type="submit" 
          disabled={isSaving}
          className={`${styles.button} ${styles.primaryButton}`}
        >
          {isSaving
            ? "Saving..."
            : mode === "create"
              ? "Create Tool"
              : "Save Changes"}
        </button>
      </div>
    </form>
  );
}
