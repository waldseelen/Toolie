# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project identity

Toolie v1.0 is a Next.js 15 (App Router) / React 19 retro-CRT tool catalog (~376 tools across 7 categories) with a Turkish/English UI. **The data layer is Cloud Firestore accessed via `firebase-admin`, with a `TOOLS.json`-backed in-memory fallback when Firebase is not configured; search is powered by MiniSearch. There is no Prisma and no SQLite anywhere in this repo.**

## Commands

```bash
npm run dev         # next dev --turbopack (cleans .next first)
npm run build       # next build (cleans .next first)
npm run start       # next start
npm run lint        # eslint . --max-warnings=0
npm run typecheck   # tsc --noEmit
npm run test        # vitest (unit/component)
npm run test:ui     # vitest --ui
npm run test:e2e    # playwright test
npm run db:seed     # tsx scripts/seed.ts — loads TOOLS.json into Firestore
npm run check-links # tsx scripts/linkChecker.ts
npm run analyze     # ANALYZE=true next build (bundle analyzer)
```

Correctness gates before considering a change done: `npm run lint` (zero warnings allowed), `npm run typecheck`, and `npm run test`. Run `npm run test:e2e` when touching page flows (search, favorites, compare, collections, submit).

## Architecture

### Data flow

- **Source of truth:** `TOOLS.json` (7 categories → subcategories → tools; 376 tools). `scripts/seed.ts` reads it and writes `categories`, `subcategories`, `tools`, and `tags` collections into Firestore.
- **Runtime reads:** all data access goes through `src/lib/db.ts`. Each exported function first calls `isFirebaseConfigured()` (`src/lib/firebase.ts`). If Firebase is NOT configured, it lazily builds an in-memory catalog from `TOOLS.json` (`initLocalData()`) and serves from that. If it IS configured, it queries Firestore via `getDb()` (a memoized `firebase-admin` Firestore instance).
- **Firebase init:** `getDb()` initializes `firebase-admin` from `FIREBASE_CLIENT_EMAIL` + `FIREBASE_PRIVATE_KEY` env vars, else a local `firebase-service-account.json`, else default/emulator credentials. `isFirebaseConfigured()` returns true only when real credentials (env pair, service-account file, or `FIRESTORE_EMULATOR_HOST`) are present.
- **Rendering:** Server Components (e.g. `src/app/page.tsx`, `category/[slug]`, `tool/[slug]`) call `db.ts` functions directly and render. Client interactivity (search, favorites, compare, collections, language) lives in Client Components and hooks.

### Directory layout

```text
TOOLS.json              # source catalog data (seed + local fallback)
scripts/                # seed.ts, linkChecker.ts (run via tsx)
public/                 # icons/, manifest.json, sw.js (PWA assets)
src/app/                # App Router: routes, api/, admin/, layout.tsx, globals.css
src/app/api/            # search, favicon, tools/[id](+upvote, featured), tags,
                        #   submissions, admin/session, scrape, og
src/components/         # UI components, each with a co-located *.module.css
src/hooks/              # useToolSearch, useFavorites, useLanguage, useTheme,
                        #   useCollections, useCompare, useCRT, useHighContrast, useURLParams
src/store/useAppStore.ts# Zustand persist store (locale, favorites, collections)
src/lib/                # db.ts, firebase.ts, taxonomy.ts, i18n.ts, types.ts, slug.ts, admin-auth.ts
src/__tests__/          # Vitest unit/component tests
e2e/                    # Playwright specs
```

Note: global CSS/design tokens live at `src/app/globals.css` — there is **no** `src/styles/` directory.

### Key subsystems

- **Search (MiniSearch):** `src/app/api/search/route.ts` builds a `MiniSearch` index over minimal tool docs (`getAllToolsMinimal()`), fields `name`/`description`/`descriptionEn`, `prefix: true`, `fuzzy: 0.2`, `name` boosted x3. The tool list is cached in module scope for 1 hour (`CACHE_TTL`). Returns matching tool IDs; the client (`src/hooks/useToolSearch.ts`) fetches with a 300ms debounce and filters the already-loaded tool array by ID. `Ctrl+K` / `Cmd+K` focuses the input (`src/components/SearchBar/SearchBar.tsx`).
- **Favorites & collections:** `src/store/useAppStore.ts` is a Zustand store wrapped in `persist` (localStorage key `toolie-app-storage`) holding `locale`, `favorites`, and `collections`. A legacy `src/hooks/useFavorites.ts` also persists to localStorage key `toolie-favorites`.
- **i18n (TR/EN):** `src/lib/i18n.ts` exports a `translations` object with `tr` and `en` maps; `useLanguage` consumes it. Locale defaults to `tr`, is toggled via the store, and sets `document.documentElement.lang`. Localized category/tool names come from `nameTr`/`nameEn` fields via `taxonomy.ts` helpers.
- **PWA service worker:** hand-written `public/sw.js` (cache `toolie-v1`, precache `/` and `/manifest.json`, network-first for API + cache-first for assets). Registered client-side in `src/components/ServiceWorkerRegister.tsx` via `navigator.serviceWorker.register("/sw.js")`. It is a static committed file — NOT generated by a build plugin.
- **Favicon proxy:** `src/app/api/favicon/route.ts` takes a `domain` query param and proxies `https://www.google.com/s2/favicons?domain=<encoded>&sz=32`. The fetch host is a hardcoded constant (`www.google.com`); the caller-supplied value is only ever a query-string parameter, never the request host — so it cannot be pointed at an arbitrary URL. Falls back to a 1x1 transparent PNG on error.

## Absolute rules — do not break these

1. **No Prisma / no SQLite.** Do not add Prisma, `prisma/`, `schema.prisma`, or a SQLite dependency. Data access goes through `src/lib/db.ts` (Firestore) with the `TOOLS.json` fallback. Older docs (e.g. `AGENT.md`) that describe Prisma/SQLite are inaccurate.
2. **Preserve the Firestore + fallback dual path.** Every data-access function in `db.ts` must keep the `if (!isFirebaseConfigured()) { ...TOOLS.json... }` branch working so the app runs with no Firebase credentials.
3. **Search index shape is load-bearing.** `/api/search` returns an array of tool ID strings; the client filters the loaded tool list by those IDs. Keep MiniSearch field/boost config and the ID-based contract intact.
4. **i18n parity (TR/EN).** Every user-facing string must exist in both `tr` and `en` maps in `src/lib/i18n.ts`; no hardcoded UI text. Localized names must fall back through `nameTr`/`nameEn`/`name`.
5. **Service worker is a static file.** Keep `public/sw.js` and `public/manifest.json` as committed static assets; registration stays inside a `useEffect` in a Client Component. Do not introduce a generator that overwrites them.
6. **Favicon proxy SSRF safety.** Keep the outbound fetch host hardcoded to `www.google.com` and pass user input only as an encoded query param. Never let a request parameter determine the fetch host.
7. **Styling constraints.** CSS Modules + CSS custom properties only (co-located `*.module.css`); global tokens in `src/app/globals.css`. No Tailwind unless explicitly requested (per `AGENT.md`). Keep source files under ~600 lines.

## Doc trust note

After this correction, trust `README.md` and this `CLAUDE.md` as the accurate description of the stack (Firestore + `TOOLS.json` fallback, MiniSearch, PWA). Note that `AGENT.md` still contains outdated Prisma/SQLite claims (section "Veri Yönetimi") and should not be relied on for the data layer until updated.
