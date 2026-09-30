import {locales,strings} from './i18n.js?v=20260925-prices';
import {fieldExample} from './examples.js';
import {getCvExamples as getOriginalCvExamples} from './cv-examples.js?v=20260930-release2';
import {PREMIUM_STYLE_MAP,renderPremiumCv,buildFeaturedExamples} from './premium-templates.js?v=20260930-release2';
function getCvExamples(lang){const existing=getOriginalCvExamples(lang);return [...buildFeaturedExamples(lang,existing),...existing];}
function getCvExample(id,lang){return getCvExamples(lang).find(x=>x.id===id);}
const $=s=>document.querySelector(s),esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const sections=['personal','summary','experience','education','skills','languages','projects','awards','volunteer','certifications'];
const blank={name:'',title:'',email:'',phone:'',city:'',link:'',summary:'',skills:'',languages:'',languageLevels:[5],photo:'',experience:[],education:[],projects:[],awards:[],volunteer:[],certifications:[]};
const layoutKeys=['summary','experience','education','projects','awards','volunteer','certifications','skills','languages'];
const validHex=v=>/^#[0-9a-f]{6}$/i.test(String(v||''));
function normalizeLayout(raw){
 const input=raw&&typeof raw==='object'?raw:{};
 const order=Array.isArray(input.order)?input.order.filter((key,index,list)=>layoutKeys.includes(key)&&list.indexOf(key)===index):[];
 const widths=input.widths&&typeof input.widths==='object'?input.widths:{};
 const placements=input.placements&&typeof input.placements==='object'?input.placements:{};
 return {order:[...order,...layoutKeys.filter(key=>!order.includes(key))],widths:Object.fromEntries(layoutKeys.map(key=>[key,widths[key]==='half'?'half':'full'])),placements:Object.fromEntries(layoutKeys.filter(key=>['main','side'].includes(placements[key])).map(key=>[key,placements[key]])),columns:input.columns==='two'?'two':'one',font:input.font==='serif'?'serif':'sans',textColor:validHex(input.textColor)?input.textColor:'',headingColor:validHex(input.headingColor)?input.headingColor:''};
}
let stored;try{stored=JSON.parse(localStorage.getItem('chypervitalize-draft'));}catch{}
let state={lang:stored?.lang||'hu',cvLang:stored?.cvLang||'hu',cv:{...blank,...stored?.cv},cvEdited:stored?.cvEdited===true,exampleId:stored?.exampleId||null,layout:normalizeLayout(stored?.layout),layoutOpen:false,resumeType:stored?.resumeType||'ats',basicAccent:stored?.basicAccent||'#e8f0df',basicAccent2:stored?.basicAccent2||stored?.basicAccent||'#a9a7a7',customAccent:stored?.customAccent===true,customAccent2:stored?.customAccent2===true,cvBackground:/^#[0-9a-f]{6}$/i.test(stored?.cvBackground||'')?stored.cvBackground:'#ffffff',basicShade:stored?.basicShade||0,basicSide:stored?.basicSide||'left',cvStyle:stored?.cvStyle||stored?.resumeType||'ats',projectKey:stored?.projectKey||crypto.randomUUID(),section:0,route:'home',user:null,ai:false,demo:true,plan:'month',authMode:'register',pendingDownload:false,reviews:[],reviewRating:5};
if(!locales[state.lang])state.lang='hu';if(!locales[state.cvLang])state.cvLang='hu';
state.visitCount=0;
const params=new URLSearchParams(location.search),ref=params.get('ref');if(ref)localStorage.setItem('chypervitalize-ref',ref);const checkoutResult=params.get('checkout');let checkoutSession=params.get('session_id')||localStorage.getItem('chypervitalize-checkout-session');
const t=k=>strings[state.lang][k],ct=k=>strings[state.cvLang][k];
const icons={arrow:'<path d="M5 12h14M13 6l6 6-6 6"/>',check:'<path d="m5 12 4 4L19 6"/>',file:'<path d="M14 2H6a2 2 0 0 0-2 2v16h16V8zM14 2v6h6M8 12h8M8 16h6"/>',spark:'<path d="m12 3 2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5z"/>',download:'<path d="M12 3v12m-5-5 5 5 5-5M4 16v5h16v-5"/>',user:'<circle cx="12" cy="8" r="4"/><path d="M4 22v-3a8 8 0 0 1 16 0v3"/>',globe:'<circle cx="12" cy="12" r="9"/><ellipse cx="12" cy="12" rx="4" ry="9"/><path d="M3 12h18"/>',clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',palette:'<path d="M12 3a9 9 0 1 0 0 18h1.1a1.9 1.9 0 0 0 1.4-3.2 1.8 1.8 0 0 1 1.3-3.1H18a3 3 0 0 0 3-3C21 7.3 16.9 3 12 3Z"/><circle cx="7.5" cy="11" r=".8"/><circle cx="10" cy="7.5" r=".8"/><circle cx="15" cy="8" r=".8"/>',list:'<path d="m4 6 1.5 1.5L8 5M11 6h9M4 12l1.5 1.5L8 11M11 12h9M4 18l1.5 1.5L8 17M11 18h9"/>',shield:'<path d="M12 22s8-4 8-11V5l-8-3-8 3v6c0 7 8 11 8 11Z"/><path d="m9 12 2 2 4-4"/>',device:'<rect x="3" y="4" width="18" height="13" rx="2"/><path d="M8 21h8m-4-4v4"/>',languages:'<path d="m5 8 4-4 4 4M9 4v12M5 12c1.2 2.2 3.2 4 6 5M15 20l4-10 4 10m-6.5-3h5"/>',modern:'<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M8 9h8M8 13h4M8 17h8"/>',value:'<path d="M12 2v20M17 6.5c-.8-1-2.3-1.5-4-1.5-2.2 0-4 1.1-4 2.8 0 4.4 9 1.6 9 6.4 0 1.9-1.8 3.3-4.5 3.3-1.9 0-3.7-.7-4.6-2"/>'};
const icon=k=>`<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${icons[k]||icons.file}</svg>`;
const button=(text,action,cls='primary',ico='arrow')=>`<button class="${cls}" data-action="${action}">${esc(text)}${ico?icon(ico):''}</button>`;
const displayCurrencies={hu:'HUF',de:'EUR',fr:'EUR',es:'EUR',it:'EUR',pt:'EUR',nl:'EUR',sk:'EUR',hr:'EUR',sl:'EUR',bg:'EUR',el:'EUR',fi:'EUR',cs:'CZK',pl:'PLN',ro:'RON',da:'DKK',sv:'SEK',no:'NOK'};
let fxRates=null,fxDate='',fxCheckedAt=0,fxError=false;
const preferredCurrency=()=>displayCurrencies[state.lang]||'USD';
const displayCurrency=()=>fxRates?.[preferredCurrency()]?preferredCurrency():'USD';
function money(plan){const usd=typeof plan==='number'?plan:plan==='day'?2.99:12.49,currency=displayCurrency();return new Intl.NumberFormat(state.lang,{style:'currency',currency,maximumFractionDigits:currency==='HUF'?0:2,minimumFractionDigits:currency==='HUF'?0:2}).format(usd*(currency==='USD'?1:fxRates[currency]));}
function fxNote(){
 if(preferredCurrency()==='USD')return '';
 const hu=state.lang==='hu';
 const de=state.lang==='de';
 if(!fxDate)return hu?(fxError?'Árfolyam nem elérhető. USD ár látható; a fizetés USD-ben történik.':'Árfolyam betöltése… A fizetés USD-ben történik.'):de?(fxError?'Wechselkurs nicht verfügbar. USD-Preise angezeigt; die Zahlung erfolgt in USD.':'Wechselkurs wird geladen… Die Zahlung erfolgt in USD.'):(fxError?'Exchange rate unavailable. USD prices shown; checkout is in USD.':'Loading exchange rate… Checkout is in USD.');
 const date=new Intl.DateTimeFormat(state.lang,{dateStyle:'medium',timeZone:'UTC'}).format(new Date(`${fxDate}T12:00:00Z`));
 return hu?`Tájékoztató átváltás (${date}${fxError?', utolsó elérhető árfolyam':''}). A fizetés USD-ben történik: $2.99 az első hét, utána $12.49/hó.`:de?`Ungefährer Wechselkurs (${date}${fxError?', letzter verfügbarer Kurs':''}). Die Zahlung erfolgt in USD: $2.99 in der ersten Woche, danach $12.49/Monat.`:`Estimated exchange rate (${date}${fxError?', last available rate':''}). Checkout is charged in USD: $2.99 for the first week, then $12.49/month.`;
}
async function refreshFx(){
 fxCheckedAt=Date.now();
 try{
  const res=await fetch('https://api.frankfurter.dev/v1/latest?base=USD&symbols=EUR,HUF,CZK,PLN,RON,DKK,SEK,NOK',{cache:'no-cache',signal:AbortSignal.timeout(6000)});
  if(!res.ok)throw Error('Exchange rates unavailable');
  const data=await res.json();
  if(data.base!=='USD'||!/^\d{4}-\d{2}-\d{2}$/.test(data.date)||!Object.values(displayCurrencies).every(c=>c==='USD'||Number.isFinite(data.rates?.[c])&&data.rates[c]>0))throw Error('Invalid exchange rates');
  fxRates=data.rates;fxDate=data.date;fxError=false;
 }catch{fxError=true;}
 if(state.route==='home')render();
 if($('#modal').open){if($('#modal .alt-plans'))checkout();else if($('#modal .checkout-total'))checkoutSelected();}
}
const planLabel=p=>{const hu=state.lang==='hu';return p==='day'?(hu?'1 hetes hozzáférés':'1-week access'):(hu?'Havi hozzáférés':'Monthly access');};
const saleLabels={hu:'AKCIÓ · CSAK MOST',en:'SALE · LIMITED TIME',de:'ANGEBOT · NUR FÜR KURZE ZEIT',fr:'PROMO · OFFRE LIMITÉE',es:'OFERTA · POR TIEMPO LIMITADO',it:'OFFERTA · SOLO PER POCO',pt:'PROMOÇÃO · TEMPO LIMITADO',nl:'ACTIE · TIJDELIJK',sk:'AKCIA · LEN TERAZ',cs:'AKCE · POUZE NYNÍ',pl:'PROMOCJA · TYLKO TERAZ',ro:'OFERTĂ · DOAR ACUM',hr:'AKCIJA · SAMO SADA',sl:'AKCIJA · SAMO ZDAJ',sr:'AKCIJA · SAMO SADA',bg:'ПРОМОЦИЯ · САМО СЕГА',el:'ΠΡΟΣΦΟΡΑ · ΜΟΝΟ ΤΩΡΑ',da:'TILBUD · KUN NU',sv:'ERBJUDANDE · ENDAST NU',no:'TILBUD · KUN NÅ',fi:'TARJOUS · VAIN NYT'};
const oldMonthlyPrice=()=>money(20);
const langOptions=selected=>Object.entries(locales).map(([code,l])=>`<option value="${code}" ${code===selected?'selected':''}>${l.name}</option>`).join('');
const languageSelect=(id,value)=>`<select id="${id}" aria-label="${t(id==='cv-language'?'cvLang':'appLang')}">${langOptions(value)}</select>`;
function languageMenu(id,value){
 const label=t('appLang');
 return `<div class="language-picker" data-language-picker><button type="button" class="language-trigger" id="${id}-trigger" data-language-trigger aria-label="${esc(label)}: ${esc(locales[value].name)}" aria-haspopup="menu" aria-expanded="false" aria-controls="${id}-menu">${icon('globe')}<span class="language-current">${esc(locales[value].name)}</span><span class="language-chevron" aria-hidden="true"></span></button><div class="language-popover" id="${id}-menu" role="menu" aria-label="${esc(label)}"><div class="language-popover-title"><span>${esc(label)}</span><span>${Object.keys(locales).length} LANGUAGES</span></div><div class="language-options">${Object.entries(locales).map(([code,l])=>`<button type="button" role="menuitemradio" aria-checked="${code===value}" class="language-option ${code===value?'is-selected':''}" data-language-option="${code}"><span>${esc(l.name)}</span><span class="language-option-check" aria-hidden="true">${code===value?'✓':''}</span></button>`).join('')}</div></div></div>`;
}
let saveTimer,toastTimer;
function toast(text){$('#toast').textContent=text;$('#toast').classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('#toast').classList.remove('show'),4000);}
async function api(path,data){const res=await fetch('/api/'+path,{method:data?'POST':'GET',headers:data?{'Content-Type':'application/json'}:{},body:data?JSON.stringify(data):undefined});const b=await res.json();if(!res.ok)throw Error(b.error);return b;}
function snapshot(){return {lang:state.lang,cvLang:state.cvLang,cvEdited:state.cvEdited,exampleId:state.exampleId,layout:state.layout,resumeType:state.resumeType,cvStyle:state.cvStyle||state.resumeType,basicAccent:state.basicAccent,basicAccent2:state.basicAccent2,customAccent:state.customAccent,customAccent2:state.customAccent2,cvBackground:state.cvBackground,basicShade:state.basicShade,basicSide:state.basicSide,projectKey:state.projectKey,cv:state.cv};}
function save(){try{localStorage.setItem('chypervitalize-draft',JSON.stringify(snapshot()));if($('#save-status'))$('#save-status').textContent=t('saved');}catch{toast(t('error'));}clearTimeout(saveTimer);if(state.user)saveTimer=setTimeout(async()=>{try{await api('draft',snapshot());if($('#save-status'))$('#save-status').textContent=t('cloudSave');}catch{toast(t('localSave'));}},600);}
function go(route){save();state.route=route;render();scrollTo({top:0,behavior:'smooth'});}
const impactStripText=()=>state.lang==='hu'?'Egy jó önéletrajz dönthet a felvételről. Ne bízd a véletlenre.':'A great CV can make the difference in getting hired. Don’t leave it to chance.';
function visitLabel(){
 if(state.visitCount<1000)return '';
 const count=new Intl.NumberFormat(state.lang).format(state.visitCount);
 return state.lang==='hu'?`Már ${count} látogatás az oldalon`:state.lang==='de'?`Bereits ${count} Besuche auf dieser Website`:`Already ${count} visits to this site`;
}
async function recordVisit(){
 let counted=false;
 try{counted=sessionStorage.getItem('chypervitalize-visit-counted')==='1';}catch{}
 try{
  const response=await fetch('/api/visits',{method:counted?'GET':'POST',headers:{Accept:'application/json'}});
  if(!response.ok)return;
  const data=await response.json();
  if(!counted)try{sessionStorage.setItem('chypervitalize-visit-counted','1');}catch{}
  if(Number.isSafeInteger(data.count)&&data.count>=1000){
   state.visitCount=data.count;
   const badge=$('#visit-proof');
   if(badge)badge.textContent=visitLabel();
  }
 }catch{}
}
function render(){document.documentElement.lang=state.lang;document.title='chypervitalize';$('#header').innerHTML=`<div class="nav"><button class="wordmark" data-action="home" aria-label="chypervitalize">chypervitalize<img class="brand-star" src="/favicon.svg?v=20260928-green-star" alt=""></button><div class="nav-right"><div class="language">${languageMenu('header-language',state.lang)}</div><button class="login" data-action="account">${icon('user')}<span>${t(state.user?'account':'login')}</span></button></div></div>`;$('#footer').innerHTML=`
<div class="footer-shell">
 <div class="footer-brand"><span class="wordmark small">chypervitalize<img class="brand-star" src="/favicon.svg?v=20260928-green-star" alt=""></span><p>${t('footer')}</p></div>
 <div class="footer-col"><strong>Chypervitalize</strong><button data-action="home">CV készítő</button><button data-action="setup">CV sablonok</button><button data-action="account">Fiókom</button></div>
 <div class="footer-col"><strong>Hasznos</strong><button data-action="scroll-ats">ATS-barát CV</button><button data-action="scroll-how">Hogyan működik?</button><button data-action="scroll-pricing">Árak</button></div>
 <div class="footer-col"><strong>Jogi</strong><a href="/terms.html">Felhasználási feltételek</a><a href="/privacy.html">Adatvédelmi nyilatkozat</a><a href="/contact.html">Kapcsolat</a></div>
 <div class="footer-col"><strong>Nyelv</strong><div class="footer-language">${languageMenu('footer-language',state.lang)}</div></div>
</div>
<div class="impact-strip">${esc(impactStripText())}</div>
<div class="footer-bottom"><span>© ${new Date().getFullYear()} Chypervitalize</span><span>CV by Chypervitalize</span></div>`;$('#app').className=state.route==='editor'?'workspace':'page';$('#app').innerHTML=state.route==='home'?home()+`<p id="visit-proof" class="visitor-proof" role="status">${visitLabel()}</p>`:state.route==='setup'?setup():state.route==='payment'?paymentPage():editor();requestAnimationFrame(fitExamples);}
function sample(){const l=strings[state.lang];const org=l.exampleOrganization||'Northline Studio';const city=l.exampleCity||'Budapest';return {...blank,name:l.exampleName,title:l.exampleTitle,email:'hello@example.com',phone:'+44 7700 900123',city,link:'linkedin.com/in/example',summary:l.exampleSummary,skills:l.exampleSkills,languages:l.exampleLanguages,languageLevels:[5,4,3],experience:[{heading:l.exampleHeading,organization:org,location:city,dates:l.exampleDates,details:l.exampleDetails},{heading:l.exampleHeading,organization:org,location:city,dates:'2021 — 2023',details:l.exampleDetails}],education:[{heading:'Business & Communication',organization:'Metropolitan University',location:city,dates:'2018 — 2021',details:'Strategy · communication · digital projects'}],projects:[{heading:'Portfolio project',organization:'Independent',location:'',dates:'2024',details:'Research, planning and measurable delivery.'}],certifications:[{heading:'Professional Certificate',organization:'Online Academy',location:'',dates:'2024',details:'Completed practical professional training.'}]};}
function languageMarkup(d,l){const lines=String(d.languages||'').split(/\n|,/).map(x=>x.trim()).filter(Boolean);if(!lines.length)return '';return `<section class="cv-languages"><h3>${esc(l.languages)}</h3>${lines.map((name,i)=>{const level=Math.max(1,Math.min(5,Number(d.languageLevels?.[i]||5)));return `<div class="cv-language"><span>${esc(name)}</span><span class="language-dots" aria-label="${level} / 5">${[1,2,3,4,5].map(n=>`<i class="${n<=level?'filled':''}"></i>`).join('')}</span></div>`}).join('')}</section>`;}
function cvMarkup(d,lang,example=false){const l=strings[lang];const has=Object.values(d).some(v=>typeof v==='string'?!!v.trim():Array.isArray(v)&&v.some(r=>Object.values(r).some(value=>typeof value==='string'&&value.trim())));if(!has&&!example)return `<article class="cv-paper empty-paper"><div class="empty-icon">${icon('file')}</div><h3>${t('empty')}</h3><div class="skeleton-lines"><i></i><i></i><i></i></div></article>`;const part=(k,txt)=>txt?`<section><h3>${esc(l[k])}</h3><p>${esc(txt).replace(/\n/g,'<br>')}</p></section>`:'';return `<article class="cv-paper"><div class="cv-head">${d.photo?`<img class="cv-photo" src="${esc(d.photo)}" alt="">`:''}<h2>${esc(d.name)}</h2><p class="cv-title">${esc(d.title)}</p><p class="cv-contact">${[d.email,d.phone,d.city,d.link].filter(Boolean).map(esc).join(' <span>·</span> ')}</p></div>${part('summary',d.summary)}${['experience','education','projects','awards','volunteer','certifications'].map(k=>(d[k]||[]).some(r=>r.heading||r.details)?`<section><h3>${esc(l[k])}</h3>${d[k].map(r=>`<div class="cv-entry"><div><strong>${esc(r.heading)}</strong><small>${esc(r.dates)}</small></div><p class="cv-org">${[r.organization,r.location].filter(Boolean).map(esc).join(' · ')}</p><p>${esc(r.details).replace(/\n/g,'<br>')}</p></div>`).join('')}</section>`:'').join('')}${part('skills',d.skills)}${languageMarkup(d,l)}</article>`;}

function paperIsDark(){const rgb=[1,3,5].map(i=>parseInt(state.cvBackground.slice(i,i+2),16)/255).map(c=>c<=.04045?c/12.92:((c+.055)/1.055)**2.4);return rgb[0]*.2126+rgb[1]*.7152+rgb[2]*.0722<.179;}
function customizeCvMarkup(markup,lang){
 const template=document.createElement('template');template.innerHTML=markup;
 const paper=template.content.querySelector('.cv-paper');if(!paper)return markup;
 paper.classList.add('user-custom','custom-side-'+state.basicSide);paper.style.setProperty('--readable-heading',readableColor(state.basicAccent,state.cvBackground));
 paper.classList.toggle('custom-serif',state.layout.font==='serif');
 if(state.layout.textColor){paper.classList.add('custom-ink');paper.style.setProperty('--user-ink',readableColor(state.layout.textColor,state.cvBackground));}
 if(state.layout.headingColor){paper.classList.add('custom-heading');paper.style.setProperty('--user-heading',readableColor(state.layout.headingColor,state.cvBackground));}
 if(state.customAccent){paper.classList.add('custom-accent');paper.style.setProperty('--user-accent',state.basicAccent);}
 if(state.customAccent2){paper.classList.add('custom-accent-two');paper.style.setProperty('--user-accent-two',state.basicAccent2);}
 if(!paper.classList.contains('premium-cv')){
  const main=paper.classList.contains('basic-cv')?paper.querySelector('.basic-body>main'):paper;
  const side=paper.classList.contains('basic-cv')?paper.querySelector('.basic-body>aside'):null;
  const blockMap=new Map();
  [...main.querySelectorAll(':scope > section'),...(side?[...side.querySelectorAll(':scope > section')]:[])].forEach(node=>{
   const key=layoutKeys.find(k=>strings[lang][k]===node.querySelector('h3')?.textContent);
   if(key)blockMap.set(key,node);
  });
  main.classList.toggle('cv-two-columns',state.layout.columns==='two');
  for(const key of state.layout.order){const node=blockMap.get(key);if(!node)continue;node.classList.toggle('cv-half',state.layout.widths[key]==='half');(side&&state.layout.placements[key]==='side'?side:side&&state.layout.placements[key]!=='main'&&['skills','languages'].includes(key)?side:main).appendChild(node);}
 }
 return template.innerHTML;
}
function basicCvMarkup(d,lang,example=false){const l=strings[lang];const has=Object.values(d).some(v=>typeof v==='string'?!!v.trim():Array.isArray(v)&&v.some(r=>Object.values(r).some(value=>typeof value==='string'&&value.trim())));if(!has&&!example)return cvMarkup(d,lang,example);const part=(k,txt)=>txt?`<section><h3>${esc(l[k])}</h3><p>${esc(txt).replace(/\n/g,'<br>')}</p></section>`:'';return `<article class="cv-paper basic-cv ${paperIsDark()?'paper-dark ':''}basic-side-${esc(state.basicSide)}" style="--basic-accent:${esc(state.basicAccent)};--basic-accent-2:${esc(state.basicAccent2)};--basic-shade:${Number(state.basicShade)||0}%;--cv-paper-bg:${esc(state.cvBackground)}"><header class="basic-head">${d.photo?`<img class="basic-photo" src="${esc(d.photo)}" alt="">`:''}<div><h2>${esc(d.name)}</h2><p class="basic-title">${esc(d.title)}</p><p class="basic-contact">${[d.email,d.phone,d.city,d.link].filter(Boolean).map(esc).join(' · ')}</p></div></header><div class="basic-body"><aside>${part('skills',d.skills)}${languageMarkup(d,l)}</aside><main>${part('summary',d.summary)}${['experience','education','projects','awards','volunteer','certifications'].map(k=>(d[k]||[]).some(r=>r.heading||r.details)?`<section><h3>${esc(l[k])}</h3>${d[k].map(r=>`<div class="basic-entry"><strong>${esc(r.heading)}</strong><small>${esc(r.dates)}</small><p class="basic-org">${[r.organization,r.location].filter(Boolean).map(esc).join(' · ')}</p><p>${esc(r.details).replace(/\n/g,'<br>')}</p></div>`).join('')}</section>`:'').join('')}</main></div></article>`;}
function styledCvMarkup(d,lang,example=false){
 const style=state.cvStyle||state.resumeType||'ats';
 if(PREMIUM_STYLE_MAP[style]){
  const has=Object.values(d).some(v=>typeof v==='string'?!!v.trim():Array.isArray(v)&&v.some(r=>Object.values(r).some(value=>typeof value==='string'&&value.trim())));
  if(!has&&!example)return cvMarkup(d,lang,example);
   const markup=renderPremiumCv(PREMIUM_STYLE_MAP[style],d,strings[lang],esc,state.layout);
  const bg=/^#[0-9a-f]{6}$/i.test(state.cvBackground)?state.cvBackground:'#ffffff';
  return bg.toLowerCase()==='#ffffff'?markup:markup.replace('class="cv-paper premium-cv','style="--cv-paper-bg:'+bg+'" class="cv-paper premium-cv'+(paperIsDark()?' paper-dark':''));
 }
 if(style==='basic')return basicCvMarkup(d,lang,example);
 const base=cvMarkup(d,lang,example);
  return base.replace('class="cv-paper','style="--template-accent:'+esc(state.basicAccent)+';--template-accent-2:'+esc(state.basicAccent2)+';--template-shade:'+Number(state.basicShade||0)+'%;--cv-paper-bg:'+esc(state.cvBackground)+'" class="cv-paper '+(paperIsDark()?'paper-dark ':'')+'cv-style-'+esc(style));
}
function activeCvMarkup(d,lang,example=false){return customizeCvMarkup(styledCvMarkup(d,lang,example),lang);}
function exampleCvMarkup(d,lang,style){
 if(PREMIUM_STYLE_MAP[style])return renderPremiumCv(PREMIUM_STYLE_MAP[style],d,strings[lang],esc);
 if(style==='basic')return basicCvMarkup(d,lang,true).replace(/style="[^"]*"/, 'style="--basic-accent:#dbe8df;--basic-accent-2:#507267;--basic-shade:0%;--cv-paper-bg:#ffffff"').replace('paper-dark ','').replace('basic-side-right','basic-side-left');
 return cvMarkup(d,lang,true).replace('class="cv-paper','class="cv-paper cv-style-'+esc(style));
}

const paymentCopy={
 sk:['Platba bola úspešná!','Váš životopis je pripravený. Ďalšia príležitosť na vás čaká — urobte prvý krok s istotou!','Stiahnuť PDF','Overuje sa platba…','Platba zatiaľ nebola potvrdená. Skúste to znova o niekoľko sekúnd.','Overiť znova','Prihláste sa do účtu, ktorý ste použili pri nákupe.'],
 hu:['Sikeres fizetés!','Az önéletrajzod elkészült. A következő lehetőség rád vár — tedd meg bátran az első lépést!','PDF letöltése','Fizetés ellenőrzése…','A fizetés visszaigazolása még nem érkezett meg. Próbáld újra néhány másodperc múlva.','Ellenőrzés újra','A fizetés ellenőrzéséhez jelentkezz be a vásárláskor használt fiókodba.'],
 en:['Payment successful!','Your CV is ready to download. Good luck with your next step!','Download CV','Checking payment…','Payment has not been confirmed yet. Try again in a few seconds.','Check again','Sign in with the account you used to purchase.'],
 de:['Zahlung erfolgreich!','Dein Lebenslauf ist bereit. Viel Erfolg beim nächsten Schritt!','Lebenslauf herunterladen','Zahlung wird geprüft…','Die Zahlung ist noch nicht bestätigt. Versuche es in wenigen Sekunden erneut.','Erneut prüfen','Melde dich mit dem beim Kauf verwendeten Konto an.'],
 fr:['Paiement réussi !','Votre CV est prêt. Bonne chance pour la suite !','Télécharger le CV','Vérification du paiement…','Le paiement n’est pas encore confirmé. Réessayez dans quelques secondes.','Vérifier à nouveau','Connectez-vous au compte utilisé pour cet achat.'],
 es:['¡Pago realizado!','Tu CV está listo. ¡Mucho éxito en tu próximo paso!','Descargar CV','Comprobando el pago…','El pago aún no se ha confirmado. Vuelve a intentarlo en unos segundos.','Comprobar de nuevo','Inicia sesión con la cuenta utilizada para la compra.'],
 it:['Pagamento riuscito!','Il tuo CV è pronto. In bocca al lupo per il prossimo passo!','Scarica CV','Verifica del pagamento…','Il pagamento non è ancora confermato. Riprova tra qualche secondo.','Verifica di nuovo','Accedi con l’account utilizzato per l’acquisto.'],
 pt:['Pagamento efetuado!','O teu CV está pronto. Boa sorte no próximo passo!','Descarregar CV','A verificar o pagamento…','O pagamento ainda não foi confirmado. Tenta novamente dentro de alguns segundos.','Verificar novamente','Inicia sessão com a conta utilizada na compra.'],
 nl:['Betaling geslaagd!','Je cv is klaar. Veel succes met je volgende stap!','CV downloaden','Betaling controleren…','De betaling is nog niet bevestigd. Probeer het over een paar seconden opnieuw.','Opnieuw controleren','Log in met het account waarmee je hebt betaald.']
};
function reviewStars(n){return '<span class="review-stars" aria-label="'+n+' / 5">'+[1,2,3,4,5].map(i=>i<=n?'★':'☆').join('')+'</span>';}
function reviewsBlock(){const hu=state.lang==='hu',items=state.reviews||[];
 const examples=hu?[
  {rating:5,text:'Gyorsan össze tudtam rakni a CV-met, és a végeredmény letisztult lett.'},
  {rating:5,text:'Egyszerű volt használni, nem kellett sokat állítgatni rajta.'},
  {rating:4,text:'Jól néz ki a CV és könnyű volt kitölteni. Pár extra sablonnak még örülnék.'},
  {rating:5,text:'Telefonról is simán végig tudtam csinálni.'},
  {rating:4,text:'Hasznos és átlátható oldal. A PDF is rendben lett.'},
  {rating:3,text:'Alapvetően jó, de több személyre szabási lehetőség még jól jönne.'}
 ]:[
  {rating:5,text:'I put my CV together quickly and the result looked clean and professional.'},
  {rating:5,text:'Simple to use and I did not have to spend much time adjusting things.'},
  {rating:4,text:'The CV looks good and was easy to fill out. A few more templates would be nice.'},
  {rating:5,text:'Worked smoothly on my phone too.'},
  {rating:4,text:'Useful and straightforward. The PDF came out well.'},
  {rating:3,text:'Good overall, but I would like a few more customization options.'}
 ];
 const shown=items.length?items:examples;
 return `<div class="customer-reviews"><p class="eyebrow">CHYPERVITALIZE / REVIEWS</p><h2>${hu?'Vásárlói vélemények':'Customer reviews'}</h2><div class="review-list">${shown.map((r,i)=>`<article>${reviewStars(Number(r.rating))}<p>${esc(r.text)}</p>${!items.length?`<small class="review-example">${hu?'Példa vélemény':'Example review'}</small>`:''}</article>`).join('')}</div><div class="review-compose"><strong>${hu?'Értékeld a Chypervitalizet':'Rate Chypervitalize'}</strong><div class="star-picker">${[1,2,3,4,5].map(i=>`<button type="button" data-action="rate-${i}" aria-label="${i} star">${i<=state.reviewRating?'★':'☆'}</button>`).join('')}</div><textarea id="review-text" maxlength="500" placeholder="${hu?'Írd le a tapasztalatodat…':'Share your experience…'}"></textarea>${button(hu?'Vélemény küldése':'Submit review','submit-review','secondary','')}</div></div>`;}
async function loadReviews(){try{const r=await api('reviews');state.reviews=r.reviews||[];if(state.route==='payment')render();}catch{}}
function paymentPage(){
 const c=paymentCopy[state.lang]||paymentCopy.en,ready=state.payment==='paid'&&Number(state.user?.credits||0)>0;
 return `<section class="payment-success" aria-live="polite"><div class="success-mark">${icon(ready?'check':'file')}</div><h1>${esc(ready?c[0]:state.payment==='checking'?c[3]:t('checkout'))}</h1><p>${esc(ready?c[1]:!state.user?c[6]:c[4])}</p>${state.payment==='checking'?'<progress aria-label="'+esc(c[3])+'"></progress>':!ready?button(!state.user?t('login'):c[5],!state.user?'payment-login':'verify-payment'):''}${button(t('editTitle'),'edit','text-button','')}${ready?reviewsBlock():''}</section>`;
}
function showDownloadModal(){
 if(!(Number(state.user?.credits||0)>0))return;
 const c=paymentCopy[state.lang]||paymentCopy.en;
 openModal(`<div class="success-mark">${icon('check')}</div><h2>${esc(c[0])}</h2><p>${esc(c[1])}</p>${button(c[2],'paid-download','primary payment-download','download')}`);
}
async function verifyPayment(){
 state.route='payment';
 if(!state.user){state.payment='login';render();return;}
 state.payment='checking';render();
 try{
  const r=await api('checkout-status',{sessionId:checkoutSession});
  state.user=r.user;state.payment=r.paid&&Number(r.user?.credits||0)>0?'paid':'pending';
 }catch{state.payment='error';}
 render();
 if(state.payment==='paid'){localStorage.removeItem('chypervitalize-checkout-session');history.replaceState({},'',location.pathname);loadReviews();setTimeout(()=>showDownloadModal(),150);}
}

function exampleGallery(){
 const hu=state.lang==='hu';
  const examples=getCvExamples(state.lang).slice(0,8);
 return `<section class="example-collection" id="cv-examples" aria-labelledby="examples-title">
   <div class="examples-heading"><div><p class="eyebrow">CHYPERVITALIZE / ${hu?'PÉLDATÁR':'EXAMPLES'}</p><h2 id="examples-title">${hu?'Kiemelt prémium sablonok.':'Featured premium templates.'}</h2></div><p>${hu?'Ezekkel nem nyúlsz félre. Válassz egyet, és alakítsd a sajátodra.':'You can’t go wrong with these. Choose one and make it yours.'}</p></div>
   <div class="examples-grid">${examples.map((example,index)=>{
   return `<article class="example-card" style="--example-accent:${esc(example.accent)};--card-delay:${index*65}ms">
     <div class="example-card-top"><span class="example-index">${String(index+1).padStart(2,'0')} / ${String(examples.length).padStart(2,'0')}</span><span class="example-category">${esc(example.category)}</span></div>
     <div class="example-sheet cv-fit" aria-hidden="true">${exampleCvMarkup(example.cv,hu?'hu':'en',example.style)}</div>
    <div class="example-card-info"><span>${esc(example.note)}</span><h3>${esc(example.label)}</h3><p>${esc(example.result)}</p><button class="example-preview-button" type="button" data-action="preview-example" data-example-id="${esc(example.id)}">${hu?'Nagyított előnézet':'Enlarge preview'}</button><button type="button" data-action="use-example" data-example-id="${esc(example.id)}" aria-label="${esc((hu?'Példa használata: ':'Use example: ')+example.label)}">${hu?'Ezt a példát választom':'Use this example'} <span aria-hidden="true">↗</span></button></div>
   </article>`}).join('')}</div>
  <p class="examples-disclaimer">${hu?'A szereplők, munkahelyek és eredmények kitalált minták. A letöltés előtt cseréld őket a saját adataidra.':'Names, employers and outcomes are fictional. Replace them with your own details before downloading.'}</p>
 </section>`;
}
function selectExample(id){
 const example=getCvExample(id,state.lang);
 if(!example)return;
 const hu=state.lang==='hu';
 const hasDraft=Boolean(state.cv.name?.trim()||state.cv.summary?.trim()||state.cv.experience?.some(item=>item.heading?.trim()||item.details?.trim()));
 if(hasDraft&&!confirm(hu?'A jelenlegi CV-d helyére ez a példa kerül. Folytatod?':'This example will replace your current CV. Continue?'))return;
  state.cv=structuredClone(blank);
  state.exampleId=id;
  state.cvEdited=false;
 state.cvLang=hu?'hu':'en';
 state.cvStyle=example.style;
 state.resumeType=example.style==='basic'?'basic':'ats';
 state.projectKey=crypto.randomUUID();
 go('editor');
}
function focusHeroExample(index){
 const cards=[...document.querySelectorAll('.hero-template-card')];
 if(!cards.length||!Number.isInteger(index)||index<0||index>=cards.length)return;
 cards.forEach((card,i)=>{
  card.classList.toggle('is-front',i===index);
  card.classList.toggle('is-prev',i===(index-1+cards.length)%cards.length);
  card.classList.toggle('is-next',i===(index+1)%cards.length);
  card.setAttribute('aria-pressed',String(i===index));
 });
 document.querySelectorAll('.template-dots button').forEach((dot,i)=>{
  dot.classList.toggle('active',i===index);
  dot.setAttribute('aria-current',String(i===index));
 });
 const example=getCvExamples(state.lang)[index];
 if($('#hero-active-label'))$('#hero-active-label').textContent=example.label;
 if($('#hero-active-result'))$('#hero-active-result').textContent=example.result;
 if($('#hero-example-count'))$('#hero-example-count').textContent=`${String(index+1).padStart(2,'0')} / ${String(cards.length).padStart(2,'0')}`;requestAnimationFrame(fitExamples);
}
function home(){
 const hu=state.lang==='hu';
 const cards=getCvExamples(state.lang);
  const cardHtml=cards.map((x,i)=>`<button type="button" class="sample-cv hero-template-card hero-style-${x.style} ${i===0?'is-front':i===1?'is-next':i===cards.length-1?'is-prev':''}" data-template-index="${i}" data-example-id="${esc(x.id)}" data-action="hero-template-open" aria-label="${esc((hu?'Példa CV: ':'Example CV: ')+x.category+' — '+x.label)}" aria-pressed="${i===0}" style="--sample-accent:${esc(x.accent)}"><span class="sample-type">${esc(x.category)} · ${esc(x.label)}</span><div class="hero-sheet cv-fit" aria-hidden="true">${exampleCvMarkup(x.cv,hu?'hu':'en',x.style)}</div></button>`).join('');
 return `<section class="hero hero-reference"><div class="hero-copy"><p class="eyebrow">${hu?'A TE JÖVŐD ITT KEZDŐDIK':state.lang==='en'?'YOUR FUTURE STARTS HERE':t('tag')}</p><h1>${t('hero1')}<br><em>${t('hero2')}</em></h1><p class="intro">${t('intro')}</p><p class="hero-price"><strong>${hu?'Első hét':'First week'}: ${money('day')}</strong> · ${t('proof1')}</p>${button(t('start'),'start')}<p class="start-note">${t('priceDesc')}</p><ol class="quick-steps" aria-label="${esc(t('how'))}">${['how1','how2','how3'].map((key,i)=>`<li><span aria-hidden="true">0${i+1}</span>${t(key)}</li>`).join('')}</ol><div class="hero-proof"><span>${icon('check')}${t('proof1')}</span><span>${icon('check')}${t('proof2')}</span></div></div>
  <div class="hero-visual hero-reference-visual"><div class="hero-live-label"><span class="live-pulse"></span>${hu?'ÉLŐ PÉLDATÁR':'LIVE EXAMPLES'} <span id="hero-example-count">01 / ${String(cards.length).padStart(2,'0')}</span></div><div class="hero-template-carousel"><div class="hero-cv-examples">${cardHtml}</div><button class="template-arrow template-prev" data-action="hero-template-prev" aria-label="${hu?'Előző CV':'Previous CV'}">‹</button><button class="template-arrow template-next" data-action="hero-template-next" aria-label="${hu?'Következő CV':'Next CV'}">›</button><div class="template-dots">${cards.map((x,i)=>`<button type="button" class="${i===0?'active':''}" data-action="hero-template-dot" data-template-index="${i}" aria-label="${esc(x.category+' — '+x.label)}" aria-current="${i===0?'true':'false'}"></button>`).join('')}</div></div><span class="sample-caption">${t('sample')}</span><div class="hero-feature-result"><span>${hu?'MOST FÓKUSZBAN':'NOW IN FOCUS'}</span><strong id="hero-active-label">${esc(cards[0].label)}</strong><small id="hero-active-result">${esc(cards[0].result)}</small></div><div class="hero-more-wrap"><p class="hero-more-label">${hu?'Nézd meg a többi CV példát is':'Explore more CV examples'}</p><a class="hero-more-templates" href="#cv-examples">${hu?'Példatár megtekintése':'Browse CV examples'} →</a></div></div></section>
  <div class="energy-marquee" aria-label="${hu?'Nyolc kiemelt sablon, tíz CV-stílus, ATS-barát szerkesztő':'Eight featured templates, ten CV styles, ATS-friendly editor'}"><div class="energy-track">${[0,1].map(i=>`<div class="energy-group" ${i?'aria-hidden="true"':''}><span>CHYPERVITALIZE <b>✦</b></span><span>${hu?'8 KIEMELT SABLON':'8 FEATURED TEMPLATES'} <b>✦</b></span><span>${hu?'10 CV-STÍLUS':'10 CV STYLES'} <b>✦</b></span><span>${hu?'A KÖVETKEZŐ LÉPÉSED':'YOUR NEXT MOVE'} <b>✦</b></span></div>`).join('')}</div></div>
 <div class="promise-strip"><span>${icon('file')}${t('proof1')}</span><i></i><span>${icon('user')}${t('proof2')}</span><i></i><span>${icon('download')}${t('proof3')}</span></div>
 ${exampleGallery()}
  <section class="why" aria-labelledby="why-title"><div class="why-heading"><div><p class="eyebrow">CHYPERVITALIZE / 02</p><h2 id="why-title">${hu?'Miért a Chypervitalize?':'Why Chypervitalize?'}</h2></div><p>${hu?'Egy jó pályázathoz nem kell bonyolult eszköz. Készíts átgondolt, rád szabott CV-t a saját tempódban.':'A strong application does not need a complicated tool. Build a thoughtful CV that feels like you, at your own pace.'}</p></div><div class="why-grid">${[
    ['clock',hu?'Gyorsan átlátható':'A quicker way to get started',hu?'Az egyszerű, vezetett lépésekkel egy első, egyszerű CV akár 10 perc alatt is elkészülhet — a megadott részletektől függően.':'With guided steps, a simple first draft may be possible in as little as 10 minutes, depending on the details you add.'],
    ['modern',hu?'Kortárs, letisztult megjelenés':'A contemporary, polished look',hu?'Mai, átgondolt elrendezések segítenek, hogy a CV-d rendezett és magabiztos benyomást keltsen.':'Contemporary, considered layouts help your CV feel organized and confident.'],
    ['palette',hu?'A stílusod, a döntésed':'Your style, your call',hu?'Válassz tíz CV-stílus közül, és alakítsd a megjelenést úgy, hogy illeszkedjen a szakmádhoz és hozzád.':'Choose from ten CV styles and shape the look to suit your field and your personality.'],
    ['list',hu?'Beépített ellenőrzőlista':'A built-in checklist',hu?'A szerkesztő segít végigvenni a fontos részeket, hogy könnyebben észrevedd, mi hiányzik még. Ez útmutató, nem automatikus szakértői értékelés.':'The editor helps you work through the essentials and spot what may still be missing. It is a guide, not an automated expert review.'],
    ['shield',hu?'ATS-barát felépítés':'ATS-friendly structure',hu?'Az ATS-sablon egyértelmű szakaszokkal és jól olvasható szöveggel segíti a pályázatod áttekinthetőségét.':'The ATS template uses clear sections and readable text to make your application easier to scan.'],
    ['languages',hu?'Több nyelven is':'More than one language',hu?'Töltsd ki az önéletrajzod a támogatott nyelvek egyikén, és igazítsd az adott lehetőséghez.':'Create your CV in a supported language and tailor it to the opportunity.'],
    ['device',hu?'Rugalmas, biztos alap':'Flexible, dependable basics',hu?'A piszkozatod automatikusan mentődik ezen az eszközön. Ha elkészültél, PDF-ben is letöltheted aktív hozzáféréssel.':'Your draft saves automatically on this device. When you are ready, PDF export is available with an active plan.'],
    ['value',hu?'Átlátható ár, sok hasznos eszköz':'Useful features, clear pricing',hu?'Tíz CV-stílus, szerkesztő és helyi piszkozatmentés egy helyen; a hozzáférés díja és automatikus megújulása a csomagoknál látható.':'Ten CV styles, an editor and local draft saving in one place, with access pricing and automatic renewal terms shown with the plans.']
   ].map(([ico,title,copy],i)=>`<article class="why-card" style="--why-index:${i}"><span class="why-icon">${icon(ico)}</span><div><h3>${title}</h3><p>${copy}</p></div><span class="why-mark" aria-hidden="true">0${i+1}</span></article>`).join('')}</div><p class="why-footnote">${hu?'Kezdd el ingyenesen. A PDF-export aktív hozzáféréshez kötött.':'Start for free. PDF export requires an active plan.'}</p></section>
 <section class="pricing" id="pricing"><p class="eyebrow">CHYPERVITALIZE / 03</p><h2>${t('pricing')}</h2><p>${t('priceDesc')}</p><div class="price-grid">${['day','month'].map(p=>planCard(p)).join('')}</div><p class="plan-equality">${hu?'Mindkét csomag teljes funkcionalitást ad. A havi csomaggal több időd van a pályázatokra; az első hetes csomag is jó választás egy gyors kezdéshez.':'Both plans include every feature. Monthly access gives you more time to apply; first-week access is a good choice for a quick start.'}</p>${subscriptionHelp()}<p class="fx-note" role="status">${fxNote()}</p></section>`;
}
function resumeChooser(){requestAnimationFrame(fitExamples);
 const hu=state.lang==='hu';
 const styles=[
  ['basic','Klasszikus','Az eredeti klasszikus, vizuális elrendezés','The original classic visual layout','basic-mini'],
  ['ats','ATS','Az eredeti letisztult, ATS-barát változat','The original clean ATS-friendly version','ats-mini'],
  ['executive','Executive Gold','Vezetői elegancia arany részletekkel','Executive elegance with gold details','executive-mini'],
  ['modern','Midnight Modern','Sötét, merész prémium fejléc','Bold premium dark header','modern-mini'],
  ['creative','Atelier','Kreatív luxus, magazinszerű elrendezés','Creative luxury editorial layout','creative-mini'],
  ['minimal','Pure Signature','Finom luxus, levegős személyes aláírás','Quiet luxury with an airy signature layout','minimal-mini'],
  ['professional','Architectural','Határozott rácsrendszer és réz részletek','Confident grid with copper details','professional-mini'],
  ['compact','Monaco','Tengerészkék és réz, elegáns tömörség','Navy and copper with elegant clarity','compact-mini'],
  ['elegant','Swiss Grid','Svájci tipográfia, karakteres vörös akcentus','Swiss typography with a bold red accent','elegant-mini'],
  ['tech','Emerald Prestige','Mély smaragdzöld, exkluzív modern megjelenés','Deep emerald with exclusive modern polish','tech-mini']
 ];
 const visibleStyles=styles;
 openModal(`<p class="eyebrow">CHYPERVITALIZE / CV STYLE</p><h2>${hu?'Válassz a 10 CV-stílus közül':'Choose from 10 CV styles'}</h2><p>${hu?'Válaszd ki azt a prémium CV-dizájnt, amelyik legjobban illik hozzád. Mindegyik teljesen szerkeszthető.':'Choose the premium CV design that suits you best. Every template is fully editable.'}</p><div class="resume-choices resume-choices-10">${visibleStyles.map((x,i)=>`<button class="resume-choice ${i===1?'recommended-choice':''}" data-action="choose-style-${x[0]}">${i===1?`<span class="choice-badge">${hu?'AJÁNLOTT':'RECOMMENDED'}</span>`:''}${PREMIUM_STYLE_MAP[x[0]] ? `<div class="premium-choice-preview cv-fit" aria-hidden="true">${renderPremiumCv(PREMIUM_STYLE_MAP[x[0]],getCvExamples(state.lang).find(e=>e.id==="premium-"+PREMIUM_STYLE_MAP[x[0]]).cv,strings[state.lang],esc)}</div>` : `<div class="resume-mini ${x[4]}"><b>${i%2?'Alex Morgan':'Braden Peters'}</b><small>${i%2?'Marketing specialist':'Professional profile'}</small><hr><i></i><i></i><hr><i></i></div>`}<strong>${x[1]}</strong><small>${hu?'Szerkeszthető CV-sablon':'Editable CV template'}</small><p>${hu?x[2]:x[3]}</p><em>${hu?'Ezt választom':'Choose this style'} →</em></button>`).join('')}</div>`);
}
function setup(){return `<section class="setup"><p class="eyebrow">CHYPERVITALIZE / 01</p><h1>${t('setupTitle')}</h1><p>${t('setupDesc')}</p><div class="setup-card"><label>${t('appLang')}${languageSelect('setup-language',state.lang)}</label><div class="field-divider"></div><label>${t('cvLang')}${languageSelect('cv-language',state.cvLang)}</label><p class="hint">${t('cvLanguageNote')}</p>${button(t('next'),'edit')}</div><button class="text-button" data-action="home">← ${t('back')}</button></section>`;}
function field(key,placeholder='',type='text',row=null){const val=row===null?state.cv[key]:(state.cv[sections[state.section]][row]?.[key]||'');placeholder=fieldExample(state.cvLang,sections[state.section],key,row??0,strings[state.cvLang])||placeholder;return `<label class="field ${['summary','skills','languages','details'].includes(key)?'wide':''}"><span>${t(key)}</span>${['summary','skills','languages','details'].includes(key)?`<textarea rows="${key==='summary'||key==='details'?6:4}" data-field="${key}" ${row===null?'':`data-row="${row}"`} placeholder="${esc(placeholder)}">${esc(val)}</textarea>`:`<input type="${type}" data-field="${key}" ${row===null?'':`data-row="${row}"`} value="${esc(val)}" placeholder="${esc(placeholder)}" maxlength="500" ${key==='email'?`aria-describedby="email-error" aria-invalid="${!!val&&!validEmail(val)}"`: ''}>${key==='email'?`<small id="email-error" class="field-error" role="status" ${!val||validEmail(val)?'hidden':''}>${t('missingContact')}</small>`:''}`}</label>`;}
function sectionFields(){const k=sections[state.section];if(k==='personal')return `<div class="field-grid">${field('name',ct('exampleName'))}${field('title',ct('exampleTitle'))}${field('email','hello@example.com','email')}${field('phone','+36 30 123 4567','tel')}${field('city',ct('exampleCity'))}${field('link','linkedin.com/in/...')}<div class="photo-field wide">${state.cv.photo?`<img src="${esc(state.cv.photo)}" alt=""><button class="text-button" data-action="remove-photo">${t('remove')}</button>`:`<label class="upload">${icon('user')} ${t('photo')}<input id="photo-input" type="file" accept="image/png,image/jpeg"></label>`}<p class="hint">${t('photoHint')}</p></div></div>`;if(k==='languages'){const names=String(state.cv.languages||'').split(/\n|,/).map(x=>x.trim()).filter(Boolean);return `<div class="language-editor">${field('languages',ct('exampleLanguages'))}<p class="hint">${state.lang==='hu'?'Írd a nyelveket külön sorokba, majd állítsd be a szintedet 1–5 között.':'Enter each language on a separate line, then choose your level from 1–5.'}</p>${names.map((name,i)=>{const level=Math.max(1,Math.min(5,Number(state.cv.languageLevels?.[i]||5)));return `<div class="language-level-row"><strong>${esc(name)}</strong><div class="language-level-picker">${[1,2,3,4,5].map(n=>`<button type="button" data-action="lang-level-${i}-${n}" class="${n<=level?'active':''}" aria-label="${esc(name)} ${n} / 5">●</button>`).join('')}</div><span>${level}/5</span></div>`}).join('')}</div>`;}
if(['summary','skills'].includes(k))return field(k,ct({summary:'exampleSummary',skills:'exampleSkills'}[k]));const rows=state.cv[k].length?state.cv[k]:[{}];return `<div class="entries">${rows.map((r,i)=>`<div class="entry"><div class="entry-top"><span>${String(i+1).padStart(2,'0')}</span><div class="entry-actions"><button type="button" class="entry-move" data-action="move-entry-${i}-up" aria-label="${esc((state.lang==='hu'?'Bejegyzés feljebb: ':'Move entry up: ')+(r.heading||i+1))}" ${i===0?'disabled':''}>↑</button><button type="button" class="entry-move" data-action="move-entry-${i}-down" aria-label="${esc((state.lang==='hu'?'Bejegyzés lejjebb: ':'Move entry down: ')+(r.heading||i+1))}" ${i===rows.length-1?'disabled':''}>↓</button><button type="button" class="text-button" data-action="remove-entry-${i}">${t('remove')} ×</button></div></div><div class="field-grid">${field('heading',ct('exampleHeading'),'text',i)}${field('organization',ct('exampleOrganization'),'text',i)}${field('location',ct('exampleCity'),'text',i)}${field('dates',ct('exampleDates'),'text',i)}${field('details',ct('exampleDetails'),'text',i)}</div></div>`).join('')}${button('+ '+t('add'),'add-entry','secondary','')}</div>`;}
const validEmail=value=>/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value).trim());
function complete(k){if(k==='personal')return !!(state.cv.name.trim()&&validEmail(state.cv.email));if(Array.isArray(state.cv[k]))return state.cv[k].some(r=>r.heading||r.details);return !!state.cv[k];}
function basicDesignControls(){
  const hu=state.lang==='hu',premium=Boolean(PREMIUM_STYLE_MAP[state.cvStyle]),hasRail=state.cvStyle==='basic'||premium&&['modern','creative','tech'].includes(state.cvStyle);
 const orderRows=state.layout.order.map((key,i)=>`<div class="layout-row"><span class="layout-row-name">${esc(t(key))}</span><div class="layout-row-tools"><button type="button" data-action="move-section-${i}-up" aria-label="${hu?'Feljebb':'Move up'}: ${esc(t(key))}" ${i===0?'disabled':''}>↑</button><button type="button" data-action="move-section-${i}-down" aria-label="${hu?'Lejjebb':'Move down'}: ${esc(t(key))}" ${i===state.layout.order.length-1?'disabled':''}>↓</button><select data-layout-width="${key}" aria-label="${esc(t(key))} — ${hu?'szélesség':'width'}"><option value="full" ${state.layout.widths[key]==='full'?'selected':''}>${hu?'Teljes sor':'Full row'}</option><option value="half" ${state.layout.widths[key]==='half'?'selected':''}>${hu?'Fél sor':'Half row'}</option></select>${hasRail?`<select data-layout-placement="${key}" aria-label="${esc(t(key))} — ${hu?'hely':'position'}"><option value="default" ${!state.layout.placements[key]?'selected':''}>${hu?'Sablon szerint':'Template'}</option><option value="main" ${state.layout.placements[key]==='main'?'selected':''}>${hu?'Fő hasáb':'Main'}</option><option value="side" ${state.layout.placements[key]==='side'?'selected':''}>${hu?'Oldalsáv':'Sidebar'}</option></select>`:''}</div></div>`).join('');
 return `<div class="basic-design-controls"><div class="design-head"><strong>${hu?'Megjelenés':'Appearance'}</strong><small>${hu?'A sablon személyre szabása':'Customize your template'}</small></div><label>${hu?'Díszszín':'Accent color'}<input id="basic-accent" type="color" value="${esc(state.basicAccent)}"></label><label>${hu?'Második díszszín':'Secondary accent'}<input id="basic-accent-2" type="color" value="${esc(state.basicAccent2)}"></label><label>${hu?'CV-háttér':'CV background'}<input id="cv-background" type="color" value="${esc(state.cvBackground)}"></label>${premium?'':`<label>${hu?'Sötétség':'Shade'} <span id="basic-shade-value">${Number(state.basicShade)||0}%</span><input id="basic-shade" type="range" min="0" max="45" step="1" value="${Number(state.basicShade)||0}"></label>`}${state.cvStyle==='basic'||hasRail?`<div class="side-choice"><span>${hu?'Oldalsáv helye':'Sidebar position'}</span><button type="button" class="${state.basicSide==='left'?'active':''}" data-action="basic-side-left">${hu?'Bal':'Left'}</button><button type="button" class="${state.basicSide==='right'?'active':''}" data-action="basic-side-right">${hu?'Jobb':'Right'}</button></div>`:''}<details class="layout-controls" ${state.layoutOpen?'open':''}><summary data-action="toggle-layout">${hu?'Betűk és elrendezés személyre szabása':'Customize typography and layout'}</summary><div class="layout-control-body"><div class="layout-settings"><label>${hu?'Törzsszöveg színe':'Body text color'}<input id="cv-text-color" type="color" value="${esc(state.layout.textColor||'#252921')}"></label><label>${hu?'Név és címek színe':'Name and headings color'}<input id="cv-heading-color" type="color" value="${esc(state.layout.headingColor||'#394f40')}"></label><label>${hu?'Betűcsalád':'Font family'}<select id="cv-font"><option value="sans" ${state.layout.font==='sans'?'selected':''}>${hu?'Modern':'Modern'}</option><option value="serif" ${state.layout.font==='serif'?'selected':''}>${hu?'Klasszikus':'Classic'}</option></select></label><label>${hu?'Tartalom hasábjai':'Content columns'}<select id="cv-columns"><option value="one" ${state.layout.columns==='one'?'selected':''}>${hu?'Egy hasáb':'One column'}</option><option value="two" ${state.layout.columns==='two'?'selected':''}>${hu?'Két hasáb':'Two columns'}</option></select></label></div><p class="layout-help">${hu?'A szakaszokat feljebb vagy lejjebb mozgathatod. A bejegyzéseket a saját szakaszukban rendezheted át.':'Move sections here; reorder individual entries within each section.'}</p><div class="layout-order">${orderRows}</div><button type="button" class="text-button" data-action="reset-layout">${hu?'Elrendezés alaphelyzetbe':'Reset layout'}</button></div></details></div>`;
}
function editorPreviewData(){return state.exampleId&&!state.cvEdited?getCvExample(state.exampleId,state.cvLang)?.cv||state.cv:state.cv;}
function editor(){return `<div class="editor-top"><div><p class="eyebrow">${t('editDesc')}</p><h1>${t('editTitle')}</h1></div><div class="editor-actions"><span class="save-label">${icon('check')}<span id="save-status">${t('saved')}</span></span>${button(t('download'),'download','primary','download')}</div></div><div class="editor-layout"><aside class="section-nav"><div class="nav-title">${state.lang==='hu'?'Kitöltött szakaszok':'Filled sections'} <span>${sections.filter(complete).length}/${sections.length}</span></div>${sections.map((k,i)=>`<button class="section-link ${state.section===i?'active':''}" data-action="section-${i}"><span class="nav-num">${complete(k)?'✓':String(i+1).padStart(2,'0')}</span>${t(k)}</button>`).join('')}<button class="review-button" data-action="review">${icon('spark')}${state.lang==='hu'?'CV ellenőrzés':t('review')}</button><div class="nav-note">${t('atsNote')}</div></aside><section class="form-panel"><div class="form-head"><span class="eyebrow">${String(state.section+1).padStart(2,'0')} / 10</span><h2>${t(sections[state.section])}</h2>${state.section>=6?`<p class="hint">${state.lang==='hu'?'Választható szakasz. Csak akkor töltsd ki, ha releváns a jelentkezésedhez.':'Optional section. Include it when relevant to your application.'}</p>`:''}</div><div id="fields">${sectionFields()}</div>${basicDesignControls()}<div class="form-pagination"><button class="text-button" data-action="prev-section">← ${t('back')}</button>${button(t(state.section===9?'download':'next'),state.section===9?'download':'next-section','primary')}</div></section><section class="preview-panel"><div class="preview-toolbar"><span>${t('preview')}</span>${languageSelect('cv-language',state.cvLang)}</div>${state.exampleId&&!state.cvEdited?`<p class="preview-demo-note">${state.lang==='hu'?'Mintaelőnézet – írj bármelyik mezőbe, és a példa helyét átveszik a saját adataid.':'Sample preview — start typing to replace it with your own content.'}</p>`:''}<div id="cv-preview">${activeCvMarkup(editorPreviewData(),state.cvLang,true)}</div><p class="preview-note">${t('cvLanguageNote')}<span class="pdf-layout-note">${state.lang==='hu'?'A PDF tördelése eltérhet az élő előnézettől.':'PDF layout may differ from the live preview.'}</span></p></section></div>`;}
function openModal(html){const m=$('#modal');m.innerHTML=`<button class="modal-close" data-action="close" aria-label="${t('close')}">×</button>${html}`;if(!m.open)m.showModal();}
function auth(){openModal(`<p class="eyebrow">CHYPERVITALIZE</p><h2>${t('authTitle')}</h2><p>${t('authDesc')}</p><div class="auth-tabs"><button data-action="auth-register" class="${state.authMode==='register'?'active':''}">${t('register')}</button><button data-action="auth-login" class="${state.authMode==='login'?'active':''}">${t('login')}</button></div><form id="auth-form"><label class="field">${t('email')}<input name="email" type="email" required autocomplete="email"></label><label class="field">${t('password')}<input name="password" type="password" required minlength="10" maxlength="200" placeholder="${t('passwordHint')}" autocomplete="${state.authMode==='register'?'new-password':'current-password'}"></label><p class="auth-legal-note">${state.lang==='hu'?'A fiók használatáról és adataidról:':'About your account and data:'} <a href="/terms.html" target="_blank" rel="noopener">${state.lang==='hu'?'Felhasználási feltételek':'Terms'}</a> · <a href="/privacy.html" target="_blank" rel="noopener">${state.lang==='hu'?'Adatvédelem':'Privacy'}</a></p><p id="auth-error" role="alert"></p><button class="primary" type="submit">${t(state.authMode==='register'?'register':'login')}${icon('arrow')}</button></form>`);}
function checkout(){openModal(`<p class="eyebrow">CHYPERVITALIZE / PDF</p><h2>${state.lang==='hu'?'Válassz hozzáférést':'Choose your access'}</h2><div class="alt-plans plan-choice-grid">${['day','month'].map(p=>planCard(p,true)).join('')}</div>${subscriptionHelp()}<p class="fx-note">${fxNote()}</p>`);}
function checkoutSelected(){const intro=state.plan==='day';openModal(`<p class="eyebrow">CHYPERVITALIZE / PDF</p><h2>${state.lang==='hu'?'Kiválasztott csomag':'Selected plan'}</h2><div class="checkout-total"><span>${planLabel(state.plan)}</span><strong>${money(state.plan)}</strong></div><p>${intro?(state.lang==='hu'?`Az első 7 nap ${money('day')}. Ezután automatikusan ${money('month')}/hó, amíg le nem mondod.`:`First 7 days ${money('day')}. Then automatically ${money('month')}/month until cancelled.`):(state.lang==='hu'?`${money('month')}/hó, automatikusan megújul, amíg le nem mondod.`:`${money('month')}/month, automatically renews until cancelled.`)}</p>${subscriptionHelp()}<p class="fx-note">${fxNote()}</p>${button(state.lang==='hu'?'Tovább a fizetéshez':'Continue to payment','pay','primary','download')}<div class="payment-marks"><span>VISA</span><span>mastercard</span><span>stripe</span></div>`);}
async function download(){if(!validEmail(state.cv.email)){toast(t('missingContact'));state.section=0;go('editor');return;}if(!state.cv.name.trim()){toast(t('missingName'));state.section=0;go('editor');return;}save();if(!state.user){state.pendingDownload=true;auth();return;}if(Number(state.user.credits||0)<=0){checkout();return;}await pdf();}
async function pdf(showThanks=true){toast(t('exporting'));try{const res=await fetch('/api/pdf',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({cv:state.cv,labels:strings[state.cvLang],projectKey:state.projectKey,resumeType:state.resumeType,cvStyle:state.cvStyle||state.resumeType,layout:state.layout,basicSide:state.basicSide,cvBackground:state.cvBackground,basicAccent:state.basicAccent,basicAccent2:state.basicAccent2})});if(!res.ok)throw Error();const blob=await res.blob(),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='Chypervitalize-CV.pdf';a.click();setTimeout(()=>URL.revokeObjectURL(url),20000);if(showThanks)openModal(`<div class="success-mark">${icon('check')}</div><h2>${t('thanks')}</h2><p>${t('thanksDesc')}</p>${button(t('downloadAgain'),'download','primary','download')}<button class="text-button" data-action="close">${t('close')}</button>`);else $('#modal').close();}catch{toast(t('error'));}}
function account(){if(!state.user){state.pendingDownload=false;auth();return;}const active=Number(state.user.credits||0)>0,hu=state.lang==='hu';openModal(`<p class="eyebrow">CHYPERVITALIZE</p><h2>${t('account')}</h2><p>${esc(state.user.email)}</p><div class="account-plan"><span>${t('subscription')}</span><strong>${active?planLabel(state.user.plan):t('noSub')}</strong>${active?`<p>${t('validUntil')}: ${new Date(state.user.accessUntil).toLocaleDateString(state.lang)}</p>`:''}<p>${state.user.cancelAtPeriodEnd?(hu?'A megújulás leállítva. A hozzáférés a megjelölt időpontig megmarad.':'Renewal stopped. Access continues until the date shown.'):(active?(hu?'Automatikus megújulás aktív.':'Automatic renewal is active.'):'')}</p></div>${active&&state.user.canCancel&&!state.user.cancelAtPeriodEnd?button(hu?'Megújulás leállítása':'Stop renewal','cancel-renewal','secondary',''):''}${subscriptionHelp()}<hr>${button(t('logout'),'logout','secondary','')}`);}
function review(){const messages=[];if(!state.cv.name.trim())messages.push(t('missingName'));if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(state.cv.email))messages.push(t('missingContact'));if(!state.cv.summary.trim())messages.push(t('missingSummary'));if(!['experience','projects','volunteer'].some(k=>complete(k)))messages.push(t('missingExperience'));if(!state.cv.skills.trim())messages.push(t('missingSkills'));openModal(`<p class="eyebrow">${t('checklist')}</p><h2>${t('review')}</h2><p>${t('reviewHint')}</p><ul class="review-list">${(messages.length?messages:[t('reviewGood')]).map(v=>`<li>${esc(v)}</li>`).join('')}</ul><div id="ai-result"></div>${state.ai?`<p class="hint">${state.lang==='hu'?'Az AI-ellenőrzés a CV tartalmát az OpenAI-nak továbbítja. Csak akkor indítsd el, ha ezt szeretnéd.':'AI review sends your CV content to OpenAI. Start it only if you want to share it.'}</p>${button(state.lang==='hu'?'AI-ellenőrzés indítása':t('review'),'run-ai','primary','spark')}`:''}`);}
function closeLanguageMenu(picker,restoreFocus=false){
 if(!picker?.classList.contains('is-open'))return;
 picker.classList.remove('is-open');
 picker.querySelector('[data-language-trigger]').setAttribute('aria-expanded','false');
 if(restoreFocus)picker.querySelector('[data-language-trigger]').focus();
}
document.addEventListener('click',e=>{
 const trigger=e.target.closest('[data-language-trigger]');
 if(trigger){
  const picker=trigger.closest('[data-language-picker]'),opening=!picker.classList.contains('is-open');
  document.querySelectorAll('.language-picker.is-open').forEach(other=>closeLanguageMenu(other));
  if(opening){picker.classList.add('is-open');trigger.setAttribute('aria-expanded','true');picker.querySelector('.is-selected')?.scrollIntoView({block:'nearest'});}
  return;
 }
 const option=e.target.closest('[data-language-option]');
 if(option){
  const picker=option.closest('[data-language-picker]'),id=picker.querySelector('[data-language-trigger]').id;
  if(locales[option.dataset.languageOption]){
   state.lang=option.dataset.languageOption;
   save();render();
   document.getElementById(id)?.focus();
  }
  return;
 }
 if(!e.target.closest('[data-language-picker]'))document.querySelectorAll('.language-picker.is-open').forEach(picker=>closeLanguageMenu(picker));
});
document.addEventListener('keydown',e=>{
 const picker=e.target.closest('[data-language-picker]');
 if(e.key==='Escape'){
  const opened=document.querySelector('.language-picker.is-open');
  if(opened){e.preventDefault();closeLanguageMenu(opened,true);}
  return;
 }
 if(!picker)return;
 const options=[...picker.querySelectorAll('[data-language-option]')];
 if(!['ArrowDown','ArrowUp','Home','End'].includes(e.key))return;
 e.preventDefault();
 if(!picker.classList.contains('is-open')){
  picker.classList.add('is-open');
  picker.querySelector('[data-language-trigger]').setAttribute('aria-expanded','true');
 }
 const index=options.indexOf(document.activeElement),selected=options.findIndex(option=>option.classList.contains('is-selected'));
 const next=e.key==='Home'?0:e.key==='End'?options.length-1:index<0?selected<0?0:selected:e.key==='ArrowDown'?(index+1)%options.length:(index-1+options.length)%options.length;
 options[next].focus();
});
document.addEventListener('focusin',e=>document.querySelectorAll('.language-picker.is-open').forEach(picker=>{if(!picker.contains(e.target))closeLanguageMenu(picker);}));
document.addEventListener('click',async e=>{const b=e.target.closest('[data-action]');if(!b)return;const a=b.dataset.action;
 if(a.startsWith('lang-level-')){const m=a.match(/^lang-level-(\d+)-([1-5])$/);if(m){state.cv.languageLevels=Array.isArray(state.cv.languageLevels)?state.cv.languageLevels:[];state.cv.languageLevels[Number(m[1])]=Number(m[2]);save();render();}return;}
 if(a.startsWith('rate-')){state.reviewRating=Number(a.slice(5));render();return;}
 if(a==='cancel-renewal'){openModal('<h2>'+(state.lang==='hu'?'Leállítod a megújulást?':'Stop automatic renewal?')+'</h2><p>'+(state.lang==='hu'?'A már kifizetett időszak végéig használhatod a szolgáltatást. A következő automatikus díjterhelést leállítjuk. Ez önmagában nem visszatérítési kérés.':'Access continues until the end of your paid period. The next automatic charge will be stopped. This does not request a refund.')+'</p>'+button(state.lang==='hu'?'Igen, megújulás leállítása':'Yes, stop renewal','confirm-cancel-renewal','primary','')+button(state.lang==='hu'?'Mégse':'Keep subscription','account','secondary',''));return;}
 if(a==='confirm-cancel-renewal'){b.disabled=true;try{const r=await api('subscription/cancel',{});state.user=r.user;account();}catch(err){toast(err.message||t('error'));b.disabled=false;}return;}
 if(a==='preview-example'){previewExample(b.dataset.exampleId);return;}
 if(a==='scroll-pricing'||a==='scroll-how'||a==='scroll-ats'){go('home');requestAnimationFrame(()=>document.querySelector(a==='scroll-pricing'?'#pricing':a==='scroll-how'?'.quick-steps':'.why')?.scrollIntoView({behavior:'smooth',block:'center'}));return;}
 if(a==='setup'){resumeChooser();return;}
 if(a==='show-all-templates'){resumeChooser();return;}
 if(a==='use-example'){selectExample(b.dataset.exampleId);return;}
 if(a.startsWith('move-entry-')){const m=a.match(/^move-entry-(\d+)-(up|down)$/);if(!m)return;const rows=state.cv[sections[state.section]],from=Number(m[1]),to=from+(m[2]==='up'?-1:1);if(!Array.isArray(rows)||from<0||to<0||to>=rows.length)return;[rows[from],rows[to]]=[rows[to],rows[from]];save();render();document.querySelector(`[data-action="move-entry-${to}-${m[2]}"]`)?.focus();return;}
 if(a==='submit-review'){const input=document.querySelector('#review-text'),txt=input?.value.trim();if(!txt)return;try{await api('reviews',{rating:state.reviewRating,text:txt});toast(state.lang==='hu'?'Köszönjük a véleményt!':'Thanks for your review!');await loadReviews();}catch{toast(t('error'));}return;}
 if(a==='basic-side-left'||a==='basic-side-right'){state.basicSide=a.endsWith('right')?'right':'left';save();render();return;}
 if(a==='hero-template-open'){const card=b.closest('.hero-template-card');if(!card)return;if(!card.classList.contains('is-front')){focusHeroExample(Number(card.dataset.templateIndex));return;}selectExample(card.dataset.exampleId);return;}
 if(a==='hero-template-dot'){focusHeroExample(Number(b.dataset.templateIndex));return;}
 if(a==='hero-template-prev'||a==='hero-template-next'){const cards=[...document.querySelectorAll('.hero-template-card')];if(!cards.length)return;const oldI=Math.max(0,cards.findIndex(card=>card.classList.contains('is-front')));const step=a==='hero-template-next'?1:-1;focusHeroExample((oldI+step+cards.length)%cards.length);return;}
 if(a==='hero-cv-basic'||a==='hero-cv-ats'){const basic=document.querySelector('.sample-basic'),ats=document.querySelector('.sample-ats');if(!basic||!ats)return;const basicFront=a==='hero-cv-basic';basic.classList.toggle('is-front',basicFront);ats.classList.toggle('is-front',!basicFront);return;}
 if(a==='home')go('home');
 else if(a==='start')resumeChooser();
 else if(a.startsWith('choose-style-')){const style=a.slice(13);state.resumeType=style==='basic'?'basic':'ats';state.cvStyle=style;save();$('#modal').close();go('setup');}
 else if(a==='choose-basic'){state.resumeType='basic';save();$('#modal').close();go('setup');}
 else if(a==='choose-ats'){state.resumeType='ats';save();$('#modal').close();go('setup');}
 else if(a==='edit')go('editor');
 else if(a==='account')account();
 else if(a==='close')$('#modal').close();
 else if(a==='unavailable'){openModal(`<p class="eyebrow">CHYPERVITALIZE</p><h2>${state.lang==='hu'?'Jelenleg nem elérhető':'Currently unavailable'}</h2><p>${state.lang==='hu'?'Ez a csomag jelenleg nem elérhető. Szíves türelmedet köszönjük!':'This plan is currently unavailable. Thank you for your patience.'}</p>`);}
 else if(a.startsWith('plan-')){state.plan=a.slice(5);go('setup');}
 else if(a.startsWith('section-')){state.section=Number(a.slice(8));render();}
 else if(a==='next-section'){state.section=Math.min(9,state.section+1);render();}
 else if(a==='prev-section'){if(state.section)state.section--;else{go('setup');return;}render();}
 else if(a==='add-entry'){state.cv[sections[state.section]].push({heading:'',organization:'',location:'',dates:'',details:''});save();render();}
 else if(a.startsWith('remove-entry-')){state.cv[sections[state.section]].splice(Number(a.slice(13)),1);save();render();}
 else if(a==='remove-photo'){state.cv.photo='';save();render();}
 else if(a==='verify-payment')await verifyPayment();
 else if(a==='payment-login'){state.paymentResume=true;state.authMode='login';auth();}
 else if(a==='paid-download'){await pdf(false);}
 else if(a==='download')await download();
 else if(a==='other-plans')otherPlans();
 else if(a.startsWith('select-plan-')){state.plan=a.slice(12);checkoutSelected();}
 else if(a.startsWith('auth-')){state.authMode=a.slice(5);auth();}
 else if(a==='pay'){b.disabled=true;try{clearTimeout(saveTimer);save();clearTimeout(saveTimer);await api('draft',snapshot());const r=await api('checkout',{plan:state.plan,language:state.lang});if(!r.url||!/^https:\/\/checkout\.stripe\.com\//.test(r.url))throw Error('checkout');if(r.sessionId){checkoutSession=r.sessionId;localStorage.setItem('chypervitalize-checkout-session',r.sessionId);}window.location.assign(r.url);}catch(err){toast(err.message&&err.message!=='checkout'?err.message:t('error'));b.disabled=false;}}
 else if(a==='logout'){clearTimeout(saveTimer);try{await api('draft',snapshot());}catch{toast(t('error'));return;}await api('logout',{});state.user=null;state.cv=structuredClone(blank);state.cvEdited=false;state.exampleId=null;state.layout=normalizeLayout(null);localStorage.removeItem('chypervitalize-draft');$('#modal').close();render();}
 else if(a==='review')review();
 else if(a==='copy-ref'){try{await navigator.clipboard.writeText(location.origin+'/?ref='+state.user.ref);toast(t('copied'));}catch{toast(t('error'));}}
 else if(a==='run-ai'){if(!state.user){toast(t('aiLogin'));return;}b.disabled=true;$('#ai-result').textContent=t('reviewBusy');try{const r=await api('ai',{language:locales[state.lang].name,cv:state.cv});$('#ai-result').textContent=r.text;}catch{$('#ai-result').textContent=t('error');}b.disabled=false;}
 else if(a==='restore-account'||a==='keep-current'){if(a==='restore-account'){
  const data=state.restore;state.cv={...structuredClone(blank),...data.cv};
  state.cvLang=data.cvLang||state.cvLang;state.lang=data.lang||state.lang;
  state.cvEdited=data.cvEdited===true;state.exampleId=data.exampleId||null;state.layout=normalizeLayout(data.layout);
  state.resumeType=data.resumeType==='basic'?'basic':'ats';state.cvStyle=data.cvStyle||data.resumeType||'ats';
  if(validHex(data.basicAccent))state.basicAccent=data.basicAccent;
  if(validHex(data.basicAccent2))state.basicAccent2=data.basicAccent2;
  if(validHex(data.cvBackground))state.cvBackground=data.cvBackground;
  state.basicShade=Math.min(45,Math.max(0,Number(data.basicShade)||0));state.basicSide=data.basicSide==='right'?'right':'left';
  state.customAccent=data.customAccent===true;state.customAccent2=data.customAccent2===true;
  if(typeof data.projectKey==='string'&&data.projectKey.length<100)state.projectKey=data.projectKey;
 }delete state.restore;save();$('#modal').close();render();if(state.pendingDownload){state.pendingDownload=false;download();}}
});
 document.addEventListener('input',e=>{if(!e.target.dataset.field)return;state.cvEdited=true;state.exampleId=null;document.querySelector('.preview-demo-note')?.remove();const k=e.target.dataset.field;if(e.target.dataset.row!==undefined){const rows=state.cv[sections[state.section]],index=Number(e.target.dataset.row);while(rows.length<=index)rows.push({heading:'',organization:'',location:'',dates:'',details:''});rows[index][k]=e.target.value;}else state.cv[k]=e.target.value;if(k==='email'){const invalid=!!e.target.value&&!validEmail(e.target.value);e.target.setAttribute('aria-invalid',String(invalid));const error=$('#email-error');if(error)error.hidden=!invalid;}save();document.querySelectorAll('.section-link .nav-num').forEach((node,i)=>{node.textContent=complete(sections[i])?'✓':String(i+1).padStart(2,'0');});const progress=document.querySelector('.nav-title span');if(progress)progress.textContent=sections.filter(complete).length+'/'+sections.length;$('#cv-preview').innerHTML=activeCvMarkup(editorPreviewData(),state.cvLang,true);});
document.addEventListener('change',async e=>{if(['header-language','setup-language'].includes(e.target.id)){state.lang=e.target.value;save();render();}else if(e.target.id==='cv-language'){state.cvLang=e.target.value;save();render();}else if(e.target.id==='basic-accent'){state.basicAccent=e.target.value;save();render();}else if(e.target.id==='basic-accent-2'){state.basicAccent2=e.target.value;save();render();}else if(e.target.id==='cv-background'){if(/^#[0-9a-f]{6}$/i.test(e.target.value)){state.cvBackground=e.target.value;save();render();}}else if(e.target.id==='basic-shade'){state.basicShade=Number(e.target.value)||0;save();render();}else if(e.target.id==='plan-select'){state.plan=e.target.value;$('#plan-details').textContent=t(state.plan==='month'?'monthly':'once');$('#checkout-price').textContent=money(state.plan);}else if(e.target.id==='photo-input'){const file=e.target.files[0];if(!file)return;if(file.size>1000000||!['image/jpeg','image/png'].includes(file.type)){toast(t('photoError'));return;}const reader=new FileReader();reader.onload=()=>{state.cv.photo=reader.result;save();render();};reader.readAsDataURL(file);}});
document.addEventListener('input',e=>{
 const colorKey={'cv-text-color':'textColor','cv-heading-color':'headingColor'}[e.target.id];
 if(colorKey&&validHex(e.target.value)){state.layout[colorKey]=e.target.value;save();if($('#cv-preview'))$('#cv-preview').innerHTML=activeCvMarkup(editorPreviewData(),state.cvLang,true);}
 if(e.target.id==='basic-accent')state.customAccent=true;
 if(e.target.id==='basic-accent-2')state.customAccent2=true;
});
document.addEventListener('change',e=>{
 if(e.target.id==='basic-accent')state.customAccent=true;
 if(e.target.id==='basic-accent-2')state.customAccent2=true;
},true);
document.addEventListener('change',e=>{
 if(e.target.id==='cv-font')state.layout.font=e.target.value==='serif'?'serif':'sans';
 else if(e.target.id==='cv-columns'){
  state.layout.columns=e.target.value==='two'?'two':'one';
  if(state.layout.columns==='two'&&layoutKeys.every(key=>state.layout.widths[key]==='full'))layoutKeys.filter(key=>key!=='summary').forEach(key=>{state.layout.widths[key]='half';});
 }else if(e.target.dataset.layoutWidth&&layoutKeys.includes(e.target.dataset.layoutWidth))state.layout.widths[e.target.dataset.layoutWidth]=e.target.value==='half'?'half':'full';
 else if(e.target.dataset.layoutPlacement&&layoutKeys.includes(e.target.dataset.layoutPlacement)){
  if(['main','side'].includes(e.target.value))state.layout.placements[e.target.dataset.layoutPlacement]=e.target.value;
  else delete state.layout.placements[e.target.dataset.layoutPlacement];
 }else return;
 save();render();
});
document.addEventListener('click',e=>{
 const action=e.target.closest('[data-action]')?.dataset.action||'';
 if(action==='toggle-layout'){state.layoutOpen=!state.layoutOpen;return;}
 if(action==='reset-layout'){state.layout=normalizeLayout(null);state.basicSide='left';save();render();return;}
 const match=action.match(/^move-section-(\d+)-(up|down)$/);if(!match)return;
 const from=Number(match[1]),to=from+(match[2]==='up'?-1:1),order=state.layout.order;
 if(to<0||to>=order.length)return;
 [order[from],order[to]]=[order[to],order[from]];save();render();
 document.querySelector(`[data-action="move-section-${to}-${match[2]}"]`)?.focus();
});
document.addEventListener('submit',async e=>{if(e.target.id!=='auth-form')return;e.preventDefault();const f=e.target,button=f.querySelector('button');button.disabled=true;try{const r=await api('auth',{email:f.email.value,password:f.password.value,mode:state.authMode,ref:localStorage.getItem('chypervitalize-ref')});state.user=r.user;if(state.paymentResume){state.paymentResume=false;const {draft}=await api('draft');if(draft&&!stored){state.cv={...structuredClone(blank),...draft.cv};state.cvLang=draft.cvLang||state.cvLang;}$('#modal').close();await verifyPayment();return;}const {draft}=await api('draft');if(draft){state.restore=draft;openModal(`<h2>${t('confirmRestore')}</h2>${buttonHTML(t('restore'),'restore-account')}${buttonHTML(t('keep'),'keep-current')}`);render();return;}save();$('#modal').close();render();if(state.pendingDownload){state.pendingDownload=false;download();}}catch{$('#auth-error').textContent=t('authError');button.disabled=false;}});
function buttonHTML(label,action){return `<button class="secondary" data-action="${action}">${label}</button>`;}
$('#modal').addEventListener('click',e=>{if(e.target===$('#modal')){const r=$('#modal').getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)$('#modal').close();}});
const reducedLandscapeMotion=matchMedia('(prefers-reduced-motion: reduce)');
let landscapeFrame=0;
function updateLandscapePosition(){
 landscapeFrame=0;
 const shift=!reducedLandscapeMotion.matches&&document.querySelector('.hero-reference')?Math.min(60,Math.max(0,window.scrollY*.035)):0;
 document.body.style.setProperty('--landscape-shift',`${shift.toFixed(1)}px`);
}
function queueLandscapePosition(){if(!landscapeFrame)landscapeFrame=requestAnimationFrame(updateLandscapePosition);}
window.addEventListener('scroll',queueLandscapePosition,{passive:true});
window.addEventListener('resize',queueLandscapePosition,{passive:true});
reducedLandscapeMotion.addEventListener('change',queueLandscapePosition);
render();refreshFx();recordVisit();
document.addEventListener('visibilitychange',()=>{if(!document.hidden&&Date.now()-fxCheckedAt>4*60*60*1000)refreshFx();});
api('me').then(async r=>{
 queueLandscapePosition();
 state.user=r.user;state.ai=r.ai;state.demo=r.demo;
  if(state.user){try{const {draft}=await api('draft');if(draft&&!stored){
   state.cv={...structuredClone(blank),...draft.cv};
   state.cvLang=draft.cvLang||state.cvLang;state.lang=draft.lang||state.lang;
   state.cvEdited=draft.cvEdited===true;state.exampleId=draft.exampleId||null;state.layout=normalizeLayout(draft.layout);
   state.resumeType=draft.resumeType==='basic'?'basic':'ats';state.cvStyle=draft.cvStyle||draft.resumeType||state.cvStyle;
   if(validHex(draft.basicAccent))state.basicAccent=draft.basicAccent;
   if(validHex(draft.basicAccent2))state.basicAccent2=draft.basicAccent2;
   if(validHex(draft.cvBackground))state.cvBackground=draft.cvBackground;
   state.customAccent=draft.customAccent===true;state.customAccent2=draft.customAccent2===true;
   state.basicShade=Math.min(45,Math.max(0,Number(draft.basicShade)||0));state.basicSide=draft.basicSide==='right'?'right':'left';
  }}catch{}}
 if(checkoutResult==='success'){await verifyPayment();return;}else if(checkoutSession){localStorage.removeItem('chypervitalize-checkout-session');checkoutSession=null;}
 if(checkoutResult==='cancelled'){localStorage.removeItem('chypervitalize-checkout-session');state.route='editor';render();return;}
 if(state.user){
  if(!(Number(state.user.credits||0)>0)){try{const paid=await api('checkout-status',{});state.user=paid.user||state.user;if(paid.paid&&Number(state.user.credits||0)>0){state.route='editor';render();showDownloadModal();return;}}catch{}}
 }
 render();
}).catch(()=>{if(checkoutResult==='success'){state.route='payment';state.payment='error';render();}});

function fitExamples(){document.querySelectorAll('.cv-fit').forEach(container=>{const paper=container.querySelector('.cv-paper');if(!paper)return;paper.style.setProperty('transform','none','important');const scale=Math.min(container.clientWidth/620,container.clientHeight/Math.max(paper.scrollHeight,877));paper.style.setProperty('transform','scale('+scale+')','important');paper.style.left=((container.clientWidth-620*scale)/2)+'px';});}
function previewExample(id){const example=getCvExample(id,state.lang);if(!example)return;openModal('<div class="example-modal-heading"><p class="eyebrow">CHYPERVITALIZE / '+(state.lang==='hu'?'ELŐNÉZET':'PREVIEW')+'</p><h2>'+esc(example.label)+'</h2><p>'+(state.lang==='hu'?'Fiktív mintaadatok. A saját CV-det a szerkesztőben töltheted ki.':'Fictional example. Enter your own details in the editor.')+'</p></div><div class="example-modal-sheet">'+exampleCvMarkup(example.cv,state.lang==='hu'?'hu':'en',example.style)+'</div>'+button(state.lang==='hu'?'Ezt a sablont választom':'Use this template','use-example','primary').replace('data-action="use-example"','data-action="use-example" data-example-id="'+esc(id)+'"'));}
window.addEventListener('resize',fitExamples);document.fonts.ready.then(fitExamples);

function readableColor(color,background){const lum=hex=>[1,3,5].map(i=>parseInt(hex.slice(i,i+2),16)/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4).reduce((s,v,i)=>s+v*[.2126,.7152,.0722][i],0);const a=lum(color),b=lum(background);return (Math.max(a,b)+.05)/(Math.min(a,b)+.05)>=4.5?color:b<.179?'#ffffff':'#252921';}



function planCard(plan,compact=false){
 const hu=state.lang==='hu',monthly=plan==='month';
 const features=hu?['10 CV-stílus – például ATS egy egyszerű pályázathoz, Executive Gold vezetői szerephez','PDF-letöltés aktív hozzáféréssel – küldhető jelentkezéshez','Élő előnézet és szerkesztés – a saját adataiddal, színeiddel','Piszkozatmentés – később is folytathatod','Ellenőrzőlista – észreveszed a hiányzó alapadatokat']:['10 CV styles – for example ATS for a simple application, Executive Gold for a leadership role','PDF export with active access – ready for applications','Live preview and editing – your details and colors','Draft saving – continue later','Checklist – spot missing essential details'];
 return `<article class="price-card ${monthly?'recommended':''}"><span class="ribbon">${hu?(monthly?'Hosszabb álláskereséshez':'Első jelentkezéshez'):(monthly?'For a longer job search':'For your first application')}</span><h3>${planLabel(plan)}</h3><p class="plan-fit">${hu?(monthly?'Több pályázat. Több idő a finomításra.':'Gyors kezdés egy konkrét jelentkezéshez.'):(monthly?'More applications. More time to refine.':'A quick start for a specific application.')}</p><strong class="current-price">${money(plan)}</strong><p>${monthly?(hu?`${money('month')}/hó, automatikus megújulással.`:`${money('month')}/month, automatically renewing.`):(hu?`Az első 7 nap ${money('day')}, utána automatikusan ${money('month')}/hó.`:`First 7 days ${money('day')}, then automatically ${money('month')}/month.`)}</p><div class="plan-scenario"><strong>${hu?'Mikor érdemes?':'When is it useful?'}</strong><p>${hu?(monthly?'Több álláshirdetésre jelentkezel a hónap során: igazítsd a CV-det egy pénzügyi, majd egy elemzői pozícióhoz, és később is frissítsd.':'Ezen a héten elkészítenéd és elküldenéd a CV-det egy kiválasztott állásra. Minden sablont és szerkesztési funkciót megkapsz.'):(monthly?'Apply throughout the month: tailor your CV to a finance role, then an analyst position, and update it later.':'Create and send your CV for one selected job this week. Every template and editing feature is included.')}</p></div><ul class="plan-features">${features.map(f=>`<li class="feature-included"><span class="feature-status" aria-hidden="true">✓</span><span>${esc(f)}</span></li>`).join('')}</ul>${button(hu?(monthly?'Havi hozzáférést választok':'Az első hetet választom'):'Choose this plan',(compact?'select-plan-':'plan-')+plan,'primary','arrow')}</article>`;
}
function subscriptionHelp(){const hu=state.lang==='hu';return `<div class="subscription-help"><details><summary>${hu?'Hogyan működik a lemondás?':'How does cancellation work?'}</summary><p>${hu?'A megújulást bármikor leállíthatod a fiókodban. A hozzáférés a már kifizetett időszak végéig megmarad, a következő automatikus terhelés elmarad. Az első hetes csomagnál ez a 7. nap utáni havi megújulást is leállítja. A lemondás önmagában nem jelent visszatérítést.':'Stop renewal anytime in your account. Access remains until the end of the paid period, and the next automatic charge is stopped. For first-week access, this also stops the monthly renewal after day 7. Cancellation alone does not request a refund.'}</p></details><details><summary>${hu?'Reklamáció, elállás és visszatérítés':'Complaints, withdrawal and refunds'}</summary><p>${hu?'Visszatérítési kéréshez vagy elálláshoz írj a fiókod e-mail-címéről, add meg a fizetés dátumát és az érintett befizetést. A reklamáció leírása segít a kivizsgálásban; jogszabály szerinti elállást nem kell indokolnod. Az elfogadott visszatérítést az eredeti fizetési módra indítjuk. A jogszabály szerinti fogyasztói jogaidat ez nem korlátozza.':'For a refund or withdrawal request, write from your account email and include the payment date and affected payment. Describing a complaint helps us investigate; statutory withdrawal does not require a reason. Approved refunds are sent to the original payment method. Your statutory consumer rights remain unaffected.'}</p><a href="mailto:chypervitalize@gmail.com?subject=${encodeURIComponent(hu?'Elállás / visszatérítési kérés':'Withdrawal / refund request')}">${hu?'Elállás vagy visszatérítés kérése e-mailben':'Request withdrawal or refund by email'}</a></details></div>`;}
