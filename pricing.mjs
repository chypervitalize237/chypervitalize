// Chypermax subscription pricing.
// Intro plan: charge $2.99 now for the first 7 days, then renew automatically at $12.49/month.
export function checkoutPrice(plan,language='en'){
 if(!['day','month'].includes(plan))throw new Error('plan');
 return {currency:'usd',amount:plan==='day'?299:1249,name:plan==='day'?'Chypermax — first 7 days':'Chypermax — monthly',locale:language==='no'?'nb':language==='sr'?'auto':language};
}
export function applyCheckoutPrice(form,plan,language){
 const price=checkoutPrice(plan,language);
 form.set('line_items[0][price_data][currency]','usd');
 form.set('line_items[0][price_data][unit_amount]','1249');
 form.set('line_items[0][price_data][recurring][interval]','month');
 form.set('line_items[0][price_data][product_data][name]','Chypermax — monthly access');
 if(plan==='day'){
   // Recurring monthly subscription starts after the paid 7-day intro period.
   form.set('subscription_data[trial_period_days]','7');
   // One-time $2.99 charge is collected immediately at Checkout.
   form.set('line_items[1][quantity]','1');
   form.set('line_items[1][price_data][currency]','usd');
   form.set('line_items[1][price_data][unit_amount]','299');
   form.set('line_items[1][price_data][product_data][name]','Chypermax — first 7 days');
 }
 form.set('locale',price.locale);
 form.set('adaptive_pricing[enabled]','false');
 form.set('metadata[language]',language||'en');
 return form;
}
