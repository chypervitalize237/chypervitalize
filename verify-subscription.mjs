import assert from 'node:assert/strict';
import {requireSandboxKey,requireStripeKey,requireStripeObject,stripeLivemode,cancelRenewal} from './subscription-policy.mjs';

const savedMode=process.env.STRIPE_MODE;
try{
 delete process.env.STRIPE_MODE;
 assert.equal(stripeLivemode(),false);
 assert.equal(requireStripeKey('rk_test_fixture'),'rk_test_fixture');
 assert.throws(()=>requireStripeKey('sk_live_fixture'));
 process.env.STRIPE_MODE='live';
 assert.equal(stripeLivemode(),true);
 assert.equal(requireStripeKey('sk_live_fixture'),'sk_live_fixture');
 assert.throws(()=>requireStripeKey('rk_test_fixture'));
 assert.equal(requireSandboxKey('rk_test_fixture'),'rk_test_fixture');
}finally{
 if(savedMode===undefined)delete process.env.STRIPE_MODE;else process.env.STRIPE_MODE=savedMode;
}
for(const mode of ['test','live']){
 const live=mode==='live';
 assert.equal(stripeLivemode(mode),live);
 for(const prefix of ['sk','rk']){
   assert.equal(requireStripeKey(prefix+'_'+mode+'_fixture',mode),prefix+'_'+mode+'_fixture');
   assert.throws(()=>requireStripeKey(prefix+'_'+(live?'test':'live')+'_fixture',mode));
 }
 for(const key of ['',undefined,'pk_'+mode+'_fixture','sk_'+mode+'_','sk_'+mode+'_fixture\n'])assert.throws(()=>requireStripeKey(key,mode));
 assert.equal(requireStripeObject({livemode:live},mode).livemode,live);
 for(const object of [null,undefined,{}, {livemode:!live},{livemode:live?'true':'false'},{livemode:live?1:0}])assert.throws(()=>requireStripeObject(object,mode));

 const initial={id:'sub_fixture',customer:'cus_fixture',livemode:live,status:'active',current_period_end:2000000000,trial_end:null,cancel_at_period_end:false};
 const args={key:'sk_'+mode+'_fixture',mode,subscriptionId:initial.id,customerId:initial.customer};
 const calls=[];
 const request=async(url,options)=>{calls.push({url,options});return {ok:true,json:async()=>options.method==='POST'?{...initial,cancel_at_period_end:true}:initial};};
 const result=await cancelRenewal({...args,request});
 assert.equal(result.current_period_end,initial.current_period_end);
 assert.equal(result.status,'active');
 assert.equal(result.cancel_at_period_end,true);
 assert.equal(calls.length,2);
 assert.equal(calls[1].options.body.get('cancel_at_period_end'),'true');
 assert.deepEqual(Array.from(calls[1].options.body.entries()),[['cancel_at_period_end','true']]);
 assert.equal(calls[1].options.method,'POST');

 const modern={...initial,current_period_end:undefined,items:{data:[{id:'si_monthly',current_period_end:2000000000},{id:'si_other',current_period_end:2000000100}]}};
 const modernResult=await cancelRenewal({...args,request:async(_url,options)=>({ok:true,json:async()=>options.method==='POST'?{...modern,cancel_at_period_end:true,items:{data:[...modern.items.data].reverse()}}:modern})});
 assert.equal(modernResult.items.data.find(item=>item.id==='si_monthly').current_period_end,2000000000);
 for(const items of [undefined,{data:[]},{data:[{id:'si_monthly',current_period_end:1900000000},modern.items.data[1]]},{data:[modern.items.data[0],{id:'si_other',current_period_end:1900000100}]}]){
   let count=0;
   await assert.rejects(cancelRenewal({...args,request:async(_url,options)=>{count++;return {ok:true,json:async()=>options.method==='POST'?{...modern,cancel_at_period_end:true,items}:modern};}}));
   assert.equal(count,2);
 }

 for(const bad of [{...initial,livemode:!live},{...initial,livemode:undefined},{...initial,customer:'cus_other'},{...initial,id:'sub_other'},{...initial,status:'canceled'}]){
   let count=0;
   await assert.rejects(cancelRenewal({...args,request:async()=>{count++;return {ok:true,json:async()=>bad};}}));
   assert.equal(count,1);
 }
 for(const bad of [{...initial,livemode:!live,cancel_at_period_end:true},{...initial,customer:'cus_other',cancel_at_period_end:true},{...initial,id:'sub_other',cancel_at_period_end:true},{...initial,cancel_at_period_end:false},{...initial,cancel_at_period_end:'true'},{...initial,current_period_end:1900000000,cancel_at_period_end:true},{...initial,trial_end:1900000000,cancel_at_period_end:true}]){
   let count=0;
   await assert.rejects(cancelRenewal({...args,request:async(_url,options)=>{count++;return {ok:true,json:async()=>options.method==='POST'?bad:initial};}}));
   assert.equal(count,2);
 }
 for(const state of [{cancel_at_period_end:true},{cancel_at:2000000000}]){
   let count=0;
   const alreadyCanceled={...initial,...state};
   assert.deepEqual(await cancelRenewal({...args,request:async()=>{count++;return {ok:true,json:async()=>alreadyCanceled};}}),alreadyCanceled);
   assert.equal(count,1);
 }
 for(const badArgs of [{customerId:undefined},{customerId:'cus_'},{subscriptionId:'sub_unsafe/path'},{key:'sk_'+(live?'test':'live')+'_fixture'}]){
   let count=0;
   await assert.rejects(cancelRenewal({...args,...badArgs,request:async()=>{count++;throw Error('Unexpected request');}}));
   assert.equal(count,0);
 }
 let count=0;
 await assert.rejects(cancelRenewal({...args,request:async()=>{count++;return {ok:false,json:async()=>initial};}}));
 assert.equal(count,1);
}
for(const mode of ['sandbox','LIVE','',null]){
 assert.throws(()=>stripeLivemode(mode));
 assert.throws(()=>requireStripeKey('sk_test_fixture',mode));
 assert.throws(()=>requireStripeObject({livemode:false},mode));
}
assert.throws(()=>requireSandboxKey('sk_live_fixture'));
assert.throws(()=>requireSandboxKey('rk_live_fixture'));
console.log('PASS: explicit test/live keys and objects, ownership, paid period preservation, cancellation confirmation and repeat cancellation. No Stripe requests made.');
