# Astro Portfolio Redesign

## Goal

Replace the dated Docsify homepage with a modern, Chinese-first personal portfolio that presents Marc Huang as a product-minded technical leader. Preserve the technical knowledge base, visual explainers, whiteboard, downloads, and existing public links while migrating the site to Astro.

## Audience and primary action

The primary audience is peers, hiring managers, collaborators, and technical readers encountering Marc's work for the first time. Within ten seconds, visitors should understand Marc's positioning and be able to browse his visual work. Technical notes remain a prominent secondary destination.

The homepage leads in Chinese. Existing articles retain their source language.

## Architecture

- Add an Astro application under `site/`.
- Store migrated Markdown in an Astro content collection while preserving section slugs such as `/system/`, `/coding/`, and `/python/`.
- Keep `whiteboard/` as a separate Vite application and build it into `/draw/`.
- Preserve standalone visual explainers and downloads under `/drops/`.
- Assemble the Astro site, whiteboard, drops, images, and downloads into one deployment artifact.
- Publish with GitHub Actions instead of serving `master:/docs`.
- Keep the old `docs/` deployment intact until the Astro artifact passes verification.

The Astro application owns page layouts, routing, navigation, metadata, and search. Static sub-applications under `/draw/` and `/drops/` remain isolated and do not inherit the Astro shell.

## Route compatibility

Existing Docsify URLs use fragments that GitHub Pages never sends to the server. A root-page compatibility script will translate old URLs such as `/#/system/index` to `/system/` and `/#/coding/example` to `/coding/example/`.

The migration preserves:

- Section and article paths after removing the Docsify hash prefix.
- `/draw/` and all `/drops/<slug>/` routes.
- Existing image and download filenames.
- Trailing-slash URLs.
- Explicitly mapped heading anchors where Astro's generated slug differs from the current Docsify anchor.

Known stale links are documented separately and are not treated as migration regressions.

## Visual direction

The visual language is **Contemporary Field Notes**: modern, structured, and technical without looking like a terminal theme or a traditional publication.

### Color tokens

- `ink`: `#102630`
- `paper`: `#F5F8F7`
- `cobalt`: `#3658E6`
- `aqua`: `#BCECE3`
- `coral`: `#FF684F`
- `muted`: `#60747A`
- `line`: `#BAC8C5`

### Typography

- Display and Latin body: Manrope Variable.
- Chinese body and headings: Noto Sans SC.
- Labels and technical metadata: IBM Plex Mono.

Fonts are bundled with the site rather than loaded from a third-party CDN.

### Signature element

A restrained systems-path illustration connects nodes across an asymmetric grid. It appears once in the homepage's visual-work section and uses a short line-draw entrance animation. Motion is disabled when `prefers-reduced-motion` is enabled.

The interface uses square or minimally rounded geometry, thin structural rules, generous whitespace, and clear color fields. It avoids decorative card grids, glass effects, generic gradients, and excessive animation.

## Homepage

The homepage contains:

1. A compact navigation bar for work, notes, about, and GitHub.
2. A hero with the headline “把复杂系统变得清晰、可用。” and a short positioning statement.
3. A broad visual-work section describing Marc's approach to diagrams, experiments, and explainers without featuring one named project.
4. Three exploration paths: interactive explainers, technical notes, and Marc's work and leadership approach.
5. A concise footer with location, GitHub, email, and RSS.

The primary visual-work action opens the visual explainers index. Individual project titles appear inside that collection, not in the homepage hero.

## Reading shell

Article pages use the same colors and typography with a quieter hierarchy:

- Sticky top navigation with the site identity, search, and section links.
- Collapsible section navigation on desktop and a keyboard-accessible drawer on mobile.
- A readable article measure between 68 and 74 characters.
- A generated table of contents for long articles.
- Clear code blocks with copy controls and visible keyboard focus.
- Previous and next article links based on navigation order.
- One Utterances comment embed at the end of article pages; Gitalk is removed.

Search uses a static Pagefind index generated after the Astro build. A no-results state offers section links instead of leaving an empty panel.

## Content migration

The migration converts 174 Markdown files and replaces Docsify-specific constructs:

- Remove `':ignore'` link annotations.
- Normalize `.md`, relative, and hash-based links.
- Preserve raw HTML only where it is safe and required.
- Move shared images into stable public paths while preserving their URLs.
- Convert nested Docsify sidebars into explicit navigation data.
- Exclude `_coverpage.md`, `_navbar.md`, `_sidebar.md`, `_my404.md`, and Docsify setup files from the content collection.

The current Gitalk client secret is not migrated. It must be revoked because it is already present in repository history.

## Failure states

- Unknown paths render a branded 404 page with search and links to visual work and major note sections.
- Missing required content metadata, broken internal links, duplicate slugs, and missing copied artifacts fail CI.
- Search displays a clear no-results message and suggested destinations.
- Failed optional comment loading does not block article content.

## Accessibility and responsiveness

- Support keyboard navigation and visible focus for all controls.
- Maintain WCAG AA text contrast.
- Use semantic landmarks and a skip link.
- Respect reduced-motion and system font-size settings.
- Support layouts from 320-pixel mobile widths through wide desktop screens.
- Keep navigation and reading controls usable without JavaScript; search and the legacy hash bridge are the only progressive enhancements that require it.

## Verification

- Unit tests cover legacy hash translation, slug normalization, and navigation generation.
- Content validation checks duplicate routes, missing files, internal links, and preserved static artifacts.
- Browser tests cover homepage navigation, mobile menu behavior, search, one representative article, the 404 page, `/draw/`, and `/drops/`.
- Automated accessibility checks cover the homepage and article layout.
- The production build is served locally and visually checked at desktop and mobile widths before deployment.
- After deployment, smoke checks verify the homepage, a migrated article, one legacy hash URL, `/draw/`, and one `/drops/` page.

## Release

The release is complete when GitHub Pages serves the Astro artifact, compatibility smoke tests pass, and the old Docsify source is no longer the active deployment. The existing `docs/` files remain in git for one release as rollback material and can be removed in a later cleanup.
