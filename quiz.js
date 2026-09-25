/* ==========================================================================
   StructBuild - quiz.js
   Modul Kuis Interaktif Statika Bangunan SMK TKP Fase E
   Soal Berbasis Diagram Visual, Analisis Konstruksi Nyata & Feedback Pedagogis
   ========================================================================== */

const QUIZ_QUESTIONS = [
  {
    id: 1,
    category: "Identifikasi Tumpuan & Konstruksi Nyata",
    question: "Perhatikan diagram tumpuan jembatan di atas. Mengapa salah satu ujung jembatan baja selalu dipasang tumpuan ROL (roller bearing) dan bukan tumpuan SENDI di kedua ujungnya?",
    svgDiagram: `
      <svg viewBox="0 0 500 140" width="100%" height="130">
        <!-- Balok Jembatan Rangka -->
        <rect x="70" y="35" width="360" height="18" fill="#64748b" rx="3"/>
        <line x1="70" y1="44" x2="430" y2="44" stroke="#f59e0b" stroke-width="2"/>
        <!-- Tumpuan Kiri (Sendi) -->
        <polygon points="70,55 52,90 88,90" fill="#0284c7"/>
        <circle cx="70" cy="55" r="4" fill="#fbbf24"/>
        <line x1="45" y1="92" x2="95" y2="92" stroke="#cbd5e1" stroke-width="3"/>
        <!-- Tumpuan Kanan (Rol) -->
        <polygon points="430,55 412,80 448,80" fill="#0284c7"/>
        <circle cx="430" cy="55" r="4" fill="#fbbf24"/>
        <!-- Silinder Rol -->
        <circle cx="420" cy="88" r="6" fill="#fbbf24"/>
        <circle cx="430" cy="88" r="6" fill="#fbbf24"/>
        <circle cx="440" cy="88" r="6" fill="#fbbf24"/>
        <line x1="405" y1="96" x2="455" y2="96" stroke="#cbd5e1" stroke-width="3"/>
        <!-- Label -->
        <text x="70" y="118" fill="#38bdf8" font-size="13" font-weight="bold" text-anchor="middle">Tumpuan Sendi (A)</text>
        <text x="430" y="118" fill="#fbbf24" font-size="13" font-weight="bold" text-anchor="middle">Tumpuan Rol (B)</text>
        <!-- Panah Ekspansi Panas -->
        <path d="M 455 44 L 485 44 M 480 39 L 487 44 L 480 49" stroke="#ef4444" stroke-width="2" fill="none"/>
        <text x="465" y="30" fill="#ef4444" font-size="11" font-weight="bold">ΔL (Suhu)</text>
      </svg>
    `,
    options: [
      { text: "Agar biaya pemasangan jembatan lebih murah karena roda rol lebih ringan dari sendi.", isCorrect: false },
      { text: "Untuk memberikan kebebasan bergerak horizontal saat baja memuai akibat panas matahari, sehingga tidak timbul gaya dorong aksial perusak pada pilar beton.", isCorrect: true },
      { text: "Agar jembatan bisa bergetar dan bergoyang secara bebas ketika dilewati truk bertonase berat.", isCorrect: false },
      { text: "Supaya reaksi tumpuan vertikal di kedua ujung otomatis selalu bernilai nol.", isCorrect: false }
    ],
    explanation: "Tepat sekali! Baja jembatan memuai (bertambah panjang) pada siang hari saat terik matahari. Tumpuan Rol memberikan derajat kebebasan gerak horizontal (RH = 0) sehingga jembatan dapat memuai bebas tanpa mendesak pilar beton pemicu keretakan fatal."
  },
  {
    id: 2,
    category: "Distribusi Reaksi Tumpuan",
    question: "Sebuah balok sederhana bentang 8 meter menerima beban titik terpusat P = 40 kN yang dipindahkan semakin mendekati tumpuan A (jarak ke A = 2 meter, jarak ke B = 6 meter). Apa yang terjadi pada perbandingan reaksi tumpuan?",
    svgDiagram: `
      <svg viewBox="0 0 500 130" width="100%" height="120">
        <!-- Balok -->
        <rect x="60" y="45" width="380" height="14" fill="#64748b"/>
        <!-- Beban P di dekat A -->
        <line x1="155" y1="12" x2="155" y2="43" stroke="#f59e0b" stroke-width="3"/>
        <polygon points="155,45 150,35 160,35" fill="#f59e0b"/>
        <text x="155" y="8" fill="#f59e0b" font-size="12" font-weight="bold" text-anchor="middle">P = 40 kN</text>
        <!-- Dimensi Jarak -->
        <text x="107" y="32" fill="#94a3b8" font-size="11" text-anchor="middle">a = 2 m</text>
        <text x="295" y="32" fill="#94a3b8" font-size="11" text-anchor="middle">b = 6 m</text>
        <!-- Tumpuan A & B -->
        <polygon points="60,60 48,82 72,82" fill="#0284c7"/>
        <polygon points="440,60 428,82 452,82" fill="#0284c7"/>
        <text x="60" y="102" fill="#38bdf8" font-size="12" font-weight="bold" text-anchor="middle">A (Sendi)</text>
        <text x="440" y="102" fill="#fbbf24" font-size="12" font-weight="bold" text-anchor="middle">B (Rol)</text>
      </svg>
    `,
    options: [
      { text: "Reaksi di Tumpuan A dan B tetap sama besar karena bebannya tetap 40 kN.", isCorrect: false },
      { text: "Reaksi di Tumpuan B menjadi lebih besar karena tumpuan rol lebih fleksibel memikul beban.", isCorrect: false },
      { text: "Reaksi di Tumpuan A menjadi jauh lebih besar dibanding Tumpuan B karena jarak beban lebih dekat ke A.", isCorrect: true },
      { text: "Kedua tumpuan tidak mengalami reaksi sama sekali sampai beban dipindahkan ke ujung.", isCorrect: false }
    ],
    explanation: "Benar! Menurut prinsip keseimbangan momen (ΣM = 0), beban terdistribusi berbanding terbalik dengan jaraknya ke tumpuan. RA = P x (b/L) = 40 x (6/8) = 30 kN, sedangkan RB = 40 x (2/8) = 10 kN. Semakin dekat beban ke A, tumpuan A menanggung porsi terbesar (75%)!"
  },
  {
    id: 3,
    category: "Derajat Kebebasan (DOF) Tumpuan",
    question: "Tumpuan JEPIT (Fixed Support) seperti tiang lampu jalan atau kolom gedung yang tertanam dalam lantai memiliki berapa jumlah reaksi perletakan pada bidang 2D?",
    svgDiagram: `
      <svg viewBox="0 0 500 130" width="100%" height="110">
        <!-- Dinding Jepit Vertikal -->
        <rect x="90" y="20" width="22" height="90" fill="#334155"/>
        <line x1="88" y1="20" x2="88" y2="110" stroke="#cbd5e1" stroke-width="2"/>
        <!-- Arsiran Jepit -->
        <line x1="75" y1="35" x2="88" y2="25" stroke="#94a3b8" stroke-width="2"/>
        <line x1="75" y1="55" x2="88" y2="45" stroke="#94a3b8" stroke-width="2"/>
        <line x1="75" y1="75" x2="88" y2="65" stroke="#94a3b8" stroke-width="2"/>
        <line x1="75" y1="95" x2="88" y2="85" stroke="#94a3b8" stroke-width="2"/>
        <!-- Balok Kantilever -->
        <rect x="112" y="55" width="260" height="20" fill="#64748b"/>
        <!-- Panah Reaksi 3 Komponen -->
        <!-- Rv -->
        <path d="M 125 110 L 125 80 M 121 86 L 125 78 L 129 86" stroke="#10b981" stroke-width="2.5" fill="none"/>
        <text x="145" y="105" fill="#10b981" font-size="12" font-weight="bold">RV</text>
        <!-- Rh -->
        <path d="M 60 65 L 90 65 M 84 61 L 92 65 L 84 69" stroke="#38bdf8" stroke-width="2.5" fill="none"/>
        <text x="50" y="55" fill="#38bdf8" font-size="12" font-weight="bold">RH</text>
        <!-- Momen Jepit M -->
        <path d="M 140 40 A 18 18 0 1 1 125 58" stroke="#f59e0b" stroke-width="2.5" fill="none"/>
        <polygon points="120,58 128,62 126,52" fill="#f59e0b"/>
        <text x="150" y="35" fill="#f59e0b" font-size="12" font-weight="bold">M (Momen)</text>
      </svg>
    `,
    options: [
      { text: "1 Reaksi (Hanya Reaksi Vertikal RV).", isCorrect: false },
      { text: "2 Reaksi (Reaksi Vertikal RV dan Reaksi Horizontal RH).", isCorrect: false },
      { text: "3 Reaksi (Reaksi Vertikal RV, Reaksi Horizontal RH, dan Momen Tahanan M).", isCorrect: true },
      { text: "Tidak ada reaksi sama sekali karena strukturnya bebas bergerak.", isCorrect: false }
    ],
    explanation: "Luar biasa! Tumpuan Jepit mengunci semua pergerakan (translasi vertikal, translasi horizontal, dan rotasi putar), sehingga timbul 3 reaksi perletakan: RV, RH, dan Momen Jepit M. Inilah alasan mengapa balok kantilever kanopi bisa berdiri kokoh meski hanya ditumpu di satu sisi!"
  },
  {
    id: 4,
    category: "Diagram Gaya Lintang (V) & Momen (M)",
    question: "Perhatikan diagram gaya lintang (V) di bawah ini. Di manakah letak titik di mana nilai Momen Lentur (M) mencapai nilai MAKSIMUM pada balok?",
    svgDiagram: `
      <svg viewBox="0 0 500 130" width="100%" height="110">
        <!-- Sumbu Netral -->
        <line x1="60" y1="65" x2="440" y2="65" stroke="#475569" stroke-width="1.5" stroke-dasharray="4,4"/>
        <!-- Kontur Diagram Gaya Lintang -->
        <path d="M 60 65 L 60 25 L 230 25 L 230 95 L 440 95 L 440 65" stroke="#38bdf8" stroke-width="2.5" fill="none"/>
        <text x="145" y="45" fill="#38bdf8" font-size="14" font-weight="bold">(+)</text>
        <text x="335" y="85" fill="#ef4444" font-size="14" font-weight="bold">(-)</text>
        <!-- Titik Potong Nol -->
        <circle cx="230" cy="65" r="5" fill="#fbbf24"/>
        <text x="230" y="80" fill="#fbbf24" font-size="11" font-weight="bold" text-anchor="middle">V = 0 (Titik Potong Nol)</text>
      </svg>
    `,
    options: [
      { text: "Tepat di ujung balok pada Tumpuan A.", isCorrect: false },
      { text: "Tepat pada titik di mana Gaya Lintang (V) memotong sumbu netral / bernilai nol (V = 0).", isCorrect: true },
      { text: "Di titik dengan gaya lintang paling negatif di dekat tumpuan B.", isCorrect: false },
      { text: "Momen lentur selalu konstan di seluruh panjang bentang balok.", isCorrect: false }
    ],
    explanation: "Hebat! Secara matematis dan mekanika teknik, laju perubahan momen adalah gaya lintang (dM/dx = V). Maka, ketika gaya lintang V = 0 (atau saat terjadi pergantian tanda dari positif ke negatif di bawah beban terpusat), momen lentur balok berada pada titik puncak ekstrem MAKSIMUM!"
  },
  {
    id: 5,
    category: "Penyaluran Beban Konstruksi Lapangan",
    question: "Dalam konstruksi gedung bertingkat nyata, urutan penyaluran beban gravitasi dari lantai menuju tanah keras yang benar adalah...",
    svgDiagram: `
      <svg viewBox="0 0 500 110" width="100%" height="90">
        <rect x="20" y="30" width="80" height="40" rx="6" fill="#1e293b" stroke="#38bdf8"/>
        <text x="60" y="55" fill="#f8fafc" font-size="11" font-weight="bold" text-anchor="middle">1. Beban</text>
        <path d="M 105 50 L 125 50" stroke="#f59e0b" stroke-width="2"/>
        <rect x="130" y="30" width="75" height="40" rx="6" fill="#1e293b" stroke="#38bdf8"/>
        <text x="167" y="55" fill="#f8fafc" font-size="11" font-weight="bold" text-anchor="middle">2. Pelat</text>
        <path d="M 210 50 L 230 50" stroke="#f59e0b" stroke-width="2"/>
        <rect x="235" y="30" width="75" height="40" rx="6" fill="#1e293b" stroke="#38bdf8"/>
        <text x="272" y="55" fill="#f8fafc" font-size="11" font-weight="bold" text-anchor="middle">3. Balok</text>
        <path d="M 315 50 L 335 50" stroke="#f59e0b" stroke-width="2"/>
        <rect x="340" y="30" width="70" height="40" rx="6" fill="#1e293b" stroke="#38bdf8"/>
        <text x="375" y="55" fill="#f8fafc" font-size="11" font-weight="bold" text-anchor="middle">4. Kolom</text>
        <path d="M 415 50 L 435 50" stroke="#f59e0b" stroke-width="2"/>
        <rect x="440" y="30" width="55" height="40" rx="6" fill="#1e293b" stroke="#10b981"/>
        <text x="467" y="55" fill="#6ee7b7" font-size="10" font-weight="bold" text-anchor="middle">Pondasi</text>
      </svg>
    `,
    options: [
      { text: "Beban Hidup/Mati → Pelat Lantai → Balok → Kolom → Pondasi → Tanah Keras.", isCorrect: true },
      { text: "Beban → Kolom → Pelat Lantai → Balok → Pondasi.", isCorrect: false },
      { text: "Pondasi → Kolom → Balok → Pelat Lantai → Beban.", isCorrect: false },
      { text: "Beban → Dinding Pasangan Bata → Balok → Pelat Lantai.", isCorrect: false }
    ],
    explanation: "Tepat sekali! Ini adalah rantai penyaluran beban (load path) fundamental dalam Teknik Konstruksi dan Perumahan. Beban bekerja di atas pelat lantai, disalurkan ke balok anak & balok induk, diteruskan ke kolom vertikal sebagai gaya tekan, kemudian ditumpukan ke pondasi paku bumi/footing ke tanah keras!"
  },
  {
    id: 6,
    category: "Studi Kasus Kegagalan Balok Beton",
    question: "Pada balok beton bertulang sederhana yang menumpu di atas dua tumpuan (sendi-rol), retakan lentur akibat beban berlebih paling pertama muncul pada bagian mana dan mengapa?",
    svgDiagram: `
      <svg viewBox="0 0 500 130" width="100%" height="110">
        <!-- Balok Melengkung Ke Bawah -->
        <rect x="70" y="40" width="360" height="30" fill="#64748b" rx="2"/>
        <!-- Retak Lentur di Bawah Tengah Bentang -->
        <line x1="240" y1="70" x2="240" y2="55" stroke="#ef4444" stroke-width="3"/>
        <line x1="250" y1="70" x2="250" y2="50" stroke="#ef4444" stroke-width="3"/>
        <line x1="260" y1="70" x2="260" y2="57" stroke="#ef4444" stroke-width="3"/>
        <text x="250" y="98" fill="#ef4444" font-size="11" font-weight="bold" text-anchor="middle">Retak Tarik Bawah (Zona Tarik)</text>
        <text x="250" y="32" fill="#38bdf8" font-size="11" font-weight="bold" text-anchor="middle">Zona Tekan Atas (Beton Menahan Tekan)</text>
      </svg>
    `,
    options: [
      { text: "Pada serat atas tengah bentang, karena beton sangat lemah menahan gaya tekan.", isCorrect: false },
      { text: "Pada serat bawah di tengah bentang, karena beton lemah terhadap gaya tarik akibat momen positif, sehingga wajib dipasang tulangan baja di bagian bawah.", isCorrect: true },
      { text: "Di kedua ujung tumpuan, karena momen lentur di sendi bernilai tak terhingga.", isCorrect: false },
      { text: "Balok beton tidak akan pernah retak karena beton memiliki kekuatan tak terbatas.", isCorrect: false }
    ],
    explanation: "Sangat benar! Beton memiliki sifat kuat tekan yang sangat tinggi, namun SANGAT LEMAH terhadap gaya tarik (hanya sekitar 10% dari kuat tekannya). Karena balok melentur ke bawah, serat bawah mengalami regangan tarik maksimum sehingga wajib diperkuat dengan tulangan tarik baja di sisi bawah balok!"
  }
];

