# Astro Portfolio Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the active Docsify site with a modern Chinese-first Astro portfolio while preserving technical articles, old hash links, `/draw/`, `/drops/`, images, and downloads.

**Architecture:** A new `site/` Astro application renders the homepage and article shell. A deterministic migration script reads the existing `docs/` Markdown into generated Astro content, while a post-build assembler copies static artifacts and the independently built whiteboard into one Pages artifact. GitHub Actions publishes `site/dist`.

**Tech Stack:** Astro, TypeScript, Vitest, Playwright, Pagefind, axe-core, bundled Fontsource packages, existing Vite/React whiteboard, GitHub Pages Actions.

## Global Constraints

- Preserve section URLs after removing the Docsify hash prefix.
- Preserve `/draw/`, `/drops/`, shared image URLs, download filenames, and trailing slashes.
- Use the approved colors: `#102630`, `#F5F8F7`, `#3658E6`, `#BCECE3`, `#FF684F`, `#60747A`, and `#BAC8C5`.
- Bundle Manrope Variable, Noto Sans SC, and IBM Plex Mono locally.
- Lead the homepage in Chinese and retain each article's source language.
- Do not migrate Gitalk or its exposed client secret.
- Respect `prefers-reduced-motion`, keyboard navigation, visible focus, and WCAG AA contrast.
- Keep the current `docs/` tree as rollback material for this release.

---

## File map

- `site/astro.config.mjs`: static output, Markdown plugins, and trailing-slash policy.
- `site/src/content.config.ts`: generated note collection schema.
- `site/scripts/migrate-content.mjs`: convert legacy Markdown, links, routes, and sidebars.
- `site/scripts/assemble-static.mjs`: copy drops, images, downloads, and `.nojekyll`.
- `site/src/lib/legacy-routes.ts`: old hash-to-path mapping.
- `site/src/lib/navigation.ts`: typed access to generated navigation.
- `site/src/layouts/BaseLayout.astro`: metadata, fonts, skip link, header, and footer.
- `site/src/layouts/ArticleLayout.astro`: reading shell, section navigation, TOC, pagination, and comments.
- `site/src/pages/index.astro`: approved Contemporary Field Notes homepage.
- `site/src/pages/[...slug].astro`: statically generated migrated articles.
- `site/src/pages/work/index.astro`: visual explainers collection.
- `site/src/pages/notes/index.astro`: note-section index.
- `site/src/pages/about/index.astro`: positioning and work approach.
- `site/src/pages/404.astro`: recovery page.
- `site/src/components/`: focused navigation, search, illustration, and article controls.
- `site/src/styles/`: tokens, global rules, homepage, and article styles.
- `site/tests/`: migration, compatibility, navigation, and build-artifact tests.
- `site/e2e/`: browser and accessibility smoke tests.
- `whiteboard/vite.config.js`: environment-controlled deployment destination.
- `.github/workflows/deploy-pages.yml`: production build and Pages deployment.

---

### Task 1: Scaffold the Astro application and test harness

**Files:**
- Create: `site/package.json`
- Create: `site/astro.config.mjs`
- Create: `site/tsconfig.json`
- Create: `site/src/env.d.ts`
- Create: `site/src/content.config.ts`
- Create: `site/vitest.config.ts`
- Create: `site/playwright.config.ts`
- Create: `site/.gitignore`

**Interfaces:**
- Produces: `npm run build`, `npm test`, and `npm run test:e2e`.
- Produces: `notes` content collection entries with `title`, `description`, `legacyPath`, and optional `navOrder`.

- [ ] **Step 1: Create the package and install current dependencies**

Create `site/package.json` with scripts:

```json
{
  "name": "imarchuang-portfolio",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "node scripts/migrate-content.mjs && astro dev",
    "prebuild": "node scripts/migrate-content.mjs",
    "build": "astro build && pagefind --site dist && node scripts/assemble-static.mjs",
    "test": "vitest run",
    "test:e2e": "playwright test",
    "check": "astro check"
  }
}
```

