const pageFile = (location.pathname.split('/').pop() || 'index.html').toLowerCase();

const faviconGroups = {
  '🧪': ['404.html'],
  '🗂️': ['projects.html'],
  '📓': ['field-notes.html'],
  '✉️': ['contact.html'],
  '💻': [
    'category-web-github.html', 'github-pages.html', 'git-commands.html',
    'html-css-js-template.html', 'github-pages-debugging.html'
  ],
  '🖥️': [
    'category-windows-pc.html', 'windows-software.html', 'fresh-windows-setup.html',
    'gpu-pc-sanity-check.html', 'nvidia-gaming-settings.html',
    'translucenttb-taskbar.html', 'blank-space-copy.html'
  ],
  '🧩': [
    'category-browser-automation.html', 'instagram-follower-filtering.html',
    'youtube-speed-hotkeys.html', 'browser-tweaks-userscripts.html'
  ],
  '🛠️': [
    'category-dev-office.html', 'vscode-terminal-basics.html', 'excel-vba-survival.html'
  ],
  '🤖': [
    'category-raspberry-linux-ros.html', 'raspberry-pi-field-setup.html',
    'ubuntu-emergency-commands.html', 'ros2-quick-checks.html',
    'xorg-wayland-troubleshooting.html'
  ],
  '🎮': ['category-gaming.html', 'l4d2center-anticheat.html', 'l4d2-custom-maps.html']
};

if (pageFile !== 'index.html') {
  let faviconEmoji = '🧪';
  for (const [emoji, files] of Object.entries(faviconGroups)) {
    if (files.includes(pageFile)) {
      faviconEmoji = emoji;
      break;
    }
  }

  const faviconSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" rx="20" fill="#071015"/><text x="50" y="68" text-anchor="middle" font-size="58">${faviconEmoji}</text></svg>`;
  let favicon = document.querySelector('link[rel~="icon"]');
  if (!favicon) {
    favicon = document.createElement('link');
    favicon.rel = 'icon';
    document.head.appendChild(favicon);
  }
  favicon.type = 'image/svg+xml';
  favicon.href = `data:image/svg+xml,${encodeURIComponent(faviconSvg)}`;
}

if (!document.querySelector('.sidebar')) {
  const inNotes = location.pathname.includes('/notes/');
  const prefix = inNotes ? '../' : '';
  const sidebar = document.createElement('aside');
  sidebar.className = 'sidebar';
  sidebar.setAttribute('aria-label', 'Main navigation');
  sidebar.innerHTML = `
    <div class="sidebar-profile">
      <a href="https://github.com/wzzzodiac" target="_blank" rel="noreferrer" class="sidebar-photo-link" aria-label="Open GitHub profile">
        <img class="sidebar-photo" src="https://avatars.githubusercontent.com/u/46037018?v=4" alt="W.ZC profile picture">
      </a>
      <div class="sidebar-photo-note">my profile</div>
    </div>
    <nav class="menu">
      <a class="menu-item" href="${prefix}index.html"><span class="icon">⌂</span><span class="label">home</span></a>
      <a class="menu-item" href="${prefix}projects.html"><span class="icon">⌘</span><span class="label">projects</span></a>
      <a class="menu-item active" href="${prefix}field-notes.html"><span class="icon">▤</span><span class="label">field notes</span></a>
      <a class="menu-item" href="${prefix}contact.html"><span class="icon">✉</span><span class="label">contact</span></a>
    </nav>
    <div class="sidebar-footer">v0.64<br>field manual</div>`;
  document.body.insertBefore(sidebar, document.body.firstChild);
}

const lastUpdated = document.getElementById("lastUpdated");
if (lastUpdated) {
  const d = new Date(document.lastModified);
  lastUpdated.textContent = Number.isNaN(d.getTime())
    ? "recently"
    : d.toLocaleDateString("en-GB", { year: "numeric", month: "short", day: "2-digit" });
}

const observer = new IntersectionObserver(
  entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.12 }
);

document.querySelectorAll(".reveal").forEach(el => observer.observe(el));

const backToTop = document.getElementById("backToTop");
window.addEventListener("scroll", () => {
  if (!backToTop) return;
  backToTop.classList.toggle("show", window.scrollY > 500);
});

backToTop?.addEventListener("click", () => {
  window.scrollTo({ top: 0, behavior: "smooth" });
});