class QuizController {
  constructor() {
    this.questions = QUIZ_QUESTIONS;
    this.currentIndex = 0;
    this.userAnswers = {};
    this.score = 0;

    this.init();
  }

  init() {
    this.renderQuestion();
  }

  renderQuestion() {
    const q = this.questions[this.currentIndex];
    if (!q) return;

    // Counter
    const counterEl = document.getElementById('quiz-counter-text');
    if (counterEl) counterEl.textContent = `Soal ${this.currentIndex + 1} dari ${this.questions.length}`;

    const catEl = document.getElementById('quiz-cat-text');
    if (catEl) catEl.textContent = q.category;

    // Diagram SVG
    const diagramEl = document.getElementById('quiz-diagram-case');
    if (diagramEl) diagramEl.innerHTML = q.svgDiagram;

    // Teks Soal
    const questionTextEl = document.getElementById('quiz-question-title');
    if (questionTextEl) questionTextEl.textContent = q.question;

    // Pilihan Jawaban
    const optionsContainer = document.getElementById('quiz-options-container');
    if (optionsContainer) {
      optionsContainer.innerHTML = '';
      const letters = ['A', 'B', 'C', 'D'];

      q.options.forEach((opt, idx) => {
        const item = document.createElement('div');
        item.className = 'quiz-option-item';
        item.innerHTML = `
          <div class="option-prefix">${letters[idx]}</div>
          <div class="option-content">${opt.text}</div>
        `;

        item.addEventListener('click', () => this.handleSelectOption(idx, item));
        optionsContainer.appendChild(item);
      });
    }

    // Reset Box Penjelasan
    const explBox = document.getElementById('quiz-explanation-panel');
    if (explBox) {
      explBox.className = 'quiz-explanation-box';
      explBox.innerHTML = '';
    }

    // Tombol Lanjut Soal
    const btnNextQ = document.getElementById('btn-quiz-next');
    if (btnNextQ) {
      btnNextQ.style.display = 'none';
      btnNextQ.onclick = () => this.nextQuestion();
    }
  }

