const authService = require('../services/auth.service');

// Controller cho đăng nhập
exports.login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        // Kiểm tra input
        if (!email || !password) {
            return res.status(400).json({ message: 'Email và mật khẩu là bắt buộc' });
        }

        // Gọi service
        const result = await authService.loginService(email, password);

        res.status(200).json({
            message: 'Đăng nhập thành công',
            token: result.token,
            user: result.user,
        });
    } catch (error) {
        res.status(401).json({ message: error.message });
    }
};

// Controller cho đăng ký
exports.register = async (req, res, next) => {
    try {
        const { email, password, fullName } = req.body;

        // Kiểm tra input
        if (!email || !password || !fullName) {
            return res.status(400).json({ message: 'Email, mật khẩu và họ tên là bắt buộc' });
        }

        // Gọi service
        const result = await authService.registerService(email, password, fullName);

        res.status(201).json({
            message: 'Đăng ký thành công',
            token: result.token,
            user: result.user,
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};