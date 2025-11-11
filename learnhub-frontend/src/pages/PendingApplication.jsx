import { useNavigate } from 'react-router-dom';

export default function ApplicationPendingReview() {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user'));
    const userEmail = user?.email || 'your email';
    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4 py-12">
            <div className="bg-white rounded-lg shadow-2xl p-8 max-w-2xl w-full">
                {/* Biểu tượng */}
                <div className="flex justify-center mb-8">
                    <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center text-6xl animate-pulse">
                        ⏱️
                    </div>
                </div>

                {/* Tiêu đề chính */}
                <h1 className="text-4xl font-bold text-gray-900 text-center mb-4">
                    Đơn đăng ký của bạn đang được xem xét
                </h1>

                {/* Văn bản mô tả */}
                <p className="text-lg text-gray-600 text-center mb-12 leading-relaxed">
                    Cảm ơn bạn đã quan tâm đến việc trở thành giảng viên! Đội ngũ của chúng tôi đã nhận được đơn đăng ký của bạn và đang xem xét chi tiết bạn đã gửi. Quy trình này thường mất <span className="font-semibold text-gray-900">2-3 ngày làm việc</span>.
                </p>

                {/* Phần Tiếp Theo */}
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-8 mb-10 border-l-4 border-blue-500">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Tiếp Theo Là Gì?</h2>

                    <div className="space-y-4">
                        <div className="flex gap-4 items-start">
                            <div className="flex-shrink-0">
                                <div className="flex items-center justify-center h-8 w-8 rounded-full bg-blue-500 text-white font-semibold text-sm">
                                    ✓
                                </div>
                            </div>
                            <div>
                                <p className="text-gray-900 font-semibold">Đã Nhận Đơn</p>
                                <p className="text-gray-600 text-sm mt-1">Chúng tôi đã nhận thành công đơn đăng ký của bạn và tất cả thông tin bạn cung cấp.</p>
                            </div>
                        </div>

                        <div className="flex gap-4 items-start">
                            <div className="flex-shrink-0">
                                <div className="flex items-center justify-center h-8 w-8 rounded-full bg-blue-300 text-white font-semibold text-sm">
                                    →
                                </div>
                            </div>
                            <div>
                                <p className="text-gray-900 font-semibold">Đang Xem Xét</p>
                                <p className="text-gray-600 text-sm mt-1">Đội ngũ của chúng tôi đang xem xét kỹ lưỡng trình độ và chi tiết đơn đăng ký của bạn.</p>
                            </div>
                        </div>

                        <div className="flex gap-4 items-start">
                            <div className="flex-shrink-0">
                                <div className="flex items-center justify-center h-8 w-8 rounded-full bg-gray-300 text-gray-600 font-semibold text-sm">
                                    3
                                </div>
                            </div>
                            <div>
                                <p className="text-gray-900 font-semibold">Email Quyết Định</p>
                                <p className="text-gray-600 text-sm mt-1">Bạn sẽ nhận được thông báo qua email tại <span className="font-mono bg-gray-100 px-2 py-1 rounded text-xs">{userEmail}</span> ngay khi có quyết định.</p>
                            </div>
                        </div>
                    </div>

                    <div className="mt-8 pt-6 border-t border-blue-200">
                        <p className="text-sm text-gray-700 flex items-start gap-2">
                            <span className="text-orange-500 text-lg flex-shrink-0">💡</span>
                            <span><strong>Lưu ý:</strong> Không cần gửi lại đơn đăng ký. Vui lòng không gửi các đơn trùng lặp vì điều này có thể làm chậm quá trình xem xét.</span>
                        </p>
                    </div>
                </div>

                {/* Phần Câu Hỏi Thường Gặp */}
                <div className="mb-12">
                    <h3 className="text-xl font-bold text-gray-900 mb-6">Câu Hỏi Thường Gặp</h3>

                    <div className="space-y-4">
                        <div className="border-b border-gray-200 pb-4">
                            <p className="font-semibold text-gray-900 mb-2">Quá trình xem xét mất bao lâu?</p>
                            <p className="text-gray-600 text-sm">Thường là 2-3 ngày làm việc. Trong một số trường hợp, có thể mất đến một tuần trong các kỳ cao điểm.</p>
                        </div>

                        <div className="border-b border-gray-200 pb-4">
                            <p className="font-semibold text-gray-900 mb-2">Tôi không nhận được email thì sao?</p>
                            <p className="text-gray-600 text-sm">Vui lòng kiểm tra thư mục spam/junk. Nếu sau 7 ngày làm việc vẫn không thấy, hãy liên hệ với đội hỗ trợ của chúng tôi.</p>
                        </div>

                        <div className="pb-4">
                            <p className="font-semibold text-gray-900 mb-2">Tôi có thể cập nhật đơn đăng ký không?</p>
                            <p className="text-gray-600 text-sm">Sau khi gửi, các đơn đăng ký không thể chỉnh sửa. Nếu bạn cần cung cấp thông tin bổ sung, hãy liên hệ với đội hỗ trợ của chúng tôi.</p>
                        </div>
                    </div>
                </div>

                {/* Phần Hỗ Trợ */}
                <div className="bg-orange-50 rounded-lg p-6 mb-12 border-l-4 border-orange-500">
                    <p className="text-gray-900 font-semibold mb-2">Có Câu Hỏi Hoặc Cần Hỗ Trợ?</p>
                    <p className="text-gray-600 text-sm mb-4">
                        Liên hệ với đội hỗ trợ giảng viên của chúng tôi:
                    </p>
                    <div className="space-y-2">
                        <p className="text-gray-700">
                            <span className="font-semibold">Email:</span> <a href="mailto:instructor-support@platform.com" className="text-orange-600 hover:text-orange-700">instructor-support@platform.com</a>
                        </p>
                        <p className="text-gray-700">
                            <span className="font-semibold">Thời gian phản hồi:</span> Trong vòng 24 giờ
                        </p>
                    </div>
                </div>

                {/* Nút CTA */}
                <div className="flex flex-col sm:flex-row gap-4">
                    <button
                        onClick={() => navigate('/')}
                        className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition shadow-md hover:shadow-lg"
                    >
                        Quay Về Trang Chủ
                    </button>
                    <button
                        onClick={() => navigate('/teacher-requests')}
                        className="flex-1 px-6 py-3 border-2 border-blue-600 text-blue-600 hover:bg-blue-50 rounded-lg font-semibold transition"
                    >
                        Tìm Hiểu Thêm Về Giảng Dạy
                    </button>
                </div>

                {/* Ghi chú Footer */}
                <p className="text-center text-xs text-gray-500 mt-8">
                    Trạng Thái Đơn: <span className="font-semibold text-orange-600">ĐANG CHỜ XEM XÉT</span>
                </p>
            </div>
        </div>
    );
}

