# Grade 5 Computer Science HTML Course (Bilingual)

Output directory: `.superpowers/grade5-computer-science-html-course`

## Access the course

- Course portal: `index.html`
- Chinese catalog: `zh/index.html`
- English catalog: `en/index.html`
- Chapter pages:
  - `zh/<chapter-key>/index.html`
  - `en/<chapter-key>/index.html`

Both editions are first-class standalone editions (not runtime overlays).

## Files and responsibilities

- `course-data.js`: bilingual structured course packs (`zh`, `en`) with chapter content, notes, misconceptions, demos, explorer items, and quick-check quiz data.
- `exercises.js`: bilingual exercise banks with `reinforcement[6]` and `bonus[2]` per chapter, each with hint/answer/rationale.
- `generate-course.js`: deterministic generator for portal + localized catalogs + chapter pages.
- `qa.js`: bilingual structural/static QA checks.
- `qa-report.txt`: executed commands, optimization rounds, and verification outcomes.

## Delivery guarantees

- 2 full editions: Chinese + English.
- 6 chapters per edition, 7 slides per chapter (84 slides total).
- 6 reinforcement + 2 bonus exercises per chapter (72 + 24 total across both editions).
- At least 2 meaningful interactions per chapter (implemented as demo + model explorer + quick-check quiz, plus exercise filtering/progress tools).
- Offline standalone HTML (inline CSS/JS), no npm dependencies, no external network/runtime fetches, no account creation, no PPT/PPTX.
- Accessibility and usability support:
  - deep links (`#slide-N`)
  - keyboard + touch navigation
  - teacher notes panel
  - answer reveal
  - reduced-motion CSS
  - print styles
  - local completion persistence (`grade5-cs:<locale>:<chapter>:...`)
- Explicit child online-safety guidance and fictional datasets in both editions.

## Regenerate

```bash
node .superpowers/grade5-computer-science-html-course/generate-course.js
```

## Run QA

```bash
node .superpowers/grade5-computer-science-html-course/qa.js
```

## Local preview

```bash
python3 -m http.server 8899 --directory ".superpowers/grade5-computer-science-html-course"
```

Open: `http://127.0.0.1:8899/index.html`
