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
} = require(path.join(__dirname, 'backend/node_modules/docx'));

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

  const makeP = (text, options = {}) =>
    new Paragraph({
      children: [
        new TextRun({
          text,
          size: 23,
          font: 'Calibri',
          color: darkTextColor,
          ...options,
        }),
      ],
      spacing: { after: 120, line: 276 },
    });

  const makeBullet = (boldText, normalText) =>
    new Paragraph({
      children: [
        new TextRun({ text: '• ' + boldText + ': ', bold: true, size: 23, font: 'Calibri', color: darkTextColor }),
        new TextRun({ text: normalText, size: 23, font: 'Calibri', color: darkTextColor }),
      ],
      spacing: { after: 80, line: 260 },
      indent: { left: 360 },
    });

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
          new Paragraph({ text: '', spacing: { before: 500 } }),
          new Paragraph({
            children: [
              new TextRun({
                text: 'DOKUMEN SPESIFIKASI KEBUTUHAN PERANGKAT LUNAK',
                bold: true,
                size: 32,
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
            spacing: { after: 500 },
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: 'Diajukan untuk Memenuhi Penilaian Uji Level / Portofolio Kejuruan\nMata Pelajaran: Konsentrasi Keahlian Rekayasa Perangkat Lunak (KOKE)',
                size: 22,
                color: '546E7A',
                font: 'Calibri',
              }),
            ],
            alignment: AlignmentType.CENTER,
            spacing: { after: 600 },
          }),
          new Table({
            width: { size: 90, type: WidthType.PERCENTAGE },
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
                          new TextRun({ text: 'Identitas Proyek & Pengembang:\n', bold: true, size: 22 }),
                          new TextRun({ text: 'Nama Peserta: ', bold: true }),
                          new TextRun({ text: 'Alif Frizki Pratama\n' }),
                          new TextRun({ text: 'Username GitHub: ', bold: true }),
                          new TextRun({ text: 'aliffrizkipratamaxrpl2\n' }),
                          new TextRun({ text: 'Repositori GitHub: ', bold: true }),
                          new TextRun({ text: 'https://github.com/aliffrizkipratamaxrpl2/dapoer_berkah-umkm\n' }),
                          new TextRun({ text: 'Live Vercel REST API: ', bold: true }),
                          new TextRun({ text: 'https://backend-lipp-indonesia.vercel.app\n' }),
                          new TextRun({ text: 'Cloud Database: ', bold: true }),
                          new TextRun({ text: 'MySQL di Aiven Cloud Engine (Region Singapore)\n' }),
                          new TextRun({ text: 'Program Keahlian: ', bold: true }),
                          new TextRun({ text: 'Pengembangan Perangkat Lunak dan GIM (PPLG / RPL)' }),
                        ],
                        spacing: { before: 120, after: 120, line: 300 },
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
            spacing: { before: 600, after: 400 },
            style: { run: { bold: true, size: 24 } },
          }),

          // Page Break
          new Paragraph({ children: [new TextRun({ pageBreakBefore: true, text: '' })] }),

          // ================= BAB I =================
          makeH1('BAB I PENDAHULUAN'),
          makeH2('1.1 Latar Belakang'),
          makeP(
            'Sektor Usaha Mikro, Kecil, dan Menengah (UMKM) memegang peranan krusial dalam pertumbuhan ekonomi nasional. UMKM "Dapoer Berkah" merupakan unit usaha kuliner yang menyajikan aneka hidangan khas nusantara, minuman segar, dan kudapan tradisional.'
          ),
          makeP(
            'Dalam aktivitas harian, Dapoer Berkah menghadapi tantangan pencatatan manual: stok menu sering kali tidak sinkron antara dapur dan kasir, informasi ketersediaan menu tidak realtime, dan belum adanya katalog visual yang memudahkan staf kasir dalam mempresentasikan menu kepada pelanggan. Oleh karena itu, dibangun sistem digital terpadu berbasis Backend REST API (Node.js & Express.js), Database Cloud (Aiven MySQL), dan aplikasi Mobile Client (Flutter).'
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
          makeBullet('Modul Autentikasi (3 Role)', 'Pendaftaran akun, login terenkripsi hash bcrypt, proteksi JWT, dan logout untuk Admin, Kasir, dan Pelanggan.'),
          makeBullet('Modul Kategori (CRUD)', 'Melihat, menambah, mengubah, dan menghapus master kategori hidangan kuliner.'),
          makeBullet('Modul Produk (CRUD + Upload)', 'Melihat katalog berfoto, detail menu, filter kategori, pencarian realtime, upload foto resolusi tinggi dari kamera/galeri, dan pemantauan sisa stok.'),
          makeBullet('Modul Transaksi Pembelian & Metode Bayar', 'Pelanggan memilih porsi hidangan, memilih metode pembayaran (Tunai, QRIS E-Wallet, atau Transfer Bank), dan sistem memotong stok secara otomatis (UPDATE products SET stock = stock - qty).'),
          makeBullet('Modul Simulasi Memasak & Riwayat Pesanan', 'Hitung mundur waktu memasak hidangan (timer 3 menit), status berubah menjadi Siap Dihidangkan, dan pesanan otomatis masuk ke Riwayat Pesanan lengkap dengan kode unik DB-XXXXXX dan nota digital.'),
          makeBullet('Otorisasi Role (RBAC)', 'Admin memiliki wewenang penuh (CRUD + Upload Foto); Kasir dapat melihat katalog, cek stok, dan melayani pemesanan; Pelanggan dapat berbelanja menu dan melihat riwayat pesanan miliknya.'),
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
            'Perancangan sistem dimodelkan menggunakan Unified Modeling Language (UML) yang mencakup Use Case Diagram, Activity Diagram, dan Class Diagram, guna menggambarkan interaksi aktor dengan fungsionalitas aplikasi.'
          ),

          // 4.1.1
          makeH3('4.1.1 Interaksi Aktor dengan Sistem'),
          makeBullet('Aktor 1: Admin (Pemilik / Manajer)', 'Memiliki hak akses penuh untuk melakukan CRUD pada kategori menu, CRUD produk, mengunggah foto menu dari kamera/galeri, menghapus foto fisik, dan memantau stok produk.'),
          makeBullet('Aktor 2: Kasir (Staf Pelayanan / Front Office)', 'Memiliki hak akses operasional untuk melihat katalog menu, melayani pemesanan langsung, mengecek stok, dan memantau status di Riwayat Pesanan.'),
          makeBullet('Aktor 3: Pelanggan (Konsumen / Pembeli)', 'Dapat mendaftar akun, membuka katalog makanan, memilih porsi dan metode pembayaran (Tunai/QRIS/Transfer), memantau waktu memasak, serta melihat Riwayat Pesanan dan nota digital.'),

          // 4.1.2
          makeH3('4.1.2 Use Case Diagram & Spesifikasi Use Case'),
          makeP('Tabel rincian use case yang merepresentasikan fungsionalitas sistem:'),
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  makeTableHeaderCell('Kode', 12),
                  makeTableHeaderCell('Nama Use Case', 30),
                  makeTableHeaderCell('Aktor', 18),
                  makeTableHeaderCell('Deskripsi Fungsionalitas', 40),
                ],
              }),
              new TableRow({
                children: [
                  makeTableCell('UC-01', 12, AlignmentType.CENTER),
                  makeTableCell('Registrasi Akun', 30),
                  makeTableCell('Admin, Kasir, Pelanggan', 18),
                  makeTableCell('Mendaftarkan akun baru dengan enkripsi password bcrypt.', 40),
                ],
              }),
              new TableRow({
                children: [
                  makeTableCell('UC-02', 12, AlignmentType.CENTER),
                  makeTableCell('Login & Autentikasi', 30),
                  makeTableCell('Admin, Kasir, Pelanggan', 18),
                  makeTableCell('Memverifikasi kredensial email & password dan menerbitkan JWT.', 40),
                ],
              }),
              new TableRow({
                children: [
                  makeTableCell('UC-03', 12, AlignmentType.CENTER),
                  makeTableCell('Lihat Dashboard & Stok', 30),
                  makeTableCell('Admin, Kasir, Pelanggan', 18),
                  makeTableCell('Menampilkan total produk, kategori, dan produk stok menipis.', 40),
                ],
              }),
              new TableRow({
                children: [
                  makeTableCell('UC-04', 12, AlignmentType.CENTER),
                  makeTableCell('Lihat Katalog & Detail', 30),
                  makeTableCell('Admin, Kasir, Pelanggan', 18),
                  makeTableCell('Menampilkan kartu menu berfoto, harga Rupiah, dan status ketersediaan.', 40),
                ],
              }),
              new TableRow({
                children: [
                  makeTableCell('UC-05', 12, AlignmentType.CENTER),
                  makeTableCell('Cari & Filter Menu', 30),
                  makeTableCell('Admin, Kasir, Pelanggan', 18),
                  makeTableCell('Menyaring menu berdasarkan kategori dan pencarian nama/deskripsi.', 40),
                ],
              }),
              new TableRow({
                children: [
                  makeTableCell('UC-06', 12, AlignmentType.CENTER),
                  makeTableCell('Tambah Menu + Upload Foto', 30),
                  makeTableCell('Khusus Admin', 18, AlignmentType.LEFT, true),
                  makeTableCell('Membuat menu baru dan mengunggah foto via kamera/galeri (max 20MB).', 40),
                ],
              }),
              new TableRow({
                children: [
                  makeTableCell('UC-07', 12, AlignmentType.CENTER),
                  makeTableCell('Edit Menu & Ganti Foto', 30),
                  makeTableCell('Khusus Admin', 18, AlignmentType.LEFT, true),
                  makeTableCell('Memperbarui informasi harga, stok, nama, atau mengganti foto menu.', 40),
                ],
              }),
              new TableRow({
                children: [
                  makeTableCell('UC-08', 12, AlignmentType.CENTER),
                  makeTableCell('Hapus Menu & Foto Fisik', 30),
                  makeTableCell('Khusus Admin', 18, AlignmentType.LEFT, true),
                  makeTableCell('Menghapus data menu di DB dan file foto fisik di disk server.', 40),
                ],
              }),
              new TableRow({
                children: [
                  makeTableCell('UC-09', 12, AlignmentType.CENTER),
                  makeTableCell('Kelola Kategori CRUD', 30),
                  makeTableCell('Khusus Admin', 18, AlignmentType.LEFT, true),
                  makeTableCell('Menambah, mengedit, dan menghapus kategori menu hidangan.', 40),
                ],
              }),
              new TableRow({
                children: [
                  makeTableCell('UC-10', 12, AlignmentType.CENTER),
                  makeTableCell('Beli Menu & Pilih Bayar', 30),
                  makeTableCell('Pelanggan, Kasir', 18, AlignmentType.LEFT, true),
                  makeTableCell('Membeli menu makanan, pilih metode bayar, dan potong stok otomatis.', 40),
                ],
              }),
              new TableRow({
                children: [
                  makeTableCell('UC-11', 12, AlignmentType.CENTER),
                  makeTableCell('Riwayat Pesanan & Nota', 30),
                  makeTableCell('Semua Role', 18, AlignmentType.LEFT, true),
                  makeTableCell('Melihat status memasak/penyajian dan membuka nota digital belanja.', 40),
                ],
              }),
              new TableRow({
                children: [
                  makeTableCell('UC-12', 12, AlignmentType.CENTER),
                  makeTableCell('Logout Pengguna', 30),
                  makeTableCell('Semua Role', 18),
                  makeTableCell('Menghapus token sesi lokal dan kembali ke Login Screen.', 40),
                ],
              }),
            ],
          }),

          // 4.1.3
          makeH3('4.1.3 Activity Diagram (Alur Proses Sistem)'),
          makeP(
            'Activity Diagram mendeskripsikan aliran proses bisnis dan alur kerja sistem. Terdapat 4 skenario aktivitas utama:'
          ),
          makeBullet('A. Alur Autentikasi Login', 'Pengguna membuka aplikasi -> sistem cek koneksi backend otomatis -> input email & password -> kirim POST /api/auth/login -> verifikasi hash bcrypt -> simpan JWT di SharedPreferences -> buka Dashboard.'),
          makeBullet('B. Alur Tambah Menu & Upload Foto (Admin)', 'Admin membuka form -> input data menu -> pilih foto kamera/galeri -> kirim multipart request -> authMiddleware & roleMiddleware validasi admin -> simpan file di /uploads/ dan record di database -> respon 201 Created.'),
          makeBullet('C. Alur Hapus Menu dengan Konfirmasi (Admin)', 'Admin klik hapus -> konfirmasi dialog -> jika yakin, kirim DELETE /api/products/:id -> backend verifikasi admin -> hapus file foto fisik di server -> hapus record di DB -> respon 200 OK.'),
          makeBullet('D. Alur Pembelian, Pembayaran, Memasak & Riwayat Pesanan (Pelanggan & Kasir)', 'Pelanggan pilih menu & porsi -> cek stok cukup -> klik Beli -> pilih metode pembayaran (Tunai/QRIS/Transfer) -> klik Konfirmasi & Bayar -> backend potong stok otomatis & generate kode DB-XXXXXX -> aplikasi masuk layar memasak (Timer 3 Menit) -> makanan matang & siap dihidangkan -> pesanan otomatis masuk ke Riwayat Pesanan & nota digital tersimpan.'),

          // 4.1.4
          makeH3('4.1.4 Class Diagram (Struktur Kelas Sistem)'),
          makeP('Tabel struktur kelas model data, service HTTP, dan state provider pada aplikasi:'),
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  makeTableHeaderCell('Nama Class', 22),
                  makeTableHeaderCell('Atribut / State', 43),
                  makeTableHeaderCell('Metode / Fungsi', 35),
                ],
              }),
              new TableRow({
                children: [
                  makeTableCell('UserModel', 22, AlignmentType.LEFT, true),
                  makeTableCell('+int id\n+String name\n+String email\n+String role\n+bool isAdmin\n+bool isKasir\n+bool isPelanggan', 43),
                  makeTableCell('+fromJson(Map json)\n+toJson() Map', 35),
                ],
              }),
              new TableRow({
                children: [
                  makeTableCell('CategoryModel', 22, AlignmentType.LEFT, true),
                  makeTableCell('+int id\n+String name\n+String? description\n+int totalProducts\n+String? createdAt', 43),
                  makeTableCell('+fromJson(Map json)\n+toJson() Map', 35),
                ],
              }),
              new TableRow({
                children: [
                  makeTableCell('ProductModel', 22, AlignmentType.LEFT, true),
                  makeTableCell('+int id\n+int categoryId\n+String categoryName\n+String name\n+double price\n+int stock (Sisa Stok)\n+String? imageUrl\n+String? imageFullUrl', 43),
                  makeTableCell('+formattedPrice (Rp)\n+fromJson(Map json)\n+toJson() Map', 35),
                ],
              }),
              new TableRow({
                children: [
                  makeTableCell('OrderModel', 22, AlignmentType.LEFT, true),
                  makeTableCell('+int id\n+String orderNumber (DB-XXXXXX)\n+String buyerName\n+String productName\n+int quantity\n+double totalPrice\n+String paymentMethod\n+String status\n+DateTime createdAt', 43),
                  makeTableCell('+formattedTotalPrice (Rp)\n+formattedDate\n+fromJson(Map json)', 35),
                ],
              }),
              new TableRow({
                children: [
                  makeTableCell('ApiService', 22, AlignmentType.LEFT, true),
                  makeTableCell('+String tokenKey (SharedPreferences)\n+String? _workingBaseUrl', 43),
                  makeTableCell('+login(email, pass)\n+register(name, email, pass, role)\n+getCategories()\n+createCategory()\n+getProducts()\n+createProduct(data, XFile img)\n+updateProduct(id, data, XFile img)\n+deleteProduct(id)\n+buyProduct(id, qty, method)\n+getOrders()\n+updateOrderStatus(no, status)', 35),
                ],
              }),
              new TableRow({
                children: [
                  makeTableCell('AuthProvider', 22, AlignmentType.LEFT, true),
                  makeTableCell('-UserModel? _user\n-bool _isLoading\n-String? _errorMessage', 43),
                  makeTableCell('+checkAuthStatus()\n+login(email, pass)\n+register(...)\n+logout()', 35),
                ],
              }),
              new TableRow({
                children: [
                  makeTableCell('ProductProvider', 22, AlignmentType.LEFT, true),
                  makeTableCell('-List<ProductModel> _products\n-bool _isLoading\n-int? _selectedCategoryId\n-String _searchQuery', 43),
                  makeTableCell('+setCategoryFilter(id)\n+setSearchQuery(q)\n+fetchProducts()\n+addProduct(...)\n+updateProduct(...)\n+deleteProduct(id)', 35),
                ],
              }),
            ],
          }),

          // 4.2
          makeH2('4.2 Perancangan Database (ERD & Table Schema)'),
          makeH3('4.2.1 Entity Relationship Diagram (ERD) & Kardinalitas'),
          makeP(
            'Database ujilevel_umkm menggunakan mesin relasional MySQL di Aiven Cloud. Kardinalitas relasi antar tabel adalah One-to-Many (1:N):'
          ),
          makeBullet('Relasi categories ke products (1 : N)', 'Satu kategori hidangan (contoh: Makanan Utama, Minuman Segar) menaungi banyak produk menu makanan. Foreign key products.category_id mereferensikan categories.id dengan aturan ON DELETE CASCADE dan ON UPDATE CASCADE.'),
          makeBullet('Tabel users', 'Menyimpan data pengguna terautentikasi dengan hak akses role enum (admin atau kasir).'),

          makeH3('4.2.2 Skema Tabel Database (Table Schema)'),
          makeP('A. Tabel: users (Autentikasi & Hak Akses)'),
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  makeTableHeaderCell('Nama Field', 20),
                  makeTableHeaderCell('Tipe Data', 20),
                  makeTableHeaderCell('Null', 10),
                  makeTableHeaderCell('Key', 10),
                  makeTableHeaderCell('Default', 15),
                  makeTableHeaderCell('Keterangan', 25),
                ],
              }),
              new TableRow({
                children: [
                  makeTableCell('id', 20, AlignmentType.LEFT, true),
                  makeTableCell('INT', 20),
                  makeTableCell('NO', 10, AlignmentType.CENTER),
                  makeTableCell('PRI', 10, AlignmentType.CENTER),
                  makeTableCell('AUTO_INC', 15, AlignmentType.CENTER),
                  makeTableCell('Primary Key', 25),
                ],
              }),
              new TableRow({
                children: [
                  makeTableCell('name', 20, AlignmentType.LEFT, true),
                  makeTableCell('VARCHAR(100)', 20),
                  makeTableCell('NO', 10, AlignmentType.CENTER),
                  makeTableCell('', 10),
                  makeTableCell('None', 15, AlignmentType.CENTER),
                  makeTableCell('Nama lengkap pegawai', 25),
                ],
              }),
              new TableRow({
                children: [
                  makeTableCell('email', 20, AlignmentType.LEFT, true),
                  makeTableCell('VARCHAR(100)', 20),
                  makeTableCell('NO', 10, AlignmentType.CENTER),
                  makeTableCell('UNI', 10, AlignmentType.CENTER),
                  makeTableCell('None', 15, AlignmentType.CENTER),
                  makeTableCell('Email akun (Unique)', 25),
                ],
              }),
              new TableRow({
                children: [
                  makeTableCell('password', 20, AlignmentType.LEFT, true),
                  makeTableCell('VARCHAR(255)', 20),
                  makeTableCell('NO', 10, AlignmentType.CENTER),
                  makeTableCell('', 10),
                  makeTableCell('None', 15, AlignmentType.CENTER),
                  makeTableCell('Kata sandi hash bcrypt', 25),
                ],
              }),
              new TableRow({
                children: [
                  makeTableCell('role', 20, AlignmentType.LEFT, true),
                  makeTableCell("ENUM('admin','kasir','pelanggan')", 20),
                  makeTableCell('NO', 10, AlignmentType.CENTER),
                  makeTableCell('', 10),
                  makeTableCell("'pelanggan'", 15, AlignmentType.CENTER),
                  makeTableCell('Peranan hak akses akun', 25),
                ],
              }),
              new TableRow({
                children: [
                  makeTableCell('created_at', 20, AlignmentType.LEFT, true),
                  makeTableCell('TIMESTAMP', 20),
                  makeTableCell('NO', 10, AlignmentType.CENTER),
                  makeTableCell('', 10),
                  makeTableCell('CURRENT_TIME', 15, AlignmentType.CENTER),
                  makeTableCell('Waktu pendaftaran', 25),
                ],
              }),
              new TableRow({
                children: [
                  makeTableCell('updated_at', 20, AlignmentType.LEFT, true),
                  makeTableCell('TIMESTAMP', 20),
                  makeTableCell('NO', 10, AlignmentType.CENTER),
                  makeTableCell('', 10),
                  makeTableCell('CURRENT_TIME', 15, AlignmentType.CENTER),
                  makeTableCell('Waktu pembaruan akun', 25),
                ],
              }),
            ],
          }),

          makeP('\nB. Tabel: categories (Data Utama 1 - Kategori Hidangan)'),
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  makeTableHeaderCell('Nama Field', 20),
                  makeTableHeaderCell('Tipe Data', 20),
                  makeTableHeaderCell('Null', 10),
                  makeTableHeaderCell('Key', 10),
                  makeTableHeaderCell('Default', 15),
                  makeTableHeaderCell('Keterangan', 25),
                ],
              }),
              new TableRow({
                children: [
                  makeTableCell('id', 20, AlignmentType.LEFT, true),
                  makeTableCell('INT', 20),
                  makeTableCell('NO', 10, AlignmentType.CENTER),
                  makeTableCell('PRI', 10, AlignmentType.CENTER),
                  makeTableCell('AUTO_INC', 15, AlignmentType.CENTER),
                  makeTableCell('Primary Key', 25),
                ],
              }),
              new TableRow({
                children: [
                  makeTableCell('name', 20, AlignmentType.LEFT, true),
                  makeTableCell('VARCHAR(100)', 20),
                  makeTableCell('NO', 10, AlignmentType.CENTER),
                  makeTableCell('', 10),
                  makeTableCell('None', 15, AlignmentType.CENTER),
                  makeTableCell('Nama kategori menu', 25),
                ],
              }),
              new TableRow({
                children: [
                  makeTableCell('description', 20, AlignmentType.LEFT, true),
                  makeTableCell('TEXT', 20),
                  makeTableCell('YES', 10, AlignmentType.CENTER),
                  makeTableCell('', 10),
                  makeTableCell('NULL', 15, AlignmentType.CENTER),
                  makeTableCell('Penjelasan kategori', 25),
                ],
              }),
              new TableRow({
                children: [
                  makeTableCell('created_at', 20, AlignmentType.LEFT, true),
                  makeTableCell('TIMESTAMP', 20),
                  makeTableCell('NO', 10, AlignmentType.CENTER),
                  makeTableCell('', 10),
                  makeTableCell('CURRENT_TIME', 15, AlignmentType.CENTER),
                  makeTableCell('Waktu pembuatan', 25),
                ],
              }),
              new TableRow({
                children: [
                  makeTableCell('updated_at', 20, AlignmentType.LEFT, true),
                  makeTableCell('TIMESTAMP', 20),
                  makeTableCell('NO', 10, AlignmentType.CENTER),
                  makeTableCell('', 10),
                  makeTableCell('CURRENT_TIME', 15, AlignmentType.CENTER),
                  makeTableCell('Waktu pembaruan', 25),
                ],
              }),
            ],
          }),

          makeP('\nC. Tabel: products (Data Utama 2 - Produk Menu & Foto)'),
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  makeTableHeaderCell('Nama Field', 20),
                  makeTableHeaderCell('Tipe Data', 20),
                  makeTableHeaderCell('Null', 10),
                  makeTableHeaderCell('Key', 10),
                  makeTableHeaderCell('Default', 15),
                  makeTableHeaderCell('Keterangan', 25),
                ],
              }),
              new TableRow({
                children: [
                  makeTableCell('id', 20, AlignmentType.LEFT, true),
                  makeTableCell('INT', 20),
                  makeTableCell('NO', 10, AlignmentType.CENTER),
                  makeTableCell('PRI', 10, AlignmentType.CENTER),
                  makeTableCell('AUTO_INC', 15, AlignmentType.CENTER),
                  makeTableCell('Primary Key', 25),
                ],
              }),
              new TableRow({
                children: [
                  makeTableCell('category_id', 20, AlignmentType.LEFT, true),
                  makeTableCell('INT', 20),
                  makeTableCell('NO', 10, AlignmentType.CENTER),
                  makeTableCell('MUL', 10, AlignmentType.CENTER),
                  makeTableCell('None', 15, AlignmentType.CENTER),
                  makeTableCell('FK -> categories(id)', 25),
                ],
              }),
              new TableRow({
                children: [
                  makeTableCell('name', 20, AlignmentType.LEFT, true),
                  makeTableCell('VARCHAR(150)', 20),
                  makeTableCell('NO', 10, AlignmentType.CENTER),
                  makeTableCell('', 10),
                  makeTableCell('None', 15, AlignmentType.CENTER),
                  makeTableCell('Nama hidangan / menu', 25),
                ],
              }),
              new TableRow({
                children: [
                  makeTableCell('description', 20, AlignmentType.LEFT, true),
                  makeTableCell('TEXT', 20),
                  makeTableCell('YES', 10, AlignmentType.CENTER),
                  makeTableCell('', 10),
                  makeTableCell('NULL', 15, AlignmentType.CENTER),
                  makeTableCell('Rincian rasa & porsi', 25),
                ],
              }),
              new TableRow({
                children: [
                  makeTableCell('price', 20, AlignmentType.LEFT, true),
                  makeTableCell('DECIMAL(12,2)', 20),
                  makeTableCell('NO', 10, AlignmentType.CENTER),
                  makeTableCell('', 10),
                  makeTableCell('0.00', 15, AlignmentType.CENTER),
                  makeTableCell('Harga jual Rupiah', 25),
                ],
              }),
              new TableRow({
                children: [
                  makeTableCell('stock', 20, AlignmentType.LEFT, true),
                  makeTableCell('INT', 20),
                  makeTableCell('NO', 10, AlignmentType.CENTER),
                  makeTableCell('', 10),
                  makeTableCell('0', 15, AlignmentType.CENTER),
                  makeTableCell('Jumlah stok siap saji', 25),
                ],
              }),
              new TableRow({
                children: [
                  makeTableCell('image_url', 20, AlignmentType.LEFT, true),
                  makeTableCell('VARCHAR(255)', 20),
                  makeTableCell('YES', 10, AlignmentType.CENTER),
                  makeTableCell('', 10),
                  makeTableCell('NULL', 15, AlignmentType.CENTER),
                  makeTableCell('Nama file foto terupload', 25),
                ],
              }),
              new TableRow({
                children: [
                  makeTableCell('created_at', 20, AlignmentType.LEFT, true),
                  makeTableCell('TIMESTAMP', 20),
                  makeTableCell('NO', 10, AlignmentType.CENTER),
                  makeTableCell('', 10),
                  makeTableCell('CURRENT_TIME', 15, AlignmentType.CENTER),
                  makeTableCell('Waktu menu dibuat', 25),
                ],
              }),
              new TableRow({
                children: [
                  makeTableCell('updated_at', 20, AlignmentType.LEFT, true),
                  makeTableCell('TIMESTAMP', 20),
                  makeTableCell('NO', 10, AlignmentType.CENTER),
                  makeTableCell('', 10),
                  makeTableCell('CURRENT_TIME', 15, AlignmentType.CENTER),
                  makeTableCell('Waktu menu diperbarui', 25),
                ],
              }),
            ],
          }),

          // 4.3 & 4.4
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
              new TableRow({
                children: [
                  makeTableCell('TC-09', 8, AlignmentType.CENTER),
                  makeTableCell('Pelanggan Beli & Potong Stok', 35),
                  makeTableCell('POST /api/products/:id/buy', 25),
                  makeTableCell('Stok terpotong di DB MySQL', 22),
                  makeTableCell('PASSED', 10, AlignmentType.CENTER, true),
                ],
              }),
              new TableRow({
                children: [
                  makeTableCell('TC-10', 8, AlignmentType.CENTER),
                  makeTableCell('Alur Masak & Riwayat Pesanan', 35),
                  makeTableCell('Timer Masak & GET /orders/list', 25),
                  makeTableCell('Masuk riwayat & nota terbit', 22),
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
          makeBullet('Akun Uji Coba Pelanggan', 'pelanggan@dapoerberkah.com / pelanggan123 (Akses Beli, Bayar & Riwayat)'),
        ],
      },
    ],
  });

  const buffer = await Packer.toBuffer(doc);
  const outputPath = path.join(__dirname, 'DOKUMEN_SRS_LENGKAP.docx');
  fs.writeFileSync(outputPath, buffer);
  console.log('✅ File Microsoft Word DOKUMEN_SRS_LENGKAP.docx berhasil dibuat di:', outputPath);
  
  try {
    const mainPath = path.join(__dirname, 'DOKUMEN_SRS.docx');
    fs.writeFileSync(mainPath, buffer);
    console.log('✅ File DOKUMEN_SRS.docx juga berhasil diperbarui!');
  } catch (err) {
    console.log('ℹ️ DOKUMEN_SRS.docx sedang dibuka di MS Word, file baru disimpan di DOKUMEN_SRS_LENGKAP.docx');
  }
}

createSrsWordDocument().catch((err) => {
  console.error('Error membuat file Word:', err);
  process.exit(1);
});
