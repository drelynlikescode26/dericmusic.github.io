/**
 * Hero Refresh Module
 * 
 * Minimal hero interactions:
 * - Portal card click handlers (Listen, Watch)
 * - Email capture modal
 * - Latest Release dismiss with localStorage
 */

(function() {
  'use strict';

  const FEATURED_RELEASE_KEY = 'hideLatestRelease';
  const FEATURED_RELEASE_EXPIRE = 86400000; // 24 hours in milliseconds
  
  let lastFocusedElement = null;

  /**
   * Initialize hero interactions
   */
  function init() {
    setupPortalCards();
    setupEmailCapture();
    setupFeaturedReleaseDismiss();
    setupMicroStory();
    preventHashNavigation();
    setupEscapeHandler();
  }

  /**
   * Setup portal card click handlers
   */
  function setupPortalCards() {
    // Listen portal
    const listenCard = document.getElementById('open-listen-portal');
    if (listenCard) {
      listenCard.addEventListener('click', (e) => {
        e.preventDefault();
        if (window.ListenPortal && typeof window.ListenPortal.open === 'function') {
          trackEvent('listen_open');
          window.ListenPortal.open();
        } else {
          console.warn('Listen Portal not available');
        }
      });
    }

    // Watch portal - uses new WatchPortal module
    const watchCard = document.getElementById('open-watch-portal');
    if (watchCard) {
      watchCard.addEventListener('click', (e) => {
        e.preventDefault();
        if (window.WatchPortal && typeof window.WatchPortal.open === 'function') {
          trackEvent('watch_open');
          window.WatchPortal.open();
        } else {
          console.error('[HERO] Watch Portal not available');
        }
      });
    }
  }

  /**
   * Setup email capture modal
   */
  function setupEmailCapture() {
    const openEmail = document.getElementById('open-email');
    const emailModal = document.getElementById('emailModal');
    const closeEmail = document.getElementById('close-email');
    const emailCard = document.querySelector('.email-card');
    const form = document.getElementById('heroEmailForm');
    const input = document.getElementById('heroEmailInput');
    const success = document.getElementById('emailSuccess');
    const copy = document.querySelector('.email-copy');

    if (!openEmail || !emailModal || !closeEmail || !form || !input) return;

    openEmail.addEventListener('click', () => {
      trackEvent('email_open');
      openModal(emailModal, closeEmail);
    });

    closeEmail.addEventListener('click', () => closeModal(emailModal));

    emailModal.addEventListener('click', (e) => {
      if (e.target === emailModal) closeModal(emailModal);
    });

    if (emailCard) {
      emailCard.addEventListener('click', (e) => e.stopPropagation());
    }

    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const email = input.value.trim();

      if (email && validateEmail(email)) {
        trackEvent('email_submit');
        console.log('Email captured:', email);
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
        }, 1600);
      }
    });
  }

  /**
   * Setup micro story rotating lines
   */
  function setupMicroStory() {
    const microStory = document.getElementById('microStory');
    if (!microStory) return;

    const raw = microStory.getAttribute('data-lines') || '';
    const lines = raw.split('|').map((line) => line.trim()).filter(Boolean);
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

  /**
   * Setup Latest Release dismiss with localStorage
   */
  function setupFeaturedReleaseDismiss() {
    const dismissBtn = document.getElementById('dismiss-featured-release');
    const featuredRelease = document.getElementById('featuredRelease');

    if (!dismissBtn || !featuredRelease) return;

    // Check if release is hidden based on localStorage
    if (isReleaseDismissed()) {
      featuredRelease.classList.add('hidden');
    }

    dismissBtn.addEventListener('click', () => {
      // Store hide flag with timestamp
      const data = {
        hidden: true,
        timestamp: Date.now()
      };
      localStorage.setItem(FEATURED_RELEASE_KEY, JSON.stringify(data));
      
      // Hide the element
      featuredRelease.classList.add('hidden');
    });
  }

  /**
   * Check if featured release should be hidden
   * Auto-resets after 24 hours
   */
  function isReleaseDismissed() {
    try {
      const data = localStorage.getItem(FEATURED_RELEASE_KEY);
      if (!data) return false;

      const parsed = JSON.parse(data);
      const now = Date.now();
      const timeSinceDismiss = now - parsed.timestamp;

      // If more than 24 hours have passed, reset the flag
      if (timeSinceDismiss > FEATURED_RELEASE_EXPIRE) {
        localStorage.removeItem(FEATURED_RELEASE_KEY);
        return false;
      }

      return parsed.hidden === true;
    } catch (e) {
      console.warn('Error reading dismiss state:', e);
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
    if (lastFocusedElement) {
      lastFocusedElement.focus();
    }
  }

  function trackEvent(name) {
    if (typeof window.plausible === 'function') {
      window.plausible(name);
    } else {
      console.log('[TRACK]', name);
    }
  }

  function setupEscapeHandler() {
    document.addEventListener('keydown', (e) => {
      if (e.key !== 'Escape') return;
      const emailModal = document.getElementById('emailModal');
      if (emailModal && !emailModal.hidden) closeModal(emailModal);
    });
  }

  /**
   * Simple email validation
   */
  function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  }

  /**
   * Prevent hash navigation and scroll jumps
   */
  function preventHashNavigation() {
    document.addEventListener('click', (e) => {
      const target = e.target.closest('a[href^="#"]');
      if (target) {
        e.preventDefault();
      }
    }, true);
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Public API
  window.HeroRefresh = {
    dismissRelease: () => {
      const btn = document.getElementById('dismiss-featured-release');
      if (btn) btn.click();
    }
  };
})();
