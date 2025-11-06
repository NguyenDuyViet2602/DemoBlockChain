// src/controllers/teacher.controller.js
const teacherService = require('../services/teacher.service');

// Dashboard Stats
exports.getDashboardStats = async (req, res, next) => {
  try {
    const teacherId = req.user.id;
    const stats = await teacherService.getDashboardStats(teacherId);
    res.json({
      message: 'Lấy thống kê thành công',
      data: stats,
    });
  } catch (error) {
    next(error);
  }
};

// My Courses
exports.getMyCourses = async (req, res, next) => {
  try {
    const teacherId = req.user.id;
    const filters = {
      page: parseInt(req.query.page) || 1,
      limit: parseInt(req.query.limit) || 10,
      status: req.query.status,
      search: req.query.search,
      sortBy: req.query.sortBy || 'createdat',
      sortOrder: req.query.sortOrder || 'DESC',
    };

    const result = await teacherService.getMyCourses(teacherId, filters);
    res.json({
      message: 'Lấy danh sách khóa học thành công',
      data: result.courses,
      pagination: {
        page: result.currentPage,
        limit: filters.limit,
        totalItems: result.totalItems,
        totalPages: result.totalPages,
      },
    });
  } catch (error) {
    next(error);
  }
};

// My Students
exports.getMyStudents = async (req, res, next) => {
  try {
    const teacherId = req.user.id;
    const filters = {
      page: parseInt(req.query.page) || 1,
      limit: parseInt(req.query.limit) || 10,
      courseId: req.query.courseId,
      search: req.query.search,
      sortBy: req.query.sortBy || 'enrolledat',
      sortOrder: req.query.sortOrder || 'DESC',
    };

    const result = await teacherService.getMyStudents(teacherId, filters);
    res.json({
      message: 'Lấy danh sách học viên thành công',
      data: result.students,
      pagination: {
        page: result.currentPage,
        limit: filters.limit,
        totalItems: result.totalItems,
        totalPages: result.totalPages,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Pending Submissions
exports.getPendingSubmissions = async (req, res, next) => {
  try {
    const teacherId = req.user.id;
    const filters = {
      page: parseInt(req.query.page) || 1,
      limit: parseInt(req.query.limit) || 10,
      courseId: req.query.courseId,
      assignmentId: req.query.assignmentId,
      sortBy: req.query.sortBy || 'submittedat',
      sortOrder: req.query.sortOrder || 'DESC',
    };

    const result = await teacherService.getPendingSubmissions(teacherId, filters);
    res.json({
      message: 'Lấy danh sách bài nộp chờ chấm thành công',
      data: result.submissions,
      pagination: {
        page: result.currentPage,
        limit: filters.limit,
        totalItems: result.totalItems,
        totalPages: result.totalPages,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Grade Submission
exports.gradeSubmission = async (req, res, next) => {
  try {
    const teacherId = req.user.id;
    const { submissionId } = req.params;
    const { grade, feedback } = req.body;

    if (grade === undefined || grade === null) {
      return res.status(400).json({ message: 'Điểm số là bắt buộc' });
    }

    const submission = await teacherService.gradeSubmission(submissionId, teacherId, {
      grade: parseFloat(grade),
      feedback,
    });

    res.json({
      message: 'Chấm điểm thành công',
      data: submission,
    });
  } catch (error) {
    if (error.message.includes('Không tìm thấy') || error.message.includes('không có quyền')) {
      return res.status(403).json({ message: error.message });
    }
    next(error);
  }
};

// Course Analytics
exports.getCourseAnalytics = async (req, res, next) => {
  try {
    const teacherId = req.user.id;
    const { courseId } = req.params;

    const analytics = await teacherService.getCourseAnalytics(courseId, teacherId);
    res.json({
      message: 'Lấy thống kê khóa học thành công',
      data: analytics,
    });
  } catch (error) {
    console.error('Error in getCourseAnalytics:', error);
    if (error.message.includes('Không tìm thấy') || error.message.includes('không có quyền')) {
      return res.status(403).json({ message: error.message });
    }
    res.status(500).json({ 
      message: 'Lỗi khi lấy thống kê khóa học',
      error: error.message 
    });
  }
};

// Revenue by Time
exports.getRevenueByTime = async (req, res, next) => {
  try {
    const teacherId = req.user.id;
    const period = req.query.period || 'month'; // 'month' or 'day'

    const revenueData = await teacherService.getRevenueByTime(teacherId, period);
    res.json({
      message: 'Lấy doanh thu theo thời gian thành công',
      data: revenueData,
    });
  } catch (error) {
    next(error);
  }
};

