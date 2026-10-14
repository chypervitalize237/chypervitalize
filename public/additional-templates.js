import {strings} from './i18n.js';
import {
  ADDED_TEMPLATES, DEFAULT_ADDITIONAL_SECTION_ORDER, getAdditionalTemplate,
  getAdditionalPalette
} from './template-catalog.js';

const entryKeys = new Set(['experience', 'education', 'projects', 'awards', 'volunteer', 'certifications']);
const fallbackLabels = {
  summary: 'Professional summary', experience: 'Work experience', education: 'Education',
  projects: 'Projects', awards: 'Achievements', volunteer: 'Volunteering',
  certifications: 'Certifications', skills: 'Skills', languages: 'Languages', contact: 'Contact details'
};
const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, character => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
})[character]);
const text = value => typeof value === 'string' ? value.trim() : typeof value === 'number' && Number.isFinite(value) ? String(value) : '';
const list = value => text(value).split(/\r?\n|,|;|\s·\s/).map(item => item.trim()).filter(Boolean);

// Match the exporter's uploaded-photo policy. Never fetch external images or
// embed SVG/HTML data supplied through a saved draft.
function safePhoto(value) {
  const match = text(value).match(/^data:image\/(png|jpe?g);base64,([A-Za-z0-9+/=\s]+)$/i);
  if (!match || match[2].length > 8 * 1024 * 1024) return '';
  const payload = match[2].replace(/\s/g, '');
  try {
    const bytes = atob(payload);
    const png = bytes.startsWith('\x89PNG\r\n\x1a\n');
    const jpeg = bytes.startsWith('\xff\xd8\xff') && bytes.lastIndexOf('\xff\xd9') >= bytes.length - 64;
    if (!(match[1].toLowerCase() === 'png' ? png : jpeg)) return '';
    return `data:image/${match[1].toLowerCase()};base64,${payload}`;
  } catch { return ''; }
}

export function renderAdditionalCv(id, d, labels, esc, options = {}) {
  const template = getAdditionalTemplate(id);
  if (!template) return '';
  d = d && typeof d === 'object' ? d : {};
  labels = labels && typeof labels === 'object' ? labels : {};
  options = options && typeof options === 'object' ? options : {};
  const safe = value => (typeof esc === 'function' ? esc : escapeHtml)(text(value));
  const br = value => safe(value).replace(/\r?\n/g, '<br>');
  const label = key => safe(labels[key] || fallbackLabels[key]);
  const palette = getAdditionalPalette(template, options);
  const requestedOrder = Array.isArray(options.order) ? options.order : [];
  const order = [...new Set([...requestedOrder.filter(key => DEFAULT_ADDITIONAL_SECTION_ORDER.includes(key)), ...template.sectionOrder])];
  const twoColumns = options.columns === 'two';
  const font = ['sans', 'serif'].includes(options.font) ? options.font : template.font;

  function section(key, content) {
    if (!content) return '';
    const half = twoColumns && options.widths?.[key] === 'half' ? ' additional-half' : '';
    return `<section class="premium-section additional-section additional-${key}${half}" data-cv-section="${key}"><h3>${label(key)}</h3><div class="additional-section-content">${content}</div></section>`;
  }
  function entries(key) {
    const rows = Array.isArray(d[key]) ? d[key] : [];
    const content = rows.map(row => {
      if (!row || typeof row !== 'object' || !['heading', 'organization', 'location', 'dates', 'details'].some(field => text(row[field]))) return '';
      const heading = text(row.heading) ? `<h4>${safe(row.heading)}</h4>` : '';
      const dates = text(row.dates) ? `<span class="premium-dates">${safe(row.dates)}</span>` : '';
      const top = heading || dates ? `<div class="premium-entry-top">${heading}${dates}</div>` : '';
      const organization = [row.organization, row.location].filter(value => text(value)).map(safe);
      const org = organization.length ? `<p class="premium-org">${organization.join(' <span aria-hidden="true">·</span> ')}</p>` : '';
      const details = text(row.details) ? `<p class="premium-copy">${br(row.details)}</p>` : '';
      return `<article class="premium-entry">${top}${org}${details}</article>`;
    }).join('');
    return section(key, content);
  }
  function skills() {
    const items = list(d.skills);
    return section('skills', items.length ? `<ul class="premium-skill-list">${items.map(item => `<li>${safe(item)}</li>`).join('')}</ul>` : '');
  }
  function languages() {
    const items = list(d.languages);
    return section('languages', items.length ? `<ul class="premium-language-list">${items.map((item, index) => {
      const level = Math.max(0, Math.min(5, Math.round(Number(d.languageLevels?.[index]) || 0)));
      const dots = level ? `<span class="premium-language-level" aria-label="${level} / 5">${[1, 2, 3, 4, 5].map(value => `<i${value <= level ? ' class="is-filled"' : ''} aria-hidden="true"></i>`).join('')}</span>` : '';
      return `<li><span>${safe(item)}</span>${dots}</li>`;
    }).join('')}</ul>` : '');
  }

  const photoSource = safePhoto(d.photo);
  const photo = photoSource ? `<img class="premium-photo" src="${safe(photoSource)}" alt="" loading="lazy">` : '';
  const name = text(d.name) ? `<h2 class="premium-name">${safe(d.name)}</h2>` : '';
  const title = text(d.title) ? `<p class="premium-title">${safe(d.title)}</p>` : '';
  const contacts = [d.email, d.phone, d.city, d.link].filter(value => text(value));
  const contactMarkup = contacts.length ? `<ul class="premium-contact" aria-label="${safe(labels.contact || labels.contacts || fallbackLabels.contact)}">${contacts.map(value => `<li>${safe(value)}</li>`).join('')}</ul>` : '';
  const identity = name || title || contactMarkup ? `<div class="premium-identity">${name}${title}${contactMarkup}</div>` : '';
  const header = identity || photo ? `<header class="premium-head additional-head">${photo}${identity}</header>` : '';
  const blocks = {
    summary: section('summary', text(d.summary) ? `<p class="premium-copy">${br(d.summary)}</p>` : ''),
    skills: skills(), languages: languages()
  };
  for (const key of entryKeys) blocks[key] = entries(key);
  const content = order.map(key => blocks[key]).join('');
  const metrics = template.metrics;
  const variables = {
    '--cv-paper-bg': palette.background, '--add-paper': palette.background,
    '--add-accent': palette.accent, '--add-secondary': palette.secondary,
    '--add-ink': palette.ink, '--add-muted': palette.muted, '--add-heading': palette.heading,
    '--add-rule': palette.rule, '--add-tint': palette.tint, '--add-marker': palette.marker,
    '--add-panel': palette.panelBackground, '--add-panel-ink': palette.panelInk,
    '--add-panel-heading': palette.panelHeading, '--add-head-bg': palette.headerBackground,
    '--add-head-ink': palette.headerInk, '--add-head-heading': palette.headerHeading,
    '--add-head-muted': palette.headerMuted,
    '--add-font': font === 'serif' ? 'Georgia,"Times New Roman",serif' : '"DM Sans",Arial,sans-serif',
    '--add-pad': `${metrics.paddingInline}px`, '--add-top': `${metrics.paddingTop}px`,
    '--add-bottom': `${metrics.paddingBottom}px`, '--add-name-size': `${metrics.nameSize}px`,
    '--add-text-size': `${metrics.textSize}px`, '--add-heading-size': `${metrics.headingSize}px`,
    '--add-section-gap': `${metrics.sectionGap}px`, '--add-entry-gap': `${metrics.entryGap}px`,
    '--add-line-height': metrics.lineHeight, '--add-header-gap': `${metrics.headerGap}px`
  };
  const style = Object.entries(variables).map(([key, value]) => `${key}:${value}`).join(';');
  return `<article class="cv-paper additional-cv additional-${template.variant} additional-font-${font}" data-cv-template="${template.id}" style="${escapeHtml(style)}" aria-label="${safe(d.name || labels.resume || labels.cv || 'CV')}">${header}<main class="premium-main additional-main${twoColumns ? ' additional-two-columns' : ''}">${content}</main></article>`;
}

