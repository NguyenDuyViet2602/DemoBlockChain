// src/utils/ethers-helper.js
import { ethers } from 'ethers';

// Contract addresses (should match backend .env)
// Using import.meta.env for Vite, fallback to hardcoded addresses
const CONTRACT_ADDRESSES = {
  TOKEN: import.meta.env.VITE_TOKEN_CONTRACT_ADDRESS || '0xC40444E53a0Fc052181b59942cF5d2Af9Ae93320',
  COURSE_PAYMENT: import.meta.env.VITE_COURSE_PAYMENT_ADDRESS || '0x51A25B55a57F3e4f628092dEa7A1505868480ca3',
};

// Polygon Amoy Testnet chain ID
const POLYGON_AMOY_CHAIN_ID = '0x13882'; // 80002 in hex

// ERC20 ABI (minimal for approve and allowance)
const ERC20_ABI = [
  'function approve(address spender, uint256 amount) external returns (bool)',
  'function allowance(address owner, address spender) external view returns (uint256)',
  'function balanceOf(address account) external view returns (uint256)',
];

/**
 * Check if connected to correct network (Polygon Amoy)
 */
export const checkNetwork = async () => {
  if (typeof window.ethereum === 'undefined') {
    throw new Error('MetaMask is not installed');
  }

  const chainId = await window.ethereum.request({ method: 'eth_chainId' });
  
  if (chainId !== POLYGON_AMOY_CHAIN_ID) {
    // Try to switch network
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: POLYGON_AMOY_CHAIN_ID }],
      });
    } catch (switchError) {
      // If network doesn't exist, add it
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: POLYGON_AMOY_CHAIN_ID,
                chainName: 'Polygon Amoy Testnet',
                nativeCurrency: {
                  name: 'POL',
                  symbol: 'POL',
                  decimals: 18,
                },
                rpcUrls: ['https://polygon-amoy.g.alchemy.com/v2/vRCnbwYHNth2R8ttNLlUA'],
                blockExplorerUrls: ['https://amoy.polygonscan.com'],
              },
            ],
          });
        } catch (addError) {
          throw new Error('Vui lòng chuyển sang Polygon Amoy Testnet trong MetaMask');
        }
      } else {
        throw new Error('Vui lòng chuyển sang Polygon Amoy Testnet trong MetaMask');
      }
    }
  }
};

/**
 * Get provider from MetaMask
 */
export const getProvider = () => {
  if (typeof window.ethereum === 'undefined') {
    throw new Error('MetaMask is not installed');
  }
  return new ethers.BrowserProvider(window.ethereum);
};

/**
 * Get signer from MetaMask
 */
export const getSigner = async () => {
  await checkNetwork(); // Ensure correct network before getting signer
  const provider = getProvider();
  return await provider.getSigner();
};

/**
 * Check token approval
 */
export const checkTokenApproval = async (userAddress, amount) => {
  try {
    // Check network first
    await checkNetwork();
    
    const provider = getProvider();
    const tokenContract = new ethers.Contract(
      CONTRACT_ADDRESSES.TOKEN,
      ERC20_ABI,
      provider
    );

    // Format amount to avoid scientific notation
    const amountStr = typeof amount === 'number' 
      ? amount.toFixed(18).replace(/\.?0+$/, '')
      : amount.toString();
    
    // Parse amount, handling scientific notation
    let requiredAmount;
    if (amountStr.includes('e-') || amountStr.includes('E-')) {
      const num = Number(amountStr);
      const fixedStr = num.toFixed(18);
      requiredAmount = ethers.parseUnits(fixedStr, 18);
    } else {
      requiredAmount = ethers.parseEther(amountStr);
    }

    const allowance = await tokenContract.allowance(
      userAddress,
      CONTRACT_ADDRESSES.COURSE_PAYMENT
    );

    return {
      approved: allowance >= requiredAmount,
      allowance: ethers.formatEther(allowance),
      required: amountStr,
    };
  } catch (error) {
    console.error('Error checking token approval:', error);
    
    // Provide user-friendly error messages
    if (error.code === 'CALL_EXCEPTION' || error.code === -32080) {
      throw new Error('Không thể kết nối với blockchain. Vui lòng kiểm tra network và thử lại.');
    }
    if (error.message.includes('network') || error.message.includes('Network')) {
      throw error; // Network error already has user-friendly message
    }
    throw error;
  }
};

/**
 * Approve tokens for CoursePayment contract
 */
