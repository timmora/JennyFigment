/* ============================================
   JENNY FIGMENT — Main JS
   Shared across every page: mobile nav drawer, masthead drop panels,
   sticky-nav shadow, scroll reveal.

   The active nav link is not set here — tools/sync-layout.mjs stamps
   aria-current="page" into the markup at build time, so it is right before
   any JavaScript runs and stays right with JavaScript off.
   ============================================ */

(function () {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ── Mobile nav drawer ─────────────────────────────────────────────────────
  function initNav() {
    const toggle = document.getElementById('nav-toggle');
    const drawer = document.getElementById('nav-drawer');
    if (!toggle || !drawer) return;

    // The main-site drawer covers the whole screen (hamburger included), so it
    // carries its own close button; the Kids Zone drawer sits under its bar.
    const closeButton = drawer.querySelector('[data-nav-close]');

    const setOpen = (open, { restoreFocus = true } = {}) => {
      toggle.setAttribute('aria-expanded', String(open));
      drawer.classList.toggle('is-open', open);
      // Lock the page behind the drawer so only the drawer scrolls.
      document.body.style.overflow = open ? 'hidden' : '';
      if (closeButton && (open || restoreFocus)) (open ? closeButton : toggle).focus();
    };

    toggle.addEventListener('click', () => {
      setOpen(toggle.getAttribute('aria-expanded') !== 'true');
    });

    if (closeButton) closeButton.addEventListener('click', () => setOpen(false));

    document.addEventListener('keydown', (e) => {
      if (!drawer.classList.contains('is-open')) return;
      if (e.key === 'Escape') {
        setOpen(false);
        toggle.focus();
        return;
      }
      // Full-screen drawer is modal: keep Tab cycling inside it.
      if (e.key !== 'Tab' || !closeButton) return;
      const focusable = drawer.querySelectorAll('a[href], button');
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    });

    // Following a link: focus goes wherever the link leads. Sending it back to
    // the hamburger would scroll the page to the top first.
    drawer.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => setOpen(false, { restoreFocus: false }));
    });
  }

  // ── Masthead drop panels (Books, Educators & Parents) ─────────────────────
  // One open/closed state per panel, driven here for mouse hover, click/tap
  // and keyboard alike; at most one panel is open at a time. (CSS only opens
  // them on hover when this hasn't run — see .is-enhanced.)
  function initMegaPanels() {
    const masthead = document.querySelector('.masthead');
    const groups = [...document.querySelectorAll('.masthead__group')];
    if (!masthead || !groups.length) return;
    masthead.classList.add('is-enhanced');

    // Grace period so a mouse cutting a corner on the way into the panel
    // doesn't slam it shut.
    const HOVER_CLOSE_DELAY = 150;
    let closeTimer = null;

    const isOpen = (group) => group.classList.contains('is-open');

    const setOpen = (group, open) => {
      group.classList.toggle('is-open', open);
      group.querySelector('.masthead__trigger').setAttribute('aria-expanded', String(open));
    };

    const openOnly = (group) => {
      clearTimeout(closeTimer);
      groups.forEach((g) => setOpen(g, g === group));
    };

    const closeAll = () => {
      clearTimeout(closeTimer);
      groups.forEach((g) => setOpen(g, false));
    };

    groups.forEach((group) => {
      const trigger = group.querySelector('.masthead__trigger');

      // Mouse only: touch and pen go through click, so a tap doesn't
      // open-then-immediately-toggle-closed.
      group.addEventListener('pointerenter', (e) => {
        if (e.pointerType === 'mouse') openOnly(group);
      });

      group.addEventListener('pointerleave', (e) => {
        if (e.pointerType !== 'mouse') return;
        clearTimeout(closeTimer);
        closeTimer = setTimeout(() => setOpen(group, false), HOVER_CLOSE_DELAY);
      });

      trigger.addEventListener('click', () => {
        if (isOpen(group)) closeAll();
        else openOnly(group);
      });

      group.addEventListener('focusout', (e) => {
        if (!group.contains(e.relatedTarget)) setOpen(group, false);
      });
    });

    document.addEventListener('keydown', (e) => {
      if (e.key !== 'Escape') return;
      const open = groups.find(isOpen);
      if (!open) return;
      const hadFocus = open.contains(document.activeElement);
      closeAll();
      if (hadFocus) open.querySelector('.masthead__trigger').focus();
    });

    document.addEventListener('click', (e) => {
      if (!groups.some((g) => g.contains(e.target))) closeAll();
    });
  }

  // ── Sticky nav shadow on scroll ───────────────────────────────────────────
  function initNavScroll() {
    const nav = document.querySelector('.masthead, .site-nav');
    if (!nav) return;

    const sync = () => nav.classList.toggle('is-scrolled', window.scrollY > 10);
    window.addEventListener('scroll', sync, { passive: true });
    sync();
  }

  // ── Reveal elements as they scroll into view ──────────────────────────────
  function initScrollReveal() {
    if (prefersReducedMotion) return;

    const items = document.querySelectorAll('[data-reveal]');
    if (!items.length) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-revealed');
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    items.forEach((item) => observer.observe(item));
  }

  // Smooth scrolling waits until the browser has finished jumping to any
  // #section in the URL (see html.is-loaded in design-system.css).
  window.addEventListener('load', () => {
    requestAnimationFrame(() => document.documentElement.classList.add('is-loaded'));
  });

  // ── Same-page #section links glide ────────────────────────────────────────
  // Arriving from another page jumps straight to the section (see above), but
  // a link to a section of the page you're already on should always scroll
  // smoothly — even before `load` fires, and even when the link's path is
  // written differently from the address bar (/educators-parents vs
  // /educators-parents.html, which the browser would otherwise treat as a
  // new page load).
  const pagePath = (path) =>
    path.replace(/\/index(\.html)?$/, '/').replace(/\.html$/, '').replace(/(.)\/$/, '$1');

  // Hand-rolled rather than scrollIntoView({ behavior: 'smooth' }): the
  // browser's smooth scroll is cancelled by any layout shift mid-flight (a
  // font or image arriving, a carousel measuring itself), which leaves it
  // stranded partway down. This re-measures the target every frame, so the
  // page can shift under it and it still lands on the section.
  let activeScroll = null;

  function scrollToSection(target) {
    if (activeScroll) activeScroll.cancel();

    const padding = () => parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) || 0;
    const destination = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const y = target.getBoundingClientRect().top + window.scrollY - padding();
      return Math.max(0, Math.min(y, max));
    };
    const jump = (y) => window.scrollTo({ top: y, behavior: 'instant' });

    if (prefersReducedMotion) {
      jump(destination());
      return;
    }

    const start = window.scrollY;
    // Longer trips take a little longer, within sensible bounds.
    const duration = Math.min(900, Math.max(350, Math.abs(destination() - start) * 0.25));
    const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
    let startTime = null;
    let frame = 0;

    // A wheel, touch or key press from the reader takes over.
    const userScroll = () => cancel();
    const cancel = () => {
      cancelAnimationFrame(frame);
      ['wheel', 'touchstart', 'keydown'].forEach((t) => window.removeEventListener(t, userScroll));
      activeScroll = null;
    };
    ['wheel', 'touchstart', 'keydown'].forEach((t) =>
      window.addEventListener(t, userScroll, { passive: true, once: true }));

    const step = (now) => {
      if (startTime === null) startTime = now;
      const t = Math.min(1, (now - startTime) / duration);
      jump(start + (destination() - start) * ease(t));
      if (t < 1) frame = requestAnimationFrame(step);
      else cancel();
    };
    frame = requestAnimationFrame(step);
    activeScroll = { cancel };
  }

  function initSectionLinks() {
    document.addEventListener('click', (e) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const link = e.target.closest('a[href*="#"]');
      if (!link || link.target === '_blank') return;

      const url = new URL(link.href, location.href);
      if (url.origin !== location.origin || pagePath(url.pathname) !== pagePath(location.pathname)) return;

      const id = decodeURIComponent(url.hash.slice(1));
      const target = id && document.getElementById(id);
      if (!target) return;

      e.preventDefault();
      scrollToSection(target);
      if (location.hash !== url.hash) history.pushState(null, '', url.hash);

      // Move keyboard focus to the section too, without a second jump.
      if (!target.matches('a, button, input, select, textarea, [tabindex]')) {
        target.setAttribute('tabindex', '-1');
      }
      target.focus({ preventScroll: true });
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    initNav();
    initMegaPanels();
    initSectionLinks();
    initNavScroll();
    initScrollReveal();
  });
})();
