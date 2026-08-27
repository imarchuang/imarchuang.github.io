# Expanded Article Reading Lane

## Goal

Make the default desktop article column feel substantially fuller without creating lines that are tiring to read. Preserve the Reading Desk navigation behavior, mobile layout, content hierarchy, routes, and accessibility.

## Current constraint

The article grid, header, and prose are capped at `68ch`. Together with two `48px` reading rails, a responsive gap up to `2.25rem`, and generous vertical padding, the main content occupies too little of a typical desktop viewport.

## Chosen design

Use a wider, denser desktop reading lane:

- Increase the article grid column, header, and prose maximum width from `68ch` to `76ch`.
- Reduce the desktop rail gap from a maximum of `2.25rem` to `1.5rem`.
- Reduce article-shell vertical padding from a maximum of `5rem` to `3.5rem`.
- Keep both reading rails at `48px`.
- Let callouts, code blocks, tables, and images use the complete `76ch` article lane.
- Keep typography, colors, overlay panels, reading progress, and editorial content styles unchanged.

At desktop widths, the article targets 60–70% of the viewport until it reaches the `76ch` cap. Between `901px` and the full `76ch` width, the center column remains fluid and consumes the available space without horizontal overflow.

## Responsive behavior

- The existing mobile/tablet breakpoint remains `900px`.
- At `900px` and below, the one-column article layout, mobile toolbar, and full-height dialogs remain unchanged.
- At `901px` and above, page gutters and grid tracks must allow the center column to shrink fluidly before causing overflow.
- The layout must remain usable at browser zoom levels up to 200%.

## Compatibility

This adjustment must not change:

- Reading-rail dimensions or open/close behavior.
- Overlay panel dimensions or non-reflow behavior.
- Mobile dialogs and exact breakpoint lifecycle.
- Article heading IDs, legacy fragments, reading progress, active-heading tracking, comments, pagination, code copying, or language metadata.

## Verification

- At `1440px`, the article column resolves to the full `76ch` maximum.
- At `1024px`, the center column is at least `700px` wide and the page has no horizontal overflow.
- Opening either desktop panel does not change the article x-position or width.
- At `900px` and below, existing mobile behavior is unchanged.
- Representative long paragraphs, callouts, code blocks, and tables remain readable.
- Existing article, responsive, and accessibility tests continue to pass.

## Out of scope

- Increasing body font size.
- Changing mobile content width or page gutters.
- Redesigning navigation controls, typography, colors, or article components.
- Rewriting article content.
