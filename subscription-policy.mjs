export function requireSandboxKey(key){
 if(!/^(?:sk|rk)_test_/.test(String(key||'')))throw new Error('Stripe sandbox test key required');
 return key;
}
export async function cancelRenewal({key,subscriptionId,customerId,request=fetch}){
 requireSandboxKey(key);
 if(!/^sub_[A-Za-z0-9]+$/.test(subscriptionId||''))throw new Error('No subscription');
 const url='https://api.stripe.com/v1/subscriptions/'+encodeURIComponent(subscriptionId);
 const headers={Authorization:'Bearer '+key};
 const current=await request(url,{headers,signal:AbortSignal.timeout(15000)});
 const sub=await current.json();
 if(!current.ok||sub.livemode!==false||sub.customer!==customerId)throw new Error('Subscription verification failed');
 if(!['active','trialing','past_due'].includes(sub.status))throw new Error('Subscription cannot renew');
 if(sub.cancel_at_period_end||sub.cancel_at)return sub;
 const response=await request(url,{method:'POST',headers:{...headers,'Content-Type':'application/x-www-form-urlencoded'},body:new URLSearchParams({cancel_at_period_end:'true'}),signal:AbortSignal.timeout(15000)});
 const updated=await response.json();
 if(!response.ok||updated.livemode!==false||updated.id!==subscriptionId||updated.customer!==customerId||!updated.cancel_at_period_end)throw new Error('Cancellation not confirmed');
 return updated;
}
