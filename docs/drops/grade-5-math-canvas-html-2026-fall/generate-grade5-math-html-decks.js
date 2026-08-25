const fs = require("fs");
const path = require("path");
const vm = require("vm");

const SOURCE_SCRIPT = path.resolve(
  __dirname,
  "../grade5-math-decks/generate-grade5-math-decks.js"
);
const OUT_DIR = __dirname;
const PPT_BASE_URL =
  "https://imarchuang.github.io/drops/grade-5-math-chapter-decks-2026-fall/";
const TOTAL_SLIDES = 9;

const FIXES = [
  {
    chapterKey: "decimals-add-subtract",
    field: "diagnostic[2].a",
    original: "更接近8，也可先判断不可能接近9。",
    corrected: "更接近9，因为 6.2 + 1.89 = 8.09，离 9 更近。",
    reason: "原答案与题目“更接近 7 还是 9”的比较结果不一致。",
  },
];

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function removeIfExists(targetPath) {
  if (fs.existsSync(targetPath)) {
    fs.rmSync(targetPath, { recursive: true, force: true });
  }
}

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

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function extractArrayConstant(source, name) {
  const match = source.match(new RegExp(`const\\s+${name}\\s*=\\s*(\\[[\\s\\S]*?\\n\\]);`));
  if (!match) {
    throw new Error(`Could not extract ${name} from source script.`);
  }
  const context = {};
  vm.runInNewContext(`${name} = ${match[1]};`, context, { timeout: 1000 });
  return context[name];
}

function loadSourceData() {
  const source = fs.readFileSync(SOURCE_SCRIPT, "utf8");
  return {
    deckStructure: extractArrayConstant(source, "DECK_STRUCTURE"),
    chapters: extractArrayConstant(source, "CHAPTERS"),
  };
}

function applyFixes(chapters) {
  const next = clone(chapters);
  const applied = [];
  for (const fix of FIXES) {
    const chapter = next.find((item) => item.key === fix.chapterKey);
    if (!chapter) continue;
    if (fix.field === "diagnostic[2].a") {
      const current = chapter.diagnostic?.[2]?.a;
      if (current === fix.original) {
        chapter.diagnostic[2].a = fix.corrected;
        applied.push(fix);
      }
    }
  }
  return { chapters: next, applied };
}

function pptHref(chapter) {
  return `${PPT_BASE_URL}${encodeURIComponent(chapter.title)}.pptx`;
}

function chapterLabel(index) {
  return `第 ${index + 1} 章`;
}

function listHtml(items, options = {}) {
  const className = options.className ? ` class="${options.className}"` : "";
  return `<ul${className}>${items
    .map((item) => `<li>${escapeHtml(item)}</li>`)
    .join("")}</ul>`;
}

function quoteListHtml(items, label) {
  return `
    <div class="quote-list">
      <div class="mini-label">${escapeHtml(label)}</div>
      <ol>
        ${items
          .map(
            (item, index) =>
              `<li><span class="order-badge">${index + 1}</span><span>${escapeHtml(item)}</span></li>`
          )
          .join("")}
      </ol>
    </div>
  `;
}

function answerToggleHtml(id, title, contentHtml) {
  return `
    <div class="answer-area">
      <button class="toggle-answer" type="button" data-target="${escapeAttr(
        id
      )}" aria-expanded="false" aria-controls="${escapeAttr(id)}">
        显示答案
      </button>
      <div class="answer-panel" id="${escapeAttr(id)}" hidden>
        <div class="answer-title">${escapeHtml(title)}</div>
        ${contentHtml}
      </div>
    </div>
  `;
}

function notesForSlide(chapter, kind) {
  switch (kind) {
    case "cover":
      return {
        timing: chapter.hours === "2课时" ? "4分钟" : "3分钟",
        prompts: [
          `请学生先读出《${chapter.title}》并说说最先想到的知识点`,
          `用“${chapter.tagline}”串起本章学习氛围`,
          "提醒本课会按九站结构推进，先诊断再讲解再练习",
        ],
        responses: [
          `学生能说出与“${chapter.title}”有关的生活或旧知场景`,
          `学生知道本章聚焦：${chapter.focus}`,
        ],
        pacing:
          chapter.hours === "2课时"
            ? "封面只做导入，不展开讲知识点；第一课时重点推进到例题。"
            : "单课时内封面控制在3分钟左右，迅速进入诊断页。",
      };
    case "diagnostic":
      return {
        timing: "6分钟",
        prompts: [
          "先读学习目标，再逐题口答诊断",
          `每题追问“你为什么这样想”，用错因决定后面讲解节奏`,
          "把学生卡住的地方记在板书角落，后面回看",
        ],
        responses: chapter.diagnostic.map((item) => item.a),
        pacing: "目标2分钟，诊断4分钟；若三题错两题以上，本章节奏要放慢。",
      };
    case "concept":
      return {
        timing: "8分钟",
        prompts: [
          `围绕“${chapter.conceptTitle}”先看图再说规则`,
          "至少追问一次“为什么能这样做/这样判断”",
          "请学生用自己的话复述三个要点",
        ],
        responses: chapter.conceptBullets,
        pacing:
          chapter.hours === "2课时"
            ? "这是整章的模型页，宁可少做一题，也要把模型说明白。"
            : "单课时中本页讲清后立刻进入例题，避免停留过久。",
      };
    case "worked":
      return {
        timing: "9分钟",
        prompts: [
          "先让学生独立想30秒，再展示完整示范",
          "每一步都对应回模型，不只报算式结果",
          "答案出来后立刻做一次合理性检查",
        ],
        responses: [...chapter.worked.steps, `答案：${chapter.worked.answer}`],
        pacing: "审题3分钟，示范4分钟，复述与检查2分钟。",
      };
    case "bug":
      return {
        timing: "7分钟",
        prompts: [
          "逐条判断“错在概念、步骤还是表达”",
          "请学生把错误改成正确说法或正确做法",
          "把最容易混淆的一条写成提醒口令",
        ],
        responses: chapter.misconceptions.map((item) => `${item.wrong} -> ${item.fix}`),
        pacing: "误区1和误区2优先必讲，误区3按学生基础弹性处理。",
      };
    case "practice":
      return {
        timing: "8分钟",
        prompts: [
          "每题先给1分钟独立思考，再请学生说方法",
          "优先听学生是否说出本章关键词或模型",
          "遇到卡住时只给提示，不直接报答案",
        ],
        responses: chapter.practice.map((item) => `${item.q} -> ${item.a}`),
        pacing: "三题按“基础 -> 变式 -> 解释”推进，控制好停顿节奏。",
      };
    case "challenge":
      return {
        timing: "7分钟",
        prompts: [
          `先判断这题要调用哪一种方法：${chapter.focus}`,
          "开放任务优先评价解释是否清楚",
          "追问“如果数据变化，方法还有效吗”",
        ],
        responses: [chapter.challenge.answer],
        pacing: "先口头策略，后落笔解答，最后回看答案表达是否完整。",
      };
    case "summary":
      return {
        timing: "5分钟",
        prompts: [
          "让学生对三条自检逐条打勾或打问号",
          "如果有“半会”的点，马上说出补救办法",
          "让学生说出今天最想带走的一句话",
        ],
        responses: chapter.selfCheck,
        pacing: "用复盘收口，不再引入新例题；双课时中可作为第二课时结尾页。",
      };
    case "homework":
      return {
        timing: "4分钟",
        prompts: [
          "逐项确认作业要求，特别提醒写出过程或解释",
          `说明下节将进入《${chapter.nextLesson}》`,
          "请学生口头总结今天最重要的一句话后结束",
        ],
        responses: [...chapter.homework, `下节衔接：${chapter.nextLesson}`],
        pacing: "最后1分钟只做收束与预告，不再增加新知识。",
      };
    default:
      return { timing: "", prompts: [], responses: [], pacing: "" };
  }
}

function notesHtml(notes) {
  return `
    <section class="notes-section">
      <h3>时间</h3>
      <p>${escapeHtml(notes.timing)}</p>
    </section>
    <section class="notes-section">
      <h3>教学提示</h3>
      <ul>${notes.prompts.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>
    </section>
    <section class="notes-section">
      <h3>预期回应</h3>
      <ul>${notes.responses.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>
    </section>
    <section class="notes-section">
      <h3>节奏安排</h3>
      <p>${escapeHtml(notes.pacing)}</p>
    </section>
  `;
}

function deckThemeVars(chapter) {
  return `
    --chapter-primary:#${chapter.theme.primary};
    --chapter-secondary:#${chapter.theme.secondary};
    --chapter-accent:#${chapter.theme.accent};
    --chapter-dark:#${chapter.theme.dark};
  `;
}

function boardShell(title, caption, svg) {
  return `
    <div class="visual-card">
      <div class="visual-sticker">${escapeHtml(title)}</div>
      <div class="visual-caption">${escapeHtml(caption)}</div>
      <div class="visual-board">${svg}</div>
    </div>
  `;
}

function svgWrap(label, inner) {
  return `<svg viewBox="0 0 420 280" role="img" aria-label="${escapeAttr(
    label
  )}" xmlns="http://www.w3.org/2000/svg">${inner}</svg>`;
}

function placeValueSvg(values, chapter) {
  const labels = ["个位", "十分位", "百分位"];
  return svgWrap(
    "小数位值表与数线模型",
    `
      <rect x="20" y="24" width="380" height="100" rx="20" fill="#ffffff" stroke="#d6e2ec" stroke-width="2"/>
      ${labels
        .map(
          (label, index) => `
            <rect x="${20 + index * 126.6}" y="24" width="126.6" height="32" rx="16" fill="#${chapter.theme.primary}"/>
            <text x="${83 + index * 126.6}" y="45" text-anchor="middle" font-size="15" font-weight="700" fill="#ffffff">${label}</text>
            <line x1="${20 + index * 126.6}" y1="56" x2="${20 + index * 126.6}" y2="124" stroke="#d6e2ec" stroke-width="2"/>
            <text x="${83 + index * 126.6}" y="98" text-anchor="middle" font-size="28" font-weight="700" fill="#1f2933">${values[index]}</text>
          `
        )
        .join("")}
      <line x1="35" y1="196" x2="385" y2="196" stroke="#${chapter.theme.primary}" stroke-width="4" stroke-linecap="round"/>
      ${["2.0", "2.2", "2.4", "2.40", "2.6"]
        .map((label, index) => {
          const x = 50 + index * 84;
          const active = index === 2 || index === 3;
          return `
            <line x1="${x}" y1="183" x2="${x}" y2="209" stroke="#${chapter.theme.primary}" stroke-width="2"/>
            <circle cx="${x}" cy="196" r="9" fill="${active ? `#${chapter.theme.accent}` : "#ffffff"}" stroke="#${active ? chapter.theme.accent : chapter.theme.primary}" stroke-width="3"/>
            <text x="${x}" y="232" text-anchor="middle" font-size="12" fill="#334155">${label}</text>
          `;
        })
        .join("")}
      <text x="210" y="260" text-anchor="middle" font-size="13" fill="#64748b">2.4 和 2.40 在数线上落在同一点</text>
    `
  );
}

