# 📖 PANDUAN LENGKAP & CONTEKAN PRESENTASI DIAGRAM
## APLIKASI DAPOER BERKAH UMKM (UJI LEVEL SMK RPL)

Panduan ini dibuat dengan bahasa yang santai, jelas, dan mudah dipahami oleh siswa. Dokumen ini dapat Anda baca saat persiapan atau dijadikan contekan saat penguji menanyakan alur sistem!

---

## 📂 DAFTAR FILE DRAW.IO YANG SUDAH DIBUAT

1. **File Gabungan (Master Semua Tab):**
   - [DIAGRAM_DAN_ERD_DAPOER_BERKAH.drawio](file:///c:/Users/ASUS/OneDrive/Dokumen/ujilevel-umkm/DIAGRAM_DAN_ERD_DAPOER_BERKAH.drawio)
   *(Bisa dibuka langsung di [app.diagrams.net](https://app.diagrams.net/) atau aplikasi Draw.io Desktop, di bawahnya terdapat 4 tab)*

2. **File Terpisah per Diagram (di dalam folder `drawio/`):**
   - [1_Use_Case_Diagram.drawio](file:///c:/Users/ASUS/OneDrive/Dokumen/ujilevel-umkm/drawio/1_Use_Case_Diagram.drawio)
   - [2_Activity_Diagram.drawio](file:///c:/Users/ASUS/OneDrive/Dokumen/ujilevel-umkm/drawio/2_Activity_Diagram.drawio)
   - [3_Class_Diagram.drawio](file:///c:/Users/ASUS/OneDrive/Dokumen/ujilevel-umkm/drawio/3_Class_Diagram.drawio)
   - [4_ERD_Database.drawio](file:///c:/Users/ASUS/OneDrive/Dokumen/ujilevel-umkm/drawio/4_ERD_Database.drawio)

---

## 🎯 1. USE CASE DIAGRAM (SIAPA BISA MELAKUKAN APA?)

### Cara Menjelaskan ke Penguji:
> *"Bapak/Ibu penguji, sistem Dapoer Berkah memiliki **3 Peran Pengguna (Role)** yang hak aksesnya dibagi secara jelas:*
>
> 1. **Pelanggan (Konsumen):**
>    - Bisa login atau daftar akun.
>    - Bisa melihat katalog menu makanan dan mencari berdasarkan kategori (Makanan / Minuman).
>    - Bisa **membeli makanan secara langsung**. Setiap kali pelanggan membeli menu, sistem secara otomatis memotong stok barang di database.
>
> 2. **Kasir (Staf Pelayan):**
>    - Bisa melihat katalog dan stok makanan.
>    - Bisa membantu mencatatkan pembelian jika ada pembeli yang datang langsung ke meja kasir.
>
> 3. **Admin (Pemilik Usaha / Owner):**
>    - Memiliki hak akses penuh (*Full Control*).
>    - Bisa **menambah menu baru beserta foto**, mengubah harga dan stok, menghapus menu, dan mengatur master kategori makanan.
>    - Memantau peringatan jika ada menu yang stoknya menipis (< 10 porsi).*

---

## ⚡ 2. ACTIVITY DIAGRAM (BAGAIMANA ALUR KERJA SISTEMNYA?)

Diagram ini dibagi menjadi **3 Alur Bernomor (Langkah 1 s/d 6)** agar alurnya mudah dibaca:

### ALUR A: Alur Pelanggan Membeli, Membayar, Dimasak, & Dihidangkan (FITUR UTAMA)
1. **Langkah 1:** Pelanggan membuka aplikasi dan memilih menu kuliner di katalog serta menentukan jumlah porsi dengan tombol `[+]` atau `[-]`.
2. **Pengecekan Stok:** Sistem memeriksa: *Apakah stok makanan mencukupi?*
   - *Jika Stok Habis / Kurang:* Tombol beli dikunci dan muncul peringatan merah "Stok Tidak Cukup".
   - *Jika Stok Cukup:* Lanjut ke pemilihan metode pembayaran.
3. **Langkah 2 (Pilih Metode Pembayaran):** Pelanggan memilih metode pembayaran:
   - 💵 **Tunai (Bayar di Kasir)**
   - 📱 **QRIS (GoPay, OVO, DANA, ShopeePay)**
   - 🏦 **Transfer Bank (BCA, Mandiri, BRI)**
4. **Langkah 3 (Konfirmasi & Bayar):** Pelanggan menekan tombol hijau **"Konfirmasi & Bayar"**. Backend langsung mencatat nomor pesanan (`DB-XXXXXX`) dan otomatis memotong sisa stok di database MySQL cloud:
   ```sql
   UPDATE products SET stock = stock - jumlah_beli WHERE id = ?
   ```
5. **Langkah 4 (Menunggu Dimasak):** Layar HP otomatis beralih ke tampilan **Status Pesanan (Sedang Dimasak)**:
   - Dilengkapi **Timer hitung mundur memasak (3 Menit)** dan animasi koki memasak.
   - Tersedia tombol **"⚡ Percepat Memasak"** khusus untuk kemudahan simulasi demonstrasi saat diuji oleh penguji.
6. **Langkah 5 (Menu Siap Dihidangkan):** Ketika waktu memasak selesai, status otomatis berubah menjadi hijau cerah: **"🎉 Menu Sudah Jadi & Siap Dihidangkan!"**, pelanggan tinggal mengambil hidangan di counter / disajikan di meja.

---

### ALUR B: Alur Login Pengguna
1. **Langkah 1:** Pengguna membuka aplikasi Dapoer Berkah di HP.
2. **Langkah 2:** Memasukkan Email dan Password, lalu klik **"Masuk"**.
3. **Pengecekan Akun:** Server mengecek apakah email terdaftar dan password cocok (menggunakan enkripsi Bcrypt).
   - *Jika salah:* Muncul pesan kesalahan "Email atau password salah".
   - *Jika benar:* Server memberikan token keamanan (JWT) dan mengenali peran (Admin / Kasir / Pelanggan).
4. **Langkah 4:** Pengguna masuk ke Halaman Utama sesuai peran masing-masing:
   - Jika **Admin**: Muncul tombol kelola produk (+ tambah, edit, hapus).
   - Jika **Pelanggan**: Muncul katalog belanja dan tombol beli.

---

### ALUR C: Alur Admin Menambah Menu Baru & Foto
1. **Langkah 1:** Admin menekan tombol tambah `[+]` di aplikasi.
2. **Langkah 2:** Mengisi nama menu, kategori, harga jual, dan stok awal.
3. **Langkah 3:** Memilih foto hidangan dari Kamera HP atau Galeri.
4. **Langkah 4:** Menekan tombol **"Simpan Menu"**.
5. **Langkah 5:** Backend menyimpan file foto ke folder penyimpanan dan menyimpan rincian ke database.
6. **Langkah 6:** Menu baru langsung muncul di katalog aplikasi.

---

## 🏛️ 3. CLASS DIAGRAM (STRUKTUR DATA DI CODINGAN)

### Cara Menjelaskan ke Penguji:
> *"Sistem ini dibangun dengan 4 entitas kelas utama yang saling terhubung:*
>
> 1. **Pengguna (UserModel):** Menyimpan data orang yang login (nama, email, password, dan role).
> 2. **KategoriMenu (CategoryModel):** Mengelompokkan jenis hidangan (contoh: Makanan Utama, Minuman, Camilan).
> 3. **ProdukMenu (ProductModel):** Menyimpan hidangan yang dijual beserta informasi harga dan stok porsinya.
> 4. **TransaksiBeli (BuyTransaction):** Kelas yang menangani saat pelanggan memesan menu, menghitung total bayar, dan memotong stok pada ProdukMenu."

---

## 🗄️ 4. ERD DATABASE (TABEL DI AIVEN MYSQL CLOUD)

### Cara Menjelaskan ke Penguji:
> *"Database aplikasi Dapoer Berkah di-hosting di Aiven Cloud MySQL dan menggunakan **3 tabel utama** yang efisien:*
>
> 1. **Tabel `users`**:
>    - Menyimpan akun pengguna dengan kolom `role`: `'admin'`, `'kasir'`, atau `'pelanggan'`.
>    - Password dienkripsi menggunakan algoritma **Bcrypt** demi keamanan.
>
> 2. **Tabel `categories`**:
>    - Menyimpan master jenis menu kuliner.
>
> 3. **Tabel `products`**:
>    - Menyimpan daftar hidangan, harga, file foto, serta kolom `stock`.
>    - Kolom `category_id` terhubung ke tabel `categories` (Relasi 1 to Many: 1 kategori punya banyak menu).
>    - Saat pelanggan membeli makanan, kolom `stock` inilah yang otomatis berkurang."

---

## 💡 PERTANYAAN PENGUJI YANG SERING KELUAR & CONTEKAN JAWABANNYA

1. **Tanya:** *"Bagaimana aplikasi memastikan stok tidak minus saat pelanggan membeli barang?"*
   - **Jawab:** *"Di sisi aplikasi (Flutter), ada validasi jumlah pesanan tidak boleh melebihi stok yang ada. Dan di sisi backend (Express.js), ada pengecekan ulang: jika stok kurang dari jumlah yang diminta, backend langsung menolak dan mengirim respon error HTTP 400 'Stok tidak mencukupi'."*

2. **Tanya:** *"Di mana data foto makanan disimpan?"*
   - **Jawab:** *"File fisik foto disimpan di folder backend server menggunakan middleware Multer, sedangkan di database MySQL hanya disimpan nama filenya saja (string) di kolom `image_url` pada tabel `products` agar database tetap ringan dan cepat."*

3. **Tanya:** *"Kenapa peran Pelanggan dibedakan dengan Kasir?"*
   - **Jawab:** *"Pelanggan adalah konsumen luar yang memesan makanan sendiri melalui aplikasi di ponsel mereka. Sedangkan Kasir adalah staf internal toko yang melayani transaksi langsung di restoran."*
