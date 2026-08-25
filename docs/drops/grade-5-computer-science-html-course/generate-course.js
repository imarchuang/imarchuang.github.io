const fs = require("fs");
const path = require("path");

const { locales } = require("./course-data");
const exercises = require("./exercises");

const OUTPUT_DIR = __dirname;
const TOTAL_SLIDES = 7;
const SUPPORTED_LOCALES = ["zh", "en"];

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function escapeAttr(value) {
  return escapeHtml(value).replace(/`/g, "&#96;");
}

function renderTemplate(template, vars) {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key) => String(vars[key] ?? ""));
}

function validateExercisesSet(locale, chapterKey, sectionName, items, expectedCount) {
  if (!Array.isArray(items) || items.length !== expectedCount) {
    throw new Error(`${locale}:${chapterKey} ${sectionName} must contain ${expectedCount} items`);
  }
  items.forEach((item, index) => {
    ["question", "hint", "answer", "rationale"].forEach((field) => {
      if (!item[field] || String(item[field]).trim().length === 0) {
        throw new Error(`Missing ${field} in ${locale}:${chapterKey} ${sectionName} #${index + 1}`);
      }
    });
  });
}

function validateData() {
  SUPPORTED_LOCALES.forEach((locale) => {
    const pack = locales[locale];
    if (!pack || !pack.course || !Array.isArray(pack.chapters)) {
      throw new Error(`Missing locale pack for ${locale}`);
    }
    if (pack.chapters.length !== 6) {
      throw new Error(`Expected 6 chapters for ${locale}, found ${pack.chapters.length}`);
    }
    if (!Array.isArray(pack.course.safetyGuidance) || pack.course.safetyGuidance.length < 3) {
      throw new Error(`Missing safety guidance for ${locale}`);
    }
    if (!pack.course.ui) {
      throw new Error(`Missing UI copy for ${locale}`);
    }
    pack.chapters.forEach((chapter, index) => {
      ["key", "number", "title", "tagline", "color", "slides", "misconceptions", "demo", "explorer", "quiz"].forEach((field) => {
        if (!chapter[field]) {
          throw new Error(`Missing field ${field} in ${locale}:${chapter.key || index}`);
        }
      });
      if (chapter.number !== index + 1) {
        throw new Error(`Chapter number mismatch in ${locale}:${chapter.key}`);
      }
      if (!Array.isArray(chapter.slides) || chapter.slides.length !== TOTAL_SLIDES) {
        throw new Error(`Slides must be ${TOTAL_SLIDES} in ${locale}:${chapter.key}`);
      }
      chapter.slides.forEach((slide, slideIndex) => {
        if (!slide.title || !slide.subtitle || !Array.isArray(slide.content) || slide.content.length < 2) {
          throw new Error(`Incomplete slide ${slideIndex + 1} in ${locale}:${chapter.key}`);
        }
        if (!slide.notes || !slide.notes.timing || !Array.isArray(slide.notes.prompts) || !Array.isArray(slide.notes.responses)) {
          throw new Error(`Missing notes in ${locale}:${chapter.key} slide ${slideIndex + 1}`);
        }
      });
      if (!chapter.demo.type || !chapter.demo.title || !chapter.demo.description || !chapter.demo.success || !chapter.demo.reset) {
        throw new Error(`Incomplete demo in ${locale}:${chapter.key}`);
      }
      if (!Array.isArray(chapter.explorer) || chapter.explorer.length < 3) {
        throw new Error(`Explorer must have >=3 items in ${locale}:${chapter.key}`);
      }
      if (!chapter.quiz.question || !Array.isArray(chapter.quiz.options) || chapter.quiz.options.length < 3) {
        throw new Error(`Quiz must have question and options in ${locale}:${chapter.key}`);
      }
      const bank = exercises[locale] && exercises[locale][chapter.key];
      if (!bank) {
        throw new Error(`Missing exercises for ${locale}:${chapter.key}`);
      }
      validateExercisesSet(locale, chapter.key, "reinforcement", bank.reinforcement, 6);
      validateExercisesSet(locale, chapter.key, "bonus", bank.bonus, 2);
    });
  });
}

