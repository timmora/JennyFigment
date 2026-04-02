/* ============================================
   JENNY FIGMENT — Flora's Recipe Stepper
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
  const stepsContainer = document.getElementById('recipe-steps');
  const prevBtn = document.getElementById('recipe-prev');
  const nextBtn = document.getElementById('recipe-next');
  const progressContainer = document.getElementById('recipe-progress');

  if (!stepsContainer || !prevBtn || !nextBtn) return;

  const steps = stepsContainer.querySelectorAll('.recipe-step');
  const total = steps.length;
  let current = 0;

  // Build progress dots
  for (let i = 0; i < total; i++) {
    const dot = document.createElement('div');
    dot.className = 'recipe-progress-dot';
    dot.setAttribute('aria-hidden', 'true');
    progressContainer?.appendChild(dot);
  }

  const dots = progressContainer?.querySelectorAll('.recipe-progress-dot') || [];

  function showStep(index) {
    steps.forEach((step, i) => {
      step.classList.toggle('is-active', i === index);
    });
    dots.forEach((dot, i) => {
      dot.classList.toggle('is-active', i === index);
    });

    prevBtn.disabled = index === 0;
    prevBtn.style.opacity = index === 0 ? '0.4' : '1';

    if (index === total - 1) {
      nextBtn.textContent = '🎉 Done!';
      nextBtn.disabled = true;
      nextBtn.style.opacity = '0.6';
    } else {
      nextBtn.textContent = 'Next Step →';
      nextBtn.disabled = false;
      nextBtn.style.opacity = '1';
    }

    // Update live region for screen readers
    if (progressContainer) {
      progressContainer.setAttribute('aria-label', `Step ${index + 1} of ${total}`);
    }

    // Scroll to top of step on mobile
    if (window.innerWidth < 640) {
      stepsContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  prevBtn.addEventListener('click', () => {
    if (current > 0) { current--; showStep(current); }
  });

  nextBtn.addEventListener('click', () => {
    if (current < total - 1) { current++; showStep(current); }
  });

  // Keyboard: arrow keys
  document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight' && current < total - 1) { current++; showStep(current); }
    if (e.key === 'ArrowLeft' && current > 0) { current--; showStep(current); }
  });

  showStep(0);
});
