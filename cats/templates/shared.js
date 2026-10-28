'use strict';
(() => {
  const root=document.documentElement, media=matchMedia('(prefers-reduced-motion: reduce)');
  const selector=document.querySelector('#visual-style'), motionButton=document.querySelector('#motion-toggle');
  const id=root.dataset.template;
  let wanted=true;try{wanted=localStorage.getItem('cat-motion')!=='off';localStorage.setItem('cat-visual-style',id);}catch{/* Optional preferences. */}
  const effects=new Set(), subscribers=new Set();
  function isOn(){return wanted&&!media.matches&&!document.hidden;}
  function animate(el,frames,options){if(!isOn()||!el.animate)return;const a=el.animate(frames,options);effects.add(a);a.finished.then(()=>effects.delete(a),()=>effects.delete(a));return a;}
  function update(){root.dataset.motion=wanted&&!media.matches?'on':'off';motionButton.textContent=media.matches?'Reduced motion':wanted?'Motion on':'Motion off';motionButton.disabled=media.matches;motionButton.setAttribute('aria-pressed',String(wanted&&!media.matches));effects.forEach(a=>a.cancel());effects.clear();subscribers.forEach(fn=>fn());}
  window.catMotion={isOn,animate,subscribe:fn=>subscribers.add(fn)};
  for(const templated of [false,true]){const group=document.createElement('optgroup');group.label=templated?'Reference templates':'Original editions';window.catThemes.filter(t=>Boolean(t.template)===templated).forEach(t=>group.append(new Option(t.name,t.id)));selector.append(group);}
  selector.value=id;selector.addEventListener('change',()=>{try{localStorage.setItem('cat-visual-style',selector.value);}catch{}location.assign(window.catThemeURL(selector.value));});
  motionButton.addEventListener('click',()=>{wanted=!wanted;try{localStorage.setItem('cat-motion',wanted?'on':'off');}catch{}update();});
  media.addEventListener('change',update);document.addEventListener('visibilitychange',update);update();

  const list=document.querySelector('[role=tablist]'), tabs=[...list.querySelectorAll('[role=tab]')];
  function orientation(){list.setAttribute('aria-orientation',getComputedStyle(list).flexDirection==='column'?'vertical':'horizontal');}
  function select(tab,focus=false){tabs.forEach(t=>{const active=t===tab;t.setAttribute('aria-selected',String(active));t.tabIndex=active?0:-1;const panel=document.getElementById(t.getAttribute('aria-controls'));panel.hidden=!active;panel.setAttribute('role','tabpanel');panel.tabIndex=0;});if(focus)tab.focus();}
  list.hidden=false;orientation();select(tabs[0]);
  tabs.forEach(t=>t.addEventListener('click',()=>{select(t);animate(document.getElementById(t.getAttribute('aria-controls')),[{opacity:.3,transform:'translateY(12px)'},{opacity:1,transform:'none'}],{duration:350,easing:'ease-out'});}));
  list.addEventListener('keydown',e=>{const i=tabs.indexOf(document.activeElement);if(i<0)return;let next;if(e.key==='ArrowRight'||(e.key==='ArrowDown'&&list.getAttribute('aria-orientation')==='vertical'))next=(i+1)%tabs.length;if(e.key==='ArrowLeft'||(e.key==='ArrowUp'&&list.getAttribute('aria-orientation')==='vertical'))next=(i+tabs.length-1)%tabs.length;if(e.key==='Home')next=0;if(e.key==='End')next=tabs.length-1;if(next!==undefined){e.preventDefault();select(tabs[next],true);}});
  addEventListener('resize',orientation);
  const fact=document.querySelector('#random-fact'), factButton=document.querySelector('#another-fact');
  const facts=[fact.textContent,'A slow blink can signal that a cat feels relaxed. You can try a gentle blink back.','A cat showing their belly is not necessarily inviting a belly rub.','Ears, eyes, tail and posture work together. One signal alone does not tell the whole story.','Purring does not always mean a cat is happy. Context matters.'];let factIndex=0;factButton.hidden=false;
  factButton.addEventListener('click',()=>{factIndex=(factIndex+1+Math.floor(Math.random()*(facts.length-1)))%facts.length;fact.textContent=facts[factIndex];animate(fact,[{opacity:.25},{opacity:1}],{duration:300});});
  document.querySelectorAll('.signals details').forEach(el=>el.addEventListener('toggle',()=>{if(el.open)document.querySelector('.cat-diagram').dataset.signal=el.dataset.signal;}));

  async function closeRoom(dialog){if(dialog.dataset.closing==='true')return;dialog.dataset.closing='true';const side=dialog.classList.contains('side-room');const a=animate(dialog,[{opacity:1,transform:'none'},{opacity:0,transform:side?'translateX(60px)':'translateY(25px) scale(.98)'}],{duration:220,easing:'ease-in',fill:'forwards'});if(a)await a.finished.catch(()=>{});if(dialog.open)dialog.close();a?.cancel();delete dialog.dataset.closing;document.body.classList.toggle('room-open',Boolean(document.querySelector('.room[open]')));}
  document.querySelectorAll('[data-open]').forEach(button=>button.addEventListener('click',()=>{const dialog=document.getElementById(button.dataset.open);dialog.showModal();dialog.scrollTop=0;document.body.classList.add('room-open');animate(dialog,[{opacity:0,transform:dialog.classList.contains('side-room')?'translateX(110px)':'translateY(35px) scale(.95)'},{opacity:1,transform:'none'}],{duration:500,easing:'cubic-bezier(.2,.8,.2,1)'});}));
  document.querySelectorAll('dialog.room').forEach(dialog=>{dialog.querySelector('.dialog-close').addEventListener('click',()=>closeRoom(dialog));dialog.addEventListener('cancel',e=>{e.preventDefault();closeRoom(dialog);});dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)closeRoom(dialog);}});});

  const dialog=document.querySelector('#photo-dialog'), large=dialog.querySelector('#large-photo');
  const buttons=[...document.querySelectorAll('[data-photo]')];let current=0, photoRevision=0, closing=false, origin=null;
  async function showPhoto(index){if(closing)return;current=(index+buttons.length)%buttons.length;const button=buttons[current], article=button.closest('.thumb'), image=button.querySelector('img');const revision=++photoRevision;
    origin=image.getBoundingClientRect();large.src=image.currentSrc||image.src;large.alt=image.alt;dialog.querySelector('#large-title').textContent=article.querySelector('h2').textContent;dialog.querySelector('#large-caption').textContent=article.querySelector('p').textContent;dialog.querySelector('#photo-count').textContent=`${current+1} / ${buttons.length}`;
    if(!dialog.open)dialog.showModal();await large.decode().catch(()=>{});if(revision!==photoRevision||!dialog.open)return;
    [...effects].filter(a=>a.effect?.target===large).forEach(a=>a.cancel());const to=large.getBoundingClientRect();
    if(origin.width&&origin.height)animate(large,[{transform:`translate(${origin.left-to.left}px,${origin.top-to.top}px) scale(${origin.width/to.width},${origin.height/to.height})`,opacity:.6},{transform:'none',opacity:1}],{duration:650,easing:'cubic-bezier(.2,.8,.2,1)'});
  }
  async function closePhoto(){if(closing)return;closing=true;photoRevision++;const visible=getComputedStyle(large).transform;[...effects].filter(a=>a.effect?.target===large).forEach(a=>a.cancel());const from=large.getBoundingClientRect(),to=buttons[current].querySelector('img').getBoundingClientRect();const a=animate(large,[{transform:visible,opacity:1},{transform:`translate(${to.left-from.left}px,${to.top-from.top}px) scale(${to.width/from.width},${to.height/from.height})`,opacity:0}],{duration:280,easing:'ease-in',fill:'forwards'});if(a)await a.finished.catch(()=>{});dialog.close();a?.cancel();closing=false;}
  buttons.forEach((button,i)=>button.addEventListener('click',()=>showPhoto(i)));
  dialog.querySelector('.dialog-close').addEventListener('click',closePhoto);dialog.addEventListener('cancel',e=>{e.preventDefault();closePhoto();});
  dialog.querySelectorAll('[data-step]').forEach(button=>button.addEventListener('click',()=>showPhoto(current+Number(button.dataset.step))));
  dialog.addEventListener('keydown',e=>{if(e.key==='ArrowRight'){e.preventDefault();showPhoto(current+1);}if(e.key==='ArrowLeft'){e.preventDefault();showPhoto(current-1);}});
  dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)closePhoto();}});
})();
