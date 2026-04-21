import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { SearchBar } from "@/components/SearchBar/SearchBar";
import type { TranslationKey } from "@/lib/i18n";

function t(key: TranslationKey) {
  return key;
}

describe("SearchBar", () => {
  it("calls onChange with typed value", () => {
    const onChange = vi.fn();

    render(<SearchBar value="" onChange={onChange} t={t} />);

    fireEvent.change(screen.getByRole("searchbox"), {
      target: { value: "notion" },
    });

    expect(onChange).toHaveBeenCalledWith("notion");
  });

  it("focuses the input on Ctrl+K", () => {
    render(<SearchBar value="" onChange={vi.fn()} t={t} />);

    const input = screen.getByRole("searchbox");
    fireEvent.keyDown(document, { key: "k", ctrlKey: true });

    expect(input).toHaveFocus();
  });
});
