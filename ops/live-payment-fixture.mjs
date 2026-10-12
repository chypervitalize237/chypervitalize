import {readFileSync,writeFileSync} from 'node:fs';
import {join} from 'node:path';
const original=globalThis.fetch;
const path=join(process.env.DATA_DIR,'stripe-fixture.json');
globalThis.fetch=async(input,options={})=>{
 const url=new URL(String(input));if(url.hostname!=='api.stripe.com')return original(input,options);
 const route=url.pathname.replace('/v1/',''),state=JSON.parse(readFileSync(path,'utf8'));
 const respond=(data,status=200)=>new Response(JSON.stringify(data),{status,headers:{'content-type':'application/json'}});
 const save=()=>writeFileSync(path,JSON.stringify(state));
 if(route==='account')return respond({id:'acct_fixture',charges_enabled:state.chargesEnabled!==false});
 if(route==='prices/price_monthlyFixture')return respond({id:'price_monthlyFixture',livemode:true,active:true,type:'recurring',currency:'usd',unit_amount:1249,recurring:{interval:'month',interval_count:1}});
 if(route==='prices/price_introFixture')return respond({id:'price_introFixture',livemode:true,active:true,type:'one_time',currency:'usd',unit_amount:299});
 if(route.startsWith('coupons/'))return state.coupons?.[route.slice(8)]?respond(state.coupons[route.slice(8)]):respond({error:{type:'invalid_request_error'}},404);
 if(route==='coupons'&&options.method==='POST'){const form=Object.fromEntries(options.body),coupon={id:form.id,livemode:true,percent_off:Number(form.percent_off),duration:form.duration,max_redemptions:Number(form.max_redemptions),times_redeemed:0};state.coupons??={};state.coupons[coupon.id]=coupon;save();return respond(coupon);}
 if(route==='checkout/sessions'&&options.method==='POST'){
  const form=Object.fromEntries(options.body),key=options.headers['Idempotency-Key'];
  state.createRequests??=[];state.createRequests.push({key,form});
  const failure=state.createFailures?.shift();
  if(failure?.status){save();return respond({error:{type:failure.type||'invalid_request_error',code:failure.code||'parameter_invalid',param:'locale'}},failure.status);}
  const cached=state.idempotency?.[key];
  if(cached){save();if(JSON.stringify(cached.form)!==JSON.stringify(form))return respond({error:{type:'idempotency_error',code:'idempotency_key_in_use'}},400);return respond(cached.session);}
  state.sessions??={};state.subscriptions??={};
  if(state.session)state.sessions[state.session.id]=state.session;
  if(state.subscription)state.subscriptions[state.subscription.id]=state.subscription;
  state.forms??=[];state.forms.push(Object.fromEntries(options.body));
  const uid=options.body.get('metadata[uid]'),plan=options.body.get('metadata[plan]');
  const suffix=state.forms.length===1?'':String(state.forms.length);
  state.subscription={id:'sub_fixture'+suffix,customer:'cus_fixture',livemode:true,status:plan==='day'?'trialing':'active',cancel_at_period_end:false,metadata:{uid,plan},items:{data:[{id:'si_fixture'+suffix,current_period_end:Math.floor(Date.now()/1000)+7*86400,price:{currency:'usd',unit_amount:1249,recurring:{interval:'month'}}}]}};
  state.session={id:'cs_live_fixture'+suffix,created:Math.floor(Date.now()/1000),object:'checkout.session',livemode:true,mode:'subscription',status:'open',payment_status:'unpaid',amount_total:plan==='day'?299:1249,client_reference_id:uid,metadata:{uid,plan,...(form['metadata[referral_reward]']?{referral_reward:form['metadata[referral_reward]']}:{} )},customer:'cus_fixture',subscription:state.subscription.id,url:'https://checkout.stripe.com/c/pay/fixture'+suffix};
  state.idempotency??={};state.idempotency[key]={form,session:state.session};save();
  if(failure?.loseResponse)throw Error('Fixture connection lost after Stripe accepted Checkout');
  return respond(state.session);
 }
 if(route.startsWith('checkout/sessions/')){
  const [id,action]=route.slice('checkout/sessions/'.length).split('/'),session=state.session?.id===id?state.session:state.sessions?.[id];
  if(!session)return respond({error:{type:'invalid_request_error',code:'resource_missing'}},404);
  if(action==='expire'){session.status='expired';state.expirations??=[];state.expirations.push(id);save();}
  return respond(session);
 }
 if(route.startsWith('subscriptions/')){
  const id=route.slice('subscriptions/'.length),subscription=state.subscription?.id===id?state.subscription:state.subscriptions?.[id];
  if(!subscription)return respond({error:{type:'invalid_request_error',code:'resource_missing'}},404);
  if(options.method==='POST'){subscription.cancel_at_period_end=true;state.cancellations=(state.cancellations||0)+1;save();}
  return respond(subscription);
 }
 throw Error('Unexpected mocked Stripe request: '+route);
};
