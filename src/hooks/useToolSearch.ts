"use client";

import { useEffect, useMemo, useState } from "react";
import MiniSearch from "minisearch";
import type { ToolData } from "@/lib/types";

interface SearchDocument {
  id: string;
  name: string;
  description: string;
  descriptionEn: string;
}

export function useToolSearch(tools: ToolData[]) {
  const [miniSearch, setMiniSearch] = useState<MiniSearch<SearchDocument> | null>(
    null
  );
  const [toolMap, setToolMap] = useState<Map<string, ToolData>>(new Map());

  useEffect(() => {
    const nextToolMap = new Map<string, ToolData>();
    const search = new MiniSearch<SearchDocument>({
      fields: ["name", "description", "descriptionEn"],
      storeFields: ["id"],
      searchOptions: {
        boost: { name: 3, description: 1, descriptionEn: 1 },
        prefix: true,
        fuzzy: 0.2,
      },
    });

    const documents = tools.map((tool) => {
      nextToolMap.set(tool.id, tool);
      return {
        id: tool.id,
        name: tool.name,
        description: tool.description,
        descriptionEn: tool.descriptionEn ?? "",
      };
    });

    search.addAll(documents);
    setMiniSearch(search);
    setToolMap(nextToolMap);
  }, [tools]);

  return useMemo(
    () => ({
      search(query: string): ToolData[] {
        const trimmedQuery = query.trim();

        if (!trimmedQuery) {
          return tools;
        }

        if (!miniSearch) {
          return [];
        }

        const results = miniSearch.search(trimmedQuery, {
          boost: { name: 3, description: 1, descriptionEn: 1 },
          prefix: true,
          fuzzy: 0.2,
        });

        return results
          .map((result) => toolMap.get(String(result.id)))
          .filter((tool): tool is ToolData => Boolean(tool));
      },
    }),
    [miniSearch, toolMap, tools]
  );
}
