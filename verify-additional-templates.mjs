import assert from 'node:assert/strict';
import {readFileSync, existsSync} from 'node:fs';
import {dirname, join} from 'node:path';
import {fileURLToPath, pathToFileURL} from 'node:url';
import PDFDocument from 'pdfkit';
import {locales, strings} from './public/i18n.js';
import {getCvExamples} from './public/cv-examples.js';
import {buildAdditionalExamples, renderAdditionalCv} from './public/additional-templates.js';
import {
  ADDED_TEMPLATES, DEFAULT_ADDITIONAL_SECTION_ORDER, getAdditionalTemplate,
  getAdditionalPalette, templateContrastRatio
} from './public/template-catalog.js';
import {renderAdditionalPdf} from './additional-template-pdf.mjs';

// Isolated verification: no server, network, accounts, payments, or file outputs.
const root = dirname(fileURLToPath(import.meta.url));
const applicationRoot = join(root, '..', '..');
async function loadPdfJs() {
  try { return await import('pdfjs-dist/legacy/build/pdf.mjs'); }
  catch (error) {
    const runtimeHome = process.env.USERPROFILE || process.env.HOME;
    const runtimePackages = process.env.CODEX_VERIFY_NODE_MODULES || (runtimeHome &&
      join(runtimeHome, '.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules'));
    if (!runtimePackages) throw new Error('PDF verification needs pdfjs-dist or CODEX_VERIFY_NODE_MODULES pointing to the bundled packages.', {cause: error});
    return import(pathToFileURL(join(runtimePackages, 'pdfjs-dist/legacy/build/pdf.mjs')).href);
  }
}
const {getDocument} = await loadPdfJs();
const EXPECTED_TEMPLATE_COUNT = 17;
const fontsRoot = existsSync(join(root, 'fonts/DejaVuSans.ttf')) ? join(root, 'fonts') : join(applicationRoot, 'fonts');
const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, char =>
  ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'})[char]);
