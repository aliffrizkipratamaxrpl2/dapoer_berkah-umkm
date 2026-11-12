const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

dotenv.config();

const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_USER = process.env.DB_USER || 'root';
const DB_PASSWORD = process.env.DB_PASSWORD || '';
const DB_NAME = process.env.DB_NAME || 'ujilevel_umkm';
const DB_PORT = parseInt(process.env.DB_PORT || '3306', 10);

async function initializeDatabase() {
  let connection;
  try {
    console.log(`🔌 Menghubungkan ke MySQL di ${DB_HOST}:${DB_PORT} ...`);
    connection = await mysql.createConnection({
      host: DB_HOST,
      user: DB_USER,
      password: DB_PASSWORD,
      port: DB_PORT,
    });

    console.log(`🛠️ Membuat database '${DB_NAME}' jika belum ada...`);
    await connection.query(
      `CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`
    );
    await connection.changeUser({ database: DB_NAME });

    console.log(`📋 Membuat tabel-tabel database...`);

    // Hapus urutan tabel jika perlu reset
    await connection.query(`SET FOREIGN_KEY_CHECKS = 0;`);
    await connection.query(`DROP TABLE IF EXISTS products;`);
    await connection.query(`DROP TABLE IF EXISTS categories;`);
    await connection.query(`DROP TABLE IF EXISTS users;`);
    await connection.query(`SET FOREIGN_KEY_CHECKS = 1;`);

    // 1. Buat Tabel Users
    await connection.query(`
      CREATE TABLE users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        role ENUM('admin', 'kasir') NOT NULL DEFAULT 'kasir',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // 2. Buat Tabel Categories
    await connection.query(`
      CREATE TABLE categories (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        description TEXT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // 3. Buat Tabel Products
    await connection.query(`
      CREATE TABLE products (
        id INT AUTO_INCREMENT PRIMARY KEY,
        category_id INT NOT NULL,
        name VARCHAR(150) NOT NULL,
        description TEXT NULL,
        price DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
        stock INT NOT NULL DEFAULT 0,
        image_url VARCHAR(255) NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        CONSTRAINT fk_products_category 
          FOREIGN KEY (category_id) 
          REFERENCES categories (id) 
          ON DELETE CASCADE 
          ON UPDATE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    console.log(`🌱 Melakukan seeding data awal...`);

    // Seed Users (Admin & Kasir)
    const salt = await bcrypt.genSalt(10);
    const adminPasswordHash = await bcrypt.hash('admin123', salt);
    const kasirPasswordHash = await bcrypt.hash('kasir123', salt);

    await connection.query(
      `INSERT INTO users (name, email, password, role) VALUES 
       (?, ?, ?, 'admin'),
       (?, ?, ?, 'kasir')`,
      [
        'Pemilik / Admin UMKM', 'admin@dapoerberkah.com', adminPasswordHash,
        'Kasir Dapoer Berkah', 'kasir@dapoerberkah.com', kasirPasswordHash,
      ]
    );

    // Seed Categories
    const [catResult1] = await connection.query(
      `INSERT INTO categories (name, description) VALUES (?, ?)`,
      ['Makanan Utama', 'Menu hidangan makanan berat khas nusantara']
    );
    const [catResult2] = await connection.query(
      `INSERT INTO categories (name, description) VALUES (?, ?)`,
      ['Minuman Segar', 'Aneka minuman dingin, kopi lokal, dan jus buah']
    );
    const [catResult3] = await connection.query(
      `INSERT INTO categories (name, description) VALUES (?, ?)`,
      ['Camilan & Snack', 'Gorengan renyah, keripik, dan kue tradisional']
    );

    // Seed Products
    await connection.query(
      `INSERT INTO products (category_id, name, description, price, stock, image_url) VALUES 
       (?, ?, ?, ?, ?, ?),
       (?, ?, ?, ?, ?, ?),
       (?, ?, ?, ?, ?, ?),
       (?, ?, ?, ?, ?, ?),
       (?, ?, ?, ?, ?, ?)`,
      [
        catResult1.insertId, 'Nasi Goreng Spesial Berkah', 'Nasi goreng bumbu rempah lengkap dengan telur, ayam suwir, dan acar segar', 22000.00, 35, null,
        catResult1.insertId, 'Ayam Bakar Madu', 'Ayam potong bakar balur saus madu gurih manis dengan sambal terasi', 28000.00, 20, null,
        catResult2.insertId, 'Es Kopi Susu Gula Aren', 'Espresso robusta lokal dipadu susu segar dan sirup gula aren murni', 15000.00, 50, null,
        catResult2.insertId, 'Es Teh Manis Melati', 'Teh racikan daun melati wangi segar disajikan dingin', 6000.00, 100, null,
        catResult3.insertId, 'Pisang Goreng Crispy Keju', 'Pisang kepok goreng tepung renyah dengan topping keju parut & susu kental', 14000.00, 25, null,
      ]
    );

    console.log(`✅ Database '${DB_NAME}' berhasil diinisialisasi beserta struktur tabel dan data awal!`);
    console.log(`   Akun login default:`);
    console.log(`   - Admin: admin@dapoerberkah.com / password: admin123`);
    console.log(`   - Kasir: kasir@dapoerberkah.com / password: kasir123`);
  } catch (error) {
    console.error(`❌ Gagal menginisialisasi database:`, error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

initializeDatabase();

