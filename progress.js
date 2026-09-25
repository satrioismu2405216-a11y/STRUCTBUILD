/* ==========================================================================
   StructBuild - progress.js
   Pelacak Progres Belajar & Pencapaian Badge Gamifikasi Siswa SMK TKP
   ========================================================================== */

class LearningProgress {
  constructor() {
    this.storageKey = 'structbuild_student_progress_v1';
    this.data = this.loadData();
    this.init();
  }

  getDefaultData() {
    return {
      startedAt: new Date().toISOString(),
      modulesVisited: {
        home: true,
        components: false,
        bearings: false,
        simulation: false,
        diagrams: false,
        quiz: false
      },
      simulationsCount: 0,
      quizAnswers: {},
      quizScore: 0,
      badges: {
        pondasi: true,        // Badge selamat datang
        inspektur: false,     // Menjelajahi 3D struktur
        tumpuan: false,       // Menguji sendi, rol, jepit
        penemu: false,        // Menyelesaikan simulasi guided discovery
        diagram: false,       // Mengamati diagram gaya
        juara: false          // Kuis >= 80
      }
    };
  }

  loadData() {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        return Object.assign(this.getDefaultData(), JSON.parse(stored));
      }
    } catch (e) {
      console.warn("Storage access limited", e);
    }
    return this.getDefaultData();
  }

  saveData() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.data));
    } catch (e) {
      console.warn("Could not save to localStorage", e);
    }
    this.updateUI();
  }

  init() {
    this.updateUI();
  }

  recordModuleVisit(moduleId) {
    if (this.data.modulesVisited[moduleId] !== undefined) {
      this.data.modulesVisited[moduleId] = true;

      // Cek badge kondisi
      if (moduleId === 'components') this.data.badges.inspektur = true;
      if (moduleId === 'bearings') this.data.badges.tumpuan = true;
      if (moduleId === 'diagrams') this.data.badges.diagram = true;

      this.saveData();
    }
  }

  recordSimulationRun() {
    this.data.simulationsCount++;
    this.data.badges.penemu = true;
    this.saveData();
  }

  recordQuizAnswer(index, isCorrect) {
    this.data.quizAnswers[index] = isCorrect;
    this.saveData();
  }

  setFinalScore(score) {
    this.data.quizScore = score;
    if (score >= 80) {
      this.data.badges.juara = true;
    }
    this.saveData();
  }

  updateUI() {
    // 1. Hitung Modul yang telah dibuka
    const modules = Object.values(this.data.modulesVisited);
    const completedCount = modules.filter(Boolean).length;
    const totalCount = modules.length;
    const percent = Math.round((completedCount / totalCount) * 100);

    const modStatEl = document.getElementById('stat-modules-completed');
    if (modStatEl) modStatEl.textContent = `${completedCount} / ${totalCount} Modul (${percent}%)`;

    const simStatEl = document.getElementById('stat-sim-count');
    if (simStatEl) simStatEl.textContent = `${this.data.simulationsCount} Kali`;

    const quizStatEl = document.getElementById('stat-quiz-score');
    if (quizStatEl) quizStatEl.textContent = `${this.data.quizScore} Poin`;

    // 2. Render Badges
    const badgeElements = {
      pondasi: document.getElementById('badge-card-pondasi'),
      inspektur: document.getElementById('badge-card-inspektur'),
      tumpuan: document.getElementById('badge-card-tumpuan'),
      penemu: document.getElementById('badge-card-penemu'),
      diagram: document.getElementById('badge-card-diagram'),
      juara: document.getElementById('badge-card-juara')
    };

    for (let [key, el] of Object.entries(badgeElements)) {
      if (el) {
        if (this.data.badges[key]) {
          el.className = 'badge-item-card unlocked';
          const status = el.querySelector('.badge-status');
          if (status) status.innerHTML = '<span style="color:#10b981; font-weight:700;">✅ Terbuka</span>';
        } else {
          el.className = 'badge-item-card locked';
          const status = el.querySelector('.badge-status');
          if (status) status.innerHTML = '<span style="color:#94a3b8; font-weight:600;">🔒 Belum Selesai</span>';
        }
      }
    }
  }

  resetAll() {
    if (confirm("Apakah kamu yakin ingin mereset seluruh progres dan skor belajarmu?")) {
      this.data = this.getDefaultData();
      this.saveData();
      location.reload();
    }
  }
}

window.LearningProgress = LearningProgress;
