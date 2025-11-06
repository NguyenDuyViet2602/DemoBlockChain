// src/api/v1/admin.route.js
const express = require('express');
const router = express.Router();
const adminController = require('../../controllers/admin.controller');
const authMiddleware = require('../../middlewares/auth.middleware');
const adminMiddleware = require('../../middlewares/admin.middleware');

// Tất cả routes đều yêu cầu authentication và admin role
router.use(authMiddleware);
router.use(adminMiddleware);

// Dashboard Stats
router.get('/dashboard/stats', adminController.getDashboardStats);

// User Management
router.get('/users', adminController.getAllUsers);
router.put('/users/:userId/role', adminController.updateUserRole);
router.delete('/users/:userId', adminController.deleteUser);

// Teacher Requests Management
router.get('/teacher-requests', adminController.getAllTeacherRequests);
router.put('/teacher-requests/:requestId/approve', adminController.approveTeacherRequest);
router.put('/teacher-requests/:requestId/reject', adminController.rejectTeacherRequest);

// Course Management
router.get('/courses', adminController.getAllCourses);
router.put('/courses/:courseId/status', adminController.updateCourseStatus);
router.delete('/courses/:courseId', adminController.deleteCourse);

// Order Management
router.get('/orders', adminController.getAllOrders);
router.put('/orders/:orderId/status', adminController.updateOrderStatus);

// Category Management
router.get('/categories', adminController.getAllCategories);
router.post('/categories', adminController.createCategory);
router.put('/categories/:categoryId', adminController.updateCategory);
router.delete('/categories/:categoryId', adminController.deleteCategory);

// Review Management
router.get('/reviews', adminController.getAllReviews);
router.delete('/reviews/:reviewId', adminController.deleteReview);

module.exports = router;

