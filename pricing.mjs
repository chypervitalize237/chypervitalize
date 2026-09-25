import {locales,strings} from './public/i18n.js';
// Prices come exclusively from the server's catalog, never from request amounts.
export function checkoutPrice(plan,language='en'){
 const index=['day','week','month'].indexOf(plan);
 if(index<0)throw new Error('plan');
 if(typeof language!=='string'||!Object.hasOwn(locales,language))throw new Error('language');
 const entry=locales[language];
 return {currency:entry.currency.toLowerCase(),amount:Math.round(entry.prices[index]*100),name:'Chyper CV — '+strings[language][plan],locale:language==='no'?'nb':language==='sr'?'auto':language};
}
export function applyCheckoutPrice(form,plan,language){
 const price=checkoutPrice(plan,language);
 form.set('line_items[0][price_data][currency]',price.currency);
 form.set('line_items[0][price_data][unit_amount]',String(price.amount));
 form.set('line_items[0][price_data][product_data][name]',price.name);
 form.set('locale',price.locale);
 form.set('adaptive_pricing[enabled]','false');
 form.set('metadata[language]',language||'en');
 return form;
}
