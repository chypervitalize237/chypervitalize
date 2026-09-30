import assert from 'node:assert/strict';
import {requireSandboxKey,cancelRenewal} from './subscription-policy.mjs';
assert.throws(()=>requireSandboxKey('sk_live_fixture'));
assert.throws(()=>requireSandboxKey('rk_live_fixture'));
assert.throws(()=>requireSandboxKey(''));
assert.equal(requireSandboxKey('rk_test_fixture'),'rk_test_fixture');
const initial={id:'sub_fixture',customer:'cus_fixture',livemode:false,status:'active',current_period_end:2000000000,cancel_at_period_end:false};
let calls=[];
const request=async(url,options)=>{calls.push({url,options});return {ok:true,json:async()=>options.method==='POST'?{...initial,cancel_at_period_end:true}:initial};};
const result=await cancelRenewal({key:'sk_test_fixture',subscriptionId:initial.id,customerId:initial.customer,request});
assert.equal(result.current_period_end,initial.current_period_end);
assert.equal(result.status,'active');
assert.equal(result.cancel_at_period_end,true);
assert.equal(calls.length,2);
assert.equal(calls[1].options.body.get('cancel_at_period_end'),'true');
assert.equal(calls[1].options.body.has('prorate'),false);
for(const bad of [{...initial,livemode:true},{...initial,customer:'cus_other'}]){
 let count=0;
 await assert.rejects(cancelRenewal({key:'sk_test_fixture',subscriptionId:initial.id,customerId:initial.customer,request:async()=>{count++;return {ok:true,json:async()=>bad};}}));
 assert.equal(count,1);
}
let count=0;
await cancelRenewal({key:'sk_test_fixture',subscriptionId:initial.id,customerId:initial.customer,request:async()=>{count++;return {ok:true,json:async()=>({...initial,cancel_at_period_end:true})};}});
assert.equal(count,1);
console.log('PASS: sandbox-only keys, ownership, live object rejection, paid period preserved, repeat cancellation avoids duplicate update. No Stripe requests made.');
