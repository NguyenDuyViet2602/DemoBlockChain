// src/components/Header.jsx
import React, { useState, useEffect, useRef } from 'react';
import { FaUser, FaSignOutAlt, FaShoppingCart, FaHeart, FaBell, FaCog } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import LoginPopup from './LoginPopup';
import SignupPopup from './SignupPopup';

function Header() {
  const [openBrowse, setOpenBrowse] = useState(false);
  const [openAccount, setOpenAccount] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('token'));
  const [user, setUser] = useState(() => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  });
  const [showLoginPopup, setShowLoginPopup] = useState(false);
  const [showSignupPopup, setShowSignupPopup] = useState(false);
  const browseRef = useRef(null);
  const accountRef = useRef(null);
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

    // Check on mount
    handleStorageChange();

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('userLogin', handleStorageChange);
      window.removeEventListener('userLogout', handleStorageChange);
    };
  }, []);

  useEffect(() => {
    const onClick = (e) => {
      if (browseRef.current && !browseRef.current.contains(e.target)) setOpenBrowse(false);
      if (accountRef.current && !accountRef.current.contains(e.target)) setOpenAccount(false);
    };
    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, []);

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
    // TODO: Implement become instructor functionality
    console.log('Become Instructor clicked');
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
        <a href="/" className="flex items-center gap-2 shrink-0">
          <span className="grid h-8 w-8 place-items-center rounded-full bg-emerald-600 text-white font-extrabold">m</span>
          <span className="font-bold text-lg tracking-tight">MyCourse.io</span>
        </a>

        <nav className="hidden md:flex items-center gap-6 text-sm text-gray-500">
          <div ref={browseRef} className="relative">
            <button onClick={() => setOpenBrowse((v) => !v)} className="hover:text-gray-900 transition-colors flex items-center gap-1">
              Duyệt
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-4 w-4"><path fill="currentColor" d="M7 10l5 5 5-5z" /></svg>
            </button>
            {openBrowse && (
              <div className="absolute left-0 mt-2 w-48 rounded-lg border bg-white p-2 shadow-lg z-50">
                <a className="block rounded-md px-3 py-2 text-sm hover:bg-gray-50" href="#">Lập trình</a>
                <a className="block rounded-md px-3 py-2 text-sm hover:bg-gray-50" href="#">Thiết kế</a>
                <a className="block rounded-md px-3 py-2 text-sm hover:bg-gray-50" href="#">Kinh doanh</a>
                <a className="block rounded-md px-3 py-2 text-sm hover:bg-gray-50" href="#">Marketing</a>
              </div>
            )}
          </div>
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <div className="hidden sm:block">
            <SearchInput className="w-[280px] md:w-[360px]" />
          </div>
          <IconButton ariaLabel="Giỏ hàng">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="size-5"><path d="M6 6h15l-1.5 9h-12z" /><path d="M6 6l-2 0" /><circle cx="9" cy="21" r="1" /><circle cx="18" cy="21" r="1" /></svg>
          </IconButton>
          {/* Hiển thị "Become Instructor" nếu không phải Teacher */}
          {isLoggedIn && user && user.role !== 'Teacher' && (
            <button
              onClick={handleBecomeInstructor}
              className="hidden md:flex items-center gap-2 px-4 py-2 text-sm font-medium text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-full transition-colors"
            >
              Trở thành Giảng viên
            </button>
          )}
          <IconButton ariaLabel="Thông báo">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="size-5"><path d="M6 8a6 6 0 1112 0c0 7 2 5 2 7H4c0-2 2 0 2-7" /><path d="M13.73 21a2 2 0 01-3.46 0" /></svg>
          </IconButton>
          <div ref={accountRef} className="relative">
            {isLoggedIn && user ? (
              <button
                onClick={() => setOpenAccount((v) => !v)}
                className="flex items-center gap-2 px-3 py-2 rounded-full hover:bg-gray-100 transition-colors"
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
                      className="block w-full text-left rounded-md px-4 py-3 text-sm hover:bg-gray-50 transition-colors"
                    >
                      Đăng nhập
                    </button>
                    <button
                      onClick={() => {
                        setShowSignupPopup(true);
                        setOpenAccount(false);
                      }}
                      className="block w-full text-left rounded-md px-4 py-3 text-sm hover:bg-gray-50 transition-colors"
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
                          navigate('/profile');
                          setOpenAccount(false);
                        }}
                        className="flex items-center gap-3 w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors"
                      >
                        <FaUser className="text-gray-400" />
                        <span>Khóa học của tôi</span>
                      </button>
                      <button
                        onClick={() => {
                          // TODO: Navigate to cart
                          setOpenAccount(false);
                        }}
                        className="flex items-center gap-3 w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors"
                      >
                        <FaShoppingCart className="text-gray-400" />
                        <span>Giỏ hàng của tôi</span>
                      </button>
                      <button
                        onClick={() => {
                          // TODO: Navigate to wishlist
                          setOpenAccount(false);
                        }}
                        className="flex items-center gap-3 w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors"
                      >
                        <FaHeart className="text-gray-400" />
                        <span>Wishlist</span>
                      </button>
                      <button
                        onClick={() => {
                          // TODO: Navigate to notifications
                          setOpenAccount(false);
                        }}
                        className="flex items-center gap-3 w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors"
                      >
                        <FaBell className="text-gray-400" />
                        <span>Notifications</span>
                      </button>
                      <button
                        onClick={() => {
                          navigate('/profile');
                          setOpenAccount(false);
                        }}
                        className="flex items-center gap-3 w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors"
                      >
                        <FaCog className="text-gray-400" />
                        <span>Account Settings</span>
                      </button>
                      <div className="border-t my-1"></div>
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 w-full text-left px-4 py-2.5 text-sm hover:bg-red-50 text-red-600 transition-colors"
                      >
                        <FaSignOutAlt className="text-red-400" />
                        <span>Logout</span>
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
    <button onClick={onClick} aria-label={ariaLabel} className="p-2 rounded-full hover:bg-gray-100 transition-colors">
      {children}
    </button>
  );
}

export default Header;