function verticalSumSvg(top, bottom, result, chapter, note) {
  return svgWrap(
    "小数竖式示意图",
    `
      <rect x="72" y="34" width="276" height="196" rx="20" fill="#ffffff" stroke="#d6e2ec" stroke-width="2"/>
      <text x="292" y="92" text-anchor="end" font-size="34" font-weight="700" fill="#1f2933">${escapeHtml(top)}</text>
      <text x="292" y="138" text-anchor="end" font-size="34" font-weight="700" fill="#1f2933">${escapeHtml(bottom)}</text>
      <line x1="126" y1="154" x2="296" y2="154" stroke="#${chapter.theme.primary}" stroke-width="4"/>
      <text x="292" y="198" text-anchor="end" font-size="34" font-weight="700" fill="#${chapter.theme.primary}">${escapeHtml(
        result
      )}</text>
      <text x="210" y="226" text-anchor="middle" font-size="13" fill="#64748b">${escapeHtml(note)}</text>
    `
  );
}

function trianglesSvg() {
  return svgWrap(
    "三角形分类图",
    `
      <polygon points="52,176 128,44 196,176" fill="#dbeed8" stroke="#4b6b4c" stroke-width="3"/>
      <polygon points="234,176 234,64 330,176" fill="#fde6be" stroke="#b97914" stroke-width="3"/>
      <polygon points="120,244 286,244 226,184" fill="#f9d6da" stroke="#bb5462" stroke-width="3"/>
      <text x="124" y="198" text-anchor="middle" font-size="15" fill="#1f2933">锐角</text>
      <text x="282" y="198" text-anchor="middle" font-size="15" fill="#1f2933">直角</text>
      <text x="204" y="266" text-anchor="middle" font-size="15" fill="#1f2933">钝角</text>
      <text x="210" y="24" text-anchor="middle" font-size="15" fill="#64748b">按角分类，也别忘了按边分类</text>
    `
  );
}

function angleTriangleSvg() {
  return svgWrap(
    "求第三个角的示意图",
    `
      <polygon points="86,214 210,52 336,214" fill="#dbeed8" stroke="#4b6b4c" stroke-width="4"/>
      <text x="124" y="190" font-size="18" fill="#2f5c37">35°</text>
      <text x="274" y="190" font-size="18" fill="#2f5c37">65°</text>
      <text x="210" y="96" text-anchor="middle" font-size="18" fill="#2f5c37">80°</text>
      <text x="210" y="244" text-anchor="middle" font-size="14" fill="#64748b">35° + 65° + 80° = 180°</text>
    `
  );
}

function rectangleAreaSvg(chapter) {
  return svgWrap(
    "小数乘法面积模型",
    `
      <rect x="62" y="40" width="220" height="160" rx="10" fill="#${chapter.theme.secondary}" stroke="#${chapter.theme.primary}" stroke-width="3"/>
      <line x1="62" y1="88" x2="282" y2="88" stroke="#${chapter.theme.primary}" stroke-width="2" stroke-dasharray="5 5"/>
      <line x1="62" y1="136" x2="282" y2="136" stroke="#${chapter.theme.primary}" stroke-width="2" stroke-dasharray="5 5"/>
      <line x1="116" y1="40" x2="116" y2="200" stroke="#${chapter.theme.primary}" stroke-width="2" stroke-dasharray="5 5"/>
      <line x1="170" y1="40" x2="170" y2="200" stroke="#${chapter.theme.primary}" stroke-width="2" stroke-dasharray="5 5"/>
      <line x1="224" y1="40" x2="224" y2="200" stroke="#${chapter.theme.primary}" stroke-width="2" stroke-dasharray="5 5"/>
      <text x="172" y="224" text-anchor="middle" font-size="18" font-weight="700" fill="#${chapter.theme.primary}">2.4 × 1.5</text>
      <text x="330" y="104" font-size="18" fill="#1f2933">先算 24 × 15</text>
      <text x="330" y="134" font-size="15" fill="#64748b">再把单位缩回去</text>
      <text x="330" y="180" font-size="26" font-weight="700" fill="#${chapter.theme.accent}">3.6</text>
    `
  );
}

function functionMachineSvg(input, rule, output, chapter) {
  return svgWrap(
    "字母表达式机器",
    `
      <circle cx="90" cy="138" r="42" fill="#${chapter.theme.secondary}" stroke="#${chapter.theme.primary}" stroke-width="3"/>
      <text x="90" y="146" text-anchor="middle" font-size="28" font-weight="700" fill="#1f2933">${escapeHtml(input)}</text>
      <path d="M148 108 H260 L292 138 L260 168 H148 Z" fill="#${chapter.theme.primary}"/>
      <text x="220" y="146" text-anchor="middle" font-size="17" font-weight="700" fill="#ffffff">${escapeHtml(rule)}</text>
      <circle cx="344" cy="138" r="42" fill="#fff2cf" stroke="#${chapter.theme.accent}" stroke-width="3"/>
      <text x="344" y="146" text-anchor="middle" font-size="22" font-weight="700" fill="#1f2933">${escapeHtml(output)}</text>
      <text x="210" y="238" text-anchor="middle" font-size="15" fill="#64748b">先表达数量关系，再代入求值</text>
    `
  );
}

function lShapeSvg(chapter) {
  return svgWrap(
    "组合图形拆分示意图",
    `
      <path d="M86 200 V88 H214 V52 H326 V200 Z" fill="#${chapter.theme.secondary}" stroke="#${chapter.theme.primary}" stroke-width="4"/>
      <line x1="214" y1="88" x2="214" y2="200" stroke="#${chapter.theme.accent}" stroke-width="4" stroke-dasharray="7 6"/>
      <text x="154" y="224" text-anchor="middle" font-size="15" fill="#1f2933">6 × 4</text>
      <text x="272" y="82" text-anchor="middle" font-size="15" fill="#1f2933">3 × 2</text>
      <text x="210" y="248" text-anchor="middle" font-size="14" fill="#64748b">先拆成熟悉图形，再分别求面积</text>
    `
  );
}

function trapezoidSvg(chapter) {
  return svgWrap(
    "梯形面积与附加三角形",
    `
      <polygon points="96,190 144,82 278,82 326,190" fill="#${chapter.theme.secondary}" stroke="#${chapter.theme.primary}" stroke-width="4"/>
      <line x1="326" y1="190" x2="360" y2="136" stroke="#${chapter.theme.accent}" stroke-width="4"/>
      <line x1="326" y1="190" x2="390" y2="190" stroke="#${chapter.theme.accent}" stroke-width="4"/>
      <line x1="360" y1="136" x2="390" y2="190" stroke="#${chapter.theme.accent}" stroke-width="4"/>
      <text x="210" y="68" text-anchor="middle" font-size="15" fill="#1f2933">上底 6</text>
      <text x="210" y="214" text-anchor="middle" font-size="15" fill="#1f2933">下底 10</text>
      <text x="288" y="142" font-size="15" fill="#1f2933">高 4</text>
      <text x="360" y="208" text-anchor="middle" font-size="14" fill="#${chapter.theme.accent}">+8m²</text>
    `
  );
}

function coordinateSvg(points, chapter, caption) {
  const pointSvg = points
    .map(
      (point) => `
        <circle cx="${60 + point.x * 48}" cy="${228 - point.y * 36}" r="7" fill="#${point.color || chapter.theme.accent}"/>
        <text x="${72 + point.x * 48}" y="${224 - point.y * 36}" font-size="14" fill="#1f2933">${escapeHtml(
          point.label
        )}</text>
      `
    )
    .join("");
  return svgWrap(
    "坐标与图形运动网格",
    `
      <rect x="30" y="28" width="360" height="220" rx="18" fill="#ffffff" stroke="#d6e2ec" stroke-width="2"/>
      ${Array.from({ length: 7 }, (_, index) => {
        const x = 60 + index * 48;
        return `<line x1="${x}" y1="44" x2="${x}" y2="228" stroke="#cbd5e1" stroke-width="1.5"/>`;
      }).join("")}
      ${Array.from({ length: 6 }, (_, index) => {
        const y = 48 + index * 36;
        return `<line x1="60" y1="${y}" x2="348" y2="${y}" stroke="#cbd5e1" stroke-width="1.5"/>`;
      }).join("")}
      <line x1="60" y1="228" x2="364" y2="228" stroke="#${chapter.theme.primary}" stroke-width="3"/>
      <line x1="60" y1="228" x2="60" y2="36" stroke="#${chapter.theme.primary}" stroke-width="3"/>
      ${pointSvg}
      <text x="210" y="264" text-anchor="middle" font-size="14" fill="#64748b">${escapeHtml(caption)}</text>
    `
  );
}

