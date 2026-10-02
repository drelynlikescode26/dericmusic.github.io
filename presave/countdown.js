(() => {
  'use strict';
  const target = Date.parse('2026-10-09T00:00:00-04:00');
  const clock = document.querySelector('.countdown');
  const released = document.querySelector('.released');
  const button = document.querySelector('.primary');
  const fields = ['days', 'hours', 'minutes', 'seconds'].map(name => document.querySelector(`[data-time="${name}"]`));
  function update() {
    const total = Math.max(0, Math.floor((target - Date.now()) / 1000));
    clock.hidden = total === 0;
    released.hidden = total > 0;
    if (total === 0) {
      button.querySelector('.button-label').textContent = 'OPEN THE TAPE';
      document.querySelector('.handoff').textContent = 'Continue to Hypeddit for the release.';
      return;
    }
    [Math.floor(total / 86400), Math.floor(total / 3600) % 24, Math.floor(total / 60) % 60, total % 60]
      .forEach((value, i) => { fields[i].textContent = String(value).padStart(2, '0'); });
  }
  update();
  setInterval(update, 1000);
  document.addEventListener('visibilitychange', () => { if (!document.hidden) update(); });
})();
