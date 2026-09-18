/* ============================================
   JENNY FIGMENT — Centered horizontal carousel

   One implementation for every arrow-driven rail on the site: the school-visit
   photo strip and the testimonial rails on the home and School Visits pages.
   All of them are a horizontally scrolling viewport whose slides are centered
   one at a time, so they share the same math for "which slide is centered",
   "scroll that one to the middle", and the wrap-around at either end.

   Markup contract, on the viewport element:
     data-carousel                    marks the root
     data-carousel-item="<selector>"  selects the slides inside the scroller
   and, inside it:
     .visits-testimonials__scroller           the scrolling element
     .visits-gallery__nav-btn--prev / --next  the arrows

   Slides can sit directly in the scroller or inside a wrapper strip — the item
   selector is matched against the scroller's whole subtree either way.
   ============================================ */

(function () {
  /* At the scroll extremes a slide often cannot reach the middle, so the
     nearest-to-center slide stops changing. Compare against the scroll ends
     directly instead, with a few pixels of slack for fractional scrolling. */
  const EDGE_SLACK = 8;
  const SETTLE_MS = 100;

  function initCarousel(root) {
    const scroller = root.querySelector('.visits-testimonials__scroller');
    const btnPrev = root.querySelector('.visits-gallery__nav-btn--prev');
    const btnNext = root.querySelector('.visits-gallery__nav-btn--next');
    const itemSelector = root.getAttribute('data-carousel-item');
    if (!scroller || !btnPrev || !btnNext || !itemSelector) return;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let activeIndex = 0;

    const items = () => scroller.querySelectorAll(itemSelector);
    const maxScroll = () => Math.max(0, scroller.scrollWidth - scroller.clientWidth);

    /** Signed distance from the slide's center to the viewport's center. */
    function offsetFromCenter(item) {
      const r = item.getBoundingClientRect();
      const sr = scroller.getBoundingClientRect();
      return r.left + r.width / 2 - (sr.left + sr.width / 2);
    }

    /** Scrolls the horizontal viewport only — never scrollIntoView, which
     *  drags the whole page along with it. */
    function centerItem(item, smooth) {
      if (!item) return;
      const delta = offsetFromCenter(item);
      if (smooth && !reducedMotion) {
        scroller.scrollBy({ left: delta, behavior: 'smooth' });
      } else {
        scroller.scrollLeft += delta;
      }
    }

    function nearestIndex() {
      const list = items();
      let best = 0;
      let bestDistance = Infinity;
      list.forEach((item, i) => {
        const d = Math.abs(offsetFromCenter(item));
        if (d < bestDistance) {
          bestDistance = d;
          best = i;
        }
      });
      return best;
    }

    /** Inset the snap targets so the first and last slide can still center. */
    function updateScrollPadding() {
      const first = items()[0];
      if (!first) return;
      const pad = Math.max(0, (scroller.clientWidth - first.offsetWidth) / 2);
      scroller.style.setProperty('--tt-scroll-padding', `${pad}px`);
    }

    function goToIndex(i, smooth) {
      const list = items();
      if (!list.length) return;
      activeIndex = ((i % list.length) + list.length) % list.length;
      centerItem(list[activeIndex], smooth);
    }

    function step(direction) {
      const count = items().length;
      if (count < 2) return;

      const limit = maxScroll();
      const atFarEnd = direction > 0
        ? limit > EDGE_SLACK && scroller.scrollLeft >= limit - EDGE_SLACK
        : limit > EDGE_SLACK && scroller.scrollLeft <= EDGE_SLACK;

      const i = nearestIndex();
      const wraps = atFarEnd || (direction > 0 ? i >= count - 1 : i <= 0);
      /* Wrapping jumps the full width of the rail, so do it instantly —
         a smooth scroll all the way back reads as a glitch. */
      if (wraps) goToIndex(direction > 0 ? 0 : count - 1, false);
      else goToIndex(i + direction, true);
    }

    function syncNav() {
      activeIndex = nearestIndex();
      const single = items().length < 2;
      btnPrev.disabled = single;
      btnNext.disabled = single;
    }

    let settleTimer;
    scroller.addEventListener('scroll', () => {
      window.clearTimeout(settleTimer);
      settleTimer = window.setTimeout(syncNav, SETTLE_MS);
    }, { passive: true });
    scroller.addEventListener('scrollend', syncNav);

    btnPrev.addEventListener('click', () => step(-1));
    btnNext.addEventListener('click', () => step(1));

    scroller.addEventListener('keydown', (e) => {
      if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
      e.preventDefault();
      step(e.key === 'ArrowRight' ? 1 : -1);
    });

    window.addEventListener('resize', () => {
      requestAnimationFrame(() => {
        updateScrollPadding();
        goToIndex(activeIndex, false);
        syncNav();
        document.dispatchEvent(new Event('carousel:laid-out'));
      });
    }, { passive: true });

    /* Two frames: the first lets layout settle, the second measures it. */
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        updateScrollPadding();
        goToIndex(0, false);
        syncNav();
        document.dispatchEvent(new Event('carousel:laid-out'));
      });
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('[data-carousel]').forEach(initCarousel);
  });
})();
