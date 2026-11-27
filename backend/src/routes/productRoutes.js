const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const authenticateToken = require('../middlewares/authMiddleware');
const authorizeRole = require('../middlewares/roleMiddleware');
const upload = require('../middlewares/uploadMiddleware');

// Semua rute produk memerlukan autentikasi token
router.use(authenticateToken);

// GET: Semua role (admin, kasir, pelanggan) dapat melihat daftar & detail produk
router.get('/orders/list', productController.getOrders);
router.get('/', productController.getAllProducts);
router.get('/:id', productController.getProductById);

// POST: Pembelian produk (Otomatis mengurangi stok di database)
// Terbuka untuk semua pengguna terotentikasi (Pelanggan, Kasir, Admin)
router.post('/:id/buy', productController.buyProduct);

// POST, PUT, DELETE: Khusus role 'admin'
// Mendukung upload gambar produk melalui multipart/form-data dengan field 'image'
router.post(
  '/',
  authorizeRole(['admin']),
  upload.single('image'),
  productController.createProduct
);

router.put(
  '/:id',
  authorizeRole(['admin']),
  upload.single('image'),
  productController.updateProduct
);

router.delete(
  '/:id',
  authorizeRole(['admin']),
  productController.deleteProduct
);

module.exports = router;

