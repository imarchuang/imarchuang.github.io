# Task 2 Report: Migrate Docsify content and preserve legacy routes

## Scope

Implemented Task 2 in `site/` without modifying `docs/`. Added:

- deterministic docs migration script at `site/scripts/migrate-content.mjs`
- safe legacy hash translation at `site/src/lib/legacy-routes.ts`
- typed navigation loader at `site/src/lib/navigation.ts`
- focused Vitest coverage and fixture docs under `site/tests/`
- generated-content ignore rules and `site/src/generated/.gitkeep`
- real migration known-issues output at `site/content-known-issues.json`

No additional dependencies were installed.

## TDD Evidence

### Red -> Green: `legacy-routes`

1. Wrote `site/tests/legacy-routes.test.ts`.
2. Ran:

```bash
npm test -- legacy-routes.test.ts
```

Observed expected red failure:

- `Cannot find module '../src/lib/legacy-routes'`

3. Implemented `legacyHashToPath()`.
4. Re-ran the focused test and got green:

```bash
Test Files  1 passed (1)
Tests       2 passed (2)
```

### Red -> Green: migration pipeline

1. Wrote `site/tests/migrate-content.test.ts` plus fixture trees under `site/tests/fixtures/docs/`.
2. Ran:

```bash
npm test -- migrate-content.test.ts
```

Observed expected red failures from the stub migration script:

- `EXCLUDED is not iterable`
- `migrateContent is not a function`
- `runCli is not a function`

3. Implemented the migration helpers and CLI.
4. Re-ran until green:

```bash
Test Files  1 passed (1)
Tests       4 passed (4)
```

### Red -> Green: typed navigation

1. Wrote `site/tests/navigation.test.ts`.
2. Ran:

```bash
npm test -- navigation.test.ts
```

Observed expected red failure:

- `Cannot find module ... src/lib/navigation.ts`

3. Implemented `validateNavigation()` and `getNavigation()`.
4. Re-ran until green:

```bash
Test Files  1 passed (1)
Tests       2 passed (2)
```

## Implementation Notes

### 1. Legacy route preservation

`legacyHashToPath()` now:

- accepts only Docsify-style `#/...` hashes
- decodes route segments safely
- rejects traversal like `..`
- translates root/index/README to `/`
- preserves `?id=...` anchors as fragment identifiers
- returns `null` for malformed or unsupported input

### 2. Deterministic migration

`site/scripts/migrate-content.mjs` now provides:

- `EXCLUDED`
- `routeFor(relativePath)`
- `normalizeLegacyLinks(markdown)`
- `migrateContent({...})`
- `runCli({...})`

Behavior implemented:

- recursively scans Markdown under `docs/`
- skips generated-content directories: `draw`, `drops`, `superpowers`
- excludes Docsify support Markdown, including `_sidebar.bkup.md`
- detects duplicate generated routes before writing output
- rewrites eligible internal Markdown links with source-relative context
- preserves `/draw/` and `/drops/` links
- derives frontmatter from H1 when frontmatter is absent
- preserves existing frontmatter fields while adding `legacyPath`
- writes deterministic outputs into `site/src/generated/notes/**/*`
- emits `site/src/generated/navigation.json`
- emits `site/content-known-issues.json`

### 3. Navigation

`site/src/lib/navigation.ts` now:

- defines `NavigationItem` and `NavigationSection`
- validates generated JSON shape at runtime
- returns a deeply frozen navigation tree from `getNavigation()`

### 4. Test harness changes

- broadened `site/vitest.config.ts` to include `tests/**/*.test.ts`
- updated `site/.gitignore` to keep generated notes/navigation out of git

## Real Migration Results

Ran:

```bash
node scripts/migrate-content.mjs
```

Observed:

```json
{
  "migratedCount": 164,
  "excludedCount": 15,
  "accountedCount": 174,
  "supportExcludedCount": 10,
  "generatedDirSkippedCount": 5,
  "issuesCount": 62
}
```

Interpretation:

- `174` source Markdown files are accounted for as either migrated or explicit support-file exclusions
- `5` Markdown files under generated-content directories (`drops/`, `superpowers/`) are skipped separately by design
- `62` pre-existing stale internal links were recorded in `site/content-known-issues.json`

## Full Verification

After generating real content, ran the full Task 2 suite:

```bash
npm test
```

