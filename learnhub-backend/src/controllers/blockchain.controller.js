// src/controllers/blockchain.controller.js
const blockchainService = require('../services/blockchain.service');
const rewardService = require('../services/reward.service');

/**
 * POST /api/v1/blockchain/connect-wallet
 * Connect wallet address to user account
 */
exports.connectWallet = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { address, network } = req.body;

    if (!address) {
      return res.status(400).json({
        success: false,
        message: 'Wallet address is required',
      });
    }

    const wallet = await blockchainService.connectWallet(userId, address, network || 'polygon');

    res.json({
      success: true,
      message: 'Wallet connected successfully',
      data: wallet,
    });
  } catch (error) {
    if (error.message.includes('Invalid wallet address')) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
    if (error.message.includes('already connected')) {
      return res.status(409).json({
        success: false,
        message: error.message,
      });
    }
    next(error);
  }
};

/**
 * GET /api/v1/blockchain/wallet
 * Get user's wallet address
 */
exports.getWalletAddress = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const address = await blockchainService.getUserWalletAddress(userId);

    res.json({
      success: true,
      data: {
        address: address,
      },
    });
  } catch (error) {
    if (error.message.includes('not connected wallet')) {
      return res.status(400).json({
        success: false,
        message: 'Please connect your wallet first',
      });
    }
    next(error);
  }
};

/**
 * GET /api/v1/blockchain/balance
 * Get user's token balance
 */
exports.getTokenBalance = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const balance = await blockchainService.getTokenBalance(userId);

    res.json({
      success: true,
      data: {
        balance: balance,
        symbol: 'LHT',
      },
    });
  } catch (error) {
    if (error.message.includes('not connected wallet')) {
      return res.status(400).json({
        success: false,
        message: 'Please connect your wallet first',
      });
    }
    next(error);
  }
};

/**
 * GET /api/v1/blockchain/rewards/stats
 * Get user's reward statistics
 */
exports.getRewardStats = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const stats = await rewardService.getUserRewardStats(userId);

    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/blockchain/rewards/history
 * Get user's reward history
 */
exports.getRewardHistory = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const limit = parseInt(req.query.limit) || 50;
    const history = await rewardService.getUserRewardHistory(userId, limit);

    res.json({
      success: true,
      data: history,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/blockchain/transactions
 * Get user's transaction history
 */
exports.getTransactionHistory = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const limit = parseInt(req.query.limit) || 50;
    const transactions = await blockchainService.getTransactionHistory(userId, limit);

    res.json({
      success: true,
      data: transactions,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/v1/blockchain/rewards/lesson
 * Distribute reward for lesson completion (called internally)
 */
exports.distributeLessonReward = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { lessonId } = req.body;

    if (!lessonId) {
      return res.status(400).json({
        success: false,
        message: 'Lesson ID is required',
      });
    }

    const result = await rewardService.distributeLessonReward(userId, lessonId);

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    if (error.message.includes('already')) {
      return res.status(409).json({
        success: false,
        message: error.message,
      });
    }
    if (error.message.includes('not connected wallet')) {
      return res.status(400).json({
        success: false,
        message: 'Please connect your wallet first',
      });
    }
    next(error);
  }
};

/**
 * POST /api/v1/blockchain/rewards/quiz
 * Distribute reward for quiz completion (called internally)
 */
exports.distributeQuizReward = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { quizId, score } = req.body;

    if (!quizId || score === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Quiz ID and score are required',
      });
    }

    const result = await rewardService.distributeQuizReward(userId, quizId, score);

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    if (error.message.includes('already')) {
      return res.status(409).json({
        success: false,
        message: error.message,
      });
    }
    if (error.message.includes('not connected wallet')) {
      return res.status(400).json({
        success: false,
        message: 'Please connect your wallet first',
      });
    }
    next(error);
  }
};

/**
 * POST /api/v1/blockchain/rewards/course
 * Distribute reward for course completion (called internally)
 */
exports.distributeCourseReward = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { courseId } = req.body;

    if (!courseId) {
      return res.status(400).json({
        success: false,
        message: 'Course ID is required',
      });
    }

    const result = await rewardService.distributeCourseReward(userId, courseId);

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    if (error.message.includes('already')) {
      return res.status(409).json({
        success: false,
        message: error.message,
      });
    }
    if (error.message.includes('not connected wallet')) {
      return res.status(400).json({
        success: false,
        message: 'Please connect your wallet first',
      });
    }
    next(error);
  }
};

/**
 * POST /api/v1/blockchain/rewards/streak
 * Distribute reward for login streak (called by user)
 */
/**
 * GET /api/v1/blockchain/backend-wallet
 * Get backend wallet address (for token approval)
 */
exports.getBackendWalletAddress = async (req, res, next) => {
  try {
    const backendAddress = blockchainService.getBackendWalletAddress();
    res.status(200).json({
      success: true,
      data: {
        address: backendAddress,
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.distributeStreakReward = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { streakDays } = req.body;

    if (!streakDays || streakDays < 1) {
      return res.status(400).json({
        success: false,
        message: 'Streak phải ít nhất 1 ngày',
      });
    }

    const result = await rewardService.distributeStreakReward(userId, streakDays);

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    if (error.message.includes('already')) {
      return res.status(409).json({
        success: false,
        message: error.message,
      });
    }
    if (error.message.includes('not connected wallet')) {
      return res.status(400).json({
        success: false,
        message: 'Please connect your wallet first',
      });
    }
    if (error.message.includes('Streak too short') || error.message.includes('Streak quá ngắn')) {
      return res.status(400).json({
        success: false,
        message: error.message || 'Streak quá ngắn. Smart contract yêu cầu streak tối thiểu 7 ngày.',
      });
    }
    next(error);
  }
};

