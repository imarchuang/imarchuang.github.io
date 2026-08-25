# OpenUI Streaming Demo Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Publish a self-contained interactive page that demonstrates how a prompt becomes streamed OpenUI Lang and then trusted native UI.

**Architecture:** One standalone `index.html` owns semantic markup, visual design, scenario fixtures, playback state, and a deterministic allowlisted renderer. It has no backend, build step, model call, package dependency, or string evaluation.

**Tech Stack:** HTML5, CSS, vanilla JavaScript, GitHub Pages, existing `pages-idea-drop` publisher, Playwright browser verification.

## Global Constraints

- Live path: `https://imarchuang.github.io/drops/openui-demo/`.
- No API key, backend, build step, or external runtime dependency.
- Illustrative OpenUI Lang must be labeled as illustrative.
- Never use `eval`, `Function`, `innerHTML`, or arbitrary string execution.
- Generated output may only select predefined local component renderers.
- Include dashboard, support triage, and launch checklist scenarios.
- Include play, pause, restart, step, speed, and scenario controls.
- Desktop is a three-stage pipeline; mobile is a vertical pipeline.
- Respect reduced motion and visible keyboard focus.

---

### Task 1: Build and publish the interactive demo

**Files:**
- Create: `/tmp/openui-demo/index.html`
- Publish as: `docs/drops/openui-demo/index.html`
- Modify through publisher: `docs/drops/index.html`
- Modify through publisher: `docs/ideas/index.md`

**Interfaces:**
- `SCENARIOS: Record<string, Scenario>` where each scenario has `title`, `prompt`, `catalog`, and ordered `steps`.
- `setScenario(id: string): void` cancels playback and resets local interaction state.
- `renderFrame(): void` renders controls, source statements, stage status, and trusted result components.
- `advance(): void` applies one predefined step and stops at completion.
- `setPlaying(next: boolean): void` owns the single playback timer.
- `renderComponent(node: ComponentNode): Node` maps allowlisted node types to DOM nodes and returns a blocked message for unknown types.

- [ ] **Step 1: Create the semantic page shell**

Create one `index.html` with:

```html
<header class="masthead">
  <a href="/drops/">Marc's drops</a>
  <p>OpenUI runtime observatory</p>
  <h1>Watch an interface arrive.</h1>
  <p>Prompt → illustrative OpenUI Lang → trusted native components.</p>
</header>
<nav class="scenario-tabs" aria-label="Demo scenario"></nav>
<main class="pipeline">
  <section class="stage stage-prompt" aria-labelledby="prompt-title"></section>
  <section class="stage stage-stream" aria-labelledby="stream-title"></section>
  <section class="stage stage-render" aria-labelledby="render-title"></section>
</main>
<footer class="controls" aria-label="Playback controls"></footer>
<noscript>This demo needs JavaScript to simulate streamed rendering.</noscript>
```

Add named palette variables from the design, Avenir/system and SFMono/system
font stacks, the animated signal rail, three-column/vertical responsive
layouts, `:focus-visible`, and `prefers-reduced-motion`.

- [ ] **Step 2: Define three deterministic scenario fixtures**

Each scenario must contain ordered objects shaped like:

```js
{
  lang: 'metric = MetricCard({ label: "Revenue", value: "$1.24M" })',
  status: "MetricCard validated",
  nodes: [
    { type: "MetricCard", id: "metric", props: { label: "Revenue", value: "$1.24M" } }
  ]
}
```

The catalog and nodes are data, never executable strings. Include:

- Revenue dashboard: `Stack`, `MetricCard`, `BarChart`, `DataTable`, `Tabs`.
- Support triage: `Stack`, `Badge`, `IssueSummary`, `ActionGroup`.
- Launch checklist: `Stack`, `Progress`, `Checklist`, `Approval`.

Include a forward-reference skeleton in at least one scenario so the result
panel visibly explains streaming-first rendering.

- [ ] **Step 3: Implement playback as a single-timer state machine**

Use this state contract:

```js
const state = {
  scenarioId: "dashboard",
  index: 0,
  playing: false,
  speed: 900,
  timer: null,
  interactions: {},
};
```

`setPlaying(false)` always clears `state.timer`. `advance()` increments at most
once, invokes `renderFrame()`, and schedules only one next timer. Playing at
completion calls `restart()` first. Scenario switches call `setPlaying(false)`
before resetting `index` and interactions.

- [ ] **Step 4: Implement the allowlisted renderer**

Use `document.createElement`, `textContent`, `append`, event listeners, and
explicit rendering functions. Dispatch only through:

```js
const RENDERERS = {
  Stack: renderStack,
  MetricCard: renderMetricCard,
  BarChart: renderBarChart,
  DataTable: renderDataTable,
  Tabs: renderTabs,
  Badge: renderBadge,
  IssueSummary: renderIssueSummary,
  ActionGroup: renderActionGroup,
  Progress: renderProgress,
  Checklist: renderChecklist,
  Approval: renderApproval,
  Skeleton: renderSkeleton,
};
```

Unknown types return a visible `blocked by component catalog` element. Tabs,
checklist items, support actions, and approval controls update only
`state.interactions`, then call `renderFrame()`.

- [ ] **Step 5: Wire accessible controls and explanatory copy**

Controls must expose:

```text
Play / Pause
Step
Restart
Speed: 0.5× / 1× / 2×
Scenario: Revenue dashboard / Support triage / Launch checklist
```

The stream panel shows completed lines, the active line, and pending lines.
The footer explains that real OpenUI derives model instructions from schemas,
streams a compact DSL, validates against a catalog, and maps to framework
components; this page simulates that path without running a model.

- [ ] **Step 6: Run static safety checks**

Run:

```bash
python3 - <<'PY'
from pathlib import Path
p = Path('/tmp/openui-demo/index.html')
s = p.read_text()
assert '<!DOCTYPE html>' in s
assert all(x not in s for x in ('eval(', 'new Function', '.innerHTML'))
assert all(x in s for x in ('dashboard', 'support', 'launch', 'prefers-reduced-motion'))
assert 'https://' not in s and 'http://' not in s
print('static checks passed')
PY
```

Expected: `static checks passed`.

- [ ] **Step 7: Verify locally in a browser**

Serve `/tmp/openui-demo` and verify:

1. Each scenario completes under Play.
2. Pause prevents advancement; Step advances exactly once.
3. Restart clears statements and generated UI.
4. 0.5×, 1×, and 2× alter timing.
5. Tabs, checklist, support actions, and approval update visibly.
6. Unknown-type safety can be exercised from the page's fixture without an exception.
7. Console has no errors or warnings.
8. At 390 × 844 the stages are ordered vertically and controls remain usable.
9. Keyboard focus is visible and reduced-motion disables signal animation.

- [ ] **Step 8: Publish and verify production**

Run:

```bash
python3 "$HOME/.claude/skills/pages-idea-drop/scripts/drop.py" html \
  --dir /tmp/openui-demo \
  --slug openui-demo \
  --blurb "Interactive walkthrough of prompt → OpenUI Lang → trusted streamed UI"
```

Expected URL:

`https://imarchuang.github.io/drops/openui-demo/`

Open it in a fresh browser tab, repeat play/pause/scenario/mobile smoke checks,
confirm HTTP assets and console are clean, then report the URL.

