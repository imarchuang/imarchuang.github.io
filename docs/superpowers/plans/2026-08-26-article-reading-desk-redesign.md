# Article Reading Desk Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the article page’s permanently wide sidebars with compact reading rails and overlay panels, while giving the prose a more modern editorial rhythm.

**Architecture:** A new `ArticleReadingNavigation.astro` component owns all section-navigation and table-of-contents markup, including no-JavaScript disclosures, desktop rails, overlay sheets, and the mobile toolbar. A focused browser module owns panel state, persistence, active-heading tracking, and reading progress; `ArticleLayout.astro` remains responsible for article structure, code-copy behavior, and legacy fragments.

**Tech Stack:** Astro 7, TypeScript, CSS, Playwright, Vitest, Axe.

## Global Constraints

- Preserve all article routes, trailing slashes, heading IDs, legacy-fragment behavior, navigation order, previous/next links, comments, code-copy semantics, and article `lang` values.
- First-time visitors see both desktop panels closed.
- Closed desktop rails are `40–48px` wide; opened panels overlay the article and never resize or move it.
- The prose measure is between `64ch` and `68ch`.
- Only one reading panel may be open at a time.
- The table-of-contents controls are omitted when fewer than two depth-four-or-shallower headings exist.
- Mobile controls have at least `44px` touch targets.
- JavaScript-disabled pages expose both navigation collections through native disclosures.
- Respect `prefers-reduced-motion` and WCAG AA contrast.
- Do not add a runtime dependency.
- Do not create commits unless the user explicitly requests one.

---

## File map

- Create `site/src/components/ArticleReadingNavigation.astro`: all reading-navigation markup and labels.
- Create `site/src/scripts/article-reading.ts`: panel state machine, storage fallback, focus return, active heading, and progress.
- Modify `site/src/layouts/ArticleLayout.astro`: adopt the reading-desk structure and retain existing code-copy and fragment scripts.
- Modify `site/src/styles/article.css`: reading desk, overlay panels, mobile toolbar, and editorial prose styles.
- Modify `site/e2e/article.spec.ts`: behavioral, persistence, no-JavaScript, compatibility, and layout tests.
- Modify `site/e2e/accessibility.spec.ts`: Axe checks for opened reading panels.
- Delete `site/src/components/SectionNav.astro`: superseded by the unified reading-navigation component.
- Delete `site/src/components/TableOfContents.astro`: superseded by the unified reading-navigation component.

### Task 1: Lock the desktop interaction contract with failing tests

**Files:**
- Modify: `site/e2e/article.spec.ts`

**Interfaces:**
- Consumes: existing article route `/coding/classic/subsequence/`.
- Produces: required selectors `data-reading-root`, `data-reading-rail`, `data-reading-panel`, `data-reading-open`, `data-reading-close`, and `data-article-column`.

- [ ] **Step 1: Replace the existing desktop navigation and table-of-contents assertions**

Replace the first test’s desktop branch with:

```ts
if (testInfo.project.name === "mobile") {
  await expect(page.getByRole("button", { name: "章节", exact: true })).toBeVisible();
} else {
  await expect(page.locator('[data-reading-rail="section"]')).toBeVisible();
  await expect(page.locator('[data-reading-panel="section"]')).toBeHidden();
}
```

Replace “shows a table of contents on longer articles” with:

```ts
test("opens the article table of contents without moving the article", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name === "mobile");
  await page.goto("/coding/tree/");

  const article = page.locator("[data-article-column]");
  const before = await article.boundingBox();
  const open = page.getByRole("button", { name: "打开文章目录" });
  await open.click();

  const panel = page.locator('[data-reading-panel="toc"]');
  await expect(panel).toBeVisible();
  await expect(open).toHaveAttribute("aria-expanded", "true");
  await expect(panel.getByRole("link", { name: "我告诉你遍历回溯分治动规" })).toBeVisible();

  const after = await article.boundingBox();
  expect(after?.x).toBeCloseTo(before?.x ?? 0, 0);
  expect(after?.width).toBeCloseTo(before?.width ?? 0, 0);
});
```

- [ ] **Step 2: Add desktop rail, mutual exclusion, focus, and persistence tests**

Append:

```ts
test.describe("desktop reading rails", () => {
  test.beforeEach(async ({ page }, testInfo) => {
    test.skip(testInfo.project.name === "mobile");
    await page.addInitScript(() => localStorage.clear());
    await page.goto("/coding/classic/subsequence/");
  });

  test("renders compact rails", async ({ page }) => {
    const rails = page.locator("[data-reading-rail]");
    await expect(rails).toHaveCount(2);
    for (const rail of await rails.all()) {
      expect((await rail.boundingBox())?.width).toBeLessThanOrEqual(48);
    }
  });

  test("keeps only one overlay open and restores focus", async ({ page }) => {
    const sectionOpen = page.getByRole("button", { name: "打开章节导航" });
    const tocOpen = page.getByRole("button", { name: "打开文章目录" });
    await sectionOpen.click();
    await expect(page.locator('[data-reading-panel="section"]')).toBeVisible();

    await tocOpen.click();
    await expect(page.locator('[data-reading-panel="section"]')).toBeHidden();
    await expect(page.locator('[data-reading-panel="toc"]')).toBeVisible();

    await page.keyboard.press("Escape");
    await expect(page.locator('[data-reading-panel="toc"]')).toBeHidden();
    await expect(tocOpen).toBeFocused();
  });

  test("restores same-page state and survives unavailable storage", async ({ page }) => {
    const sectionOpen = page.getByRole("button", { name: "打开章节导航" });
    await sectionOpen.click();
    await page.reload();
    await expect(page.locator('[data-reading-panel="section"]')).toBeVisible();

    await page.getByRole("button", { name: "关闭章节导航" }).click();
    await page.reload();
    await expect(page.locator('[data-reading-panel="section"]')).toBeHidden();

    await page.addInitScript(() => {
      Storage.prototype.getItem = () => {
        throw new Error("storage unavailable");
      };
      Storage.prototype.setItem = () => {
        throw new Error("storage unavailable");
      };
    });
    await page.reload();
    await page.getByRole("button", { name: "打开章节导航" }).click();
    await expect(page.locator('[data-reading-panel="section"]')).toBeVisible();
  });
});
```

- [ ] **Step 3: Run the focused tests and confirm the contract fails**

Run:

```bash
cd site
npx playwright test e2e/article.spec.ts --project=chromium --grep "article table of contents|desktop reading rails"
```

Expected: FAIL because the reading-rail selectors and “打开文章目录” control do not exist yet.

### Task 2: Build unified navigation markup and the panel controller

**Files:**
- Create: `site/src/components/ArticleReadingNavigation.astro`
- Create: `site/src/scripts/article-reading.ts`
- Modify: `site/src/layouts/ArticleLayout.astro`
- Delete: `site/src/components/SectionNav.astro`
- Delete: `site/src/components/TableOfContents.astro`

**Interfaces:**
- `ArticleReadingNavigation.astro` consumes `{ navigation, currentPath, headings }`.
- `site/src/scripts/article-reading.ts` consumes the `data-reading-*` DOM contract from Task 1.
- `ArticleLayout.astro` produces `data-article-column` and `data-article-prose`.

- [ ] **Step 1: Create the unified Astro component**

Create `site/src/components/ArticleReadingNavigation.astro` with this structure:

```astro
---
import type { NavigationSection } from "../lib/navigation";
import SectionNavTree from "./SectionNavTree.astro";

interface HeadingLink {
  depth: number;
  slug: string;
  text: string;
}

interface Props {
  navigation: NavigationSection[];
  currentPath: string;
  headings: HeadingLink[];
}

const { navigation, currentPath, headings } = Astro.props;
const sections = navigation.filter((section) => section.href !== "/");
const tocItems = headings.filter((heading) => heading.depth <= 4);
const showToc = tocItems.length >= 2;
---

<div class="reading-fallbacks">
  <details>
    <summary>章节导航</summary>
    <nav aria-label="章节导航">
      <SectionNavTree items={sections} currentPath={currentPath} />
    </nav>
  </details>
  {showToc && (
    <details>
      <summary>文章目录</summary>
      <nav aria-label="文章目录">
        <ul class="article-toc-list">
          {tocItems.map((heading) => (
            <li style={`--toc-depth:${Math.max(heading.depth - 2, 0)}`}>
              <a href={`#${heading.slug}`}>{heading.text}</a>
            </li>
          ))}
        </ul>
      </nav>
    </details>
  )}
</div>

<aside class="reading-rail reading-rail-section" data-reading-rail="section">
  <button
    type="button"
    data-reading-open="section"
    data-reading-mode="desktop"
    aria-controls="reading-section-panel"
    aria-expanded="false"
    aria-label="打开章节导航"
  >☰</button>
  <span aria-hidden="true">章节导航</span>
</aside>

{showToc && (
  <aside class="reading-rail reading-rail-toc" data-reading-rail="toc">
    <button
      type="button"
      data-reading-open="toc"
      data-reading-mode="desktop"
      aria-controls="reading-toc-panel"
      aria-expanded="false"
      aria-label="打开文章目录"
    >•••</button>
    <span aria-hidden="true">本文目录</span>
  </aside>
)}

