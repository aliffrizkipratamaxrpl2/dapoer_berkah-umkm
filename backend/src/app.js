const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');
const multer = require('multer');

dotenv.config();

const authRoutes = require('./routes/authRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const productRoutes = require('./routes/productRoutes');
const { errorResponse } = require('./utils/response');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware Global
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Sajikan folder uploads secara statis agar dapat diakses oleh aplikasi mobile / browser
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Root Endpoint info
app.get('/', (req, res) => {
  res.json({
    name: 'REST API Sistem UMKM Dapoer Berkah',
    version: '1.0.0',
    status: 'Running',
    endpoints: {
      auth: '/api/auth (POST /register, POST /login, GET /profile)',
      categories: '/api/categories (GET, POST, PUT, DELETE)',
      products: '/api/products (GET, POST, PUT, DELETE with image upload)',
      uploads: '/uploads/:filename',
    },
  });
});

// Registrasi Route API
app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/products', productRoutes);

// Handling 404 Not Found
app.use((req, res) => {
  return errorResponse(res, 404, `Endpoint ${req.method} ${req.originalUrl} tidak ditemukan.`);
});

// Global Error Handler (Termasuk error multer file upload)
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err);

  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return errorResponse(res, 400, 'Ukuran file terlalu besar! Maksimum ukuran file gambar adalah 5 MB.');
    }
    return errorResponse(res, 400, `Kesalahan upload file: ${err.message}`);
  }

  if (err.message && err.message.includes('Format file tidak didukung')) {
    return errorResponse(res, 400, err.message);
  }

  return errorResponse(res, 500, 'Terjadi kesalahan internal pada server.', err.message);
});

// Jalankan Server jika dieksekusi langsung
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`=================================================`);
    console.log(`🚀 REST API UMKM berjalan pada port ${PORT}`);
    console.log(`🌐 Base URL: http://localhost:${PORT}`);
    console.log(`📂 Folder Upload: ${path.join(__dirname, '../uploads')}`);
    console.log(`=================================================`);
  });
}

module.exports = app;

