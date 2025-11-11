import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaTrash, FaShoppingCart, FaStar } from 'react-icons/fa';
import { useToast } from '../contexts/ToastContext';

const Cart = () => {
  const toast = useToast();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [recommendedCourses, setRecommendedCourses] = useState([]);
  const [loadingRecommended, setLoadingRecommended] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCartItems();
    fetchRecommendedCourses();
  }, []);

  useEffect(() => {
    // Refresh recommended courses when cart items change
    if (cartItems.length > 0) {
      fetchRecommendedCourses();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cartItems]);

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

  const handleRemoveItem = async (courseId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:8080/api/v1/cart/${courseId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Remove from local state
      setCartItems(prev => prev.filter(item => item.courseid !== courseId));
    } catch (err) {
      console.error('Error removing item:', err);
      toast.error('Lỗi khi xóa khóa học khỏi giỏ hàng');
    }
  };

  const fetchRecommendedCourses = async () => {
    try {
      setLoadingRecommended(true);
      const response = await axios.get('http://localhost:8080/api/v1/courses', {
        params: {
          page: 1,
          limit: 8,
          sortBy: 'createdat',
          sortOrder: 'DESC',
        },
      });

      const allCourses = response.data.data?.courses || [];
      // Loại trừ các khóa học đã có trong giỏ hàng
      const cartCourseIds = cartItems.map(item => item.courseid);
      const filteredCourses = allCourses.filter(
        course => !cartCourseIds.includes(course.courseid)
      );
      
      setRecommendedCourses(filteredCourses.slice(0, 6));
    } catch (err) {
      console.error('Error fetching recommended courses:', err);
    } finally {
      setLoadingRecommended(false);
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
          <p className="mt-4 text-gray-600">Đang tải giỏ hàng...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">{error}</p>
          <button
            onClick={fetchCartItems}
            className="mt-4 px-4 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Giỏ hàng của tôi</h1>

        {cartItems.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <FaShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 text-lg mb-4">Giỏ hàng của bạn đang trống</p>
            <button
              onClick={() => navigate('/')}
              className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
            >
              Khám phá khóa học
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Cart Items */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow">
                {cartItems.map((item) => (
                  <div
                    key={item.cartid || item.courseid}
                    className="flex items-center gap-4 p-4 border-b border-gray-200 last:border-b-0"
                  >
                    <img
                      src={item.course?.imageurl || '/placeholder-course.jpg'}
                      alt={item.course?.coursename}
                      className="w-24 h-24 object-cover rounded"
                    />
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{item.course?.coursename}</h3>
                      <p className="text-emerald-600 font-bold text-lg">
                        {item.course?.price?.toLocaleString('vi-VN')} đ
                      </p>
                    </div>
                    <button
                      onClick={() => handleRemoveItem(item.courseid)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                      title="Xóa khỏi giỏ hàng"
                    >
                      <FaTrash />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow p-6 sticky top-4">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Tóm tắt đơn hàng</h2>
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-gray-600">
                    <span>Tạm tính:</span>
                    <span>{totalAmount.toLocaleString('vi-VN')} đ</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg text-gray-900 pt-2 border-t">
                    <span>Tổng cộng:</span>
                    <span className="text-emerald-600">{totalAmount.toLocaleString('vi-VN')} đ</span>
                  </div>
                </div>
                <button
                  onClick={() => navigate('/checkout')}
                  className="w-full bg-emerald-600 text-white py-3 rounded-lg font-semibold hover:bg-emerald-700 transition-colors"
                >
                  {totalAmount === 0 ? 'Đăng ký miễn phí' : 'Thanh toán'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Recommended Courses Section */}
        {recommendedCourses.length > 0 && (
          <div className="mt-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Khóa học gợi ý</h2>
              <button
                onClick={() => navigate('/')}
                className="text-emerald-600 hover:text-emerald-700 font-medium transition-colors"
              >
                Xem tất cả →
              </button>
            </div>
            <div className="overflow-x-auto pb-4 -mx-4 px-4">
              <div className="flex gap-6 min-w-max">
                {recommendedCourses.map((course) => (
                  <div
                    key={course.courseid}
                    onClick={() => navigate(`/course/${course.courseid}`)}
                    className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow cursor-pointer overflow-hidden group flex-shrink-0 w-64"
                  >
                    <div className="relative aspect-video overflow-hidden">
                      <img
                        src={course.thumbnailurl || course.imageurl || '/placeholder-course.jpg'}
                        alt={course.coursename}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      {course.price === 0 && (
                        <span className="absolute top-2 right-2 bg-emerald-600 text-white text-xs font-semibold px-2 py-1 rounded">
                          Miễn phí
                        </span>
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-emerald-600 transition-colors">
                        {course.coursename}
                      </h3>
                      {course.teacher && (
                        <p className="text-sm text-gray-600 mb-2">
                          {course.teacher.fullname || 'Giảng viên'}
                        </p>
                      )}
                      <div className="flex items-center justify-between mt-3">
                        <span className="text-emerald-600 font-bold text-lg">
                          {course.price === 0
                            ? 'Miễn phí'
                            : `${(course.price || 0).toLocaleString('vi-VN')} đ`}
                        </span>
                        {course.averageRating > 0 && (
                          <div className="flex items-center gap-1 text-sm text-gray-600">
                            <FaStar className="text-amber-500" />
                            <span>{parseFloat(course.averageRating).toFixed(1)}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;

