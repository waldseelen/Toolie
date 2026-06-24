import { NextResponse } from 'next/server';
import { getAllToolsMinimal } from '@/lib/db';
import MiniSearch from 'minisearch';

interface MinimalTool {
  id: string;
  name: string;
  link: string;
  description?: string;
  descriptionEn?: string;
}

let cachedTools: MinimalTool[] | null = null;
let lastFetch = 0;
const CACHE_TTL = 3600 * 1000;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q');

  if (!q || q.trim() === '') {
    return NextResponse.json([]);
  }

  const now = Date.now();
  if (!cachedTools || now - lastFetch > CACHE_TTL) {
    cachedTools = await getAllToolsMinimal();
    lastFetch = now;
  }

  const search = new MiniSearch({
    fields: ['name', 'description', 'descriptionEn'],
    storeFields: ['id'],
    searchOptions: {
      boost: { name: 3, description: 1, descriptionEn: 1 },
      prefix: true,
      fuzzy: 0.2,
    },
  });

  const documents = cachedTools.map((tool) => ({
    id: tool.id,
    name: tool.name,
    description: tool.description || '',
    descriptionEn: tool.descriptionEn || '',
  }));

  search.addAll(documents);

  const results = search.search(q);
  const resultIds = results.map(r => String(r.id));
  
  return NextResponse.json(resultIds);
}
