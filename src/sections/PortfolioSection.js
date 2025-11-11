const PROJECTS = [
  {
    id: 'admin-suite',
    title: 'Sistema de Administración',
    detailPath: 'pages/portafolio/proyectos/sistema-administracion.html',
    summary: 'Administración integral de ventas, ingresos y egresos con control granular de inventario y reportes financieros inmediatos.',
    highlights: [
      'Panel financiero consolidado con indicadores en tiempo real',
      'Módulo de usuarios con permisos flexibles y trazabilidad',
      'Generación automática de reportes en PDF y hojas de cálculo'
    ],
    tags: ['Software', 'Administración', 'Dashboard'],
    filters: ['software', 'administracion', 'dashboard']
  },
  {
    id: 'automation-hub',
    title: 'Automatización Operativa',
    detailPath: 'pages/portafolio/proyectos/automatizacion-operativa.html',
    summary: 'Automatización de tareas críticas para mejorar la eficiencia y reducir errores humanos dentro de la empresa.',
    highlights: [
      'Orquestación de procesos con bots y validaciones inteligentes',
      'Integración de APIs y servicios internos en un solo flujo',
      'Alertas proactivas y bitácora de auditoría automatizada'
    ],
    tags: ['Automatización', 'Integraciones', 'RPA'],
    filters: ['automatizacion', 'automatizacion-avanzada']
  },
  {
    id: 'insight-dashboard',
    title: 'Dashboard Estratégico',
    detailPath: 'pages/portafolio/proyectos/dashboard-estrategico.html',
    summary: 'Diseño y desarrollo de dashboard responsive para visualizar, filtrar y accionar datos clave en múltiples dispositivos.',
    highlights: [
      'Visualizaciones interactivas con filtros contextuales',
      'Modo claro y oscuro sincronizados con las preferencias del usuario',
      'Exportación segmentada de datasets y estados del tablero'
    ],
    tags: ['Dashboard', 'UI/UX', 'Responsive'],
    filters: ['ui-ux', 'dashboard']
  },
  {
    id: 'learning-platform',
    title: 'Plataforma Educativa',
    detailPath: 'pages/portafolio/proyectos/plataforma-educativa.html',
    summary: 'Ecosistema educativo completo con gestión de cursos, evaluaciones adaptivas y analítica de progreso.',
    highlights: [
      'Experiencia multi-rol para estudiantes, tutores y administradores',
      'Streaming de contenidos y recursos descargables sin fricciones',
      'Analítica de engagement y métricas de evolución académica'
    ],
    tags: ['Educación', 'Multiplataforma', 'Desarrollo web'],
    filters: ['web', 'educacion']
  },
  {
    id: 'game-dev',
    title: 'Desarrollo de Juegos Web',
    detailPath: 'pages/portafolio/proyectos/desarrollo-juegos-web.html',
    summary: 'Creación de juegos interactivos con lógica compleja, IA avanzada y experiencias inmersivas directamente en el navegador.',
    highlights: [
      'Ajedrez completo con motor minimax y diferentes niveles de IA',
      'Ruleta 21 con sistema de ritos únicos y mecánicas innovadoras',
      'Animaciones fluidas y controles adaptativos para todos los dispositivos'
    ],
    tags: ['Juegos', 'JavaScript', 'IA'],
    filters: ['juegos']
  }
];

const FILTER_GROUPS = {
  category: [
    { id: 'all', label: 'Todas las categorías' },
    { id: 'software', label: 'Software a medida' },
    { id: 'automatizacion', label: 'Automatización' },
    { id: 'ui-ux', label: 'Diseño UI/UX' },
    { id: 'web', label: 'Sitios y plataformas web' },
    { id: 'juegos', label: 'Juegos web' }
  ],
  focus: [
    { id: 'all', label: 'Todos los enfoques' },
    { id: 'administracion', label: 'Administración' },
    { id: 'dashboard', label: 'Dashboards' },
    { id: 'automatizacion-avanzada', label: 'Automatización avanzada' },
    { id: 'educacion', label: 'Educación' },
    { id: 'juegos', label: 'Juegos interactivos' }
  ]
};

export class PortfolioSection {
  constructor() {
    this.previewContainer = document.getElementById('portfolioPreview');
    this.gridContainer = document.getElementById('portfolioGrid');
    this.filterModal = document.getElementById('filtersModal');
    this.filterOpenButton = document.getElementById('openFilters');
    this.filterCloseButton = document.getElementById('closeFilters');
    this.applyFiltersButton = document.getElementById('applyFilters');
    this.clearFiltersButton = document.getElementById('clearFilters');
    this.filterChips = [];
    this.selectedCategory = 'all';
    this.selectedFocus = 'all';

    this.init();
  }

