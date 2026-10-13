import assert from 'node:assert/strict';
import {checkoutPrice,applyCheckoutPrice} from './pricing.mjs';

assert.equal(checkoutPrice('day').amount,299);
assert.equal(checkoutPrice('month').amount,1249);
assert.equal(checkoutPrice('day').currency,'usd');
for(const plan of ['day','month'])assert.match(checkoutPrice(plan).name,/^Chypervitalize/);
assert.equal(checkoutPrice('month','no').locale,'nb');
assert.equal(checkoutPrice('month','sr').locale,'auto');
assert.throws(()=>checkoutPrice('annual'));

for(const mode of ['test','live']){
 const options={mode,monthlyPriceId:'price_monthly',introPriceId:'price_intro'};
 const form=new URLSearchParams({mode:'subscription'});
 assert.equal(applyCheckoutPrice(form,'day','hu',options),form);
 assert.equal(form.get('line_items[0][quantity]'),'1');
 assert.equal(form.get('line_items[1][quantity]'),'1');
 assert.equal(form.get('subscription_data[trial_period_days]'),'7');
 assert.equal(form.get('locale'),'hu');
 assert.equal(form.get('managed_payments[enabled]'),'false');
 assert.equal(form.get('adaptive_pricing[enabled]'),'false');
 assert.equal(form.get('metadata[language]'),'hu');
 if(mode==='live'){
   assert.equal(form.get('line_items[0][price]'),'price_monthly');
   assert.equal(form.get('line_items[1][price]'),'price_intro');
   assert.equal(Array.from(form.keys()).some(key=>key.includes('price_data')),false);
 }else{
   assert.equal(form.get('line_items[0][price_data][unit_amount]'),'1249');
   assert.equal(form.get('line_items[0][price_data][recurring][interval]'),'month');
   assert.equal(form.get('line_items[1][price_data][unit_amount]'),'299');
   assert.equal(form.has('line_items[1][price_data][recurring][interval]'),false);
   assert.match(form.get('line_items[0][price_data][product_data][name]'),/^Chypervitalize/);
   assert.match(form.get('line_items[1][price_data][product_data][name]'),/^Chypervitalize/);
 }
 applyCheckoutPrice(form,'month','en',options);
 assert.equal(form.get('mode'),'subscription');
 assert.equal(form.get('managed_payments[enabled]'),'false');
 assert.equal(form.get('adaptive_pricing[enabled]'),'false');
 assert.equal(form.has('subscription_data[trial_period_days]'),false);
 assert.equal(Array.from(form.keys()).some(key=>key.startsWith('line_items[1]')),false);
}
for(const options of [{mode:'live'},{mode:'live',monthlyPriceId:'price_'},{mode:'live',monthlyPriceId:'price_monthly'},{mode:'live',monthlyPriceId:'price_monthly',introPriceId:'price_unsafe/path'},{mode:'live',monthlyPriceId:'price_monthly',introPriceId:'price_monthly'},{mode:'sandbox'},{mode:'LIVE'}]){
 const form=new URLSearchParams({unchanged:'true'});
 assert.throws(()=>applyCheckoutPrice(form,'day','en',options));
 assert.equal(form.toString(),'unchanged=true');
}
const monthly=new URLSearchParams();
applyCheckoutPrice(monthly,'month','en',{mode:'live',monthlyPriceId:'price_monthly'});
assert.equal(monthly.get('line_items[0][price]'),'price_monthly');
const reused=new URLSearchParams();
applyCheckoutPrice(reused,'day','en',{mode:'test'});
applyCheckoutPrice(reused,'month','en',{mode:'live',monthlyPriceId:'price_monthly'});
assert.equal(Array.from(reused.keys()).some(key=>key.includes('price_data')),false);
assert.equal(Array.from(reused.keys()).some(key=>key.startsWith('line_items[1]')),false);
const savedMode=process.env.STRIPE_MODE;
try{
 delete process.env.STRIPE_MODE;
 const defaultForm=applyCheckoutPrice(new URLSearchParams(),'month');
 assert.equal(defaultForm.get('line_items[0][price_data][unit_amount]'),'1249');
 process.env.STRIPE_MODE='live';
 assert.throws(()=>applyCheckoutPrice(new URLSearchParams(),'month'));
}finally{
 if(savedMode===undefined)delete process.env.STRIPE_MODE;else process.env.STRIPE_MODE=savedMode;
}
console.log('PASS: $2.99 paid intro with 7-day monthly trial, $12.49 immediate monthly, live catalog IDs required, no live inline fallback, clean plan switching and Chypervitalize branding. No Stripe requests made.');
