import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {mkdtempSync,readFileSync,writeFileSync} from 'node:fs';
import {join} from 'node:path';
import {randomBytes} from 'node:crypto';
import {DatabaseSync,backup} from 'node:sqlite';
import {initWithdrawals,submitWithdrawal,validateWithdrawal} from '../withdrawal.mjs';

const directory=mkdtempSync(join(import.meta.dirname,'../tmp/withdrawal-qa-')),port='3031',base='http://127.0.0.1:'+port,admin=randomBytes(32).toString('hex');
const server=spawn(process.execPath,['server.mjs'],{cwd:join(import.meta.dirname,'..'),env:{...process.env,PORT:port,DATA_DIR:directory,BACKUP_ENABLED:'0',STRIPE_SECRET_KEY:'',WITHDRAWAL_ADMIN_TOKEN:admin},stdio:'ignore'});
const key=randomBytes(32).toString('hex'),payload={name:'Teszt Árvíztűrő',email:'withdrawal-test@example.com',contractRef:'Működési teszt – nem valódi vásárlás',requestKey:key,confirm:true};
let db;
async function post(path,value,headers={}){return fetch(base+path,{method:'POST',headers:{'Content-Type':'application/json',...headers},body:JSON.stringify(value)});}
try{
 let ready=false;for(let i=0;i<80;i++){try{if((await fetch(base+'/api/me')).ok){ready=true;break;}}catch{}await new Promise(r=>setTimeout(r,100));}assert.ok(ready,'Server starts');
 for(const path of ['/withdrawal.html','/withdrawal.js','/legal-forms.css','/terms.html','/privacy.html','/contact.html','/withdrawals-admin.html'])assert.equal((await fetch(base+path)).status,200,path);
 assert.equal((await fetch(base+'/api/withdrawals')).status,405);
 assert.equal((await post('/api/withdrawals',{...payload,confirm:false})).status,400);
 assert.equal((await post('/api/withdrawals',{...payload,email:'not-email'})).status,400);
 assert.equal((await post('/api/withdrawals',{...payload,name:'bad\nheader'})).status,400);
 assert.equal((await post('/api/withdrawals',{...payload,website:'spam'})).status,400);
 assert.equal((await post('/api/withdrawals',payload,{Origin:'https://different.example'})).status,403);
 assert.throws(()=>validateWithdrawal(null));
 const response=await post('/api/withdrawals',payload);assert.equal(response.status,201);assert.equal(response.headers.get('cache-control'),'no-store');const accepted=await response.json();assert.ok(accepted.receipt.includes('Árvíztűrő'));assert.ok(accepted.receipt.includes(payload.contractRef));assert.ok(accepted.receipt.includes(accepted.created));
 const receiptCookie=response.headers.get('set-cookie').split(';')[0];assert.ok(response.headers.get('set-cookie').includes('HttpOnly'));
 assert.equal((await fetch(base+'/api/withdrawals/receipt/'+accepted.id+'.pdf')).status,404);
 const directPdf=await fetch(base+'/api/withdrawals/receipt/'+accepted.id+'.pdf',{headers:{cookie:receiptCookie}});assert.equal(directPdf.status,200);assert.equal(directPdf.headers.get('content-type'),'application/pdf');
 const repeated=await (await post('/api/withdrawals',payload)).json();assert.equal(repeated.id,accepted.id,'Network retries are idempotent');
 assert.equal((await post('/api/withdrawals',{...payload,contractRef:'another contract'})).status,409);
 assert.equal((await post('/api/withdrawals/receipt',{id:accepted.id,requestKey:randomBytes(32).toString('hex')})).status,404,'Receipt is private');
 const pdf=await post('/api/withdrawals/receipt',{id:accepted.id,requestKey:key});assert.equal(pdf.status,200);assert.equal(pdf.headers.get('content-type'),'application/pdf');const bytes=Buffer.from(await pdf.arrayBuffer());assert.equal(bytes.subarray(0,5).toString(),'%PDF-');writeFileSync(join(directory,'receipt.pdf'),bytes);
 assert.equal((await post('/api/withdrawals/admin/list',{})).status,401);
 assert.equal((await post('/api/withdrawals/admin/list',{},{Authorization:'Bearer wrong-token'})).status,401);
 const auth={Authorization:'Bearer '+admin},list=await (await post('/api/withdrawals/admin/list',{},auth)).json();assert.equal(list.requests.length,1);assert.equal(list.requests[0].email,payload.email);assert.ok(!Object.hasOwn(list.requests[0],'request_key'));
 assert.equal((await post('/api/withdrawals/admin/status',{id:accepted.id,status:'refunded'},auth)).status,400);
 assert.equal((await post('/api/withdrawals/admin/status',{id:accepted.id,status:'processing'},auth)).status,200);
 db=new DatabaseSync(join(directory,'chypermax.sqlite'));assert.equal(db.prepare('SELECT count(*) n FROM withdrawal_requests').get().n,1);assert.equal(db.prepare('SELECT status FROM withdrawal_requests').get().status,'processing');assert.equal(db.prepare('SELECT count(*) n FROM users').get().n,0,'Withdrawal never creates an account or payment');
 initWithdrawals(db);assert.equal(db.prepare('SELECT count(*) n FROM withdrawal_requests').get().n,1,'Schema initialization preserves requests');
 const snapshotPath=join(directory,'snapshot.sqlite');await backup(db,snapshotPath);const restored=new DatabaseSync(snapshotPath,{readOnly:true});assert.equal(restored.prepare('SELECT id FROM withdrawal_requests').get().id,accepted.id);assert.equal(restored.prepare('PRAGMA integrity_check').get().integrity_check,'ok');restored.close();
 const snapshot=readFileSync(join(directory,'receipt.pdf'));assert.ok(snapshot.length>5000,'Embedded Unicode font');
 for(let i=0;i<60;i++)await post('/api/withdrawals/admin/list',{});assert.equal((await post('/api/withdrawals',payload)).status,429,'Anonymous abuse is limited');
 console.log('PASS: validation, confirmation, anonymous submission, durable private PDF, accented text, idempotency, operator authorization, status updates, persistence, origin protection, rate limit, no payment changes.');
 console.log('Receipt fixture: '+join(directory,'receipt.pdf'));
}finally{db?.close();server.kill();}
