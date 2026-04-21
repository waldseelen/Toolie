# TASKS — Toolie Project Roadmap

Updated: 2026-04-20
Status: Phase 3 COMPLETE. Roadmap complete.

---

## Completed: Phase 0 — Prisma Taxonomy Refactor ✅

All schema changes confirmed in `prisma/schema.prisma`:
- `Category`: `slug`, `nameTr`, `nameEn`, `icon`, `color`, `sortOrder`, `updatedAt`
- `Subcategory`: `key`, `slug`, `nameTr`, `nameEn`, `sortOrder`, `updatedAt`
- `Tool`: `sortOrder`

Taxonomy source of truth: `src/lib/taxonomy.ts`
Backfill scripts: `prisma/backfillTaxonomy.ts`, `prisma/backfillDescriptionEn.ts`

Remaining:
- [x] **P0-1** Verify `prisma/seed.ts` runs cleanly — it expects `TOOLS.json` which may be missing; confirm file exists or fix seed to use existing DB data
- [x] **P0-2** Switch from `prisma db push` to `prisma migrate dev`; generate named migration for current schema state
- [x] **P0-3** Add `"check-links"` placeholder to `package.json` scripts (implementation in P2-B)

---

## Phase 1 — Core Value

> Order within phase: A → B → C → D → E. B/C/D/E can be parallelized after A is done.

---

### P1-A: Tool Detail Page

**Goal:** Replace card → direct external link with `/tool/[slug]` internal page.

**Files to create/modify:**
- `prisma/schema.prisma` — add `slug` to `Tool`
- `prisma/backfillToolSlug.ts` — new backfill script
- `src/lib/types.ts` — add `slug` to `ToolData`
- `src/app/page.tsx` — include `slug` in tool mapping
- `src/app/tool/[slug]/page.tsx` — new Server Component
- `src/app/tool/[slug]/ToolDetail.module.css` — new CSS Module
- `src/components/ToolCard/ToolCard.tsx` — update href

**Tasks:**
- [x] **P1-A-1** Add `slug String? @unique` to `Tool` model in `prisma/schema.prisma`; run `npx prisma migrate dev --name add-tool-slug`; run `npx prisma generate`
- [x] **P1-A-2** Create `prisma/backfillToolSlug.ts` — for each tool: slugify `name` (lowercase, spaces→`-`, strip special chars, deduplicate with `-2`/`-3` suffix); persist via `prisma.tool.update`; run with `npx tsx prisma/backfillToolSlug.ts`
- [x] **P1-A-3** Add `slug: string | null` to `ToolData` interface in `src/lib/types.ts`
- [x] **P1-A-4** Update tool mapping in `src/app/page.tsx` to include `tool.slug`
- [x] **P1-A-5** Create `src/app/tool/[slug]/page.tsx` — Server Component; fetch tool by `slug` via `prisma.tool.findUnique`; call `notFound()` if missing; render: name, TR/EN description (based on locale from `Accept-Language` or default TR), category/subcategory breadcrumb, favicon, "Visit official site" external link button, similar tools section (same `subcategoryId`, exclude self, limit 6); use CSS Modules only
- [x] **P1-A-6** Add `generateMetadata()` to `src/app/tool/[slug]/page.tsx` — `title: \`${tool.name} — TOOLIE\``, `description`: tool description, `canonical`, OG `title`/`description`/`url`
- [x] **P1-A-7** Update `src/components/ToolCard/ToolCard.tsx` — change card `href` from `tool.link` to `/tool/${tool.slug}`; add `target="_self"`; keep `rel` clean
- [x] **P1-A-8** Create `src/app/tool/[slug]/ToolDetail.module.css` — retro pastel design; use `var(--green)`, `var(--cyan)`, `var(--card-bg)`, `var(--border-dim)` from `src/styles/globals.css`; file must stay under 600 lines

---

### P1-B: Tag System

**Goal:** Many-to-many tags for cross-category filtering.

**Seed tags:** `ai`, `image`, `video`, `coding`, `research`, `open-source`, `free`, `paid`, `freemium`, `api`, `no-code`, `windows`, `productivity`, `audio`, `writing`, `security`, `datasets`