export const approveTokens = async (amount) => {
  try {
    // Check network first
    await checkNetwork();
    
    const signer = await getSigner();
    const tokenContract = new ethers.Contract(
      CONTRACT_ADDRESSES.TOKEN,
      ERC20_ABI,
      signer
    );

    // Format amount to avoid scientific notation
    const amountStr = typeof amount === 'number' 
      ? amount.toFixed(18).replace(/\.?0+$/, '')
      : amount.toString();
    
    // Parse amount, handling scientific notation
    let amountInWei;
    if (amountStr.includes('e-') || amountStr.includes('E-')) {
      const num = Number(amountStr);
      const fixedStr = num.toFixed(18);
      amountInWei = ethers.parseUnits(fixedStr, 18);
    } else {
      amountInWei = ethers.parseEther(amountStr);
    }

    const tx = await tokenContract.approve(
      CONTRACT_ADDRESSES.COURSE_PAYMENT,
      amountInWei
    );

    await tx.wait();
    return {
      success: true,
      txHash: tx.hash,
    };
  } catch (error) {
    console.error('Error approving tokens:', error);
    
    // Provide user-friendly error messages
    if (error.code === 4001) {
      throw new Error('Bạn đã từ chối approve tokens');
    }
    if (error.code === 'CALL_EXCEPTION' || error.code === -32080) {
      throw new Error('Không thể kết nối với blockchain. Vui lòng kiểm tra network và thử lại.');
    }
    if (error.message.includes('network') || error.message.includes('Network')) {
      throw error; // Network error already has user-friendly message
    }
    throw error;
  }
};

/**
 * Check token approval for discount (approve to backend wallet)
 * @param {string} userAddress - User's wallet address
 * @param {number} amount - Amount of LHT to check approval for
 * @param {string} backendWalletAddress - Backend wallet address (spender)
 * @returns {Promise<object>} Approval status
 */
export const checkDiscountApproval = async (userAddress, amount, backendWalletAddress) => {
  try {
    await checkNetwork();
    
    const provider = getProvider();
    const tokenContract = new ethers.Contract(
      CONTRACT_ADDRESSES.TOKEN,
      ERC20_ABI,
      provider
    );

    // Format amount to avoid scientific notation
    const amountStr = typeof amount === 'number' 
      ? amount.toFixed(18).replace(/\.?0+$/, '')
      : amount.toString();
    
    // Parse amount, handling scientific notation
    let requiredAmount;
    if (amountStr.includes('e-') || amountStr.includes('E-')) {
      const num = Number(amountStr);
      const fixedStr = num.toFixed(18);
      requiredAmount = ethers.parseUnits(fixedStr, 18);
    } else {
      requiredAmount = ethers.parseEther(amountStr);
    }

    const allowance = await tokenContract.allowance(userAddress, backendWalletAddress);

    return {
      approved: allowance >= requiredAmount,
      allowance: ethers.formatEther(allowance),
      required: amountStr,
    };
  } catch (error) {
    console.error('Error checking discount approval:', error);
    
    if (error.code === 'CALL_EXCEPTION' || error.code === -32080) {
      throw new Error('Không thể kết nối với blockchain. Vui lòng kiểm tra network và thử lại.');
    }
    if (error.message.includes('network') || error.message.includes('Network')) {
      throw error;
    }
    throw error;
  }
};

/**
 * Approve tokens for discount (approve to backend wallet)
 * @param {number} amount - Amount of LHT to approve
 * @param {string} backendWalletAddress - Backend wallet address (spender)
 * @returns {Promise<object>} Transaction details
 */
