const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

dotenv.config();

async function migrate() {
  console.log('🔌 Menghubungkan ke Aiven DB...');
  const conn = await mysql.createConnection({
    uri: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  console.log('1. Mengubah ENUM role users menjadi admin, kasir, pelanggan...');
  await conn.query("ALTER TABLE users MODIFY COLUMN role ENUM('admin', 'kasir', 'pelanggan') NOT NULL DEFAULT 'pelanggan'");

  console.log('2. Mengecek apakah user pelanggan sudah ada...');
  const [existing] = await conn.query('SELECT id FROM users WHERE email = ?', ['pelanggan@dapoerberkah.com']);
  if (existing.length === 0) {
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash('pelanggan123', salt);
    await conn.query(
      'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
      ['Pelanggan / Konsumen', 'pelanggan@dapoerberkah.com', hash, 'pelanggan']
    );
    console.log('✅ User pelanggan default berhasil dibuat (pelanggan@dapoerberkah.com / pelanggan123)');
  } else {
    console.log('ℹ️ User pelanggan sudah ada.');
  }

  const [users] = await conn.query('SELECT id, name, email, role FROM users');
  console.log('Daftar users saat ini:', users);
  await conn.end();
  console.log('🎉 Migrasi pelanggan selesai!');
}

migrate().catch(console.error);
