const { errorResponse } = require('../utils/response');

/**
 * Middleware untuk membatasi akses endpoint berdasarkan role pengguna.
 * @param {Array<string>} allowedRoles Contoh: ['admin'] atau ['admin', 'kasir']
 */
const authorizeRole = (allowedRoles = []) => {
  return (req, res, next) => {
    if (!req.user) {
      return errorResponse(res, 401, 'Autentikasi diperlukan.');
    }

    if (!allowedRoles.includes(req.user.role)) {
      return errorResponse(
        res,
        403,
        `Akses ditolak: Role '${req.user.role}' tidak memiliki izin untuk melakukan tindakan ini. Diperlukan role: ${allowedRoles.join(', ')}.`
      );
    }

    next();
  };
};

module.exports = authorizeRole;