Run:

```bash
cd site
npm install astro @astrojs/check pagefind @fontsource-variable/manrope @fontsource/noto-sans-sc @fontsource/ibm-plex-mono
npm install --save-dev typescript vitest playwright @playwright/test @axe-core/playwright
```

Expected: `site/package-lock.json` is created and `npm install` exits 0.

- [ ] **Step 2: Configure static Astro output**

Create `site/astro.config.mjs`:

```js
import { defineConfig } from "astro/config";

export default defineConfig({
  output: "static",
  site: "https://imarchuang.github.io",
  trailingSlash: "always",
  markdown: {
    shikiConfig: { theme: "github-dark-default", wrap: true },
  },
});
```

Create a strict `site/tsconfig.json` extending `astro/tsconfigs/strict`, plus the standard `src/env.d.ts` Astro reference.

- [ ] **Step 3: Define the content collection**

Create `site/src/content.config.ts`:

```ts
import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

const notes = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/generated/notes" }),
  schema: z.object({
    title: z.string(),
    description: z.string().default(""),
    legacyPath: z.string(),
    navOrder: z.number().optional(),
  }),
});

export const collections = { notes };
```

- [ ] **Step 4: Add test configuration**

Configure Vitest for Node tests and Playwright to run against `npm run dev -- --host 127.0.0.1`, using desktop Chromium and a 390×844 mobile project.

- [ ] **Step 5: Verify the empty scaffold**

Run:

```bash
npm test
npm run check
```

Expected: both commands exit 0; Vitest reports no failing tests.

- [ ] **Step 6: Commit**

```bash
git add site
git commit -m "Scaffold the Astro portfolio application"
```

---

### Task 2: Migrate Docsify content and preserve legacy routes

**Files:**
- Create: `site/scripts/migrate-content.mjs`
- Create: `site/src/lib/legacy-routes.ts`
- Create: `site/src/lib/navigation.ts`
- Create: `site/src/generated/.gitkeep`
- Create: `site/tests/fixtures/docs/`
- Create: `site/tests/migrate-content.test.ts`
- Create: `site/tests/legacy-routes.test.ts`
- Create: `site/tests/navigation.test.ts`
- Modify: `site/.gitignore`

**Interfaces:**
- Produces: `site/src/generated/notes/**/*.md`.
- Produces: `site/src/generated/navigation.json`.
- Produces: `legacyHashToPath(hash: string): string | null`.
- Produces: `getNavigation(): NavigationSection[]`.

- [ ] **Step 1: Write failing legacy-route tests**

Create tests covering:

```ts
expect(legacyHashToPath("#/system/index")).toBe("/system/");
expect(legacyHashToPath("#/coding/tree/bst?id=search")).toBe("/coding/tree/bst/#search");
expect(legacyHashToPath("#/README")).toBe("/");
expect(legacyHashToPath("#/")).toBe("/");
expect(legacyHashToPath("#/../../escape")).toBeNull();
```

Run `npm test -- legacy-routes.test.ts`.

Expected: FAIL because `legacyHashToPath` does not exist.

- [ ] **Step 2: Implement safe hash translation**

Implement `site/src/lib/legacy-routes.ts`:

```ts
export function legacyHashToPath(hash: string): string | null {
  if (!hash.startsWith("#/")) return null;
  const raw = hash.slice(2);
  const [routePart, query = ""] = raw.split("?");
  const decoded = decodeURIComponent(routePart).replace(/\.md$/i, "");
  if (decoded.split("/").some((part) => part === "..")) return null;
  if (!decoded || /^(README|index)$/i.test(decoded)) return "/";
  const normalized = decoded.replace(/\/index$/i, "").replace(/^\/+|\/+$/g, "");
  const anchor = new URLSearchParams(query).get("id");
  return `/${normalized}/${anchor ? `#${encodeURIComponent(anchor)}` : ""}`;
}
```

Run the focused test and expect PASS.

- [ ] **Step 3: Write failing migration tests**

