# 🍱 Dapoer Berkah - Solusi Digital Operasional & Pelayanan UMKM Kuliner

Aplikasi digital terintegrasi untuk mendukung proses operasional, manajemen katalog produk, stok menu, dan pelayanan pelanggan pada **UMKM Kuliner "Dapoer Berkah"**.

Proyek ini dibangun untuk memenuhi seluruh ketentuan teknis dan kriteria **Uji Level Aplikasi UMKM (Mata Pelajaran KOKE)**, terdiri dari backend REST API berbasis **Node.js & Express.js**, database relasional **MySQL** (Lokal & Cloud **Aiven**), media penyimpanan file foto terintegrasi (**Multer**), antarmuka serverless ready (**Vercel**), dan aplikasi mobile client berbasis **Flutter**.

> 📄 **Dokumen Formal SRS (Software Requirements Specification)**:  
> Seluruh rincian kebutuhan sistem, metode SDLC Waterfall, jadwal gantt chart, diagram UML (Use Case, Activity, Class), ERD, kamus data, tabel Blackbox Testing, dan panduan deployment cloud tersedia lengkap di:  
> 👉 [**DOKUMEN_SRS.md**](file:///c:/Users/ASUS/OneDrive/Dokumen/ujilevel-umkm/DOKUMEN_SRS.md)

---

## 📑 Daftar Isi
1. [Arsitektur Sistem](#-arsitektur-sistem)
2. [Diagram ERD (Entity Relationship Diagram)](#-diagram-erd-entity-relationship-diagram)
3. [Struktur Database](#-struktur-database)
4. [Matriks Otorisasi Berdasarkan Role](#-matriks-otorisasi-berdasarkan-role)
5. [Dokumentasi REST API](#-dokumentasi-rest-api)
6. [Struktur Direktori](#-struktur-direktori)
7. [Panduan Instalasi & Menjalankan](#-panduan-instalasi--menjalankan)
   - [Langkah 1: Menjalankan Database MySQL (Lokal atau Aiven Cloud)](#langkah-1-menjalankan-database-mysql-lokal-atau-aiven-cloud)
   - [Langkah 2: Menjalankan Backend REST API](#langkah-2-menjalankan-backend-rest-api)
   - [Langkah 3: Menjalankan Mobile App Flutter](#langkah-3-menjalankan-mobile-app-flutter)
8. [Panduan Deployment Cloud (Vercel & Aiven)](#-panduan-deployment-cloud-vercel--aiven)
9. [Hasil Pengujian (Blackbox Testing)](#-hasil-pengujian-blackbox-testing)
10. [Akun Uji Coba Default](#-akun-uji-coba-default)

---

## 🏛️ Arsitektur Sistem

```
+-------------------------------------------------------------+
|                     FLUTTER MOBILE CLIENT                   |
|  (Android / iOS / Desktop - Provider State Management)      |
+------------------------------+------------------------------+
                               |
                   HTTP / REST | (JSON Payload & Multipart)
                               v
+-------------------------------------------------------------+
|                 NODE.JS + EXPRESS.JS BACKEND                |
|  - JWT Authentication Middleware                            |
|  - Role-based Access Control (Admin vs Kasir)               |
|  - Multer File Upload & Validation (Max 5MB, JPG/PNG)       |
|  - Standardized JSON Response Formatter                     |
+---------------+-----------------------------+---------------+
                |                             |
       Static File Serving              SQL Queries (mysql2/promise)
                |                             |
                v                             v
+-------------------------------+  +--------------------------+
|  Local Storage / Backend Disk |  |      DATABASE MYSQL      |
|  (backend/uploads/...)        |  |  (ujilevel_umkm DB)      |
+-------------------------------+  +--------------------------+
```

---

## 📊 Diagram ERD (Entity Relationship Diagram)

Berikut adalah Entity Relationship Diagram (ERD) lengkap yang menggambarkan struktur relasi antara data pengguna (`users`) dan dua entitas utama UMKM yang saling berelasi (`categories` dan `products`):

```mermaid
erDiagram
    users {
        int id PK "AUTO_INCREMENT"
        varchar name "Nama Lengkap Pengguna"
        varchar email UK "Alamat Email Unik"
        varchar password "Password Hash (Bcrypt)"
        enum role "'admin' atau 'kasir'"
        timestamp created_at "Waktu Registrasi"
        timestamp updated_at "Waktu Terakhir Diperbarui"
    }

    categories {
        int id PK "AUTO_INCREMENT"
        varchar name "Nama Kategori Menu"
        text description "Deskripsi Kategori"
        timestamp created_at "Waktu Dibuat"
        timestamp updated_at "Waktu Diperbarui"
    }

    products {
        int id PK "AUTO_INCREMENT"
        int category_id FK "Relasi ke categories.id (ON DELETE CASCADE)"
        varchar name "Nama Menu / Produk"
        text description "Deskripsi Menu Produk"
        decimal price "Harga Jual (Rp)"
        int stock "Jumlah Stok Menu Tersedia"
        varchar image_url "Nama File Gambar Terupload"
        timestamp created_at "Waktu Dibuat"
        timestamp updated_at "Waktu Diperbarui"
    }

    categories ||--o{ products : "1-to-N (Satu kategori memiliki banyak produk)"
```

### Penjelasan Relasi:
1. **`categories` ke `products` (One-to-Many / 1 : N)**:
   - Satu kategori (contoh: *Makanan Utama*, *Minuman Segar*) dapat menaungi banyak produk menu.
   - Kolom `products.category_id` bertindak sebagai **Foreign Key** yang merujuk pada `categories.id` (**Primary Key**).
   - Diterapkan `ON DELETE CASCADE` dan `ON UPDATE CASCADE` agar integritas data tetap terjaga.
2. **`users`**:
   - Menyimpan kredensial autentikasi pengguna dengan enkripsi hash kata sandi (**bcrypt**) dan penandaan hak akses (`role: 'admin' | 'kasir'`).

---

## 🗄️ Struktur Database

Database: `ujilevel_umkm` (MySQL / MariaDB).

File SQL skema database dapat ditemukan di:
- [`schema.sql`](file:///c:/Users/ASUS/OneDrive/Dokumen/ujilevel-umkm/schema.sql)
- [`backend/schema.sql`](file:///c:/Users/ASUS/OneDrive/Dokumen/ujilevel-umkm/backend/schema.sql)

### 1. Tabel `users`
| Kolom | Tipe Data | Keterangan |
| :--- | :--- | :--- |
| `id` | `INT AUTO_INCREMENT` | **Primary Key** |
| `name` | `VARCHAR(100)` | Nama lengkap pegawai / pengelola |
| `email` | `VARCHAR(100)` | Email unik untuk login (**Unique**) |
| `password` | `VARCHAR(255)` | Kata sandi tersimpan dalam format hash bcrypt |
| `role` | `ENUM('admin', 'kasir')` | Role hak akses (Default: `kasir`) |
| `created_at` | `TIMESTAMP` | Waktu dibuat |
| `updated_at` | `TIMESTAMP` | Waktu diperbarui |

### 2. Tabel `categories` (Data Utama 1)
| Kolom | Tipe Data | Keterangan |
| :--- | :--- | :--- |
| `id` | `INT AUTO_INCREMENT` | **Primary Key** |
| `name` | `VARCHAR(100)` | Nama kategori menu |
| `description` | `TEXT` | Keterangan atau catatan kategori |
| `created_at` | `TIMESTAMP` | Waktu dibuat |
| `updated_at` | `TIMESTAMP` | Waktu diperbarui |

### 3. Tabel `products` (Data Utama 2)
| Kolom | Tipe Data | Keterangan |
| :--- | :--- | :--- |
| `id` | `INT AUTO_INCREMENT` | **Primary Key** |
| `category_id` | `INT` | **Foreign Key** mereferensikan `categories(id)` |
| `name` | `VARCHAR(150)` | Nama menu / makanan / minuman |
| `description` | `TEXT` | Deskripsi rincian menu |
| `price` | `DECIMAL(12, 2)` | Harga satuan produk |
| `stock` | `INT` | Jumlah ketersediaan stok produk |
| `image_url` | `VARCHAR(255)` | Nama file gambar yang tersimpan di server |
| `created_at` | `TIMESTAMP` | Waktu dibuat |
| `updated_at` | `TIMESTAMP` | Waktu diperbarui |

---

## 🛡️ Matriks Otorisasi Berdasarkan Role

Sistem menerapkan **Role-Based Access Control (RBAC)** ketat baik pada sisi backend (middleware) maupun mobile interface:

| Fitur / Aksi | Role: `admin` | Role: `kasir` | Catatan Keamanan |
| :--- | :---: | :---: | :--- |
| **Registrasi Pengguna** | ✅ | ✅ | Publik |
| **Login Pengguna** | ✅ | ✅ | Menghasilkan JWT token |
| **Lihat Profil Sendiri** | ✅ | ✅ | Dilindungi token JWT |
| **Lihat Daftar & Detail Kategori** | ✅ | ✅ | Read-only untuk kasir |
| **Tambah Kategori Baru** | ✅ | ❌ | Diblokir Middleware Role (HTTP 403) |
| **Edit / Update Kategori** | ✅ | ❌ | Diblokir Middleware Role (HTTP 403) |
| **Hapus Kategori** | ✅ | ❌ | Diblokir Middleware Role (HTTP 403) |
| **Lihat Daftar & Detail Menu** | ✅ | ✅ | Kasir dapat mengecek stok ketersediaan |
| **Cari & Filter Menu** | ✅ | ✅ | Mendukung search keyword & filter kategori |
| **Tambah Produk & Upload Foto** | ✅ | ❌ | Form upload foto dibatasi hanya untuk Admin |
| **Edit Produk & Ganti Foto** | ✅ | ❌ | Khusus Admin |
| **Hapus Produk & File Foto** | ✅ | ❌ | Admin dengan dialog konfirmasi |

---

## 📡 Dokumentasi REST API

Format response JSON konsisten:
```json
{
  "success": true,
  "message": "Pesan deskriptif keberhasilan atau kegagalan",
  "data": { ... }
}
```

### 1. Autentikasi (`/api/auth`)
- **`POST /api/auth/register`** (Publik)
  - Status Code: `201 Created`
  - Body (JSON):
    ```json
    {
      "name": "Budi Santoso",
      "email": "budi@dapoerberkah.com",
      "password": "password123",
      "role": "kasir"
    }
    ```
- **`POST /api/auth/login`** (Publik)
  - Status Code: `200 OK` (atau `401 Unauthorized` jika salah)
  - Body (JSON):
    ```json
    {
      "email": "admin@dapoerberkah.com",
      "password": "admin123"
    }
    ```
  - Response Data: `{ "token": "JWT_TOKEN", "user": { "id": 1, "name": "...", "email": "...", "role": "admin" } }`
- **`GET /api/auth/profile`** (Privat - Bearer Token)
  - Status Code: `200 OK`

### 2. Kategori Menu (`/api/categories`)
- **`GET /api/categories`**
  - Mengambil daftar semua kategori beserta jumlah produk terkait.
  - Query opsional: `?search=makanan`
  - Status Code: `200 OK`
- **`GET /api/categories/:id`**
  - Mengambil detail satu kategori.
  - Status Code: `200 OK` (atau `404 Not Found`)
- **`POST /api/categories`** (Privat - Role: Admin)
  - Body: `{ "name": "Paket Sarapan", "description": "Menu sarapan hemat" }`
  - Status Code: `201 Created`
- **`PUT /api/categories/:id`** (Privat - Role: Admin)
  - Body: `{ "name": "Paket Sarapan Pagi", "description": "Update deskripsi" }`
  - Status Code: `200 OK`
- **`DELETE /api/categories/:id`** (Privat - Role: Admin)
  - Status Code: `200 OK`

### 3. Produk Menu & Upload Foto (`/api/products`)
- **`GET /api/products`**
  - Query opsional: `?category_id=1&search=nasi`
  - Response mencakup `image_full_url` yang siap ditampilkan client.
  - Status Code: `200 OK`
- **`GET /api/products/:id`**
  - Detail lengkap produk.
  - Status Code: `200 OK`
- **`POST /api/products`** (Privat - Role: Admin)
  - Header: `Content-Type: multipart/form-data`
  - Form Fields:
    - `category_id`: `1`
    - `name`: `Nasi Goreng Berkah`
    - `description`: `Nasi goreng rempah lengkap`
    - `price`: `22000`
    - `stock`: `30`
    - `image`: File gambar (`.jpg`, `.jpeg`, `.png`, `.webp`, Max 5MB)
  - Status Code: `201 Created`
- **`PUT /api/products/:id`** (Privat - Role: Admin)
  - Mendukung update data dan pergantian foto (foto lama dihapus otomatis dari server).
  - Status Code: `200 OK`
- **`DELETE /api/products/:id`** (Privat - Role: Admin)
  - Menghapus record produk di database dan file gambar dari disk server.
  - Status Code: `200 OK`

---

## 📁 Struktur Direktori

```
ujilevel-umkm/
├── schema.sql                      # File skema database SQL utama
├── README.md                       # Dokumentasi lengkap proyek
├── backend/                        # Backend REST API (Node.js & Express)
│   ├── .env                        # Konfigurasi variabel lingkungan
│   ├── .env.example
│   ├── package.json
│   ├── schema.sql                  # Salinan skema SQL untuk backend
│   ├── postman_collection.json     # Koleksi Postman siap import untuk pengujian API
│   ├── uploads/                    # Folder penyimpanan file gambar terupload
│   ├── scripts/
│   │   └── initDb.js               # Script otomatis migrasi dan seeding database
│   └── src/
│       ├── app.js                  # Entry point aplikasi Express
│       ├── config/
│       │   └── database.js         # Koneksi MySQL pool
│       ├── controllers/
│       │   ├── authController.js
│       │   ├── categoryController.js
│       │   └── productController.js
│       ├── middlewares/
│       │   ├── authMiddleware.js   # Verifikasi token JWT
│       │   ├── roleMiddleware.js   # Pemeriksaan izin role (RBAC)
│       │   └── uploadMiddleware.js # Validasi tipe & ukuran upload file (Multer)
│       ├── routes/
│       │   ├── authRoutes.js
│       │   ├── categoryRoutes.js
│       │   └── productRoutes.js
│       └── utils/
│           └── response.js         # Standarisasi format response JSON
│
└── mobile/                         # Aplikasi Mobile Client (Flutter)
    ├── pubspec.yaml                # Konfigurasi dependensi Flutter
    ├── android/
    │   └── app/src/main/AndroidManifest.xml # Izin Internet, Kamera, & Galeri
    └── lib/
        ├── main.dart               # Entry point Flutter & MultiProvider setup
        ├── config/
        │   ├── api_config.dart     # Konfigurasi Base URL & endpoint API
        │   └── theme.dart          # Tema visual & warna UMKM Dapoer Berkah
        ├── models/
        │   ├── user_model.dart     # Model Pengguna & Role
        │   ├── category_model.dart # Model Kategori
        │   └── product_model.dart  # Model Produk Menu & Format Rupiah
        ├── services/
        │   └── api_service.dart    # Komunikasi HTTP & multipart upload
        ├── providers/
        │   ├── auth_provider.dart
        │   ├── category_provider.dart
        │   └── product_provider.dart
        └── screens/
            ├── splash_screen.dart  # Splash screen & auto-login check
            ├── auth/
            │   ├── login_screen.dart    # Login dengan tombol Demo Cepat
            │   └── register_screen.dart # Pendaftaran akun dengan pilihan Role
            ├── home/
            │   └── home_screen.dart     # Dashboard statistik & navigasi operasional
            ├── category/
            │   ├── category_list_screen.dart # CRUD Kategori
            │   └── category_form_screen.dart
            └── product/
                ├── product_list_screen.dart   # Katalog menu, filter & search
                ├── product_detail_screen.dart # Detail menu & foto dari server
                └── product_form_screen.dart   # Form menu & upload foto kamera/galeri
```

---

## 🚀 Panduan Instalasi & Menjalankan

### Langkah 1: Menjalankan Database MySQL (Lokal atau Aiven Cloud)
- **Opsi A (Lokal via XAMPP / Laragon)**:
  1. Buka **XAMPP Control Panel** dan klik **Start** pada modul **MySQL**.
  2. Buka terminal di folder `backend/` dan jalankan script inisialisasi:
     ```bash
     cd backend
     npm run db:init
     ```
- **Opsi B (Cloud via Aiven MySQL)**:
  1. Buat service MySQL di [Aiven Console](https://console.aiven.io/).
  2. Salin **Service URI** dan atur di file `backend/.env` sebagai `DATABASE_URL`.
  3. Jalankan `npm run db:init` untuk membuat skema dan seeding otomatis di cloud Aiven.

### Langkah 2: Menjalankan Backend REST API
1. Buka terminal pada folder proyek:
   ```bash
   cd backend
   ```
2. Jalankan server backend:
   ```bash
   npm run dev
   # atau
   npm start
   ```
3. Server REST API akan berjalan pada `http://localhost:5000`. Anda dapat mengakses URL tersebut di browser untuk melihat ringkasan status endpoint.

### Langkah 3: Menjalankan Mobile App Flutter
1. Buka terminal baru dan masuk ke folder `mobile`:
   ```bash
   cd mobile
   ```
2. Ambil paket dependensi Flutter:
   ```bash
   flutter pub get
   ```
3. Sesuaikan konfigurasi IP di [`mobile/lib/config/api_config.dart`](file:///c:/Users/ASUS/OneDrive/Dokumen/ujilevel-umkm/mobile/lib/config/api_config.dart):
   - Jika menjalankan di **Chrome / Browser Web**: Otomatis menggunakan `http://localhost:5000` (atau URL Vercel).
   - Jika menggunakan **Android Emulator**: Menggunakan `http://10.0.2.2:5000`.
   - Jika menggunakan **Perangkat Fisik (HP)**: Gunakan IP Wi-Fi lokal laptop Anda (contoh: `http://192.168.1.15:5000`) atau arahkan langsung ke domain Vercel API Anda.
4. Jalankan aplikasi:
   ```bash
   flutter run
   # atau langsung di browser Chrome:
   flutter run -d chrome
   ```

---

## ☁️ Panduan Deployment Cloud (Vercel & Aiven)

### 1. Deploy Database ke Aiven Cloud
1. Daftar dan login di [Aiven Console](https://console.aiven.io/).
2. Buat layanan baru: **Create Service** -> **MySQL** -> Region Singapore.
3. Salin **Service URI** di bagian Connection Information:
   `mysql://avnadmin:PASSWORD@HOST:PORT/defaultdb?ssl-mode=REQUIRED`
4. Jalankan migrasi tabel dan data awal dari terminal lokal:
   ```powershell
   $env:DATABASE_URL="mysql://avnadmin:PASSWORD@HOST:PORT/defaultdb?ssl-mode=REQUIRED"
   cd backend
   node scripts/initDb.js
   ```

### 2. Deploy REST API ke Vercel
1. Pastikan seluruh file sudah di-push ke GitHub:
   ```bash
   git add .
   git commit -m "feat: ready for cloud deployment"
   git push origin master
   ```
2. Buka dashboard [Vercel](https://vercel.com/dashboard) -> Klik **Add New** -> **Project**.
3. Hubungkan repositori GitHub `ujilevel-umkm`.
4. Pada bagian **Root Directory**, pilih folder `backend`.
5. Masukkan **Environment Variables**:
   - `DATABASE_URL`: Masukkan Service URI Aiven Cloud
   - `JWT_SECRET`: `rahasia_super_aman_kunci_jwt_ujilevel_umkm_2026`
   - `JWT_EXPIRES_IN`: `7d`
   - `NODE_ENV`: `production`
6. Klik **Deploy**. URL REST API langsung aktif (misal: `https://ujilevel-umkm.vercel.app`).

---

## 🧪 Hasil Pengujian (Blackbox Testing)

Hasil pengujian fungsionalitas sistem secara menyeluruh:

| No | Modul / Skenario Pengujian | Masukan (Input) | Ekspektasi | Hasil Pengujian | Status |
|:--:|:--------------------------|:----------------|:-----------|:----------------|:------:|
| 1  | Registrasi pengguna baru | Form data lengkap & valid | Akun tersimpan, HTTP 201 | Sesuai ekspektasi | **PASSED** |
| 2  | Validasi email duplikat | Email yang sudah terdaftar | HTTP 400 Bad Request | Sesuai ekspektasi | **PASSED** |
| 3  | Login akun terdaftar | Email & password benar | Token JWT & profil, HTTP 200 | Sesuai ekspektasi | **PASSED** |
| 4  | Login password salah | Email benar, password keliru | HTTP 401 Unauthorized | Sesuai ekspektasi | **PASSED** |
| 5  | Akses privat tanpa token | Request tanpa header Bearer | HTTP 401 Unauthorized | Sesuai ekspektasi | **PASSED** |
| 6  | Restriksi role Kasir (POST) | Kasir tambah kategori/menu | HTTP 403 Forbidden | Sesuai ekspektasi | **PASSED** |
| 7  | Admin tambah kategori | Nama kategori & deskripsi | Kategori baru tersimpan | Sesuai ekspektasi | **PASSED** |
| 8  | Admin edit kategori | Update nama kategori | Data terupdate, HTTP 200 | Sesuai ekspektasi | **PASSED** |
| 9  | Admin hapus kategori | Konfirmasi hapus kategori | Kategori & relasi terhapus | Sesuai ekspektasi | **PASSED** |
| 10 | Filter produk by kategori | Parameter `?category_id=1` | Hanya menu kategori terkait | Sesuai ekspektasi | **PASSED** |
| 11 | Pencarian menu (search) | Query kata kunci `?search=...`| Menampilkan menu yang cocok | Sesuai ekspektasi | **PASSED** |
| 12 | Admin tambah menu + upload foto| Form menu + file JPG/PNG <= 5MB | Foto tersimpan, HTTP 201 | Sesuai ekspektasi | **PASSED** |
| 13 | Validasi file upload > 5MB | File foto berukuran 7.8 MB | Ditolak, HTTP 400 Bad Request| Sesuai ekspektasi | **PASSED** |
| 14 | Admin hapus menu & foto | Konfirmasi hapus menu | Record DB & file foto terhapus| Sesuai ekspektasi | **PASSED** |
| 15 | Proteksi UI role Kasir | Login sebagai kasir | Tombol tambah/edit/hapus hidden| Sesuai ekspektasi | **PASSED** |
| 16 | Logout akun | Klik logout di AppBar | Token terhapus, redirect login | Sesuai ekspektasi | **PASSED** |

---

## 🔑 Akun Uji Coba Default

Untuk mempermudah pengujian saat demonstrasi atau penilaian uji level, telah disediakan dua akun default dengan role berbeda yang juga dapat diisi secara instan pada tombol **⚡ Akun Uji Coba Cepat** di halaman Login:

| Role Pengguna | Alamat Email | Password | Hak Akses |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@dapoerberkah.com` | `admin123` | **Penuh**: CRUD Kategori & Menu Produk, Upload & Hapus Foto Menu |
| **Kasir** | `kasir@dapoerberkah.com` | `kasir123` | **Terbatas**: Melihat katalog menu, cek ketersediaan stok produk, pencarian menu |

