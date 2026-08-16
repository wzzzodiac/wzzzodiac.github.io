if (!document.querySelector('link[rel~="icon"]')) {
  const favicon = document.createElement('link');
  favicon.rel = 'icon';
  favicon.type = 'image/png';
  favicon.href = 'https://avatars.githubusercontent.com/u/46037018?v=4';
  document.head.appendChild(favicon);
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
    <div class="sidebar-footer">v0.60<br>field manual</div>`;
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