Fixture tests must prove:

- Special Docsify files are excluded.
- `':ignore'` is removed.
- `.md` and `/#/` internal links become path URLs.
- Existing `/draw/` and `/drops/` links are unchanged.
- A Markdown title becomes frontmatter when frontmatter is absent.
- Duplicate output slugs fail with a path-specific error.
- Sidebar nesting becomes deterministic navigation JSON.

Run `npm test -- migrate-content.test.ts`.

Expected: FAIL because the migration module does not exist.

- [ ] **Step 4: Implement deterministic migration**

Implement exported pure helpers in `site/scripts/migrate-content.mjs` and a CLI entrypoint:

```js
export const EXCLUDED = new Set([
  "_coverpage.md", "_navbar.md", "_sidebar.md", "_my404.md"
]);

export function routeFor(relativePath) {
  const withoutExtension = relativePath.replace(/\.md$/i, "");
  return withoutExtension.replace(/(^|\/)(README|index)$/i, "").replace(/\/+/g, "/");
}

export function normalizeLegacyLinks(markdown) {
  return markdown
    .replace(/\s+':ignore'/g, "")
    .replace(/\]\(\/#\/([^)#?]+?)(?:\.md)?\)/g, "](/$1/)")
    .replace(/\]\(([^):#]+?)\.md(#[^)]+)?\)/g, "]($1/$2)");
}
```

The CLI reads `../docs`, excludes generated `draw`, `drops`, `superpowers`, and Docsify support files, clears only `site/src/generated/notes`, writes generated frontmatter, and emits `navigation.json`. It must never modify `docs/`.

- [ ] **Step 5: Add typed navigation access**

Define:

```ts
export interface NavigationItem {
  title: string;
  href: string;
  children: NavigationItem[];
}

export interface NavigationSection {
  title: string;
  href: string;
  items: NavigationItem[];
}
```

`getNavigation()` imports and validates generated JSON, returning an immutable array.

- [ ] **Step 6: Generate the real content and inspect failures**

Run:

```bash
node scripts/migrate-content.mjs
npm test
```

Expected: 174 source Markdown files are accounted for as migrated or explicitly excluded; tests pass. Record pre-existing stale links in `site/content-known-issues.json` rather than silently changing their targets.

- [ ] **Step 7: Commit**

```bash
git add site/scripts site/src/lib site/src/generated/.gitkeep site/tests site/content-known-issues.json site/.gitignore
git commit -m "Add deterministic Docsify content migration"
```

---

### Task 3: Build the approved design system and homepage

**Files:**
- Create: `site/src/styles/tokens.css`
- Create: `site/src/styles/global.css`
- Create: `site/src/styles/home.css`
- Create: `site/src/layouts/BaseLayout.astro`
- Create: `site/src/components/SiteHeader.astro`
- Create: `site/src/components/SiteFooter.astro`
- Create: `site/src/components/SystemsPath.astro`
- Create: `site/src/pages/index.astro`
- Create: `site/src/pages/work/index.astro`
- Create: `site/src/pages/about/index.astro`
- Create: `site/src/pages/notes/index.astro`
- Create: `site/e2e/home.spec.ts`
- Create: `site/e2e/accessibility.spec.ts`

**Interfaces:**
- `BaseLayout` accepts `title`, `description`, and optional `image`.
- `SystemsPath` renders a decorative, hidden-from-assistive-technology SVG.
- Homepage exposes stable landmarks and links to `/work/`, `/notes/`, `/about/`, and GitHub.

- [ ] **Step 1: Write failing homepage browser tests**

Cover:

```ts
await expect(page.getByRole("heading", {
  name: "把复杂系统变得清晰、可用。"
})).toBeVisible();
await expect(page.getByRole("link", { name: "浏览视觉作品" }))
  .toHaveAttribute("href", "/work/");
await expect(page.locator("main")).toBeVisible();
await expect(page.locator('a[href="#main-content"]')).toBeAttached();
```

Add an axe scan that fails on serious or critical violations.

