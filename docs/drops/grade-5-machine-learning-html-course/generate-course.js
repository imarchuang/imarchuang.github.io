const fs = require("fs");
const path = require("path");

const { bundles } = require("./course-data");
const exerciseBanks = require("./exercises");

const OUTPUT_DIR = __dirname;
const GENERATED_PREFIX = "chapter-";
const MIN_SLIDES_PER_CHAPTER = 7;

const uiText = {
  zh: {
    lang: "zh-CN",
    courseSummary: "共 6 章，每章至少 7 张互动课件页，含 2 个互动环节和 8 道课后练习。",
    chapterLabel: "第",
    chapterSuffix: "章",
    enterChapter: "进入章节",
    backCatalog: "返回目录",
    jumpExercises: "跳到练习",
    hideNotes: "隐藏讲师笔记",
    showNotes: "显示讲师笔记",
    fullscreen: "全屏",
    exitFullscreen: "退出全屏",
    notesTitle: "讲师笔记",
    exercisesTitle: "巩固练习区",
    exercisesDesc: "共 6 道强化练习 + 2 道附加题。完成状态保存在当前浏览器。",
    prev: "上一页",
    next: "下一页",
    revealAnswer: "显示答案",
    hideAnswer: "隐藏答案",
    hint: "提示",
    answer: "答案",
    rationale: "理由",
    done: "已完成",
    reinforcement: "强化练习",
    bonus: "附加题",
    interactiveTitle: "互动实验",
    interactiveDesc: "请操作并观察即时反馈。",
    resetLab: "重置实验",
    waiting: "等待操作",
    switchedSlide: (n, total) => `已切换到第 ${n} 页，共 ${total} 页。`,
    unsupportedFullscreen: "当前环境不支持全屏。",
    languageSwitch: "English Edition",
    siblingSwitch: "独立 English 目录",
    indexLangBadge: "中文",
  },
  en: {
    lang: "en",
    courseSummary: "6 chapters, at least 7 interactive slides per chapter, 2 interactive moments, and 8 exercises.",
    chapterLabel: "Chapter",
    chapterSuffix: "",
    enterChapter: "Open Chapter",
    backCatalog: "Back to Catalog",
    jumpExercises: "Jump to Exercises",
    hideNotes: "Hide Teacher Notes",
    showNotes: "Show Teacher Notes",
    fullscreen: "Fullscreen",
    exitFullscreen: "Exit Fullscreen",
    notesTitle: "Teacher Notes",
    exercisesTitle: "Practice Zone",
    exercisesDesc: "6 reinforcement exercises + 2 bonus exercises. Completion is saved in this browser.",
    prev: "Previous",
    next: "Next",
    revealAnswer: "Show Answer",
    hideAnswer: "Hide Answer",
    hint: "Hint",
    answer: "Answer",
    rationale: "Why",
    done: "Completed",
    reinforcement: "Reinforcement",
    bonus: "Bonus",
    interactiveTitle: "Interactive Lab",
    interactiveDesc: "Operate the controls and observe instant feedback.",
    resetLab: "Reset Lab",
    waiting: "Waiting for input",
    switchedSlide: (n, total) => `Moved to slide ${n} of ${total}.`,
    unsupportedFullscreen: "Fullscreen is not available in this environment.",
    languageSwitch: "中文课程",
    siblingSwitch: "Standalone English Folder",
    indexLangBadge: "English",
  },
};

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

function safeJson(value) {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}

function chapterFileName(chapter) {
  const number = String(chapter.number).padStart(2, "0");
  return `${GENERATED_PREFIX}${number}-${chapter.key}.html`;
}

function listHtml(items, className) {
  return `<ul class="${className}">${items.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>`;
}

function validateData(courseData, chapterData, exerciseData, locale) {
  const errors = [];
  const forbiddenLanguage = locale === "zh" ? [/AI觉得/u, /AI知道/u, /AI相信/u, /AI想/u, /模型觉得/u, /模型相信/u, /模型有感受/u] : [];

  if (!courseData || !courseData.title) errors.push(`${locale}: course title missing`);
  if (!Array.isArray(chapterData) || chapterData.length !== 6) {
    errors.push(`${locale}: chapter count must be 6`);
  }

  for (const chapter of chapterData) {
    if (!chapter?.key) {
      errors.push(`${locale}: chapter key missing`);
      continue;
    }
    ["number", "title", "tagline", "color", "objectives", "vocabulary", "slides", "misconceptions", "demos"].forEach((field) => {
      if (chapter[field] === undefined) errors.push(`${locale}:${chapter.key} missing field ${field}`);
    });
    if (!Array.isArray(chapter.slides) || chapter.slides.length < MIN_SLIDES_PER_CHAPTER) {
      errors.push(`${locale}:${chapter.key} requires at least ${MIN_SLIDES_PER_CHAPTER} slides`);
    }
    const labSlides = (chapter.slides || []).filter((s) => String(s.id || "").startsWith("lab"));
    if (labSlides.length < 2) errors.push(`${locale}:${chapter.key} requires at least 2 interactive slide moments`);
    if (!Array.isArray(chapter.demos) || chapter.demos.length < 2) errors.push(`${locale}:${chapter.key} requires 2 demo configs`);

    const bank = exerciseData[chapter.key];
    if (!bank) {
      errors.push(`${locale}:${chapter.key} missing exercise bank`);
      continue;
    }
    if (!Array.isArray(bank.reinforcement) || bank.reinforcement.length !== 6) errors.push(`${locale}:${chapter.key} reinforcement count must be 6`);
    if (!Array.isArray(bank.bonus) || bank.bonus.length !== 2) errors.push(`${locale}:${chapter.key} bonus count must be 2`);
    ["reinforcement", "bonus"].forEach((kind) => {
      (bank[kind] || []).forEach((item, index) => {
        ["question", "hint", "answer", "rationale"].forEach((field) => {
          if (!item[field] || typeof item[field] !== "string") {
            errors.push(`${locale}:${chapter.key}:${kind}[${index}] missing ${field}`);
          }
        });
      });
    });

    const chapterText = JSON.stringify(chapter);
    forbiddenLanguage.forEach((pattern) => {
      if (pattern.test(chapterText)) errors.push(`${locale}:${chapter.key} anthropomorphic pattern ${pattern}`);
    });
  }

  return errors;
}

