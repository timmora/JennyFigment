/* ============================================
   JENNY FIGMENT — Main JS
   Shared: nav toggle, skip-link, scroll effects,
           reduced-motion detection, outbound modal
   ============================================ */

// ── Reduced motion preference ───────────────────────────────────────────────
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// ── Mobile nav toggle ───────────────────────────────────────────────────────
function initNav() {
  const toggle = document.getElementById('nav-toggle');
  const drawer = document.getElementById('nav-drawer');
  if (!toggle || !drawer) return;

  toggle.addEventListener('click', () => {
    const isOpen = toggle.getAttribute('aria-expanded') === 'true';
    toggle.setAttribute('aria-expanded', String(!isOpen));
    drawer.classList.toggle('is-open', !isOpen);
    document.body.style.overflow = !isOpen ? 'hidden' : '';
  });

  // Close on Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && drawer.classList.contains('is-open')) {
      toggle.setAttribute('aria-expanded', 'false');
      drawer.classList.remove('is-open');
      document.body.style.overflow = '';
      toggle.focus();
    }
  });

  // Close when clicking a drawer link
  drawer.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      toggle.setAttribute('aria-expanded', 'false');
      drawer.classList.remove('is-open');
      document.body.style.overflow = '';
    });
  });
}

// ── Sticky nav shadow on scroll ─────────────────────────────────────────────
function initNavScroll() {
  const nav = document.querySelector('.site-nav');
  if (!nav) return;

  const handler = () => {
    nav.classList.toggle('is-scrolled', window.scrollY > 10);
  };
  window.addEventListener('scroll', handler, { passive: true });
  handler();
}

// ── Animate elements on scroll (IntersectionObserver) ───────────────────────
function initScrollReveal() {
  if (prefersReducedMotion) return;

  const items = document.querySelectorAll('[data-reveal]');
  if (!items.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-revealed');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  items.forEach(item => observer.observe(item));
}

// ── Outbound link warning modal (Kids Zone only) ────────────────────────────
function initOutboundModal() {
  const modal = document.getElementById('outbound-modal');
  if (!modal) return;

  const closeBtn = modal.querySelector('[data-modal-close]');
  const proceedBtn = modal.querySelector('[data-modal-proceed]');
  let pendingHref = '';

  document.querySelectorAll('[data-external]').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      pendingHref = link.href;
      modal.classList.add('is-open');
      modal.querySelector('.outbound-modal__box').focus();
    });
  });

  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      modal.classList.remove('is-open');
      pendingHref = '';
    });
  }

  if (proceedBtn) {
    proceedBtn.addEventListener('click', () => {
      modal.classList.remove('is-open');
      if (pendingHref) {
        window.open(pendingHref, '_blank', 'noopener,noreferrer');
        pendingHref = '';
      }
    });
  }

  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.classList.remove('is-open');
      pendingHref = '';
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('is-open')) {
      modal.classList.remove('is-open');
      pendingHref = '';
    }
  });
}

// ── Active nav link ─────────────────────────────────────────────────────────
function initActiveNav() {
  const currentPath = window.location.pathname;
  document.querySelectorAll('.site-nav__links a, .nav-drawer__links a').forEach(link => {
    try {
      const linkPath = new URL(link.href).pathname;
      if (linkPath === currentPath || (currentPath !== '/' && currentPath.startsWith(linkPath) && linkPath !== '/')) {
        link.setAttribute('aria-current', 'page');
      }
    } catch (_) { /* ignore */ }
  });
}

// ── Initialize ───────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  initNav();
  initNavScroll();
  initScrollReveal();
  initOutboundModal();
  initActiveNav();
});