  handleSelectOption(selectedIndex, element) {
    const q = this.questions[this.currentIndex];
    if (this.userAnswers[this.currentIndex] !== undefined) return; // Cegah ganti jawaban berulang

    this.userAnswers[this.currentIndex] = selectedIndex;
    const isCorrect = q.options[selectedIndex].isCorrect;
    if (isCorrect) this.score++;

    // Tampilkan styling Benar / Salah pada pilihan
    const allOptions = document.querySelectorAll('.quiz-option-item');
    allOptions.forEach((optEl, idx) => {
      if (q.options[idx].isCorrect) {
        optEl.classList.add('correct');
      } else if (idx === selectedIndex) {
        optEl.classList.add('incorrect');
      }
    });

    // Munculkan Feedback Pedagogis Terperinci
    const explBox = document.getElementById('quiz-explanation-panel');
    if (explBox) {
      explBox.className = 'quiz-explanation-box show';
      explBox.innerHTML = `
        <h5>
          ${isCorrect ? '✅ Jawaban Kamu Benar!' : '❌ Jawaban Kamu Belum Tepat'}
        </h5>
        <p>${q.explanation}</p>
      `;
    }

    // Munculkan tombol Lanjut Soal
    const btnNextQ = document.getElementById('btn-quiz-next');
    if (btnNextQ) {
      btnNextQ.style.display = 'inline-flex';
      if (this.currentIndex === this.questions.length - 1) {
        btnNextQ.textContent = 'Lihat Rekapitulasi Nilai & Badge Progres';
      } else {
        btnNextQ.textContent = 'Lanjut ke Soal Berikutnya';
      }
    }

    // Simpan progres ke local storage
    if (window.learningProgress) {
      window.learningProgress.recordQuizAnswer(this.currentIndex, isCorrect);
    }
  }

