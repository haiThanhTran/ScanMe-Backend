const rateLimit = require('express-rate-limit');


const standardLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200, 
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 429,
    message: 'Quá nhiều yêu cầu, vui lòng thử lại sau.'
  }
});


const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 phút
  max: 20, // Giới hạn mỗi IP tối đa 20 request đăng nhập trong 15 phút
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 429,
    message: 'Quá nhiều yêu cầu đăng nhập, vui lòng thử lại sau 15 phút.'
  }
});

module.exports = {
  standardLimiter,
  loginLimiter
}; 
