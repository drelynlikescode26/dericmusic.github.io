/**
 * Listen Portal — opens Spotify embed modal when "Listen" button is clicked
 */
(function () {
  'use strict';

  function init() {
    const overlay  = document.getElementById('listen-portal');
    if (!overlay) return;

    const card     = overlay.querySelector('.listen-portal-card');
    const closeBtn = overlay.querySelector('.listen-portal-close');
    const openBtn  = document.getElementById('open-listen-portal');

    function open() {
      overlay.hidden = false;
      void overlay.offsetHeight; // force reflow for CSS transition
      overlay.classList.add('active');
      document.body.classList.add('portal-open');
      if (closeBtn) setTimeout(() => closeBtn.focus(), 100);
    }

    function close() {
      overlay.classList.remove('active');
      setTimeout(function () {
        overlay.hidden = true;
        document.body.classList.remove('portal-open');
      }, 300);
    }

    // Wire the hero "Listen" button
    if (openBtn) openBtn.addEventListener('click', open);

    // Close button
    if (closeBtn) closeBtn.addEventListener('click', close);

    // Click backdrop to close
    overlay.addEventListener('click', function (e) {
      if (e.target === overlay) close();
    });

    // Prevent card clicks from bubbling to backdrop
    if (card) card.addEventListener('click', function (e) { e.stopPropagation(); });

    // ESC key
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !overlay.hidden) close();
    });

    // Public API
    window.ListenPortal = { open: open, close: close };
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
