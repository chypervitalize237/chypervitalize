import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {createHmac,randomBytes} from 'node:crypto';
import {mkdtempSync,readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {join,resolve} from 'node:path';
import {DatabaseSync} from 'node:sqlite';
import {request as httpRequest} from 'node:http';
import {validatePaymentSetup,validatePaidCheckout} from './payment-runtime.mjs';
import {checkoutPrice} from './pricing.mjs';
import {locales} from './public/i18n.js';

for(const language of Object.keys(locales))assert.equal(typeof checkoutPrice('month',language).locale,'string');
assert.equal(checkoutPrice('month','no').locale,'nb');assert.equal(checkoutPrice('month','sr').locale,'auto');
for(const language of ['unsupported','',null,{},['en']])assert.throws(()=>checkoutPrice('month',language));

const config={mode:'live',key:'rk_live_fixture',webhookSecret:'whsec_fixture',accountId:'acct_fixture',monthlyPriceId:'price_monthlyFixture',introPriceId:'price_introFixture'};
const validSub={id:'sub_fixture',customer:'cus_fixture',livemode:true,status:'active',metadata:{uid:'owner',plan:'month'}};
const validSession={id:'cs_live_fixture',created:1000,mode:'subscription',livemode:true,status:'complete',payment_status:'paid',subscription:'sub_fixture',customer:'cus_fixture',client_reference_id:'owner',metadata:{uid:'owner'}};
assert.equal(validatePaidCheckout(validSession,validSub,'owner','live'),true);
for(const [session,sub,uid] of [[{...validSession,customer:'cus_other'},validSub,'owner'],[{...validSession,livemode:false},validSub,'owner'],[{...validSession,subscription:undefined},{...validSub,id:undefined},'owner'],[{...validSession,client_reference_id:undefined,metadata:{}},{...validSub,metadata:{}},undefined]])assert.throws(()=>validatePaidCheckout(session,sub,uid,'live'));
await assert.rejects(validatePaymentSetup({...config,key:'rk_test_fixture'}),/key/);
await assert.rejects(validatePaymentSetup({...config,monthlyPriceId:''}),/configuration/);
await assert.rejects(validatePaymentSetup(config,{request:async()=>new Response(JSON.stringify({id:'acct_other',charges_enabled:true}))}),/account/);

mkdirSync('tmp',{recursive:true});const dir=resolve(mkdtempSync('tmp/live-payment-'));
const fixturePath=join(dir,'stripe-fixture.json');writeFileSync(fixturePath,'{}');
const port=31000+Math.floor(Math.random()*5000),base='http://127.0.0.1:'+port;
const server=spawn(process.execPath,['--import','./ops/live-payment-fixture.mjs','server.mjs'],{env:{...process.env,STRIPE_MODE:'live',STRIPE_SECRET_KEY:config.key,STRIPE_WEBHOOK_SECRET:config.webhookSecret,STRIPE_ACCOUNT_ID:config.accountId,STRIPE_PRICE_MONTHLY:config.monthlyPriceId,STRIPE_PRICE_INTRO:config.introPriceId,APP_URL:base,DATA_DIR:dir,PORT:String(port),BACKUP_ENABLED:'0',DEMO_MODE:'false'},stdio:['ignore','pipe','pipe']});
let logs='';server.stdout.on('data',b=>logs+=b);server.stderr.on('data',b=>logs+=b);
const post=(route,data,cookie='')=>fetch(base+route,{method:'POST',headers:{'Content-Type':'application/json',...(cookie?{Cookie:cookie}:{})},body:JSON.stringify(data)});
const state=()=>JSON.parse(readFileSync(fixturePath,'utf8'));
const edit=fn=>{const value=state();fn(value);writeFileSync(fixturePath,JSON.stringify(value));};
let db;
try{
 let ready=false;for(let i=0;i<100;i++){try{ready=(await fetch(base+'/api/payment-status')).ok;if(ready)break;}catch{}await new Promise(r=>setTimeout(r,100));}
 assert(ready,'Server startup failed: '+logs);
 assert.deepEqual(await (await fetch(base+'/api/payment-status')).json(),{mode:'live',ready:true});
 assert.equal((await post('/api/checkout',{plan:'day',language:'hu'})).status,401);
 const auth=await post('/api/auth',{mode:'register',email:'live-fixture-'+randomBytes(5).toString('hex')+'@example.com',password:'Local-fixture-password-2026'});assert.equal(auth.status,200);
 const cookie=auth.headers.get('set-cookie').split(';')[0];db=new DatabaseSync(join(dir,'chypermax.sqlite'));
 const uid=db.prepare('SELECT id FROM users LIMIT 1').get().id;
 db.prepare("UPDATE users SET stripe_mode='test',payment_confirmed=1,subscription_status='active',access_until=?,stripe_subscription_id='sub_oldtest',stripe_customer_id='cus_oldtest'").run(Date.now()+86400000);
 const me=async()=> (await (await fetch(base+'/api/me',{headers:{Cookie:cookie}})).json()).user;
 assert.equal((await me()).credits,0,'Old sandbox payment must not grant live access');
 assert.equal((await post('/api/subscription/cancel',{},cookie)).status,409);
 assert.equal((await post('/api/checkout',{plan:'day',language:'hu'},cookie)).status,200);
 assert.equal((await post('/api/checkout',{plan:'day',language:'hu'},cookie)).status,200);assert.equal(state().forms.length,1,'A second tab must reuse the pending Checkout');
 const form=state().forms[0];assert.equal(form['line_items[0][price]'],'price_monthlyFixture');assert.equal(form['line_items[1][price]'],'price_introFixture');assert.equal(form['subscription_data[trial_period_days]'],'7');assert.equal(Object.keys(form).some(k=>k.includes('price_data')),false);
 assert.match(form.integration_identifier,/^chypervitalize_[a-z]{8}$/);
 async function event(type,object,{live=true,signed=true}={}){const raw=JSON.stringify({id:'evt_fixture',type,livemode:live,data:{object}}),t=Math.floor(Date.now()/1000),signature=createHmac('sha256',config.webhookSecret).update(t+'.'+raw).digest('hex');return fetch(base+'/api/stripe-webhook',{method:'POST',headers:{'stripe-signature':signed?`t=${t},v1=${signature}`:'bad'},body:raw});}
 assert.equal((await event('customer.subscription.created',state().subscription,{signed:false})).status,400);
 assert.equal((await event('customer.subscription.created',{...state().subscription,livemode:false},{live:false})).status,400);
 assert.equal((await event('customer.subscription.created',state().subscription)).status,200);assert.equal((await me()).credits,0,'Creating a new live subscription must reset old paid confirmation');
 const unicodeRaw=Buffer.from(JSON.stringify({id:'evt_unicode',type:'customer.subscription.updated',livemode:true,data:{object:{...state().subscription,description:'Mór'}}}));
 const split=unicodeRaw.indexOf(Buffer.from('ó'))+1,timestamp=Math.floor(Date.now()/1000),unicodeSignature=createHmac('sha256',config.webhookSecret).update(timestamp+'.').update(unicodeRaw).digest('hex');
 const unicodeStatus=await new Promise((resolve,reject)=>{const request=httpRequest(base+'/api/stripe-webhook',{method:'POST',headers:{'stripe-signature':`t=${timestamp},v1=${unicodeSignature}`}},response=>{response.resume();resolve(response.statusCode);});request.on('error',reject);request.write(unicodeRaw.subarray(0,split));setTimeout(()=>request.end(unicodeRaw.subarray(split)),15);});assert.equal(unicodeStatus,200,'Split UTF-8 webhook bytes must preserve the signature');
 assert.equal((await event('checkout.session.completed',state().session)).status,200);assert.equal((await me()).credits,0);
 edit(s=>{s.session.status='complete';s.session.payment_status='paid';});
 assert.equal((await event('checkout.session.completed',state().session)).status,200);assert.equal((await me()).credits,1);
 assert.equal((await event('checkout.session.completed',state().session)).status,200);assert.equal((await me()).credits,1,'Webhook retry must be harmless');
 assert.equal((await post('/api/checkout-status',{sessionId:'cs_live_fixture'},cookie)).status,200);
 const until=(await me()).accessUntil;
 assert.equal((await post('/api/subscription/cancel',{},cookie)).status,200);assert.equal((await me()).cancelAtPeriodEnd,true);assert.equal((await me()).accessUntil,until);assert.equal((await me()).credits,1);
 assert.equal((await post('/api/subscription/cancel',{},cookie)).status,200);assert.equal(state().cancellations,1);
 edit(s=>{s.subscription.status='canceled';});
 assert.equal((await event('customer.subscription.updated',{...state().subscription,status:'active'})).status,200);assert.equal((await me()).credits,0,'Outdated events must not restore canceled access');
 assert.equal((await post('/api/checkout',{plan:'month',language:'en'},cookie)).status,200);
 const monthly=state().forms.at(-1);assert.equal(monthly['line_items[0][price]'],'price_monthlyFixture');assert.equal(monthly['line_items[1][price]'],undefined);assert.equal(monthly['subscription_data[trial_period_days]'],undefined);
 edit(s=>{s.session.status='complete';s.session.payment_status='paid';s.session.customer='cus_wrong';});
 assert.equal((await event('checkout.session.completed',state().session)).status,502);assert.equal((await me()).credits,0,'Customer mismatch must not grant access');
 edit(s=>{s.session.customer='cus_fixture';s.session.created+=5;});
 assert.equal((await event('checkout.session.completed',state().session)).status,200);assert.equal((await me()).credits,1);
 db.prepare("UPDATE users SET stripe_subscription_id='sub_newer',stripe_checkout_created=?,payment_confirmed=1,access_until=?,subscription_status='active'").run(state().session.created+10,Date.now()+86400000);
 assert.equal((await event('customer.subscription.deleted',{...state().subscription,status:'canceled'})).status,200);assert.equal((await me()).credits,1,'Superseded subscription lifecycle must not replace newer paid subscription');
 assert.equal((await event('invoice.payment_failed',{object:'invoice',id:'in_old',livemode:true,customer:'cus_fixture',subscription:'sub_fixture',status:'open'})).status,200);assert.equal((await me()).credits,1,'Old invoice must not replace newer paid subscription');
 assert.equal((await event('checkout.session.completed',state().session)).status,200);assert.equal((await me()).credits,1);assert.equal(db.prepare('SELECT stripe_subscription_id FROM users WHERE id=?').get(uid).stripe_subscription_id,'sub_newer','Old paid checkout replay must not replace newer subscription');

 async function registerFixture(){const email='recovery-'+randomBytes(5).toString('hex')+'@example.com',response=await post('/api/auth',{mode:'register',email,password:'Local-fixture-password-2026'});assert.equal(response.status,200);return {cookie:response.headers.get('set-cookie').split(';')[0],uid:db.prepare('SELECT id FROM users WHERE email=?').get(email).id};}
 const pendingFor=owner=>db.prepare('SELECT * FROM checkout_pending WHERE uid=? AND stripe_mode=?').get(owner,'live');
 const recovery=await registerFixture();
 assert.equal((await post('/api/checkout',{plan:'month',language:'unsupported'},recovery.cookie)).status,400);
 assert.equal(pendingFor(recovery.uid),undefined,'Unsupported locale must not persist an attempt');
 db.prepare("INSERT INTO referral_rewards(invitee,inviter,created,status,qualifying_payment,stripe_mode) VALUES(?,?,?,'pending','in_fixture','live')").run(uid,recovery.uid,Date.now());
 edit(s=>{s.createFailures=[{status:400,type:'invalid_request_error',code:'parameter_invalid'}];});
 assert.equal((await post('/api/checkout',{plan:'month',language:'en'},recovery.cookie)).status,502);
 const rejectedAttempt=state().createRequests.at(-1).key;
 assert.equal(pendingFor(recovery.uid),undefined,'Definitively rejected session must release pending request');
 assert.equal(db.prepare('SELECT status FROM referral_rewards WHERE invitee=? AND stripe_mode=?').get(uid,'live').status,'pending','Definitive rejection must release the reserved referral');
 assert.equal((await post('/api/checkout',{plan:'month',language:'hu'},recovery.cookie)).status,200);
 assert.notEqual(state().createRequests.at(-1).key,rejectedAttempt,'Corrected retry must use a fresh attempt');
 assert.equal(state().forms.at(-1).locale,'hu');
 const previousSession=state().session.id;
 assert.equal((await post('/api/checkout',{plan:'day',language:'hu'},recovery.cookie)).status,200);
 assert(state().expirations.includes(previousSession),'Changing plan must expire the previous open session');
 assert.equal(state().sessions[previousSession].status,'expired');
 assert.notEqual(state().session.id,previousSession);assert.equal(state().forms.at(-1)['metadata[plan]'],'day');

 const lost=await registerFixture();
 edit(s=>{s.createFailures=[{loseResponse:true}];});
 const formsBeforeLoss=state().forms.length;
 assert.equal((await post('/api/checkout',{plan:'day',language:'en'},lost.cookie)).status,502);
 const uncertain=pendingFor(lost.uid);assert(uncertain&&!uncertain.session_id,'Uncertain acceptance must retain its exact request');
 const acceptedSession=state().session.id;
 assert.equal((await post('/api/checkout',{plan:'day',language:'en'},lost.cookie)).status,200);
 assert.equal(state().forms.length,formsBeforeLoss+1,'Response-loss recovery must not create another session');
 assert.equal(pendingFor(lost.uid).session_id,acceptedSession);
 const lossRequests=state().createRequests.slice(-2);assert.equal(lossRequests[0].key,lossRequests[1].key);assert.deepEqual(lossRequests[0].form,lossRequests[1].form);

 const correctedResume=await registerFixture();
 edit(s=>{s.createFailures=[{status:400,type:'invalid_request_error',code:'idempotency_key_in_use'}];});
 assert.equal((await post('/api/checkout',{plan:'month',language:'en'},correctedResume.cookie)).status,502);
 const conflicted=pendingFor(correctedResume.uid);assert(conflicted,'A 400 idempotency conflict must retain the request');
 edit(s=>{s.createFailures=[{status:400,type:'invalid_request_error',code:'parameter_invalid'}];});
 assert.equal((await post('/api/checkout',{plan:'day',language:'hu'},correctedResume.cookie)).status,200);
 assert.notEqual(pendingFor(correctedResume.uid).attempt,conflicted.attempt,'A definitively rejected resumed attempt must allow a fresh corrected Checkout');
 const resumeRequests=state().createRequests.slice(-2);assert.equal(resumeRequests[0].key,'chyper-checkout-'+conflicted.attempt);assert.notEqual(resumeRequests[0].key,resumeRequests[1].key);assert.equal(resumeRequests[1].form.locale,'hu');assert.equal(resumeRequests[1].form['metadata[plan]'],'day');

 for(const failure of [{status:400,type:'idempotency_error',code:'idempotency_key_in_use'},{status:409,type:'invalid_request_error',code:'idempotency_key_in_use'},{status:429,type:'invalid_request_error',code:'rate_limit'},{status:500,type:'api_error',code:'internal_error'}]){
  const owner=await registerFixture();edit(s=>{s.createFailures=[failure];});
  assert.equal((await post('/api/checkout',{plan:'month',language:'en'},owner.cookie)).status,502);
  const retained=pendingFor(owner.uid);assert(retained&&!retained.session_id,'Uncertain or retryable error must retain attempt: '+failure.status);
  assert.equal(state().createRequests.at(-1).key,'chyper-checkout-'+retained.attempt);
 }
 assert(!logs.includes(config.key),'Secret key must never appear in logs');
 console.log('PASS: live setup validation, catalog Checkout plans, sandbox isolation, signed Unicode webhook, paid-only access, superseded event safety, cancellation/paid-period preservation, locale validation, definitive-error recovery, referral release, plan-switch expiry and idempotent response-loss recovery. All Stripe requests mocked.');
}finally{db?.close();server.kill();}
