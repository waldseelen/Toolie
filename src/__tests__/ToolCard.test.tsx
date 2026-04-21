import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ToolCard } from "@/components/ToolCard/ToolCard";
import type { TranslationKey } from "@/lib/i18n";

function t(key: TranslationKey) {
  return key;
}

describe("ToolCard", () => {
  const tool = {
    id: "tool-1",
    name: "Notion",
    slug: "notion",
    link: "https://www.notion.so",
    description: "Workspace",
    descriptionEn: "Workspace",
    faviconUrl: null,
    tags: [],
  };

  it("renders the tool name and links to the detail page", () => {
    render(
      <ToolCard
        tool={tool}
        locale="en"
        accentColor="var(--green)"
        isFavorite={false}
        onToggleFavorite={vi.fn()}
        t={t}
      />
    );

    expect(screen.getByText("Notion")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /notion/i })).toHaveAttribute(
      "href",
      "/tool/notion"
    );
  });

  it("calls onToggleFavorite with the correct id", () => {
    const onToggleFavorite = vi.fn();

    render(
      <ToolCard
        tool={tool}
        locale="en"
        accentColor="var(--green)"
        isFavorite={false}
        onToggleFavorite={onToggleFavorite}
        t={t}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: /notion addfavorite/i }));

    expect(onToggleFavorite).toHaveBeenCalledWith("tool-1");
  });
});
