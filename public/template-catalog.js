// Shared, data-only design catalogue used by the browser and PDF renderer.
// Metrics describe a 620 px wide document; PDF renderers can scale them to A4.
export const DEFAULT_ADDITIONAL_SECTION_ORDER = Object.freeze([
  'summary', 'experience', 'education', 'projects', 'awards', 'volunteer',
  'certifications', 'skills', 'languages'
]);

const designs = [
  {
    id: 'simple-classic', label: 'Simple Classic', source: 'finance', group: 'simple',
    accent: '#273443', secondary: '#a7afb5', background: '#ffffff', font: 'serif',
    variant: 'classic', nameColor: 'ink',
    noteHu: 'Hagyományos, középre zárt fejléc és finom vonalak.',
    noteEn: 'Traditional centered identity and fine section rules.',
    metrics: {paddingInline: 54, paddingTop: 42, paddingBottom: 44, nameSize: 33,
      textSize: 12, headingSize: 11, sectionGap: 22, entryGap: 14, lineHeight: 1.5,
      headerAlign: 'center', headerTreatment: 'classic', sectionTreatment: 'rule', headerGap: 25}
  },
  {
    id: 'clean-compact', label: 'Clean Compact', source: 'developer', group: 'simple',
    accent: '#2b353a', secondary: '#bec6c9', background: '#ffffff', font: 'sans',
    variant: 'compact', nameColor: 'ink',
    noteHu: 'Tömör, jól tagolt elrendezés több tapasztalathoz.',
    noteEn: 'Compact, clearly grouped content for a fuller career history.',
    metrics: {paddingInline: 38, paddingTop: 35, paddingBottom: 35, nameSize: 29,
      textSize: 11.5, headingSize: 10.8, sectionGap: 16, entryGap: 10, lineHeight: 1.4,
      headerAlign: 'left', headerTreatment: 'compact', sectionTreatment: 'plain', headerGap: 20}
  },
  {
    id: 'modern-line', label: 'Modern Line', source: 'project', group: 'simple',
    accent: '#28516d', secondary: '#93adb9', background: '#ffffff', font: 'sans',
    variant: 'line', nameColor: 'ink',
    noteHu: 'Erős névsor, felső színvonal és világos szerkezet.',
    noteEn: 'A strong name, a colored top rule, and clear structure.',
    metrics: {paddingInline: 46, paddingTop: 38, paddingBottom: 44, nameSize: 36,
      textSize: 12, headingSize: 11.2, sectionGap: 22, entryGap: 14, lineHeight: 1.5,
      headerAlign: 'left', headerTreatment: 'top-rule', sectionTreatment: 'short-rule', headerGap: 27}
  },
  {
    id: 'serif-column', label: 'Serif Column', source: 'graduate', group: 'simple',
    accent: '#564938', secondary: '#c1b7a8', background: '#ffffff', font: 'serif',
    variant: 'folio', nameColor: 'ink',
    noteHu: 'Szellős, egyhasábos CV klasszikus betűkkel.',
    noteEn: 'A spacious single-column CV with classic serif typography.',
    metrics: {paddingInline: 58, paddingTop: 46, paddingBottom: 48, nameSize: 36,
      textSize: 12.1, headingSize: 14, sectionGap: 24, entryGap: 15, lineHeight: 1.55,
      headerAlign: 'left', headerTreatment: 'folio', sectionTreatment: 'serif', headerGap: 30}
  },
  {
    id: 'neutral-pro', label: 'Neutral Pro', source: 'support', group: 'simple',
    accent: '#414b51', secondary: '#bcc4c8', background: '#ffffff', font: 'sans',
    variant: 'neutral', nameColor: 'ink',
    noteHu: 'Jobbra zárt névjegy, visszafogott elválasztók.',
    noteEn: 'A right-aligned identity with restrained entry dividers.',
    metrics: {paddingInline: 44, paddingTop: 42, paddingBottom: 44, nameSize: 31,
      textSize: 12, headingSize: 11, sectionGap: 22, entryGap: 14, lineHeight: 1.5,
      headerAlign: 'right', headerTreatment: 'right', sectionTreatment: 'plain', headerGap: 27}
  },
  {
    id: 'blue-margin', label: 'Blue Margin', source: 'nurse', group: 'simple',
    accent: '#294f76', secondary: '#c5d7e6', background: '#ffffff', font: 'sans',
    variant: 'margin', nameColor: 'ink',
    noteHu: 'Keskeny kék margó és jól elkülönülő szakaszcímek.',
    noteEn: 'A narrow blue margin and clearly separated section headings.',
    metrics: {paddingInline: 50, paddingTop: 43, paddingBottom: 44, nameSize: 33,
      textSize: 12, headingSize: 11.2, sectionGap: 21, entryGap: 14, lineHeight: 1.5,
      headerAlign: 'left', headerTreatment: 'margin', sectionTreatment: 'left-rule', headerGap: 27}
  },
  {
    id: 'warm-editorial', label: 'Warm Editorial', source: 'marketing', group: 'visual',
    accent: '#8f5b3b', secondary: '#d9c7b5', background: '#fffdf8', font: 'serif',
    variant: 'editorial', nameColor: 'accent',
    noteHu: 'Meleg papírszín, szerkesztőségi fejléc és finom keret.',
    noteEn: 'Warm paper, an editorial masthead, and a fine frame.',
    metrics: {paddingInline: 48, paddingTop: 34, paddingBottom: 44, nameSize: 39,
      textSize: 12, headingSize: 15, sectionGap: 24, entryGap: 14, lineHeight: 1.55,
      headerAlign: 'left', headerTreatment: 'frame', sectionTreatment: 'editorial', headerGap: 28}
  },
  {
    id: 'slate-header', label: 'Slate Header', source: 'emerald-director', group: 'visual',
    accent: '#263d50', secondary: '#a9bdc8', background: '#ffffff', font: 'sans',
    variant: 'slate', nameColor: 'accent',
    noteHu: 'Karakteres palaszínű fejléc, világos és rendezett törzs.',
    noteEn: 'A distinctive slate masthead above a clear, ordered body.',
    metrics: {paddingInline: 44, paddingTop: 34, paddingBottom: 44, nameSize: 34,
      textSize: 12, headingSize: 11, sectionGap: 20, entryGap: 14, lineHeight: 1.5,
      headerAlign: 'left', headerTreatment: 'filled', sectionTreatment: 'band', headerGap: 26}
  },
  {
    id: 'rose-profile', label: 'Rose Profile', source: 'finance', group: 'visual',
    accent: '#874e63', secondary: '#e7ccd4', background: '#ffffff', font: 'serif',
    variant: 'rose', nameColor: 'accent',
    noteHu: 'Halvány rózsaszín névjegy és középre zárt címek.',
    noteEn: 'A soft rose identity panel with centered section headings.',
    metrics: {paddingInline: 46, paddingTop: 38, paddingBottom: 44, nameSize: 35,
      textSize: 12, headingSize: 11, sectionGap: 23, entryGap: 14, lineHeight: 1.5,
      headerAlign: 'center', headerTreatment: 'panel', sectionTreatment: 'paired-rules', headerGap: 26}
  },
  {
    id: 'timeline-lite', label: 'Timeline Lite', source: 'electrician', group: 'visual',
    accent: '#52686c', secondary: '#c4d2cf', background: '#ffffff', font: 'sans',
    variant: 'timeline', nameColor: 'ink',
    noteHu: 'Finom idővonal a tapasztalatok áttekintéséhez.',
    noteEn: 'A subtle timeline that makes career milestones easy to follow.',
    metrics: {paddingInline: 48, paddingTop: 44, paddingBottom: 44, nameSize: 34,
      textSize: 12, headingSize: 11.2, sectionGap: 23, entryGap: 17, lineHeight: 1.5,
      headerAlign: 'left', headerTreatment: 'timeline', sectionTreatment: 'timeline', headerGap: 28}
  },
  {
    id: 'linen-notes', label: 'Linen Notes', source: 'nurse', group: 'simple',
    accent: '#655b4d', secondary: '#c7bdad', background: '#fffefa', font: 'serif',
    variant: 'linen', nameColor: 'ink',
    noteHu: 'Klasszikus betűk, rendezett elérhetőségek és finom szakaszjelölők.',
    noteEn: 'Classic type, neatly stacked contact details, and fine section marks.',
    metrics: {paddingInline: 54, paddingTop: 44, paddingBottom: 44, nameSize: 34,
      textSize: 12, headingSize: 13, sectionGap: 24, entryGap: 14, lineHeight: 1.55,
      headerAlign: 'left', headerTreatment: 'notes', sectionTreatment: 'dash-title', headerGap: 26,
      titleSize: 11, titleMargin: 10, contactSize: 10, contactMargin: 13, headerPaddingBottom: 18, headingGap: 11}
  },
  {
    id: 'graphite-index', label: 'Graphite Index', source: 'developer', group: 'simple',
    accent: '#363b40', secondary: '#a5aeb4', background: '#ffffff', font: 'sans',
    variant: 'index', nameColor: 'ink',
    noteHu: 'Számozott szakaszok és határozott, grafitszínű tipográfia.',
    noteEn: 'Numbered sections and confident graphite typography.',
    metrics: {paddingInline: 48, paddingTop: 40, paddingBottom: 44, nameSize: 32,
      textSize: 12, headingSize: 11, sectionGap: 22, entryGap: 14, lineHeight: 1.5,
      headerAlign: 'left', headerTreatment: 'index', sectionTreatment: 'numbered', headerGap: 27,
      titleSize: 11, titleMargin: 10, contactSize: 10, contactMargin: 13, headerPaddingBottom: 20, headingGap: 11}
  },
  {
    id: 'azure-outline', label: 'Azure Outline', source: 'project', group: 'visual',
    accent: '#2d597b', secondary: '#a7c0d2', background: '#ffffff', font: 'sans',
    variant: 'outline', nameColor: 'accent',
    noteHu: 'Vékony kék oldalkeret és körvonalazott, áttekinthető címek.',
    noteEn: 'A fine blue page frame and clearly outlined section headings.',
    metrics: {paddingInline: 48, paddingTop: 42, paddingBottom: 44, nameSize: 30,
      textSize: 12, headingSize: 11, sectionGap: 22, entryGap: 14, lineHeight: 1.5,
      headerAlign: 'left', headerTreatment: 'outline', sectionTreatment: 'outline', headerGap: 27,
      titleSize: 14, titleMargin: 7, contactSize: 10, contactMargin: 14, headerPaddingBottom: 20, headingGap: 10}
  },
  {
    id: 'ivory-letter', label: 'Ivory Letter', source: 'finance', group: 'simple',
    accent: '#5c5144', secondary: '#c8c0b3', background: '#fffefa', font: 'serif',
    variant: 'letter', nameColor: 'ink',
    noteHu: 'Aszimmetrikus levélfejléc és levegős, klasszikus szövegtörzs.',
    noteEn: 'An asymmetric letterhead with spacious, classic body text.',
    metrics: {paddingInline: 54, paddingTop: 46, paddingBottom: 48, nameSize: 38,
      textSize: 12, headingSize: 14, sectionGap: 24, entryGap: 15, lineHeight: 1.55,
      headerAlign: 'left', headerTreatment: 'letter', sectionTreatment: 'plain', headerGap: 31,
      titleSize: 13, titleMargin: 9, contactSize: 10, contactMargin: 0, headerPaddingBottom: 0, headingGap: 11}
  },
  {
    id: 'olive-journal', label: 'Olive Journal', source: 'marketing', group: 'visual',
    accent: '#5c6745', secondary: '#d2d9bc', background: '#fcfdf8', font: 'serif',
    variant: 'journal', nameColor: 'accent',
    noteHu: 'Olívazöld fejezetjelölők és kiemelt szakmai bemutatkozás.',
    noteEn: 'Olive chapter marks and a highlighted professional summary.',
    metrics: {paddingInline: 48, paddingTop: 42, paddingBottom: 44, nameSize: 32,
      textSize: 12, headingSize: 14, sectionGap: 23, entryGap: 14, lineHeight: 1.55,
      headerAlign: 'left', headerTreatment: 'journal', sectionTreatment: 'journal', headerGap: 26,
      titleSize: 13, titleMargin: 9, contactSize: 10, contactMargin: 15, headerPaddingBottom: 19, headingGap: 11}
  },
  {
    id: 'coral-edge', label: 'Coral Edge', source: 'support', group: 'visual',
    accent: '#b34d41', secondary: '#edd0c5', background: '#ffffff', font: 'sans',
    variant: 'edge', nameColor: 'ink',
    noteHu: 'Korallszínű jobb margó és visszafogott címkiemelés.',
    noteEn: 'A coral right margin with a restrained title highlight.',
    metrics: {paddingInline: 46, paddingTop: 42, paddingBottom: 44, nameSize: 36,
      textSize: 12, headingSize: 11, sectionGap: 22, entryGap: 14, lineHeight: 1.5,
      headerAlign: 'left', headerTreatment: 'edge', sectionTreatment: 'overline', headerGap: 27,
      titleSize: 11, titleMargin: 10, contactSize: 10, contactMargin: 15, headerPaddingBottom: 0, headingGap: 10}
  },
  {
    id: 'monochrome-form', label: 'Monochrome Form', source: 'electrician', group: 'simple',
    accent: '#2e3236', secondary: '#aeb4b9', background: '#ffffff', font: 'sans',
    variant: 'form', nameColor: 'ink',
    noteHu: 'Középre zárt névjegy és pontosan keretezett szakaszok.',
    noteEn: 'A centered identity with precisely bordered sections.',
    metrics: {paddingInline: 48, paddingTop: 42, paddingBottom: 44, nameSize: 30,
      textSize: 12, headingSize: 10, sectionGap: 20, entryGap: 14, lineHeight: 1.5,
      headerAlign: 'center', headerTreatment: 'form', sectionTreatment: 'box', headerGap: 24,
      titleSize: 11, titleMargin: 8, contactSize: 10, contactMargin: 12, headerPaddingBottom: 20, headingGap: 12,
      sectionPadding: 14}
  }
];

