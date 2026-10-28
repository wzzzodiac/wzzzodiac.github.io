'use strict';
(() => {
  const html=document.documentElement, media=matchMedia('(prefers-reduced-motion: reduce)');
  const fine=matchMedia('(hover: hover) and (pointer: fine)');
  const sceneSpace=matchMedia('(min-width: 1000px) and (min-height: 780px)');
  const hero=document.querySelector('.hero'), photo=hero.querySelector('.hero-photo');
  const frame=photo.querySelector('.photo-frame'), section=document.querySelector('.gallery-section');
  const gallery=document.querySelector('.gallery'), cards=[...gallery.querySelectorAll('.gallery-item')];
  const owned=new Set();
  let wanted=true, active=false, raf=0, observer=null, pointer=null;
  try { wanted=localStorage.getItem('cat-motion')!=='off'; } catch { /* Optional preference. */ }
  const enabled=()=>active&&wanted&&!media.matches&&!document.hidden;
  const clamp=n=>Math.max(0,Math.min(1,n));
  const viewport=document.createElement('div'); viewport.className='motion-gallery-window';
  gallery.before(viewport); viewport.append(gallery);
  const echoes=document.createElement('div'); echoes.className='hero-echoes';
  echoes.setAttribute('aria-hidden','true'); echoes.innerHTML='<span></span><span></span>'; photo.prepend(echoes);
  const toggle=document.createElement('button'); toggle.type='button'; toggle.className='motion-toggle';
  toggle.setAttribute('aria-label','Toggle expressive motion'); document.querySelector('.style-picker').append(toggle);

  function animate(el,frames,timing) {
    if(!enabled()) return;
    const effect=el.animate(frames,timing); owned.add(effect);
    effect.finished.then(()=>owned.delete(effect),()=>owned.delete(effect)); return effect;
  }
  function cancelOwned() { owned.forEach(a=>a.cancel()); owned.clear(); if(raf)cancelAnimationFrame(raf); raf=0; }
  function reset() {
    for(const name of ['--hero-p','--aperture','--film-x','--light-x','--light-y'])html.style.removeProperty(name);
    frame.style.removeProperty('--rx'); frame.style.removeProperty('--ry');
    cards.forEach(card=>{for(const name of ['--stack-x','--stack-y','--stack-r','--stack-ry','--row-p'])card.style.removeProperty(name);delete card.dataset.fanned;}); pointer=null;
  }
  function render() {
    raf=0; if(!enabled())return;
    const height=innerHeight, box=hero.getBoundingClientRect();
    const heroProgress=clamp((height*.75-box.top)/Math.max(1,box.height));
    html.style.setProperty('--hero-p',heroProgress.toFixed(4));
    html.style.setProperty('--aperture',`${28+heroProgress*48}%`);
    if(pointer&&box.bottom>0&&box.top<height) {
      html.style.setProperty('--light-x',`${pointer.x*100}%`); html.style.setProperty('--light-y',`${pointer.y*100}%`);
      frame.style.setProperty('--ry',`${(pointer.x-.5)*12}deg`); frame.style.setProperty('--rx',`${(.5-pointer.y)*8}deg`);
    }
    const bounds=section.getBoundingClientRect();
    if(bounds.top>height*1.5||bounds.bottom<-height*.5)return;
    const top=document.querySelector('.masthead').offsetHeight+20;
    html.style.setProperty('--scene-top',`${top}px`);
    const distance=Math.max(1,section.offsetHeight-section.querySelector('.wrap').offsetHeight);
    const progress=clamp((top-bounds.top)/distance);
    if(html.dataset.scrub==='true'&&html.dataset.style==='night-safari') {
      html.style.setProperty('--film-x',`${-Math.max(0,gallery.scrollWidth-viewport.clientWidth)*progress}px`);
    }
    cards.forEach((card,i)=>{
      const rect=card.getBoundingClientRect();
      card.style.setProperty('--row-p',clamp((height-rect.top)/(height*.8)).toFixed(4));
      if(html.dataset.scrub==='true'&&html.dataset.style==='prism-room') {
        const spread=card.offsetWidth+35;
        card.style.setProperty('--stack-x',`${(1-i)*spread*(1-progress)}px`);
        card.style.setProperty('--stack-y',`${Math.abs(1-i)*18*(1-progress)}px`);
        card.style.setProperty('--stack-r',`${(i-1)*13*(1-progress)}deg`);
        card.style.setProperty('--stack-ry',`${(1-i)*22*(1-progress)}deg`);
      }
    });
  }
  function schedule(){if(enabled()&&!raf)raf=requestAnimationFrame(render);}
  function policy() {
    html.dataset.motion=wanted&&!media.matches?'on':'off';
    html.dataset.scrub=String(active&&wanted&&!media.matches&&sceneSpace.matches);
    toggle.hidden=!active; toggle.disabled=media.matches;
    toggle.textContent=media.matches?'Motion: reduced':wanted?'Motion: on':'Motion: off';
    toggle.setAttribute('aria-pressed',String(wanted&&!media.matches));
    document.querySelectorAll('.photo-play').forEach(button=>{button.disabled=!active||!wanted||media.matches;});
    if(active)html.style.setProperty('--scene-top',`${document.querySelector('.masthead').offsetHeight+20}px`);
  }
  function entrances() {
    observer?.disconnect();
    if(!enabled()||!('IntersectionObserver' in window))return;
    observer=new IntersectionObserver(entries=>{
      entries.forEach(entry=>{
        if(!entry.isIntersecting)return; observer.unobserve(entry.target);
        animate(entry.target,[{opacity:.25,transform:'translate3d(0,45px,0)',clipPath:'inset(0 0 55% 0)'},{opacity:1,transform:'none',clipPath:'inset(0 0 0% 0)'}],{duration:850,easing:'cubic-bezier(.18,.8,.2,1)'});
      });
    },{threshold:.16});
    document.querySelectorAll('.section-heading,.fact-label,.closing p').forEach(el=>observer.observe(el));
  }
  function refresh() {
    cancelOwned();reset();active=window.catThemes.some(t=>t.id===html.dataset.style&&t.expressive);
    policy();entrances();schedule();
    if(enabled()&&hero.getBoundingClientRect().top<innerHeight) {
      animate(hero.querySelector('h1'),[{opacity:0,clipPath:'inset(0 0 100% 0)'},{opacity:1,clipPath:'inset(0 0 0% 0)'}],{duration:1000,easing:'cubic-bezier(.2,.8,.2,1)'});
      animate(frame,[{opacity:.25,scale:'.9'},{opacity:1,scale:'1'}],{duration:1000,delay:100,easing:'cubic-bezier(.2,.8,.2,1)'});
    }
  }
  cards.forEach((card,index)=>{
    const image=card.querySelector('img'), layers=document.createElement('div');
    layers.className='image-echoes';layers.setAttribute('aria-hidden','true');
    layers.style.setProperty('--echo-image',`url("${image.getAttribute('src')}")`);
    for(let i=1;i<=3;i++){const layer=document.createElement('span');layer.style.setProperty('--i',String(i));layers.append(layer);}
    card.querySelector('.gallery-image').append(layers);
    const play=document.createElement('button');play.className='photo-play';play.type='button';play.textContent='Move a little';
    play.setAttribute('aria-label',`Animate photo: ${card.querySelector('h3').textContent}`);card.querySelector('figcaption').append(play);
    const fan=value=>{card.dataset.fanned=String(value&&enabled());};
    card.addEventListener('pointerenter',()=>{if(fine.matches)fan(true);});
    card.addEventListener('pointerleave',()=>fan(card.matches(':focus-within')));
    card.addEventListener('focusout',event=>{if(!card.contains(event.relatedTarget))fan(false);});
    card.addEventListener('focusin',()=>{
      if(enabled()&&html.dataset.scrub==='true'&&html.dataset.style!=='paper-riot') {
        // Keyboard access reveals the focused card in the scrubbed scene.
        const top=document.querySelector('.masthead').offsetHeight+20;
        const distance=section.offsetHeight-section.querySelector('.wrap').offsetHeight;
        const progress=html.dataset.style==='prism-room'?1:clamp(card.offsetLeft/Math.max(1,gallery.scrollWidth-viewport.clientWidth));
        window.scrollTo({top:scrollY+section.getBoundingClientRect().top-top+distance*progress,behavior:'instant'});
      }
      fan(true);
    });
    play.addEventListener('click',()=>{
      if(!enabled())return;
      const target=card.querySelector('.gallery-image');
      // Sample before cancelling so a repeated gesture starts at its current pose.
      const pose=getComputedStyle(target).transform;
      const layerPoses=[...layers.children].map(el=>getComputedStyle(el).transform);
      [...owned].filter(a=>a.effect?.target===target||layers.contains(a.effect?.target)).forEach(a=>a.cancel());
      if(html.dataset.style==='paper-riot') {
        [...layers.children].forEach((layer,i)=>animate(layer,[{transform:layerPoses[i],opacity:1},{transform:`translate(${(i+1)*-26}px,${(i+1)*-16}px) rotate(${(i+1)*-10}deg) scale(${1-(i+1)*.13})`,opacity:1,offset:.45},{transform:layerPoses[i],opacity:1}],{duration:1100,delay:i*70,easing:'cubic-bezier(.2,.8,.2,1)'}));
      } else {
        animate(target,[{transform:pose},{transform:`perspective(900px) rotateY(${index%2?-10:10}deg) scale(.95)`,offset:.45},{transform:'none'}],{duration:950,easing:'cubic-bezier(.2,.8,.2,1)'});
      }
    });
  });
  hero.addEventListener('pointermove',event=>{
    if(!enabled()||!fine.matches)return;const box=hero.getBoundingClientRect();
    pointer={x:clamp((event.clientX-box.left)/box.width),y:clamp((event.clientY-box.top)/box.height)};schedule();
  });
  hero.addEventListener('pointerleave',()=>{pointer={x:.5,y:.5};schedule();});
  toggle.addEventListener('click',()=>{wanted=!wanted;try{localStorage.setItem('cat-motion',wanted?'on':'off');}catch{/* Optional. */}refresh();});
  window.addEventListener('cat:style',refresh);
  window.addEventListener('scroll',schedule,{passive:true});
  window.addEventListener('resize',()=>{reset();policy();schedule();});
  document.addEventListener('visibilitychange',()=>{cancelOwned();reset();policy();schedule();});
  media.addEventListener('change',refresh);refresh();
})();
