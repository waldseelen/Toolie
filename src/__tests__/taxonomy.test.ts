import { describe, expect, it } from "vitest";
import { getLocalizedName } from "@/lib/taxonomy";

describe("getLocalizedName", () => {
  it("returns Turkish name for tr locale", () => {
    expect(getLocalizedName("tr", "Turkce", "English", "Fallback")).toBe(
      "Turkce"
    );
  });

  it("returns English name for en locale", () => {
    expect(getLocalizedName("en", "Turkce", "English", "Fallback")).toBe(
      "English"
    );
  });

  it("falls back when localized value is null", () => {
    expect(getLocalizedName("en", "Turkce", null, "Fallback")).toBe(
      "Fallback"
    );
  });
});
