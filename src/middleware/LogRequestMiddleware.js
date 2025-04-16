const LogRequest = require("../models/system/LogRequest");

const logRequestMiddleware = async (req, res, next) => {
    const start = Date.now(); // Lưu thời gian bắt đầu request

    res.on("finish", async () => {
        // Ghi log sau khi response kết thúc
        const logData = {
            method: req.method,
            url: req.originalUrl,
            statusCode: res.statusCode,
            ip: req.ip || req.connection.remoteAddress,
            userAgent: req.headers["user-agent"],
            headers: req.headers,
            requestBody: req.body,
            responseBody: res.body || {}, // Response body (nếu cần)
            user: req.account ? req.account.userId : null, // Nếu có user đăng nhập
            createdAt: new Date(),
        };

        try {
            await LogRequest.create(logData);
        } catch (error) {
            console.error("Lỗi lưu log request:", error.message);
        }
    });

    next();
};

module.exports = logRequestMiddleware;
