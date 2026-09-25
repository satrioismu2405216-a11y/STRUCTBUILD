# 🏗️ StructBuild - Platform Pembelajaran Interaktif Statika Bangunan
### Khusus Siswa SMK Teknik Konstruksi dan Perumahan (TKP) Fase E

**StructBuild** adalah media pembelajaran web interaktif modern yang dirancang untuk membantu siswa SMK memahami konsep **Statika Bangunan** secara kontekstual, visual, dan berbasis kondisi konstruksi nyata di lapangan.

Website ini menerapkan metode **Guided Discovery Learning** (Belajar Berbasis Penemuan Terbimbing): fokus utamanya bukan menjadi kalkulator angka instan, melainkan membimbing siswa mengamati perilaku fisik struktur, memanipulasi peletakan beban, memprediksi respons tumpuan, melakukan perhitungan mandiri, serta **menggambar dan menguji struktur sendiri**.

---

## 🚀 Cara Menjalankan di Google Chrome

Aplikasi ini dibangun menggunakan **Pure HTML5, CSS3, dan Vanilla JavaScript (Modular ES6)** dengan pustaka 3D **Three.js** yang sudah diikutsertakan secara lokal (*offline-first*).

### Opsi 1: 1-Klik Jalankan di Google Chrome (Paling Praktis)
Tersedia berkas pintasan otomatis Windows:
1. Buka folder `C:\Users\COMPUTER\.gemini\antigravity\scratch\structbuild`.
2. Klik ganda (**double-click**) pada file **`Buka-StructBuild.bat`**.
3. Aplikasi akan langsung mencari Google Chrome di komputer Anda dan membukanya seketika!

### Opsi 2: Buka Langsung `index.html`
1. Klik ganda pada file **`index.html`**.
2. Website akan terbuka di browser apa pun tanpa memerlukan node.js, python, atau koneksi internet.

### Opsi 3: Pasang Sebagai Aplikasi Desktop (PWA)
Saat dibuka di Google Chrome:
1. Perhatikan bilah alamat (URL bar) di kanan atas browser.
2. Klik tombol **Install StructBuild** (ikon monitor dengan panah bawah).
3. StructBuild akan terpasang di Desktop komputer seperti aplikasi native Windows!

---

## 🌐 Cara Mempublikasikan Online Agar Bisa Dicari Siswa di Google

Agar seluruh siswa dan guru SMK di sekolah dapat mencari dan membuka website ini secara bebas di Google Chrome lewat internet (tanpa perlu menyalin folder):