Result:

```bash
Test Files  4 passed (4)
Tests       10 passed (10)
```

## Self-Review

### What looks solid

- The TDD checkpoints were executed for each new interface.
- Path traversal protection is present in both legacy hash translation and route lookup.
- Duplicate generated slugs fail fast with both conflicting source paths in the error.
- Relative-link rewriting uses source-file context and a docs-root fallback for the repo's mixed legacy link styles.
- Pre-existing stale links are recorded instead of silently rewritten to the wrong target.

### Remaining limitations / trade-offs

- Navigation JSON is derived from the root Docsify sidebar; nested section sidebars are not merged into the exported navigation tree in this task.
- The known-issues file currently records only stale Markdown-like internal links; it does not attempt automated repair.
- Some legacy inline links without valid Markdown targets are still reported as stale content issues and will need later content cleanup.

## Files Added or Changed

- `site/.gitignore`
- `site/scripts/migrate-content.mjs`
- `site/src/generated/.gitkeep`
- `site/src/lib/legacy-routes.ts`
- `site/src/lib/navigation.ts`
- `site/tests/fixtures/docs/basic/**`
- `site/tests/fixtures/docs/duplicates/**`
- `site/tests/legacy-routes.test.ts`
- `site/tests/migrate-content.test.ts`
- `site/tests/navigation.test.ts`
- `site/vitest.config.ts`
- `site/content-known-issues.json`

## Review Follow-Up Fixes

Addressed the review gaps in one pass:

1. Relative Docsify `?id=` anchors now normalize through route lookup and are rewritten as preserved route fragments with safe `encodeURIComponent()` handling, including non-ASCII headings.
2. Root navigation now merges matching subsection sidebars into their top-level sections, preserving root order and deduping by `href` across the whole section subtree.
3. Migration tests now cover relative `?id=` links, nested section sidebar merge/dedupe, and a deterministic real-docs accounting assertion for the `174` source Markdown files.

### Follow-Up Test/Verification Commands

Focused migration suite after adding the new red-phase coverage:

```bash
npm test -- migrate-content.test.ts
```

Final result after fixes:

```bash
Test Files  1 passed (1)
Tests       5 passed (5)
```

Real migration after fixes:

```bash
node scripts/migrate-content.mjs
```

Observed:

```json
{
  "migratedCount": 164,
  "excludedCount": 15,
  "accountedCount": 174,
  "supportExcludedCount": 10,
  "generatedDirSkippedCount": 5,
  "issuesCount": 60
}
```

Full site Vitest suite after regenerating content:

```bash
npm test
```

Observed:

```bash
Test Files  4 passed (4)
Tests       11 passed (11)
```

### Follow-Up Result Notes

- The previously false-stale link `coding/bfs/shortest.md -> ./coding/bfs/levels?id=二叉树的最小深度` is no longer present in `site/content-known-issues.json`.
- Real merged navigation now includes populated subsection items for:
  - `/coding/` (`12` items)
  - `/system/` (`10` items)
  - `/products/` (`3` items)
  - `/python/` (`11` items)
  - `/sysde/` (`3` items)
- Remaining `?id=` entries in known issues dropped to `13`, indicating the valid relative-anchor cases covered by this fix are no longer being misclassified.

## Final Navigation-Fidelity Fix

Closed the remaining subsection-sidebar fidelity gap by collapsing duplicate `href` aliases inside incoming sidebar subtrees before they merge into root navigation sections.

### What changed

- kept the first meaningful sidebar node/title/order for a repeated `href`
- discarded duplicate alias nodes that pointed to the same `href`
- merged any unique descendants from the alias subtree into the first kept node
- added a focused fixture where `Advanced` contains a child alias with the same `href` plus a unique `FAQ` child, and asserted that generated navigation keeps only `Advanced -> FAQ`

### Exact verification

Focused migration coverage:

```bash
npm test -- migrate-content.test.ts
```

Observed:

```bash
Test Files  1 passed (1)
Tests       5 passed (5)
```

Real migration after the alias-collapse fix:

```bash
node scripts/migrate-content.mjs
```

Observed:

```json
{
  "migratedCount": 164,
  "excludedCount": 15,
  "accountedCount": 174,
  "supportExcludedCount": 10,
  "generatedDirSkippedCount": 5,
  "issuesCount": 60
}
```
