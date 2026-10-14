import {
  DEFAULT_ADDITIONAL_SECTION_ORDER, getAdditionalTemplate, getAdditionalPalette
} from './public/template-catalog.js';
import {readableColor} from './color-utils.mjs';
import {inflateSync} from 'node:zlib';

const entryKeys = new Set(['experience', 'education', 'projects', 'awards', 'volunteer', 'certifications']);
const fallbackLabels = {
  summary: 'Professional summary', experience: 'Work experience', education: 'Education',
  projects: 'Projects', awards: 'Achievements', volunteer: 'Volunteering',
  certifications: 'Certifications', skills: 'Skills', languages: 'Languages'
};
const text = value => typeof value === 'string' ? value.trim() :
  typeof value === 'number' && Number.isFinite(value) ? String(value) : '';
const list = value => text(value).split(/\r?\n|,|;|\s·\s/).map(item => item.trim()).filter(Boolean);
const sumHeight = atoms => atoms.reduce((total, atom) => total + atom.height, 0);

/**
 * Render the additional catalogue without ending the caller's PDF stream.
 * The caller supplies a fresh PDFKit document with regular, bold and serif
 * DejaVu fonts registered. Unknown style IDs return false without drawing.
 * All pagination is planned before drawing; PDFKit's implicit page wrapping
 * is disabled so a long field cannot overwrite another column or lose text.
 */