### A. Hosting Gratis Lewat GitHub Pages (Sangat Direkomendasikan)
1. Buat repositori baru di [GitHub](https://github.com/) dengan nama `structbuild`.
2. Unggah seluruh isi folder `structbuild` ini ke repositori tersebut.
3. Masuk ke tab **Settings** ➔ **Pages** ➔ pilih branch **main** ➔ simpan (**Save**).
4. Dalam 1 menit, website Anda sudah aktif di internet: `https://username.github.io/structbuild`.
5. Karena sudah dilengkapi *SEO meta tags* dan *manifest.json*, Google akan mengindeks situs ini sehingga dapat dicari dengan kata kunci *"StructBuild SMK TKP Statika Bangunan"*.

### B. Hosting 10 Detik Lewat Vercel atau Netlify
1. Buka [Vercel](https://vercel.com/) atau [Netlify](https://www.netlify.com/).
2. Cukup *drag and drop* (tarik) folder `structbuild` ke dashboard.
3. Anda akan langsung mendapatkan tautan domain publik HTTPS gratis.

---

## 🌟 Fitur Utama & Modul Pembelajaran Lengkap

### 1. 🎛️ Simulasi Struktur 3D Multi-Model (Portal, Atap & Jembatan)
Siswa dapat berganti dengan mudah di antara 3 tipe struktur nyata:
* **Balok Portal Gedung:** Profil baja I-Beam di atas pilar beton kokoh.
* **Kuda-Kuda Rangka Atap 3D:** Konstruksi segitiga atap lengkap dengan batang tarik bawah, rafter atas, batang pengisi (king/queen post), dan balok nok/gording kayu.
* **Jembatan Rangka Baja Warren:** Konstruksi jembatan rangka melintasi sungai lengkap dengan pilar abutment beton, lantai jalan, dan marka jalan.

#### 📍 Peletakan Beban Bebas & Titik Tertentu:
* **Klik Langsung Model 3D:** Siswa dapat mengeklik titik buhul atap, pilar, atau lantai jalan jembatan untuk meletakkan beban derek/truk langsung di titik tersebut.
* **Pintasan Peletakan Beban Presisi:**
  * `Tumpuan A (0%)`
  * `1/4 Bentang (25%)`
  * `Tengah Bentang (50%)`
  * `3/4 Bentang (75%)`
  * `Tumpuan B (100%)`
* **Respons Visual Proporsional:** Panah reaksi di Tumpuan A dan B membesar/mengecil secara otomatis sesuai posisi beban, melatih intuisi mekanika siswa tanpa bergantung pada bocoran angka kalkulator instan.

---

### 2. 🎨 Studio Gambar Struktur Mandiri (Sandbox)
Fitur unggulan baru di mana siswa dapat merancang dan bereksperimen dari kanvas kosong:
* **1. Tarik Batang:** Klik titik 1 dan titik 2 untuk membuat batang baja.
* **2. Titik Buhul:** Tambahkan simpul pertemuan batang.
* **3. Pasang Sendi (Pin):** Pasang tumpuan dengan 2 reaksi (Rv & Rh).
* **4. Pasang Rol (Roller):** Pasang tumpuan dengan 1 reaksi vertikal (Rv).
* **5. Pasang Jepit (Fixed):** Pasang tumpuan kaku penahan momen (Rv, Rh, M).
* **6. Taruh Beban:** Klik titik simpul mana saja untuk meletakkan beban gravitasi.
* **Analisis Mekanika Mandiri:**
  * Klik tombol **"Simulasikan Struktur Saya"**.
  * Visualisasi Reaksi Tumpuan otomatis muncul.
  * Batang diberi kode warna mekanika teknik:
    * 🟦 **Warna Biru:** Batang Tarik (*Tension Member*)
    * 🟥 **Warna Merah:** Batang Tekan (*Compression Member*)
* **Template Cepat:** Tersedia template instan *Kuda-Kuda Atap Segitiga*, *Jembatan Warren*, *Balok 2 Tumpuan*, dan *Balok Kantilever*.

---

### 3. 🏢 Kenali Struktur (Model Rangka Gedung 3D)
* Model portal gedung 2 lantai dengan inspeksi *raycasting* interaktif.
* Klik elemen (kolom, balok induk, pelat lantai, sambungan baut gusset plate, pondasi) untuk mempelajari fungsi dan gaya dalamnya.
* Visualisasi rantai penyaluran beban (*load path*) dari penghuni hingga tanah keras.

---

### 4. ⚙️ Tumpuan (Sendi, Rol, Jepit) & Uji Derajat Kebebasan
* Perbandingan bentuk fisik konstruksi nyata vs simbol statika 2D.
* **Lab Uji Gerak Interaktif:**
  * `Uji Dorong Horisontal`: Mengamati penahanan gaya horizontal pada sendi dan jepit.
  * `Uji Geser Horisontal`: Mengamati silinder rol bergulir mulus memfasilitasi ekspansi pemuaian jembatan akibat suhu.
  * `Uji Rotasi Lentur`: Mengamati kebebasan putar pin sendi dan rol.

---

### 5. 📊 Diagram Gaya Dalam (Bidang N, V, M)
* Grafik Canvas dinamis yang bergerak real-time mengikuti posisi beban.
* Penjelasan fisik konstruksi: Mengapa momen lentur positif memerlukan tulangan baja di bagian bawah balok, dan mengapa gaya lintang tinggi memerlukan sengkang/begel yang lebih rapat di dekat tumpuan.

---

### 6. 📝 Kuis Analisis Kasus Konstruksi
* 6 soal berbasis diagram visual SVG kontekstual (bukan sekadar teks hafalan).
* Umpan balik penjelasan mendalam (*pedagogical feedback*) di setiap pilihan jawaban.

---

### 7. 🏆 Progres Belajar & Gamifikasi Lencana
* Melacak pencapaian belajar siswa dan koleksi 6 lencana keahlian (*Pondasi Awal*, *Inspektur Elemen*, *Ahli Tumpuan*, *Master Keseimbangan*, *Detektif Gaya Dalam*, *Juara Statika*).
* Tersimpan otomatis di *Local Storage* peramban.

---

## 📁 Struktur Berkas Proyek

```
structbuild/
├── index.html                # Kerangka antarmuka utama (PWA & SEO Ready)
├── Buka-StructBuild.bat      # Pintasan 1-klik untuk menjalankan di Google Chrome
├── manifest.json             # Konfigurasi PWA Google Chrome
├── README.md                 # Dokumentasi panduan lengkap
├── css/
│   └── style.css             # Tema konstruksi modern & studio gambar
└── js/
    ├── three.min.js          # Library Three.js lokal
    ├── OrbitControls.js      # Kontrol navigasi kamera 3D
    ├── structure-3d.js       # Simulasi 3D balok, atap kuda-kuda, dan jembatan warren
    ├── components-3d.js      # Model 3D rangka portal gedung
    ├── bearings-3d.js        # Lab 3D pengujian derajat kebebasan tumpuan
    ├── sandbox.js            # Studio gambar struktur & simulator mandiri siswa
    ├── diagrams.js           # Diagram Canvas bidang N, V, dan M
    ├── simulation.js         # Pengendali Guided Discovery Learning 7 tahap
    ├── quiz.js               # Mesin kuis kasus konstruksi & feedback pedagogis
    ├── progress.js           # Pelacak riwayat belajar & lencana gamifikasi
    └── app.js                # Router tampilan & koordinator utama
```