function buildDemoHtml(chapter, slide, locale, i18n) {
  const demoIndex = slide.id === "lab-main" ? 0 : 1;
  const demoConfig = chapter.demos[demoIndex];
  if (!demoConfig) return "";
  const key = `${chapter.key}-${demoIndex + 1}`;
  const start = `<section class="demo-card" data-demo="${escapeAttr(key)}" data-demo-type="${escapeAttr(demoConfig.type)}" data-locale="${escapeAttr(
    locale
  )}"><h3>${escapeHtml(i18n.interactiveTitle)}</h3><p class="demo-desc">${escapeHtml(i18n.interactiveDesc)}</p>`;
  const end = `<div class="demo-actions"><button type="button" class="demo-reset">${escapeHtml(
    i18n.resetLab
  )}</button></div><p class="demo-status" role="status" aria-live="polite">${escapeHtml(demoConfig.statusLabel)}: ${escapeHtml(i18n.waiting)}</p></section>`;

  const zh = locale === "zh";
  switch (demoConfig.type) {
    case "rules-vs-learning":
      return (
        start +
        `<div class="demo-grid two">` +
        `<label>${zh ? "模式" : "Mode"}<select class="demo-mode"><option value="rule">${zh ? "规则模式" : "Rule Mode"}</option><option value="learn">${zh ? "学习模式" : "Learning Mode"}</option></select></label>` +
        `<label>${zh ? "样本" : "Sample"}<select class="demo-sample"></select></label></div>` +
        `<button type="button" class="demo-run">${zh ? "运行分类" : "Run Classification"}</button><p class="demo-output"></p>` +
        end
      );
    case "stability-check":
      return (
        start +
        `<label>${zh ? "选择样本" : "Choose sample"}<select class="demo-sample"></select></label>` +
        `<button type="button" class="demo-run">${zh ? "重复测试 3 次" : "Replay 3 Runs"}</button><p class="demo-output"></p>` +
        end
      );
    case "feature-label-sorter":
      return (
        start +
        `<p>${zh ? "把字段放入正确类别。" : "Sort each field into the correct category."}</p><div class="demo-sorter"></div>` +
        `<button type="button" class="demo-run">${zh ? "检查分类" : "Check Sorting"}</button><p class="demo-output"></p>` +
        end
      );
    case "data-cleanup":
      return (
        start +
        `<div class="demo-grid two">` +
        `<label>${zh ? "单位修正" : "Unit fix"}<select class="demo-unit"><option value="mixed">${zh ? "未统一" : "Mixed"}</option><option value="gram">${zh ? "统一为克" : "Unified to grams"}</option></select></label>` +
        `<label>${zh ? "缺失值处理" : "Missing value handling"}<select class="demo-missing"><option value="raw">${zh ? "未处理" : "Raw"}</option><option value="rule">${zh ? "按规则标记" : "Rule-based handling"}</option></select></label>` +
        `</div><button type="button" class="demo-run">${zh ? "评估质量" : "Score Quality"}</button><p class="demo-output"></p>` +
        end
      );
    case "boundary-board":
      return (
        start +
        `<label>${zh ? "边界阈值 x =" : "Boundary threshold x ="} <input type="range" min="2" max="8" value="5" step="1" class="demo-threshold"><span class="demo-threshold-value">5</span></label>` +
        `<button type="button" class="demo-run">${zh ? "重新计算" : "Recalculate"}</button><p class="demo-output"></p>` +
        end
      );
    case "confidence-meter":
      return (
        start +
        `<label>${zh ? "测试点位置 x" : "Test point x"} <input type="range" min="2" max="8" value="5" step="1" class="demo-testx"><span class="demo-testx-value">5</span></label>` +
        `<button type="button" class="demo-run">${zh ? "查看不确定性" : "Check Uncertainty"}</button><p class="demo-output"></p>` +
        end
      );
    case "train-test-lab":
      return (
        start +
        `<label>${zh ? "模型复杂度" : "Model complexity"}<select class="demo-model"><option value="simple">${zh ? "简单模型" : "Simple Model"}</option><option value="complex">${zh ? "复杂模型" : "Complex Model"}</option></select></label>` +
        `<button type="button" class="demo-run">${zh ? "查看评分" : "View Scores"}</button><p class="demo-output"></p>` +
        end
      );
    case "error-analysis":
      return (
        start +
        `<label>${zh ? "错分场景" : "Error scenario"}<select class="demo-scenario"><option value="rain">${zh ? "雨天样本" : "Rainy samples"}</option><option value="night">${zh ? "夜间样本" : "Night samples"}</option></select></label>` +
        `<button type="button" class="demo-run">${zh ? "生成改进建议" : "Generate Fix Hint"}</button><p class="demo-output"></p>` +
        end
      );
    case "tree-builder":
      return (
        start +
        `<div class="demo-grid two">` +
        `<label>${zh ? "根问题" : "Root question"}<select class="demo-root"><option value="rain">${zh ? "是否降雨" : "Is it raining?"}</option><option value="temp">${zh ? "是否高温" : "Is it hot?"}</option><option value="wind">${zh ? "风力是否强" : "Is wind strong?"}</option></select></label>` +
        `<label>${zh ? "第二问题" : "Second question"}<select class="demo-second"><option value="rain">${zh ? "是否降雨" : "Is it raining?"}</option><option value="temp">${zh ? "是否高温" : "Is it hot?"}</option><option value="wind">${zh ? "风力是否强" : "Is wind strong?"}</option><option value="cloud">${zh ? "云量是否高" : "Is cloud cover high?"}</option></select></label>` +
        `</div><label>${zh ? "天气样本" : "Weather sample"}<select class="demo-weather"></select></label>` +
        `<button type="button" class="demo-run">${zh ? "计算路径" : "Compute Path"}</button><p class="demo-output"></p>` +
        end
      );
    case "path-trace":
      return (
        start +
        `<label>${zh ? "输入天气样本" : "Input weather sample"}<select class="demo-weather"></select></label>` +
        `<button type="button" class="demo-run">${zh ? "追踪路径" : "Trace Path"}</button><p class="demo-output"></p>` +
        end
      );
    case "fairness-inspector":
      return (
        start +
        `<label>${zh ? "比较方案" : "Compare plan"}<select class="demo-plan"><option value="A">Plan A</option><option value="B">Plan B</option></select></label>` +
        `<button type="button" class="demo-run">${zh ? "执行公平检查" : "Run Fairness Check"}</button><p class="demo-output"></p>` +
        end
      );
    case "risk-triage":
      return (
        start +
        `<label>${zh ? "任务风险级别" : "Task risk level"}<select class="demo-risk"><option value="low">${zh ? "低风险" : "Low risk"}</option><option value="medium">${zh ? "中风险" : "Medium risk"}</option><option value="high">${zh ? "高风险" : "High risk"}</option></select></label>` +
        `<button type="button" class="demo-run">${zh ? "生成审核建议" : "Generate Review Rule"}</button><p class="demo-output"></p>` +
        end
      );
    default:
      return start + `<p>${zh ? "暂无实验配置。" : "No lab configuration yet."}</p>` + end;
  }
}

function buildSlideHtml(chapter, slide, slideIndex, locale, i18n) {
  const total = chapter.slides.length;
  const isLab = String(slide.id || "").startsWith("lab");
  const worked = slide.workedExample ? `<div class="worked-example"><strong>${locale === "zh" ? "例题" : "Worked Example"}:</strong> ${escapeHtml(slide.workedExample)}</div>` : "";

  return `
  <section class="slide${slideIndex === 0 ? " active" : ""}" id="slide-${slideIndex + 1}" data-slide-number="${slideIndex + 1}" aria-label="${escapeAttr(
    `${slide.title}, ${slideIndex + 1} / ${total}`
  )}">
    <header class="slide-head">
      <div class="kicker">${escapeHtml(i18n.chapterLabel)} ${chapter.number}${escapeHtml(i18n.chapterSuffix)} · ${escapeHtml(chapter.title)}</div>
      <h1>${escapeHtml(slide.title)}</h1>
      <p>${escapeHtml(slide.subtitle)}</p>
    </header>
    <div class="slide-body">
      ${listHtml(slide.points, "bullet-list")}
      ${worked}
      ${isLab ? buildDemoHtml(chapter, slide, locale, i18n) : ""}
    </div>
    <footer class="slide-foot">
      <div class="progress-shell"><div class="progress-bar" style="width:${((slideIndex + 1) / total) * 100}%"></div></div>
      <div class="slide-meta">${slideIndex + 1} / ${total}</div>
    </footer>
  </section>`;
}