function factorTreeSvg(chapter) {
  return svgWrap(
    "因数树示意图",
    `
      <rect x="78" y="34" width="264" height="212" rx="20" fill="#ffffff" stroke="#d6e2ec" stroke-width="2"/>
      <circle cx="210" cy="72" r="28" fill="#${chapter.theme.secondary}" stroke="#${chapter.theme.primary}" stroke-width="3"/>
      <text x="210" y="80" text-anchor="middle" font-size="22" font-weight="700" fill="#1f2933">18</text>
      <line x1="198" y1="98" x2="138" y2="142" stroke="#${chapter.theme.primary}" stroke-width="3"/>
      <line x1="222" y1="98" x2="282" y2="142" stroke="#${chapter.theme.primary}" stroke-width="3"/>
      <circle cx="126" cy="154" r="22" fill="#fff2cf" stroke="#${chapter.theme.accent}" stroke-width="3"/>
      <text x="126" y="161" text-anchor="middle" font-size="18" font-weight="700" fill="#1f2933">3</text>
      <circle cx="294" cy="154" r="22" fill="#${chapter.theme.secondary}" stroke="#${chapter.theme.primary}" stroke-width="3"/>
      <text x="294" y="161" text-anchor="middle" font-size="18" font-weight="700" fill="#1f2933">6</text>
      <line x1="286" y1="176" x2="246" y2="214" stroke="#${chapter.theme.primary}" stroke-width="3"/>
      <line x1="302" y1="176" x2="342" y2="214" stroke="#${chapter.theme.primary}" stroke-width="3"/>
      <circle cx="234" cy="226" r="18" fill="#fff2cf" stroke="#${chapter.theme.accent}" stroke-width="3"/>
      <circle cx="354" cy="226" r="18" fill="#fff2cf" stroke="#${chapter.theme.accent}" stroke-width="3"/>
      <text x="234" y="232" text-anchor="middle" font-size="16" font-weight="700" fill="#1f2933">2</text>
      <text x="354" y="232" text-anchor="middle" font-size="16" font-weight="700" fill="#1f2933">3</text>
      <text x="210" y="260" text-anchor="middle" font-size="14" fill="#64748b">成对找因数，往下拆就能看见结构</text>
    `
  );
}

function probabilityBagSvg(chapter, lines) {
  return svgWrap(
    "可能性摸球模型",
    `
      <path d="M115 72 H305 C302 86 294 102 290 112 L326 220 C334 242 318 254 210 252 C102 254 86 242 94 220 L130 112 C126 102 118 86 115 72 Z" fill="#${chapter.theme.secondary}" stroke="#${chapter.theme.primary}" stroke-width="4"/>
      <rect x="150" y="50" width="120" height="28" rx="12" fill="#${chapter.theme.primary}"/>
      <circle cx="162" cy="128" r="16" fill="#d54b62"/>
      <circle cx="212" cy="114" r="16" fill="#d54b62"/>
      <circle cx="258" cy="148" r="16" fill="#d54b62"/>
      <circle cx="178" cy="176" r="16" fill="#f1c54b"/>
      <circle cx="238" cy="192" r="16" fill="#f1c54b"/>
      <circle cx="210" cy="222" r="16" fill="#${chapter.theme.primary}"/>
      ${lines
        .map(
          (line, index) =>
            `<text x="344" y="${114 + index * 30}" font-size="16" fill="#1f2933">${escapeHtml(line)}</text>`
        )
        .join("")}
    `
  );
}

function reviewMapSvg(chapter) {
  const nodes = [
    { x: 56, y: 78, label: "小数", fill: chapter.theme.secondary, stroke: chapter.theme.primary },
    { x: 172, y: 52, label: "三角形", fill: "#fff2cf", stroke: chapter.theme.accent },
    { x: 298, y: 84, label: "乘法", fill: chapter.theme.secondary, stroke: chapter.theme.primary },
    { x: 124, y: 176, label: "字母", fill: "#fff2cf", stroke: chapter.theme.accent },
    { x: 252, y: 182, label: "面积", fill: chapter.theme.secondary, stroke: chapter.theme.primary },
    { x: 346, y: 208, label: "可能性", fill: "#fff2cf", stroke: chapter.theme.accent },
  ];
  return svgWrap(
    "学期知识地图",
    `
      <line x1="112" y1="84" x2="172" y2="60" stroke="#94a3b8" stroke-width="3"/>
      <line x1="236" y1="72" x2="298" y2="88" stroke="#94a3b8" stroke-width="3"/>
      <line x1="112" y1="104" x2="142" y2="168" stroke="#94a3b8" stroke-width="3"/>
      <line x1="230" y1="96" x2="250" y2="170" stroke="#94a3b8" stroke-width="3"/>
      <line x1="190" y1="188" x2="320" y2="208" stroke="#94a3b8" stroke-width="3"/>
      ${nodes
        .map(
          (node) => `
            <rect x="${node.x}" y="${node.y}" width="92" height="44" rx="18" fill="#${node.fill}" stroke="#${node.stroke}" stroke-width="3"/>
            <text x="${node.x + 46}" y="${node.y + 27}" text-anchor="middle" font-size="16" font-weight="700" fill="#1f2933">${node.label}</text>
          `
        )
        .join("")}
      <text x="210" y="258" text-anchor="middle" font-size="14" fill="#64748b">把分散题型连成方法地图</text>
    `
  );
}

