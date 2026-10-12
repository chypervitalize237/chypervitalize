import assert from 'node:assert/strict';
import {DatabaseSync} from 'node:sqlite';
import {initReferrals,grantReferral,referralSummary,createReferralService} from './referral.mjs';
const makeDb=()=>{const db=new DatabaseSync(':memory:');db.exec("CREATE TABLE users(id TEXT PRIMARY KEY,email TEXT,ref TEXT,stripe_customer_id TEXT,stripe_subscription_id TEXT,subscription_status TEXT,cancel_at_period_end INTEGER DEFAULT 0,stripe_mode TEXT NOT NULL DEFAULT 'test')");initReferrals(db);return db;};
const add=(db,id,email,ref,mode='test')=>db.prepare('INSERT INTO users(id,email,ref,stripe_mode) VALUES(?,?,?,?)').run(id,email,ref,mode);
const proof=(uid,mode,overrides={})=>({object:'checkout.session',id:'cs_'+mode+'_'+uid,mode:'subscription',status:'complete',payment_status:'paid',amount_total:1249,livemode:mode==='live',customer:'cus_'+mode+'_'+uid,subscription:'sub_'+mode+'_'+uid,metadata:{uid},...overrides});
const subscription=(uid,mode,overrides={})=>({id:'sub_'+mode+'_'+uid,customer:'cus_'+mode+'_'+uid,livemode:mode==='live',status:'active',metadata:{uid,plan:'month'},...overrides});
async function verifyMode(mode){
 const db=makeDb(),summary=uid=>referralSummary(db,uid,mode),grant=(id,code)=>grantReferral(db,id,code,mode),livemode=mode==='live',prefix='chy_ref_'+(livemode?'live_':'');
 add(db,'owner','owner@gmail.com','0123456789abcdef',mode);add(db,'friend','friend@example.com','1111111111111111',mode);add(db,'friend2','friend2@example.com','2222222222222222',mode);add(db,'alias','o.w.n.e.r+test@gmail.com','3333333333333333',mode);
 assert.equal(grant('owner','0123456789abcdef'),null);assert.equal(grant('alias','0123456789abcdef'),null);assert.equal(grant('friend','bad'),null);
 grant('friend','0123456789abcdef');grant('friend','0123456789abcdef');grant('friend2','0123456789abcdef');assert.equal(summary('owner').available,0);assert.equal(summary('owner').waiting,2);
 const calls=[],coupons=new Map(),sessions=new Map();
 let sub={...subscription('owner',mode),items:{data:[{price:{currency:'usd',unit_amount:1249,recurring:{interval:'month'}}}]},discounts:[]},invoice=null;
 const request=async(url,options)=>{
  const path=new URL(url).pathname.replace('/v1/','');calls.push({path,options});let data;
  assert.equal(options.headers.Authorization,'Bearer sk_'+mode+'_fixture');
  if(options.method==='POST')assert.ok(options.headers['Idempotency-Key'].startsWith(mode+'-'));
  if(path.startsWith('coupons/'))data=coupons.get(path.split('/')[1]);
  else if(path==='coupons'){const form=options.body;assert.equal(form.get('percent_off'),'50');assert.equal(form.get('duration'),'once');assert.equal(form.get('max_redemptions'),'1');data={id:form.get('id'),livemode,times_redeemed:0,percent_off:50,duration:'once',max_redemptions:1};coupons.set(data.id,data);}
  else if(path.startsWith('checkout/sessions/'))data=sessions.get(path.split('/')[2]);
  else if(path.startsWith('subscriptions/')){if(options.method==='POST'){assert.equal(options.body.get('proration_behavior'),'none');sub.discounts=[{id:'di_'+options.body.get('discounts[0][coupon]'),source:{coupon:options.body.get('discounts[0][coupon]')}}];}data=structuredClone(sub);}
  else if(path.startsWith('invoices/'))data=invoice;
  return {ok:!!data,status:data?200:404,json:async()=>data||{error:{message:'missing'}}};
 };
 const service=createReferralService(db,{key:'sk_'+mode+'_fixture',mode,request}),qualify=(uid,overrides={},subOverrides={})=>service.qualifyPayment(uid,subscription(uid,mode,subOverrides),proof(uid,mode,overrides));
 assert.equal(await service.reserveCheckout('owner','month'),null);
 for(const overrides of [{payment_status:'unpaid'},{status:'open'},{amount_total:0},{livemode:!livemode},{customer:'cus_other'},{subscription:'sub_other'},{metadata:{uid:'other'}},{mode:'payment'}])assert.equal(qualify('friend',overrides),false);
 for(const overrides of [{livemode:!livemode},{status:'canceled'},{metadata:{uid:'other',plan:'month'}},{metadata:{uid:'friend',plan:'bogus'}}])assert.equal(qualify('friend',{},overrides),false);
 assert.equal(summary('owner').available,0);assert.equal(qualify('friend'),true);assert.equal(qualify('friend'),false);assert.equal(qualify('friend2'),true);assert.equal(summary('owner').available,2);
 assert.equal(await service.reserveCheckout('owner','day'),null);assert.equal(calls.length,0);
 const reward=await service.reserveCheckout('owner','month');assert.equal(reward.coupon,prefix+'friend');
 const first={...proof('owner',mode),id:'cs_'+mode+'_first',status:'open',url:'https://checkout.example/'+mode,metadata:{uid:'owner',plan:'month',referral_reward:'friend'}};
 assert.throws(()=>service.recordCheckout(reward.row.invitee,{...first,livemode:!livemode}),/mode/);
 service.recordCheckout(reward.row.invitee,first);sessions.set(first.id,first);
 assert.equal((await service.reserveCheckout('owner','month')).sessionId,first.id);assert.equal(summary('owner').scheduled,1);
 service.completeCheckout({...first,status:'complete',payment_status:'unpaid'});service.completeCheckout({...first,status:'complete',livemode:!livemode});assert.equal(summary('owner').used,0);
 sessions.get(first.id).status='expired';const retry=await service.reserveCheckout('owner','month');assert.equal(retry.row.checkout_attempt,1);
 const paid={...proof('owner',mode),id:'cs_'+mode+'_paid',metadata:first.metadata};service.recordCheckout('friend',paid);service.completeCheckout(paid);service.completeCheckout(paid);assert.equal(summary('owner').used,1);
 db.prepare("UPDATE users SET stripe_customer_id=?,stripe_subscription_id=?,subscription_status='active' WHERE id='owner'").run(sub.customer,sub.id);
 await Promise.all([service.applyPending('owner'),service.applyPending('owner')]);assert.equal(calls.filter(call=>call.path==='subscriptions/'+sub.id&&call.options.method==='POST').length,1);assert.equal(summary('owner').scheduled,1);
 const paidInvoice={id:'in_'+mode,livemode,status:'paid',customer:sub.customer,total_discount_amounts:[{amount:625,discount:'di_'+prefix+'friend2'}]};
 service.settleInvoice({...paidInvoice,status:'open'});service.settleInvoice({...paidInvoice,customer:'cus_other'});service.settleInvoice({...paidInvoice,livemode:!livemode});assert.equal(summary('owner').used,1);
 service.settleInvoice(paidInvoice);service.settleInvoice(paidInvoice);assert.equal(summary('owner').used,2);
 add(db,'friend3','friend3@example.com','4444444444444444',mode);grant('friend3','0123456789abcdef');qualify('friend3');await new Promise(resolve=>setImmediate(resolve));await service.applyPending('owner');assert.equal(summary('owner').scheduled,1);assert.equal(sub.discounts[0].source.coupon,prefix+'friend3');
 add(db,'badowner','other@example.com','5555555555555555',mode);add(db,'badfriend','new@example.com','6666666666666666',mode);grant('badfriend','5555555555555555');qualify('badfriend');db.prepare("UPDATE users SET stripe_customer_id='cus_other',stripe_subscription_id=?,subscription_status='active' WHERE id='badowner'").run(sub.id);await service.applyPending('badowner');assert.equal(summary('badowner').available,1);
 const wrongKey=createReferralService(db,{key:'sk_'+(livemode?'test':'live')+'_fixture',mode,request:()=>{throw Error('network should never run')}});await assert.rejects(wrongKey.reserveCheckout('badowner','month'),/key required/);wrongKey.releaseCheckout('badfriend');
 // A paid invoice can qualify an invite, but an unpaid invoice and subscription mismatch cannot.
 add(db,'invoicefriend','invoice@example.com','7777777777777777',mode);grant('invoicefriend','5555555555555555');
 const invitedSub=subscription('invoicefriend',mode),invitedInvoice={object:'invoice',id:'in_friend_'+mode,livemode,status:'paid',amount_paid:299,customer:invitedSub.customer,parent:{subscription_details:{subscription:invitedSub.id}}};
 assert.equal(service.qualifyPayment('invoicefriend',invitedSub,{...invitedInvoice,status:'open'}),false);assert.equal(service.qualifyPayment('invoicefriend',invitedSub,{...invitedInvoice,amount_paid:0}),false);assert.equal(service.qualifyPayment('invoicefriend',invitedSub,invitedInvoice),true);assert.equal(service.qualifyPayment('invoicefriend',invitedSub,invitedInvoice),false);
 await new Promise(resolve=>setImmediate(resolve));db.close();
}
await verifyMode('test');await verifyMode('live');
// Migrating an existing sandbox database preserves every ID and status under test mode.
const db=makeDb();db.exec("DROP TABLE referral_rewards; CREATE TABLE referral_rewards(invitee TEXT PRIMARY KEY,inviter TEXT NOT NULL,created INTEGER NOT NULL,status TEXT NOT NULL DEFAULT 'pending',coupon TEXT,session_id TEXT,subscription_id TEXT,discount_id TEXT,invoice_id TEXT,checkout_attempt INTEGER NOT NULL DEFAULT 0,qualifying_payment TEXT); INSERT INTO referral_rewards(invitee,inviter,created,status,coupon,session_id,qualifying_payment) VALUES('friend','owner',1,'reserved','chy_ref_friend','cs_old_sandbox','cs_old_paid')");
initReferrals(db);initReferrals(db);assert.equal(db.prepare('SELECT stripe_mode,session_id FROM referral_rewards').get().stripe_mode,'test');assert.equal(db.prepare('SELECT stripe_mode,session_id FROM referral_rewards').get().session_id,'cs_old_sandbox');
add(db,'owner','owner@example.com','0123456789abcdef');add(db,'friend','friend@example.com','1111111111111111');
db.prepare("UPDATE users SET stripe_customer_id='cus_sandbox',stripe_subscription_id='sub_sandbox',subscription_status='active' WHERE id='owner'").run();
const liveCalls=[],live=createReferralService(db,{key:'sk_live_fixture',mode:'live',request:async(url,options)=>{liveCalls.push(url);return {ok:true,status:200,json:async()=>({id:'sub_sandbox',livemode:false})};}});
assert.equal(referralSummary(db,'owner','live').earned,0);assert.equal(await live.reserveCheckout('owner','month'),null);await live.sweep();assert.equal(liveCalls.length,0);
grantReferral(db,'friend','0123456789abcdef','live');assert.equal(db.prepare('SELECT COUNT(*) n FROM referral_rewards WHERE invitee=?').get('friend').n,2);
assert.equal(live.qualifyPayment('friend',subscription('friend','test'),proof('friend','test')),false);assert.equal(live.qualifyPayment('friend',subscription('friend','live'),proof('friend','live')),true);
await live.applyPending('owner');await live.sweep();assert.equal(liveCalls.length,0);assert.equal(referralSummary(db,'owner','live').available,1);assert.equal(referralSummary(db,'owner','test').scheduled,1);
// Switching the owner's mode does not let a returned sandbox object become a live discount.
db.prepare("UPDATE users SET stripe_mode='live' WHERE id='owner'").run();await assert.rejects(live.applyPending('owner'),/mode mismatch/);assert.equal(liveCalls.length,1);assert.equal(referralSummary(db,'owner','live').available,1);
assert.equal(db.prepare("SELECT session_id FROM referral_rewards WHERE stripe_mode='test'").get().session_id,'cs_old_sandbox');
db.close();
console.log('PASS: test and live paid subscription eligibility, ownership/mode guards, no reward for registration, 50% once-only coupons, duplicate protection, checkout recovery, queued monthly rewards, invoice confirmation, legacy migration and complete sandbox/live isolation.');

