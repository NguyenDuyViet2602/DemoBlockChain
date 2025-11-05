import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { FaFacebookF, FaGoogle } from 'react-icons/fa';
import axios from 'axios';
import abstractBg from '../assets/bgSignup.png'; // Đường dẫn đến hình ảnh
import LoginPopup from './LoginPopup';

const SignupPopup = ({ onClose }) => {
    const [email, setEmail] = useState('');
    const [fullName, setFullName] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [showLogin, setShowLogin] = useState(false); // State để hiển thị LoginPopup
    const [isOpen, setIsOpen] = useState(false); // State để điều khiển hiệu ứng fade
    const [emailCheckError, setEmailCheckError] = useState('');

    useEffect(() => {
        // Khi component mount (mở popup), kích hoạt fade-in
        setIsOpen(true);
    }, []);

    const checkEmailAvailability = async (email) => {
        try {
            await axios.post('http://localhost:8080/api/v1/auth/register', { email, password: '', fullName: '' });
        } catch (err) {
            if (err.response && err.response.status === 400 && err.response.data.message === 'Email đã tồn tại') {
                setEmailCheckError('Email đã tồn tại');
            } else {
                setEmailCheckError('');
            }
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            if (email) {
                checkEmailAvailability(email);
            } else {
                setEmailCheckError('');
            }
        }, 500);
        return () => clearTimeout(timer);
    }, [email]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (!fullName) {
            setError('Vui lòng nhập họ và tên');
            return;
        }
        if (!email) {
            setError('Vui lòng nhập email');
            return;
        }
        if (emailCheckError) {
            setError(emailCheckError);
            return;
        }
        if (!password) {
            setError('Vui lòng nhập mật khẩu');
            return;
        }
        if (password !== confirmPassword) {
            setError('Mật khẩu xác nhận không khớp');
            return;
        }
        try {
            const response = await axios.post('http://localhost:8080/api/v1/auth/register', { email, password, fullName });
            const { token, user } = response.data;
            
            // Lưu token và user info vào localStorage
            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(user));
            
            // Trigger custom event để Header cập nhật
            window.dispatchEvent(new Event('userLogin'));
            
            handleClose();
        } catch (err) {
            console.log('Error:', err.response ? err.response.data : err.message);
            setError(err.response?.data?.message || 'Đăng ký thất bại');
        }
    };

    const handleSwitchToLogin = (e) => {
        e.preventDefault();
        setShowLogin(true); // Mở LoginPopup
    };

    const handleClose = () => {
        setIsOpen(false); // Bắt đầu fade-out
        setTimeout(() => onClose(), 300); // Đợi animation hoàn tất (300ms) rồi đóng hoàn toàn
    };

    return createPortal(
        <>
            {/* SignupPopup */}
            {isOpen && (
                <div
                    className={`fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 ${isOpen ? 'opacity-100' : 'opacity-0'
                        } transition-opacity duration-300`}
                    onClick={handleClose} // Đóng khi nhấp ngoài popup
                >
                    <div
                        className={`relative bg-white rounded-lg shadow-lg flex overflow-hidden ${isOpen ? 'opacity-100' : 'opacity-0'
                            } transition-opacity duration-300 md:w-[800px] md:h-[550px] w-[90%] h-auto max-h-[90vh]`}
                        onClick={(e) => e.stopPropagation()} // Ngăn chặn sự kiện nhấp lan ra ngoài
                    >
                        {/* Phần hình ảnh bên trái */}
                        <div className="w-1/2 h-full hidden md:block">
                            <img
                                src={abstractBg}
                                alt="Abstract Background"
                                className="w-full h-full object-cover"
                            />
                        </div>

                        {/* Phần form bên phải */}
                        <div className="w-full md:w-1/2 p-6 flex flex-col justify-center">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-xl font-semibold">LearnHub</h2>
                                <button
                                    onClick={handleClose}
                                    className="text-gray-500 hover:text-gray-700 text-2xl"
                                >
                                    &times;
                                </button>
                            </div>
                            <p className="text-center text-gray-600 mb-4">
                                Bắt đầu hành trình của bạn với LearnHub.
                            </p>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <input
                                        type="text"
                                        value={fullName}
                                        onChange={(e) => setFullName(e.target.value)}
                                        placeholder="Họ và tên"
                                        className="w-full p-2 border rounded"
                                    />
                                </div>
                                <div>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="Email"
                                        className="w-full p-2 border rounded"
                                    />
                                    {emailCheckError && <p className="text-red-500 text-xs mt-1">{emailCheckError}</p>}
                                </div>
                                <div>
                                    <input
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="Mật khẩu"
                                        className="w-full p-2 border rounded"
                                    />
                                </div>
                                <div>
                                    <input
                                        type="password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        placeholder="Xác nhận mật khẩu"
                                        className="w-full p-2 border rounded"
                                    />
                                </div>
                                {error && <p className="text-red-500 text-sm">{error}</p>}
                                <button
                                    type="submit"
                                    className="font-semibold w-full bg-green-500 text-white p-2 rounded hover:bg-green-600"
                                >
                                    Đăng ký
                                </button>
                            </form>
                            <div className="text-center my-2">Hoặc</div>
                            <div className="space-y-2">
                                <button className="font-semibold w-full flex items-center justify-center bg-blue-600 text-white p-2 rounded hover:bg-blue-700">
                                    <FaFacebookF className="mr-2" /> Tiếp tục với Facebook
                                </button>
                                <button className="font-semibold w-full flex items-center justify-center bg-gray-200 text-black p-2 rounded hover:bg-gray-300">
                                    <FaGoogle className="mr-2" /> Tiếp tục với Google
                                </button>
                            </div>
                            <p className="text-center mt-4 text-sm text-gray-600">
                                Đã có tài khoản?{' '}
                                <a href="#" onClick={handleSwitchToLogin} className="text-blue-500 cursor-pointer">
                                    Đăng nhập
                                </a>
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* LoginPopup */}
            {showLogin && <LoginPopup onClose={() => { setShowLogin(false); onClose(); }} />}
        </>
        , document.body
    );
};

export default SignupPopup;