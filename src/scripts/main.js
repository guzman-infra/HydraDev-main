import { Navigation } from '../components/Navigation.js';
import { ThemeToggle } from '../components/ThemeToggle.js';
import { PortfolioSection } from '../sections/PortfolioSection.js';
import { ParallaxBackground } from '../components/ParallaxBackground.js';

const addMediaQueryListener = (query, handler) => {
  if (!query || typeof handler !== 'function') {
    return;
  }

  if (typeof query.addEventListener === 'function') {
    query.addEventListener('change', handler);
  } else if (typeof query.addListener === 'function') {
    query.addListener(handler);
  }
};

class Hydra404App {
  constructor() {
    this.heroStage = document.querySelector('.hero-logo-stage');
    this.floatingSigils = document.querySelectorAll('.floating-sigil');
    this.throttledHandleHeroPointer = null;
    this.animateObserver = null;
    this.gifObserver = null;
    this.lazyGifContainers = [];
    this.modalGifContainers = [];
    const hasMatchMedia = typeof window.matchMedia === 'function';
    this.prefersReducedMotionQuery = hasMatchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : null;
    this.prefersReducedMotion = this.prefersReducedMotionQuery?.matches ?? false;
    this.pointerFineQuery = hasMatchMedia ? window.matchMedia('(pointer: fine)') : null;
    this.emailModal = document.getElementById('emailModal');
    this.emailTriggers = document.querySelectorAll('[data-email-trigger]');
    this.emailCloseButton = this.emailModal?.querySelector('[data-email-close]');
    this.locationModal = document.getElementById('locationModal');
    this.locationTriggers = document.querySelectorAll('[data-location-trigger]');
    this.locationCloseButton = this.locationModal?.querySelector('[data-location-close]');
    this.locationMapFrame = this.locationModal?.querySelector('iframe[data-map-src]');
    this.cursorDot = null;
    this.cursorRing = null;
    this.cursorHoldTimeout = null;
    this.cursorTarget = { x: 0, y: 0 };
    this.cursorRafId = null;
    this.parallax = null;
    this.parallaxMediaQuery = null;

    addMediaQueryListener(this.pointerFineQuery, this.handlePointerPreferenceChange);
    addMediaQueryListener(this.prefersReducedMotionQuery, this.handleMotionPreferenceChange);

    this.init();
  }

  init() {
    document.body.classList.add('js-enabled');
    new Navigation();
    new ThemeToggle();
    this.portfolio = new PortfolioSection();

    // Background asset resolution removed - using pure CSS with media queries
    this.setupParallax();
    this.setupHeroInteractions();
    this.setupIntersectionAnimations();
    this.setupBackgroundMedia();
    this.setupCustomCursor();
    this.setupEmailModal();
    this.setupLocationModal();
    document.addEventListener('hydra:modal-open', this.handleModalOpen);
    document.addEventListener('hydra:modal-close', this.handleModalClose);
    document.addEventListener('visibilitychange', this.handleVisibilityChange);
  }

  // Removed resolveBackgroundAsset() - now using CSS media queries for responsive background

  setupParallax() {
    if (this.prefersReducedMotion) {
      this.teardownParallax();
      return;
    }

    if (typeof window.matchMedia !== 'function') {
      return;
    }

    if (!this.parallaxMediaQuery) {
      this.parallaxMediaQuery = window.matchMedia('(orientation: landscape) and (min-width: 768px)');
      addMediaQueryListener(this.parallaxMediaQuery, this.handleParallaxPreferenceChange);
    }

    if (this.parallaxMediaQuery.matches) {
      if (!this.parallax) {
        this.parallax = new ParallaxBackground();
      }
    } else {
      this.teardownParallax();
    }
  }

  teardownParallax() {
    if (this.parallax) {
      this.parallax.destroy();
      this.parallax = null;
    }
  }

  handleParallaxPreferenceChange = (event) => {
    if (this.prefersReducedMotion) {
      this.teardownParallax();
      return;
    }

    if (event.matches) {
      if (!this.parallax) {
        this.parallax = new ParallaxBackground();
      }
    } else {
      this.teardownParallax();
    }
  };

