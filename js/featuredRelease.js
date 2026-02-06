/**
 * Featured Release Module
 * 
 * Fetches and displays the latest release from /data/latestRelease.json
 * Updates DOM elements with release information
 */

(function() {
  'use strict';

  // Configuration
  const DATA_URL = '/data/latestRelease.json';
  const CACHE_KEY = 'featured_release_cache';
  const CACHE_DURATION = 3600000; // 1 hour in milliseconds

  // DOM Elements
  let elements = {};

  /**
   * Initialize the module
   */
  function init() {
    // Get DOM elements
    elements = {
      container: document.getElementById('featuredRelease'),
      cover: document.getElementById('featured-cover'),
      title: document.getElementById('featured-title'),
      date: document.getElementById('featured-date'),
      mood: document.getElementById('featured-mood'),
      listenBtn: document.getElementById('featured-listen'),
    };

    // Check if featured release section exists
    if (!elements.container) {
      console.warn('Featured Release section not found in DOM');
      return;
    }

    // Load release data
    loadRelease();
  }

  /**
   * Get cached release data
   */
  function getCachedRelease() {
    try {
      const cache = localStorage.getItem(CACHE_KEY);
      if (!cache) return null;

      const { timestamp, data } = JSON.parse(cache);
      const now = Date.now();

      if (now - timestamp < CACHE_DURATION) {
        return data;
      }
      return null;
    } catch (e) {
      console.warn('Could not read cached release data');
      return null;
    }
  }

  /**
   * Cache release data
   */
  function cacheRelease(data) {
    try {
      const cache = {
        timestamp: Date.now(),
        data: data,
      };
      localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
    } catch (e) {
      console.warn('Could not cache release data');
    }
  }

  /**
   * Format release date based on precision
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
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      }
    } catch (e) {
      return dateString; // Fallback to original string
    }
  }

  /**
   * Update DOM with release data
   */
  function updateDOM(release) {
    // Update cover art
    if (elements.cover && release.coverArt) {
      elements.cover.src = release.coverArt;
      elements.cover.alt = release.title;
    }

    // Update title
    if (elements.title) {
      elements.title.textContent = release.title;
    }

    // Update date
    if (elements.date && release.releaseDate) {
      const formattedDate = formatDate(release.releaseDate, release.releaseDatePrecision);
      elements.date.textContent = formattedDate;
    }

    // Update mood line (if exists)
    if (elements.mood) {
      if (release.moodLine && release.moodLine.trim() !== '') {
        elements.mood.textContent = release.moodLine;
        elements.mood.style.display = 'block';
      } else {
        elements.mood.style.display = 'none';
      }
    }

    // Update listen button
    if (elements.listenBtn && release.spotifyUrl) {
      elements.listenBtn.href = release.spotifyUrl;
    }

    // Show the section
    if (elements.container) {
      elements.container.classList.add('loaded');
    }
  }

  /**
   * Handle fetch error
   */
  function handleError(error) {
    console.error('Failed to load featured release:', error);
    
    // Try to use cached data as fallback
    const cached = getCachedRelease();
    if (cached) {
      console.log('Using cached release data as fallback');
      updateDOM(cached);
    } else {
      // Hide the section or show fallback UI
      if (elements.container) {
        elements.container.classList.add('error');
        // Optionally hide it entirely:
        // elements.container.style.display = 'none';
      }
    }
  }

  /**
   * Load release data from JSON file
   */
  async function loadRelease() {
    try {
      // Check cache first
      const cached = getCachedRelease();
      if (cached) {
        updateDOM(cached);
        // Still fetch fresh data in background
        fetchAndUpdate();
        return;
      }

      // No cache, fetch immediately
      await fetchAndUpdate();
    } catch (error) {
      handleError(error);
    }
  }

  /**
   * Fetch fresh data and update UI
   */
  async function fetchAndUpdate() {
    try {
      const response = await fetch(DATA_URL);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      
      // Validate data
      if (!data.title || !data.spotifyUrl) {
        throw new Error('Invalid release data');
      }

      // Cache and update
      cacheRelease(data);
      updateDOM(data);
    } catch (error) {
      handleError(error);
    }
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Expose refresh method globally (optional)
  window.FeaturedRelease = {
    refresh: loadRelease,
  };
})();
