import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../contexts/ToastContext';

export default function InstructorApplication() {
    const navigate = useNavigate();
    const toast = useToast();
    const [currentStep, setCurrentStep] = useState(1);
    const [submitted, setSubmitted] = useState(false);

    const [formData, setFormData] = useState({
        requestdetails: '',
        categoryname: '',
        certificateurl: '',
        experience: '',
    });

    const [errors, setErrors] = useState({});

    const requiredFields = ['requestdetails', 'categoryname', 'certificateurl', 'experience'];

    const isFormComplete = requiredFields.every(field => formData[field].trim() !== '');

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value,
        }));
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: '',
            }));
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.requestdetails.trim()) newErrors.requestdetails = 'Chủ đề là bắt buộc';
        if (!formData.categoryname.trim()) newErrors.categoryname = 'Danh mục là bắt buộc';
        if (!formData.certificateurl.trim()) {
            newErrors.certificateurl = 'URL chứng chỉ là bắt buộc';
        } else if (!formData.certificateurl.includes('linkedin')) {
            newErrors.certificateurl = 'Vui lòng nhập một URL LinkedIn hợp lệ';
        }
        if (!formData.experience) newErrors.experience = 'Vui lòng chọn kinh nghiệm giảng dạy của bạn';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (validateForm()) {
            try {
                const token = localStorage.getItem('token');
                const payload = {
                    requestdetails: formData.requestdetails,
                    experience: formData.experience,
                    certificateurl: formData.certificateurl,
                    categoryname: formData.categoryname,
                };
                const response = await fetch('http://localhost:8080/api/v1/teacher/apply', {
                    method: 'POST',
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(payload),
                });
                if (!response.ok) {
                    const errorText = await response.text();
                    throw new Error(`Failed to submit application: ${errorText}`);
                }
                const data = await response.json();
                console.log('Response from server:', data);
                setSubmitted(true);
            } catch (error) {
                console.error('Error submitting application:', error.message);
                toast.error('Có lỗi xảy ra khi gửi đơn đăng ký. Vui lòng thử lại.');
            }
        }
    };

    if (submitted) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center px-4">
                <div className="bg-white rounded-lg shadow-xl p-8 max-w-md text-center">
                    <div className="text-6xl mb-6">✓</div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-4">Đăng Ký Đã Gửi!</h1>
                    <p className="text-gray-600 mb-2">Cảm ơn bạn đã đăng ký!</p>
                    <p className="text-gray-600 mb-8">Chúng tôi đã nhận được đơn đăng ký của bạn và sẽ xem xét trong vòng 2-3 ngày làm việc. Kiểm tra email của bạn để nhận cập nhật.</p>
                    <button
                        onClick={() => navigate('/')}
                        className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition"
                    >
                        Quay Lại Trang Chính
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <div className="text-center mb-8">
                        <h1 className="text-4xl font-bold text-gray-900 mb-3">Đăng Ký Trở Thành Giảng Viên</h1>
                        <p className="text-lg text-gray-600">Lựa chọn tuyệt vời! Chúng tôi chỉ cần một vài thông tin để bắt đầu. Quá trình này chỉ mất 2 phút.</p>
                    </div>
                    <div className="flex items-center justify-center gap-4 max-w-2xl mx-auto">
                        <ProgressStep number={1} title="Đăng Ký" active={currentStep === 1} />
                        <div className="flex-1 h-1 bg-gray-300"></div>
                        <ProgressStep number={2} title="Xem Xét" active={currentStep === 2} />
                        <div className="flex-1 h-1 bg-gray-300"></div>
                        <ProgressStep number={3} title="Bắt Đầu" active={currentStep === 3} />
                    </div>
                </div>
            </div>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2">
                        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-8">
                            <div className="mb-10">
                                <h2 className="text-2xl font-bold text-gray-900 mb-6 pb-4 border-b-2 border-blue-600">Chuyên Môn Của Bạn</h2>
                                <FormField
                                    label="Bạn muốn dạy chủ đề gì?"
                                    name="requestdetails"
                                    type="text"
                                    placeholder="Ví dụ: Phát triển Web, Thiết kế Đồ họa, Tiếp thị Kỹ thuật số..."
                                    value={formData.requestdetails}
                                    onChange={handleChange}
                                    required={true}
                                    error={errors.requestdetails}
                                />
                                <FormField
                                    label="Tên Danh Mục Khóa Học"
                                    name="categoryname"
                                    type="select"
                                    value={formData.categoryname}
                                    onChange={handleChange}
                                    required={true}
                                    error={errors.categoryname}
                                    options={[
                                        { value: '', label: 'Chọn một danh mục' },
                                        { value: 'CNTT & Phần mềm', label: 'CNTT & Phần mềm' },
                                        { value: 'Marketing', label: 'Marketing' },
                                        { value: 'Thiết kế', label: 'Thiết kế' },
                                        { value: 'Tài chính & Kế toán', label: 'Tài chính & Kế toán' },
                                        { value: 'Trí tuệ nhân tạo', label: 'Trí tuệ nhân tạo' },
                                        { value: 'Kinh doanh', label: 'Kinh doanh' },
                                        { value: 'Ngoại ngữ', label: 'Ngoại ngữ' },
                                        { value: 'Sức khỏe & Thể hình', label: 'Sức khỏe & Thể hình' },
                                        { value: 'Phân tích dữ liệu', label: 'Phân tích dữ liệu' },
                                        { value: 'Phân Tích Và Trực Quan Hóa Dữ Liệu', label: 'Phân Tích Và Trực Quan Hóa Dữ Liệu' },
                                    ]}
                                />
                            </div>
                            <div className="mb-10">
                                <h2 className="text-2xl font-bold text-gray-900 mb-6 pb-4 border-b-2 border-blue-600">Hiện Diện Trực Tuyến</h2>
                                <FormField
                                    label="URL Chứng Chỉ (LinkedIn)"
                                    name="certificateurl"
                                    type="url"
                                    placeholder="https://linkedin.com/in/hồsơbạn"
                                    value={formData.certificateurl}
                                    onChange={handleChange}
                                    required={true}
                                    error={errors.certificateurl}
                                />
                            </div>
                            <div className="mb-10">
                                <h2 className="text-2xl font-bold text-gray-900 mb-6 pb-4 border-b-2 border-blue-600">Kinh Nghiệm Giảng Dạy</h2>
                                <div className="mb-6">
                                    <label className="block text-sm font-semibold text-gray-900 mb-4">
                                        Bạn đã từng dạy khóa học trực tuyến chưa? <span className="text-red-500">*</span>
                                    </label>
                                    <div className="space-y-3">
                                        {[
                                            { value: 'yes-pro', label: "Có, tôi là chuyên gia!" },
                                            { value: 'yes-little', label: 'Có, một chút' },
                                            { value: 'no-first-time', label: 'Không, đây là lần đầu tiên của tôi!' },
                                        ].map(option => (
                                            <label key={option.value} className="flex items-center cursor-pointer">
                                                <input
                                                    type="radio"
                                                    name="experience"
                                                    value={option.value}
                                                    checked={formData.experience === option.value}
                                                    onChange={handleChange}
                                                    className="w-4 h-4 text-blue-600 cursor-pointer"
                                                />
                                                <span className="ml-3 text-gray-700">{option.label}</span>
                                            </label>
                                        ))}
                                    </div>
                                    {errors.experience && (
                                        <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
                                            <span>✕</span> {errors.experience}
                                        </p>
                                    )}
                                </div>
                            </div>
                            <div className="border-t pt-8">
                                <div className="text-sm text-gray-600 mb-6 flex items-start gap-2">
                                    <svg className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                    <span>Chúng tôi tôn trọng quyền riêng tư của bạn. Thông tin của bạn sẽ không được chia sẻ.</span>
                                </div>
                                <button
                                    type="submit"
                                    disabled={!isFormComplete}
                                    className={`w-full py-3 px-6 rounded-lg font-bold text-lg transition ${isFormComplete
                                        ? 'bg-orange-500 hover:bg-orange-600 text-white cursor-pointer shadow-lg hover:shadow-xl'
                                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                        }`}
                                >
                                    Gửi Đơn Đăng Ký
                                </button>
                            </div>
                        </form>
                    </div>
                    <div className="lg:col-span-1">
                        <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-8 sticky top-8">
                            <h3 className="text-2xl font-bold text-gray-900 mb-8">Tiếp Theo Là Gì?</h3>
                            <div className="space-y-8">
                                <ProcessStep number="1" icon="📋" title="Xem Xét" description="Đội ngũ của chúng tôi sẽ xem xét đơn đăng ký của bạn (thường trong vòng 2-3 ngày làm việc)." />
                                <ProcessStep number="2" icon="📧" title="Theo Dõi" description="Chúng tôi sẽ gửi email cho bạn với các bước tiếp theo. Chúng tôi có thể sắp xếp một cuộc trò chuyện ngắn 15 phút." />
                                <ProcessStep number="3" icon="✨" title="Phê Duyệt" description="Khi được phê duyệt, bạn sẽ được truy cập vào các công cụ tạo khóa học của chúng tôi!" />
                            </div>
                            <div className="mt-8 p-4 bg-white rounded-lg border-l-4 border-orange-500">
                                <p className="text-sm text-gray-700">
                                    <span className="font-semibold text-gray-900">Có câu hỏi?</span><br />
                                    Gửi email cho chúng tôi tại <a href="mailto:support@gmail.com" className="text-orange-600 hover:text-orange-700 font-semibold">support@gmail.com</a>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function ProgressStep({ number, title, active }) {
    return (
        <div className="flex flex-col items-center">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${active ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-600'}`}>
                {number}
            </div>
            <p className={`mt-2 text-xs font-semibold ${active ? 'text-blue-600' : 'text-gray-600'}`}>
                {title}
            </p>
        </div>
    );
}

function FormField({ label, name, type, placeholder, value, onChange, required, error, helperText, rows, options }) {
    return (
        <div className="mb-6">
            <label htmlFor={name} className="block text-sm font-semibold text-gray-900 mb-2">
                {label} {required && <span className="text-red-500">*</span>}
            </label>
            {type === 'textarea' ? (
                <textarea
                    id={name}
                    name={name}
                    placeholder={placeholder}
                    value={value}
                    onChange={onChange}
                    rows={rows || 4}
                    className={`w-full px-4 py-3 border rounded-lg bg-white text-gray-900 placeholder-gray-500 transition ${error ? 'border-red-500 focus:border-red-600' : 'border-gray-300 focus:border-blue-500'} focus:outline-none focus:ring-2 ${error ? 'focus:ring-red-500' : 'focus:ring-blue-500'}`}
                />
            ) : type === 'select' ? (
                <select
                    id={name}
                    name={name}
                    value={value}
                    onChange={onChange}
                    className={`w-full px-4 py-3 border rounded-lg bg-white text-gray-900 transition ${error ? 'border-red-500 focus:border-red-600' : 'border-gray-300 focus:border-blue-500'} focus:outline-none focus:ring-2 ${error ? 'focus:ring-red-500' : 'focus:ring-blue-500'}`}
                >
                    {options?.map(option => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>
            ) : (
                <input
                    id={name}
                    type={type}
                    name={name}
                    placeholder={placeholder}
                    value={value}
                    onChange={onChange}
                    className={`w-full px-4 py-3 border rounded-lg bg-white text-gray-900 placeholder-gray-500 transition ${error ? 'border-red-500 focus:border-red-600' : 'border-gray-300 focus:border-blue-500'} focus:outline-none focus:ring-2 ${error ? 'focus:ring-red-500' : 'focus:ring-blue-500'}`}
                />
            )}
            {error && (
                <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
                    <span>✕</span> {error}
                </p>
            )}
            {helperText && !error && (
                <p className="text-gray-500 text-sm mt-2">{helperText}</p>
            )}
        </div>
    );
}

function ProcessStep({ number, icon, title, description }) {
    return (
        <div className="flex gap-4">
            <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-xl border-2 border-blue-200">
                    {icon}
                </div>
            </div>
            <div>
                <p className="font-bold text-gray-900 mb-1">{title}</p>
                <p className="text-sm text-gray-700 leading-relaxed">{description}</p>
            </div>
        </div>
    );
}