<div class="reading-mobile-toolbar" aria-label="阅读工具">
  <button type="button" data-reading-open="section" data-reading-mode="mobile"
    aria-controls="reading-section-dialog" aria-expanded="false">章节</button>
  {showToc && (
    <button type="button" data-reading-open="toc" data-reading-mode="mobile"
      aria-controls="reading-toc-dialog" aria-expanded="false">目录</button>
  )}
</div>

<button class="reading-panel-backdrop" type="button" data-reading-backdrop
  aria-label="关闭阅读面板" hidden></button>

<aside id="reading-section-panel" class="reading-panel reading-panel-section"
  data-reading-panel="section" role="dialog" aria-label="章节导航" hidden>
  <header>
    <div><p class="kicker">Browse notes</p><h2>章节导航</h2></div>
    <button type="button" data-reading-close="section" aria-label="关闭章节导航">关闭</button>
  </header>
  <nav aria-label="章节导航">
    <SectionNavTree items={sections} currentPath={currentPath} />
  </nav>
</aside>

{showToc && (
  <aside id="reading-toc-panel" class="reading-panel reading-panel-toc"
    data-reading-panel="toc" role="dialog" aria-label="文章目录" hidden>
    <header>
      <div><p class="kicker">On this page</p><h2>文章目录</h2></div>
      <button type="button" data-reading-close="toc" aria-label="关闭文章目录">关闭</button>
    </header>
    <nav aria-label="文章目录">
      <ul class="article-toc-list">
        {tocItems.map((heading) => (
          <li style={`--toc-depth:${Math.max(heading.depth - 2, 0)}`}>
            <a href={`#${heading.slug}`}>{heading.text}</a>
          </li>
        ))}
      </ul>
    </nav>
  </aside>
)}

<dialog id="reading-section-dialog" class="reading-dialog"
  data-reading-dialog="section" aria-label="章节导航">
  <header>
    <div><p class="kicker">Browse notes</p><h2>章节导航</h2></div>
    <button type="button" data-reading-close="section">关闭</button>
  </header>
  <nav aria-label="章节导航">
    <SectionNavTree items={sections} currentPath={currentPath} />
  </nav>
</dialog>

{showToc && (
  <dialog id="reading-toc-dialog" class="reading-dialog"
    data-reading-dialog="toc" aria-label="文章目录">
    <header>
      <div><p class="kicker">On this page</p><h2>文章目录</h2></div>
      <button type="button" data-reading-close="toc">关闭</button>
    </header>
    <nav aria-label="文章目录">
      <ul class="article-toc-list">
        {tocItems.map((heading) => (
          <li style={`--toc-depth:${Math.max(heading.depth - 2, 0)}`}>
            <a href={`#${heading.slug}`}>{heading.text}</a>
          </li>
        ))}
      </ul>
    </nav>
  </dialog>
)}
```

- [ ] **Step 2: Create the shared browser controller**

Create `site/src/scripts/article-reading.ts`:

```ts
type PanelName = "section" | "toc";
type PanelMode = "desktop" | "mobile";

const storageKey = (name: PanelName) => `article-reading:${name}:open`;

function readStored(name: PanelName): boolean {
  try {
    return localStorage.getItem(storageKey(name)) === "true";
  } catch {
    return false;
  }
}

function writeStored(name: PanelName, open: boolean): void {
  try {
    localStorage.setItem(storageKey(name), String(open));
  } catch {
    // Storage is an optional enhancement.
  }
}

