(function () {
  'use strict';

  var nav     = document.getElementById('siteNav');
  var toggle  = document.getElementById('navToggle');
  var mobile  = document.getElementById('navMobile');
  var mClose  = document.getElementById('navMobileClose');

  // Transparent → solid on scroll (homepage — pages with .solid skip this)
  if (nav && !nav.classList.contains('solid')) {
    window.addEventListener('scroll', function () {
      nav.classList.toggle('scrolled', window.scrollY > 20);
    }, { passive: true });
  }

  function openMobile() {
    if (!mobile) return;
    mobile.classList.add('open');
    mobile.setAttribute('aria-hidden', 'false');
    if (toggle) toggle.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeMobile() {
    if (!mobile) return;
    mobile.classList.remove('open');
    mobile.setAttribute('aria-hidden', 'true');
    if (toggle) toggle.classList.remove('open');
    document.body.style.overflow = '';
  }

  if (toggle) toggle.addEventListener('click', openMobile);
  if (mClose) mClose.addEventListener('click', closeMobile);

  if (mobile) {
    mobile.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', closeMobile);
    });
  }

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeMobile();
  });
})();
