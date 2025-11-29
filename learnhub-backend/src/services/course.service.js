// src/services/course.service.js
const { Op } = require("sequelize");
const { courses, users, categories, chapters, lessons, enrollments, lessonprogress, quizzes } = require("../models");
const cloudinary = require("../config/cloudinary.config");
const { Readable } = require("stream");

/**
 * Lấy danh sách tất cả khóa học với tùy chọn lọc và phân trang
 * @param {object} filters - Tùy chọn lọc (ví dụ: page, limit, categoryId, search)
 */
const getAllCourses = async (filters = {}) => {
  const {
    page = 1,
    limit = 10,
    categoryId,
    search,
    sortBy = "createdat",
    sortOrder = "DESC",
  } = filters;

  const offset = (page - 1) * limit;

  // Xây dựng điều kiện WHERE
  const whereCondition = {};
  if (categoryId) {
    whereCondition.categoryid = categoryId;
  }
  if (search) {
    whereCondition[Op.or] = [
      { coursename: { [Op.iLike]: `%${search}%` } },
      { description: { [Op.iLike]: `%${search}%` } },
    ];
  }

  // Truy vấn CSDL
  const { count, rows } = await courses.findAndCountAll({
    where: whereCondition,
    include: [
      {
        model: users,
        as: "teacher", // Alias từ init-models.js
        attributes: ["userid", "fullname", "profilepicture"],
      },
      {
        model: categories,
        as: "category", // Alias từ init-models.js
        attributes: ["categoryid", "categoryname"],
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

/**
 * Lấy chi tiết một khóa học
 * @param {number} courseId
 */
const getCourseDetailsById = async (courseId) => {
  const course = await courses.findByPk(courseId, {
    include: [
      {
        model: users,
        as: "teacher",
        attributes: ["userid", "fullname", "profilepicture"],
      },
      {
        model: categories,
        as: "category",
        attributes: ["categoryid", "categoryname"],
      },
      {
        model: chapters,
        as: "chapters",
        attributes: ["chapterid", "title", "sortorder"],
        separate: true, // Chạy truy vấn này riêng biệt để sắp xếp
        order: [["sortorder", "ASC"]],
        include: [
          {
            model: lessons,
            as: "lessons",
            attributes: ["lessonid", "title", "videourl", "sortorder"],
            separate: true, // Chạy truy vấn này riêng biệt để sắp xếp
            order: [["sortorder", "ASC"]],
          },
        ],
      },
      // Thêm các include khác nếu cần (ví dụ: reviews, enrollments count)
    ],
  });

  if (!course) {
    throw new Error("Không tìm thấy khóa học");
  }
  return course;
};

/**
 * Tạo một khóa học mới
 * @param {object} courseData - Dữ liệu khóa học
 * @param {number} teacherId - ID của giáo viên tạo khóa học
 */
const createCourse = async (courseData, teacherId) => {
  const newCourse = await courses.create({
    ...courseData,
    teacherid: teacherId, // Gán giáo viên cho khóa học
    status: "Pending", // Mặc định khóa học mới cần admin duyệt
  });
  return newCourse;
};

/**
 * Cập nhật một khóa học (chỉ người tạo hoặc Admin)
 * @param {number} courseId
 * @param {object} updateData
 * @param {object} user - Người dùng thực hiện (từ middleware)
 */
const updateCourse = async (courseId, updateData, user) => {
  const course = await courses.findByPk(courseId);
  if (!course) {
    throw new Error("Không tìm thấy khóa học");
  }

  // Kiểm tra quyền: Chỉ Admin hoặc chủ sở hữu khóa học mới được sửa
  if (user.role !== "Admin" && course.teacherid !== user.id) {
    throw new Error("Bạn không có quyền cập nhật khóa học này");
  }

  // Xóa các trường không được phép cập nhật (nếu có)
  delete updateData.teacherid;
  delete updateData.status; // Chỉ Admin mới được đổi status (sẽ làm ở API admin)

  const updatedCourse = await course.update(updateData);
  return updatedCourse;
};

/**
 * Xóa một khóa học (chỉ người tạo hoặc Admin)
 * @param {number} courseId
 * @param {object} user - Người dùng thực hiện (từ middleware)
 */
const deleteCourse = async (courseId, user) => {
  const course = await courses.findByPk(courseId);
  if (!course) {
    throw new Error("Không tìm thấy khóa học");
  }

  // Kiểm tra quyền: Chỉ Admin hoặc chủ sở hữu khóa học mới được xóa
  if (user.role !== "Admin" && course.teacherid !== user.id) {
    throw new Error("Bạn không có quyền xóa khóa học này");
  }

  await course.destroy();
  return { message: "Xóa khóa học thành công" };
};

/**
 * Lấy nội dung khóa học cho học viên (chỉ dành cho học viên đã ghi danh)
 * @param {number} courseId - ID khóa học
 * @param {number} studentId - ID học viên
 */
const getCourseForLearning = async (courseId, studentId) => {
  // 1. Kiểm tra enrollment
  const enrollment = await enrollments.findOne({
    where: {
      studentid: studentId,
      courseid: courseId,
    },
  });

  if (!enrollment) {
    throw new Error('Bạn chưa ghi danh khóa học này.');
  }

  // 2. Lấy thông tin khóa học với chapters và lessons
  const course = await courses.findByPk(courseId, {
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
      {
        model: chapters,
        as: 'chapters',
        separate: true,
        order: [['sortorder', 'ASC']],
        include: [
          {
            model: lessons,
            as: 'lessons',
            separate: true,
            order: [['sortorder', 'ASC']],
            include: [
              {
                model: quizzes,
                as: 'quizzes',
                attributes: ['quizid', 'title', 'timelimit', 'maxattempts'],
                separate: true,
              },
            ],
          },
        ],
      },
    ],
  });

  if (!course) {
    throw new Error('Không tìm thấy khóa học.');
  }

  // 3. Lấy tiến độ học tập
  const completedLessons = await lessonprogress.findAll({
    where: {
      studentid: studentId,
      iscompleted: true,
    },
    attributes: ['lessonid'],
    include: {
      model: lessons,
      as: 'lesson',
      where: { courseid: courseId },
      attributes: [],
    },
  });

  const completedLessonIds = completedLessons.map((item) => item.lessonid);

  // 4. Tính tiến độ tổng thể
  const totalLessons = course.chapters.reduce(
    (total, chapter) => total + (chapter.lessons?.length || 0),
    0
  );
  const completedCount = completedLessonIds.length;
  const progressPercentage =
    totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

  // 5. Kiểm tra course completion status
  const { coursecompletions } = require('../models');
  const courseCompletion = await coursecompletions.findOne({
    where: {
      studentid: studentId,
      courseid: courseId,
    },
    attributes: ['completionid', 'completedat'],
  });

  // 6. Chuyển đổi sang plain object và thêm thông tin tiến độ
  const courseData = course.toJSON ? course.toJSON() : course;
  
  // Thêm thông tin completed vào mỗi lesson
  if (courseData.chapters) {
    courseData.chapters = courseData.chapters.map((chapter) => {
      if (chapter.lessons) {
        chapter.lessons = chapter.lessons.map((lesson) => ({
          ...lesson,
          isCompleted: completedLessonIds.includes(lesson.lessonid),
        }));
      }
      return chapter;
    });
  }

  return {
    ...courseData,
    progress: {
      completedLessons: completedCount,
      totalLessons: totalLessons,
      percentage: progressPercentage,
      completedLessonIds: completedLessonIds,
    },
    isCourseCompleted: !!courseCompletion,
    completedAt: courseCompletion?.completedat || null,
  };
};

/**
 * Upload ảnh lên Cloudinary
 * @param {Buffer} fileBuffer - Buffer của file ảnh
 * @param {string} folder - Thư mục trên Cloudinary (ví dụ: 'courses')
 * @returns {Promise<string>} - URL của ảnh trên Cloudinary
 */
const uploadImageToCloudinary = async (fileBuffer, folder = 'courses') => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: folder,
        resource_type: 'image',
        transformation: [
          { width: 1200, height: 675, crop: 'fill', quality: 'auto' }, // Tối ưu kích thước
        ],
      },
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result.secure_url); // Trả về URL an toàn (HTTPS)
        }
      }
    );

    // Chuyển buffer thành stream để upload
    const stream = Readable.from(fileBuffer);
    stream.pipe(uploadStream);
  });
};