export const approveTokensForDiscount = async (amount, backendWalletAddress) => {
  try {
    await checkNetwork();
    
    const signer = await getSigner();
    const tokenContract = new ethers.Contract(
      CONTRACT_ADDRESSES.TOKEN,
      ERC20_ABI,
      signer
    );

    // Format amount to avoid scientific notation
    const amountStr = typeof amount === 'number' 
      ? amount.toFixed(18).replace(/\.?0+$/, '')
      : amount.toString();
    
    // Parse amount, handling scientific notation
    let amountInWei;
    if (amountStr.includes('e-') || amountStr.includes('E-')) {
      const num = Number(amountStr);
      const fixedStr = num.toFixed(18);
      amountInWei = ethers.parseUnits(fixedStr, 18);
    } else {
      amountInWei = ethers.parseEther(amountStr);
    }

    // Get signer address first
    const signerAddress = await signer.getAddress();
    
    console.log('Approving tokens...');
    console.log('Approve details:', {
      owner: signerAddress,
      spender: backendWalletAddress,
      amount: amountInWei.toString(),
      amountFormatted: ethers.formatEther(amountInWei),
    });
    
    // Use a safe gas limit for ERC20 approve (usually ~46,000, we use 60,000 to be safe)
    const safeGasLimit = 60000n;
    
    let tx;
    let txHash = null;
    
    try {
      // Try with explicit gas limit first
      tx = await tokenContract.approve(backendWalletAddress, amountInWei, {
        gasLimit: safeGasLimit,
      });
      txHash = tx.hash;
      console.log('Approval transaction sent with gas limit:', txHash);
    } catch (gasLimitError) {
      console.warn('Approve with gas limit failed, trying without gas limit:', gasLimitError);
      try {
        // If that fails, try without gas limit (let MetaMask handle it)
        tx = await tokenContract.approve(backendWalletAddress, amountInWei);
        txHash = tx.hash;
        console.log('Approval transaction sent (MetaMask gas):', txHash);
      } catch (noGasError) {
        // If both fail, check if transaction was actually sent (sometimes RPC errors but tx succeeds)
        if (noGasError.transactionHash || noGasError.receipt) {
          txHash = noGasError.transactionHash || noGasError.receipt.hash;
          console.warn('Transaction may have succeeded despite error:', txHash);
          // Try to get receipt and verify
          try {
            const provider = await getProvider();
            await new Promise(resolve => setTimeout(resolve, 3000)); // Wait for transaction
            const receipt = await provider.getTransactionReceipt(txHash);
            if (receipt && receipt.status === 1) {
              console.log('Transaction confirmed despite error');
              // Continue with verification
              await new Promise(resolve => setTimeout(resolve, 2000));
              const actualAllowance = await tokenContract.allowance(signerAddress, backendWalletAddress, {
                blockTag: 'latest'
              });
              return {
                success: true,
                txHash: receipt.hash,
                blockNumber: receipt.blockNumber,
                ownerAddress: signerAddress,
                spenderAddress: backendWalletAddress,
                actualAllowance: actualAllowance.toString(),
                approved: actualAllowance >= amountInWei,
              };
            }
          } catch (receiptError) {
            console.error('Could not get receipt:', receiptError);
          }
        }
        throw noGasError;
      }
    }
    
    if (!txHash) {
      throw new Error('Transaction hash not available');
    }
    
    // Wait for transaction to be mined (at least 1 confirmation)
    console.log('Waiting for transaction confirmation...');
    let receipt;
    try {
      receipt = await tx.wait(1);
    } catch (waitError) {
      // If wait fails, try to get receipt by hash
      console.warn('tx.wait() failed, trying to get receipt by hash:', waitError);
      const provider = await getProvider();
      await new Promise(resolve => setTimeout(resolve, 3000)); // Wait a bit
      receipt = await provider.getTransactionReceipt(txHash);
      if (!receipt) {
        throw new Error('Could not get transaction receipt');
      }
    }
    
    console.log('Transaction confirmed:', {
      txHash: receipt.hash,
      blockNumber: receipt.blockNumber,
      status: receipt.status,
    });
    
    // Wait a bit more for blockchain state to update
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Verify approval was actually set
    const actualAllowance = await tokenContract.allowance(signerAddress, backendWalletAddress, {
      blockTag: 'latest'
    });
    
    console.log('Verification after approval:', {
      owner: signerAddress,
      spender: backendWalletAddress,
      approvedAmount: amountInWei.toString(),
      actualAllowance: actualAllowance.toString(),
      actualAllowanceFormatted: ethers.formatEther(actualAllowance),
      matches: actualAllowance >= amountInWei,
    });
    
    return {
      success: true,
      txHash: receipt.hash,
      blockNumber: receipt.blockNumber,
      ownerAddress: signerAddress,
      spenderAddress: backendWalletAddress,
      actualAllowance: actualAllowance.toString(),
      approved: actualAllowance >= amountInWei,
    };
  } catch (error) {
    console.error('Error approving tokens for discount:', error);
    
    if (error.code === 4001) {
      throw new Error('Bạn đã từ chối approve tokens');
    }
    
    // Handle RPC errors
    if (error.code === 'UNKNOWN_ERROR' || error.code === -32603) {
      const errorMessage = error.message || error.error?.message || 'Internal JSON-RPC error';
      const errorData = error.error?.data || error.data;
      
      console.error('RPC Error details:', {
        code: error.code,
        message: errorMessage,
        error: error.error,
        data: errorData,
        payload: error.payload,
      });
      
      // Check if transaction was actually sent (sometimes RPC returns error but tx succeeds)
      if (error.transactionHash || error.receipt) {
        console.warn('Transaction may have succeeded despite RPC error');
        throw new Error('Transaction có thể đã thành công. Vui lòng kiểm tra lại trạng thái approve.');
      }
      
      // Check if it's a gas estimation issue
      if (errorMessage.includes('gas') || errorMessage.includes('execution reverted') || errorMessage.includes('revert')) {
        throw new Error('Lỗi khi thực hiện giao dịch. Vui lòng thử lại hoặc kiểm tra số dư POL trong MetaMask.');
      }
      
      // More user-friendly error message
      throw new Error(`Lỗi kết nối blockchain. Vui lòng kiểm tra:\n1. Network đã đúng (Polygon Amoy)\n2. Số dư POL đủ để trả gas fee\n3. Thử refresh trang và approve lại`);
    }
    
    if (error.code === 'CALL_EXCEPTION' || error.code === -32080) {
      throw new Error('Không thể kết nối với blockchain. Vui lòng kiểm tra network và thử lại.');
    }
    
    if (error.message.includes('network') || error.message.includes('Network')) {
      throw error;
    }
    
    throw error;
  }
};
