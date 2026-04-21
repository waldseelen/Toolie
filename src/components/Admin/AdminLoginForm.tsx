"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "@/styles/admin.module.css";

export function AdminLoginForm() {
  const router = useRouter();
  const [token, setToken] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <form
      className={styles.loginForm}
      onSubmit={async (event) => {
        event.preventDefault();
        setIsSubmitting(true);
        setError(null);

        try {
          const response = await fetch("/api/admin/session", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ token }),
          });

          if (!response.ok) {
            const data = (await response.json().catch(() => null)) as
              | { error?: string }
              | null;
            throw new Error(data?.error || "Login failed");
          }

          router.replace("/admin/tools");
          router.refresh();
        } catch (caughtError) {
          setError(
            caughtError instanceof Error
              ? caughtError.message
              : "Login failed"
          );
        } finally {
          setIsSubmitting(false);
        }
      }}
    >
      <label className={styles.field}>
        <span className={styles.label}>Admin Token</span>
        <input
          type="password"
          value={token}
          onChange={(event) => setToken(event.target.value)}
          className={styles.input}
          placeholder="Enter admin token"
          autoComplete="off"
        />
      </label>

      <button
        type="submit"
        className={`${styles.button} ${styles.primaryButton}`}
        disabled={isSubmitting}
      >
        {isSubmitting ? "Signing In..." : "Sign In"}
      </button>

      {error ? <p className={styles.errorText}>{error}</p> : null}
    </form>
  );
}
