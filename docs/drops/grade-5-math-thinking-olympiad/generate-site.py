#!/usr/bin/env python3
"""Generate static HTML site from the grade-5 math thinking textbook markdown."""

from __future__ import annotations

import html
import re
from pathlib import Path

SRC = Path("/Users/marc.huang/五年级数学思维训练教材.md")
OUT = Path(__file__).resolve().parent

UNIT_SLUGS = [
    ("学前诊断", "diagnostic", "课前定位起点", "#2E6B9E"),
    ("第一单元 画图与线段模型", "unit-01", "线段图与数量关系", "#315CFF"),
    ("第二单元 有序枚举：不重不漏", "unit-02", "分类列举", "#2FBF8F"),
    ("第三单元 规律与递推", "unit-03", "找规律与递推", "#7357FF"),
    ("第四单元 从结果倒着推", "unit-04", "倒推与逆运算", "#FF6846"),
    ("第五单元 假设法与等量替换", "unit-05", "鸡兔同笼类问题", "#9A4A20"),
    ("第六单元 因数、倍数与整除", "unit-06", "因数倍数与周期", "#006A78"),
    ("第七单元 分数：找准“单位 1”", "unit-07", "份数法与单位1", "#7A2048"),
    ("第八单元 计数：分步、分类与反面", "unit-08", "分步与排除", "#1F4F8A"),
    ("第九单元 面积：切、移、补", "unit-09", "等积变形", "#245A3D"),
    ("第十单元 立体图形与空间想象", "unit-10", "体积与涂色块", "#6A3FA0"),
    ("第十一单元 逻辑、奇偶与不变量", "unit-11", "奇偶与不变量", "#315CFF"),
    ("第十二单元 抽屉思想与“至少保证”", "unit-12", "最不利情况", "#2FBF8F"),
    ("第十三单元 天平、真假与信息", "unit-13", "天平与逻辑", "#FF6846"),
    ("第十四单元 综合建模：把生活问题数学化", "unit-14", "建模与方案比较", "#7357FF"),
    ("四次混合检测", "tests", "4次阶段检测", "#17212B"),
    ("挑战题提示索引", "hints", "分级提示", "#5A666E"),
    ("答案与解题要点", "answers", "教师与家长参考", "#17212B"),
    ("16 周教学安排", "schedule", "周计划", "#315CFF"),
    ("教师提问句库", "questions", "课堂提问", "#2FBF8F"),
    ("错题记录模板", "mistakes", "复盘模板", "#FF6846"),
    ("编写依据与延伸资源", "references", "参考来源", "#5A666E"),
    ("使用提醒", "notes", "使用说明", "#5A666E"),
]

TITLE_MAP = {name: slug for name, slug, _, _ in UNIT_SLUGS}


def slug_for_heading(title: str) -> str:
    return TITLE_MAP.get(title, re.sub(r"[^a-z0-9]+", "-", title.lower()).strip("-") or "section")


def inline(text: str) -> str:
    text = html.escape(text)
    text = re.sub(r"`([^`]+)`", r"<code>\1</code>", text)
    text = re.sub(r"\*\*([^*]+)\*\*", r"<strong>\1</strong>", text)
    return text


def markdown_to_html(body: str) -> str:
    lines = body.splitlines()
    out: list[str] = []
    in_ul = False
    in_ol = False

    def close_lists() -> None:
        nonlocal in_ul, in_ol
        if in_ul:
            out.append("</ul>")
            in_ul = False
        if in_ol:
            out.append("</ol>")
            in_ol = False

    for raw in lines:
        line = raw.rstrip()
        if not line.strip():
            close_lists()
            continue
        if line.strip() == "---":
            close_lists()
            out.append("<hr>")
            continue
        if line.startswith("### "):
            close_lists()
            out.append(f"<h3>{inline(line[4:])}</h3>")
            continue
        if line.startswith("## "):
            close_lists()
            out.append(f"<h2>{inline(line[3:])}</h2>")
            continue
        if line.startswith("# "):
            close_lists()
            out.append(f"<h1>{inline(line[2:])}</h1>")
            continue
        if line.startswith("> "):
            close_lists()
            out.append(f"<blockquote><p>{inline(line[2:])}</p></blockquote>")
            continue
        m = re.match(r"^(\d+)\.\s+(.*)$", line)
        if m:
            if not in_ol:
                close_lists()
                out.append("<ol>")
                in_ol = True
            out.append(f"<li>{inline(m.group(2))}</li>")
            continue
        if line.startswith("- "):
            if not in_ul:
                close_lists()
                out.append("<ul>")
                in_ul = True
            out.append(f"<li>{inline(line[2:])}</li>")
            continue
        close_lists()
        out.append(f"<p>{inline(line)}</p>")

    close_lists()
    return "\n".join(out)


