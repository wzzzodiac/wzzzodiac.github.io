'use strict';
// A site-level preference, kept compatible with the current Hub.
const motionPreference=matchMedia('(prefers-reduced-motion: reduce)');
let motionOff=false;
try{motionOff=localStorage.getItem('wzc-motion')==='off'}catch{}
const motionControl=document.getElementById('motionControl');
function syncMotion(){const off=motionOff||motionPreference.matches;document.documentElement.dataset.motion=off?'off':'on';if(motionControl){motionControl.hidden=false;motionControl.textContent=off?'Motion: off':'Motion: on';motionControl.setAttribute('aria-pressed',String(!off));motionControl.disabled=motionPreference.matches;motionControl.title=motionPreference.matches?'Reduced motion follows your device setting':'Toggle interface motion'}}
syncMotion();motionPreference.addEventListener('change',syncMotion);
motionControl?.addEventListener('click',()=>{motionOff=!motionOff;try{localStorage.setItem('wzc-motion',motionOff?'off':'on')}catch{}syncMotion()});
const outline=document.querySelector('.note-outline');if(outline&&matchMedia('(min-width: 701px)').matches)outline.open=true;

// Static catalogue stays fully readable without JavaScript. Enhancement uses only DOM text.
const form=document.querySelector('.catalog-tools');
if(form){
 const search=document.getElementById('projectSearch');const buttons=[...document.querySelectorAll('[data-filter]')];const rows=[...document.querySelectorAll('.catalogue .drawer')];const count=document.getElementById('resultCount');const empty=document.querySelector('.empty-state');
 const normalize=value=>value.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim();
 const searchable=new Map(rows.map(row=>[row,normalize(row.textContent)]));let category='All';
 const params=new URLSearchParams(location.search);if(buttons.some(b=>b.dataset.filter===params.get('category')))category=params.get('category');search.value=params.get('q')||'';
 const apply=(write=true)=>{const query=normalize(search.value);let shown=0;for(const row of rows){const visible=(category==='All'||row.dataset.category===category)&&searchable.get(row).includes(query);row.hidden=!visible;if(visible)shown++}buttons.forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.filter===category)));count.textContent=`${shown} of ${rows.length} experiments${category==='All'?'':` · ${category}`}`;empty.hidden=shown!==0;if(write){const url=new URL(location.href);url.search='';if(category!=='All')url.searchParams.set('category',category);if(search.value.trim())url.searchParams.set('q',search.value.trim());url.hash='';try{history.replaceState(null,'',url)}catch{}}};
 form.hidden=false;form.addEventListener('submit',e=>{e.preventDefault();apply()});search.addEventListener('input',()=>apply());buttons.forEach(b=>b.addEventListener('click',()=>{category=b.dataset.filter;apply()}));
 document.getElementById('resetFilters').addEventListener('click',()=>{category='All';search.value='';apply();search.focus()});
 const revealHash=()=>{let id;try{id=decodeURIComponent(location.hash.slice(1))}catch{return}if(rows.some(row=>row.id===id)){category='All';search.value='';apply(false);document.getElementById(id).scrollIntoView({behavior:'auto',block:'center'})}};
 apply(false);if(location.hash)revealHash();window.addEventListener('hashchange',revealHash);
}

// Existing welcome recording, with play/pause/resume and a finite progress indicator.
const audio=document.getElementById('welcomeAudio');const toggle=document.getElementById('welcomeAudioToggle');
if(audio&&toggle){
 document.querySelector('.welcome-audio-controls').hidden=false;
 const duration=document.getElementById('welcomeAudioDuration');const wave=document.getElementById('welcomeWaveform');const progress=document.getElementById('welcomeWaveProgress');const status=document.getElementById('audioStatus');
 const time=s=>Number.isFinite(s)?`${String(Math.floor(s/60)).padStart(2,'0')}:${String(Math.floor(s%60)).padStart(2,'0')}`:'--:--';
 let frame=0;const stop=()=>{cancelAnimationFrame(frame);frame=0};
 const sync=()=>{const ratio=Number.isFinite(audio.duration)&&audio.duration>0?Math.max(0,Math.min(1,audio.currentTime/audio.duration)):0;progress.setAttribute('width',String(ratio*180));wave.setAttribute('aria-valuenow',String(Math.round(ratio*100)));wave.setAttribute('aria-valuetext',`${time(audio.currentTime)} of ${time(audio.duration)}`);duration.textContent=time(audio.duration);toggle.querySelector('span').textContent=audio.paused?'▶':'❚❚';toggle.setAttribute('aria-label',audio.paused?'Play welcome audio':'Pause welcome audio')};
 const tick=()=>{sync();if(!audio.paused&&!audio.ended)frame=requestAnimationFrame(tick)};
 toggle.addEventListener('click',async()=>{if(!audio.paused){audio.pause();return}try{await audio.play();status.textContent=''}catch{status.className='audio-error';status.textContent='Playback could not start. Please try again.';sync()}});
 audio.addEventListener('play',()=>{stop();tick()});audio.addEventListener('pause',()=>{stop();sync()});audio.addEventListener('ended',()=>{stop();audio.currentTime=0;sync()});audio.addEventListener('timeupdate',sync);audio.addEventListener('loadedmetadata',sync);audio.addEventListener('durationchange',sync);
 audio.addEventListener('error',()=>{stop();toggle.disabled=true;status.className='audio-error';status.textContent='Welcome audio is unavailable. You can keep exploring the lab.';sync()});window.addEventListener('pagehide',()=>{audio.pause();stop()});sync();
}
