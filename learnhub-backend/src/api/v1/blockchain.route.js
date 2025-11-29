// src/api/v1/blockchain.route.js
const express = require('express');
const router = express.Router();
const blockchainController = require('../../controllers/blockchain.controller');
const authMiddleware = require('../../middlewares/auth.middleware');

// All routes require authentication
router.use(authMiddleware);

// Wallet management
router.post('/connect-wallet', blockchainController.connectWallet);
router.get('/wallet', blockchainController.getWalletAddress);
router.get('/balance', blockchainController.getTokenBalance);
router.get('/backend-wallet', blockchainController.getBackendWalletAddress);

// Reward management
router.get('/rewards/stats', blockchainController.getRewardStats);
router.get('/rewards/history', blockchainController.getRewardHistory);
router.post('/rewards/lesson', blockchainController.distributeLessonReward);
router.post('/rewards/quiz', blockchainController.distributeQuizReward);
router.post('/rewards/course', blockchainController.distributeCourseReward);
router.post('/rewards/streak', blockchainController.distributeStreakReward);

// Transaction history
router.get('/transactions', blockchainController.getTransactionHistory);

module.exports = router;

