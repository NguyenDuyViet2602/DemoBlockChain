// src/pages/BlockchainRewards.jsx
import React, { useEffect, useState } from 'react';
import { useBlockchain } from '../contexts/BlockchainContext';
import BLOCKCHAIN_API from '../services/blockchain.service';
import { FaCoins, FaHistory, FaTrophy, FaWallet, FaFire } from 'react-icons/fa';
import { useToast } from '../contexts/ToastContext';
import axios from 'axios';

const BlockchainRewards = () => {
  const toast = useToast();
  const { walletAddress, isConnected, tokenBalance, rewardStats, loadRewardStats, loadTokenBalance } = useBlockchain();
  const [rewardHistory, setRewardHistory] = useState([]);
  const [transactionHistory, setTransactionHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [streakInfo, setStreakInfo] = useState(null);
  const [claimingStreak, setClaimingStreak] = useState(false);

  useEffect(() => {
    // Load data if connected OR if user is logged in (might have wallet in database)
    const token = localStorage.getItem('token');
    if (isConnected || token) {
      loadData();
      loadStreakInfo();
    }
  }, [isConnected]);

  const loadStreakInfo = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      
      const response = await axios.get('http://localhost:8080/api/v1/user', {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (response.data) {
        setStreakInfo({
          currentStreak: response.data.currentstreak || 0,
          lastLogin: response.data.lastlogin,
        });
      }
    } catch (error) {
      console.error('Error loading streak info:', error);
    }
  };

  const handleClaimStreakReward = async () => {
    if (!streakInfo || streakInfo.currentStreak < 1) {
      toast.warning('Bạn cần đăng nhập ít nhất 1 ngày để nhận reward!');
      return;
    }

    try {
      setClaimingStreak(true);
      const response = await BLOCKCHAIN_API.claimStreakReward(streakInfo.currentStreak);
      
      if (response.success) {
        toast.success(`Chúc mừng! Bạn đã nhận ${response.data.amount} LHT cho ${streakInfo.currentStreak} ngày đăng nhập liên tiếp!`);
        await loadData(); // Reload balance and history
        await loadStreakInfo(); // Reload streak info
      } else {
        toast.error(response.message || 'Không thể claim reward');
      }
    } catch (error) {
      console.error('Error claiming streak reward:', error);
      toast.error(error.response?.data?.message || 'Lỗi khi claim streak reward');
    } finally {
      setClaimingStreak(false);
    }
  };

  const calculateStreakReward = (days) => {
    if (days === 1) return 20;
    return 20 + (days - 1) * 10;
  };

  const loadData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadRewardStats(),
        loadTokenBalance(),
        loadRewardHistory(),
        loadTransactionHistory(),
      ]);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadRewardHistory = async () => {
    try {
      const response = await BLOCKCHAIN_API.getRewardHistory(20);
      if (response.success) {
        setRewardHistory(response.data || []);
      }
    } catch (error) {
      console.error('Error loading reward history:', error);
    }
  };

  const loadTransactionHistory = async () => {
    try {
      const response = await BLOCKCHAIN_API.getTransactionHistory(20);
      if (response.success) {
        setTransactionHistory(response.data || []);
      }
    } catch (error) {
      console.error('Error loading transaction history:', error);
    }
  };

  // Show data even if MetaMask not connected, as long as user has wallet in database
  const hasWallet = isConnected || parseFloat(tokenBalance || 0) > 0 || (rewardHistory.length > 0) || (transactionHistory.length > 0);

  if (!hasWallet && !loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto text-center">
          <FaWallet className="text-6xl text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Connect Your Wallet</h2>
          <p className="text-gray-600 mb-6">
            Connect your MetaMask wallet to view your rewards and token balance.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">My Rewards & Tokens</h1>

      {/* Login Streak Card */}
      {streakInfo && streakInfo.currentStreak > 0 && (
        <div className="bg-gradient-to-br from-orange-500 to-red-600 rounded-lg p-6 text-white mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <FaFire className="text-4xl" />
              <div>
                <h3 className="text-xl font-bold">Chuỗi đăng nhập</h3>
                <p className="text-sm opacity-90">{streakInfo.currentStreak} ngày liên tiếp</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold">{calculateStreakReward(streakInfo.currentStreak)} LHT</div>
              <div className="text-sm opacity-90">Reward hôm nay</div>
            </div>
          </div>
          <button
            onClick={handleClaimStreakReward}
            disabled={claimingStreak}
            className="w-full bg-white text-orange-600 font-semibold py-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {claimingStreak ? 'Đang xử lý...' : `Nhận ${calculateStreakReward(streakInfo.currentStreak)} LHT`}
          </button>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Token Balance */}
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <FaCoins className="text-3xl" />
            <span className="text-sm opacity-90">Current Balance</span>
          </div>
          <div className="text-3xl font-bold">{parseFloat(tokenBalance || 0).toFixed(2)}</div>
          <div className="text-sm opacity-90 mt-1">LHT Tokens</div>
        </div>

        {/* Total Earned */}
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <FaTrophy className="text-3xl" />
            <span className="text-sm opacity-90">Total Earned</span>
          </div>
          <div className="text-3xl font-bold">
            {rewardStats?.totalEarned ? parseFloat(rewardStats.totalEarned).toFixed(2) : '0.00'}
          </div>
          <div className="text-sm opacity-90 mt-1">LHT Tokens</div>
        </div>

        {/* Wallet Address */}
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <FaWallet className="text-3xl" />
            <span className="text-sm opacity-90">Wallet</span>
          </div>
          <div className="text-sm font-mono break-all">
            {walletAddress?.slice(0, 6)}...{walletAddress?.slice(-4)}
          </div>
        </div>
      </div>

      {/* Reward History */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <FaHistory /> Reward History
        </h2>
        {loading ? (
          <div className="text-center py-8 text-gray-500">Loading...</div>
        ) : rewardHistory.length === 0 ? (
          <div className="text-center py-8 text-gray-500">No rewards yet. Start learning to earn tokens!</div>
        ) : (
          <div className="space-y-3">
            {rewardHistory.map((reward) => (
              <div
                key={reward.rewardid}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div>
                  <div className="font-semibold text-gray-900 capitalize">
                    {reward.activity_type} #{reward.activity_id}
                  </div>
                  <div className="text-sm text-gray-500">
                    {new Date(reward.earnedat).toLocaleString('vi-VN')}
                  </div>
                </div>
                <div className="text-lg font-bold text-green-600">
                  +{parseFloat(reward.amount).toFixed(2)} LHT
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Transaction History */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <FaHistory /> Transaction History
        </h2>
        {loading ? (
          <div className="text-center py-8 text-gray-500">Loading...</div>
        ) : transactionHistory.length === 0 ? (
          <div className="text-center py-8 text-gray-500">No transactions yet.</div>
        ) : (
          <div className="space-y-3">
            {transactionHistory.map((tx) => (
              <div
                key={tx.transactionid}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div>
                  <div className="font-semibold text-gray-900 capitalize">
                    {tx.type} - {tx.activity_type || 'N/A'}
                  </div>
                  <div className="text-sm text-gray-500">
                    {tx.txhash && (
                      <a
                        href={`https://amoy.polygonscan.com/tx/${tx.txhash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        {tx.txhash.slice(0, 10)}...{tx.txhash.slice(-8)}
                      </a>
                    )}
                    {' • '}
                    {new Date(tx.createdat).toLocaleString('vi-VN')}
                  </div>
                </div>
                <div className={`text-lg font-bold ${tx.type === 'reward' ? 'text-green-600' : 'text-gray-600'}`}>
                  {tx.type === 'reward' ? '+' : ''}{parseFloat(tx.amount).toFixed(2)} LHT
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BlockchainRewards;

