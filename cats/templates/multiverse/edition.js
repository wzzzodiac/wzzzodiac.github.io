'use strict';
(() => {
 const fx=window.catMotion;
 const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(!entry.isIntersecting)return;observer.unobserve(entry.target);fx.animate(entry.target.querySelector('img'),[{transform:'scale(1.18)',clipPath:'inset(14% 0 14% 0)'},{transform:'scale(1)',clipPath:'inset(0% 0 0% 0)'}],{duration:1100,easing:'cubic-bezier(.2,.8,.2,1)'});}),{threshold:.12});
 document.querySelectorAll('.photo-wall .thumb').forEach(el=>observer.observe(el));
})();
