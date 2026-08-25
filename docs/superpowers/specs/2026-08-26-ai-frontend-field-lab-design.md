# AI Frontend Field Lab Design

## Goal

Publish a self-contained, interactive GitHub Pages demo that teaches four
AI-native frontend patterns through one coherent support-incident workflow:

1. spatial AI over a canvas,
2. natural-language analysis over governed data,
3. streamed declarative generative UI,
4. transparent agent actions with approval and undo.

The page is an educational simulation. It makes no model or backend request and
never implies that fixture output was generated live.

## Research synthesis

Three research passes converged on the same shift: useful AI frontends are
moving beyond a chat box toward direct manipulation, shared state, generated
surfaces, and visible human control.

- [tldraw Make Real](https://tldraw.dev/blog/make-real-the-story-so-far)
  demonstrates a canvas as a multimodal conversation space where sketches,
  annotations, and generated artifacts coexist.
- [A2UI](https://a2ui.org/) streams declarative, framework-independent UI
  descriptions that clients render from approved component catalogs without
  executing arbitrary code.
- [AG-UI](https://docs.ag-ui.com/introduction) standardizes shared state,
  frontend tools, and interrupt-driven human approval.
- [MCP Apps](https://blog.modelcontextprotocol.io/posts/2026-01-26-mcp-apps/)
  lets tools return sandboxed interactive surfaces instead of flattening rich
  workflows into text.
- Current agent UX guidance consistently recommends intent previews, visible
  tool boundaries, risk-tiered approvals, recoverable actions, and an audit
  trail instead of an opaque spinner.

## Approaches considered

### Recommended: one case, four instruments

Use one fictional support incident across four interactive stations. Every
station modifies a shared case state and appends to an event tape. This makes
the connection between patterns visible and gives the page a beginning,
middle, and end.

### Alternative: pattern gallery

Four independent cards would be quicker to scan but would reproduce the
fragmentation that AI protocols are meant to solve. Shared state and handoff
would remain abstract.

### Alternative: one deep generative UI demo

A single streamed renderer would be technically focused but would overlap the
existing OpenUI demo and omit spatial context, semantic data interfaces, and
human control.

## Experience

The page is called **AI Frontend Field Lab**. Its fictional case is a spike in
checkout complaints after a mobile release. The user works through four
instruments:

### 1. Sense — spatial evidence canvas

The canvas begins with scattered customer quotes, telemetry, release notes, and
a distractor. The user can drag evidence cards and invoke **Cluster signals**.
The simulation groups relevant cards into “mobile checkout” and “payment
latency,” leaves the distractor separate, and explains which spatial and
semantic cues were used. A reset control restores the raw canvas.

### 2. Ask — semantic data sheet

A compact grid exposes governed fields and metric definitions. Prompt chips
such as “Which release changed failure rate?” and “Segment by platform” update
a chart, highlighted rows, a generated formula, confidence, and source
citations. The interface shows the query plan so the answer is inspectable
rather than magical.

### 3. Compose — declarative surface stream

The user chooses an intent: executive brief, engineering diagnosis, or support
playbook. Pressing **Generate surface** streams an illustrative A2UI-like event
sequence. An allowlisted local renderer assembles native components from
`Metric`, `Timeline`, `EvidenceList`, `Status`, and `ActionCard`. Unknown
components are visibly blocked. The stream is explicitly labeled simulated.

### 4. Act — agent plan, approval, and undo

The agent proposes three actions with risk labels:

- read-only: inspect release telemetry, auto-runnable;
- reversible: draft a customer banner, preview required;
- consequential: roll back the mobile release, explicit approval required.

The user can inspect a before/after diff, approve, edit, or reject the
consequential action. An executed action always exposes **Undo**, and undo
creates its own audit event.

## Shared event tape

A sticky event tape is the signature element. It is not decoration: it shows
the application-level contract between human, agent, and frontend.

Each event has a timestamp, actor, event type, summary, and reversible status.
Filters switch among `state`, `tool`, `surface`, and `interrupt`. Expanding an
event reveals a small JSON patch or payload. The tape persists while moving
between instruments, making the handoff legible.

## Visual direction

The page resembles a transparent scientific field instrument, not a chatbot or
generic SaaS dashboard.

### Palette

- Polar paper `#F1F4F0`
- Carbon ink `#17212B`
- Instrument blue `#315CFF`
- Signal coral `#FF6846`
- Verified mint `#2FBF8F`
- Spectral violet `#7357FF`
- Rule gray `#CCD4D1`

### Type

- Display: `Rockwell`, `Roboto Slab`, `Iowan Old Style`, serif
- Body: `Avenir Next`, `Segoe UI`, system sans
- Utility/data: `SFMono-Regular`, `Consolas`, monospace

### Layout

Desktop uses a narrow case rail, a large active instrument, and the event tape
across the bottom. Mobile becomes a single vertical flow with the case rail as
a horizontal stepper and the event tape in normal document flow.

### Signature

The event tape uses an oscilloscope-like line that grows with each state
transition. A brief pulse connects the active instrument to the newly appended
event. Reduced-motion mode removes the pulse and draws the final state
immediately.

## Architecture and safety

The production artifact is one static `index.html` containing semantic HTML,
CSS, fixture data, and vanilla JavaScript.

- No framework, package install, build step, API key, backend, or external
  runtime dependency.
- Fixtures are immutable scenario data. Interaction state is a separate plain
  object with an explicit reset path.
- Declarative UI dispatches through a fixed renderer map.
- DOM is created with `createElement`, `textContent`, and event listeners.
- No `eval`, `Function`, `innerHTML`, remote script, or arbitrary HTML.
- All timers have one owner and are cancelled on station reset or navigation.

## Accessibility and responsive behavior

- Every control is keyboard reachable with visible focus.
- Canvas cards have equivalent move controls for keyboard users.
- Tabs and step navigation use appropriate ARIA state.
- Status changes use a polite live region.
- Color is never the only signal for risk or event type.
- At 390 px, no horizontal page overflow is allowed.
- `prefers-reduced-motion` disables pulses, animated clustering, and streamed
  delays while preserving all outcomes.

## Verification and self-optimization

Verification happens in three loops:

1. **Behavior loop:** exercise all stations, filters, approvals, undo, resets,
   and blocked-component handling; fix state or timer defects.
2. **Visual loop:** capture desktop and mobile screenshots, critique hierarchy,
   density, overflow, and the single signature element; remove decorative
   effects that compete with the event tape.
3. **Production loop:** verify the GitHub Pages URL, network requests, console,
   keyboard flow, and reduced-motion behavior.

Success means the user can explain the four patterns after interacting with one
case, every consequential action is understandable and reversible, and the
page works without network access after initial HTML delivery.

