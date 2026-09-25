/* ==========================================================================
   StructBuild - app.js
   Aplikasi Utama, Router Tampilan, Event Controller & Integrasi Modul
   ========================================================================== */

class AppRouter {
  constructor() {
    this.currentView = 'home';
    this.structure3D = null;
    this.components3D = null;
    this.bearingLab = null;
    this.simulationCtrl = null;
    this.diagramsCtrl = null;
    this.quizCtrl = null;
    this.progress = null;
    this.sandbox = null;

    this.init();
  }

  init() {
    // 1. Inisialisasi Progres Siswa
    this.progress = new LearningProgress();
    window.learningProgress = this.progress;

    // 2. Setup Navigasi Sidebar & Tautan
    this.setupNavigation();

    // 3. Setup Modul Interaktif saat Halaman Terbuka
    this.initInteractiveModules();

    // 4. Setup Modal & Bantuan
    this.setupModals();

    // 5. Responsive Sidebar Toggle
    this.setupSidebarToggle();
  }

  setupNavigation() {
    const navItems = document.querySelectorAll('.nav-item[data-view]');
    navItems.forEach(item => {
      item.addEventListener('click', (e) => {
        e.preventDefault();
        const targetView = item.getAttribute('data-view');
        this.navigateTo(targetView);
      });
    });

    // Quick feature cards di beranda
    const featureCards = document.querySelectorAll('.feature-portal-card[data-view]');
    featureCards.forEach(card => {
      card.addEventListener('click', () => {
        const targetView = card.getAttribute('data-view');
        this.navigateTo(targetView);
      });
    });

    // Switcher Tipe Struktur 3D (Balok Portal, Rangka Atap, Jembatan Warren)
    const structTypeBtns = document.querySelectorAll('.btn-struct-type');
    structTypeBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        structTypeBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const type = btn.getAttribute('data-struct');
        if (this.structure3D) {
          this.structure3D.setStructureType(type);
        }
      });
    });

    // Tombol Preset Peletakan Beban (0%, 25%, 50%, 75%, 100%)
    const presetBtns = document.querySelectorAll('.btn-load-preset');
    presetBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        presetBtns.forEach(b => b.style.borderColor = 'var(--border-color)');
        btn.style.borderColor = 'var(--accent-orange)';
        const ratio = parseFloat(btn.getAttribute('data-ratio'));
        if (this.structure3D) {
          this.structure3D.setLoadPreset(ratio);
        }
      });
    });
  }

  navigateTo(viewId) {
    const targetPage = document.getElementById(`view-${viewId}`);
    if (!targetPage) return;

    // Update kelas active pada halaman
    document.querySelectorAll('.page-view').forEach(p => p.classList.remove('active'));
    targetPage.classList.add('active');

    // Update active pada sidebar
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    const activeNav = document.querySelector(`.nav-item[data-view="${viewId}"]`);
    if (activeNav) activeNav.classList.add('active');

    // Update Breadcrumb
    const breadcrumbCurrent = document.getElementById('breadcrumb-page-title');
    const titles = {
      home: 'Beranda Utama',
      components: 'Kenali Struktur 3D',
      bearings: 'Tumpuan (Perletakan)',
      simulation: 'Simulasi Struktur 3D & Guided Discovery',
      sandbox: 'Studio Rancang Mandiri (Gambar Sendiri)',
      diagrams: 'Diagram Gaya Dalam (N, V, M)',
      quiz: 'Kuis Statika Bangunan',
      progress: 'Progres Belajar Siswa'
    };
    if (breadcrumbCurrent && titles[viewId]) {
      breadcrumbCurrent.textContent = titles[viewId];
    }

    this.currentView = viewId;
    if (this.progress) {
      this.progress.recordModuleVisit(viewId);
    }

    // Trigger Resize & Update Objek 3D / Canvas agar ukuran pas
    setTimeout(() => {
      if (viewId === 'simulation' && this.structure3D) {
        this.structure3D.onWindowResize();
      } else if (viewId === 'components' && this.components3D) {
        this.components3D.onWindowResize();
      } else if (viewId === 'diagrams' && this.diagramsCtrl) {
        this.diagramsCtrl.renderAll();
      } else if (viewId === 'sandbox' && this.sandbox) {
        this.sandbox.resizeCanvas();
      }
    }, 150);

    // Tutup sidebar di layar HP
    const sidebar = document.getElementById('sidebar');
    if (sidebar && window.innerWidth <= 768) {
      sidebar.classList.remove('open');
    }
  }

  initInteractiveModules() {
    // 1. Viewer 3D Balok Simulasi
    try {
      this.structure3D = new Structure3DViewer('sim-3d-viewport');
      window.structure3DViewer = this.structure3D;
    } catch (e) {
      console.error("Error initializing Structure3DViewer", e);
    }

    // 2. Controller Diagram Gaya
    try {
      this.diagramsCtrl = new InternalForcesDiagrams();
      window.diagramsController = this.diagramsCtrl;
    } catch (e) {
      console.error("Error initializing InternalForcesDiagrams", e);
    }

    // 3. Controller Simulasi Guided Discovery
    try {
      this.simulationCtrl = new SimulationController();
      if (this.structure3D) this.simulationCtrl.set3DViewer(this.structure3D);
      if (this.diagramsCtrl) this.simulationCtrl.setDiagramController(this.diagramsCtrl);
      window.simulationController = this.simulationCtrl;
    } catch (e) {
      console.error("Error initializing SimulationController", e);
    }

    // 4. Model 3D Rangka Bangunan (Kenali Struktur)
    try {
      this.components3D = new BuildingComponents3D('components-3d-canvas', (data) => {
        this.displayComponentDetails(data);
      });
      window.buildingComponents3D = this.components3D;
    } catch (e) {
      console.error("Error initializing BuildingComponents3D", e);
    }

    // 5. Lab Interaktif Tumpuan 3D
    try {
      this.bearingLab = new BearingInteractiveLab();
      this.bearingLab.initBearingViewer('bearing-3d-sendi', 'sendi');
      this.bearingLab.initBearingViewer('bearing-3d-rol', 'rol');
      this.bearingLab.initBearingViewer('bearing-3d-jepit', 'jepit');
      window.bearingLab = this.bearingLab;
    } catch (e) {
      console.error("Error initializing BearingInteractiveLab", e);
    }

    // 6. Controller Kuis
    try {
      this.quizCtrl = new QuizController();
      window.quizController = this.quizCtrl;
    } catch (e) {
      console.error("Error initializing QuizController", e);
    }

    // 7. Studio Gambar Struktur Mandiri (Sandbox)
    try {
      this.sandbox = new StructureSandbox('sandbox-canvas');
      window.structureSandbox = this.sandbox;
    } catch (e) {
      console.error("Error initializing StructureSandbox", e);
    }

    // Event tombol filter komponen struktur
    const compBtns = document.querySelectorAll('.btn-comp-selector');
    compBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        compBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const type = btn.getAttribute('data-type');
        if (this.components3D) {
          this.components3D.selectByType(type);
        }
      });
    });
  }

  // Tampilkan Detail Elemen saat Diklik di 3D
  displayComponentDetails(data) {
    const titleEl = document.getElementById('comp-detail-title');
    const descEl = document.getElementById('comp-detail-desc');
    const mechEl = document.getElementById('comp-detail-mechanics');
    const realEl = document.getElementById('comp-detail-real');

    if (titleEl) titleEl.textContent = data.title;
    if (descEl) descEl.textContent = data.desc;
    if (mechEl) mechEl.textContent = data.mechanics;
    if (realEl) realEl.textContent = data.realWorld;

    const activeBtn = document.querySelector(`.btn-comp-selector[data-type="${data.type}"]`);
    if (activeBtn) {
      document.querySelectorAll('.btn-comp-selector').forEach(b => b.classList.remove('active'));
      activeBtn.classList.add('active');
    }
  }

  setupModals() {
    const modal = document.getElementById('quick-guide-modal');
    const btnOpen = document.getElementById('btn-open-quick-guide');
    const btnClose = document.getElementById('btn-close-modal');

    if (btnOpen && modal) {
      btnOpen.addEventListener('click', () => modal.classList.add('active'));
    }
    if (btnClose && modal) {
      btnClose.addEventListener('click', () => modal.classList.remove('active'));
    }
    if (modal) {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.classList.remove('active');
      });
    }

    // Modal Chrome SEO & Akses Publik
    const chromeModal = document.getElementById('chrome-guide-modal');
    const btnOpenChrome = document.getElementById('btn-open-chrome-guide');
    const btnCloseChrome = document.getElementById('btn-close-chrome-modal');

    if (btnOpenChrome && chromeModal) {
      btnOpenChrome.addEventListener('click', () => chromeModal.classList.add('active'));
    }
    if (btnCloseChrome && chromeModal) {
      btnCloseChrome.addEventListener('click', () => chromeModal.classList.remove('active'));
    }
    if (chromeModal) {
      chromeModal.addEventListener('click', (e) => {
        if (e.target === chromeModal) chromeModal.classList.remove('active');
      });
    }
  }

  setupSidebarToggle() {
    const toggleBtn = document.getElementById('btn-toggle-sidebar');
    const sidebar = document.getElementById('sidebar');
    if (toggleBtn && sidebar) {
      toggleBtn.addEventListener('click', () => {
        sidebar.classList.toggle('open');
      });
    }
  }
}

// Inisialisasi saat DOM siap
document.addEventListener('DOMContentLoaded', () => {
  window.appRouter = new AppRouter();
});