def split_sections(text: str) -> dict[str, str]:
    parts = re.split(r"(?m)^# ", text)
    sections: dict[str, str] = {}
    for part in parts:
        if not part.strip():
            continue
        title_line, _, body = part.partition("\n")
        title = title_line.strip()
        sections[title] = body.strip()
    return sections


def shell(title: str, slug: str, body_html: str, accent: str, active: str) -> str:
    nav_items = []
    for name, item_slug, label, color in UNIT_SLUGS:
        cls = ' class="active"' if item_slug == active else ""
        nav_items.append(
            f'<a href="./{item_slug}.html"{cls}><span class="dot" style="background:{color}"></span>'
            f"<span><strong>{html.escape(name.split()[0] if name.startswith('第') else name[:6])}</strong>"
            f"<small>{html.escape(label)}</small></span></a>"
        )

    return f"""<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="description" content="五年级数学思维训练教材：用奥林匹克数学题型训练会想、会说、会检查。">
  <link rel="icon" href="data:,">
  <title>{html.escape(title)} · 五年级数学思维训练</title>
  <style>
    :root {{
      --paper:#f7f4ec;
      --card:#fffdf8;
      --ink:#1d2a36;
      --muted:#5d6a74;
      --line:#d7d0c3;
      --accent:{accent};
      --grid:rgba(49,92,255,.08);
      --display:"Iowan Old Style","Palatino Linotype","Songti SC","Noto Serif SC",serif;
      --body:"Avenir Next","PingFang SC","Hiragino Sans GB","Microsoft YaHei",sans-serif;
      --mono:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;
    }}
    * {{ box-sizing:border-box; }}
    html {{ scroll-behavior:smooth; }}
    body {{
      margin:0;
      color:var(--ink);
      font:17px/1.72 var(--body);
      background:
        linear-gradient(var(--grid) 1px, transparent 1px),
        linear-gradient(90deg, var(--grid) 1px, transparent 1px),
        radial-gradient(circle at top left, #fff8ef 0%, var(--paper) 55%);
      background-size:24px 24px, 24px 24px, auto;
    }}
    a {{ color:var(--accent); text-underline-offset:.18em; }}
    .layout {{
      display:grid;
      grid-template-columns:minmax(240px, 280px) minmax(0, 1fr);
      min-height:100vh;
    }}
    .sidebar {{
      position:sticky; top:0; align-self:start;
      height:100vh; overflow:auto;
      padding:20px 16px 28px;
      border-right:1px solid var(--line);
      background:rgba(255,253,248,.92);
      backdrop-filter:blur(8px);
    }}
    .brand {{
      display:block; margin-bottom:18px; text-decoration:none; color:inherit;
    }}
    .brand strong {{
      display:block; font:700 1.05rem/1.25 var(--display);
      letter-spacing:-.02em;
    }}
    .brand small {{ color:var(--muted); font-size:.82rem; }}
    .nav {{ display:grid; gap:6px; }}
    .nav a {{
      display:grid; grid-template-columns:10px 1fr; gap:10px; align-items:start;
      padding:10px 10px; border:1px solid transparent; border-radius:14px;
      text-decoration:none; color:inherit;
    }}
    .nav a:hover {{ border-color:var(--line); background:rgba(255,255,255,.7); }}
    .nav a.active {{
      border-color:color-mix(in srgb, var(--accent) 35%, var(--line));
      background:color-mix(in srgb, var(--accent) 8%, white);
    }}
    .nav strong {{ display:block; font-size:.92rem; line-height:1.3; }}
    .nav small {{ display:block; color:var(--muted); font-size:.74rem; line-height:1.35; }}
    .dot {{ width:10px; height:10px; border-radius:50%; margin-top:5px; }}
    main {{ padding:28px clamp(18px, 4vw, 42px) 48px; }}
    .sheet {{
      max-width:860px;
      margin:0 auto;
      background:var(--card);
      border:1px solid var(--line);
      border-radius:28px;
      padding:clamp(22px, 4vw, 36px);
      box-shadow:0 18px 50px rgba(29,42,54,.08);
    }}
    .eyebrow {{
      display:inline-flex; align-items:center; gap:.45rem;
      margin-bottom:14px; padding:.35rem .7rem;
      border:1px solid var(--line); border-radius:999px;
      font:700 .72rem var(--mono); letter-spacing:.08em; text-transform:uppercase;
      color:var(--muted);
    }}
    .eyebrow::before {{
      content:""; width:.55rem; height:.55rem; border-radius:50%; background:var(--accent);
    }}
    h1, h2, h3 {{ font-family:var(--display); line-height:1.2; letter-spacing:-.02em; }}
    h1 {{ font-size:clamp(2rem, 4vw, 2.8rem); margin:0 0 1rem; }}
    h2 {{ font-size:clamp(1.35rem, 2.4vw, 1.8rem); margin:2rem 0 .8rem; }}
    h3 {{ font-size:1.08rem; margin:1.4rem 0 .55rem; }}
    p, ul, ol, blockquote {{ margin:0 0 1rem; }}
    ul, ol {{ padding-left:1.25rem; }}
    li + li {{ margin-top:.35rem; }}
    code {{
      padding:.08rem .35rem; border-radius:.35rem;
      background:rgba(29,42,54,.06); font:.92em var(--mono);
    }}
    blockquote {{
      margin:1rem 0; padding:.9rem 1rem;
      border-left:4px solid var(--accent);
      background:rgba(49,92,255,.05); color:var(--muted);
    }}
    hr {{ border:0; border-top:1px dashed var(--line); margin:1.6rem 0; }}
    .toolbar {{
      display:flex; flex-wrap:wrap; gap:10px; margin:0 0 18px;
    }}
    .btn {{
      appearance:none; border:1px solid var(--line); border-radius:999px;
      background:white; color:var(--ink); padding:.55rem .9rem;
      font:inherit; cursor:pointer;
    }}
    .btn:hover {{ border-color:var(--accent); }}
    .answers-hidden .answer-block {{ display:none; }}
    .answer-block {{
      margin-top:1rem; padding:1rem 1.1rem;
      border:1px dashed color-mix(in srgb, var(--accent) 40%, var(--line));
      border-radius:18px; background:rgba(255,255,255,.75);
    }}
    .mobile-top {{
      display:none; position:sticky; top:0; z-index:5;
      padding:12px 14px; border-bottom:1px solid var(--line);
      background:rgba(247,244,236,.95); backdrop-filter:blur(8px);
    }}
    @media (max-width: 920px) {{
      .layout {{ grid-template-columns:1fr; }}
      .sidebar {{ display:none; }}
      .mobile-top {{ display:flex; justify-content:space-between; align-items:center; gap:12px; }}
      .sheet {{ border-radius:22px; }}
    }}
    @media (prefers-reduced-motion: reduce) {{
      html {{ scroll-behavior:auto; }}
    }}
  </style>
</head>
<body>
  <div class="mobile-top">
    <a href="./index.html"><strong>思维训练教材</strong></a>
    <a class="btn" href="./index.html">目录</a>
  </div>
  <div class="layout">
    <aside class="sidebar">
      <a class="brand" href="./index.html">
        <strong>五年级数学思维训练</strong>
        <small>奥林匹克题型 · 14 单元 · 16 周</small>
      </a>
      <nav class="nav" aria-label="章节导航">
        {''.join(nav_items)}
      </nav>
    </aside>
    <main>
      <article class="sheet" id="content">
        <div class="eyebrow">Math Thinking</div>
        {body_html}
      </article>
    </main>
  </div>
  <script>
    (function () {{
      const page = document.body;
      const key = "g5-think-hide-answers";
      const hide = localStorage.getItem(key) !== "off";
      if (hide) page.classList.add("answers-hidden");
      const btn = document.getElementById("toggle-answers");
      if (btn) {{
        const sync = () => {{
          const hidden = page.classList.contains("answers-hidden");
          btn.textContent = hidden ? "显示答案与要点" : "隐藏答案与要点";
        }};
        sync();
        btn.addEventListener("click", () => {{
          page.classList.toggle("answers-hidden");
          localStorage.setItem(key, page.classList.contains("answers-hidden") ? "on" : "off");
          sync();
        }});
      }}
    }})();
  </script>
</body>
</html>
"""


