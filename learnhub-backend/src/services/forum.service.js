// src/services/forum.service.js
const { forumdiscussions, forumreplies, users, enrollments } = require('../models');

/**
 * HÀM NỘI BỘ: Kiểm tra xem user có phải là học viên đã ghi danh không
 */
const checkEnrollment = async (courseId, studentId) => {
  const enrollment = await enrollments.findOne({
    where: {
      courseid: courseId,
      studentid: studentId,
    },
  });
  if (!enrollment) {
    throw new Error('Bạn phải ghi danh vào khóa học để tham gia diễn đàn.');
  }
  return enrollment;
};

/**
 * (Học viên) Tạo một chủ đề thảo luận mới
 * @param {number} studentId
 * @param {number} courseId
 * @param {string} title
 */
const createDiscussion = async (studentId, courseId, title) => {
  // 1. Kiểm tra quyền ghi danh
  await checkEnrollment(courseId, studentId);

  // 2. Tạo chủ đề
  const newDiscussion = await forumdiscussions.create({
    courseid: courseId,
    title: title,
    createdby: studentId,
  });
  return newDiscussion;
};

/**
 * (Học viên) Tạo một phản hồi (reply) cho chủ đề
 * @param {number} studentId
 * @param {number} discussionId
 * @param {string} content
 */
const createReply = async (studentId, discussionId, content) => {
  // 1. Lấy thông tin chủ đề để biết courseId
  const discussion = await forumdiscussions.findByPk(discussionId);
  if (!discussion) {
    throw new Error('Không tìm thấy chủ đề thảo luận.');
  }

  // 2. Kiểm tra quyền ghi danh
  await checkEnrollment(discussion.courseid, studentId);

  // 3. Tạo phản hồi
  const newReply = await forumreplies.create({
    discussionid: discussionId,
    userid: studentId,
    content: content,
  });

  // 4. Distribute reward for forum reply (3 LHT) - only first time
  try {
    const rewardService = require('./reward.service');
    const rewardResult = await rewardService.distributeForumReward(studentId, newReply.replyid);
    if (rewardResult.success) {
      console.log(`✅ Forum reward distributed: ${rewardResult.amount} LHT to user ${studentId} for reply #${newReply.replyid}`);
    } else {
      console.log(`ℹ️  Forum reward not distributed: ${rewardResult.message}`);
    }
  } catch (error) {
    // Log error but don't fail reply creation
    console.warn('⚠️  Could not distribute forum reward:', error.message);
  }

  return newReply;
};

/**
 * Lấy danh sách các chủ đề thảo luận của một khóa học
 * @param {number} courseId
 */
const getDiscussionsByCourse = async (courseId) => {
  return await forumdiscussions.findAll({
    where: { courseid: courseId },
    include: {
      model: users,
      as: 'createdby_user', // Alias từ init-models.js
      attributes: ['userid', 'fullname', 'profilepicture'],
    },
    order: [['createdat', 'DESC']],
  });
};

/**
 * Lấy chi tiết một chủ đề (gồm tất cả các phản hồi)
 * @param {number} discussionId
 */
const getDiscussionDetails = async (discussionId) => {
  const discussion = await forumdiscussions.findByPk(discussionId, {
    include: {
      model: users,
      as: 'createdby_user',
      attributes: ['userid', 'fullname', 'profilepicture'],
    },
  });

  if (!discussion) {
    throw new Error('Không tìm thấy chủ đề thảo luận.');
  }

  const replies = await forumreplies.findAll({
    where: { discussionid: discussionId },
    include: {
      model: users,
      as: 'user', // Alias từ init-models.js
      attributes: ['userid', 'fullname', 'profilepicture'],
    },
    order: [['createdat', 'ASC']], // Hiển thị phản hồi cũ nhất trước
  });

  return { discussion, replies };
};

module.exports = {
  createDiscussion,
  createReply,
  getDiscussionsByCourse,
  getDiscussionDetails,
};