const fs = require("fs");
const path = require("path");

const { bundles } = require("./course-data");
const exercises = require("./exercises");
const { validateData, chapterFileName } = require("./generate-course");

const ROOT = __dirname;

function fail(message) {
  throw new Error(message);
}

function assert(condition, message) {
  if (!condition) fail(message);
}

function read(absolutePath) {
  return fs.readFileSync(absolutePath, "utf8");
}

function localeDir(locale) {
  return locale === "zh" ? ROOT : path.join(ROOT, "en");
}

function checkStructure() {
  ["zh", "en"].forEach((locale) => {
    const { course, chapters } = bundles[locale];
    const errors = validateData(course, chapters, exercises[locale], locale);
    if (errors.length) fail(`${locale} data validation failed:\n` + errors.map((item) => `- ${item}`).join("\n"));
  });
}

function checkGeneratedFiles() {
  ["zh", "en"].forEach((locale) => {
    const { chapters } = bundles[locale];
    const dir = localeDir(locale);
    assert(fs.existsSync(path.join(dir, "index.html")), `${locale} missing generated index.html`);
    chapters.forEach((chapter) => {
      const fileName = chapterFileName(chapter);
      assert(fs.existsSync(path.join(dir, fileName)), `${locale} missing generated file ${fileName}`);
    });
  });
}

function checkStaticGuards() {
  const disallowPatterns = [/https?:\/\//i, /\.pptx?/i, /TODO|占位|lorem ipsum/i];
  ["zh", "en"].forEach((locale) => {
    const { chapters } = bundles[locale];
    const dir = localeDir(locale);
    chapters.forEach((chapter) => {
      const filePath = path.join(dir, chapterFileName(chapter));
      const html = read(filePath);
      disallowPatterns.forEach((pattern) => {
        assert(!pattern.test(html), `${locale}/${path.basename(filePath)} hit disallowed pattern ${pattern}`);
      });
      assert((html.match(/class="slide(?: active)?"/g) || []).length >= 7, `${locale}/${path.basename(filePath)} has less than 7 slides`);
      assert((html.match(/class="demo-card"/g) || []).length >= 2, `${locale}/${path.basename(filePath)} has less than 2 interactive labs`);
      [
        'id="prevButton"',
        'id="nextButton"',
        'id="notesToggle"',
        'id="fullscreenToggle"',
        'aria-live="polite"',
        "@media (prefers-reduced-motion: reduce)",
        "@media print",
        "#slide-",
        "grade5-ml:",
        "demo-status",
        "demo-reset",
        "--touch:44px",
        "function isInteractiveTarget(",
        "function isSpaceKey(",
        "check-response",
      ].forEach((token) => {
        assert(html.includes(token), `${locale}/${path.basename(filePath)} missing key token: ${token}`);
      });
    });
  });
}

function checkExerciseCounts() {
  ["zh", "en"].forEach((locale) => {
    const { chapters } = bundles[locale];
    chapters.forEach((chapter) => {
      const bank = exercises[locale][chapter.key];
      assert(Array.isArray(bank.reinforcement) && bank.reinforcement.length === 6, `${locale}:${chapter.key} reinforcement count mismatch`);
      assert(Array.isArray(bank.bonus) && bank.bonus.length === 2, `${locale}:${chapter.key} bonus count mismatch`);
    });
  });
}

function run() {
  checkStructure();
  checkExerciseCounts();
  checkGeneratedFiles();
  checkStaticGuards();
  console.log("QA passed: structure, counts, generated files, static guardrails, keyboard exemption tokens.");
}

if (require.main === module) run();