function initializeReadingRoot(root: HTMLElement): void {
  let activeDesktop: PanelName | null = null;
  let lastTrigger: HTMLButtonElement | null = null;
  const backdrop = root.querySelector<HTMLButtonElement>("[data-reading-backdrop]");

  const triggers = (name: PanelName, mode: PanelMode) =>
    [...root.querySelectorAll<HTMLButtonElement>(
      `[data-reading-open="${name}"][data-reading-mode="${mode}"]`,
    )];

  const setExpanded = (name: PanelName, open: boolean): void => {
    root.querySelectorAll<HTMLButtonElement>(`[data-reading-open="${name}"]`)
      .forEach((button) => button.setAttribute("aria-expanded", String(open)));
  };

  const closeDesktop = (name: PanelName, restoreFocus = true): void => {
    const panel = root.querySelector<HTMLElement>(`[data-reading-panel="${name}"]`);
    if (panel) panel.hidden = true;
    setExpanded(name, false);
    writeStored(name, false);
    if (activeDesktop === name) activeDesktop = null;
    if (backdrop) backdrop.hidden = activeDesktop === null;
    if (restoreFocus) lastTrigger?.focus();
  };

  const openDesktop = (name: PanelName, trigger: HTMLButtonElement): void => {
    if (activeDesktop && activeDesktop !== name) closeDesktop(activeDesktop, false);
    const panel = root.querySelector<HTMLElement>(`[data-reading-panel="${name}"]`);
    if (!panel) return;
    lastTrigger = trigger;
    activeDesktop = name;
    panel.hidden = false;
    if (backdrop) backdrop.hidden = false;
    setExpanded(name, true);
    writeStored(name, true);
    panel.querySelector<HTMLElement>("button, a")?.focus();
  };

  const closeDialog = (name: PanelName): void => {
    const dialog = root.querySelector<HTMLDialogElement>(`[data-reading-dialog="${name}"]`);
    if (dialog?.open) dialog.close();
    setExpanded(name, false);
    lastTrigger?.focus();
  };

  root.querySelectorAll<HTMLButtonElement>("[data-reading-open]").forEach((trigger) => {
    trigger.addEventListener("click", () => {
      const name = trigger.dataset.readingOpen as PanelName;
      const mode = trigger.dataset.readingMode as PanelMode;
      lastTrigger = trigger;
      if (mode === "mobile") {
        const dialog = root.querySelector<HTMLDialogElement>(`[data-reading-dialog="${name}"]`);
        dialog?.showModal();
        setExpanded(name, true);
        return;
      }
      if (activeDesktop === name) closeDesktop(name);
      else openDesktop(name, trigger);
    });
  });

  root.querySelectorAll<HTMLButtonElement>("[data-reading-close]").forEach((button) => {
    button.addEventListener("click", () => {
      const name = button.dataset.readingClose as PanelName;
      const dialog = root.querySelector<HTMLDialogElement>(`[data-reading-dialog="${name}"]`);
      if (dialog?.open) closeDialog(name);
      else closeDesktop(name);
    });
  });

  backdrop?.addEventListener("click", () => {
    if (activeDesktop) closeDesktop(activeDesktop);
  });

  root.querySelectorAll<HTMLDialogElement>("[data-reading-dialog]").forEach((dialog) => {
    dialog.addEventListener("close", () => {
      const name = dialog.dataset.readingDialog as PanelName;
      setExpanded(name, false);
      lastTrigger?.focus();
    });
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && activeDesktop) closeDesktop(activeDesktop);
  });

  root.addEventListener("click", (event) => {
    const link = (event.target as Element).closest("a");
    if (!link) return;
    (["section", "toc"] as PanelName[]).forEach((name) => {
      writeStored(name, false);
      const dialog = root.querySelector<HTMLDialogElement>(`[data-reading-dialog="${name}"]`);
      if (dialog?.open) dialog.close();
    });
    if (activeDesktop) closeDesktop(activeDesktop, false);
  });

  (["section", "toc"] as PanelName[]).forEach((name) => {
    const trigger = triggers(name, "desktop")[0];
    if (trigger && readStored(name)) openDesktop(name, trigger);
  });
}

function initializeProgress(root: HTMLElement): void {
  const bar = root.querySelector<HTMLElement>("[data-reading-progress]");
  const article = root.querySelector<HTMLElement>("[data-article-column]");
  if (!bar || !article) return;
  let queued = false;
  const update = () => {
    const start = article.offsetTop;
    const distance = Math.max(article.offsetHeight - window.innerHeight, 1);
    const progress = Math.min(1, Math.max(0, (window.scrollY - start) / distance));
    bar.style.setProperty("--reading-progress", String(progress));
    queued = false;
  };
  window.addEventListener("scroll", () => {
    if (!queued) {
      queued = true;
      requestAnimationFrame(update);
    }
  }, { passive: true });
  update();
}

function initializeActiveHeading(root: HTMLElement): void {
  const links = [...root.querySelectorAll<HTMLAnchorElement>('.article-toc-list a[href^="#"]')];
  const headings = [...new Set(links.map((link) => {
    const id = decodeURIComponent(link.hash.slice(1));
    return document.getElementById(id);
  }).filter((heading): heading is HTMLElement => heading instanceof HTMLElement))];
  if (!headings.length) return;

  const markCurrent = (id: string) => {
    links.forEach((link) => {
      const current = decodeURIComponent(link.hash.slice(1)) === id;
      if (current) link.setAttribute("aria-current", "location");
      else link.removeAttribute("aria-current");
    });
  };
  let queued = false;
  const update = () => {
    const threshold = window.innerHeight * .3;
    const current = headings.reduce((selected, heading) =>
      heading.getBoundingClientRect().top <= threshold ? heading : selected,
    headings[0]);
    markCurrent(current.id);
    queued = false;
  };
  const requestUpdate = () => {
    if (!queued) {
      queued = true;
      requestAnimationFrame(update);
    }
  };
  window.addEventListener("scroll", requestUpdate, { passive: true });
  window.addEventListener("hashchange", requestUpdate);
  update();
}

