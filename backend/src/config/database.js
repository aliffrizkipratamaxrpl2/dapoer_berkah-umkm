const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

dotenv.config();

let poolConfig = {};

if (process.env.DATABASE_URL) {
  // Dukungan koneksi langsung menggunakan DATABASE_URL dari Cloud Provider (Aiven / Railway / Heroku)
  poolConfig = {
    uri: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
  };
} else {
  // Deteksi otomatis jika menggunakan cloud host (seperti Aiven Cloud) atau flag DB_SSL=true
  const isCloudHost = 
    process.env.DB_SSL === 'true' || 
    (process.env.DB_HOST && (process.env.DB_HOST.includes('aivencloud.com') || process.env.DB_HOST.includes('cloud')));

  poolConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'ujilevel_umkm',
    port: parseInt(process.env.DB_PORT || '3306', 10),
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    ...(isCloudHost ? { ssl: { rejectUnauthorized: false } } : {}),
  };
}

const pool = mysql.createPool(poolConfig);

// Test koneksi database saat start
pool.getConnection()
  .then((conn) => {
    console.log('✅ Berhasil terhubung ke database MySQL:', process.env.DB_NAME || 'ujilevel_umkm (Aiven/Local)');
    conn.release();
  })
  .catch((err) => {
    console.error('❌ Gagal terhubung ke database MySQL:', err.message);
    console.error('👉 Pastikan layanan MySQL (Lokal XAMPP atau Cloud Aiven) aktif dan database sudah dibuat.');
  });

module.exports = pool;
