const fs = require("fs");
const path = require("path");

const { locales } = require("./course-data");
const exercises = require("./exercises");
const { validateData } = require("./generate-course");

const ROOT = __dirname;
const LANGS = ["zh", "en"];

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function read(filePath) {
  return fs.readFileSync(filePath, "utf8");
}

function countMatches(text, regex) {
  const matches = text.match(regex);
  return matches ? matches.length : 0;
}

function runDataChecks() {
  validateData();
  LANGS.forEach((locale) => {
    const pack = locales[locale];
    assert(pack.chapters.length === 6, `${locale}: need exactly 6 chapters`);
    pack.chapters.forEach((chapter) => {
      assert(chapter.slides.length === 7, `${locale}:${chapter.key} must have 7 slides`);
      assert(chapter.demo && chapter.demo.type, `${locale}:${chapter.key} missing demo`);
      assert(chapter.explorer && chapter.explorer.length >= 3, `${locale}:${chapter.key} missing explorer items`);
      assert(chapter.quiz && chapter.quiz.options && chapter.quiz.options.length >= 3, `${locale}:${chapter.key} missing quiz`);
      assert(exercises[locale][chapter.key], `${locale}:${chapter.key} missing exercise bank`);
      assert(exercises[locale][chapter.key].reinforcement.length === 6, `${locale}:${chapter.key} reinforcement must be 6`);
      assert(exercises[locale][chapter.key].bonus.length === 2, `${locale}:${chapter.key} bonus must be 2`);
    });
  });
}

function runGeneratedFileChecks() {
  const portalPath = path.join(ROOT, "index.html");
  assert(fs.existsSync(portalPath), "Missing generated portal index.html. Run node generate-course.js first.");
  const portalHtml = read(portalPath);
  assert(!/\.pptx?/i.test(portalHtml), "Portal must not reference PPT/PPTX");

  let slideTotal = 0;
  let reinforcementTotal = 0;
  let bonusTotal = 0;

  LANGS.forEach((locale) => {
    const localeIndexPath = path.join(ROOT, locale, "index.html");
    assert(fs.existsSync(localeIndexPath), `Missing locale index for ${locale}`);
    const localeHtml = read(localeIndexPath);
    assert(!/https?:\/\//.test(localeHtml), `${locale} index must not include external URLs`);
    assert(!/\.pptx?/i.test(localeHtml), `${locale} index must not reference PPT/PPTX`);
    assert(localeHtml.includes("class=\"peer\""), `${locale} index missing cross-locale link`);

    locales[locale].chapters.forEach((chapter) => {
      const chapterPath = path.join(ROOT, locale, chapter.key, "index.html");
      assert(fs.existsSync(chapterPath), `Missing chapter page: ${locale}/${chapter.key}/index.html`);
      const html = read(chapterPath);

      slideTotal += countMatches(html, /class="slide(?: active)?"/g);
      reinforcementTotal += countMatches(html, /data-check="[^"]*-reinforcement-\d+"/g);
      bonusTotal += countMatches(html, /data-check="[^"]*-bonus-\d+"/g);

      assert(!/https?:\/\//.test(html), `${locale}:${chapter.key} must not include external URLs`);
      assert(!/fetch\(/.test(html), `${locale}:${chapter.key} must not perform network fetch`);
      assert(!/\.pptx?/i.test(html), `${locale}:${chapter.key} must not reference PPT/PPTX`);
      assert(countMatches(html, /class="slide(?: active)?"/g) === 7, `${locale}:${chapter.key} must render 7 slides`);

      assert(html.includes('id="prevButton"'), `${locale}:${chapter.key} missing prev button`);
      assert(html.includes('id="nextButton"'), `${locale}:${chapter.key} missing next button`);
      assert(html.includes('id="notesToggle"'), `${locale}:${chapter.key} missing notes toggle`);
      assert(html.includes('id="fullscreenToggle"'), `${locale}:${chapter.key} missing fullscreen toggle`);
      assert(html.includes('class="toggle-answer"'), `${locale}:${chapter.key} missing answer toggles`);
      assert(html.includes('aria-live="polite"'), `${locale}:${chapter.key} missing live region`);
      assert(html.includes("@media (prefers-reduced-motion: reduce)"), `${locale}:${chapter.key} missing reduced-motion CSS`);
      assert(html.includes("@media print"), `${locale}:${chapter.key} missing print CSS`);
      assert(html.includes(`data-demo="${chapter.key}"`), `${locale}:${chapter.key} missing demo root`);
      assert(html.includes(`data-explorer="${chapter.key}"`), `${locale}:${chapter.key} missing explorer root`);
      assert(html.includes(`data-quiz="${chapter.key}"`), `${locale}:${chapter.key} missing quiz root`);
      assert(html.includes('data-coach-action="next"'), `${locale}:${chapter.key} missing coach challenge interaction`);
      assert(html.includes("grade5-cs:"), `${locale}:${chapter.key} missing completion persistence key`);
      assert(html.includes('target.closest("button, summary, a[href], [role=\'button\']")'), `${locale}:${chapter.key} missing keyboard focus guard`);
      assert(/trusted adult|可信任的大人|安全|safety/.test(html), `${locale}:${chapter.key} missing safety copy`);
    });
  });

  assert(slideTotal === 84, `Expected 84 slides total, found ${slideTotal}`);
  assert(reinforcementTotal === 72, `Expected 72 reinforcement items, found ${reinforcementTotal}`);
  assert(bonusTotal === 24, `Expected 24 bonus items, found ${bonusTotal}`);
}

function run() {
  runDataChecks();
  runGeneratedFileChecks();
  console.log("QA PASS: bilingual structure, safety, and generated HTML checks passed.");
  console.log(JSON.stringify({ locales: LANGS.length, chaptersPerLocale: 6, totalSlides: 84, reinforcement: 72, bonus: 24 }));
}

if (require.main === module) run();

module.exports = { run };
