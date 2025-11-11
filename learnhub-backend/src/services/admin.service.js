// src/services/admin.service.js
const { Op } = require('sequelize');
const {
  users,
  courses,
  teacherrequests,
  orders,
  categories,
  enrollments,
  coursereviews,
  orderdetails,
} = require('../models');

/**
 * Lấy thống kê tổng quan cho admin dashboard
 */
const getDashboardStats = async () => {
  const [
    totalUsers,
    totalStudents,
    totalTeachers,
    totalCourses,
    pendingCourses,
    totalOrders,
    totalRevenue,
    pendingTeacherRequests,
  ] = await Promise.all([
    users.count(),
    users.count({ where: { role: 'Student' } }),
    users.count({ where: { role: 'Teacher' } }),
    courses.count(),
    courses.count({ where: { status: 'Pending' } }),
    orders.count(),
    orders.sum('totalamount', { where: { status: 'Completed' } }) || 0,
    teacherrequests.count({ where: { status: 'Pending' } }),
  ]);

  return {
    totalUsers,
    totalStudents,
    totalTeachers,
    totalCourses,
    pendingCourses,
    totalOrders,
    totalRevenue: totalRevenue || 0,
    pendingTeacherRequests,
  };
};

/**
 * Quản lý người dùng
 */
const getAllUsers = async (filters = {}) => {
  const {
    page = 1,
    limit = 10,
    role,
    search,
    sortBy = 'createdat',
    sortOrder = 'DESC',
  } = filters;

  const offset = (page - 1) * limit;
  const whereCondition = {};

  if (role) {
    whereCondition.role = role;
  }
  if (search) {
    whereCondition[Op.or] = [
      { fullname: { [Op.iLike]: `%${search}%` } },
      { email: { [Op.iLike]: `%${search}%` } },
    ];
  }

  const { count, rows } = await users.findAndCountAll({
    where: whereCondition,
    offset,
    limit,
    order: [[sortBy, sortOrder]],
    attributes: { exclude: ['passwordhash'] }, // Không trả về password
  });

  return {
    totalItems: count,
    totalPages: Math.ceil(count / limit),
    currentPage: page,
    users: rows,
  };
};

const updateUserRole = async (userId, newRole) => {
  const user = await users.findByPk(userId);
  if (!user) {
    throw new Error('Không tìm thấy người dùng');
  }

  await user.update({ role: newRole });
  return user;
};

const deleteUser = async (userId) => {
  const user = await users.findByPk(userId);
  if (!user) {
    throw new Error('Không tìm thấy người dùng');
  }

  await user.destroy();
  return { message: 'Xóa người dùng thành công' };
};

/**
 * Quản lý yêu cầu trở thành Teacher
 */
const getAllTeacherRequests = async (filters = {}) => {
  const {
    page = 1,
    limit = 10,
    status,
    sortBy = 'submittedat',
    sortOrder = 'DESC',
  } = filters;

  const offset = (page - 1) * limit;
  const whereCondition = {};

  if (status) {
    whereCondition.status = status;
  }

  const { count, rows } = await teacherrequests.findAndCountAll({
    where: whereCondition,
    include: [
      {
        model: users,
        as: 'user',
        attributes: ['userid', 'fullname', 'email', 'profilepicture'],
      },
    ],
    offset,
    limit,
    order: [[sortBy, sortOrder]],
  });

  return {
    totalItems: count,
    totalPages: Math.ceil(count / limit),
    currentPage: page,
    requests: rows,
  };
};

const approveTeacherRequest = async (requestId) => {
  const request = await teacherrequests.findByPk(requestId, {
    include: [{ model: users, as: 'user' }],
  });

  if (!request) {
    throw new Error('Không tìm thấy yêu cầu');
  }

  if (request.status !== 'Pending') {
    throw new Error('Yêu cầu này đã được xử lý');
  }

  // Cập nhật role của user thành Teacher
  await request.user.update({ role: 'Teacher' });

  // Cập nhật status của request
  await request.update({
    status: 'Approved',
    reviewedat: new Date(),
  });

  // Tạo notification cho user
  const notificationService = require('./notification.service');
  await notificationService.createNotification(
    request.userid,
    'Chúc mừng! Yêu cầu trở thành giảng viên của bạn đã được duyệt. Bạn có thể bắt đầu tạo khóa học ngay bây giờ.'
  );

  return request;
};

const rejectTeacherRequest = async (requestId) => {
  const request = await teacherrequests.findByPk(requestId, {
    include: [{ model: users, as: 'user' }],
  });

  if (!request) {
    throw new Error('Không tìm thấy yêu cầu');
  }

  if (request.status !== 'Pending') {
    throw new Error('Yêu cầu này đã được xử lý');
  }

  await request.update({
    status: 'Rejected',
    reviewedat: new Date(),
  });

  // Tạo notification cho user
  const notificationService = require('./notification.service');
  await notificationService.createNotification(
    request.userid,
    'Rất tiếc, yêu cầu trở thành giảng viên của bạn đã bị từ chối. Vui lòng kiểm tra lại thông tin và nộp đơn lại sau.'
  );

  return request;
};

/**
 * Quản lý khóa học
 */
