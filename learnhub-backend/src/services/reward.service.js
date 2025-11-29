// src/services/reward.service.js
const blockchainService = require('./blockchain.service');
const {
  rewardsearned,
  tokentransactions,
  users,
  sequelize,
} = require('../models');

/**
 * Calculate reward amount based on activity type and parameters
 */
const calculateReward = (activityType, params = {}) => {
  const { score, difficulty, coursePrice, courseLevel, streakDays } = params;

  switch (activityType) {
    case 'lesson':
      return 10; // Base 10 LHT

    case 'quiz':
      if (!score || score < 70) return 0;
      // Score 70-100% = 10-50 LHT
      const baseReward = 10;
      const scoreMultiplier = score / 100;
      const difficultyMultiplier = {
        'Easy': 1.0,
        'Medium': 1.5,
        'Hard': 2.0,
      }[difficulty] || 1.0;
      
      let reward = baseReward * scoreMultiplier * difficultyMultiplier;
      return Math.min(reward, 50); // Cap at 50 LHT

    case 'assignment':
      return 50; // Base 50 LHT

    case 'course':
      const courseBaseReward = 200; // 200 LHT base
      const priceMultiplier = coursePrice ? Math.min(coursePrice / 1000000, 2.0) : 1.0;
      const levelMultiplier = {
        'Beginner': 1.0,
        'Intermediate': 1.3,
        'Advanced': 1.6,
      }[courseLevel] || 1.0;
      
      return courseBaseReward * priceMultiplier * levelMultiplier;

    case 'review':
      return 5; // 5 LHT

    case 'forum':
      return 3; // 3 LHT

    case 'streak':
      if (!streakDays || streakDays < 1) return 0;
      // Ngày đầu: 20 LHT, mỗi ngày tiếp theo: +10 LHT
      // Day 1 = 20 LHT, Day 2 = 30 LHT, Day 3 = 40 LHT, ...
      if (streakDays === 1) {
        return 20; // Ngày đầu tiên
      } else {
        return 20 + (streakDays - 1) * 10; // 20 + (n-1)*10
      }

    default:
      return 0;
  }
};

/**
 * Distribute reward for lesson completion
 */
const distributeLessonReward = async (userId, lessonId) => {
  try {
    // Check if reward already distributed
    const existing = await rewardsearned.findOne({
      where: {
        userid: userId,
        activity_type: 'lesson',
        activity_id: lessonId,
      },
    });

    if (existing) {
      throw new Error(`Reward already distributed for lesson #${lessonId}. Each lesson can only be rewarded once.`);
    }

    // Distribute via blockchain
    const result = await blockchainService.distributeLessonReward(userId, lessonId);
    
    return {
      success: true,
      txHash: result.txHash,
      amount: result.amount,
      message: `Bạn đã nhận ${result.amount} LHT cho việc hoàn thành bài học!`,
    };
  } catch (error) {
    console.error('Error in distributeLessonReward:', error);
    throw error;
  }
};

/**
 * Distribute reward for quiz completion
 */
const distributeQuizReward = async (userId, quizId, score) => {
  try {
    if (score < 70) {
      return {
        success: false,
        message: 'Điểm số quá thấp để nhận reward (cần >= 70%)',
      };
    }

    // Check if reward already distributed
    const existing = await rewardsearned.findOne({
      where: {
        userid: userId,
        activity_type: 'quiz',
        activity_id: quizId,
      },
    });

    if (existing) {
      throw new Error('Reward already distributed for this quiz');
    }

    // Distribute via blockchain
    const result = await blockchainService.distributeQuizReward(userId, quizId, score);
    
    return {
      success: true,
      txHash: result.txHash,
      amount: result.amount,
      message: `Bạn đạt ${score}% và nhận ${result.amount} LHT!`,
    };
  } catch (error) {
    console.error('Error in distributeQuizReward:', error);
    throw error;
  }
};

/**
 * Distribute reward for course completion
 */
const distributeCourseReward = async (userId, courseId) => {
  try {
    // Check if reward already distributed
    const existing = await rewardsearned.findOne({
      where: {
        userid: userId,
        activity_type: 'course',
        activity_id: courseId,
      },
    });

    if (existing) {
      throw new Error('Reward already distributed for this course');
    }

    // Distribute via blockchain
    const result = await blockchainService.distributeCourseReward(userId, courseId);
    
    return {
      success: true,
      txHash: result.txHash,
      amount: result.amount,
      message: `Chúc mừng! Bạn đã hoàn thành khóa học và nhận ${result.amount} LHT!`,
    };
  } catch (error) {
    console.error('Error in distributeCourseReward:', error);
    throw error;
  }
};

/**
 * Get user's reward statistics
 */
const getUserRewardStats = async (userId) => {
  try {
    // Get total rewards earned
    const totalRewards = await rewardsearned.findAll({
      where: { userid: userId },
      attributes: [
        [sequelize.fn('SUM', sequelize.col('amount')), 'total'],
      ],
      raw: true,
    });

    const total = totalRewards[0]?.total || 0;

    // Get rewards by activity type
    const rewardsByType = await rewardsearned.findAll({
      where: { userid: userId },
      attributes: [
        'activity_type',
        [sequelize.fn('SUM', sequelize.col('amount')), 'total'],
        [sequelize.fn('COUNT', sequelize.col('rewardid')), 'count'],
      ],
      group: ['activity_type'],
      raw: true,
    });

    // Get current token balance
    let balance = '0';
    try {
      balance = await blockchainService.getTokenBalance(userId);
    } catch (error) {
      console.warn('Could not get token balance:', error.message);
    }

    return {
      totalEarned: parseFloat(total),
      currentBalance: parseFloat(balance),
      rewardsByType: rewardsByType.map(r => ({
        type: r.activity_type,
        total: parseFloat(r.total),
        count: parseInt(r.count),
      })),
    };
  } catch (error) {
    console.error('Error in getUserRewardStats:', error);
    throw error;
  }
};

