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

    // If reduced motion is preferred, skip attempting playback
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) {
      hero.classList.add('video-fallback');
      return;
    }

    const attemptPlay = async () => {
      try {
        const playPromise = video.play();
        if (playPromise !== undefined) {
          await playPromise;
        }
      } catch (err) {
        hero.classList.add('video-fallback');
      }
    };

    // If video errors, fallback
    video.addEventListener('error', () => {
      hero.classList.add('video-fallback');
    });

    // Try to play once metadata is ready
    if (video.readyState >= 1) {
      attemptPlay();
    } else {
      video.addEventListener('loadedmetadata', attemptPlay, { once: true });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