function buildVisual(chapter, kind) {
  switch (chapter.key) {
    case "decimals-add-subtract":
      if (kind === "worked") {
        return boardShell("数位台", "先对齐小数点，再按位计算。", verticalSumSvg("12.80", "+ 3.45", "16.25", chapter, "估算约 16.5，结果合理"));
      }
      if (kind === "bug") {
        return boardShell("错因放大镜", "单位没对齐，就会把不同大小的数位混在一起。", verticalSumSvg("12.8", "+ 3.45", "?", chapter, "末位对齐不是单位对齐"));
      }
      if (kind === "challenge") {
        return boardShell(
          "购物清单",
          "把价格整理在同一张账单上，更容易比较是否够钱。",
          svgWrap(
            "购物账单示意图",
            `
              <rect x="96" y="28" width="228" height="220" rx="22" fill="#ffffff" stroke="#d6e2ec" stroke-width="2"/>
              ${["牛奶 8.60", "面包 7.85", "苹果 12.40", "合计 28.85"]
                .map(
                  (line, index) => `
                    <text x="${index === 3 ? 286 : 122}" y="${74 + index * 42}" text-anchor="${
                      index === 3 ? "end" : "start"
                    }" font-size="22" font-weight="${index === 3 ? "700" : "500"}" fill="${
                      index === 3 ? `#${chapter.theme.primary}` : "#1f2933"
                    }">${escapeHtml(line)}</text>
                  `
                )
                .join("")}
              <line x1="120" y1="162" x2="286" y2="162" stroke="#${chapter.theme.primary}" stroke-width="3"/>
              <text x="210" y="226" text-anchor="middle" font-size="14" fill="#64748b">30 元和 28.85 元比较，还要会找零</text>
            `
          )
        );
      }
      return boardShell("数位地图", "位值表和数线一起看，能同时解释大小与运算。", placeValueSvg(["2", "4", "0"], chapter));
    case "triangles":
      if (kind === "worked") {
        return boardShell("角度追踪", "先求第三个角，再按角分类。", angleTriangleSvg());
      }
      if (kind === "challenge") {
        return boardShell(
          "结构支架",
          "加一根斜杆后，四边形会被固定成两个三角形。",
          svgWrap(
            "书架支撑三角形",
            `
              <rect x="70" y="58" width="280" height="152" rx="12" fill="#ffffff" stroke="#d6e2ec" stroke-width="2"/>
              <line x1="106" y1="84" x2="106" y2="210" stroke="#4b5563" stroke-width="8"/>
              <line x1="316" y1="84" x2="316" y2="210" stroke="#4b5563" stroke-width="8"/>
              <line x1="106" y1="84" x2="316" y2="84" stroke="#4b5563" stroke-width="8"/>
              <line x1="106" y1="210" x2="316" y2="210" stroke="#4b5563" stroke-width="8"/>
              <line x1="106" y1="210" x2="316" y2="84" stroke="#${chapter.theme.accent}" stroke-width="8"/>
              <text x="210" y="244" text-anchor="middle" font-size="14" fill="#64748b">稳定来自三角形的形状不易改变</text>
            `
          )
        );
      }
      return boardShell("分类墙", "既能按角分，也能按边分。", trianglesSvg());
    case "decimal-multiply":
      if (kind === "worked") {
        return boardShell(
          "点位路径",
          "不是盲点小数点，而是“整数乘法 + 位数回退”。",
          svgWrap(
            "小数点定位步骤",
            `
              <rect x="54" y="34" width="312" height="206" rx="20" fill="#ffffff" stroke="#d6e2ec" stroke-width="2"/>
              <text x="210" y="90" text-anchor="middle" font-size="34" font-weight="700" fill="#1f2933">24 × 15 = 360</text>
              <path d="M148 114 H272 L296 138 L272 162 H148 Z" fill="#${chapter.theme.primary}"/>
              <text x="220" y="146" text-anchor="middle" font-size="18" font-weight="700" fill="#ffffff">共有 2 位小数</text>
              <text x="210" y="202" text-anchor="middle" font-size="34" font-weight="700" fill="#${chapter.theme.primary}">3.60 = 3.6</text>
              <text x="210" y="228" text-anchor="middle" font-size="14" fill="#64748b">先估算约 3.75，再确认结果合理</text>
            `
          )
        );
      }
      if (kind === "challenge") {
        return boardShell(
          "地砖面积",
          "一块地砖的面积是长乘宽，10 块再乘 10。",
          svgWrap(
            "地砖面积模型",
            `
              <rect x="70" y="48" width="240" height="152" rx="12" fill="#${chapter.theme.secondary}" stroke="#${chapter.theme.primary}" stroke-width="4"/>
              <rect x="70" y="48" width="240" height="102" fill="#fff1cf" stroke="#${chapter.theme.accent}" stroke-width="2"/>
              <text x="188" y="228" text-anchor="middle" font-size="16" fill="#1f2933">1.2 m</text>
              <text x="42" y="134" text-anchor="middle" font-size="16" fill="#1f2933">0.8 m</text>
              <text x="340" y="120" font-size="20" fill="#${chapter.theme.primary}">0.96 m²</text>
              <text x="340" y="152" font-size="16" fill="#64748b">10 块共 9.6 m²</text>
            `
          )
        );
      }
      return boardShell("面积模型", "网格帮助看见单位缩放。", rectangleAreaSvg(chapter));
    case "letters-1":
      if (kind === "challenge") {
        return boardShell(
          "规律脚手架",
          "每增加一个图形，多 3 根小棒，所以用 3n+1 表示。",
          svgWrap(
            "小棒规律示意图",
            `
              <rect x="54" y="32" width="312" height="212" rx="20" fill="#ffffff" stroke="#d6e2ec" stroke-width="2"/>
              ${["第1个: 4根", "第2个: 7根", "第3个: 10根", "每次 +3"]
                .map(
                  (line, index) => `
                    <text x="86" y="${78 + index * 42}" font-size="${index === 3 ? 24 : 21}" font-weight="${
                      index === 3 ? "700" : "500"
                    }" fill="${index === 3 ? `#${chapter.theme.primary}` : "#1f2933"}">${escapeHtml(line)}</text>
                  `
                )
                .join("")}
              <text x="210" y="226" text-anchor="middle" font-size="14" fill="#64748b">第 n 个图形可写成 3n + 1</text>
            `
          )
        );
      }
      if (kind === "worked") {
        return boardShell("代入演示", "先列 3a+2，再把 a 换成 4。", functionMachineSvg("4", "×3 再 +2", "14", chapter));
      }
      return boardShell("关系机器", "字母像位置牌，先保留关系。", functionMachineSvg("a", "×3 再 +2", "3a+2", chapter));
    case "polygon-area":
      if (kind === "challenge") {
        return boardShell("花坛设计", "梯形面积和附加三角形面积要分开想，再合起来。", trapezoidSvg(chapter));
      }
      if (kind === "bug") {
        return boardShell(
          "公式提醒",
          "三角形面积是同底同高平行四边形的一半。",
          svgWrap(
            "三角形面积公式",
            `
              <polygon points="94,210 210,60 332,210" fill="#fff2cf" stroke="#${chapter.theme.accent}" stroke-width="4"/>
              <text x="210" y="242" text-anchor="middle" font-size="18" fill="#bb5462">面积 = 底 × 高 ÷ 2</text>
              <text x="210" y="34" text-anchor="middle" font-size="15" fill="#64748b">别忘记“÷ 2”与平方单位</text>
            `
          )
        );
      }
      return boardShell("拆分草图", "复杂图形可以切开，也可以拼回熟悉图形。", lShapeSvg(chapter));
    case "position-movement":
      if (kind === "worked") {
        return boardShell(
          "平移足迹",
          "向右平移 3 格，横坐标整体加 3。",
          coordinateSvg(
            [
              { x: 1, y: 1, label: "A" },
              { x: 3, y: 1, label: "B" },
              { x: 2, y: 3, label: "C" },
              { x: 4, y: 1, label: "A'" },
              { x: 6, y: 1, label: "B'" },
              { x: 5, y: 3, label: "C'" },
            ],
            chapter,
            "旧点与新点横向对应，纵坐标不变"
          )
        );
      }
      if (kind === "challenge") {
        return boardShell(
          "寻宝路线",
          "按数对一步步移动，路线也能反向复盘。",
          coordinateSvg(
            [
              { x: 0, y: 1, label: "起点" },
              { x: 4, y: 1, label: "右4" },
              { x: 4, y: 3, label: "上2" },
              { x: 3, y: 3, label: "终点" },
            ],
            chapter,
            "从 (1,2) 走到 (4,4)，说清每一步"
          )
        );
      }
      return boardShell(
        "方格地图",
        "先写横向位置，再写纵向位置。",
        coordinateSvg(
          [
            { x: 2, y: 4, label: "A(3,5)" },
            { x: 5, y: 0, label: "P(6,1)", color: chapter.theme.primary },
          ],
          chapter,
          "数对是“先列后行”的地图语言"
        )
      );
    case "factors-multiples":
      if (kind === "challenge") {
        return boardShell(
          "平均分模型",
          "最多分给多少人，本质是找 24 和 36 的最大公因数。",
          svgWrap(
            "分物资表格",
            `
              <rect x="58" y="36" width="304" height="208" rx="20" fill="#ffffff" stroke="#d6e2ec" stroke-width="2"/>
              <text x="120" y="86" text-anchor="middle" font-size="24" fill="#1f2933">24 本</text>
              <text x="300" y="86" text-anchor="middle" font-size="24" fill="#1f2933">36 支</text>
              <text x="120" y="140" text-anchor="middle" font-size="24" fill="#${chapter.theme.primary}">÷ 12</text>
              <text x="300" y="140" text-anchor="middle" font-size="24" fill="#${chapter.theme.primary}">÷ 12</text>
              <text x="120" y="194" text-anchor="middle" font-size="24" font-weight="700" fill="#1f2933">2 本/人</text>
              <text x="300" y="194" text-anchor="middle" font-size="24" font-weight="700" fill="#1f2933">3 支/人</text>
              <line x1="210" y1="62" x2="210" y2="210" stroke="#d6e2ec" stroke-width="2"/>
              <text x="210" y="232" text-anchor="middle" font-size="14" fill="#64748b">“最多”提示我们去找最大公因数</text>
            `
          )
        );
      }
      return boardShell("因数树", "能整除的结构可以用树状图看得很清楚。", factorTreeSvg(chapter));
    case "probability":
      if (kind === "challenge") {
        return boardShell(
          "公平判断",
          "结果数相同就公平；结果数不同就不公平。",
          svgWrap(
            "骰子公平性比较",
            `
              <rect x="48" y="36" width="324" height="208" rx="20" fill="#ffffff" stroke="#d6e2ec" stroke-width="2"/>
              ${["甲赢: 1,2,3", "乙赢: 4,5,6", "各 3 种结果", "所以公平"]
                .map(
                  (line, index) => `
                    <text x="86" y="${84 + index * 40}" font-size="${index === 3 ? 24 : 22}" font-weight="${
                      index === 3 ? "700" : "500"
                    }" fill="${index === 3 ? `#${chapter.theme.primary}` : "#1f2933"}">${escapeHtml(line)}</text>
                  `
                )
                .join("")}
            `
          )
        );
      }
      return boardShell("摸球袋", "比较结果数，再比较可能性大小。", probabilityBagSvg(chapter, ["红 3", "黄 2", "蓝 1"]));
    case "review":
      if (kind === "worked") {
        return boardShell(
          "综合题路线",
          "先求面积，再联系单价或单位量模型。",
          svgWrap(
            "综合应用路径图",
            `
              <rect x="54" y="40" width="312" height="198" rx="20" fill="#ffffff" stroke="#d6e2ec" stroke-width="2"/>
              <text x="210" y="86" text-anchor="middle" font-size="28" font-weight="700" fill="#1f2933">3.5 × 2.4 = 8.4</text>
              <path d="M148 106 H270 L294 132 L270 158 H148 Z" fill="#${chapter.theme.primary}"/>
              <text x="220" y="138" text-anchor="middle" font-size="18" font-weight="700" fill="#ffffff">每平方米 × 4 株</text>
              <text x="210" y="202" text-anchor="middle" font-size="28" font-weight="700" fill="#${chapter.theme.primary}">33.6 株</text>
              <text x="210" y="226" text-anchor="middle" font-size="14" fill="#64748b">结合实际语境，再解释约 33~34 株</text>
            `
          )
        );
      }
      return boardShell("方法地图", "复习不是堆题，而是整理工具箱。", reviewMapSvg(chapter));
    default:
      return boardShell("学习画布", "用视觉模型帮助学生先理解、再应用。", reviewMapSvg(chapter));
  }
}

function slideIntro(text) {
  return `<p class="slide-intro">${escapeHtml(text)}</p>`;
}