def parse_answer_blocks(answer_text: str) -> dict[str, str]:
    chunks = re.split(r"(?m)^## ", answer_text)
    blocks: dict[str, str] = {}
    for chunk in chunks:
        if not chunk.strip():
            continue
        title, _, body = chunk.partition("\n")
        blocks[title.strip()] = body.strip()
    return blocks


ANSWER_KEY_FOR_SLUG = {
    "diagnostic": "学前诊断答案",
    "unit-01": "第一单元",
    "unit-02": "第二单元",
    "unit-03": "第三单元",
    "unit-04": "第四单元",
    "unit-05": "第五单元",
    "unit-06": "第六单元",
    "unit-07": "第七单元",
    "unit-08": "第八单元",
    "unit-09": "第九单元",
    "unit-10": "第十单元",
    "unit-11": "第十一单元",
    "unit-12": "第十二单元",
    "unit-13": "第十三单元",
    "unit-14": "第十四单元",
    "tests": "检测一",
}


def answer_append(slug: str, answer_blocks: dict[str, str]) -> str:
    if slug == "tests":
        parts = []
        for key in ("检测一", "检测二", "检测三", "检测四"):
            if key in answer_blocks:
                parts.append(f"<h2>{html.escape(key)}答案</h2>\n{markdown_to_html(answer_blocks[key])}")
        if not parts:
            return ""
        return (
            '<div class="toolbar"><button class="btn" id="toggle-answers" type="button">显示答案与要点</button></div>'
            f'<div class="answer-block">{"".join(parts)}</div>'
        )
    key = ANSWER_KEY_FOR_SLUG.get(slug)
    if not key or key not in answer_blocks:
        return ""
    return (
        '<div class="toolbar"><button class="btn" id="toggle-answers" type="button">显示答案与要点</button></div>'
        f'<div class="answer-block"><h2>答案与解题要点</h2>{markdown_to_html(answer_blocks[key])}</div>'
    )


