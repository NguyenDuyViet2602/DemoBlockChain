// src/services/blockchain.service.js
const { ethers } = require('ethers');
const {
  walletaddresses,
  tokentransactions,
  rewardsearned,
  nftcertificates,
  sequelize,
} = require('../models');

// Blockchain Configuration
const BLOCKCHAIN_CONFIG = {
  network: process.env.BLOCKCHAIN_NETWORK || 'mumbai', // mumbai, polygon, localhost
  rpcUrl: process.env.POLYGON_MUMBAI_RPC || process.env.ALCHEMY_MUMBAI_URL || process.env.BLOCKCHAIN_RPC_URL || 'https://polygon-amoy.g.alchemy.com/v2/vRCnbwYHNth2R8ttNLlUA',
  privateKey: process.env.PRIVATE_KEY || process.env.BLOCKCHAIN_PRIVATE_KEY, // Backend wallet private key
  tokenContractAddress: process.env.TOKEN_CONTRACT_ADDRESS,
  rewardDistributionAddress: process.env.REWARD_DISTRIBUTION_ADDRESS,
  certificateNFTAddress: process.env.CERTIFICATE_NFT_ADDRESS,
  coursePaymentAddress: process.env.COURSE_PAYMENT_ADDRESS,
};

// Initialize provider and signer
let provider;
let signer;
let tokenContract;
let rewardDistributionContract;
let certificateNFTContract;
let coursePaymentContract;

/**
 * Initialize blockchain connection
 */
const initializeBlockchain = async () => {
  try {
    if (!BLOCKCHAIN_CONFIG.privateKey) {
      console.warn('⚠️  BLOCKCHAIN_PRIVATE_KEY not set. Blockchain features will be disabled.');
      return false;
    }

    // Setup provider based on network
    if (BLOCKCHAIN_CONFIG.network === 'localhost') {
      provider = new ethers.JsonRpcProvider('http://127.0.0.1:8545');
    } else {
      provider = new ethers.JsonRpcProvider(BLOCKCHAIN_CONFIG.rpcUrl);
    }

    // Setup signer (backend wallet)
    signer = new ethers.Wallet(BLOCKCHAIN_CONFIG.privateKey, provider);
    console.log('✅ Blockchain initialized. Backend wallet:', signer.address);

    // Load contract ABIs (from artifacts after compilation)
    try {
      if (BLOCKCHAIN_CONFIG.tokenContractAddress) {
        const tokenArtifact = require('../../artifacts/contracts/LearnHubToken.sol/LearnHubToken.json');
        tokenContract = new ethers.Contract(
          BLOCKCHAIN_CONFIG.tokenContractAddress,
          tokenArtifact.abi,
          signer
        );
        console.log('✅ Token contract loaded:', BLOCKCHAIN_CONFIG.tokenContractAddress);
      } else {
        console.warn('⚠️  TOKEN_CONTRACT_ADDRESS not set');
      }

      if (BLOCKCHAIN_CONFIG.rewardDistributionAddress) {
        const rewardArtifact = require('../../artifacts/contracts/RewardDistribution.sol/RewardDistribution.json');
        rewardDistributionContract = new ethers.Contract(
          BLOCKCHAIN_CONFIG.rewardDistributionAddress,
          rewardArtifact.abi,
          signer
        );
        console.log('✅ RewardDistribution contract loaded:', BLOCKCHAIN_CONFIG.rewardDistributionAddress);
      } else {
        console.warn('⚠️  REWARD_DISTRIBUTION_ADDRESS not set');
      }

      if (BLOCKCHAIN_CONFIG.certificateNFTAddress) {
        const nftArtifact = require('../../artifacts/contracts/CertificateNFT.sol/CertificateNFT.json');
        certificateNFTContract = new ethers.Contract(
          BLOCKCHAIN_CONFIG.certificateNFTAddress,
          nftArtifact.abi,
          signer
        );
        console.log('✅ CertificateNFT contract loaded:', BLOCKCHAIN_CONFIG.certificateNFTAddress);
      } else {
        console.warn('⚠️  CERTIFICATE_NFT_ADDRESS not set');
      }

      if (BLOCKCHAIN_CONFIG.coursePaymentAddress) {
        const paymentArtifact = require('../../artifacts/contracts/CoursePayment.sol/CoursePayment.json');
        coursePaymentContract = new ethers.Contract(
          BLOCKCHAIN_CONFIG.coursePaymentAddress,
          paymentArtifact.abi,
          signer
        );
        console.log('✅ CoursePayment contract loaded:', BLOCKCHAIN_CONFIG.coursePaymentAddress);
      } else {
        console.warn('⚠️  COURSE_PAYMENT_ADDRESS not set');
      }
    } catch (error) {
      console.warn('⚠️  Could not load contract artifacts. Make sure contracts are compiled:', error.message);
    }

    return true;
  } catch (error) {
    console.error('❌ Error initializing blockchain:', error);
    return false;
  }
};

