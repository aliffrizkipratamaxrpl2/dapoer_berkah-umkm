const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Pastikan folder uploads tersedia
const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Konfigurasi penyimpanan disk multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Generate nama file unik: produk-TIMESTAMP-RANDOM.ext
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    let ext = path.extname(file.originalname).toLowerCase();
    
    // Fallback jika nama file tidak memiliki ekstensi
    if (!ext || ext === '') {
      if (file.mimetype === 'image/png') ext = '.png';
      else if (file.mimetype === 'image/webp') ext = '.webp';
      else if (file.mimetype === 'image/gif') ext = '.gif';
      else if (file.mimetype === 'image/bmp') ext = '.bmp';
      else ext = '.jpg';
    }
    
    cb(null, `produk-${uniqueSuffix}${ext}`);
  },
});

// Filter tipe file fleksibel: Mendukung semua jenis gambar (JPG, PNG, WEBP, GIF, BMP, JFIF, HEIC, AVIF, dll)
const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  const allowedExtensions = [
    '.jpg', '.jpeg', '.png', '.webp', '.gif', '.bmp', '.svg', '.jfif', '.heic', '.heif', '.avif', '.ico'
  ];

  const isImageMime = file.mimetype && file.mimetype.startsWith('image/');
  const isOctetStream = file.mimetype === 'application/octet-stream';
  const hasImageExt = allowedExtensions.includes(ext);

  // Izinkan jika mimetype gambar, atau ekstensi gambar, atau stream biner gambar dari mobile/web
  if (isImageMime || hasImageExt || isOctetStream || !ext) {
    cb(null, true);
  } else {
    cb(new Error('Format file tidak didukung! Silakan pilih file gambar yang valid (JPG, JPEG, PNG, WEBP, GIF, dll).'));
  }
};

// Batasan ukuran ditingkatkan hingga 20MB (mendukung foto resolusi tinggi kamera HP modern)
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 20 * 1024 * 1024, // 20 Megabytes
  },
});

module.exports = upload;
