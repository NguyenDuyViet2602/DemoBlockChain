import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../contexts/ToastContext';

export default function BecomeInstructor() {
    const navigate = useNavigate();
    const toast = useToast();

    const HandleStartTeachingToday = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                toast.warning('Vui lòng đăng nhập để tiếp tục.');
                navigate('/login');
                return;
            }
            const response = await fetch('http://localhost:8080/api/v1/teacher/requests', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
            });
            if (!response.ok) {
                navigate('/apply');
                return;
            }
            const data = await response.json();
            if (data.status === 'Pending') {
                navigate('/pending-application');
            } else if (data.status === 'Approved') {
                toast.info('Bạn đã là giảng viên.');
                navigate('/teacher');
            } else {
                navigate('/apply');
            }
        } catch (error) {
            console.error('Error checking status:', error.message);
            toast.error('Có lỗi xảy ra khi kiểm tra trạng thái. Vui lòng thử lại hoặc liên hệ hỗ trợ.');
        }
    };

    return (
        <div className="bg-white">
            {/* PHẦN HERO */}
            <section id="hero" className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center relative overflow-hidden">
                <div className="absolute top-0 right-0 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative z-10">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                        <div>
                            <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-6">
                                Chia Sẻ Đam Mê Của Bạn.<br />
                                <span className="text-blue-600">Định Hình Tương Lai Của Họ.</span><br />
                                Tự Do Kiếm Tiền.
                            </h1>
                            <p className="text-xl text-gray-700 mb-8 leading-relaxed">
                                Tham gia nền tảng của chúng tôi, biến chuyên môn của bạn thành sự nghiệp giảng dạy toàn cầu và tiếp cận hàng triệu học viên trên toàn thế giới.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 mb-8">
                                <button
                                    onClick={HandleStartTeachingToday}
                                    className="px-8 py-4 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-bold text-lg shadow-lg hover:shadow-xl transition transform hover:scale-105"
                                >
                                    Bắt Đầu Giảng Dạy Hôm Nay →
                                </button>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-gray-600">
                                <span className="flex items-center gap-1">✓ Miễn phí đăng ký</span>
                                <span className="flex items-center gap-1">✓ Không mất phí ban đầu</span>
                                <span className="flex items-center gap-1">✓ Giữ 80% doanh thu</span>
                            </div>
                        </div>

                        <div className="hidden lg:block">
                            <div className="relative">
                                <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-indigo-600 rounded-2xl transform -rotate-6 scale-105 opacity-75"></div>
                                <div className="relative bg-gradient-to-br from-orange-400 to-blue-500 rounded-2xl h-96 flex items-center justify-center text-white text-7xl font-bold shadow-2xl">
                                    👨‍🏫
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* GIÁ TRỊ ĐỀ XUẤT */}
            <section id="why-teach" className="py-20 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold text-gray-900 mb-4">Tại Sao Nên Giảng Dạy Với Chúng Tôi?</h2>
                        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                            Chúng tôi đã xây dựng một nền tảng giúp các giảng viên thành công và phát triển
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        <ValueCard
                            icon="💰"
                            title="Kiếm Doanh Thu Ý Nghĩa"
                            description="Kiếm tiền mỗi khi học viên mua khóa học của bạn. Nhận thanh toán hàng tháng qua các phương thức thanh toán an toàn."
                        />
                        <ValueCard
                            icon="🎨"
                            title="Giảng Dạy Theo Cách Của Bạn"
                            description="Đăng tải khóa học bạn muốn, theo cách bạn muốn. Bạn luôn giữ toàn quyền kiểm soát nội dung của mình."
                        />
                        <ValueCard
                            icon="🌍"
                            title="Cộng Đồng Toàn Cầu"
                            description="Tiếp cận hàng triệu học viên trên toàn thế giới và tham gia cộng đồng hỗ trợ của các giảng viên khác."
                        />
                        <ValueCard
                            icon="⭐"
                            title="Xây Dựng Thương Hiệu Của Bạn"
                            description="Khẳng định bản thân là chuyên gia trong lĩnh vực của bạn và xây dựng thương hiệu cá nhân mở ra nhiều cơ hội."
                        />
                    </div>
                </div>
            </section>

            {/* CÁCH HOẠT ĐỘNG */}
            <section id="how-it-works" className="py-20 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold text-gray-900 mb-4">Cách Hoạt Động</h2>
                        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                            Ba bước đơn giản để bắt đầu sự nghiệp giảng dạy của bạn
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
                        {/* Đường nối cho desktop */}
                        <div className="hidden md:block absolute top-20 left-1/4 right-1/4 h-1 bg-gradient-to-r from-orange-300 to-orange-500 transform -translate-y-1/2"></div>

                        <StepCard
                            number="1"
                            title="Lập Kế Hoạch & Ghi Hình"
                            description="Tạo dàn ý khóa học và ghi hình các bài học video chất lượng cao bằng công cụ dễ sử dụng của chúng tôi."
                        />
                        <StepCard
                            number="2"
                            title="Gửi Đánh Giá"
                            description="Đội ngũ của chúng tôi xem xét khóa học của bạn về chất lượng và tuân thủ. Chúng tôi cung cấp phản hồi và hỗ trợ."
                        />
                        <StepCard
                            number="3"
                            title="Đăng Tải & Kiếm Tiền"
                            description="Ra mắt khóa học, bắt đầu tiếp cận học viên và kiếm doanh thu hàng tháng. Mở rộng với nhiều khóa học hơn."
                        />
                    </div>
                </div>
            </section>

            {/* CHỨNG THỰC XÃ HỘI */}
            <section id="testimonials" className="py-20 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold text-gray-900 mb-4">Gặp Gỡ Các Giảng Viên Thành Công Của Chúng Tôi</h2>
                        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                            Nghe từ các giảng viên đã biến chuyên môn của họ thành sự nghiệp phát triển
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <TestimonialCard
                            quote="Nền tảng này giúp tôi dễ dàng chia sẻ chuyên môn phát triển web của mình. Tôi đã tiếp cận 20.000 học viên và kiếm được nhiều hơn trong một năm so với công việc trước đây!"
                            author="Sarah Anderson"
                            role="Chuyên Gia Phát Triển Web"
                            metric="Hơn 20.000 học viên được giảng dạy"
                            initial="SA"
                        />
                        <TestimonialCard
                            quote="Tôi không nghĩ dạy học trực tuyến lại có thể bổ ích đến vậy. Đội ngũ hỗ trợ đã giúp tôi phát triển doanh nghiệp từ con số không đến sáu con numbers. Rất khuyến khích!"
                            author="Michael Johnson"
                            role="Huấn Luyện Viên Chiến Lược Kinh Doanh"
                            metric="Hơn 12.500 học viên đang học"
                            initial="MJ"
                        />
                        <TestimonialCard
                            quote="Chia sẻ kỹ năng thiết kế của tôi đã mang lại một nền tảng toàn cầu. Những câu chuyện thành công của học viên truyền cảm hứng cho tôi mỗi ngày, và thu nhập thụ động thật sự thay đổi cuộc sống."
                            author="Emma Martinez"
                            role="Chuyên Gia Thiết Kế Đồ Họa"
                            metric="Hơn 35.000 học viên trên toàn thế giới"
                            initial="EM"
                        />
                    </div>
                </div>
            </section>

            {/* CÔNG CỤ & HỖ TRỢ */}
            <section id="tools" className="py-20 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold text-gray-900 mb-4">Công Cụ & Hỗ Trợ</h2>
                        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                            Chúng tôi cung cấp mọi thứ bạn cần để tạo và phát triển các khóa25 khóa học thành công
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        <ToolItem
                            icon="🎬"
                            title="Lưu Trữ Video & Công Cụ"
                            description="Lưu trữ video chuyên nghiệp với phân tích và theo dõi tương tác của học viên"
                        />
                        <ToolItem
                            icon="📊"
                            title="Bảng Điều Khiển Giảng Viên"
                            description="Phân tích thời gian thực, theo dõi doanh thu và thông tin chi tiết về học viên"
                        />
                        <ToolItem
                            icon="📱"
                            title="Ứng Dụng Di Động"
                            description="Học viên có thể truy cập khóa học trên thiết bị iOS và Android"
                        />
                        <ToolItem
                            icon="💬"
                            title="Đội Ngũ Hỗ Trợ 24/7"
                            description="Các chuyên gia hỗ trợ tận tâm sẵn sàng giúp bạn thành công"
                        />
                        <ToolItem
                            icon="📈"
                            title="Hỗ Trợ Tiếp Thị"
                            description="Công cụ và chiến lược để quảng bá khóa học của bạn hiệu quả"
                        />
                        <ToolItem
                            icon="🎓"
                            title="Mẫu Khóa Học"
                            description="Mẫu chuyên nghiệp và phương pháp hay nhất để bắt đầu nhanh chóng"
                        />
                    </div>
                </div>
            </section>

            {/* LỜI KÊU GỌI HÀNH ĐỘNG CUỐI CÙNG */}
            <section id="final-cta" className="py-20 bg-gradient-to-r from-blue-600 to-indigo-600 relative overflow-hidden">
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full filter blur-3xl"></div>
                </div>

                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
                    <h2 className="text-5xl font-bold text-white mb-6">
                        Sẵn Sàng Chia Sẻ Chuyên Môn Của Bạn?
                    </h2>
                    <p className="text-xl text-blue-100 mb-12 leading-relaxed">
                        Tham gia hàng ngàn giảng viên thành công đang xây dựng sự nghiệp theo cách riêng của họ. Bắt đầu hành trình của bạn hôm nay và biến đam mê của bạn thành một doanh nghiệp phát triển.
                    </p>

                    <button className="px-10 py-4 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-bold text-lg shadow-lg hover:shadow-xl transition transform hover:scale-105 inline-block mb-8"
                        onClick={HandleStartTeachingToday}>
                        Trở Thành Giảng Viên
                    </button>

                    <p className="text-blue-100 text-sm">
                        Đăng ký mất chưa đến 10 phút. Chúng tôi sẽ xem xét thông tin của bạn và phản hồi trong vòng 48 giờ.
                    </p>
                </div>
            </section>

            {/* CHÂN TRANG */}
            <footer className="bg-gray-900 text-gray-400 py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <p className="mb-4">
                        © 2024 Nền Tảng Của Chúng Tôi. Mọi quyền được bảo lưu.
                    </p>
                    <div className="flex justify-center gap-6">
                        <a href="#" className="text-orange-500 hover:text-orange-400 transition">Chính Sách Bảo Mật</a>
                        <a href="#" className="text-orange-500 hover:text-orange-400 transition">Điều Khoản Dịch Vụ</a>
                        <a href="#" className="text-orange-500 hover:text-orange-400 transition">Liên Hệ Với Chúng Tôi</a>
                    </div>
                </div>
            </footer>
        </div>
    );
}

