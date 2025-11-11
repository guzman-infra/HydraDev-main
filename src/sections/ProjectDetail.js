const HOVER_OPEN_DELAY = 160;

function dispatchModalEvent(type, modal) {
  const eventName = type === 'open' ? 'hydra:modal-open' : 'hydra:modal-close';
  document.dispatchEvent(new CustomEvent(eventName, { detail: { modal } }));
}

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const supportsHover = window.matchMedia('(hover: hover)').matches;

const DEFAULT_IMAGE_PLACEHOLDER = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="600" height="360" viewBox="0 0 600 360"%3E%3Cdefs%3E%3ClinearGradient id="a" x1="0%25" x2="100%25" y1="0%25" y2="100%25"%3E%3Cstop offset="0%25" stop-color="%2303f0ff" stop-opacity="0.25"/%3E%3Cstop offset="100%25" stop-color="%2303f0ff" stop-opacity="0.05"/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width="600" height="360" fill="%23040a18"/%3E%3Cpath d="M96 72h408c9.941 0 18 8.059 18 18v180c0 9.941-8.059 18-18 18H96c-9.941 0-18-8.059-18-18V90c0-9.941 8.059-18 18-18z" fill="url(%23a)" stroke="%2303f0ff" stroke-opacity="0.18" stroke-width="2" stroke-dasharray="12 12"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="Inter, sans-serif" font-size="24" letter-spacing="3" fill="%2303f0ff" fill-opacity="0.65"%3EPENDIENTE DE CARGAR RECURSO%3C/text%3E%3C/svg%3E';

function resolveAssetBase() {
  const backgroundBase = document.body.dataset.backgroundBase || '';
  if (!backgroundBase) {
    return 'assets/fondos/';
  }
  return backgroundBase.replace(/fondo-gral.*$/i, '');
}

function getModalGifPath() {
  return `${resolveAssetBase()}fondo-modal.gif`;
}

function createVideoElement(item, { autoplay = true, controls = false } = {}) {
  const video = document.createElement('video');
  video.className = controls ? 'project-media-modal__video' : 'project-media-video';
  video.playsInline = true;
  video.loop = autoplay;
  video.muted = autoplay;
  video.autoplay = autoplay && !prefersReducedMotion;
  video.preload = prefersReducedMotion ? 'metadata' : 'auto';
  video.controls = controls;
  if (item.poster) {
    video.poster = item.poster;
  }
  if (item.src) {
    const source = document.createElement('source');
    source.src = item.src;
    const type = item.src.split('?')[0].split('.').pop();
    if (type) {
      source.type = `video/${type}`;
    }
    video.appendChild(source);
  }
  video.addEventListener('error', () => {
    video.replaceWith(createFallbackMessage(item));
  });
  return video;
}

function createImageElement(item, className = 'project-media-image') {
  const img = document.createElement('img');
  img.className = className;
  img.loading = 'lazy';
  img.decoding = 'async';
  img.src = item.src || DEFAULT_IMAGE_PLACEHOLDER;
  img.alt = item.title || '';
  if (!item.src) {
    img.dataset.placeholder = 'true';
  }
  img.addEventListener('error', () => {
    img.src = DEFAULT_IMAGE_PLACEHOLDER;
  });
  return img;
}

function createFallbackMessage(item) {
  const container = document.createElement('div');
  container.className = 'project-media-empty';
  const title = document.createElement('strong');
  title.textContent = 'Recurso no disponible';
  const message = document.createElement('p');
  message.textContent = item.src
    ? `Carga el archivo ${item.src} en la carpeta del proyecto para visualizarlo aquí.`
    : 'Agrega el recurso multimedia correspondiente para activar esta vista.';
  container.append(title, message);
  return container;
}

function renderHighlights(container, highlights = []) {
  container.innerHTML = '';
  highlights.forEach((highlight) => {
    const card = document.createElement('div');
    card.className = 'project-gallery-card';
    card.setAttribute('data-animate', 'fade-up');

    const title = document.createElement('h3');
    title.className = 'project-gallery-title';
    title.textContent = highlight.title;

    const description = document.createElement('p');
    description.className = 'project-gallery-text';
    description.textContent = highlight.description;

    card.append(title, description);
    container.appendChild(card);
  });

  if (highlights.length) {
    document.dispatchEvent(new CustomEvent('hydra:animate-refresh'));
  }
}

