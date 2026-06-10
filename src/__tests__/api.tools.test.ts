import { beforeEach, describe, expect, it, vi } from "vitest";

const { mockDb } = vi.hoisted(() => ({
  mockDb: {
    getCategoriesWithSubcategoriesAndTools: vi.fn(),
    createTool: vi.fn(),
    deleteTool: vi.fn(),
    getToolById: vi.fn(),
    getAllTags: vi.fn(),
    getNextSortOrder: vi.fn(),
  },
}));

vi.mock("@/lib/db", () => mockDb);

const mockDoc = vi.fn();
const mockCollection = vi.fn(() => ({
  doc: mockDoc,
  get: vi.fn().mockResolvedValue({ docs: [] }),
}));

vi.mock("@/lib/firebase", () => ({
  getDb: vi.fn(() => ({
    collection: mockCollection,
  })),
}));

vi.mock("@/lib/translate", () => ({
  translateTextToEnglish: vi.fn(),
}));

import { GET, POST } from "@/app/api/tools/route";
import { DELETE } from "@/app/api/tools/[id]/route";

describe("tools api routes", () => {
  beforeEach(() => {
    mockDb.getCategoriesWithSubcategoriesAndTools.mockReset();
    mockDb.createTool.mockReset();
    mockDb.deleteTool.mockReset();
    mockDb.getToolById.mockReset();
    mockDb.getAllTags.mockReset();
    mockDb.getNextSortOrder.mockReset();
    mockDoc.mockReset();
  });

  it("returns the expected GET /api/tools shape", async () => {
    mockDb.getCategoriesWithSubcategoriesAndTools.mockResolvedValue([
      {
        id: "cat-1",
        name: "GENERAL",
        subcategories: [
          {
            id: "sub-1",
            tools: [
              {
                id: "tool-1",
                name: "Notion",
                tags: [{ id: "tag-1", name: "API", slug: "api" }],
              },
            ],
          },
        ],
      },
    ]);

    const response = await GET(new Request("http://localhost/api/tools?tag=api"));
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data[0].subcategories[0].tools[0]).toMatchObject({
      id: "tool-1",
      name: "Notion",
      tags: [{ id: "tag-1", name: "API", slug: "api" }],
    });
  });

  it("returns 400 from POST /api/tools when required fields are missing", async () => {
    const response = await POST(
      new Request("http://localhost/api/tools", {
        method: "POST",
        body: JSON.stringify({ name: "Notion" }),
        headers: { "Content-Type": "application/json" },
      })
    );

    expect(response.status).toBe(400);
  });

  it("returns 404 from DELETE /api/tools/[id] for unknown ids", async () => {
    mockDb.getToolById.mockResolvedValue(null);

    const response = await DELETE(new Request("http://localhost/api/tools/missing"), {
      params: Promise.resolve({ id: "missing" }),
    });

    expect(response.status).toBe(404);
  });
});
