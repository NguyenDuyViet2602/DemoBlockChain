// src/controllers/forum.controller.js
const forumService = require('../services/forum.service');

// [POST] /api/v1/forums/discussions
const handleCreateDiscussion = async (req, res, next) => {
  try {
    const studentId = req.user.id;
    const { courseId, title } = req.body;
    if (!courseId || !title) {
      return res.status(400).json({ message: 'Vui lòng cung cấp courseId và title.' });
    }
    const newData = await forumService.createDiscussion(studentId, Number(courseId), title);
    res.status(201).json({ message: 'Tạo chủ đề thảo luận thành công.', data: newData });
  } catch (error) {
    if (error.message.includes('ghi danh')) {
      return res.status(403).json({ message: error.message });
    }
    next(error);
  }
};

// [POST] /api/v1/forums/replies
const handleCreateReply = async (req, res, next) => {
  try {
    const studentId = req.user.id;
    const { discussionId, content } = req.body;
    if (!discussionId || !content) {
      return res.status(400).json({ message: 'Vui lòng cung cấp discussionId và content.' });
    }
    const newData = await forumService.createReply(studentId, Number(discussionId), content);
    
    // Reward distribution is handled in forum.service.js
    // Check if reward was successfully distributed by checking rewardsearned table
    let rewardInfo = null;
    try {
      const { rewardsearned } = require('../models');
      const rewardRecord = await rewardsearned.findOne({
        where: {
          userid: studentId,
          activity_type: 'forum',
          activity_id: newData.replyid,
        },
      });
      
      if (rewardRecord) {
        rewardInfo = {
          success: true,
          amount: rewardRecord.amount,
          message: `Bạn đã nhận ${rewardRecord.amount} LHT cho việc tham gia diễn đàn!`,
        };
      }
    } catch (error) {
      // Ignore error, reward might not be distributed yet
      console.warn('Could not check reward status:', error.message);
    }
    
    res.status(201).json({ 
      message: 'Gửi phản hồi thành công.', 
      data: newData,
      reward: rewardInfo
    });
  } catch (error) {
    if (error.message.includes('ghi danh') || error.message.includes('Không tìm thấy')) {
      return res.status(403).json({ message: error.message });
    }
    next(error);
  }
};

// [GET] /api/v1/forums/course/:courseId
const handleGetDiscussions = async (req, res, next) => {
  try {
    const { courseId } = req.params;
    const data = await forumService.getDiscussionsByCourse(Number(courseId));
    res.status(200).json({ message: 'Lấy danh sách chủ đề thành công.', data });
  } catch (error) {
    next(error);
  }
};

// [GET] /api/v1/forums/discussions/:discussionId
const handleGetDiscussionDetails = async (req, res, next) => {
  try {
    const { discussionId } = req.params;
    const data = await forumService.getDiscussionDetails(Number(discussionId));
    res.status(200).json({ message: 'Lấy chi tiết chủ đề thành công.', data });
  } catch (error) {
    if (error.message.includes('Không tìm thấy')) {
      return res.status(404).json({ message: error.message });
    }
    next(error);
  }
};

module.exports = {
  handleCreateDiscussion,
  handleCreateReply,
  handleGetDiscussions,
  handleGetDiscussionDetails,
};