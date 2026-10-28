'use strict';
(() => {
 const track=document.querySelector('.story-track'),panels=[...track.querySelectorAll(':scope>.panel')],media=matchMedia('(max-width:760px)');
 const fx=window.catMotion;let raf=0;
 function position(){raf=0;const first=track.getBoundingClientRect();let index=0,nearest=Infinity;panels.forEach((p,i)=>{const r=p.getBoundingClientRect(),distance=Math.abs((media.matches?r.top:r.left)-(media.matches?100:first.left));if(distance<nearest){nearest=distance;index=i;}});document.querySelector('#story-position').textContent=`${String(index+1).padStart(2,'0')} / 05`;document.documentElement.style.setProperty('--cover-shift',fx.isOn()?`${Math.min(22,track.scrollLeft*.04)}px`:'0px');}
 function schedule(){if(!raf)raf=requestAnimationFrame(position);}
 function go(index){const p=panels[Math.max(0,Math.min(panels.length-1,index))];if(media.matches)p.scrollIntoView({behavior:fx.isOn()?'smooth':'instant',block:'start'});else track.scrollTo({left:p.offsetLeft,behavior:fx.isOn()?'smooth':'instant'});}
 document.querySelectorAll('[data-story-step]').forEach(b=>b.addEventListener('click',()=>{const current=Number(document.querySelector('#story-position').textContent.split('/')[0])-1;go(current+Number(b.dataset.storyStep));}));
 document.querySelector('.story-next').addEventListener('click',e=>{e.preventDefault();go(1);});
 track.addEventListener('wheel',e=>{if(media.matches||Math.abs(e.deltaX)>Math.abs(e.deltaY)||e.ctrlKey)return;const area=e.target.closest('.content,.inner,.panel');if(area&&['auto','scroll'].includes(getComputedStyle(area).overflowY)&&area.scrollHeight>area.clientHeight+2&&((e.deltaY>0&&area.scrollTop+area.clientHeight<area.scrollHeight-2)||(e.deltaY<0&&area.scrollTop>1)))return;e.preventDefault();track.scrollLeft+=e.deltaY;},{passive:false});
 track.addEventListener('keydown',e=>{if(e.target.closest('button,select,[role=tab],summary'))return;if(e.key==='ArrowRight'||e.key==='ArrowLeft'){e.preventDefault();const i=Number(document.querySelector('#story-position').textContent.split('/')[0])-1;go(i+(e.key==='ArrowRight'?1:-1));}});
 track.addEventListener('scroll',schedule,{passive:true});addEventListener('scroll',schedule,{passive:true});addEventListener('resize',schedule);fx.subscribe(schedule);
 const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(!entry.isIntersecting)return;observer.unobserve(entry.target);fx.animate(entry.target,[{opacity:.25,transform:'translateX(35px)'},{opacity:1,transform:'none'}],{duration:850,easing:'cubic-bezier(.2,.8,.2,1)'});}),{root:media.matches?null:track,threshold:.2});
 panels.forEach(p=>observer.observe(p.querySelector('.content,.intro,.inner')||p));position();
})();
