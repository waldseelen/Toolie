# TASKS — Prisma Taxonomy Refactor Plan

Updated: 2026-04-01
Status: Planning approved, implementation not started

## Objective
Make the Prisma category/subcategory taxonomy sustainable, support safe renaming, update the tool move API, and prepare the app for future taxonomy maintenance without breaking existing URLs or category filters.

---

## Approved Decisions

1. **Keep category keys stable**: `GENERAL`, `SOURCES`, `DESIGN`, `MEDIA`, `DEVELOP`, `CYBERSEC`, `SUPERUSER` stay as system keys. ✅
2. **Keep URL `cat` param based on stable keys**. ✅
3. **Add `Tool.sortOrder` in this refactor**. ✅
4. **Apply the proposed category/subcategory display renames**. ✅
5. **Fix seed source separately, but soon after this work**. ✅

---

## Why This Refactor Is Needed

### Current problems
- `Category.name` is used like a system key and display label at the same time.
- `Subcategory` has no stable multilingual/display structure.
- Renaming categories safely is difficult.
- Tool move API cannot change `subcategoryId`.
- Taxonomy metadata is split across files.
- `seed.ts` expects `TOOLS.json`, but that file is missing.

### Sustainability goals
- Stable internal keys, flexible display names.
- TR/EN-ready taxonomy fields.
- Safe future renames without breaking filters or links.
- Repeatable migration/backfill process.
- Better manual ordering support via `Tool.sortOrder`.

---

## Proposed Data Model Changes

### Category
Keep existing `name` as stable internal key for now.

Add:
- `slug String? @unique`
- `nameTr String?`
- `nameEn String?`
- `updatedAt DateTime @updatedAt`

### Subcategory
Keep existing `name` during migration.

Add:
- `key String?`
- `slug String?`
- `nameTr String?`
- `nameEn String?`
- `updatedAt DateTime @updatedAt`

### Tool
Add:
- `sortOrder Int @default(0)`

---

## Naming Plan

### Categories
| Key | New TR | New EN |
|---|---|---|
| GENERAL | Genel Kullanım & AI | General Use & AI |
| SOURCES | Kaynaklar & Araştırma | Resources & Research |
| DESIGN | Tasarım & Görsel | Design & Visual |
| MEDIA | Video, Ses & Medya | Video, Audio & Media |
| DEVELOP | Geliştirme & Otomasyon | Development & Automation |
| CYBERSEC | Siber Güvenlik | Cybersecurity |
| SUPERUSER | Sistem & Power User | System & Power User |

### Subcategories
| Category Key | Current | New TR | New EN |
|---|---|---|---|
| GENERAL | Genel AI Platformları | AI Asistanları & Platformlar | AI Assistants & Platforms |
| GENERAL | Verimlilik & İş | Verimlilik & Ofis | Productivity & Office |
| GENERAL | Yazı & İçerik | Yazı, İçerik & Çeviri | Writing, Content & Translation |
| GENERAL | Elektrik, Elektronik & Robotik | Mühendislik & Robotik | Engineering & Robotics |
| GENERAL | Keşif & Karşılaştırma | Tool Keşfi & Karşılaştırma | Tool Discovery & Comparison |
| GENERAL | Haber & Teknoloji | Teknoloji Haberleri | Tech News |
| GENERAL | Sağlık & Wellness | Sağlık & İyi Yaşam | Health & Wellness |
| GENERAL | Finans & Bütçe | Finans & Bütçe | Finance & Budget |
| GENERAL | Freelance & İş | Kariyer & Freelance | Career & Freelance |
| SOURCES | Akademik & Araştırma | Akademik Araştırma | Academic Research |
| SOURCES | Akademik & Çalışma | Öğrenme & Çalışma | Learning & Study |
| SOURCES | Araştırma & Dataset | Dataset & Veri Kaynakları | Datasets & Data Sources |
| SOURCES | Kitap & PDF Kaynakları | Kitap, PDF & Kütüphaneler | Books, PDFs & Libraries |
| DESIGN | AI Görsel Üretimi | AI Görsel Üretimi | AI Image Generation |
| DESIGN | Tasarım & Medya | Tasarım Araçları | Design Tools |
| MEDIA | Video & Animasyon | Video & Animasyon | Video & Animation |
| MEDIA | Ses, Müzik & Podcast | Ses, Müzik & Podcast | Audio, Music & Podcast |
| MEDIA | Medya & Playlist Araçları | Playlist & Medya Yardımcıları | Playlist & Media Utilities |
| DEVELOP | Kodlama & Geliştirme | Kodlama Araçları | Coding Tools |
| DEVELOP | No-Code & Builder | No-Code & Builder | No-Code & Builder |
| DEVELOP | Ajan & Model Geliştirme | AI Ajan & Model Geliştirme | AI Agent & Model Development |
| DEVELOP | Kodlama Öğrenme | Programlama Eğitimi | Programming Learning |
| CYBERSEC | Genel | Güvenlik Araçları & Eğitim | Security Tools & Learning |
| SUPERUSER | Faydalı Siteler | Faydalı Web Araçları | Useful Web Utilities |
| SUPERUSER | Sistem & Yardımcı Araçlar | Sistem Araçları | System Utilities |
| SUPERUSER | Windows Optimizasyon | Windows Optimizasyon | Windows Optimization |
| SUPERUSER | GitHub & Açık Kaynak | Açık Kaynak & GitHub | Open Source & GitHub |

