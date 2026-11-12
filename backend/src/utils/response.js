/**
 * Standar format response JSON untuk konsistensi API
 */

const successResponse = (res, statusCode = 200, message = 'Berhasil', data = null) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

const errorResponse = (res, statusCode = 500, message = 'Terjadi kesalahan pada server', errors = null) => {
  const responsePayload = {
    success: false,
    message,
  };
  if (errors) {
    responsePayload.errors = errors;
  }
  return res.status(statusCode).json(responsePayload);
};

module.exports = {
  successResponse,
  errorResponse,
};