document.querySelectorAll<HTMLElement>("[data-reading-root]").forEach((root) => {
  initializeReadingRoot(root);
  initializeProgress(root);
  initializeActiveHeading(root);
});
```

- [ ] **Step 3: Replace the article layout structure**

In `site/src/layouts/ArticleLayout.astro`:

- Replace the imports of `SectionNav` and `TableOfContents` with:

```astro
import ArticleReadingNavigation from "../components/ArticleReadingNavigation.astro";
```

- Remove `tocHeadings` and `showToc`.
- Replace lines 44–67 with:

```astro
<BaseLayout title={`${title} — Marc Huang`} description={description || title} language={language}>
  <div class="article-reading-root" data-reading-root>
    <div class="reading-progress" aria-hidden="true">
      <span data-reading-progress></span>
    </div>
    <div class="article-shell page-shell">
      <ArticleReadingNavigation
        navigation={navigation}
        currentPath={currentPath}
        headings={headings}
      />

      <article class="article-main" data-article-column>
        <header class="article-header">
          <p class="article-context">Knowledge base / Article</p>
          <h1>{title}</h1>
          {description && <p class="article-lede">{description}</p>}
        </header>

        <div class="article-prose-wrap">
          <div class="article-prose" data-article-prose>
            <slot />
          </div>
          <ArticlePager previous={previous} next={next} />
          <Comments />
        </div>
      </article>
    </div>
  </div>
</BaseLayout>

<script>
  import "../scripts/article-reading";
</script>
```

Keep the existing inline code-copy and legacy-fragment script unchanged below the new module script.

- [ ] **Step 4: Remove superseded components**

Delete:

```text
site/src/components/SectionNav.astro
site/src/components/TableOfContents.astro
```

- [ ] **Step 5: Run type and interaction checks**

Run:

```bash
cd site
npm run check
npx playwright test e2e/article.spec.ts --project=chromium --grep "keeps only one overlay|restores same-page state"
```

Expected: Astro check and the controller interaction tests pass. The compact-width and no-reflow tests remain red until Task 3 adds styles.

### Task 3: Implement the reading desk and editorial prose styling

**Files:**
- Modify: `site/src/styles/article.css`

**Interfaces:**
- Consumes: the classes and data attributes created in Task 2.
- Produces: a `48px / minmax(0, 68ch) / 48px` desktop desk, fixed overlay sheets, and a one-column mobile layout.

- [ ] **Step 1: Replace the article-shell and article-header rules**

Use:

```css
.article-reading-root {
  position: relative;
}

.article-shell {
  display: grid;
  grid-template-columns: 48px minmax(0, 68ch) 48px;
  justify-content: center;
  gap: clamp(1rem, 3vw, 2.25rem);
  padding-block: clamp(2.5rem, 7vw, 5rem);
}

.article-main {
  grid-column: 2;
  min-width: 0;
}

.article-header {
  max-width: 68ch;
  margin-bottom: clamp(2.5rem, 6vw, 4.5rem);
}

.article-context {
  display: inline-flex;
  margin: 0;
  padding: .45rem .65rem;
  background: color-mix(in srgb, var(--aqua) 72%, var(--paper));
  font: 500 .68rem/1 var(--font-code);
  letter-spacing: .09em;
  text-transform: uppercase;
}

.article-header h1 {
  margin: 1rem 0 0;
  font: 700 clamp(2.5rem, 5.5vw, 4.6rem)/1 var(--font-display);
  letter-spacing: -.055em;
  overflow-wrap: anywhere;
}

.article-lede {
  margin: 1.6rem 0 0;
  padding: 1.35rem 1.5rem;
  border-left: 4px solid var(--coral);
  background: color-mix(in srgb, white 72%, var(--paper));
  box-shadow: 0 1.2rem 3rem color-mix(in srgb, var(--ink) 8%, transparent);
  color: color-mix(in srgb, var(--ink) 82%, var(--muted));
  font-size: clamp(1.05rem, 2vw, 1.18rem);
  line-height: 1.75;
}
```

- [ ] **Step 2: Add rails, overlay panels, progress, and fallback rules**

Use:

```css
.reading-progress {
  position: sticky;
  z-index: 8;
  top: 0;
  height: 3px;
  background: color-mix(in srgb, var(--line) 55%, transparent);
}

.reading-progress span {
  display: block;
  width: 100%;
  height: 100%;
  background: var(--cobalt);
  transform: scaleX(var(--reading-progress, 0));
  transform-origin: left;
}

