import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaCreditCard, FaLock, FaSpinner, FaCoins } from 'react-icons/fa';
import { useToast } from '../contexts/ToastContext';
import { useBlockchain } from '../contexts/BlockchainContext';
import BLOCKCHAIN_API from '../services/blockchain.service';
import { approveTokens, checkTokenApproval } from '../utils/ethers-helper';

const Checkout = () => {
  const toast = useToast();
  const { tokenBalance, isConnected, walletAddress, connectMetaMask } = useBlockchain();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [promotionCode, setPromotionCode] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('vnpay'); // 'vnpay' or 'lht'
  const [orderId, setOrderId] = useState(null);
  const [lhtPaymentInfo, setLhtPaymentInfo] = useState(null);
  const [loadingLhtInfo, setLoadingLhtInfo] = useState(false);
  const [approving, setApproving] = useState(false);
  const [estimatedLHT, setEstimatedLHT] = useState(null);
  // LHT Discount states
  const [useLhtDiscount, setUseLhtDiscount] = useState(false);
  const [lhtDiscountAmount, setLhtDiscountAmount] = useState(0);
  const [maxLhtDiscount, setMaxLhtDiscount] = useState(null);
  const [loadingMaxDiscount, setLoadingMaxDiscount] = useState(false);
  const [discountApprovalStatus, setDiscountApprovalStatus] = useState(null);
  const [checkingDiscountApproval, setCheckingDiscountApproval] = useState(false);
  const [approvingDiscount, setApprovingDiscount] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCartItems();
  }, []);

  // Calculate total amount
  const originalTotal = cartItems.reduce((sum, item) => {
    const price = item.course?.price || 0;
    return sum + price;
  }, 0);

  // Calculate LHT discount (1 LHT = 1000 VND)
  // LHT chỉ có thể thay thế tối đa 30% giá trị đơn hàng
  const maxDiscountAllowed = maxLhtDiscount 
    ? maxLhtDiscount.maxDiscountAllowed 
    : (originalTotal * 30) / 100;
  
  const lhtDiscountVND = useLhtDiscount && lhtDiscountAmount > 0 
    ? Math.min(lhtDiscountAmount * 1000, maxDiscountAllowed, originalTotal)
    : 0;

  // Final total after discount
  const totalAmount = Math.max(0, originalTotal - lhtDiscountVND);

  // Load max LHT discount when cart items change
  useEffect(() => {
    if (originalTotal > 0 && isConnected) {
      loadMaxLhtDiscount();
    } else {
      setMaxLhtDiscount(null);
    }
  }, [originalTotal, isConnected]);

  // Calculate estimated LHT when payment method changes to LHT
  useEffect(() => {
    if (paymentMethod === 'lht' && originalTotal > 0) {
      calculateEstimatedLHT();
    } else {
      setEstimatedLHT(null);
    }
  }, [paymentMethod, originalTotal]);

  // Load LHT payment info when order is created and payment method is LHT
  useEffect(() => {
    if (orderId && paymentMethod === 'lht') {
      loadLhtPaymentInfo();
    }
  }, [orderId, paymentMethod]);

  const calculateEstimatedLHT = async () => {
    if (originalTotal === 0) return;
    
    try {
      const response = await BLOCKCHAIN_API.calculateLHT(originalTotal);
      if (response.success) {
        setEstimatedLHT(response.data.lhtAmount);
      }
    } catch (err) {
      console.error('Error calculating estimated LHT:', err);
    }
  };

  const loadMaxLhtDiscount = async () => {
    if (originalTotal === 0) return;
    
    try {
      setLoadingMaxDiscount(true);
      const response = await BLOCKCHAIN_API.getMaxLHTDiscount(originalTotal);
      if (response.success) {
        setMaxLhtDiscount(response.data);
        // Auto-set max if user wants to use all available
        if (useLhtDiscount && response.data.maxLHT > 0) {
          setLhtDiscountAmount(response.data.maxLHT);
        }
        // Check approval status if discount is enabled
        if (useLhtDiscount && response.data.maxLHT > 0 && walletAddress) {
          await checkDiscountApprovalStatus();
        }
      }
    } catch (err) {
      console.error('Error loading max LHT discount:', err);
      setMaxLhtDiscount(null);
    } finally {
      setLoadingMaxDiscount(false);
    }
  };

  const checkDiscountApprovalStatus = async (ownerAddress = null) => {
    const addressToCheck = ownerAddress || walletAddress;
    
    if (!addressToCheck || !lhtDiscountAmount || lhtDiscountAmount <= 0) {
      return { approved: false };
    }
    
    try {
      setCheckingDiscountApproval(true);
      // Get backend wallet address
      const backendWalletResponse = await BLOCKCHAIN_API.getBackendWalletAddress();
      if (!backendWalletResponse.success) {
        throw new Error('Không thể lấy địa chỉ backend wallet');
      }
      
      const backendWalletAddress = backendWalletResponse.data.address;
      
      console.log('Checking approval status:', {
        ownerAddress: addressToCheck,
        spenderAddress: backendWalletAddress,
        lhtDiscountAmount,
        walletAddressFromContext: walletAddress,
        addressesMatch: addressToCheck.toLowerCase() === walletAddress?.toLowerCase(),
      });
      
      // Check approval using ethers-helper
      const { checkDiscountApproval } = await import('../utils/ethers-helper');
      const approvalStatus = await checkDiscountApproval(
        addressToCheck, // Use the provided address or walletAddress
        lhtDiscountAmount,
        backendWalletAddress
      );
      
      console.log('Approval status result:', approvalStatus);
      setDiscountApprovalStatus(approvalStatus);
      return approvalStatus;
    } catch (err) {
      console.error('Error checking discount approval:', err);
      const errorStatus = { approved: false, allowance: '0', required: lhtDiscountAmount.toString() };
      setDiscountApprovalStatus(errorStatus);
      return errorStatus;
    } finally {
      setCheckingDiscountApproval(false);
    }
  };

  const handleApproveDiscountTokens = async () => {
    if (!walletAddress || !lhtDiscountAmount || lhtDiscountAmount <= 0) {
      toast.error('Vui lòng nhập số LHT muốn dùng để giảm giá');
      return;
    }

    try {
      setApprovingDiscount(true);
      setError(null);

      // Get backend wallet address
      const backendWalletResponse = await BLOCKCHAIN_API.getBackendWalletAddress();
      if (!backendWalletResponse.success) {
        throw new Error('Không thể lấy địa chỉ backend wallet');
      }
      
      const backendWalletAddress = backendWalletResponse.data.address;

      // Approve tokens
      const { approveTokensForDiscount } = await import('../utils/ethers-helper');
      
      const approveResult = await approveTokensForDiscount(lhtDiscountAmount, backendWalletAddress);
      
      console.log('Approve result:', approveResult);
      
      // Check if approval was successful from the result
      if (approveResult.approved) {
        toast.success('Approve tokens thành công!');
        // Update approval status immediately
        await checkDiscountApprovalStatus();
        return; // Exit early if already approved
      }
      
      toast.success('Transaction đã được gửi! Đang kiểm tra lại...');
      
      // Wait a bit for blockchain to update (blockchain needs time to process)
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Use the owner address from approval result if available
      const ownerAddressToCheck = approveResult.ownerAddress || walletAddress;
      console.log('Using owner address for check:', ownerAddressToCheck);
      
      // Refresh approval status with retry (using correct owner address)
      let retries = 5;
      let approved = false;
      let lastStatus = null;
      
      while (retries > 0 && !approved) {
        console.log(`Checking approval status (${retries} retries left)...`);
        
        // Wait before checking
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Check approval status using the correct owner address
        lastStatus = await checkDiscountApprovalStatus(ownerAddressToCheck);
        
        console.log('Approval check result:', lastStatus);
        console.log('Details:', {
          approved: lastStatus?.approved,
          allowance: lastStatus?.allowance,
          required: lastStatus?.required,
          allowanceRaw: lastStatus?.allowanceRaw,
          requiredRaw: lastStatus?.requiredRaw,
        });
        
        if (lastStatus?.approved) {
          approved = true;
          toast.success('Đã xác nhận approve thành công!');
          break;
        } else {
          retries--;
          if (retries > 0) {
            console.log(`Not approved yet. Allowance: ${lastStatus?.allowance}, Required: ${lastStatus?.required}`);
            console.log(`Allowance (raw): ${lastStatus?.allowanceRaw}, Required (raw): ${lastStatus?.requiredRaw}`);
          }
        }
      }
      
      if (!approved) {
        console.warn('Approval status check failed after retries:', lastStatus);
        console.warn('Transaction hash:', approveResult.txHash);
        console.warn('Owner address used:', ownerAddressToCheck);
        
        // Even if retries failed, try one more time after a longer wait
        console.log('Waiting 5 more seconds and checking one final time...');
        await new Promise(resolve => setTimeout(resolve, 5000));
        const finalCheck = await checkDiscountApprovalStatus(ownerAddressToCheck);
        
        if (finalCheck?.approved) {
          toast.success('Đã xác nhận approve thành công!');
        } else {
          // Transaction succeeded on blockchain but check still fails
          // This might be due to address mismatch or blockchain delay
          console.warn('Transaction succeeded but approval check still fails. This might be an address mismatch issue.');
          toast.warning('Transaction đã thành công trên blockchain. Đang kiểm tra lại...');
          
          // Force refresh approval status multiple times
          for (let i = 0; i < 3; i++) {
            await new Promise(resolve => setTimeout(resolve, 3000));
            const refreshCheck = await checkDiscountApprovalStatus(ownerAddressToCheck);
            if (refreshCheck?.approved) {
              toast.success('Đã xác nhận approve thành công!');
              return; // Exit if approved
            }
          }
          
          // If still not approved, show message and allow manual refresh
          toast.info('Nếu transaction đã thành công, vui lòng refresh trang để cập nhật trạng thái.');
        }
      } else {
        // If approved, make sure state is updated
        await checkDiscountApprovalStatus(ownerAddressToCheck);
      }
    } catch (err) {
      console.error('Error approving discount tokens:', err);
      if (err.code === 4001) {
        toast.error('Bạn đã từ chối approve tokens');
      } else {
        toast.error(err.message || 'Lỗi khi approve tokens');
      }
    } finally {
      setApprovingDiscount(false);
    }
  };

  // Update discount amount when user changes input
  const handleLhtDiscountChange = (value) => {
    const numValue = parseFloat(value) || 0;
    if (maxLhtDiscount) {
      const maxValue = maxLhtDiscount.maxLHT;
      const finalValue = Math.min(Math.max(0, numValue), maxValue);
      setLhtDiscountAmount(finalValue);
      // Check approval status when amount changes
      if (finalValue > 0 && walletAddress) {
        checkDiscountApprovalStatus();
      }
    } else {
      setLhtDiscountAmount(numValue);
    }
  };

  // Check approval when discount amount or wallet changes
  useEffect(() => {
    if (useLhtDiscount && lhtDiscountAmount > 0 && walletAddress && maxLhtDiscount) {
      // Add a small delay to avoid too many checks
      const timer = setTimeout(() => {
        checkDiscountApprovalStatus();
      }, 500);
      return () => clearTimeout(timer);
    } else {
      setDiscountApprovalStatus(null);
    }
  }, [useLhtDiscount, lhtDiscountAmount, walletAddress, maxLhtDiscount]);

  const fetchCartItems = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/');
        return;
      }

      const response = await axios.get('http://localhost:8080/api/v1/cart', {
        headers: { Authorization: `Bearer ${token}` },
      });

      setCartItems(response.data.data || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching cart:', err);
      setError('Lỗi khi tải giỏ hàng');
    } finally {
      setLoading(false);
    }
  };

  const loadLhtPaymentInfo = async () => {
    if (!orderId) return;
    
    try {
      setLoadingLhtInfo(true);
      const response = await BLOCKCHAIN_API.getLHTPaymentInfo(orderId);
      if (response.success) {
        setLhtPaymentInfo(response.data);
      }
    } catch (err) {
      console.error('Error loading LHT payment info:', err);
      toast.error('Không thể tải thông tin thanh toán LHT');
    } finally {
      setLoadingLhtInfo(false);
    }
  };

  const handleCreateOrder = async () => {
    if (cartItems.length === 0) {
      toast.warning('Giỏ hàng của bạn đang trống');
      navigate('/cart');
      return;
    }

    try {
      setProcessing(true);
      setError(null);
      const token = localStorage.getItem('token');
      
      // Tạo order với LHT discount nếu có
      const requestBody = {
        promotionCode: promotionCode || null,
        lhtDiscountAmount: useLhtDiscount && lhtDiscountAmount > 0 ? lhtDiscountAmount : null,
      };
      
      const response = await axios.post(
        'http://localhost:8080/api/v1/payment/create-payment-url',
        requestBody,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const { paymentUrl, isFree, orderId: newOrderId } = response.data.data;
      setOrderId(newOrderId);

      if (isFree) {
        // Khóa học miễn phí - redirect đến payment result
        navigate(`/payment/result?success=true&orderId=${newOrderId}`);
        return;
      }

      // If VNPay, redirect immediately
      if (paymentMethod === 'vnpay' && paymentUrl) {
        window.location.href = paymentUrl;
        return;
      }

      // If LHT, load payment info
      if (paymentMethod === 'lht') {
        await loadLhtPaymentInfo();
      }
    } catch (err) {
      console.error('Error creating order:', err);
      setError(err.response?.data?.message || 'Lỗi khi tạo đơn hàng');
    } finally {
      setProcessing(false);
    }
  };

  const handleApproveTokens = async () => {
    if (!lhtPaymentInfo || !walletAddress) {
      toast.error('Vui lòng kết nối ví MetaMask trước');
      return;
    }

    try {
      setApproving(true);
      setError(null);

      // Check if already approved
      const approvalStatus = await checkTokenApproval(
        walletAddress,
        lhtPaymentInfo.requiredLHT
      );

      if (approvalStatus.approved) {
        toast.success('Tokens đã được approve');
        await loadLhtPaymentInfo(); // Refresh info
        return;
      }

      // Approve tokens
      await approveTokens(lhtPaymentInfo.requiredLHT);
      toast.success('Approve tokens thành công!');
      await loadLhtPaymentInfo(); // Refresh info
    } catch (err) {
      console.error('Error approving tokens:', err);
      if (err.code === 4001) {
        toast.error('Bạn đã từ chối approve tokens');
      } else {
        toast.error(err.message || 'Lỗi khi approve tokens');
      }
    } finally {
      setApproving(false);
    }
  };

  const handlePayWithLHT = async () => {
    if (!orderId) {
      toast.error('Vui lòng tạo đơn hàng trước');
      return;
    }

    if (!isConnected || !walletAddress) {
      toast.error('Vui lòng kết nối ví MetaMask trước');
      const connected = await connectMetaMask();
      if (!connected) return;
    }

    if (!lhtPaymentInfo) {
      toast.error('Vui lòng tải thông tin thanh toán');
      return;
    }

    if (!lhtPaymentInfo.hasEnoughBalance) {
      toast.error('Số dư LHT không đủ');
      return;
    }

    if (lhtPaymentInfo.needsApproval) {
      toast.warning('Vui lòng approve tokens trước');
      return;
    }

    try {
      setProcessing(true);
      setError(null);

      const response = await BLOCKCHAIN_API.payWithLHT(orderId);
      
      if (response.success) {
        toast.success('Thanh toán bằng LHT thành công!');
        navigate(`/payment/result?success=true&orderId=${orderId}`);
      } else {
        setError(response.message || 'Thanh toán thất bại');
      }
    } catch (err) {
      console.error('Error paying with LHT:', err);
      setError(err.response?.data?.message || 'Lỗi khi thanh toán bằng LHT');
    } finally {
      setProcessing(false);
    }
  };

  const handlePayment = async () => {
    if (paymentMethod === 'lht') {
      // For LHT, first create order if not exists
      if (!orderId) {
        // Create order first, then it will auto-load LHT info via useEffect
        await handleCreateOrder();
      } else {
        // Order exists, proceed with payment
        await handlePayWithLHT();
      }
    } else {
      // For VNPay, create order and redirect
      await handleCreateOrder();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang tải...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Thanh toán</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Order Summary */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Đơn hàng của bạn</h2>
              <div className="space-y-4">
                {cartItems.map((item) => (
                  <div key={item.cartid || item.courseid} className="flex items-center gap-4">
                    <img
                      src={item.course?.imageurl || '/placeholder-course.jpg'}
                      alt={item.course?.coursename}
                      className="w-20 h-20 object-cover rounded"
                    />
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{item.course?.coursename}</h3>
                      <p className="text-emerald-600 font-bold">
                        {item.course?.price?.toLocaleString('vi-VN')} đ
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Payment Method Selection */}
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Phương thức thanh toán</h2>
              <div className="space-y-3">
                <label className="flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="vnpay"
                    checked={paymentMethod === 'vnpay'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-5 h-5 text-emerald-600"
                  />
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900">Thanh toán qua VNPay</div>
                    <div className="text-sm text-gray-600">Thẻ ngân hàng, Ví điện tử</div>
                  </div>
                  <FaCreditCard className="text-2xl text-gray-400" />
                </label>

                <label className="flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="lht"
                    checked={paymentMethod === 'lht'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-5 h-5 text-emerald-600"
                  />
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900">Thanh toán bằng LHT</div>
                    <div className="text-sm text-gray-600">Sử dụng LearnHub Token</div>
                  </div>
                  <FaCoins className="text-2xl text-yellow-500" />
                </label>
              </div>
            </div>

            {/* LHT Discount (only for VNPay) */}
            {paymentMethod === 'vnpay' && isConnected && (
              <div className="bg-white rounded-lg shadow p-6 mb-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Giảm giá bằng LHT</h2>
                <div className="space-y-4">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={useLhtDiscount}
                      onChange={(e) => {
                        setUseLhtDiscount(e.target.checked);
                        if (!e.target.checked) {
                          setLhtDiscountAmount(0);
                        } else if (maxLhtDiscount && maxLhtDiscount.maxLHT > 0) {
                          setLhtDiscountAmount(maxLhtDiscount.maxLHT);
                        }
                      }}
                      className="w-5 h-5 text-emerald-600"
                    />
                    <span className="text-gray-700">Sử dụng LHT để giảm giá (1 LHT = 1,000 VND)</span>
                  </label>

                  {useLhtDiscount && (
                    <div className="space-y-3 pl-8">
                      {loadingMaxDiscount ? (
                        <div className="text-sm text-gray-600">Đang tải thông tin...</div>
                      ) : maxLhtDiscount ? (
                        <>
                          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg mb-3">
                            <div className="text-xs text-blue-800 font-medium">
                              ⚠️ LHT chỉ có thể thay thế tối đa {maxLhtDiscount.maxDiscountPercentage}% giá trị đơn hàng
                            </div>
                          </div>
                          <div className="text-sm text-gray-600">
                            Số dư LHT của bạn: <span className="font-semibold text-gray-900">{maxLhtDiscount.userBalance.toFixed(2)} LHT</span>
                          </div>
                          <div className="text-sm text-gray-600">
                            Có thể dùng tối đa: <span className="font-semibold text-emerald-600">{maxLhtDiscount.maxLHT.toFixed(2)} LHT</span>
                            {' '}(= {maxLhtDiscount.maxDiscount.toLocaleString('vi-VN')} đ giảm giá)
                          </div>
                          <div className="text-xs text-gray-500">
                            Giới hạn: {maxLhtDiscount.maxDiscountAllowed.toLocaleString('vi-VN')} đ ({maxLhtDiscount.maxDiscountPercentage}% đơn hàng)
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Số LHT muốn dùng:
                            </label>
                            <input
                              type="number"
                              min="0"
                              max={maxLhtDiscount.maxLHT}
                              step="0.01"
                              value={lhtDiscountAmount}
                              onChange={(e) => handleLhtDiscountChange(e.target.value)}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600"
                              placeholder="0.00"
                            />
                            <div className="mt-1 text-xs text-gray-500">
                              Giảm giá: <span className="font-semibold text-emerald-600">
                                {Math.min(lhtDiscountAmount * 1000, maxLhtDiscount.maxDiscountAllowed).toLocaleString('vi-VN')} đ
                              </span>
                              {' '}({((Math.min(lhtDiscountAmount * 1000, maxLhtDiscount.maxDiscountAllowed) / originalTotal) * 100).toFixed(1)}% đơn hàng)
                            </div>
                            
                            {/* Approval Status */}
                            {lhtDiscountAmount > 0 && (
                              <div className="mt-3 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                                {checkingDiscountApproval ? (
                                  <div className="text-sm text-gray-600">Đang kiểm tra approval...</div>
                                ) : discountApprovalStatus ? (
                                  <div className="space-y-2">
                                    <div className="flex items-center justify-between text-sm">
                                      <span className="text-gray-600">Trạng thái approval:</span>
                                      <div className="flex items-center gap-2">
                                        <span className={`font-semibold ${
                                          discountApprovalStatus.approved ? 'text-green-600' : 'text-red-600'
                                        }`}>
                                          {discountApprovalStatus.approved ? '✓ Đã approve' : '✗ Chưa approve'}
                                        </span>
                                        <button
                                          onClick={() => checkDiscountApprovalStatus()}
                                          disabled={checkingDiscountApproval}
                                          className="text-xs text-blue-600 hover:text-blue-800 underline disabled:text-gray-400 disabled:no-underline"
                                          title="Kiểm tra lại trạng thái approve"
                                        >
                                          {checkingDiscountApproval ? 'Đang kiểm tra...' : 'Làm mới'}
                                        </button>
                                      </div>
                                    </div>
                                    {!discountApprovalStatus.approved && (
                                      <div className="mt-2">
                                        <button
                                          onClick={handleApproveDiscountTokens}
                                          disabled={approvingDiscount || !isConnected}
                                          className="w-full bg-blue-600 text-white py-2 rounded text-sm font-medium hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                        >
                                          {approvingDiscount ? (
                                            <>
                                              <FaSpinner className="animate-spin" />
                                              <span>Đang approve...</span>
                                            </>
                                          ) : (
                                            <span>Approve {lhtDiscountAmount.toFixed(2)} LHT</span>
                                          )}
                                        </button>
                                        <div className="mt-1 text-xs text-gray-500">
                                          Cần approve để hệ thống có thể trừ LHT sau khi thanh toán thành công
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                ) : (
                                  <div className="text-sm text-gray-600">
                                    Vui lòng nhập số LHT để kiểm tra approval
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </>
                      ) : (
                        <div className="text-sm text-red-600">
                          Không thể tải thông tin LHT. Vui lòng kiểm tra kết nối ví.
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Promotion Code */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Mã khuyến mãi</h2>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={promotionCode}
                  onChange={(e) => setPromotionCode(e.target.value)}
                  placeholder="Nhập mã khuyến mãi"
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>
            </div>
          </div>

          {/* Payment Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6 sticky top-4">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Tóm tắt</h2>
              <div className="space-y-2 mb-6">
                <div className="flex justify-between text-gray-600">
                  <span>Tạm tính:</span>
                  <span>{originalTotal.toLocaleString('vi-VN')} đ</span>
                </div>
                {useLhtDiscount && lhtDiscountVND > 0 && (
                  <div className="flex justify-between text-emerald-600">
                    <span>Giảm giá LHT:</span>
                    <span>-{lhtDiscountVND.toLocaleString('vi-VN')} đ</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-lg text-gray-900 pt-2 border-t">
                  <span>Tổng cộng:</span>
                  <span className="text-emerald-600">{totalAmount.toLocaleString('vi-VN')} đ</span>
                </div>
              </div>

              {/* LHT Payment Info */}
              {paymentMethod === 'lht' && (
                <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-3">
                    <FaCoins className="text-yellow-600" />
                    <h3 className="font-semibold text-gray-900">Thanh toán bằng LHT</h3>
                  </div>
                  
                  {loadingLhtInfo ? (
                    <div className="text-sm text-gray-600">Đang tải thông tin...</div>
                  ) : lhtPaymentInfo ? (
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Cần thanh toán:</span>
                        <span className="font-semibold text-gray-900">
                          {lhtPaymentInfo.requiredLHT.toFixed(2)} LHT
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Số dư của bạn:</span>
                        <span className={`font-semibold ${
                          lhtPaymentInfo.hasEnoughBalance ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {lhtPaymentInfo.userBalance.toFixed(2)} LHT
                        </span>
                      </div>
                      {!lhtPaymentInfo.hasEnoughBalance && (
                        <div className="text-red-600 text-xs mt-2">
                          ⚠️ Số dư không đủ
                        </div>
                      )}
                      {lhtPaymentInfo.needsApproval && (
                        <div className="mt-3">
                          <button
                            onClick={handleApproveTokens}
                            disabled={approving || !isConnected}
                            className="w-full bg-blue-600 text-white py-2 rounded text-sm font-medium hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                          >
                            {approving ? (
                              <>
                                <FaSpinner className="animate-spin" />
                                <span>Đang approve...</span>
                              </>
                            ) : (
                              <span>Approve {lhtPaymentInfo.requiredLHT.toFixed(2)} LHT</span>
                            )}
                          </button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-2 text-sm">
                      {estimatedLHT && (
                        <div className="flex justify-between mb-2">
                          <span className="text-gray-600">Ước tính:</span>
                          <span className="font-semibold text-gray-900">
                            ~{parseFloat(estimatedLHT).toFixed(2)} LHT
                          </span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-gray-600">Số dư của bạn:</span>
                        <span className="font-semibold text-gray-900">
                          {parseFloat(tokenBalance || '0').toFixed(2)} LHT
                        </span>
                      </div>
                      {!isConnected ? (
                        <div className="mt-3">
                          <p className="text-xs text-gray-600 mb-2">Vui lòng kết nối ví để thanh toán bằng LHT</p>
                          <button
                            onClick={connectMetaMask}
                            className="w-full bg-blue-600 text-white py-2 rounded text-sm font-medium hover:bg-blue-700"
                          >
                            Kết nối MetaMask
                          </button>
                        </div>
                      ) : (
                        <p className="text-xs text-gray-600 mt-2">Tạo đơn hàng để xem thông tin chính xác</p>
                      )}
                    </div>
                  )}
                </div>
              )}

              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-600 text-sm">
                  {error}
                </div>
              )}

              <button
                onClick={handlePayment}
                disabled={
                  processing || 
                  cartItems.length === 0 || 
                  (paymentMethod === 'lht' && (!isConnected || (lhtPaymentInfo && (!lhtPaymentInfo.hasEnoughBalance || lhtPaymentInfo.needsApproval)))) ||
                  (paymentMethod === 'vnpay' && useLhtDiscount && lhtDiscountAmount > 0 && discountApprovalStatus && !discountApprovalStatus.approved)
                }
                className="w-full bg-emerald-600 text-white py-3 rounded-lg font-semibold hover:bg-emerald-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {processing ? (
                  <>
                    <FaSpinner className="animate-spin" />
                    <span>Đang xử lý...</span>
                  </>
                ) : totalAmount === 0 ? (
                  <>
                    <FaCreditCard />
                    <span>Đăng ký miễn phí</span>
                  </>
                ) : paymentMethod === 'lht' ? (
                  <>
                    <FaCoins />
                    <span>Thanh toán bằng LHT</span>
                  </>
                ) : (
                  <>
                    <FaCreditCard />
                    <span>Thanh toán với VNPay</span>
                  </>
                )}
              </button>

              <div className="mt-4 flex items-center gap-2 text-sm text-gray-600">
                <FaLock />
                <span>
                  {paymentMethod === 'lht' 
                    ? 'Thanh toán an toàn với Blockchain' 
                    : 'Thanh toán an toàn với VNPay'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;

