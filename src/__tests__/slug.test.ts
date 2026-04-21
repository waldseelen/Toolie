import { describe, expect, it } from "vitest";
import { createUniqueSlug, slugify } from "@/lib/slug";

describe("slug utilities", () => {
  it("replaces spaces with hyphens", () => {
    expect(slugify("  Hello   World  ")).toBe("hello-world");
  });

  it("strips special characters", () => {
    expect(slugify("Figma!!! + AI?")).toBe("figma-ai");
  });

  it("normalizes Turkish characters", () => {
    expect(slugify("Çığ ÖŞÜ İı")).toBe("cig-osu-ii");
  });

  it("deduplicates with numeric suffixes", () => {
    expect(
      createUniqueSlug("Notion", new Set(["notion", "notion-2"]))
    ).toBe("notion-3");
  });
});