function ValueCard({ icon, title, description }) {
    return (
        <div className="bg-white border border-gray-200 rounded-lg p-8 hover:shadow-lg hover:border-orange-200 transition group">
            <div className="text-5xl mb-4 group-hover:scale-110 transition transform">{icon}</div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">{title}</h3>
            <p className="text-gray-600 leading-relaxed">{description}</p>
        </div>
    );
}

function StepCard({ number, title, description }) {
    return (
        <div className="relative">
            <div className="bg-white rounded-lg p-8 text-center hover:shadow-lg transition h-full border border-gray-100">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-orange-400 to-orange-600 text-white rounded-full text-2xl font-bold mb-6 mx-auto">
                    {number}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{title}</h3>
                <p className="text-gray-600 leading-relaxed">{description}</p>
            </div>
        </div>
    );
}

function TestimonialCard({ quote, author, role, metric, initial }) {
    return (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 hover:shadow-lg transition">
            <p className="text-gray-700 mb-6 leading-relaxed italic">"{quote}"</p>
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-orange-400 rounded-full flex items-center justify-center text-white font-bold text-lg">
                    {initial}
                </div>
                <div>
                    <p className="font-bold text-gray-900">{author}</p>
                    <p className="text-sm text-gray-600">{role}</p>
                    <p className="text-sm font-semibold text-orange-600">{metric}</p>
                </div>
            </div>
        </div>
    );
}

function ToolItem({ icon, title, description }) {
    return (
        <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg hover:border-orange-200 transition">
            <div className="text-4xl mb-4">{icon}</div>
            <h4 className="text-lg font-bold text-gray-900 mb-2">{title}</h4>
            <p className="text-gray-600 text-sm leading-relaxed">{description}</p>
        </div>
    );
}

