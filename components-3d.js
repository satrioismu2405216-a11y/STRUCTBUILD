/* ==========================================================================
   StructBuild - components-3d.js
   Model 3D Interaktif Rangka Bangunan untuk Halaman "Kenali Struktur"
   Fitur Raycasting Click & Inspeksi Elemen Konstruksi Nyata
   ========================================================================== */

class BuildingComponents3D {
  constructor(containerId, onSelectCallback) {
    this.container = document.getElementById(containerId);
    this.onSelectCallback = onSelectCallback;
    if (!this.container) return;

    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.controls = null;
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();

    this.interactiveObjects = [];
    this.selectedObject = null;

    this.init();
  }

  init() {
    const width = this.container.clientWidth || 700;
    const height = this.container.clientHeight || 500;

    // 1. Scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x060b13);
    this.scene.fog = new THREE.FogExp2(0x060b13, 0.03);

    // 2. Camera
    this.camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    this.camera.position.set(7, 6, 9);

    // 3. Renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.container.appendChild(this.renderer.domElement);

    // 4. Controls
    if (typeof THREE.OrbitControls !== 'undefined') {
      this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
      this.controls.enableDamping = true;
      this.controls.dampingFactor = 0.05;
      this.controls.target.set(0, 2.2, 0);
      this.controls.maxPolarAngle = Math.PI / 2 + 0.05;
      this.controls.minDistance = 3;
      this.controls.maxDistance = 20;
    }

    // 5. Lights
    const ambLight = new THREE.AmbientLight(0xffffff, 0.7);
    this.scene.add(ambLight);

    const sun = new THREE.DirectionalLight(0xfffaed, 0.95);
    sun.position.set(10, 15, 8);
    sun.castShadow = true;
    this.scene.add(sun);

    const blueRim = new THREE.DirectionalLight(0x38bdf8, 0.4);
    blueRim.position.set(-8, 6, -8);
    this.scene.add(blueRim);

    // 6. Ground Grid
    const grid = new THREE.GridHelper(20, 20, 0xf59e0b, 0x1e293b);
    this.scene.add(grid);

    // 7. Bangun Rangka Portal Bangunan 3D
    this.buildBuildingFrame();

    // 8. Event Listener Klik & Hover
    this.renderer.domElement.addEventListener('pointerdown', (e) => this.onPointerDown(e));
    window.addEventListener('resize', () => this.onWindowResize());

    // 9. Animate loop
    this.animate();
  }

