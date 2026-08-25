# OpenUI streaming demo design

## Goal

Create a self-contained interactive page at
`https://imarchuang.github.io/drops/openui-demo/` that teaches how
[OpenUI](https://www.openui.com/) turns a natural-language request into
streamed OpenUI Lang and then into safe native UI components.

The demo is educational, not a real model integration. It must work on GitHub
Pages without an API key, backend, build step, or external runtime dependency.

## Experience

The page behaves like a small runtime observatory:

1. The left stage shows the user's prompt and the component library available
   to the model.
2. The middle stage streams one OpenUI Lang assignment at a time.
3. The right stage progressively renders the resulting interface.
4. A signal rail connects all three stages and marks the active pipeline step.

Users can play, pause, restart, and advance one statement. They can switch
between three scenarios:

- Revenue dashboard: cards, bar chart, and a regional table.
- Support triage: issue summary, priority badge, and actions.
- Launch checklist: progress, tasks, and an approval control.

The result panel is interactive where the generated component implies
interaction: tabs switch, checklist items toggle, and actions provide visible
feedback. These actions are local simulations and never call a backend.

## OpenUI concepts shown

Each scenario communicates the same five-step architecture:

1. A component catalog constrains what the model may compose.
2. The catalog becomes model instructions.
3. The model emits compact line-oriented OpenUI Lang.
4. Statements arrive incrementally and can reference later identifiers.
5. The renderer validates names and maps them to trusted local components;
   arbitrary code is never executed.

The OpenUI Lang samples are illustrative and should be labeled as such. The
page must not imply that its small handwritten parser is the production OpenUI
runtime.

## Architecture

Use one standalone `index.html` containing semantic HTML, CSS, scenario data,
the deterministic stream controller, and a small trusted component renderer.

The renderer does not evaluate strings. Scenario statements are paired with
predefined state transitions and component data. This preserves the security
lesson: generated output selects from an allowlisted catalog rather than
executing arbitrary JavaScript.

State is in memory only:

- selected scenario
- current statement index
- playing/paused state
- playback speed
- local interactions within the rendered example

Switching scenarios or pressing restart resets all state.

## Visual design

The visual metaphor is a protocol analyzer rather than a generic AI landing
page.

Palette:

- Ink: `#10172A`
- Signal blue: `#2477F3`
- Stream cyan: `#27B3C2`
- Render violet: `#6657D9`
- Warm status: `#F0A23A`
- Paper: `#F5F7FB`

Typography:

- Display and interface: `Avenir Next`, falling back to modern system sans.
- DSL and telemetry: `SFMono-Regular`, falling back to system monospace.

The signature element is the animated signal rail linking prompt, language,
and rendered UI. Motion is purposeful: one pulse advances with each streamed
statement. Reduced-motion users receive immediate state changes without pulse
animation.

Desktop uses three columns. Tablet and mobile become a vertical pipeline while
preserving controls and statement order. Keyboard focus must remain visible.

## Failure and edge states

- Pause stops before the next statement and preserves current output.
- Step works while paused and stops at the final statement.
- Play at completion restarts the active scenario.
- Scenario changes cancel the previous timer before resetting.
- Unknown component data renders a visible “blocked by catalog” message,
  demonstrating safe failure rather than throwing.
- JavaScript-disabled users see a short explanation of what the demo needs.

## Verification

Before publishing:

1. Validate the HTML structure and ensure no accidental external dependencies.
2. Serve the page from the repository’s `docs/` root.
3. Verify all three scenarios play from start to completion.
4. Verify pause, step, restart, speed control, and scenario switching.
5. Verify generated checklist/tab/action interactions.
6. Confirm the renderer never uses `eval`, `Function`, or injected HTML.
7. Check console errors and network failures.
8. Check desktop and a 390 × 844 mobile viewport.
9. Confirm reduced-motion styling and keyboard focus.
10. Publish through the existing `pages-idea-drop` workflow and verify the
    production URL.

