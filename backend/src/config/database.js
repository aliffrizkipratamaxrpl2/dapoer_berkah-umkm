const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

dotenv.config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'ujilevel_umkm',
  port: parseInt(process.env.DB_PORT || '3306', 10),
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Test koneksi database saat start
pool.getConnection()
  .then((conn) => {
    console.log('✅ Berhasil terhubung ke database MySQL:', process.env.DB_NAME || 'ujilevel_umkm');
    conn.release();
  })
  .catch((err) => {
    console.error('❌ Gagal terhubung ke database MySQL:', err.message);
    console.error('👉 Pastikan layanan MySQL (XAMPP/Laragon) aktif dan database "ujilevel_umkm" sudah dibuat.');
  });

module.exports = pool;

