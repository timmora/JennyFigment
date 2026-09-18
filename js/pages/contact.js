/* ============================================
   JENNY FIGMENT — Contact page
   School-visit fields that appear for the matching subject, plus the FAQ list.
   ============================================ */

(function () {
  document.addEventListener('DOMContentLoaded', () => {
    const subject = document.getElementById('contact-subject');
    const schoolFields = document.getElementById('school-visit-fields');

    if (subject && schoolFields) {
      /* Also run once on load: browsers restore the previously chosen option
         on a back/reload, and the fields have to match it. */
      const sync = () => {
        schoolFields.classList.toggle('is-visible', subject.value === 'school-visit');
      };
      subject.addEventListener('change', sync);
      sync();
    }

    document.querySelectorAll('.faq-question').forEach((btn) => {
      const answer = document.getElementById(btn.getAttribute('aria-controls'));
      if (!answer) return;
      btn.addEventListener('click', () => {
        const open = btn.getAttribute('aria-expanded') !== 'true';
        btn.setAttribute('aria-expanded', String(open));
        answer.classList.toggle('is-open', open);
      });
    });
  });
})();
