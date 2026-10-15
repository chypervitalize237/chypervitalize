/* Optional Meta PageView measurement. Functional CV storage and billing are independent. */
(() => {
 'use strict';
 const PIXEL_ID='1902894290691482';
 const STORAGE_KEY='chypervitalize-marketing-consent-v1';
 const VERSION=1,MAX_AGE=180*24*60*60*1000;
 const COPY={"hu":{"title":"Marketingcélú sütik","body":"Engedélyeddel a Meta Pixel méri a látogatásokat és a hirdetések teljesítményét. A Meta technikai adatokat, az oldal címét és süti-azonosítókat kap. Az elutasítás nem befolyásolja az önéletrajz-készítő működését.","accept":"Elfogadom","reject":"Elutasítom","settings":"Sütibeállítások","privacy":"Adatvédelem","statusOn":"A marketingcélú sütik engedélyezve vannak.","statusOff":"A marketingcélú sütik le vannak tiltva."},"en":{"title":"Marketing cookies","body":"With your permission, Meta Pixel measures visits and ad performance. Meta receives technical data, the page address and cookie identifiers. Rejecting does not affect the CV builder.","accept":"Accept","reject":"Reject","settings":"Cookie settings","privacy":"Privacy","statusOn":"Marketing cookies are enabled.","statusOff":"Marketing cookies are disabled."},"de":{"title":"Marketing-Cookies","body":"Mit deiner Einwilligung misst das Meta Pixel Besuche und die Leistung von Anzeigen. Meta erhält technische Daten, die Seitenadresse und Cookie-Kennungen. Eine Ablehnung beeinträchtigt den Lebenslauf-Editor nicht.","accept":"Akzeptieren","reject":"Ablehnen","settings":"Cookie-Einstellungen","privacy":"Datenschutz","statusOn":"Marketing-Cookies sind aktiviert.","statusOff":"Marketing-Cookies sind deaktiviert."},"fr":{"title":"Cookies marketing","body":"Avec votre accord, le pixel Meta mesure les visites et les performances publicitaires. Meta reçoit des données techniques, l’adresse de la page et des identifiants de cookies. Refuser n’affecte pas l’outil de création de CV.","accept":"Accepter","reject":"Refuser","settings":"Paramètres des cookies","privacy":"Confidentialité","statusOn":"Les cookies marketing sont activés.","statusOff":"Les cookies marketing sont désactivés."},"es":{"title":"Cookies de marketing","body":"Con tu permiso, Meta Pixel mide las visitas y el rendimiento de los anuncios. Meta recibe datos técnicos, la dirección de la página e identificadores de cookies. Rechazar no afecta al creador de CV.","accept":"Aceptar","reject":"Rechazar","settings":"Configuración de cookies","privacy":"Privacidad","statusOn":"Las cookies de marketing están activadas.","statusOff":"Las cookies de marketing están desactivadas."},"it":{"title":"Cookie di marketing","body":"Con il tuo consenso, Meta Pixel misura le visite e le prestazioni degli annunci. Meta riceve dati tecnici, l’indirizzo della pagina e identificatori dei cookie. Il rifiuto non influisce sullo strumento per creare CV.","accept":"Accetta","reject":"Rifiuta","settings":"Impostazioni dei cookie","privacy":"Privacy","statusOn":"I cookie di marketing sono attivati.","statusOff":"I cookie di marketing sono disattivati."},"pt":{"title":"Cookies de marketing","body":"Com a sua autorização, o Meta Pixel mede as visitas e o desempenho dos anúncios. A Meta recebe dados técnicos, o endereço da página e identificadores de cookies. A recusa não afeta o criador de CV.","accept":"Aceitar","reject":"Rejeitar","settings":"Definições de cookies","privacy":"Privacidade","statusOn":"Os cookies de marketing estão ativados.","statusOff":"Os cookies de marketing estão desativados."},"nl":{"title":"Marketingcookies","body":"Met je toestemming meet Meta Pixel bezoeken en advertentieprestaties. Meta ontvangt technische gegevens, het pagina-adres en cookie-identificatoren. Afwijzen heeft geen invloed op de cv-maker.","accept":"Accepteren","reject":"Afwijzen","settings":"Cookie-instellingen","privacy":"Privacy","statusOn":"Marketingcookies zijn ingeschakeld.","statusOff":"Marketingcookies zijn uitgeschakeld."},"sk":{"title":"Marketingové súbory cookie","body":"S vaším súhlasom Meta Pixel meria návštevy a výkonnosť reklám. Meta získava technické údaje, adresu stránky a identifikátory súborov cookie. Odmietnutie nemá vplyv na fungovanie nástroja na tvorbu životopisu.","accept":"Prijať","reject":"Odmietnuť","settings":"Nastavenia súborov cookie","privacy":"Ochrana súkromia","statusOn":"Marketingové súbory cookie sú povolené.","statusOff":"Marketingové súbory cookie sú zakázané."},"cs":{"title":"Marketingové soubory cookie","body":"S vaším souhlasem Meta Pixel měří návštěvy a výkonnost reklam. Meta získává technické údaje, adresu stránky a identifikátory souborů cookie. Odmítnutí nemá vliv na fungování nástroje pro tvorbu životopisu.","accept":"Přijmout","reject":"Odmítnout","settings":"Nastavení souborů cookie","privacy":"Ochrana soukromí","statusOn":"Marketingové soubory cookie jsou povoleny.","statusOff":"Marketingové soubory cookie jsou zakázány."},"pl":{"title":"Marketingowe pliki cookie","body":"Za Twoją zgodą Meta Pixel mierzy wizyty i skuteczność reklam. Meta otrzymuje dane techniczne, adres strony i identyfikatory plików cookie. Odrzucenie nie wpływa na działanie kreatora CV.","accept":"Akceptuję","reject":"Odrzucam","settings":"Ustawienia plików cookie","privacy":"Prywatność","statusOn":"Marketingowe pliki cookie są włączone.","statusOff":"Marketingowe pliki cookie są wyłączone."},"ro":{"title":"Cookie-uri de marketing","body":"Cu acordul tău, Meta Pixel măsoară vizitele și performanța reclamelor. Meta primește date tehnice, adresa paginii și identificatori de cookie-uri. Refuzul nu afectează instrumentul de creare a CV-ului.","accept":"Acceptă","reject":"Refuză","settings":"Setări cookie-uri","privacy":"Confidențialitate","statusOn":"Cookie-urile de marketing sunt activate.","statusOff":"Cookie-urile de marketing sunt dezactivate."},"hr":{"title":"Marketinški kolačići","body":"Uz vašu privolu Meta Pixel mjeri posjete i uspješnost oglasa. Meta prima tehničke podatke, adresu stranice i identifikatore kolačića. Odbijanje ne utječe na alat za izradu životopisa.","accept":"Prihvati","reject":"Odbij","settings":"Postavke kolačića","privacy":"Privatnost","statusOn":"Marketinški kolačići su omogućeni.","statusOff":"Marketinški kolačići su onemogućeni."},"sl":{"title":"Trženjski piškotki","body":"Z vašim soglasjem Meta Pixel meri obiske in uspešnost oglasov. Meta prejme tehnične podatke, naslov strani in identifikatorje piškotkov. Zavrnitev ne vpliva na urejevalnik življenjepisa.","accept":"Sprejmi","reject":"Zavrni","settings":"Nastavitve piškotkov","privacy":"Zasebnost","statusOn":"Trženjski piškotki so omogočeni.","statusOff":"Trženjski piškotki so onemogočeni."},"sr":{"title":"Marketinški kolačići","body":"Uz vašu saglasnost Meta Pixel meri posete i uspešnost oglasa. Meta prima tehničke podatke, adresu stranice i identifikatore kolačića. Odbijanje ne utiče na alat za izradu CV-ja.","accept":"Prihvati","reject":"Odbij","settings":"Podešavanja kolačića","privacy":"Privatnost","statusOn":"Marketinški kolačići su omogućeni.","statusOff":"Marketinški kolačići su onemogućeni."},"bg":{"title":"Маркетингови бисквитки","body":"С вашето съгласие Meta Pixel измерва посещенията и ефективността на рекламите. Meta получава технически данни, адреса на страницата и идентификатори на бисквитки. Отказът не засяга редактора на автобиографии.","accept":"Приемам","reject":"Отказвам","settings":"Настройки на бисквитките","privacy":"Поверителност","statusOn":"Маркетинговите бисквитки са разрешени.","statusOff":"Маркетинговите бисквитки са забранени."},"el":{"title":"Cookies μάρκετινγκ","body":"Με τη συγκατάθεσή σας, το Meta Pixel μετρά τις επισκέψεις και την απόδοση των διαφημίσεων. Η Meta λαμβάνει τεχνικά δεδομένα, τη διεύθυνση της σελίδας και αναγνωριστικά cookies. Η απόρριψη δεν επηρεάζει το εργαλείο δημιουργίας βιογραφικού.","accept":"Αποδοχή","reject":"Απόρριψη","settings":"Ρυθμίσεις cookies","privacy":"Απόρρητο","statusOn":"Τα cookies μάρκετινγκ είναι ενεργοποιημένα.","statusOff":"Τα cookies μάρκετινγκ είναι απενεργοποιημένα."},"da":{"title":"Marketingcookies","body":"Med dit samtykke måler Meta Pixel besøg og annoncernes effektivitet. Meta modtager tekniske data, sidens adresse og cookie-id’er. Hvis du afviser, påvirker det ikke CV-værktøjet.","accept":"Acceptér","reject":"Afvis","settings":"Cookieindstillinger","privacy":"Privatliv","statusOn":"Marketingcookies er aktiveret.","statusOff":"Marketingcookies er deaktiveret."},"sv":{"title":"Marknadsföringskakor","body":"Med ditt samtycke mäter Meta Pixel besök och annonsresultat. Meta får tekniska uppgifter, sidans adress och kakidentifierare. Att avvisa påverkar inte CV-verktyget.","accept":"Godkänn","reject":"Avvisa","settings":"Inställningar för kakor","privacy":"Integritet","statusOn":"Marknadsföringskakor är aktiverade.","statusOff":"Marknadsföringskakor är inaktiverade."},"no":{"title":"Informasjonskapsler for markedsføring","body":"Med ditt samtykke måler Meta Pixel besøk og annonseresultater. Meta mottar tekniske data, sidens adresse og informasjonskapsel-ID-er. Å avslå påvirker ikke CV-verktøyet.","accept":"Godta","reject":"Avslå","settings":"Innstillinger for informasjonskapsler","privacy":"Personvern","statusOn":"Informasjonskapsler for markedsføring er aktivert.","statusOff":"Informasjonskapsler for markedsføring er deaktivert."},"fi":{"title":"Markkinointievästeet","body":"Luvallasi Meta Pixel mittaa käyntejä ja mainosten tehokkuutta. Meta saa teknisiä tietoja, sivun osoitteen ja evästetunnisteita. Hylkääminen ei vaikuta CV-työkaluun.","accept":"Hyväksy","reject":"Hylkää","settings":"Evästeasetukset","privacy":"Tietosuoja","statusOn":"Markkinointievästeet ovat käytössä.","statusOff":"Markkinointievästeet eivät ole käytössä."}};
 const esc=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const readChoice=()=>{
  let raw;try{raw=localStorage.getItem(STORAGE_KEY);}catch{return undefined;}
  try{
   const record=JSON.parse(raw);
   if(record?.version===VERSION&&typeof record.marketing==='boolean'&&Number.isFinite(record.savedAt)&&record.savedAt<=Date.now()&&Date.now()-record.savedAt<MAX_AGE)return record;
  }catch{}
  return null;
 };
 const initial=readChoice();
 let choice=initial?.marketing??null,choiceSavedAt=initial?.savedAt||0,memoryOnly=false,context='home',attempted=false,ready=false,granted=false,pageViewSent=false;
 let previousFocus=null;
 const page=document.createElement('section');
 page.id='marketing-consent-panel';page.hidden=true;
 page.setAttribute('role','region');page.setAttribute('aria-labelledby','marketing-consent-title');
 const preferences=document.createElement('div');preferences.id='marketing-preferences';
 document.body.append(page,preferences);
 function text(){return COPY[document.documentElement.lang]||COPY.en;}
 function render(){
  const c=text();
  page.innerHTML=`<div class="marketing-consent-copy"><h2 id="marketing-consent-title">${esc(c.title)}</h2><p>${esc(c.body)} <a href="/privacy.html#marketing-cookies">${esc(c.privacy)}</a></p><p class="marketing-consent-status">${choice===null?'':esc(choice?c.statusOn:c.statusOff)}</p></div><div class="marketing-consent-actions"><button type="button" data-marketing-action="reject">${esc(c.reject)}</button><button type="button" data-marketing-action="accept">${esc(c.accept)}</button></div>`;
  preferences.innerHTML=`<button type="button" data-marketing-action="settings" aria-controls="marketing-consent-panel" aria-expanded="${!page.hidden}">${esc(c.settings)}</button>`;
 }
 function show(){previousFocus=document.activeElement;page.hidden=false;render();}
 function hide(){page.hidden=true;render();const target=previousFocus?.isConnected?previousFocus:preferences.querySelector('button');target?.focus({preventScroll:true});previousFocus=null;}
 function safeLanding(){
  if(!['/','/index.html'].includes(location.pathname))return false;
  const url=new URL(location.href),allowed=new Set(['fbclid','utm_source','utm_medium','utm_campaign','utm_id','utm_content','utm_term']);
  for(const [key,value] of url.searchParams){if(!allowed.has(key)||value.length>300||/@|%40/i.test(value))return false;}
  if(url.hash&&!['#cv-examples','#pricing','#ats'].includes(url.hash))return false;
  if(document.referrer){try{const source=new URL(document.referrer);if(source.search||source.hash||source.origin===location.origin&&!['/','/index.html'].includes(source.pathname))return false;}catch{return false;}}
  return true;
 }
 function eligible(){return choice===true&&choiceSavedAt<=Date.now()&&Date.now()-choiceSavedAt<MAX_AGE&&context==='home'&&safeLanding()&&!document.getElementById('modal')?.open;}
 function clearMetaCookies(){
  const host=location.hostname,domains=[''];
  if(host!=='localhost'&&!/^[\d.]+$/.test(host)){
   const parts=host.split('.');for(let i=0;i<parts.length-1;i++)domains.push(parts.slice(i).join('.'));
  }
  for(const name of ['_fbp','_fbc'])for(const domain of domains){
   document.cookie=`${name}=; Max-Age=0; Path=/; SameSite=Lax${domain?'; Domain='+domain:''}${location.protocol==='https:'?'; Secure':''}`;
  }
 }
 function revoke(){
  if(typeof window.fbq==='function'&&attempted)window.fbq('consent','revoke');
  granted=false;
 }
 function loadPixel(){
  if(attempted||!eligible())return;
  attempted=true;
  if(!window.fbq){
   const queue=function(){queue.callMethod?queue.callMethod.apply(queue,arguments):queue.queue.push(arguments);};
   window.fbq=queue;if(!window._fbq)window._fbq=queue;
   queue.push=queue;queue.loaded=true;queue.version='2.0';queue.queue=[];
  }
  window.fbq('consent','revoke');
  window.fbq('set','autoConfig',false,PIXEL_ID);
  window.fbq('init',PIXEL_ID);
  const script=document.createElement('script');
  script.async=true;script.src='https://connect.facebook.net/en_US/fbevents.js';script.id='chyper-meta-pixel';
  script.onload=()=>{ready=true;document.documentElement.dataset.metaPixelStatus='loaded';sync();};
  script.onerror=()=>{document.documentElement.dataset.metaPixelStatus='unavailable';};
  document.head.append(script);
 }
 function sync(){
  const before=choice,latest=memoryOnly?undefined:readChoice();
  if(latest!==undefined){choice=latest?.marketing??null;choiceSavedAt=latest?.savedAt||0;}
  if(choice!==null&&(choiceSavedAt>Date.now()||Date.now()-choiceSavedAt>=MAX_AGE))choice=null;
  if(before!==choice){if(choice!==true){revoke();clearMetaCookies();}if(choice===null)show();else render();}
  if(!eligible()){if(granted)revoke();return;}
  loadPixel();if(!ready)return;
  if(!granted){window.fbq('consent','grant');granted=true;}
  if(!pageViewSent){window.fbq('trackSingle',PIXEL_ID,'PageView');pageViewSent=true;}
 }
 function decide(value){
  choice=value;choiceSavedAt=Date.now();memoryOnly=false;
  try{localStorage.setItem(STORAGE_KEY,JSON.stringify({version:VERSION,marketing:value,savedAt:choiceSavedAt}));}catch{memoryOnly=true;}
  if(!value){revoke();clearMetaCookies();}
  hide();sync();
 }
 window.ChyperMarketing=Object.freeze({setPageContext(route){context=route==='home'?'home':'private';sync();},pause(){revoke();}});
 document.addEventListener('click',event=>{
  const button=event.target.closest('[data-marketing-action]');if(!button)return;
  const action=button.dataset.marketingAction;
  if(action==='settings')show();else if(action==='accept')decide(true);else if(action==='reject')decide(false);
 });
 document.addEventListener('keydown',event=>{if(event.key==='Escape'&&!page.hidden)hide();});
 window.addEventListener('storage',event=>{
  if(event.key!==STORAGE_KEY&&event.key!==null)return;
  const latest=readChoice();if(latest===undefined)return;
  memoryOnly=false;choice=latest?.marketing??null;choiceSavedAt=latest?.savedAt||0;if(choice!==true){revoke();clearMetaCookies();}render();if(choice===null)show();sync();
 });
 window.addEventListener('pageshow',sync);
 window.addEventListener('hashchange',sync);
 document.addEventListener('visibilitychange',()=>{if(!document.hidden)sync();});
 const languageObserver=new MutationObserver(render);
 languageObserver.observe(document.documentElement,{attributes:true,attributeFilter:['lang']});
 const modal=document.getElementById('modal');
 if(modal)new MutationObserver(sync).observe(modal,{attributes:true,attributeFilter:['open']});
 if(choice!==true)clearMetaCookies();
 render();if(choice===null)show();sync();
})();
