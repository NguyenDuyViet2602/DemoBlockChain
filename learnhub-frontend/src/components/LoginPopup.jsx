import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { FaFacebookF, FaGoogle } from 'react-icons/fa';
import axios from 'axios';
import abstractBg from '../assets/bgLogin.png'; // Đường dẫn đến hình ảnh
import SignupPopup from './SignupPopup'; // Import SignupPopup
import { useNavigate } from 'react-router-dom'; // Thêm để điều hướng

const LoginPopup = ({ onClose }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [showSignup, setShowSignup] = useState(false); // State để hiển thị SignupPopup
    const [isOpen, setIsOpen] = useState(false); // State để điều khiển hiệu ứng fade
    const navigate = useNavigate(); // Hook để điều hướng

    useEffect(() => {
        // Khi component mount (mở popup), kích hoạt fade-in
        setIsOpen(true);
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (!email) {
            setError('Vui lòng nhập email');
            return;
        }
        if (!password) {
            setError('Vui lòng nhập mật khẩu');
            return;
        }
        try {
            const response = await axios.post('http://localhost:8080/api/v1/auth/login', { email, password });
            const { token, user } = response.data;
            
            // Lưu token và user info vào localStorage
            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(user));
            
            // Trigger custom event để Header cập nhật
            window.dispatchEvent(new Event('userLogin'));

            // Xử lý điều hướng dựa trên role
            switch (user.role) {
                case 'Student':
                    navigate('/');
                    break;
                case 'Teacher':
                    navigate('/teacher');
                    break;
                case 'Admin':
                    navigate('/admin');
                    break;
                default:
                    navigate('/');
                    break;
            }

            handleClose(); // Đóng popup sau khi điều hướng
        } catch (err) {
            setError(err.response?.data?.message || 'Tài khoản hoặc mật khẩu không đúng');
        }
    };

    const handleSwitchToSignup = (e) => {
        e.preventDefault();
        setShowSignup(true); // Mở SignupPopup
    };

    const handleClose = () => {
        setIsOpen(false); // Bắt đầu fade-out
        setTimeout(() => onClose(), 300); // Đợi animation hoàn tất (300ms) rồi đóng hoàn toàn
    };

    // Render cả LoginPopup và SignupPopup trong cùng Portal
    return createPortal(
        <>
            {/* LoginPopup */}
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
                                <h2 className="text-xl font-semibold text-gray-800">LearnHub</h2>
                                <button
                                    onClick={handleClose}
                                    className="text-gray-500 hover:text-gray-700 text-2xl"
                                >
                                    &times;
                                </button>
                            </div>
                            <p className="text-center text-gray-600 mb-4">
                                Học tập và phát triển cùng LearnHub.
                            </p>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="Email"
                                        className="w-full p-2 border rounded"
                                    />
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
                                {error && <p className="text-red-500 text-sm">{error}</p>}
                                <button
                                    type="submit"
                                    className="font-semibold w-full bg-green-500 text-white p-2 rounded-xl hover:bg-green-600"
                                >
                                    Đăng nhập
                                </button>
                            </form>
                            <div className="text-center my-2">Hoặc</div>
                            <div className="space-y-2">
                                <button className="font-semibold w-full flex items-center justify-center bg-blue-600 text-white p-2 rounded-xl hover:bg-blue-700">
                                    <FaFacebookF className="mr-2" /> Tiếp tục với Facebook
                                </button>
                                <button className="font-semibold w-full flex items-center justify-center bg-gray-200 text-black p-2 rounded-xl hover:bg-gray-300">
                                    <FaGoogle className="mr-2" /> Tiếp tục với Google
                                </button>
                            </div>
                            <p className="text-center mt-4 text-sm text-gray-600">
                                Chưa có tài khoản?{' '}
                                <a href="#" onClick={handleSwitchToSignup} className="text-blue-500 cursor-pointer">
                                    Đăng ký
                                </a>
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* SignupPopup */}
            {showSignup && <SignupPopup onClose={() => { setShowSignup(false); onClose(); }} />}
        </>
        , document.body
    );
};

export default LoginPopup;