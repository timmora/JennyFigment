/* ============================================
   JENNY FIGMENT — Jenny Q&A Accordion
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
  const qaContainer = document.getElementById('qa-container');
  if (!qaContainer) return;

  const buttons = qaContainer.querySelectorAll('.qa-question-btn');

  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      const isOpen = btn.getAttribute('aria-expanded') === 'true';
      const answerId = btn.getAttribute('aria-controls');
      const answer = document.getElementById(answerId);

      if (!answer) return;

      if (isOpen) {
        // Close
        btn.setAttribute('aria-expanded', 'false');
        answer.classList.remove('is-open');
        answer.style.maxHeight = '0';
      } else {
        // Close all others first (optional: accordion behaviour)
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

        // Open this one
        btn.setAttribute('aria-expanded', 'true');
        answer.classList.add('is-open');
        answer.style.maxHeight = answer.scrollHeight + 'px';
      }
    });
  });
});
