/* ============================================
   JENNY FIGMENT — Jenny Q&A Accordion
   ============================================ */

function closeAnswer(btn, answer, buttons) {
  btn.setAttribute('aria-expanded', 'false');
  answer.classList.remove('is-open');
  answer.style.maxHeight = '0';
}

function openAnswer(btn, answer, buttons) {
  buttons.forEach(otherBtn => {
    if (otherBtn !== btn) {
      otherBtn.setAttribute('aria-expanded', 'false');
      const otherId = otherBtn.getAttribute('aria-controls');
      const otherAnswer = document.getElementById(otherId);
      if (otherAnswer) {
        otherAnswer.classList.remove('is-open');
        otherAnswer.style.maxHeight = '0';
      }
    }
  });

  btn.setAttribute('aria-expanded', 'true');
  answer.classList.add('is-open');
  answer.style.maxHeight = `${answer.scrollHeight}px`;
}

document.addEventListener('DOMContentLoaded', () => {
  const qaContainer = document.getElementById('qa-container');
  if (!qaContainer) return;

  const buttons = qaContainer.querySelectorAll('.qa-question-btn');
  const surpriseBtn = document.getElementById('qa-surprise');
  const closeAllBtn = document.getElementById('qa-close-all');

  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      const isOpen = btn.getAttribute('aria-expanded') === 'true';
      const answerId = btn.getAttribute('aria-controls');
      const answer = document.getElementById(answerId);

      if (!answer) return;

      if (isOpen) {
        closeAnswer(btn, answer, buttons);
      } else {
        openAnswer(btn, answer, buttons);
      }
    });
  });

  surpriseBtn?.addEventListener('click', () => {
    const list = [...buttons];
    const openBtn = list.find(b => b.getAttribute('aria-expanded') === 'true');
    let pool = list;
    if (openBtn && list.length > 1) {
      pool = list.filter(b => b !== openBtn);
    }
    const pick = pool[Math.floor(Math.random() * pool.length)];
    const answerId = pick.getAttribute('aria-controls');
    const answer = document.getElementById(answerId);
    if (!answer) return;

    openAnswer(pick, answer, buttons);
    pick.focus();
    pick.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

    requestAnimationFrame(() => {
      answer.style.maxHeight = `${answer.scrollHeight}px`;
    });
  });

  closeAllBtn?.addEventListener('click', () => {
    buttons.forEach(btn => {
      const answerId = btn.getAttribute('aria-controls');
      const answer = document.getElementById(answerId);
      if (answer) closeAnswer(btn, answer, buttons);
    });
  });

  window.addEventListener(
    'resize',
    () => {
      buttons.forEach(btn => {
        if (btn.getAttribute('aria-expanded') !== 'true') return;
        const answerId = btn.getAttribute('aria-controls');
        const answer = document.getElementById(answerId);
        if (answer?.classList.contains('is-open')) {
          answer.style.maxHeight = `${answer.scrollHeight}px`;
        }
      });
    },
    { passive: true }
  );
});
