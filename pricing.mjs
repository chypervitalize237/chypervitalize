// Chypermax subscription pricing. The weekly intro renews monthly at $12.49 after 7 days.
export function checkoutPrice(plan,language='en'){
 if(!['day','month'].includes(plan))throw new Error('plan');
 return {currency:'usd',amount:plan==='day'?299:1249,name:plan==='day'?'Chypermax — first week':'Chypermax — monthly',locale:language==='no'?'nb':language==='sr'?'auto':language};
}
export function applyCheckoutPrice(form,plan,language){
 const price=checkoutPrice(plan,language);
 form.set('line_items[0][price_data][currency]',price.currency);
 form.set('line_items[0][price_data][unit_amount]',String(price.amount));
 form.set('line_items[0][price_data][recurring][interval]','month');
 form.set('line_items[0][price_data][product_data][name]',price.name);
 if(plan==='day') form.set('subscription_data[trial_period_days]','7');
 form.set('locale',price.locale);
 form.set('adaptive_pricing[enabled]','false');
 form.set('metadata[language]',language||'en');
 return form;
}
