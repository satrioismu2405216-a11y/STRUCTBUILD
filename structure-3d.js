/* ==========================================================================
   StructBuild - structure-3d.js
   Visualisasi 3D Interaktif Balok, Rangka Atap (Roof Truss), & Jembatan Baja
   Fitur Ganti Tipe Struktur & Klik Peletakan Beban Bebas / Titik Tertentu
   ========================================================================== */

class Structure3DViewer {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    if (!this.container) return;

    // Parameter Struktur
    this.structureType = 'beam'; // 'beam' | 'roofTruss' | 'bridge'
    this.beamLength = 8.0;       // Meter
    this.loadPosition = 3.0;     // Meter dari tumpuan kiri (A)
    this.loadMagnitude = 50.0;   // kN

    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.controls = null;
    
    // Objek 3D
    this.structureGroup = null;
    this.beamMesh = null;
    this.leftSupportGroup = null;
    this.rightSupportGroup = null;
    this.loadGroup = null;
    this.leftReactionArrow = null;
    this.rightReactionArrow = null;
    this.groundGrid = null;
    this.riverMesh = null;

    // Raycaster untuk Klik Meletakkan Beban
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();
    this.clickableTargets = [];

    // Deformasi
    this.segmentCount = 60;
    this.initialBeamVertices = null;