**Files to create/modify:**
- `prisma/schema.prisma` — add `Tag` model + M2M
- `src/lib/types.ts` — add `TagData`, update `ToolData`
- `src/app/api/tags/route.ts` — new endpoint
- `src/app/api/tools/route.ts` — extend filter logic
- `prisma/seedTags.ts` — new seed script
- `src/app/tool/[slug]/page.tsx` — render tag chips (from P1-A)

**Schema change:**
```prisma
model Tag {
  id    String @id @default(cuid())
  name  String @unique
  slug  String @unique
  tools Tool[]
}
// Tool model: add `tags Tag[]`
```

**Tasks:**
- [x] **P1-B-1** Add `Tag` model and implicit M2M to `Tool` in `prisma/schema.prisma`; run `npx prisma migrate dev --name add-tag-system`; run `npx prisma generate`
- [x] **P1-B-2** Create `prisma/seedTags.ts` — upsert all 17 seed tags with `name` and `slug`; add `"db:seed-tags": "tsx prisma/seedTags.ts"` to `package.json`
- [x] **P1-B-3** Add `TagData { id: string; name: string; slug: string }` to `src/lib/types.ts`; add `tags: TagData[]` to `ToolData`
- [x] **P1-B-4** Create `src/app/api/tags/route.ts` — `GET /api/tags` returns all tags `orderBy: { name: "asc" }`
- [x] **P1-B-5** Update `GET /api/tools` in `src/app/api/tools/route.ts` — parse `?tag=slug` param; add `tags: { some: { slug: tag } }` to Prisma `where`; include `tags` in `select`
- [x] **P1-B-6** Include `tags: { select: { id, name, slug } }` in tool queries in `src/app/page.tsx`
- [x] **P1-B-7** Render tag chips in `src/components/ToolCard/ToolCard.tsx` tooltip (not on card face); render tag chips on tool detail page
- [x] **P1-B-8** Add tag assignment UI to admin edit form (P1-D-4 depends on this)

---

### P1-C: Advanced Filtering

**Goal:** Composable URL-param filters with shareable state.

**Params:**
| Param | Values |
|---|---|
| `cat` | category key (existing) |
| `tag` | tag slug (P1-B) |
| `pricing` | `free` / `paid` / `freemium` |
| `platform` | `web` / `desktop` / `mobile` |
| `sort` | `newest` / `az` |

**Schema additions to `Tool`:**
```prisma
pricingModel String? // "free" | "paid" | "freemium"
platforms    String? // comma-separated: "web,desktop,mobile"
```

**Files to create/modify:**
- `prisma/schema.prisma`
- `src/lib/types.ts`
- `src/app/api/tools/route.ts`
- `src/hooks/useURLParams.ts` — extend existing hook
- `src/lib/i18n.ts` — add filter label keys
- `src/components/FilterBar/FilterBar.tsx` + `FilterBar.module.css` — new component
- `src/app/ToolieApp.tsx` — integrate FilterBar

**Tasks:**
- [x] **P1-C-1** Add `pricingModel String?` and `platforms String?` to `Tool` in `prisma/schema.prisma`; run `npx prisma migrate dev --name add-tool-filter-fields`
- [x] **P1-C-2** Add both fields to `ToolData` in `src/lib/types.ts`
- [x] **P1-C-3** Update `GET /api/tools` in `src/app/api/tools/route.ts` — parse `pricing`, `platform`, `sort` params; compose Prisma `where` and `orderBy`; `platforms` filter: `{ platforms: { contains: platform } }`
- [x] **P1-C-4** Extend `src/hooks/useURLParams.ts` — add `pricing`, `platform`, `sort` params alongside existing `cat` and `q`
- [x] **P1-C-5** Add i18n keys for filter labels to both `tr` and `en` in `src/lib/i18n.ts`
- [x] **P1-C-6** Create `src/components/FilterBar/FilterBar.tsx` + `FilterBar.module.css` — dropdown selects for pricing and platform; CSS Modules only; retro design; consume `useURLParams`
- [x] **P1-C-7** Integrate `FilterBar` into `src/app/ToolieApp.tsx` — place between `SearchBar` and `CategoryNav`
- [x] **P1-C-8** Verify end-to-end: `?cat=DEVELOP&tag=api&pricing=free` returns and displays correct tool subset

