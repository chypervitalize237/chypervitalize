import {stripeLivemode} from './subscription-policy.mjs';

// Stripe Checkout locale enum: https://docs.stripe.com/api/checkout/sessions/create#session_create-locale
const stripeLocales=new Set('auto bg cs da de el en en-GB es es-419 et fi fil fr fr-CA hr hu id it ja ko lt lv ms mt nb nl pl pt pt-BR ro ru sk sl sv th tr vi zh zh-HK zh-TW'.split(' '));
export function checkoutLocale(language='en'){
 const locale=language==='no'?'nb':language==='sr'?'auto':language;
 if(typeof locale!=='string'||!stripeLocales.has(locale))throw new Error('language');
 return locale;
}

// Chypervitalize subscription pricing.
// Intro plan: charge $2.99 now for the first 7 days, then renew automatically at $12.49/month.
export function checkoutPrice(plan,language='en'){
 if(!['day','month'].includes(plan))throw new Error('plan');
 return {currency:'usd',amount:plan==='day'?299:1249,name:plan==='day'?'Chypervitalize — first 7 days':'Chypervitalize — monthly',locale:checkoutLocale(language)};
}
export function applyCheckoutPrice(form,plan,language='en',{mode=process.env.STRIPE_MODE||'test',monthlyPriceId,introPriceId}={}){
 const price=checkoutPrice(plan,language);
 const live=stripeLivemode(mode);
 if(live){
   if(!/^price_[A-Za-z0-9]+$/.test(monthlyPriceId||''))throw new Error('Live monthly Stripe Price ID required');
   if(plan==='day'&&(!/^price_[A-Za-z0-9]+$/.test(introPriceId||'')||introPriceId===monthlyPriceId))throw new Error('Live intro Stripe Price ID required');
 }
 // Reusing a form must never carry an inline price or an intro charge into another plan.
 for(const key of Array.from(form.keys()))if(key.startsWith('line_items['))form.delete(key);
 form.delete('subscription_data[trial_period_days]');
 form.set('line_items[0][quantity]','1');
 if(live){
   form.set('line_items[0][price]',monthlyPriceId);
 }else{
   form.set('line_items[0][price_data][currency]','usd');
   form.set('line_items[0][price_data][unit_amount]','1249');
   form.set('line_items[0][price_data][recurring][interval]','month');
   form.set('line_items[0][price_data][product_data][name]','Chypervitalize — monthly access');
 }
 if(plan==='day'){
   // Recurring monthly subscription starts after the paid 7-day intro period.
   form.set('subscription_data[trial_period_days]','7');
   // One-time $2.99 charge is collected immediately at Checkout.
   form.set('line_items[1][quantity]','1');
   if(live){
     form.set('line_items[1][price]',introPriceId);
   }else{
     form.set('line_items[1][price_data][currency]','usd');
     form.set('line_items[1][price_data][unit_amount]','299');
     form.set('line_items[1][price_data][product_data][name]','Chypervitalize — first 7 days');
   }
 }
 form.set('locale',price.locale);
 // Keep this direct, fixed-USD integration independent of the account's
 // Managed Payments default, which requires Adaptive Pricing.
 form.set('managed_payments[enabled]','false');
 form.set('adaptive_pricing[enabled]','false');
 form.set('metadata[language]',language||'en');
 return form;
}
