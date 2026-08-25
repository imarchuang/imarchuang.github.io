# Ideas

Scratch space. Markdown notes stay here; native HTML decks go under `docs/drops/`.

This site is public. Do not dump secrets.

## Markdown

Add `docs/ideas/<slug>.md` and link it below. Docsify URL:

`https://imarchuang.github.io/#/ideas/<slug>`

## Native HTML

Put a folder at `docs/drops/<slug>/` with `index.html` and relative assets. Open the **real path** (no `#/`):

`https://imarchuang.github.io/drops/<slug>/`

In Markdown, skip the Docsify router with `':ignore'`:

```markdown
[my-deck](/drops/my-deck/ ':ignore')
```

## Drops

* [grade-5-math-canvas-html-2026-fall](/drops/grade-5-math-canvas-html-2026-fall/ ':ignore') — 五年级上册数学九章互动式 HTML 课件，含强化练习、附加题、答案与教案
* [kafka-consumer-group-region-affinity](/drops/kafka-consumer-group-region-affinity/ ':ignore') — Kafka consumer group 的 region affinity 方案对比：拆 topic、拆 group、custom assignor 与应用内分派。
* [orbit-sketch](/drops/orbit-sketch/ ':ignore') — pointer-follow orbit canvas
* [example](/drops/example/ ':ignore') — native HTML + canvas
* [hello](/drops/hello/ ':ignore') — minimal shell

## Notes

* [grade-5-math-tutoring-2026-fall](./grade-5-math-tutoring-2026-fall) — 120分钟诊断式全册复习：小数、图形、代数、因数倍数与可能性
* [example](./example) — Markdown dump template