.reading-rail {
  position: sticky;
  top: 1.25rem;
  align-self: start;
  display: none;
  width: 48px;
  flex-direction: column;
  align-items: center;
  gap: .85rem;
}

html[data-js="true"] .reading-rail { display: flex; }

.reading-rail-section { grid-column: 1; }
.reading-rail-toc { grid-column: 3; }

.reading-rail button {
  display: grid;
  width: 44px;
  height: 44px;
  place-items: center;
  border: 1px solid var(--line);
  background: var(--paper);
  color: var(--ink);
  font: 700 .85rem/1 var(--font-code);
  cursor: pointer;
}

.reading-rail button:hover,
.reading-rail button[aria-expanded="true"] {
  border-color: var(--cobalt);
  background: var(--cobalt);
  color: white;
}

.reading-rail > span {
  color: var(--muted);
  font: 500 .62rem/1 var(--font-code);
  letter-spacing: .08em;
  writing-mode: vertical-rl;
}

.reading-panel {
  position: fixed;
  z-index: 12;
  top: 0;
  bottom: 0;
  width: min(23rem, calc(100vw - 3rem));
  overflow-y: auto;
  padding: 1.5rem;
  background: var(--ink);
  color: var(--paper);
  box-shadow: 0 0 4rem color-mix(in srgb, var(--ink) 26%, transparent);
}

.reading-panel-section { left: 0; }
.reading-panel-toc { right: 0; }
.reading-panel[hidden], .reading-panel-backdrop[hidden] { display: none; }

.reading-panel-backdrop {
  position: fixed;
  z-index: 11;
  inset: 0;
  border: 0;
  background: color-mix(in srgb, var(--ink) 20%, transparent);
  cursor: default;
}

.reading-panel header,
.reading-dialog header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  padding-bottom: 1.25rem;
  border-bottom: 1px solid color-mix(in srgb, var(--line) 45%, transparent);
}

.reading-panel h2,
.reading-dialog h2 {
  margin: .55rem 0 0;
  font-size: 1.45rem;
}

.reading-panel header button,
.reading-dialog header button {
  min-width: 44px;
  min-height: 44px;
  border: 1px solid currentColor;
  background: transparent;
  color: inherit;
  cursor: pointer;
}

.reading-panel .section-nav-list a,
.reading-panel .article-toc-list a {
  color: color-mix(in srgb, var(--paper) 76%, var(--muted));
}

.reading-panel .is-active > a,
.reading-panel [aria-current] {
  color: var(--aqua);
}

.reading-fallbacks,
.reading-mobile-toolbar,
.reading-dialog {
  display: none;
}

html:not([data-js="true"]) .reading-fallbacks {
  grid-column: 1 / -1;
  display: grid;
  gap: .75rem;
  margin-bottom: 1rem;
}

.reading-fallbacks details {
  border: 1px solid var(--line);
  padding: .85rem 1rem;
}

.reading-fallbacks summary {
  cursor: pointer;
  font-weight: 700;
}
```

- [ ] **Step 3: Replace prose typography and technical-content rules**

Use:

```css
.article-prose {
  max-width: 68ch;
  color: color-mix(in srgb, var(--ink) 88%, var(--muted));
  font-size: clamp(1rem, 1.2vw, 1.08rem);
  line-height: 1.82;
}

.article-prose > :first-child { margin-top: 0; }

.article-prose :where(h2, h3, h4, h5, h6) {
  color: var(--ink);
  line-height: 1.22;
  scroll-margin-top: 6rem;
}

.article-prose h2 {
  position: relative;
  margin: 4rem 0 1.25rem;
  padding-left: 1.25rem;
  font-size: clamp(1.7rem, 4vw, 2.35rem);
  letter-spacing: -.025em;
}

.article-prose h2::before {
  position: absolute;
  top: .45em;
  left: 0;
  width: .58rem;
  height: .58rem;
  border-radius: 50%;
  background: var(--cobalt);
  content: "";
}

.article-prose h3 {
  margin: 2.75rem 0 1rem;
  font-size: clamp(1.3rem, 3vw, 1.7rem);
}

.article-prose :where(p, ul, ol, blockquote, pre, table, hr) {
  margin: 1.25rem 0;
}

.article-prose :where(ul, ol) { padding-left: 1.45rem; }

.article-prose blockquote {
  margin-inline: 0;
  padding: 1rem 1.25rem;
  border-left: 4px solid var(--coral);
  background: color-mix(in srgb, var(--aqua) 22%, var(--paper));
  color: var(--muted);
}

.article-prose code { font-family: var(--font-code); }
.article-prose :where(p, li, blockquote, td, th) code {
  overflow-wrap: anywhere;
  word-break: break-word;
}

