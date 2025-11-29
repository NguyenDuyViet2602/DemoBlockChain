// src/services/lht-payment.service.js
const blockchainService = require('./blockchain.service');
const orderService = require('./order.service');
const { tokentransactions } = require('../models');

/**
 * Calculate LHT amount needed for a VND amount
 */
const calculateLHTAmount = async (vndAmount) => {
  try {
    const lhtAmount = await blockchainService.calculateLHTForVND(vndAmount);
    return parseFloat(lhtAmount);
  } catch (error) {
    console.error('Error calculating LHT amount:', error);
    throw new Error('Không thể tính toán số LHT cần thiết');
  }
};

/**
 * Process course payment using LHT tokens
 */
const processLHTPayment = async (userId, orderId) => {
  try {
    // Get order details
    const order = await orderService.getOrderById(orderId, userId);
    
    if (!order) {
      throw new Error('Không tìm thấy đơn hàng');
    }

    if (order.userid !== userId) {
      throw new Error('Bạn không có quyền thanh toán đơn hàng này');
    }

    if (order.status === 'Completed') {
      throw new Error('Đơn hàng đã được thanh toán');
    }

    // Check user balance
    const balance = await blockchainService.getTokenBalance(userId);
    const vndAmount = order.totalamount;
    const requiredLHT = await calculateLHTAmount(vndAmount);

    if (parseFloat(balance) < requiredLHT) {
      throw new Error(`Số dư LHT không đủ. Cần ${requiredLHT.toFixed(2)} LHT, hiện có ${parseFloat(balance).toFixed(2)} LHT`);
    }

    // Process payment on blockchain
    const userAddress = await blockchainService.getUserWalletAddress(userId);
    const result = await blockchainService.payCourseWithLHT(userAddress, orderId, vndAmount);

    // Update order status to Completed
    await orderService.updateOrderStatus(orderId, 'Completed');

    return {
      success: true,
      orderId: orderId,
      lhtAmount: result.lhtAmount,
      vndAmount: vndAmount,
      txHash: result.txHash,
      message: result.message,
    };
  } catch (error) {
    console.error('Error processing LHT payment:', error);
    throw error;
  }
};

/**
 * Get payment information for checkout
 */
const getPaymentInfo = async (userId, orderId) => {
  try {
    const order = await orderService.getOrderById(orderId, userId);
    
    if (!order) {
      throw new Error('Không tìm thấy đơn hàng');
    }

    if (order.userid !== userId) {
      throw new Error('Bạn không có quyền xem đơn hàng này');
    }

    const balance = await blockchainService.getTokenBalance(userId);
    const vndAmount = order.totalamount;
    const requiredLHT = await calculateLHTAmount(vndAmount);
    const hasEnoughBalance = parseFloat(balance) >= requiredLHT;

    // Check token approval
    let approvalStatus = { approved: false, allowance: '0' };
    try {
      const userAddress = await blockchainService.getUserWalletAddress(userId);
      // Get CoursePayment contract address from config
      const coursePaymentAddress = process.env.COURSE_PAYMENT_ADDRESS;
      if (coursePaymentAddress) {
        // Convert requiredLHT to string without scientific notation
        const requiredLHTStr = requiredLHT.toFixed(18).replace(/\.?0+$/, '');
        approvalStatus = await blockchainService.checkTokenApproval(userAddress, coursePaymentAddress, requiredLHTStr);
      }
    } catch (error) {
      console.warn('Could not check token approval:', error.message);
    }

    return {
      orderId: orderId,
      vndAmount: vndAmount,
      requiredLHT: requiredLHT,
      userBalance: parseFloat(balance),
      hasEnoughBalance: hasEnoughBalance,
      needsApproval: !approvalStatus.approved || parseFloat(approvalStatus.allowance) < requiredLHT,
      approvalStatus: approvalStatus,
    };
  } catch (error) {
    console.error('Error getting payment info:', error);
    throw error;
  }
};

module.exports = {
  calculateLHTAmount,
  processLHTPayment,
  getPaymentInfo,
};