function buildExerciseCard(chapter, item, kind, index, locale, i18n) {
  const key = `grade5-ml:${locale}:${chapter.key}:${kind}-${index + 1}`;
  const answerId = `${locale}-${chapter.key}-${kind}-${index + 1}-answer`;
  const promptId = `${locale}-${chapter.key}-${kind}-${index + 1}-prompt`;
  return `
  <article class="exercise-card" data-kind="${kind}">
    <div class="exercise-head">
      <strong>${escapeHtml(kind === "bonus" ? i18n.bonus : i18n.reinforcement)} ${index + 1}</strong>
      <label><input type="checkbox" data-completion-key="${escapeAttr(key)}"> ${escapeHtml(i18n.done)}</label>
    </div>
    <p class="q">${escapeHtml(item.question)}</p>
    <details><summary>${escapeHtml(i18n.hint)}</summary><p>${escapeHtml(item.hint)}</p></details>
    <button type="button" class="toggle-answer" data-target="${escapeAttr(answerId)}" aria-expanded="false" aria-controls="${escapeAttr(answerId)}">${escapeHtml(
    i18n.revealAnswer
  )}</button>
    <div id="${escapeAttr(answerId)}" class="answer-panel" hidden>
      <p><strong>${escapeHtml(i18n.answer)}:</strong> ${escapeHtml(item.answer)}</p>
      <p><strong>${escapeHtml(i18n.rationale)}:</strong> ${escapeHtml(item.rationale)}</p>
    </div>
    <label for="${escapeAttr(promptId)}">${escapeHtml(locale === "zh" ? "写下你的解题理由" : "Write your reasoning")}</label>
    <textarea id="${escapeAttr(promptId)}" class="self-response" rows="3" placeholder="${escapeAttr(
      locale === "zh" ? "至少写 1 句，说明你用了哪些样本信息。" : "Write at least one sentence explaining which sample evidence you used."
    )}"></textarea>
    <button type="button" class="check-response">${escapeHtml(locale === "zh" ? "检查我的理由" : "Check My Reasoning")}</button>
    <p class="response-feedback"></p>
  </article>`;
}

