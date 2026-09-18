/* ============================================
   JENNY FIGMENT — Lucky Penny art lightbox
   Opens a thumbnail full size in a <dialog>.
   ============================================ */

(function () {
  document.addEventListener('DOMContentLoaded', () => {
    const thumbs = document.querySelectorAll('.penny-art-thumb');
    const dialog = document.getElementById('penny-lightbox');
    if (!thumbs.length || !dialog) return;

    const sourceOf = (btn) => btn.querySelector('img');

    /* No <dialog> support: open the file directly rather than leaving a
       button that does nothing. */
    if (typeof dialog.showModal !== 'function') {
      thumbs.forEach((btn) => {
        btn.addEventListener('click', () => {
          const img = sourceOf(btn);
          if (img) window.open(img.currentSrc || img.src, '_blank', 'noopener');
        });
      });
      return;
    }

    const full = dialog.querySelector('.art-lightbox__img');
    const closeBtn = dialog.querySelector('.art-lightbox__close');
    let lastFocused = null;

    thumbs.forEach((btn) => {
      btn.addEventListener('click', () => {
        const img = sourceOf(btn);
        if (!img) return;
        lastFocused = btn;
        dialog.classList.remove('is-ready');
        full.src = img.currentSrc || img.src;
        full.alt = img.alt;
        dialog.showModal();

        /* Reveal the picture and the close button together, once the image
           has decoded — otherwise the button shows against a blank frame.
           A decode failure must still reveal, or the button stays hidden. */
        const reveal = () => dialog.classList.add('is-ready');
        if (typeof full.decode === 'function') {
          full.decode().then(reveal, reveal);
        } else if (full.complete) {
          reveal();
        } else {
          full.addEventListener('load', reveal, { once: true });
          full.addEventListener('error', reveal, { once: true });
        }
      });
    });

    closeBtn?.addEventListener('click', () => dialog.close());

    /* Clicking the backdrop closes it. Esc is handled by showModal(). */
    dialog.addEventListener('click', (e) => {
      if (e.target === dialog) dialog.close();
    });

    dialog.addEventListener('close', () => {
      dialog.classList.remove('is-ready');  // so the next open re-animates
      full.removeAttribute('src');
      lastFocused?.focus();
    });
  });
})();