const compact = value => String(value).normalize('NFC').replace(/\s+/gu, '');
const clone = value => structuredClone(value);
const failures = [];
let passed = 0;
async function verify(name, test) {
  try { await test(); passed++; }
  catch (error) { failures.push({name, error: error.message}); }
}
function styleValues(html) {
  const attr = html.match(/\bstyle="([^"]*)"/)?.[1] || '';
  const decoded = attr.replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&amp;/g, '&');
  return Object.fromEntries(decoded.split(';').filter(Boolean).map(value => {
    const colon = value.indexOf(':'); return [value.slice(0, colon), value.slice(colon + 1)];
  }));
}
function sample(id, lang = 'en') {
  return buildAdditionalExamples(lang, getCvExamples(lang)).find(example => example.style === id);
}
async function pdfBuffer(options) {
  const pdf = new PDFDocument({size: 'A4', margin: 48, info: {Title: 'Isolated template verification'}});
  const textRuns = [];
  const rectFills = [];
  let activeFillColor = null;
  let activeRect = null;
  const setFillColor = pdf.fillColor, drawText = pdf.text, drawRect = pdf.rect, fillPath = pdf.fill;
  pdf.fillColor = function(color, ...rest) {
    activeFillColor = color;
    return setFillColor.call(this, color, ...rest);
  };
  pdf.text = function(value, x, y, ...rest) {
    textRuns.push({value: String(value), color: activeFillColor, x, y});
    return drawText.call(this, value, x, y, ...rest);
  };
  pdf.rect = function(x, y, width, height, ...rest) {
    activeRect = {x, y, width, height};
    return drawRect.call(this, x, y, width, height, ...rest);
  };
  pdf.fill = function(color, ...rest) {
    if (activeRect && typeof color === 'string') rectFills.push({...activeRect, color});
    activeRect = null;
    return fillPath.call(this, color, ...rest);
  };
  for (const [name, file] of [['regular', 'DejaVuSans.ttf'], ['bold', 'DejaVuSans-Bold.ttf'], ['serif', 'DejaVuSerif.ttf']]) {
    pdf.registerFont(name, join(fontsRoot, file));
  }
  const chunks = [];
  const done = new Promise((resolve, reject) => {
    pdf.on('data', chunk => chunks.push(chunk));
    pdf.on('end', () => resolve(Buffer.concat(chunks)));
    pdf.on('error', reject);
  });
  const before = clone(options);
  const recognized = renderAdditionalPdf(pdf, options);
  assert.deepEqual(options, before, 'PDF rendering must not mutate inputs');
  pdf.end();
  const buffer = await done;
  assert(buffer.subarray(0, 5).equals(Buffer.from('%PDF-')), 'Expected PDF bytes');
  assert(buffer.length > 500, 'Expected a complete PDF document');
  return {buffer, recognized, textRuns, rectFills};
}
async function parsePdf(buffer) {
  const loading = getDocument({data: new Uint8Array(buffer), useSystemFonts: false, verbosity: 0});
  const doc = await loading.promise;
  const pages = [];
  try {
    for (let index = 1; index <= doc.numPages; index++) {
      const page = await doc.getPage(index);
      const viewport = page.getViewport({scale: 1});
      const text = await page.getTextContent();
      const items = text.items.filter(item => typeof item.str === 'string');
      pages.push({width: viewport.width, height: viewport.height, items,
        text: items.map(item => item.str).join(' ')});
      page.cleanup();
    }
  } finally { await doc.destroy(); }
  return {pages, text: pages.map(page => page.text).join(' ')};
}
function assertInsidePage(parsed) {
  for (const [pageIndex, page] of parsed.pages.entries()) {
    for (const item of page.items.filter(item => item.str.trim())) {
      const [,,,, x, baseline] = item.transform;
      assert(x >= -0.2, `Text left of page ${pageIndex + 1}: ${item.str}`);
      assert(x + item.width <= page.width + 0.5, `Text right of page ${pageIndex + 1}: ${item.str}`);
      assert(baseline >= 0 && baseline <= page.height, `Text outside vertical page ${pageIndex + 1}: ${item.str}`);
    }
  }
}
const ownCv = {
  name: 'QA PERSON ÁRVÍZTŰRŐ', title: 'QA CUSTOM PROFESSIONAL',
  email: 'qa-person@example.invalid', phone: '+36 30 123 4567', city: 'QA CUSTOM CITY', link: 'qa-profile.invalid',
  summary: 'QA SUMMARY BODY WITH USER DATA',
  experience: [{heading: 'QA EXPERIENCE HEADING', organization: 'QA OWN EMPLOYER', location: 'QA LOCATION', dates: '2022 - 2026', details: 'QA EXPERIENCE BODY ONLY USER DATA'}],
  education: [{heading: 'QA EDUCATION HEADING', organization: 'QA OWN SCHOOL', dates: '2018 - 2022', details: 'QA EDUCATION BODY'}],
  projects: [{heading: 'QA PROJECT HEADING', details: 'QA PROJECT BODY'}],
  awards: [{heading: 'QA AWARD HEADING', details: 'QA AWARD BODY'}],
  volunteer: [{heading: 'QA VOLUNTEER HEADING', details: 'QA VOLUNTEER BODY'}],
  certifications: [{heading: 'QA CERTIFICATE HEADING', details: 'QA CERTIFICATE BODY'}],
  skills: 'QA SKILL ONE, QA SKILL TWO', languages: 'QA LANGUAGE ONE\nQA LANGUAGE TWO', languageLevels: [5, 2], photo: ''
};

