// src/services/teacher.service.js
const { Op } = require('sequelize');
const {
  courses,
  users,
  categories,
  chapters,
  lessons,
  enrollments,
  assignments,
  submissions,
  quizzes,
  quizsessions,
  coursereviews,
  orderdetails,
  orders,
  coursecompletions,
} = require('../models');

/**
 * Lấy thống kê tổng quan cho teacher dashboard
 */
const getDashboardStats = async (teacherId) => {
  const [
    totalCourses,
    approvedCourses,
    pendingCourses,
    totalStudents,
    totalSubmissions,
    pendingSubmissions,
    averageRating,
  ] = await Promise.all([
    courses.count({ where: { teacherid: teacherId } }),
    courses.count({ where: { teacherid: teacherId, status: 'Approved' } }),
    courses.count({ where: { teacherid: teacherId, status: 'Pending' } }),
    // Đếm số học viên duy nhất đã đăng ký khóa học của teacher
    enrollments.count({
      include: [
        {
          model: courses,
          as: 'course',
          where: { teacherid: teacherId },
          attributes: [],
        },
      ],
      distinct: true,
    }),
    submissions.count({
      include: [
        {
          model: assignments,
          as: 'assignment',
          include: [
            {
              model: courses,
              as: 'course',
              where: { teacherid: teacherId },
              attributes: [],
            },
          ],
          attributes: [],
        },
      ],
    }),
    submissions.count({
      where: { grade: null },
      include: [
        {
          model: assignments,
          as: 'assignment',
          include: [
            {
              model: courses,
              as: 'course',
              where: { teacherid: teacherId },
              attributes: [],
            },
          ],
          attributes: [],
        },
      ],
    }),
    // Tính rating trung bình
    coursereviews.findOne({
      attributes: [
        [
          require('sequelize').fn('AVG', require('sequelize').col('rating')),
          'avgRating',
        ],
      ],
      include: [
        {
          model: courses,
          as: 'course',
          where: { teacherid: teacherId },
          attributes: [],
        },
      ],
      raw: true,
    }),
  ]);

  // Tính doanh thu riêng
  const orderDetails = await orderdetails.findAll({
    include: [
      {
        model: courses,
        as: 'course',
        where: { teacherid: teacherId },
        attributes: [],
      },
      {
        model: orders,
        as: 'order',
        where: { status: 'Completed' },
        attributes: [],
      },
    ],
    attributes: ['price'],
    raw: true,
  });
  const totalRevenue = orderDetails.reduce((sum, item) => sum + (parseFloat(item.price) || 0), 0);

  return {
    totalCourses,
    approvedCourses,
    pendingCourses,
    totalStudents,
    totalSubmissions,
    pendingSubmissions,
    totalRevenue: totalRevenue || 0,
    averageRating: averageRating?.avgRating
      ? parseFloat(averageRating.avgRating).toFixed(1)
      : '0',
  };
};

/**
 * Lấy danh sách khóa học của teacher
 */
const getMyCourses = async (teacherId, filters = {}) => {
  const {
    page = 1,
    limit = 10,
    status,
    search,
    sortBy = 'createdat',
    sortOrder = 'DESC',
  } = filters;

  const offset = (page - 1) * limit;
  const whereCondition = { teacherid: teacherId };

  if (status) {
    whereCondition.status = status;
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
        model: categories,
        as: 'category',
        attributes: ['categoryid', 'categoryname'],
      },
    ],
    offset,
    limit,
    order: [[sortBy, sortOrder]],
  });

  // Lấy thêm số học viên đã đăng ký cho mỗi khóa học
  const coursesWithStats = await Promise.all(
    rows.map(async (course) => {
      const enrollmentCount = await enrollments.count({
        where: { courseid: course.courseid },
      });
      const reviewCount = await coursereviews.count({
        where: { courseid: course.courseid },
      });
      const avgRating = await coursereviews.findOne({
        attributes: [
          [
            require('sequelize').fn('AVG', require('sequelize').col('rating')),
            'avgRating',
          ],
        ],
        where: { courseid: course.courseid },
        raw: true,
      });

      return {
        ...course.toJSON(),
        enrollmentCount,
        reviewCount,
        averageRating: avgRating?.avgRating
          ? parseFloat(avgRating.avgRating).toFixed(1)
          : 0,
      };
    })
  );

  return {
    totalItems: count,
    totalPages: Math.ceil(count / limit),
    currentPage: page,
    courses: coursesWithStats,
  };
};

/**
 * Lấy danh sách học viên đã đăng ký khóa học của teacher
 */
