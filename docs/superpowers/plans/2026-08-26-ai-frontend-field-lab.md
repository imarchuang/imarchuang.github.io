# AI Frontend Field Lab Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build and publish a static interactive lab that demonstrates spatial AI, semantic analysis, declarative generative UI, and reversible agent actions in one shared workflow.

**Architecture:** A single standalone `index.html` contains the visual system, immutable support-incident fixtures, explicit application state, station renderers, an allowlisted surface renderer, and an append-only event tape. No live AI is used; deterministic simulation makes every interaction repeatable and safe on GitHub Pages.

**Tech Stack:** Semantic HTML5, CSS, vanilla JavaScript, GitHub Pages, Playwright browser verification.

## Global Constraints

- Production URL: `https://imarchuang.github.io/drops/ai-frontend-field-lab/`.
- No framework, dependency install, build step, API key, backend, or external runtime dependency.
- Label model-like output and protocol messages as simulated or illustrative.
- Never use `eval`, `Function`, `innerHTML`, arbitrary HTML, or remote scripts.
- DOM output uses `createElement`, `textContent`, attributes, and event listeners.
- Respect keyboard operation, visible focus, polite announcements, reduced motion, and 390 px mobile width.
- Every consequential action has impact preview, explicit approval, audit output, and undo.

---

### Task 1: Build the shared-state interactive lab

**Files:**
- Create: `docs/drops/ai-frontend-field-lab/index.html`
- Modify: `docs/drops/index.html`
- Modify: `docs/ideas/index.md`

**Interfaces:**
- `state: LabState` owns `station`, evidence positions/clusters, selected query, surface stream, proposed action, execution history, and events.
- `setStation(id: "sense"|"ask"|"compose"|"act"): void` stops timers and renders the selected instrument.
- `appendEvent(type, actor, summary, payload, reversible): EventRecord` adds one event and updates the tape.
- `render(): void` updates case rail, active station, progress, event tape, and live region from state.
- `renderSurfaceNode(node: SurfaceNode): Node` dispatches only through the fixed renderer map.
- `executeAction(actionId, decision, modifications?): void` enforces risk behavior and creates an undo record.
- `undoAction(executionId): void` restores the prior fixture state and appends an undo event.

- [ ] **Step 1: Create the document shell and field-instrument visual system**

Create:

```html
<header class="lab-header">
  <a href="/drops/">Marc's drops</a>
  <p class="kicker">AI Frontend Field Lab · deterministic simulation</p>
  <h1>What happens when AI leaves the chat box?</h1>
  <p>Work one checkout incident through four frontend instruments.</p>
</header>
<main class="lab">
  <nav class="case-rail" aria-label="Lab instruments"></nav>
  <section class="instrument" aria-live="off"></section>
  <aside class="case-file" aria-label="Shared case state"></aside>
</main>
<section class="event-tape" aria-labelledby="event-title"></section>
<p class="sr-only" aria-live="polite" id="announcer"></p>
```

Use the exact palette and font roles from the design. Desktop is case rail /
instrument / case file; mobile is one column. The event tape's oscilloscope
line is the only ambient motion.

- [ ] **Step 2: Define fixtures and an explicit resettable state**

Define immutable evidence, rows, query scenarios, surface messages, and action
plans. Create fresh state through:

```js
function createInitialState() {
  return {
    station: "sense",
    evidence: EVIDENCE.map(item => ({ ...item })),
    clustered: false,
    queryId: null,
    surfaceIntent: "engineering",
    surfaceIndex: 0,
    surfacePlaying: false,
    surfaceTimer: null,
    proposedActionId: "rollback",
    executions: [],
    events: [createEvent("state", "system", "Case opened", { caseId: "CX-204" }, false)],
    eventFilter: "all",
    expandedEventId: null,
  };
}
```

All reset controls replace their station-specific state and append a reset
event. Never mutate fixture constants.

- [ ] **Step 3: Implement Sense with pointer and keyboard equivalents**

Render draggable evidence cards in a bounded canvas. Pointer drag updates
clamped percentages. Each card also has Move left/right/up/down buttons inside
an accessible actions menu. `clusterEvidence()` assigns deterministic
coordinates and groups, then appends a state event with the cue summary.

Controls: **Cluster signals**, **Reset canvas**, and card movement controls.
The explanation names semantic and spatial cues and marks the release note
distractor as unrelated.

- [ ] **Step 4: Implement Ask as inspectable semantic analysis**

Render the support data grid, metric dictionary, three query chips, generated
formula, query plan, result chart, confidence, and citations. Selecting a chip
must:

```js
state.queryId = queryId;
appendEvent("tool", "agent", `Analyzed ${query.label}`, query.plan, false);
render();
```