---

### P1-D: Admin Panel (Minimum Viable)

**Goal:** Password-protected `/admin` content management UI. Auth via `ADMIN_TOKEN` env var, checked in middleware.

**Files to create:**
- `.env` — add `ADMIN_TOKEN=changeme`
- `src/middleware.ts` — protect `/admin/*`
- `src/app/admin/layout.tsx`
- `src/app/admin/page.tsx` — tool list
- `src/app/admin/tools/new/page.tsx` — add form
- `src/app/admin/tools/[id]/edit/page.tsx` — edit form
- `src/styles/admin.module.css` — shared admin styles

**Existing API routes to reuse:**
- `POST /api/tools` — `src/app/api/tools/route.ts`
- `PUT /api/tools/[id]` — `src/app/api/tools/[id]/route.ts`
- `DELETE /api/tools/[id]` — `src/app/api/tools/[id]/route.ts`

**Tasks:**
- [x] **P1-D-1** Add `ADMIN_TOKEN=changeme` to `.env`; add `ADMIN_TOKEN` to `.env` example comment
- [x] **P1-D-2** Create `src/middleware.ts` — match `/admin/:path*`; read `Authorization: Bearer <token>` header; compare with `process.env.ADMIN_TOKEN`; return 401 JSON response if invalid
- [x] **P1-D-3** Add `featured Boolean @default(false)` to `Tool` in `prisma/schema.prisma`; run migration; add to `ToolData` in `src/lib/types.ts`; update `PUT /api/tools/[id]` to accept `featured`
- [x] **P1-D-4** Create `src/app/admin/layout.tsx` — minimal layout with "◈ TOOLIE ADMIN" header, link back to site; Client Component for token input if needed
- [x] **P1-D-5** Create `src/app/admin/page.tsx` — Server Component; `prisma.tool.findMany` with subcategory/category include; render table: name, category, subcategory, link, featured toggle, Edit link, Delete button
- [x] **P1-D-6** Create `src/app/admin/tools/new/page.tsx` — Client Component form: name, link, description (TR), subcategoryId select (fetched from `/api/tags` and DB); submit `POST /api/tools`; redirect to admin list on success
- [x] **P1-D-7** Create `src/app/admin/tools/[id]/edit/page.tsx` — Server Component prefetches tool; passes to Client Component form with all fields including tags (P1-B), featured toggle, pricingModel, platforms; submit `PUT /api/tools/[id]`
- [x] **P1-D-8** Wire Delete button to `DELETE /api/tools/[id]` with `window.confirm` guard; refresh list on success

---

### P1-E: Test Infrastructure

**Stack:** Vitest + @testing-library/react + Playwright (chromium only)

**Tasks:**
- [x] **P1-E-1** Install: `npm install -D vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/jest-dom`
- [x] **P1-E-2** Create `vitest.config.ts` — environment `jsdom`, setup file importing `@testing-library/jest-dom`, path alias `@/*` → `./src/*`
- [x] **P1-E-3** Install: `npm install -D @playwright/test`; run `npx playwright install chromium`
- [x] **P1-E-4** Create `playwright.config.ts` — `baseURL: 'http://localhost:3000'`, single chromium project, `webServer` block starting `npm run dev`
- [x] **P1-E-5** Add to `package.json`: `"test": "vitest"`, `"test:ui": "vitest --ui"`, `"test:e2e": "playwright test"`
- [x] **P1-E-6** Write `src/__tests__/slug.test.ts` — unit test slugify utility created in P1-A-2: handles spaces, special chars, Turkish chars, deduplication
- [x] **P1-E-7** Write `src/__tests__/taxonomy.test.ts` — unit test `getLocalizedName` from `src/lib/taxonomy.ts`: returns `nameTr` for `tr`, `nameEn` for `en`, fallback when null
- [x] **P1-E-8** Write `src/__tests__/ToolCard.test.tsx` — renders tool name; clicking star calls `onToggleFavorite` with correct id; link href is `/tool/${slug}` (after P1-A)
- [x] **P1-E-9** Write `src/__tests__/SearchBar.test.tsx` — onChange fires with typed value; Ctrl+K focuses input
- [x] **P1-E-10** Write `src/__tests__/api.tools.test.ts` — mock Prisma client; test `GET /api/tools` returns shape; `POST /api/tools` returns 400 on missing fields; `DELETE /api/tools/[id]` returns 404 on unknown id
- [x] **P1-E-11** Write `e2e/homepage.spec.ts` — page loads 200; has 7 category tabs; tool grid has at least 1 card
- [x] **P1-E-12** Write `e2e/search.spec.ts` — type "notion" in search; grid shows filtered results; clear search; grid restores
- [x] **P1-E-13** Write `e2e/favorites.spec.ts` — click star on first tool card; reload; star still active

