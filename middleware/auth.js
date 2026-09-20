const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Middleware Autentikasi (Cek Token JWT)
 * Memastikan request memiliki token valid di Header:
 * Authorization: Bearer <token_jwt>
 */
const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Akses ditolak! Token JWT tidak ditemukan.',
      });
    }

    const token = authHeader.split(' ')[1];
    const secret = process.env.JWT_SECRET || 'super_secret_jwt_key_belajar_123_rendra';

    // Verifikasi tanda tangan token
    const decoded = jwt.verify(token, secret);

    // Cari user di MongoDB untuk memastikan akun masih ada & aktif
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User pemilik token ini tidak ditemukan di database.',
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Akun Anda sedang dinonaktifkan.',
      });
    }

    // Tempelkan data user ke request object agar route selanjutnya bisa memakai
    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Token tidak valid atau sudah kadaluarsa!',
      error: error.message,
    });
  }
};

/**
 * Middleware Otorisasi (Cek Role Admin)
 * Hanya user dengan role 'admin' yang boleh lewat
 */
const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    return next();
  }
  return res.status(403).json({
    success: false,
    message: 'Akses ditolak! Menu ini hanya khusus Admin.',
  });
};

module.exports = {
  verifyToken,
  adminOnly,
};
