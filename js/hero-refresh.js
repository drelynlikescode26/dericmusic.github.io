/** Homepage email signup. The form is opened only when a visitor asks for it. */
(function () {
  'use strict';

  function init() {
    const openButton = document.getElementById('open-email');
    const modal = document.getElementById('emailModal');
    const closeButton = document.getElementById('close-email');
    const form = document.getElementById('heroEmailForm');
    const input = document.getElementById('heroEmailInput');
    const status = document.getElementById('emailStatus');
    if (!openButton || !modal || !closeButton || !form || !input || !status) return;

    let previousFocus = null;
    let restoreTimer;

    function restoreViewport() {
      if (!modal.hidden) return;
      // Safari can retain the keyboard's document offset after the field blurs.
      window.scrollTo(0, 0);
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    }
    function scheduleRestore() {
      if (!modal.hidden) return;
      requestAnimationFrame(restoreViewport);
      clearTimeout(restoreTimer);
      restoreTimer = setTimeout(restoreViewport, 350);
    }
    window.addEventListener('resize', scheduleRestore, { passive: true });
    window.addEventListener('pageshow', scheduleRestore);
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', scheduleRestore, { passive: true });
    }

    function focusableControls() {
      return Array.from(modal.querySelectorAll('button, input, select, textarea, a[href], summary, [tabindex]'))
        .filter((element) => !element.disabled && element.tabIndex >= 0 && element.getClientRects().length)
        .filter((element) => {
          const details = element.closest('details:not([open])');
          return (!details || element === details.querySelector('summary')) && getComputedStyle(element).visibility !== 'hidden';
        });
    }

    function open() {
      previousFocus = document.activeElement;
      status.textContent = '';
      status.className = 'email-status';
      modal.hidden = false;
      modal.classList.add('is-open');
      document.body.classList.add('portal-open');
      // Focus a control without opening the iOS keyboard or triggering input zoom.
      closeButton.focus({ preventScroll: true });
    }

    function close() {
      if (modal.contains(document.activeElement)) document.activeElement.blur();
      modal.classList.remove('is-open');
      modal.hidden = true;
      document.body.classList.remove('portal-open');
      if (previousFocus) previousFocus.focus({ preventScroll: true });
      scheduleRestore();
    }

    openButton.addEventListener('click', open);
    closeButton.addEventListener('click', close);
    modal.addEventListener('click', function (event) {
      if (event.target === modal) close();
    });
    document.addEventListener('keydown', function (event) {
      if (modal.hidden) return;
      if (event.key === 'Escape') close();
      if (event.key !== 'Tab') return;

      const focusable = focusableControls();
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === focusable[0]) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        focusable[0].focus();
      }
    });

    form.addEventListener('submit', async function (event) {
      event.preventDefault();
      if (!form.reportValidity()) return;

      const submitButton = form.querySelector('button[type="submit"]');
      submitButton.disabled = true;
      status.className = 'email-status';
      status.textContent = 'Sending…';

      try {
        const response = await fetch(form.action, {
          method: 'POST',
          body: new FormData(form),
          headers: { Accept: 'application/json' }
        });
        if (!response.ok) throw new Error('Signup failed');
        form.reset();
        status.classList.add('success');
        status.textContent = 'Thanks. We received your email.';
      } catch (error) {
        status.classList.add('error');
        status.textContent = 'Could not send your email. Please try again.';
      } finally {
        submitButton.disabled = false;
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
