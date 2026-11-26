const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

async function testConnection() {
  console.log('====================================================');
  console.log('🔍 HASIL DIAGNOSIS KONEKSI DATABASE BACKEND');
  console.log('====================================================');

  const dbHost = process.env.DB_HOST;
  const dbPort = process.env.DB_PORT;
  const dbUser = process.env.DB_USER;
  const dbName = process.env.DB_NAME;
  const dbUrl = process.env.DATABASE_URL;

  console.log(`📌 DATABASE_URL : ${dbUrl ? '(Terisi)' : '(Kosong/Tidak Ada)'}`);
  console.log(`📌 DB_HOST      : ${dbHost || '(kosong)'}`);
  console.log(`📌 DB_PORT      : ${dbPort || '(kosong)'}`);
  console.log(`📌 DB_USER      : ${dbUser || '(kosong)'}`);
  console.log(`📌 DB_NAME      : ${dbName || '(kosong)'}`);
  console.log('----------------------------------------------------');

  if (!dbUrl && (!dbHost || dbHost === 'localhost' || dbHost === '127.0.0.1')) {
    console.log('⚠️ HASIL DETEKSI:');
    console.log('Aplikasi Anda saat ini MASIH membaca konfigurasi LOKAL (localhost:3306),');
    console.log('BUKAN Cloud Aiven! Kredensial Aiven belum masuk/tersimpan di backend/.env.');
    console.log('====================================================');
    return;
  }

  console.log('⏳ Mencoba menghubungi server database Aiven...');
  try {
    const isCloud = true;
    let conn;
    if (dbUrl) {
      conn = await mysql.createConnection({
        uri: dbUrl,
        ssl: { rejectUnauthorized: false }
      });
    } else {
      conn = await mysql.createConnection({
        host: dbHost,
        port: parseInt(dbPort || '3306', 10),
        user: dbUser,
        password: process.env.DB_PASSWORD,
        database: dbName || 'defaultdb',
        ssl: { rejectUnauthorized: false }
      });
    }

    console.log('✅ STATUS: BERHASIL TERHUBUNG KE AIVEN!');
    const [rows] = await conn.query('SELECT VERSION() as version, DATABASE() as db;');
    console.log(`📊 Versi MySQL: ${rows[0].version}`);
    console.log(`📊 Database Aktif: ${rows[0].db}`);
    await conn.end();
  } catch (err) {
    console.log('❌ STATUS: GAGAL TERHUBUNG KE AIVEN!');
    console.log(`Pesan Error: ${err.message}`);
    console.log(`Kode Error : ${err.code}`);
  }
  console.log('====================================================');
}

testConnection();
