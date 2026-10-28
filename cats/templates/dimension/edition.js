'use strict';
(() => {
 const fx=window.catMotion,bg=document.querySelector('#bg');let raf=0,x=0,y=0;
 function draw(){raf=0;document.documentElement.style.setProperty('--bg-x',fx.isOn()?`${x}px`:'0px');document.documentElement.style.setProperty('--bg-y',fx.isOn()?`${y}px`:'0px');}
 addEventListener('pointermove',e=>{if(!fx.isOn()||e.pointerType!=='mouse')return;x=(e.clientX/innerWidth-.5)*-22;y=(e.clientY/innerHeight-.5)*-14;if(!raf)raf=requestAnimationFrame(draw);},{passive:true});
 fx.subscribe(()=>{if(raf)cancelAnimationFrame(raf);raf=0;draw();});
 fx.animate(document.querySelector('#header'),[{opacity:0,transform:'translateY(20px) scale(.97)'},{opacity:1,transform:'none'}],{duration:1100,easing:'cubic-bezier(.2,.8,.2,1)'});
})();
