const STORAGE_KEY = 'hydra404-theme';

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

export class ThemeToggle {
  constructor() {
    this.themeToggle = document.getElementById('themeToggle');
    this.themeIcon = document.querySelector('.theme-icon');
    const hasMatchMedia = typeof window.matchMedia === 'function';
    this.themeMedia = hasMatchMedia ? window.matchMedia('(prefers-color-scheme: light)') : null;

    this.init();
  }

  init() {
    this.applyStoredTheme();
    this.attachListeners();
  }

  applyStoredTheme() {
    const savedTheme = localStorage.getItem(STORAGE_KEY);
    const prefersLight = this.themeMedia?.matches ?? false;
    const shouldUseLight = savedTheme ? savedTheme === 'light' : prefersLight;
    document.body.classList.toggle('light-theme', shouldUseLight);
    this.updateToggleState();
  }

  attachListeners() {
    this.themeToggle?.addEventListener('click', this.handleToggleClick);
    addMediaQueryListener(this.themeMedia, this.handleSystemThemeChange);
  }

  updateToggleState() {
    const isLight = document.body.classList.contains('light-theme');
    this.themeToggle?.setAttribute('aria-label', isLight ? 'Cambiar a tema oscuro' : 'Cambiar a tema claro');
    this.themeToggle?.setAttribute('aria-pressed', String(isLight));
    if (this.themeIcon) {
      this.themeIcon.classList.toggle('is-light', isLight);
    }
  }

  handleToggleClick = () => {
    document.body.classList.toggle('light-theme');
    const isLight = document.body.classList.contains('light-theme');
    localStorage.setItem(STORAGE_KEY, isLight ? 'light' : 'dark');
    this.updateToggleState();
  };

  handleSystemThemeChange = (event) => {
    const savedTheme = localStorage.getItem(STORAGE_KEY);
    if (savedTheme) {
      return;
    }

    document.body.classList.toggle('light-theme', event.matches);
    this.updateToggleState();
  };
}
