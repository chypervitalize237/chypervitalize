export function openStyleCarousel({styles,hu,initialStyle,openModal,fitExamples,esc}){
 const initial=Math.max(0,styles.findIndex(style=>style.id===initialStyle));
 openModal(`<section class="style-picker" aria-labelledby="style-picker-title">
  <div class="style-picker-heading"><p class="eyebrow">CHYPERVITALIZE / ${hu?'A TE STÍLUSOD':'YOUR STYLE'}</p><h2 id="style-picker-title">${hu?'Így kezdődik a következő fejezeted.':'Your next chapter starts here.'}</h2><p>${hu?'Lapozz a sablonok között, és találd meg azt, amelyik igazán te vagy.':'Explore the templates and find the one that feels like you.'}</p></div>
  <div class="style-picker-browser" role="region" aria-roledescription="${hu?'körhinta':'carousel'}" aria-label="${hu?'CV-sablonok':'CV templates'}">
   <div class="style-picker-topline"><span><i aria-hidden="true"></i> ${hu?'TELJES CV-ELŐNÉZET':'FULL CV PREVIEW'}</span><span class="style-picker-count"></span></div>
   <div class="style-picker-stage" tabindex="0" aria-label="${hu?'Lapozás: bal és jobb nyíl, görgetés vagy húzás':'Browse with arrow keys, scrolling or swiping'}">
    ${styles.map((style,index)=>`<button type="button" class="style-slide" data-style-card="${index}" aria-label="${esc(style.label)}" tabindex="-1"><span class="style-slide-label">${esc(style.label)}</span><div class="style-picker-paper cv-fit" aria-hidden="true">${style.preview}</div></button>`).join('')}
    <button type="button" class="style-picker-arrow style-picker-prev" data-style-step="-1" aria-label="${hu?'Előző sablon':'Previous template'}">‹</button><button type="button" class="style-picker-arrow style-picker-next" data-style-step="1" aria-label="${hu?'Következő sablon':'Next template'}">›</button>
   </div>
   <p class="style-picker-hint">${hu?'Görgess, húzd oldalra, vagy használd a nyilakat':'Scroll, swipe, or use the arrows'} <span aria-hidden="true">↔</span></p>
   <div class="style-picker-dots" role="group" aria-label="${hu?'Ugrás egy sablonhoz':'Go to a template'}">${styles.map((style,index)=>`<button type="button" data-style-index="${index}" aria-label="${esc(style.label)}" aria-current="false"></button>`).join('')}</div>
  </div>
  <div class="style-picker-details"><div class="style-picker-selection" aria-live="polite" aria-atomic="true"><p class="style-picker-kicker">${hu?'A KIVÁLASZTOTT STÍLUSOD':'YOUR SELECTED STYLE'}</p><h3 class="style-picker-name"></h3><p class="style-picker-description"></p></div><div class="style-picker-continue"><button type="button" class="primary style-picker-use">${hu?'Ezt a sablont választom':'Use this template'} <span aria-hidden="true">↗</span></button><p>${hu?'Ingyenes szerkesztés · A részleteket később is alakíthatod':'Free editing · Make it yours in the editor'}</p></div></div>
 </section>`);
 const picker=document.querySelector('#modal .style-picker'),stage=picker.querySelector('.style-picker-stage');
 const cards=[...picker.querySelectorAll('.style-slide')],dots=[...picker.querySelectorAll('[data-style-index]')];
 let active=initial,wheelAmount=0,lastWheel=0,gesture=null,suppressClickUntil=0;
 function show(index){
  active=(index+styles.length)%styles.length;
  cards.forEach((card,i)=>{
   const selected=i===active,previous=i===(active-1+styles.length)%styles.length,next=i===(active+1)%styles.length;
   card.classList.toggle('is-active',selected);card.classList.toggle('is-prev',previous);card.classList.toggle('is-next',next);
   card.hidden=!(selected||previous||next);card.tabIndex=selected?0:-1;
   card.setAttribute('aria-pressed',String(selected));
   dots[i].setAttribute('aria-current',String(selected));dots[i].tabIndex=selected?0:-1;
  });
  picker.querySelector('.style-picker-count').textContent=`${String(active+1).padStart(2,'0')} / ${String(styles.length).padStart(2,'0')}`;
  picker.querySelector('.style-picker-name').textContent=styles[active].label;
  picker.querySelector('.style-picker-description').textContent=styles[active].description;
  picker.querySelector('.style-picker-use').dataset.action='choose-style-'+styles[active].id;
  requestAnimationFrame(fitExamples);
 }
 picker.addEventListener('click',event=>{
  if(performance.now()<suppressClickUntil){event.preventDefault();event.stopPropagation();return;}
  const step=event.target.closest('[data-style-step]'),dot=event.target.closest('[data-style-index]'),card=event.target.closest('[data-style-card]');
  if(step)show(active+Number(step.dataset.styleStep));
  if(dot){show(Number(dot.dataset.styleIndex));dots[active].focus({preventScroll:true});}
  if(card)show(Number(card.dataset.styleCard));
 });
 picker.addEventListener('keydown',event=>{
  if(!['ArrowLeft','ArrowRight','Home','End'].includes(event.key))return;
  event.preventDefault();show(event.key==='Home'?0:event.key==='End'?styles.length-1:active+(event.key==='ArrowRight'?1:-1));
  if(event.target.matches('[data-style-index]'))dots[active].focus({preventScroll:true});
  else if(event.target.closest('[data-style-card]'))cards[active].focus({preventScroll:true});
 });
 stage.addEventListener('wheel',event=>{
  if(event.ctrlKey)return;
  event.preventDefault();
  const now=performance.now(),delta=Math.abs(event.deltaX)>Math.abs(event.deltaY)?event.deltaX:event.deltaY;
  if(!delta)return;
  if(now-lastWheel<260)return;
  if(Math.sign(delta)!==Math.sign(wheelAmount))wheelAmount=0;
  wheelAmount+=delta*(event.deltaMode===1?16:event.deltaMode===2?stage.clientHeight:1);
  if(Math.abs(wheelAmount)>=35){show(active+Math.sign(wheelAmount));wheelAmount=0;lastWheel=now;}
 },{passive:false});
 stage.addEventListener('pointerdown',event=>{
  if(!event.isPrimary||event.button!==0||event.target.closest('.style-picker-arrow'))return;
  gesture={id:event.pointerId,x:event.clientX,y:event.clientY};
 });
 stage.addEventListener('pointermove',event=>{
  if(!gesture||event.pointerId!==gesture.id)return;
  if(Math.abs(event.clientX-gesture.x)>12&&Math.abs(event.clientX-gesture.x)>Math.abs(event.clientY-gesture.y)){
   if(!stage.hasPointerCapture(event.pointerId))stage.setPointerCapture(event.pointerId);
   stage.classList.add('is-dragging');
  }
 });
 function endGesture(event){
  if(!gesture||event.pointerId!==gesture.id)return;
  const dx=event.clientX-gesture.x,dy=event.clientY-gesture.y;
  if(event.type==='pointerup'&&Math.abs(dx)>40&&Math.abs(dx)>Math.abs(dy)*1.2){show(active+(dx<0?1:-1));suppressClickUntil=performance.now()+350;}
  gesture=null;stage.classList.remove('is-dragging');
  if(stage.hasPointerCapture(event.pointerId))stage.releasePointerCapture(event.pointerId);
 }
 stage.addEventListener('pointerup',endGesture);stage.addEventListener('pointercancel',endGesture);
 show(initial);
 stage.focus({preventScroll:true});
}