function buildModalSkeleton(modalGifPath) {
  const modal = document.createElement('div');
  modal.className = 'modal project-media-modal';
  modal.id = 'projectMediaModal';
  modal.setAttribute('role', 'dialog');
  modal.setAttribute('aria-modal', 'true');
  modal.setAttribute('aria-hidden', 'true');
  modal.tabIndex = -1;

  const modalContent = document.createElement('div');
  modalContent.className = 'modal-content project-media-modal__content';

  const modalVideo = document.createElement('div');
  modalVideo.className = 'modal-video';
  const gif = document.createElement('div');
  gif.className = 'modal-gif';
  gif.dataset.gif = modalGifPath;
  modalVideo.appendChild(gif);

  const layout = document.createElement('div');
  layout.className = 'project-media-modal__layout';

  const nav = document.createElement('aside');
  nav.className = 'project-media-modal__nav';
  nav.setAttribute('aria-label', 'Seleccionar recurso del proyecto');
  const navList = document.createElement('div');
  navList.className = 'project-media-modal__list';
  nav.appendChild(navList);

  const viewer = document.createElement('div');
  viewer.className = 'project-media-modal__viewer';

  const closeButton = document.createElement('button');
  closeButton.type = 'button';
  closeButton.className = 'modal-close project-media-modal__close';
  closeButton.setAttribute('aria-label', 'Cerrar visor');
  closeButton.innerHTML = '&times;';

  const stage = document.createElement('div');
  stage.className = 'project-media-modal__stage';

  const info = document.createElement('div');
  info.className = 'project-media-modal__info';
  const title = document.createElement('h3');
  title.className = 'project-media-modal__title';
  const description = document.createElement('p');
  description.className = 'project-media-modal__description';

  info.append(title, description);
  viewer.append(closeButton, stage, info);
  layout.append(nav, viewer);

  modalContent.append(modalVideo, layout);
  modal.appendChild(modalContent);
  document.body.appendChild(modal);

  return {
    modal,
    navList,
    stage,
    title,
    description,
    closeButton
  };
}

function renderMediaCards(container, state) {
  container.innerHTML = '';
  state.items.forEach((item, index) => {
    const card = document.createElement('article');
    card.className = 'project-media-card';
    card.tabIndex = 0;
    card.dataset.index = String(index);
    card.setAttribute('data-animate', 'fade-up');

    const preview = document.createElement('div');
    preview.className = 'project-media-preview';

    if (item.type === 'video' && item.src) {
      const video = createVideoElement(item, { autoplay: true, controls: false });
      preview.appendChild(video);
      if (video.autoplay) {
        void video.play().catch(() => {});
      }
    } else if (item.type === 'image') {
      preview.appendChild(createImageElement(item));
    } else {
      preview.appendChild(createFallbackMessage(item));
      card.classList.add('is-empty');
    }

    const overlay = document.createElement('div');
    overlay.className = 'project-media-overlay';
    const title = document.createElement('h3');
    title.textContent = item.title || 'Recurso multimedia';
    const description = document.createElement('p');
    description.textContent = item.description || '';
    const cta = document.createElement('span');
    cta.className = 'project-media-overlay__cta';
    cta.textContent = 'Ver detalle';

    overlay.append(title, description, cta);
    card.append(preview, overlay);
    container.appendChild(card);

    const openHandler = () => {
      clearTimeout(state.hoverTimeout);
      state.lastTrigger = card;
      openModal(state, index);
    };

    card.addEventListener('click', (event) => {
      event.preventDefault();
      openHandler();
    });

    card.addEventListener('keyup', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        openHandler();
      }
    });
  });

  document.dispatchEvent(new CustomEvent('hydra:animate-refresh'));
}

function buildNavigation(navList, state) {
  navList.innerHTML = '';
  state.navButtons = state.items.map((item, index) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'project-media-modal__tab';
    button.dataset.index = String(index);

    if (item.thumbnail) {
      const thumb = createImageElement({ ...item, src: item.thumbnail }, 'project-media-modal__thumb');
      button.appendChild(thumb);
    }

    const label = document.createElement('span');
    label.className = 'project-media-modal__tab-label';
    label.textContent = item.title || `Recurso ${index + 1}`;
    button.appendChild(label);

    button.addEventListener('click', () => setActiveItem(state, index));
    button.addEventListener('keyup', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        setActiveItem(state, index);
      }
    });

    navList.appendChild(button);
    return button;
  });
}

