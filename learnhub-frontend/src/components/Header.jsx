// src/components/Header.jsx
import React, { useState, useEffect, useRef } from 'react';
import { FaUser, FaSignOutAlt, FaShoppingCart, FaHeart, FaBell, FaCog, FaTrash } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import LoginPopup from './LoginPopup';
import SignupPopup from './SignupPopup';
import NotificationBell from './NotificationBell';
import { useToast } from '../contexts/ToastContext';

function Header() {
  const toast = useToast();
  const [openBrowse, setOpenBrowse] = useState(false);
  const [openAccount, setOpenAccount] = useState(false);
  const [openCart, setOpenCart] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('token'));
  const [user, setUser] = useState(() => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  });
  const [cartItems, setCartItems] = useState([]);
  const [loadingCart, setLoadingCart] = useState(false);
  const [showLoginPopup, setShowLoginPopup] = useState(false);
  const [showSignupPopup, setShowSignupPopup] = useState(false);
  const browseRef = useRef(null);
  const accountRef = useRef(null);
  const cartRef = useRef(null);
  const navigate = useNavigate();

  // Listen for storage changes and custom events (when login/logout happens)
  useEffect(() => {
    const handleStorageChange = () => {
      const token = localStorage.getItem('token');
      const userStr = localStorage.getItem('user');
      setIsLoggedIn(!!token);
      setUser(userStr ? JSON.parse(userStr) : null);
    };

    // Listen for storage events (from other tabs)
    window.addEventListener('storage', handleStorageChange);
    
    // Listen for custom event (from same tab)
    window.addEventListener('userLogin', handleStorageChange);
    window.addEventListener('userLogout', handleStorageChange);
    window.addEventListener('userUpdate', handleStorageChange);

    // Check on mount
    handleStorageChange();

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('userLogin', handleStorageChange);
      window.removeEventListener('userLogout', handleStorageChange);
      window.removeEventListener('userUpdate', handleStorageChange);
    };
  }, []);

  useEffect(() => {
    const onClick = (e) => {
      if (browseRef.current && !browseRef.current.contains(e.target)) setOpenBrowse(false);
      if (accountRef.current && !accountRef.current.contains(e.target)) setOpenAccount(false);
      if (cartRef.current && !cartRef.current.contains(e.target)) setOpenCart(false);
    };
    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, []);

  // Fetch cart items when user is logged in
  useEffect(() => {
    if (isLoggedIn) {
      fetchCartItems();
    } else {
      setCartItems([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoggedIn]);

  const fetchCartItems = async () => {
    if (!isLoggedIn) return;
    try {
      setLoadingCart(true);
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:8080/api/v1/cart', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCartItems(response.data.data || []);
    } catch (err) {
      console.error('Error fetching cart:', err);
      // Don't show error if user is not logged in
      if (err.response?.status !== 401) {
        setCartItems([]);
      }
    } finally {
      setLoadingCart(false);
    }
  };

  const handleRemoveFromCart = async (courseId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:8080/api/v1/cart/${courseId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCartItems(prev => prev.filter(item => item.courseid !== courseId));
      toast.success('Đã xóa khóa học khỏi giỏ hàng');
    } catch (err) {
      console.error('Error removing from cart:', err);
      toast.error('Lỗi khi xóa khóa học khỏi giỏ hàng');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsLoggedIn(false);
    setUser(null);
    setOpenAccount(false);
    // Trigger custom event để các components khác cập nhật
    window.dispatchEvent(new Event('userLogout'));
    navigate('/');
  };

  const handleBecomeInstructor = () => {
    navigate('/become-instructor');
    setOpenAccount(false);
  };

  const getUserDisplayName = () => {
    if (!user) return '';
    return user.full_name || user.fullName || user.email || 'Người dùng';
  };

  const getUserEmail = () => {
    if (!user) return '';
    return user.email || '';
  };

  const getUserRole = () => {
    if (!user) return '';
    const roleMap = {
      'Student': 'Học viên',
      'Teacher': 'Giảng viên',
      'Admin': 'Quản trị viên'
    };
    return roleMap[user.role] || user.role || '';
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="container px-6 flex h-16 items-center gap-4">
        <a href="/" className="flex items-center gap-2 shrink-0 cursor-pointer">
          <span className="grid h-8 w-8 place-items-center rounded-full bg-emerald-600 text-white font-extrabold">m</span>
          <span className="font-bold text-lg tracking-tight">MyCourse.io</span>
        </a>

        <nav className="hidden md:flex items-center gap-6 text-sm text-gray-500">
          <div ref={browseRef} className="relative">
            <button onClick={() => setOpenBrowse((v) => !v)} className="hover:text-gray-900 transition-colors flex items-center gap-1 cursor-pointer">
              Duyệt
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-4 w-4"><path fill="currentColor" d="M7 10l5 5 5-5z" /></svg>
            </button>
            {openBrowse && (
              <div className="absolute left-0 mt-2 w-48 rounded-lg border bg-white p-2 shadow-lg z-50">
                <a className="block rounded-md px-3 py-2 text-sm hover:bg-gray-50 cursor-pointer" href="#">Lập trình</a>
                <a className="block rounded-md px-3 py-2 text-sm hover:bg-gray-50 cursor-pointer" href="#">Thiết kế</a>
                <a className="block rounded-md px-3 py-2 text-sm hover:bg-gray-50 cursor-pointer" href="#">Kinh doanh</a>
                <a className="block rounded-md px-3 py-2 text-sm hover:bg-gray-50 cursor-pointer" href="#">Marketing</a>
              </div>
            )}
          </div>
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <div className="hidden sm:block">
            <SearchInput className="w-[280px] md:w-[360px]" />
          </div>
          <div ref={cartRef} className="relative">
            <button
              onClick={() => {
                if (isLoggedIn) {
                  setOpenCart(!openCart);
                  fetchCartItems();
                } else {
                  setShowLoginPopup(true);
                }
              }}
              className="relative p-2 rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
              ariaLabel="Giỏ hàng"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="size-5"><path d="M6 6h15l-1.5 9h-12z" /><path d="M6 6l-2 0" /><circle cx="9" cy="21" r="1" /><circle cx="18" cy="21" r="1" /></svg>
              {isLoggedIn && cartItems.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-emerald-600 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  {cartItems.length}
                </span>
              )}
            </button>
            {openCart && isLoggedIn && (
              <div className="absolute right-0 mt-2 w-80 rounded-lg border bg-white shadow-lg z-50 max-h-96 overflow-hidden flex flex-col">
                <div className="p-4 border-b">
                  <h3 className="font-semibold text-gray-900">Giỏ hàng ({cartItems.length})</h3>
                </div>
                <div className="overflow-y-auto flex-1">
                  {loadingCart ? (
                    <div className="p-4 text-center text-gray-500">Đang tải...</div>
                  ) : cartItems.length === 0 ? (
                    <div className="p-4 text-center text-gray-500">
                      <FaShoppingCart className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                      <p>Giỏ hàng trống</p>
                    </div>
                  ) : (
                    <div className="divide-y">
                      {cartItems.map((item) => (
                        <div
                          key={item.cartid || item.courseid}
                          className="flex items-center gap-3 p-4 hover:bg-gray-50 transition-colors"
                        >
                          <img
                            src={item.course?.thumbnailurl || item.course?.imageurl || '/placeholder-course.jpg'}
                            alt={item.course?.coursename}
                            className="w-16 h-16 object-cover rounded"
                          />
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-sm text-gray-900 truncate">
                              {item.course?.coursename || 'Khóa học'}
                            </h4>
                            <p className="text-emerald-600 font-semibold text-sm mt-1">
                              {item.course?.price === 0 
                                ? 'Miễn phí' 
                                : `${(item.course?.price || 0).toLocaleString('vi-VN')} đ`}
                            </p>
                          </div>
                          <button
                            onClick={() => handleRemoveFromCart(item.courseid)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors flex-shrink-0"
                            title="Xóa khỏi giỏ hàng"
                          >
                            <FaTrash className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                {cartItems.length > 0 && (
                  <div className="p-4 border-t bg-gray-50">
                    <div className="flex justify-between items-center mb-3">
                      <span className="font-semibold text-gray-900">Tổng cộng:</span>
                      <span className="text-emerald-600 font-bold text-lg">
                        {cartItems.reduce((sum, item) => sum + (item.course?.price || 0), 0).toLocaleString('vi-VN')} đ
                      </span>
                    </div>
                    <button
                      onClick={() => {
                        navigate('/cart');
                        setOpenCart(false);
                      }}
                      className="w-full bg-emerald-600 text-white py-2 rounded-lg font-semibold hover:bg-emerald-700 transition-colors"
                    >
                      Xem giỏ hàng
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
          {/* Hiển thị "Giảng Viên" nếu là Teacher */}
          {isLoggedIn && user && user.role === 'Teacher' && (
            <button
              onClick={() => navigate('/teacher')}
              className="hidden md:flex items-center gap-2 px-4 py-2 text-sm font-medium text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-full transition-colors cursor-pointer"
            >
              Giảng Viên
            </button>
          )}
          {/* Hiển thị "Trở thành Giảng viên" nếu không phải Teacher */}
          {isLoggedIn && user && user.role !== 'Teacher' && (
            <button
              onClick={handleBecomeInstructor}
              className="hidden md:flex items-center gap-2 px-4 py-2 text-sm font-medium text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-full transition-colors cursor-pointer"
            >
              Trở thành Giảng viên
            </button>
          )}
          <NotificationBell />
          <div ref={accountRef} className="relative">
            {isLoggedIn && user ? (
              <button
                onClick={() => setOpenAccount((v) => !v)}
                className="flex items-center gap-2 px-3 py-2 rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
              >
                {user.profilepicture ? (
                  <img
                    src={user.profilepicture}
                    alt={getUserDisplayName()}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center font-semibold text-sm">
                    {getUserDisplayName().charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="hidden md:block text-left">
                  <div className="text-sm font-medium text-gray-900">{getUserDisplayName()}</div>
                  <div className="text-xs text-gray-500">{getUserRole()}</div>
                </div>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-4 h-4 text-gray-500">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            ) : (
              <IconButton ariaLabel="Tài khoản" onClick={() => setOpenAccount((v) => !v)}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="size-5"><circle cx="12" cy="8" r="4" /><path d="M6 20c0-3.3 2.7-6 6-6s6 2.7 6 6" /></svg>
              </IconButton>
            )}
            {openAccount && (
              <div className="absolute right-0 mt-2 w-64 rounded-lg border bg-white shadow-lg z-50 overflow-hidden">
                {!isLoggedIn ? (
                  <>
                    <button
                      onClick={() => {
                        setShowLoginPopup(true);
                        setOpenAccount(false);
                      }}
                      className="block w-full text-left rounded-md px-4 py-3 text-sm hover:bg-gray-50 transition-colors cursor-pointer"
                    >
                      Đăng nhập
                    </button>
                    <button
                      onClick={() => {
                        setShowSignupPopup(true);
                        setOpenAccount(false);
                      }}
                      className="block w-full text-left rounded-md px-4 py-3 text-sm hover:bg-gray-50 transition-colors cursor-pointer"
                    >
                      Đăng ký
                    </button>
                  </>
                ) : (
                  <>
                    {/* User Info Header */}
                    <div className="px-4 py-3 border-b bg-gray-50">
                      <div className="font-semibold text-gray-900">{getUserDisplayName()}</div>
                      <div className="text-xs text-gray-500 mt-1">{getUserEmail()}</div>
                    </div>
                    
                    {/* Menu Items */}
                    <div className="py-2">
                      <button
                        onClick={() => {
                          navigate('/my-courses');
                          setOpenAccount(false);
                        }}
                        className="flex items-center gap-3 w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors cursor-pointer"
                      >
                        <FaUser className="text-gray-400" />
                        <span>Khóa học của tôi</span>
                      </button>
                      <button
                        onClick={() => {
                          navigate('/cart');
                          setOpenAccount(false);
                        }}
                        className="flex items-center gap-3 w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors cursor-pointer"
                      >
                        <FaShoppingCart className="text-gray-400" />
                        <span>Giỏ hàng của tôi</span>
                      </button>
                      <button
                        onClick={() => {
                          navigate('/my-courses?tab=wishlist');
                          setOpenAccount(false);
                        }}
                        className="flex items-center gap-3 w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors cursor-pointer"
                      >
                        <FaHeart className="text-gray-400" />
                        <span>Danh sách yêu thích</span>
                      </button>
                      <button
                        onClick={() => {
                          navigate('/notifications');
                          setOpenAccount(false);
                        }}
                        className="flex items-center gap-3 w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors cursor-pointer"
                      >
                        <FaBell className="text-gray-400" />
                        <span>Thông báo</span>
                      </button>
                      <button
                        onClick={() => {
                          navigate('/profile');
                          setOpenAccount(false);
                        }}
                        className="flex items-center gap-3 w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors cursor-pointer"
                      >
                        <FaCog className="text-gray-400" />
                        <span>Cài đặt tài khoản</span>
                      </button>
                      <div className="border-t my-1"></div>
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 w-full text-left px-4 py-2.5 text-sm hover:bg-red-50 text-red-600 transition-colors cursor-pointer"
                      >
                        <FaSignOutAlt className="text-red-400" />
                        <span>Đăng xuất</span>
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="sm:hidden border-t p-3">
        <SearchInput />
      </div>

      {showLoginPopup && (
        <LoginPopup
          onClose={() => {
            setShowLoginPopup(false);
            const token = localStorage.getItem('token');
            const userStr = localStorage.getItem('user');
            setIsLoggedIn(!!token);
            setUser(userStr ? JSON.parse(userStr) : null);
          }}
        />
      )}

      {showSignupPopup && (
        <SignupPopup
          onClose={() => {
            setShowSignupPopup(false);
            const token = localStorage.getItem('token');
            const userStr = localStorage.getItem('user');
            setIsLoggedIn(!!token);
            setUser(userStr ? JSON.parse(userStr) : null);
          }}
        />
      )}
    </header>
  );
}

function SearchInput({ className }) {
  const navigate = useNavigate();
  const [searchValue, setSearchValue] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (searchValue.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchValue.trim())}`);
    } else {
      navigate('/search');
    }
  };

  return (
    <form onSubmit={handleSubmit} className={`relative ${className || ''}`}>
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 size-4"><circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" /></svg>
      <input
        type="text"
        value={searchValue}
        onChange={(e) => setSearchValue(e.target.value)}
        aria-label="Tìm kiếm khóa học"
        placeholder="Tìm kiếm khóa học"
        className="w-full rounded-full border bg-white pl-9 pr-4 h-10 text-sm outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
      />
    </form>
  );
}

function IconButton({ children, ariaLabel, onClick }) {
  return (
    <button onClick={onClick} aria-label={ariaLabel} className="p-2 rounded-full hover:bg-gray-100 transition-colors cursor-pointer">
      {children}
    </button>
  );
}

export default Header;
