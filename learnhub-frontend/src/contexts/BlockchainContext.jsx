// src/contexts/BlockchainContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { ethers } from 'ethers';
import BLOCKCHAIN_API from '../services/blockchain.service';

const BlockchainContext = createContext();

export const useBlockchain = () => {
  const context = useContext(BlockchainContext);
  if (!context) {
    throw new Error('useBlockchain must be used within BlockchainProvider');
  }
  return context;
};

export const BlockchainProvider = ({ children }) => {
  const [walletAddress, setWalletAddress] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [tokenBalance, setTokenBalance] = useState('0');
  const [rewardStats, setRewardStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Check if MetaMask is installed
  const isMetaMaskInstalled = () => {
    return typeof window.ethereum !== 'undefined';
  };

  // Connect to MetaMask
  const connectMetaMask = async () => {
    if (!isMetaMaskInstalled()) {
      setError('MetaMask is not installed. Please install MetaMask to continue.');
      return false;
    }

    try {
      setLoading(true);
      setError(null);

      // Request account access
      const provider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await provider.send('eth_requestAccounts', []);
      
      if (accounts.length === 0) {
        throw new Error('No accounts found');
      }

      const address = accounts[0];
      setWalletAddress(address);
      setIsConnected(true);

      // Connect wallet to backend
      try {
        await BLOCKCHAIN_API.connectWallet(address, 'polygon');
      } catch (err) {
        console.warn('Could not connect wallet to backend:', err.message);
        // Continue anyway, user might not be logged in
      }

      // Load balance
      await loadTokenBalance();

      return true;
    } catch (error) {
      setError(error.message || 'Failed to connect wallet');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Disconnect wallet
  const disconnectWallet = () => {
    setWalletAddress(null);
    setIsConnected(false);
    setTokenBalance('0');
    setRewardStats(null);
  };

  // Load token balance (works even without MetaMask if wallet is in database)
  const loadTokenBalance = async () => {
    try {
      const response = await BLOCKCHAIN_API.getTokenBalance();
      if (response.success) {
        setTokenBalance(response.data.balance || '0');
        // If we got balance but no wallet address, try to get it
        if (!walletAddress && response.data.balance) {
          try {
            const walletResponse = await BLOCKCHAIN_API.getWalletAddress();
            if (walletResponse.success && walletResponse.data.address) {
              setWalletAddress(walletResponse.data.address);
              setIsConnected(true);
            }
          } catch (error) {
            // Ignore, wallet might not be set up yet
          }
        }
      }
    } catch (error) {
      console.error('Error loading token balance:', error);
      // Don't set error, just log it
    }
  };

  // Load reward stats
  const loadRewardStats = async () => {
    try {
      const response = await BLOCKCHAIN_API.getRewardStats();
      if (response.success) {
        setRewardStats(response.data);
      }
    } catch (error) {
      console.error('Error loading reward stats:', error);
    }
  };

  // Check if wallet is already connected (from database or MetaMask)
  useEffect(() => {
    const checkConnection = async () => {
      // First, try to get wallet from backend (if user already connected via API)
      try {
        const walletResponse = await BLOCKCHAIN_API.getWalletAddress();
        if (walletResponse.success && walletResponse.data.address) {
          // User has wallet connected in database
          const address = walletResponse.data.address;
          setWalletAddress(address);
          setIsConnected(true);
          await loadTokenBalance();
          await loadRewardStats();
          
          // Also check if MetaMask is connected with same address
          if (isMetaMaskInstalled()) {
            try {
              const provider = new ethers.BrowserProvider(window.ethereum);
              const accounts = await provider.listAccounts();
              if (accounts.length > 0 && accounts[0].address.toLowerCase() === address.toLowerCase()) {
                // MetaMask connected with same address - perfect!
                console.log('Wallet connected in both database and MetaMask');
              }
            } catch (error) {
              // MetaMask not connected, but that's OK - wallet is in database
              console.log('Wallet connected in database, MetaMask not connected');
            }
          }
          return;
        }
      } catch (error) {
        // Wallet not connected in database, try MetaMask
        console.log('No wallet in database, checking MetaMask...');
      }

      // If no wallet in database, try MetaMask
      if (isMetaMaskInstalled()) {
        try {
          const provider = new ethers.BrowserProvider(window.ethereum);
          const accounts = await provider.listAccounts();
          
          if (accounts.length > 0) {
            const address = accounts[0].address;
            setWalletAddress(address);
            setIsConnected(true);
            await loadTokenBalance();
          }
        } catch (error) {
          console.error('Error checking MetaMask connection:', error);
        }
      }
    };

    checkConnection();

    // Listen for account changes
    if (isMetaMaskInstalled() && window.ethereum) {
      window.ethereum.on('accountsChanged', (accounts) => {
        if (accounts.length === 0) {
          disconnectWallet();
        } else {
          setWalletAddress(accounts[0]);
          loadTokenBalance();
        }
      });

      window.ethereum.on('chainChanged', () => {
        window.location.reload();
      });
    }
  }, []);

  // Auto-load reward stats when connected
  useEffect(() => {
    if (isConnected && walletAddress) {
      loadRewardStats();
    }
  }, [isConnected, walletAddress]);

  const value = {
    walletAddress,
    isConnected,
    tokenBalance,
    rewardStats,
    loading,
    error,
    connectMetaMask,
    disconnectWallet,
    loadTokenBalance,
    loadRewardStats,
    isMetaMaskInstalled,
  };

  return (
    <BlockchainContext.Provider value={value}>
      {children}
    </BlockchainContext.Provider>
  );
};

export default BlockchainContext;

