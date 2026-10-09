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

// Respect the device setting and remember the optional local motion switch.
const motionPreference = matchMedia('(prefers-reduced-motion: reduce)');
let motionOff = false;
try { motionOff = localStorage.getItem('wzc-motion') === 'off'; } catch {}
const motionControl = document.createElement('button');
motionControl.type = 'button';
motionControl.className = 'motion-control';
const syncMotion = () => {
  const off = motionOff || motionPreference.matches;
  document.documentElement.dataset.motion = off ? 'off' : 'on';
  motionControl.textContent = off ? 'Motion: off' : 'Motion: on';
  motionControl.setAttribute('aria-label', 'Interface motion');
  motionControl.setAttribute('aria-pressed', String(!off));
  motionControl.disabled = motionPreference.matches;
  motionControl.title = motionPreference.matches ? 'Reduced motion follows your device setting' : 'Toggle interface motion';
};
syncMotion();
motionControl.addEventListener('click', () => {
  motionOff = !motionOff;
  try { localStorage.setItem('wzc-motion', motionOff ? 'off' : 'on'); } catch {}
  syncMotion();
});
motionPreference.addEventListener('change', syncMotion);
document.querySelector('footer')?.append(motionControl);

// The note index stays compact on mobile and opens beside desktop articles.
const noteOutline = document.querySelector('.note-outline');
if (noteOutline && matchMedia('(min-width: 1101px)').matches) noteOutline.open = true;

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
  window.scrollTo({ top: 0, behavior: document.documentElement.dataset.motion === "off" ? "instant" : "smooth" });
});

// Keep current-page semantics consistent for static and injected navigation.
document.querySelectorAll(".menu-item.active, .sidebar nav a.active").forEach(a => a.setAttribute("aria-current", "page"));
document.querySelectorAll(".back-to-top").forEach(b => b.setAttribute("aria-label", "Back to top"));
document.querySelectorAll(".sidebar nav b, .sidebar nav .icon").forEach(icon => icon.setAttribute("aria-hidden", "true"));

const welcomeAudio = document.getElementById("welcomeAudio");
const welcomeAudioToggle = document.getElementById("welcomeAudioToggle");
const welcomeAudioDuration = document.getElementById("welcomeAudioDuration");
const welcomeWaveform = document.getElementById("welcomeWaveform");
const welcomeWaveProgress = document.getElementById("welcomeWaveProgress");

if (welcomeAudio && welcomeAudioToggle && welcomeAudioDuration && welcomeWaveform && welcomeWaveProgress) {
  let welcomeProgressFrame = 0;

  const formatAudioTime = seconds => {
    if (!Number.isFinite(seconds) || seconds < 0) return "--:--";
    const wholeSeconds = Math.floor(seconds);
    const minutes = Math.floor(wholeSeconds / 60);
    const remainder = wholeSeconds % 60;
    return `${String(minutes).padStart(2, "0")}:${String(remainder).padStart(2, "0")}`;
  };

  const setWelcomePlaying = playing => {
    welcomeAudioToggle.querySelector("span").textContent = playing ? "❚❚" : "▶";
    welcomeAudioToggle.setAttribute("aria-label", playing ? "Pause welcome audio" : "Play welcome audio");
  };

  const updateWelcomeProgress = () => {
    const hasDuration = Number.isFinite(welcomeAudio.duration) && welcomeAudio.duration > 0;
    const ratio = hasDuration ? Math.min(1, Math.max(0, welcomeAudio.currentTime / welcomeAudio.duration)) : 0;
    welcomeWaveProgress.setAttribute("width", String(ratio * 180));
    welcomeWaveform.setAttribute("aria-valuenow", String(Math.round(ratio * 100)));
  };

  const stopWelcomeProgress = () => {
    cancelAnimationFrame(welcomeProgressFrame);
    welcomeProgressFrame = 0;
  };

  const animateWelcomeProgress = () => {
    updateWelcomeProgress();
    if (!welcomeAudio.paused && !welcomeAudio.ended) {
      welcomeProgressFrame = requestAnimationFrame(animateWelcomeProgress);
    }
  };

  const syncWelcomeDuration = () => {
    welcomeAudioDuration.textContent = formatAudioTime(welcomeAudio.duration);
    if (Number.isFinite(welcomeAudio.duration)) {
      welcomeAudioDuration.dateTime = `PT${welcomeAudio.duration}S`;
    }
  };

  welcomeAudioToggle.addEventListener("click", async () => {
    if (!welcomeAudio.paused) {
      welcomeAudio.pause();
      return;
    }
    try {
      await welcomeAudio.play();
    } catch {
      setWelcomePlaying(false);
    }
  });

  welcomeAudio.addEventListener("loadedmetadata", syncWelcomeDuration);
  welcomeAudio.addEventListener("durationchange", syncWelcomeDuration);
  welcomeAudio.addEventListener("timeupdate", updateWelcomeProgress);
  welcomeAudio.addEventListener("play", () => {
    setWelcomePlaying(true);
    stopWelcomeProgress();
    animateWelcomeProgress();
  });
  welcomeAudio.addEventListener("pause", () => {
    setWelcomePlaying(false);
    stopWelcomeProgress();
    updateWelcomeProgress();
  });
  welcomeAudio.addEventListener("ended", () => {
    stopWelcomeProgress();
    welcomeAudio.currentTime = 0;
    setWelcomePlaying(false);
    updateWelcomeProgress();
  });
  welcomeAudio.addEventListener("error", () => {
    stopWelcomeProgress();
    setWelcomePlaying(false);
    welcomeAudioToggle.disabled = true;
  });

  setWelcomePlaying(false);
  updateWelcomeProgress();
  if (welcomeAudio.readyState >= HTMLMediaElement.HAVE_METADATA) syncWelcomeDuration();
}
