const form=document.querySelector('#withdrawal-form'),fields=document.querySelector('#request-fields'),confirm=document.querySelector('#confirmation'),error=document.querySelector('#form-error');
let stage='edit',result=null;
const storageKey='chyper-withdrawal-pending';
let pending;try{pending=JSON.parse(sessionStorage.getItem(storageKey)||'null');}catch{}
const requestKey=pending?.key&&/^[a-f0-9]{64}$/.test(pending.key)?pending.key:Array.from(crypto.getRandomValues(new Uint8Array(32)),v=>v.toString(16).padStart(2,'0')).join('');
if(pending?.data)for(const key of ['name','email','contractRef'])form.elements[key].value=String(pending.data[key]||'');
const data=()=>({name:form.elements.name.value.trim(),email:form.elements.email.value.trim(),contractRef:form.elements.contractRef.value.trim(),website:form.elements.website.value,requestKey,confirm:true});
function summary(value){const dl=document.querySelector('#request-summary');dl.replaceChildren();for(const [label,key]of [['Név','name'],['E-mail-cím','email'],['Érintett szerződés','contractRef']]){const dt=document.createElement('dt'),dd=document.createElement('dd');dt.textContent=label;dd.textContent=value[key];dl.append(dt,dd);}}
document.querySelector('#edit-request').addEventListener('click',()=>{stage='edit';confirm.hidden=true;fields.hidden=false;form.elements.name.focus();});
form.addEventListener('submit',async event=>{
 event.preventDefault();error.textContent='';if(!form.reportValidity())return;
 const value=data();
 if(stage==='edit'){summary(value);fields.hidden=true;confirm.hidden=false;stage='confirm';confirm.querySelector('button[type=submit]').focus();return;}
 const buttons=form.querySelectorAll('button');buttons.forEach(b=>b.disabled=true);
 try{
  try{sessionStorage.setItem(storageKey,JSON.stringify({key:requestKey,data:value}));}catch{}
  const response=await fetch('/api/withdrawals',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(value),signal:AbortSignal.timeout(20000)});
  const body=await response.json();if(!response.ok)throw Error(body.error||'A beküldés nem sikerült.');result=body;
  form.hidden=true;document.querySelector('#request-success').hidden=false;document.querySelector('#success-summary').textContent='Azonosító: '+body.id+' · Beérkezés: '+new Date(body.created).toLocaleString('hu-HU',{timeZone:'Europe/Budapest'});document.querySelector('#receipt-text').textContent=body.receipt;
  try{sessionStorage.setItem(storageKey,JSON.stringify({key:requestKey,data:value}));}catch{}
  document.querySelector('#download-receipt').href='/api/withdrawals/receipt/'+encodeURIComponent(body.id)+'.pdf';
  document.querySelector('#download-receipt').download=body.id+'.pdf';
  document.querySelector('#download-receipt').focus();
  document.querySelector('#download-receipt').click();
 }catch(e){error.textContent=e.name==='TimeoutError'?'A válasz késik. Ugyanezzel az űrlappal újrapróbálhatod; a szerver nem rögzíti kétszer a kérelmet.':e.message||'Hálózati hiba. Próbáld újra.';buttons.forEach(b=>b.disabled=false);}
});
