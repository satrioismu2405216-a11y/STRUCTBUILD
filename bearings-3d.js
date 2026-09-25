/* ==========================================================================
   StructBuild - bearings-3d.js
   Visualisasi & Pengujian Interaktif Derajat Kebebasan (DOF) Tumpuan 3D
   Sendi (Pin), Rol (Roller), dan Jepit (Fixed)
   ========================================================================== */

class BearingInteractiveLab {
  constructor() {
    this.viewers = {};
  }

  // Inisialisasi canvas mini 3D untuk masing-masing tumpuan
  initBearingViewer(canvasId, type) {
    const container = document.getElementById(canvasId);
    if (!container) return;

    const width = container.clientWidth || 320;
    const height = container.clientHeight || 200;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x090e18);

    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 50);
    camera.position.set(0, 2.5, 4.2);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    const controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.target.set(0, 0.6, 0);
    controls.maxPolarAngle = Math.PI / 2 + 0.1;

    // Lighting
    const amb = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(amb);
    const light = new THREE.DirectionalLight(0xfffaed, 0.9);
    light.position.set(4, 8, 5);
    scene.add(light);

    // Landasan Dasar Beton
    const baseGeo = new THREE.BoxGeometry(2.4, 0.4, 1.4);
    const baseMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.9 });
    const base = new THREE.Mesh(baseGeo, baseMat);
    base.position.y = 0.2;
    scene.add(base);

    // Objek Dinamis
    let movingParts = null;

    if (type === 'sendi') {
      movingParts = this.buildSendiModel(scene);
    } else if (type === 'rol') {
      movingParts = this.buildRolModel(scene);
    } else if (type === 'jepit') {
      movingParts = this.buildJepitModel(scene);
    }

    const viewerState = {
      scene,
      camera,
      renderer,
      controls,
      movingParts,
      type,
      animating: false,
      testMode: null,
      animTime: 0
    };

    this.viewers[type] = viewerState;

    // Render loop
    const animate = () => {
      requestAnimationFrame(animate);
      controls.update();

      if (viewerState.animating) {
        this.updateMotionTest(viewerState);
      }

      renderer.render(scene, camera);
    };
    animate();
  }

  // Model 3D Tumpuan Sendi
  buildSendiModel(scene) {
    const group = new THREE.Group();
    group.position.set(0, 0.4, 0);

    // Kaki Clevis Segitiga
    const shoeGeo = new THREE.ConeGeometry(0.4, 0.5, 4);
    const shoeMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, metalness: 0.7, roughness: 0.3 });
    const shoe = new THREE.Mesh(shoeGeo, shoeMat);
    shoe.rotation.y = Math.PI / 4;
    shoe.position.y = 0.25;
    group.add(shoe);

    // Pin Silinder Pusat Engsel
    const pinGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.7, 16);
    const pinMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.9, roughness: 0.2 });
    const pin = new THREE.Mesh(pinGeo, pinMat);
    pin.rotation.x = Math.PI / 2;
    pin.position.y = 0.5;
    group.add(pin);

    // Balok Uji di atas Pin
    const beamGeo = new THREE.BoxGeometry(1.8, 0.22, 0.3);
    const beamMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.8, roughness: 0.3 });
    const beam = new THREE.Mesh(beamGeo, beamMat);
    beam.position.set(0, 0.65, 0);
    group.add(beam);

    scene.add(group);
    return { group, beam, pin, shoe };
  }

  // Model 3D Tumpuan Rol
  buildRolModel(scene) {
    const group = new THREE.Group();
    group.position.set(0, 0.4, 0);

    // Pelat Landasan Bawah Licin
    const bedGeo = new THREE.BoxGeometry(1.6, 0.08, 0.8);
    const bedMat = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.9, roughness: 0.15 });
    const bed = new THREE.Mesh(bedGeo, bedMat);
    bed.position.y = 0.04;
    group.add(bed);

    // Roda Rol Silinder
    const rollersGroup = new THREE.Group();
    const rollerMat = new THREE.MeshStandardMaterial({ color: 0xfbbf24, metalness: 0.9, roughness: 0.2 });
    const rollerGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.6, 16);

    const rollerMeshes = [];
    for (let i = -1; i <= 1; i++) {
      const r = new THREE.Mesh(rollerGeo, rollerMat);
      r.rotation.x = Math.PI / 2;
      r.position.set(i * 0.26, 0.16, 0);
      rollersGroup.add(r);
      rollerMeshes.push(r);
    }
    group.add(rollersGroup);

    // Sepatu Pelat Atas
    const topPlateGeo = new THREE.BoxGeometry(1.0, 0.08, 0.6);
    const topPlateMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, metalness: 0.7, roughness: 0.3 });
    const topPlate = new THREE.Mesh(topPlateGeo, topPlateMat);
    topPlate.position.y = 0.28;
    group.add(topPlate);

    // Balok di atas Rol
    const beamGeo = new THREE.BoxGeometry(1.8, 0.22, 0.3);
    const beamMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.8, roughness: 0.3 });
    const beam = new THREE.Mesh(beamGeo, beamMat);
    beam.position.set(0, 0.43, 0);
    group.add(beam);

    scene.add(group);
    return { group, beam, topPlate, rollersGroup, rollerMeshes };
  }

  // Model 3D Tumpuan Jepit
  buildJepitModel(scene) {
    const group = new THREE.Group();
    group.position.set(0, 0.4, 0);

    // Dinding Beton Penjepit Kokoh
    const wallGeo = new THREE.BoxGeometry(0.7, 1.2, 0.9);
    const wallMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.9 });
    const wall = new THREE.Mesh(wallGeo, wallMat);
    wall.position.set(-0.6, 0.6, 0);
    group.add(wall);

    // Plat Sambungan Kaku Berbaut Tebal
    const plateGeo = new THREE.BoxGeometry(0.12, 0.6, 0.5);
    const plateMat = new THREE.MeshStandardMaterial({ color: 0xef4444, metalness: 0.8, roughness: 0.3 });
    const plate = new THREE.Mesh(plateGeo, plateMat);
    plate.position.set(-0.22, 0.6, 0);
    group.add(plate);

    // Baut Angkur Pengunci Momen
    for (let dy of [-0.18, 0.18]) {
      for (let dz of [-0.15, 0.15]) {
        const boltGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.18, 8);
        const boltMat = new THREE.MeshStandardMaterial({ color: 0xfbbf24, metalness: 0.9 });
        const bolt = new THREE.Mesh(boltGeo, boltMat);
        bolt.rotation.z = Math.PI / 2;
        bolt.position.set(-0.2, 0.6 + dy, dz);
        group.add(bolt);
      }
    }

    // Balok Kantilever yang terjepit kaku
    const beamGeo = new THREE.BoxGeometry(1.6, 0.26, 0.3);
    const beamMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.8, roughness: 0.3 });
    const beam = new THREE.Mesh(beamGeo, beamMat);
    beam.position.set(0.65, 0.6, 0);
    group.add(beam);

    scene.add(group);
    return { group, beam, wall, plate };
  }

  // Menjalankan Uji Gerak Interaktif (Horizontal, Vertikal, Rotasi)
  testMovement(type, motionType, feedbackElId) {
    const viewer = this.viewers[type];
    if (!viewer) return;

    viewer.animating = true;
    viewer.testMode = motionType;
    viewer.animTime = 0;

    const feedbackEl = document.getElementById(feedbackElId);

    // Respon Pedagogis sesuai hukum Statika
    if (type === 'sendi') {
      if (motionType === 'horizontal') {
        if (feedbackEl) {
          feedbackEl.innerHTML = `
            <span style="color: #ef4444; font-weight: 700;">❌ Gerak Horizontal Tertahan!</span><br>
            Pin baja menahan gaya dorong mendatar sehingga timbul <strong>Gaya Reaksi Horizontal (RH)</strong>. Balok tidak dapat bergeser ke kiri atau ke kanan.
          `;
        }
      } else if (motionType === 'vertikal') {
        if (feedbackEl) {
          feedbackEl.innerHTML = `
            <span style="color: #ef4444; font-weight: 700;">❌ Gerak Vertikal Tertahan!</span><br>
            Sepatu baja menahan gravitasi dan gaya angkat sehingga timbul <strong>Gaya Reaksi Vertikal (RV)</strong>.
          `;
        }
      } else if (motionType === 'rotasi') {
        if (feedbackEl) {
          feedbackEl.innerHTML = `
            <span style="color: #10b981; font-weight: 700;">✅ Rotasi Bebas Berputar!</span><br>
            Balok dapat berputar bebas mengelilingi sumbu pin silinder. <strong>Momen Tahanan = 0 (M = 0)</strong>.
          `;
        }
      }
    } else if (type === 'rol') {
      if (motionType === 'horizontal') {
        if (feedbackEl) {
          feedbackEl.innerHTML = `
            <span style="color: #10b981; font-weight: 700;">✅ Gerak Horizontal Bebas Bergulir!</span><br>
            Silinder rol bergulir di atas plat landasan tanpa hambatan gesek. <strong>Reaksi Horizontal = 0 (RH = 0)</strong>. Sangat vital untuk memfasilitasi ekspansi pemuaian jembatan!
          `;
        }
      } else if (motionType === 'vertikal') {
        if (feedbackEl) {
          feedbackEl.innerHTML = `
            <span style="color: #ef4444; font-weight: 700;">❌ Gerak Vertikal Tertahan!</span><br>
            Rol tetap menahan beban gravitasi ke bawah, menghasilkan <strong>Gaya Reaksi Vertikal (RV)</strong>.
          `;
        }
      } else if (motionType === 'rotasi') {
        if (feedbackEl) {
          feedbackEl.innerHTML = `
            <span style="color: #10b981; font-weight: 700;">✅ Rotasi Bebas Berputar!</span><br>
            Ujung balok dapat mengalami sudut lentur (rotasi) secara bebas di atas sepatu rol. <strong>Momen = 0 (M = 0)</strong>.
          `;
        }
      }
    } else if (type === 'jepit') {
      if (feedbackEl) {
        feedbackEl.innerHTML = `
          <span style="color: #ef4444; font-weight: 700;">❌ Semua Gerak Tertahan Total!</span><br>
          Dinding beton dan angkur kaku menahan geser horizontal (RH), gaya vertikal (RV), dan putaran rotasi sehingga timbul <strong>Momen Jepit Reaksi (M)</strong>. Derajat kebebasan = 0!
        `;
      }
    }
  }

  updateMotionTest(viewer) {
    viewer.animTime += 0.05;
    const t = viewer.animTime;
    const parts = viewer.movingParts;

    if (viewer.type === 'sendi') {
      if (viewer.testMode === 'rotasi') {
        // Balok mengayun berotasi di sekitar pin
        parts.beam.rotation.z = Math.sin(t * 3) * 0.14;
      } else if (viewer.testMode === 'horizontal') {
        // Balok bergetar sedikit tanda tertahan keras (tidak bisa bergerak)
        parts.beam.position.x = Math.sin(t * 20) * 0.015;
      } else if (viewer.testMode === 'vertikal') {
        parts.beam.position.y = 0.65 + Math.sin(t * 20) * 0.008;
      }
    } else if (viewer.type === 'rol') {
      if (viewer.testMode === 'horizontal') {
        // Balok dan pelat atas bergeser maju mundur mulus
        const dx = Math.sin(t * 2.5) * 0.25;
        parts.beam.position.x = dx;
        parts.topPlate.position.x = dx;
        // Roda rol bergulir
        if (parts.rollerMeshes) {
          parts.rollerMeshes.forEach(r => {
            r.position.x = r.position.x + (dx * 0.005);
            r.rotation.x += 0.05;
          });
        }
      } else if (viewer.testMode === 'rotasi') {
        parts.beam.rotation.z = Math.sin(t * 3) * 0.12;
      } else if (viewer.testMode === 'vertikal') {
        parts.beam.position.y = 0.43 + Math.sin(t * 20) * 0.008;
      }
    } else if (viewer.type === 'jepit') {
      // Tertahan kaku, hanya getaran mikro material
      parts.beam.position.y = 0.6 + Math.sin(t * 25) * 0.005;
      parts.beam.rotation.z = 0;
    }

    // Berhenti otomatis setelah 3 detik animasi
    if (t > 4.5) {
      viewer.animating = false;
      // Reset posisi balok
      if (parts.beam) {
        parts.beam.rotation.z = 0;
        parts.beam.position.x = viewer.type === 'jepit' ? 0.65 : 0;
        parts.beam.position.y = viewer.type === 'sendi' ? 0.65 : (viewer.type === 'rol' ? 0.43 : 0.6);
      }
      if (parts.topPlate) parts.topPlate.position.x = 0;
    }
  }
}

window.BearingInteractiveLab = BearingInteractiveLab;
