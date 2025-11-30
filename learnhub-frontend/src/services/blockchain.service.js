// src/services/blockchain.service.js
import api from '../utils/api';

const BLOCKCHAIN_API = {
  // Wallet Management
  connectWallet: async (address, network = 'polygon') => {
    const response = await api.post('/api/v1/blockchain/connect-wallet', {
      address,
      network,
    });
    return response.data;
  },

  getWalletAddress: async () => {
    const response = await api.get('/api/v1/blockchain/wallet');
    return response.data;
  },

  getTokenBalance: async () => {
    const response = await api.get('/api/v1/blockchain/balance');
    return response.data;
  },

  // Rewards
  getRewardStats: async () => {
    const response = await api.get('/api/v1/blockchain/rewards/stats');
    return response.data;
  },

  getRewardHistory: async (limit = 50) => {
    const response = await api.get('/api/v1/blockchain/rewards/history', {
      params: { limit },
    });
    return response.data;
  },

  // Transactions
  getTransactionHistory: async (limit = 50) => {
    const response = await api.get('/api/v1/blockchain/transactions', {
      params: { limit },
    });
    return response.data;
  },

  // Streak Rewards
  claimStreakReward: async (streakDays) => {
    const response = await api.post('/api/v1/blockchain/rewards/streak', {
      streakDays,
    });
    return response.data;
  },

  // LHT Payment
  getLHTPaymentInfo: async (orderId) => {
    const response = await api.get(`/api/v1/payment/lht/info/${orderId}`);
    return response.data;
  },

  payWithLHT: async (orderId) => {
    const response = await api.post('/api/v1/payment/lht/pay', {
      orderId,
    });
    return response.data;
  },

  calculateLHT: async (vndAmount) => {
    const response = await api.get('/api/v1/payment/lht/calculate', {
      params: { vndAmount },
    });
    return response.data;
  },

  // LHT Discount
  getMaxLHTDiscount: async (orderAmount) => {
    const response = await api.get('/api/v1/payment/lht/discount/max', {
      params: { orderAmount },
    });
    return response.data;
  },

  // Get backend wallet address for approval
  getBackendWalletAddress: async () => {
    const response = await api.get('/api/v1/blockchain/backend-wallet');
    return response.data;
  },
};

export default BLOCKCHAIN_API;

