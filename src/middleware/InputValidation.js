const User = require("../models/user/User");
const bcrypt = require("bcryptjs");
const STATUS_ACCOUNT = require("../enums/statusAccount");
const Joi = require("joi");

const inputValidationLogin = async (req, res, next) => {
  try{
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ status: 400, message: "Thiếu tài khoản hoặc mật khẩu" });
    }
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({ status: 401, message: "Tài khoản không tồn tại" });
    }

    if (user.status === STATUS_ACCOUNT.INACTIVE) {
      return res.status(401).json({ status: 401, message: "Tài khoản chưa được kích hoạt, vui lòng kiểm tra email để kích hoạt."})
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ status: 401, message: "Mật khẩu không chính xác" });
    }
    next();
  }catch (e) {
    res.status(500).json({ message: "Lỗi server: " + e.message });
  }
}

const inputValidationRegister = async (req, res, next) => {
  try {
    const { username, email, password, confirmPassword } = req.body;


    const schema = Joi.object({
      username: Joi.string().min(3).required().messages({
        "string.empty": "Tên đăng nhập không được để trống",
        "string.min": "Tên đăng nhập phải có ít nhất 3 ký tự",
      }),
      email: Joi.string().email().required().messages({
        "string.empty": "Email không được để trống",
        "string.email": "Email không hợp lệ",
      }),
      password: Joi.string().min(6).required().messages({
        "string.empty": "Mật khẩu không được để trống",
        "string.min": "Mật khẩu phải có ít nhất 6 ký tự",
      }),
      confirmPassword: Joi.string().valid(Joi.ref("password")).required().messages({
        "any.only": "Mật khẩu xác nhận không khớp",
        "string.empty": "Xác nhận mật khẩu không được để trống",
      }),
    });


    const { error } = schema.validate(req.body, { abortEarly: false });

    if (error) {
      return res.status(400).json({
        status: 400,
        message: "Dữ liệu đầu vào không hợp lệ",
        errors: error.details.map((err) => err.message),
      });
    }

    
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        status: 409,
        message: "Email đã được sử dụng, vui lòng chọn email khác",
      });
    }

    next(); 
  } catch (e) {
    res.status(500).json({ message: "Lỗi server: " + e.message });
  }
};

module.exports = { inputValidationLogin,inputValidationRegister };
