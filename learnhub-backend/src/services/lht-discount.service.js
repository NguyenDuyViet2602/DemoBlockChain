// src/services/lht-discount.service.js
const blockchainService = require('./blockchain.service');
const { sequelize, tokentransactions } = require('../models');

// Exchange rate: 1 LHT = ? VND discount
// Ví dụ: 1 LHT = 1000 VND discount
const LHT_TO_VND_RATE = 1000; // 1 LHT = 1000 VND discount

// Maximum discount percentage: LHT can only replace up to 30% of order value
const MAX_DISCOUNT_PERCENTAGE = 30; // 30%

/**
 * Calculate VND discount from LHT amount
 * @param {number} lhtAmount - Amount of LHT to use
 * @returns {number} VND discount amount
 */
const calculateVNDDiscount = (lhtAmount) => {
  return lhtAmount * LHT_TO_VND_RATE;
};

/**
 * Calculate maximum LHT that can be used (based on user balance and order amount)
 * LHT can only replace up to 30% of order value
 * @param {number} userId - User ID
 * @param {number} orderAmount - Order total amount in VND
 * @returns {Promise<object>} Max LHT usable and corresponding discount
 */
const getMaxLHTUsable = async (userId, orderAmount) => {
  try {
    // Get user balance
    const balance = await blockchainService.getTokenBalance(userId);
    const balanceNum = parseFloat(balance);
    
    // Calculate max discount allowed (30% of order amount)
    const maxDiscountAllowed = (orderAmount * MAX_DISCOUNT_PERCENTAGE) / 100;
    
    // Calculate max LHT based on:
    // 1. User balance
    // 2. Max discount allowed (30% of order)
    const maxLHTByBalance = balanceNum;
    const maxLHTByMaxDiscount = maxDiscountAllowed / LHT_TO_VND_RATE;
    
    // Max LHT is the minimum of balance and max discount limit
    const maxLHT = Math.min(maxLHTByBalance, maxLHTByMaxDiscount);
    
    // Actual discount (may be less than maxDiscountAllowed if user doesn't have enough LHT)
    const maxDiscount = calculateVNDDiscount(maxLHT);
    
    return {
      maxLHT: Math.floor(maxLHT * 100) / 100, // Round to 2 decimals
      maxDiscount: Math.floor(maxDiscount),
      maxDiscountAllowed: Math.floor(maxDiscountAllowed),
      userBalance: balanceNum,
      rate: LHT_TO_VND_RATE,
      maxDiscountPercentage: MAX_DISCOUNT_PERCENTAGE,
    };
  } catch (error) {
    console.error('Error getting max LHT usable:', error);
    // If wallet not connected, return 0
    return {
      maxLHT: 0,
      maxDiscount: 0,
      maxDiscountAllowed: 0,
      userBalance: 0,
      rate: LHT_TO_VND_RATE,
      maxDiscountPercentage: MAX_DISCOUNT_PERCENTAGE,
    };
  }
};

/**
 * Apply LHT discount to order (burn/transfer LHT tokens)
 * This should be called AFTER payment is confirmed
 * @param {number} userId - User ID
 * @param {number} orderId - Order ID
 * @param {number} lhtAmount - Amount of LHT to burn/transfer
 * @returns {Promise<object>} Transaction details
 */
const applyLHTDiscount = async (userId, orderId, lhtAmount) => {
  const transaction = await sequelize.transaction();
  
  try {
    // Validate LHT amount
    if (lhtAmount <= 0) {
      throw new Error('LHT amount must be greater than 0');
    }
    
    // Get user balance
    const balance = await blockchainService.getTokenBalance(userId);
    const balanceNum = parseFloat(balance);
    
    if (balanceNum < lhtAmount) {
      throw new Error(`Số dư LHT không đủ. Cần ${lhtAmount} LHT, hiện có ${balanceNum} LHT`);
    }
    
    // Get user wallet address
    const userAddress = await blockchainService.getUserWalletAddress(userId);
    
    // Try to transfer tokens on blockchain
    // Note: This requires user to have approved backend wallet as spender
    let txHash = null;
    let blockNumber = null;
    let transferSuccess = false;
    
           try {
             const transferResult = await blockchainService.transferTokensForDiscount(userAddress, lhtAmount);
             txHash = transferResult.txHash;
             blockNumber = transferResult.blockNumber;
             transferSuccess = true;
             console.log(`✅ LHT discount transferred successfully: ${txHash}`);
           } catch (error) {
             console.error('Error transferring LHT tokens for discount:', error);
             
             // If transfer fails due to insufficient allowance, record as pending
             if (error.message.includes('allowance') || error.message.includes('approve') || error.message.includes('Insufficient')) {
               // User hasn't approved tokens - record as pending
               console.warn(`⚠️ User ${userId} has not approved tokens for discount. Recording as pending.`);
               console.warn(`   User address: ${userAddress}`);
               console.warn(`   LHT amount: ${lhtAmount}`);
               console.warn(`   Order ID: ${orderId}`);
               
               const tokenTx = await tokentransactions.create({
                 userid: userId,
                 txhash: `discount_pending_${orderId}_${Date.now()}`,
                 amount: lhtAmount.toString(),
                 type: 'spend',
                 activity_type: 'discount',
                 activity_id: orderId,
                 status: 'pending_approval',
                 block_number: null,
               }, { transaction });
               
               await transaction.commit();
               
               return {
                 success: false,
                 txHash: null,
                 lhtAmount: lhtAmount,
                 vndDiscount: calculateVNDDiscount(lhtAmount),
                 transactionId: tokenTx.transactionid,
                 message: 'LHT discount recorded but tokens not approved. User needs to approve tokens to backend wallet first.',
                 needsApproval: true,
                 userAddress: userAddress,
               };
             }
             
             // For other errors, still record but mark as failed
             // Don't throw error - payment already succeeded, just log the issue
             console.warn(`❌ LHT discount transfer failed for order ${orderId}: ${error.message}`);
           }
    
    // Save transaction to database
    const tokenTx = await tokentransactions.create({
      userid: userId,
      txhash: transferSuccess ? txHash : `discount_failed_${orderId}_${Date.now()}`,
      amount: lhtAmount.toString(),
      type: 'spend',
      activity_type: 'discount',
      activity_id: orderId,
      status: transferSuccess ? 'confirmed' : 'failed',
      block_number: blockNumber,
    }, { transaction });
    
    await transaction.commit();
    
    return {
      success: transferSuccess,
      txHash: txHash,
      lhtAmount: lhtAmount,
      vndDiscount: calculateVNDDiscount(lhtAmount),
      transactionId: tokenTx.transactionid,
      blockNumber: blockNumber,
      message: transferSuccess 
        ? 'LHT discount applied successfully' 
        : 'LHT discount recorded but token transfer failed. Please contact support.',
    };
  } catch (error) {
    await transaction.rollback();
    console.error('Error applying LHT discount:', error);
    throw error;
  }
};

module.exports = {
  calculateVNDDiscount,
  getMaxLHTUsable,
  applyLHTDiscount,
  LHT_TO_VND_RATE,
  MAX_DISCOUNT_PERCENTAGE,
};

