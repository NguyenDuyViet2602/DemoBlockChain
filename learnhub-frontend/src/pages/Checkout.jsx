import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaCreditCard, FaLock, FaSpinner } from 'react-icons/fa';
import { useToast } from '../contexts/ToastContext';

const Checkout = () => {
  const toast = useToast();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [promotionCode, setPromotionCode] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchCartItems();
  }, []);

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

  const handlePayment = async () => {
    if (cartItems.length === 0) {
      toast.warning('Giỏ hàng của bạn đang trống');
      navigate('/cart');
      return;
    }

    try {
      setProcessing(true);
      setError(null);
      const token = localStorage.getItem('token');
      
      // Tạo payment URL hoặc xử lý khóa học miễn phí
      const response = await axios.post(
        'http://localhost:8080/api/v1/payment/create-payment-url',
        { promotionCode: promotionCode || null },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const { paymentUrl, isFree, orderId } = response.data.data;

      if (isFree) {
        // Khóa học miễn phí - redirect đến payment result
        navigate(`/payment/result?success=true&orderId=${orderId}`);
      } else if (paymentUrl) {
        // Redirect đến VNPay
        window.location.href = paymentUrl;
      } else {
        setError('Không thể tạo payment URL');
      }
    } catch (err) {
      console.error('Error creating payment:', err);
      setError(err.response?.data?.message || 'Lỗi khi tạo thanh toán');
    } finally {
      setProcessing(false);
    }
  };

  const totalAmount = cartItems.reduce((sum, item) => {
    const price = item.course?.price || 0;
    return sum + price;
  }, 0);

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
                  <span>{totalAmount.toLocaleString('vi-VN')} đ</span>
                </div>
                <div className="flex justify-between font-bold text-lg text-gray-900 pt-2 border-t">
                  <span>Tổng cộng:</span>
                  <span className="text-emerald-600">{totalAmount.toLocaleString('vi-VN')} đ</span>
                </div>
              </div>

              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-600 text-sm">
                  {error}
                </div>
              )}

              <button
                onClick={handlePayment}
                disabled={processing || cartItems.length === 0}
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
                ) : (
                  <>
                    <FaCreditCard />
                    <span>Thanh toán với VNPay</span>
                  </>
                )}
              </button>

              <div className="mt-4 flex items-center gap-2 text-sm text-gray-600">
                <FaLock />
                <span>Thanh toán an toàn với VNPay</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;

