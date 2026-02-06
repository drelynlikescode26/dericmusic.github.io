/**
 * Watch Portal Module (Simplified Carousel)
 * 
 * Handles the existing watch-mode-overlay with carousel layout.
 * Loads videos from data/videos.json.
 * Zero dependencies, 100% reliable on GitHub Pages.
 */

(function() {
  'use strict';

  // ========== CONFIGURATION ==========
  const CONFIG = {
    videoJsonUrl: './data/videos.json',
    youtubeEmbed: 'https://www.youtube-nocookie.com/embed',
    youtubeThumb: 'https://i.ytimg.com/vi',
  };

  // ========== STATE ==========
  let watchState = {
    isActive: false,
    isLoaded: false,
    currentIndex: 0,
    totalVideos: 0,
    videos: [],
    videoModal: null,
  };

  // ========== DOM ELEMENTS ==========
  const elements = {
    button: null,
    overlay: null,
    content: null,
    closeBtn: null,
    carousel: null,
    arrowLeft: null,
    arrowRight: null,
    loading: null,
  };

  // ========== INITIALIZATION ==========
  function init() {
    console.log('[WATCH] Initializing Watch Portal...');
    
    cacheElements();
    
    if (!validateElements()) {
      console.error('[WATCH] Missing critical elements. Aborting.');
      return false;
    }

    attachEventListeners();
    console.log('[WATCH] Watch Portal ready.');
    
    // Expose API globally
    window.WatchPortal = {
      open: open,
      close: close,
    };

    return true;
  }

  // ========== ELEMENT CACHING ==========
  function cacheElements() {
    elements.button = document.getElementById('open-watch-portal');
    elements.overlay = document.getElementById('watchModeOverlay');
    elements.content = document.getElementById('watchModeContent');
    elements.closeBtn = document.getElementById('watchModeClose');
    elements.carousel = document.getElementById('watchCarousel');
    elements.arrowLeft = document.getElementById('watchArrowLeft');
    elements.arrowRight = document.getElementById('watchArrowRight');
    elements.loading = elements.overlay?.querySelector('.watch-loading');

    console.log('[WATCH] Elements cached:', {
      button: !!elements.button,
      overlay: !!elements.overlay,
      carousel: !!elements.carousel,
      closeBtn: !!elements.closeBtn,
      arrowLeft: !!elements.arrowLeft,
      arrowRight: !!elements.arrowRight,
    });
  }

  // ========== VALIDATION ==========
  function validateElements() {
    const required = ['button', 'overlay', 'carousel', 'closeBtn'];
    const missing = required.filter(key => !elements[key]);

    if (missing.length > 0) {
      console.error('[WATCH] Missing elements:', missing);
      return false;
    }

    return true;
  }

  // ========== EVENT LISTENERS ==========
  function attachEventListeners() {
    // Button click → open overlay
    if (elements.button) {
      elements.button.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        console.log('[WATCH] Button clicked');
        open();
      });
    }

    // Close button
    if (elements.closeBtn) {
      elements.closeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        console.log('[WATCH] Close button clicked');
        close();
      });
    }

    // Click outside content to close
    if (elements.overlay) {
      elements.overlay.addEventListener('click', (e) => {
        if (e.target === elements.overlay) {
          console.log('[WATCH] Overlay background clicked');
          close();
        }
      });
    }

    // Arrow navigation
    if (elements.arrowLeft) {
      elements.arrowLeft.addEventListener('click', (e) => {
        e.stopPropagation();
        if (watchState.currentIndex > 0) {
          scrollToVideo(watchState.currentIndex - 1);
        }
      });
    }

    if (elements.arrowRight) {
      elements.arrowRight.addEventListener('click', (e) => {
        e.stopPropagation();
        if (watchState.currentIndex < watchState.totalVideos - 1) {
          scrollToVideo(watchState.currentIndex + 1);
        }
      });
    }

    // ESC key
    document.addEventListener('keydown', (e) => {
      if ((e.key === 'Escape' || e.key === 'Esc') && watchState.isActive) {
        // Close video modal first if open
        if (watchState.videoModal?.classList.contains('active')) {
          closeVideoModal();
        } else {
          close();
        }
      }
    });
  }

  // ========== MAIN FUNCTIONS ==========
  async function open() {
    console.log('[WATCH] Opening Watch Portal...');

    if (!watchState.isLoaded) {
      console.log('[WATCH] Loading videos for first time...');
      await loadVideos();
    }

    watchState.isActive = true;
    elements.overlay.hidden = false;
    elements.overlay.classList.add('active');
    document.body.style.overflow = 'hidden';

    console.log('[WATCH] Watch Portal opened. Videos loaded:', watchState.totalVideos);
  }

  function close() {
    console.log('[WATCH] Closing Watch Portal...');

    watchState.isActive = false;
    elements.overlay.classList.remove('active');
    elements.overlay.hidden = true;
    document.body.style.overflow = '';

    // Close video modal if open
    if (watchState.videoModal?.classList.contains('active')) {
      closeVideoModal();
    }
  }

  // ========== VIDEO LOADING ==========
  async function loadVideos() {
    try {
      console.log('[WATCH] Fetching videos from:', CONFIG.videoJsonUrl);

      const response = await fetch(CONFIG.videoJsonUrl);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      watchState.videos = data.videos || [];

      if (watchState.videos.length === 0) {
        throw new Error('No videos in JSON');
      }

      console.log('[WATCH] Videos loaded:', watchState.videos.length);
      renderVideos();
      watchState.isLoaded = true;
    } catch (error) {
      console.error('[WATCH] Failed to load videos:', error.message);
      renderErrorState(error.message);
    }
  }

  // ========== RENDERING ==========
  function renderVideos() {
    console.log('[WATCH] Rendering', watchState.videos.length, 'videos...');

    elements.carousel.innerHTML = '';
    watchState.totalVideos = watchState.videos.length;
    watchState.currentIndex = 0;

    watchState.videos.forEach((video, index) => {
      const card = createVideoCard(video);
      elements.carousel.appendChild(card);
    });

    // Hide loading indicator
    if (elements.loading) {
      elements.loading.style.display = 'none';
    }

    updateArrowState();
    console.log('[WATCH] Rendered', watchState.totalVideos, 'video cards');
  }

  function createVideoCard(video) {
    const card = document.createElement('div');
    card.className = 'video-card';

    const thumbnail = `${CONFIG.youtubeThumb}/${video.id}/hqdefault.jpg`;

    card.innerHTML = `
      <div class="video-thumbnail">
        <img src="${thumbnail}" alt="${video.title}" loading="lazy">
        <div class="video-play-overlay">
          <div class="play-icon"></div>
        </div>
      </div>
    `;

    card.addEventListener('click', () => {
      console.log('[WATCH] Video clicked:', video.id, video.title);
      openVideoModal(video.id);
    });

    return card;
  }

  function renderErrorState(message) {
    console.error('[WATCH] Rendering error state:', message);

    elements.carousel.innerHTML = `
      <div class="watch-error">
        <div>Unable to load videos</div>
        <div style="font-size: 0.9em; opacity: 0.7; margin-top: 0.5rem;">
          ${message}
        </div>
      </div>
    `;

    if (elements.loading) {
      elements.loading.style.display = 'none';
    }
  }

  // ========== CAROUSEL NAVIGATION ==========
  function updateArrowState() {
    if (!elements.arrowLeft || !elements.arrowRight) return;

    const isFirstVideo = watchState.currentIndex === 0;
    const isLastVideo = watchState.currentIndex >= watchState.totalVideos - 1;

    elements.arrowLeft.style.opacity = isFirstVideo ? '0.3' : '1';
    elements.arrowLeft.style.pointerEvents = isFirstVideo ? 'none' : 'auto';

    elements.arrowRight.style.opacity = isLastVideo ? '0.3' : '1';
    elements.arrowRight.style.pointerEvents = isLastVideo ? 'none' : 'auto';
  }

  function scrollToVideo(index) {
    console.log('[WATCH] Scrolling to video', index);

    const cards = elements.carousel.querySelectorAll('.video-card');
    if (!cards[index]) return;

    watchState.currentIndex = index;
    cards[index].scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    updateArrowState();
  }

  // ========== VIDEO MODAL ==========
  function createVideoModal() {
    if (watchState.videoModal) return;

    console.log('[WATCH] Creating video modal...');

    const modal = document.createElement('div');
    modal.className = 'video-modal';
    modal.innerHTML = `
      <div class="video-modal-content">
        <button class="video-modal-close" aria-label="Close video">✕</button>
        <iframe
          id="videoPlayer"
          frameborder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowfullscreen
        ></iframe>
      </div>
    `;

    document.body.appendChild(modal);

    // Close on background click
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        closeVideoModal();
      }
    });

    // Close button
    modal.querySelector('.video-modal-close')?.addEventListener('click', closeVideoModal);

    watchState.videoModal = modal;
  }

  function openVideoModal(videoId) {
    console.log('[WATCH] Opening video modal:', videoId);

    createVideoModal();

    const iframe = watchState.videoModal.querySelector('#videoPlayer');
    const embedUrl = `${CONFIG.youtubeEmbed}/${videoId}?autoplay=1&rel=0`;

    iframe.src = embedUrl;
    watchState.videoModal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeVideoModal() {
    if (!watchState.videoModal) return;

    console.log('[WATCH] Closing video modal');

    const iframe = watchState.videoModal.querySelector('#videoPlayer');
    iframe.src = '';
    watchState.videoModal.classList.remove('active');
    document.body.style.overflow = 'hidden'; // Keep hidden since overlay is still open
  }

  // ========== STARTUP ==========
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