def build_index(sections: dict[str, str]) -> str:
    intro = markdown_to_html(sections.get("五年级数学思维训练教材", ""))
    cards = []
    for idx, (name, slug, label, color) in enumerate(UNIT_SLUGS):
        if slug in {"answers", "hints", "questions", "mistakes", "references", "notes"}:
            continue
        num = f"第 {idx:02d}" if name.startswith("第") else name[:4]
        cards.append(
            f"""<article class="card" style="--accent:{color}">
              <div class="k">{html.escape(num)}</div>
              <h2>{html.escape(name)}</h2>
              <p>{html.escape(label)}</p>
              <a class="go" href="./{slug}.html">进入</a>
            </article>"""
        )

    return f"""<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="description" content="五年级数学思维训练教材：14单元奥数思维训练，含学前诊断、四次检测与完整答案。">
  <link rel="icon" href="data:,">
  <title>五年级数学思维训练教材</title>
  <style>
    :root {{
      --paper:#f7f4ec; --card:#fffdf8; --ink:#1d2a36; --muted:#5d6a74; --line:#d7d0c3;
      --display:"Iowan Old Style","Palatino Linotype","Songti SC","Noto Serif SC",serif;
      --body:"Avenir Next","PingFang SC","Hiragino Sans GB","Microsoft YaHei",sans-serif;
      --mono:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;
      --grid:rgba(49,92,255,.08);
    }}
    * {{ box-sizing:border-box; }}
    body {{
      margin:0; color:var(--ink); font:17px/1.72 var(--body);
      background:
        linear-gradient(var(--grid) 1px, transparent 1px),
        linear-gradient(90deg, var(--grid) 1px, transparent 1px),
        radial-gradient(circle at top left, #fff8ef 0%, var(--paper) 55%);
      background-size:24px 24px, 24px 24px, auto;
    }}
    .wrap {{ max-width:1180px; margin:0 auto; padding:28px 18px 42px; }}
    .hero {{
      background:var(--card); border:1px solid var(--line); border-radius:30px;
      padding:clamp(22px,4vw,34px); box-shadow:0 18px 50px rgba(29,42,54,.08);
      margin-bottom:18px;
    }}
    h1, h2 {{ font-family:var(--display); line-height:1.15; letter-spacing:-.03em; }}
    h1 {{ margin:0 0 .6rem; font-size:clamp(2.2rem,5vw,3.4rem); max-width:14ch; }}
    .hero p, .hero li {{ color:var(--muted); }}
    .meta {{ display:flex; flex-wrap:wrap; gap:8px; margin-top:14px; }}
    .meta span {{
      display:inline-flex; align-items:center; gap:.4rem; padding:.45rem .75rem;
      border:1px solid var(--line); border-radius:999px; background:white; font-size:.86rem;
    }}
    .grid {{ display:grid; grid-template-columns:repeat(auto-fit,minmax(260px,1fr)); gap:14px; }}
    .card {{
      --accent:#315CFF;
      background:var(--card); border:1px solid var(--line); border-radius:24px;
      padding:18px; display:grid; gap:8px; min-height:190px;
      box-shadow:0 10px 28px rgba(29,42,54,.05);
    }}
    .k {{ font:700 .72rem var(--mono); letter-spacing:.08em; text-transform:uppercase; color:var(--muted); }}
    .card h2 {{ margin:0; font-size:1.35rem; }}
    .card p {{ margin:0; color:var(--muted); line-height:1.6; }}
    .go {{
      margin-top:auto; display:inline-flex; align-items:center; justify-content:center;
      min-height:42px; width:max-content; padding:0 14px; border-radius:12px;
      background:var(--accent); color:white; text-decoration:none; font-weight:700;
    }}
    .footer-links {{ margin-top:18px; display:flex; flex-wrap:wrap; gap:10px; }}
    .footer-links a {{
      text-decoration:none; color:var(--ink); border:1px solid var(--line); border-radius:999px;
      padding:.55rem .9rem; background:white;
    }}
  </style>
</head>
<body>
  <main class="wrap">
    <section class="hero">
      <h1>五年级数学思维训练教材</h1>
      {intro}
      <div class="meta">
        <span>16 周 · 每周 1 次</span>
        <span>14 个专题单元</span>
        <span>原创题 · 不照搬竞赛真题</span>
        <span>教师与家长共用</span>
      </div>
      <div class="footer-links">
        <a href="./answers.html">答案与解题要点</a>
        <a href="./hints.html">挑战题提示</a>
        <a href="./schedule.html">16 周安排</a>
        <a href="./questions.html">教师提问句库</a>
      </div>
    </section>
    <section class="grid">
      {''.join(cards)}
    </section>
  </main>
</body>
</html>
"""


def main() -> None:
    text = SRC.read_text(encoding="utf-8")
    sections = split_sections(text)
    answer_blocks = parse_answer_blocks(sections.get("答案与解题要点", ""))
    OUT.mkdir(parents=True, exist_ok=True)

    (OUT / "index.html").write_text(build_index(sections), encoding="utf-8")

    for name, slug, _, accent in UNIT_SLUGS:
        body = sections.get(name, "")
        if not body and name != "五年级数学思维训练教材":
            continue
        html_body = markdown_to_html(body)
        extra = answer_append(slug, answer_blocks)
        if slug == "answers":
            html_body = (
                '<div class="toolbar"><button class="btn" id="toggle-answers" type="button">显示答案与要点</button></div>'
                f'<div class="answer-block">{html_body}</div>'
            )
        elif extra:
            html_body += extra
        page = shell(name, slug, html_body, accent, slug)
        (OUT / f"{slug}.html").write_text(page, encoding="utf-8")

    print(f"generated {len(list(OUT.glob('*.html')))} html files in {OUT}")


if __name__ == "__main__":
    main()