The chart uses CSS/HTML bars with text values. Highlight rows relevant to the
active query. A **Clear analysis** control restores the unselected view.

- [ ] **Step 5: Implement Compose with an allowlisted streamed surface**

Define:

```js
const SURFACE_RENDERERS = {
  Metric: renderMetric,
  Timeline: renderTimeline,
  EvidenceList: renderEvidenceList,
  Status: renderStatus,
  ActionCard: renderActionCard,
};
```

The user selects executive, engineering, or support intent and presses
**Generate surface**. One owner controls the timer. Each step appends an
illustrative protocol line and a `surface` event. Reduced motion renders all
steps synchronously. Unknown node types produce a visible “Blocked by client
catalog” component and never throw.

Controls: **Generate surface**, **Pause/Resume**, **Step**, **Reset**.

- [ ] **Step 6: Implement Act with risk, diff, decision, and undo**

Render three plan steps with `read-only`, `reversible`, and `consequential`
labels. The rollback action shows:

```text
Before: mobile-web 2026.08.25, 18% checkout failure
After:  mobile-web 2026.08.18, expected 4% checkout failure
Impact: ~3,400 active sessions restart checkout
```

Approve, edit, and reject are explicit controls. Edit exposes a bounded
percentage rollout input. Approve creates an execution record containing
`before`, `after`, and `undone: false`; reject records no side effect. Each
successful execution exposes **Undo this action** and undo toggles the record,
restores the before state, and appends a separate reversible event.

- [ ] **Step 7: Implement the shared event tape**

Filters are `all`, `state`, `tool`, `surface`, and `interrupt`. Each row shows
time, actor, type, summary, and reversibility. Row buttons use `aria-expanded`
and reveal payload using `JSON.stringify(payload, null, 2)` assigned to
`textContent`. The oscilloscope SVG/polyline or CSS line grows from event count
and pulses only on append when motion is allowed.

- [ ] **Step 8: Update navigation indexes**

Add the first drop entry in both indexes:

```html
<li><a href="./ai-frontend-field-lab/">ai-frontend-field-lab</a> — Four AI-native frontend patterns in one transparent, reversible workflow</li>
```

```markdown
* [ai-frontend-field-lab](/drops/ai-frontend-field-lab/ ':ignore') — Four AI-native frontend patterns in one transparent, reversible workflow
```

- [ ] **Step 9: Run static checks**

Run:

```bash
python3 - <<'PY'
from pathlib import Path
p = Path('docs/drops/ai-frontend-field-lab/index.html')
s = p.read_text()
assert '<!DOCTYPE html>' in s
assert all(x not in s for x in ('eval(', 'new Function', '.innerHTML', '<script src='))
assert all(x in s for x in ('sense', 'ask', 'compose', 'act', 'prefers-reduced-motion'))
assert all(x in s for x in ('Cluster signals', 'Generate surface', 'Undo this action'))
print('static checks passed')
PY
```

Expected: `static checks passed`.

- [ ] **Step 10: Commit**

Commit only the three task files with a message describing why the integrated
lab exists.

---

### Task 2: Browser critique, self-optimization, and production verification

**Files:**
- Modify if required: `docs/drops/ai-frontend-field-lab/index.html`

**Interfaces:**
- No new public interfaces. Preserve Task 1 state and renderer contracts.

- [ ] **Step 1: Run local behavioral verification**

Serve `docs/` and verify all station controls, drag, keyboard movement,
queries, streaming controls, event filters, payload expansion, decisions,
modified rollout, undo, and reset. Console must contain zero errors.

- [ ] **Step 2: Capture and critique desktop and mobile screenshots**

Capture at 1440 × 1000 and 390 × 844. Check:

- the active instrument is the first visual priority;
- event tape remains legible but secondary;
- no generic gradient hero or competing ambient effects;
- no clipped controls or horizontal page overflow;
- headings, labels, values, risk, and focus remain distinguishable.

Remove at least one nonessential visual detail if it competes with the tape.

- [ ] **Step 3: Verify accessibility behavior**

Navigate core flow by keyboard, inspect roles/labels/expanded state, enable
reduced motion, and confirm streaming produces the complete result without
waiting. Fix any blocker found.

- [ ] **Step 4: Commit optimization fixes**

If files changed, commit the focused fixes separately. If no changes are
needed, record that the review passed without a second commit.

- [ ] **Step 5: Push and verify GitHub Pages**

Push `master` to the configured remote. Open:

`https://imarchuang.github.io/drops/ai-frontend-field-lab/`

Repeat one full workflow on production, inspect console and network failures,
and verify the two index links. Report the production URL and summarize the
research-derived patterns demonstrated.

