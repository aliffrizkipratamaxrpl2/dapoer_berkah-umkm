const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/database');
const { successResponse, errorResponse } = require('../utils/response');

/**
 * Controller: Registrasi Pengguna Baru
 */
const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Validasi input wajib
    if (!name || !email || !password) {
      return errorResponse(res, 400, 'Nama, email, dan password wajib diisi.');
    }

    if (password.length < 6) {
      return errorResponse(res, 400, 'Password minimal harus 6 karakter.');
    }

    // Role yang valid: 'admin' atau 'kasir'
    const userRole = role === 'admin' ? 'admin' : 'kasir';

    // Cek apakah email sudah terdaftar
    const [existingUsers] = await db.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existingUsers.length > 0) {
      return errorResponse(res, 400, 'Email sudah terdaftar. Silakan gunakan email lain.');
    }

    // Hash password menggunakan bcrypt
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Simpan user ke database
    const [result] = await db.query(
      'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
      [name, email, hashedPassword, userRole]
    );

    const userId = result.insertId;

    // Generate JWT token
    const token = jwt.sign(
      { id: userId, name, email, role: userRole },
      process.env.JWT_SECRET || 'secret_jwt_key',
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    return successResponse(res, 201, 'Registrasi pengguna berhasil.', {
      token,
      user: {
        id: userId,
        name,
        email,
        role: userRole,
      },
    });
  } catch (error) {
    console.error('Register Error:', error);
    return errorResponse(res, 500, 'Terjadi kegagalan saat registrasi pengguna.', error.message);
  }
};

/**
 * Controller: Login Pengguna
 */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return errorResponse(res, 400, 'Email dan password wajib diisi.');
    }

    // Cari user berdasarkan email
    const [users] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    if (users.length === 0) {
      return errorResponse(res, 401, 'Email atau password tidak valid.');
    }

    const user = users[0];

    // Bandingkan hash password
    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
      return errorResponse(res, 401, 'Email atau password tidak valid.');
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, name: user.name, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'secret_jwt_key',
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    return successResponse(res, 200, 'Login berhasil.', {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Login Error:', error);
    return errorResponse(res, 500, 'Terjadi kegagalan saat proses login.', error.message);
  }
};

/**
 * Controller: Get Profile Pengguna Saat Ini
 */
const getProfile = async (req, res) => {
  try {
    const [users] = await db.query(
      'SELECT id, name, email, role, created_at, updated_at FROM users WHERE id = ?',
      [req.user.id]
    );

    if (users.length === 0) {
      return errorResponse(res, 404, 'Data pengguna tidak ditemukan.');
    }

    return successResponse(res, 200, 'Data profil berhasil diambil.', users[0]);
  } catch (error) {
    console.error('Get Profile Error:', error);
    return errorResponse(res, 500, 'Terjadi kegagalan saat mengambil profil.', error.message);
  }
};

module.exports = {
  register,
  login,
  getProfile,
};

