import { Prisma } from "@prisma/client";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { mockPrisma } = vi.hoisted(() => ({
  mockPrisma: {
    category: {
      findMany: vi.fn(),
    },
    subcategory: {
      findUnique: vi.fn(),
    },
    tool: {
      aggregate: vi.fn(),
      create: vi.fn(),
      delete: vi.fn(),
    },
  },
}));

vi.mock("@/lib/prisma", () => ({
  prisma: mockPrisma,
}));

vi.mock("@/lib/translate", () => ({
  translateTextToEnglish: vi.fn(),
}));

import { GET, POST } from "@/app/api/tools/route";
import { DELETE } from "@/app/api/tools/[id]/route";

describe("tools api routes", () => {
  beforeEach(() => {
    mockPrisma.category.findMany.mockReset();
    mockPrisma.subcategory.findUnique.mockReset();
    mockPrisma.tool.aggregate.mockReset();
    mockPrisma.tool.create.mockReset();
    mockPrisma.tool.delete.mockReset();
  });

  it("returns the expected GET /api/tools shape", async () => {
    mockPrisma.category.findMany.mockResolvedValue([
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
    mockPrisma.tool.delete.mockRejectedValue(
      new Prisma.PrismaClientKnownRequestError("Missing tool", {
        code: "P2025",
        clientVersion: "test",
      })
    );

    const response = await DELETE(new Request("http://localhost/api/tools/missing"), {
      params: Promise.resolve({ id: "missing" }),
    });

    expect(response.status).toBe(404);
  });
});
