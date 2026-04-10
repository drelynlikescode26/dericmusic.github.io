/**
 * Hero Refresh Module
 *
 * Minimal hero interactions:
 * - Portal card click handlers (Listen, Watch)
 * - Email capture modal (Formspree, localStorage)
 * - Auto-popup after 4s on first visit
 * - Latest Release dismiss with localStorage
 */

(function() {
  'use strict';

  const FEATURED_RELEASE_KEY = 'hideLatestRelease';
  const FEATURED_RELEASE_EXPIRE = 86400000; // 24 hours
  const TAPPED_IN_KEY = 'deric_tapped_in';   // 'subscribed' | 'dismissed'
  const FORMSPREE_ENDPOINT = 'https://formspree.io/f/xjgpwpyv';

  let lastFocusedElement = null;

  function init() {
    setupPortalCards();
    setupEmailCapture();
    setupFeaturedReleaseDismiss();
    setupMicroStory();
    preventHashNavigation();
    setupEscapeHandler();
    setupAutoPopup();
  }

  function setupPortalCards() {
    const listenCard = document.getElementById('open-listen-portal');
    if (listenCard) {
      listenCard.addEventListener('click', (e) => {
        e.preventDefault();
        if (window.ListenPortal && typeof window.ListenPortal.open === 'function') {
          trackEvent('listen_open');
          window.ListenPortal.open();
        }
      });
    }

    const watchCard = document.getElementById('open-watch-portal');
    if (watchCard) {
      watchCard.addEventListener('click', (e) => {
        e.preventDefault();
        if (window.WatchPortal && typeof window.WatchPortal.open === 'function') {
          trackEvent('watch_open');
          window.WatchPortal.open();
        }
      });
    }
  }

  function setupEmailCapture() {
    const openEmail  = document.getElementById('open-email');
    const emailModal = document.getElementById('emailModal');
    const closeEmail = document.getElementById('close-email');
    const emailCard  = document.querySelector('.email-card');
    const form       = document.getElementById('heroEmailForm');
    const input      = document.getElementById('heroEmailInput');
    const success    = document.getElementById('emailSuccess');
    const copy       = document.querySelector('.email-copy');

    if (!openEmail || !emailModal || !closeEmail || !form || !input) return;

    // Manual "Stay tapped in" button always works
    openEmail.addEventListener('click', () => {
      trackEvent('email_open');
      openModal(emailModal, input);
    });

    // Close button — mark dismissed so auto-popup won't re-fire
    closeEmail.addEventListener('click', () => {
      markDismissed();
      closeModal(emailModal);
    });

    emailModal.addEventListener('click', (e) => {
      if (e.target === emailModal) {
        markDismissed();
        closeModal(emailModal);
      }
    });

    if (emailCard) {
      emailCard.addEventListener('click', (e) => e.stopPropagation());
    }

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = input.value.trim();
      if (!email || !validateEmail(email)) return;

      const submitBtn = form.querySelector('button[type="submit"]');
      if (submitBtn) submitBtn.disabled = true;

      const formData = new FormData();
      formData.append('email', email);
      formData.append('_subject', 'New subscriber — dericmusic.com');

      fetch(FORMSPREE_ENDPOINT, {
        method: 'POST',
        body: formData,
        headers: { 'Accept': 'application/json' }
      })
      .then((res) => {
        if (res.ok) {
          // Mark as subscribed — never auto-show again
          localStorage.setItem(TAPPED_IN_KEY, 'subscribed');
          trackEvent('email_submit');
          input.value = '';
          if (copy) copy.classList.add('is-hidden');
          form.classList.add('is-hidden');
          if (success) {
            success.hidden = false;
            success.classList.add('is-visible');
          }
          setTimeout(() => {
            if (success) {
              success.classList.remove('is-visible');
              success.hidden = true;
            }
            form.classList.remove('is-hidden');
            if (copy) copy.classList.remove('is-hidden');
            closeModal(emailModal);
          }, 2000);
        } else {
          throw new Error('Network response not ok');
        }
      })
      .catch(() => {
        // Fallback: still show success locally so UX isn't broken
        if (copy) copy.textContent = 'Something went wrong. Email contact@deric-music.com directly.';
      })
      .finally(() => {
        if (submitBtn) submitBtn.disabled = false;
      });
    });
  }

  // Auto-popup: show after 4s on first visit, never if already subscribed/dismissed
  function setupAutoPopup() {
    if (localStorage.getItem(TAPPED_IN_KEY)) return;

    const emailModal = document.getElementById('emailModal');
    const closeEmail = document.getElementById('close-email');
    const input      = document.getElementById('heroEmailInput');
    if (!emailModal) return;

    setTimeout(() => {
      // Only show if nothing else is open
      if (!document.body.classList.contains('portal-open')) {
        trackEvent('email_autopop');
        openModal(emailModal, input);
      }
    }, 4000);
  }

  function markDismissed() {
    localStorage.setItem(TAPPED_IN_KEY, 'dismissed');
  }

  function setupMicroStory() {
    const microStory = document.getElementById('microStory');
    if (!microStory) return;

    const raw   = microStory.getAttribute('data-lines') || '';
    const lines = raw.split('|').map((l) => l.trim()).filter(Boolean);
    const lineEl = microStory.querySelector('.micro-story-line');
    if (!lineEl || lines.length === 0) return;

    let index = 0;
    const rotate = () => {
      index = (index + 1) % lines.length;
      lineEl.classList.remove('is-visible');
      setTimeout(() => {
        lineEl.textContent = lines[index];
        lineEl.classList.add('is-visible');
      }, 300);
    };

    setInterval(rotate, 3600);
  }

  function setupFeaturedReleaseDismiss() {
    const dismissBtn     = document.getElementById('dismiss-featured-release');
    const featuredRelease = document.getElementById('featuredRelease');

    if (!dismissBtn || !featuredRelease) return;

    if (isReleaseDismissed()) {
      featuredRelease.classList.add('hidden');
    }

    dismissBtn.addEventListener('click', () => {
      localStorage.setItem(FEATURED_RELEASE_KEY, JSON.stringify({
        hidden: true,
        timestamp: Date.now()
      }));
      featuredRelease.classList.add('hidden');
    });
  }

  function isReleaseDismissed() {
    try {
      const data = localStorage.getItem(FEATURED_RELEASE_KEY);
      if (!data) return false;
      const parsed = JSON.parse(data);
      if (Date.now() - parsed.timestamp > FEATURED_RELEASE_EXPIRE) {
        localStorage.removeItem(FEATURED_RELEASE_KEY);
        return false;
      }
      return parsed.hidden === true;
    } catch (e) {
      return false;
    }
  }

  function openModal(modal, focusTarget) {
    lastFocusedElement = document.activeElement;
    modal.hidden = false;
    modal.classList.add('is-open');
    document.body.classList.add('portal-open');
    requestAnimationFrame(() => {
      if (focusTarget) focusTarget.focus();
    });
  }

  function closeModal(modal) {
    modal.classList.remove('is-open');
    modal.hidden = true;
    document.body.classList.remove('portal-open');
    if (lastFocusedElement) lastFocusedElement.focus();
  }

  function setupEscapeHandler() {
    document.addEventListener('keydown', (e) => {
      if (e.key !== 'Escape') return;
      const emailModal = document.getElementById('emailModal');
      if (emailModal && !emailModal.hidden) {
        markDismissed();
        closeModal(emailModal);
      }
    });
  }

  function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  function trackEvent(name) {
    if (typeof window.plausible === 'function') window.plausible(name);
  }

  function preventHashNavigation() {
    document.addEventListener('click', (e) => {
      const target = e.target.closest('a[href^="#"]');
      if (target) e.preventDefault();
    }, true);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  window.HeroRefresh = {
    dismissRelease: () => {
      const btn = document.getElementById('dismiss-featured-release');
      if (btn) btn.click();
    }
  };
})();