function buildSlides(chapter, chapterIndex, deckStructure) {
  const chapterNum = chapterLabel(chapterIndex);
  return [
    {
      kind: "cover",
      title: deckStructure[0],
      subtitle: chapter.tagline,
      body: `
        <div class="hero-block">
          <div class="eyebrow">${escapeHtml(chapterNum)} · 2026 秋季五年级数学</div>
          <h2>${escapeHtml(chapter.title)}</h2>
          <p class="tagline">${escapeHtml(chapter.tagline)}</p>
          <div class="pill-row">
            <span class="pill">建议用时：${escapeHtml(chapter.hours)}</span>
            <span class="pill alt">章节聚焦：${escapeHtml(chapter.focus)}</span>
          </div>
          <div class="hero-note">
            <strong>九站结构：</strong>${deckStructure.map(escapeHtml).join(" -> ")}
          </div>
        </div>
      `,
    },
    {
      kind: "diagnostic",
      title: deckStructure[1],
      subtitle: "先看目标，再用 3 个小问题判断起点。",
      body: `
        <div class="content-grid two-up">
          <section class="paper-panel">
            <div class="mini-label">本章目标</div>
            ${listHtml(chapter.objectives, { className: "check-list" })}
          </section>
          <section class="paper-panel">
            <div class="mini-label">5 分钟诊断</div>
            <ol class="question-list">
              ${chapter.diagnostic
                .map(
                  (item) => `
                    <li>
                      <div class="question-text">${escapeHtml(item.q)}</div>
                    </li>
                  `
                )
                .join("")}
            </ol>
            ${answerToggleHtml(
              `${chapter.key}-diagnostic-answer`,
              "诊断参考答案",
              `<ol class="answer-list">${chapter.diagnostic
                .map(
                  (item, index) =>
                    `<li><strong>${index + 1}.</strong> ${escapeHtml(item.a)}</li>`
                )
                .join("")}</ol>`
            )}
          </section>
        </div>
      `,
    },
    {
      kind: "concept",
      title: deckStructure[2],
      subtitle: chapter.conceptTitle,
      body: `
        ${slideIntro("先从图像和模型出发，再把规则说清楚。")}
        <section class="paper-panel">
          <div class="mini-label">核心要点</div>
          ${listHtml(chapter.conceptBullets, { className: "model-list" })}
        </section>
      `,
    },
    {
      kind: "worked",
      title: deckStructure[3],
      subtitle: "完整示范一道典型题，先说思路，再写步骤。",
      body: `
        <section class="paper-panel">
          <div class="mini-label">题目</div>
          <p class="problem-text">${escapeHtml(chapter.worked.problem)}</p>
        </section>
        <section class="paper-panel">
          <div class="mini-label">示范步骤</div>
          ${quoteListHtml(chapter.worked.steps, "一步一步想")}
          ${answerToggleHtml(
            `${chapter.key}-worked-answer`,
            "例题答案",
            `<p class="answer-plain">${escapeHtml(chapter.worked.answer)}</p>`
          )}
        </section>
      `,
    },
    {
      kind: "bug",
      title: deckStructure[4],
      subtitle: "把常见错误摆出来，练会“哪里错、怎么改”。",
      body: `
        <section class="stack-list">
          ${chapter.misconceptions
            .map(
              (item, index) => `
                <article class="mistake-card ${index === 1 ? "mistake-warm" : ""}">
                  <div class="mistake-title">误区 ${index + 1}</div>
                  <p><strong>常见说法：</strong>${escapeHtml(item.wrong)}</p>
                  <p><strong>修正建议：</strong>${escapeHtml(item.fix)}</p>
                </article>
              `
            )
            .join("")}
        </section>
      `,
    },
    {
      kind: "practice",
      title: deckStructure[5],
      subtitle: "做题时先说方法，再给答案。",
      body: `
        <div class="practice-grid">
          ${chapter.practice
            .map(
              (item, index) => `
                <section class="practice-card">
                  <div class="mini-label">练习 ${index + 1}</div>
                  <p class="practice-question">${escapeHtml(item.q)}</p>
                </section>
              `
            )
            .join("")}
        </div>
        ${answerToggleHtml(
          `${chapter.key}-practice-answer`,
          "引导练习答案",
          `<ol class="answer-list">${chapter.practice
            .map(
              (item, index) =>
                `<li><strong>${index + 1}.</strong> ${escapeHtml(item.a)}</li>`
            )
            .join("")}</ol>`
        )}
      `,
    },
    {
      kind: "challenge",
      title: deckStructure[6],
      subtitle: "把知识带回真实情境，练习会用。",
      body: `
        <section class="paper-panel">
          <div class="mini-label">任务</div>
          <h3 class="challenge-title">${escapeHtml(chapter.challenge.title)}</h3>
          <p class="challenge-text">${escapeHtml(chapter.challenge.prompt)}</p>
          ${answerToggleHtml(
            `${chapter.key}-challenge-answer`,
            "挑战参考答案",
            `<p class="answer-plain">${escapeHtml(chapter.challenge.answer)}</p>`
          )}
        </section>
      `,
    },
    {
      kind: "summary",
      title: deckStructure[7],
      subtitle: "复盘“我会不会”，形成清晰的收口感。",
      body: `
        <section class="paper-panel">
          <div class="mini-label">自检清单</div>
          <ul class="self-check-list">
            ${chapter.selfCheck
              .map(
                (item, index) => `
                  <li>
                    <label>
                      <input type="checkbox" data-check-key="${escapeAttr(
                        `${chapter.key}-summary-${index}`
                      )}">
                      <span>${escapeHtml(item)}</span>
                    </label>
                  </li>
                `
              )
              .join("")}
          </ul>
        </section>
      `,
    },
    {
      kind: "homework",
      title: deckStructure[8],
      subtitle: "带走可以独立完成的练习，也知道下一章要去哪里。",
      body: `
        <div class="content-grid two-up">
          <section class="paper-panel">
            <div class="mini-label">课后任务</div>
            ${quoteListHtml(chapter.homework, "作业安排")}
          </section>
          <section class="paper-panel">
            <div class="mini-label">下节衔接</div>
            <p class="next-lesson">${escapeHtml(chapter.nextLesson)}</p>
            <p class="next-note">建议先口述“今天最重要的一句话”，再开始预习。</p>
          </section>
        </div>
      `,
    },
  ].map((slide, index) => ({
    ...slide,
    index: index + 1,
    chapterNumber: chapterNum,
    visual: buildVisual(chapter, slide.kind),
    notes: notesForSlide(chapter, slide.kind),
  }));
}

