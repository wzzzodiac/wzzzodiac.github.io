'use strict';

// One registry for the native selector, pre-paint restoration and motion metadata.
// Add an entry here and scoped CSS in themes.css to introduce another visual.
window.catThemes = Object.freeze([
  { id: 'editorial', name: 'Editorial', color: '#9c482d', background: '#f5f2e9', desktopTabs: 'vertical', duration: 420, easing: 'ease-out', offset: 6 },
  { id: 'playful', name: 'Playful', color: '#244d49', background: '#ffdf63', desktopTabs: 'horizontal', duration: 280, easing: 'ease-out', offset: 6 },
  { id: 'hub', name: 'Personal Hub', color: '#8bd6df', background: '#0b1012', desktopTabs: 'vertical', mobileTabs: 'vertical', duration: 180, easing: 'ease-out', offset: 3 },
  { id: 'dark-retro', name: 'Dark Retro', color: '#f0bf6b', background: '#181d1b', desktopTabs: 'horizontal', mobileTabs: 'vertical', duration: 240, easing: 'steps(5, end)', offset: 0 },
  { id: 'pastel-pink', name: 'Pastel Pink', color: '#9b476b', background: '#f9e7ed', desktopTabs: 'horizontal', mobileTabs: 'vertical', duration: 520, easing: 'cubic-bezier(.2,.7,.3,1)', offset: 8 },
  { id: 'night-safari', name: 'Ethereal', color: '#b75a48', background: '#ede3dc', path: 'templates/ethereal/', template: true },
  { id: 'paper-riot', name: 'Dimension', color: '#b0d9cb', background: '#171d20', path: 'templates/dimension/', template: true },
  { id: 'prism-room', name: 'Multiverse', color: '#681e35', background: '#f3efe8', path: 'templates/multiverse/', template: true }
]);

// This small local script runs before the stylesheets, preventing a default-theme flash.
let savedCatStyle;
try { savedCatStyle = localStorage.getItem('cat-visual-style'); } catch { /* Storage is optional. */ }
const requestedCatStyle = new URLSearchParams(location.search).get('style');
const declaredCatStyle = document.documentElement.dataset.template;
const initialCatTheme = window.catThemes.find(theme => theme.id === requestedCatStyle)
  || window.catThemes.find(theme => theme.id === declaredCatStyle)
  || window.catThemes.find(theme => theme.id === savedCatStyle) || window.catThemes[0];

window.catVisualBase = new URL('.', document.currentScript.src);
window.catThemeURL = id => {
  const theme = window.catThemes.find(item => item.id === id) || window.catThemes[0];
  return theme.template ? new URL(theme.path, window.catVisualBase).href
    : new URL('index.html?style=' + encodeURIComponent(theme.id), window.catVisualBase).href;
};
window.catIsRouting = initialCatTheme.template
  ? declaredCatStyle !== initialCatTheme.id : Boolean(declaredCatStyle);
if (window.catIsRouting) location.replace(window.catThemeURL(initialCatTheme.id));
document.documentElement.dataset.style = initialCatTheme.id;
document.documentElement.dataset.expressive = String(Boolean(initialCatTheme.expressive));
document.querySelector('meta[name="theme-color"]').content = initialCatTheme.background;