Run `npm run test:e2e -- home.spec.ts`.

Expected: FAIL because the pages do not exist.

- [ ] **Step 2: Implement local fonts and tokens**

Import:

```css
@import "@fontsource-variable/manrope";
@import "@fontsource/noto-sans-sc/400.css";
@import "@fontsource/noto-sans-sc/600.css";
@import "@fontsource/ibm-plex-mono/500.css";

:root {
  --ink: #102630;
  --paper: #f5f8f7;
  --cobalt: #3658e6;
  --aqua: #bcece3;
  --coral: #ff684f;
  --muted: #60747a;
  --line: #bac8c5;
  --font-display: "Manrope Variable", "Noto Sans SC", sans-serif;
  --font-body: "Manrope Variable", "Noto Sans SC", sans-serif;
  --font-code: "IBM Plex Mono", monospace;
}
```

Add global focus, skip-link, spacing, responsive, and reduced-motion rules.

- [ ] **Step 3: Implement the shared layout**

`BaseLayout.astro` must render canonical metadata, Open Graph metadata, a skip link, semantic header/main/footer structure, and this root compatibility bridge:

```html
<script>
  import { legacyHashToPath } from "../lib/legacy-routes";
  const target = legacyHashToPath(window.location.hash);
  if (target && target !== `${window.location.pathname}${window.location.hash}`) {
    window.location.replace(target);
  }
</script>
```

The bridge runs only on `/`.

- [ ] **Step 4: Implement the homepage exactly from the approved mockup**

Use:

- Eyebrow: `产品思维 × 技术领导力`
- Headline: `把复杂系统变得清晰、可用。`
- Description: `我是 Marc。关注产品、平台与人如何一起工作，把系统思考转化为可以落地的产品和实践。`
- Visual-work heading: `让看不见的系统，变得可以探索。`
- Broad visual-work description with no named project.
- Exploration links for `交互图解`, `技术笔记`, and `我的工作`.

Keep the systems-path animation below 700 ms and disable it under reduced motion.

- [ ] **Step 5: Add collection landing pages**

`/work/` reads available `/drops/` entries from a small typed data file, but individual project names remain off the homepage. `/notes/` lists major sections and recent migrated entries. `/about/` explains Marc's product-minded leadership approach using concise, editable copy.

- [ ] **Step 6: Verify responsive visual behavior**

Run:

```bash
npm run test:e2e -- home.spec.ts accessibility.spec.ts
```

Expected: desktop and 390-pixel mobile tests pass with no serious axe violations.

- [ ] **Step 7: Commit**

```bash
git add site/src site/e2e
git commit -m "Build the Contemporary Field Notes portfolio"
```

---

### Task 4: Implement the article shell, navigation, search, and recovery

**Files:**
- Create: `site/src/layouts/ArticleLayout.astro`
- Create: `site/src/components/SectionNav.astro`
- Create: `site/src/components/TableOfContents.astro`
- Create: `site/src/components/ArticlePager.astro`
- Create: `site/src/components/SearchDialog.astro`
- Create: `site/src/components/Comments.astro`
- Create: `site/src/pages/[...slug].astro`
- Create: `site/src/pages/404.astro`
- Create: `site/src/styles/article.css`
- Create: `site/e2e/article.spec.ts`
- Create: `site/e2e/search.spec.ts`

**Interfaces:**
- Dynamic page `getStaticPaths()` maps every `notes` entry to its preserved route.
- `ArticleLayout` receives the rendered headings and previous/next items.
- SearchDialog queries Pagefind only after opening and provides section fallbacks.

- [ ] **Step 1: Write failing article-shell tests**

Tests cover:

- A representative migrated article returns 200.
- Desktop section navigation and article heading are visible.
- Mobile menu opens with keyboard and closes with Escape.
- Long pages expose a table of contents.
- Previous and next links follow generated navigation.
- Code blocks expose keyboard-focusable copy controls.
- 404 shows links to `/work/` and `/notes/`.

