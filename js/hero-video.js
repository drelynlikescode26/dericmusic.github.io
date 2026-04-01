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

    // Attempt play — if it fails (unsupported format, autoplay blocked),
    // the <video poster> attribute handles the fallback natively.
    // We do NOT add video-fallback here to avoid hiding the poster.
    const tryPlay = () => {
      const p = video.play();
      if (p && typeof p.then === 'function') {
        p.catch(() => { /* silent — browser shows poster */ });
      }
    };

    if (video.readyState >= 1) {
      tryPlay();
    } else {
      video.addEventListener('canplay', tryPlay, { once: true });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
