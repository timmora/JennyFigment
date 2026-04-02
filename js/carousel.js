/* ============================================
   JENNY FIGMENT — Testimonials Carousel
   Accessible, keyboard-navigable, auto-advancing
   ============================================ */

export function initCarousel(containerSelector = '[data-carousel]') {
  const containers = document.querySelectorAll(containerSelector);
  if (!containers.length) return;

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  containers.forEach(container => {
    const track = container.querySelector('.carousel__track');
    const slides = container.querySelectorAll('.carousel__slide');
    const prevBtn = container.querySelector('[data-carousel-prev]');
    const nextBtn = container.querySelector('[data-carousel-next]');
    const dotsContainer = container.querySelector('.carousel__dots');
    const pauseBtn = container.querySelector('.carousel__pause');
    const liveRegion = container.querySelector('[aria-live]');

    if (!track || !slides.length) return;

    // Determine slides per view based on screen size
    const getSlidesPerView = () => window.innerWidth >= 1024 ? 2 : 1;

    let current = 0;
    let isPaused = prefersReducedMotion;
    let timer = null;
    const INTERVAL = 5000;

    const total = slides.length;

    // Build dots
    if (dotsContainer) {
      dotsContainer.innerHTML = '';
      for (let i = 0; i < total; i++) {
        const dot = document.createElement('button');
        dot.className = 'carousel__dot';
        dot.setAttribute('aria-label', `Go to slide ${i + 1}`);
        if (i === 0) dot.classList.add('is-active');
        dot.addEventListener('click', () => goTo(i));
        dotsContainer.appendChild(dot);
      }
    }

    function updateDots(index) {
      if (!dotsContainer) return;
      dotsContainer.querySelectorAll('.carousel__dot').forEach((dot, i) => {
        dot.classList.toggle('is-active', i === index);
      });
    }

    function updateSlideVisibility(index) {
      const perView = getSlidesPerView();
      slides.forEach((slide, i) => {
        const visible = i >= index && i < index + perView;
        slide.setAttribute('aria-hidden', String(!visible));
        slide.querySelectorAll('a, button').forEach(el => {
          el.tabIndex = visible ? 0 : -1;
        });
      });
    }

    function getOffset(index) {
      const perView = getSlidesPerView();
      const slideWidth = 100 / perView;
      return -(index * slideWidth);
    }

    function goTo(index) {
      const perView = getSlidesPerView();
      const maxIndex = Math.max(0, total - perView);
      current = Math.max(0, Math.min(index, maxIndex));

      track.style.transform = `translateX(${getOffset(current)}%)`;
      updateDots(current);
      updateSlideVisibility(current);

      // Update live region for screen readers
      if (liveRegion) {
        liveRegion.textContent = `Showing slide ${current + 1} of ${total}`;
      }
    }

    function next() {
      const perView = getSlidesPerView();
      const maxIndex = total - perView;
      goTo(current >= maxIndex ? 0 : current + 1);
    }

    function prev() {
      const perView = getSlidesPerView();
      const maxIndex = total - perView;
      goTo(current <= 0 ? maxIndex : current - 1);
    }

    function startTimer() {
      if (isPaused || prefersReducedMotion) return;
      clearTimeout(timer);
      timer = setTimeout(() => {
        next();
        startTimer();
      }, INTERVAL);
    }

    function stopTimer() {
      clearTimeout(timer);
    }

    // Event listeners
    if (prevBtn) prevBtn.addEventListener('click', () => { prev(); stopTimer(); startTimer(); });
    if (nextBtn) nextBtn.addEventListener('click', () => { next(); stopTimer(); startTimer(); });

    if (pauseBtn) {
      pauseBtn.addEventListener('click', () => {
        isPaused = !isPaused;
        pauseBtn.setAttribute('aria-label', isPaused ? 'Resume autoplay' : 'Pause autoplay');
        pauseBtn.textContent = isPaused ? '▶' : '⏸';
        isPaused ? stopTimer() : startTimer();
      });
    }

    // Keyboard navigation on track
    container.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') { prev(); stopTimer(); startTimer(); }
      if (e.key === 'ArrowRight') { next(); stopTimer(); startTimer(); }
    });

    // Touch/swipe
    let touchStartX = 0;
    track.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].clientX;
    }, { passive: true });
    track.addEventListener('touchend', (e) => {
      const diff = touchStartX - e.changedTouches[0].clientX;
      if (Math.abs(diff) > 50) {
        diff > 0 ? next() : prev();
        stopTimer(); startTimer();
      }
    }, { passive: true });

    // Pause on hover / focus
    container.addEventListener('mouseenter', stopTimer);
    container.addEventListener('mouseleave', () => { if (!isPaused) startTimer(); });
    container.addEventListener('focusin', stopTimer);
    container.addEventListener('focusout', () => { if (!isPaused) startTimer(); });

    // Respond to window resize
    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => goTo(current), 150);
    });

    // Initialize
    goTo(0);
    startTimer();
  });
}
