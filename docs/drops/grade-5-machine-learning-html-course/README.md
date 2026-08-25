# Grade 5 Machine Learning HTML Course

This folder contains a complete, dependency-free, generated Grade 5 Machine Learning course in **two standalone editions**:

- Chinese edition (canonical): root files in this folder
- English edition (first-class sibling): `en/` folder

## Scope

- 6 chapters in Chinese + 6 chapters in English
- At least 7 slides per chapter (current build: 8 slides per chapter)
- At least 2 meaningful interactive moments per chapter (current build: 2 labs per chapter)
- 6 reinforcement exercises + 2 bonus exercises per chapter per language
- Standalone generated chapter HTML (self-contained CSS + JS, no npm/runtime dependency)

## Source Files

- `course-data.js`  
  Localized bilingual course metadata (`zh` + `en`) and chapter slide content.
- `exercises.js`  
  Localized bilingual exercise banks (`zh` + `en`) keyed by chapter key.
- `generate-course.js`  
  Bilingual generator + validators + runtime templates + interaction logic.
- `qa.js`  
  Static and structural QA assertions for both editions.

## Generated Files

Chinese edition:

- `index.html`
- `chapter-01-rules-learning.html`
- `chapter-02-data-features-labels.html`
- `chapter-03-classification-prediction.html`
- `chapter-04-training-testing-errors.html`
- `chapter-05-simple-decision-tree.html`
- `chapter-06-responsible-ai.html`

English edition:

- `en/index.html`
- `en/chapter-01-rules-learning.html`
- `en/chapter-02-data-features-labels.html`
- `en/chapter-03-classification-prediction.html`
- `en/chapter-04-training-testing-errors.html`
- `en/chapter-05-simple-decision-tree.html`
- `en/chapter-06-responsible-ai.html`

## Run

```bash
node .superpowers/grade5-machine-learning-html-course/generate-course.js
node .superpowers/grade5-machine-learning-html-course/qa.js
```

## Access

- Chinese catalog: `index.html`
- English catalog: `en/index.html`
- In-page language switch:
  - Chinese chapter -> English counterpart
  - English chapter -> Chinese counterpart

## Runtime Features

- Deep-link navigation with `#slide-N`
- Keyboard navigation (`ArrowLeft`, `ArrowRight`, `Home`, `End`, `PageUp`, `PageDown`, `Space`)
- Focused control safety: Space/Enter on `button`/`a`/`summary`/other controls trigger controls, not slide navigation
- Touch swipe navigation
- Notes panel toggle
- Fullscreen toggle
- Answer reveal toggles
- Exercise self-response and instant feedback prompts
- Completion persistence via localStorage keys: `grade5-ml:<locale>:<chapter>:<exercise>`
- Responsive layout and 44px touch targets
- Reduced-motion handling
- Print stylesheet

## Safety / Content Guardrails

- No external network dependencies in generated chapter pages
- No PPT/PPTX assets
- Fictional child-safe data only
- Non-anthropomorphic ML wording
- Accessibility-aware controls for keyboard/touch workflows