/**
 * Get user's reward history
 */
const getUserRewardHistory = async (userId, limit = 50) => {
  const rewards = await rewardsearned.findAll({
    where: { userid: userId },
    include: [
      {
        model: tokentransactions,
        as: 'transaction',
        attributes: ['txhash', 'block_number', 'createdat'],
      },
    ],
    order: [['earnedat', 'DESC']],
    limit: limit,
  });

  return rewards;
};

/**
 * Distribute reward for review submission
 */
const distributeReviewReward = async (userId, reviewId) => {
  try {
    // Check if reward already distributed in database
    const existing = await rewardsearned.findOne({
      where: {
        userid: userId,
        activity_type: 'review',
        activity_id: reviewId,
      },
    });

    if (existing) {
      // Already distributed, return existing reward info
      return {
        success: true,
        amount: existing.amount,
        message: `Reward đã được phân phối: ${existing.amount} LHT`,
      };
    }

    // Check blockchain contract if already claimed
    try {
      const blockchainService = require('./blockchain.service');
      const address = await blockchainService.getUserWalletAddress(userId);
      
      if (blockchainService.rewardDistributionContract) {
        const isClaimed = await blockchainService.rewardDistributionContract.isRewardClaimed(
          address,
          'review',
          reviewId
        );

        if (isClaimed) {
          // Already claimed on blockchain, skip distribution
          console.log(`⚠️  Review #${reviewId} reward already claimed on blockchain`);
          return {
            success: false,
            message: 'Reward đã được claim trước đó',
          };
        }
      }
    } catch (blockchainError) {
      // If wallet not connected or other blockchain error, still try to distribute
      console.warn('Blockchain check warning:', blockchainError.message);
    }

    // Distribute via blockchain
    const result = await blockchainService.distributeReviewReward(userId, reviewId);
    
    return {
      success: true,
      txHash: result.txHash,
      amount: result.amount,
      message: `Bạn đã nhận ${result.amount} LHT cho việc đánh giá khóa học!`,
    };
  } catch (error) {
    console.error('Error in distributeReviewReward:', error);
    // Don't throw error, just return failure info
    return {
      success: false,
      message: error.message.includes('not connected wallet') 
        ? 'Vui lòng connect wallet để nhận reward'
        : error.message,
    };
  }
};

/**
 * Distribute reward for forum participation
 */
const distributeForumReward = async (userId, forumId) => {
  try {
    // Check if reward already distributed in database
    const existing = await rewardsearned.findOne({
      where: {
        userid: userId,
        activity_type: 'forum',
        activity_id: forumId,
      },
    });

    if (existing) {
      // Already distributed, return existing reward info
      return {
        success: true,
        amount: existing.amount,
        message: `Reward đã được phân phối: ${existing.amount} LHT`,
      };
    }

    // Distribute via blockchain (blockchain service will check if already claimed)
    const result = await blockchainService.distributeForumReward(userId, forumId);
    
    return {
      success: true,
      txHash: result.txHash,
      amount: result.amount,
      message: `Bạn đã nhận ${result.amount} LHT cho việc tham gia diễn đàn!`,
    };
  } catch (error) {
    console.error('Error in distributeForumReward:', error);
    // Don't throw error, just return failure info
    return {
      success: false,
      message: error.message.includes('not connected wallet') || error.message.includes('not found') || error.message.includes('has not connected')
        ? 'Vui lòng connect wallet để nhận reward'
        : error.message.includes('already claimed') || error.message.includes('already distributed')
        ? 'Reward đã được claim trước đó'
        : error.message,
    };
  }
};

/**
 * Distribute reward for login streak
 */
const distributeStreakReward = async (userId, streakDays) => {
  try {
    if (!streakDays || streakDays < 1) {
      return {
        success: false,
        message: 'Streak phải ít nhất 1 ngày',
      };
    }

    // Check if reward already distributed for this streak day
    const existing = await rewardsearned.findOne({
      where: {
        userid: userId,
        activity_type: 'streak',
        activity_id: streakDays,
      },
    });

    if (existing) {
      throw new Error(`Reward already distributed for ${streakDays} day streak`);
    }

    // Distribute via blockchain
    const result = await blockchainService.distributeStreakReward(userId, streakDays);
    
    return {
      success: true,
      txHash: result.txHash,
      amount: result.amount,
      message: `Chúc mừng! Bạn đã đăng nhập ${streakDays} ngày liên tiếp và nhận ${result.amount} LHT!`,
    };
  } catch (error) {
    console.error('Error in distributeStreakReward:', error);
    
    // Provide user-friendly error messages
    if (error.message && error.message.includes('Streak too short')) {
      throw new Error('Streak quá ngắn. Smart contract yêu cầu streak tối thiểu 7 ngày. Vui lòng đăng nhập thêm vài ngày nữa để nhận reward.');
    }
    if (error.message && error.message.includes('Streak must be at least')) {
      throw new Error('Streak phải ít nhất 1 ngày');
    }
    if (error.message && error.message.includes('already')) {
      throw error; // Already handled
    }
    
    throw error;
  }
};

module.exports = {
  calculateReward,
  distributeLessonReward,
  distributeQuizReward,
  distributeCourseReward,
  distributeReviewReward,
  distributeForumReward,
  distributeStreakReward,
  getUserRewardStats,
  getUserRewardHistory,
};

