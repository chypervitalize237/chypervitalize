import assert from 'node:assert/strict';
import {locales,strings} from './public/i18n.js';
import {getCvExamples} from './public/cv-examples.js';
import {buildFeaturedExamples,renderPremiumCv,PREMIUM_STYLE_MAP} from './public/premium-templates.js';
for(const lang of Object.keys(locales)){
 const originals=getCvExamples(lang),all=[...buildFeaturedExamples(lang,originals),...originals];assert.equal(all.length,19);
 for(const e of all){assert(e.cv.title);assert(e.cv.summary);assert(e.cv.skills);assert(e.cv.languages);if(PREMIUM_STYLE_MAP[e.style]){const html=renderPremiumCv(PREMIUM_STYLE_MAP[e.style],e.cv,strings[lang],s=>String(s));assert(html.includes(e.cv.title));assert(html.includes(strings[lang].experience));assert(!html.includes('undefined'));}}
 if(!['hu','en'].includes(lang)){assert.notEqual(originals[0].cv.title,getCvExamples('en')[0].cv.title);assert.notEqual(originals[0].cv.summary,getCvExamples('en')[0].cv.summary);}
 assert.deepEqual(getCvExamples(lang),originals);
}
console.log('PASS: all 21 languages, all 19 examples, localized content and section headings, stable data and premium rendering.');
