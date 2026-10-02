'use strict';

const root = document.documentElement;
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
const themes = window.catThemes;
const styleSelect = document.getElementById('visual-style');
const wideLayout = matchMedia('(min-width: 800px)');
let styleTransition;
let styleRequest = 0;
let activeTheme = themes.find(theme => theme.id === root.dataset.style) || themes[0];

themes.forEach(theme => styleSelect.add(new Option(theme.name, theme.id)));

function syncTabOrientation() {
  document.querySelector('[role="tablist"]').setAttribute('aria-orientation',
    wideLayout.matches ? activeTheme.desktopTabs : (activeTheme.mobileTabs || 'horizontal'));
}

function animateContent(element) {
  if (reducedMotion.matches) return;
  element.getAnimations().forEach(animation => animation.cancel());
  element.animate(
    [{ opacity: 0.35, transform: `translateY(${activeTheme.offset}px)` }, { opacity: 1, transform: 'translateY(0)' }],
    { duration: activeTheme.duration, easing: activeTheme.easing }
  );
}

function applyStyle(style) {
  activeTheme = themes.find(theme => theme.id === style) || themes[0];
  root.dataset.style = activeTheme.id;
  syncTabOrientation();
  styleSelect.value = activeTheme.id;
  document.querySelector('.style-swatch').style.backgroundColor = activeTheme.color;
  document.querySelector('meta[name="theme-color"]').content = activeTheme.background;
  try { localStorage.setItem('cat-visual-style', activeTheme.id); } catch { /* Storage is optional. */ }
}

applyStyle(root.dataset.style);
document.querySelector('.style-picker').hidden = false;
styleSelect.addEventListener('change', () => {
  const style = styleSelect.value;
  const request = ++styleRequest;
  if (styleTransition) styleTransition.skipTransition();
  const update = () => { if (request === styleRequest) applyStyle(style); };
  if (document.startViewTransition && !reducedMotion.matches) {
    styleTransition = document.startViewTransition(update);
    styleTransition.ready.catch(() => { /* Skipping a transition rejects ready, even if its update succeeds. */ });
    styleTransition.finished.catch(() => { /* A newer selection may supersede this transition. */ });
  } else {
    update();
    animateContent(document.querySelector('.hero'));
  }
});

const tabList = document.querySelector('[role="tablist"]');
const tabs = [...tabList.querySelectorAll('[role="tab"]')];
function selectTab(selected, focus = false) {
  tabs.forEach(tab => {
    const active = tab === selected;
    tab.setAttribute('aria-selected', String(active));
    tab.tabIndex = active ? 0 : -1;
    const panel = document.getElementById(tab.getAttribute('aria-controls'));
    panel.hidden = !active;
    panel.setAttribute('role', 'tabpanel');
    panel.tabIndex = 0;
  });
  if (focus) selected.focus();
}
tabList.hidden = false;
selectTab(tabs[0]);
tabs.forEach(tab => tab.addEventListener('click', () => {
  selectTab(tab);
  animateContent(document.getElementById(tab.getAttribute('aria-controls')));
}));
tabList.addEventListener('keydown', event => {
  const current = tabs.indexOf(document.activeElement);
  if (current < 0) return;
  let next;
  if (event.key === 'ArrowRight') next = (current + 1) % tabs.length;
  if (event.key === 'ArrowLeft') next = (current + tabs.length - 1) % tabs.length;
  if (tabList.getAttribute('aria-orientation') === 'vertical') {
    if (event.key === 'ArrowDown') next = (current + 1) % tabs.length;
    if (event.key === 'ArrowUp') next = (current + tabs.length - 1) % tabs.length;
  }
  if (event.key === 'Home') next = 0;
  if (event.key === 'End') next = tabs.length - 1;
  if (next === undefined) return;
  event.preventDefault();
  selectTab(tabs[next], true);
});
wideLayout.addEventListener('change', syncTabOrientation);

const fact = document.getElementById('random-fact');
const facts = [
  fact.textContent,
  'A slow blink can signal that a cat feels relaxed. You can try a gentle blink back.',
  'A cat showing their belly is not necessarily inviting a belly rub.',
  'Ears, eyes, tail and posture work together. One signal alone does not tell the whole story.',
  'Purring does not always mean a cat is happy. Context matters.'
];
let factIndex = 0;
const factButton = document.getElementById('another-fact');
factButton.hidden = false;
factButton.addEventListener('click', () => {
  // Choose any other item, so even repeated clicks always change the fact.
  factIndex = (factIndex + 1 + Math.floor(Math.random() * (facts.length - 1))) % facts.length;
  fact.textContent = facts[factIndex];
  animateContent(fact);
});

document.querySelectorAll('.signals details').forEach(details => {
  details.addEventListener('toggle', () => {
    if (details.open) document.querySelector('.cat-diagram').dataset.signal = details.dataset.signal;
  });
});

// Progressive enhancement: content is visible even if observation is unavailable.
if ('IntersectionObserver' in window && !reducedMotion.matches) {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      animateContent(entry.target);
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.12 });
  document.querySelectorAll('.section-heading, .gallery-item').forEach(item => observer.observe(item));
}
reducedMotion.addEventListener('change', () => {
  if (!reducedMotion.matches) return;
  styleTransition?.skipTransition();
  document.getAnimations().forEach(animation => animation.cancel());
});