Run `npm run test:e2e -- article.spec.ts`.

Expected: FAIL.

- [ ] **Step 2: Implement static article routes**

Use `getCollection("notes")`, render every entry, and map `entry.data.legacyPath` to `params.slug`. Return rendered `Content` and headings to `ArticleLayout`.

- [ ] **Step 3: Implement the reading shell**

Desktop uses a collapsible `<aside>` and mobile uses a `<dialog>` with a no-JavaScript fallback list. Limit prose to `72ch`, provide semantic heading order, and style code without changing source code content.

- [ ] **Step 4: Implement Pagefind search**

Load `/pagefind/pagefind.js` only when the search dialog opens. Render result title, excerpt, and URL. For zero results, show links to the work, system, coding, and Python sections.

- [ ] **Step 5: Add comments without Gitalk**

`Comments.astro` loads one Utterances script only on article pages:

```html
<script
  src="https://utteranc.es/client.js"
  repo="imarchuang/imarchuang.github.io"
  issue-term="pathname"
  theme="github-light"
  crossorigin="anonymous"
  async>
</script>
```

Wrap it in a lazy-loading boundary so failure never blocks article content.

- [ ] **Step 6: Verify article and search behavior**

Run:

```bash
npm run build
npm run test:e2e -- article.spec.ts search.spec.ts accessibility.spec.ts
```

Expected: build and tests pass.

- [ ] **Step 7: Commit**

```bash
git add site/src site/e2e
git commit -m "Add the Astro knowledge-base reading shell"
```

---

### Task 5: Assemble and validate static applications and assets

**Files:**
- Create: `site/scripts/assemble-static.mjs`
- Create: `site/tests/assemble-static.test.ts`
- Modify: `whiteboard/vite.config.js`
- Modify: `site/package.json`
- Modify: `site/.gitignore`

**Interfaces:**
- `assembleStatic({ docsDir, distDir })` copies `drops`, `images`, `_media`, and `.nojekyll`.
- `WHITEBOARD_OUT_DIR` overrides the whiteboard output only for the composed build.

- [ ] **Step 1: Write failing artifact tests**

In a temporary directory, verify that assembly:

- Copies `drops/orbit-sketch/index.html`.
- Copies nested PPTX files without renaming.
- Copies `images` and `_media`.
- Writes `.nojekyll`.
- Refuses source or destination paths outside the repository root.

Run `npm test -- assemble-static.test.ts`.

Expected: FAIL.

- [ ] **Step 2: Implement safe static assembly**

Use `node:fs/promises` `cp`, `mkdir`, and `writeFile`. Resolve every source and destination, verify both remain under the repository root, and copy only the declared directories.

- [ ] **Step 3: Make whiteboard output configurable**

Change `whiteboard/vite.config.js`:

```js
const outDir = process.env.WHITEBOARD_OUT_DIR || "../docs/draw";

export default defineConfig({
  base: "/draw/",
  plugins: [react()],
  build: {
    outDir,
    emptyOutDir: true,
  },
  test: { environment: "node" },
});
```

- [ ] **Step 4: Add one complete local production command**

Add `site/scripts/build-all.mjs` that:

1. Runs Astro build.
2. Runs Pagefind.
3. Runs static assembly.
4. Runs `npm run build --prefix ../whiteboard` with `WHITEBOARD_OUT_DIR=../site/dist/draw`.

Set `site/package.json` `build` to `node scripts/build-all.mjs` and keep an internal `build:astro` script to avoid recursion.

- [ ] **Step 5: Verify all artifacts**

Run:

```bash
npm test
npm run build
test -f dist/index.html
test -f dist/draw/index.html
test -f dist/drops/orbit-sketch/index.html
test -f dist/.nojekyll
```

Expected: all commands exit 0.

- [ ] **Step 6: Commit**

```bash
git add site whiteboard/vite.config.js
git commit -m "Assemble legacy tools into the Astro site"
```

---

### Task 6: Add CI validation and GitHub Pages deployment

