export function stripeLivemode(mode=process.env.STRIPE_MODE||'test'){
 if(!['test','live'].includes(mode))throw new Error('STRIPE_MODE must be test or live');
 return mode==='live';
}
export function requireStripeKey(key,mode=process.env.STRIPE_MODE||'test'){
 stripeLivemode(mode);
 if(typeof key!=='string'||!new RegExp('^(?:sk|rk)_'+mode+'_[A-Za-z0-9]+$').test(key)){
  console.error('[payments] key check failed', {mode, type: typeof key, prefix: typeof key==='string'?key.slice(0,8):null, length: typeof key==='string'?key.length:0});
  throw new Error('Stripe '+mode+' key required');
 }
 return key;
}
export function requireStripeObject(object,mode=process.env.STRIPE_MODE||'test'){
 if(!object||object.livemode!==stripeLivemode(mode))throw new Error('Stripe object mode mismatch');
 return object;
}
export function requireSandboxKey(key){
 return requireStripeKey(key,'test');
}
export async function cancelRenewal({key,subscriptionId,customerId,request=fetch,mode=process.env.STRIPE_MODE||'test'}){
 requireStripeKey(key,mode);
 if(!/^sub_[A-Za-z0-9]+$/.test(subscriptionId||''))throw new Error('No subscription');
 if(!/^cus_[A-Za-z0-9]+$/.test(customerId||''))throw new Error('No Stripe customer');
 const url='https://api.stripe.com/v1/subscriptions/'+encodeURIComponent(subscriptionId);
 const headers={Authorization:'Bearer '+key};
 const current=await request(url,{headers,signal:AbortSignal.timeout(15000)});
 const sub=await current.json();
 if(!current.ok||sub.id!==subscriptionId||sub.customer!==customerId)throw new Error('Subscription verification failed');
 requireStripeObject(sub,mode);
 if(!['active','trialing','past_due'].includes(sub.status))throw new Error('Subscription cannot renew');
 if(sub.cancel_at_period_end||sub.cancel_at)return sub;
 const response=await request(url,{method:'POST',headers:{...headers,'Content-Type':'application/x-www-form-urlencoded'},body:new URLSearchParams({cancel_at_period_end:'true'}),signal:AbortSignal.timeout(15000)});
 const updated=await response.json();
 if(!response.ok||updated.id!==subscriptionId||updated.customer!==customerId||updated.cancel_at_period_end!==true)throw new Error('Cancellation not confirmed');
 requireStripeObject(updated,mode);
 if(sub.current_period_end!==undefined&&updated.current_period_end!==sub.current_period_end)throw new Error('Paid period changed during cancellation');
 if(sub.trial_end!==undefined&&updated.trial_end!==sub.trial_end)throw new Error('Trial period changed during cancellation');
 // Recent Stripe API versions expose each paid period on the subscription item.
 for(const item of sub.items?.data||[]){
   if(item.current_period_end===undefined)continue;
   const updatedItem=updated.items?.data?.find(candidate=>candidate.id===item.id);
   if(!updatedItem||updatedItem.current_period_end!==item.current_period_end)throw new Error('Paid item period changed during cancellation');
 }
 return updated;
}
