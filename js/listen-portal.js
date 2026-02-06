/**
 * Listen Portal Module
 * 
 * Premium fullscreen overlay modal for listening to latest release
 * Fetches data from /data/latestRelease.json and displays with platform links
 */

(function() {
  'use strict';

  // Configuration
  const DATA_URL = './data/latestRelease.json';
  
  // State
  let portalData = null;
  let focusedElementBeforeModal = null;
  
  // DOM Elements
  let elements = {
    overlay: null,
    card: null,
    closeBtn: null,
    cover: null,
    title: null,
    date: null,
    spotifyBtn: null,
    appleBtn: null,
    allBtn: null,
  };

  /**
   * Initialize the portal
   */
  function init() {
    // Get DOM elements
    elements.overlay = document.getElementById('listen-portal');
    elements.card = document.querySelector('.listen-portal-card');
    elements.closeBtn = document.querySelector('.listen-portal-close');
    elements.cover = document.getElementById('portal-cover');
    elements.title = document.getElementById('portal-title');
    elements.date = document.getElementById('portal-date');
    elements.spotifyBtn = document.getElementById('portal-btn-spotify');
    elements.appleBtn = document.getElementById('portal-btn-apple');
    elements.allBtn = document.getElementById('portal-btn-all');

    if (!elements.overlay) {
      console.warn('Listen Portal not found in DOM');
      return;
    }

    // Wire up event listeners
    setupEventListeners();
    
    // Load data
    loadPortalData();
  }

  /**
   * Setup all event listeners
   */
  function setupEventListeners() {
    // Close button
    if (elements.closeBtn) {
      elements.closeBtn.addEventListener('click', closePortal);
    }

    // Click outside to close
    elements.overlay.addEventListener('click', handleOverlayClick);

    // ESC key to close
    document.addEventListener('keydown', handleEscapeKey);

    // Prevent card clicks from closing
    if (elements.card) {
      elements.card.addEventListener('click', (e) => {
        e.stopPropagation();
      });
    }
  }

  /**
   * Handle overlay click (close if clicked outside card)
   */
  function handleOverlayClick(e) {
    if (e.target === elements.overlay) {
      closePortal();
    }
  }

  /**
   * Handle ESC key press
   */
  function handleEscapeKey(e) {
    if (e.key === 'Escape' && isPortalOpen()) {
      closePortal();
    }
  }

  /**
   * Check if portal is currently open
   */
  function isPortalOpen() {
    return elements.overlay && elements.overlay.classList.contains('active');
  }

  /**
   * Format date based on precision
   */
  function formatDate(dateString, precision) {
    try {
      const date = new Date(dateString);
      
      if (precision === 'year') {
        return date.getFullYear().toString();
      } else if (precision === 'month') {
        return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      } else {
        // day precision
        return date.toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric', 
          year: 'numeric' 
        });
      }
    } catch (e) {
      return dateString; // Fallback to original string
    }
  }

  /**
   * Load portal data from JSON
   */
  async function loadPortalData() {
    try {
      const response = await fetch(DATA_URL);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      portalData = await response.json();
      
      // Validate required fields
      if (!portalData.title || !portalData.spotifyUrl) {
        throw new Error('Invalid release data');
      }

      console.log('✅ Listen Portal data loaded');
    } catch (error) {
      console.error('Failed to load Listen Portal data:', error);
      portalData = null;
    }
  }

  /**
   * Update portal UI with data
   */
  function updatePortalUI() {
    if (!portalData) {
      console.error('No portal data available');
      return;
    }

    // Update cover art
    if (elements.cover && portalData.coverArt) {
      elements.cover.src = portalData.coverArt;
      elements.cover.alt = portalData.title;
    }

    // Update title
    if (elements.title) {
      elements.title.textContent = portalData.title;
    }

    // Update date
    if (elements.date && portalData.releaseDate) {
      const formattedDate = formatDate(
        portalData.releaseDate, 
        portalData.releaseDatePrecision || 'day'
      );
      elements.date.textContent = formattedDate;
    }

    // Update Spotify button
    if (elements.spotifyBtn && portalData.spotifyUrl) {
      elements.spotifyBtn.href = portalData.spotifyUrl;
      elements.spotifyBtn.hidden = false;
    }

    // Update Apple Music button
    if (elements.appleBtn) {
      if (portalData.appleMusicUrl) {
        elements.appleBtn.href = portalData.appleMusicUrl;
        elements.appleBtn.hidden = false;
      } else {
        elements.appleBtn.hidden = true;
      }
    }

    // Update All Platforms button
    if (elements.allBtn) {
      if (portalData.albumLink) {
        elements.allBtn.href = portalData.albumLink;
        elements.allBtn.hidden = false;
      } else {
        elements.allBtn.hidden = true;
      }
    }
  }

  /**
   * Open the portal
   */
  function openPortal() {
    if (!elements.overlay || !portalData) {
      console.warn('Cannot open portal: missing data or DOM element');
      return;
    }

    // Store currently focused element
    focusedElementBeforeModal = document.activeElement;

    // Update UI with latest data
    updatePortalUI();

    // Prevent body scroll
    document.body.classList.add('portal-open');

    // Show overlay
    elements.overlay.hidden = false;
    elements.overlay.setAttribute('aria-modal', 'true');
    elements.overlay.setAttribute('role', 'dialog');
    
    // Trigger reflow for animation
    void elements.overlay.offsetHeight;
    
    // Add active class
    elements.overlay.classList.add('active');

    // Focus on close button
    setTimeout(() => {
      if (elements.closeBtn) {
        elements.closeBtn.focus();
      }
    }, 100);

    // Setup focus trap
    setupFocusTrap();
  }

  /**
   * Close the portal
   */
  function closePortal() {
    if (!elements.overlay) return;

    // Remove active class
    elements.overlay.classList.remove('active');

    // After animation, hide and restore scroll
    setTimeout(() => {
      elements.overlay.hidden = true;
      elements.overlay.removeAttribute('aria-modal');
      elements.overlay.removeAttribute('role');
      document.body.classList.remove('portal-open');

      // Restore focus
      if (focusedElementBeforeModal) {
        focusedElementBeforeModal.focus();
      }
    }, 300);
  }

  /**
   * Setup focus trap to keep focus within modal
   */
  function setupFocusTrap() {
    const focusableElements = elements.card.querySelectorAll(
      'button:not([hidden]), a[href]:not([hidden]), [tabindex]:not([tabindex="-1"])'
    );
    
    const firstFocusable = focusableElements[0];
    const lastFocusable = focusableElements[focusableElements.length - 1];

    function trapFocus(e) {
      if (!isPortalOpen()) {
        document.removeEventListener('keydown', trapFocus);
        return;
      }

      if (e.key === 'Tab') {
        if (e.shiftKey) {
          // Shift + Tab
          if (document.activeElement === firstFocusable) {
            e.preventDefault();
            lastFocusable.focus();
          }
        } else {
          // Tab
          if (document.activeElement === lastFocusable) {
            e.preventDefault();
            firstFocusable.focus();
          }
        }
      }
    }

    document.addEventListener('keydown', trapFocus);
  }

  /**
   * Public API
   */
  window.ListenPortal = {
    open: openPortal,
    close: closePortal,
    refresh: loadPortalData,
  };

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
