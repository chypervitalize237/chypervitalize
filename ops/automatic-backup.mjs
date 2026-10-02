import {DatabaseSync, backup} from 'node:sqlite';
import {mkdtemp, readFile, writeFile, rm, mkdir, rename} from 'node:fs/promises';
import {join} from 'node:path';
import {tmpdir} from 'node:os';
import {randomBytes, createCipheriv, createDecipheriv, createHash} from 'node:crypto';
import {gzipSync, gunzipSync} from 'node:zlib';
import {S3Client, PutObjectCommand, GetObjectCommand, ListObjectsV2Command, DeleteObjectCommand} from '@aws-sdk/client-s3';

const magic=Buffer.from('CHYBK001'), DAY=86400000;
export function encryptionKey(value){
  if(!/^[a-f0-9]{64}$/i.test(value||'')) throw Error('Backup encryption key must contain 64 hex characters');
  return Buffer.from(value,'hex');
}
export function encryptSnapshot(bytes,key){
  const iv=randomBytes(12),cipher=createCipheriv('aes-256-gcm',key,iv);
  cipher.setAAD(magic);
  const encrypted=Buffer.concat([cipher.update(gzipSync(bytes)),cipher.final()]);
  return Buffer.concat([magic,iv,cipher.getAuthTag(),encrypted]);
}
export function decryptSnapshot(bytes,key){
  if(bytes.length<37||!bytes.subarray(0,8).equals(magic)) throw Error('Invalid backup format');
  const decipher=createDecipheriv('aes-256-gcm',key,bytes.subarray(8,20));
  decipher.setAAD(magic);decipher.setAuthTag(bytes.subarray(20,36));
  return gunzipSync(Buffer.concat([decipher.update(bytes.subarray(36)),decipher.final()]),{maxOutputLength:100*1024*1024});
}
export function checkSnapshot(path){
  const restored=new DatabaseSync(path,{readOnly:true});
  try{
    const rows=restored.prepare('PRAGMA integrity_check').all();
    if(rows.length!==1||rows[0].integrity_check!=='ok') throw Error('Backup integrity check failed');
    for(const table of ['users','sessions','reviews','site_metrics']) restored.prepare(`SELECT count(*) FROM ${table}`).get();
  }finally{restored.close();}
}
export function backupStorage(env=process.env){
  const required=['BACKUP_BUCKET','BACKUP_ENDPOINT','BACKUP_ACCESS_KEY_ID','BACKUP_SECRET_ACCESS_KEY','BACKUP_ENCRYPTION_KEY'];
  if(required.some(k=>!env[k])) throw Error('Backup storage configuration incomplete');
  const endpoint=new URL(env.BACKUP_ENDPOINT);
  if(endpoint.protocol!=='https:') throw Error('Backup storage must use HTTPS');
  return {bucket:env.BACKUP_BUCKET,key:encryptionKey(env.BACKUP_ENCRYPTION_KEY),client:new S3Client({
    endpoint:endpoint.href,region:env.BACKUP_REGION||'auto',maxAttempts:3,
    credentials:{accessKeyId:env.BACKUP_ACCESS_KEY_ID,secretAccessKey:env.BACKUP_SECRET_ACCESS_KEY}
  })};
}
export async function createRemoteBackup({source,client,bucket,key,now=new Date(),prefix='chyper-sqlite-v1'}){
  const work=await mkdtemp(join(tmpdir(),'chyper-backup-'));
  try{
    const path=join(work,'snapshot.sqlite'),db=new DatabaseSync(source,{readOnly:true});
    try{await backup(db,path);}finally{db.close();}
    checkSnapshot(path);
    const bytes=await readFile(path);
    // Bound memory, retained storage and upload traffic. Fail visibly instead of growing costs unboundedly.
    if(bytes.length>25*1024*1024) throw Error('Database exceeds 25 MiB automatic backup limit');
    const encrypted=encryptSnapshot(bytes,key),digest=createHash('sha256').update(bytes).digest('hex');
    const names=[`${prefix}/daily/${now.toISOString().slice(0,10)}.enc`,`${prefix}/weekly/${String(Math.floor(now.getTime()/(7*DAY))).padStart(8,'0')}.enc`];
    for(const name of names){
      await client.send(new PutObjectCommand({Bucket:bucket,Key:name,Body:encrypted,ContentType:'application/octet-stream'}));
      const remote=await client.send(new GetObjectCommand({Bucket:bucket,Key:name}));
      const verified=decryptSnapshot(Buffer.from(await remote.Body.transformToByteArray()),key);
      if(createHash('sha256').update(verified).digest('hex')!==digest) throw Error('Uploaded backup verification failed');
    }
    // Delete only our exact, recognized backup keys, after the new copies are verified.
    for(const [kind,keep,pattern] of [['daily',7,/^\d{4}-\d{2}-\d{2}\.enc$/],['weekly',4,/^\d{8}\.enc$/]]){
      const base=`${prefix}/${kind}/`,items=[];let token;
      do{
        const page=await client.send(new ListObjectsV2Command({Bucket:bucket,Prefix:base,ContinuationToken:token}));
        items.push(...(page.Contents||[]).map(x=>x.Key).filter(x=>typeof x==='string'&&pattern.test(x.slice(base.length))));
        token=page.IsTruncated?page.NextContinuationToken:undefined;
      }while(token);
      for(const name of items.sort().reverse().slice(keep)) await client.send(new DeleteObjectCommand({Bucket:bucket,Key:name}));
    }
    return {date:now.toISOString().slice(0,10),bytes:bytes.length,sha256:digest,objects:names};
  }finally{await rm(work,{recursive:true,force:true});}
}
export function startAutomaticBackup({source,stateDirectory,env=process.env,log=console}){
  if(env.BACKUP_ENABLED!=='1') return;
  let storage;
  try{storage=backupStorage(env);}catch{log.error('[backup] configuration incomplete or invalid');return;}
  let busy=false;
  const statePath=join(stateDirectory,'backup-state.json');
  async function tick(){
    if(busy)return;busy=true;
    try{
      const today=new Date().toISOString().slice(0,10);
      let state={};try{state=JSON.parse(await readFile(statePath,'utf8'));}catch{}
      if(state.date===today)return;
      const result=await createRemoteBackup({source,...storage});
      await mkdir(stateDirectory,{recursive:true});
      const pending=statePath+'.tmp';await writeFile(pending,JSON.stringify(result),{mode:0o600});await rename(pending,statePath);
      log.info(`[backup] verified daily and weekly encrypted copies: ${result.date}; ${result.bytes} bytes`);
    }catch(error){
      // No provider response body, credentials, account details or SQL data in logs.
      log.error(`[backup] failed; retry within one hour (${error.name||'Error'})`);
    }finally{busy=false;}
  }
  void tick();const timer=setInterval(()=>void tick(),3600000);timer.unref();
  return ()=>clearInterval(timer);
}