  buildBuildingFrame() {
    this.interactiveObjects = [];

    // Dimensi Portal Bangunan
    const spanX = 4.5;
    const spanZ = 3.6;
    const height1 = 2.4;
    const height2 = 4.6;

    // Material Standar Baja & Beton
    const columnMat = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.7, roughness: 0.35 });
    const beamMat = new THREE.MeshStandardMaterial({ color: 0x64748b, metalness: 0.8, roughness: 0.3 });
    const slabMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.8, transparent: true, opacity: 0.75 });
    const jointMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.9, roughness: 0.2 });
    const footingMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.9 });

    // 1. KOLOM (4 Kolom Utama Baja WF / H-Beam)
    const colPositions = [
      [-spanX / 2, -spanZ / 2],
      [spanX / 2, -spanZ / 2],
      [spanX / 2, spanZ / 2],
      [-spanX / 2, spanZ / 2],
    ];

    colPositions.forEach(([x, z], idx) => {
      // Kolom
      const colGeo = new THREE.BoxGeometry(0.3, height2, 0.3);
      const colMesh = new THREE.Mesh(colGeo, columnMat.clone());
      colMesh.position.set(x, height2 / 2, z);
      colMesh.castShadow = true;
      colMesh.receiveShadow = true;
      colMesh.userData = {
        type: 'kolom',
        title: 'Kolom Struktur (Portal Frame)',
        desc: 'Elemen struktur vertikal yang berfungsi memikul beban aksial tekan dan momen lentur dari balok, kemudian menyalurkannya ke pondasi.',
        mechanics: 'Gaya Dalam Utama: Tekan Aksial (N) & Momen Lentur (M akibat gempa/angin). Bahaya utama: Tekuk (Buckling).',
        realWorld: 'Menggunakan profil Baja WF (Wide Flange) atau Beton Bertulang K-300 dengan sengkang tahan gempa.'
      };
      this.scene.add(colMesh);
      this.interactiveObjects.push(colMesh);

      // 2. TUMPUAN / PONDASI PEDESTAL DI BAWAH KOLOM
      const footGeo = new THREE.BoxGeometry(0.7, 0.35, 0.7);
      const footMesh = new THREE.Mesh(footGeo, footingMat.clone());
      footMesh.position.set(x, 0.175, z);
      footMesh.castShadow = true;
      footMesh.userData = {
        type: 'tumpuan',
        title: 'Tumpuan Kolom (Base Plate & Angkur)',
        desc: 'Titik perletakan dasar struktur kolom ke pedestal beton pondasi tiang/telapak. Mengunci pergerakan vertikal dan geser horizontal.',
        mechanics: 'Menghasilkan Reaksi Vertikal (Rv), Reaksi Geser (Rh), serta Momen Tahanan (pada tumpuan jepit).',
        realWorld: 'Plat baja tebal 25mm diikat dengan 4-8 baut angkur mutu tinggi ke dalam coran beton sloof/footing.'
      };
      this.scene.add(footMesh);
      this.interactiveObjects.push(footMesh);
    });

    // 3. BALOK UTAMA (Lantai 1 dan Lantai 2)
    const beamYLevels = [height1, height2];
    beamYLevels.forEach((y, lvl) => {
      // Balok Memanjang (X-axis)
      const bXGeo = new THREE.BoxGeometry(spanX, 0.32, 0.22);
      const bX1 = new THREE.Mesh(bXGeo, beamMat.clone());
      bX1.position.set(0, y, -spanZ / 2);
      bX1.castShadow = true;
      bX1.userData = {
        type: 'balok',
        title: `Balok Induk Lantai ${lvl + 1}`,
        desc: 'Elemen struktur horizontal yang menghubungkan kolom ke kolom, memikul pelat lantai dan menyalurkan beban ke kolom.',
        mechanics: 'Gaya Dalam Utama: Momen Lentur (M) di tengah bentang dan Gaya Geser/Lintang (V) di dekat tumpuan kolom.',
        realWorld: 'Balok profil baja IWF 300x150 atau balok beton bertulang dimensi 30/50 cm dengan tulangan tarik bawah.'
      };
      this.scene.add(bX1);
      this.interactiveObjects.push(bX1);

      const bX2 = new THREE.Mesh(bXGeo, beamMat.clone());
      bX2.position.set(0, y, spanZ / 2);
      bX2.castShadow = true;
      bX2.userData = bX1.userData;
      this.scene.add(bX2);
      this.interactiveObjects.push(bX2);

      // Balok Melintang (Z-axis)
      const bZGeo = new THREE.BoxGeometry(0.22, 0.32, spanZ);
      const bZ1 = new THREE.Mesh(bZGeo, beamMat.clone());
      bZ1.position.set(-spanX / 2, y, 0);
      bZ1.castShadow = true;
      bZ1.userData = bX1.userData;
      this.scene.add(bZ1);
      this.interactiveObjects.push(bZ1);

      const bZ2 = new THREE.Mesh(bZGeo, beamMat.clone());
      bZ2.position.set(spanX / 2, y, 0);
      bZ2.castShadow = true;
      bZ2.userData = bX1.userData;
      this.scene.add(bZ2);
      this.interactiveObjects.push(bZ2);
    });

    // 4. SAMBUNGAN STRUKTUR (Gusset Plate & Baut Baja di Pertemuan Balok-Kolom)
    colPositions.forEach(([x, z]) => {
      const jointGeo = new THREE.BoxGeometry(0.42, 0.42, 0.42);
      const jointMesh = new THREE.Mesh(jointGeo, jointMat.clone());
      jointMesh.position.set(x, height1, z);
      jointMesh.userData = {
        type: 'sambungan',
        title: 'Sambungan Balok-Kolom (Gusset Plate & Baut)',
        desc: 'Titik temu kritis di mana gaya lentur dan geser dari balok dipindahkan ke kolom. Menentukan apakah tumpuan berperilaku kaku (jepit) atau sendi.',
        mechanics: 'Menahan momen rotasi dan gaya lintang. Kekakuan sambungan menjaga stabilitas bangunan terhadap goyangan gempa.',
        realWorld: 'Plat baja buhul tebal dengan susunan baut mutu tinggi ASTM A325 atau sambungan las penuh (Full Penetration Weld).'
      };
      this.scene.add(jointMesh);
      this.interactiveObjects.push(jointMesh);
    });

    // 5. PELAT LANTAI (Floor Slab)
    const slabGeo = new THREE.BoxGeometry(spanX, 0.12, spanZ);
    const slabMesh = new THREE.Mesh(slabGeo, slabMat);
    slabMesh.position.set(0, height1 + 0.18, 0);
    slabMesh.receiveShadow = true;
    slabMesh.userData = {
      type: 'pelat',
      title: 'Pelat Lantai (Floor Slab & Bondek)',
      desc: 'Elemen bidang dua dimensi yang langsung menerima beban hidup (orang, perabot) dan beban mati (keramik, pasir spesi).',
      mechanics: 'Bekerja secara dua arah (Two-Way Slab) menyalurkan beban merata (q) ke balok-balok perimeter di sekelilingnya.',
      realWorld: 'Cor beton bertulang tebal 12-15 cm menggunakan wiremesh M8 atau kombinasi plat baja lembaran profil bondek.'
    };
    this.scene.add(slabMesh);
    this.interactiveObjects.push(slabMesh);

    // 6. BEBAN KONSTRUKSI (Simulasi Beban di Atas Pelat)
    const loadBoxGeo = new THREE.BoxGeometry(1.2, 0.6, 1.0);
    const loadBoxMat = new THREE.MeshStandardMaterial({ color: 0xef4444, metalness: 0.5, roughness: 0.4 });
    const loadBox = new THREE.Mesh(loadBoxGeo, loadBoxMat);
    loadBox.position.set(0.6, height1 + 0.54, 0.4);
    loadBox.castShadow = true;
    loadBox.userData = {
      type: 'beban',
      title: 'Beban Layanan (Live & Dead Load)',
      desc: 'Beban gravitasi yang bekerja di atas struktur. Terdiri dari berat material bangunan (beban mati) dan penghuni/peralatan (beban hidup).',
      mechanics: 'Gaya gravitasi vertikal (G = m x g) yang harus diimbangi oleh kapasitas reaksi seluruh tumpuan agar struktur tetap diam seimbang (ΣV = 0).',
      realWorld: 'Perhitungan beban mengacu pada SNI 1727:2020 tentang Beban Desain Minimum untuk Bangunan Gedung.'
    };
    this.scene.add(loadBox);
    this.interactiveObjects.push(loadBox);
  }

  onPointerDown(event) {
    const rect = this.renderer.domElement.getBoundingClientRect();
    this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    this.raycaster.setFromCamera(this.mouse, this.camera);
    const intersects = this.raycaster.intersectObjects(this.interactiveObjects, true);

    if (intersects.length > 0) {
      let target = intersects[0].object;
      while (target.parent && target.parent !== this.scene && !target.userData.type) {
        target = target.parent;
      }
      this.selectComponent(target);
    }
  }

  selectComponent(mesh) {
    // Reset warna objek sebelumnya
    if (this.selectedObject && this.selectedObject.material && this.selectedObject.userData.originalColor) {
      this.selectedObject.material.color.setHex(this.selectedObject.userData.originalColor);
    }

    this.selectedObject = mesh;
    if (!mesh.userData.originalColor && mesh.material) {
      mesh.userData.originalColor = mesh.material.color.getHex();
    }

    // Sorot dengan warna emas/oranye terang
    if (mesh.material) {
      mesh.material.color.setHex(0xf59e0b);
    }

    // Panggil callback ke UI
    if (this.onSelectCallback && mesh.userData) {
      this.onSelectCallback(mesh.userData);
    }
  }

  // Pilih elemen berdasarkan nama tipe (dipanggil dari tombol filter di samping)
  selectByType(type) {
    const target = this.interactiveObjects.find(obj => obj.userData && obj.userData.type === type);
    if (target) {
      this.selectComponent(target);
    }
  }

  resetCamera() {
    if (this.controls) {
      this.camera.position.set(7, 6, 9);
      this.controls.target.set(0, 2.2, 0);
      this.controls.update();
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

window.BuildingComponents3D = BuildingComponents3D;
