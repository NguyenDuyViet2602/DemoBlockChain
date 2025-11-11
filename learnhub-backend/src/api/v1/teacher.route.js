// src/api/v1/teacher.route.js
const express = require('express');
const router = express.Router();
const teacherController = require('../../controllers/teacher.controller');
const authMiddleware = require('../../middlewares/auth.middleware');
const roleMiddleware = require('../../middlewares/role.middleware');

// Teacher request routes (cho Student muốn trở thành Teacher - không cần role Teacher)
router.post('/apply', authMiddleware, teacherController.apply);
router.get('/requests', authMiddleware, teacherController.getRequestsByUser);

// Tất cả routes dưới đây yêu cầu authentication và teacher role
router.use(authMiddleware);
router.use(roleMiddleware(['Teacher', 'Admin']));

// Dashboard Stats
router.get('/dashboard/stats', teacherController.getDashboardStats);

// My Courses
router.get('/courses', teacherController.getMyCourses);

// My Students
router.get('/students', teacherController.getMyStudents);

// Pending Submissions
router.get('/submissions/pending', teacherController.getPendingSubmissions);

// Grade Submission
router.put('/submissions/:submissionId/grade', teacherController.gradeSubmission);

// Course Analytics
router.get('/courses/:courseId/analytics', teacherController.getCourseAnalytics);

// Revenue by Time
router.get('/revenue', teacherController.getRevenueByTime);

module.exports = router;