await verify('Exactly seventeen new, immutable, distinct styles with actual layout rules', () => {
  assert.equal(ADDED_TEMPLATES.length, EXPECTED_TEMPLATE_COUNT);
  const ids = ADDED_TEMPLATES.map(template => template.id);
  assert.equal(new Set(ids).size, EXPECTED_TEMPLATE_COUNT);
  assert.equal(new Set(ADDED_TEMPLATES.map(template => template.variant)).size, EXPECTED_TEMPLATE_COUNT);
  assert.equal(new Set(ADDED_TEMPLATES.map(template => template.metrics.headerTreatment)).size, EXPECTED_TEMPLATE_COUNT);
  const css = readFileSync(join(root, 'public/additional-templates.css'), 'utf8');
  const signatures = ADDED_TEMPLATES.map(template => {
    assert(Object.isFrozen(template) && Object.isFrozen(template.metrics));
    assert.strictEqual(getAdditionalTemplate(template.id), template);
    assert(DEFAULT_ADDITIONAL_SECTION_ORDER.every(key => template.sectionOrder.includes(key)));
    const rules = [...css.matchAll(/([^{}]+)\{([^{}]+)\}/g)]
      .filter(match => match[1].includes(`.additional-${template.variant}`));
    assert(rules.length >= 3, `Too few distinct layout rules for ${template.id}`);
    return rules.map(match => match[2].replace(/var\([^)]*\)/g, 'variable')).join('|');
  });
  assert.equal(new Set(signatures).size, EXPECTED_TEMPLATE_COUNT, 'Styles must differ in layout, not only their palette');
  assert.equal(getAdditionalTemplate('unrecognized-style'), null);
  assert.equal(renderAdditionalCv('unrecognized-style', ownCv, strings.en, escapeHtml), '');
});

for (const lang of Object.keys(locales)) {
  await verify(`All seventeen localized examples render consistently without mutation: ${lang}`, () => {
    const original = getCvExamples(lang), before = clone(original);
    const added = buildAdditionalExamples(lang, original);
    assert.equal(added.length, EXPECTED_TEMPLATE_COUNT);
    assert.equal(new Set(added.map(example => example.id)).size, EXPECTED_TEMPLATE_COUNT);
    for (const example of added) {
      const snapshot = clone(example);
      const html = renderAdditionalCv(example.style, example.cv, strings[lang], escapeHtml);
      const selected = renderAdditionalCv(example.style, example.cv, strings[lang], escapeHtml, {
        accent: example.accent, secondary: example.secondary, background: example.background, font: example.font, columns: 'one'
      });
      assert.equal(html, selected, 'Sample and selected editor defaults must produce the same paper');
      assert(html.includes(`data-cv-template="${example.style}"`));
      assert(html.includes(escapeHtml(example.cv.name)) && html.includes(escapeHtml(example.cv.title)));
      assert(html.includes(`<h3>${escapeHtml(strings[lang].experience)}</h3>`));
      assert(html.includes(`<h3>${escapeHtml(strings[lang].education)}</h3>`));
      assert(html.includes(escapeHtml(example.cv.summary)));
      assert(!/\b(?:undefined|NaN)\b/.test(html));
      assert.equal(example.cv.photo, '', 'New gallery examples should not require a photograph');
      assert.deepEqual(example, snapshot);
      const source = original.find(value => value.id === getAdditionalTemplate(example.style).source);
      assert.notStrictEqual(example.cv, source.cv);
      assert.notStrictEqual(example.cv.experience, source.cv.experience);
    }
    assert.deepEqual(original, before);
  });
}

