/**
 * BlendMHS Video Player - Plyr Configuration
 * Provides custom keyboard controls and action overlay feedback
 */

(function() {
  'use strict';

  // Initialize when DOM is ready
  document.addEventListener('DOMContentLoaded', function() {

    // Find all Plyr video elements
    const videoElements = document.querySelectorAll('.plyr-video');
    if (videoElements.length === 0) return;

    // Initialize each Plyr instance
    const players = [];
    videoElements.forEach(function(videoEl, index) {
      const player = new Plyr(videoEl, {
        controls: [
          'play-large',
          'play',
          'progress',
          'current-time',
          'mute',
          'volume',
          'captions',
          'settings',
          'pip',
          'airplay',
          'fullscreen'
        ],
        settings: ['captions', 'quality', 'speed'],
        speed: { selected: 1, options: [0.5, 0.75, 1, 1.25, 1.5, 2] },
        keyboard: {
          focused: true,
          global: false  // Disable global to use custom handler
        },
        tooltips: { controls: true, seek: true },
        seekTime: 1  // Default 1 second seek
      });
      players.push(player);
    });

    // Use the first player for keyboard controls (or could be extended for multiple)
    const plyrPlayer = players[0];

    // Hotkeys modal functionality
    const hotkeysModalOverlay = document.getElementById('hotkeys-modal-overlay');
    const hotkeysHelpBtn = document.getElementById('hotkeys-help-btn');
    const hotkeysModalClose = document.getElementById('hotkeys-modal-close');

    function showHotkeysModal() {
      if (hotkeysModalOverlay) {
        hotkeysModalOverlay.classList.add('visible');
      }
    }

    function hideHotkeysModal() {
      if (hotkeysModalOverlay) {
        hotkeysModalOverlay.classList.remove('visible');
      }
    }

    // Show modal when clicking help button
    if (hotkeysHelpBtn) {
      hotkeysHelpBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        showHotkeysModal();
      });
    }

    // Close modal when clicking close button
    if (hotkeysModalClose) {
      hotkeysModalClose.addEventListener('click', hideHotkeysModal);
    }

    // Close modal when clicking overlay background
    if (hotkeysModalOverlay) {
      hotkeysModalOverlay.addEventListener('click', function(e) {
        if (e.target === hotkeysModalOverlay) {
          hideHotkeysModal();
        }
      });
    }

    // Get overlay element
    const actionOverlay = document.getElementById('plyr-action-overlay');
    let actionIcon, actionText, overlayTimeout;

    if (actionOverlay) {
      actionIcon = actionOverlay.querySelector('.action-icon');
      actionText = actionOverlay.querySelector('.action-text');
    }

    // Function to show action overlay
    function showActionOverlay(icon, text, type) {
      if (!actionOverlay) return;

      // Clear any existing timeout
      clearTimeout(overlayTimeout);

      // Remove all type classes
      actionOverlay.classList.remove('seek-forward', 'seek-backward', 'speed-change', 'volume-change', 'playback');

      // Add the appropriate type class
      if (type) {
        actionOverlay.classList.add(type);
      }

      // Set content
      if (actionIcon) actionIcon.textContent = icon;
      if (actionText) actionText.textContent = text;

      // Show overlay
      actionOverlay.classList.add('visible');

      // Hide after delay
      overlayTimeout = setTimeout(function() {
        actionOverlay.classList.remove('visible');
      }, 800);
    }

    // Custom keyboard handler for Plyr with Shift modifier support
    document.addEventListener('keydown', function(e) {
      // Ignore if typing in an input field
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

      // Handle hotkeys modal toggle
      if (e.key === '?' || (e.shiftKey && e.key === '/')) {
        e.preventDefault();
        if (hotkeysModalOverlay && hotkeysModalOverlay.classList.contains('visible')) {
          hideHotkeysModal();
        } else {
          showHotkeysModal();
        }
        return;
      }

      // Close modal with Escape
      if (e.key === 'Escape' && hotkeysModalOverlay && hotkeysModalOverlay.classList.contains('visible')) {
        e.preventDefault();
        hideHotkeysModal();
        return;
      }

      // Don't process other keys if modal is open
      if (hotkeysModalOverlay && hotkeysModalOverlay.classList.contains('visible')) return;

      // Don't process if no player
      if (!plyrPlayer) return;

      var seekSmall = 1;   // 1 second for arrow keys
      var seekLarge = 10;  // 10 seconds for Shift + arrow keys
      var speedOptions = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];

      switch(e.key) {
        case 'ArrowLeft':
          e.preventDefault();
          e.stopPropagation();
          if (e.ctrlKey) {
            // Decrease playback speed
            var currentSpeedIndexL = speedOptions.indexOf(plyrPlayer.speed);
            if (currentSpeedIndexL > 0) {
              plyrPlayer.speed = speedOptions[currentSpeedIndexL - 1];
              showActionOverlay('🏃', plyrPlayer.speed + 'x Speed', 'speed-change');
            }
          } else {
            // Seek backward
            var seekAmountL = e.shiftKey ? seekLarge : seekSmall;
            plyrPlayer.rewind(seekAmountL);
            showActionOverlay('⏪', '-' + seekAmountL + 's', 'seek-backward');
          }
          break;
        case 'ArrowRight':
          e.preventDefault();
          e.stopPropagation();
          if (e.ctrlKey) {
            // Increase playback speed
            var currentSpeedIndexR = speedOptions.indexOf(plyrPlayer.speed);
            if (currentSpeedIndexR < speedOptions.length - 1) {
              plyrPlayer.speed = speedOptions[currentSpeedIndexR + 1];
              showActionOverlay('🏃', plyrPlayer.speed + 'x Speed', 'speed-change');
            }
          } else {
            // Seek forward
            var seekAmountR = e.shiftKey ? seekLarge : seekSmall;
            plyrPlayer.forward(seekAmountR);
            showActionOverlay('⏩', '+' + seekAmountR + 's', 'seek-forward');
          }
          break;
        case ' ':
        case 'k':
        case 'K':
          e.preventDefault();
          plyrPlayer.togglePlay();
          if (plyrPlayer.playing) {
            showActionOverlay('▶️', 'Play', 'playback');
          } else {
            showActionOverlay('⏸️', 'Paused', 'playback');
          }
          break;
        case 'm':
        case 'M':
          e.preventDefault();
          plyrPlayer.muted = !plyrPlayer.muted;
          if (plyrPlayer.muted) {
            showActionOverlay('🔇', 'Muted', 'volume-change');
          } else {
            showActionOverlay('🔊', 'Volume ' + Math.round(plyrPlayer.volume * 100) + '%', 'volume-change');
          }
          break;
        case 'f':
        case 'F':
          e.preventDefault();
          plyrPlayer.fullscreen.toggle();
          break;
        case 'ArrowUp':
          e.preventDefault();
          plyrPlayer.volume = Math.min(1, plyrPlayer.volume + 0.1);
          showActionOverlay('🔊', 'Volume ' + Math.round(plyrPlayer.volume * 100) + '%', 'volume-change');
          break;
        case 'ArrowDown':
          e.preventDefault();
          plyrPlayer.volume = Math.max(0, plyrPlayer.volume - 0.1);
          var volIcon = plyrPlayer.volume === 0 ? '🔇' : '🔉';
          showActionOverlay(volIcon, 'Volume ' + Math.round(plyrPlayer.volume * 100) + '%', 'volume-change');
          break;
      }
    });
  });
})();