---

## Implementation Plan

### Phase 0 — Safety / Snapshot
- [x] Create a DB backup of `prisma/dev.db`
- [x] Export current category / subcategory / tool mapping snapshot
- [x] Record current counts before refactor

### Phase 1 — Additive Prisma Schema Refactor
- [x] Update `prisma/schema.prisma`
- [x] Add `Category.slug`, `Category.nameTr`, `Category.nameEn`, `Category.updatedAt`
- [x] Add `Subcategory.key`, `Subcategory.slug`, `Subcategory.nameTr`, `Subcategory.nameEn`, `Subcategory.updatedAt`
- [x] Add `Tool.sortOrder`
- [x] Run `npx prisma generate`
- [x] Run `npx prisma db push`

### Phase 2 — Taxonomy Backfill Script
- [x] Create a taxonomy config source of truth
- [x] Create a migration/backfill script for categories and subcategories
- [x] Fill localized names and slugs
- [x] Fill subcategory keys
- [x] Initialize `Tool.sortOrder`
- [x] Verify data integrity after backfill

### Phase 3 — App Read Model Update
- [x] Update server mapping in `src/app/page.tsx`
- [x] Extend shared types in `src/lib/types.ts`
- [x] Make UI display category/subcategory `nameTr` / `nameEn`
- [x] Keep filtering and URL behavior based on stable keys
- [x] Keep fallback behavior for missing localized values during transition

### Phase 4 — Tool Move API Update
- [x] Update `src/app/api/tools/[id]/route.ts`
- [x] Accept `subcategoryId` in `PUT`
- [x] Validate the target subcategory exists
- [x] Return proper 400 / 404 responses for invalid payloads
- [x] Preserve favicon and translation behavior

### Phase 5 — Validation / Smoke Test
- [x] Verify homepage category navigation still works
- [x] Verify tools still load correctly per category
- [x] Verify renamed labels render correctly
- [x] Verify moving a tool to another subcategory works
- [x] Verify no data loss in counts

### Phase 6 — Follow-up (Separate but Soon)
- [ ] Repair seed reproducibility (`TOOLS.json` replacement or export-based seed source)
- [ ] Consolidate taxonomy metadata into a long-term single source
- [ ] Consider auth/authorization before adding category/subcategory CRUD endpoints

---

## Security / API Notes
- Do **not** add public taxonomy CRUD yet without auth.
- For now, only strengthen the existing tool update API.
- Validate mutation payloads carefully.
- Use generic user-facing errors, detailed server logs only.

---

## Risks
- Accidentally using display names as system keys could break filtering.
- Partial backfill could produce blank labels.
- Invalid subcategory moves could create broken relations if not validated.
- Seed reproducibility remains a technical debt until follow-up phase.

---

## Rollback Strategy
- Keep additive schema changes first.
- Do not remove old fields in this refactor.
- Back up DB before migration.
- Use a controlled backfill script instead of ad-hoc manual edits.

---

## Current Status Board
- [x] Repo analysis complete
- [x] Prisma taxonomy review complete
- [x] Refactor strategy proposed
- [x] User decisions approved
- [x] TASKS.md created
- [x] Implementation started
- [x] Schema refactor complete
- [x] Backfill complete
- [x] UI update complete
- [x] Tool move API complete
- [x] Validation complete

---

## Notes for Execution
- Follow `AGENT.md` constraints.
- Keep files under 600 lines.
- Use Prisma/SQLite safely.
- Do not begin implementation until proceeding from this task plan.