for (const template of ADDED_TEMPLATES) {
  await verify(`Text escaping, optional fields, and custom layout: ${template.id}`, () => {
    const danger = '<img src=x onerror="alert(1)"> & \'unsafe\'';
    const cv = {...clone(ownCv), name: danger, title: danger, summary: `First line\n${danger}`,
      skills: danger, languages: danger, experience: [{heading: danger, organization: danger, location: danger, dates: danger, details: danger}]};
    const before = clone(cv);
    const html = renderAdditionalCv(template.id, cv, {experience: danger}, escapeHtml);
    assert(!html.includes('<img src=x') && !html.includes('onerror="alert'));
    assert(html.includes(escapeHtml(danger)) && html.includes('First line<br>'));
    assert.deepEqual(cv, before);
    const empty = renderAdditionalCv(template.id, {name: '', experience: [{heading: ' ', details: ''}, null], education: [], skills: ' ; , ', languages: ''}, strings.en, escapeHtml);
    assert(!empty.includes('<header') && !empty.includes('<section') && !empty.includes('<img'));
    const options = {accent: '#efebed', secondary: '#253850', background: '#111111', textColor: '#111111', headingColor: '#111111',
      font: template.font === 'serif' ? 'sans' : 'serif', columns: 'two', order: ['skills', 'education', 'skills', 'invalid'], widths: {skills: 'half', education: 'half'}};
    const layoutBefore = clone(options);
    const custom = renderAdditionalCv(template.id, ownCv, strings.en, escapeHtml, options);
    assert(custom.includes('additional-two-columns'));
    assert(custom.includes(`additional-font-${options.font}`));
    assert(custom.indexOf('data-cv-section="skills"') < custom.indexOf('data-cv-section="education"'));
    assert(custom.indexOf('data-cv-section="education"') < custom.indexOf('data-cv-section="summary"'));
    assert.equal((custom.match(/data-cv-section="skills"/g) || []).length, 1);
    assert(custom.includes('additional-skills additional-half') && custom.includes('additional-education additional-half'));
    const vars = styleValues(custom);
    assert.equal(vars['--add-paper'], '#111111');
    assert.equal(vars['--add-accent'], '#efebed');
    assert.equal(vars['--add-secondary'], '#253850');
    assert(templateContrastRatio(vars['--add-ink'], vars['--add-paper']) >= 4.5);
    assert.deepEqual(options, layoutBefore);
  });
  await verify(`Reject unsupported photo sources: ${template.id}`, () => {
    for (const photo of ['javascript:alert(1)', 'data:text/html,<script>alert(1)</script>', 'data:image/svg+xml,<svg onload="alert(1)"/>', 'file:///etc/passwd']) {
      const html = renderAdditionalCv(template.id, {...ownCv, photo}, strings.en, escapeHtml);
      assert(!html.includes('<img'), `Unsupported image source leaked into preview: ${photo}`);
    }
    const validPhoto = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9Y9Zl1sAAAAASUVORK5CYII=';
    const html = renderAdditionalCv(template.id, {...ownCv, photo: validPhoto}, strings.en, escapeHtml);
    assert(html.includes(`src="${validPhoto}"`), 'A supported uploaded PNG must remain usable');
  });
  await verify(`WCAG text contrast across default and extreme palettes: ${template.id}`, () => {
    const combinations = [{}];
    for (const background of ['#ffffff', '#000000', '#777777', '#ffff00', '#0000ff', '#ff0000']) {
      for (const accent of ['#ffffff', '#000000', '#777777']) {
        combinations.push({background, accent, secondary: accent, textColor: background, headingColor: background});
      }
    }
    for (const options of combinations) {
      const p = getAdditionalPalette(template, options);
      for (const [foreground, background] of [['ink', 'background'], ['heading', 'background'], ['muted', 'background'],
        ['panelInk', 'panelBackground'], ['panelHeading', 'panelBackground'], ['headerInk', 'headerBackground'],
        ['headerHeading', 'headerBackground'], ['headerMuted', 'headerBackground']]) {
        const contrast = templateContrastRatio(p[foreground], p[background]);
        assert(contrast >= 4.5 - 1e-9, `${foreground}/${background} contrast ${contrast} for ${JSON.stringify(options)}`);
      }
    }
  });
  await verify(`PDF contains actual editable body data and custom section order: ${template.id}`, async () => {
    const options = {style: template.id, cv: clone(ownCv), labels: strings.en, accent: '#144460', secondary: '#e2cbb8', background: '#fffdf8',
      layout: {font: 'serif', columns: 'one', order: ['projects', 'summary', 'skills']}};
    const {buffer, recognized} = await pdfBuffer(options);
    assert(recognized);
    const parsed = await parsePdf(buffer);
    const rendered = compact(parsed.text);
    for (const value of [ownCv.name, ownCv.email, ownCv.summary, ownCv.experience[0].heading, ownCv.experience[0].details,
      ownCv.education[0].details, ownCv.projects[0].details, ownCv.awards[0].details, ownCv.volunteer[0].details,
      ownCv.certifications[0].details, 'QA SKILL TWO', 'QA LANGUAGE TWO']) {
      assert(rendered.includes(compact(value)), `Missing editable content: ${value}`);
    }
    const gallery = sample(template.id);
    assert(!rendered.includes(compact(gallery.cv.name)), 'PDF must not substitute the gallery sample');
    assert(rendered.indexOf(compact(ownCv.projects[0].details)) < rendered.indexOf(compact(ownCv.summary)));
    assertInsidePage(parsed);
  });
  await verify(`PDF text colors match the browser palette on every painted surface: ${template.id}`, async () => {
    for (const colors of [{}, {accent: '#ffffff', secondary: '#000000', background: '#000000'},
      {accent: '#000000', secondary: '#ffffff', background: '#ffffff'}]) {
      const layout = {textColor: colors.background || '', headingColor: colors.background || ''};
      const palette = getAdditionalPalette(template, {...colors, ...layout});
      const {textRuns, rectFills} = await pdfBuffer({style: template.id, cv: clone(ownCv), labels: strings.en, layout, ...colors});
      const summary = textRuns.find(run => run.value.includes('QA SUMMARY BODY'));
      const title = textRuns.find(run => run.value.includes('QA CUSTOM PROFESSIONAL'));
      const name = textRuns.find(run => run.value.includes('QA PERSON'));
      assert(summary && title && name, 'Missing traced PDF text');
      assert.equal(summary.color, template.variant === 'journal' ? palette.panelInk : palette.ink, 'Summary surface color differs');
      assert.equal(title.color, template.variant === 'edge' ? palette.panelInk : template.variant === 'margin' ? palette.headerHeading : palette.headerInk, 'Title surface color differs');
      assert.equal(name.color, palette.headerHeading, 'Name surface color differs');
      if (['journal', 'edge'].includes(template.variant)) {
        assert(rectFills.some(fill => fill.color === palette.panelBackground && fill.width < 550 && fill.height < 200),
          'The contrasting panel behind its text must actually be painted');
      }
    }
  });
}

