export class Navigation {
  constructor() {
    this.navToggle = document.getElementById('navToggle');
    this.navMenu = document.getElementById('navMenu');
    this.navLinks = Array.from(document.querySelectorAll('.nav-link'));
    this.body = document.body;

    this.init();
  }

  init() {
    this.setupMobileMenu();
    this.setupSmoothScrolling();
    this.setupActiveLinkHighlight();
    window.addEventListener('resize', this.handleResize);
  }

  setupMobileMenu() {
    if (!this.navToggle || !this.navMenu) {
      return;
    }

    this.navToggle.setAttribute('aria-controls', this.navMenu.id);
    this.navToggle.setAttribute('aria-expanded', 'false');
    this.navMenu.setAttribute('aria-hidden', 'true');

    this.navToggle.addEventListener('click', this.handleToggleClick);

    this.navLinks.forEach((link) => {
      link.addEventListener('click', this.closeMobileMenu);
    });

    document.addEventListener('keydown', this.handleDocumentKeydown);
  }

  setupSmoothScrolling() {
    this.navLinks.forEach((link) => {
      link.addEventListener('click', (event) => {
        const href = link.getAttribute('href') || '';
        if (!href.startsWith('#')) {
          return;
        }

        const targetId = href.substring(1);
        const target = document.getElementById(targetId);
        if (!target) {
          return;
        }

        event.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    });
  }

  setupActiveLinkHighlight() {
    const sections = Array.from(document.querySelectorAll('.section')).filter((section) => section.id);
    if (!sections.length || !this.navLinks.length) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = entry.target.getAttribute('id');
            this.navLinks.forEach((link) => {
              if (link.getAttribute('href') === `#${id}`) {
                link.classList.add('active');
              } else if (link.getAttribute('href')?.startsWith('#')) {
                link.classList.remove('active');
              }
            });
          }
        });
      },
      {
        rootMargin: '-45% 0px -45% 0px',
        threshold: 0.1
      }
    );

    sections.forEach((section) => observer.observe(section));
  }

  handleToggleClick = () => {
    this.toggleMobileMenu();
  };

  toggleMobileMenu = (forceOpen) => {
    if (!this.navMenu || !this.navToggle) {
      return;
    }

    const isCurrentlyOpen = this.navMenu.classList.contains('active');
    const shouldOpen = typeof forceOpen === 'boolean' ? forceOpen : !isCurrentlyOpen;

    this.navMenu.classList.toggle('active', shouldOpen);
    this.navToggle.classList.toggle('active', shouldOpen);
    this.navToggle.setAttribute('aria-expanded', String(shouldOpen));
    this.navMenu.setAttribute('aria-hidden', String(!shouldOpen));

    if (this.body) {
      this.body.classList.toggle('nav-open', shouldOpen);
    }
  };

  closeMobileMenu = () => {
    if (this.navMenu?.classList.contains('active')) {
      this.toggleMobileMenu(false);
    }
  };

  handleDocumentKeydown = (event) => {
    if (event.key === 'Escape' && this.navMenu?.classList.contains('active')) {
      this.toggleMobileMenu(false);
      this.navToggle?.focus();
    }
  };

  handleResize = () => {
    if (window.innerWidth > 768) {
      this.toggleMobileMenu(false);
    }
  };
}
