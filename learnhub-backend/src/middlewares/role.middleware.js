// src/middlewares/role.middleware.js
// Middleware này chạy sau authMiddleware, nên req.user đã tồn tại
const roleMiddleware = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Chưa đăng nhập' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        message: `Truy cập bị từ chối. Yêu cầu quyền: ${allowedRoles.join(' hoặc ')}.`,
      });
    }

    next();
  };
};

module.exports = roleMiddleware;