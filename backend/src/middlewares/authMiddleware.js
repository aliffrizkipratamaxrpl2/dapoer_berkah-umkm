const jwt = require('jsonwebtoken');
const { errorResponse } = require('../utils/response');

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  // Format token: Bearer <TOKEN>
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return errorResponse(res, 401, 'Akses ditolak: Token autentikasi tidak ditemukan. Silakan login terlebih dahulu.');
  }

  jwt.verify(token, process.env.JWT_SECRET || 'secret_jwt_key', (err, user) => {
    if (err) {
      if (err.name === 'TokenExpiredError') {
        return errorResponse(res, 401, 'Token autentikasi telah kedaluwarsa. Silakan login kembali.');
      }
      return errorResponse(res, 403, 'Token autentikasi tidak valid.');
    }

    req.user = user;
    next();
  });
};

module.exports = authenticateToken;

