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

    function open() {
      previousFocus = document.activeElement;
      status.textContent = '';
      status.className = 'email-status';
      modal.hidden = false;
      modal.classList.add('is-open');
      document.body.classList.add('portal-open');
      input.focus();
    }

    function close() {
      modal.classList.remove('is-open');
      modal.hidden = true;
      document.body.classList.remove('portal-open');
      if (previousFocus) previousFocus.focus();
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

      const focusable = [closeButton, input, form.querySelector('button[type="submit"]')];
      if (event.shiftKey && document.activeElement === focusable[0]) {
        event.preventDefault();
        focusable[2].focus();
      } else if (!event.shiftKey && document.activeElement === focusable[2]) {
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
