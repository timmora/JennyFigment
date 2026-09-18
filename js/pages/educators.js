/* ============================================
   JENNY FIGMENT — Educators & Parents page
   Filters the resource cards by category.
   ============================================ */

(function () {
  document.addEventListener('DOMContentLoaded', () => {
    const buttons = document.querySelectorAll('.filter-btn');
    const cards = document.querySelectorAll('[data-resource]');
    if (!buttons.length || !cards.length) return;

    buttons.forEach((btn) => {
      btn.addEventListener('click', () => {
        const filter = btn.dataset.filter;

        buttons.forEach((other) => {
          const active = other === btn;
          other.classList.toggle('is-active', active);
          other.setAttribute('aria-pressed', String(active));
        });

        cards.forEach((card) => {
          const show = filter === 'all' || card.dataset.resource === filter;
          /* Not `hidden`: .resource-card sets display:flex, which outranks the
             UA's [hidden] rule and would leave filtered cards on screen. */
          card.style.display = show ? '' : 'none';
        });
      });
    });
  });
})();