export const ADDED_TEMPLATES = Object.freeze(designs.map(design => Object.freeze({
  ...design,
  columns: 'one',
  referenceWidth: 620,
  sectionOrder: DEFAULT_ADDITIONAL_SECTION_ORDER,
  metrics: Object.freeze(design.metrics)
})));

const catalogue = new Map(ADDED_TEMPLATES.map(template => [template.id, template]));
export function getAdditionalTemplate(id) { return catalogue.get(id) || null; }

const validHex = value => /^#[0-9a-f]{6}$/i.test(String(value || ''));
export function normalizeTemplateColor(value, fallback = '#ffffff') {
  return validHex(value) ? String(value).toLowerCase() : fallback;
}
const channels = color => [1, 3, 5].map(index => parseInt(color.slice(index, index + 2), 16));
const hex = rgb => '#' + rgb.map(value => Math.round(value).toString(16).padStart(2, '0')).join('');
export function mixTemplateColors(first, second, secondWeight = .5) {
  const a = channels(normalizeTemplateColor(first));
  const b = channels(normalizeTemplateColor(second));
  const weight = Math.max(0, Math.min(1, Number(secondWeight) || 0));
  return hex(a.map((value, index) => value + (b[index] - value) * weight));
}
export function templateLuminance(color) {
  const rgb = channels(normalizeTemplateColor(color)).map(value => {
    const n = value / 255;
    return n <= .04045 ? n / 12.92 : ((n + .055) / 1.055) ** 2.4;
  });
  return rgb[0] * .2126 + rgb[1] * .7152 + rgb[2] * .0722;
}
export function templateContrastRatio(first, second) {
  const a = templateLuminance(first), b = templateLuminance(second);
  return (Math.max(a, b) + .05) / (Math.min(a, b) + .05);
}
export function readableTemplateColor(foreground, background, minimum = 4.5) {
  const fg = normalizeTemplateColor(foreground, '#263238');
  const bg = normalizeTemplateColor(background);
  if (templateContrastRatio(fg, bg) >= minimum) return fg;
  const target = templateContrastRatio('#000000', bg) >= templateContrastRatio('#ffffff', bg) ? '#000000' : '#ffffff';
  // Retain the selected hue as far as possible while guaranteeing legibility.
  for (let amount = .01; amount <= 1; amount += .01) {
    const candidate = mixTemplateColors(fg, target, amount);
    if (templateContrastRatio(candidate, bg) >= minimum) return candidate;
  }
  return target;
}