const galleryCopy = {
  hu: ['LETISZTULT', 'VIZUÁLIS', 'Szerkeszthető CV-sablon'],
  en: ['CLEAN', 'VISUAL', 'Editable CV template'],
  de: ['KLAR', 'VISUELL', 'Bearbeitbare Lebenslaufvorlage'],
  fr: ['ÉPURÉ', 'VISUEL', 'Modèle de CV modifiable'],
  es: ['SENCILLO', 'VISUAL', 'Plantilla de CV editable'],
  it: ['ESSENZIALE', 'VISIVO', 'Modello di CV modificabile'],
  pt: ['SIMPLES', 'VISUAL', 'Modelo de CV editável'],
  nl: ['HELDER', 'VISUEEL', 'Bewerkbaar cv-sjabloon'],
  sk: ['ČISTÝ', 'VIZUÁLNY', 'Upraviteľná šablóna životopisu'],
  cs: ['ČISTÝ', 'VIZUÁLNÍ', 'Upravitelná šablona životopisu'],
  pl: ['PROSTY', 'WIZUALNY', 'Edytowalny szablon CV'],
  ro: ['SIMPLU', 'VIZUAL', 'Șablon de CV editabil'],
  hr: ['JEDNOSTAVAN', 'VIZUALAN', 'Predložak životopisa za uređivanje'],
  sl: ['PREGLEDEN', 'VIZUALEN', 'Predloga življenjepisa za urejanje'],
  sr: ['JEDNOSTAVAN', 'VIZUELAN', 'Šablon biografije za uređivanje'],
  bg: ['ИЗЧИСТЕН', 'ВИЗУАЛЕН', 'Редактируем шаблон за CV'],
  el: ['ΛΙΤΟ', 'ΟΠΤΙΚΟ', 'Επεξεργάσιμο πρότυπο βιογραφικού'],
  da: ['ENKELT', 'VISUELT', 'Redigerbar CV-skabelon'],
  sv: ['ENKEL', 'VISUELL', 'Redigerbar CV-mall'],
  no: ['ENKEL', 'VISUELL', 'Redigerbar CV-mal'],
  fi: ['SELKEÄ', 'VISUAALINEN', 'Muokattava CV-pohja']
};

export function buildAdditionalExamples(lang, originals) {
  const locale = strings[lang] || strings.en || {};
  const copy = galleryCopy[lang] || galleryCopy.en;
  const sources = Array.isArray(originals) ? originals : [];
  return ADDED_TEMPLATES.map((template, index) => {
    const original = sources.find(example => example.id === template.source);
    if (!original?.cv) throw new Error(`Missing source CV example: ${template.source}`);
    return {
      id: `template-${template.id}`, style: template.id, accent: template.accent,
      secondary: template.secondary, background: template.background, font: template.font,
      group: template.group,
      category: `${String(index + 1).padStart(2, '0')} / ${copy[template.group === 'simple' ? 0 : 1]}`,
      label: template.label,
      note: lang === 'hu' ? template.noteHu : lang === 'en' ? template.noteEn : locale.editDesc || template.noteEn,
      result: copy[2],
      cv: {...JSON.parse(JSON.stringify(original.cv)), photo: ''}
    };
  });
}

export {ADDED_TEMPLATES, getAdditionalTemplate};