/**
 * Get user wallet address from database
 */
const getUserWalletAddress = async (userId) => {
  const wallet = await walletaddresses.findOne({
    where: { userid: userId },
  });

  if (!wallet || !wallet.address) {
    throw new Error('User has not connected wallet');
  }

  return wallet.address;
};

/**
 * Connect wallet address to user
 */
const connectWallet = async (userId, address, network = 'polygon') => {
  // Validate address format
  if (!ethers.isAddress(address)) {
    throw new Error('Invalid wallet address format');
  }

  // Check if address is already connected to another user
  const existingWallet = await walletaddresses.findOne({
    where: { address: address.toLowerCase() },
  });

  if (existingWallet && existingWallet.userid !== userId) {
    throw new Error('Wallet address is already connected to another user');
  }

  // Create or update wallet
  const [wallet, created] = await walletaddresses.findOrCreate({
    where: { userid: userId },
    defaults: {
      address: address.toLowerCase(),
      network: network,
    },
  });

  if (!created) {
    wallet.address = address.toLowerCase();
    wallet.network = network;
    await wallet.save();
  }

  return wallet;
};

/**
 * Get token balance for a user
 */
const getTokenBalance = async (userId) => {
  try {
    const address = await getUserWalletAddress(userId);
    
    if (!tokenContract) {
      throw new Error('Token contract not initialized');
    }

    const balance = await tokenContract.balanceOf(address);
    return ethers.formatEther(balance);
  } catch (error) {
    console.error('Error getting token balance:', error);
    throw error;
  }
};

/**
 * Distribute lesson reward
 */
const distributeLessonReward = async (userId, lessonId) => {
  const transaction = await sequelize.transaction();
  
  try {
    if (!rewardDistributionContract) {
      throw new Error('RewardDistribution contract not initialized. Please deploy contracts first.');
    }

    const address = await getUserWalletAddress(userId);
    
    // Check if already claimed
    const isClaimed = await rewardDistributionContract.isRewardClaimed(
      address,
      'lesson',
      lessonId
    );

    if (isClaimed) {
      throw new Error(`Reward already claimed for lesson #${lessonId} in smart contract. Each lesson can only be rewarded once.`);
    }

    // Call smart contract
    const tx = await rewardDistributionContract.distributeLessonReward(address, lessonId);
    const receipt = await tx.wait();

    // Save transaction to database
    const tokenTx = await tokentransactions.create({
      userid: userId,
      txhash: receipt.hash,
      amount: '10.0', // 10 LHT for lesson
      type: 'reward',
      activity_type: 'lesson',
      activity_id: lessonId,
      status: 'confirmed',
      block_number: receipt.blockNumber,
    }, { transaction });

    // Save reward earned
    await rewardsearned.create({
      userid: userId,
      activity_type: 'lesson',
      activity_id: lessonId,
      amount: '10.0',
      transactionid: tokenTx.transactionid,
    }, { transaction });

    await transaction.commit();

    return {
      txHash: receipt.hash,
      amount: '10.0',
      blockNumber: receipt.blockNumber,
    };
  } catch (error) {
    await transaction.rollback();
    console.error('Error distributing lesson reward:', error);
    throw error;
  }
};

