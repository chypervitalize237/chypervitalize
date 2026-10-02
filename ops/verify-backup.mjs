import assert from 'node:assert/strict';
import {DatabaseSync} from 'node:sqlite';
import {mkdtemp,readFile,writeFile,rm} from 'node:fs/promises';
import {join} from 'node:path';
import {tmpdir} from 'node:os';
import {randomBytes} from 'node:crypto';
import {createRemoteBackup,decryptSnapshot,checkSnapshot} from './automatic-backup.mjs';
const work=await mkdtemp(join(tmpdir(),'chyper-backup-test-')),objects=new Map(),key=randomBytes(32);
const source=join(work,'live.sqlite'),db=new DatabaseSync(source);
db.exec("PRAGMA journal_mode=WAL; CREATE TABLE users(id TEXT,draft TEXT); CREATE TABLE sessions(token TEXT); CREATE TABLE reviews(id INTEGER); CREATE TABLE site_metrics(name TEXT); INSERT INTO users VALUES('qa','árvíztűrő tükörfúrógép');");
const client={async send(command){
  const {Key,Body,Prefix}=command.input;
  switch(command.constructor.name){
    case 'PutObjectCommand':objects.set(Key,Buffer.from(Body));return {};
    case 'GetObjectCommand':return {Body:{transformToByteArray:async()=>objects.get(Key)}};
    case 'ListObjectsV2Command':return {Contents:[...objects.keys()].filter(k=>k.startsWith(Prefix)).map(Key=>({Key}))};
    case 'DeleteObjectCommand':objects.delete(Key);return {};
    default:throw Error('Unexpected command');
  }
}};
try{
  objects.set('chyper-sqlite-v1/daily/do-not-delete.txt',Buffer.from('keep'));
  for(let day=1;day<=35;day++)await createRemoteBackup({source,client,bucket:'test',key,now:new Date(Date.UTC(2026,0,day))});
  assert.equal([...objects.keys()].filter(k=>/daily\/.*\.enc$/.test(k)).length,7);
  assert.equal([...objects.keys()].filter(k=>/weekly\/.*\.enc$/.test(k)).length,4);
  assert(objects.has('chyper-sqlite-v1/daily/do-not-delete.txt'));
  const name=[...objects.keys()].filter(k=>/daily\/.*\.enc$/.test(k)).sort().at(-1),encrypted=objects.get(name);
  const restored=join(work,'restored.sqlite');await writeFile(restored,decryptSnapshot(encrypted,key));checkSnapshot(restored);
  const recovered=new DatabaseSync(restored,{readOnly:true});
  assert.equal(recovered.prepare('SELECT draft FROM users').get().draft,'árvíztűrő tükörfúrógép');recovered.close();
  const tampered=Buffer.from(encrypted);tampered[tampered.length-1]^=1;
  assert.throws(()=>decryptSnapshot(tampered,key));assert.throws(()=>decryptSnapshot(encrypted,randomBytes(32)));
  const before=new Map(objects),broken={async send(command){if(command.constructor.name==='GetObjectCommand')throw Error('Simulated download failure');return client.send(command);}};
  await assert.rejects(createRemoteBackup({source,client:broken,bucket:'test',key,now:new Date('2026-03-01')}));
  for(const name of before.keys())assert(objects.has(name),'Failed verification must preserve previous backups');
  console.log('PASS: live WAL snapshot, encrypted upload/readback, restoration, retention, tamper/wrong-key rejection and preservation on failed verification');
}finally{db.close();await rm(work,{recursive:true,force:true});}
