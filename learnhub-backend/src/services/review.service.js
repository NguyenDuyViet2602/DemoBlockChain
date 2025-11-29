// Giả sử bạn đã có model cho 'enrollments'
const { coursereviews, users, enrollments } = require('../models');

/**
 * Tạo một đánh giá mới cho khóa học.
 */
const createReview = async (studentId, courseId, rating, comment) => {
  // 1. Kiểm tra xem học viên đã đăng ký khóa học này chưa
  const enrollment = await enrollments.findOne({
    where: {
      studentid: studentId,
      courseid: courseId
    }
  });

  if (!enrollment) {
    throw new Error('Bạn phải đăng ký khóa học trước khi có thể đánh giá.');
  }

  // 2. Kiểm tra xem học viên đã đánh giá khóa học này chưa
  const existingReview = await coursereviews.findOne({
    where: {
      studentid: studentId,
      courseid: courseId
    }
  });

  if (existingReview) {
      throw new Error('Bạn đã đánh giá khóa học này rồi.');
  }

  // 3. Tạo đánh giá mới
  const newReview = await coursereviews.create({
    studentid: studentId,
    courseid: courseId,
    rating,
    comment,
  });

  // 4. Distribute reward for review (5 LHT)
  try {
    const rewardService = require('./reward.service');
    await rewardService.distributeReviewReward(studentId, newReview.reviewid);
    console.log(`✅ Review reward distributed: 5 LHT to user ${studentId} for review #${newReview.reviewid}`);
  } catch (error) {
    // Log error but don't fail review creation
    console.warn('⚠️  Could not distribute review reward:', error.message);
  }

  return newReview;
};

/**
 * Lấy tất cả đánh giá của một khóa học.
 */
const getReviewsByCourseId = async (courseId) => {
  return await coursereviews.findAll({
    where: { courseid: courseId },
    include: [{
      model: users,
      as: 'student', // Phải khớp với alias trong init-models.js
      attributes: ['fullname', 'profilepicture'], // Chỉ lấy thông tin cần thiết của người dùng
    }],
    order: [['createdat', 'DESC']],
  });
};

module.exports = {
  createReview,
  getReviewsByCourseId,
};