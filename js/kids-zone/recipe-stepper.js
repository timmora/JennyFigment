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
  let current = 0;

  for (let i = 0; i < total; i++) {
    const dot = document.createElement('button');
    dot.type = 'button';
    dot.className = 'recipe-progress-dot';
    dot.setAttribute('aria-label', `Go to step ${i + 1}`);
    dot.addEventListener('click', () => {
      current = i;
      showStep(current);
    });
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

    const isLast = index === total - 1;
    if (isLast) {
      nextBtn.textContent = '🎉 Done!';
      nextBtn.disabled = true;
      nextBtn.style.opacity = '0.6';
      restartBtn.style.display = 'inline-flex';
    } else {
      nextBtn.textContent = 'Next Step →';
      nextBtn.disabled = false;
      nextBtn.style.opacity = '1';
      restartBtn.style.display = 'none';
    }

    const msg = `Step ${index + 1} of ${total}`;
    if (progressText) progressText.textContent = msg;
    if (progressContainer) {
      progressContainer.setAttribute('aria-label', msg);
    }

    if (window.innerWidth < 640) {
      stepsContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  prevBtn.addEventListener('click', () => {
    if (current > 0) {
      current -= 1;
      showStep(current);
    }
  });

  nextBtn.addEventListener('click', () => {
    if (current < total - 1) {
      current += 1;
      showStep(current);
    }
  });

  restartBtn?.addEventListener('click', () => {
    current = 0;
    showStep(current);
    nextBtn.focus();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight' && current < total - 1) {
      current += 1;
      showStep(current);
    }
    if (e.key === 'ArrowLeft' && current > 0) {
      current -= 1;
      showStep(current);
    }
  });

  showStep(0);
});
