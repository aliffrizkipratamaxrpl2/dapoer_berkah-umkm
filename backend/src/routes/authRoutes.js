const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authenticateToken = require('../middlewares/authMiddleware');

// Endpoint Publik
router.post('/register', authController.register);
router.post('/login', authController.login);

// Endpoint Privat
router.get('/profile', authenticateToken, authController.getProfile);

module.exports = router;