function buildPortalHtml() {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Grade 5 Computer Science Course Portal</title>
  <link rel="icon" href="data:,">
  <style>
    :root{--ink:#1d2b3a;--muted:#5a6c7d;--line:#d8e4ec;--bg:#f4f8fc;--card:#fff}
    *{box-sizing:border-box}
    body{margin:0;background:var(--bg);color:var(--ink);font-family:-apple-system,BlinkMacSystemFont,"Segoe UI","PingFang SC","Microsoft YaHei",sans-serif}
    main{max-width:980px;margin:0 auto;padding:28px 16px}
    .hero{background:var(--card);border:1px solid var(--line);border-radius:20px;padding:22px}
    h1{margin:0 0 10px;font-size:clamp(28px,4vw,44px)}
    p{margin:0;color:var(--muted);line-height:1.7}
    .grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:14px;margin-top:16px}
    .card{background:var(--card);border:1px solid var(--line);border-radius:16px;padding:14px;display:grid;gap:8px}
    .go{display:inline-flex;min-height:44px;align-items:center;justify-content:center;border-radius:12px;background:#20507e;color:#fff;text-decoration:none;padding:10px 14px;font-weight:700}
  </style>
</head>
<body>
  <main>
    <section class="hero">
      <h1>Grade 5 Computer Science Course</h1>
      <p>Standalone bilingual package with full Chinese and English editions. Each chapter includes interactive demos, model explorer, quick checks, practice, notes, and safety guidance.</p>
    </section>
    <section class="grid">
      ${SUPPORTED_LOCALES.map((locale) => {
        const pack = locales[locale];
        return `<article class="card">
          <h2>${escapeHtml(pack.course.title)}</h2>
          <p>${escapeHtml(pack.course.description)}</p>
          <a class="go" href="./${locale}/index.html">${escapeHtml(pack.course.ui.localeLabel)} Edition</a>
        </article>`;
      }).join("")}
    </section>
  </main>
</body>
</html>`;
}

function buildLocaleIndexHtml(locale) {
  const pack = locales[locale];
  const ui = pack.course.ui;
  const peerLocale = locale === "zh" ? "en" : "zh";
  const peerHref = `../${peerLocale}/index.html`;
  return `<!doctype html>
<html lang="${escapeAttr(pack.course.language)}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(pack.course.title)}</title>
  <link rel="icon" href="data:,">
  <style>
    :root{--ink:#1d2b3a;--muted:#5a6c7d;--line:#d8e4ec;--bg:#f5f8fc;--card:#fff}
    *{box-sizing:border-box}
    body{margin:0;background:var(--bg);color:var(--ink);font-family:-apple-system,BlinkMacSystemFont,"Segoe UI","PingFang SC","Microsoft YaHei",sans-serif}
    main{max-width:1200px;margin:0 auto;padding:24px 16px}
    .hero,.card{background:var(--card);border:1px solid var(--line);border-radius:18px}
    .hero{padding:20px}
    h1{margin:0 0 8px;font-size:clamp(28px,4vw,42px)}
    p{margin:0;color:var(--muted);line-height:1.7}
    .safety{margin-top:12px;padding:10px;border-radius:12px;background:#fff5ea;border:1px solid #f1d3b0}
    .safety ul{margin:8px 0 0;padding-left:18px}
    .grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:12px;margin-top:14px}
    .card{padding:14px;display:grid;gap:8px}
    .chip{display:inline-flex;width:fit-content;padding:6px 10px;border-radius:999px;background:#eaf4ff;color:#204d79;font-weight:700}
    .go,.back,.peer{display:inline-flex;align-items:center;justify-content:center;min-height:44px;border-radius:12px;text-decoration:none;font-weight:700}
    .go{background:#20507e;color:#fff;padding:10px 14px}
    .back{margin-top:12px;background:#fff;border:1px solid var(--line);color:var(--ink);padding:10px 14px}
    .peer{margin-top:10px;background:#eaf4ff;border:1px solid #b7d1ea;color:#1d4b77;padding:10px 14px}
  </style>
</head>
<body>
  <main>
    <section class="hero">
      <h1>${escapeHtml(pack.course.title)}</h1>
      <p>${escapeHtml(pack.course.description)}</p>
      <a class="back" href="../index.html">${escapeHtml(ui.backToRoot)}</a>
      <a class="peer" href="${escapeAttr(peerHref)}">${escapeHtml(ui.switchLocale)}</a>
      <div class="safety">
        <strong>${escapeHtml(ui.childSafetyTitle)}</strong>
        <ul>${pack.course.safetyGuidance.map((line) => `<li>${escapeHtml(line)}</li>`).join("")}</ul>
      </div>
    </section>
    <section class="grid">
      ${pack.chapters
        .map((chapter) => {
          const label = renderTemplate(ui.chapterLabel, { n: chapter.number });
          return `<article class="card">
            <span class="chip">${escapeHtml(label)}</span>
            <h2>${escapeHtml(chapter.title)}</h2>
            <p>${escapeHtml(chapter.tagline)}</p>
            <p>${chapter.vocabulary.map(escapeHtml).join(" / ")}</p>
            <a class="go" href="./${escapeAttr(chapter.key)}/index.html">${escapeHtml(ui.enterChapter)}</a>
          </article>`;
        })
        .join("")}
    </section>
  </main>
</body>
</html>`;
}

function buildDemoMarkup(locale, chapter) {
  const isZh = locale === "zh";
  const labels = {
    actions: isZh ? ["拿碗", "倒麦片", "倒牛奶", "放勺子"] : ["Get bowl", "Add cereal", "Pour milk", "Add spoon"],
    program: isZh ? "当前程序：" : "Current program:",
    empty: isZh ? "（空）" : "(empty)",
    targetCode: isZh ? "目标编码：" : "Target code:",
    currentCode: isZh ? "当前编码：" : "Current code:",
    mazeIntro: isZh ? "迷宫 3x3：起点(0,0)，终点(2,2)，墙(1,1)" : "Maze 3x3: start (0,0), goal (2,2), wall (1,1)",
    step: isZh ? "第" : "Step ",
    loops: isZh ? "循环次数（每轮+1钥匙）" : "Loop count (+1 key each loop)",
    needed: isZh ? "开门条件（至少钥匙数）" : "Door threshold (minimum keys)",
    waiting: isZh ? "等待运行。" : "Waiting to run.",
    shelf: isZh ? "有序书架：12, 18, 23, 30, 35, 42, 47, 53" : "Sorted shelf: 12, 18, 23, 30, 35, 42, 47, 53",
    notSearched: isZh ? "尚未搜索。" : "No search run yet.",
    msgType: isZh ? "消息类型" : "Message type",
    routeType: isZh ? "传输路径" : "Route",
    public: isZh ? "公开课堂通知" : "Public class notice",
    private: isZh ? "包含个人信息" : "Contains personal info",
    safe: isZh ? "学校安全路由" : "School safe route",
    risky: isZh ? "未知公共路由" : "Unknown public route",
  };
  const ui = locales[locale].course.ui;
  const base = `<div class="demo-root" data-demo="${escapeAttr(chapter.key)}" data-demo-type="${escapeAttr(chapter.demo.type)}">
    <p class="demo-status" role="status" aria-live="polite">${escapeHtml(chapter.demo.description)}</p>`;

  if (chapter.demo.type === "robot-breakfast") {
    return `${base}
      <div class="button-row">
        ${["bowl", "cereal", "milk", "spoon"].map((id, i) => `<button type="button" data-step="${id}">${escapeHtml(labels.actions[i])}</button>`).join("")}
      </div>
      <p>${escapeHtml(labels.program)} <span data-program>${escapeHtml(labels.empty)}</span></p>
      <div class="button-row"><button type="button" data-action="check">${escapeHtml(ui.quizCheck)}</button><button type="button" data-action="reset">${escapeHtml(ui.quizReset)}</button></div>
    </div>`;
  }
  if (chapter.demo.type === "binary-pixel") {
    return `${base}
      <p>${escapeHtml(labels.targetCode)} <code>10110010</code></p>
      <div class="pixel-grid">${Array.from({ length: 8 }, (_, i) => `<button type="button" class="pixel" data-bit="${i}">0</button>`).join("")}</div>
      <p>${escapeHtml(labels.currentCode)} <code data-code>00000000</code></p>
      <div class="button-row"><button type="button" data-action="check">${escapeHtml(ui.quizCheck)}</button><button type="button" data-action="reset">${escapeHtml(ui.quizReset)}</button></div>
    </div>`;
  }
  if (chapter.demo.type === "maze-debug") {
    const opts = [
      { value: "stay", label: isZh ? "停" : "Stay" },
      { value: "right", label: isZh ? "右" : "Right" },
      { value: "down", label: isZh ? "下" : "Down" },
      { value: "left", label: isZh ? "左" : "Left" },
      { value: "up", label: isZh ? "上" : "Up" },
    ];
    return `${base}
      <p>${escapeHtml(labels.mazeIntro)}</p>
      <div class="program-grid">
        ${Array.from({ length: 5 }, (_, i) => `<label>${escapeHtml(labels.step)}${i + 1}<select data-move="${i}">${opts.map((opt) => `<option value="${opt.value}">${escapeHtml(opt.label)}</option>`).join("")}</select></label>`).join("")}
      </div>
      <div class="button-row"><button type="button" data-action="run">${escapeHtml(ui.quizCheck)}</button><button type="button" data-action="reset">${escapeHtml(ui.quizReset)}</button></div>
    </div>`;
  }
  if (chapter.demo.type === "treasure-program") {
    return `${base}
      <label>${escapeHtml(labels.loops)}<input type="number" min="0" max="8" value="3" data-loops></label>
      <label>${escapeHtml(labels.needed)}<input type="number" min="1" max="8" value="3" data-needed></label>
      <div class="button-row"><button type="button" data-action="run">${escapeHtml(ui.quizCheck)}</button><button type="button" data-action="reset">${escapeHtml(ui.quizReset)}</button></div>
      <p data-trace>${escapeHtml(labels.waiting)}</p>
    </div>`;
  }
  if (chapter.demo.type === "library-search") {
    return `${base}
      <p>${escapeHtml(labels.shelf)}</p>
      <div class="button-row">
        <button type="button" data-action="linear">${locale === "zh" ? "顺序搜索 42" : "Linear search 42"}</button>
        <button type="button" data-action="binary">${locale === "zh" ? "二分搜索 42" : "Binary search 42"}</button>
        <button type="button" data-action="reset">${escapeHtml(ui.quizReset)}</button>
      </div>
      <p data-steps>${escapeHtml(labels.notSearched)}</p>
    </div>`;
  }
  return `${base}
    <label>${escapeHtml(labels.msgType)}
      <select data-msg><option value="public">${escapeHtml(labels.public)}</option><option value="private">${escapeHtml(labels.private)}</option></select>
    </label>
    <label>${escapeHtml(labels.routeType)}
      <select data-route><option value="safe">${escapeHtml(labels.safe)}</option><option value="risky">${escapeHtml(labels.risky)}</option></select>
    </label>
    <div class="button-row"><button type="button" data-action="send">${escapeHtml(ui.quizCheck)}</button><button type="button" data-action="reset">${escapeHtml(ui.quizReset)}</button></div>
  </div>`;
}

function buildExplorerMarkup(locale, chapter) {
  const ui = locales[locale].course.ui;
  return `<div class="explorer-root" data-explorer="${escapeAttr(chapter.key)}">
    <h2>${escapeHtml(ui.explorerTitle)}</h2>
    <p class="explorer-title" data-exp-title>${escapeHtml(chapter.explorer[0].title)}</p>
    <p class="explorer-detail" data-exp-detail>${escapeHtml(chapter.explorer[0].detail)}</p>
    <div class="button-row">
      <button type="button" data-exp-action="prev">${escapeHtml(ui.explorerPrev)}</button>
      <button type="button" data-exp-action="next">${escapeHtml(ui.explorerNext)}</button>
    </div>
  </div>`;
}

function buildQuizMarkup(locale, chapter) {
  const ui = locales[locale].course.ui;
  return `<div class="quiz-root" data-quiz="${escapeAttr(chapter.key)}">
    <h2>${escapeHtml(ui.quizTitle)}</h2>
    <p>${escapeHtml(chapter.quiz.question)}</p>
    <div class="quiz-options">
      ${chapter.quiz.options
        .map(
          (option, i) => `<label><input type="radio" name="quiz-${escapeAttr(chapter.key)}" value="${i}"> <span>${escapeHtml(option)}</span></label>`
        )
        .join("")}
    </div>
    <div class="button-row">
      <button type="button" data-quiz-action="check">${escapeHtml(ui.quizCheck)}</button>
      <button type="button" data-quiz-action="reset">${escapeHtml(ui.quizReset)}</button>
    </div>
    <p class="quiz-feedback" data-quiz-feedback aria-live="polite"></p>
  </div>`;
}

function buildExerciseCard(locale, chapterKey, type, item, index) {
  const ui = locales[locale].course.ui;
  const id = `${chapterKey}-${type}-${index + 1}`;
  const kindLabel = type === "bonus" ? ui.bonus : ui.reinforcement;
  return `<article class="exercise-card" data-ex-type="${type}">
    <div class="exercise-head">
      <strong>${escapeHtml(kindLabel)} ${index + 1}</strong>
      <label><input type="checkbox" data-check="${escapeAttr(id)}"> ${escapeHtml(ui.done)}</label>
    </div>
    <p class="question">${escapeHtml(item.question)}</p>
    <details><summary>${escapeHtml(ui.hint)}</summary><p>${escapeHtml(item.hint)}</p></details>
    <button class="toggle-answer" type="button" data-target="${escapeAttr(id)}-answer" aria-expanded="false">${escapeHtml(ui.showAnswer)}</button>
    <div id="${escapeAttr(id)}-answer" class="answer" hidden>
      <p><strong>${escapeHtml(ui.answer)}:</strong> ${escapeHtml(item.answer)}</p>
      <p><strong>${escapeHtml(ui.rationale)}:</strong> ${escapeHtml(item.rationale)}</p>
    </div>
  </article>`;
}

function buildSlideHtml(locale, chapter, slide, index) {
  const ui = locales[locale].course.ui;
  return `<section class="slide${index === 0 ? " active" : ""}" id="slide-${index + 1}" data-index="${index + 1}">
    <header class="slide-head">
      <div>
        <p class="kicker">${escapeHtml(renderTemplate(ui.chapterLabel, { n: chapter.number }))} · ${escapeHtml(chapter.title)}</p>
        <h1>${escapeHtml(slide.title)}</h1>
        <p class="sub">${escapeHtml(slide.subtitle)}</p>
      </div>
      <p class="count">${index + 1} / ${TOTAL_SLIDES}</p>
    </header>
    <div class="slide-main">
      <section class="panel"><ul>${slide.content.map((line) => `<li>${escapeHtml(line)}</li>`).join("")}</ul></section>
      <section class="panel">
        ${
          index === 2
            ? buildExplorerMarkup(locale, chapter)
            : index === 3
              ? `<h2>${escapeHtml(chapter.demo.title)}</h2><p>${escapeHtml(chapter.demo.description)}</p>${buildDemoMarkup(locale, chapter)}`
              : index === 4
                ? `${buildQuizMarkup(locale, chapter)}<h2>${locale === "zh" ? "误区修正" : "Misconception Fixes"}</h2><ul>${chapter.misconceptions
                    .map((item) => `<li><strong>${escapeHtml(item.wrong)}</strong><br>${escapeHtml(item.fix)}</li>`)
                    .join("")}</ul>`
                : `<h2>${locale === "zh" ? "词汇卡" : "Vocabulary"}</h2><p>${chapter.vocabulary.map(escapeHtml).join(" / ")}</p><h2>${locale === "zh" ? "安全提醒" : "Safety reminder"}</h2><p>${escapeHtml(chapter.safetyFocus)}</p>`
        }
      </section>
    </div>
  </section>`;
}

function buildChapterHtml(locale, chapter) {
  const pack = locales[locale];
  const course = pack.course;
  const ui = course.ui;
  const bank = exercises[locale][chapter.key];
  const isZh = locale === "zh";
  const slidesMeta = chapter.slides.map((slide, idx) => ({ idx: idx + 1, title: slide.title, notes: slide.notes }));
  return `<!doctype html>
<html lang="${escapeAttr(course.language)}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(chapter.title)} | ${escapeHtml(course.title)}</title>
  <link rel="icon" href="data:,">
  <style>
    :root{--p:${chapter.color.primary};--s:${chapter.color.secondary};--a:${chapter.color.accent};--d:${chapter.color.dark};--ink:#1e2f3f;--line:#d9e4ec;--paper:#fffefa}
    *{box-sizing:border-box}
    html,body{margin:0;padding:0}
    body{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI","PingFang SC","Microsoft YaHei",sans-serif;color:var(--ink);background:linear-gradient(180deg,#f3f7fb,#ebf1f7)}
    .app{max-width:1280px;margin:0 auto;padding:14px}
    .top{display:flex;gap:10px;justify-content:space-between;align-items:center;flex-wrap:wrap;margin-bottom:10px}
    .group{display:flex;gap:8px;flex-wrap:wrap}
    button,a{font:inherit}
    .ctl{min-height:44px;min-width:44px;display:inline-flex;align-items:center;justify-content:center;padding:10px 12px;border:1px solid var(--line);border-radius:12px;background:#fff;text-decoration:none;color:var(--ink);cursor:pointer}
    .stage-wrap{display:grid;grid-template-columns:minmax(0,1fr) 320px;gap:12px;min-width:0}
    .stage{min-width:0;background:var(--paper);border:1px solid var(--line);border-radius:20px;padding:10px;box-shadow:0 12px 26px rgba(15,40,68,.1)}
    .slides{aspect-ratio:16/9;min-height:0;position:relative;overflow:hidden;border:1px solid var(--line);border-radius:16px;background:#fff}
    .slide{position:absolute;inset:0;display:none;padding:16px;overflow:auto}
    .slide.active{display:grid;grid-template-rows:auto 1fr;gap:12px}
    .slide-head{display:flex;justify-content:space-between;gap:10px}
    .kicker{margin:0;color:var(--p);font-weight:700}
    h1{margin:4px 0 0;font-size:clamp(26px,2.8vw,38px)}
    .sub{margin:8px 0 0;color:#526171;line-height:1.6}
    .count{margin:0;color:#667;white-space:nowrap}
    .slide-main{display:grid;grid-template-columns:minmax(0,1fr) minmax(260px,40%);gap:10px}
    .panel{background:#fcfefe;border:1px solid var(--line);border-radius:14px;padding:12px}
    .panel ul{margin:0;padding-left:18px;line-height:1.7}
    .panel h2{margin:0 0 8px;font-size:18px;color:var(--p)}
    .panel p{margin:6px 0;line-height:1.65}
    .explorer-root,.quiz-root,.demo-root{display:grid;gap:8px}
    .explorer-title{font-weight:700}
    .explorer-detail,.quiz-feedback{min-height:24px}
    .quiz-options{display:grid;gap:6px}
    .demo-status{padding:10px;border:1px dashed #b7c9d9;border-radius:10px;background:#f8fcff}
    .button-row{display:flex;gap:8px;flex-wrap:wrap;margin-top:8px}
    .button-row button,.pixel-grid .pixel,.program-grid select{min-height:44px}
    .button-row button,.pixel-grid .pixel{border:1px solid var(--line);border-radius:10px;background:#fff;padding:8px 10px;cursor:pointer}
    .pixel-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:8px}
    .pixel.on{background:var(--d);color:#fff}
    .program-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}
    .program-grid label{display:grid;gap:4px;font-size:14px}
    .program-grid select,input,select{width:100%;padding:8px;border:1px solid var(--line);border-radius:8px}
    .nav{display:flex;justify-content:flex-end;gap:8px;margin-top:10px}
    .notes{min-width:0;background:#fff;border:1px solid var(--line);border-radius:16px;box-shadow:0 12px 26px rgba(15,40,68,.1);overflow:hidden}
    .notes h2{margin:0;padding:12px;border-bottom:1px solid var(--line);font-size:18px}
    .notes .body{padding:12px;display:grid;gap:10px;max-height:75vh;overflow:auto}
    .note-card{border:1px solid var(--line);border-radius:12px;padding:10px;background:#fbfdff}
    .note-card h3{margin:0 0 6px;font-size:14px;color:var(--p)}
    .note-card p,.note-card ul{margin:0;line-height:1.6;padding-left:16px}
    .note-card p{padding-left:0}
    .safe-banner{margin-top:14px;padding:12px;border:1px solid #f0cfb4;border-radius:12px;background:#fff7ef}
    .safe-banner ul{margin:8px 0 0;padding-left:18px;line-height:1.6}
    .exercise{margin-top:14px;padding:14px;border:1px solid var(--line);border-radius:16px;background:#fff}
    .exercise h2{margin:0 0 8px;font-size:24px}
    .exercise-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px}
    .exercise-grid.bonus{grid-template-columns:repeat(2,minmax(0,1fr))}
    .exercise-card{border:1px solid var(--line);border-radius:12px;padding:10px;background:#fcfefe;display:grid;gap:8px}
    .exercise-toolbar{display:flex;gap:8px;flex-wrap:wrap;margin:8px 0 10px}
    .exercise-filter{min-height:40px;border:1px solid var(--line);border-radius:999px;background:#fff;padding:6px 12px;cursor:pointer}
    .exercise-filter.active{background:var(--s);border-color:var(--p);color:var(--p);font-weight:700}
    .exercise-head{display:flex;justify-content:space-between;gap:8px;align-items:center}
    .question{margin:0;line-height:1.6}
    details p{margin:6px 0 0}
    .toggle-answer{border:1px solid var(--line);border-radius:10px;background:#fff;padding:8px 10px;cursor:pointer}
    .answer{border:1px dashed #b9c9d7;border-radius:10px;background:#f7fbff;padding:8px}
    .answer p{margin:6px 0;line-height:1.6}
    .progress-panel{margin-top:14px;padding:12px;border:1px solid var(--line);border-radius:14px;background:#fff}
    .progress-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px}
    .progress-item{border:1px solid var(--line);border-radius:10px;padding:10px;background:#fbfdff}
    .progress-item strong{display:block;font-size:20px;color:var(--p)}
    .live{position:absolute;left:-9999px}
    .hidden-notes .stage-wrap{grid-template-columns:minmax(0,1fr)}
    .hidden-notes .notes{display:none}
    @media (max-width:1024px){.stage-wrap{grid-template-columns:1fr}.slide-main{grid-template-columns:1fr}.slides{aspect-ratio:auto;min-height:620px}.notes .body{max-height:none}.exercise-grid{grid-template-columns:repeat(2,minmax(0,1fr))}}
    @media (max-width:640px){.app{padding:10px}.slides{min-height:620px;aspect-ratio:auto}.exercise-grid,.exercise-grid.bonus,.progress-grid{grid-template-columns:1fr}.top{display:grid}.group{width:100%}.ctl{flex:1}}
    @media (prefers-reduced-motion: reduce){*,*::before,*::after{animation:none !important;transition:none !important;scroll-behavior:auto !important}}
    @media print{body{background:#fff}.top,.notes,.nav,.exercise details,.toggle-answer,.button-row{display:none !important}.app{max-width:none;padding:0}.slides{border:none;aspect-ratio:auto;min-height:0;overflow:visible}.slide{position:static;display:grid !important;page-break-after:always;border:1px solid #d8e2ea;margin-bottom:8mm}.slide:last-child{page-break-after:auto}.slide-main{grid-template-columns:1fr 1fr}.answer{display:block !important}}
  </style>
</head>
<body>
  <main class="app" id="app">
    <header class="top">
      <div class="group">
        <a class="ctl" href="../index.html">${escapeHtml(ui.backToCatalog)}</a>
        <button class="ctl" id="notesToggle" type="button" aria-expanded="true" aria-controls="notes">${escapeHtml(ui.hideNotes)}</button>
        <button class="ctl" id="fullscreenToggle" type="button">${escapeHtml(ui.fullscreen)}</button>
      </div>
      <div class="group"><span class="ctl">${escapeHtml(renderTemplate(ui.chapterLabel, { n: chapter.number }))} · ${escapeHtml(chapter.title)}</span></div>
    </header>
    <section class="stage-wrap">
      <section class="stage">
        <div class="slides" id="slides" tabindex="0" aria-label="${escapeAttr(chapter.title)}">
          ${chapter.slides.map((slide, index) => buildSlideHtml(locale, chapter, slide, index)).join("")}
        </div>
        <div class="nav">
          <button class="ctl" id="prevButton" type="button">${escapeHtml(ui.previous)}</button>
          <button class="ctl" id="nextButton" type="button">${escapeHtml(ui.next)}</button>
        </div>
      </section>
      <aside class="notes" id="notes"><h2>${escapeHtml(ui.notesTitle)}</h2><div class="body" id="notesBody"></div></aside>
    </section>
    <section class="safe-banner"><strong>${escapeHtml(ui.childSafetyTitle)}</strong><ul>${course.safetyGuidance.map((line) => `<li>${escapeHtml(line)}</li>`).join("")}</ul><p>${escapeHtml(chapter.safetyFocus)}</p></section>
    <section class="exercise" id="exercise">
      <h2>${escapeHtml(ui.exerciseTitle)}</h2><p>${escapeHtml(ui.exerciseDesc)}</p>
      <div class="exercise-toolbar">
        <button class="exercise-filter active" type="button" data-filter="all">${locale === "zh" ? "全部题目" : "All tasks"}</button>
        <button class="exercise-filter" type="button" data-filter="reinforcement">${escapeHtml(ui.reinforcement)}</button>
        <button class="exercise-filter" type="button" data-filter="bonus">${escapeHtml(ui.bonus)}</button>
      </div>
      <h3>${escapeHtml(ui.reinforcement)}</h3>
      <div class="exercise-grid">${bank.reinforcement.map((item, index) => buildExerciseCard(locale, chapter.key, "reinforcement", item, index)).join("")}</div>
      <h3>${escapeHtml(ui.bonus)}</h3>
      <div class="exercise-grid bonus">${bank.bonus.map((item, index) => buildExerciseCard(locale, chapter.key, "bonus", item, index)).join("")}</div>
    </section>
    <section class="progress-panel" id="progressPanel">
      <h3>${locale === "zh" ? "学习进度面板" : "Learning Progress Panel"}</h3>
      <div class="progress-grid">
        <div class="progress-item"><span>${locale === "zh" ? "练习完成" : "Exercises Completed"}</span><strong data-progress-ex>0/8</strong></div>
        <div class="progress-item"><span>${locale === "zh" ? "互动里程碑" : "Interaction Milestones"}</span><strong data-progress-ms>0/3</strong></div>
        <div class="progress-item"><span>${locale === "zh" ? "当前章节" : "Current Chapter"}</span><strong>${escapeHtml(chapter.title)}</strong></div>
      </div>
      <p data-coach-message>${locale === "zh" ? "先完成 2 道强化题，再对照“原因”检查自己的想法。" : "Finish 2 reinforcement tasks first, then compare your reasoning with the explanations."}</p>
      <div class="button-row"><button type="button" data-coach-action="next">${locale === "zh" ? "生成下一步挑战" : "Generate next challenge"}</button></div>
      <p data-coach-challenge>${locale === "zh" ? "挑战：把本章一个方法迁移到生活任务中。" : "Challenge: transfer one chapter method to a real-life task."}</p>
    </section>
    <p class="live" id="liveRegion" aria-live="polite"></p>
  </main>
  <script>
    (() => {
      const locale = ${JSON.stringify(locale)};
      const isZh = locale === "zh";
      const chapterKey = ${JSON.stringify(chapter.key)};
      const chapterSlides = ${JSON.stringify(slidesMeta)};
      const explorerData = ${JSON.stringify(chapter.explorer)};
      const quizData = ${JSON.stringify(chapter.quiz)};
      const ui = ${JSON.stringify(ui)};
      const demoSuccess = ${JSON.stringify(chapter.demo.success)};
      const demoReset = ${JSON.stringify(chapter.demo.reset)};
      const total = chapterSlides.length;
      const app = document.getElementById("app");
      const slidesEl = document.getElementById("slides");
      const slides = Array.from(document.querySelectorAll(".slide"));
      const prevButton = document.getElementById("prevButton");
      const nextButton = document.getElementById("nextButton");
      const notesToggle = document.getElementById("notesToggle");
      const fullscreenToggle = document.getElementById("fullscreenToggle");
      const notesBody = document.getElementById("notesBody");
      const live = document.getElementById("liveRegion");
      const progressExercises = document.querySelector("[data-progress-ex]");
      const progressMilestones = document.querySelector("[data-progress-ms]");
      const coachMessage = document.querySelector("[data-coach-message]");
      const coachChallenge = document.querySelector("[data-coach-challenge]");
      let current = 1;
      let touchStartX = null;
      let touchStartY = null;
      const milestoneNames = ["demo", "explorer", "quiz"];
      const challengeBank = isZh
        ? [
            "挑战：写一个 3 步检查清单，验证你今天的算法是否可执行。",
            "挑战：挑 1 道做错题，写“先错在哪里，再怎么改”。",
            "挑战：把本章方法迁移到家庭任务，并写出成功标准。",
          ]
        : [
            "Challenge: write a 3-step checklist to verify if your algorithm is executable.",
            "Challenge: pick one wrong answer and write what failed, then how to fix it.",
            "Challenge: transfer one chapter method to a home task and define success criteria.",
          ];
      let challengeIndex = 0;

      function milestoneKey(name) {
        return "grade5-cs:" + locale + ":" + chapterKey + ":milestone:" + name;
      }
      function markMilestone(name) {
        try { localStorage.setItem(milestoneKey(name), "1"); } catch (err) {}
        updateProgressPanel();
      }
      function updateProgressPanel() {
        const checks = Array.from(document.querySelectorAll("[data-check]"));
        const checked = checks.filter((input) => input.checked).length;
        if (progressExercises) progressExercises.textContent = checked + "/" + checks.length;
        let msDone = 0;
        milestoneNames.forEach((name) => {
          try {
            if (localStorage.getItem(milestoneKey(name)) === "1") msDone += 1;
          } catch (err) {}
        });
        if (progressMilestones) progressMilestones.textContent = msDone + "/" + milestoneNames.length;
        if (coachMessage) {
          if (checked === checks.length) {
            coachMessage.textContent = isZh ? "练习全完成！请向同伴解释一道题的原因，巩固迁移能力。" : "All tasks completed! Explain one rationale to a peer to strengthen transfer.";
          } else if (checked >= 5) {
            coachMessage.textContent = isZh ? "进度很好：优先补完剩余题，再做一题附加挑战。" : "Great progress: finish remaining tasks, then attempt one bonus challenge.";
          } else if (checked >= 2) {
            coachMessage.textContent = isZh ? "继续保持：每做完一题，都对照“原因”检查是否真正理解。" : "Keep going: after each answer, compare with the rationale to confirm understanding.";
          } else {
            coachMessage.textContent = isZh ? "先完成 2 道强化题，再对照“原因”检查自己的想法。" : "Finish 2 reinforcement tasks first, then compare your reasoning with the explanations.";
          }
        }
      }

      function getHashIndex() {
        const match = location.hash.match(/^#slide-(\\d+)$/);
        if (!match) return 1;
        const value = Number(match[1]);
        return Number.isFinite(value) && value >= 1 && value <= total ? value : 1;
      }
      function renderNotes(index) {
        const note = chapterSlides[index - 1];
        notesBody.innerHTML = [
          '<div class="note-card"><h3>' + (isZh ? '页码' : 'Page') + '</h3><p>' + (isZh ? '第 ' + index + ' 页：' : 'Page ' + index + ': ') + note.title + '</p></div>',
          '<div class="note-card"><h3>' + (isZh ? '建议时长' : 'Suggested time') + '</h3><p>' + note.notes.timing + '</p></div>',
          '<div class="note-card"><h3>' + (isZh ? '教学提示' : 'Teacher prompts') + '</h3><ul>' + note.notes.prompts.map((p) => '<li>' + p + '</li>').join('') + '</ul></div>',
          '<div class="note-card"><h3>' + (isZh ? '预期回应' : 'Expected responses') + '</h3><ul>' + note.notes.responses.map((p) => '<li>' + p + '</li>').join('') + '</ul></div>',
        ].join("");
      }
      function updateButtons() {
        prevButton.disabled = current === 1;
        nextButton.disabled = current === total;
      }
      function setSlide(index, silent = false) {
        current = index;
        slides.forEach((slide, slideIndex) => {
          const active = slideIndex === index - 1;
          slide.classList.toggle("active", active);
          slide.setAttribute("aria-hidden", active ? "false" : "true");
        });
        updateButtons();
        renderNotes(index);
        history.replaceState(null, "", "#slide-" + index);
        if (!silent) live.textContent = (isZh ? "已切换到第 " : "Switched to page ") + index + (isZh ? " 页。" : ".");
      }
      function go(delta) {
        const next = Math.min(total, Math.max(1, current + delta));
        if (next !== current) setSlide(next);
      }

      prevButton.addEventListener("click", () => go(-1));
      nextButton.addEventListener("click", () => go(1));
      notesToggle.addEventListener("click", () => {
        const hidden = app.classList.toggle("hidden-notes");
        notesToggle.textContent = hidden ? ui.showNotes : ui.hideNotes;
        notesToggle.setAttribute("aria-expanded", String(!hidden));
      });
      fullscreenToggle.addEventListener("click", async () => {
        try {
          if (!document.fullscreenElement) {
            await document.documentElement.requestFullscreen();
            fullscreenToggle.textContent = ui.exitFullscreen;
          } else {
            await document.exitFullscreen();
            fullscreenToggle.textContent = ui.fullscreen;
          }
        } catch (err) {
          live.textContent = isZh ? "全屏不可用。" : "Fullscreen unavailable.";
        }
      });
      document.addEventListener("fullscreenchange", () => {
        fullscreenToggle.textContent = document.fullscreenElement ? ui.exitFullscreen : ui.fullscreen;
      });
      document.addEventListener("keydown", (event) => {
        const target = event.target;
        const tag = target && target.tagName;
        if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || (target && target.isContentEditable)) return;
        if (target && target.closest("button, summary, a[href], [role='button']")) return;
        if (event.key === "ArrowRight" || event.key === "PageDown" || event.key === " " || event.code === "Space") { event.preventDefault(); go(1); }
        else if (event.key === "ArrowLeft" || event.key === "PageUp") { event.preventDefault(); go(-1); }
        else if (event.key === "Home") { event.preventDefault(); setSlide(1); }
        else if (event.key === "End") { event.preventDefault(); setSlide(total); }
      });
      const coachButton = document.querySelector('[data-coach-action="next"]');
      if (coachButton && coachChallenge) {
        coachButton.addEventListener("click", () => {
          challengeIndex = (challengeIndex + 1) % challengeBank.length;
          coachChallenge.textContent = challengeBank[challengeIndex];
          live.textContent = challengeBank[challengeIndex];
        });
      }
      slidesEl.addEventListener("touchstart", (event) => {
        const touch = event.changedTouches[0];
        touchStartX = touch.clientX;
        touchStartY = touch.clientY;
      }, { passive: true });
      slidesEl.addEventListener("touchend", (event) => {
        if (touchStartX === null || touchStartY === null) return;
        const touch = event.changedTouches[0];
        const dx = touch.clientX - touchStartX;
        const dy = touch.clientY - touchStartY;
        if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) {
          if (dx < 0) go(1);
          if (dx > 0) go(-1);
        }
        touchStartX = null;
        touchStartY = null;
      }, { passive: true });
      window.addEventListener("hashchange", () => setSlide(getHashIndex(), true));

      document.querySelectorAll(".toggle-answer").forEach((button) => {
        button.addEventListener("click", () => {
          const panel = document.getElementById(button.dataset.target);
          const open = !panel.hasAttribute("hidden");
          if (open) {
            panel.setAttribute("hidden", "");
            button.textContent = ui.showAnswer;
            button.setAttribute("aria-expanded", "false");
          } else {
            panel.removeAttribute("hidden");
            button.textContent = ui.hideAnswer;
            button.setAttribute("aria-expanded", "true");
          }
        });
      });
      document.querySelectorAll("[data-check]").forEach((input) => {
        const key = "grade5-cs:" + locale + ":" + chapterKey + ":" + input.dataset.check;
        try { input.checked = localStorage.getItem(key) === "1"; } catch (err) {}
        input.addEventListener("change", () => {
          try { localStorage.setItem(key, input.checked ? "1" : "0"); } catch (err) {}
          updateProgressPanel();
        });
      });
      document.querySelectorAll("[data-filter]").forEach((button) => {
        button.addEventListener("click", () => {
          const mode = button.dataset.filter;
          document.querySelectorAll("[data-filter]").forEach((item) => item.classList.toggle("active", item === button));
          document.querySelectorAll(".exercise-card").forEach((card) => {
            const type = card.dataset.exType;
            const show = mode === "all" || mode === type;
            card.style.display = show ? "" : "none";
          });
        });
      });

      document.querySelectorAll("[data-explorer]").forEach((root) => {
        let idx = 0;
        const title = root.querySelector("[data-exp-title]");
        const detail = root.querySelector("[data-exp-detail]");
        function paint() {
          const item = explorerData[idx];
          title.textContent = item.title;
          detail.textContent = item.detail;
        }
        root.querySelector('[data-exp-action="prev"]').addEventListener("click", () => {
          idx = (idx - 1 + explorerData.length) % explorerData.length;
          paint();
          markMilestone("explorer");
        });
        root.querySelector('[data-exp-action="next"]').addEventListener("click", () => {
          idx = (idx + 1) % explorerData.length;
          paint();
          markMilestone("explorer");
        });
      });

      document.querySelectorAll("[data-quiz]").forEach((root) => {
        const feedback = root.querySelector("[data-quiz-feedback]");
        root.querySelector('[data-quiz-action="check"]').addEventListener("click", () => {
          const picked = root.querySelector("input[type='radio']:checked");
          if (!picked) {
            feedback.textContent = isZh ? "请先选择一个选项。" : "Please choose an option first.";
            return;
          }
          const value = Number(picked.value);
          const correct = value === quizData.correctIndex;
          feedback.textContent = correct ? quizData.correctFeedback : quizData.wrongFeedback;
          if (correct) markMilestone("quiz");
        });
        root.querySelector('[data-quiz-action="reset"]').addEventListener("click", () => {
          root.querySelectorAll("input[type='radio']").forEach((input) => { input.checked = false; });
          feedback.textContent = "";
        });
      });

      setupDemo();
      updateProgressPanel();
      setSlide(getHashIndex(), true);

      function setupDemo() {
        const root = document.querySelector(".demo-root");
        if (!root) return;
        const type = root.dataset.demoType;
        const status = root.querySelector(".demo-status");
        const say = (message) => { status.textContent = message; live.textContent = message; };

        if (type === "robot-breakfast") {
          const target = ["bowl", "cereal", "milk", "spoon"];
          const stepName = {
            bowl: isZh ? "拿碗" : "Get bowl",
            cereal: isZh ? "倒麦片" : "Add cereal",
            milk: isZh ? "倒牛奶" : "Pour milk",
            spoon: isZh ? "放勺子" : "Add spoon",
          };
          const selected = [];
          const programText = root.querySelector("[data-program]");
          root.querySelectorAll("[data-step]").forEach((button) => {
            button.addEventListener("click", () => {
              if (selected.length < target.length) {
                selected.push(button.dataset.step);
                programText.textContent = selected.join(" -> ");
              }
            });
          });
          root.querySelector('[data-action="check"]').addEventListener("click", () => {
            if (selected.join("|") === target.join("|")) {
              say(demoSuccess);
              markMilestone("demo");
            } else {
              const mismatch = selected.findIndex((value, index) => value !== target[index]);
              const step = mismatch === -1 ? selected.length + 1 : mismatch + 1;
              const expectedKey = target[mismatch === -1 ? selected.length : mismatch];
              const expected = expectedKey ? stepName[expectedKey] : (isZh ? "结束" : "finish");
              say(
                isZh
                  ? "第 " + step + " 步开始偏离，建议这里应是 " + expected + "。"
                  : "Mismatch starts at step " + step + ". Expected " + expected + " at this point."
              );
            }
          });
          root.querySelector('[data-action="reset"]').addEventListener("click", () => {
            selected.length = 0;
            programText.textContent = isZh ? "（空）" : "(empty)";
            say(demoReset);
          });
          return;
        }

        if (type === "binary-pixel") {
          const target = "10110010";
          const bits = Array.from(root.querySelectorAll(".pixel"));
          const code = root.querySelector("[data-code]");
          const read = () => bits.map((bit) => bit.textContent.trim()).join("");
          bits.forEach((bit) => {
            bit.addEventListener("click", () => {
              bit.textContent = bit.textContent.trim() === "0" ? "1" : "0";
              bit.classList.toggle("on", bit.textContent.trim() === "1");
              code.textContent = read();
            });
          });
          root.querySelector('[data-action="check"]').addEventListener("click", () => {
            const now = read();
            if (now === target) {
              say(demoSuccess);
              markMilestone("demo");
            } else {
              const mismatchBits = [];
              for (let i = 0; i < target.length; i++) {
                if (now[i] !== target[i]) mismatchBits.push(i + 1);
              }
              say(
                isZh
                  ? "第 " + mismatchBits.join("、") + " 位不一致，请先修正这些位。"
                  : "Bits " + mismatchBits.join(", ") + " mismatch. Fix these first."
              );
            }
          });
          root.querySelector('[data-action="reset"]').addEventListener("click", () => {
            bits.forEach((bit) => { bit.textContent = "0"; bit.classList.remove("on"); });
            code.textContent = "00000000";
            say(demoReset);
          });
          return;
        }

        if (type === "maze-debug") {
          const selects = Array.from(root.querySelectorAll("[data-move]"));
          const wall = "1,1";
          const goal = "2,2";
          root.querySelector('[data-action="run"]').addEventListener("click", () => {
            let x = 0;
            let y = 0;
            for (let i = 0; i < selects.length; i++) {
              const move = selects[i].value;
              if (move === "stay") continue;
              if (move === "right") x += 1;
              if (move === "left") x -= 1;
              if (move === "down") y += 1;
              if (move === "up") y -= 1;
              if (x < 0 || x > 2 || y < 0 || y > 2) { say(isZh ? "第 " + (i + 1) + " 步越界，当前位置(" + x + "," + y + ")。" : "Step " + (i + 1) + " out of bounds at (" + x + "," + y + ")."); return; }
              if (x + "," + y === wall) { say(isZh ? "第 " + (i + 1) + " 步撞墙（1,1）。" : "Step " + (i + 1) + " hits wall (1,1)."); return; }
            }
            if (x + "," + y === goal) {
              say(demoSuccess);
              markMilestone("demo");
            }
            else say(isZh ? "未到达终点，请继续调试。" : "Goal not reached yet. Keep debugging.");
          });
          root.querySelector('[data-action="reset"]').addEventListener("click", () => {
            selects.forEach((select) => { select.value = "stay"; });
            say(demoReset);
          });
          return;
        }

        if (type === "treasure-program") {
          const loops = root.querySelector("[data-loops]");
          const needed = root.querySelector("[data-needed]");
          const trace = root.querySelector("[data-trace]");
          root.querySelector('[data-action="run"]').addEventListener("click", () => {
            const n = Math.max(0, Math.min(8, Number(loops.value) || 0));
            const k = Math.max(1, Math.min(8, Number(needed.value) || 1));
            let keys = 0;
            for (let i = 0; i < n; i++) keys += 1;
            trace.textContent = (isZh ? "运行结束：" : "Run finished: ") + "loops=" + n + ", keys=" + keys + ", threshold=" + k;
            if (keys >= k) {
              say(demoSuccess);
              markMilestone("demo");
            }
            else say(isZh ? "钥匙不足，条件未达成。" : "Not enough keys to pass the condition.");
          });
          root.querySelector('[data-action="reset"]').addEventListener("click", () => {
            loops.value = "3";
            needed.value = "3";
            trace.textContent = isZh ? "等待运行。" : "Waiting to run.";
            say(demoReset);
          });
          return;
        }

        if (type === "library-search") {
          const arr = [12, 18, 23, 30, 35, 42, 47, 53];
          const steps = root.querySelector("[data-steps]");
          root.querySelector('[data-action="linear"]').addEventListener("click", () => {
            let count = 0;
            for (let i = 0; i < arr.length; i++) {
              count += 1;
              if (arr[i] === 42) {
                steps.textContent = isZh ? "顺序搜索比较 " + count + " 次找到 42。" : "Linear search found 42 in " + count + " comparisons.";
                say(isZh ? "已完成顺序搜索。" : "Linear search completed.");
                return;
              }
            }
          });
          root.querySelector('[data-action="binary"]').addEventListener("click", () => {
            let left = 0;
            let right = arr.length - 1;
            let count = 0;
            while (left <= right) {
              const mid = Math.floor((left + right) / 2);
              count += 1;
              if (arr[mid] === 42) {
                steps.textContent = isZh ? "二分搜索比较 " + count + " 次找到 42。" : "Binary search found 42 in " + count + " comparisons.";
                say(demoSuccess + (isZh ? " 二分更高效。" : " Binary search is more efficient."));
                markMilestone("demo");
                return;
              }
              if (arr[mid] < 42) left = mid + 1; else right = mid - 1;
            }
          });
          root.querySelector('[data-action="reset"]').addEventListener("click", () => {
            steps.textContent = isZh ? "尚未搜索。" : "No search run yet.";
            say(demoReset);
          });
          return;
        }

        const msg = root.querySelector("[data-msg]");
        const route = root.querySelector("[data-route]");
        root.querySelector('[data-action="send"]').addEventListener("click", () => {
          if (msg.value === "private") { say(isZh ? "已拦截：不要发送个人信息，请求助可信任大人。" : "Blocked: do not send personal information. Ask a trusted adult."); return; }
          if (route.value === "risky") { say(isZh ? "路径风险高，请改用安全路由。" : "Route is risky. Choose the safe route."); return; }
          say(demoSuccess);
          markMilestone("demo");
        });
        root.querySelector('[data-action="reset"]').addEventListener("click", () => {
          msg.value = "public";
          route.value = "safe";
          say(demoReset);
        });
      }
    })();
  </script>
</body>
</html>`;
}

function writeBundle() {
  validateData();
  fs.writeFileSync(path.join(OUTPUT_DIR, "index.html"), buildPortalHtml(), "utf8");

  SUPPORTED_LOCALES.forEach((locale) => {
    const localeDir = path.join(OUTPUT_DIR, locale);
    fs.mkdirSync(localeDir, { recursive: true });
    fs.writeFileSync(path.join(localeDir, "index.html"), buildLocaleIndexHtml(locale), "utf8");
    locales[locale].chapters.forEach((chapter) => {
      const chapterDir = path.join(localeDir, chapter.key);
      fs.mkdirSync(chapterDir, { recursive: true });
      fs.writeFileSync(path.join(chapterDir, "index.html"), buildChapterHtml(locale, chapter), "utf8");
    });
  });
}

if (require.main === module) {
  writeBundle();
  console.log(`Generated bilingual course bundle in ${OUTPUT_DIR}`);
}

module.exports = {
  validateData,
  writeBundle,
  buildPortalHtml,
  buildLocaleIndexHtml,
  buildChapterHtml,
};