function buildChapterHtml(courseData, chapter, bank, locale) {
  const i18n = uiText[locale];
  const total = chapter.slides.length;
  const notesJson = safeJson(chapter.slides.map((slide, index) => ({ index: index + 1, title: slide.title, note: slide.note })));
  const slideHtml = chapter.slides.map((slide, index) => buildSlideHtml(chapter, slide, index, locale, i18n)).join("");
  const exerciseHtml =
    bank.reinforcement.map((item, index) => buildExerciseCard(chapter, item, "reinforcement", index, locale, i18n)).join("") +
    bank.bonus.map((item, index) => buildExerciseCard(chapter, item, "bonus", index, locale, i18n)).join("");
  const langSwitchHref = locale === "zh" ? `./en/${chapterFileName(chapter)}` : `../${chapterFileName(chapter)}`;
  const homeHref = locale === "zh" ? "./index.html" : "./index.html";

  return `<!doctype html>
<html lang="${escapeAttr(i18n.lang)}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <link rel="icon" href="data:,">
  <title>${escapeHtml(chapter.title)} | ${escapeHtml(courseData.title)}</title>
  <style>
    :root{--primary:${chapter.color.primary};--secondary:${chapter.color.secondary};--accent:${chapter.color.accent};--ink:#1f2a35;--muted:#4c5e72;--line:#d2deea;--touch:44px}
    *{box-sizing:border-box} html,body{margin:0;padding:0}
    body{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI","PingFang SC","Hiragino Sans GB","Microsoft YaHei",sans-serif;color:var(--ink);background:radial-gradient(circle at 1px 1px, rgba(80,100,120,.16) 1px, transparent 0) 0 0/18px 18px,linear-gradient(180deg,#f1f5fa,#ecf2f7);min-height:100vh}
    a,button,input,select,summary{font:inherit} button,a.nav-link{min-height:var(--touch);min-width:var(--touch)}
    .app{max-width:1200px;margin:0 auto;padding:16px}
    .top{display:flex;gap:10px;justify-content:space-between;align-items:center;flex-wrap:wrap;margin-bottom:12px}
    .top-group{display:flex;gap:8px;flex-wrap:wrap}
    .nav-link,.tool-btn{border:1px solid var(--line);background:#fff;border-radius:999px;padding:10px 14px;text-decoration:none;color:var(--ink);cursor:pointer;box-shadow:0 8px 20px rgba(20,40,70,.08)}
    .badge{border:1px solid var(--line);padding:10px 14px;border-radius:999px;background:#fff;box-shadow:0 8px 20px rgba(20,40,70,.08);color:var(--muted)}
    .badge strong{color:var(--primary)}
    .layout{display:grid;grid-template-columns:minmax(0,1fr) 320px;gap:12px}
    .stage{border:1px solid rgba(255,255,255,.7);border-radius:24px;padding:12px;background:rgba(255,255,255,.5);backdrop-filter:blur(8px);box-shadow:0 18px 45px rgba(20,40,70,.12)}
    .slides{min-height:580px;position:relative;border-radius:18px;background:linear-gradient(180deg,#fff,#f8fbff);border:1px solid var(--line);overflow:hidden}
    .slide{position:absolute;inset:0;display:none;padding:20px;overflow:auto;grid-template-rows:auto 1fr auto;gap:12px}
    .slide.active{display:grid}
    .slide-head h1{margin:6px 0 8px;font-size:clamp(25px,2.8vw,36px)} .slide-head p{margin:0;color:var(--muted);line-height:1.7}
    .kicker{display:inline-flex;padding:6px 10px;border-radius:999px;background:var(--secondary);color:var(--primary);font-weight:700;font-size:13px}
    .slide-body{display:grid;gap:12px} .bullet-list{margin:0;padding-left:20px} .bullet-list li{line-height:1.7;margin-bottom:8px}
    .worked-example{border:1px dashed var(--line);border-radius:12px;padding:10px;background:#fffdf4;line-height:1.7}
    .slide-foot{display:grid;grid-template-columns:1fr auto;gap:10px;align-items:center} .progress-shell{height:12px;background:#d7e2ee;border-radius:999px;overflow:hidden}
    .progress-bar{height:100%;background:linear-gradient(90deg,var(--primary),var(--accent))} .slide-meta{color:var(--muted);font-size:14px}
    .nav-row{display:flex;justify-content:flex-end;gap:8px;margin-top:10px} .nav-btn{border:1px solid var(--line);background:#fff;border-radius:14px;padding:10px 14px;cursor:pointer}
    .nav-btn[disabled]{opacity:.5;cursor:not-allowed}
    .notes{border:1px solid var(--line);border-radius:20px;background:#fff;box-shadow:0 18px 45px rgba(20,40,70,.1);overflow:hidden}
    .notes h2{margin:0;font-size:18px} .notes-head{padding:14px 14px 12px;border-bottom:1px solid var(--line)} .notes-body{padding:14px;line-height:1.7;color:var(--ink)}
    .notes-hidden .layout{grid-template-columns:minmax(0,1fr)} .notes-hidden .notes{display:none}
    .demo-card{border:1px solid var(--line);border-radius:16px;padding:12px;background:#fff;display:grid;gap:10px}
    .demo-card h3{margin:0} .demo-grid{display:grid;gap:8px} .demo-grid.two{grid-template-columns:1fr 1fr}
    .demo-card label{display:grid;gap:4px;color:var(--muted)} .demo-card select,.demo-card input[type="range"]{width:100%;border:1px solid var(--line);border-radius:10px;padding:8px;background:#fff}
    .demo-run,.demo-reset{border:1px solid var(--line);background:var(--secondary);color:var(--ink);border-radius:12px;padding:10px 12px;cursor:pointer}
    .demo-actions{display:flex;justify-content:flex-start} .demo-status{margin:0;color:var(--primary);font-weight:700} .demo-output{margin:0;color:var(--ink);line-height:1.6;white-space:pre-line}
    .exercises{margin-top:18px;border:1px solid var(--line);border-radius:22px;padding:14px;background:#fff;box-shadow:0 18px 45px rgba(20,40,70,.1)}
    .exercises h2{margin:0 0 6px} .exercise-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}
    .exercise-card{border:1px solid var(--line);border-radius:16px;padding:12px;background:linear-gradient(180deg,#fff,#fbfcff);display:grid;gap:8px}
    .exercise-card[data-kind="bonus"]{background:linear-gradient(180deg,#fffaf0,#fff)} .exercise-head{display:flex;justify-content:space-between;gap:8px;align-items:center;flex-wrap:wrap}
    .exercise-head label{font-size:13px;color:var(--muted)} .q{margin:0;line-height:1.7}
    .exercise-card textarea{width:100%;border:1px solid var(--line);border-radius:10px;padding:8px;resize:vertical;line-height:1.5}
    .check-response{border:1px solid var(--line);background:#fff;border-radius:12px;padding:9px 12px;cursor:pointer;color:var(--ink);justify-self:start}
    .response-feedback{margin:0;color:var(--muted);line-height:1.6}
    details p{margin:8px 0 0;color:var(--muted)} .toggle-answer{border:1px solid var(--line);background:#fff;border-radius:12px;padding:9px 12px;cursor:pointer;color:var(--primary);font-weight:700;justify-self:start}
    .answer-panel{border:1px dashed rgba(100,120,140,.45);border-radius:12px;padding:10px;background:rgba(255,247,227,.5);line-height:1.7}
    .live{position:absolute;width:1px;height:1px;clip:rect(0,0,0,0);overflow:hidden}
    @media (max-width:980px){.layout{grid-template-columns:1fr}.notes{position:static}.exercise-grid{grid-template-columns:1fr}}
    @media (max-width:640px){.app{padding:10px}.top{display:grid}.top-group{display:grid;grid-template-columns:1fr 1fr}.slides{min-height:660px}.slide{padding:14px}.demo-grid.two{grid-template-columns:1fr}}
    @media (prefers-reduced-motion: reduce){*,*::before,*::after{animation:none!important;transition:none!important;scroll-behavior:auto!important}}
    @media print{body{background:#fff}.top,.notes,.nav-row{display:none!important}.app{max-width:none;padding:0}.stage{border:none;box-shadow:none;padding:0}.slides{border:none;background:none;overflow:visible}.slide{position:static;display:grid!important;page-break-after:always;break-after:page;border:1px solid var(--line);min-height:0}.slide:last-child{page-break-after:auto;break-after:auto}.exercises{box-shadow:none}}
  </style>
</head>
<body>
  <main class="app" id="app">
    <div class="top">
      <div class="top-group">
        <a class="nav-link" href="${homeHref}">${escapeHtml(i18n.backCatalog)}</a>
        <button type="button" class="tool-btn" id="jumpExercises">${escapeHtml(i18n.jumpExercises)}</button>
      </div>
      <div class="top-group">
        <a class="nav-link" href="${langSwitchHref}">${escapeHtml(i18n.languageSwitch)}</a>
        <div class="badge"><strong>${escapeHtml(i18n.chapterLabel)} ${chapter.number}${escapeHtml(i18n.chapterSuffix)}</strong> · ${escapeHtml(chapter.title)}</div>
        <button type="button" class="tool-btn" id="notesToggle" aria-controls="notesPanel" aria-expanded="true">${escapeHtml(i18n.hideNotes)}</button>
        <button type="button" class="tool-btn" id="fullscreenToggle">${escapeHtml(i18n.fullscreen)}</button>
      </div>
    </div>
    <div class="layout">
      <section class="stage">
        <div class="slides" id="slides" tabindex="0" aria-label="${escapeAttr(chapter.title)}">${slideHtml}</div>
        <div class="nav-row">
          <button type="button" class="nav-btn" id="prevButton">${escapeHtml(i18n.prev)}</button>
          <button type="button" class="nav-btn" id="nextButton">${escapeHtml(i18n.next)}</button>
        </div>
      </section>
      <aside class="notes" id="notesPanel">
        <div class="notes-head"><h2>${escapeHtml(i18n.notesTitle)}</h2><div id="notesTitle">1 · ${escapeHtml(chapter.slides[0].title)}</div></div>
        <div class="notes-body" id="notesBody">${escapeHtml(chapter.slides[0].note)}</div>
      </aside>
    </div>
    <section class="exercises" id="exerciseSection">
      <h2>${escapeHtml(i18n.exercisesTitle)}</h2>
      <p>${escapeHtml(i18n.exercisesDesc)}</p>
      <div class="exercise-grid">${exerciseHtml}</div>
    </section>
    <div class="live" id="liveRegion" aria-live="polite"></div>
  </main>
  <script>
    (() => {
      const TOTAL = ${total};
      const locale = ${safeJson(locale)};
      const i18n = ${safeJson(i18n)};
      const notesMeta = ${notesJson};
      const app = document.getElementById("app");
      const slidesRoot = document.getElementById("slides");
      const slides = Array.from(document.querySelectorAll(".slide"));
      const prevButton = document.getElementById("prevButton");
      const nextButton = document.getElementById("nextButton");
      const notesToggle = document.getElementById("notesToggle");
      const fullscreenToggle = document.getElementById("fullscreenToggle");
      const notesTitle = document.getElementById("notesTitle");
      const notesBody = document.getElementById("notesBody");
      const liveRegion = document.getElementById("liveRegion");
      const jumpExercises = document.getElementById("jumpExercises");
      let current = 1;
      let touchStartX = null;
      let touchStartY = null;

      const safeStorage = {
        get(key) { try { return window.localStorage.getItem(key); } catch (err) { return null; } },
        set(key, value) { try { window.localStorage.setItem(key, value); } catch (err) {} }
      };

      function readHash() {
        const match = window.location.hash.match(/^#slide-(\\d+)$/);
        if (!match) return 1;
        const n = Number(match[1]);
        return Number.isFinite(n) && n >= 1 && n <= TOTAL ? n : 1;
      }

      function writeHash(n) { history.replaceState(null, "", "#slide-" + n); }
      function updateButtons() { prevButton.disabled = current === 1; nextButton.disabled = current === TOTAL; }
      function announce(msg) { liveRegion.textContent = msg; }
      function updateNotes(n) { const info = notesMeta[n - 1]; notesTitle.textContent = n + " · " + info.title; notesBody.textContent = info.note; }

      function setSlide(n, silent) {
        current = n;
        slides.forEach((slide, idx) => {
          slide.classList.toggle("active", idx === n - 1);
          slide.setAttribute("aria-hidden", idx === n - 1 ? "false" : "true");
        });
        updateButtons();
        updateNotes(n);
        writeHash(n);
        if (!silent) announce(i18n.switchedSlide.replace("{n}", String(n)).replace("{total}", String(TOTAL)));
      }

      i18n.switchedSlide = locale === "zh" ? "已切换到第 {n} 页，共 {total} 页。" : "Moved to slide {n} of {total}.";

      function go(delta) {
        const target = Math.max(1, Math.min(TOTAL, current + delta));
        if (target !== current) setSlide(target, false);
      }

      function isInteractiveTarget(target) {
        if (!target || !(target instanceof Element)) return false;
        return Boolean(
          target.closest(
            "button, a, input, select, textarea, summary, details, [role='button'], [role='link'], [contenteditable='true'], [tabindex]:not([tabindex='-1'])"
          )
        );
      }

      function isSpaceKey(event) {
        return event.key === " " || event.key === "Spacebar" || event.code === "Space";
      }

      prevButton.addEventListener("click", () => go(-1));
      nextButton.addEventListener("click", () => go(1));

      document.addEventListener("keydown", (event) => {
        const t = event.target;
        const focusTarget = document.activeElement instanceof Element ? document.activeElement : t;
        const typing = t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.tagName === "SELECT" || t.isContentEditable);
        const interactive = isInteractiveTarget(t) || isInteractiveTarget(focusTarget);
        if (typing) return;
        if ((isSpaceKey(event) || event.key === "Enter") && interactive) return;

        if (event.key === "ArrowRight" || event.key === "PageDown" || isSpaceKey(event)) {
          event.preventDefault();
          go(1);
        } else if (event.key === "ArrowLeft" || event.key === "PageUp") {
          event.preventDefault();
          go(-1);
        } else if (event.key === "Home") {
          event.preventDefault();
          setSlide(1, false);
        } else if (event.key === "End") {
          event.preventDefault();
          setSlide(TOTAL, false);
        }
      });

      slidesRoot.addEventListener("touchstart", (event) => {
        const touch = event.changedTouches[0];
        touchStartX = touch.clientX;
        touchStartY = touch.clientY;
      }, { passive: true });

      slidesRoot.addEventListener("touchend", (event) => {
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

      window.addEventListener("hashchange", () => setSlide(readHash(), true));

      notesToggle.addEventListener("click", () => {
        const hidden = app.classList.toggle("notes-hidden");
        notesToggle.textContent = hidden ? i18n.showNotes : i18n.hideNotes;
        notesToggle.setAttribute("aria-expanded", String(!hidden));
      });

      jumpExercises.addEventListener("click", () => {
        const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        document.getElementById("exerciseSection").scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
      });

      fullscreenToggle.addEventListener("click", async () => {
        try {
          if (!document.fullscreenElement) {
            await document.documentElement.requestFullscreen();
            fullscreenToggle.textContent = i18n.exitFullscreen;
          } else {
            await document.exitFullscreen();
            fullscreenToggle.textContent = i18n.fullscreen;
          }
        } catch (err) {
          announce(i18n.unsupportedFullscreen);
        }
      });

      document.addEventListener("fullscreenchange", () => {
        fullscreenToggle.textContent = document.fullscreenElement ? i18n.exitFullscreen : i18n.fullscreen;
      });

      document.querySelectorAll(".toggle-answer").forEach((button) => {
        button.addEventListener("click", () => {
          const panel = document.getElementById(button.dataset.target);
          const open = !panel.hasAttribute("hidden");
          if (open) {
            panel.setAttribute("hidden", "");
            button.textContent = i18n.revealAnswer;
            button.setAttribute("aria-expanded", "false");
          } else {
            panel.removeAttribute("hidden");
            button.textContent = i18n.hideAnswer;
            button.setAttribute("aria-expanded", "true");
          }
        });
      });

      document.querySelectorAll("[data-completion-key]").forEach((input) => {
        const key = input.dataset.completionKey;
        input.checked = safeStorage.get(key) === "1";
        input.addEventListener("change", () => safeStorage.set(key, input.checked ? "1" : "0"));
      });

      document.querySelectorAll(".exercise-card").forEach((card) => {
        const textArea = card.querySelector(".self-response");
        const check = card.querySelector(".check-response");
        const feedback = card.querySelector(".response-feedback");
        if (!textArea || !check || !feedback) return;
        check.addEventListener("click", () => {
          const text = (textArea.value || "").trim();
          const hasLength = text.length >= 30;
          const evidencePattern = locale === "zh" ? /(样本|特征|因为|路径|错分|测试|数据|规则)/ : /(sample|feature|because|path|error|test|data|rule)/i;
          const hasEvidenceWord = evidencePattern.test(text);
          if (hasLength && hasEvidenceWord) {
            feedback.textContent = locale === "zh"
              ? "反馈：理由完整，且引用了可检查的证据。下一步可补充一个反例。"
              : "Feedback: strong reasoning with checkable evidence. Next, add one counter-example.";
          } else if (text.length === 0) {
            feedback.textContent = locale === "zh"
              ? "反馈：先写下你的判断依据，再点击检查。"
              : "Feedback: write your evidence first, then run the check.";
          } else {
            feedback.textContent = locale === "zh"
              ? "反馈：请再具体一些，至少 30 字，并包含“样本/特征/因为/路径”等证据词。"
              : "Feedback: be more specific—use at least 30 characters and include evidence words like sample/feature/because/path.";
          }
        });
      });

      function updateDemoStatus(root, text) {
        const status = root.querySelector(".demo-status");
        if (status) {
          const label = status.dataset.statusLabel || status.textContent.split(":")[0];
          status.textContent = label + ": " + text;
        }
      }

      function fillStatusLabels() {
        document.querySelectorAll(".demo-card").forEach((root) => {
          const status = root.querySelector(".demo-status");
          if (!status) return;
          const label = status.textContent.split(":")[0];
          status.dataset.statusLabel = label;
        });
      }

      function initRulesVsLearning(root) {
        const samples = [
          { id: "S1", color: locale === "zh" ? "红" : "Red", weight: 160, sweetness: 8 },
          { id: "S2", color: locale === "zh" ? "绿" : "Green", weight: 120, sweetness: 4 },
          { id: "S3", color: locale === "zh" ? "黄" : "Yellow", weight: 140, sweetness: 7 },
          { id: "S4", color: locale === "zh" ? "红" : "Red", weight: 110, sweetness: 5 }
        ];
        const sampleSelect = root.querySelector(".demo-sample");
        const modeSelect = root.querySelector(".demo-mode");
        const output = root.querySelector(".demo-output");
        const run = root.querySelector(".demo-run");
        const reset = root.querySelector(".demo-reset");

        sampleSelect.innerHTML = samples
          .map((s) => "<option value='" + s.id + "'>" + s.id + " (" + s.color + ", " + s.weight + "g, " + (locale === "zh" ? "甜度" : "sweetness ") + s.sweetness + ")</option>")
          .join("");

        run.addEventListener("click", () => {
          const sample = samples.find((s) => s.id === sampleSelect.value) || samples[0];
          let result = "";
          if (modeSelect.value === "rule") {
            result = sample.color === (locale === "zh" ? "红" : "Red") && sample.weight >= 130 ? (locale === "zh" ? "A 箱" : "Box A") : (locale === "zh" ? "B 箱" : "Box B");
          } else {
            const score = sample.sweetness * 2 + (sample.weight >= 130 ? 2 : 0);
            result = score >= 14 ? (locale === "zh" ? "A 箱" : "Box A") : (locale === "zh" ? "B 箱" : "Box B");
          }
          output.textContent = (locale === "zh" ? "输出结果：" : "Output: ") + result;
          updateDemoStatus(root, (locale === "zh" ? "已计算 " : "Computed ") + sample.id + " -> " + result);
        });
        reset.addEventListener("click", () => { modeSelect.value = "rule"; sampleSelect.value = "S1"; output.textContent = ""; updateDemoStatus(root, locale === "zh" ? "已重置" : "Reset complete"); });
      }

      function initStabilityCheck(root) {
        const samples = [{ id: "S1", score: 15 }, { id: "S2", score: 10 }, { id: "S3", score: 13 }];
        const sampleSelect = root.querySelector(".demo-sample");
        const run = root.querySelector(".demo-run");
        const reset = root.querySelector(".demo-reset");
        const output = root.querySelector(".demo-output");
        sampleSelect.innerHTML = samples.map((s) => "<option value='" + s.id + "'>" + s.id + "</option>").join("");
        run.addEventListener("click", () => {
          const sample = samples.find((s) => s.id === sampleSelect.value) || samples[0];
          const result = sample.score >= 12 ? "A" : "B";
          output.textContent = locale === "zh"
            ? ("三次输出一致：" + result + ", " + result + ", " + result + "\\n解释：同一输入得到相同输出，说明过程稳定；下一步要测试边界样本。")
            : ("Three identical runs: " + result + ", " + result + ", " + result + "\\nWhy it matters: same input gives same output, so computation is stable; next test edge-case samples.");
          updateDemoStatus(root, locale === "zh" ? "稳定性通过" : "Stability passed");
        });
        reset.addEventListener("click", () => { sampleSelect.value = "S1"; output.textContent = ""; updateDemoStatus(root, locale === "zh" ? "已重置" : "Reset complete"); });
      }

      function initFeatureLabelSorter(root) {
        const fields = locale === "zh"
          ? [{ name: "耳朵长度", correct: "feature" }, { name: "活动时长", correct: "feature" }, { name: "是否夜行", correct: "label" }, { name: "样本编号", correct: "ignore" }]
          : [{ name: "Ear length", correct: "feature" }, { name: "Active minutes", correct: "feature" }, { name: "Night-active", correct: "label" }, { name: "Sample ID", correct: "ignore" }];
        const sorter = root.querySelector(".demo-sorter");
        const run = root.querySelector(".demo-run");
        const reset = root.querySelector(".demo-reset");
        const output = root.querySelector(".demo-output");
        const render = () => {
          sorter.innerHTML = fields.map((f, idx) => {
            const featureLabel = locale === "zh" ? "特征" : "Feature";
            const labelLabel = locale === "zh" ? "标签" : "Label";
            const ignoreLabel = locale === "zh" ? "不应使用" : "Ignore";
            return "<label>" + f.name + "<select data-i='" + idx + "'><option value='feature'>" + featureLabel + "</option><option value='label'>" + labelLabel + "</option><option value='ignore'>" + ignoreLabel + "</option></select></label>";
          }).join("");
        };
        render();
        run.addEventListener("click", () => {
          let score = 0;
          const mistakes = [];
          sorter.querySelectorAll("select").forEach((sel, idx) => {
            if (sel.value === fields[idx].correct) score += 1;
            else mistakes.push(fields[idx].name);
          });
          output.textContent = (locale === "zh" ? "正确 " : "Correct ") + score + " / " + fields.length +
            (mistakes.length ? (locale === "zh" ? ("；需复查：" + mistakes.join("、")) : ("; review: " + mistakes.join(", "))) : "");
          updateDemoStatus(root, score === fields.length ? (locale === "zh" ? "全部正确" : "All correct") : (locale === "zh" ? "继续修正" : "Need correction"));
        });
        reset.addEventListener("click", () => { render(); output.textContent = ""; updateDemoStatus(root, locale === "zh" ? "已重置" : "Reset complete"); });
      }

      function initDataCleanup(root) {
        const unit = root.querySelector(".demo-unit");
        const missing = root.querySelector(".demo-missing");
        const run = root.querySelector(".demo-run");
        const reset = root.querySelector(".demo-reset");
        const output = root.querySelector(".demo-output");
        run.addEventListener("click", () => {
          const score = (unit.value === "gram" ? 55 : 25) + (missing.value === "rule" ? 45 : 20);
          output.textContent = locale === "zh" ? ("数据质量评分: " + score + "/100") : ("Data quality score: " + score + "/100");
          updateDemoStatus(root, score >= 90 ? (locale === "zh" ? "可进入训练" : "Ready for training") : (locale === "zh" ? "需继续清洗" : "Needs more cleanup"));
        });
        reset.addEventListener("click", () => { unit.value = "mixed"; missing.value = "raw"; output.textContent = ""; updateDemoStatus(root, locale === "zh" ? "已重置" : "Reset complete"); });
      }

      function initBoundaryBoard(root) {
        const points = [{ x: 2, label: "A" }, { x: 3, label: "A" }, { x: 4, label: "A" }, { x: 6, label: "B" }, { x: 7, label: "B" }, { x: 8, label: "B" }];
        const testPoint = { x: 5 };
        const threshold = root.querySelector(".demo-threshold");
        const thresholdValue = root.querySelector(".demo-threshold-value");
        const run = root.querySelector(".demo-run");
        const reset = root.querySelector(".demo-reset");
        const output = root.querySelector(".demo-output");
        threshold.addEventListener("input", () => { thresholdValue.textContent = threshold.value; });
        run.addEventListener("click", () => {
          const t = Number(threshold.value);
          let correct = 0;
          points.forEach((p) => { const pred = p.x < t ? "A" : "B"; if (pred === p.label) correct += 1; });
          const acc = Math.round((correct / points.length) * 100);
          const pred = testPoint.x < t ? "A" : "B";
          const advice = acc >= 83
            ? (locale === "zh" ? "当前阈值较稳，可继续测试边界点 x=5 附近。" : "This threshold is fairly stable; now test around boundary x=5.")
            : (locale === "zh" ? "当前阈值造成较多错分，尝试更靠近两类分界。" : "This threshold causes extra errors; move closer to the class boundary.");
          output.textContent = locale === "zh"
            ? ("训练准确率 " + acc + "%，测试点预测: " + pred + "。建议：" + advice)
            : ("Train accuracy " + acc + "%, test prediction: " + pred + ". Next step: " + advice);
          updateDemoStatus(root, (locale === "zh" ? "阈值已评估: " : "Threshold evaluated: ") + t);
        });
        reset.addEventListener("click", () => { threshold.value = "5"; thresholdValue.textContent = "5"; output.textContent = ""; updateDemoStatus(root, locale === "zh" ? "已重置" : "Reset complete"); });
      }

      function initConfidenceMeter(root) {
        const testx = root.querySelector(".demo-testx");
        const testxValue = root.querySelector(".demo-testx-value");
        const run = root.querySelector(".demo-run");
        const reset = root.querySelector(".demo-reset");
        const output = root.querySelector(".demo-output");
        testx.addEventListener("input", () => { testxValue.textContent = testx.value; });
        run.addEventListener("click", () => {
          const x = Number(testx.value);
          const distance = Math.abs(x - 5);
          const confidence = Math.max(50, 98 - distance * 12);
          const review = confidence < 70;
          output.textContent = locale === "zh"
            ? ("置信提示: " + confidence + "%，" + (review ? "建议人工复核" : "可自动通过初筛"))
            : ("Confidence cue: " + confidence + "%, " + (review ? "human review recommended" : "auto pre-screen acceptable"));
          updateDemoStatus(root, review ? (locale === "zh" ? "高不确定性" : "High uncertainty") : (locale === "zh" ? "不确定性较低" : "Lower uncertainty"));
        });
        reset.addEventListener("click", () => { testx.value = "5"; testxValue.textContent = "5"; output.textContent = ""; updateDemoStatus(root, locale === "zh" ? "已重置" : "Reset complete"); });
      }

      function initTrainTestLab(root) {
        const model = root.querySelector(".demo-model");
        const run = root.querySelector(".demo-run");
        const reset = root.querySelector(".demo-reset");
        const output = root.querySelector(".demo-output");
        const table = { simple: { train: 88, test: 85, wrong: 4 }, complex: { train: 98, test: 77, wrong: 9 } };
        run.addEventListener("click", () => {
          const row = table[model.value];
          const recommendation = model.value === "simple"
            ? (locale === "zh" ? "推荐：先用简单模型，再通过补数据逐步改进。" : "Recommendation: keep the simple model first, then improve with better data.")
            : (locale === "zh" ? "提醒：训练高分但测试下降，先排查过拟合再上线。" : "Warning: train score is high but test score drops; check overfitting before deployment.");
          output.textContent = locale === "zh"
            ? ("训练 " + row.train + "%，测试 " + row.test + "%，错分 " + row.wrong + " 条。\\n" + recommendation)
            : ("Train " + row.train + "%, test " + row.test + "%, misclassified " + row.wrong + ".\\n" + recommendation);
          updateDemoStatus(root, model.value === "simple" ? (locale === "zh" ? "简单模型更稳" : "Simple model is steadier") : (locale === "zh" ? "复杂模型可能过拟合" : "Complex model may overfit"));
        });
        reset.addEventListener("click", () => { model.value = "simple"; output.textContent = ""; updateDemoStatus(root, locale === "zh" ? "已重置" : "Reset complete"); });
      }

      function initErrorAnalysis(root) {
        const scenario = root.querySelector(".demo-scenario");
        const run = root.querySelector(".demo-run");
        const reset = root.querySelector(".demo-reset");
        const output = root.querySelector(".demo-output");
        run.addEventListener("click", () => {
          if (scenario.value === "rain") {
            output.textContent = locale === "zh" ? "雨天组错误率高，建议补充雨天样本并检查传感字段。": "Rainy group errors are high; add rainy samples and audit weather features.";
            updateDemoStatus(root, locale === "zh" ? "优先补齐雨天数据" : "Prioritize rainy data coverage");
          } else {
            output.textContent = locale === "zh" ? "夜间组错分偏高，建议增加夜间样本并做分组评估。": "Night group has elevated errors; add night samples and run grouped evaluation.";
            updateDemoStatus(root, locale === "zh" ? "需做夜间专项复查" : "Night-specific review needed");
          }
        });
        reset.addEventListener("click", () => { scenario.value = "rain"; output.textContent = ""; updateDemoStatus(root, locale === "zh" ? "已重置" : "Reset complete"); });
      }

      function evaluateTree(sample, rootQuestion, secondQuestion) {
        const ask = {
          rain: { zh: "是否降雨", en: "Is it raining?" },
          temp: { zh: "是否高温", en: "Is it hot?" },
          wind: { zh: "风力是否强", en: "Is wind strong?" },
          cloud: { zh: "云量是否高", en: "Is cloud cover high?" }
        };
        const valueMap = (key) => (key === "rain" ? sample.rain : key === "temp" ? sample.temp : key === "wind" ? sample.wind : sample.cloud);
        const fallbackSecond = rootQuestion === "rain" ? "wind" : "rain";
        const effectiveSecond = secondQuestion === rootQuestion ? fallbackSecond : secondQuestion;
        const rootValue = valueMap(rootQuestion);
        const secondValue = valueMap(effectiveSecond);
        // Deterministic two-level tree: root split then second split controls final class.
        const output = rootValue
          ? (secondValue ? "stay" : "go")
          : (secondValue ? "go" : "stay");

        const yesNo = (v) => (locale === "zh" ? (v ? "是" : "否") : (v ? "Yes" : "No"));
        const resultLabel = locale === "zh" ? (output === "go" ? "去户外" : "不去户外") : (output === "go" ? "Go outside" : "Stay inside");
        const expectedLabel = locale === "zh" ? (sample.expected === "go" ? "去户外" : "不去户外") : (sample.expected === "go" ? "Go outside" : "Stay inside");
        const correctness = output === sample.expected
          ? (locale === "zh" ? "与样本标签一致" : "matches sample label")
          : (locale === "zh" ? "与样本标签不一致" : "does not match sample label");
        const pathText = locale === "zh"
          ? ("路径: " + ask[rootQuestion].zh + "=" + yesNo(rootValue) + " -> " + ask[effectiveSecond].zh + "=" + yesNo(secondValue) + " -> 输出: " + resultLabel +
            "；样本标签: " + expectedLabel + "（" + correctness + "）")
          : ("Path: " + ask[rootQuestion].en + "=" + yesNo(rootValue) + " -> " + ask[effectiveSecond].en + "=" + yesNo(secondValue) + " -> Output: " + resultLabel +
            "; sample label: " + expectedLabel + " (" + correctness + ")");
        return { resultLabel, pathText, effectiveSecond };
      }

      function weatherSamples() {
        return [
          { id: "W1", rain: true, temp: false, wind: true, cloud: true, expected: "stay" },
          { id: "W2", rain: false, temp: true, wind: false, cloud: false, expected: "go" },
          { id: "W3", rain: false, temp: false, wind: true, cloud: true, expected: "stay" },
          { id: "W4", rain: true, temp: true, wind: false, cloud: true, expected: "stay" }
        ];
      }

      function sampleLabel(s) {
        return locale === "zh"
          ? (s.id + " (雨:" + (s.rain ? "是" : "否") + ", 高温:" + (s.temp ? "是" : "否") + ", 风强:" + (s.wind ? "是" : "否") + ", 云高:" + (s.cloud ? "是" : "否") + ")")
          : (s.id + " (rain:" + (s.rain ? "yes" : "no") + ", hot:" + (s.temp ? "yes" : "no") + ", wind:" + (s.wind ? "yes" : "no") + ", cloud:" + (s.cloud ? "yes" : "no") + ")");
      }

      function initTreeBuilder(root) {
        const rootQ = root.querySelector(".demo-root");
        const secondQ = root.querySelector(".demo-second");
        const weather = root.querySelector(".demo-weather");
        const run = root.querySelector(".demo-run");
        const reset = root.querySelector(".demo-reset");
        const output = root.querySelector(".demo-output");
        const samples = weatherSamples();
        weather.innerHTML = samples.map((s) => "<option value='" + s.id + "'>" + sampleLabel(s) + "</option>").join("");

        run.addEventListener("click", () => {
          const sample = samples.find((s) => s.id === weather.value) || samples[0];
          const trace = evaluateTree(sample, rootQ.value, secondQ.value);
          output.textContent = (locale === "zh" ? ("样本 " + sample.id + " · ") : ("Sample " + sample.id + " · ")) + trace.pathText;
          if (trace.effectiveSecond !== secondQ.value) {
            output.textContent += locale === "zh" ? "；提示：第二问题不能与根问题相同，系统已自动替换。" : "; Note: the second question cannot match the root, so it was auto-swapped.";
          }
          updateDemoStatus(root, locale === "zh" ? ("已评估 " + sample.id + "，结果: " + trace.resultLabel) : ("Evaluated " + sample.id + ", result: " + trace.resultLabel));
        });
        reset.addEventListener("click", () => { rootQ.value = "rain"; secondQ.value = "temp"; weather.value = "W1"; output.textContent = ""; updateDemoStatus(root, locale === "zh" ? "已重置" : "Reset complete"); });
      }

      function initPathTrace(root) {
        const weather = root.querySelector(".demo-weather");
        const run = root.querySelector(".demo-run");
        const reset = root.querySelector(".demo-reset");
        const output = root.querySelector(".demo-output");
        const samples = weatherSamples();
        weather.innerHTML = samples.map((s) => "<option value='" + s.id + "'>" + sampleLabel(s) + "</option>").join("");
        run.addEventListener("click", () => {
          const sample = samples.find((s) => s.id === weather.value) || samples[0];
          const trace = evaluateTree(sample, "rain", "wind");
          output.textContent = (locale === "zh" ? ("样本 " + sample.id + " · ") : ("Sample " + sample.id + " · ")) + trace.pathText;
          updateDemoStatus(root, locale === "zh" ? ("已完成路径追踪: " + sample.id) : ("Path tracing completed: " + sample.id));
        });
        reset.addEventListener("click", () => { weather.value = "W1"; output.textContent = ""; updateDemoStatus(root, locale === "zh" ? "已重置" : "Reset complete"); });
      }

      function initFairnessInspector(root) {
        const plan = root.querySelector(".demo-plan");
        const run = root.querySelector(".demo-run");
        const reset = root.querySelector(".demo-reset");
        const output = root.querySelector(".demo-output");
        const plans = { A: { group1: 6, group2: 15, coverageGap: 38 }, B: { group1: 8, group2: 10, coverageGap: 6 } };
        run.addEventListener("click", () => {
          const p = plans[plan.value];
          const fair = Math.abs(p.group1 - p.group2) <= 4 && p.coverageGap <= 10;
          output.textContent = locale === "zh"
            ? ("组1错误率 " + p.group1 + "%，组2错误率 " + p.group2 + "%，覆盖差 " + p.coverageGap + "%。")
            : ("Group1 error " + p.group1 + "%, Group2 error " + p.group2 + "%, coverage gap " + p.coverageGap + "%.");
          updateDemoStatus(root, fair ? (locale === "zh" ? "方案更公平，仍需人工审核高风险样本" : "Plan is fairer; high-risk samples still need human review") : (locale === "zh" ? "公平风险偏高，建议补数据并复查" : "Fairness risk is high; add data and review"));
        });
        reset.addEventListener("click", () => { plan.value = "A"; output.textContent = ""; updateDemoStatus(root, locale === "zh" ? "已重置" : "Reset complete"); });
      }

      function initRiskTriage(root) {
        const risk = root.querySelector(".demo-risk");
        const run = root.querySelector(".demo-run");
        const reset = root.querySelector(".demo-reset");
        const output = root.querySelector(".demo-output");
        run.addEventListener("click", () => {
          if (risk.value === "high") {
            output.textContent = locale === "zh" ? "规则: 高风险任务必须人工复核，且记录审核理由。" : "Rule: High-risk outputs require human review with logged rationale.";
            updateDemoStatus(root, locale === "zh" ? "触发强制人工审核" : "Mandatory human review triggered");
          } else if (risk.value === "medium") {
            output.textContent = locale === "zh" ? "规则: 中风险任务先自动建议，再抽样人工复查。" : "Rule: Medium-risk outputs use auto suggestion plus sampled human checks.";
            updateDemoStatus(root, locale === "zh" ? "触发抽样复查" : "Sampled review triggered");
          } else {
            output.textContent = locale === "zh" ? "规则: 低风险任务可自动初筛，但保留追踪日志。" : "Rule: Low-risk outputs may auto pre-screen with audit logs.";
            updateDemoStatus(root, locale === "zh" ? "低风险自动初筛" : "Low-risk pre-screen enabled");
          }
        });
        reset.addEventListener("click", () => { risk.value = "low"; output.textContent = ""; updateDemoStatus(root, locale === "zh" ? "已重置" : "Reset complete"); });
      }

      function initDemos() {
        document.querySelectorAll(".demo-card").forEach((root) => {
          const type = root.dataset.demoType;
          if (type === "rules-vs-learning") initRulesVsLearning(root);
          if (type === "stability-check") initStabilityCheck(root);
          if (type === "feature-label-sorter") initFeatureLabelSorter(root);
          if (type === "data-cleanup") initDataCleanup(root);
          if (type === "boundary-board") initBoundaryBoard(root);
          if (type === "confidence-meter") initConfidenceMeter(root);
          if (type === "train-test-lab") initTrainTestLab(root);
          if (type === "error-analysis") initErrorAnalysis(root);
          if (type === "tree-builder") initTreeBuilder(root);
          if (type === "path-trace") initPathTrace(root);
          if (type === "fairness-inspector") initFairnessInspector(root);
          if (type === "risk-triage") initRiskTriage(root);
        });
      }

      fillStatusLabels();
      setSlide(readHash(), true);
      updateButtons();
      initDemos();
    })();
  </script>
</body>
</html>`;
}

