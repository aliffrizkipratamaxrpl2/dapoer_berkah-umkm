const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const authenticateToken = require('../middlewares/authMiddleware');
const authorizeRole = require('../middlewares/roleMiddleware');

// Semua rute kategori memerlukan autentikasi login (Admin & Kasir)
router.use(authenticateToken);

// GET: Semua role yang terautentikasi (admin & kasir) dapat melihat daftar kategori
router.get('/', categoryController.getAllCategories);
router.get('/:id', categoryController.getCategoryById);

// POST, PUT, DELETE: Khusus role 'admin'
router.post('/', authorizeRole(['admin']), categoryController.createCategory);
router.put('/:id', authorizeRole(['admin']), categoryController.updateCategory);
router.delete('/:id', authorizeRole(['admin']), categoryController.deleteCategory);

module.exports = router;

