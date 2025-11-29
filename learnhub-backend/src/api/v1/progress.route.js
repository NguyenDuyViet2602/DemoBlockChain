// src/api/v1/progress.route.js
const express = require('express');
const router = express.Router();
const progressController = require('../../controllers/progress.controller');
const authMiddleware = require('../../middlewares/auth.middleware');

// Tất cả API tiến độ đều yêu cầu đăng nhập
router.use(authMiddleware);

// POST /api/v1/progress/complete
// Đánh dấu một bài học là đã hoàn thành
router.post('/complete', progressController.handleMarkAsComplete);

// GET /api/v1/progress/course/:courseId
// Lấy tiến độ của một khóa học (danh sách ID các bài đã học)
router.get('/course/:courseId', progressController.handleGetCourseProgress);

// POST /api/v1/progress/watch-time
// Cập nhật thời gian xem video (gọi mỗi 10-30 giây)
router.post('/watch-time', progressController.handleUpdateWatchTime);

// POST /api/v1/progress/check-course-completion/:courseId
// Kiểm tra và đánh dấu hoàn thành khóa học (nếu đủ điều kiện)
router.post('/check-course-completion/:courseId', progressController.handleCheckCourseCompletion);

module.exports = router;