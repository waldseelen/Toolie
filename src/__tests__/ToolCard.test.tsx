import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ToolCard } from "@/components/ToolCard/ToolCard";

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
        accentColor="#000000"
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
        accentColor="var(--green)"
      />
    );

    fireEvent.click(screen.getByRole("button", { name: /notion addfavorite/i }));

    expect(onToggleFavorite).toHaveBeenCalledWith("tool-1");
  });
});
