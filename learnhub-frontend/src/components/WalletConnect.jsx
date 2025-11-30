// src/components/WalletConnect.jsx
import React, { useState } from 'react';
import { useBlockchain } from '../contexts/BlockchainContext';
import { FaWallet, FaCopy, FaCheck } from 'react-icons/fa';

const WalletConnect = () => {
  const {
    walletAddress,
    isConnected,
    tokenBalance,
    loading,
    error,
    connectMetaMask,
    disconnectWallet,
    isMetaMaskInstalled,
  } = useBlockchain();

  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (walletAddress) {
      navigator.clipboard.writeText(walletAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const formatAddress = (address) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  if (!isMetaMaskInstalled()) {
    return (
      <div className="flex items-center gap-2 px-4 py-2 bg-yellow-100 text-yellow-800 rounded-lg">
        <FaWallet className="text-lg" />
        <span className="text-sm">
          <a
            href="https://metamask.io/download/"
            target="_blank"
            rel="noopener noreferrer"
            className="underline"
          >
            Install MetaMask
          </a>
          {' '}to connect wallet
        </span>
      </div>
    );
  }

  if (!isConnected) {
    return (
      <button
        onClick={connectMetaMask}
        disabled={loading}
        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        <FaWallet className="text-lg" />
        <span>{loading ? 'Connecting...' : 'Connect Wallet'}</span>
      </button>
    );
  }

  return (
    <div className="flex items-center gap-3">
      {/* Token Balance */}
      <div className="flex items-center gap-2 px-3 py-2 bg-green-100 text-green-800 rounded-lg">
        <span className="font-semibold">{parseFloat(tokenBalance).toFixed(2)}</span>
        <span className="text-sm">LHT</span>
      </div>

      {/* Wallet Address */}
      <div className="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-lg">
        <span className="text-sm font-mono">{formatAddress(walletAddress)}</span>
        <button
          onClick={handleCopy}
          className="text-gray-600 hover:text-gray-800 transition-colors"
          title="Copy address"
        >
          {copied ? <FaCheck className="text-green-600" /> : <FaCopy />}
        </button>
        <button
          onClick={disconnectWallet}
          className="text-sm text-red-600 hover:text-red-800 ml-2"
          title="Disconnect"
        >
          Disconnect
        </button>
      </div>

      {error && (
        <div className="text-red-600 text-sm">{error}</div>
      )}
    </div>
  );
};

export default WalletConnect;