  init() {
    if (!this.previewContainer && !this.gridContainer) {
      return;
    }

    this.renderPreview(PROJECTS);
    this.renderGrid(PROJECTS);
    this.setupPreviewControls();
    this.setupFilters();
  }

  renderPreview(projects) {
    if (!this.previewContainer) {
      return;
    }

    // Use DocumentFragment for better performance
    const fragment = document.createDocumentFragment();
    projects.forEach((project) => {
      const card = this.createPreviewCard(project);
      fragment.appendChild(card);
    });
    
    this.previewContainer.innerHTML = '';
    this.previewContainer.appendChild(fragment);

    document.dispatchEvent(new CustomEvent('hydra:animate-refresh'));
  }

  renderGrid(projects) {
    if (!this.gridContainer) {
      return;
    }

    const fragment = document.createDocumentFragment();

    if (!projects.length) {
      const empty = document.createElement('p');
      empty.className = 'portfolio-empty';
      empty.textContent = 'No hay proyectos que coincidan con los filtros seleccionados.';
      fragment.appendChild(empty);
    } else {
      projects.forEach((project) => {
        const card = this.createGridCard(project);
        fragment.appendChild(card);
      });
    }

    this.gridContainer.innerHTML = '';
    this.gridContainer.appendChild(fragment);

    document.dispatchEvent(new CustomEvent('hydra:animate-refresh'));
  }

  createPreviewCard(project) {
    const card = document.createElement('article');
    card.className = 'portfolio-card';
    card.tabIndex = 0;
    card.setAttribute('data-animate', 'fade-up');

    const title = document.createElement('h3');
    title.textContent = project.title;

    const summary = document.createElement('p');
    summary.textContent = project.summary;

    const tags = this.createTagList(project.tags);

    const actions = this.createActionOverlay(project);

    card.appendChild(title);
    card.appendChild(summary);
    card.appendChild(tags);
    card.appendChild(actions);

    return card;
  }

  createGridCard(project) {
    const card = document.createElement('article');
    card.className = 'portfolio-card';
    card.dataset.filters = project.filters.join(' ');
    card.setAttribute('data-animate', 'fade-up');
    card.tabIndex = 0;

    const title = document.createElement('h3');
    title.textContent = project.title;

    const summary = document.createElement('p');
    summary.textContent = project.summary;

    const highlightList = document.createElement('ul');
    highlightList.className = 'portfolio-card-highlights';
    project.highlights.forEach((item) => {
      const li = document.createElement('li');
      li.textContent = item;
      highlightList.appendChild(li);
    });

    const tags = this.createTagList(project.tags);
    const actions = this.createActionOverlay(project);

    card.appendChild(title);
    card.appendChild(summary);
    card.appendChild(highlightList);
    card.appendChild(tags);
    card.appendChild(actions);

    return card;
  }

  createTagList(tags) {
    const list = document.createElement('ul');
    list.className = 'portfolio-card-tags';
    tags.forEach((tag) => {
      const li = document.createElement('li');
      li.textContent = tag;
      list.appendChild(li);
    });
    return list;
  }

  setupPreviewControls() {
    if (!this.previewContainer) {
      return;
    }

    const prevButton = document.getElementById('portfolioPrev');
    const nextButton = document.getElementById('portfolioNext');

    const updateButtonStates = () => {
      const { scrollLeft, scrollWidth, clientWidth } = this.previewContainer;
      const isAtStart = scrollLeft <= 0;
      const isAtEnd = scrollLeft + clientWidth >= scrollWidth - 10; // 10px threshold
      
      if (prevButton) {
        prevButton.disabled = isAtStart;
        prevButton.style.opacity = isAtStart ? '0.5' : '1';
        prevButton.style.cursor = isAtStart ? 'not-allowed' : 'pointer';
      }
      
      if (nextButton) {
        nextButton.disabled = isAtEnd;
        nextButton.style.opacity = isAtEnd ? '0.5' : '1';
        nextButton.style.cursor = isAtEnd ? 'not-allowed' : 'pointer';
      }
    };

    const scroll = (direction) => {
      const { scrollLeft, clientWidth } = this.previewContainer;
      const cardWidth = clientWidth * 0.8;
      const offset = direction === 'left' ? -cardWidth : cardWidth;
      
      this.previewContainer.scrollBy({ 
        left: offset, 
        behavior: 'smooth' 
      });
      
      // Update states after scroll
      setTimeout(updateButtonStates, 300);
    };

    prevButton?.addEventListener('click', () => scroll('left'));
    nextButton?.addEventListener('click', () => scroll('right'));

    // Update states on scroll
    this.previewContainer.addEventListener('scroll', updateButtonStates);

    // Initial state
    updateButtonStates();
  }