  nextQuestion() {
    if (this.currentIndex < this.questions.length - 1) {
      this.currentIndex++;
      this.renderQuestion();
    } else {
      this.showQuizSummary();
    }
  }

  showQuizSummary() {
    const quizCard = document.querySelector('.quiz-card');
    if (!quizCard) return;

    const total = this.questions.length;
    const finalScore = Math.round((this.score / total) * 100);

    quizCard.innerHTML = `
      <div style="text-align: center; padding: 24px 0;">
        <div style="font-size: 3.5rem; margin-bottom: 12px;">🏆</div>
        <h2 style="font-size: 1.8rem; font-weight: 800; color: #fff; margin-bottom: 8px;">Kuis Statika Selesai!</h2>
        <p style="color: #94a3b8; font-size: 1rem; margin-bottom: 24px;">Kamu telah menyelesaikan seluruh tantangan kasus Statika Bangunan.</p>
        
        <div style="display: inline-block; background: #090e18; border: 2px solid #f59e0b; border-radius: 16px; padding: 24px 48px; margin-bottom: 28px;">
          <div style="font-size: 0.85rem; text-transform: uppercase; color: #94a3b8; font-weight: 700;">Skor Akhir Kamu</div>
          <div style="font-size: 3.5rem; font-weight: 900; color: #fbbf24;">${finalScore}</div>
          <div style="font-size: 0.9rem; color: #10b981; font-weight: 600;">(${this.score} dari ${total} Soal Terjawab Benar)</div>
        </div>

        <div style="display: flex; justify-content: center; gap: 16px; flex-wrap: wrap;">
          <button class="btn-primary" onclick="window.quizController.restartQuiz()">
            Ulangi Kuis
          </button>
          <button class="btn-secondary" onclick="window.appRouter.navigateTo('progress')">
            Buka Halaman Progres Belajar
          </button>
        </div>
      </div>
    `;

    if (window.learningProgress) {
      window.learningProgress.setFinalScore(finalScore);
    }
  }

  restartQuiz() {
    this.currentIndex = 0;
    this.userAnswers = {};
    this.score = 0;
    location.reload();
  }
}

window.QuizController = QuizController;
