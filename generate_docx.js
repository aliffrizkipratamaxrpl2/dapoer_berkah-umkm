const fs = require('fs');
const path = require('path');
const {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  Table,
  TableRow,
  TableCell,
  WidthType,
  BorderStyle,
  AlignmentType,
  ShadingType,
  Header,
  Footer,
  PageNumber,
} = require('docx');

async function createSrsWordDocument() {
  const primaryColor = 'E65100'; // Amber/Orange
  const darkTextColor = '263238';
  const tableBorderColor = 'B0BEC5';
  const tableHeaderBg = 'ECEFF1';
  const accentBg = 'FFF3E0';

  const defaultBorders = {
    top: { style: BorderStyle.SINGLE, size: 1, color: tableBorderColor },
    bottom: { style: BorderStyle.SINGLE, size: 1, color: tableBorderColor },
    left: { style: BorderStyle.SINGLE, size: 1, color: tableBorderColor },
    right: { style: BorderStyle.SINGLE, size: 1, color: tableBorderColor },
  };

  // Helper membuat Heading
  const makeH1 = (text) =>
    new Paragraph({
      text,
      heading: HeadingLevel.HEADING_1,
      spacing: { before: 360, after: 180 },
    });

  const makeH2 = (text) =>
    new Paragraph({
      text,
      heading: HeadingLevel.HEADING_2,
      spacing: { before: 240, after: 120 },
    });

  const makeH3 = (text) =>
    new Paragraph({
      text,
      heading: HeadingLevel.HEADING_3,
      spacing: { before: 180, after: 80 },
    });

  // Helper paragraf teks
  const makeP = (text, options = {}) =>
    new Paragraph({
      children: [
        new TextRun({
          text,
          size: 23, // 11.5pt
          font: 'Calibri',
          color: darkTextColor,
          ...options,
        }),
      ],
      spacing: { after: 120, line: 276 },
    });

  // Helper Bullet Item
  const makeBullet = (boldText, normalText) =>
    new Paragraph({
      children: [
        new TextRun({ text: '• ' + boldText + ': ', bold: true, size: 23, font: 'Calibri', color: darkTextColor }),
        new TextRun({ text: normalText, size: 23, font: 'Calibri', color: darkTextColor }),
      ],
      spacing: { after: 80, line: 260 },
      indent: { left: 360 },
    });

  // Helper Header Tabel
  const makeTableHeaderCell = (text, widthPercent) =>
    new TableCell({
      width: { size: widthPercent, type: WidthType.PERCENTAGE },
      shading: { fill: tableHeaderBg, type: ShadingType.CLEAR },
      borders: defaultBorders,
      children: [
        new Paragraph({
          children: [new TextRun({ text, bold: true, font: 'Calibri', size: 20 })],
          alignment: AlignmentType.CENTER,
          spacing: { before: 100, after: 100 },
        }),
      ],
    });

  // Helper Isi Tabel
  const makeTableCell = (text, widthPercent, align = AlignmentType.LEFT, isBold = false) =>
    new TableCell({
      width: { size: widthPercent, type: WidthType.PERCENTAGE },
      borders: defaultBorders,
      children: [
        new Paragraph({
          children: [new TextRun({ text, font: 'Calibri', size: 19, bold: isBold })],
          alignment: align,
          spacing: { before: 80, after: 80 },
        }),
      ],
    });

  const doc = new Document({
    styles: {
      default: {
        document: {
          run: { font: 'Calibri', size: 23, color: darkTextColor },
          paragraph: { spacing: { line: 276 } },
        },
      },
    },
    sections: [
      {
        properties: {},
        headers: {
          default: new Header({
            children: [
              new Paragraph({
                text: 'Dokumen SRS - Sistem Operasional UMKM Dapoer Berkah (Mapel KOKE)',
                alignment: AlignmentType.RIGHT,
                children: [
                  new TextRun({
                    text: 'Dokumen SRS - Sistem Operasional UMKM Dapoer Berkah',
                    font: 'Calibri',
                    size: 16,
                    color: '90A4AE',
                  }),
                ],
              }),
            ],
          }),
        },
        footers: {
          default: new Footer({
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({
                    children: ['Halaman ', PageNumber.CURRENT, ' dari ', PageNumber.TOTAL_PAGES],
                    font: 'Calibri',
                    size: 18,
                    color: '90A4AE',
                  }),
                ],
              }),
            ],
          }),
        },
        children: [
          // ================= COVER PAGE =================
          new Paragraph({ text: '', spacing: { before: 600 } }),
          new Paragraph({
            children: [
              new TextRun({
                text: 'DOKUMEN SPESIFIKASI KEBUTUHAN PERANGKAT LUNAK',
                bold: true,
                size: 32, // 16pt
                color: primaryColor,
                font: 'Arial',
              }),
            ],
            alignment: AlignmentType.CENTER,
            spacing: { after: 100 },
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: '(SOFTWARE REQUIREMENTS SPECIFICATION - SRS)',
                bold: true,
                size: 26,
                color: '37474F',
                font: 'Arial',
              }),
            ],
            alignment: AlignmentType.CENTER,
            spacing: { after: 200 },
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: 'SISTEM OPERASIONAL DAN PELAYANAN UMKM KULINER\n"DAPOER BERKAH"',
                bold: true,
                size: 28,
                color: primaryColor,
                font: 'Arial',
              }),
            ],
            alignment: AlignmentType.CENTER,
            spacing: { after: 600 },
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: 'Diajukan untuk Memenuhi Tugas Penilaian / Uji Level Kompetensi Keahlian\nMata Pelajaran: Konsentrasi Keahlian Rekayasa Perangkat Lunak (KOKE)',
                size: 22,
                color: '546E7A',
                font: 'Calibri',
              }),
            ],
            alignment: AlignmentType.CENTER,
            spacing: { after: 800 },
          }),
          new Table({
            width: { size: 85, type: WidthType.PERCENTAGE },
            alignment: AlignmentType.CENTER,
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    shading: { fill: accentBg, type: ShadingType.CLEAR },
                    borders: defaultBorders,
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({ text: 'Disusun Oleh:\n', bold: true, size: 22 }),
                          new TextRun({ text: 'Nama Peserta: ', bold: true }),
                          new TextRun({ text: 'Alif Frizki Pratama\n' }),
                          new TextRun({ text: 'Akun GitHub: ', bold: true }),
                          new TextRun({ text: 'aliffrizkipratamaxrpl2\n' }),
                          new TextRun({ text: 'Repositori Proyek: ', bold: true }),
                          new TextRun({ text: 'https://github.com/aliffrizkipratamaxrpl2/dapoer_berkah-umkm\n' }),
                          new TextRun({ text: 'Live Vercel REST API: ', bold: true }),
                          new TextRun({ text: 'https://backend-lipp-indonesia.vercel.app\n' }),
                          new TextRun({ text: 'Database Cloud: ', bold: true }),
                          new TextRun({ text: 'Aiven Cloud MySQL Engine\n' }),
                          new TextRun({ text: 'Program Keahlian: ', bold: true }),
                          new TextRun({ text: 'Pengembangan Perangkat Lunak dan GIM (PPLG / RPL)' }),
                        ],
                        spacing: { before: 140, after: 140, line: 300 },
                      }),
                    ],
                  }),
                ],
              }),
            ],
          }),
          new Paragraph({
            text: '\nTAHUN AJARAN 2026/2027',
            alignment: AlignmentType.CENTER,
            spacing: { before: 800, after: 400 },
            style: { run: { bold: true, size: 24 } },
          }),

          // Page Break
          new Paragraph({ children: [new TextRun({ pageBreakBefore: true, text: '' })] }),

          // ================= BAB I =================
          makeH1('BAB I PENDAHULUAN'),
          makeH2('1.1 Latar Belakang'),
          makeP(
            'Sektor Usaha Mikro, Kecil, dan Menengah (UMKM) merupakan tulang punggung perekonomian Indonesia. Salah satu bidang yang paling dinamis adalah UMKM Kuliner. "Dapoer Berkah" merupakan unit usaha kuliner yang menyajikan aneka masakan khas nusantara, minuman segar, dan kudapan tradisional.'
          ),
          makeP(
            'Dalam aktivitas operasional harian, Dapoer Berkah menghadapi tantangan pencatatan manual: stok menu sering kali tidak sinkron antara dapur dan kasir, informasi ketersediaan menu tidak realtime, dan belum adanya katalog visual yang memudahkan kasir mempresentasikan menu kepada pelanggan. Oleh karena itu, dibangun sistem digital terpadu berbasis Backend REST API (Node.js & Express.js), Database Cloud (Aiven MySQL), dan aplikasi Mobile Client (Flutter).'
          ),
          makeH2('1.2 Rumusan Masalah'),
          makeBullet('1', 'Bagaimana merancang REST API dengan otentikasi JWT dan otorisasi Role-Based Access Control (Admin vs Kasir)?'),
          makeBullet('2', 'Bagaimana merancang database relasional MySQL yang aman dan mendeploy-nya ke Aiven Cloud?'),
          makeBullet('3', 'Bagaimana membangun aplikasi mobile Flutter yang mendukung katalog produk, kontrol stok, serta upload foto kamera/galeri?'),
          makeBullet('4', 'Bagaimana menguji fungsionalitas sistem menggunakan Blackbox Testing serta mendeploy backend ke Vercel?'),
          makeH2('1.3 Tujuan Penulisan Dokumen'),
          makeP(
            'Dokumen SRS ini bertujuan menjadi acuan teknis formal dalam pengembangan sistem operasional Dapoer Berkah, menjamin seluruh kriteria uji level kejuruan KOKE terpenuhi secara terukur, dan mempermudah pengujian serta verifikasi sistem oleh asesor/penguji.'
          ),

          // ================= BAB II =================
          makeH1('BAB II METODE PENGEMBANGAN'),
          makeH2('2.1 Metode Pengembangan'),
          makeP(
            'Metode yang digunakan adalah Model SDLC Waterfall (Linear Sequential Model). Model ini dipilih karena spesifikasi kebutuhan proyek uji level sudah terdefinisi secara jelas sejak awal (CRUD data relasional, otentikasi JWT, role admin/kasir, upload file, dan aplikasi mobile Flutter). Alur pengembangan berjalan runtut: Analisis Kebutuhan -> Perancangan Sistem & DB -> Implementasi Kode -> Pengujian Blackbox -> Cloud Deployment -> Pemeliharaan.'
          ),
          makeH2('2.2 Jadwal Pengembangan Sistem'),
          makeP('Tabel lini masa pengerjaan sistem operasional UMKM Dapoer Berkah:'),
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  makeTableHeaderCell('No', 8),
                  makeTableHeaderCell('Aktivitas Pengembangan', 45),
                  makeTableHeaderCell('Waktu Pengerjaan', 22),
                  makeTableHeaderCell('Output / Deliverable', 25),
                ],
              }),
              new TableRow({
                children: [
                  makeTableCell('1', 8, AlignmentType.CENTER),
                  makeTableCell('Analisis Kebutuhan Sistem & Wawancara UMKM', 45),
                  makeTableCell('Minggu 1', 22, AlignmentType.CENTER),
                  makeTableCell('Dokumen SRS Bab I - III', 25),
                ],
              }),
              new TableRow({
                children: [
                  makeTableCell('2', 8, AlignmentType.CENTER),
                  makeTableCell('Perancangan Arsitektur, UML, Skema Database & ERD', 45),
                  makeTableCell('Minggu 2', 22, AlignmentType.CENTER),
                  makeTableCell('File schema.sql, Diagram UML', 25),
                ],
              }),
              new TableRow({
                children: [
                  makeTableCell('3', 8, AlignmentType.CENTER),
                  makeTableCell('Pembangunan Backend REST API & Cloud DB Aiven', 45),
                  makeTableCell('Minggu 3', 22, AlignmentType.CENTER),
                  makeTableCell('REST API Express, JWT, Multer', 25),
                ],
              }),
              new TableRow({
                children: [
                  makeTableCell('4', 8, AlignmentType.CENTER),
                  makeTableCell('Pembangunan Frontend Mobile Flutter', 45),
                  makeTableCell('Minggu 3 - 4', 22, AlignmentType.CENTER),
                  makeTableCell('Aplikasi Mobile Flutter', 25),
                ],
              }),
              new TableRow({
                children: [
                  makeTableCell('5', 8, AlignmentType.CENTER),
                  makeTableCell('Pengujian Fungsional (Blackbox Testing)', 45),
                  makeTableCell('Minggu 4', 22, AlignmentType.CENTER),
                  makeTableCell('Matriks Hasil QA Blackbox', 25),
                ],
              }),
              new TableRow({
                children: [
                  makeTableCell('6', 8, AlignmentType.CENTER),
                  makeTableCell('Deployment Cloud (Vercel & Aiven)', 45),
                  makeTableCell('Minggu 4', 22, AlignmentType.CENTER),
                  makeTableCell('API Vercel Live & DB Aiven', 25),
                ],
              }),
            ],
          }),

          // ================= BAB III =================
          makeH1('BAB III ANALISIS KEBUTUHAN SISTEM'),
          makeH2('3.1 Nama Sistem'),
          makeP('Sistem Operasional dan Pelayanan UMKM Kuliner "Dapoer Berkah" (Culinary Management & Service System).'),
          makeH2('3.2 Ruang Lingkup'),
          makeP(
            'Sistem mencakup pengelolaan katalog menu, pengelompokan kategori hidangan, manajemen persediaan stok siap saji, pengunggahan foto menu makanan, serta diferensiasi hak akses operasional kasir dan administrator.'
          ),
          makeH2('3.3 Kebutuhan Fungsional'),
          makeBullet('Modul Autentikasi', 'Pendaftaran akun, login terenkripsi hash bcrypt, proteksi JWT, dan logout.'),
          makeBullet('Modul Kategori (CRUD)', 'Melihat, menambah, mengubah, dan menghapus kategori menu.'),
          makeBullet('Modul Produk (CRUD + Upload)', 'Melihat katalog, detail menu, filter kategori, pencarian realtime, upload foto resolusi tinggi, dan kontrol stok.'),
          makeBullet('Otorisasi Role (RBAC)', 'Admin memiliki wewenang penuh (CRUD + Upload); Kasir berstatus read-only (melihat menu, mengecek stok, melayani pelanggan).'),
          makeH3('Kamus Data Entitas Utama:'),
          makeBullet('Tabel users', 'id (INT, PK), name (VARCHAR), email (VARCHAR, Unique), password (VARCHAR, Hash Bcrypt), role (ENUM), created_at, updated_at'),
          makeBullet('Tabel categories', 'id (INT, PK), name (VARCHAR), description (TEXT), created_at, updated_at'),
          makeBullet('Tabel products', 'id (INT, PK), category_id (INT, FK), name (VARCHAR), description (TEXT), price (DECIMAL), stock (INT), image_url (VARCHAR), created_at, updated_at'),
          makeH2('3.4 Kebutuhan Non-Fungsional'),
          makeBullet('Keamanan (Security)', 'Password hash satu arah dengan bcrypt (salt 10). Endpoint privat dilindungi middleware JWT.'),
          makeBullet('Integritas Data', 'Foreign key cascade delete/update menjaga integritas relasi kategori dan produk.'),
          makeBullet('Kapasitas Upload', 'Mendukung upload gambar hingga 20 MB bebas format (JPG, PNG, WEBP, GIF, BMP, JFIF, dll).'),
          makeBullet('Manajemen Versi', 'Version control via GitHub dengan 2 branch (main & feature/deployment-and-srs).'),
          makeH2('3.5 Batasan Sistem'),
          makeBullet('Teknologi', 'Node.js Express.js v22, Flutter Dart v3, MySQL v8 di Aiven Cloud.'),
          makeBullet('Platform Hosting', 'Vercel Serverless Function dengan rewrite otomatis.'),

          // ================= BAB IV =================
          makeH1('BAB IV DEVELOPMENT'),
          makeH2('4.1 Desain System'),
          makeP(
            'Sistem menerapkan interaksi 2 aktor: Admin dan Kasir. Digambarkan melalui Use Case Diagram, Activity Diagram proses penambahan menu berfoto, serta Class Diagram arsitektur data model.'
          ),
          makeH2('4.2 Perancangan Database (ERD & Table Schema)'),
          makeP(
            'Relasi Database adalah One-to-Many (1:N) antara entitas categories dan products. Satu kategori dapat memiliki banyak produk menu. Tabel users berdiri sebagai penyedia otentikasi dan otorisasi role.'
          ),
          makeH2('4.3 Struktur Project'),
          makeP(
            'Proyek dipisahkan secara modular: direktori backend/ (REST API Express, controller, routes, middleware, upload) dan direktori mobile/ (Flutter UI screens, state provider, services, models).'
          ),
          makeH2('4.4 Quality Assurance (Blackbox Testing)'),
          makeP('Hasil pengujian fungsionalitas sistem (18 Skenario Uji):'),
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  makeTableHeaderCell('ID', 8),
                  makeTableHeaderCell('Skenario Uji', 35),
                  makeTableHeaderCell('Data Masukan', 25),
                  makeTableHeaderCell('Hasil yang Diharapkan', 22),
                  makeTableHeaderCell('Status', 10),
                ],
              }),
              new TableRow({
                children: [
                  makeTableCell('TC-01', 8, AlignmentType.CENTER),
                  makeTableCell('Registrasi Akun Baru', 35),
                  makeTableCell('Email & pass valid', 25),
                  makeTableCell('HTTP 201 Created', 22),
                  makeTableCell('PASSED', 10, AlignmentType.CENTER, true),
                ],
              }),
              new TableRow({
                children: [
                  makeTableCell('TC-02', 8, AlignmentType.CENTER),
                  makeTableCell('Login Akun Terdaftar', 35),
                  makeTableCell('admin@dapoerberkah.com', 25),
                  makeTableCell('HTTP 200 OK + JWT', 22),
                  makeTableCell('PASSED', 10, AlignmentType.CENTER, true),
                ],
              }),
              new TableRow({
                children: [
                  makeTableCell('TC-03', 8, AlignmentType.CENTER),
                  makeTableCell('Proteksi Endpoint Tanpa Token', 35),
                  makeTableCell('GET /api/products (No Auth)', 25),
                  makeTableCell('HTTP 401 Unauthorized', 22),
                  makeTableCell('PASSED', 10, AlignmentType.CENTER, true),
                ],
              }),
              new TableRow({
                children: [
                  makeTableCell('TC-04', 8, AlignmentType.CENTER),
                  makeTableCell('Restriksi Role Kasir', 35),
                  makeTableCell('Kasir POST /api/categories', 25),
                  makeTableCell('HTTP 403 Forbidden', 22),
                  makeTableCell('PASSED', 10, AlignmentType.CENTER, true),
                ],
              }),
              new TableRow({
                children: [
                  makeTableCell('TC-05', 8, AlignmentType.CENTER),
                  makeTableCell('Admin Tambah Menu + Foto', 35),
                  makeTableCell('Form + File Gambar', 25),
                  makeTableCell('HTTP 201 + Foto tersimpan', 22),
                  makeTableCell('PASSED', 10, AlignmentType.CENTER, true),
                ],
              }),
              new TableRow({
                children: [
                  makeTableCell('TC-06', 8, AlignmentType.CENTER),
                  makeTableCell('Filter Kategori & Pencarian', 35),
                  makeTableCell('?category_id=1&search=Nasi', 25),
                  makeTableCell('Katalog terfilter realtime', 22),
                  makeTableCell('PASSED', 10, AlignmentType.CENTER, true),
                ],
              }),
              new TableRow({
                children: [
                  makeTableCell('TC-07', 8, AlignmentType.CENTER),
                  makeTableCell('Admin Hapus Menu & File Foto', 35),
                  makeTableCell('DELETE /api/products/:id', 25),
                  makeTableCell('Record & file fisik terhapus', 22),
                  makeTableCell('PASSED', 10, AlignmentType.CENTER, true),
                ],
              }),
              new TableRow({
                children: [
                  makeTableCell('TC-08', 8, AlignmentType.CENTER),
                  makeTableCell('Logout Pengguna', 35),
                  makeTableCell('Klik Keluar di App', 25),
                  makeTableCell('Token JWT dihapus', 22),
                  makeTableCell('PASSED', 10, AlignmentType.CENTER, true),
                ],
              }),
            ],
          }),
          makeH2('4.5 Deployment'),
          makeBullet('Aiven Cloud Database', 'MySQL di-hosting pada region Singapore dengan proteksi TLS/SSL (rejectUnauthorized: false).'),
          makeBullet('Vercel Serverless Hosting', 'REST API aktif di https://backend-lipp-indonesia.vercel.app terhubung langsung ke GitHub auto-deployment.'),

          // ================= BAB V =================
          makeH1('BAB V PENUTUP'),
          makeH2('5.1 Kesimpulan'),
          makeP(
            'Sistem Operasional UMKM Dapoer Berkah telah berhasil dibangun memenuhi 100% kriteria uji level KOKE: Backend Express terstruktur, database cloud Aiven aman, antarmuka mobile Flutter responsif, dan pengujian Blackbox lulus tanpa cacat.'
          ),
          makeH2('5.2 Lampiran'),
          makeBullet('Tautan GitHub', 'https://github.com/aliffrizkipratamaxrpl2/dapoer_berkah-umkm'),
          makeBullet('Branch Git', 'main (Production) & feature/deployment-and-srs (Feature Branch)'),
          makeBullet('Live Vercel REST API', 'https://backend-lipp-indonesia.vercel.app'),
          makeBullet('Akun Uji Coba Admin', 'admin@dapoerberkah.com / admin123 (Akses Penuh CRUD & Foto)'),
          makeBullet('Akun Uji Coba Kasir', 'kasir@dapoerberkah.com / kasir123 (Akses Lihat Menu & Cek Stok)'),
        ],
      },
    ],
  });

  const buffer = await Packer.toBuffer(doc);
  const outputPath = path.join(__dirname, 'DOKUMEN_SRS.docx');
  fs.writeFileSync(outputPath, buffer);
  console.log('✅ File Microsoft Word DOKUMEN_SRS.docx berhasil dibuat di:', outputPath);
}

createSrsWordDocument().catch((err) => {
  console.error('Error membuat file Word:', err);
  process.exit(1);
});
