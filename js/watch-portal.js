/**
 * Watch Portal Module
 * 
 * Reliable video viewer for GitHub Pages static hosting.
 * Uses curated videos.json instead of YouTube API.
 */

(function() {
  'use strict';

  const VIDEOS_URL = './data/videos.json';
  const YOUTUBE_THUMBNAIL_URL = 'https://i.ytimg.com/vi/{VIDEO_ID}/hqdefault.jpg';
  const YOUTUBE_EMBED_URL = 'https://www.youtube-nocookie.com/embed/{VIDEO_ID}?autoplay=1&rel=0';

  let portal = null;
  let playerWrapper = null;
  let thumbnailsTrack = null;
  let videos = [];
  let currentVideoIndex = 0;
  let lastFocusedElement = null;

  /**
   * Initialize Watch Portal
   */
  function init() {
    createPortalHTML();
    cacheElements();
    attachEventListeners();
  }

  /**
   * Create portal HTML structure
   */
  function createPortalHTML() {
    const portalHTML = `
      <div class="watch-portal" id="watchPortal">
        <div class="watch-portal-container">
          <button class="watch-portal-close" id="watchPortalClose" aria-label="Close Watch Portal">✕</button>
          
          <div class="watch-player-area">
            <div class="watch-player-wrapper" id="watchPlayerWrapper">
              <div class="watch-player-loading">Select a video to watch</div>
            </div>
          </div>
          
          <div class="watch-thumbnails">
            <button class="watch-nav-arrow watch-nav-prev" id="watchNavPrev" aria-label="Previous videos">‹</button>
            <div class="watch-thumbnails-track" id="watchThumbnailsTrack"></div>
            <button class="watch-nav-arrow watch-nav-next" id="watchNavNext" aria-label="Next videos">›</button>
          </div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', portalHTML);
  }

  /**
   * Cache DOM elements
   */
  function cacheElements() {
    portal = document.getElementById('watchPortal');
    playerWrapper = document.getElementById('watchPlayerWrapper');
    thumbnailsTrack = document.getElementById('watchThumbnailsTrack');
  }

  /**
   * Attach event listeners
   */
  function attachEventListeners() {
    const closeBtn = document.getElementById('watchPortalClose');
    const prevBtn = document.getElementById('watchNavPrev');
    const nextBtn = document.getElementById('watchNavNext');

    if (closeBtn) {
      closeBtn.addEventListener('click', close);
    }

    if (prevBtn) {
      prevBtn.addEventListener('click', () => scrollThumbnails(-1));
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', () => scrollThumbnails(1));
    }

    // Close on overlay click
    portal.addEventListener('click', (e) => {
      if (e.target === portal) close();
    });

    // Close on ESC key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && portal.classList.contains('active')) {
        close();
      }
    });

    // Update arrow visibility on scroll
    thumbnailsTrack.addEventListener('scroll', updateArrowStates);
  }

  /**
   * Open Watch Portal
   */
  async function open() {
    lastFocusedElement = document.activeElement;
    
    portal.style.display = 'flex';
    requestAnimationFrame(() => {
      portal.classList.add('active');
    });

    document.body.classList.add('portal-open');
    document.body.style.overflow = 'hidden';

    // Load videos if not already loaded
    if (videos.length === 0) {
      await loadVideos();
    }
  }

  /**
   * Close Watch Portal
   */
  function close() {
    portal.classList.remove('active');
    
    setTimeout(() => {
      portal.style.display = 'none';
      clearPlayer();
    }, 400);

    document.body.classList.remove('portal-open');
    document.body.style.overflow = '';

    if (lastFocusedElement) {
      lastFocusedElement.focus();
    }
  }

  /**
   * Load videos from JSON
   */
  async function loadVideos() {
    showLoadingSkeleton();

    try {
      const response = await fetch(VIDEOS_URL);
      
      if (!response.ok) {
        throw new Error('Failed to load videos');
      }

      const data = await response.json();
      videos = data.videos || [];

      if (videos.length === 0) {
        showError('No videos available');
        return;
      }

      renderThumbnails();
      updateArrowStates();

    } catch (error) {
      console.error('Error loading videos:', error);
      showError('Unable to load videos. <a href="https://youtube.com/@envyderic" target="_blank" rel="noopener noreferrer">Visit YouTube</a>');
    }
  }

  /**
   * Show loading skeleton
   */
  function showLoadingSkeleton() {
    thumbnailsTrack.innerHTML = `
      <div class="watch-thumbnails-skeleton">
        ${Array(5).fill(0).map(() => `
          <div class="watch-thumbnail-skeleton">
            <div class="watch-thumbnail-skeleton-image"></div>
          </div>
        `).join('')}
      </div>
    `;
  }

  /**
   * Render video thumbnails
   */
  function renderThumbnails() {
    thumbnailsTrack.innerHTML = videos.map((video, index) => {
      const thumbnailUrl = YOUTUBE_THUMBNAIL_URL.replace('{VIDEO_ID}', video.id);
      
      return `
        <div class="watch-thumbnail ${index === currentVideoIndex ? 'active' : ''}" data-index="${index}">
          <div class="watch-thumbnail-image">
            <img src="${thumbnailUrl}" alt="${video.title}" loading="lazy">
          </div>
          <div class="watch-thumbnail-title">${video.title}</div>
        </div>
      `;
    }).join('');

    // Attach click handlers
    const thumbnails = thumbnailsTrack.querySelectorAll('.watch-thumbnail');
    thumbnails.forEach((thumb, index) => {
      thumb.addEventListener('click', () => playVideo(index));
    });
  }

  /**
   * Play video by index
   */
  function playVideo(index) {
    if (index < 0 || index >= videos.length) return;

    currentVideoIndex = index;
    const video = videos[index];

    // Update active thumbnail
    const thumbnails = thumbnailsTrack.querySelectorAll('.watch-thumbnail');
    thumbnails.forEach((thumb, i) => {
      thumb.classList.toggle('active', i === index);
    });

    // Load video in iframe
    const embedUrl = YOUTUBE_EMBED_URL.replace('{VIDEO_ID}', video.id);
    playerWrapper.innerHTML = `
      <iframe 
        src="${embedUrl}"
        allow="autoplay; encrypted-media; picture-in-picture"
        allowfullscreen
        title="${video.title}">
      </iframe>
    `;

    // Scroll thumbnail into view
    const activeThumbnail = thumbnails[index];
    if (activeThumbnail) {
      activeThumbnail.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
  }

  /**
   * Clear player
   */
  function clearPlayer() {
    playerWrapper.innerHTML = '<div class="watch-player-loading">Select a video to watch</div>';
  }

  /**
   * Show error message
   */
  function showError(message) {
    playerWrapper.innerHTML = `
      <div class="watch-player-error">
        <p>${message}</p>
        <a href="https://youtube.com/@envyderic" target="_blank" rel="noopener noreferrer" class="watch-player-error-btn">
          Visit YouTube Channel
        </a>
      </div>
    `;

    thumbnailsTrack.innerHTML = '';
  }

  /**
   * Scroll thumbnails
   */
  function scrollThumbnails(direction) {
    const scrollAmount = 220; // thumbnail width + gap
    thumbnailsTrack.scrollBy({
      left: direction * scrollAmount,
      behavior: 'smooth'
    });
  }

  /**
   * Update arrow button states
   */
  function updateArrowStates() {
    const prevBtn = document.getElementById('watchNavPrev');
    const nextBtn = document.getElementById('watchNavNext');

    if (!prevBtn || !nextBtn) return;

    const isAtStart = thumbnailsTrack.scrollLeft <= 0;
    const isAtEnd = thumbnailsTrack.scrollLeft + thumbnailsTrack.clientWidth >= thumbnailsTrack.scrollWidth - 1;

    prevBtn.classList.toggle('disabled', isAtStart);
    nextBtn.classList.toggle('disabled', isAtEnd);
  }

  /**
   * Initialize on DOM ready
   */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  /**
   * Public API
   */
  window.WatchPortal = {
    open,
    close
  };
})();