  renderFilterChips() {
    if (!this.filterModal) {
      return;
    }

    const groups = this.filterModal.querySelectorAll('[data-filter-group]');

    groups.forEach((container) => {
      const groupName = container.dataset.filterGroup || '';
      const options = FILTER_GROUPS[groupName] || [];
      container.innerHTML = '';

      options.forEach((option) => {
        const chip = document.createElement('button');
        chip.type = 'button';
        chip.className = 'filter-chip';
        chip.dataset.filter = option.id;
        chip.textContent = option.label;
        chip.setAttribute('aria-pressed', option.id === 'all' ? 'true' : 'false');
        chip.addEventListener('click', () => this.handleChipSelect(groupName, option.id));
        container.appendChild(chip);
      });
    });

    this.filterChips = Array.from(this.filterModal.querySelectorAll('.filter-chip'));
    this.updateChipStates();
  }

  setupFilters() {
    if (!this.filterModal) {
      return;
    }

    this.renderFilterChips();

    this.filterOpenButton?.addEventListener('click', () => this.toggleFilters(true));
    this.filterCloseButton?.addEventListener('click', () => this.toggleFilters(false));

    this.applyFiltersButton?.addEventListener('click', () => {
      this.applyFilters();
      this.toggleFilters(false);
    });

    this.clearFiltersButton?.addEventListener('click', () => {
      this.selectedCategory = 'all';
      this.selectedFocus = 'all';
      this.updateChipStates();
      this.renderGrid(PROJECTS);
    });

    this.filterModal.addEventListener('click', (event) => {
      if (event.target === this.filterModal) {
        this.toggleFilters(false);
      }
    });
  }

  toggleFilters(open) {
    if (!this.filterModal) {
      return;
    }

    this.filterModal.style.display = open ? 'block' : 'none';
    document.body.style.overflow = open ? 'hidden' : '';
    this.filterModal.setAttribute('aria-hidden', open ? 'false' : 'true');

    if (open) {
      this.filterModal.focus({ preventScroll: true });
      document.addEventListener('keydown', this.handleFilterKeydown);
      document.dispatchEvent(new CustomEvent('hydra:modal-open', { detail: { modal: this.filterModal } }));
    } else {
      document.removeEventListener('keydown', this.handleFilterKeydown);
      document.dispatchEvent(new CustomEvent('hydra:modal-close', { detail: { modal: this.filterModal } }));
    }
  }

  handleFilterKeydown = (event) => {
    if (event.key === 'Escape') {
      this.toggleFilters(false);
    }
  };

  handleChipSelect = (group, filterId) => {
    if (group === 'category') {
      this.selectedCategory = filterId;
    } else if (group === 'focus') {
      this.selectedFocus = filterId;
    }

    this.updateChipStates();
  };

  updateChipStates() {
    this.filterChips.forEach((chip) => {
      const panel = chip.closest('.filter-panel');
      const group = panel?.dataset.group || '';
      const filter = chip.dataset.filter || 'all';

      const isActive =
        (group === 'category' && filter === this.selectedCategory) ||
        (group === 'focus' && filter === this.selectedFocus) ||
        (filter === 'all' &&
          ((group === 'category' && this.selectedCategory === 'all') ||
            (group === 'focus' && this.selectedFocus === 'all')));

      chip.classList.toggle('active', isActive);
      chip.setAttribute('aria-pressed', isActive ? 'true' : 'false');
    });
  }

  applyFilters() {
    const filtered = PROJECTS.filter((project) => {
      const matchesCategory = this.selectedCategory === 'all' || project.filters.includes(this.selectedCategory);
      const matchesFocus = this.selectedFocus === 'all' || project.filters.includes(this.selectedFocus);
      return matchesCategory && matchesFocus;
    });

    this.renderGrid(filtered);
  }

  createActionOverlay(project) {
    const overlay = document.createElement('div');
    overlay.className = 'portfolio-card-actions';

    const action = document.createElement('a');
    action.className = 'portfolio-card-action';
    action.textContent = 'Ver proyecto';
    action.href = this.resolveDetailPath(project.detailPath);
    action.setAttribute('aria-label', `Ver detalles del proyecto ${project.title}`);

    overlay.appendChild(action);

    return overlay;
  }

  resolveDetailPath(detailPath) {
    if (!detailPath) {
      return '#';
    }

    if (/^https?:\/\//i.test(detailPath)) {
      return detailPath;
    }

    const normalized = detailPath.replace(/^\/+/, '');
    const pathname = window.location.pathname;
    const pagesIndex = pathname.indexOf('/pages/');

    let base = '';
    if (pagesIndex !== -1) {
      base = pathname.substring(0, pagesIndex + 1);
    } else {
      const lastSlash = pathname.lastIndexOf('/');
      base = pathname.substring(0, Math.max(0, lastSlash + 1));
    }

    if (!base.endsWith('/')) {
      base += '/';
    }

    return `${base}${normalized}`.replace(/\/+/g, '/');
  }
}
