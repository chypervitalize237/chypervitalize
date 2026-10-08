import assert from 'node:assert/strict';
import {DatabaseSync} from 'node:sqlite';
import {initReferrals,grantReferral,referralSummary,createReferralService} from './referral.mjs';
const db=new DatabaseSync(':memory:');
db.exec('CREATE TABLE users(id TEXT PRIMARY KEY,email TEXT,ref TEXT,stripe_customer_id TEXT,stripe_subscription_id TEXT,subscription_status TEXT,cancel_at_period_end INTEGER DEFAULT 0)');initReferrals(db);
const add=(id,email,ref)=>db.prepare('INSERT INTO users(id,email,ref) VALUES(?,?,?)').run(id,email,ref);
add('owner','owner@gmail.com','0123456789abcdef');add('friend','friend@example.com','1111111111111111');add('friend2','friend2@example.com','2222222222222222');add('alias','o.w.n.e.r+test@gmail.com','3333333333333333');
assert.equal(grantReferral(db,'owner','0123456789abcdef'),null);assert.equal(grantReferral(db,'alias','0123456789abcdef'),null);assert.equal(grantReferral(db,'friend','bad'),null);
grantReferral(db,'friend','0123456789abcdef');grantReferral(db,'friend','0123456789abcdef');grantReferral(db,'friend2','0123456789abcdef');assert.equal(referralSummary(db,'owner').available,2);
let calls=[],coupons=new Map(),sessions=new Map(),sub={id:'sub_test',customer:'cus_test',livemode:false,status:'active',items:{data:[{price:{currency:'usd',unit_amount:1249,recurring:{interval:'month'}}}]},discounts:[]},invoice=null;
const request=async(url,options)=>{
 const path=new URL(url).pathname.replace('/v1/','');calls.push({path,options});let data;
 if(path.startsWith('coupons/'))data=coupons.get(path.split('/')[1]);
 else if(path==='coupons'){const f=options.body;assert.equal(f.get('percent_off'),'50');assert.equal(f.get('duration'),'once');assert.equal(f.get('max_redemptions'),'1');data={id:f.get('id'),times_redeemed:0};coupons.set(data.id,data);}
 else if(path.startsWith('checkout/sessions/'))data=sessions.get(path.split('/')[2]);
 else if(path.startsWith('subscriptions/')){if(options.method==='POST'){assert.equal(options.body.get('proration_behavior'),'none');sub.discounts=[{id:'di_'+options.body.get('discounts[0][coupon]'),source:{coupon:options.body.get('discounts[0][coupon]')}}];}data=structuredClone(sub);}
 else if(path.startsWith('invoices/'))data=invoice;
 return {ok:!!data,json:async()=>data||{error:{message:'missing'}}};
};
const service=createReferralService(db,{key:'sk_test_fixture',request});
assert.equal(await service.reserveCheckout('owner','day'),null);assert.equal(calls.length,0);
const reward=await service.reserveCheckout('owner','month');assert.equal(reward.coupon,'chy_ref_friend');service.recordCheckout(reward.row.invitee,{id:'cs_test_first'});sessions.set('cs_test_first',{id:'cs_test_first',status:'open',url:'https://checkout.example/test'});
assert.equal((await service.reserveCheckout('owner','month')).sessionId,'cs_test_first');assert.equal(referralSummary(db,'owner').scheduled,1);
service.completeCheckout({id:'cs_test_first',status:'complete',payment_status:'unpaid',metadata:{uid:'owner',plan:'month',referral_reward:'friend'}});assert.equal(referralSummary(db,'owner').used,0);
sessions.get('cs_test_first').status='expired';const retry=await service.reserveCheckout('owner','month');assert.equal(retry.row.checkout_attempt,1);
service.recordCheckout('friend',{id:'cs_test_paid'});const paid={id:'cs_test_paid',status:'complete',payment_status:'paid',subscription:'sub_test',metadata:{uid:'owner',plan:'month',referral_reward:'friend'}};service.completeCheckout(paid);service.completeCheckout(paid);assert.equal(referralSummary(db,'owner').used,1);
db.prepare("UPDATE users SET stripe_customer_id='cus_test',stripe_subscription_id='sub_test',subscription_status='active' WHERE id='owner'").run();
await Promise.all([service.applyPending('owner'),service.applyPending('owner')]);assert.equal(calls.filter(x=>x.path==='subscriptions/sub_test'&&x.options.method==='POST').length,1);assert.equal(referralSummary(db,'owner').scheduled,1);
const paidInvoice={id:'in_test',livemode:false,status:'paid',customer:'cus_test',total_discount_amounts:[{amount:625,discount:'di_chy_ref_friend2'}]};
service.settleInvoice({...paidInvoice,status:'open'});service.settleInvoice({...paidInvoice,customer:'cus_other'});service.settleInvoice({...paidInvoice,livemode:true});assert.equal(referralSummary(db,'owner').used,1);
service.settleInvoice(paidInvoice);service.settleInvoice(paidInvoice);assert.equal(referralSummary(db,'owner').used,2);
add('friend3','friend3@example.com','4444444444444444');grantReferral(db,'friend3','0123456789abcdef');await service.applyPending('owner');assert.equal(referralSummary(db,'owner').scheduled,1);assert.equal(sub.discounts[0].source.coupon,'chy_ref_friend3');
add('badowner','other@example.com','5555555555555555');add('badfriend','new@example.com','6666666666666666');grantReferral(db,'badfriend','5555555555555555');db.prepare("UPDATE users SET stripe_customer_id='cus_other',stripe_subscription_id='sub_test',subscription_status='active' WHERE id='badowner'").run();await service.applyPending('badowner');assert.equal(referralSummary(db,'badowner').available,1);
const live=createReferralService(db,{key:'sk_live_fixture',request:()=>{throw Error('network should never run')}});await assert.rejects(live.reserveCheckout('badowner','month'),/sandbox/);
console.log('PASS: signup rewards, self/alias protection, duplicate registration, monthly-only checkout, expired checkout recovery, payment confirmation, active subscription discount, webhook replay, queued months, ownership and sandbox-only keys.');
