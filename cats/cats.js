'use strict';

const root = document.documentElement;
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
const styleButtons = [...document.querySelectorAll('[data-style-choice]')];
const wideLayout = matchMedia('(min-width: 800px)');
let styleTransition;

function syncTabOrientation() {
  document.querySelector('[role="tablist"]').setAttribute('aria-orientation',
    root.dataset.style === 'editorial' && wideLayout.matches ? 'vertical' : 'horizontal');
}

function animateContent(element) {
  if (reducedMotion.matches) return;
  element.getAnimations().forEach(animation => animation.cancel());
  element.animate(
    [{ opacity: 0.35, transform: 'translateY(6px)' }, { opacity: 1, transform: 'translateY(0)' }],
    { duration: root.dataset.style === 'playful' ? 280 : 420, easing: 'ease-out' }
  );
}

function applyStyle(style) {
  root.dataset.style = style;
  syncTabOrientation();
  styleButtons.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.styleChoice === style)));
  document.querySelector('meta[name="theme-color"]').content = style === 'playful' ? '#ffdf63' : '#f5f2e9';
  try { localStorage.setItem('cat-visual-style', style); } catch { /* Storage is optional. */ }
}

applyStyle(root.dataset.style);
document.querySelector('.style-picker').hidden = false;
styleButtons.forEach(button => button.addEventListener('click', () => {
  const style = button.dataset.styleChoice;
  if (style === root.dataset.style) return;
  if (styleTransition) styleTransition.skipTransition();
  if (document.startViewTransition && !reducedMotion.matches) {
    styleTransition = document.startViewTransition(() => applyStyle(style));
    styleTransition.finished.catch(() => { /* A newer selection may supersede this transition. */ });
  } else {
    applyStyle(style);
    animateContent(document.querySelector('.hero'));
  }
}));

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
