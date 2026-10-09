import {strings} from './i18n.js';
"use strict";
// Scalable photo placeholder used only in fictional sample profiles.
const EXAMPLE_PHOTO='data:image/svg+xml;charset=utf-8,'+encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 180 210"><defs><linearGradient id="bg" x2="1" y2="1"><stop stop-color="#edf1ef"/><stop offset="1" stop-color="#ced9d3"/></linearGradient></defs><rect width="180" height="210" rx="12" fill="url(#bg)"/><rect x="9" y="9" width="162" height="192" rx="8" fill="none" stroke="#82998e" stroke-opacity=".5"/><circle cx="90" cy="77" r="30" fill="#82998e"/><path d="M32 187c0-43 23-68 58-68s58 25 58 68" fill="#82998e"/><path d="M18 28v-10h10m124 0h10v10M18 182v10h10m124 0h10v-10" fill="none" stroke="#506c5e" stroke-width="2"/></svg>');
const examplePhotoForStyle=style=>['basic','ats','modern','creative','minimal','professional','elegant','tech'].includes(style)?EXAMPLE_PHOTO:'';

  const PREMIUM_STYLE_IDS = [
    "executive-gold",
    "midnight-modern",
    "atelier",
    "pure-signature",
    "architectural",
    "monaco",
    "swiss-grid",
    "emerald-prestige"
  ];
  const sectionKeys = [
    "experience",
    "education",
    "projects",
    "awards",
    "volunteer",
    "certifications"
  ];

  function renderPremiumCv(id, d, l, esc, options = {}) {
    if (!PREMIUM_STYLE_IDS.includes(id)) return "";
    d = d || {};
    l = l || {};
    esc = typeof esc === "function" ? esc : function (value) {
      return String(value == null ? "" : value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
    };

    const text = value => value == null ? "" : String(value).trim();
    const safe = value => esc(text(value));
    const br = value => safe(value).replace(/\r?\n/g, "<br>");
    const label = key => safe(l[key]);
    const has = value => text(value).length > 0;
    const asList = value => text(value).split(/\n|,| · /).map(item => item.trim()).filter(Boolean);

    const photo = has(d.photo)
      ? `<img class="premium-photo" src="${safe(d.photo)}" alt="" loading="lazy">`
      : "";
    const name = has(d.name) ? `<h2 class="premium-name">${safe(d.name)}</h2>` : "";
    const title = has(d.title) ? `<p class="premium-title">${safe(d.title)}</p>` : "";
    const contacts = [
      ["email", d.email],
      ["phone", d.phone],
      ["city", d.city],
      ["link", d.link]
    ].filter(([, value]) => has(value));
    const contactMarkup = contacts.length
      ? `<ul class="premium-contact" aria-label="${safe(l.contact || l.contacts)}">${contacts.map(([, value]) => `<li>${safe(value)}</li>`).join("")}</ul>`
      : "";

    const orderedKeys = Array.isArray(options.order)
      ? [...options.order.filter(key => ["summary", ...sectionKeys, "skills", "languages"].includes(key)), ...["summary", ...sectionKeys, "skills", "languages"].filter(key => !options.order.includes(key))]
      : ["summary", ...sectionKeys, "skills", "languages"];
    const columnsClass = options.columns === "two" ? " premium-two-columns" : "";
    function section(key, contents, className) {
      if (!contents) return "";
      const widthClass = options.columns === "two" && options.widths?.[key] === "half" ? " premium-half" : "";
      return `<section class="premium-section ${className || ""}${widthClass}" data-cv-section="${key}"><h3>${label(key)}</h3>${contents}</section>`;
    }

    function paragraph(key, value, className) {
      if (!has(value)) return "";
      return section(key, `<p class="premium-copy">${br(value)}</p>`, className);
    }

    function entries(key) {
      const rows = Array.isArray(d[key]) ? d[key] : [];
      const markup = rows.map(row => {
        if (!row || !Object.values(row).some(has)) return "";
        const heading = has(row.heading) ? `<h4>${safe(row.heading)}</h4>` : "";
        const dates = has(row.dates) ? `<span class="premium-dates">${safe(row.dates)}</span>` : "";
        const orgParts = [row.organization, row.location].filter(has).map(safe);
        const org = orgParts.length ? `<p class="premium-org">${orgParts.join(" <span aria-hidden=\"true\">·</span> ")}</p>` : "";
        const details = has(row.details) ? `<p class="premium-copy">${br(row.details)}</p>` : "";
        return `<article class="premium-entry"><div class="premium-entry-top">${heading}${dates}</div>${org}${details}</article>`;
      }).join("");
      return section(key, markup, `premium-${key}`);
    }

    function skillsMarkup() {
      if (!has(d.skills)) return "";
      const items = asList(d.skills);
      const content = items.length
        ? `<ul class="premium-skill-list">${items.map(item => `<li>${safe(item)}</li>`).join("")}</ul>`
        : `<p class="premium-copy">${br(d.skills)}</p>`;
      return section("skills", content, "premium-skills");
    }

    function languagesMarkup() {
      if (!has(d.languages)) return "";
      const lines = asList(d.languages);
      const content = `<ul class="premium-language-list">${lines.map((language, index) => {
        const level = Math.max(0, Math.min(5, Number(d.languageLevels && d.languageLevels[index]) || 0));
        const dots = Array.from({ length: 5 }, (_, i) =>
          `<i${i < level ? ' class="is-filled"' : ""} aria-hidden="true"></i>`
        ).join("");
        return `<li><span>${safe(language)}</span>${level ? `<span class="premium-language-level" aria-label="${level} / 5">${dots}</span>` : ""}</li>`;
      }).join("")}</ul>`;
      return section("languages", content, "premium-languages");
    }

    const blocks = {summary:paragraph("summary", d.summary, "premium-summary"),skills:skillsMarkup(),languages:languagesMarkup()};
    sectionKeys.forEach(key => { blocks[key] = entries(key); });
    const identity = `${photo}${name}${title}${contactMarkup}`;
    const hasRail = ["midnight-modern", "atelier", "emerald-prestige"].includes(id);
    const defaultSide = id === "atelier" ? ["summary", "skills", "languages"] : ["skills", "languages"];
    const isSide = key => hasRail && (options.placements?.[key] === "side" || (options.placements?.[key] !== "main" && defaultSide.includes(key)));
    const sideContent = orderedKeys.filter(isSide).map(key => blocks[key]).join("");
    const mainContent = orderedKeys.filter(key => !isSide(key)).map(key => blocks[key]).join("");
    let layout;

    switch (id) {
      case "executive-gold":
        layout = `<div class="premium-gold-frame"><header class="premium-head premium-head-centered">${identity}</header><main class="premium-main${columnsClass}">${mainContent}</main></div>`;
        break;
      case "midnight-modern":
        layout = `<header class="premium-head premium-head-midnight">${photo}<div class="premium-identity">${name}${title}${contactMarkup}</div></header><div class="premium-columns"><aside class="premium-rail">${sideContent}</aside><main class="premium-main${columnsClass}">${mainContent}</main></div>`;
        break;
      case "atelier":
        layout = `<div class="premium-columns premium-columns-atelier"><aside class="premium-rail">${photo}${sideContent}</aside><main class="premium-main${columnsClass}"><header class="premium-head premium-head-atelier"><div class="premium-portrait-mark">${photo ? "" : `<span aria-hidden="true"></span>`}</div><div class="premium-identity">${name}${title}${contactMarkup}</div></header>${mainContent}</main></div>`;
        break;
      case "pure-signature":
        layout = `<header class="premium-head premium-head-pure">${photo}<div class="premium-identity">${name}${title}${contactMarkup}</div></header><main class="premium-main${columnsClass}">${mainContent}</main>`;
        break;
      case "architectural":
        layout = `<div class="premium-architectural-wrap"><header class="premium-head premium-head-architectural">${photo}<div class="premium-identity">${name}${title}${contactMarkup}</div></header><main class="premium-main${columnsClass}">${mainContent}</main></div>`;
        break;
      case "monaco":
        layout = `<header class="premium-head premium-head-monaco">${photo}<div class="premium-monaco-plaque">${name}${title}${contactMarkup}</div></header><main class="premium-main${columnsClass}">${mainContent}</main>`;
        break;
      case "swiss-grid":
        layout = `<header class="premium-head premium-head-swiss"><div class="premium-swiss-id">${name}${title}</div>${photo}<div class="premium-swiss-contact">${contactMarkup}</div></header><main class="premium-main${columnsClass}">${mainContent}</main>`;
        break;
      case "emerald-prestige":
        layout = `<div class="premium-columns premium-columns-emerald"><aside class="premium-rail">${photo}${contactMarkup}${sideContent}</aside><main class="premium-main${columnsClass}"><header class="premium-head premium-head-emerald">${name}${title}</header>${mainContent}</main></div>`;
        break;
      default:
        layout = `<header class="premium-head">${identity}</header><main class="premium-main">${mainContent}</main>`;
    }

    return `<article class="cv-paper premium-cv premium-${id}" aria-label="${safe(d.name || l.resume || l.cv)}">${layout}</article>`;
  }

const PREMIUM_STYLE_MAP = Object.freeze({
  executive: "executive-gold",
  modern: "midnight-modern",
  creative: "atelier",
  minimal: "pure-signature",
  professional: "architectural",
  compact: "monaco",
  elegant: "swiss-grid",
  tech: "emerald-prestige"
});

const featured = [
  ["executive-gold", "executive", "finance", "#b59a62", "Vezetői elegancia", "Executive elegance"],
  ["midnight-modern", "modern", "developer", "#263d39", "Kortárs, erős megjelenés", "Bold contemporary layout"],
  ["atelier", "creative", "marketing", "#a9beb3", "Kreatív szerkesztőségi stílus", "Creative editorial style"],
  ["pure-signature", "minimal", "support", "#b6a789", "Letisztult, személyes", "Personal and understated"],
  ["architectural", "professional", "project", "#ad7556", "Határozott szerkezet", "Confident structure"],
  ["monaco", "compact", "graduate", "#233f57", "Időtlen kék és arany", "Timeless navy and gold"],
  ["swiss-grid", "elegant", "electrician", "#b62f33", "Karakteres tipográfia", "Expressive typography"],
  ["emerald-prestige", "tech", "emerald-director", "#23564b", "Smaragdzöld prémium", "Emerald refinement"],
  ["monaco-care", "compact", "nurse", "#233f57", "Átlátható minta egészségügyi pályázathoz", "A clear example for healthcare applications"]
];

function buildFeaturedExamples(lang, originals) {
  const hu = lang === "hu";
  return featured.map(([id, style, source, accent, noteHu, noteEn], index) => {
    const base = originals.find(example => example.id === source);
    if (!base) throw new Error(`Missing source CV example: ${source}`);
    const label = id.split("-").map(word => word[0].toUpperCase() + word.slice(1)).join(" ");
    return {
      id: `premium-${id}`,
      style,
      accent,
      category: `${String(index + 1).padStart(2, "0")} / ${hu ? "PRÉMIUM" : "PREMIUM"}`,
      label,
      note: hu ? noteHu : lang === "en" ? noteEn : strings[lang].editDesc,
      result: hu ? "Szerkeszthető CV-sablon" : lang === "en" ? "Editable CV template" : strings[lang].preview,
      cv: { ...base.cv, photo:examplePhotoForStyle(style) }
    };
  });
}

export { examplePhotoForStyle, PREMIUM_STYLE_IDS, PREMIUM_STYLE_MAP, renderPremiumCv, buildFeaturedExamples };
