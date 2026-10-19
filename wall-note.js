'use strict';
(()=>{
 const note=document.getElementById('wall-note');
 if(!note)return;
 const paper=note.querySelector('.handwritten-sheet');
 const quote=note.querySelector('blockquote');
 const signature=note.querySelector('figcaption');
 const skip=note.querySelector('.finish-writing');

 const writing=paper.querySelector('.writing'),probe=paper.querySelector('.baseline-probe');
 function alignRuling(){
  if(!note.open)return;
  const baseline=probe.offsetTop;if(baseline<=0)return;
  paper.style.setProperty('--baseline',baseline.toFixed(2)+'px');
  paper.dataset.baseline=baseline.toFixed(2);
  paper.dataset.fontReady=String(document.fonts.check('42px WzcGraphite'));
 }
 document.fonts.ready.then(alignRuling);
 new ResizeObserver(alignRuling).observe(writing);
 note.addEventListener('toggle',alignRuling);
 const preference=matchMedia('(prefers-reduced-motion: reduce)');
 const INTRO=220,QUOTE=3400,GAP=240,SIGNATURE=620;
 const empty='inset(0 100% 0 0)';
 let revision=0,frame=0;
 const disabled=()=>preference.matches||document.documentElement.dataset.motion==='off'||document.hidden;
 function cancel(){revision++;cancelAnimationFrame(frame);frame=0}
 function hideSkip(){
  const focused=document.activeElement===skip;skip.hidden=true;
  if(focused)note.querySelector('summary').focus({preventScroll:true});
 }
 function complete(){
  cancel();note.dataset.phase=note.open?'complete':'closed';
  quote.style.clipPath=signature.style.clipPath='';
  note.dataset.progress=note.open?'1':'0';hideSkip();
 }
 function plan(element,duration){
  const text=[...element.childNodes].find(node=>node.nodeType===Node.TEXT_NODE);
  const box=element.getBoundingClientRect(),lineHeight=parseFloat(getComputedStyle(element).lineHeight);
  const range=document.createRange(),steps=[];
  let firstTop=null,lastLine=0,lastX=0,time=0;
  for(let i=0;i<text.length;i++){
   range.setStart(text,i);range.setEnd(text,i+1);
   const rect=range.getBoundingClientRect();
   if(!rect.width&&!rect.height)continue;
   if(firstTop===null)firstTop=rect.top;
   const line=Math.max(lastLine,Math.round((rect.top-firstTop)/lineHeight));
   if(line>lastLine){time+=100;lastX=0}
   const to=Math.max(lastX,Math.min(box.width+2,rect.right-box.left+2));
   const cost=text.data[i]===' '?30:20+(i*13)%11;
   steps.push({line,from:lastX,to,start:time,end:time+cost});
   time+=cost+(/[,.;]/.test(text.data[i])?85:0);
   lastLine=line;lastX=to;
  }
  if(!steps.length)throw new Error('No visible writing geometry');
  for(const step of steps){step.start*=duration/time;step.end*=duration/time}
  return {steps,lineHeight};
 }
 function reveal(element,geometry,time){
  const step=geometry.steps.find(step=>time<step.end);
  if(!step){element.style.clipPath='none';return}
  const progress=Math.max(0,Math.min(1,(time-step.start)/(step.end-step.start)));
  const x=step.from+(step.to-step.from)*progress;
  const y=step.line*geometry.lineHeight,bottom=y+geometry.lineHeight;
  element.style.clipPath=`polygon(0 0,100% 0,100% ${y}px,${x}px ${y}px,${x}px ${bottom}px,0 ${bottom}px)`;
 }
 async function start(){
  cancel();const run=revision;
  if(!note.open)return complete();
  if(disabled())return complete();
  note.dataset.phase='paper';note.dataset.progress='0';skip.hidden=false;
  quote.style.clipPath=signature.style.clipPath=empty;
  try{
   await document.fonts.ready;
   if(run!==revision||!note.open)return;
   if(disabled())return complete();
   alignRuling();
   const bounds=paper.getBoundingClientRect();
   if(bounds.bottom>innerHeight-20||bounds.top<20)paper.scrollIntoView({behavior:'smooth',block:'nearest'});
   // Measure in local unrotated coordinates, then restore the paper before paint.
   const previous=paper.style.transform;paper.style.transform='none';
   let quotePlan,signaturePlan;
   try{quotePlan=plan(quote,QUOTE);signaturePlan=plan(signature,SIGNATURE)}
   finally{paper.style.transform=previous}
   const began=performance.now(),total=INTRO+QUOTE+GAP+SIGNATURE;
   function tick(now){
    if(run!==revision||!note.open)return;
    const elapsed=now-began;
    note.dataset.progress=String(Math.min(1,elapsed/total).toFixed(3));
    if(elapsed<INTRO){note.dataset.phase='paper'}
    else if(elapsed<INTRO+QUOTE){note.dataset.phase='writing';reveal(quote,quotePlan,elapsed-INTRO)}
    else if(elapsed<INTRO+QUOTE+GAP){note.dataset.phase='pause';quote.style.clipPath='none'}
    else if(elapsed<total){note.dataset.phase='signature';quote.style.clipPath='none';reveal(signature,signaturePlan,elapsed-INTRO-QUOTE-GAP)}
    else{return complete()}
    frame=requestAnimationFrame(tick);
   }
   frame=requestAnimationFrame(tick);
  }catch(error){complete();console.warn('Writing effect resolved to full note.',error)}
 }
 note.addEventListener('toggle',()=>note.open?start():complete());
 skip.addEventListener('click',complete);
 note.addEventListener('keydown',event=>{if(event.key==='Escape'&&note.open){complete();event.preventDefault()}});
 window.addEventListener('resize',()=>{if(note.open)complete()});
 document.addEventListener('visibilitychange',()=>{if(document.hidden&&note.open)complete()});
 preference.addEventListener('change',()=>{if(disabled()&&note.open)complete()});
 new MutationObserver(()=>{if(disabled()&&note.open)complete()}).observe(document.documentElement,{attributes:true,attributeFilter:['data-motion']});
 note.classList.add('writing-ready');
 if(note.open)start();
})();