.article-prose pre {
  position: relative;
  overflow: auto;
  margin-block: 1.75rem;
  border: 1px solid color-mix(in srgb, var(--ink) 84%, black);
  padding: 3.25rem 1.25rem 1.25rem;
  background: var(--ink);
  color: var(--paper);
}

.article-prose pre code { white-space: pre; }

.article-prose table {
  display: block;
  width: 100%;
  overflow-x: auto;
  border-collapse: collapse;
}

.article-prose :where(th, td) {
  border: 1px solid var(--line);
  padding: .7rem .85rem;
  text-align: left;
}

.article-prose img {
  width: 100%;
  margin-block: 1.75rem;
}

.code-copy-button {
  position: absolute;
  top: .75rem;
  right: .75rem;
  border: 1px solid color-mix(in srgb, var(--paper) 45%, transparent);
  padding: .45rem .7rem;
  background: transparent;
  color: var(--paper);
  font: 500 .76rem/1 var(--font-code);
  cursor: pointer;
}
```

Retain the existing pager, comments, navigation-tree, and not-found rules, adjusting only their selectors from removed wrapper classes where needed.

- [ ] **Step 4: Add responsive behavior**

Use:

```css
@media (max-width: 900px) {
  .article-shell {
    grid-template-columns: minmax(0, 1fr);
    padding-bottom: 6rem;
  }

  .article-main { grid-column: 1; }
  html[data-js="true"] .reading-rail { display: none; }

  html[data-js="true"] .reading-mobile-toolbar {
    position: fixed;
    z-index: 9;
    right: 1rem;
    bottom: 1rem;
    display: flex;
    gap: .5rem;
    padding: .45rem;
    border: 1px solid var(--line);
    background: color-mix(in srgb, var(--paper) 94%, transparent);
    box-shadow: 0 .8rem 2rem color-mix(in srgb, var(--ink) 14%, transparent);
  }

  .reading-mobile-toolbar button {
    min-width: 52px;
    min-height: 44px;
    border: 0;
    background: transparent;
    color: var(--ink);
    font-weight: 700;
  }

  .reading-dialog {
    width: min(100%, 32rem);
    max-width: none;
    height: 100%;
    max-height: none;
    margin: 0 0 0 auto;
    border: 0;
    padding: 1.25rem;
    background: var(--ink);
    color: var(--paper);
  }

  .reading-dialog[open] { display: block; }
  .reading-dialog::backdrop {
    background: color-mix(in srgb, var(--ink) 35%, transparent);
  }
}

@media (max-width: 640px) {
  .article-header h1 {
    font-size: clamp(2.2rem, 12vw, 3.35rem);
  }

  .article-lede {
    margin-inline: calc(var(--page-gutter) * -.35);
    padding-inline: 1.1rem;
  }

  .article-prose h2 {
    margin-top: 3.25rem;
  }

  .article-pager {
    grid-template-columns: 1fr;
  }

  .article-pager-link-next {
    text-align: left;
  }
}

@media (prefers-reduced-motion: reduce) {
  .reading-progress span { transition: none; }
}
```

- [ ] **Step 5: Run focused desktop and mobile tests**

Run:

```bash
cd site
npm run check
npx playwright test e2e/article.spec.ts --project=chromium --grep "article table of contents|desktop reading rails"
npx playwright test e2e/article.spec.ts --project=mobile --grep "serves migrated articles|mobile section menu"
```

Expected: all selected tests pass.

### Task 4: Cover mobile, no-JavaScript, active headings, and accessibility

**Files:**
- Modify: `site/e2e/article.spec.ts`
- Modify: `site/e2e/accessibility.spec.ts`

**Interfaces:**
- Consumes: Task 2 controls and Task 3 responsive styles.
- Produces: regression coverage for the complete Reading Desk specification.

- [ ] **Step 1: Replace the mobile section-menu test**

Use:

```ts
test("opens mobile reading dialogs with keyboard and restores focus", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/coding/tree/");

  const sectionButton = page.getByRole("button", { name: "章节", exact: true });
  await sectionButton.focus();
  await page.keyboard.press("Enter");
  const sectionDialog = page.getByRole("dialog", { name: "章节导航" });
  await expect(sectionDialog).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(sectionDialog).toBeHidden();
  await expect(sectionButton).toBeFocused();

  const tocButton = page.getByRole("button", { name: "目录", exact: true });
  await tocButton.click();
  await expect(page.getByRole("dialog", { name: "文章目录" })).toBeVisible();
});
```

- [ ] **Step 2: Replace the no-JavaScript fallback test**

Use:

```ts
test("shows native reading disclosures without JavaScript", async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto("/coding/tree/");

  const sectionDisclosure = page.getByText("章节导航", { exact: true }).first();
  const tocDisclosure = page.getByText("文章目录", { exact: true }).first();
  await expect(sectionDisclosure).toBeVisible();
  await expect(tocDisclosure).toBeVisible();
  await expect(page.locator("[data-reading-rail]")).toBeHidden();
  await context.close();
});
```

- [ ] **Step 3: Add active-heading, short-article, progress, and compatibility tests**

Append:

```ts
test("tracks the current heading and reading progress", async ({ page }) => {
  await page.goto("/coding/tree/");
  await page.getByRole("heading", { name: "我告诉你遍历回溯分治动规" }).scrollIntoViewIfNeeded();
  await expect(page.locator('.article-toc-list a[aria-current="location"]').first())
    .toContainText("我告诉你遍历回溯分治动规");

  const progress = await page.locator("[data-reading-progress]").evaluate((element) =>
    Number(getComputedStyle(element).getPropertyValue("--reading-progress")),
  );
  expect(progress).toBeGreaterThan(0);
});