await verify('Ivory Letter header fields retain separate baselines and contact column', async () => {
  const cv = {...clone(ownCv), name: 'SHORT NAME', title: 'LETTER TITLE', email: 'CONTACTEMAIL', phone: 'CONTACTPHONE', city: 'CONTACTCITY', link: 'CONTACTLINK'};
  const {textRuns} = await pdfBuffer({style: 'ivory-letter', cv, labels: strings.en});
  const run = value => textRuns.find(item => item.value === value);
  const name = run(cv.name), title = run(cv.title), email = run(cv.email), phone = run(cv.phone), city = run(cv.city), link = run(cv.link);
  assert([name, title, email, phone, city, link].every(Boolean));
  assert(title.y > name.y + 25, 'Letter title overlaps the name');
  assert(email.x > name.x + 200 && phone.x > title.x + 200, 'Contacts do not occupy their own column');
  assert(phone.y > email.y + 8 && city.y > phone.y + 8 && link.y > city.y + 8, 'Contact lines overlap');
});

for (const lang of Object.keys(locales)) {
  for (const template of ADDED_TEMPLATES) {
  await verify(`PDF localized headings and Unicode body remain extractable: ${template.id}/${lang}`, async () => {
    const example = sample(template.id, lang);
    const {buffer} = await pdfBuffer({style: template.id, cv: clone(example.cv), labels: strings[lang]});
    const parsed = await parsePdf(buffer), rendered = compact(parsed.text).toLocaleLowerCase(lang);
    for (const value of [example.cv.name, example.cv.summary, strings[lang].experience, strings[lang].education]) {
      assert(rendered.includes(compact(value).toLocaleLowerCase(lang)), `Missing localized PDF content: ${value}`);
    }
    assertInsidePage(parsed);
  });
  }
}

