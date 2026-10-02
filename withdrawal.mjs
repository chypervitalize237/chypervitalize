import {randomBytes, createHash, timingSafeEqual} from 'node:crypto';
import PDFDocument from 'pdfkit';

export const withdrawalStatement='Elállok a Chypervitalize szolgáltatásra kötött szerződésemtől, illetve a már megkezdett szolgáltatást felmondom.';
const clean=(value,max)=>typeof value==='string'?value.trim().slice(0,max):'';
const hash=value=>createHash('sha256').update(value).digest('hex');
export function initWithdrawals(db){
 db.exec(`CREATE TABLE IF NOT EXISTS withdrawal_requests (
 id TEXT PRIMARY KEY, request_key TEXT UNIQUE NOT NULL, payload_hash TEXT NOT NULL,
 name TEXT NOT NULL, email TEXT NOT NULL, contract_ref TEXT NOT NULL,
 statement TEXT NOT NULL, created TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'received',
 updated TEXT NOT NULL, receipt TEXT NOT NULL
 ); CREATE INDEX IF NOT EXISTS withdrawal_created ON withdrawal_requests(created);`);
}
export function validateWithdrawal(input){
 if(!input||typeof input!=='object'||Array.isArray(input))throw Error('validation');
 const name=clean(input.name,160),email=clean(input.email,254).toLowerCase(),contractRef=clean(input.contractRef,240),requestKey=clean(input.requestKey,64);
 if(name.length<2||contractRef.length<3||!/^\S+@[^\s@]+\.[^\s@]+$/.test(email)||/[\r\n\x00-\x1f]/.test(name+email+contractRef)||input.confirm!==true||! /^[a-f0-9]{64}$/.test(requestKey)||clean(input.website,200))throw Error('validation');
 return {name,email,contractRef,requestKey};
}
export function submitWithdrawal(db,input,now=new Date()){
 const value=validateWithdrawal(input),fingerprint=hash(JSON.stringify([value.name,value.email,value.contractRef]));
 const existing=db.prepare('SELECT * FROM withdrawal_requests WHERE request_key=?').get(hash(value.requestKey));
 if(existing){if(existing.payload_hash!==fingerprint)throw Error('conflict');return existing;}
 const id='EL-'+now.toISOString().slice(0,10).replaceAll('-','')+'-'+randomBytes(8).toString('hex'),created=now.toISOString();
 const date=new Intl.DateTimeFormat('hu-HU',{timeZone:'Europe/Budapest',dateStyle:'long',timeStyle:'long'}).format(now);
 const receipt=`CHYPERVITALIZE – ELÁLLÁSI NYILATKOZAT ÁTVÉTELI VISSZAIGAZOLÁSA\n\nAzonosító: ${id}\nBeérkezés: ${date}\nPontos időpont (UTC): ${created}\n\nCímzett: Tamasits Mór\nMagyarország, 9400 Sopron, Vásárhelyi Pál 12.\nchypervitalize@gmail.com\n\nNyilatkozó neve: ${value.name}\nKapcsolati / fiók e-mail-cím: ${value.email}\nÉrintett szerződés: ${value.contractRef}\n\nNyilatkozat: ${withdrawalStatement}\n\nA nyilatkozatot a szerver átvette és rögzítette. Ez a dokumentum a beküldés tartalmát és időpontját igazolja; nem a visszatérítés elbírálása vagy végrehajtása. A megkeresést az üzemeltető feldolgozza. Azonosításra szükség lehet, de az elállást nem kell indokolni. A kérelem nem módosítja automatikusan a fizetési vagy előfizetési adatokat.\n\nA visszaigazolás letölthető fájlként érkezik a beküldéshez használt eszközre. Külön e-mailt ez a funkció nem küld. Őrizd meg ezt a fájlt.\n`;
 db.prepare('INSERT INTO withdrawal_requests(id,request_key,payload_hash,name,email,contract_ref,statement,created,updated,receipt) VALUES(?,?,?,?,?,?,?,?,?,?)').run(id,hash(value.requestKey),fingerprint,value.name,value.email,value.contractRef,withdrawalStatement,created,created,receipt);
 return db.prepare('SELECT * FROM withdrawal_requests WHERE id=?').get(id);
}
export function publicWithdrawal(record){return {id:record.id,created:record.created,status:record.status,receipt:record.receipt};}
export function withdrawalReceipt(db,id,key){
 if(!/^[a-f0-9]{64}$/.test(String(key||'')))return null;
 return db.prepare('SELECT * FROM withdrawal_requests WHERE id=? AND request_key=?').get(String(id||''),hash(key));
}
export function adminAuthorized(header,token){
 if(!token||token.length<32||!header?.startsWith('Bearer '))return false;
 return timingSafeEqual(Buffer.from(hash(header.slice(7)),'hex'),Buffer.from(hash(token),'hex'));
}
export function receiptPdf(record,res,fontPath){
 const doc=new PDFDocument({size:'A4',margin:48,info:{Title:'Elállási nyilatkozat átvételi visszaigazolása',Author:'Chypervitalize'}});
 res.writeHead(200,{'Content-Type':'application/pdf','Content-Disposition':`attachment; filename="${record.id}.pdf"`,'Cache-Control':'no-store'});
 doc.pipe(res);doc.font(fontPath).fontSize(10).text(record.receipt,{lineGap:4});doc.end();
}
