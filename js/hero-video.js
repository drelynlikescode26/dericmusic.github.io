/** Muted inline playback with a poster while loading, blocked, or buffering. */
(function () {
  'use strict';
  function init() {
    const hero = document.querySelector('.hero');
    const video = document.querySelector('.hero-video');
    if (!hero || !video) return;
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    let bufferingTimer;
    let attempting = false;
    function usePoster() { hero.classList.remove('video-playing'); }
    function allowed() { return !motion.matches && !connection?.saveData && !/(^|-)2g$/.test(connection?.effectiveType || ''); }
    async function resume() {
      if (!allowed() || document.hidden || video.error) { usePoster(); return; }
      if (attempting) return;
      attempting = true;
      video.muted = true;
      video.defaultMuted = true;
      try { await video.play(); } catch (_) { usePoster(); }
      finally { attempting = false; }
    }
    video.addEventListener('playing', function () { clearTimeout(bufferingTimer); hero.classList.add('video-playing'); });
    video.addEventListener('waiting', function () { clearTimeout(bufferingTimer); bufferingTimer = setTimeout(usePoster, 1200); });
    video.addEventListener('error', usePoster);
    video.addEventListener('canplay', resume);
    video.addEventListener('pause', function () { usePoster(); if (!document.hidden && allowed()) resume(); });
    document.addEventListener('visibilitychange', function () {
      if (document.hidden) { clearTimeout(bufferingTimer); video.pause(); }
      else resume();
    });
    window.addEventListener('pageshow', resume);
    document.addEventListener('pointerdown', function () { if (video.paused) resume(); }, { passive: true });
    document.addEventListener('keydown', function () { if (video.paused) resume(); });
    motion.addEventListener('change', function () { if (allowed()) resume(); else { video.pause(); usePoster(); } });
    if (!allowed()) { video.autoplay = false; video.preload = 'none'; video.pause(); usePoster(); }
    else resume();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