/**
 * Upload ảnh cho khóa học và cập nhật database
 * @param {number} courseId - ID khóa học
 * @param {Buffer} fileBuffer - Buffer của file ảnh
 * @param {object} user - Người dùng thực hiện (từ middleware)
 * @returns {Promise<object>} - Khóa học đã được cập nhật
 */
const uploadCourseImage = async (courseId, fileBuffer, user) => {
  // 1. Kiểm tra khóa học tồn tại
  const course = await courses.findByPk(courseId);
  if (!course) {
    throw new Error("Không tìm thấy khóa học");
  }

  // 2. Kiểm tra quyền: Chỉ Admin hoặc chủ sở hữu khóa học mới được upload
  if (user.role !== "Admin" && course.teacherid !== user.id) {
    throw new Error("Bạn không có quyền upload ảnh cho khóa học này");
  }

  // 3. Xóa ảnh cũ trên Cloudinary nếu có (optional - có thể bỏ qua để tiết kiệm API calls)
  // Cloudinary có thể tự động quản lý storage

  // 4. Upload ảnh mới lên Cloudinary
  const imageUrl = await uploadImageToCloudinary(fileBuffer, 'courses');

  // 5. Cập nhật imageurl trong database
  await course.update({ imageurl: imageUrl });

  // 6. Trả về khóa học đã cập nhật
  return course;
};

module.exports = {
  getAllCourses,
  getCourseDetailsById,
  createCourse,
  updateCourse,
  deleteCourse,
  getCourseForLearning,
  uploadCourseImage,
};
