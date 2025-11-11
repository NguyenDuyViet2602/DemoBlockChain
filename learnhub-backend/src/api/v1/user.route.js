const express = require('express');
const router = express.Router();
const userController = require('../../controllers/user.controller');
const authMiddleware = require('../../middlewares/auth.middleware');
const uploadImage = require('../../middlewares/upload.middleware');

// GET /api/v1/users?page=1&limit=5 (public)
router.get('/', userController.getAllUsers);
router.get('/users', userController.getAllUsers); // Alias để hỗ trợ /api/v1/users

// GET /api/v1/user - Lấy thông tin user hiện tại (cần auth)
router.get('/user', authMiddleware, userController.getCurrentUser);

// PUT /api/v1/user/:id - Cập nhật thông tin user (cần auth)
router.put('/user/:id', authMiddleware, userController.updateUser);

// POST /api/v1/user/:id/upload-avatar - Upload avatar cho user (cần auth)
router.post('/user/:id/upload-avatar', authMiddleware, uploadImage, userController.uploadUserAvatar);

module.exports = router;