const getMyStudents = async (teacherId, filters = {}) => {
  const {
    page = 1,
    limit = 10,
    courseId,
    search,
    sortBy = 'enrolledat',
    sortOrder = 'DESC',
  } = filters;

  const offset = (page - 1) * limit;

  const whereCondition = {};
  if (courseId) {
    whereCondition.courseid = courseId;
  }

  const { count, rows } = await enrollments.findAndCountAll({
    where: whereCondition,
    include: [
      {
        model: courses,
        as: 'course',
        where: { teacherid: teacherId },
        attributes: ['courseid', 'coursename'],
      },
      {
        model: users,
        as: 'student',
        attributes: ['userid', 'fullname', 'email', 'profilepicture'],
        ...(search && {
          where: {
            [Op.or]: [
              { fullname: { [Op.iLike]: `%${search}%` } },
              { email: { [Op.iLike]: `%${search}%` } },
            ],
          },
        }),
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
    students: rows,
  };
};

/**
 * Lấy danh sách submissions cần chấm
 */
const getPendingSubmissions = async (teacherId, filters = {}) => {
  const {
    page = 1,
    limit = 10,
    courseId,
    assignmentId,
    sortBy = 'submittedat',
    sortOrder = 'DESC',
  } = filters;

  const offset = (page - 1) * limit;

  const whereCondition = { grade: null };
  if (assignmentId) {
    whereCondition.assignmentid = assignmentId;
  }

  const { count, rows } = await submissions.findAndCountAll({
    where: whereCondition,
    include: [
      {
        model: assignments,
        as: 'assignment',
        include: [
          {
            model: courses,
            as: 'course',
            where: { teacherid: teacherId },
            ...(courseId && { where: { teacherid: teacherId, courseid: courseId } }),
            attributes: ['courseid', 'coursename'],
          },
        ],
        attributes: ['assignmentid', 'title', 'duedate'],
      },
      {
        model: users,
        as: 'student',
        attributes: ['userid', 'fullname', 'email'],
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
    submissions: rows,
  };
};

/**
 * Chấm điểm cho submission
 */
const gradeSubmission = async (submissionId, teacherId, gradeData) => {
  const submission = await submissions.findByPk(submissionId, {
    include: [
      {
        model: assignments,
        as: 'assignment',
        include: [
          {
            model: courses,
            as: 'course',
            attributes: ['courseid', 'teacherid'],
          },
        ],
      },
    ],
  });

  if (!submission) {
    throw new Error('Không tìm thấy submission');
  }

  // Kiểm tra quyền: chỉ teacher sở hữu khóa học mới được chấm
  if (submission.assignment.course.teacherid !== teacherId) {
    throw new Error('Bạn không có quyền chấm bài này');
  }

  await submission.update({
    grade: gradeData.grade,
    feedback: gradeData.feedback || null,
  });

  return submission;
};

/**
 * Lấy thống kê chi tiết cho một khóa học
 */
const getCourseAnalytics = async (courseId, teacherId) => {
  // Kiểm tra quyền sở hữu
  const course = await courses.findByPk(courseId);
  if (!course) {
    throw new Error('Không tìm thấy khóa học');
  }
  if (course.teacherid !== teacherId) {
    throw new Error('Bạn không có quyền xem thống kê khóa học này');
  }

  const [
    enrollmentCount,
    completionCount,
    assignmentCount,
    submissionCount,
    avgRating,
    reviews,
  ] = await Promise.all([
    enrollments.count({ where: { courseid: courseId } }),
    coursecompletions.count({
      where: { courseid: courseId },
    }),
    assignments.count({ where: { courseid: courseId } }),
    submissions.count({
      include: [
        {
          model: assignments,
          as: 'assignment',
          where: { courseid: courseId },
          attributes: [],
        },
      ],
    }),
    coursereviews.findOne({
      attributes: [
        [
          require('sequelize').fn('AVG', require('sequelize').col('rating')),
          'avgRating',
        ],
      ],
      where: { courseid: courseId },
      raw: true,
    }),
    coursereviews.findAll({
      where: { courseid: courseId },
      include: [
        {
          model: users,
          as: 'student',
          attributes: ['userid', 'fullname', 'profilepicture'],
        },
      ],
      order: [['createdat', 'DESC']],
      limit: 10,
    }),
  ]);

  // Tính doanh thu riêng - sử dụng cách đơn giản hơn
  let revenue = 0;
  try {
    const orderDetails = await orderdetails.findAll({
      where: {
        courseid: courseId,
      },
      include: [
        {
          model: orders,
          as: 'order',
          where: { status: 'Completed' },
          attributes: [],
          required: true,
        },
      ],
      attributes: ['price'],
      raw: true,
    });
    revenue = orderDetails.reduce((sum, item) => sum + (parseFloat(item.price) || 0), 0);
  } catch (error) {
    console.error('Error calculating revenue:', error);
    revenue = 0;
  }

  return {
    enrollmentCount,
    completionCount,
    completionRate: enrollmentCount > 0 ? ((completionCount / enrollmentCount) * 100).toFixed(1) : 0,
    assignmentCount,
    submissionCount,
    averageRating: avgRating?.avgRating
      ? parseFloat(avgRating.avgRating).toFixed(1)
      : '0',
    reviews: Array.isArray(reviews) ? reviews.map((r) => (r.toJSON ? r.toJSON() : r)) : [],
    revenue: revenue || 0,
  };
};

/**
 * Lấy doanh thu theo thời gian
 */
const getRevenueByTime = async (teacherId, period = 'month') => {
  // Lấy doanh thu từ orderdetails có chứa khóa học của teacher
  const revenueData = await orderdetails.findAll({
    attributes: [
      [
        require('sequelize').fn(
          'DATE_TRUNC',
          period === 'month' ? 'month' : 'day',
          require('sequelize').col('order.createdat')
        ),
        'period',
      ],
      [
        require('sequelize').fn('SUM', require('sequelize').col('orderdetails.price')),
        'total',
      ],
    ],
    include: [
      {
        model: courses,
        as: 'course',
        where: { teacherid: teacherId },
        attributes: [],
      },
      {
        model: orders,
        as: 'order',
        where: { status: 'Completed' },
        attributes: [],
      },
    ],
    group: ['period'],
    order: [['period', 'ASC']],
    raw: true,
  });

  return revenueData;
};

module.exports = {
  getDashboardStats,
  getMyCourses,
  getMyStudents,
  getPendingSubmissions,
  gradeSubmission,
  getCourseAnalytics,
  getRevenueByTime,
};

