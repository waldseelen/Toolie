import { prisma } from "../src/lib/prisma";

const CONCURRENCY_LIMIT = 10;
const REQUEST_TIMEOUT_MS = 15000;

interface LinkCheckResult {
  id: string;
  name: string;
  statusCode: number | null;
  isBroken: boolean;
  checkedAt: Date;
}

function createTimeoutSignal(timeoutMs: number): AbortSignal {
  const controller = new AbortController();
  setTimeout(() => controller.abort(), timeoutMs);
  return controller.signal;
}

async function fetchStatus(link: string): Promise<number> {
  const baseOptions: RequestInit = {
    redirect: "follow",
    signal: createTimeoutSignal(REQUEST_TIMEOUT_MS),
    headers: {
      "user-agent": "ToolieLinkChecker/1.0",
    },
  };

  let response = await fetch(link, { ...baseOptions, method: "HEAD" });

  if (response.status === 405) {
    response = await fetch(link, { ...baseOptions, method: "GET" });
  }

  return response.status;
}

async function runWithConcurrency<T>(
  items: T[],
  worker: (item: T) => Promise<void>
) {
  let index = 0;

  const runners = Array.from(
    { length: Math.min(CONCURRENCY_LIMIT, items.length) },
    async () => {
      while (index < items.length) {
        const currentIndex = index;
        index += 1;
        await worker(items[currentIndex]);
      }
    }
  );

  await Promise.all(runners);
}

async function main() {
  const tools = await prisma.tool.findMany({
    select: {
      id: true,
      name: true,
      link: true,
    },
  });

  const results: LinkCheckResult[] = [];

  await runWithConcurrency(tools, async (tool) => {
    const checkedAt = new Date();

    try {
      const statusCode = await fetchStatus(tool.link);
      const isBroken = statusCode >= 400;

      await prisma.tool.update({
        where: { id: tool.id },
        data: {
          lastCheckedAt: checkedAt,
          lastStatusCode: statusCode,
          isBroken,
        },
      });

      results.push({
        id: tool.id,
        name: tool.name,
        statusCode,
        isBroken,
        checkedAt,
      });
    } catch {
      await prisma.tool.update({
        where: { id: tool.id },
        data: {
          lastCheckedAt: checkedAt,
          lastStatusCode: null,
          isBroken: true,
        },
      });

      results.push({
        id: tool.id,
        name: tool.name,
        statusCode: null,
        isBroken: true,
        checkedAt,
      });
    }
  });

  const brokenCount = results.filter((result) => result.isBroken).length;

  console.table(
    results.map((result) => ({
      name: result.name,
      statusCode: result.statusCode ?? "ERR",
      broken: result.isBroken ? "yes" : "no",
      checkedAt: result.checkedAt.toISOString(),
    }))
  );

  console.log(
    `Checked ${results.length} links. Healthy: ${results.length - brokenCount}. Broken: ${brokenCount}.`
  );
}

main()
  .catch((error) => {
    console.error("Link health check failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
