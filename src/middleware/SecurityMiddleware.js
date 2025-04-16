const passport = require('passport');

const securityMiddleware = (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    if (err) {
      return res.status(500).json({ statusCode: 500, message: 'Lỗi server' });
    }
    if (!user) {
      let message = 'Đăng nhập thất bại';
      if (info.message === 'Missing credentials') {
        message = 'Thiếu thông tin đăng nhập';
      } else if (info.message === 'Incorrect password') {
        message = 'Mật khẩu không chính xác';
      } else if (info.message === 'Incorrect username') {
        message = 'Tài khoản không tồn tại';
      }
      return res.status(401).json({ statusCode: 401, message: message });
    }
    req.logIn(user, (err) => {
      if (err) {
        return res.status(500).json({ statusCode: 500, message: 'Lỗi server' });
      }
      next(); // Chuyển sang xử lý tiếp theo
    });
  })(req, res, next);
};

module.exports = securityMiddleware;