---

## Phase 2 — Quality & Growth

> Start after all Phase 1 tasks complete and passing.

---

### P2-A: Richer Tool Metadata

**Schema additions to `Tool`:**
```prisma
hasApi        Boolean  @default(false)
isOpenSource  Boolean  @default(false)
officialDocsUrl String?
githubUrl     String?
logoUrl       String?
status        String   @default("active") // "active" | "dead" | "redirected"
verified      Boolean  @default(false)
lastCheckedAt DateTime?
lastStatusCode Int?
isBroken      Boolean  @default(false)
```

**Tasks:**
- [x] **P2-A-1** Add all fields to `prisma/schema.prisma`; run `npx prisma migrate dev --name add-tool-metadata`; update `ToolData` in `src/lib/types.ts`
- [x] **P2-A-2** Expose all new fields in admin edit form `src/app/admin/tools/[id]/edit/page.tsx`
- [x] **P2-A-3** Update `PUT /api/tools/[id]` to accept and persist all new fields
- [x] **P2-A-4** Render `hasApi`, `isOpenSource`, `pricingModel` as small pixel badge chips on tool detail page — use retro color tokens
- [x] **P2-A-5** Render `verified` badge on `ToolCard` when true — small checkmark, must not break existing 110px card layout

---

### P2-B: Link Health Check System

**Tasks:**
- [x] **P2-B-1** Create `scripts/linkChecker.ts` — fetch all tools from Prisma; HEAD request per tool (GET fallback on 405); record `lastStatusCode`, `lastCheckedAt`, `isBroken`; concurrency limit 10; print summary table
- [x] **P2-B-2** Add `"check-links": "tsx scripts/linkChecker.ts"` to `package.json`
- [x] **P2-B-3** Create `src/app/admin/broken/page.tsx` — Server Component; `prisma.tool.findMany({ where: { isBroken: true } })`; render table with name, link, status code, last checked, edit link

---

### P2-C: Featured / Editor's Choice

**Tasks:**
- [x] **P2-C-1** Add `featuredLabel String?` to `Tool` in schema (alongside existing `featured` from P1-D-3); run migration
- [x] **P2-C-2** Create `GET /api/tools/featured` route — `prisma.tool.findMany({ where: { featured: true }, orderBy: { sortOrder: "asc" } })`; include subcategory and category
- [x] **P2-C-3** Add "Featured Tools" section to `src/app/page.tsx` — fetch featured server-side; render with category accent color
- [x] **P2-C-4** Add "New Additions" section — last 8 tools by `createdAt desc`; render as horizontal scroll strip

---

### P2-D: Programmatic SEO

**Tasks:**
- [x] **P2-D-1** Create `src/app/category/[slug]/page.tsx` — fetch by category slug; list tools; `generateMetadata()` with unique title/description
- [x] **P2-D-2** Create `src/app/tag/[slug]/page.tsx` — fetch tools by tag slug; `generateMetadata()` (requires P1-B)
- [x] **P2-D-3** Create `src/app/sitemap.ts` — include `/tool/[slug]` for all tools, `/category/[slug]` for all categories, `/tag/[slug]` for all tags
- [x] **P2-D-4** Add `schema.org` JSON-LD block (`SoftwareApplication`) to `src/app/tool/[slug]/page.tsx`
- [x] **P2-D-5** Create `src/app/og/route.tsx` using `@vercel/og` — accept `?title=` and `?subtitle=`; return retro-styled PNG 1200×630; use in `generateMetadata()` for tool and category pages

