// src/controllers/admin.controller.js
const adminService = require('../services/admin.service');

// Dashboard Stats
exports.getDashboardStats = async (req, res, next) => {
  try {
    const stats = await adminService.getDashboardStats();
    res.json({
      message: 'Lấy thống kê thành công',
      data: stats,
    });
  } catch (error) {
    next(error);
  }
};

// User Management
exports.getAllUsers = async (req, res, next) => {
  try {
    const filters = {
      page: parseInt(req.query.page) || 1,
      limit: parseInt(req.query.limit) || 10,
      role: req.query.role,
      search: req.query.search,
      sortBy: req.query.sortBy || 'createdat',
      sortOrder: req.query.sortOrder || 'DESC',
    };

    const result = await adminService.getAllUsers(filters);
    res.json({
      message: 'Lấy danh sách người dùng thành công',
      data: result.users,
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

exports.updateUserRole = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;

    if (!role || !['Student', 'Teacher', 'Admin'].includes(role)) {
      return res.status(400).json({ message: 'Role không hợp lệ' });
    }

    const user = await adminService.updateUserRole(userId, role);
    res.json({
      message: 'Cập nhật role thành công',
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

exports.deleteUser = async (req, res, next) => {
  try {
    const { userId } = req.params;
    await adminService.deleteUser(userId);
    res.json({ message: 'Xóa người dùng thành công' });
  } catch (error) {
    next(error);
  }
};

// Teacher Requests Management
exports.getAllTeacherRequests = async (req, res, next) => {
  try {
    const filters = {
      page: parseInt(req.query.page) || 1,
      limit: parseInt(req.query.limit) || 10,
      status: req.query.status,
      sortBy: req.query.sortBy || 'submittedat',
      sortOrder: req.query.sortOrder || 'DESC',
    };

    const result = await adminService.getAllTeacherRequests(filters);
    res.json({
      message: 'Lấy danh sách yêu cầu thành công',
      data: result.requests,
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

exports.approveTeacherRequest = async (req, res, next) => {
  try {
    const { requestId } = req.params;
    const request = await adminService.approveTeacherRequest(requestId);
    res.json({
      message: 'Duyệt yêu cầu thành công',
      data: request,
    });
  } catch (error) {
    next(error);
  }
};

exports.rejectTeacherRequest = async (req, res, next) => {
  try {
    const { requestId } = req.params;
    const request = await adminService.rejectTeacherRequest(requestId);
    res.json({
      message: 'Từ chối yêu cầu thành công',
      data: request,
    });
  } catch (error) {
    next(error);
  }
};

// Course Management
exports.getAllCourses = async (req, res, next) => {
  try {
    const filters = {
      page: parseInt(req.query.page) || 1,
      limit: parseInt(req.query.limit) || 10,
      status: req.query.status,
      categoryId: req.query.categoryId,
      search: req.query.search,
      sortBy: req.query.sortBy || 'createdat',
      sortOrder: req.query.sortOrder || 'DESC',
    };

    const result = await adminService.getAllCoursesForAdmin(filters);
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

exports.updateCourseStatus = async (req, res, next) => {
  try {
    const { courseId } = req.params;
    const { status } = req.body;

    if (!status || !['Approved', 'Pending', 'Rejected'].includes(status)) {
      return res.status(400).json({ message: 'Status không hợp lệ' });
    }

    const course = await adminService.updateCourseStatus(courseId, status);
    res.json({
      message: 'Cập nhật trạng thái khóa học thành công',
      data: course,
    });
  } catch (error) {
    next(error);
  }
};

exports.deleteCourse = async (req, res, next) => {
  try {
    const { courseId } = req.params;
    await adminService.deleteCourse(courseId);
    res.json({ message: 'Xóa khóa học thành công' });
  } catch (error) {
    next(error);
  }
};

// Order Management
exports.getAllOrders = async (req, res, next) => {
  try {
    const filters = {
      page: parseInt(req.query.page) || 1,
      limit: parseInt(req.query.limit) || 10,
      status: req.query.status,
      sortBy: req.query.sortBy || 'createdat',
      sortOrder: req.query.sortOrder || 'DESC',
    };

    const result = await adminService.getAllOrders(filters);
    res.json({
      message: 'Lấy danh sách đơn hàng thành công',
      data: result.orders,
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

exports.updateOrderStatus = async (req, res, next) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    if (!status || !['Pending', 'Completed', 'Cancelled'].includes(status)) {
      return res.status(400).json({ message: 'Status không hợp lệ' });
    }

    const order = await adminService.updateOrderStatus(orderId, status);
    res.json({
      message: 'Cập nhật trạng thái đơn hàng thành công',
      data: order,
    });
  } catch (error) {
    next(error);
  }
};

// Category Management
exports.getAllCategories = async (req, res, next) => {
  try {
    const categories = await adminService.getAllCategories();
    res.json({
      message: 'Lấy danh sách danh mục thành công',
      data: categories,
    });
  } catch (error) {
    next(error);
  }
};

exports.createCategory = async (req, res, next) => {
  try {
    const category = await adminService.createCategory(req.body);
    res.json({
      message: 'Tạo danh mục thành công',
      data: category,
    });
  } catch (error) {
    next(error);
  }
};

exports.updateCategory = async (req, res, next) => {
  try {
    const { categoryId } = req.params;
    const category = await adminService.updateCategory(categoryId, req.body);
    res.json({
      message: 'Cập nhật danh mục thành công',
      data: category,
    });
  } catch (error) {
    next(error);
  }
};

exports.deleteCategory = async (req, res, next) => {
  try {
    const { categoryId } = req.params;
    await adminService.deleteCategory(categoryId);
    res.json({ message: 'Xóa danh mục thành công' });
  } catch (error) {
    next(error);
  }
};

// Review Management
exports.getAllReviews = async (req, res, next) => {
  try {
    const filters = {
      page: parseInt(req.query.page) || 1,
      limit: parseInt(req.query.limit) || 10,
      sortBy: req.query.sortBy || 'createdat',
      sortOrder: req.query.sortOrder || 'DESC',
    };

    const result = await adminService.getAllReviews(filters);
    res.json({
      message: 'Lấy danh sách đánh giá thành công',
      data: result.reviews,
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

exports.deleteReview = async (req, res, next) => {
  try {
    const { reviewId } = req.params;
    await adminService.deleteReview(reviewId);
    res.json({ message: 'Xóa đánh giá thành công' });
  } catch (error) {
    next(error);
  }
};

