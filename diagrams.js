/* ==========================================================================
   StructBuild - diagrams.js
   Visualisasi Interaktif Bidang Gaya Dalam: Normal (N), Lintang (V), dan Momen (M)
   Fokus pada Perubahan Bentuk Diagram & Pemahaman Fisik Konstruksi
   ========================================================================== */

class InternalForcesDiagrams {
  constructor() {
    this.canvasN = document.getElementById('canvas-diag-n');
    this.canvasV = document.getElementById('canvas-diag-v');
    this.canvasM = document.getElementById('canvas-diag-m');

    this.span = 8.0;
    this.loadPos = 3.0;
    this.loadMag = 50.0;

    this.init();
  }

  init() {
    window.addEventListener('resize', () => this.renderAll());
    this.renderAll();
  }

  update(span, loadPos, loadMag) {
    this.span = span;
    this.loadPos = loadPos;
    this.loadMag = loadMag;
    this.renderAll();
  }

  renderAll() {
    this.drawNormalDiagram();
    this.drawShearDiagram();
    this.drawMomentDiagram();
  }

  // Helper untuk setup Canvas dengan dukungan layar Retina / High DPI
  setupCanvas(canvas) {
    if (!canvas) return null;
    const parent = canvas.parentElement;
    const width = parent.clientWidth || 600;
    const height = parent.clientHeight || 160;
    const dpr = window.devicePixelRatio || 1;

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    const ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);
    return { ctx, width, height };
  }

  // 1. BIDANG GAYA NORMAL (N)
  drawNormalDiagram() {
    const res = this.setupCanvas(this.canvasN);
    if (!res) return;
    const { ctx, width, height } = res;

    ctx.clearRect(0, 0, width, height);

    const padX = 50;
    const drawW = width - 2 * padX;
    const midY = height / 2;

    // Sumbu Netral Balok
    this.drawBeamReference(ctx, padX, drawW, midY);

    // Karena beban 100% vertikal gravitasi, Gaya Normal N = 0
    ctx.strokeStyle = '#c084fc';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(padX, midY);
    ctx.lineTo(padX + drawW, midY);
    ctx.stroke();

    // Label Penjelas Kualitatif
    ctx.fillStyle = '#94a3b8';
    ctx.font = '600 13px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('N = 0 (Tidak ada beban aksial horizontal sejajar sumbu balok)', width / 2, midY - 20);

    this.drawSupportSymbols(ctx, padX, drawW, midY);
  }

  // 2. BIDANG GAYA LINTANG / GESER (V atau D)
  drawShearDiagram() {
    const res = this.setupCanvas(this.canvasV);
    if (!res) return;
    const { ctx, width, height } = res;

    ctx.clearRect(0, 0, width, height);

    const padX = 50;
    const drawW = width - 2 * padX;
    const midY = height / 2;

    this.drawBeamReference(ctx, padX, drawW, midY);

    const a = this.loadPos;
    const b = this.span - a;
    const L = this.span;

    // Proporsi Reaksi (Kualitatif)
    const propA = b / L; // Positif (Naik di A)
    const propB = a / L; // Negatif (Turun di B)

    // Tinggi skala visual
    const maxH = (height / 2) - 25;
    const hA = propA * maxH;
    const hB = propB * maxH;

    const xLoad = padX + (a / L) * drawW;

    // Wilayah Positif (+) dari Tumpuan A ke Titik Beban
    ctx.fillStyle = 'rgba(14, 165, 233, 0.2)';
    ctx.beginPath();
    ctx.moveTo(padX, midY);
    ctx.lineTo(padX, midY - hA);
    ctx.lineTo(xLoad, midY - hA);
    ctx.lineTo(xLoad, midY);
    ctx.closePath();
    ctx.fill();

    // Wilayah Negatif (-) dari Titik Beban ke Tumpuan B
    ctx.fillStyle = 'rgba(239, 68, 68, 0.2)';
    ctx.beginPath();
    ctx.moveTo(xLoad, midY);
    ctx.lineTo(xLoad, midY + hB);
    ctx.lineTo(padX + drawW, midY + hB);
    ctx.lineTo(padX + drawW, midY);
    ctx.closePath();
    ctx.fill();

    // Garis Kontur Diagram V
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(padX, midY);
    ctx.lineTo(padX, midY - hA); // Loncat naik sebesar RA
    ctx.lineTo(xLoad, midY - hA); // Konstan
    ctx.lineTo(xLoad, midY + hB); // Loncat turun sebesar P
    ctx.lineTo(padX + drawW, midY + hB); // Konstan
    ctx.lineTo(padX + drawW, midY); // Loncat naik sebesar RB menutup ke 0
    ctx.stroke();

    // Garis Arsir Vertikal (Hatching)
    this.drawHatching(ctx, padX, xLoad, midY, midY - hA, 'rgba(56, 189, 248, 0.4)');
    this.drawHatching(ctx, xLoad, padX + drawW, midY, midY + hB, 'rgba(248, 113, 113, 0.4)');

    // Tanda (+) dan (-)
    ctx.font = 'bold 16px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#38bdf8';
    ctx.fillText('(+)', (padX + xLoad) / 2, midY - (hA / 2) + 6);

    ctx.fillStyle = '#f87171';
    ctx.fillText('(-)', (xLoad + padX + drawW) / 2, midY + (hB / 2) + 6);

    // Keterangan Lompatan Gaya Geser
    ctx.font = '600 11px sans-serif';
    ctx.fillStyle = '#94a3b8';
    ctx.fillText('Loncat Naik (Reaksi A)', padX, midY - hA - 8);
    ctx.fillText('Loncat Naik (Reaksi B)', padX + drawW, midY + hB + 16);

    this.drawSupportSymbols(ctx, padX, drawW, midY);
  }

  // 3. BIDANG MOMEN LENTUR (M)
  drawMomentDiagram() {
    const res = this.setupCanvas(this.canvasM);
    if (!res) return;
    const { ctx, width, height } = res;

    ctx.clearRect(0, 0, width, height);

    const padX = 50;
    const drawW = width - 2 * padX;
    const topY = 35; // Garis sumbu balok di bagian atas (karena momen positif ditarik ke bawah)

    this.drawBeamReference(ctx, padX, drawW, topY);

    const a = this.loadPos;
    const b = this.span - a;
    const L = this.span;

    // Momen Maksimum terjadi tepat di bawah beban: M_max = (P * a * b) / L
    const normalizedMoment = (a * b) / (L * L * 0.25); // 1.0 jika di tengah
    const maxH = height - 70;
    const peakH = normalizedMoment * maxH * 0.9;

    const xLoad = padX + (a / L) * drawW;
    const peakY = topY + Math.max(20, peakH);

    // Area Arsiran Momen Segitiga
    ctx.fillStyle = 'rgba(245, 158, 11, 0.22)';
    ctx.beginPath();
    ctx.moveTo(padX, topY);
    ctx.lineTo(xLoad, peakY);
    ctx.lineTo(padX + drawW, topY);
    ctx.closePath();
    ctx.fill();

    // Garis Kontur Momen Lentur
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(padX, topY);
    ctx.lineTo(xLoad, peakY);
    ctx.lineTo(padX + drawW, topY);
    ctx.stroke();

    // Arsir Momen Lentur
    const step = 14;
    ctx.strokeStyle = 'rgba(245, 158, 11, 0.35)';
    ctx.lineWidth = 1.5;
    for (let x = padX + step; x < padX + drawW; x += step) {
      let yCurve = topY;
      if (x <= xLoad) {
        yCurve = topY + ((x - padX) / (xLoad - padX)) * (peakY - topY);
      } else {
        yCurve = topY + ((padX + drawW - x) / (padX + drawW - xLoad)) * (peakY - topY);
      }
      ctx.beginPath();
      ctx.moveTo(x, topY);
      ctx.lineTo(x, yCurve);
      ctx.stroke();
    }

    // Tanda Titik Momen Maksimum
    ctx.fillStyle = '#fbbf24';
    ctx.beginPath();
    ctx.arc(xLoad, peakY, 5, 0, Math.PI * 2);
    ctx.fill();

    // Keterangan Fisik: Momen Maksimum di Bawah Titik Beban
    ctx.font = 'bold 12px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Momen Maksimum (M_max)', xLoad, peakY + 18);
    ctx.font = '500 11px sans-serif';
    ctx.fillStyle = '#94a3b8';
    ctx.fillText('Serat bawah balok tertarik (butuh tulangan baja)', xLoad, peakY + 32);

    this.drawSupportSymbols(ctx, padX, drawW, topY);
  }

  // Gambar Garis Sumbu Acuan Balok
  drawBeamReference(ctx, x, w, y) {
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(x - 20, y);
    ctx.lineTo(x + w + 20, y);
    ctx.stroke();
    ctx.setLineDash([]);
  }

  // Gambar Simbol Tumpuan A dan B di Canvas 2D
  drawSupportSymbols(ctx, padX, drawW, y) {
    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 12px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('A (Sendi)', padX, y + 26);

    ctx.fillStyle = '#fbbf24';
    ctx.fillText('B (Rol)', padX + drawW, y + 26);
  }

  // Gambar Garis Arsir Vertikal Diagram
  drawHatching(ctx, x1, x2, yBase, yTarget, color) {
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.2;
    const step = 12;
    for (let x = x1 + step; x < x2; x += step) {
      ctx.beginPath();
      ctx.moveTo(x, yBase);
      ctx.lineTo(x, yTarget);
      ctx.stroke();
    }
  }
}

window.InternalForcesDiagrams = InternalForcesDiagrams;