---

### P2-E: Search Upgrade (Client-Side with MiniSearch)

**Current:** Server-side `contains` in `src/app/api/tools/route.ts` on `?q=`.
**Goal:** Typo-tolerant instant client-side search.

**Tasks:**
- [x] **P2-E-1** Install `minisearch`
- [x] **P2-E-2** Create `src/hooks/useToolSearch.ts` — accept flat tool list; build MiniSearch index on mount; fields: `name` (boost 3), `description` (boost 1), `descriptionEn` (boost 1); expose `search(query): ToolData[]`
- [x] **P2-E-3** Integrate into `src/app/ToolieApp.tsx` — replace existing debounced `?q=` URL approach with `useToolSearch`; keep URL sync for shareability
- [x] **P2-E-4** Remove `q` Prisma filter from `GET /api/tools` (keep `cat` and `tag`)

---

## Phase 3 — Platformization

> Start after Phase 2 complete.

---

### P3-A: Tool Compare Mode

**Tasks:**
- [x] **P3-A-1** Create `src/hooks/useCompare.ts` — localStorage-backed; max 4 tool IDs; expose `toggle(id)`, `clear()`, `ids`
- [x] **P3-A-2** Add compare checkbox to `ToolCard` (visible on hover) — uses `useCompare`
- [x] **P3-A-3** Add floating compare tray component to `src/app/ToolieApp.tsx` — shows selected tool names, "Compare" button linking to `/compare?ids=...`
- [x] **P3-A-4** Create `src/app/compare/page.tsx` — parse `?ids=id1,id2`; fetch tools; render comparison table rows: pricingModel, platforms, hasApi, isOpenSource, description
- [x] **P3-A-5** Add "Copy compare link" button on compare page

---

### P3-B: User Tool Submissions

**Schema:**
```prisma
model Submission {
  id          String   @id @default(cuid())
  name        String
  link        String
  description String
  categoryKey String?
  submittedAt DateTime @default(now())
  status      String   @default("pending") // "pending" | "approved" | "rejected"
}
```

**Tasks:**
- [x] **P3-B-1** Add `Submission` model to schema; run migration
- [x] **P3-B-2** Create `src/app/submit/page.tsx` — public form: name, link, description, category suggestion; submit calls `POST /api/submissions`
- [x] **P3-B-3** Create `POST /api/submissions` route — validate, create record
- [x] **P3-B-4** Create `src/app/admin/submissions/page.tsx` — list pending; Approve (creates tool) and Reject buttons

---

### P3-C: Collections (localStorage)

**Tasks:**
- [x] **P3-C-1** Create `src/hooks/useCollections.ts` — CRUD for named collections in localStorage; each: `{ id, name, toolIds[] }`
- [x] **P3-C-2** Add "Add to collection" dropdown to `ToolCard` alongside favorite star
- [x] **P3-C-3** Create `src/app/collections/page.tsx` — list collections; click opens collection with tool grid

---

## Constraints (from AGENT.md — enforce on every task)

| Rule | Detail |
|---|---|
| File size | Max 600 lines per file — split if approaching limit |
| Styling | CSS Modules + CSS Custom Properties only; no Tailwind; no inline `style={}` except dynamic `var(--*)` overrides |
| Data | All CRUD via Prisma through `/src/app/api/` routes |
| Schema | Run `npx prisma generate` after every schema edit |
| i18n | All UI strings in `src/lib/i18n.ts`; consumed via `useLanguage` hook; no hardcoded TR/EN text |
| Hydration | localStorage, service worker, DOM effects → `useEffect` or Client Components only |
| Design | Pastel `var(--*)` tokens from `src/styles/globals.css`; pixel icons 30px `image-rendering: pixelated` |
| No TOOLS.json | All data via Prisma; `TOOLS.json` is seed-only |

