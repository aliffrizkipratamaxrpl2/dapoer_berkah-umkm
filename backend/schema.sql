-- ==========================================================
-- SKEMA DATABASE: SISTEM OPERASIONAL UMKM (Dapoer Berkah)
-- Database Engine: MySQL / MariaDB
-- Nama Database: ujilevel_umkm
-- ==========================================================

CREATE DATABASE IF NOT EXISTS `ujilevel_umkm` 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

USE `ujilevel_umkm`;

-- ----------------------------------------------------------
-- 1. TABEL USERS (Autentikasi & Otorisasi Role)
-- ----------------------------------------------------------
DROP TABLE IF EXISTS `products`;
DROP TABLE IF EXISTS `categories`;
DROP TABLE IF EXISTS `users`;

CREATE TABLE `users` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL,
  `email` VARCHAR(100) NOT NULL UNIQUE,
  `password` VARCHAR(255) NOT NULL, -- Hashed menggunakan bcrypt
  `role` ENUM('admin', 'kasir') NOT NULL DEFAULT 'kasir',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ----------------------------------------------------------
-- 2. TABEL CATEGORIES (Data Utama 1 - Kategori Menu / Produk)
-- ----------------------------------------------------------
CREATE TABLE `categories` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL,
  `description` TEXT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ----------------------------------------------------------
-- 3. TABEL PRODUCTS (Data Utama 2 - Produk Menu UMKM & Gambar)
-- Relasi: M-to-1 dengan categories via category_id (Foreign Key)
-- ----------------------------------------------------------
CREATE TABLE `products` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `category_id` INT NOT NULL,
  `name` VARCHAR(150) NOT NULL,
  `description` TEXT NULL,
  `price` DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
  `stock` INT NOT NULL DEFAULT 0,
  `image_url` VARCHAR(255) NULL, -- Menyimpan path/nama file gambar yang diupload
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `fk_products_category` 
    FOREIGN KEY (`category_id`) 
    REFERENCES `categories` (`id`) 
    ON DELETE CASCADE 
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ----------------------------------------------------------
-- DATA AWAL / SEEDER CONTOH
-- Password hash untuk 'admin123' dan 'kasir123':
-- admin123: $2a$10$wTqK/gZ6J1uU0Y33q4YqquQkM.HoxrE6qXfE41v5fF.zZ1V0KekrC
-- kasir123: $2a$10$tZc4K0E0tB0k.0.v.0q1uuv8F.Z1y0xKev.HoxrE6qXfE41v5fF.z
-- Catatan: Script initDb.js akan men-generate hash bcrypt yang dinamis dan terverifikasi
-- ----------------------------------------------------------
INSERT INTO `categories` (`id`, `name`, `description`) VALUES
(1, 'Makanan Utama', 'Menu hidangan makanan berat khas nusantara'),
(2, 'Minuman Segar', 'Aneka minuman dingin, kopi, dan jus buah'),
(3, 'Camilan & Snack', 'Gorengan, keripik, dan kudapan tradisional');

INSERT INTO `products` (`id`, `category_id`, `name`, `description`, `price`, `stock`, `image_url`) VALUES
(1, 1, 'Nasi Goreng Spesial Berkah', 'Nasi goreng bumbu rempah lengkap dengan telur, ayam suwir, dan acar segar', 22000.00, 35, NULL),
(2, 1, 'Ayam Bakar Madu', 'Ayam potong bakar balur saus madu gurih manis dengan sambal terasi', 28000.00, 20, NULL),
(3, 2, 'Es Kopi Susu Gula Aren', 'Espresso robusta lokal dipadu susu segar dan sirup gula aren murni', 15000.00, 50, NULL),
(4, 2, 'Es Teh Manis Melati', 'Teh racikan melati wangi segar disajikan dingin', 6000.00, 100, NULL),
(5, 3, 'Pisang Goreng Crispy Keju', 'Pisang kepok goreng renyah dengan taburan keju cheddar parut dan susu kental manis', 14000.00, 25, NULL);