function buildRootHtml(courseData, chapterData, locale) {
  const i18n = uiText[locale];
  const toOther = locale === "zh" ? "./en/index.html" : "../index.html";
  return `<!doctype html>
<html lang="${escapeAttr(i18n.lang)}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <link rel="icon" href="data:,">
  <title>${escapeHtml(courseData.title)}</title>
  <style>
    :root{--ink:#1f2a35;--muted:#4c5e72;--line:#d2deea} *{box-sizing:border-box}
    body{margin:0;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI","PingFang SC","Hiragino Sans GB","Microsoft YaHei",sans-serif;color:var(--ink);background:radial-gradient(circle at 1px 1px, rgba(80,100,120,.15) 1px, transparent 0) 0 0/18px 18px, linear-gradient(180deg,#f3f7fb,#ecf2f8)}
    .wrap{max-width:1100px;margin:0 auto;padding:20px 14px 26px}
    .hero{background:#fff;border:1px solid var(--line);border-radius:24px;padding:20px;box-shadow:0 16px 40px rgba(20,40,70,.1)}
    h1{margin:0 0 6px;font-size:clamp(28px,4vw,42px)} .hero p{margin:0;color:var(--muted);line-height:1.7}
    .lang-row{margin-top:10px;display:flex;gap:8px;flex-wrap:wrap}
    .lang-link,.lang-pill{border:1px solid var(--line);border-radius:999px;background:#fff;padding:8px 12px;text-decoration:none;color:var(--ink)}
    .grid{margin-top:12px;display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:10px}
    .card{background:#fff;border:1px solid var(--line);border-radius:18px;padding:14px;display:grid;gap:8px}
    .card h2{margin:0;font-size:23px}
    .k{color:var(--muted);font-size:13px} .tag{color:var(--muted);line-height:1.7;margin:0}
    .go{display:inline-flex;align-items:center;justify-content:center;min-height:44px;border:1px solid transparent;border-radius:12px;padding:9px 12px;text-decoration:none;color:#fff;background:var(--primary);font-weight:700}
    @media (max-width:640px){.wrap{padding:12px}}
  </style>
</head>
<body>
  <main class="wrap">
    <section class="hero">
      <h1>${escapeHtml(courseData.title)}</h1>
      <p>${escapeHtml(courseData.subtitle)}. ${escapeHtml(i18n.courseSummary)}</p>
      <div class="lang-row">
        <span class="lang-pill">${escapeHtml(i18n.indexLangBadge)}</span>
        <a class="lang-link" href="${toOther}">${escapeHtml(i18n.languageSwitch)}</a>
      </div>
    </section>
    <section class="grid">
      ${chapterData
        .map(
          (chapter) => `<article class="card" style="--primary:${chapter.color.primary}">
          <div class="k">${escapeHtml(i18n.chapterLabel)} ${chapter.number}${escapeHtml(i18n.chapterSuffix)}</div>
          <h2>${escapeHtml(chapter.title)}</h2>
          <p class="tag">${escapeHtml(chapter.tagline)}</p>
          <a class="go" href="./${escapeAttr(chapterFileName(chapter))}">${escapeHtml(i18n.enterChapter)}</a>
        </article>`
        )
        .join("")}
    </section>
  </main>
</body>
</html>`;
}

