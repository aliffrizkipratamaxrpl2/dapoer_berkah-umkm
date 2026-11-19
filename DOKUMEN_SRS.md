# DOKUMEN SPESIFIKASI KEBUTUHAN PERANGKAT LUNAK (SOFTWARE REQUIREMENTS SPECIFICATION - SRS)

## SISTEM OPERASIONAL DAN PELAYANAN UMKM KULINER "DAPOER BERKAH"
**Mata Pelajaran: Konsentrasi Keahlian Rekayasa Perangkat Lunak (KOKE)**  
**Platform: Backend REST API (Node.js & Express.js) + Database Cloud (Aiven MySQL) + Mobile Client (Flutter)**

---

## DAFTAR ISI
- [BAB I PENDAHULUAN](#bab-i-pendahuluan)
  - [1.1 Latar Belakang](#11-latar-belakang)
  - [1.2 Rumusan Masalah](#12-rumusan-masalah)
  - [1.3 Tujuan Penulisan Dokumen](#13-tujuan-penulisan-dokumen)
- [BAB II METODE PENGEMBANGAN](#bab-ii-metode-pengembangan)
  - [2.1 Metode Pengembangan](#21-metode-pengembangan)
  - [2.2 Jadwal Pengembangan Sistem](#22-jadwal-pengembangan-sistem)
- [BAB III ANALISIS KEBUTUHAN SISTEM](#bab-iii-analisis-kebutuhan-sistem)
  - [3.1 Nama Sistem](#31-nama-sistem)
  - [3.2 Ruang Lingkup](#32-ruang-lingkup)
  - [3.3 Kebutuhan Fungsional](#33-kebutuhan-fungsional)
  - [3.4 Kebutuhan Non-Fungsional](#34-kebutuhan-non-fungsional)
  - [3.5 Batasan Sistem](#35-batasan-sistem)
- [BAB IV DEVELOPMENT](#bab-iv-development)
  - [4.1 Desain System](#41-desain-system)
    - [4.1.1 Interaksi Aktor dengan Sistem](#411-interaksi-aktor-dengan-sistem)
    - [4.1.2 Use Case Diagram](#412-use-case-diagram)
    - [4.1.3 Activity Diagram](#413-activity-diagram)
    - [4.1.4 Class Diagram](#414-class-diagram)
  - [4.2 Perancangan Database](#42-perancangan-database)
    - [4.2.1 Entity Relationship Diagram (ERD)](#421-entity-relationship-diagram-erd)
    - [4.2.2 Skema Tabel Database (Table Schema)](#422-skema-tabel-database-table-schema)
  - [4.3 Struktur Project](#43-struktur-project)
  - [4.4 Quality Assurance (Blackbox Testing)](#44-quality-assurance-blackbox-testing)
  - [4.5 Deployment](#45-deployment)
    - [4.5.1 Deployment Database ke Aiven Cloud](#451-deployment-database-ke-aiven-cloud)
    - [4.5.2 Deployment REST API ke Vercel](#452-deployment-rest-api-ke-vercel)
- [BAB V PENUTUP](#bab-v-penutup)
  - [5.1 Kesimpulan](#51-kesimpulan)
  - [5.2 Lampiran](#52-lampiran)

---

# BAB I PENDAHULUAN

### 1.1 Latar Belakang
Sektor Usaha Mikro, Kecil, dan Menengah (UMKM) memegang peranan krusial dalam pertumbuhan ekonomi nasional. Salah satu subsektor yang bertumbuh paling pesat adalah UMKM bidang kuliner. "Dapoer Berkah" merupakan salah satu representasi UMKM kuliner yang menyajikan aneka hidangan khas nusantara, minuman segar, dan camilan tradisional.

Dalam aktivitas harian, operasional "Dapoer Berkah" masih menghadapi kendala klasik pengelolaan secara manual atau semi-digital yang terpisah:
1. Pencatatan stok menu makanan dan bahan siap saji sering kali tidak sinkron antara pengelola (Admin/Pemilik) dan pelayan kasir di lapangan.
2. Informasi ketersediaan menu yang habis tidak terbarui secara realtime, memicu kekecewaan pelanggan saat memesan.
3. Katalog visual menu makanan belum terintegrasi dengan sistem digital, sehingga mempersulit staf kasir dalam mempromosikan atau mengecek rincian harga dan varian menu.

Seiring kemajuan teknologi informasi, adopsi arsitektur *Client-Server* berbasis RESTful API dan aplikasi mobile multiplatform menjadi solusi strategis. Dengan memisahkan penyedia data (**Backend REST API berbasis Node.js Express**) dan antarmuka pengguna (**Frontend Mobile berbasis Flutter**) serta database yang andal (**MySQL di Aiven Cloud**), seluruh data operasional, hak akses berjenjang (*Role-Based Access Control*), dan katalog menu terpusat secara aman, efisien, dan dapat diakses dari mana saja.

### 1.2 Rumusan Masalah
Berdasarkan latar belakang tersebut, dirumuskan masalah-masalah utama sebagai berikut:
1. Bagaimana merancang dan membangun arsitektur REST API menggunakan Node.js dan Express.js yang menyediakan layanan CRUD data relasional, autentikasi terenkripsi, serta otorisasi berbasis role?
2. Bagaimana merancang database relasional terstandarisasi (MySQL) yang mendukung integritas data referensial (*Primary Key & Foreign Key*) dan menyimpannya di platform cloud Aiven?
3. Bagaimana membangun aplikasi mobile client menggunakan Flutter yang intuitif, mendukung pengelolaan menu, pengunggahan gambar melalui kamera/galeri, serta pembatasan hak akses tampilan antara Admin dan Kasir?
4. Bagaimana melakukan pengujian fungsionalitas sistem secara menyeluruh menggunakan metode *Blackbox Testing* serta mendokumentasikan proses *deployment* ke Vercel dan Aiven?

### 1.3 Tujuan Penulisan Dokumen
Dokumen Spesifikasi Kebutuhan Perangkat Lunak (*Software Requirements Specification* - SRS) ini disusun dengan tujuan:
1. Menjadi acuan formal teknis bagi pengembang, penguji (*tester*), dan asesor/penguji uji level kompetensi mengenai spesifikasi fitur, batasan, serta arsitektur sistem.
2. Menjabarkan rincian kebutuhan fungsional dan non-fungsional secara terukur, konsisten, dan terstruktur.
3. Mendokumentasikan desain sistem (*Use Case*, *Activity*, *Class*, dan *ERD*), skema database, skenario pengujian *blackbox*, hingga langkah deployment cloud pada Vercel dan Aiven.

---

# BAB II METODE PENGEMBANGAN

### 2.1 Metode Pengembangan
Metode rekayasa perangkat lunak yang diimplementasikan dalam pengembangan proyek ini adalah **Model SDLC Waterfall (Linear Sequential Model)** yang dimodifikasi dengan pendekatan iteratif terarah.

```mermaid
flowchart TD
    A["1. Analisis Kebutuhan (Requirement Analysis)"] --> B["2. Perancangan Sistem & Database (System & DB Design)"]
    B --> C["3. Implementasi Kode Backend & Mobile (Implementation)"]
    C --> D["4. Pengujian Sistem (Blackbox Testing)"]
    D --> E["5. Deployment Cloud (Vercel & Aiven)"]
    E --> F["6. Dokumentasi & Pemeliharaan (Maintenance)"]
```

#### Alasan Pemilihan Metode Waterfall:
1. **Spesifikasi Kebutuhan yang Jelas dan Terdefinisi**: Seluruh kriteria fungsional uji level (CRUD dua entitas relasional, JWT Auth, Role Admin/Kasir, Upload File, Mobile Flutter) telah ditetapkan secara terperinci sejak awal.
2. **Keteraturan dan Kemudahan Pelacakan Kualitas**: Setiap fase (perancangan database, pembuatan API, pembuatan mobile UI, pengujian) memiliki *deliverable* yang konkret sebelum melangkah ke tahap selanjutnya.
3. **Dokumentasi yang Ketat dan Komprehensif**: Sangat selaras dengan tuntutan penilaian uji kompetensi kejuruan di mana dokumentasi SRS, ERD, dan bukti pengujian wajib terstruktur rapi.

### 2.2 Jadwal Pengembangan Sistem
Rencana dan realisasi lini masa (*Timeline / Gantt Chart*) pengerjaan proyek sistem operasional UMKM Dapoer Berkah:

| No | Tahapan Aktivitas | Minggu 1 | Minggu 2 | Minggu 3 | Minggu 4 | Output / Deliverable |
|:--:|:------------------|:--------:|:--------:|:--------:|:--------:|:---------------------|
| 1  | **Analisis Kebutuhan** | ████████ |          |          |          | Dokumen SRS Bab I - III |
| 2  | **Perancangan Database & Arsitektur** |          | ████████ |          |          | ERD, Skema SQL, Diagram UML |
| 3  | **Implementasi Backend REST API** |          | ████████ | ████████ |          | Kode Express.js, JWT, Middleware |
| 4  | **Implementasi Frontend Mobile (Flutter)** |          |          | ████████ | ████████ | Kode Flutter, UI Screens, Provider |
| 5  | **Pengujian (Blackbox Testing)** |          |          |          | ████████ | Tabel Hasil QA Blackbox Testing |
| 6  | **Cloud Deployment & Integrasi** |          |          |          | ████████ | URL Vercel & Database Aiven Aktif |

---

# BAB III ANALISIS KEBUTUHAN SISTEM

### 3.1 Nama Sistem
Nama resmi perangkat lunak yang dibangun adalah:  
**"Sistem Operasional dan Pelayanan UMKM Kuliner Dapoer Berkah"**  
*(Dapoer Berkah Culinary Management & Service System)*

### 3.2 Ruang Lingkup
#### Deskripsi Sistem:
Sistem ini merupakan solusi piranti lunak terpadu yang memadukan layanan backend API modern dengan aplikasi mobile lintas platform. Sistem mengotomatisasi pendataan kategori menu, produk makanan/minuman, kontrol stok, pengunggahan foto menu, hingga pengamanan akses staf berdasarkan peran wewenangnya.

#### Manfaat Sistem:
1. **Bagi Pemilik / Manajer (Role Admin)**:
   - Kontrol terpusat terhadap penambahan, pengubahan, dan penghapusan menu kuliner.
   - Fleksibilitas memperbarui foto menu secara langsung dari kamera HP atau galeri.
   - Pemantauan stok produk yang menipis secara *real-time*.
2. **Bagi Kasir / Staf Pelayanan (Role Kasir)**:
   - Mempercepat pencarian menu saat melayani pembeli.
   - Pengecekan ketersediaan stok menu tanpa perlu bolak-balik ke area dapur.
   - Meminimalkan kesalahan informasi harga jual kepada pelanggan.
3. **Bagi Pelanggan UMKM**:
   - Pelayanan kasir menjadi lebih cepat, akurat, dan profesional.

---

### 3.3 Kebutuhan Fungsional

#### 1. Fitur Utama Sistem
- **Autentikasi & Akun**:
  - Registrasi pengguna baru dengan pemilihan peran (`admin` / `kasir`).
  - Login pengguna menggunakan email dan kata sandi dengan verifikasi enkripsi hash bcrypt.
  - Pengamanan sesi menggunakan JSON Web Token (JWT) yang disimpan di `SharedPreferences` perangkat mobile.
  - Logout akun dengan penghapusan token sesi lokal.
- **Manajemen Kategori Menu (Data Utama 1 - CRUD)**:
  - Melihat seluruh kategori menu beserta kalkulasi jumlah produk terkait (`GET`).
  - Menambah kategori menu baru khusus Admin (`POST`).
  - Mengubah nama dan deskripsi kategori khusus Admin (`PUT`).
  - Menghapus kategori menu dengan konfirmasi dialog khusus Admin (`DELETE`).
- **Manajemen Produk Kuliner (Data Utama 2 - CRUD & File Upload)**:
  - Melihat katalog produk dengan thumbnail gambar, harga Rupiah, dan status stok (`GET`).
  - Filter katalog berdasarkan kategori dan pencarian kata kunci menu (*search bar*).
  - Melihat detail informasi produk lengkap dengan foto menu dari server.
  - Menambahkan menu baru beserta pengunggahan gambar menu (JPG/PNG max 5MB) khusus Admin (`POST`).
  - Mengubah data menu dan memperbarui foto produk khusus Admin (`PUT`).
  - Menghapus produk menu beserta pembersihan file gambar fisik dari server khusus Admin (`DELETE`).
- **Otorisasi & Restriksi Hak Akses (RBAC)**:
  - Kasir memiliki hak akses *read-only* (melihat daftar, mencari menu, mengecek stok).
  - Tombol tambah, edit, dan hapus pada aplikasi otomatis disembunyikan atau dinonaktifkan untuk Kasir.
  - Endpoint privat backend dilindungi oleh `roleMiddleware` yang mengembalikan HTTP 403 Forbidden bila dilanggar.

#### 2. Karakteristik Pengguna
| Role Pengguna | Tanggung Jawab Operasional | Hak Akses Sistem |
| :--- | :--- | :--- |
| **Admin** (Pemilik / Manajer) | Bertanggung jawab atas pengelolaan data master menu, harga, persediaan, dan staf. | **Akses Penuh**: CRUD Kategori, CRUD Produk, Upload/Hapus Foto, Registrasi, Login, Dashboard Analytics. |
| **Kasir** (Staf Kasir / Pelayan) | Bertanggung jawab atas pelayanan pesanan di meja kasir dan pengecekan ketersediaan menu. | **Akses Terbatas**: Login, Register, View Kategori, View Produk, Search & Filter Menu, Cek Stok. |

#### 3. Kamus Data
- **`User`**:
  - `id`: Tipe integer, pengenal unik akun pengguna (Primary Key).
  - `name`: Tipe teks (100 kar), nama lengkap staf/pemilik.
  - `email`: Tipe teks (100 kar), alamat surel unik untuk autentikasi.
  - `password`: Tipe teks (255 kar), kata sandi terenkripsi algoritma hash bcrypt.
  - `role`: Tipe enumerasi (`admin`, `kasir`), menentukan izin otorisasi.
- **`Category`**:
  - `id`: Tipe integer, pengenal unik kategori (Primary Key).
  - `name`: Tipe teks (100 kar), label kategori (misal: "Makanan Utama", "Minuman").
  - `description`: Tipe teks panjang, keterangan isi kategori.
- **`Product`**:
  - `id`: Tipe integer, pengenal unik produk (Primary Key).
  - `category_id`: Tipe integer, kunci asing (Foreign Key) yang merujuk ke `Category.id`.
  - `name`: Tipe teks (150 kar), nama menu makanan/minuman.
  - `description`: Tipe teks panjang, penjelasan rasa, porsi, dan bahan menu.
  - `price`: Tipe decimal(12,2), harga satuan produk dalam mata uang Rupiah.
  - `stock`: Tipe integer, kuantitas stok produk yang tersedia di dapur/toko.
  - `image_url`: Tipe teks (255 kar), nama file foto menu yang tersimpan di media penyimpanan backend.

#### 4. Kebutuhan Antarmuka Pengguna (User Interface)
- **Splash Screen**: Logo UMKM Dapoer Berkah, animasi loading, auto-check sesi login.
- **Login Screen**: Input email, input password dengan toggle sembunyikan/tampilkan, tombol masuk, tautan registrasi, dan tombol demo akun cepat (*quick demo buttons*).
- **Register Screen**: Form pendaftaran nama, email, password, dropdown pilihan role pengguna.
- **Home Dashboard**: Kartu selamat datang dengan badge role aktif, ringkasan kartu statistik (total produk, kategori, stok menipis), menu navigasi cepat, dan daftar produk terbaru.
- **Category List & Form Screen**: Daftar kategori dengan jumlah produk, FAB tambah kategori (Admin), dialog form tambah/edit, serta dialog konfirmasi hapus.
- **Product List Screen**: Search bar, horizontal scrollable filter chip kategori, kartu katalog produk (gambar, nama, badge kategori, harga Rupiah, indikator stok).
- **Product Detail Screen**: Foto menu ukuran penuh, harga tebal, label status stok aman/menipis, deskripsi makanan, serta aksi Edit dan Hapus (Admin).
- **Product Form Screen**: Komponen *image picker* (kamera/galeri) dengan pratinjau gambar, dropdown pemilihan kategori, input nama, input harga, input stok, textarea deskripsi, dan tombol simpan dengan spinner.

#### 5. Interaksi Antar Modul & Aliran Bisnis
```mermaid
sequenceDiagram
    autonumber
    actor A as Pengguna (Admin/Kasir)
    participant M as Aplikasi Mobile (Flutter)
    participant B as Backend API (Express.js)
    participant D as Database (Aiven MySQL)
    participant S as Penyimpanan File (Server Storage)

    Note over A,M: 1. Proses Login
    A->>M: Input email & password
    M->>B: POST /api/auth/login {email, password}
    B->>D: SELECT * FROM users WHERE email=?
    D-->>B: Return user data & bcrypt hash
    B-->>M: HTTP 200 {success: true, token: JWT, user: {...}}
    M->>M: Simpan JWT ke SharedPreferences

    Note over A,M: 2. Tambah Menu Baru (Khusus Admin)
    A->>M: Pilih foto kamera & isi form produk
    M->>B: POST /api/products (Multipart Request + Bearer JWT)
    B->>B: authMiddleware & roleMiddleware ('admin')
    B->>S: Simpan file fisik foto ke /uploads/
    B->>D: INSERT INTO products (category_id, name, price, stock, image_url)
    D-->>B: Insert Success
    B-->>M: HTTP 201 Created {data: newProduct}
    M-->>A: Tampilkan notifikasi Snackback sukses & refresh katalog
```

---

### 3.4 Kebutuhan Non-Fungsional

1. **Kebutuhan Produk (Product Requirements)**:
   - **Keamanan (Security)**: Seluruh kata sandi pengguna wajib dienkripsi searah menggunakan algoritma **bcrypt** dengan salt round minimum 10. Komunikasi API privat wajib menyertakan token otentikasi JWT pada header `Authorization: Bearer <token>`.
   - **Integritas Data**: Menggunakan mekanisme *Foreign Key Constraint* dengan aturan *Cascade Delete/Update* untuk menjamin konsistensi hubungan antara kategori dan produk.
   - **Performa & Waktu Respon**: Response time backend REST API rata-rata di bawah 500 ms untuk kueri standar dan di bawah 1.5 detik untuk upload file multipart.
   - **Validasi File**: File gambar dibatasi maksimal berukuran **5 Megabytes (MB)** dengan filter tipe MIME yang ketat (`image/jpeg`, `image/png`, `image/webp`).
2. **Kebutuhan Organisasi (Organizational Requirements)**:
   - Menggunakan sistem pengontrol versi **Git & GitHub** dengan manajemen branch terisolasi (`master` dan `feature/...`).
   - Penamaan variabel, fungsi, dan endpoint API mengikuti kaidah *clean code* (camelCase untuk kode JS/Dart dan kebab-case / snake_case untuk rute RESTful API).
3. **Kebutuhan Eksternal (External Requirements)**:
   - Kompatibilitas multiplatform: Aplikasi client Flutter dapat berjalan responsif pada perangkat Android (smartphone/tablet), browser web (Chrome/Edge), serta Windows desktop.
   - Database cloud di-hosting pada layanan bereputasi tinggi (**Aiven Cloud**) dengan koneksi terenkripsi SSL/TLS.

---

### 3.5 Batasan Sistem
1. **Batasan Teknologi**:
   - Backend menggunakan runtime **Node.js (versi minimal v18/v22)** dengan framework **Express.js**.
   - Database menggunakan **MySQL versi 8.0** yang di-hosting pada **Aiven Cloud**.
   - Frontend mobile dibangun menggunakan framework **Flutter (versi 3.24 / 3.47+)** dengan bahasa pemrograman **Dart**.
2. **Batasan Platform**:
   - Backend di-deploy pada serverless platform **Vercel** dengan rewrite rute otomatis.
   - Aplikasi mobile memerlukan koneksi internet aktif untuk berkomunikasi dengan cloud API dan memuat foto produk dari server.
3. **Batasan Fungsionalitas**:
   - Sistem difokuskan pada manajemen operasional internal UMKM (katalog, stok, kategori, otorisasi staf); modul pembayaran *payment gateway* pihak ketiga (seperti Midtrans/Xendit) berada di luar ruang lingkup uji level ini.

---

# BAB IV DEVELOPMENT

### 4.1 Desain System

#### 4.1.1 Interaksi Aktor dengan Sistem
Sistem berinteraksi dengan dua aktor utama:
1. **Admin**: Memiliki wewenang absolut untuk mengatur akun, menambah/mengedit/menghapus kategori, menambah/mengedit/menghapus produk makanan beserta fotonya, dan melihat seluruh ringkasan stok.
2. **Kasir**: Memiliki wewenang operasional pelayanan meja depan untuk melihat daftar kategori, menelusuri menu, dan memverifikasi jumlah stok yang tersedia.

#### 4.1.2 Use Case Diagram
```mermaid
flowchart LR
    Admin["Aktor: ADMIN"]
    Kasir["Aktor: KASIR"]

    subgraph Sistem Operasional Dapoer Berkah
        UC1((Registrasi Akun))
        UC2((Login & Autentikasi JWT))
        UC3((Lihat Dashboard & Statistik))
        UC4((Lihat Katalog Menu & Stok))
        UC5((Cari & Filter Menu))
        UC6((Kelola Kategori CRUD))
        UC7((Kelola Produk CRUD))
        UC8((Upload Foto Menu))
        UC9((Hapus Menu & File Foto))
        UC10((Logout Akun))
    end

    Admin --> UC1
    Admin --> UC2
    Admin --> UC3
    Admin --> UC4
    Admin --> UC5
    Admin --> UC6
    Admin --> UC7
    Admin --> UC8
    Admin --> UC9
    Admin --> UC10

    Kasir --> UC1
    Kasir --> UC2
    Kasir --> UC3
    Kasir --> UC4
    Kasir --> UC5
    Kasir --> UC10
```

#### 4.1.3 Activity Diagram (Alur Tambah Produk Menu dengan Upload Foto)
```mermaid
stateDiagram-v2
    [*] --> FormTambahProduk: Admin Buka Menu Tambah Produk
    FormTambahProduk --> PilihFoto: Ketuk Kotak Unggah Foto
    PilihFoto --> AmbilGambar: Pilih Kamera / Galeri (image_picker)
    AmbilGambar --> FormTambahProduk: Foto Muncul di Pratinjau
    FormTambahProduk --> InputData: Masukkan Nama, Harga, Stok, Kategori, Deskripsi
    InputData --> ValidasiClient: Klik Simpan Menu Baru
    
    state ValidasiClient <<choice>>
    ValidasiClient --> FormTambahProduk: Data Tidak Lengkap / Error Form
    ValidasiClient --> KirimMultipart: Validasi Form Lolos
    
    KirimMultipart --> BackendAuth: Kirim Request Multipart + Token JWT
    
    state BackendAuth <<choice>>
    BackendAuth --> Respon401: Token Tidak Valid / Expired
    BackendAuth --> CekRole: Token Valid
    
    state CekRole <<choice>>
    CekRole --> Respon403: Role Pengguna = 'kasir'
    CekRole --> UploadFileMulter: Role Pengguna = 'admin'
    
    UploadFileMulter --> SimpanDatabase: Simpan File ke /uploads/ & Insert Database
    SimpanDatabase --> Respon201: Sukses Simpan ke MySQL
    Respon201 --> TampilSukses: Mobile Tampilkan SnackBar & Refresh List
    TampilSukses --> [*]
    
    Respon401 --> [*]
    Respon403 --> [*]
```

#### 4.1.4 Class Diagram
```mermaid
classDiagram
    class UserModel {
        +int id
        +String name
        +String email
        +String role
        +bool isAdmin
        +bool isKasir
        +fromJson(Map json)
        +toJson() Map
    }

    class CategoryModel {
        +int id
        +String name
        +String description
        +int totalProducts
        +fromJson(Map json)
        +toJson() Map
    }

    class ProductModel {
        +int id
        +int categoryId
        +String categoryName
        +String name
        +String description
        +double price
        +int stock
        +String imageUrl
        +String imageFullUrl
        +String formattedPrice
        +fromJson(Map json)
        +toJson() Map
    }

    class ApiService {
        +login(email, password) ApiResponse
        +register(name, email, password, role) ApiResponse
        +getCategories(search) ApiResponse
        +createCategory(name, desc) ApiResponse
        +updateCategory(id, name, desc) ApiResponse
        +deleteCategory(id) ApiResponse
        +getProducts(catId, search) ApiResponse
        +createProduct(data, XFile image) ApiResponse
        +updateProduct(id, data, XFile image) ApiResponse
        +deleteProduct(id) ApiResponse
    }

    CategoryModel "1" -- "0..*" ProductModel : menaungi
    ApiService ..> UserModel : mengelola
    ApiService ..> CategoryModel : memproses
    ApiService ..> ProductModel : memproses
```

---

### 4.2 Perancangan Database

#### 4.2.1 Entity Relationship Diagram (ERD)
```mermaid
erDiagram
    users {
        int id PK "AUTO_INCREMENT"
        varchar name "NOT NULL"
        varchar email UK "NOT NULL, UNIQUE"
        varchar password "NOT NULL (Bcrypt Hash)"
        enum role "NOT NULL, DEFAULT 'kasir'"
        timestamp created_at "DEFAULT CURRENT_TIMESTAMP"
        timestamp updated_at "ON UPDATE CURRENT_TIMESTAMP"
    }

    categories {
        int id PK "AUTO_INCREMENT"
        varchar name "NOT NULL"
        text description "NULL"
        timestamp created_at "DEFAULT CURRENT_TIMESTAMP"
        timestamp updated_at "ON UPDATE CURRENT_TIMESTAMP"
    }

    products {
        int id PK "AUTO_INCREMENT"
        int category_id FK "REFERENCES categories(id)"
        varchar name "NOT NULL"
        text description "NULL"
        decimal price "NOT NULL, DEFAULT 0.00"
        int stock "NOT NULL, DEFAULT 0"
        varchar image_url "NULL"
        timestamp created_at "DEFAULT CURRENT_TIMESTAMP"
        timestamp updated_at "ON UPDATE CURRENT_TIMESTAMP"
    }

    categories ||--o{ products : "has (1 to Many, ON DELETE CASCADE)"
```

#### 4.2.2 Skema Tabel Database (Table Schema)

##### 1. Tabel `users`
Tabel penyimpan data kredensial akun dan peranan otorisasi pengguna.
| Nama Field | Tipe Data | Nullable | Default | Keterangan |
| :--- | :--- | :---: | :--- | :--- |
| `id` | INT | NO | AUTO_INCREMENT | Primary Key |
| `name` | VARCHAR(100) | NO | - | Nama lengkap pegawai |
| `email` | VARCHAR(100) | NO | - | Email pengguna (Unique Key) |
| `password` | VARCHAR(255) | NO | - | Kata sandi hash bcrypt |
| `role` | ENUM('admin', 'kasir') | NO | 'kasir' | Hak akses pengguna |
| `created_at` | TIMESTAMP | NO | CURRENT_TIMESTAMP | Waktu pendaftaran |
| `updated_at` | TIMESTAMP | NO | CURRENT_TIMESTAMP | Waktu pembaruan akun |

##### 2. Tabel `categories`
Tabel data master untuk pengelompokan jenis hidangan kuliner (Data Utama 1).
| Nama Field | Tipe Data | Nullable | Default | Keterangan |
| :--- | :--- | :---: | :--- | :--- |
| `id` | INT | NO | AUTO_INCREMENT | Primary Key |
| `name` | VARCHAR(100) | NO | - | Nama kategori menu |
| `description` | TEXT | YES | NULL | Catatan deskripsi kategori |
| `created_at` | TIMESTAMP | NO | CURRENT_TIMESTAMP | Waktu pembuatan |
| `updated_at` | TIMESTAMP | NO | CURRENT_TIMESTAMP | Waktu pembaruan |

##### 3. Tabel `products`
Tabel produk kuliner yang berelasi dengan tabel `categories` (Data Utama 2).
| Nama Field | Tipe Data | Nullable | Default | Keterangan |
| :--- | :--- | :---: | :--- | :--- |
| `id` | INT | NO | AUTO_INCREMENT | Primary Key |
| `category_id` | INT | NO | - | Foreign Key ke `categories(id)` |
| `name` | VARCHAR(150) | NO | - | Nama menu masakan/minuman |
| `description` | TEXT | YES | NULL | Deskripsi rasa dan bahan |
| `price` | DECIMAL(12, 2) | NO | 0.00 | Harga satuan menu (Rp) |
| `stock` | INT | NO | 0 | Jumlah stok siap saji |
| `image_url` | VARCHAR(255) | YES | NULL | Nama file gambar terupload |
| `created_at` | TIMESTAMP | NO | CURRENT_TIMESTAMP | Waktu pembuatan |
| `updated_at` | TIMESTAMP | NO | CURRENT_TIMESTAMP | Waktu pembaruan |

---

### 4.3 Struktur Project

```
ujilevel-umkm/
├── schema.sql                      # DDL Skema database utama
├── DOKUMEN_SRS.md                  # Dokumen formal spesifikasi SRS
├── README.md                       # Dokumentasi instalasi & panduan ringkas
├── vercel.json                     # Konfigurasi root Vercel Deployment
│
├── backend/                        # BACKEND REST API (Express.js)
│   ├── .env                        # Variabel environment lokal
│   ├── .env.example                # Panduan konfigurasi env lokal & Aiven
│   ├── package.json                # Dependensi modul Node.js
│   ├── vercel.json                 # Konfigurasi serverless rewrite Vercel
│   ├── postman_collection.json     # Koleksi Postman lengkap seluruh endpoint
│   ├── schema.sql                  # Salinan skema SQL untuk backend
│   ├── api/
│   │   └── index.js                # Serverless entrypoint untuk Vercel
│   ├── uploads/                    # Folder fisik gambar produk (.gitkeep)
│   ├── scripts/
│   │   └── initDb.js               # Script otomatis DDL & Seeder database
│   └── src/
│       ├── app.js                  # Setup Express, CORS, static uploads
│       ├── config/
│       │   └── database.js         # Pool MySQL (Local / Aiven SSL Cloud)
│       ├── controllers/
│       │   ├── authController.js   # Handler register, login, profile
│       │   ├── categoryController.js # Handler CRUD kategori
│       │   └── productController.js  # Handler CRUD produk & upload foto
│       ├── middlewares/
│       │   ├── authMiddleware.js   # Verifikasi Bearer Token JWT
│       │   ├── roleMiddleware.js   # RBAC Middleware ('admin', 'kasir')
│       │   └── uploadMiddleware.js # Multer filter gambar & limit 5MB
│       ├── routes/
│       │   ├── authRoutes.js       # Rute endpoint /api/auth
│       │   ├── categoryRoutes.js   # Rute endpoint /api/categories
│       │   └── productRoutes.js    # Rute endpoint /api/products
│       └── utils/
│           └── response.js         # Standard JSON Response Formatter
│
└── mobile/                         # FRONTEND MOBILE CLIENT (Flutter)
    ├── pubspec.yaml                # Dependensi Flutter (provider, http, image_picker)
    ├── android/app/src/main/
    │   └── AndroidManifest.xml     # Izin Internet, Kamera, & Storage
    └── lib/
        ├── main.dart               # MultiProvider & inisialisasi MaterialApp
        ├── config/
        │   ├── api_config.dart     # Dynamic Base URL (Web, Android, Desktop)
        │   └── theme.dart          # Palet warna oranye kuliner & Material 3
        ├── models/
        │   ├── user_model.dart     # Model User & role getter
        │   ├── category_model.dart # Model Kategori menu
        │   └── product_model.dart  # Model Produk & formattedPrice (Rp)
        ├── services/
        │   └── api_service.dart    # HTTP service & multipart file upload
        ├── providers/
        │   ├── auth_provider.dart  # State manajemen autentikasi & sesi
        │   ├── category_provider.dart # State manajemen kategori
        │   └── product_provider.dart  # State manajemen produk, search, filter
        └── screens/
            ├── splash_screen.dart  # Splash screen & pengecekan sesi login
            ├── auth/
            │   ├── login_screen.dart    # Login form + tombol demo cepat
            │   └── register_screen.dart # Registrasi akun + pemilihan role
            ├── home/
            │   └── home_screen.dart     # Dashboard statistik & navigasi cepat
            ├── category/
            │   ├── category_list_screen.dart # Daftar kategori & konfirmasi hapus
            │   └── category_form_screen.dart # Form input/edit kategori
            └── product/
                ├── product_list_screen.dart   # Katalog menu & filter chip
                ├── product_detail_screen.dart # Detail menu & foto dari cloud
                └── product_form_screen.dart   # Form menu + upload kamera/galeri
```

---

### 4.4 Quality Assurance (Blackbox Testing)

Pengujian perangkat lunak dilakukan dengan metode **Blackbox Testing** untuk memvalidasi kesesuaian masukan (*input*) terhadap keluaran (*output*) tanpa memeriksa struktur logika internal program.

| ID Kasus Uji | Skenario Pengujian | Langkah Pengujian | Data Masukan (Test Data) | Hasil yang Diharapkan | Hasil Aktual | Status |
| :---: | :--- | :--- | :--- | :--- | :--- | :---: |
| **TC-01** | Registrasi akun baru berhasil | Mengisi nama, email baru, password >= 6 kar, memilih role | `name: "Staf Baru", email: "staf@dapoer.com", pass: "123456", role: "kasir"` | HTTP 201 Created, pesan sukses, token JWT terbit, user tersimpan di DB | Sesuai ekspektasi (HTTP 201) | **PASSED** |
| **TC-02** | Registrasi email duplikat | Mengisi form dengan email yang sudah ada | `email: "admin@dapoerberkah.com"` | HTTP 400 Bad Request, pesan "Email sudah terdaftar" | Sesuai ekspektasi (HTTP 400) | **PASSED** |
| **TC-03** | Registrasi validasi password lemah | Mengisi password kurang dari 6 karakter | `password: "123"` | HTTP 400 Bad Request, pesan "Password minimal harus 6 karakter" | Sesuai ekspektasi (HTTP 400) | **PASSED** |
| **TC-04** | Login akun terdaftar berhasil | Memasukkan email dan kata sandi yang valid | `email: "admin@dapoerberkah.com", pass: "admin123"` | HTTP 200 OK, token JWT dan data profil user diterima, redirect ke Dashboard | Sesuai ekspektasi (HTTP 200) | **PASSED** |
| **TC-05** | Login dengan password salah | Memasukkan email valid tetapi password keliru | `email: "admin@dapoerberkah.com", pass: "passSalah"` | HTTP 401 Unauthorized, pesan "Email atau password tidak valid" | Sesuai ekspektasi (HTTP 401) | **PASSED** |
| **TC-06** | Akses endpoint privat tanpa token | Mengirim request `GET /api/categories` tanpa header Authorization | Header `Authorization: None` | HTTP 401 Unauthorized, akses ditolak | Sesuai ekspektasi (HTTP 401) | **PASSED** |
| **TC-07** | Otorisasi role: Kasir menambah kategori | Kasir mengirim request `POST /api/categories` | Token milik Kasir, body: `{name: "Paket Baru"}` | HTTP 403 Forbidden, pesan "Role 'kasir' tidak memiliki izin... Diperlukan role: admin" | Sesuai ekspektasi (HTTP 403) | **PASSED** |
| **TC-08** | Admin menambah kategori baru | Admin mengirim request `POST /api/categories` | Token Admin, body: `{name: "Aneka Sambal", desc: "Varian pedas"}` | HTTP 201 Created, data kategori baru berhasil masuk ke database | Sesuai ekspektasi (HTTP 201) | **PASSED** |
| **TC-09** | Admin mengubah kategori | Admin mengirim request `PUT /api/categories/1` | Token Admin, body: `{name: "Makanan Nusantara"}` | HTTP 200 OK, data kategori terupdate | Sesuai ekspektasi (HTTP 200) | **PASSED** |
| **TC-10** | Admin menghapus kategori dengan konfirmasi | Memilih hapus pada kategori dan menekan tombol konfirmasi | Klik tombol "Hapus" pada Dialog Konfirmasi | HTTP 200 OK, kategori terhapus dari database beserta relasi produknya | Sesuai ekspektasi (HTTP 200) | **PASSED** |
| **TC-11** | Ambil daftar produk dengan filter kategori | Memilih filter chip "Makanan Utama" di antarmuka katalog | Parameter `?category_id=1` | Hanya produk dalam kategori 1 yang ditampilkan di katalog grid | Sesuai ekspektasi | **PASSED** |
| **TC-12** | Pencarian produk dengan search bar | Mengetik kata kunci "Goreng" di bilah pencarian | Query `?search=Goreng` | Daftar produk terfilter secara realtime menampilkan menu terkait | Sesuai ekspektasi | **PASSED** |
| **TC-13** | Admin menambah produk dengan upload foto | Mengisi form menu dan memilih file gambar dari kamera/galeri | File: `foto_soto.jpg` (1.2 MB), nama: "Soto Lamongan", harga: 20000, stok: 30 | HTTP 201 Created, file tersimpan di `/uploads/`, data produk tersimpan | Sesuai ekspektasi (HTTP 201) | **PASSED** |
| **TC-14** | Validasi ukuran file upload melebihi batas | Mengunggah gambar berukuran lebih dari 5 MB | File: `gambar_besar.png` (7.8 MB) | HTTP 400 Bad Request, pesan "Ukuran file terlalu besar! Maksimum ukuran file gambar adalah 5 MB" | Sesuai ekspektasi (HTTP 400) | **PASSED** |
| **TC-15** | Validasi format file non-gambar | Mengunggah file berformat dokumen PDF atau TXT | File: `menu.pdf` | HTTP 400 Bad Request, pesan "Format file tidak didukung! Hanya file gambar (JPG, JPEG, PNG, WEBP) yang diperbolehkan" | Sesuai ekspektasi (HTTP 400) | **PASSED** |
| **TC-16** | Admin menghapus produk dan file foto | Memilih opsi Hapus pada halaman detail produk | ID Produk: 2 | HTTP 200 OK, record produk di DB terhapus dan file gambar fisik di server ikut terhapus | Sesuai ekspektasi (HTTP 200) | **PASSED** |
| **TC-17** | Pembatasan tampilan role Kasir pada Mobile | Login menggunakan akun role `kasir` | Kredensial akun Kasir | Tombol tambah menu, tombol edit, dan tombol hapus tidak ditampilkan pada UI Kasir | Sesuai ekspektasi | **PASSED** |
| **TC-18** | Logout pengguna | Memilih ikon logout di AppBar dan menyetujui dialog konfirmasi | Klik "Keluar" | Token JWT terhapus dari local storage, pengguna dialihkan kembali ke Login Screen | Sesuai ekspektasi | **PASSED** |

---

### 4.5 Deployment

#### 4.5.1 Deployment Database ke Aiven Cloud
Aiven menyediakan layanan Managed Cloud Database MySQL yang andal, aman, dan siap produksi.

##### Langkah-Langkah Deployment Database di Aiven:
1. **Pendaftaran & Pembuatan Proyek**:
   - Kunjungi konsol Aiven: [https://console.aiven.io/](https://console.aiven.io/).
   - Masuk (*Sign in*) dan buat proyek baru bernama `ujilevel-umkm`.
2. **Membuat Layanan MySQL Service**:
   - Klik **Create service** -> Pilih **MySQL**.
   - Pilih Cloud Provider (misal: AWS / Google Cloud) dan Region terdekat (misal: *Singapore* / `ap-southeast-1`).
   - Pilih paket layanan (*Free Trial* atau paket standar) -> Beri nama service: `mysql-ujilevel-umkm` -> Klik **Create service**.
3. **Mendapatkan Kredensial & Service URI**:
   - Setelah status service menjadi **Running**, masuk ke tab **Overview**.
   - Di bagian **Connection information**, salin nilai:
     - **Host**: Contoh: `mysql-ujilevel-umkm-xxxx.aivencloud.com`
     - **Port**: Contoh: `12345`
     - **User**: `avnadmin`
     - **Password**: `AVNS_xxxxxxxxxxxxxx`
     - **Database name**: `defaultdb`
     - **Service URI**: `mysql://avnadmin:password@host:port/defaultdb?ssl-mode=REQUIRED`
4. **Migrasi Skema & Seeding Data Otomatis**:
   - Buka terminal pada komputer lokal di dalam folder `backend/`.
   - Jalankan perintah inisialisasi dengan mengarahkan `DATABASE_URL` ke Aiven:
     ```powershell
     $env:DATABASE_URL="mysql://avnadmin:password_aiven@host_aiven:port_aiven/defaultdb?ssl-mode=REQUIRED"
     node scripts/initDb.js
     ```
   - Script akan otomatis mengeksekusi DDL pembuatan tabel `users`, `categories`, dan `products` serta memasukkan akun default (*seeder*) ke dalam database Aiven Cloud.

---

#### 4.5.2 Deployment REST API ke Vercel
Vercel adalah platform cloud serverless terdepan untuk hosting aplikasi web dan REST API berbasis Node.js.

##### Konfigurasi Vercel yang Disediakan:
1. **`backend/vercel.json`** dan **`vercel.json`**:
   Mengonfigurasi pengalihan rute (*rewrite*) seluruh request HTTP `/(.*)` menuju ke serverless handler `backend/api/index.js`.
2. **`backend/api/index.js`**:
   Mengekspor instance Express application untuk dieksekusi dalam lingkungan Vercel Serverless Function.

##### Langkah-Langkah Deployment ke Vercel:
1. **Push Proyek ke Repositori GitHub**:
   - Pastikan seluruh kode terbaru sudah di-commit dan di-push ke GitHub:
     ```bash
     git add .
     git commit -m "feat: complete srs, aiven db integration, and vercel config"
     git push origin master
     ```
2. **Import Proyek di Vercel Dashboard**:
   - Buka [https://vercel.com/dashboard](https://vercel.com/dashboard) dan klik **Add New** -> **Project**.
   - Hubungkan dengan akun GitHub dan pilih repositori `ujilevel-umkm`.
   - Pada bagian **Root Directory**, pilih folder `backend` (atau biarkan di root jika menggunakan `vercel.json` root).
3. **Mengatur Variabel Lingkungan (Environment Variables)**:
   - Pada panel **Environment Variables** di Vercel, tambahkan nilai konfigurasi Aiven:
     - `DATABASE_URL`: Masukkan Service URI MySQL Aiven (`mysql://avnadmin:password@host:port/defaultdb?ssl-mode=REQUIRED`)
     - `JWT_SECRET`: Masukkan kunci rahasia JWT (contoh: `rahasia_super_aman_kunci_jwt_ujilevel_umkm_2026`)
     - `JWT_EXPIRES_IN`: `7d`
     - `NODE_ENV`: `production`
4. **Deploy**:
   - Klik tombol **Deploy**.
   - Tunggu beberapa saat hingga proses build selesai. Vercel akan menghasilkan URL live (contoh: `https://ujilevel-umkm-api.vercel.app`).
   - Uji endpoint di browser: `https://ujilevel-umkm-api.vercel.app/` -> Mengembalikan status Running dan daftar endpoint.

---

# BAB V PENUTUP

### 5.1 Kesimpulan
Berdasarkan perancangan, implementasi, dan pengujian yang telah dilaksanakan, dapat disimpulkan bahwa:
1. **Sistem Operasional dan Pelayanan UMKM Kuliner "Dapoer Berkah"** telah berhasil dibangun sesuai dengan seluruh kriteria teknis uji level kompetensi.
2. Arsitektur backend berbasis **Node.js & Express.js** mampu menyediakan antarmuka REST API yang aman, menerapkan otorisasi RBAC berjenjang (`admin` vs `kasir`), enkripsi hash kata sandi **bcrypt**, penanganan sesi JWT, serta pengelolaan file unggahan melalui **Multer**.
3. Struktur database relasional terstandarisasi (**MySQL di Aiven Cloud**) menjamin integritas data referensial antara entitas kategori dan produk menu melalui pemanfaatan *Primary Key*, *Foreign Key*, serta aturan *Cascade*.
4. Aplikasi mobile client berbasis **Flutter** menyediakan pengalaman pengguna (*UI/UX*) yang responsif, intuitif, mendukung pengunggahan foto dari kamera maupun galeri, serta menerapkan proteksi tampilan dinamis sesuai hak akses peran pengguna.
5. Hasil pengujian **Blackbox Testing** pada seluruh modul menunjukkan status **100% PASSED** (lulus), membuktikan sistem stabil, andal, dan siap dioperasikan dalam lingkungan produksi nyata.

### 5.2 Lampiran

#### 1. Informasi Repositori GitHub & Branching
- **Branch Utama**: `master` (versi stabil dan siap produksi).
- **Branch Fitur**: `feature/deployment-and-srs` (pengembangan dokumen SRS, konfigurasi cloud Aiven, dan Vercel).
- **Tautan Repositori**: `https://github.com/username/ujilevel-umkm` *(sesuaikan dengan akun GitHub peserta)*.

#### 2. Kredensial Akun Pengujian Sistem
| Peran (Role) | Email Login | Password Default | Cakupan Wewenang |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@dapoerberkah.com` | `admin123` | Akses penuh CRUD kategori, menu, & upload foto |
| **Kasir** | `kasir@dapoerberkah.com` | `kasir123` | Akses baca katalog, pencarian menu, dan cek ketersediaan stok |

#### 3. Ringkasan Antarmuka Pengguna (UI/UX)
- **Tampilan Login**: Form minimalis dilengkapi tombol cepat demo akun (*1-click autofill* Admin & Kasir).
- **Tampilan Dashboard**: Ringkasan jumlah menu aktif, kategori, produk stok menipis, serta navigasi cepat.
- **Tampilan Katalog**: Tampilan *grid* dua kolom estetik lengkap dengan thumbnail foto, badge kategori, harga Rupiah, dan status ketersediaan stok.
- **Tampilan Form Produk**: Dilengkapi fitur *Image Picker* dengan pratinjau interaktif foto dari kamera HP atau file galeri.
