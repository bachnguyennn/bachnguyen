/* ============================================================
   app.js — theme toggle + persistence, active nav, run flourish
   ============================================================ */
(function () {
  // ---- theme: default light, persist, re-render charts ----
  const root = document.documentElement;
  try {
    const saved = localStorage.getItem('fn-theme');
    if (saved) root.setAttribute('data-theme', saved);
  } catch (e) { /* ignore */ }
  if (!root.getAttribute('data-theme')) root.setAttribute('data-theme', 'light');

  function setTheme(t) {
    root.setAttribute('data-theme', t);
    try { localStorage.setItem('fn-theme', t); } catch (e) {}
    if (window.renderCharts) window.renderCharts();
  }

  document.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-theme-toggle]');
    if (!btn) return;
    setTheme(root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark');
  });

  // ---- active nav based on filename ----
  const here = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
  document.querySelectorAll('.nav a').forEach(a => {
    const href = (a.getAttribute('href') || '').toLowerCase();
    if (href === here || (here === '' && href === 'index.html') ||
        (here === 'index.html' && href === 'index.html')) {
      a.classList.add('active');
    }
  });

  // ---- run-cell flourish on scroll-in ----
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(en => {
        if (en.isIntersecting) { en.target.classList.add('run'); io.unobserve(en.target); }
      });
    }, { threshold: 0.25 });
    document.querySelectorAll('.body-cell:not(.md)').forEach(c => io.observe(c));
  }
})();
