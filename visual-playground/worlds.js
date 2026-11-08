'use strict';
(() => {
 const root=document.documentElement,media=matchMedia('(prefers-reduced-motion: reduce)'),button=document.querySelector('[data-motion-toggle]');
 let wanted=true;try{wanted=localStorage.getItem('vp-worlds-motion')!=='off'}catch{}
 const effects=new Set(),subscribers=new Set();
 const isOn=()=>wanted&&!media.matches&&!document.hidden;
 function cancel(){effects.forEach(a=>a.cancel());effects.clear()}
 function sync(){root.dataset.motion=isOn()?'on':'off';if(button){button.textContent=media.matches?'Movimiento reducido':wanted?'Movimiento: sí':'Movimiento: no';button.setAttribute('aria-pressed',String(wanted&&!media.matches));button.disabled=media.matches}cancel();subscribers.forEach(fn=>fn())}
 function animate(el,frames,options={}){if(!isOn()||!el?.animate)return null;[...effects].filter(a=>a.effect?.target===el).forEach(a=>a.cancel());const a=el.animate(frames,{duration:480,easing:'cubic-bezier(.2,.75,.2,1)',...options});effects.add(a);a.finished.then(()=>effects.delete(a),()=>effects.delete(a));return a}
 function open(id){const d=document.getElementById(id);if(!d||d.open)return;document.querySelectorAll('dialog[open]').forEach(other=>other.close());d.showModal();animate(d,[{opacity:0,transform:'translateY(16px)'},{opacity:1,transform:'none'}]);d.scrollTop=0}
 document.querySelectorAll('[data-modal]').forEach(b=>b.addEventListener('click',()=>open(b.dataset.modal)));
 document.querySelectorAll('dialog').forEach(d=>{d.querySelectorAll('[data-close]').forEach(b=>b.addEventListener('click',()=>d.close()));d.addEventListener('click',e=>{if(e.target!==d)return;const r=d.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)d.close()})});
 button?.addEventListener('click',()=>{wanted=!wanted;try{localStorage.setItem('vp-worlds-motion',wanted?'on':'off')}catch{}sync()});media.addEventListener('change',sync);document.addEventListener('visibilitychange',sync);
 window.Playground={isOn,animate,open,subscribe:fn=>subscribers.add(fn)};sync();
})();