/**
 * Distribute quiz reward
 */
const distributeQuizReward = async (userId, quizId, score) => {
  const transaction = await sequelize.transaction();
  
  try {
    if (!rewardDistributionContract) {
      throw new Error('RewardDistribution contract not initialized. Please deploy contracts first.');
    }

    const address = await getUserWalletAddress(userId);
    
    // Check if already claimed
    const isClaimed = await rewardDistributionContract.isRewardClaimed(
      address,
      'quiz',
      quizId
    );

    if (isClaimed) {
      throw new Error('Reward already claimed for this quiz');
    }

    // Convert score to integer (0-100) - smart contract expects uint256
    // Score might be decimal like 99.5, so we need to round it
    const scoreInt = Math.round(Number(score));
    if (scoreInt < 0 || scoreInt > 100) {
      throw new Error(`Invalid score: ${score}. Score must be between 0 and 100.`);
    }

    // Call smart contract with integer score
    const tx = await rewardDistributionContract.distributeQuizReward(address, quizId, scoreInt);
    const receipt = await tx.wait();

    // Get actual reward amount from event
    const event = receipt.logs.find(log => {
      try {
        const parsed = rewardDistributionContract.interface.parseLog(log);
        return parsed && parsed.name === 'RewardDistributed';
      } catch {
        return false;
      }
    });

    let amount = '10.0'; // Default
    if (event) {
      const parsed = rewardDistributionContract.interface.parseLog(event);
      amount = ethers.formatEther(parsed.args.amount);
    }

    // Save transaction to database
    const tokenTx = await tokentransactions.create({
      userid: userId,
      txhash: receipt.hash,
      amount: amount,
      type: 'reward',
      activity_type: 'quiz',
      activity_id: quizId,
      status: 'confirmed',
      block_number: receipt.blockNumber,
    }, { transaction });

    // Save reward earned
    await rewardsearned.create({
      userid: userId,
      activity_type: 'quiz',
      activity_id: quizId,
      amount: amount,
      transactionid: tokenTx.transactionid,
    }, { transaction });

    await transaction.commit();

    return {
      txHash: receipt.hash,
      amount: amount,
      blockNumber: receipt.blockNumber,
    };
  } catch (error) {
    await transaction.rollback();
    console.error('Error distributing quiz reward:', error);
    throw error;
  }
};

/**
 * Distribute course completion reward
 */
const distributeCourseReward = async (userId, courseId) => {
  const transaction = await sequelize.transaction();
  
  try {
    if (!rewardDistributionContract) {
      throw new Error('RewardDistribution contract not initialized. Please deploy contracts first.');
    }

    const address = await getUserWalletAddress(userId);
    
    // Check if already claimed
    const isClaimed = await rewardDistributionContract.isRewardClaimed(
      address,
      'course',
      courseId
    );

    if (isClaimed) {
      throw new Error('Reward already claimed for this course');
    }

    // Call smart contract
    const tx = await rewardDistributionContract.distributeCourseCompletionReward(address, courseId);
    const receipt = await tx.wait();

    // Get actual reward amount from event
    const event = receipt.logs.find(log => {
      try {
        const parsed = rewardDistributionContract.interface.parseLog(log);
        return parsed && parsed.name === 'RewardDistributed';
      } catch {
        return false;
      }
    });

    let amount = '200.0'; // Default
    if (event) {
      const parsed = rewardDistributionContract.interface.parseLog(event);
      amount = ethers.formatEther(parsed.args.amount);
    }

    // Save transaction to database
    const tokenTx = await tokentransactions.create({
      userid: userId,
      txhash: receipt.hash,
      amount: amount,
      type: 'reward',
      activity_type: 'course',
      activity_id: courseId,
      status: 'confirmed',
      block_number: receipt.blockNumber,
    }, { transaction });

    // Save reward earned
    await rewardsearned.create({
      userid: userId,
      activity_type: 'course',
      activity_id: courseId,
      amount: amount,
      transactionid: tokenTx.transactionid,
    }, { transaction });

    await transaction.commit();

    return {
      txHash: receipt.hash,
      amount: amount,
      blockNumber: receipt.blockNumber,
    };
  } catch (error) {
    await transaction.rollback();
    console.error('Error distributing course reward:', error);
    throw error;
  }
};

