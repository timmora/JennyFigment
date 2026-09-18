/* ============================================
   JENNY FIGMENT — "more below" cue on testimonial quotes

   A quote too tall for its card scrolls inside a fixed frame. This flags the
   frames that still have unread text so the CSS can show the cue, and clears
   the flag once the reader reaches the bottom.

   The rails themselves are js/carousel.js; this only decorates the cards, so
   it re-measures whenever a carousel reports it has laid out.
   ============================================ */

(function () {
  /* A couple of pixels of slack: sub-pixel line heights routinely make
     scrollHeight a hair taller than clientHeight with nothing to scroll to. */
  const OVERFLOW_SLACK = 6;
  const END_SLACK = 8;
  /* Late fallback for web fonts landing after the first measurement. */
  const REMEASURE_MS = 700;

  function updateQuoteOverflow(quote) {
    const frame = quote.closest('.testimonial-card__quote-frame');
    if (!frame) return;

    const hidden = quote.scrollHeight - quote.clientHeight;
    const atEnd = quote.scrollTop + quote.clientHeight >= quote.scrollHeight - END_SLACK;
    const hasMore = hidden > OVERFLOW_SLACK && !atEnd;

    frame.classList.toggle('has-more-below', hasMore);
    if (hasMore) {
      frame.setAttribute('aria-label', 'More of this quote below; scroll inside the quote area to read.');
    } else {
      frame.removeAttribute('aria-label');
    }
  }

  function refreshAll() {
    document.querySelectorAll('.testimonial-card__quote-scroll').forEach(updateQuoteOverflow);
  }

  document.addEventListener('DOMContentLoaded', () => {
    if (!document.querySelector('.testimonial-card__quote-scroll')) return;

    /* Capture phase: scroll doesn't bubble, so listen on the way down. */
    document.addEventListener('scroll', (e) => {
      const target = e.target;
      if (target instanceof Element && target.classList.contains('testimonial-card__quote-scroll')) {
        updateQuoteOverflow(target);
      }
    }, true);

    document.addEventListener('carousel:laid-out', refreshAll);
    window.addEventListener('resize', () => requestAnimationFrame(refreshAll), { passive: true });

    requestAnimationFrame(() => requestAnimationFrame(refreshAll));
    window.setTimeout(refreshAll, REMEASURE_MS);
  });
})();
