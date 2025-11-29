const reviewService = require('../services/review.service');

const reviewController = {
  // [POST] /api/v1/reviews/:courseId
  createReview: async (req, res) => {
    try {
      const studentId = req.user.id; // Lấy từ auth middleware
      const { courseId } = req.params;
      const { rating, comment } = req.body;

      if (!rating) {
        return res.status(400).json({ message: 'Vui lòng cung cấp xếp hạng (rating).' });
      }

      const newReview = await reviewService.createReview(studentId, Number(courseId), rating, comment);
      
      // Reward distribution is handled in review.service.js
      // Check if reward was successfully distributed by checking rewardsearned table
      let rewardInfo = null;
      try {
        const { rewardsearned } = require('../models');
        const rewardRecord = await rewardsearned.findOne({
          where: {
            userid: studentId,
            activity_type: 'review',
            activity_id: newReview.reviewid,
          },
        });
        
        if (rewardRecord) {
          rewardInfo = {
            success: true,
            amount: rewardRecord.amount,
            message: `Bạn đã nhận ${rewardRecord.amount} LHT cho việc đánh giá khóa học!`,
          };
        }
      } catch (error) {
        // Ignore error, reward might not be distributed yet
        console.warn('Could not check reward status:', error.message);
      }
      
      res.status(201).json({
        message: 'Cảm ơn bạn đã gửi đánh giá!',
        data: newReview,
        reward: rewardInfo
      });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  // [GET] /api/v1/reviews/:courseId
  getCourseReviews: async (req, res) => {
    try {
      const { courseId } = req.params;
      const reviews = await reviewService.getReviewsByCourseId(Number(courseId));
      res.status(200).json({
        message: 'Lấy danh sách đánh giá thành công!',
        data: reviews
      });
    } catch (error) {
      res.status(500).json({ message: 'Lỗi hệ thống khi lấy đánh giá.' });
    }
  }
};

module.exports = reviewController;