function buildDeckHtml(chapter, chapterIndex, deckStructure) {
  const slides = buildSlides(chapter, chapterIndex, deckStructure);
  const slideMeta = slides.map((slide) => ({
    index: slide.index,
    title: slide.title,
    notesHtml: notesHtml(slide.notes),
  }));

  return `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <link rel="icon" href="data:,">
  <title>${escapeHtml(chapter.title)} | 五年级数学互动课件</title>
  <style>
    :root{
      ${deckThemeVars(chapter)}
      --ink:#20303d;
      --muted:#5b6a78;
      --line:#d7e2ea;
      --paper:#fffdf8;
      --board:#f6f8fb;
      --shadow:0 24px 60px rgba(31,58,95,.12);
      --shadow-soft:0 14px 30px rgba(31,58,95,.10);
      --stage-radius:28px;
      --touch:44px;
    }
    *{box-sizing:border-box}
    html,body{margin:0;padding:0}
    body{
      font-family:-apple-system,BlinkMacSystemFont,"Segoe UI","PingFang SC","Hiragino Sans GB","Microsoft YaHei",sans-serif;
      color:var(--ink);
      background:
        radial-gradient(circle at 1px 1px, rgba(90,110,125,.18) 1px, transparent 0) 0 0/18px 18px,
        linear-gradient(180deg, #f3f7fb 0%, #edf3f7 100%);
      min-height:100vh;
    }
    a,button{font:inherit}
    button,a.control-link,.toolbar-link{
      min-height:var(--touch);
      min-width:var(--touch);
    }
    a{color:inherit}
    .deck-shell{
      max-width:1400px;
      margin:0 auto;
      padding:20px 18px 32px;
    }
    .deck-topbar{
      display:flex;
      justify-content:space-between;
      gap:12px;
      align-items:center;
      margin-bottom:14px;
      flex-wrap:wrap;
    }
    .topbar-group{
      display:flex;
      gap:10px;
      flex-wrap:wrap;
      align-items:center;
    }
    .toolbar-link,.toolbar-button{
      display:inline-flex;
      align-items:center;
      justify-content:center;
      border:1px solid var(--line);
      border-radius:999px;
      padding:10px 16px;
      background:rgba(255,255,255,.82);
      text-decoration:none;
      color:var(--ink);
      box-shadow:var(--shadow-soft);
      cursor:pointer;
    }
    .toolbar-button{
      appearance:none;
    }
    .toolbar-button:hover,.toolbar-link:hover,.nav-button:hover{
      border-color:var(--chapter-primary);
      transform:translateY(-1px);
    }
    .toolbar-button:focus-visible,.toolbar-link:focus-visible,.nav-button:focus-visible,.toggle-answer:focus-visible,.self-check-list input:focus-visible{
      outline:3px solid rgba(243,182,63,.45);
      outline-offset:3px;
    }
    .deck-badge{
      display:inline-flex;
      align-items:center;
      gap:8px;
      border-radius:999px;
      background:rgba(255,255,255,.84);
      border:1px solid var(--line);
      padding:10px 16px;
      box-shadow:var(--shadow-soft);
      color:var(--muted);
    }
    .deck-badge strong{color:var(--chapter-primary)}
    .stage-wrap{
      position:relative;
      display:grid;
      grid-template-columns:minmax(0,1fr) 340px;
      gap:16px;
      align-items:start;
    }
    .stage-column{
      min-width:0;
    }
    .stage-frame{
      position:relative;
      aspect-ratio:16/9;
      width:100%;
      background:linear-gradient(180deg, rgba(255,255,255,.75), rgba(255,255,255,.45));
      border:1px solid rgba(255,255,255,.8);
      border-radius:32px;
      padding:18px;
      box-shadow:var(--shadow);
      backdrop-filter:blur(10px);
    }
    .slides-viewport{
      position:relative;
      width:100%;
      height:100%;
      overflow:hidden;
      border-radius:var(--stage-radius);
      background:
        radial-gradient(circle at 1px 1px, rgba(90,110,125,.16) 1px, transparent 0) 0 0/20px 20px,
        linear-gradient(135deg, rgba(255,255,255,.94), rgba(247,249,252,.96));
      border:1px solid rgba(210,220,230,.95);
    }
    .slide{
      position:absolute;
      inset:0;
      display:none;
      padding:26px;
      grid-template-rows:auto auto auto auto;
      gap:16px;
      overflow-y:auto;
    }
    .slide.active{
      display:grid;
    }
    .slide-header{
      display:flex;
      justify-content:space-between;
      gap:16px;
      align-items:flex-start;
    }
    .slide-kicker{
      display:inline-flex;
      align-items:center;
      gap:8px;
      padding:8px 12px;
      border-radius:999px;
      background:rgba(255,255,255,.85);
      border:1px solid var(--line);
      color:var(--chapter-primary);
      font-size:14px;
      font-weight:700;
      box-shadow:0 8px 18px rgba(31,58,95,.08);
    }
    .slide-title h1{
      margin:0;
      font-size:clamp(26px,2.5vw,38px);
      line-height:1.15;
      letter-spacing:.01em;
    }
    .slide-title p{
      margin:10px 0 0;
      color:var(--muted);
      line-height:1.65;
      font-size:15px;
      max-width:56ch;
    }
    .slide-count{
      font-size:14px;
      color:var(--muted);
      text-align:right;
      white-space:nowrap;
      padding-top:4px;
    }
    .slide-main{
      display:grid;
      grid-template-columns:minmax(0,1.06fr) minmax(300px,.94fr);
      gap:16px;
      align-items:stretch;
      min-height:auto;
    }
    .text-pane,.visual-pane{
      min-width:0;
      min-height:0;
    }
    .paper-panel,.hero-block,.visual-card,.practice-card,.mistake-card{
      position:relative;
      background:linear-gradient(180deg, rgba(255,253,248,.98), rgba(255,255,255,.94));
      border:1px solid var(--line);
      border-radius:24px;
      box-shadow:var(--shadow-soft);
    }
    .paper-panel,.hero-block{
      padding:18px 18px 16px;
    }
    .content-grid{
      display:grid;
      gap:14px;
    }
    .content-grid.two-up{
      grid-template-columns:minmax(0,1fr) minmax(0,1fr);
    }
    .hero-block{
      min-height:100%;
      display:flex;
      flex-direction:column;
      gap:16px;
      justify-content:center;
    }
    .hero-block h2{
      margin:0;
      font-size:clamp(30px,3vw,44px);
      line-height:1.14;
    }
    .eyebrow{
      color:var(--chapter-primary);
      font-weight:700;
      letter-spacing:.04em;
      font-size:14px;
    }
    .tagline{
      margin:0;
      font-size:18px;
      line-height:1.7;
      color:var(--muted);
    }
    .pill-row{
      display:flex;
      gap:10px;
      flex-wrap:wrap;
    }
    .pill{
      display:inline-flex;
      align-items:center;
      padding:10px 14px;
      border-radius:999px;
      background:rgba(255,255,255,.92);
      border:1px solid var(--line);
      color:var(--chapter-primary);
      font-weight:700;
    }
    .pill.alt{
      background:rgba(255,241,207,.92);
      color:var(--ink);
      font-weight:600;
    }
    .hero-note{
      line-height:1.7;
      color:var(--muted);
      font-size:15px;
      background:rgba(255,255,255,.78);
      border:1px dashed rgba(122,140,154,.35);
      border-radius:18px;
      padding:14px 16px;
    }
    .mini-label{
      display:inline-flex;
      align-items:center;
      padding:7px 10px;
      border-radius:999px;
      background:var(--chapter-secondary);
      color:var(--chapter-primary);
      font-size:13px;
      font-weight:800;
      letter-spacing:.02em;
    }
    .slide-intro{
      margin:0 0 4px;
      color:var(--muted);
      line-height:1.7;
    }
    .check-list,.model-list,.answer-list,.question-list,.self-check-list{
      margin:14px 0 0;
      padding-left:22px;
    }
    .check-list li,.model-list li,.answer-list li,.question-list li{
      margin-bottom:10px;
      line-height:1.7;
    }
    .question-list li{
      padding-bottom:6px;
    }
    .problem-text,.challenge-text,.next-note{
      margin:14px 0 0;
      line-height:1.8;
      font-size:16px;
    }
    .challenge-title,.next-lesson{
      margin:14px 0 0;
      font-size:26px;
      line-height:1.25;
    }
    .next-note{
      color:var(--muted);
    }
    .quote-list ol{
      list-style:none;
      padding:0;
      margin:14px 0 0;
      display:grid;
      gap:12px;
    }
    .quote-list li{
      display:grid;
      grid-template-columns:34px 1fr;
      gap:10px;
      align-items:flex-start;
    }
    .order-badge{
      width:34px;
      height:34px;
      display:inline-flex;
      align-items:center;
      justify-content:center;
      border-radius:50%;
      background:rgba(243,182,63,.28);
      border:1px solid rgba(243,182,63,.62);
      font-weight:800;
      color:var(--ink);
    }
    .stack-list{
      display:grid;
      gap:12px;
    }
    .mistake-card{
      padding:16px 18px 14px;
      background:linear-gradient(180deg, rgba(255,255,255,.95), rgba(253,248,244,.95));
    }
    .mistake-warm{
      background:linear-gradient(180deg, rgba(255,244,246,.98), rgba(255,252,249,.95));
    }
    .mistake-card p{
      margin:10px 0 0;
      line-height:1.75;
    }
    .mistake-title{
      font-weight:800;
      color:var(--chapter-primary);
      margin-bottom:6px;
    }
    .practice-grid{
      display:grid;
      grid-template-columns:repeat(3, minmax(0,1fr));
      gap:12px;
    }
    .practice-card{
      padding:16px;
      min-height:170px;
      display:flex;
      flex-direction:column;
      gap:16px;
      justify-content:space-between;
    }
    .practice-question{
      margin:0;
      font-size:21px;
      line-height:1.55;
      text-align:center;
      font-weight:700;
    }
    .answer-area{
      margin-top:16px;
      display:grid;
      gap:10px;
    }
    .toggle-answer{
      appearance:none;
      border:1px solid rgba(36,74,112,.18);
      background:linear-gradient(180deg, rgba(255,255,255,.95), rgba(250,250,248,.95));
      border-radius:16px;
      padding:11px 16px;
      font-weight:700;
      cursor:pointer;
      color:var(--chapter-primary);
      box-shadow:0 8px 18px rgba(31,58,95,.06);
      align-self:start;
    }
    .answer-panel{
      background:rgba(255,241,207,.5);
      border:1px dashed rgba(179,126,28,.38);
      border-radius:18px;
      padding:14px 16px;
      line-height:1.75;
    }
    .answer-title{
      font-weight:800;
      margin-bottom:6px;
      color:var(--ink);
    }
    .answer-plain{
      margin:0;
    }
    .visual-pane{
      display:flex;
      align-items:stretch;
      min-height:0;
    }
    .visual-card{
      width:100%;
      padding:18px 18px 14px;
      display:grid;
      grid-template-rows:auto auto 1fr;
      gap:10px;
      overflow:hidden;
      background:
        linear-gradient(180deg, rgba(255,255,255,.95), rgba(248,250,252,.98));
    }
    .visual-card::before{
      content:"";
      position:absolute;
      top:10px;
      right:20px;
      width:74px;
      height:18px;
      border-radius:999px;
      background:rgba(243,182,63,.24);
      transform:rotate(-6deg);
    }
    .visual-sticker{
      display:inline-flex;
      justify-self:start;
      padding:8px 12px;
      border-radius:14px;
      background:rgba(255,255,255,.9);
      border:1px solid rgba(151,167,180,.34);
      color:var(--chapter-primary);
      font-size:13px;
      font-weight:800;
      box-shadow:0 10px 20px rgba(31,58,95,.07);
    }
    .visual-caption{
      color:var(--muted);
      line-height:1.65;
      font-size:14px;
    }
    .visual-board{
      min-height:0;
      border-radius:22px;
      background:
        radial-gradient(circle at 1px 1px, rgba(90,110,125,.14) 1px, transparent 0) 0 0/18px 18px,
        linear-gradient(180deg, rgba(255,255,255,.98), rgba(244,247,250,.98));
      border:1px solid rgba(213,226,236,.85);
      padding:8px;
    }
    .visual-board svg{
      width:100%;
      height:100%;
      display:block;
    }
    .slide-footer{
      display:grid;
      grid-template-columns:auto 1fr auto;
      gap:14px;
      align-items:center;
    }
    .slide-route{
      display:flex;
      gap:8px;
      align-items:center;
      flex-wrap:wrap;
    }
    .route-dot{
      width:16px;
      height:16px;
      border-radius:999px;
      border:2px solid rgba(123,141,155,.6);
      background:#ffffff;
      box-shadow:0 2px 6px rgba(31,58,95,.08);
    }
    .route-dot.active{
      background:var(--chapter-accent);
      border-color:var(--chapter-accent);
    }
    .progress{
      position:relative;
      height:14px;
      border-radius:999px;
      background:rgba(209,220,228,.58);
      overflow:hidden;
    }
    .progress-bar{
      position:absolute;
      inset:0 auto 0 0;
      width:0;
      background:linear-gradient(90deg, var(--chapter-primary), var(--chapter-accent));
      border-radius:999px;
      transition:width .25s ease;
    }
    .nav-row{
      display:flex;
      gap:10px;
      justify-content:flex-end;
      flex-wrap:wrap;
      margin-top:16px;
    }
    .nav-button{
      appearance:none;
      border:1px solid var(--line);
      border-radius:16px;
      padding:11px 16px;
      background:rgba(255,255,255,.84);
      box-shadow:var(--shadow-soft);
      cursor:pointer;
      color:var(--ink);
    }
    .nav-button[disabled]{
      opacity:.48;
      cursor:not-allowed;
      transform:none;
    }
    .notes-column{
      position:sticky;
      top:20px;
    }
    .notes-drawer{
      background:linear-gradient(180deg, rgba(255,255,255,.93), rgba(250,251,253,.96));
      border:1px solid rgba(215,226,234,.96);
      border-radius:28px;
      box-shadow:var(--shadow);
      overflow:hidden;
    }
    .notes-header{
      display:flex;
      justify-content:space-between;
      gap:12px;
      align-items:center;
      padding:16px 18px;
      background:rgba(255,255,255,.9);
      border-bottom:1px solid var(--line);
    }
    .notes-header h2{
      margin:0;
      font-size:18px;
    }
    .notes-body{
      padding:18px;
      display:grid;
      gap:16px;
      max-height:calc(100vh - 150px);
      overflow:auto;
    }
    .notes-section h3{
      margin:0 0 8px;
      font-size:14px;
      color:var(--chapter-primary);
    }
    .notes-section p,.notes-section ul{
      margin:0;
      line-height:1.75;
      color:var(--ink);
      padding-left:18px;
    }
    .notes-section p{padding-left:0}
    .notes-status{
      font-size:13px;
      color:var(--muted);
    }
    .notes-hidden .notes-column{
      display:none;
    }
    .notes-hidden .stage-wrap{
      grid-template-columns:minmax(0,1fr);
    }
    .visually-hidden{
      position:absolute;
      width:1px;
      height:1px;
      padding:0;
      margin:-1px;
      overflow:hidden;
      clip:rect(0,0,0,0);
      white-space:nowrap;
      border:0;
    }
    .self-check-list{
      list-style:none;
      padding:0;
      display:grid;
      gap:12px;
    }
    .self-check-list label{
      display:grid;
      grid-template-columns:28px 1fr;
      gap:12px;
      align-items:flex-start;
      padding:14px 16px;
      border:1px solid rgba(213,226,236,.92);
      border-radius:18px;
      background:rgba(255,255,255,.84);
      cursor:pointer;
    }
    .self-check-list input{
      width:22px;
      height:22px;
      margin:2px 0 0;
      accent-color:var(--chapter-primary);
    }
    .self-check-list span{
      line-height:1.75;
    }
    @media (max-width:1160px){
      .stage-wrap{
        grid-template-columns:minmax(0,1fr);
      }
      .notes-column{
        position:static;
      }
      .notes-body{
        max-height:none;
      }
    }
    @media (max-width:900px){
      .stage-frame{
        aspect-ratio:auto;
        height:720px;
        min-height:0;
      }
      .slide{
        padding:18px;
        overflow-y:auto;
        grid-template-rows:auto auto auto auto;
      }
      .slide-main{
        grid-template-columns:1fr;
        min-height:auto;
      }
      .content-grid.two-up,
      .practice-grid{
        grid-template-columns:1fr;
      }
      .slide-footer{
        grid-template-columns:1fr;
      }
      .slide-count{
        text-align:left;
      }
    }
    @media (max-width:520px){
      .deck-shell{
        padding:12px 10px 24px;
      }
      .deck-topbar{
        display:grid;
        gap:8px;
        margin-bottom:10px;
      }
      .topbar-group{
        width:100%;
        display:grid;
        grid-template-columns:repeat(2,minmax(0,1fr));
        gap:8px;
      }
      .topbar-group:last-child{
        grid-template-columns:1.2fr 1fr 1fr;
      }
      .toolbar-link,.toolbar-button{
        width:auto;
        padding:8px 10px;
        font-size:13px;
      }
      .deck-badge{
        min-height:var(--touch);
        justify-content:center;
        padding:8px 10px;
      }
      .nav-button{
        width:auto;
        flex:1;
      }
      .stage-frame{
        padding:10px;
        height:780px;
        min-height:0;
      }
      .slide-header{
        flex-direction:column;
      }
      .slide-title h1{
        font-size:28px;
      }
      .tagline{
        font-size:16px;
      }
      .challenge-title,.next-lesson{
        font-size:22px;
      }
    }
    @media (prefers-reduced-motion: reduce){
      *,*::before,*::after{
        animation:none !important;
        transition:none !important;
        scroll-behavior:auto !important;
      }
    }
    @media print{
      body{
        background:#ffffff;
      }
      .deck-shell{
        max-width:none;
        padding:0;
      }
      .deck-topbar,.notes-column,.nav-row{
        display:none !important;
      }
      .stage-frame{
        aspect-ratio:auto;
        border:none;
        box-shadow:none;
        padding:0;
        background:none;
      }
      .slides-viewport{
        border:none;
        background:none;
        overflow:visible;
      }
      .slide{
        position:static;
        display:grid !important;
        min-height:0;
        page-break-after:always;
        break-after:page;
        padding:16mm;
        border:1px solid #d7e2ea;
      }
      .slide:last-child{
        page-break-after:auto;
        break-after:auto;
      }
      .slide-main{
        grid-template-columns:1fr 1fr;
      }
      .progress,.route-dot{
        print-color-adjust:exact;
        -webkit-print-color-adjust:exact;
      }
    }
  </style>
</head>
<body>
  <main class="deck-shell notes-open" id="deckApp">
    <div class="deck-topbar">
      <div class="topbar-group">
        <a class="toolbar-link" href="../index.html">返回总目录</a>
        <a class="toolbar-link" href="${escapeAttr(pptHref(chapter))}">下载 PPTX</a>
      </div>
      <div class="topbar-group">
        <div class="deck-badge"><strong>${escapeHtml(chapterLabel(chapterIndex))}</strong><span>${escapeHtml(
    chapter.hours
  )}</span></div>
        <button class="toolbar-button" id="notesToggle" type="button" aria-expanded="true" aria-controls="notesDrawer">隐藏教案</button>
        <button class="toolbar-button" id="fullscreenToggle" type="button">全屏</button>
      </div>
    </div>
    <div class="stage-wrap">
      <section class="stage-column">
        <div class="stage-frame" id="stageFrame">
          <div class="slides-viewport" id="slidesViewport" tabindex="0" aria-label="${escapeAttr(
            `${chapter.title} 课件`
          )}">
            ${slides
              .map(
                (slide) => `
                  <section class="slide${slide.index === 1 ? " active" : ""}" id="slide-${slide.index}" data-slide-number="${
                  slide.index
                }" aria-roledescription="slide" aria-label="${escapeAttr(
                  `${slide.title}，第 ${slide.index} 页，共 ${TOTAL_SLIDES} 页`
                )}">
                    <header class="slide-header">
                      <div class="slide-title">
                        <div class="slide-kicker">${escapeHtml(slide.chapterNumber)} · ${escapeHtml(
                  chapter.title
                )}</div>
                        <h1>${escapeHtml(slide.title)}</h1>
                        <p>${escapeHtml(slide.subtitle)}</p>
                      </div>
                      <div class="slide-count"><span class="counter-current">${slide.index}</span> / ${TOTAL_SLIDES}</div>
                    </header>
                    <div class="slide-main">
                      <div class="text-pane">${slide.body}</div>
                      <aside class="visual-pane">${slide.visual}</aside>
                    </div>
                    <footer class="slide-footer">
                      <div class="slide-route">
                        ${slides
                          .map(
                            (item) =>
                              `<span class="route-dot${item.index === slide.index ? " active" : ""}" aria-hidden="true"></span>`
                          )
                          .join("")}
                      </div>
                      <div class="progress" aria-hidden="true">
                        <div class="progress-bar" style="width:${(slide.index / TOTAL_SLIDES) * 100}%"></div>
                      </div>
                      <div class="notes-status">支持键盘、触摸、刷新续播与打印</div>
                    </footer>
                  </section>
                `
              )
              .join("")}
          </div>
        </div>
        <div class="nav-row" aria-label="翻页控制">
          <button class="nav-button" type="button" id="prevButton" aria-label="上一页">上一页</button>
          <button class="nav-button" type="button" id="nextButton" aria-label="下一页">下一页</button>
        </div>
      </section>
      <aside class="notes-column" id="notesDrawer">
        <div class="notes-drawer">
          <div class="notes-header">
            <div>
              <h2>教师提示</h2>
              <div class="notes-status" id="notesHeading">第 1 页 · ${escapeHtml(slides[0].title)}</div>
            </div>
          </div>
          <div class="notes-body" id="notesBody">${notesHtml(slides[0].notes)}</div>
        </div>
      </aside>
    </div>
    <div class="visually-hidden" aria-live="polite" id="liveRegion"></div>
  </main>
  <script>
    (() => {
      const TOTAL = ${TOTAL_SLIDES};
      const slideMeta = ${JSON.stringify(slideMeta)};
      const app = document.getElementById("deckApp");
      const viewport = document.getElementById("slidesViewport");
      const slides = Array.from(document.querySelectorAll(".slide"));
      const prevButton = document.getElementById("prevButton");
      const nextButton = document.getElementById("nextButton");
      const notesToggle = document.getElementById("notesToggle");
      const fullscreenToggle = document.getElementById("fullscreenToggle");
      const notesBody = document.getElementById("notesBody");
      const notesHeading = document.getElementById("notesHeading");
      const liveRegion = document.getElementById("liveRegion");
      const checkboxes = Array.from(document.querySelectorAll("[data-check-key]"));
      let current = 1;
      let touchStartX = null;
      let touchStartY = null;

      function readHash() {
        const match = window.location.hash.match(/^#slide-(\\d+)$/);
        if (!match) return 1;
        const num = Number(match[1]);
        return Number.isFinite(num) && num >= 1 && num <= TOTAL ? num : 1;
      }

      function writeHash(index) {
        history.replaceState(null, "", "#slide-" + index);
      }

      function updateButtons() {
        prevButton.disabled = current === 1;
        nextButton.disabled = current === TOTAL;
      }

      function updateNotes(index) {
        const meta = slideMeta[index - 1];
        notesHeading.textContent = "第 " + index + " 页 · " + meta.title;
        notesBody.innerHTML = meta.notesHtml;
      }

      function announce(index) {
        const meta = slideMeta[index - 1];
        liveRegion.textContent = "已切换到第 " + index + " 页，共 " + TOTAL + " 页：" + meta.title;
      }

      function setSlide(index, options = {}) {
        current = index;
        slides.forEach((slide, slideIndex) => {
          const active = slideIndex === index - 1;
          slide.classList.toggle("active", active);
          slide.setAttribute("aria-hidden", active ? "false" : "true");
        });
        updateButtons();
        updateNotes(index);
        writeHash(index);
        if (!options.silent) announce(index);
      }

      function go(delta) {
        const next = Math.min(TOTAL, Math.max(1, current + delta));
        if (next !== current) setSlide(next);
      }

      function jump(index) {
        const next = Math.min(TOTAL, Math.max(1, index));
        if (next !== current) setSlide(next);
      }

      prevButton.addEventListener("click", () => go(-1));
      nextButton.addEventListener("click", () => go(1));

      notesToggle.addEventListener("click", () => {
        const hidden = app.classList.toggle("notes-hidden");
        notesToggle.textContent = hidden ? "显示教案" : "隐藏教案";
        notesToggle.setAttribute("aria-expanded", String(!hidden));
      });

      fullscreenToggle.addEventListener("click", async () => {
        try {
          if (!document.fullscreenElement) {
            await document.getElementById("stageFrame").requestFullscreen();
            fullscreenToggle.textContent = "退出全屏";
          } else {
            await document.exitFullscreen();
            fullscreenToggle.textContent = "全屏";
          }
        } catch (error) {
          liveRegion.textContent = "全屏模式当前不可用";
        }
      });

      document.addEventListener("fullscreenchange", () => {
        fullscreenToggle.textContent = document.fullscreenElement ? "退出全屏" : "全屏";
      });

      document.addEventListener("keydown", (event) => {
        const tag = event.target && event.target.tagName;
        const typingTarget = tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || event.target.isContentEditable;
        if (typingTarget) return;
        if (event.key === "ArrowRight" || event.key === "PageDown" || event.key === " ") {
          event.preventDefault();
          go(1);
        } else if (event.key === "ArrowLeft" || event.key === "PageUp") {
          event.preventDefault();
          go(-1);
        } else if (event.key === "Home") {
          event.preventDefault();
          jump(1);
        } else if (event.key === "End") {
          event.preventDefault();
          jump(TOTAL);
        }
      });

      viewport.addEventListener("touchstart", (event) => {
        const touch = event.changedTouches[0];
        touchStartX = touch.clientX;
        touchStartY = touch.clientY;
      }, { passive: true });

      viewport.addEventListener("touchend", (event) => {
        if (touchStartX === null || touchStartY === null) return;
        const touch = event.changedTouches[0];
        const deltaX = touch.clientX - touchStartX;
        const deltaY = touch.clientY - touchStartY;
        if (Math.abs(deltaX) > 40 && Math.abs(deltaX) > Math.abs(deltaY)) {
          if (deltaX < 0) go(1);
          if (deltaX > 0) go(-1);
        }
        touchStartX = null;
        touchStartY = null;
      }, { passive: true });

      window.addEventListener("hashchange", () => {
        const index = readHash();
        setSlide(index, { silent: true });
      });

      document.querySelectorAll(".toggle-answer").forEach((button) => {
        button.addEventListener("click", () => {
          const panel = document.getElementById(button.dataset.target);
          const isOpen = !panel.hasAttribute("hidden");
          if (isOpen) {
            panel.setAttribute("hidden", "");
            button.textContent = "显示答案";
            button.setAttribute("aria-expanded", "false");
          } else {
            panel.removeAttribute("hidden");
            button.textContent = "隐藏答案";
            button.setAttribute("aria-expanded", "true");
            window.requestAnimationFrame(() => {
              const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
              panel.scrollIntoView({
                behavior: reduceMotion ? "auto" : "smooth",
                block: "nearest",
                inline: "nearest",
              });
            });
          }
        });
      });

      checkboxes.forEach((checkbox) => {
        const key = "grade5-deck-check-" + checkbox.dataset.checkKey;
        const saved = window.localStorage.getItem(key);
        checkbox.checked = saved === "1";
        checkbox.addEventListener("change", () => {
          window.localStorage.setItem(key, checkbox.checked ? "1" : "0");
        });
      });

      setSlide(readHash(), { silent: true });
    })();
  </script>
</body>
</html>`;
}

