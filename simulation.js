/* ==========================================================================
   StructBuild - simulation.js
   Modul Guided Discovery Learning & Interaksi Simulasi Statika Balok
   Alur: AMATI -> IDENTIFIKASI -> PREDIKSI -> MANIPULASI -> HITUNG -> VERIFIKASI -> REFLEKSI
   ========================================================================== */

class SimulationController {
  constructor() {
    this.currentStep = 1;
    this.totalSteps = 7;
    
    this.predictionChoice = null;
    this.viewer3D = null;
    this.diagramController = null;

    // Parameter Balok
    this.span = 8.0;      // m
    this.loadPos = 3.0;   // m dari tumpuan A
    this.loadMag = 50.0;  // kN (konseptual)

    this.init();
  }

  set3DViewer(viewer) {
    this.viewer3D = viewer;
  }

  setDiagramController(diag) {
    this.diagramController = diag;
  }

  init() {
    this.bindEvents();
    this.updateHUD();
  }

  bindEvents() {
    // Slider Posisi Beban
    const posSlider = document.getElementById('slider-load-pos');
    const posVal = document.getElementById('val-load-pos');
    if (posSlider) {
      posSlider.addEventListener('input', (e) => {
        const val = parseFloat(e.target.value);
        this.loadPos = val;
        if (posVal) posVal.textContent = `${val.toFixed(1)} m`;
        if (this.viewer3D) this.viewer3D.setLoadPosition(val);
        if (this.diagramController) this.diagramController.update(this.span, this.loadPos, this.loadMag);
        this.updateHUD();
      });
    }

    // Slider Besar Beban
    const magSlider = document.getElementById('slider-load-mag');
    const magVal = document.getElementById('val-load-mag');
    if (magSlider) {
      magSlider.addEventListener('input', (e) => {
        const val = parseFloat(e.target.value);
        this.loadMag = val;
        if (magVal) magVal.textContent = `${val.toFixed(0)} kN`;
        if (this.viewer3D) this.viewer3D.setLoadMagnitude(val);
        if (this.diagramController) this.diagramController.update(this.span, this.loadPos, this.loadMag);
        this.updateHUD();
      });
    }

    // Slider Panjang Bentang Balok
    const spanSlider = document.getElementById('slider-span-len');
    const spanVal = document.getElementById('val-span-len');
    if (spanSlider) {
      spanSlider.addEventListener('input', (e) => {
        const val = parseFloat(e.target.value);
        this.span = val;
        if (spanVal) spanVal.textContent = `${val.toFixed(1)} m`;
        if (posSlider) {
          posSlider.max = (val - 0.5).toFixed(1);
          if (this.loadPos > val - 0.5) {
            this.loadPos = val / 2;
            posSlider.value = this.loadPos;
            if (posVal) posVal.textContent = `${this.loadPos.toFixed(1)} m`;
          }
        }
        if (this.viewer3D) this.viewer3D.setSpanLength(val);
        if (this.diagramController) this.diagramController.update(this.span, this.loadPos, this.loadMag);
        this.updateHUD();
      });
    }

    // Pilihan Opsi Prediksi
    const predBtns = document.querySelectorAll('.prediction-btn');
    predBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        predBtns.forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        this.predictionChoice = btn.getAttribute('data-predict');
      });
    });

    // Tombol Stepper Guided Discovery
    const btnNext = document.getElementById('btn-step-next');
    const btnPrev = document.getElementById('btn-step-prev');
    if (btnNext) btnNext.addEventListener('click', () => this.nextStep());
    if (btnPrev) btnPrev.addEventListener('click', () => this.prevStep());

    // Navigasi Dots Stepper
    const dots = document.querySelectorAll('.step-dot');
    dots.forEach(dot => {
      dot.addEventListener('click', () => {
        const step = parseInt(dot.getAttribute('data-step'), 10);
        this.goToStep(step);
      });
    });

    // Tombol "Lihat Petunjuk"
    const btnHint = document.getElementById('btn-show-hint');
    if (btnHint) {
      btnHint.addEventListener('click', () => this.showHint());
    }

    // Tombol "Verifikasi Jawaban"
    const btnVerify = document.getElementById('btn-verify-answer');
    if (btnVerify) {
      btnVerify.addEventListener('click', () => this.verifyAnswer());
    }

    // Tombol Reset Simulasi
    const btnReset = document.getElementById('btn-reset-sim');
    if (btnReset) {
      btnReset.addEventListener('click', () => this.resetSimulation());
    }
  }

  // Update Tampilan HUD Indikator Reaksi Tanpa Memunculkan Angka
  updateHUD() {
    const a = this.loadPos;
    const b = this.span - a;
    const propA = (b / this.span) * 100;
    const propB = (a / this.span) * 100;

    const fillA = document.getElementById('hud-fill-a');
    const fillB = document.getElementById('hud-fill-b');
    const statusA = document.getElementById('hud-status-a');
    const statusB = document.getElementById('hud-status-b');

    if (fillA) fillA.style.width = `${propA.toFixed(0)}%`;
    if (fillB) fillB.style.width = `${propB.toFixed(0)}%`;

    if (statusA && statusB) {
      if (Math.abs(propA - propB) < 4) {
        statusA.textContent = "Beban Seimbang (Sama Besar)";
        statusB.textContent = "Beban Seimbang (Sama Besar)";
      } else if (propA > propB) {
        statusA.textContent = "Menerima Porsi Beban Lebih Besar";
        statusB.textContent = "Menerima Porsi Beban Lebih Kecil";
      } else {
        statusA.textContent = "Menerima Porsi Beban Lebih Kecil";
        statusB.textContent = "Menerima Porsi Beban Lebih Besar";
      }
    }

    // Update Status Kualitatif Balok Bawah
    const qPosEl = document.getElementById('metric-load-position-desc');
    if (qPosEl) {
      if (a < this.span / 2 - 0.3) {
        qPosEl.textContent = "Cenderung Mendekati Tumpuan Kiri (A)";
      } else if (a > this.span / 2 + 0.3) {
        qPosEl.textContent = "Cenderung Mendekati Tumpuan Kanan (B)";
      } else {
        qPosEl.textContent = "Tepat Berada di Tengah Bentang (L/2)";
      }
    }
  }

  // Navigasi Langkah Guided Discovery
  goToStep(stepNum) {
    if (stepNum < 1 || stepNum > this.totalSteps) return;

    // Sembunyikan pane saat ini
    const currentPane = document.getElementById(`step-pane-${this.currentStep}`);
    if (currentPane) currentPane.classList.remove('active');

    // Update Dots
    const oldDot = document.querySelector(`.step-dot[data-step="${this.currentStep}"]`);
    if (oldDot) oldDot.classList.remove('active');

    this.currentStep = stepNum;

    // Tampilkan pane baru
    const newPane = document.getElementById(`step-pane-${this.currentStep}`);
    if (newPane) newPane.classList.add('active');

    const newDot = document.querySelector(`.step-dot[data-step="${this.currentStep}"]`);
    if (newDot) newDot.classList.add('active');

    // Update progress pill
    const pill = document.getElementById('stepper-current-label');
    if (pill) {
      const stepNames = [
        "1. AMATI",
        "2. IDENTIFIKASI",
        "3. PREDIKSI",
        "4. MANIPULASI",
        "5. HITUNG",
        "6. VERIFIKASI",
        "7. REFLEKSI"
      ];
      pill.textContent = `Langkah ${this.currentStep} dari 7: ${stepNames[this.currentStep - 1]}`;
    }

    // Tombol Next & Prev State
    const btnPrev = document.getElementById('btn-step-prev');
    const btnNext = document.getElementById('btn-step-next');
    if (btnPrev) btnPrev.disabled = (this.currentStep === 1);
    if (btnNext) {
      if (this.currentStep === this.totalSteps) {
        btnNext.innerHTML = `Selesai & Buka Kuis <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>`;
      } else {
        btnNext.innerHTML = `Lanjut Langkah Berikutnya <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>`;
      }
    }
  }

  nextStep() {
    if (this.currentStep === this.totalSteps) {
      // Navigasi ke Kuis
      if (window.appRouter) window.appRouter.navigateTo('quiz');
      return;
    }
    this.goToStep(this.currentStep + 1);
  }

  prevStep() {
    if (this.currentStep > 1) {
      this.goToStep(this.currentStep - 1);
    }
  }

  // Tombol "Lihat Petunjuk"
  showHint() {
    const hintBox = document.getElementById('sim-hint-feedback');
    if (!hintBox) return;

    hintBox.classList.remove('attention', 'success');
    hintBox.classList.add('hint', 'show');

    hintBox.innerHTML = `
      <div style="display:flex; align-items:flex-start; gap: 8px;">
        <span style="font-size:1.2rem;">💡</span>
        <div>
          <strong>Petunjuk Konsep Kesetimbangan (Momen Gaya):</strong><br>
          Bayangkan kamu sedang bermain <em>jungkat-jungkit</em> atau memikul beban dengan tongkat kayu. 
          Semakin dekat sebuah beban dengan salah satu tumpuan pundakmu, beban tersebut akan terasa semakin berat di pundak tersebut.<br>
          Dalam hukum Statika: <code>ΣM = Gaya x Lengan (Jarak)</code>. Tumpuan yang berjarak paling dekat dengan titik tangkap beban harus mengerahkan gaya reaksi lawan yang lebih tinggi untuk mencegah struktur terputar!
        </div>
      </div>
    `;
  }

  // Tombol "Verifikasi Jawaban" (Pedagogical Feedback konseptual)
  verifyAnswer() {
    const feedbackBox = document.getElementById('sim-verify-feedback');
    if (!feedbackBox) return;

    if (!this.predictionChoice) {
      feedbackBox.className = 'feedback-box attention show';
      feedbackBox.innerHTML = `
        <strong>⚠️ Pilih Prediksimu Terlebih Dahulu:</strong><br>
        Silakan klik salah satu pilihan prediksi di atas (Tumpuan A, Tumpuan B, atau Sama Besar) sebelum melakukan verifikasi.
      `;
      return;
    }

    const a = this.loadPos;
    const L = this.span;
    let actualDominant = 'equal';
    if (a < L / 2 - 0.2) {
      actualDominant = 'A';
    } else if (a > L / 2 + 0.2) {
      actualDominant = 'B';
    }

    feedbackBox.classList.remove('hint', 'attention', 'success');

    if (this.predictionChoice === actualDominant) {
      feedbackBox.className = 'feedback-box success show';
      feedbackBox.innerHTML = `
        <div style="display:flex; align-items:flex-start; gap:8px;">
          <span style="font-size:1.3rem;">🎯</span>
          <div>
            <strong>Prediksi Kamu Tepat Sekali!</strong><br>
            Respons visual struktur membuktikan pengamatanmu. Ketika beban berada lebih dekat ke 
            <strong>${actualDominant === 'equal' ? 'tengah bentang' : 'Tumpuan ' + actualDominant}</strong>,
            distribusi reaksi tumpuan menghasilkan panah reaksi yang lebih tinggi pada tumpuan terdekat.<br>
            <em>Pelajaran Kunci:</em> Beban gravitasi tidak terbagi rata secara otomatis, melainkan selalu berbanding terbalik dengan jarak lengan momen terhadap masing-masing tumpuan!
          </div>
        </div>
      `;
    } else {
      feedbackBox.className = 'feedback-box attention show';
      feedbackBox.innerHTML = `
        <div style="display:flex; align-items:flex-start; gap:8px;">
          <span style="font-size:1.3rem;">🔍</span>
          <div>
            <strong>Prediksi Kamu Belum Sesuai dengan Perilaku Struktur!</strong><br>
            Coba amati kembali jarak beban terhadap masing-masing tumpuan:<br>
            Saat ini, beban berjarak <strong>${a.toFixed(1)} m dari A</strong> dan <strong>${(L - a).toFixed(1)} m dari B</strong>.<br>
            Perhatikan indikator panah reaksi hijau di atas pilar 3D atau bilah reaksi di bagian atas canvas. Tumpuan yang berjarak lebih dekat ke titik beban selalu menerima gaya yang lebih dominan!
          </div>
        </div>
      `;
    }
  }

  resetSimulation() {
    this.loadPos = 3.0;
    this.loadMag = 50.0;
    this.span = 8.0;

    const posSlider = document.getElementById('slider-load-pos');
    const magSlider = document.getElementById('slider-load-mag');
    const spanSlider = document.getElementById('slider-span-len');

    if (posSlider) posSlider.value = this.loadPos;
    if (magSlider) magSlider.value = this.loadMag;
    if (spanSlider) spanSlider.value = this.span;

    const posVal = document.getElementById('val-load-pos');
    const magVal = document.getElementById('val-load-mag');
    const spanVal = document.getElementById('val-span-len');

    if (posVal) posVal.textContent = `${this.loadPos.toFixed(1)} m`;
    if (magVal) magVal.textContent = `${this.loadMag.toFixed(0)} kN`;
    if (spanVal) spanVal.textContent = `${this.span.toFixed(1)} m`;

    if (this.viewer3D) {
      this.viewer3D.setSpanLength(this.span);
      this.viewer3D.setLoadPosition(this.loadPos);
      this.viewer3D.setLoadMagnitude(this.loadMag);
      this.viewer3D.resetView();
    }

    if (this.diagramController) {
      this.diagramController.update(this.span, this.loadPos, this.loadMag);
    }

    this.updateHUD();
    this.goToStep(1);

    const hintBox = document.getElementById('sim-hint-feedback');
    const verifyBox = document.getElementById('sim-verify-feedback');
    if (hintBox) hintBox.className = 'feedback-box hint';
    if (verifyBox) verifyBox.className = 'feedback-box attention';
  }
}

window.SimulationController = SimulationController;
