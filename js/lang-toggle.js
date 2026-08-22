/* ============================================
   Bilingual EN / ES panel toggle
   Works on any [data-lang-toggle] group whose
   buttons carry data-lang matching a panel's
   data-lang-panel value.

   data-lang-toggle takes one element id, or several
   space-separated ids, so a single toggle can drive
   panels living in different sections of the page.
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('[data-lang-toggle]').forEach(group => {
    const ids = (group.getAttribute('data-lang-toggle') || '').split(/\s+/).filter(Boolean);
    const scopes = ids.map(id => document.getElementById(id)).filter(Boolean);
    const roots = scopes.length ? scopes : [document];

    const buttons = [...group.querySelectorAll('[data-lang]')];
    const panels = roots.reduce(
      (all, root) => all.concat([...root.querySelectorAll('[data-lang-panel]')]),
      []
    );
    if (!buttons.length || !panels.length) return;

    /* A hidden panel keeps playing, so the other language's audio would carry
       on over the top. Stop any media inside a panel as it's hidden. */
    const stopMedia = panel => {
      panel.querySelectorAll('video, audio').forEach(m => {
        try { m.pause(); } catch (_) { /* ignore */ }
      });
      panel.querySelectorAll('iframe[src*="youtube"]').forEach(frame => {
        try {
          frame.contentWindow.postMessage(
            '{"event":"command","func":"pauseVideo","args":""}',
            new URL(frame.src).origin
          );
        } catch (_) { /* ignore */ }
      });
    };

    const select = lang => {
      buttons.forEach(b => {
        const on = b.getAttribute('data-lang') === lang;
        b.setAttribute('aria-selected', String(on));
        b.tabIndex = on ? 0 : -1;
      });
      panels.forEach(p => {
        const hide = p.getAttribute('data-lang-panel') !== lang;
        if (hide && !p.hidden) stopMedia(p);
        p.hidden = hide;
      });
    };

    buttons.forEach(btn => {
      btn.addEventListener('click', () => select(btn.getAttribute('data-lang')));
      btn.addEventListener('keydown', e => {
        if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
        e.preventDefault();
        const i = buttons.indexOf(btn);
        const next = buttons[(i + (e.key === 'ArrowRight' ? 1 : buttons.length - 1)) % buttons.length];
        next.focus();
        select(next.getAttribute('data-lang'));
      });
    });

    select(buttons.find(b => b.getAttribute('aria-selected') === 'true')?.getAttribute('data-lang') || buttons[0].getAttribute('data-lang'));
  });
});
