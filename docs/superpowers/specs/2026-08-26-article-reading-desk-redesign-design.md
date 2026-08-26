# Article Reading Desk Redesign

## Goal

Make technical-note pages feel focused, modern, and comfortable for long-form reading. Navigation must remain easy to reach without reserving large permanent columns beside the article.

The redesign applies to Astro article pages only. It keeps the existing Contemporary Field Notes palette, local fonts, routes, migrated Markdown, comments, search, and legacy-link behavior.

## Current problems

- The desktop section navigation hides its contents but the outer grid continues to reserve a `16–18rem` column. The page therefore does not visually collapse.
- The table of contents permanently reserves `14–18rem` and has no collapse control.
- Three strong vertical columns make the article feel constrained and institutional.
- Paragraphs, headings, quotations, and code blocks have limited visual differentiation, producing a dry reading rhythm.

## Chosen direction: Reading Desk

The default desktop layout is content-first:

- A narrow section-navigation rail appears to the left of the article.
- A narrow table-of-contents rail appears to the right.
- Each rail is approximately `40–48px` wide and contains one clear control plus a vertical label.
- Opening either control reveals an overlay panel. Panels do not resize or displace the article.
- Only one overlay panel may be open at a time.
- The article remains centered at a readable measure between `64ch` and `68ch`.

This retains persistent navigation affordances while giving the article most of the viewport. It replaces the current fixed three-column frame rather than merely styling it.

## Desktop structure

The article shell contains:

1. A page-level reading progress indicator directly below the global header.
2. A left navigation rail.
3. The article column.
4. A right table-of-contents rail.
5. Overlay panels rendered above the reading surface.

The rails are sticky within the viewport. They remain visually quiet until hovered, focused, or active. Rail controls have text alternatives and visible focus states.

On very wide screens the complete reading desk remains centered instead of stretching the article. On narrower desktop screens the rails stay compact before the mobile layout takes over.

## Section navigation panel

The left rail button opens a non-modal side sheet from the left:

- The sheet shows “章节导航” and the existing generated navigation tree.
- The active article and its ancestor branch are visibly highlighted.
- The complete tree remains scrollable without increasing the closed layout width.
- Selecting an article follows the existing route.
- The sheet closes through its close button, `Escape`, or a click on the backdrop.
- Focus moves into the panel when it opens and returns to the rail button when it closes.

The panel is closed by default for first-time visitors. Its open or closed state is stored independently in `localStorage`: reloading the same article restores an open panel, while following an article link closes the panel and stores the closed state before navigation. A newly selected article therefore starts unobscured. If storage is unavailable, the interaction continues without persistence.

## Table-of-contents panel

The right rail button opens a compact panel from the right:

- The panel contains headings up to depth four, matching the current generated table of contents.
- The currently visible section is highlighted with `aria-current="location"`.
- Selecting a heading updates the fragment and scrolls using the existing heading anchors.
- The panel closes after a heading is selected.
- Close, backdrop, focus-return, and keyboard behavior match the section navigation panel.

Its open or closed state uses a separate persistence key and follows the same reload and navigation rules as the section navigation panel.

The right rail is omitted when an article has fewer than two eligible headings.

## Reading progress

A thin progress line below the global header represents article reading progress from zero to one hundred percent. It uses the existing cobalt accent and updates without changing document layout.

The indicator is decorative and is hidden from assistive technology. It does not animate when reduced motion is requested.

## Article presentation

The article header becomes a compact editorial introduction:

- Category or navigation context appears as a small aqua metadata label.
- The title remains the dominant element but uses a slightly less extreme maximum size on article pages.
- The existing description becomes the article lede.

The prose uses a calmer but more varied rhythm:

- Body copy uses a larger line height and slightly stronger contrast.
- Paragraph spacing increases without adding separators between every block.
- Level-two headings receive a small cobalt marker and more space above than below.
- Level-three headings remain quieter to preserve hierarchy.
- The first substantial introductory block may be styled as a “Core idea” callout only when it is the article description or an explicit blockquote; arbitrary first paragraphs are not reinterpreted.
- Blockquotes use a lightly tinted surface and coral accent rule.
- Code blocks use a deeper ink surface, retain the existing copy control, and remain horizontally scrollable.
- Tables use a bordered scrolling container on narrow widths.
- Images may extend slightly beyond the text measure on desktop but never beyond the article column.

The design avoids generic card grids, glass effects, excessive rounded corners, and decorative animation.

## Responsive behavior

At mobile and tablet widths:

- Both desktop rails disappear.
- A compact sticky reading toolbar provides “章节” and, when available, “目录” controls.
- Both controls open full-height dialogs using the same navigation and table-of-contents content.
- The article occupies one column with mobile-safe padding.
- Wide code blocks and tables scroll within their own containers.

The mobile dialogs preserve the same close, focus, and `Escape` behavior as desktop panels.

## Progressive enhancement

Without JavaScript:

- The article and all migrated content remain readable.
- A compact native disclosure above the article exposes section navigation.
- The table of contents appears as a native disclosure when eligible.
- Existing links and heading fragments continue to work.

JavaScript enhances the disclosures into rails, overlay panels, active-heading tracking, state persistence, and reading progress.

## Compatibility

The redesign must not change:

- Article paths or trailing-slash behavior.
- Generated heading IDs.
- Legacy fragment normalization and `hashchange` handling.
- Navigation ordering, previous/next links, comments, or code-copy semantics.
- Article `lang` values.

## Accessibility

- All controls use semantic buttons and accurate `aria-expanded` and `aria-controls` values.
- Overlay panels expose an appropriate dialog label.
- Focus is contained while a modal mobile dialog is open.
- Desktop non-modal panels provide predictable focus entry and return without trapping readers.
- Touch targets are at least `44px` on mobile.
- Text and interactive states meet WCAG AA contrast.
- Reduced-motion preferences disable panel and progress animations.
- Content remains usable at 200% zoom and at a 320px viewport width.

## Verification

Automated and manual checks cover:

- The default desktop layout reserves no wide navigation columns.
- Opening either panel does not change article width or horizontal position.
- Only one panel can be open at a time.
- Close button, backdrop, and `Escape` interactions work and restore focus.
- State persistence fails safely when storage is unavailable.
- Current-section highlighting updates while scrolling and after fragment navigation.
- Articles without eligible headings omit the table-of-contents control.
- Mobile dialogs and no-JavaScript disclosures expose equivalent navigation.
- Legacy fragments, code copying, previous/next links, comments, and article languages remain functional.
- Representative Chinese and English articles pass responsive and accessibility smoke tests.

## Out of scope

- Rewriting migrated article content.
- Changing global navigation or homepage design.
- Adding user accounts, annotations, bookmarks, or server-side state.
- Replacing Pagefind, Utterances, or the Markdown rendering pipeline.
