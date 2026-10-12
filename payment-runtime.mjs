import {requireStripeKey,requireStripeObject,stripeLivemode} from './subscription-policy.mjs';

export const stripeApiVersion='2026-08-26.dahlia';
export function paymentConfiguration(env=process.env){
 return {mode:env.STRIPE_MODE||'test',key:env.STRIPE_SECRET_KEY||'',webhookSecret:env.STRIPE_WEBHOOK_SECRET||'',accountId:env.STRIPE_ACCOUNT_ID||'',monthlyPriceId:env.STRIPE_PRICE_MONTHLY||'',introPriceId:env.STRIPE_PRICE_INTRO||''};
}
export async function validatePaymentSetup(config,{request=fetch}={}){
 requireStripeKey(config.key,config.mode);
 if(!stripeLivemode(config.mode))return {ready:true,mode:'test'};
 if(!/^acct_[A-Za-z0-9]+$/.test(config.accountId)||!/^whsec_[A-Za-z0-9]+$/.test(config.webhookSecret)||!/^price_[A-Za-z0-9]+$/.test(config.monthlyPriceId)||!/^price_[A-Za-z0-9]+$/.test(config.introPriceId)){
  console.error('[payments] incomplete', {account: /^acct_/.test(config.accountId), webhook: /^whsec_/.test(config.webhookSecret), monthly: /^price_/.test(config.monthlyPriceId), intro: /^price_/.test(config.introPriceId)});
  throw Error('Live Stripe configuration incomplete');
 }
 const get=async path=>{const r=await request('https://api.stripe.com/v1/'+path,{headers:{Authorization:'Bearer '+config.key,'Stripe-Version':stripeApiVersion},signal:AbortSignal.timeout(15000)});const data=await r.json();if(!r.ok){console.error('[payments] stripe get failed', path, r.status, data.error?.message||'');throw Error('Stripe configuration could not be verified');}return data;};
 const account=await get('account');
 if(account.id!==config.accountId||account.charges_enabled!==true){console.error('[payments] account mismatch or charges disabled', {got: account.id, expected: config.accountId, charges: account.charges_enabled});throw Error('Live Stripe account cannot accept payments');}
 const [monthly,intro]=await Promise.all([get('prices/'+config.monthlyPriceId),get('prices/'+config.introPriceId)]);
 requireStripeObject(monthly,config.mode);requireStripeObject(intro,config.mode);
 if(monthly.id!==config.monthlyPriceId||monthly.active!==true||monthly.currency!=='usd'||monthly.unit_amount!==1249||monthly.type!=='recurring'||monthly.recurring?.interval!=='month'||monthly.recurring?.interval_count!==1){console.error('[payments] monthly mismatch', {id: monthly.id, active: monthly.active, currency: monthly.currency, amount: monthly.unit_amount, type: monthly.type, interval: monthly.recurring?.interval});throw Error('Monthly Stripe price does not match advertised plan');}
 if(intro.id!==config.introPriceId||intro.active!==true||intro.currency!=='usd'||intro.unit_amount!==299||intro.type!=='one_time'){console.error('[payments] intro mismatch', {id: intro.id, active: intro.active, currency: intro.currency, amount: intro.unit_amount, type: intro.type});throw Error('Intro Stripe price does not match advertised plan');}
 return {ready:true,mode:'live'};
}
export function validatePaidCheckout(session,subscription,uid,mode){
 requireStripeObject(session,mode);requireStripeObject(subscription,mode);
 const id=value=>typeof value==='string'?value:value?.id;
 if(typeof uid!=='string'||!uid||!/^sub_[A-Za-z0-9]+$/.test(subscription.id||'')||!/^cus_[A-Za-z0-9]+$/.test(id(subscription.customer)||''))throw Error('Payment identity missing');
 if(!Number.isInteger(session.created)||session.created<=0)throw Error('Payment creation time missing');
 if(session.mode!=='subscription'||session.status!=='complete'||session.payment_status!=='paid'||session.client_reference_id!==uid||session.metadata?.uid!==uid||subscription.metadata?.uid!==uid||id(session.subscription)!==subscription.id||!id(session.customer)||id(session.customer)!==id(subscription.customer))throw Error('Payment ownership verification failed');
 if(!['active','trialing'].includes(subscription.status))throw Error('Paid subscription is not active');
 return true;
}
