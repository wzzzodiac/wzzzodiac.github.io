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
