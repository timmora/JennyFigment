/* ============================================
   JENNY FIGMENT — Testimonial rail
   Drives every [data-visits-testimonials-gallery] on a page: the centered
   snap carousel and the "more below" cue on quotes too tall for their card.
   Shared by School Visits (educator testimonials) and the home page
   (reader reviews). Looks its parts up inside each root, so a page can
   carry more than one rail.
   ============================================ */

(function () {
  document.addEventListener('DOMContentLoaded', function () {
    var rails = document.querySelectorAll('.visits-testimonials__scroller');
    if (!rails.length) return;

    rails.forEach(function (el) {

    function updateQuoteOverflow(wrap) {
      var frame = wrap.closest('.testimonial-card__quote-frame');
      if (!frame) return;
      frame.classList.remove('has-more-below');
      frame.removeAttribute('aria-label');
      var sh = wrap.scrollHeight;
      var ch = wrap.clientHeight;
      if (sh > ch + 6) {
        var atEnd = wrap.scrollTop + ch >= sh - 8;
        if (!atEnd) {
          frame.classList.add('has-more-below');
          frame.setAttribute(
            'aria-label',
            'More of this quote below; scroll inside the quote area to read.'
          );
        }
      }
    }

    function refreshAllQuoteHints() {
      el.querySelectorAll('.testimonial-card__quote-scroll').forEach(updateQuoteOverflow);
    }

    el.addEventListener(
      'scroll',
      function (e) {
        if (e.target.classList && e.target.classList.contains('testimonial-card__quote-scroll')) {
          updateQuoteOverflow(e.target);
        }
      },
      true
    );

    requestAnimationFrame(function () {
      requestAnimationFrame(refreshAllQuoteHints);
    });

    window.setTimeout(refreshAllQuoteHints, 700);

    window.addEventListener(
      'resize',
      function () {
        requestAnimationFrame(refreshAllQuoteHints);
      },
      { passive: true }
    );

    document.addEventListener('testimonials:quotes-need-refresh', refreshAllQuoteHints);
    });
  });

  document.addEventListener('DOMContentLoaded', function () {
    var roots = document.querySelectorAll('[data-visits-testimonials-gallery]');
    if (!roots.length) return;

    roots.forEach(function (root) {
    var scroller = root.querySelector('.visits-testimonials__scroller');
    var track = scroller && scroller.querySelector('[data-testimonials-track]');
    var btnPrev = root.querySelector('.visits-gallery__nav-btn--prev');
    var btnNext = root.querySelector('.visits-gallery__nav-btn--next');
    if (!scroller || !track || !btnPrev || !btnNext) return;

    var activeIndex = 0;
    var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    function cards() {
      return track.querySelectorAll(':scope > .testimonial-card');
    }

    function updateScrollPadding() {
      var list = cards();
      if (!list.length) return;
      var w = scroller.clientWidth;
      var cw = list[0].offsetWidth;
      var pad = Math.max(0, (w - cw) / 2);
      scroller.style.setProperty('--tt-scroll-padding', pad + 'px');
    }

    function viewportCenterX() {
      return scroller.scrollLeft + scroller.clientWidth / 2;
    }

    function distToCenter(card) {
      var r = card.getBoundingClientRect();
      var sr = scroller.getBoundingClientRect();
      var cx = scroller.scrollLeft + (r.left - sr.left) + r.width / 2;
      return Math.abs(cx - viewportCenterX());
    }

    function indexNearCenter() {
      var list = cards();
      var n = list.length;
      if (!n) return 0;
      var best = 0;
      var bestD = Infinity;
      for (var i = 0; i < n; i++) {
        var d = distToCenter(list[i]);
        if (d < bestD) {
          bestD = d;
          best = i;
        }
      }
      return best;
    }

    function scrollBehavior() {
      return reducedMotion ? 'auto' : 'smooth';
    }

    /** Center a card inside the horizontal scroller only — never call scrollIntoView (it scrolls the page). */
    function scrollCardIntoScroller(card, behavior) {
      if (!card) return;
      var r = card.getBoundingClientRect();
      var sr = scroller.getBoundingClientRect();
      var delta = r.left + r.width / 2 - (sr.left + sr.width / 2);
      var smooth = behavior === 'smooth' && !reducedMotion;
      if (smooth) {
        scroller.scrollBy({ left: delta, behavior: 'smooth' });
      } else {
        scroller.scrollLeft += delta;
      }
    }

    function goToIndex(i, instant) {
      var list = cards();
      var n = list.length;
      if (n < 1) return;
      i = ((i % n) + n) % n;
      activeIndex = i;
      var el = list[i];
      if (!el) return;
      var b = instant || reducedMotion ? 'auto' : scrollBehavior();
      scrollCardIntoScroller(el, b === 'smooth' ? 'smooth' : 'auto');
    }

    function goNext() {
      var n = cards().length;
      if (n < 2) return;
      var next = (activeIndex + 1) % n;
      if (activeIndex === n - 1 && next === 0) {
        goToIndex(0, true);
        return;
      }
      goToIndex(next, false);
    }

    function goPrev() {
      var n = cards().length;
      if (n < 2) return;
      if (activeIndex === 0) {
        goToIndex(n - 1, true);
        return;
      }
      goToIndex(activeIndex - 1, false);
    }

    function syncAfterScroll() {
      activeIndex = indexNearCenter();
      var n = cards().length;
      btnPrev.disabled = n < 2;
      btnNext.disabled = n < 2;
    }

    var debounceT;
    function onScrollerScroll() {
      window.clearTimeout(debounceT);
      debounceT = window.setTimeout(syncAfterScroll, 100);
    }

    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        updateScrollPadding();
        var list = cards();
        if (list.length) {
          scrollCardIntoScroller(list.item(0), 'auto');
        }
        syncAfterScroll();
        document.dispatchEvent(new Event('testimonials:quotes-need-refresh'));
      });
    });

    scroller.addEventListener('scroll', onScrollerScroll, { passive: true });
    scroller.addEventListener('scrollend', syncAfterScroll);

    btnPrev.addEventListener('click', goPrev);
    btnNext.addEventListener('click', goNext);

    scroller.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        goPrev();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        goNext();
      }
    });

    window.addEventListener(
      'resize',
      function () {
        requestAnimationFrame(function () {
          updateScrollPadding();
          goToIndex(activeIndex, true);
          syncAfterScroll();
          document.dispatchEvent(new Event('testimonials:quotes-need-refresh'));
        });
      },
      { passive: true }
    );
    });
  });
})();
