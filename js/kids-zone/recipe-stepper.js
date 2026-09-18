/* ============================================
   JENNY FIGMENT — Flora's Recipe Stepper
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
  const stepsContainer = document.getElementById('recipe-steps');
  const prevBtn = document.getElementById('recipe-prev');
  const nextBtn = document.getElementById('recipe-next');
  const progressContainer = document.getElementById('recipe-progress');
  const progressText = document.getElementById('recipe-progress-text');
  const restartBtn = document.getElementById('recipe-restart');

  if (!stepsContainer || !prevBtn || !nextBtn) return;

  const steps = stepsContainer.querySelectorAll('.recipe-step');
  const total = steps.length;
  if (!total) return;
  let current = 0;

  const dots = [];
  steps.forEach((_step, i) => {
    const dot = document.createElement('button');
    dot.type = 'button';
    dot.className = 'recipe-progress-dot';
    dot.setAttribute('aria-label', `Go to step ${i + 1}`);
    dot.addEventListener('click', () => showStep(i));
    progressContainer?.appendChild(dot);
    dots.push(dot);
  });

  function showStep(index) {
    current = index;

    steps.forEach((step, i) => step.classList.toggle('is-active', i === index));
    dots.forEach((dot, i) => dot.classList.toggle('is-active', i === index));

    const isFirst = index === 0;
    const isLast = index === total - 1;

    prevBtn.disabled = isFirst;
    prevBtn.style.opacity = isFirst ? '0.4' : '1';

    nextBtn.disabled = isLast;
    nextBtn.style.opacity = isLast ? '0.6' : '1';
    nextBtn.textContent = isLast ? '🎉 Done!' : 'Next Step →';
    if (restartBtn) restartBtn.style.display = isLast ? 'inline-flex' : 'none';

    const msg = `Step ${index + 1} of ${total}`;
    if (progressText) progressText.textContent = msg;
    progressContainer?.setAttribute('aria-label', msg);

    /* On a phone the steps sit below the controls, so bring them back up. */
    if (window.innerWidth < 640) {
      stepsContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  const move = (delta) => {
    const next = current + delta;
    if (next >= 0 && next < total) showStep(next);
  };

  prevBtn.addEventListener('click', () => move(-1));
  nextBtn.addEventListener('click', () => move(1));

  restartBtn?.addEventListener('click', () => {
    showStep(0);
    nextBtn.focus();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') move(1);
    else if (e.key === 'ArrowLeft') move(-1);
  });

  showStep(0);
});