**Files:**
- Create: `.github/workflows/deploy-pages.yml`
- Create: `site/scripts/validate-site.mjs`
- Create: `site/tests/validate-site.test.ts`
- Modify: `site/package.json`

**Interfaces:**
- `npm run validate` fails for duplicate routes, broken internal links, missing local images, or absent required artifacts.
- Successful pushes to `master` deploy `site/dist` through the GitHub Pages environment.

- [ ] **Step 1: Write failing site-validation tests**

Fixtures cover:

- Duplicate normalized paths.
- Broken relative links.
- Missing local image references.
- Allowed external links.
- Known stale links listed in `content-known-issues.json`.
- Required `/draw/` and `/drops/` artifacts.

Run `npm test -- validate-site.test.ts`.

Expected: FAIL.

- [ ] **Step 2: Implement site validation**

Walk generated HTML under `dist`, parse internal `href` and `src` values, ignore protocols and fragments, normalize trailing slashes, and check targets. Print one actionable line per failure and exit 1 if any unallowlisted failure exists.

- [ ] **Step 3: Add the Pages workflow**

Create `.github/workflows/deploy-pages.yml` with:

```yaml
name: Deploy Astro site

on:
  push:
    branches: [master]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: false

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm
          cache-dependency-path: |
            site/package-lock.json
            whiteboard/package-lock.json
      - run: npm ci
        working-directory: site
      - run: npm ci
        working-directory: whiteboard
      - run: npm test
        working-directory: site
      - run: npm test
        working-directory: whiteboard
      - run: npm run build
        working-directory: site
      - run: npm run validate
        working-directory: site
      - uses: actions/configure-pages@v5
      - uses: actions/upload-pages-artifact@v3
        with:
          path: site/dist

  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    needs: build
    steps:
      - name: Deploy
        id: deployment
        uses: actions/deploy-pages@v4
```

- [ ] **Step 4: Run the complete local release gate**

Run:

```bash
npm test
npm run check
npm run build
npm run validate
npm run test:e2e
npm test --prefix ../whiteboard
```

Expected: every command exits 0.

- [ ] **Step 5: Commit**

```bash
git add .github/workflows/deploy-pages.yml site
git commit -m "Deploy the Astro portfolio through GitHub Pages"
```

---

### Task 7: Visual review, release, and production smoke checks

**Files:**
- Modify only files required by verified review findings.

**Interfaces:**
- Produces: published `https://imarchuang.github.io/`.

- [ ] **Step 1: Serve the production artifact**

Run a static server against `site/dist` and inspect:

- Homepage at 1440×900 and 390×844.
- One short and one long article.
- Work index.
- 404 page.
- Whiteboard.
- One visual explainer.

- [ ] **Step 2: Apply one focused visual-polish pass**

Compare against the approved modern Field Notes mockup. Fix only concrete discrepancies in typography, spacing, overflow, focus, contrast, or responsive hierarchy. Re-run the affected tests after every fix.

- [ ] **Step 3: Re-run the release gate**

Run the complete Task 6 release gate again.

Expected: all checks pass with a clean worktree except intended commits.

- [ ] **Step 4: Push the release**

```bash
git push origin master
```

Expected: push succeeds without force.

- [ ] **Step 5: Watch the Pages workflow**

Use GitHub CLI to confirm the deployment workflow succeeds. If GitHub reports that Pages must use “GitHub Actions” as its source, stop and ask the repository owner to change that one repository setting; do not work around it by overwriting `docs/`.

- [ ] **Step 6: Run production smoke checks**

Verify:

- `https://imarchuang.github.io/`
- One migrated article path.
- One old `/#/...` URL and its resulting path.
- `https://imarchuang.github.io/draw/`
- `https://imarchuang.github.io/drops/orbit-sketch/`

Confirm visual rendering, status, and primary navigation in a live browser.

- [ ] **Step 7: Report the release**

Return the production URL, deployment workflow link, checks run, and any pre-existing broken links intentionally left unchanged.
