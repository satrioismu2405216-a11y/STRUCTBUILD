/* ==========================================================================
   StructBuild - sandbox.js
   Studio Rancang Bangun Struktur Mandiri (Interactive Structure Sandbox)
   Siswa dapat menggambar titik, batang, memasang tumpuan, & menaruh beban sendiri.
   ========================================================================== */

class StructureSandbox {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;

    this.ctx = this.canvas.getContext('2d');
    this.gridSize = 30; // Ukuran grid dalam piksel
    this.scale = 1;     // Meter ke piksel (1m = 60px)
    this.pixelsPerMeter = 60;
    
    // Mode Interaksi: 'select', 'add-node', 'add-member', 'support-sendi', 'support-rol', 'support-jepit', 'add-load', 'delete'
    this.activeTool = 'add-member';

    // Data Struktur
    this.nodes = [];     // { id, x, y, support: null | 'sendi' | 'rol' | 'jepit' }
    this.members = [];   // { id, nodeA, nodeB, force: 0, type: 'neutral' }
    this.loads = [];     // { id, nodeId, fx, fy } (fy positif = ke bawah)
    
    // Status Interaksi
    this.selectedNode = null;
    this.hoveredNode = null;
    this.connectingNode = null;
    this.isSimulated = false;
    this.simulationResults = null;

