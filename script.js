/* =========================================================
   SILFER DEV — script.js
   ========================================================= */

// ---------------------------------------------------------
// CONFIG — edit these links when they're ready.
// ---------------------------------------------------------
const CONFIG = {
  DISCORD_URL: 'https://discord.gg/your-invite',
  DOCS_URL: '#',
  GITHUB_URL: 'https://github.com/your-username',
};

document.addEventListener('DOMContentLoaded', () => {
  applyConfigLinks();
  initNav();
  initMobileMenu();
  initFilters();
  initReveal();
  typeManifest();
  document.getElementById('year').textContent = new Date().getFullYear();
});

// ---------------------------------------------------------
// Wire up config-driven links
// ---------------------------------------------------------
function applyConfigLinks() {
  document.querySelectorAll('[data-discord-link]').forEach((el) => {
    el.href = CONFIG.DISCORD_URL;
    el.target = '_blank';
    el.rel = 'noopener noreferrer';
  });
  document.querySelectorAll('[data-doc-link]').forEach((el) => {
    el.href = CONFIG.DOCS_URL;
  });
  document.querySelectorAll('[data-github-link]').forEach((el) => {
    el.href = CONFIG.GITHUB_URL;
    el.target = '_blank';
    el.rel = 'noopener noreferrer';
  });
}

// ---------------------------------------------------------
// Navbar: compact on scroll
// ---------------------------------------------------------
function initNav() {
  const nav = document.getElementById('nav');
  const onScroll = () => {
    nav.classList.toggle('is-scrolled', window.scrollY > 12);
  };
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });
}

// ---------------------------------------------------------
// Mobile menu toggle
// ---------------------------------------------------------
function initMobileMenu() {
  const toggle = document.getElementById('nav-toggle');
  const menu = document.getElementById('nav-links-mobile');

  toggle.addEventListener('click', () => {
    const isOpen = menu.classList.toggle('is-open');
    toggle.setAttribute('aria-expanded', String(isOpen));
    toggle.setAttribute('aria-label', isOpen ? 'Close menu' : 'Open menu');
  });

  menu.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      menu.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
      toggle.setAttribute('aria-label', 'Open menu');
    });
  });
}

// ---------------------------------------------------------
// Resource filters (All / Free / Premium)
// ---------------------------------------------------------
function initFilters() {
  const filters = document.querySelectorAll('.filter');
  const cards = document.querySelectorAll('#resource-grid .rcard');

  filters.forEach((btn) => {
    btn.addEventListener('click', () => {
      filters.forEach((b) => {
        b.classList.remove('is-active');
        b.setAttribute('aria-selected', 'false');
      });
      btn.classList.add('is-active');
      btn.setAttribute('aria-selected', 'true');

      const value = btn.dataset.filter;
      cards.forEach((card) => {
        const show = value === 'all' || card.dataset.category === value;
        card.classList.toggle('is-hidden', !show);
      });
    });
  });
}

// ---------------------------------------------------------
// Scroll reveal (IntersectionObserver, reduced-motion aware)
// ---------------------------------------------------------
function initReveal() {
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const items = document.querySelectorAll('.reveal');

  if (prefersReduced || !('IntersectionObserver' in window)) {
    items.forEach((el) => el.classList.add('is-visible'));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
  );

  items.forEach((el) => observer.observe(el));
}

// ---------------------------------------------------------
// Hero editor: type out the fxmanifest.lua once on load
// ---------------------------------------------------------
function typeManifest() {
  const target = document.getElementById('editor-code');
  if (!target) return;

  const lines = [
    { text: "fx_version 'cerulean'", cls: [] },
    { text: "game 'gta5'", cls: [] },
    { text: '', cls: [] },
    { text: "author 'Silfer Dev'", cls: [] },
    { text: "description 'sf-jobs-core'", cls: [] },
    { text: "version '1.0.0'", cls: [] },
    { text: '', cls: [] },
    { text: "-- shared", cls: ['comment'] },
    { text: "shared_scripts { 'shared/*.lua' }", cls: [] },
    { text: '', cls: [] },
    { text: "client_scripts { 'client/*.lua' }", cls: [] },
    { text: "server_scripts { 'server/*.lua' }", cls: [] },
  ];

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const render = (line) => {
    const raw = line.text;
    if (line.cls.includes('comment')) return `<span class="c-comment">${escapeHtml(raw)}</span>`;

    return escapeHtml(raw)
      .replace(/^(fx_version|game|author|description|version|shared_scripts|client_scripts|server_scripts)/, '<span class="c-key">$1</span>')
      .replace(/&#39;([^&]*)&#39;/g, "<span class=\"c-string\">'$1'</span>");
  };

  if (prefersReduced) {
    target.innerHTML = lines.map(render).join('\n');
    return;
  }

  let output = '';
  let lineIndex = 0;

  const typeNextLine = () => {
    if (lineIndex >= lines.length) {
      target.innerHTML = lines.map(render).join('\n');
      return;
    }
    const line = lines[lineIndex];
    output += (lineIndex > 0 ? '\n' : '') + line.text;
    target.innerHTML = lines
      .slice(0, lineIndex)
      .map(render)
      .concat(render(line))
      .join('\n') + '<span class="c-cursor"></span>';
    lineIndex += 1;
    setTimeout(typeNextLine, line.text.length === 0 ? 90 : 60 + line.text.length * 6);
  };

  typeNextLine();
}

function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}