const getAllCoursesForAdmin = async (filters = {}) => {
  const {
    page = 1,
    limit = 10,
    status,
    categoryId,
    search,
    sortBy = 'createdat',
    sortOrder = 'DESC',
  } = filters;

  const offset = (page - 1) * limit;
  const whereCondition = {};

  if (status) {
    whereCondition.status = status;
  }
  if (categoryId) {
    whereCondition.categoryid = categoryId;
  }
  if (search) {
    whereCondition[Op.or] = [
      { coursename: { [Op.iLike]: `%${search}%` } },
      { description: { [Op.iLike]: `%${search}%` } },
    ];
  }

  const { count, rows } = await courses.findAndCountAll({
    where: whereCondition,
    include: [
      {
        model: users,
        as: 'teacher',
        attributes: ['userid', 'fullname', 'profilepicture'],
      },
      {
        model: categories,
        as: 'category',
        attributes: ['categoryid', 'categoryname'],
      },
    ],
    offset,
    limit,
    order: [[sortBy, sortOrder]],
    distinct: true,
  });

  return {
    totalItems: count,
    totalPages: Math.ceil(count / limit),
    currentPage: page,
    courses: rows,
  };
};

const updateCourseStatus = async (courseId, status) => {
  const course = await courses.findByPk(courseId);
  if (!course) {
    throw new Error('Không tìm thấy khóa học');
  }

  await course.update({ status });
  return course;
};

const deleteCourse = async (courseId) => {
  const course = await courses.findByPk(courseId);
  if (!course) {
    throw new Error('Không tìm thấy khóa học');
  }

  await course.destroy();
  return { message: 'Xóa khóa học thành công' };
};

/**
 * Quản lý đơn hàng
 */
const getAllOrders = async (filters = {}) => {
  const {
    page = 1,
    limit = 10,
    status,
    sortBy = 'createdat',
    sortOrder = 'DESC',
  } = filters;

  const offset = (page - 1) * limit;
  const whereCondition = {};

  if (status) {
    whereCondition.status = status;
  }

  const { count, rows } = await orders.findAndCountAll({
    where: whereCondition,
    include: [
      {
        model: users,
        as: 'user',
        attributes: ['userid', 'fullname', 'email'],
      },
    ],
    offset,
    limit,
    order: [[sortBy, sortOrder]],
  });

  // Lấy chi tiết đơn hàng cho mỗi order
  const ordersWithDetails = await Promise.all(
    rows.map(async (order) => {
      const details = await orderdetails.findAll({
        where: { orderid: order.orderid },
        include: [
          {
            model: courses,
            as: 'course',
            attributes: ['courseid', 'coursename', 'price', 'imageurl'],
          },
        ],
      });
      return { ...order.toJSON(), details: details.map(d => d.toJSON()) };
    })
  );

  return {
    totalItems: count,
    totalPages: Math.ceil(count / limit),
    currentPage: page,
    orders: ordersWithDetails,
  };
};

const updateOrderStatus = async (orderId, status) => {
  const order = await orders.findByPk(orderId);
  if (!order) {
    throw new Error('Không tìm thấy đơn hàng');
  }

  await order.update({ status });
  return order;
};

/**
 * Quản lý danh mục
 */
const getAllCategories = async () => {
  return await categories.findAll({
    order: [['categoryname', 'ASC']],
  });
};

const createCategory = async (categoryData) => {
  return await categories.create(categoryData);
};

const updateCategory = async (categoryId, categoryData) => {
  const category = await categories.findByPk(categoryId);
  if (!category) {
    throw new Error('Không tìm thấy danh mục');
  }

  await category.update(categoryData);
  return category;
};

const deleteCategory = async (categoryId) => {
  const category = await categories.findByPk(categoryId);
  if (!category) {
    throw new Error('Không tìm thấy danh mục');
  }

  await category.destroy();
  return { message: 'Xóa danh mục thành công' };
};

/**
 * Quản lý đánh giá
 */
const getAllReviews = async (filters = {}) => {
  const {
    page = 1,
    limit = 10,
    sortBy = 'createdat',
    sortOrder = 'DESC',
  } = filters;

  const offset = (page - 1) * limit;

  const { count, rows } = await coursereviews.findAndCountAll({
    include: [
      {
        model: courses,
        as: 'course',
        attributes: ['courseid', 'coursename'],
      },
      {
        model: users,
        as: 'student',
        attributes: ['userid', 'fullname', 'profilepicture'],
      },
    ],
    offset,
    limit,
    order: [[sortBy, sortOrder]],
  });

  return {
    totalItems: count,
    totalPages: Math.ceil(count / limit),
    currentPage: page,
    reviews: rows,
  };
};

const deleteReview = async (reviewId) => {
  const review = await coursereviews.findByPk(reviewId);
  if (!review) {
    throw new Error('Không tìm thấy đánh giá');
  }

  await review.destroy();
  return { message: 'Xóa đánh giá thành công' };
};

module.exports = {
  getDashboardStats,
  getAllUsers,
  updateUserRole,
  deleteUser,
  getAllTeacherRequests,
  approveTeacherRequest,
  rejectTeacherRequest,
  getAllCoursesForAdmin,
  updateCourseStatus,
  deleteCourse,
  getAllOrders,
  updateOrderStatus,
  getAllCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  getAllReviews,
  deleteReview,
};