/**
 * Distribute review reward
 */
const distributeReviewReward = async (userId, reviewId) => {
  const transaction = await sequelize.transaction();
  
  try {
    if (!rewardDistributionContract) {
      throw new Error('RewardDistribution contract not initialized. Please deploy contracts first.');
    }

    const address = await getUserWalletAddress(userId);
    
    // Check if already claimed
    const isClaimed = await rewardDistributionContract.isRewardClaimed(
      address,
      'review',
      reviewId
    );

    if (isClaimed) {
      throw new Error('Reward already claimed for this review');
    }

    // Call smart contract
    const tx = await rewardDistributionContract.distributeReviewReward(address, reviewId);
    const receipt = await tx.wait();

    // Get actual reward amount from event
    const event = receipt.logs.find(log => {
      try {
        const parsed = rewardDistributionContract.interface.parseLog(log);
        return parsed && parsed.name === 'RewardDistributed';
      } catch {
        return false;
      }
    });

    let amount = '5.0'; // Default 5 LHT
    if (event) {
      const parsed = rewardDistributionContract.interface.parseLog(event);
      amount = ethers.formatEther(parsed.args.amount);
    }

    // Save transaction to database
    const tokenTx = await tokentransactions.create({
      userid: userId,
      txhash: receipt.hash,
      amount: amount,
      type: 'reward',
      activity_type: 'review',
      activity_id: reviewId,
      status: 'confirmed',
      block_number: receipt.blockNumber,
    }, { transaction });

    // Save reward earned
    await rewardsearned.create({
      userid: userId,
      activity_type: 'review',
      activity_id: reviewId,
      amount: amount,
      transactionid: tokenTx.transactionid,
    }, { transaction });

    await transaction.commit();

    return {
      txHash: receipt.hash,
      amount: amount,
    };
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

/**
 * Distribute forum reward
 */
const distributeForumReward = async (userId, forumId) => {
  const transaction = await sequelize.transaction();
  
  try {
    if (!rewardDistributionContract) {
      throw new Error('RewardDistribution contract not initialized. Please deploy contracts first.');
    }

    const address = await getUserWalletAddress(userId);
    
    // Check if already claimed
    const isClaimed = await rewardDistributionContract.isRewardClaimed(
      address,
      'forum',
      forumId
    );

    if (isClaimed) {
      throw new Error('Reward already claimed for this forum post');
    }

    // Call smart contract
    const tx = await rewardDistributionContract.distributeForumReward(address, forumId);
    const receipt = await tx.wait();

    // Get actual reward amount from event
    const event = receipt.logs.find(log => {
      try {
        const parsed = rewardDistributionContract.interface.parseLog(log);
        return parsed && parsed.name === 'RewardDistributed';
      } catch {
        return false;
      }
    });

    let amount = '3.0'; // Default 3 LHT
    if (event) {
      const parsed = rewardDistributionContract.interface.parseLog(event);
      amount = ethers.formatEther(parsed.args.amount);
    }

    // Save transaction to database
    const tokenTx = await tokentransactions.create({
      userid: userId,
      txhash: receipt.hash,
      amount: amount,
      type: 'reward',
      activity_type: 'forum',
      activity_id: forumId,
      status: 'confirmed',
      block_number: receipt.blockNumber,
    }, { transaction });

    // Save reward earned
    await rewardsearned.create({
      userid: userId,
      activity_type: 'forum',
      activity_id: forumId,
      amount: amount,
      transactionid: tokenTx.transactionid,
    }, { transaction });

    await transaction.commit();

    return {
      txHash: receipt.hash,
      amount: amount,
    };
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

/**
 * Distribute streak reward
 */
const distributeStreakReward = async (userId, streakDays) => {
  const transaction = await sequelize.transaction();
  
  try {
    if (!rewardDistributionContract) {
      throw new Error('RewardDistribution contract not initialized. Please deploy contracts first.');
    }

    const address = await getUserWalletAddress(userId);
    
    // Check if already claimed
    const isClaimed = await rewardDistributionContract.isRewardClaimed(
      address,
      'streak',
      streakDays
    );

    if (isClaimed) {
      throw new Error(`Reward already claimed for ${streakDays} day streak`);
    }

    // Call smart contract
    let tx;
    try {
      tx = await rewardDistributionContract.distributeStreakReward(address, streakDays);
    } catch (error) {
      // Handle specific error messages from contract
      if (error.message && error.message.includes('Streak too short')) {
        throw new Error('Streak quá ngắn. Smart contract yêu cầu streak tối thiểu 7 ngày. Vui lòng đăng nhập thêm vài ngày nữa.');
      }
      if (error.message && error.message.includes('Streak must be at least')) {
        throw new Error('Streak phải ít nhất 1 ngày');
      }
      throw error;
    }
    const receipt = await tx.wait();

    // Get actual reward amount from event
    const event = receipt.logs.find(log => {
      try {
        const parsed = rewardDistributionContract.interface.parseLog(log);
        return parsed && parsed.name === 'RewardDistributed';
      } catch {
        return false;
      }
    });

    // Calculate expected amount: Day 1 = 20, Day 2+ = 20 + (n-1)*10
    let expectedAmount = streakDays === 1 ? 20 : 20 + (streakDays - 1) * 10;
    let amount = expectedAmount.toString() + '.0';
    
    if (event) {
      const parsed = rewardDistributionContract.interface.parseLog(event);
      amount = ethers.formatEther(parsed.args.amount);
    }

    // Save transaction to database
    const tokenTx = await tokentransactions.create({
      userid: userId,
      txhash: receipt.hash,
      amount: amount,
      type: 'reward',
      activity_type: 'streak',
      activity_id: streakDays,
      status: 'confirmed',
      block_number: receipt.blockNumber,
    }, { transaction });

    // Save reward earned
    await rewardsearned.create({
      userid: userId,
      activity_type: 'streak',
      activity_id: streakDays,
      amount: amount,
      transactionid: tokenTx.transactionid,
    }, { transaction });

    await transaction.commit();

    return {
      txHash: receipt.hash,
      amount: amount,
    };
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

/**
 * Mint certificate NFT
 */
const mintCertificateNFT = async (userId, courseId, metadataURI) => {
  const transaction = await sequelize.transaction();
  
  try {
    if (!certificateNFTContract) {
      throw new Error('CertificateNFT contract not initialized. Please deploy contracts first.');
    }

    const address = await getUserWalletAddress(userId);
    
    // Check if certificate already exists
    const existing = await nftcertificates.findOne({
      where: { userid: userId, courseid: courseId },
    });

    if (existing) {
      throw new Error('Certificate already minted for this course');
    }

    // Call smart contract
    const tx = await certificateNFTContract.mintCertificate(address, courseId, metadataURI);
    const receipt = await tx.wait();

    // Get token ID from event
    const event = receipt.logs.find(log => {
      try {
        const parsed = certificateNFTContract.interface.parseLog(log);
        return parsed && parsed.name === 'CertificateMinted';
      } catch {
        return false;
      }
    });

    let tokenId = null;
    if (event) {
      const parsed = certificateNFTContract.interface.parseLog(event);
      tokenId = parsed.args.tokenId.toString();
    }

    // Save to database
    await nftcertificates.create({
      userid: userId,
      courseid: courseId,
      token_id: tokenId,
      contract_address: BLOCKCHAIN_CONFIG.certificateNFTAddress,
      metadata_url: metadataURI,
    }, { transaction });

    await transaction.commit();

    return {
      txHash: receipt.hash,
      tokenId: tokenId,
      blockNumber: receipt.blockNumber,
    };
  } catch (error) {
    await transaction.rollback();
    console.error('Error minting certificate NFT:', error);
    throw error;
  }
};

/**
 * Get transaction history for a user
 */
const getTransactionHistory = async (userId, limit = 50) => {
  const transactions = await tokentransactions.findAll({
    where: { userid: userId },
    order: [['createdat', 'DESC']],
    limit: limit,
  });

  return transactions;
};

/**
 * Calculate LHT amount for a given VND amount
 */
const calculateLHTForVND = async (amountVND) => {
  if (!coursePaymentContract) {
    throw new Error('CoursePayment contract not initialized. Please deploy contracts first.');
  }
  
  try {
    // Use the contract's calculateLHTAmount function
    const lhtAmount = await coursePaymentContract.calculateLHTAmount(amountVND);
    // Convert BigInt to string first, then format to avoid precision loss
    const lhtAmountStr = ethers.formatEther(lhtAmount);
    // Parse to float, but keep as string representation to avoid scientific notation
    const lhtAmountNum = parseFloat(lhtAmountStr);
    // Return as number, but ensure it's not in scientific notation when converted to string
    return lhtAmountNum;
  } catch (error) {
    console.error('Error calculating LHT for VND:', error);
    throw error;
  }
};

/**
 * Pay for a course using LHT tokens
 */
const payCourseWithLHT = async (userAddress, orderId, amountVND) => {
  if (!coursePaymentContract) {
    throw new Error('CoursePayment contract not initialized. Please deploy contracts first.');
  }
  
  try {
    // Contract requires: payWithLHT(buyer, orderId, vndAmount, reason)
    const reason = `Course purchase - Order #${orderId}`;
    const tx = await coursePaymentContract.payWithLHT(userAddress, orderId, amountVND, reason);
    const receipt = await tx.wait();
    
    // Get amount from event (event name is CoursePurchased, not CoursePaid)
    const event = receipt.logs.find(log => {
      try {
        const parsed = coursePaymentContract.interface.parseLog(log);
        return parsed && parsed.name === 'CoursePurchased';
      } catch {
        return false;
      }
    });
    
    let amountLHT = '0';
    if (event) {
      const parsed = coursePaymentContract.interface.parseLog(event);
      amountLHT = ethers.formatEther(parsed.args.lhtAmount);
    }
    
    return {
      txHash: receipt.hash,
      lhtAmount: amountLHT,
      blockNumber: receipt.blockNumber,
    };
  } catch (error) {
    console.error('Error paying with LHT:', error);
    throw error;
  }
};

/**
 * Get backend wallet address (for token approval)
 */
const getBackendWalletAddress = () => {
  if (!signer) {
    throw new Error('Blockchain not initialized');
  }
  return signer.address;
};

/**
 * Transfer LHT tokens from user to treasury (for discount)
 * This requires the user to have approved the backend wallet (signer.address) as spender
 * @param {string} userAddress - User's wallet address
 * @param {number} amount - Amount of LHT to transfer (in LHT, not wei)
 * @returns {Promise<object>} Transaction details
 */
const transferTokensForDiscount = async (userAddress, amount) => {
  if (!tokenContract) {
    throw new Error('Token contract not initialized. Please deploy contracts first.');
  }
  
  try {
    // Get treasury address (backend wallet or configured address)
    let treasuryAddress = process.env.TREASURY_ADDRESS || signer.address;
    
    // Convert addresses to lowercase for comparison
    const userAddressLower = userAddress.toLowerCase();
    const treasuryAddressLower = treasuryAddress.toLowerCase();
    const signerAddressLower = signer.address.toLowerCase();
    
    // If user address equals treasury/backend wallet address, use burn address instead
    // This prevents transferring tokens to the same address (which doesn't change balance)
    if (userAddressLower === treasuryAddressLower || userAddressLower === signerAddressLower) {
      console.warn(`⚠️ User address (${userAddress}) equals treasury/backend wallet address (${treasuryAddress})`);
      console.warn(`   Using burn address (0x000000000000000000000000000000000000dEaD) to burn tokens instead`);
      // Use burn address (0x000000000000000000000000000000000000dEaD) - a well-known burn address
      treasuryAddress = '0x000000000000000000000000000000000000dEaD';
    }
    
    // Convert amount to wei
    const amountInWei = ethers.parseEther(amount.toString());
    
    // Check allowance first (user must approve backend wallet as spender)
    const allowance = await tokenContract.allowance(userAddress, signer.address);
    
    if (allowance < amountInWei) {
      throw new Error(`Insufficient token allowance. User needs to approve ${amount} LHT to backend wallet first.`);
    }
    
    // Transfer tokens from user to treasury using transferFrom
    // Note: This requires the backend wallet (signer) to call transferFrom
    // The user must have approved the backend wallet (signer.address) as spender
    console.log(`🔄 Transferring ${amount} LHT from ${userAddress} to ${treasuryAddress}...`);
    
    const tx = await tokenContract.transferFrom(userAddress, treasuryAddress, amountInWei);
    console.log(`   Transaction hash: ${tx.hash}`);
    const receipt = await tx.wait();
    console.log(`✅ Transfer confirmed in block ${receipt.blockNumber}`);
    
    return {
      success: true,
      txHash: receipt.hash,
      blockNumber: receipt.blockNumber,
      from: userAddress,
      to: treasuryAddress,
      amount: amount.toString(),
    };
  } catch (error) {
    console.error('Error transferring tokens for discount:', error);
    throw error;
  }
};

/**
 * Check token approval status
 */
const checkTokenApproval = async (userAddress, spenderAddress, amount) => {
  if (!tokenContract) {
    throw new Error('Token contract not initialized. Please deploy contracts first.');
  }
  
  try {
    const allowance = await tokenContract.allowance(userAddress, spenderAddress);
    
    // Convert amount to string without scientific notation
    // Use toFixed to avoid scientific notation for small numbers
    const amountStr = typeof amount === 'number' 
      ? amount.toFixed(18).replace(/\.?0+$/, '') // Remove trailing zeros
      : amount.toString();
    
    // If amount is very small, use parseUnits with explicit decimals
    let requiredAmount;
    if (amountStr.includes('e-') || amountStr.includes('E-')) {
      // Handle scientific notation by converting to fixed decimal string
      const num = Number(amountStr);
      const fixedStr = num.toFixed(18);
      requiredAmount = ethers.parseUnits(fixedStr, 18);
    } else {
      requiredAmount = ethers.parseEther(amountStr);
    }
    
    return {
      approved: allowance >= requiredAmount,
      allowance: ethers.formatEther(allowance),
      required: amountStr,
    };
  } catch (error) {
    console.error('Error checking token approval:', error);
    throw error;
  }
};

// Initialize on module load
initializeBlockchain();

module.exports = {
  initializeBlockchain,
  connectWallet,
  getUserWalletAddress,
  getTokenBalance,
  distributeLessonReward,
  distributeQuizReward,
  distributeCourseReward,
  distributeReviewReward,
  distributeForumReward,
  distributeStreakReward,
  mintCertificateNFT,
  getTransactionHistory,
  calculateLHTForVND,
  payCourseWithLHT,
  checkTokenApproval,
  transferTokensForDiscount, // For LHT discount
  getBackendWalletAddress, // Get backend wallet address for approval
};