const originalStyleIds = new Set(['simple-classic', 'clean-compact', 'modern-line', 'serif-column', 'neutral-pro',
  'blue-margin', 'warm-editorial', 'slate-header', 'rose-profile', 'timeline-lite']);
for (const template of ADDED_TEMPLATES.filter(template => !originalStyleIds.has(template.id))) {
  await verify(`New design preserves long wrapped header and two-column content: ${template.id}`, async () => {
    const tokens = prefix => Array.from({length: 360}, (_, index) => `${prefix}_${String(index).padStart(4, '0')}`);
    const summary = tokens('NEWSUMMARY'), experience = tokens('NEWEXPERIENCE');
    const header = Array.from({length: 85}, (_, index) => `HEADER${String(index).padStart(3, '0')}`);
    const cv = {...clone(ownCv), title: header.join(' '), summary: summary.join(' '),
      experience: [{heading: 'NEW DESIGN WRAPPED EXPERIENCE', dates: '2020 - 2026', details: experience.join(' ')}],
      projects: [{heading: 'CONTENT AFTER LONG PAIR', details: 'NEW_FINAL_SENTINEL'}]};
    const {buffer} = await pdfBuffer({style: template.id, cv, labels: strings.en,
      layout: {columns: 'two', widths: {summary: 'half', experience: 'half'}, order: ['summary', 'experience', 'projects']}});
    const parsed = await parsePdf(buffer), rendered = compact(parsed.text);
    assert(parsed.pages.length >= 3 && parsed.pages.length < 45, 'Long content should paginate finitely');
    for (const token of [...summary, ...experience, ...header, 'NEW_FINAL_SENTINEL']) {
      assert(rendered.includes(token), `Missing wrapped user content: ${token}`);
    }
    const bodyItems = parsed.pages.flatMap(page => page.items);
    const left = bodyItems.filter(item => item.str.includes('NEWSUMMARY_'));
    const right = bodyItems.filter(item => item.str.includes('NEWEXPERIENCE_'));
    assert(left.length && right.length, 'Missing a populated column');
    assert(left.every(item => item.transform[4] < 290 && item.transform[4] + item.width < 297), 'Left-column text spills');
    assert(right.every(item => item.transform[4] > 295), 'Right-column text spills');
    assertInsidePage(parsed);
  });
}

await verify('Long two-column sections paginate without lost user content or column collisions', async () => {
  const long = prefix => Array.from({length: 950}, (_, index) => `${prefix}_${String(index).padStart(4, '0')}`).join(' ');
  const cv = {...clone(ownCv), summary: long('SUMMARY'), experience: [{heading: 'EXPERIENCE UNIQUE HEADING', details: long('EXPERIENCE')}],
    education: [{heading: 'EDUCATION UNIQUE HEADING', details: long('EDUCATION')}], projects: [{heading: 'PROJECT AFTER TWO COLUMNS', details: 'PROJECT_FINAL_SENTINEL'}]};
  const {buffer} = await pdfBuffer({style: 'modern-line', cv, labels: strings.en,
    layout: {columns: 'two', widths: {summary: 'half', experience: 'half', education: 'half'}, order: ['summary', 'experience', 'education', 'projects']}});
  const parsed = await parsePdf(buffer);
  assert(parsed.pages.length >= 5 && parsed.pages.length < 60, 'Long content should create a finite multipage PDF');
  const rendered = compact(parsed.text);
  for (const prefix of ['SUMMARY', 'EXPERIENCE', 'EDUCATION']) {
    for (let index = 0; index < 950; index++) {
      assert(rendered.includes(`${prefix}_${String(index).padStart(4, '0')}`), `Lost ${prefix} token ${index}`);
    }
  }
  assert(rendered.includes('PROJECT_FINAL_SENTINEL'));
  const summaryItems = parsed.pages.flatMap(page => page.items.filter(item => item.str.includes('SUMMARY_')));
  const experienceItems = parsed.pages.flatMap(page => page.items.filter(item => item.str.includes('EXPERIENCE_')));
  assert(summaryItems.every(item => item.transform[4] < 280 && item.transform[4] + item.width < 290), 'Left-column content spills');
  assert(experienceItems.every(item => item.transform[4] > 295), 'Right-column content spills');
  assertInsidePage(parsed);
});

