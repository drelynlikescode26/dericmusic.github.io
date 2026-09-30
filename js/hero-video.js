/**
 * Hero Video Fallback
 * - Attempts to play the background video
 * - Falls back to poster if play fails
 */

(function() {
  'use strict';

  function init() {
    const hero = document.querySelector('.hero');
    const video = document.querySelector('.hero-video');

    if (!hero || !video) return;

    // Reduced motion: hide video, poster will show via CSS background
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      hero.classList.add('video-fallback');
      return;
    }

    // Keep the poster on data-saving and very slow mobile connections.
    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    if (connection?.saveData || /(^|-)2g$/.test(connection?.effectiveType || '')) {
      hero.classList.add('video-fallback');
      return;
    }

    // Calling play() starts loading only after this check; preload stays disabled.
    const p = video.play();
    if (p && typeof p.then === 'function') {
      p.catch(() => { /* silent — browser shows the poster */ });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