export function getAdditionalPalette(templateOrId, options = {}) {
  const template = typeof templateOrId === 'string' ? getAdditionalTemplate(templateOrId) : templateOrId;
  if (!template) return null;
  const accent = normalizeTemplateColor(options.accent, template.accent);
  const secondary = normalizeTemplateColor(options.secondary, template.secondary);
  const background = normalizeTemplateColor(options.background, template.background);
  const ink = readableTemplateColor(options.textColor || '#263238', background);
  const heading = readableTemplateColor(options.headingColor || accent, background);
  const muted = readableTemplateColor(mixTemplateColors(ink, background, .24), background);
  const panelBackground = mixTemplateColors(secondary, background, .4);
  const headerBackground = template.variant === 'slate' ? accent : template.variant === 'rose' ? panelBackground : background;
  const headerInk = readableTemplateColor(options.textColor || (template.variant === 'slate' ? '#ffffff' : ink), headerBackground);
  const headerHeading = readableTemplateColor(options.headingColor || (template.variant === 'slate' ? '#ffffff' : template.nameColor === 'ink' ? ink : accent), headerBackground);
  return {
    accent, secondary, background, ink, heading, muted, panelBackground,
    panelInk: readableTemplateColor(ink, panelBackground),
    panelHeading: readableTemplateColor(options.headingColor || accent, panelBackground),
    headerBackground, headerInk, headerHeading,
    headerMuted: readableTemplateColor(mixTemplateColors(headerInk, headerBackground, .16), headerBackground),
    rule: mixTemplateColors(secondary, background, .2),
    tint: mixTemplateColors(secondary, background, .83),
    marker: readableTemplateColor(accent, background, 3)
  };
}