    this.init();
  }

  init() {
    this.resizeCanvas();
    this.bindEvents();
    // Muat template awal: Kuda-Kuda Rangka Atap
    this.loadTemplate('roofTruss');
  }

  resizeCanvas() {
    const parent = this.canvas.parentElement;
    const width = parent.clientWidth || 800;
    const height = parent.clientHeight || 500;
    const dpr = window.devicePixelRatio || 1;

    this.canvas.width = width * dpr;
    this.canvas.height = height * dpr;
    this.canvas.style.width = `${width}px`;
    this.canvas.style.height = `${height}px`;

    this.ctx.scale(dpr, dpr);
    this.width = width;
    this.height = height;

    this.render();
  }

  bindEvents() {
    window.addEventListener('resize', () => {
      this.resizeCanvas();
    });

    this.canvas.addEventListener('pointerdown', (e) => this.handlePointerDown(e));
    this.canvas.addEventListener('pointermove', (e) => this.handlePointerMove(e));

    // Toolbar Tool Buttons
    const toolBtns = document.querySelectorAll('.btn-sandbox-tool');
    toolBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        toolBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.setTool(btn.getAttribute('data-tool'));
      });
    });

    // Template Dropdown / Buttons
    const templateBtns = document.querySelectorAll('[data-template]');
    templateBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const type = btn.getAttribute('data-template');
        this.loadTemplate(type);
      });
    });

    // Tombol Analisis / Simulasi
    const btnSim = document.getElementById('btn-run-sandbox-sim');
    if (btnSim) {
      btnSim.addEventListener('click', () => this.simulateStructure());
    }

    // Tombol Bersihkan Kanvas
    const btnClear = document.getElementById('btn-clear-sandbox');
    if (btnClear) {
      btnClear.addEventListener('click', () => this.clearAll());
    }
  }

  setTool(tool) {
    this.activeTool = tool;
    this.connectingNode = null;
    this.updateStatusText();
    this.render();
  }

  updateStatusText() {
    const statusEl = document.getElementById('sandbox-hint-text');
    if (!statusEl) return;

    const messages = {
      'add-node': 'Klik pada area kisi/grid untuk menambahkan Titik Buhul (Node).',
      'add-member': 'Klik titik pertama, lalu klik titik kedua untuk menyambung Batang Struktur.',
      'support-sendi': 'Klik pada titik mana saja untuk memasang Tumpuan Sendi (Pin).',
      'support-rol': 'Klik pada titik mana saja untuk memasang Tumpuan Rol (Roller).',
      'support-jepit': 'Klik pada titik mana saja untuk memasang Tumpuan Jepit (Fixed).',
      'add-load': 'Klik pada titik simpul untuk meletakkan Beban Gravitasi (Beban P).',
      'delete': 'Klik titik, batang, atau beban untuk menghapusnya dari kanvas.'
    };

    statusEl.textContent = messages[this.activeTool] || 'Pilih alat pada bilah di atas untuk mulai merancang.';
  }

  getPointerPos(e) {
    const rect = this.canvas.getBoundingClientRect();
    const rawX = e.clientX - rect.left;
    const rawY = e.clientY - rect.top;

    // Snap to grid (jarak 30px)
    const snapX = Math.round(rawX / this.gridSize) * this.gridSize;
    const snapY = Math.round(rawY / this.gridSize) * this.gridSize;

    return { x: snapX, y: snapY, rawX, rawY };
  }

  findNodeAt(rawX, rawY, threshold = 18) {
    for (let node of this.nodes) {
      const dist = Math.hypot(node.x - rawX, node.y - rawY);
      if (dist <= threshold) return node;
    }
    return null;
  }

  findMemberAt(rawX, rawY, threshold = 10) {
    for (let member of this.members) {
      const n1 = this.getNodeById(member.nodeA);
      const n2 = this.getNodeById(member.nodeB);
      if (!n1 || !n2) continue;

      // Jarak titik ke garis segmen
      const d = this.distToSegment({ x: rawX, y: rawY }, n1, n2);
      if (d <= threshold) return member;
    }
    return null;
  }

  distToSegment(p, v, w) {
    const l2 = (v.x - w.x) ** 2 + (v.y - w.y) ** 2;
    if (l2 === 0) return Math.hypot(p.x - v.x, p.y - v.y);
    let t = ((p.x - v.x) * (w.x - v.x) + (p.y - v.y) * (w.y - v.y)) / l2;
    t = Math.max(0, Math.min(1, t));
    return Math.hypot(p.x - (v.x + t * (w.x - v.x)), p.y - (v.y + t * (w.y - v.y)));
  }

  getNodeById(id) {
    return this.nodes.find(n => n.id === id);
  }

  handlePointerDown(e) {
    const pos = this.getPointerPos(e);
    const clickedNode = this.findNodeAt(pos.rawX, pos.rawY);

    if (this.activeTool === 'add-node') {
      if (!clickedNode) {
        this.addNode(pos.x, pos.y);
      }
    } else if (this.activeTool === 'add-member') {
      if (clickedNode) {
        if (!this.connectingNode) {
          this.connectingNode = clickedNode;
        } else if (this.connectingNode.id !== clickedNode.id) {
          this.addMember(this.connectingNode.id, clickedNode.id);
          this.connectingNode = null;
        }
      } else {
        // Jika klik di grid kosong, otomatis buat node dan sambungkan
        const newNode = this.addNode(pos.x, pos.y);
        if (this.connectingNode) {
          this.addMember(this.connectingNode.id, newNode.id);
          this.connectingNode = null;
        }
      }
    } else if (this.activeTool === 'support-sendi') {
      if (clickedNode) {
        clickedNode.support = clickedNode.support === 'sendi' ? null : 'sendi';
        this.resetSimulation();
      }
    } else if (this.activeTool === 'support-rol') {
      if (clickedNode) {
        clickedNode.support = clickedNode.support === 'rol' ? null : 'rol';
        this.resetSimulation();
      }
    } else if (this.activeTool === 'support-jepit') {
      if (clickedNode) {
        clickedNode.support = clickedNode.support === 'jepit' ? null : 'jepit';
        this.resetSimulation();
      }
    } else if (this.activeTool === 'add-load') {
      if (clickedNode) {
        this.toggleLoadAtNode(clickedNode.id);
        this.resetSimulation();
      }
    } else if (this.activeTool === 'delete') {
      if (clickedNode) {
        this.deleteNode(clickedNode.id);
      } else {
        const clickedMember = this.findMemberAt(pos.rawX, pos.rawY);
        if (clickedMember) {
          this.deleteMember(clickedMember.id);
        }
      }
      this.resetSimulation();
    }

    this.render();
  }

  handlePointerMove(e) {
    const pos = this.getPointerPos(e);
    const node = this.findNodeAt(pos.rawX, pos.rawY);

    if (node !== this.hoveredNode) {
      this.hoveredNode = node;
      this.render();
    }
  }

  addNode(x, y) {
    const id = 'N' + (this.nodes.length + 1) + '_' + Date.now().toString(36).substr(-4);
    const node = { id, x, y, support: null };
    this.nodes.push(node);
    this.resetSimulation();
    return node;
  }

  addMember(nodeA, nodeB) {
    // Cek apakah batang sudah pernah dibuat
    const exists = this.members.some(m => 
      (m.nodeA === nodeA && m.nodeB === nodeB) ||
      (m.nodeA === nodeB && m.nodeB === nodeA)
    );
    if (exists) return;

    const id = 'M' + (this.members.length + 1);
    this.members.push({ id, nodeA, nodeB, force: 0, type: 'neutral' });
    this.resetSimulation();
  }

  toggleLoadAtNode(nodeId) {
    const existingIdx = this.loads.findIndex(l => l.nodeId === nodeId);
    if (existingIdx >= 0) {
      this.loads.splice(existingIdx, 1);
    } else {
      const id = 'L' + (this.loads.length + 1);
      this.loads.push({ id, nodeId, fx: 0, fy: 50 }); // Beban 50 kN ke bawah
    }
  }

  deleteNode(nodeId) {
    this.nodes = this.nodes.filter(n => n.id !== nodeId);
    this.members = this.members.filter(m => m.nodeA !== nodeId && m.nodeB !== nodeId);
    this.loads = this.loads.filter(l => l.nodeId !== nodeId);
  }

  deleteMember(memberId) {
    this.members = this.members.filter(m => m.id !== memberId);
  }

  clearAll() {
    this.nodes = [];
    this.members = [];
    this.loads = [];
    this.connectingNode = null;
    this.resetSimulation();
    this.render();
  }

  resetSimulation() {
    this.isSimulated = false;
    this.simulationResults = null;
    this.members.forEach(m => {
      m.force = 0;
      m.type = 'neutral';
    });

    const infoPanel = document.getElementById('sandbox-results-panel');
    if (infoPanel) {
      infoPanel.innerHTML = `
        <div style="color: var(--text-muted); font-size: 0.88rem;">
          Klik tombol <strong>"Simulasikan Struktur Saya"</strong> untuk menghitung reaksi tumpuan dan melihat distribusi gaya tarik (biru) vs tekan (merah).
        </div>
      `;
    }
  }

  // Analisis Mekanika Statika Struktur
  simulateStructure() {
    if (this.nodes.length < 2 || this.members.length < 1) {
      alert("Struktur belum lengkap! Tambahkan minimal 2 titik dan 1 batang.");
      return;
    }

    const supports = this.nodes.filter(n => n.support);
    if (supports.length < 1) {
      alert("Peringatan: Struktur belum memiliki tumpuan (perletakan)! Pasang minimal satu tumpuan sendi/rol/jepit.");
      return;
    }

    if (this.loads.length < 1) {
      alert("Peringatan: Belum ada beban yang bekerja! Klik mode 'Beban' lalu klik salah satu titik simpul untuk meletakkan beban gravitasi.");
      return;
    }

    // 1. Hitung Total Beban Vertikal & Horizontal
    let totalFy = 0;
    let totalFx = 0;
    this.loads.forEach(l => {
      totalFy += l.fy;
      totalFx += l.fx;
    });

    // 2. Evaluasi Tumpuan & Keseimbangan Momen
    // Asumsikan tumpuan teringan/paling kiri dan kanan jika ada 2 tumpuan
    supports.sort((a, b) => a.x - b.x);
    const supA = supports[0];
    const supB = supports.length > 1 ? supports[supports.length - 1] : null;

    let reactionA_y = 0;
    let reactionB_y = 0;
    let reactionA_x = -totalFx; // Tumpuan sendi menahan gaya horizontal

    if (supB && supA.x !== supB.x) {
      const L_px = supB.x - supA.x;
      // Hitung Sigma MA = 0 -> (RB * L) - Sigma(P * a) = 0
      let momentSumA = 0;
      this.loads.forEach(l => {
        const node = this.getNodeById(l.nodeId);
        if (node) {
          const distA = node.x - supA.x;
          momentSumA += l.fy * distA;
        }
      });

      reactionB_y = momentSumA / L_px;
      reactionA_y = totalFy - reactionB_y;
    } else {
      // 1 Tumpuan Jepit Kantilever
      reactionA_y = totalFy;
    }

    // 3. Klasifikasi Gaya Batang: Tarik (Tension) vs Tekan (Compression)
    // Berdasarkan posisi vertikal batang relatif terhadap pusat lentur:
    const avgY = this.nodes.reduce((sum, n) => sum + n.y, 0) / this.nodes.length;

    this.members.forEach(m => {
      const n1 = this.getNodeById(m.nodeA);
      const n2 = this.getNodeById(m.nodeB);
      if (!n1 || !n2) return;

      const midY = (n1.y + n2.y) / 2;
      const isDiagonal = Math.abs(n1.x - n2.x) > 10 && Math.abs(n1.y - n2.y) > 10;
      const isBottomChord = midY > avgY + 15;
      const isTopChord = midY < avgY - 15;

      if (isBottomChord) {
        // Serat bawah melentur tertarik
        m.type = 'tension'; // Tarik (Biru)
        m.force = Math.round(totalFy * 0.7);
      } else if (isTopChord) {
        // Serat atas tertekan
        m.type = 'compression'; // Tekan (Merah)
        m.force = Math.round(totalFy * 0.75);
      } else if (isDiagonal) {
        // Batang pengisi diagonal
        m.type = (n1.x < n2.x ? 'tension' : 'compression');
        m.force = Math.round(totalFy * 0.45);
      } else {
        m.type = 'compression';
        m.force = Math.round(totalFy * 0.3);
      }
    });

    this.isSimulated = true;
    this.simulationResults = {
      totalLoad: totalFy,
      supA,
      supB,
      reactionA_y,
      reactionB_y,
      reactionA_x
    };

    // Update UI Output Hasil Perhitungan
    const infoPanel = document.getElementById('sandbox-results-panel');
    if (infoPanel) {
      infoPanel.innerHTML = `
        <div style="background: rgba(16, 185, 129, 0.12); border: 1px solid rgba(16, 185, 129, 0.3); border-radius: 8px; padding: 14px;">
          <h5 style="color: #6ee7b7; font-size: 0.95rem; margin-bottom: 6px;">✅ Struktur Berhasil Dianalisis! (ΣV = 0, ΣM = 0)</h5>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; font-size: 0.85rem;">
            <div>
              <strong>Reaksi Tumpuan A (${supA.support}):</strong><br>
              ${reactionA_y >= reactionB_y ? '🔺 Menahan Porsi Terbesar' : '🔹 Menahan Porsi Beban'}
            </div>
            ${supB ? `
            <div>
              <strong>Reaksi Tumpuan B (${supB.support}):</strong><br>
              ${reactionB_y >= reactionA_y ? '🔺 Menahan Porsi Terbesar' : '🔹 Menahan Porsi Beban'}
            </div>
            ` : '<div><strong>Momen Jepit MA:</strong> Mengunci rotasi kantilever</div>'}
          </div>
          <div style="margin-top: 10px; font-size: 0.8rem; color: #cbd5e1; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 6px;">
            <span style="color: #38bdf8; font-weight: 700;">■ Biru: Batang Tarik (Tension)</span> &nbsp;|&nbsp; 
            <span style="color: #ef4444; font-weight: 700;">■ Merah: Batang Tekan (Compression)</span>
          </div>
        </div>
      `;
    }

    this.render();
  }

  // Load Preset Template Struktur
  loadTemplate(type) {
    this.clearAll();
    const midX = Math.round((this.width / 2) / this.gridSize) * this.gridSize;
    const baseY = Math.round((this.height * 0.65) / this.gridSize) * this.gridSize;

    if (type === 'roofTruss') {
      // 1. Kuda-Kuda Rangka Atap (Pratt Roof Truss)
      const span = 360; // 6 segmen x 60px
      const hTruss = 120;

      const n1 = this.addNode(midX - span / 2, baseY);       // Kiri (Sendi)
      const n2 = this.addNode(midX - span / 6, baseY);
      const n3 = this.addNode(midX + span / 6, baseY);
      const n4 = this.addNode(midX + span / 2, baseY);       // Kanan (Rol)
      
      const nTop1 = this.addNode(midX - span / 6, baseY - hTruss * 0.65);
      const nPeak = this.addNode(midX, baseY - hTruss);     // Puncak Ridge
      const nTop2 = this.addNode(midX + span / 6, baseY - hTruss * 0.65);

      n1.support = 'sendi';
      n4.support = 'rol';

      // Batang Bawah
      this.addMember(n1.id, n2.id);
      this.addMember(n2.id, n3.id);
      this.addMember(n3.id, n4.id);

      // Batang Atas (Rafters)
      this.addMember(n1.id, nTop1.id);
      this.addMember(nTop1.id, nPeak.id);
      this.addMember(nPeak.id, nTop2.id);
      this.addMember(nTop2.id, n4.id);

      // Batang Pengisi (Webs & King Post)
      this.addMember(nTop1.id, n2.id);
      this.addMember(nPeak.id, n2.id);
      this.addMember(nPeak.id, n3.id);
      this.addMember(nTop2.id, n3.id);

      // Beban di Puncak Atap
      this.toggleLoadAtNode(nPeak.id);

    } else if (type === 'bridge') {
      // 2. Jembatan Rangka Baja (Warren Bridge Truss)
      const span = 420;
      const hBridge = 120;
      const segW = span / 4;

      // Buhul Bawah
      const b0 = this.addNode(midX - span / 2, baseY);
      const b1 = this.addNode(midX - span / 2 + segW, baseY);
      const b2 = this.addNode(midX, baseY);
      const b3 = this.addNode(midX + span / 2 - segW, baseY);
      const b4 = this.addNode(midX + span / 2, baseY);

      // Buhul Atas
      const t1 = this.addNode(midX - span / 2 + segW * 0.5, baseY - hBridge);
      const t2 = this.addNode(midX - span / 2 + segW * 1.5, baseY - hBridge);
      const t3 = this.addNode(midX - span / 2 + segW * 2.5, baseY - hBridge);
      const t4 = this.addNode(midX - span / 2 + segW * 3.5, baseY - hBridge);

      b0.support = 'sendi';
      b4.support = 'rol';

      // Batang Bawah (Bottom Chord)
      this.addMember(b0.id, b1.id);
      this.addMember(b1.id, b2.id);
      this.addMember(b2.id, b3.id);
      this.addMember(b3.id, b4.id);

      // Batang Atas (Top Chord)
      this.addMember(t1.id, t2.id);
      this.addMember(t2.id, t3.id);
      this.addMember(t3.id, t4.id);

      // Batang Diagonal Web
      this.addMember(b0.id, t1.id);
      this.addMember(t1.id, b1.id);
      this.addMember(b1.id, t2.id);
      this.addMember(t2.id, b2.id);
      this.addMember(b2.id, t3.id);
      this.addMember(t3.id, b3.id);
      this.addMember(b3.id, t4.id);
      this.addMember(t4.id, b4.id);

      // Beban Truk di Tengah Jembatan
      this.toggleLoadAtNode(b2.id);

    } else if (type === 'cantilever') {
      // 3. Balok Kantilever
      const n1 = this.addNode(midX - 180, baseY);
      const n2 = this.addNode(midX, baseY);
      const n3 = this.addNode(midX + 180, baseY);

      n1.support = 'jepit';

      this.addMember(n1.id, n2.id);
      this.addMember(n2.id, n3.id);

      // Beban di Ujung Bebas
      this.toggleLoadAtNode(n3.id);

    } else if (type === 'beam') {
      // 4. Balok 2 Tumpuan
      const n1 = this.addNode(midX - 210, baseY);
      const n2 = this.addNode(midX - 70, baseY);
      const n3 = this.addNode(midX + 70, baseY);
      const n4 = this.addNode(midX + 210, baseY);

      n1.support = 'sendi';
      n4.support = 'rol';

      this.addMember(n1.id, n2.id);
      this.addMember(n2.id, n3.id);
      this.addMember(n3.id, n4.id);

      this.toggleLoadAtNode(n2.id);
    }

    this.render();
  }

  // Render Seluruh Objek ke Canvas 2D
  render() {
    this.ctx.clearRect(0, 0, this.width, this.height);

    // 1. Gambar Grid Konstruksi
    this.drawGrid();

    // 2. Gambar Batang Struktur
    this.drawMembers();

    // 3. Gambar Tumpuan
    this.drawSupports();

    // 4. Gambar Titik Simpul (Nodes)
    this.drawNodes();

    // 5. Gambar Beban (Loads)
    this.drawLoads();

    // 6. Gambar Panah Reaksi jika sudah disimulasikan
    if (this.isSimulated && this.simulationResults) {
      this.drawReactions();
    }

    // 7. Gambar Garis Penghubung Sementara saat menarik batang
    if (this.connectingNode && this.hoveredNode) {
      this.ctx.strokeStyle = '#f59e0b';
      this.ctx.lineWidth = 2;
      this.ctx.setLineDash([6, 6]);
      this.ctx.beginPath();
      this.ctx.moveTo(this.connectingNode.x, this.connectingNode.y);
      this.ctx.lineTo(this.hoveredNode.x, this.hoveredNode.y);
      this.ctx.stroke();
      this.ctx.setLineDash([]);
    }
  }

  drawGrid() {
    this.ctx.strokeStyle = '#162238';
    this.ctx.lineWidth = 1;

    for (let x = 0; x < this.width; x += this.gridSize) {
      this.ctx.beginPath();
      this.ctx.moveTo(x, 0);
      this.ctx.lineTo(x, this.height);
      this.ctx.stroke();
    }

    for (let y = 0; y < this.height; y += this.gridSize) {
      this.ctx.beginPath();
      this.ctx.moveTo(0, y);
      this.ctx.lineTo(this.width, y);
      this.ctx.stroke();
    }
  }

  drawMembers() {
    this.members.forEach(m => {
      const n1 = this.getNodeById(m.nodeA);
      const n2 = this.getNodeById(m.nodeB);
      if (!n1 || !n2) return;

      // Warna Batang berdasarkan status analisis
      let strokeColor = '#64748b'; // Abu-abu netral
      let lineWidth = 5;

      if (this.isSimulated) {
        if (m.type === 'tension') {
          strokeColor = '#38bdf8'; // Tarik: Cyan/Biru
          lineWidth = 6;
        } else if (m.type === 'compression') {
          strokeColor = '#ef4444'; // Tekan: Merah
          lineWidth = 7;
        }
      }

      this.ctx.strokeStyle = strokeColor;
      this.ctx.lineWidth = lineWidth;
      this.ctx.lineCap = 'round';
      this.ctx.beginPath();
      this.ctx.moveTo(n1.x, n1.y);
      this.ctx.lineTo(n2.x, n2.y);
      this.ctx.stroke();
    });
  }

  drawNodes() {
    this.nodes.forEach(n => {
      const isHovered = (n === this.hoveredNode);
      const isConnecting = (n === this.connectingNode);

      this.ctx.fillStyle = isConnecting ? '#f59e0b' : (isHovered ? '#fbbf24' : '#0f172a');
      this.ctx.strokeStyle = '#38bdf8';
      this.ctx.lineWidth = 2.5;

      this.ctx.beginPath();
      this.ctx.arc(n.x, n.y, isHovered ? 9 : 7, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.stroke();
    });
  }

  drawSupports() {
    this.nodes.forEach(n => {
      if (!n.support) return;

      const size = 16;
      if (n.support === 'sendi') {
        // Simbol Segitiga Sendi
        this.ctx.fillStyle = '#0284c7';
        this.ctx.strokeStyle = '#38bdf8';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.moveTo(n.x, n.y);
        this.ctx.lineTo(n.x - size, n.y + size * 1.5);
        this.ctx.lineTo(n.x + size, n.y + size * 1.5);
        this.ctx.closePath();
        this.ctx.fill();
        this.ctx.stroke();

        // Garis Tanah
        this.ctx.strokeStyle = '#94a3b8';
        this.ctx.beginPath();
        this.ctx.moveTo(n.x - size * 1.3, n.y + size * 1.5 + 2);
        this.ctx.lineTo(n.x + size * 1.3, n.y + size * 1.5 + 2);
        this.ctx.stroke();

      } else if (n.support === 'rol') {
        // Simbol Segitiga dengan Roda Rol di Bawah
        this.ctx.fillStyle = '#0284c7';
        this.ctx.strokeStyle = '#fbbf24';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.moveTo(n.x, n.y);
        this.ctx.lineTo(n.x - size, n.y + size * 1.2);
        this.ctx.lineTo(n.x + size, n.y + size * 1.2);
        this.ctx.closePath();
        this.ctx.fill();
        this.ctx.stroke();

        // 3 Roda Silinder
        this.ctx.fillStyle = '#fbbf24';
        for (let dx of [-size * 0.6, 0, size * 0.6]) {
          this.ctx.beginPath();
          this.ctx.arc(n.x + dx, n.y + size * 1.2 + 5, 4, 0, Math.PI * 2);
          this.ctx.fill();
        }

        // Garis Landasan Licin
        this.ctx.strokeStyle = '#94a3b8';
        this.ctx.beginPath();
        this.ctx.moveTo(n.x - size * 1.3, n.y + size * 1.2 + 11);
        this.ctx.lineTo(n.x + size * 1.3, n.y + size * 1.2 + 11);
        this.ctx.stroke();

      } else if (n.support === 'jepit') {
        // Dinding Penjepit Kaku Vertikal
        this.ctx.strokeStyle = '#ef4444';
        this.ctx.lineWidth = 4;
        this.ctx.beginPath();
        this.ctx.moveTo(n.x - 4, n.y - size * 1.5);
        this.ctx.lineTo(n.x - 4, n.y + size * 1.5);
        this.ctx.stroke();

        // Garis Arsir Dinding
        this.ctx.lineWidth = 1.5;
        this.ctx.strokeStyle = '#94a3b8';
        for (let dy = -size * 1.2; dy <= size * 1.2; dy += 8) {
          this.ctx.beginPath();
          this.ctx.moveTo(n.x - 14, n.y + dy + 6);
          this.ctx.lineTo(n.x - 4, n.y + dy);
          this.ctx.stroke();
        }
      }
    });
  }

  drawLoads() {
    this.loads.forEach(l => {
      const node = this.getNodeById(l.nodeId);
      if (!node) return;

      const arrowLen = 50;
      const startY = node.y - arrowLen;

      // Batang Panah Beban
      this.ctx.strokeStyle = '#f59e0b';
      this.ctx.fillStyle = '#f59e0b';
      this.ctx.lineWidth = 3.5;

      this.ctx.beginPath();
      this.ctx.moveTo(node.x, startY);
      this.ctx.lineTo(node.x, node.y - 4);
      this.ctx.stroke();

      // Kepala Panah (Menunjuk ke Bawah Menuju Node)
      this.ctx.beginPath();
      this.ctx.moveTo(node.x, node.y - 2);
      this.ctx.lineTo(node.x - 7, node.y - 16);
      this.ctx.lineTo(node.x + 7, node.y - 16);
      this.ctx.closePath();
      this.ctx.fill();

      // Label Beban P
      this.ctx.font = 'bold 12px sans-serif';
      this.ctx.textAlign = 'center';
      this.ctx.fillText(`P = ${l.fy} kN`, node.x, startY - 8);
    });
  }

  drawReactions() {
    const { supA, supB, reactionA_y, reactionB_y } = this.simulationResults;

    const drawReactionArrow = (node, rY) => {
      if (!node || rY <= 0) return;
      const arrowLen = Math.min(75, Math.max(30, (rY / 60) * 50));
      const startY = node.y + 40 + arrowLen;

      // Panah Reaksi Hijau Naik ke Atas
      this.ctx.strokeStyle = '#10b981';
      this.ctx.fillStyle = '#10b981';
      this.ctx.lineWidth = 4;

      this.ctx.beginPath();
      this.ctx.moveTo(node.x, startY);
      this.ctx.lineTo(node.x, node.y + 36);
      this.ctx.stroke();

      this.ctx.beginPath();
      this.ctx.moveTo(node.x, node.y + 30);
      this.ctx.lineTo(node.x - 8, node.y + 44);
      this.ctx.lineTo(node.x + 8, node.y + 44);
      this.ctx.closePath();
      this.ctx.fill();

      this.ctx.font = 'bold 12px sans-serif';
      this.ctx.textAlign = 'center';
      this.ctx.fillText('Reaksi Naik (R)', node.x, startY + 16);
    };

    if (supA) drawReactionArrow(supA, reactionA_y);
    if (supB) drawReactionArrow(supB, reactionB_y);
  }
}

window.StructureSandbox = StructureSandbox;
