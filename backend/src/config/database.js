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
console.log(`🔌 Mencoba koneksi database ke ${poolConfig.uri ? 'DATABASE_URL' : `${poolConfig.host}:${poolConfig.port} (DB: ${poolConfig.database})`} ...`);

pool.getConnection()
  .then((conn) => {
    console.log('✅ Berhasil terhubung ke database MySQL:', poolConfig.database || 'ujilevel_umkm');
    conn.release();
  })
  .catch((err) => {
    const errorDetails = err.errors ? err.errors.map(e => e.message || e.code).join(', ') : (err.message || err.code);
    console.error('❌ Gagal terhubung ke database MySQL:', errorDetails);
    if (!poolConfig.uri && (poolConfig.host === 'localhost' || poolConfig.host === '127.0.0.1')) {
      console.error('⚠️ PERHATIAN: Konfigurasi masih mengarah ke LOKAL (localhost:3306).');
      console.error('👉 Jika ingin menggunakan Cloud Aiven, masukkan kredensial Aiven ke dalam file: backend/.env');
    } else {
      console.error('👉 Pastikan host/port Aiven aktif, password benar, dan IP diizinkan.');
    }
  });

module.exports = pool;