function buildRootIndex(chapters) {
  return `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <link rel="icon" href="data:,">
  <title>五年级数学互动课件总目录</title>
  <style>
    :root{
      --ink:#20303d;
      --muted:#5b6a78;
      --line:#d7e2ea;
      --paper:#fffdfa;
      --shadow:0 20px 50px rgba(31,58,95,.10);
    }
    *{box-sizing:border-box}
    body{
      margin:0;
      font-family:-apple-system,BlinkMacSystemFont,"Segoe UI","PingFang SC","Hiragino Sans GB","Microsoft YaHei",sans-serif;
      color:var(--ink);
      background:
        radial-gradient(circle at 1px 1px, rgba(90,110,125,.16) 1px, transparent 0) 0 0/18px 18px,
        linear-gradient(180deg, #f4f7fb 0%, #eef3f7 100%);
    }
    .wrap{
      max-width:1280px;
      margin:0 auto;
      padding:30px 18px 42px;
    }
    .hero{
      background:linear-gradient(180deg, rgba(255,255,255,.95), rgba(252,252,250,.95));
      border:1px solid rgba(215,226,234,.95);
      border-radius:32px;
      padding:28px;
      box-shadow:var(--shadow);
      margin-bottom:20px;
      position:relative;
      overflow:hidden;
    }
    .hero::after{
      content:"";
      position:absolute;
      right:22px;
      top:18px;
      width:104px;
      height:22px;
      border-radius:999px;
      background:rgba(243,182,63,.24);
      transform:rotate(-8deg);
    }
    h1{
      margin:0 0 10px;
      font-size:clamp(30px,4vw,46px);
      line-height:1.15;
    }
    .hero p{
      margin:0;
      color:var(--muted);
      line-height:1.8;
      max-width:70ch;
      font-size:16px;
    }
    .legend{
      margin-top:16px;
      display:flex;
      gap:10px;
      flex-wrap:wrap;
    }
    .legend span{
      display:inline-flex;
      align-items:center;
      border-radius:999px;
      padding:10px 14px;
      background:rgba(255,255,255,.88);
      border:1px solid rgba(215,226,234,.95);
      font-size:14px;
      color:var(--muted);
    }
    .grid{
      display:grid;
      grid-template-columns:repeat(auto-fit,minmax(290px,1fr));
      gap:16px;
    }
    .chapter-card{
      background:linear-gradient(180deg, rgba(255,255,255,.96), rgba(251,252,253,.95));
      border:1px solid rgba(215,226,234,.95);
      border-radius:28px;
      padding:18px;
      box-shadow:var(--shadow);
      display:flex;
      flex-direction:column;
      gap:12px;
      min-height:292px;
      position:relative;
      overflow:hidden;
    }
    .chapter-card::before{
      content:"";
      position:absolute;
      inset:auto -16px -16px auto;
      width:120px;
      height:120px;
      background:radial-gradient(circle, rgba(255,255,255,.36), transparent 70%);
    }
    .chapter-number{
      font-weight:800;
      color:var(--card-primary);
      letter-spacing:.04em;
      font-size:14px;
    }
    .chapter-hours{
      display:inline-flex;
      align-self:flex-start;
      border-radius:999px;
      padding:8px 12px;
      background:var(--card-secondary);
      color:var(--card-primary);
      font-weight:700;
      font-size:13px;
    }
    .chapter-card h2{
      margin:0;
      font-size:26px;
      line-height:1.25;
    }
    .focus{
      margin:0;
      line-height:1.8;
      color:var(--ink);
      font-size:15px;
    }
    .tagline{
      margin:0;
      color:var(--muted);
      line-height:1.75;
      font-size:14px;
    }
    .actions{
      display:flex;
      gap:10px;
      flex-wrap:wrap;
      margin-top:auto;
    }
    .start-link,.ppt-link{
      display:inline-flex;
      align-items:center;
      justify-content:center;
      min-height:44px;
      padding:11px 16px;
      border-radius:16px;
      text-decoration:none;
      font-weight:700;
      border:1px solid transparent;
    }
    .start-link{
      background:var(--card-primary);
      color:#ffffff;
    }
    .ppt-link{
      background:rgba(255,255,255,.88);
      color:var(--card-primary);
      border-color:rgba(255,255,255,.65);
    }
    .start-link:focus-visible,.ppt-link:focus-visible{
      outline:3px solid rgba(243,182,63,.45);
      outline-offset:3px;
    }
    .footer-note{
      margin-top:18px;
      color:var(--muted);
      line-height:1.75;
      font-size:14px;
    }
    @media (max-width:640px){
      .wrap{padding:18px 12px 28px}
      .hero{padding:20px}
      .chapter-card h2{font-size:22px}
      .actions a{width:100%}
    }
  </style>
</head>
<body>
  <main class="wrap">
    <section class="hero">
      <h1>五年级数学互动课件总目录</h1>
      <p>本目录汇总 9 个独立章节课件。每份课件都保留原有九页教学结构，并改造成无需依赖外部资源的交互式 HTML 教学画布，可直接本地打开、局域网分享或静态托管。</p>
      <div class="legend">
        <span>16:9 课堂画布</span>
        <span>键盘 / 触摸翻页</span>
        <span>答案切换与教师提示</span>
        <span>支持打印与深链接</span>
      </div>
    </section>
    <section class="grid">
      ${chapters
        .map(
          (chapter, index) => `
            <article class="chapter-card" style="--card-primary:#${chapter.theme.primary};--card-secondary:#${chapter.theme.secondary};">
              <div class="chapter-number">${escapeHtml(chapterLabel(index))}</div>
              <div class="chapter-hours">${escapeHtml(chapter.hours)}</div>
              <h2>${escapeHtml(chapter.title)}</h2>
              <p class="focus"><strong>章节聚焦：</strong>${escapeHtml(chapter.focus)}</p>
              <p class="tagline">${escapeHtml(chapter.tagline)}</p>
              <div class="actions">
                <a class="start-link" href="./${escapeAttr(chapter.key)}/">开始课件</a>
                <a class="ppt-link" href="${escapeAttr(pptHref(chapter))}">下载 PPTX</a>
              </div>
            </article>
          `
        )
        .join("")}
    </section>
    <p class="footer-note">目录使用相对路径链接章节页面，因此托管到任意子路径时仍可正常进入各章节。PPTX 下载链接指向已发布的历史课件包。</p>
  </main>
</body>
</html>`;
}