function writeBundle(targetDir = OUTPUT_DIR) {
  const allGenerated = [];
  ["zh", "en"].forEach((locale) => {
    const { course, chapters } = bundles[locale];
    const exercises = exerciseBanks[locale];
    const errors = validateData(course, chapters, exercises, locale);
    if (errors.length) throw new Error("Validation failed:\n" + errors.map((e) => "- " + e).join("\n"));

    const localeDir = locale === "zh" ? targetDir : path.join(targetDir, "en");
    if (!fs.existsSync(localeDir)) fs.mkdirSync(localeDir, { recursive: true });

    fs.writeFileSync(path.join(localeDir, "index.html"), buildRootHtml(course, chapters, locale), "utf8");
    chapters.forEach((chapter) => {
      const fileName = chapterFileName(chapter);
      const html = buildChapterHtml(course, chapter, exercises[chapter.key], locale);
      fs.writeFileSync(path.join(localeDir, fileName), html, "utf8");
      allGenerated.push(path.relative(targetDir, path.join(localeDir, fileName)));
    });
  });
  return allGenerated;
}

if (require.main === module) {
  const generated = writeBundle(OUTPUT_DIR);
  console.log(`Generated ${generated.length + 2} files across zh and en editions.`);
}

module.exports = { validateData, buildRootHtml, buildChapterHtml, writeBundle, chapterFileName };