    this.init();
  }

  init() {
    const width = this.container.clientWidth || 800;
    const height = this.container.clientHeight || 500;

    // 1. Scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x060b13);
    this.scene.fog = new THREE.FogExp2(0x060b13, 0.03);

    // 2. Camera
    this.camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    this.camera.position.set(0, 4.8, 11.5);

    // 3. Renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.container.appendChild(this.renderer.domElement);

    // 4. Controls
    if (typeof THREE.OrbitControls !== 'undefined') {
      this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
      this.controls.enableDamping = true;
      this.controls.dampingFactor = 0.05;
      this.controls.maxPolarAngle = Math.PI / 2 + 0.05;
      this.controls.minDistance = 4;
      this.controls.maxDistance = 28;
      this.controls.target.set(0, 1.4, 0);
    }

    // 5. Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    this.scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xfffaed, 0.95);
    dirLight.position.set(8, 14, 10);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 2048;
    dirLight.shadow.mapSize.height = 2048;
    this.scene.add(dirLight);

    const blueFill = new THREE.DirectionalLight(0x38bdf8, 0.35);
    blueFill.position.set(-8, 6, -6);
    this.scene.add(blueFill);

    // 6. Ground & Lingkungan Proyek
    this.createGround();

    // 7. Bangun Model Struktur Sesuai Tipe
    this.buildStructures();

    // 8. Event Listener
    window.addEventListener('resize', () => this.onWindowResize());
    this.renderer.domElement.addEventListener('pointerdown', (e) => this.onPointerDown(e));

    // 9. Animate
    this.animate();
  }

  createGround() {
    const gridHelper = new THREE.GridHelper(26, 26, 0xf59e0b, 0x1e293b);
    this.scene.add(gridHelper);

    const floorGeo = new THREE.PlaneGeometry(36, 36);
    const floorMat = new THREE.MeshStandardMaterial({ color: 0x090e17, roughness: 0.9, metalness: 0.1 });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -0.01;
    floor.receiveShadow = true;
    this.scene.add(floor);
  }

  // Ganti Model Struktur (Balok Portal, Rangka Atap, Jembatan Baja)
  setStructureType(type) {
    this.structureType = type;
    this.buildStructures();
  }

  buildStructures() {
    // Bersihkan objek lama
    if (this.structureGroup) this.scene.remove(this.structureGroup);
    if (this.leftSupportGroup) this.scene.remove(this.leftSupportGroup);
    if (this.rightSupportGroup) this.scene.remove(this.rightSupportGroup);
    if (this.loadGroup) this.scene.remove(this.loadGroup);
    if (this.leftReactionArrow) this.scene.remove(this.leftReactionArrow);
    if (this.rightReactionArrow) this.scene.remove(this.rightReactionArrow);
    if (this.riverMesh) {
      this.scene.remove(this.riverMesh);
      this.riverMesh = null;
    }

    this.clickableTargets = [];
    this.structureGroup = new THREE.Group();
    this.scene.add(this.structureGroup);

    const L = this.beamLength;
    const halfL = L / 2;
    const supportHeight = 1.2;

    // --- Tumpuan Sendi (A) & Rol (B) ---
    this.leftSupportGroup = this.createPhysicalPinBearing(-halfL, supportHeight);
    this.scene.add(this.leftSupportGroup);

    this.rightSupportGroup = this.createPhysicalRollerBearing(halfL, supportHeight);
    this.scene.add(this.rightSupportGroup);

    // --- Pemilihan Model Struktur ---
    if (this.structureType === 'beam') {
      this.createIBeamDeformable(L, supportHeight);
    } else if (this.structureType === 'roofTruss') {
      this.createRoofTruss3D(L, supportHeight);
    } else if (this.structureType === 'bridge') {
      this.createBridgeTruss3D(L, supportHeight);
    }

    // --- Beban 3D ---
    this.createLoadObject(supportHeight);

    // --- Panah Reaksi ---
    this.createReactionIndicators(-halfL, halfL, supportHeight);

    // Update lenturan
    this.updateDeflection();
  }

  // 1. Model Balok Profil I Baja
  createIBeamDeformable(L, baseHeight) {
    const segments = this.segmentCount;
    const geom = new THREE.BoxGeometry(L, 0.35, 0.25, segments, 2, 2);
    
    this.initialBeamVertices = [];
    const pos = geom.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      this.initialBeamVertices.push({
        x: pos.getX(i),
        y: pos.getY(i),
        z: pos.getZ(i)
      });
    }

    const beamMaterial = new THREE.MeshStandardMaterial({
      color: 0x64748b,
      metalness: 0.75,
      roughness: 0.35
    });

    this.beamMesh = new THREE.Mesh(geom, beamMaterial);
    this.beamMesh.position.set(0, baseHeight + 0.175, 0);
    this.beamMesh.castShadow = true;
    this.beamMesh.receiveShadow = true;
    this.structureGroup.add(this.beamMesh);
    this.clickableTargets.push(this.beamMesh);

    const edges = new THREE.EdgesGeometry(geom, 25);
    const line = new THREE.LineSegments(edges, new THREE.LineBasicMaterial({ color: 0xf59e0b, opacity: 0.4, transparent: true }));
    this.beamMesh.add(line);
  }

  // 2. Model Kuda-Kuda Rangka Atap Segitiga 3D
  createRoofTruss3D(L, baseHeight) {
    const halfL = L / 2;
    const hPeak = 2.4; // Tinggi bubungan puncak
    const steelMat = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.8, roughness: 0.3 });
    const woodMat = new THREE.MeshStandardMaterial({ color: 0xb45309, roughness: 0.7 }); // Gording kayu
    const jointMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.9, roughness: 0.2 });

    const yBase = baseHeight + 0.18;
    const yPeak = yBase + hPeak;

    // Titik Simpul Kuda-kuda
    const nodes = [
      { x: -halfL, y: yBase, z: 0, name: 'Tumpuan A' },
      { x: -halfL * 0.5, y: yBase, z: 0, name: 'Buhul Bawah 1' },
      { x: 0, y: yBase, z: 0, name: 'Buhul Bawah Tengah' },
      { x: halfL * 0.5, y: yBase, z: 0, name: 'Buhul Bawah 2' },
      { x: halfL, y: yBase, z: 0, name: 'Tumpuan B' },
      
      { x: -halfL * 0.5, y: yBase + hPeak * 0.5, z: 0, name: 'Rafter Kiri' },
      { x: 0, y: yPeak, z: 0, name: 'Puncak Ridge' },
      { x: halfL * 0.5, y: yBase + hPeak * 0.5, z: 0, name: 'Rafter Kanan' },
    ];

    // Helper buat silinder pipa baja antar simpul
    const createStrut = (p1, p2, radius = 0.06, mat = steelMat) => {
      const v1 = new THREE.Vector3(p1.x, p1.y, p1.z);
      const v2 = new THREE.Vector3(p2.x, p2.y, p2.z);
      const dist = v1.distanceTo(v2);

      const cylGeo = new THREE.CylinderGeometry(radius, radius, dist, 12);
      const mesh = new THREE.Mesh(cylGeo, mat);

      const mid = new THREE.Vector3().addVectors(v1, v2).multiplyScalar(0.5);
      mesh.position.copy(mid);
      mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), v2.clone().sub(v1).normalize());
      mesh.castShadow = true;
      this.structureGroup.add(mesh);
    };

    // Batang Tarik Bawah (Bottom Chord)
    createStrut(nodes[0], nodes[1]);
    createStrut(nodes[1], nodes[2]);
    createStrut(nodes[2], nodes[3]);
    createStrut(nodes[3], nodes[4]);

    // Batang Rafter Miring Atas (Top Chord)
    createStrut(nodes[0], nodes[5]);
    createStrut(nodes[5], nodes[6]);
    createStrut(nodes[6], nodes[7]);
    createStrut(nodes[7], nodes[4]);

    // Batang Pengisi (Vertical & Diagonal Web)
    createStrut(nodes[6], nodes[2]); // King Post Tegak
    createStrut(nodes[5], nodes[1]); // Queen Post
    createStrut(nodes[7], nodes[3]);
    createStrut(nodes[5], nodes[2]); // Diagonal
    createStrut(nodes[7], nodes[2]);

    // Gording & Balok Nok Memanjang (Purlins melintang sumbu Z)
    for (let n of [nodes[5], nodes[6], nodes[7]]) {
      const purlinGeo = new THREE.BoxGeometry(0.12, 0.16, 2.5);
      const purlin = new THREE.Mesh(purlinGeo, woodMat);
      purlin.position.set(n.x, n.y + 0.1, 0);
      purlin.castShadow = true;
      this.structureGroup.add(purlin);
    }

    // Plat Buhul & Bola Interaktif di Setiap Simpul
    nodes.forEach(n => {
      const sphereGeo = new THREE.SphereGeometry(0.14, 16, 16);
      const sphere = new THREE.Mesh(sphereGeo, jointMat);
      sphere.position.set(n.x, n.y, n.z);
      sphere.userData = { isNode: true, xPos: n.x + halfL, name: n.name };
      this.structureGroup.add(sphere);
      this.clickableTargets.push(sphere);
    });

    // Simpan mesh acuan untuk deformasi
    this.createIBeamDeformable(L, baseHeight);
    this.beamMesh.visible = false; // Sembunyikan balok biasa
  }

  // 3. Model Jembatan Rangka Baja Warren 3D (Truss Bridge)
  createBridgeTruss3D(L, baseHeight) {
    const halfL = L / 2;
    const hTruss = 2.0;
    const bridgeWidth = 2.2;
    const steelMat = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.85, roughness: 0.25 });
    const deckMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.9 });
    const jointMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.9 });

    const yBase = baseHeight + 0.18;
    const segCount = 4;
    const dx = L / segCount;

    // Tambah Sungai di Bawah Jembatan
    const riverGeo = new THREE.PlaneGeometry(L * 1.5, 8);
    const riverMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.2, metalness: 0.8, transparent: true, opacity: 0.85 });
    this.riverMesh = new THREE.Mesh(riverGeo, riverMat);
    this.riverMesh.rotation.x = -Math.PI / 2;
    this.riverMesh.position.set(0, 0.02, 0);
    this.scene.add(this.riverMesh);

    // Lantai Jalan Jembatan (Deck)
    const deckGeo = new THREE.BoxGeometry(L, 0.12, bridgeWidth);
    const deck = new THREE.Mesh(deckGeo, deckMat);
    deck.position.set(0, yBase, 0);
    deck.receiveShadow = true;
    this.structureGroup.add(deck);
    this.clickableTargets.push(deck);

    // Garis Marka Jalan Kuning
    const markGeo = new THREE.PlaneGeometry(L * 0.9, 0.1);
    const markMat = new THREE.MeshBasicMaterial({ color: 0xfbbf24 });
    const mark = new THREE.Mesh(markGeo, markMat);
    mark.rotation.x = -Math.PI / 2;
    mark.position.set(0, yBase + 0.07, 0);
    this.structureGroup.add(mark);

    // 2 Rangka Baja di Sisi Kiri & Kanan (Z = -bridgeWidth/2 dan Z = +bridgeWidth/2)
    [-bridgeWidth / 2, bridgeWidth / 2].forEach(z => {
      // Buhul Bawah
      const bNodes = [];
      for (let i = 0; i <= segCount; i++) {
        bNodes.push({ x: -halfL + i * dx, y: yBase, z });
      }

      // Buhul Atas
      const tNodes = [];
      for (let i = 0; i < segCount; i++) {
        tNodes.push({ x: -halfL + (i + 0.5) * dx, y: yBase + hTruss, z });
      }

      const createStrut = (p1, p2) => {
        const v1 = new THREE.Vector3(p1.x, p1.y, p1.z);
        const v2 = new THREE.Vector3(p2.x, p2.y, p2.z);
        const dist = v1.distanceTo(v2);
        const cylGeo = new THREE.CylinderGeometry(0.06, 0.06, dist, 10);
        const mesh = new THREE.Mesh(cylGeo, steelMat);
        mesh.position.copy(new THREE.Vector3().addVectors(v1, v2).multiplyScalar(0.5));
        mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), v2.clone().sub(v1).normalize());
        mesh.castShadow = true;
        this.structureGroup.add(mesh);
      };

      // Batang Bawah
      for (let i = 0; i < segCount; i++) createStrut(bNodes[i], bNodes[i + 1]);

      // Batang Atas
      for (let i = 0; i < segCount - 1; i++) createStrut(tNodes[i], tNodes[i + 1]);

      // Diagonal Warren
      for (let i = 0; i < segCount; i++) {
        createStrut(bNodes[i], tNodes[i]);
        createStrut(tNodes[i], bNodes[i + 1]);
      }

      // Bola Simpul Buhul
      bNodes.forEach((n, idx) => {
        const sph = new THREE.Mesh(new THREE.SphereGeometry(0.13, 16, 16), jointMat);
        sph.position.set(n.x, n.y, n.z);
        sph.userData = { isNode: true, xPos: n.x + halfL, name: `Buhul Jembatan ${idx + 1}` };
        this.structureGroup.add(sph);
        this.clickableTargets.push(sph);
      });
    });

    this.createIBeamDeformable(L, baseHeight);
    this.beamMesh.visible = false;
  }

  // Tumpuan Sendi Fisik
  createPhysicalPinBearing(xPos, height) {
    const group = new THREE.Group();
    group.position.set(xPos, 0, 0);

    const pierGeo = new THREE.BoxGeometry(0.8, height - 0.4, 0.8);
    const pierMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.9 });
    const pier = new THREE.Mesh(pierGeo, pierMat);
    pier.position.y = (height - 0.4) / 2;
    pier.castShadow = true;
    group.add(pier);

    const basePlate = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.08, 0.6), new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.8 }));
    basePlate.position.y = height - 0.36;
    group.add(basePlate);

    const shoe = new THREE.Mesh(new THREE.ConeGeometry(0.24, 0.32, 4), new THREE.MeshStandardMaterial({ color: 0x0284c7, metalness: 0.6 }));
    shoe.rotation.y = Math.PI / 4;
    shoe.position.y = height - 0.18;
    group.add(shoe);

    const pin = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.45, 16), new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.9 }));
    pin.rotation.x = Math.PI / 2;
    pin.position.y = height - 0.04;
    group.add(pin);

    const labelSprite = this.createTextSprite("A (Sendi)", "#38bdf8");
    labelSprite.position.set(0, -0.2, 0.65);
    group.add(labelSprite);

    return group;
  }

  // Tumpuan Rol Fisik
  createPhysicalRollerBearing(xPos, height) {
    const group = new THREE.Group();
    group.position.set(xPos, 0, 0);

    const pierGeo = new THREE.BoxGeometry(0.8, height - 0.4, 0.8);
    const pierMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.9 });
    const pier = new THREE.Mesh(pierGeo, pierMat);
    pier.position.y = (height - 0.4) / 2;
    pier.castShadow = true;
    group.add(pier);

    const bedPlate = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.06, 0.6), new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.85 }));
    bedPlate.position.y = height - 0.37;
    group.add(bedPlate);

    const rollerMat = new THREE.MeshStandardMaterial({ color: 0xfbbf24, metalness: 0.9 });
    for (let i = -1; i <= 1; i++) {
      const r = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.45, 16), rollerMat);
      r.rotation.x = Math.PI / 2;
      r.position.set(i * 0.18, height - 0.27, 0);
      group.add(r);
    }

    const topPlate = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.08, 0.5), new THREE.MeshStandardMaterial({ color: 0x0284c7, metalness: 0.7 }));
    topPlate.position.y = height - 0.17;
    group.add(topPlate);

    const labelSprite = this.createTextSprite("B (Rol)", "#fbbf24");
    labelSprite.position.set(0, -0.2, 0.65);
    group.add(labelSprite);

    return group;
  }

  // Beban Fisik (Beban Derek / Truk / Beban Terpusat)
  createLoadObject(baseHeight) {
    this.loadGroup = new THREE.Group();

    // Panah Gaya Vertikal
    const arrowDir = new THREE.Vector3(0, -1, 0);
    const arrowOrigin = new THREE.Vector3(0, 1.8, 0);
    const forceArrow = new THREE.ArrowHelper(arrowDir, arrowOrigin, 1.3, 0xf59e0b, 0.35, 0.22);
    this.loadGroup.add(forceArrow);

    // Blok Beban Derek
    const blockGeo = new THREE.BoxGeometry(0.6, 0.48, 0.6);
    const blockMat = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.4, metalness: 0.5 });
    const weightBlock = new THREE.Mesh(blockGeo, blockMat);
    weightBlock.position.y = 2.15;
    weightBlock.castShadow = true;
    this.loadGroup.add(weightBlock);

    // Cincin Derek
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.1, 0.025, 8, 16), new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.9 }));
    ring.rotation.x = Math.PI / 2;
    ring.position.y = 2.45;
    this.loadGroup.add(ring);

    this.loadLabel = this.createTextSprite("Beban (P)", "#f59e0b");
    this.loadLabel.position.set(0, 2.7, 0);
    this.loadGroup.add(this.loadLabel);

    this.scene.add(this.loadGroup);
    this.updateLoadPositionVisual();
  }

  // Panah Reaksi Tumpuan Dinamis
  createReactionIndicators(xLeft, xRight, baseHeight) {
    const dirUp = new THREE.Vector3(0, 1, 0);
    this.leftReactionArrow = new THREE.ArrowHelper(dirUp, new THREE.Vector3(xLeft, 0.1, 0.45), 1.2, 0x10b981, 0.3, 0.18);
    this.scene.add(this.leftReactionArrow);

    this.rightReactionArrow = new THREE.ArrowHelper(dirUp, new THREE.Vector3(xRight, 0.1, 0.45), 1.2, 0x10b981, 0.3, 0.18);
    this.scene.add(this.rightReactionArrow);

    this.updateReactionArrowSizes();
  }

  // Klik di Kanvas 3D untuk Menaruh Beban di Titik Tertentu
  onPointerDown(event) {
    const rect = this.renderer.domElement.getBoundingClientRect();
    this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    this.raycaster.setFromCamera(this.mouse, this.camera);
    const intersects = this.raycaster.intersectObjects(this.clickableTargets, true);

    if (intersects.length > 0) {
      const hit = intersects[0];
      const halfL = this.beamLength / 2;

      let newX = 0;
      if (hit.object.userData && hit.object.userData.isNode) {
        newX = hit.object.userData.xPos;
      } else {
        // Konversi koordinat dunia X ke posisi balok lokal (0 s.d L)
        newX = hit.point.x + halfL;
      }

      newX = Math.max(0.5, Math.min(this.beamLength - 0.5, newX));
      this.setLoadPosition(newX);

      // Sinkronkan slider UI
      const posSlider = document.getElementById('slider-load-pos');
      const posVal = document.getElementById('val-load-pos');
      if (posSlider) posSlider.value = newX;
      if (posVal) posVal.textContent = `${newX.toFixed(1)} m`;

      if (window.simulationController) {
        window.simulationController.loadPos = newX;
        window.simulationController.updateHUD();
      }
      if (window.diagramsController) {
        window.diagramsController.update(this.beamLength, newX, this.loadMagnitude);
      }
    }
  }

  // Pindahkan beban ke titik preset (misal: 1/4 bentang, tengah, 3/4)
  setLoadPreset(ratio) {
    const newX = this.beamLength * ratio;
    this.setLoadPosition(newX);

    const posSlider = document.getElementById('slider-load-pos');
    const posVal = document.getElementById('val-load-pos');
    if (posSlider) posSlider.value = newX;
    if (posVal) posVal.textContent = `${newX.toFixed(1)} m`;

    if (window.simulationController) {
      window.simulationController.loadPos = newX;
      window.simulationController.updateHUD();
    }
    if (window.diagramsController) {
      window.diagramsController.update(this.beamLength, newX, this.loadMagnitude);
    }
  }

  updateDeflection() {
    if (!this.beamMesh || !this.initialBeamVertices) return;

    const L = this.beamLength;
    const halfL = L / 2;
    const a = this.loadPosition;
    const b = L - a;
    const P = this.loadMagnitude;
    const scaleFactor = 0.00035 * (P / 50.0);

    const pos = this.beamMesh.geometry.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const initX = this.initialBeamVertices[i].x;
      const initY = this.initialBeamVertices[i].y;
      const xBeam = initX + halfL;

      let deltaY = 0;
      if (xBeam >= 0 && xBeam <= L) {
        if (xBeam <= a) {
          deltaY = -scaleFactor * (b * xBeam) * (L * L - b * b - xBeam * xBeam);
        } else {
          deltaY = -scaleFactor * (a * (L - xBeam)) * (2 * L * xBeam - xBeam * xBeam - a * a);
        }
      }
      pos.setY(i, initY + deltaY);
    }

    pos.needsUpdate = true;
    this.beamMesh.geometry.computeVertexNormals();

    this.updateLoadPositionVisual();
    this.updateReactionArrowSizes();
  }

  updateLoadPositionVisual() {
    if (!this.loadGroup) return;
    const halfL = this.beamLength / 2;
    const worldX = -halfL + this.loadPosition;
    this.loadGroup.position.set(worldX, 0, 0);
  }

  updateReactionArrowSizes() {
    if (!this.leftReactionArrow || !this.rightReactionArrow) return;

    const L = this.beamLength;
    const a = this.loadPosition;
    const b = L - a;
    const propA = b / L;
    const propB = a / L;

    const baseLength = 0.5;
    const scaleLength = 2.2;
    const lengthA = Math.max(0.2, baseLength + propA * scaleLength);
    const lengthB = Math.max(0.2, baseLength + propB * scaleLength);

    this.leftReactionArrow.setLength(lengthA, 0.28, 0.16);
    this.rightReactionArrow.setLength(lengthB, 0.28, 0.16);

    const halfL = L / 2;
    this.leftReactionArrow.position.set(-halfL, 0.05, 0.45);
    this.rightReactionArrow.position.set(halfL, 0.05, 0.45);
  }

  createTextSprite(text, colorHex) {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 80;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
    if (ctx.roundRect) {
      ctx.roundRect(10, 10, 236, 60, 12);
    } else {
      ctx.rect(10, 10, 236, 60);
    }
    ctx.fill();
    ctx.strokeStyle = colorHex || '#f59e0b';
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 26px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, 128, 40);

    const texture = new THREE.CanvasTexture(canvas);
    const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: texture, depthTest: false }));
    sprite.scale.set(1.4, 0.45, 1);
    return sprite;
  }

  setLoadPosition(posMeter) {
    this.loadPosition = Math.max(0.2, Math.min(this.beamLength - 0.2, posMeter));
    this.updateDeflection();
  }

  setLoadMagnitude(kN) {
    this.loadMagnitude = Math.max(10, Math.min(100, kN));
    this.updateDeflection();
  }

  setSpanLength(lengthMeter) {
    this.beamLength = Math.max(4, Math.min(14, lengthMeter));
    if (this.loadPosition > this.beamLength - 0.5) {
      this.loadPosition = this.beamLength / 2;
    }
    this.buildStructures();
  }

  resetView() {
    if (this.controls) {
      this.controls.reset();
      this.camera.position.set(0, 4.8, 11.5);
      this.controls.target.set(0, 1.4, 0);
    }
  }

  onWindowResize() {
    if (!this.container || !this.renderer || !this.camera) return;
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  animate() {
    requestAnimationFrame(() => this.animate());
    if (this.controls) this.controls.update();
    if (this.renderer && this.scene && this.camera) {
      this.renderer.render(this.scene, this.camera);
    }
  }
}

window.Structure3DViewer = Structure3DViewer;