function buildReadme(chapters) {
  return `# Grade 5 Math HTML Deck Bundle

输出目录：\`.superpowers/grade5-math-html-decks\`

## 文件说明

- \`generate-grade5-math-html-decks.js\`：可重复运行的生成脚本
- \`index.html\`：总目录页
- \`README.md\`：本说明
- \`qa-report.txt\`：QA 记录
- \`<chapter-key>/index.html\`：每章独立课件

## 生成方式

本脚本不会手动复制章节内容，而是直接从以下源文件读取并提取 \`DECK_STRUCTURE\` 与 \`CHAPTERS\`：

\`${SOURCE_SCRIPT}\`

然后基于这些章节数据生成：

1. 根目录索引页
2. 九个章节子目录与独立 \`index.html\`
3. 教学备注、视觉模型、交互控制与打印样式

## 章节列表

${chapters
  .map(
    (chapter, index) =>
      `${index + 1}. \`${chapter.key}\` | ${chapter.title} | ${chapter.hours} | ${chapter.focus}`
  )
  .join("\n")}

## 重新生成

\`\`\`bash
node generate-grade5-math-html-decks.js
\`\`\`

## 已知内容修正

脚本内包含一条显式数学修正：

- \`decimals-add-subtract\` 的诊断题第 3 题答案已从“更接近8”修正为“更接近9”，并会在 \`qa-report.txt\` 中记录原因。
`;
}

function prepareOutput(chapters) {
  for (const chapter of chapters) {
    removeIfExists(path.join(OUT_DIR, chapter.key));
  }
  removeIfExists(path.join(OUT_DIR, "index.html"));
  removeIfExists(path.join(OUT_DIR, "README.md"));
}

function writeBundle(chapters, deckStructure) {
  chapters.forEach((chapter, index) => {
    const chapterDir = path.join(OUT_DIR, chapter.key);
    ensureDir(chapterDir);
    fs.writeFileSync(
      path.join(chapterDir, "index.html"),
      buildDeckHtml(chapter, index, deckStructure),
      "utf8"
    );
  });
  fs.writeFileSync(path.join(OUT_DIR, "index.html"), buildRootIndex(chapters), "utf8");
  fs.writeFileSync(path.join(OUT_DIR, "README.md"), buildReadme(chapters), "utf8");
}

function main() {
  ensureDir(OUT_DIR);
  const { deckStructure, chapters } = loadSourceData();
  const { chapters: fixedChapters, applied } = applyFixes(chapters);
  prepareOutput(fixedChapters);
  writeBundle(fixedChapters, deckStructure);
  console.log(`Generated root index and ${fixedChapters.length} chapter decks in ${OUT_DIR}`);
  if (applied.length) {
    applied.forEach((fix) => {
      console.log(`Applied fix: ${fix.chapterKey} ${fix.field}`);
    });
  }
}

main();
