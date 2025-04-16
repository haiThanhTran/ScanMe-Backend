const csrf = require('csurf');
const cookieParser = require('cookie-parser');

// Cấu hình CSRF protection
const csrfProtection = csrf({ 
  cookie: {
    key: '_csrf',
    path: '/',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production', // Chỉ bật secure trong production
    sameSite: 'strict'
  } 
});

// Middleware xử lý lỗi CSRF
const handleCSRFError = (err, req, res, next) => {
  if (err.code !== 'EBADCSRFTOKEN') return next(err);
  
  // Xử lý lỗi CSRF token không hợp lệ
  return res.status(403).json({
    status: 403,
    message: 'Phiên làm việc không hợp lệ hoặc đã hết hạn, vui lòng thử lại.'
  });
};

module.exports = {
  cookieParser,
  csrfProtection,
  handleCSRFError
}; 
