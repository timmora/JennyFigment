/* ============================================
   JENNY FIGMENT — Jenny Q&A Accordion
   One answer open at a time.
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
  const qaContainer = document.getElementById('qa-container');
  if (!qaContainer) return;

  const buttons = [...qaContainer.querySelectorAll('.qa-question-btn')];
  const surpriseBtn = document.getElementById('qa-surprise');
  const closeAllBtn = document.getElementById('qa-close-all');

  const answerFor = (btn) => document.getElementById(btn.getAttribute('aria-controls'));
  const isOpen = (btn) => btn.getAttribute('aria-expanded') === 'true';

  /* max-height drives the CSS transition, so it has to be a real pixel value
     while open — 'none' would not animate. */
  function setOpen(btn, open) {
    const answer = answerFor(btn);
    if (!answer) return;
    btn.setAttribute('aria-expanded', String(open));
    answer.classList.toggle('is-open', open);
    answer.style.maxHeight = open ? `${answer.scrollHeight}px` : '0';
    /* Re-measure next frame: opening one answer closes another above it, and
       the reflow can change this one's height after the first measurement. */
    if (open) {
      requestAnimationFrame(() => {
        if (isOpen(btn)) answer.style.maxHeight = `${answer.scrollHeight}px`;
      });
    }
  }

  function openOnly(btn) {
    buttons.forEach((other) => {
      if (other !== btn) setOpen(other, false);
    });
    setOpen(btn, true);
  }

  buttons.forEach((btn) => {
    btn.addEventListener('click', () => {
      if (isOpen(btn)) setOpen(btn, false);
      else openOnly(btn);
    });
  });

  surpriseBtn?.addEventListener('click', () => {
    /* Never re-pick the one already open — that would look like a dud click. */
    const openBtn = buttons.find(isOpen);
    const pool = openBtn && buttons.length > 1
      ? buttons.filter((b) => b !== openBtn)
      : buttons;
    const pick = pool[Math.floor(Math.random() * pool.length)];
    if (!pick) return;

    openOnly(pick);
    pick.focus();
    pick.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  });

  closeAllBtn?.addEventListener('click', () => {
    buttons.forEach((btn) => setOpen(btn, false));
  });

  /* A reflowed answer is a different height, so the pinned max-height has to
     be re-measured or the text gets clipped. */
  window.addEventListener('resize', () => {
    buttons.filter(isOpen).forEach((btn) => setOpen(btn, true));
  }, { passive: true });
});
