export class ParallaxBackground {
  constructor() {
    this.body = document.body;
    this.parallaxSpeed = 0.3; // Velocidad del parallax (0.3 = 30% de velocidad del scroll)
    this.lastScrollY = 0;
    this.rafId = null;
    this.init();
  }

  init() {
    // Solo activar en desktop/landscape
    if (!this.isDesktop()) {
      return;
    }

    this.isActive = true;
    window.addEventListener('scroll', this.handleScroll, { passive: true });
    
    // Limpiar parallax si cambia el tamaño de ventana
    window.addEventListener('resize', this.handleResize, { passive: true });
  }

  isDesktop() {
    return window.matchMedia('(orientation: landscape) and (min-width: 768px)').matches;
  }

  handleScroll = () => {
    if (!this.isActive || !this.isDesktop()) {
      return;
    }

    // Cancelar RAF anterior si existe
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
    }

    // Usar RAF para mejor rendimiento
    this.rafId = requestAnimationFrame(() => {
      const scrollY = window.scrollY;
      
      // Solo actualizar si el scroll cambió significativamente
      if (Math.abs(scrollY - this.lastScrollY) < 0.5) {
        return;
      }

      const parallaxOffset = scrollY * this.parallaxSpeed;
      this.body.style.backgroundPosition = `center ${parallaxOffset}px`;
      this.lastScrollY = scrollY;
    });
  };

  handleResize = () => {
    if (!this.isDesktop()) {
      // Si no es desktop, limpiar el parallax
      this.body.style.backgroundPosition = 'center top';
    }
  };

  destroy() {
    window.removeEventListener('scroll', this.handleScroll);
    window.removeEventListener('resize', this.handleResize);
    
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
    }

    this.body.style.backgroundPosition = 'center top';
  }
}