await verify('Long unbroken Unicode fields and headers paginate without truncation', async () => {
  const phrase = 'ÁrvíztűrőŽluťoučkýŁódźÉcoleΕλληνικάБългарски';
  const longWord = phrase.repeat(180);
  const cv = {name: phrase.repeat(35), title: 'UNICODE HEADER FINAL', email: 'unicode@example.invalid',
    summary: longWord, experience: [{heading: 'UNICODE ENTRY', details: `UNICODE_BODY_START ${longWord} UNICODE_BODY_END`}],
    skills: 'LAST_SKILL_MARKER', languages: 'LAST_LANGUAGE_MARKER', languageLevels: [5]};
  const {buffer} = await pdfBuffer({style: 'serif-column', cv, labels: strings.hu});
  const parsed = await parsePdf(buffer), rendered = compact(parsed.text);
  // Continuation pages intentionally repeat the localized section heading.
  // Reconstruct body-font lines separately so those labels do not interrupt
  // the otherwise contiguous unbroken field being verified.
  const bodySize = ADDED_TEMPLATES.find(template => template.id === 'serif-column').metrics.textSize * parsed.pages[0].width / 620;
  const bodyText = compact(parsed.pages.flatMap(page => page.items)
    .filter(item => Math.abs(Math.hypot(item.transform[0], item.transform[1]) - bodySize) < .01)
    .map(item => item.str).join(' '));
  assert(parsed.pages.length >= 4 && parsed.pages.length < 80);
  assert(rendered.includes(compact(cv.name)), 'Long name/header truncated');
  assert(bodyText.includes(compact(longWord)), 'Long unbroken Unicode summary truncated');
  assert.equal(bodyText.split(compact(longWord)).length - 1, 2, 'Both long Unicode fields must be retained exactly');
  assert(rendered.includes('UNICODE_BODY_START') && rendered.includes('UNICODE_BODY_END'));
  assert(rendered.includes('LAST_SKILL_MARKER') && rendered.includes('LAST_LANGUAGE_MARKER'));
  assert(!rendered.includes('\uFFFD'), 'Replacement glyph appeared in extracted Unicode');
  assertInsidePage(parsed);
});

await verify('Unknown styles and malformed or unsupported photos do not draw unsafe image data', async () => {
  const unknown = await pdfBuffer({style: 'unknown-style', cv: ownCv});
  assert.equal(unknown.recognized, false);
  assert.equal((await parsePdf(unknown.buffer)).text.trim(), '');
  for (const photo of ['javascript:alert(1)', 'data:image/svg+xml,<svg/>', 'data:image/png;base64,AAAA', 'data:image/jpeg;base64,AAAA']) {
    const {buffer, recognized} = await pdfBuffer({style: 'rose-profile', cv: {...ownCv, photo}, labels: strings.en});
    assert(recognized);
    const parsed = await parsePdf(buffer);
    assert(compact(parsed.text).includes(compact(ownCv.summary)));
    assertInsidePage(parsed);
  }
});

console.log(`Additional template verification: ${passed} checks passed; ${failures.length} failed.`);
for (const {name, error} of failures) console.error(`FAIL: ${name}\n  ${error}`);
if (failures.length) process.exitCode = 1;