  setupHeroInteractions() {
    if (!this.heroStage || !this.floatingSigils.length) {
      return;
    }

    this.disableHeroInteractions();

    const hasFinePointer = this.pointerFineQuery?.matches ?? !('ontouchstart' in window);
    if (this.prefersReducedMotion || !hasFinePointer) {
      return;
    }

    // Throttled hero pointer handler for better performance
    this.lastHeroUpdate = 0;
    this.throttledHandleHeroPointer = (event) => {
      const now = Date.now();
      if (now - this.lastHeroUpdate >= 16) {
        this.handleHeroPointer(event);
        this.lastHeroUpdate = now;
      }
    };

    this.heroStage.addEventListener('pointermove', this.throttledHandleHeroPointer, { passive: true });
    this.heroStage.addEventListener('pointerleave', this.resetHeroSigils);
    this.heroStage.addEventListener('touchmove', this.throttledHandleHeroPointer, { passive: true });
    this.heroStage.addEventListener('touchend', this.resetHeroSigils);
  }

  disableHeroInteractions = () => {
    if (!this.heroStage) {
      return;
    }

    if (this.throttledHandleHeroPointer) {
      this.heroStage.removeEventListener('pointermove', this.throttledHandleHeroPointer);
      this.heroStage.removeEventListener('touchmove', this.throttledHandleHeroPointer);
      this.throttledHandleHeroPointer = null;
    }

    this.heroStage.removeEventListener('pointerleave', this.resetHeroSigils);
    this.heroStage.removeEventListener('touchend', this.resetHeroSigils);
    this.resetHeroSigils();
  };

  handleHeroPointer = (event) => {
    const point = this.getPointerPosition(event);
    if (!point || !this.heroStage) {
      return;
    }

    this.floatingSigils.forEach((sigil) => {
      sigil.classList.add('is-paused');
      const bounds = this.heroStage.getBoundingClientRect();
      const rect = sigil.getBoundingClientRect();
      const sigilX = rect.left - bounds.left + rect.width / 2;
      const sigilY = rect.top - bounds.top + rect.height / 2;

      const dx = sigilX - point.x;
      const dy = sigilY - point.y;
      const distance = Math.hypot(dx, dy) || 1;
      const repelRadius = Number(sigil.dataset.floatDepth) || 32;

      if (distance < repelRadius) {
        const force = (repelRadius - distance) / repelRadius;
        const maxOffset = 28 + force * 18;
        const offsetX = (dx / distance) * maxOffset;
        const offsetY = (dy / distance) * maxOffset;
        sigil.style.transform = `translate(${offsetX}px, ${offsetY}px)`;
      } else {
        sigil.style.transform = 'translate(0, 0)';
      }
    });
  };

  resetHeroSigils = () => {
    this.floatingSigils.forEach((sigil) => {
      sigil.classList.remove('is-paused');
      sigil.style.transform = 'translate(0, 0)';
    });
  };

  getPointerPosition(event) {
    if (!this.heroStage) {
      return null;
    }

    const bounds = this.heroStage.getBoundingClientRect();
    if (event.touches && event.touches.length) {
      const touch = event.touches[0];
      return {
        x: touch.clientX - bounds.left,
        y: touch.clientY - bounds.top
      };
    }

    return {
      x: event.clientX - bounds.left,
      y: event.clientY - bounds.top
    };
  }