export function renderAdditionalPdf(pdf, options = {}) {
  const template = getAdditionalTemplate(options.style);
  if (!template) return false;
  const cv = options.cv && typeof options.cv === 'object' ? options.cv : {};
  const labels = options.labels && typeof options.labels === 'object' ? options.labels : {};
  const layout = options.layout && typeof options.layout === 'object' ? options.layout : {};
  const palette = getAdditionalPalette(template, {
    accent: options.accent, secondary: options.secondary, background: options.background,
    textColor: layout.textColor, headingColor: layout.headingColor
  });
  const scale = pdf.page.width / template.referenceWidth;
  const px = value => value * scale;
  const metrics = template.metrics;
  const variant = template.variant;
  const family = ['sans', 'serif'].includes(layout.font) ? layout.font : template.font;
  const bodyFont = family === 'serif' ? 'serif' : 'regular';
  const strongFont = family === 'serif' ? 'serif' : 'bold';
  const bodySize = Math.max(9, px(metrics.textSize));
  const bodyHeight = bodySize * metrics.lineHeight;
  const top = px(metrics.paddingTop) + (variant === 'line' ? px(6) : 0);
  const bottom = pdf.page.height - px(metrics.paddingBottom);
  const left = px(metrics.paddingInline) + (variant === 'margin' ? px(10) : 0);
  const right = pdf.page.width - px(metrics.paddingInline) - (variant === 'edge' ? px(8) : 0);
  const width = right - left;
  const pageCapacity = bottom - top;
  const ink = readableColor(palette.ink, palette.background);
  const headingColor = readableColor(palette.heading, palette.background);
  const measure = (value, font, size, characterSpacing = 0) => pdf.font(font).fontSize(size).widthOfString(value, {characterSpacing});
  const segmenter = typeof Intl.Segmenter === 'function' ? new Intl.Segmenter(undefined, {granularity: 'grapheme'}) : null;
  const graphemes = value => segmenter ? [...segmenter.segment(value)].map(item => item.segment) : Array.from(value);

  // Match CSS whitespace and overflow-wrap:anywhere, retaining explicit newlines.
  function wrap(value, available, font = bodyFont, size = bodySize, characterSpacing = 0) {
    const result = [];
    for (const paragraph of String(value).replace(/\r\n?/g, '\n').split('\n')) {
      const words = paragraph.trim().split(/\s+/u).filter(Boolean);
      if (!words.length) { result.push(''); continue; }
      let line = '';
      for (const word of words) {
        const candidate = line ? `${line} ${word}` : word;
        if (measure(candidate, font, size, characterSpacing) <= available) { line = candidate; continue; }
        if (line) { result.push(line); line = ''; }
        if (measure(word, font, size, characterSpacing) <= available) { line = word; continue; }
        let remaining = graphemes(word);
        while (remaining.length) {
          let low = 1, high = remaining.length;
          while (low < high) {
            const middle = Math.ceil((low + high) / 2);
            if (measure(remaining.slice(0, middle).join(''), font, size, characterSpacing) <= available) low = middle;
            else high = middle - 1;
          }
          const fragment = remaining.slice(0, low).join('');
          remaining = remaining.slice(low);
          if (remaining.length) result.push(fragment); else line = fragment;
        }
      }
      if (line) result.push(line);
    }
    return result;
  }

  function lines(value, available, style = {}) {
    const font = style.font || bodyFont, size = style.size || bodySize;
    const height = style.lineHeight || bodyHeight;
    return wrap(value, available, font, size, style.characterSpacing || 0).map(value => ({
      height, lines: [{value, x: style.x || 0, width: available, font, size,
        color: style.color || ink, align: style.align || 'left', characterSpacing: style.characterSpacing || 0}]
    }));
  }
  const space = height => ({height, space: true});

  function safePhoto(value) {
    const source = text(value);
    const match = source.match(/^data:image\/(?:png|jpe?g);base64,([A-Za-z0-9+/=\s]+)$/i);
    if (!match || match[1].length > 8 * 1024 * 1024) return null;
    try {
      const buffer = Buffer.from(match[1], 'base64');
      if (!buffer.length) return null;
      if (buffer.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))) {
        // PDFKit inflates alpha PNGs asynchronously. Check the compressed data
        // and row filters here so a malformed upload cannot fail after return.
        let offset = 8, header = null, ended = false;
        const compressed = [];
        while (offset + 12 <= buffer.length) {
          const length = buffer.readUInt32BE(offset);
          if (offset + length + 12 > buffer.length) return null;
          const type = buffer.toString('ascii', offset + 4, offset + 8);
          const data = buffer.subarray(offset + 8, offset + 8 + length);
          if (type === 'IHDR') {
            if (header || length !== 13 || offset !== 8) return null;
            header = {width: data.readUInt32BE(0), height: data.readUInt32BE(4), depth: data[8], colorType: data[9],
              channels: {0: 1, 2: 3, 3: 1, 4: 2, 6: 4}[data[9]],
              compression: data[10], filter: data[11], interlace: data[12]};
          } else if (type === 'IDAT') compressed.push(data);
          else if (type === 'IEND') { ended = true; break; }
          offset += length + 12;
        }
        if (!header || !ended || !compressed.length || !header.channels || !header.width || !header.height ||
            header.width * header.height > 25_000_000 ||
            !({0: [1, 2, 4, 8, 16], 2: [8, 16], 3: [1, 2, 4, 8], 4: [8, 16], 6: [8, 16]}[header.colorType] || []).includes(header.depth) ||
            header.compression || header.filter || header.interlace > 1) return null;
        const raw = inflateSync(Buffer.concat(compressed), {maxOutputLength: 160 * 1024 * 1024});
        const passes = header.interlace ? [[0, 0, 8, 8], [4, 0, 8, 8], [0, 4, 4, 8],
          [2, 0, 4, 4], [0, 2, 2, 4], [1, 0, 2, 2], [0, 1, 1, 2]] : [[0, 0, 1, 1]];
        let position = 0;
        for (const [x, y, stepX, stepY] of passes) {
          const passWidth = Math.max(0, Math.ceil((header.width - x) / stepX));
          const passHeight = Math.max(0, Math.ceil((header.height - y) / stepY));
          if (!passWidth || !passHeight) continue;
          const rowBytes = Math.ceil(passWidth * header.channels * header.depth / 8);
          for (let row = 0; row < passHeight; row++) {
            if (position + rowBytes + 1 > raw.length || raw[position] > 4) return null;
            position += rowBytes + 1;
          }
        }
        if (position !== raw.length) return null;
      } else if (buffer.lastIndexOf(Buffer.from([255, 217])) < buffer.length - 64) return null;
      const image = pdf.openImage(buffer);
      if (!Number.isInteger(image.width) || !Number.isInteger(image.height) ||
          image.width < 1 || image.height < 1 || image.width * image.height > 25_000_000) return null;
      return buffer;
    } catch { return null; }
  }

  function sectionHeading(key, available, ordinal = 1) {
    const sentenceCase = ['folio', 'editorial', 'linen', 'letter', 'journal'].includes(variant);
    const value = text(labels[key]) || fallbackLabels[key] || key;
    const font = variant === 'rose' ? 'bold' : strongFont;
    const size = Math.max(9, px(['neutral', 'rose'].includes(variant) ? 10 : metrics.headingSize));
    const treatment = metrics.sectionTreatment;
    const inset = treatment === 'band' ? px(11) : treatment === 'outline' ? px(12) : treatment === 'box' ? px(15) :
      treatment === 'dash-title' ? px(36) : treatment === 'numbered' ? px(35) : 0;
    const asymmetricInset = ['dash-title', 'numbered'].includes(treatment);
    const paddingTop = ['band', 'outline'].includes(treatment) ? px(7) : treatment === 'left-rule' ? px(2) :
      ['journal', 'overline', 'box'].includes(treatment) ? px(8) : 0;
    const paddingBottom = ['band', 'outline'].includes(treatment) ? px(7) : treatment === 'left-rule' ? px(2) : treatment === 'box' ? px(8) :
      ['plain', 'serif', 'paired-rules', 'timeline', 'dash-title', 'numbered', 'journal', 'overline'].includes(treatment) ? 0 : px(treatment === 'short-rule' ? 9 : 7);
    const gap = px(metrics.headingGap ?? (variant === 'compact' ? 7 : variant === 'folio' ? 11 :
      ['rose', 'timeline'].includes(variant) ? 12 : 10));
    const lineHeight = size * 1.4;
    const lineAtoms = lines(sentenceCase ? value : value.toUpperCase(), available - inset * (asymmetricInset ? 1 : 2), {
      font, size, lineHeight, x: inset,
      color: treatment === 'band' ? readableColor(palette.panelHeading, palette.panelBackground) : headingColor,
      align: ['classic', 'rose'].includes(variant) ? 'center' : 'left'
    });
    if (treatment === 'numbered') lineAtoms[0].lines.unshift({value: String(ordinal).padStart(2, '0'),
      x: 0, width: px(24), font: 'regular', size: px(10), color: headingColor, align: 'left'});
    const textHeight = sumHeight(lineAtoms);
    const atoms = [];
    if (paddingTop) atoms.push(space(paddingTop));
    atoms.push(...lineAtoms);
    if (paddingBottom) atoms.push(space(paddingBottom));
    const borderHeight = ['rule', 'editorial', 'outline', 'box'].includes(treatment) ? px(1) : 0;
    atoms.push(space(borderHeight + gap));
    return {atoms, height: sumHeight(atoms), treatment, width: available,
      decorationHeight: paddingTop + textHeight + paddingBottom,
      textHeight, paddingTop, size};
  }

  function entryAtoms(row, available, timeline, isFirst) {
    const atoms = [];
    const entrySize = Math.max(9, px(['folio', 'editorial'].includes(variant) ? 13 : metrics.textSize + .5));
    const entryLine = entrySize * 1.45;
    const dateSize = Math.max(9, px(timeline ? 9.5 : 10));
    const dateLine = dateSize * 1.45;
    const heading = text(row.heading), dates = text(row.dates);
    const datesBelow = variant === 'letter';
    const organization = [row.organization, row.location].map(text).filter(Boolean).join(' · ');
    const details = text(row.details);
    if (variant === 'neutral' && !isFirst) atoms.push({height: px(13), divider: true});
    if (timeline && dates) {
      atoms.push(...lines(dates, available, {font: 'regular', size: dateSize, lineHeight: dateLine, color: palette.muted}));
      if (heading) atoms.push(space(px(4)));
    }
    if (heading || (!timeline && dates)) {
      if (datesBelow) {
        if (heading) atoms.push(...lines(heading, available, {font: strongFont, size: entrySize, lineHeight: entryLine}));
        if (dates) {
          if (heading) atoms.push(space(px(2)));
          atoms.push(...lines(dates, available, {font: 'regular', size: dateSize, lineHeight: dateLine, color: palette.muted}));
        }
      } else if (heading && dates && !timeline) {
        const gap = px(14);
        const dateSlack = ['linen', 'index', 'outline', 'letter', 'journal', 'edge', 'form'].includes(variant) ? px(.25) : 0;
        const dateWidth = Math.min(available * .36, measure(dates, 'regular', dateSize) + dateSlack);
        const headingWidth = Math.max(available * .5, available - dateWidth - gap);
        const dateX = headingWidth + gap;
        const headingLines = wrap(heading, headingWidth, strongFont, entrySize);
        const dateLines = wrap(dates, available - dateX, 'regular', dateSize);
        for (let index = 0; index < Math.max(headingLines.length, dateLines.length); index++) {
          const specs = [];
          if (index < headingLines.length) specs.push({value: headingLines[index], x: 0, width: headingWidth,
            font: strongFont, size: entrySize, color: ink, align: 'left'});
          if (index < dateLines.length) specs.push({value: dateLines[index], x: dateX, width: available - dateX,
            font: 'regular', size: dateSize, color: palette.muted, align: 'right'});
          atoms.push({height: Math.max(entryLine, dateLine), lines: specs});
        }
      } else if (heading) atoms.push(...lines(heading, available, {font: strongFont, size: entrySize, lineHeight: entryLine}));
      else atoms.push(...lines(dates, available, {font: 'regular', size: dateSize, lineHeight: dateLine,
        color: palette.muted, align: 'right'}));
    }
    if (organization) {
      if (heading || dates) atoms.push(space(px(variant === 'compact' ? 2 : 3)));
      const orgSize = Math.max(9, px(metrics.textSize - .7));
      atoms.push(...lines(organization, available, {size: orgSize, lineHeight: orgSize * 1.5, color: palette.muted}));
      if (details) atoms.push(space(px(variant === 'compact' ? 4 : 6)));
    } else if ((heading || dates) && details) atoms.push(space(px(3)));
    const prefixHeight = sumHeight(atoms);
    if (details) atoms.push(...lines(details, available));
    if (!atoms.length) return [];
    const first = atoms.find(atom => !atom.space && !atom.divider) || atoms[0];
    atoms[0].group = {height: sumHeight(atoms), keep: Math.min(prefixHeight + (details ? bodyHeight : 0), bodyHeight * 4)};
    if (timeline) {
      for (const atom of atoms) atom.timeline = true;
      first.timelineDot = true;
    }
    return atoms;
  }

  function buildSection(key, available) {
    const heading = sectionHeading(key, available);
    const panel = variant === 'journal' && key === 'summary';
    const framed = variant === 'form';
    const inset = framed ? px(15) : panel ? px(14) : variant === 'folio' ? px(12) : variant === 'timeline' && entryKeys.has(key) ? px(22) : 0;
    const contentWidth = available - inset * (panel || framed ? 2 : 1);
    const content = [];
    if (entryKeys.has(key)) {
      const rows = Array.isArray(cv[key]) ? cv[key].filter(row => row && typeof row === 'object' &&
        ['heading', 'organization', 'location', 'dates', 'details'].some(field => text(row[field]))) : [];
      rows.forEach((row, index) => {
        if (index) content.push(space(px(metrics.entryGap)));
        content.push(...entryAtoms(row, contentWidth, variant === 'timeline', index === 0));
      });
    } else if (key === 'skills') {
      const items = list(cv.skills);
      if (items.length) content.push(...lines(items.map(item => `• ${item}`).join('   '), contentWidth));
    } else if (key === 'languages') {
      list(cv.languages).forEach((value, index) => {
        if (index) content.push(space(px(7)));
        const level = Math.max(0, Math.min(5, Math.round(Number(cv.languageLevels?.[index]) || 0)));
        const dotsWidth = level ? px(46) : 0;
        const valueAtoms = lines(value, contentWidth - (dotsWidth ? dotsWidth + px(12) : 0));
        if (level) valueAtoms[0].dots = {level, x: contentWidth - dotsWidth, size: px(6), gap: px(4)};
        valueAtoms[0].group = {height: sumHeight(valueAtoms), keep: bodyHeight};
        content.push(...valueAtoms);
      });
    } else if (text(cv[key])) content.push(...lines(text(cv[key]), contentWidth,
      panel ? {color: readableColor(palette.panelInk, palette.panelBackground)} : {}));
    return content.some(atom => atom.lines?.some(line => line.value)) ? {
      key, heading, content, inset, width: available, panel, framed,
      contentPaddingTop: panel ? px(14) : 0,
      contentPaddingBottom: panel || framed ? px(14) : 0
    } : null;
  }

  const headerBoxes = [];
  const photo = safePhoto(cv.photo);
  let cursor = {page: 0, y: top};
  function planHeader() {
    const name = text(cv.name), title = text(cv.title);
    const contactValues = [cv.email, cv.phone, cv.city, cv.link].map(text).filter(Boolean);
    const contact = contactValues.join('  •  ');
    if (!name && !title && !contact && !photo) return;
    const stacked = ['classic', 'rose', 'form'].includes(variant);
    const photoWidth = px(variant === 'compact' ? 53 : ['classic', 'form'].includes(variant) ? 58 : variant === 'editorial' ? 62 : 66);
    const photoHeight = px(variant === 'compact' ? 62 : ['classic', 'form'].includes(variant) ? 68 : variant === 'editorial' ? 80 : variant === 'rose' ? 66 : 76);
    const photoGap = px(variant === 'compact' ? 16 : variant === 'editorial' ? 17 : 22);
    const align = metrics.headerAlign;
    const boxX = variant === 'slate' ? 0 : left;
    const boxWidth = variant === 'slate' ? pdf.page.width : width;
    const padX = px(variant === 'slate' ? metrics.paddingInline : variant === 'editorial' ? 22 : variant === 'rose' ? 25 : 0);
    const padTop = px(variant === 'slate' ? metrics.paddingTop : variant === 'editorial' ? 23 : variant === 'rose' ? 24 : variant === 'timeline' ? 4 : 0);
    const padBottom = px(metrics.headerPaddingBottom ?? (variant === 'slate' ? 27 : variant === 'editorial' ? 22 : variant === 'rose' ? 23 :
      variant === 'classic' || variant === 'margin' ? 20 : variant === 'line' ? 18 : variant === 'folio' ? 19 : variant === 'neutral' ? 22 : variant === 'timeline' ? 4 : 0));
    const borderBottom = px(variant === 'slate' ? 5 : variant === 'rose' || variant === 'neutral' ? 2 :
      ['index', 'journal'].includes(variant) ? 3 :
      ['classic', 'line', 'folio', 'margin', 'editorial', 'linen', 'outline', 'form'].includes(variant) ? 1 : 0);
    const timelineInset = variant === 'timeline' ? px(17) : 0;
    const innerX = boxX + padX + timelineInset;
    const innerWidth = boxWidth - padX * 2 - timelineInset;
    const textX = innerX + (photo && !stacked && variant === 'neutral' ? photoWidth + photoGap : 0);
    const textWidth = innerWidth - (photo && !stacked ? photoWidth + photoGap : 0);
    const identityWidth = variant === 'letter' ? (textWidth - px(22)) * .6 : textWidth;
    const atoms = [];
    if (name) atoms.push(...lines(['index', 'outline', 'journal', 'form'].includes(variant) ? name.toUpperCase() : name,
      identityWidth, {font: bodyFont === 'serif' ? 'serif' : ['neutral', 'outline'].includes(variant) ? 'regular' : 'bold',
      size: px(metrics.nameSize), lineHeight: px(metrics.nameSize) * (variant === 'editorial' ? 1.07 : variant === 'linen' ? 1.2 : 1.16),
      characterSpacing: px(metrics.nameSize * ({linen: .01, index: .045, outline: .055, letter: -.035, journal: .045, edge: -.04, form: .075}[variant] || 0)),
      align, color: readableColor(palette.headerHeading, palette.headerBackground)}));
    if (title) {
      if (name) atoms.push(space(px(metrics.titleMargin ?? (variant === 'compact' ? 4 : variant === 'editorial' ? 11 : variant === 'rose' ? 10 : 8))));
      const size = px(metrics.titleSize ?? (['editorial', 'rose'].includes(variant) ? 11 : variant === 'folio' ? 14 :
        variant === 'classic' ? 13 : ['compact', 'neutral', 'slate', 'timeline'].includes(variant) ? 12 : metrics.textSize + 1));
      const titleFont = ['editorial', 'rose', 'linen'].includes(variant) ? 'regular' : bodyFont;
      const titleText = ['editorial', 'rose', 'slate', 'neutral', 'linen', 'index', 'edge', 'form'].includes(variant) ? title.toUpperCase() : title;
      if (variant === 'edge') {
        const tagLines = lines(titleText, identityWidth - px(18), {font: titleFont, size: Math.max(9, size),
          lineHeight: size * 1.45, x: px(9), color: readableColor(palette.panelInk, palette.panelBackground)});
        const tagWidth = Math.min(identityWidth, Math.max(...tagLines.map(atom => measure(atom.lines[0].value, titleFont, size))) + px(18));
        atoms.push(...[space(px(5)), ...tagLines, space(px(5))].map(atom => ({...atom, tagWidth})));
      } else atoms.push(...lines(titleText, identityWidth, {font: titleFont, size: Math.max(9, size), lineHeight: size * 1.45, align,
        color: readableColor(variant === 'margin' ? palette.headerHeading : palette.headerInk, palette.headerBackground)}));
    }
    function contacts(columns, available, offsetX = 0, contactAlign = align, rowGap = 4) {
      const size = Math.max(9, px(metrics.contactSize ?? 10));
      const columnGap = px(18), columnWidth = (available - columnGap * (columns - 1)) / columns;
      const result = [];
      for (let first = 0; first < contactValues.length; first += columns) {
        if (first) result.push(space(px(rowGap)));
        const values = contactValues.slice(first, first + columns).map(value => wrap(value, columnWidth, 'regular', size));
        for (let line = 0; line < Math.max(...values.map(value => value.length)); line++) {
          const specs = [];
          values.forEach((value, column) => {
            if (line < value.length) specs.push({value: value[line], x: offsetX + column * (columnWidth + columnGap),
              width: columnWidth, font: 'regular', size, color: readableColor(palette.headerMuted, palette.headerBackground), align: contactAlign});
          });
          result.push({height: size * 1.5, lines: specs});
        }
      }
      return result;
    }
    if (contact) {
      if (variant === 'letter') {
        const rightAtoms = [space(px(4)), ...contacts(1, textWidth - identityWidth - px(22), identityWidth + px(22), 'right', 5)];
        const totalHeight = Math.max(sumHeight(atoms), sumHeight(rightAtoms));
        if (totalHeight <= bottom - top - padTop - padBottom - borderBottom) {
          const positioned = [];
          for (const column of [atoms, rightAtoms]) {
            let y = 0;
            for (const atom of column) { positioned.push(...(atom.lines || []).map(line => ({...line, offsetY: y}))); y += atom.height; }
          }
          atoms.splice(0, atoms.length, {height: totalHeight, lines: positioned});
        } else {
          // Extremely long letterheads keep the columns while allowing each
          // row to break safely at a page boundary.
          const leftAtoms = [...atoms]; atoms.length = 0;
          for (let row = 0; row < Math.max(leftAtoms.length, rightAtoms.length); row++) {
            atoms.push({height: Math.max(leftAtoms[row]?.height || 0, rightAtoms[row]?.height || 0),
              lines: [...(leftAtoms[row]?.lines || []), ...(rightAtoms[row]?.lines || [])]});
          }
        }
      } else {
        if (name || title) atoms.push(space(px(metrics.contactMargin ?? (variant === 'compact' ? 8 : ['editorial', 'slate'].includes(variant) ? 16 : variant === 'rose' ? 13 : 12))));
        if (variant === 'linen') atoms.push(...contacts(1, textWidth, 0, 'left', 3));
        else if (['outline', 'journal'].includes(variant)) atoms.push(...contacts(2, textWidth));
        else {
          const size = Math.max(9, px(metrics.contactSize ?? (['editorial', 'rose'].includes(variant) ? 9.5 : 10)));
          atoms.push(...lines(contact, textWidth, {font: 'regular', size, lineHeight: size * 1.5, align,
            color: readableColor(palette.headerMuted, palette.headerBackground)}));
        }
      }
    }
    let index = 0, first = true;
    // Header fields can themselves be longer than a page; keep every line.
    do {
      const y = variant === 'slate' && first ? 0 : cursor.y;
      const stackedHeight = photo && first && stacked ? photoHeight + px(variant === 'rose' ? 15 : 14) : 0;
      const available = bottom - y - padTop - padBottom - borderBottom - stackedHeight;
      let end = index, textHeight = 0;
      while (end < atoms.length && textHeight + atoms[end].height <= available + .001) {
        textHeight += atoms[end].height; end++;
      }
      if (end === index && index < atoms.length) { cursor = {page: cursor.page + 1, y: top}; continue; }
      const slice = atoms.slice(index, end);
      const identityHeight = Math.max(textHeight, photo && first && !stacked ? photoHeight : 0);
      const height = padTop + stackedHeight + identityHeight + padBottom + borderBottom;
      const identityY = y + padTop + stackedHeight + (identityHeight - textHeight) / 2;
      const photoX = stacked ? boxX + (boxWidth - photoWidth) / 2 : variant === 'neutral' ? innerX : innerX + innerWidth - photoWidth;
      const photoY = stacked || ['linen', 'letter'].includes(variant) ? y + padTop : y + padTop + (identityHeight - photoHeight) / 2;
      headerBoxes.push({page: cursor.page, x: boxX, y, width: boxWidth, height, atoms: slice,
        textX, textY: identityY, photo: photo && first ? {buffer: photo, x: photoX, y: photoY, width: photoWidth, height: photoHeight} : null,
        borderBottom});
      index = end; first = false;
      cursor.y = y + height + px(metrics.headerGap);
      if (index < atoms.length) cursor = {page: cursor.page + 1, y: top};
    } while (index < atoms.length || first);
  }
  planHeader();

  const requestedOrder = Array.isArray(layout.order) ? layout.order : [];
  const order = [...new Set([...requestedOrder.filter(key => DEFAULT_ADDITIONAL_SECTION_ORDER.includes(key)), ...template.sectionOrder])];
  const gap = px(23), halfWidth = (width - gap) / 2;
  const sections = order.map(key => buildSection(key, layout.columns === 'two' && layout.widths?.[key] === 'half' ? halfWidth : width)).filter(Boolean);
  if (variant === 'index') sections.forEach((section, index) => { section.heading = sectionHeading(section.key, section.width, index + 1); });
  const chunks = [];
  function nextPage(position) { return {page: position.page + 1, y: top}; }

  function planSection(section, start, x) {
    let position = {...start}, index = 0;
    const atoms = section.content;
    const headingHeight = section.heading.height;
    const contentPadding = section.contentPaddingTop + section.contentPaddingBottom;
    const freshContentHeight = pageCapacity - headingHeight - contentPadding;
    while (index < atoms.length) {
      while (index < atoms.length && atoms[index].space) index++;
      if (index >= atoms.length) break;
      const first = atoms[index];
      const minimum = first.group && first.group.height <= freshContentHeight ? first.group.height :
        Math.min(first.group?.keep || first.height, freshContentHeight);
      if (bottom - position.y < headingHeight + contentPadding + Math.max(first.height, minimum)) position = nextPage(position);
      const available = bottom - position.y - headingHeight - contentPadding;
      let end = index, used = 0;
      while (end < atoms.length) {
        const atom = atoms[end];
        if (end > index && atom.group && atom.group.height <= freshContentHeight && used + atom.group.height > available + .001) break;
        if (used + atom.height > available + .001) break;
        used += atom.height; end++;
      }
      // A normal text line always fits a fresh A4 page. This fallback also
      // handles unusually small caller page sizes without losing the atom.
      if (end === index) { end++; used = atoms[index].height; }
      while (end > index && atoms[end - 1].space) { used -= atoms[end - 1].height; end--; }
      if (end === index) { index++; continue; }
      chunks.push({page: position.page, x, y: position.y, section, atoms: atoms.slice(index, end), height: headingHeight + contentPadding + used});
      index = end;
      position.y += headingHeight + contentPadding + used;
      if (index < atoms.length) position = nextPage(position);
    }
    position.y += px(metrics.sectionGap);
    return position;
  }

  const later = (a, b) => a.page > b.page || a.page === b.page && a.y > b.y ? a : b;
  for (let index = 0; index < sections.length; index++) {
    const section = sections[index];
    const half = layout.columns === 'two' && layout.widths?.[section.key] === 'half';
    if (half) {
      const start = {...cursor};
      const firstEnd = planSection(section, start, left);
      const next = sections[index + 1];
      if (next && layout.widths?.[next.key] === 'half') {
        const secondEnd = planSection(next, start, left + halfWidth + gap);
        cursor = {...later(firstEnd, secondEnd)}; index++;
      } else cursor = firstEnd;
    } else cursor = planSection(section, cursor, left);
  }

  function drawLine(line, x, y) {
    if (!line.value) return;
    let offset = 0;
    if (line.align === 'right') offset = line.width - measure(line.value, line.font, line.size, line.characterSpacing || 0);
    else if (line.align === 'center') offset = (line.width - measure(line.value, line.font, line.size, line.characterSpacing || 0)) / 2;
    const settings = {lineBreak: false};
    if (line.characterSpacing) settings.characterSpacing = line.characterSpacing;
    pdf.font(line.font).fontSize(line.size).fillColor(line.color).text(line.value, x + line.x + Math.max(0, offset), y + (line.offsetY || 0), settings);
  }

  function paintPage() {
    pdf.rect(0, 0, pdf.page.width, pdf.page.height).fill(palette.background);
    if (variant === 'line') pdf.rect(0, 0, pdf.page.width, px(6)).fill(palette.accent);
    if (variant === 'margin') pdf.rect(0, 0, px(10), pdf.page.height).fill(palette.accent);
    if (variant === 'edge') pdf.rect(pdf.page.width - px(8), 0, px(8), pdf.page.height).fill(palette.accent);
    if (variant === 'outline') pdf.rect(px(18), px(18), pdf.page.width - px(36), pdf.page.height - px(36)).lineWidth(px(1)).strokeColor(palette.secondary).stroke();
  }

  function drawHeader(box) {
    if (['slate', 'rose'].includes(variant)) pdf.rect(box.x, box.y, box.width, box.height).fill(palette.headerBackground);
    if (variant === 'editorial') {
      pdf.rect(box.x, box.y, box.width, box.height).lineWidth(px(1)).strokeColor(palette.secondary).stroke();
      pdf.rect(box.x, box.y, box.width, px(4)).fill(palette.accent);
    }
    if (variant === 'timeline') pdf.rect(box.x, box.y, px(3), box.height).fill(palette.accent);
    if (box.borderBottom) {
      const color = variant === 'slate' ? palette.secondary : ['rose', 'journal'].includes(variant) ? palette.accent : palette.rule;
      if (variant === 'index') {
        pdf.rect(box.x, box.y + box.height - box.borderBottom, box.width, px(1)).fill(color);
        pdf.rect(box.x, box.y + box.height - px(1), box.width, px(1)).fill(color);
      } else pdf.rect(box.x, box.y + box.height - box.borderBottom, box.width, box.borderBottom).fill(color);
    }
    let y = box.textY;
    for (const atom of box.atoms) {
      if (atom.tagWidth) pdf.rect(box.textX, y, atom.tagWidth, atom.height).fill(palette.panelBackground);
      for (const line of atom.lines || []) drawLine(line, box.textX, y);
      y += atom.height;
    }
    if (box.photo) {
      const image = box.photo;
      try {
        pdf.save();
        if (variant === 'rose') pdf.circle(image.x + image.width / 2, image.y + image.height / 2, image.width / 2).clip();
        else pdf.rect(image.x, image.y, image.width, image.height).clip();
        const inset = ['slate', 'outline'].includes(variant) ? px(3) : 0;
        pdf.image(image.buffer, image.x + inset, image.y + inset, {
          cover: [image.width - inset * 2, image.height - inset * 2], align: 'center', valign: 'center'
        });
        pdf.restore();
        if (variant === 'rose') pdf.circle(image.x + image.width / 2, image.y + image.height / 2, image.width / 2 - px(1)).lineWidth(px(2)).strokeColor(palette.secondary).stroke();
        if (['slate', 'outline'].includes(variant)) pdf.rect(image.x, image.y, image.width, image.height).lineWidth(px(1)).strokeColor(palette.secondary).stroke();
      } catch { pdf.restore(); }
    }
  }

  function drawSection(chunk) {
    const {section, x} = chunk;
    const heading = section.heading;
    if (section.panel) pdf.rect(x, chunk.y + heading.height, section.width, chunk.height - heading.height).fill(palette.panelBackground);
    if (section.framed) pdf.rect(x, chunk.y, section.width, chunk.height).lineWidth(px(1)).strokeColor(palette.rule).stroke();
    if (heading.treatment === 'outline') pdf.rect(x, chunk.y, section.width, heading.decorationHeight + px(1)).lineWidth(px(1)).strokeColor(palette.secondary).stroke();
    if (heading.treatment === 'box') pdf.rect(x, chunk.y + heading.decorationHeight, section.width, px(1)).fill(palette.rule);
    if (heading.treatment === 'overline') pdf.rect(x, chunk.y, section.width, px(1)).fill(palette.secondary);
    if (heading.treatment === 'journal') pdf.rect(x, chunk.y, px(29), px(2)).fill(palette.secondary);
    if (heading.treatment === 'dash-title') pdf.rect(x, chunk.y + heading.textHeight / 2, px(24), px(1)).fill(palette.secondary);
    if (heading.treatment === 'band') pdf.rect(x, chunk.y, section.width, heading.decorationHeight).fill(palette.panelBackground);
    if (heading.treatment === 'left-rule') pdf.rect(x - px(14), chunk.y, px(3), heading.decorationHeight).fill(palette.secondary);
    if (['rule', 'editorial'].includes(heading.treatment)) pdf.rect(x, chunk.y + heading.decorationHeight, section.width, px(1)).fill(palette.rule);
    if (heading.treatment === 'short-rule') pdf.rect(x, chunk.y + heading.decorationHeight - px(2), px(38), px(2)).fill(palette.secondary);
    if (heading.treatment === 'paired-rules') {
      const firstLine = heading.atoms.find(atom => atom.lines)?.lines[0];
      const labelWidth = Math.min(section.width, measure(firstLine?.value || '', firstLine?.font || 'bold', heading.size));
      const ruleWidth = Math.min(px(34), Math.max(px(10), (section.width - labelWidth - px(24)) / 2));
      const labelX = x + (section.width - labelWidth) / 2;
      const ruleY = chunk.y + heading.textHeight / 2;
      pdf.moveTo(labelX - px(12) - ruleWidth, ruleY).lineTo(labelX - px(12), ruleY).lineWidth(px(1)).strokeColor(palette.secondary).stroke();
      pdf.moveTo(labelX + labelWidth + px(12), ruleY).lineTo(labelX + labelWidth + px(12) + ruleWidth, ruleY).stroke();
    }
    let y = chunk.y;
    for (const atom of heading.atoms) { for (const line of atom.lines || []) drawLine(line, x, y); y += atom.height; }
    y += section.contentPaddingTop;
    const contentX = x + section.inset;
    for (const atom of chunk.atoms) {
      if (atom.timeline) {
        const railX = x + px(4);
        pdf.moveTo(railX, y).lineTo(railX, y + atom.height).lineWidth(px(1)).strokeColor(palette.rule).stroke();
        if (atom.timelineDot) pdf.circle(railX, y + px(8.5), px(3.5)).lineWidth(px(2)).fillAndStroke(palette.background, palette.marker);
      }
      if (atom.divider) pdf.moveTo(contentX, y).lineTo(x + section.width, y).lineWidth(px(1)).strokeColor(palette.rule).stroke();
      for (const line of atom.lines || []) drawLine(line, contentX, y);
      if (atom.dots) {
        const dots = atom.dots;
        for (let index = 0; index < 5; index++) {
          const dotX = contentX + dots.x + index * (dots.size + dots.gap) + dots.size / 2;
          const dotY = y + bodyHeight / 2;
          pdf.circle(dotX, dotY, dots.size / 2).lineWidth(px(1));
          if (index < dots.level) pdf.fillAndStroke(palette.marker, palette.marker); else pdf.strokeColor(palette.marker).stroke();
        }
      }
      y += atom.height;
    }
  }

  const lastPage = Math.max(0, ...headerBoxes.map(box => box.page), ...chunks.map(chunk => chunk.page));
  for (let page = 0; page <= lastPage; page++) {
    if (page) pdf.addPage();
    paintPage();
    for (const box of headerBoxes.filter(box => box.page === page)) drawHeader(box);
    for (const chunk of chunks.filter(chunk => chunk.page === page).sort((a, b) => a.y - b.y || a.x - b.x)) drawSection(chunk);
  }
  pdf.x = left;
  pdf.y = Math.min(bottom, cursor.y);
  return true;
}
