/* Count the About and Press stats once they enter the viewport. */
(function () {
  'use strict';

  const counters = Array.from(document.querySelectorAll('.stat-counter[data-target]'));
  const row = document.querySelector('.stats-row');
  if (!row || !counters.length) return;

  const targets = counters.map(function (counter) {
    return {
      element: counter,
      value: Number(counter.dataset.target),
      suffix: counter.dataset.suffix || ''
    };
  });
  if (targets.some(function (item) { return !Number.isFinite(item.value); })) return;

  function showFinalValues() {
    targets.forEach(function (item) {
      item.element.textContent = item.value + item.suffix;
    });
  }

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    showFinalValues();
    return;
  }

  let started = false;
  function start() {
    if (started) return;
    started = true;

    const duration = 1800;
    let startTime;
    targets.forEach(function (item) {
      item.element.textContent = '0' + item.suffix;
    });

    function frame(timestamp) {
      if (startTime === undefined) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      targets.forEach(function (item) {
        item.element.textContent = Math.round(item.value * eased) + item.suffix;
      });
      if (progress < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(function (entries) {
      if (entries.some(function (entry) { return entry.isIntersecting; })) {
        observer.disconnect();
        start();
      }
    }, { threshold: 0.2 });
    observer.observe(row);
  } else {
    start();
  }
})();