  setupIntersectionAnimations() {
    this.animateObserver = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.18, rootMargin: '0px 0px -10% 0px' }
    );

    this.observeAnimateTargets();
    document.addEventListener('hydra:animate-refresh', this.observeAnimateTargets);
  }

  observeAnimateTargets = () => {
    if (!this.animateObserver) {
      return;
    }

    const targets = document.querySelectorAll('[data-animate]:not(.is-visible)');
    targets.forEach((element) => this.animateObserver.observe(element));
  };

  setupBackgroundMedia() {
    if (this.prefersReducedMotion) {
      document.querySelectorAll('[data-gif]').forEach((container) => {
        const src = container.dataset.gif;
        if (src) {
          container.style.backgroundImage = `url(${src})`;
          container.dataset.loaded = 'true';
        }
      });
      return;
    }

    const containers = document.querySelectorAll('[data-gif]');
    if (!containers.length) {
      return;
    }

    this.lazyGifContainers = [];
    this.modalGifContainers = [];

    containers.forEach((container) => {
      container.style.backgroundImage = '';
      container.dataset.loaded = 'false';
    });

    this.gifObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const container = entry.target;
          if (!(container instanceof HTMLElement)) {
            return;
          }

          if (entry.isIntersecting) {
            this.ensureGifLoaded(container);
          } else if (!container.closest('.modal')) {
            this.suspendGif(container, true);
          }
        });
      },
      { rootMargin: '0px 0px 200px 0px', threshold: 0.05 }
    );

    containers.forEach((container) => {
      if (container.closest('.modal')) {
        this.modalGifContainers.push(container);
      } else {
        this.lazyGifContainers.push(container);
        this.gifObserver?.observe(container);
      }
    });
  }

  ensureGifLoaded(container) {
    if (this.prefersReducedMotion || !container) {
      return;
    }

    if (container.dataset.loaded === 'true') {
      return;
    }

    const src = container.dataset.gif;
    if (!src) {
      return;
    }

    container.style.backgroundImage = `url(${src})`;
    container.dataset.loaded = 'true';
  }

  suspendGif(container, forceRemove = false) {
    if (!container) {
      return;
    }

    if (forceRemove) {
      container.style.backgroundImage = '';
      container.dataset.loaded = 'false';
    }
  }

  handleModalMedia(modal, shouldPlay) {
    if (!modal || this.prefersReducedMotion) {
      return;
    }

    const container = modal.querySelector('[data-gif]');
    if (!container) {
      return;
    }

    if (shouldPlay) {
      this.ensureGifLoaded(container);
    } else {
      this.suspendGif(container, true);
    }
  }

  handleModalOpen = (event) => {
    this.handleModalMedia(event.detail?.modal || null, true);
  };

  handleModalClose = (event) => {
    this.handleModalMedia(event.detail?.modal || null, false);
  };

  handleVisibilityChange = () => {
    const allContainers = [...this.lazyGifContainers, ...this.modalGifContainers];
    if (!allContainers.length) {
      return;
    }

    if (document.hidden) {
      allContainers.forEach((container) => this.suspendGif(container, true));
      return;
    }

    allContainers.forEach((container) => {
      const parentModal = container.closest('.modal');
      const modalVisible = !parentModal || parentModal.style.display === 'block';

      if (!modalVisible) {
        this.suspendGif(container, true);
        return;
      }

      if (this.isElementInViewport(container)) {
        this.ensureGifLoaded(container);
      } else if (!parentModal) {
        this.suspendGif(container, true);
      }
    });
  };

  handlePointerPreferenceChange = (event) => {
    if (event.matches) {
      this.setupHeroInteractions();
    } else {
      this.disableHeroInteractions();
    }
  };

  handleMotionPreferenceChange = (event) => {
    this.prefersReducedMotion = event.matches;

    if (this.prefersReducedMotion) {
      this.teardownParallax();
      this.disableHeroInteractions();
    } else {
      this.setupParallax();
      this.setupHeroInteractions();
    }
  };

  isElementInViewport(element) {
    const rect = element.getBoundingClientRect();
    return rect.bottom > 0 && rect.top < window.innerHeight;
  }

  setupCustomCursor() {
    if (!window.matchMedia('(pointer: fine)').matches) {
      return;
    }

    document.body.classList.add('cursor-enabled');

    this.cursorRing = document.createElement('div');
    this.cursorRing.className = 'custom-cursor custom-cursor--ring';
    this.cursorDot = document.createElement('div');
    this.cursorDot.className = 'custom-cursor custom-cursor--dot';

    this.cursorRing.classList.add('is-hidden');
    this.cursorDot.classList.add('is-hidden');

    document.body.append(this.cursorRing, this.cursorDot);

    window.addEventListener('pointermove', this.handleCursorMove, { passive: true });
    window.addEventListener('pointerdown', this.handleCursorDown);
    window.addEventListener('pointerup', this.handleCursorUp);
    window.addEventListener('pointerleave', this.handleCursorLeave);
    window.addEventListener('pointerenter', this.handleCursorEnter);
    window.addEventListener('pointercancel', this.clearCursorHold);
  }

  handleCursorMove = (event) => {
    this.cursorTarget.x = event.clientX;
    this.cursorTarget.y = event.clientY;
    this.requestCursorUpdate();
    this.cursorDot?.classList.remove('is-hidden');
    this.cursorRing?.classList.remove('is-hidden');
  };

  handleCursorDown = () => {
    this.setCursorState('click');
    this.cursorHoldTimeout = window.setTimeout(() => {
      this.setCursorState('hold');
    }, 400);
  };

  handleCursorUp = () => {
    this.clearCursorHold();
  };

  handleCursorLeave = () => {
    this.clearCursorHold();
    this.cursorDot?.classList.add('is-hidden');
    this.cursorRing?.classList.add('is-hidden');
  };

  handleCursorEnter = () => {
    this.cursorDot?.classList.remove('is-hidden');
    this.cursorRing?.classList.remove('is-hidden');
    this.requestCursorUpdate();
  };

  requestCursorUpdate() {
    if (this.cursorRafId) {
      return;
    }

    this.cursorRafId = requestAnimationFrame(() => {
      const transform = `translate3d(${this.cursorTarget.x}px, ${this.cursorTarget.y}px, 0)`;
      if (this.cursorDot) {
        this.cursorDot.style.transform = transform;
      }
      if (this.cursorRing) {
        this.cursorRing.style.transform = transform;
      }
      this.cursorRafId = null;
    });
  }

  setCursorState(state) {
    if (!this.cursorDot || !this.cursorRing) {
      return;
    }

    this.cursorDot.classList.remove('is-click', 'is-hold');
    this.cursorRing.classList.remove('is-click', 'is-hold');

    if (state === 'click') {
      this.cursorDot.classList.add('is-click');
      this.cursorRing.classList.add('is-click');
    }

    if (state === 'hold') {
      this.cursorDot.classList.add('is-hold');
      this.cursorRing.classList.add('is-hold');
    }
  }

  clearCursorHold = () => {
    if (this.cursorHoldTimeout) {
      clearTimeout(this.cursorHoldTimeout);
      this.cursorHoldTimeout = null;
    }
    if (this.cursorDot && this.cursorRing) {
      this.cursorDot.classList.remove('is-click', 'is-hold');
      this.cursorRing.classList.remove('is-click', 'is-hold');
    }
  };

  setupEmailModal() {
    if (!this.emailModal) {
      return;
    }

    const openModal = () => {
      this.emailModal.style.display = 'block';
      document.body.style.overflow = 'hidden';
      this.emailModal.setAttribute('aria-hidden', 'false');
      this.emailModal.focus({ preventScroll: true });
      this.handleModalMedia(this.emailModal, true);
    };

    const closeModal = () => {
      this.emailModal.style.display = 'none';
      document.body.style.overflow = '';
      this.emailModal.setAttribute('aria-hidden', 'true');
      this.handleModalMedia(this.emailModal, false);
    };

    this.emailTriggers.forEach((trigger) => {
      trigger.addEventListener('click', openModal);
      trigger.addEventListener('keyup', (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          openModal();
        }
      });
    });

    this.emailModal.addEventListener('click', (event) => {
      if (event.target === this.emailModal) {
        closeModal();
      }
    });

    this.emailCloseButton?.addEventListener('click', closeModal);

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && this.emailModal.style.display === 'block') {
        closeModal();
      }
    });
  }

  setupLocationModal() {
    if (!this.locationModal || !this.locationTriggers.length) {
      return;
    }

    const openModal = () => {
      this.locationModal.style.display = 'block';
      document.body.style.overflow = 'hidden';
      this.locationModal.setAttribute('aria-hidden', 'false');
      this.locationModal.focus({ preventScroll: true });
      this.handleModalMedia(this.locationModal, true);
      if (this.locationMapFrame && !this.locationMapFrame.getAttribute('src')) {
        this.locationMapFrame.src = this.locationMapFrame.dataset.mapSrc;
      }
    };

    const closeModal = () => {
      this.locationModal.style.display = 'none';
      document.body.style.overflow = '';
      this.locationModal.setAttribute('aria-hidden', 'true');
      this.handleModalMedia(this.locationModal, false);
    };

    this.locationTriggers.forEach((trigger) => {
      trigger.addEventListener('click', openModal);
      trigger.addEventListener('keyup', (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          openModal();
        }
      });
    });

    this.locationModal.addEventListener('click', (event) => {
      if (event.target === this.locationModal) {
        closeModal();
      }
    });

    this.locationCloseButton?.addEventListener('click', closeModal);

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && this.locationModal.style.display === 'block') {
        closeModal();
      }
    });
  }

  patchExternalLinks() {
    const links = document.querySelectorAll('a[target="_blank"]');
    links.forEach((link) => {
      link.setAttribute('rel', 'noopener noreferrer');
    });
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new Hydra404App();
});