function updateModalStage(state) {
  if (!state.modalElements) {
    return;
  }

  const { stage, title, description } = state.modalElements;
  const item = state.items[state.activeIndex];
  stage.innerHTML = '';

  if (item.type === 'video' && item.src) {
    const video = createVideoElement(item, { autoplay: false, controls: true });
    stage.appendChild(video);
    void video.play().catch(() => {
      video.muted = true;
      video.play().catch(() => {});
    });
  } else if (item.type === 'image' && item.src) {
    stage.appendChild(createImageElement(item, 'project-media-modal__image'));
  } else {
    stage.appendChild(createFallbackMessage(item));
  }

  title.textContent = item.title || 'Recurso multimedia';
  description.textContent = item.description || '';

  state.navButtons.forEach((button, index) => {
    button.classList.toggle('is-active', index === state.activeIndex);
    button.setAttribute('aria-selected', index === state.activeIndex ? 'true' : 'false');
  });
}

function trapFocus(modal) {
  const focusableSelectors = 'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])';
  const focusableElements = Array.from(modal.querySelectorAll(focusableSelectors));
  if (!focusableElements.length) {
    return () => {};
  }
  const first = focusableElements[0];
  const last = focusableElements[focusableElements.length - 1];

  const handleKeydown = (event) => {
    if (event.key !== 'Tab') {
      return;
    }

    if (event.shiftKey) {
      if (document.activeElement === first) {
        event.preventDefault();
        last.focus();
      }
    } else if (document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };

  modal.addEventListener('keydown', handleKeydown);
  return () => modal.removeEventListener('keydown', handleKeydown);
}

function openModal(state, index) {
  if (!state.modal || !state.items.length) {
    return;
  }

  state.activeIndex = index;
  if (!state.lastTrigger && document.activeElement instanceof HTMLElement) {
    state.lastTrigger = document.activeElement;
  }
  updateModalStage(state);

  state.modal.style.display = 'block';
  state.modal.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
  state.modal.focus({ preventScroll: true });

  state.focusTrapCleanup = trapFocus(state.modal);
  dispatchModalEvent('open', state.modal);
}

function closeModal(state) {
  if (!state.modal) {
    return;
  }
  state.modal.style.display = 'none';
  state.modal.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
  if (state.focusTrapCleanup) {
    state.focusTrapCleanup();
    state.focusTrapCleanup = null;
  }
  if (state.lastTrigger && typeof state.lastTrigger.focus === 'function') {
    state.lastTrigger.focus({ preventScroll: true });
  }
  dispatchModalEvent('close', state.modal);
}

function setActiveItem(state, index) {
  if (index === state.activeIndex) {
    return;
  }
  state.activeIndex = index;
  updateModalStage(state);
}

function attachModalInteractions(state) {
  const { modal, modalElements } = state;
  if (!modal || !modalElements) {
    return;
  }

  modalElements.closeButton.addEventListener('click', () => closeModal(state));
  modal.addEventListener('click', (event) => {
    if (event.target === modal) {
      closeModal(state);
    }
  });

  document.addEventListener('keydown', (event) => {
    if (modal.getAttribute('aria-hidden') === 'true') {
      return;
    }

    if (event.key === 'Escape') {
      closeModal(state);
      return;
    }

    if (event.key === 'ArrowDown' || event.key === 'ArrowRight') {
      event.preventDefault();
      const next = (state.activeIndex + 1) % state.items.length;
      setActiveItem(state, next);
    }

    if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') {
      event.preventDefault();
      const prev = (state.activeIndex - 1 + state.items.length) % state.items.length;
      setActiveItem(state, prev);
    }
  });
}

function setupProjectDetail() {
  const dataScript = document.getElementById('projectMediaData');
  if (!dataScript) {
    return;
  }

  let data;
  try {
    data = JSON.parse(dataScript.textContent.trim());
  } catch (error) {
    console.error('No se pudo analizar el JSON de projectMediaData', error);
    return;
  }

  const items = Array.isArray(data.media) ? data.media : [];
  const highlights = Array.isArray(data.highlights) ? data.highlights : [];

  const mediaContainer = document.querySelector('[data-project-media-grid]');
  const highlightContainer = document.querySelector('[data-project-highlights]');

  if (!mediaContainer && !highlightContainer) {
    return;
  }

  const state = {
    items,
    hoverTimeout: null,
    navButtons: [],
    modal: null,
    modalElements: null,
    activeIndex: 0,
    focusTrapCleanup: null,
    lastTrigger: null
  };

  if (mediaContainer && items.length) {
    renderMediaCards(mediaContainer, state);
  }

  if (highlightContainer && highlights.length) {
    renderHighlights(highlightContainer, highlights);
  }

  if (items.length) {
    const modalElements = buildModalSkeleton(getModalGifPath());
    state.modal = modalElements.modal;
    state.modalElements = modalElements;
    buildNavigation(modalElements.navList, state);
    attachModalInteractions(state);
    setActiveItem(state, 0);
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', setupProjectDetail);
} else {
  setupProjectDetail();
}

export { setupProjectDetail };
