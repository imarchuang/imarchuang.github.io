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

* [hello](/drops/hello/ ':ignore') — sample native HTML

## Notes

* (empty — add `docs/ideas/<slug>.md` and list it here)