test("omits table-of-contents controls on short articles", async ({ page }) => {
  await page.goto("/ideas/example/");
  await expect(page.locator('[data-reading-rail="toc"]')).toHaveCount(0);
  await expect(page.getByRole("button", { name: "打开文章目录" })).toHaveCount(0);
});

test("keeps code copy and legacy fragment behavior after reading-desk initialization", async ({ page }) => {
  await page.goto("/sysde/LBS/#Scenario%E5%B1%82");
  await expect(page.locator('[id="scenario-层"]')).toBeInViewport();
  await page.goto("/python/functions/");
  await expect(page.getByRole("button", { name: /复制代码/ }).first()).toBeVisible();
});
```

- [ ] **Step 4: Add Axe coverage for open panels**

Append to `site/e2e/accessibility.spec.ts`:

```ts
test("opened reading panels have no serious accessibility violations", async ({ page }, testInfo) => {
  await page.goto("/coding/tree/");
  const trigger = testInfo.project.name === "mobile"
    ? page.getByRole("button", { name: "目录", exact: true })
    : page.getByRole("button", { name: "打开文章目录" });
  await trigger.click();

  const selector = testInfo.project.name === "mobile"
    ? '[data-reading-dialog="toc"]'
    : '[data-reading-panel="toc"]';
  await expect(page.locator(selector)).toBeVisible();

  const results = await new AxeBuilder({ page }).include(selector).analyze();
  const violations = results.violations.filter(
    ({ impact }) => impact === "serious" || impact === "critical",
  );
  expect(violations).toEqual([]);
});
```

- [ ] **Step 5: Run article and accessibility suites**

Run:

```bash
cd site
npx playwright test e2e/article.spec.ts e2e/accessibility.spec.ts
```

Expected: all tests pass in both Chromium projects.

### Task 5: Full verification and visual acceptance

**Files:**
- Modify only if verification reveals a regression in files already listed above.

**Interfaces:**
- Consumes: completed Reading Desk implementation.
- Produces: a deployable Astro artifact with compatibility evidence.

- [ ] **Step 1: Run static checks and unit tests**

Run:

```bash
cd site
npm run check
npm test
```

Expected: Astro reports zero errors; all Vitest tests pass.

- [ ] **Step 2: Build and validate the complete site**

Run:

```bash
cd site
npm run build
npm run validate
```

Expected: the Astro build, Pagefind indexing, static assembly, and link/asset validation all pass.

- [ ] **Step 3: Run the complete end-to-end suite**

Run:

```bash
cd site
npm run test:e2e
```

Expected: every desktop and mobile Playwright test passes.

- [ ] **Step 4: Perform visual checks at representative sizes**

Open `/coding/classic/subsequence/` at:

```text
1440 × 900
1024 × 768
390 × 844
320 × 568
```

Verify:

```text
- The initial article is centered and neither side reserves a wide empty column.
- Both 1440px rails are no wider than 48px.
- Opening either desktop panel leaves the article’s x-position and width unchanged.
- The title, lede, headings, body copy, quote, code, table, and image styles form a clear hierarchy.
- The mobile toolbar does not cover pager or comment controls at the end of the article.
- No viewport has horizontal page overflow.
- Focus indicators remain visible on every reading control.
```

- [ ] **Step 5: Inspect the final diff**

Run:

```bash
git status --short
git diff --check
git diff -- site/src/components/ArticleReadingNavigation.astro site/src/scripts/article-reading.ts site/src/layouts/ArticleLayout.astro site/src/styles/article.css site/e2e/article.spec.ts site/e2e/accessibility.spec.ts
```

Expected: only scoped article-reading files and the approved specification/plan are changed; `git diff --check` reports no whitespace errors.
