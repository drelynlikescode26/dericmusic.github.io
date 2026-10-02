/** Public MailerLite embed. No API credential belongs in this file. */
(function () {
  'use strict';
  const signup = document.querySelector('[data-newsletter]');
  if (!signup) return;
  const embed = signup.querySelector('.ml-embedded');
  const fallback = signup.querySelector('[data-newsletter-fallback]');
  const status = signup.querySelector('[data-newsletter-status]');
  let ready = false;
  const requiredScripts = new Set([
    'https://groot.mailerlite.com/js/w/webforms.min.js',
    'https://assets.mlcdn.com/ml/ajax/libs/jquery/3.7.1/jquery.min.js',
    'https://static.mailerlite.com/js/w/ml_jQuery.inputmask.bundle.min.js'
  ]);
  const loadedScripts = new Set();
  let vendorFailed = false;
  const watchedScripts = new WeakSet();
  let timer;

  function unavailable() {
    if (ready) return;
    status.textContent = 'The signup form could not load. You can send an email request below.';
    fallback.open = true;
  }
  function checkReady() {
    if (loadedScripts.size !== requiredScripts.size || vendorFailed || !embed.querySelector('form')) return;
    ready = true;
    clearTimeout(timer);
    observer.disconnect();
    scriptObserver.disconnect();
    status.textContent = '';
    // Do not hide a fallback someone has already started using.
    if (!fallback.contains(document.activeElement) && !fallback.querySelector('input[type="email"]').value) {
      fallback.open = false;
    }
  }
  function watchVendorScript() {
    // The official template and its scripts add dependencies to document.head. Observe
    // native load/error events without interfering with MailerLite submission.
    for (const script of document.head.querySelectorAll('script[src]')) {
      const url = new URL(script.src, document.baseURI);
      const asset = url.origin + url.pathname;
      if (!requiredScripts.has(asset) || watchedScripts.has(script)) continue;
      watchedScripts.add(script);
      script.addEventListener('load', function () {
        loadedScripts.add(asset);
        checkReady();
      }, { once: true });
      script.addEventListener('error', function () {
        vendorFailed = true;
        clearTimeout(timer);
        unavailable();
      }, { once: true });
    }
  }
  const observer = new MutationObserver(checkReady);
  observer.observe(embed, { childList: true, subtree: true });
  const scriptObserver = new MutationObserver(watchVendorScript);
  scriptObserver.observe(document.head, { childList: true, subtree: true });
  watchVendorScript();
  status.textContent = 'Loading signup form…';
  timer = setTimeout(unavailable, 12000);

  // Official universal queue/loader, once per document. MailerLite owns submission.
  if (!document.getElementById('mailerlite-universal')) {
    window.ml = window.ml || function () {
      (window.ml.q = window.ml.q || []).push(arguments);
    };
    window.ml('account', '2674520');
    const loader = document.createElement('script');
    loader.id = 'mailerlite-universal';
    loader.async = true;
    loader.src = 'https://assets.mailerlite.com/js/universal.js';
    loader.addEventListener('error', unavailable);
    document.head.appendChild(loader);
  }
  checkReady();
})();
