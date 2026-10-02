/** Release time is midnight Eastern (EDT), not the visitor's local midnight. */
(function (root) {
  'use strict';
  const RELEASE_AT = Date.parse('2026-10-09T00:00:00-04:00');

  function remaining(now) {
    const total = Math.max(0, Math.ceil((RELEASE_AT - now) / 1000));
    return {
      days: Math.floor(total / 86400),
      hours: Math.floor(total / 3600) % 24,
      minutes: Math.floor(total / 60) % 60,
      seconds: total % 60,
      released: now >= RELEASE_AT
    };
  }

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { RELEASE_AT, remaining };
  }
  if (!root.document) return;
  const section = root.document.querySelector('[data-album-countdown]');
  if (!section) return;
  const clock = section.querySelector('[data-countdown-clock]');
  const status = section.querySelector('[data-release-status]');
  const presave = section.querySelector('[data-album-presave]');
  const calendar = section.querySelector('[data-album-calendar]');
  let interval;
  function update() {
    const state = remaining(Date.now());
    for (const unit of ['days', 'hours', 'minutes', 'seconds']) {
      section.querySelector(`[data-countdown-${unit}]`).textContent = String(state[unit]).padStart(2, '0');
    }
    clock.hidden = state.released;
    if (presave) presave.hidden = state.released;
    if (calendar) calendar.hidden = state.released;
    if (state.released) {
      status.textContent = 'Release day is here.';
      clearInterval(interval);
    }
    return state.released;
  }
  if (!update()) interval = setInterval(update, 1000);
  root.document.addEventListener('visibilitychange', update);
})(typeof window === 'undefined' ? globalThis : window);
