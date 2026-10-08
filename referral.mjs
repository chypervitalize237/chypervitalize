import {requireSandboxKey} from './subscription-policy.mjs';
export function initReferrals(db){
 db.exec(`CREATE TABLE IF NOT EXISTS referral_rewards(invitee TEXT PRIMARY KEY,inviter TEXT NOT NULL,created INTEGER NOT NULL,status TEXT NOT NULL DEFAULT 'pending',coupon TEXT,session_id TEXT,subscription_id TEXT,discount_id TEXT,invoice_id TEXT); CREATE INDEX IF NOT EXISTS referral_owner ON referral_rewards(inviter,status)`);
 try{db.exec('ALTER TABLE referral_rewards ADD COLUMN checkout_attempt INTEGER NOT NULL DEFAULT 0')}catch{}
}
const identity=email=>{let [local,domain]=String(email).toLowerCase().split('@');if(['gmail.com','googlemail.com'].includes(domain)){domain='gmail.com';local=local.split('+')[0].replaceAll('.','');}return local+'@'+domain;};
export function grantReferral(db,invitee,code){
 if(!/^[a-f0-9]{16}$/.test(String(code||'')))return null;
 const friend=db.prepare('SELECT id,email FROM users WHERE id=?').get(invitee),owner=db.prepare('SELECT id,email FROM users WHERE ref=?').get(code);
 if(!friend||!owner||owner.id===friend.id||identity(owner.email)===identity(friend.email))return null;
 db.prepare('INSERT OR IGNORE INTO referral_rewards(invitee,inviter,created) VALUES(?,?,?)').run(friend.id,owner.id,Date.now());return owner.id;
}
export function referralSummary(db,uid){const rows=db.prepare('SELECT status,COUNT(*) n FROM referral_rewards WHERE inviter=? GROUP BY status').all(uid);const count=status=>Number(rows.find(r=>r.status===status)?.n||0);return {earned:rows.reduce((n,r)=>n+Number(r.n),0),available:count('pending'),scheduled:count('applied')+count('reserved'),used:count('used'),percent:50};}
export function createReferralService(db,{key,request=fetch}={}){
 const busy=new Set();
 async function stripe(path,form,idempotency){requireSandboxKey(key);const headers={Authorization:'Bearer '+key};if(form){headers['Content-Type']='application/x-www-form-urlencoded';headers['Idempotency-Key']=idempotency;}const r=await request('https://api.stripe.com/v1/'+path,{method:form?'POST':'GET',headers,body:form,signal:AbortSignal.timeout(15000)});const value=await r.json();if(!r.ok)throw Error(value.error?.message||'Stripe referral request failed');if(value.livemode===true)throw Error('Live Stripe object rejected');return value;}
 const couponId=row=>'chy_ref_'+row.invitee;
 const couponOf=discount=>typeof discount==='object'?(discount.source?.coupon?.id||discount.source?.coupon||discount.coupon?.id||discount.coupon):null;
 async function ensureCoupon(row){const id=couponId(row);try{return await stripe('coupons/'+id);}catch{}return stripe('coupons',new URLSearchParams({id,name:'Chypervitalize referral -50% / 1 month',percent_off:'50',duration:'once',max_redemptions:'1'}),'referral-coupon-'+row.invitee);}
 async function reserveCheckout(uid,plan){
  if(plan!=='month')return null;
  if(db.prepare("SELECT 1 FROM referral_rewards WHERE inviter=? AND status IN ('applied','applying')").get(uid))throw Error('Referral discount already scheduled');
  let row=db.prepare("SELECT * FROM referral_rewards WHERE inviter=? AND status='reserved' ORDER BY created LIMIT 1").get(uid);
  if(row?.session_id){const session=await stripe('checkout/sessions/'+row.session_id);if(session.status==='open')return {row,url:session.url,sessionId:session.id};if(session.status==='complete')throw Error('Previous referral checkout is being confirmed');db.prepare("UPDATE referral_rewards SET status='pending',session_id=NULL,checkout_attempt=checkout_attempt+1 WHERE invitee=? AND status='reserved'").run(row.invitee);row=null;}
  if(!row){row=db.prepare("SELECT * FROM referral_rewards WHERE inviter=? AND status='pending' ORDER BY created,invitee LIMIT 1").get(uid);if(!row)return null;db.prepare("UPDATE referral_rewards SET status='reserved' WHERE invitee=? AND status='pending'").run(row.invitee);}
  const coupon=await ensureCoupon(row);if(coupon.times_redeemed>0)throw Error('Referral discount is being confirmed');return {row,coupon:coupon.id};
 }
 function recordCheckout(invitee,session){db.prepare("UPDATE referral_rewards SET session_id=?,coupon=? WHERE invitee=? AND status='reserved'").run(session.id,couponId({invitee}),invitee);}
 function releaseCheckout(invitee){db.prepare("UPDATE referral_rewards SET status='pending' WHERE invitee=? AND session_id IS NULL AND status='reserved'").run(invitee);}
 function completeCheckout(session){if(session.payment_status!=='paid'||session.status!=='complete'||session.metadata?.plan!=='month')return;db.prepare("UPDATE referral_rewards SET status='used',subscription_id=? WHERE invitee=? AND inviter=? AND session_id=? AND status='reserved'").run(typeof session.subscription==='string'?session.subscription:null,session.metadata?.referral_reward||'',session.metadata?.uid||'',session.id);}
 function settleInvoice(invoice){if(invoice.status!=='paid'||invoice.livemode!==false)return;const customer=typeof invoice.customer==='string'?invoice.customer:invoice.customer?.id;const owner=db.prepare('SELECT id FROM users WHERE stripe_customer_id=?').get(customer);if(!owner)return;for(const item of invoice.total_discount_amounts||[]){if(!(item.amount>0))continue;const id=typeof item.discount==='string'?item.discount:item.discount?.id;db.prepare("UPDATE referral_rewards SET status='used',invoice_id=? WHERE inviter=? AND discount_id=? AND status='applied'").run(invoice.id,owner.id,id||'');}}
 async function applyPending(uid){
  if(busy.has(uid))return;busy.add(uid);
  try{
   if(db.prepare("SELECT 1 FROM referral_rewards WHERE inviter=? AND status IN ('applied','reserved')").get(uid))return;
   const row=db.prepare("SELECT * FROM referral_rewards WHERE inviter=? AND status='pending' ORDER BY created,invitee LIMIT 1").get(uid),owner=db.prepare('SELECT * FROM users WHERE id=?').get(uid);if(!row||!owner?.stripe_subscription_id||owner.cancel_at_period_end||!['active','trialing'].includes(owner.subscription_status))return;
   const sub=await stripe('subscriptions/'+encodeURIComponent(owner.stripe_subscription_id)+'?expand[]=discounts');if(sub.customer!==owner.stripe_customer_id||!['active','trialing'].includes(sub.status)||sub.cancel_at_period_end||sub.cancel_at)return;
   const items=sub.items?.data||[];if(items.length!==1||items[0].price?.recurring?.interval!=='month'||items[0].price?.currency!=='usd'||items[0].price?.unit_amount!==1249)return;
   const discounts=(sub.discounts||[sub.discount].filter(Boolean)).filter(d=>!db.prepare("SELECT 1 FROM referral_rewards WHERE inviter=? AND coupon=? AND status='used'").get(uid,couponOf(d)||'')),existing=discounts.find(d=>couponOf(d)===couponId(row));
   if(discounts.length&&!existing)return;
   const claimed=db.prepare("UPDATE referral_rewards SET status='applying' WHERE invitee=? AND status='pending'").run(row.invitee);if(!claimed.changes)return;
   let discount=existing;try{if(!discount){const coupon=await ensureCoupon(row);const updated=await stripe('subscriptions/'+sub.id,new URLSearchParams({'discounts[0][coupon]':coupon.id,proration_behavior:'none','expand[]':'discounts'}),'referral-subscription-'+row.invitee+'-'+sub.id);discount=(updated.discounts||[updated.discount].filter(Boolean)).find(d=>couponOf(d)===coupon.id)||updated.discounts?.[0]||updated.discount;}}catch(e){db.prepare("UPDATE referral_rewards SET status='pending' WHERE invitee=? AND status='applying'").run(row.invitee);throw e;}
   const id=typeof discount==='string'?discount:discount?.id;if(!id){db.prepare("UPDATE referral_rewards SET status='pending' WHERE invitee=? AND status='applying'").run(row.invitee);throw Error('Referral discount not confirmed');}
   db.prepare("UPDATE referral_rewards SET status='applied',coupon=?,subscription_id=?,discount_id=? WHERE invitee=? AND status='applying'").run(couponId(row),sub.id,id,row.invitee);
  }finally{busy.delete(uid);}
 }
 async function sweep(){
  for(const row of db.prepare("SELECT * FROM referral_rewards WHERE status IN ('applied','reserved')").all()){try{
   if(row.status==='reserved'&&row.session_id){const session=await stripe('checkout/sessions/'+row.session_id);if(session.status==='expired')db.prepare("UPDATE referral_rewards SET status='pending',session_id=NULL,checkout_attempt=checkout_attempt+1 WHERE invitee=? AND status='reserved'").run(row.invitee);else completeCheckout(session);}
   if(row.status==='applied'){const sub=await stripe('subscriptions/'+row.subscription_id);const invoiceId=typeof sub.latest_invoice==='string'?sub.latest_invoice:sub.latest_invoice?.id;if(invoiceId)settleInvoice(await stripe('invoices/'+invoiceId));}
  }catch(e){console.error('Referral reconciliation:',e.message);}}
  const owners=db.prepare("SELECT DISTINCT inviter FROM referral_rewards WHERE status='pending'").all();for(const row of owners){try{await applyPending(row.inviter);}catch(e){console.error('Referral discount:',e.message);}}
 }
 return {reserveCheckout,recordCheckout,releaseCheckout,completeCheckout,settleInvoice,applyPending,sweep};
}
