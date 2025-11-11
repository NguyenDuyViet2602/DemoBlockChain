// src/pages/Teacher.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useToast } from '../contexts/ToastContext';
import { useConfirm } from '../contexts/ConfirmContext';
import {
  FaHome,
  FaBook,
  FaUsers,
  FaClipboardList,
  FaChartLine,
  FaBars,
  FaTimes,
  FaPlus,
  FaEdit,
  FaTrash,
  FaCheck,
  FaTimesCircle,
  FaFolderOpen,
  FaChevronDown,
  FaChevronRight,
  FaVideo,
  FaQuestionCircle,
} from 'react-icons/fa';

const Teacher = () => {
  const toast = useToast();
  const { confirm } = useConfirm();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:8080/api/v1/teacher/dashboard/stats', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setStats(response.data.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const menuItems = [
    { id: 'dashboard', label: 'Tổng quan', icon: FaHome },
    { id: 'courses', label: 'Khóa học của tôi', icon: FaBook },
    { id: 'content', label: 'Nội dung khóa học', icon: FaFolderOpen },
    { id: 'students', label: 'Học viên', icon: FaUsers },
    { id: 'submissions', label: 'Bài tập chờ chấm', icon: FaClipboardList },
    { id: 'analytics', label: 'Thống kê', icon: FaChartLine },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardStats stats={stats} loading={loading} />;
      case 'courses':
        return <MyCourses onRefresh={fetchDashboardStats} />;
      case 'content':
        return <CourseContentManagement />;
      case 'students':
        return <MyStudents />;
      case 'submissions':
        return <PendingSubmissions onRefresh={fetchDashboardStats} />;
      case 'analytics':
        return <Analytics />;
      default:
        return <DashboardStats stats={stats} loading={loading} />;
    }
  };

    return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div
        className={`fixed top-16 bottom-0 left-0 bg-white border-r transition-all duration-300 z-10 overflow-y-auto ${
          sidebarOpen ? 'w-64' : 'w-0 overflow-hidden'
        }`}
      >
        <div className="p-4">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-800">Giảng viên</h2>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-gray-500 hover:text-gray-700 cursor-pointer"
            >
              <FaTimes />
            </button>
          </div>
          <nav className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors cursor-pointer ${
                    activeTab === item.id
                      ? 'bg-emerald-50 text-emerald-700 font-medium'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="text-lg" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className={`transition-all duration-300 ${sidebarOpen ? 'lg:ml-64' : 'lg:ml-0'}`}>
        {/* Mobile Header */}
        <div className="lg:hidden bg-white border-b p-4 flex items-center gap-4">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-gray-700 hover:text-gray-900 cursor-pointer"
          >
            <FaBars className="text-xl" />
          </button>
          <h1 className="text-xl font-bold text-gray-800">Giảng viên</h1>
        </div>

        {/* Content Area */}
        <div className="p-6">{renderContent()}</div>
      </div>
    </div>
  );
};

// Dashboard Stats Component
const DashboardStats = ({ stats, loading }) => {
  if (loading) {
    return <div className="text-center py-12">Đang tải...</div>;
  }

  if (!stats) {
    return <div className="text-center py-12 text-red-500">Không thể tải thống kê</div>;
  }

  const statCards = [
    {
      title: 'Tổng khóa học',
      value: stats.totalCourses,
      color: 'bg-blue-500',
      icon: '📚',
    },
    {
      title: 'Khóa học đã duyệt',
      value: stats.approvedCourses,
      color: 'bg-green-500',
      icon: '✅',
    },
    {
      title: 'Khóa học chờ duyệt',
      value: stats.pendingCourses,
      color: 'bg-yellow-500',
      icon: '⏳',
    },
    {
      title: 'Tổng học viên',
      value: stats.totalStudents,
      color: 'bg-purple-500',
      icon: '👥',
    },
    {
      title: 'Bài tập đã nộp',
      value: stats.totalSubmissions,
      color: 'bg-indigo-500',
      icon: '📝',
    },
    {
      title: 'Bài tập chờ chấm',
      value: stats.pendingSubmissions,
      color: 'bg-orange-500',
      icon: '⏰',
    },
    {
      title: 'Doanh thu',
      value: new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(
        stats.totalRevenue
      ),
      color: 'bg-emerald-500',
      icon: '💰',
    },
    {
      title: 'Đánh giá trung bình',
      value: stats.averageRating ? `${stats.averageRating} ⭐` : 'Chưa có',
      color: 'bg-pink-500',
      icon: '⭐',
    },
  ];

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Tổng quan</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, index) => (
          <div
            key={index}
            className="bg-white rounded-lg shadow-md p-6 border border-gray-200 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm mb-2">{card.title}</p>
                <p className="text-2xl font-bold text-gray-800">{card.value}</p>
              </div>
              <div className={`${card.color} w-12 h-12 rounded-full flex items-center justify-center text-2xl`}>
                {card.icon}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// My Courses Component
const MyCourses = ({ onRefresh }) => {
  const toast = useToast();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({ status: '', search: '' });
  const [showModal, setShowModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [formData, setFormData] = useState({
    coursename: '',
    description: '',
    price: 0,
    categoryid: '',
    level: '',
    language: '',
    duration: '',
    imageurl: '',
  });
  const [categories, setCategories] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    fetchCourses();
    fetchCategories();
  }, [page, filters]);

  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:8080/api/v1/categories', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCategories(response.data.data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        ...(filters.status && { status: filters.status }),
        ...(filters.search && { search: filters.search }),
      });

      const response = await axios.get(
        `http://localhost:8080/api/v1/teacher/courses?${params}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setCourses(response.data.data);
      setTotalPages(response.data.pagination.totalPages);
    } catch (error) {
      console.error('Error fetching courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Kiểm tra loại file
      if (!file.type.startsWith('image/')) {
        toast.warning('Vui lòng chọn file ảnh!');
        return;
      }
      // Kiểm tra kích thước (5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.warning('File ảnh không được vượt quá 5MB!');
        return;
      }
      setSelectedImage(file);
      // Tạo preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      
      // Nếu có ảnh mới được chọn, upload ảnh trước
      if (selectedImage) {
        setUploadingImage(true);
        try {
          // Nếu đang sửa, upload ảnh cho khóa học đó
          if (editingCourse) {
            const formDataImage = new FormData();
            formDataImage.append('image', selectedImage);
            const uploadResponse = await axios.post(
              `http://localhost:8080/api/v1/courses/${editingCourse.courseid}/upload-image`,
              formDataImage,
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                  'Content-Type': 'multipart/form-data',
                },
              }
            );
            // Cập nhật imageurl từ response
            formData.imageurl = uploadResponse.data.data.imageUrl;
          } else {
            // Nếu tạo mới, tạm thời tạo khóa học trước, sau đó upload ảnh
            // Tạo khóa học trước
            const createResponse = await axios.post(
              'http://localhost:8080/api/v1/courses',
              formData,
              {
                headers: { Authorization: `Bearer ${token}` },
              }
            );
            const newCourseId = createResponse.data.data.courseid;
            
            // Upload ảnh cho khóa học vừa tạo
            const formDataImage = new FormData();
            formDataImage.append('image', selectedImage);
            await axios.post(
              `http://localhost:8080/api/v1/courses/${newCourseId}/upload-image`,
              formDataImage,
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                  'Content-Type': 'multipart/form-data',
                },
              }
            );
            toast.success('Tạo khóa học thành công! Đang chờ admin duyệt.');
            setShowModal(false);
            setEditingCourse(null);
            setSelectedImage(null);
            setImagePreview(null);
            setFormData({
              coursename: '',
              description: '',
              price: 0,
              categoryid: '',
              level: '',
              language: '',
              duration: '',
              imageurl: '',
            });
            // Refresh data ngay lập tức
            await fetchCourses();
            if (onRefresh) onRefresh();
            setUploadingImage(false);
            return;
          }
        } catch (uploadError) {
          setUploadingImage(false);
          toast.error('Lỗi upload ảnh: ' + (uploadError.response?.data?.message || uploadError.message));
          return;
        }
        setUploadingImage(false);
      }

      // Cập nhật hoặc tạo khóa học
      if (editingCourse) {
        await axios.put(
          `http://localhost:8080/api/v1/courses/${editingCourse.courseid}`,
          formData,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        toast.success('Cập nhật khóa học thành công!');
      } else {
        await axios.post('http://localhost:8080/api/v1/courses', formData, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success('Tạo khóa học thành công! Đang chờ admin duyệt.');
      }
      
      setShowModal(false);
      setEditingCourse(null);
      setSelectedImage(null);
      setImagePreview(null);
      setFormData({
        coursename: '',
        description: '',
        price: 0,
        categoryid: '',
        level: '',
        language: '',
        duration: '',
        imageurl: '',
      });
      // Refresh data ngay lập tức
      await fetchCourses();
      if (onRefresh) onRefresh();
    } catch (error) {
      setUploadingImage(false);
      toast.error('Lỗi: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleEdit = (course) => {
    setEditingCourse(course);
    setFormData({
      coursename: course.coursename,
      description: course.description || '',
      price: course.price,
      categoryid: course.categoryid || '',
      level: course.level || '',
      language: course.language || '',
      duration: course.duration || '',
      imageurl: course.imageurl || '',
    });
    setSelectedImage(null);
    setImagePreview(course.imageurl || null);
    setShowModal(true);
  };

  const handleDelete = async (courseId) => {
    const confirmed = await confirm({
      title: 'Xác nhận xóa',
      message: 'Bạn có chắc chắn muốn xóa khóa học này?',
      confirmText: 'Xóa',
      cancelText: 'Hủy',
    });
    if (!confirmed) return;

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:8080/api/v1/courses/${courseId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchCourses();
      if (onRefresh) onRefresh();
      toast.success('Xóa khóa học thành công!');
    } catch (error) {
      toast.error('Lỗi: ' + (error.response?.data?.message || error.message));
    }
  };

  const getStatusBadge = (status) => {
    const colors = {
      Approved: 'bg-green-100 text-green-800',
      Pending: 'bg-yellow-100 text-yellow-800',
      Rejected: 'bg-red-100 text-red-800',
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[status] || ''}`}>
        {status}
      </span>
    );
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Khóa học của tôi</h1>
        <button
          onClick={() => {
            setEditingCourse(null);
            setFormData({
              coursename: '',
              description: '',
              price: 0,
              categoryid: '',
              level: '',
              language: '',
              duration: '',
              imageurl: '',
            });
            setSelectedImage(null);
            setImagePreview(null);
            setShowModal(true);
          }}
          className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 flex items-center gap-2 cursor-pointer"
        >
          <FaPlus /> Tạo khóa học mới
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-md mb-6 flex gap-4">
        <input
          type="text"
          placeholder="Tìm kiếm khóa học..."
          value={filters.search}
          onChange={(e) => setFilters({ ...filters, search: e.target.value })}
          className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500"
        />
        <select
          value={filters.status}
          onChange={(e) => setFilters({ ...filters, status: e.target.value })}
          className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 cursor-pointer"
        >
          <option value="">Tất cả trạng thái</option>
          <option value="Approved">Approved</option>
          <option value="Pending">Pending</option>
          <option value="Rejected">Rejected</option>
        </select>
      </div>

      {/* Courses Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {loading ? (
          <div className="text-center py-12">Đang tải...</div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Tên khóa học
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Danh mục
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Giá
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Học viên
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Đánh giá
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Trạng thái
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Thao tác
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {courses.map((course) => (
                    <tr key={course.courseid}>
                      <td className="px-6 py-4 text-sm font-medium">{course.coursename}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {course.category?.categoryname || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {new Intl.NumberFormat('vi-VN', {
                          style: 'currency',
                          currency: 'VND',
                        }).format(course.price)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {course.enrollmentCount || 0}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {course.averageRating ? `${course.averageRating} ⭐` : 'Chưa có'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(course.status)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                        <button
                          onClick={() => handleEdit(course)}
                          className="text-blue-600 hover:text-blue-800 cursor-pointer"
                        >
                          <FaEdit />
                        </button>
                        <button
                          onClick={() => handleDelete(course.courseid)}
                          className="text-red-600 hover:text-red-800 cursor-pointer"
                        >
                          <FaTrash />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {/* Pagination */}
            <div className="bg-gray-50 px-6 py-3 flex items-center justify-between">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="px-4 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 cursor-pointer"
              >
                Trước
              </button>
              <span className="text-sm text-gray-700">
                Trang {page} / {totalPages}
              </span>
              <button
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                disabled={page === totalPages}
                className="px-4 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 cursor-pointer"
              >
                Sau
              </button>
            </div>
          </>
        )}
      </div>

      {/* Modal Create/Edit Course */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0" onClick={() => setShowModal(false)} />
          <div className="relative bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-xl font-bold mb-4">
              {editingCourse ? 'Sửa khóa học' : 'Tạo khóa học mới'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Tên khóa học *</label>
                <input
                  type="text"
                  value={formData.coursename}
                  onChange={(e) => setFormData({ ...formData, coursename: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Mô tả</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500"
                  rows="4"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Giá (VND) *</label>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500"
                    min="0"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Danh mục</label>
                  <select
                    value={formData.categoryid}
                    onChange={(e) => setFormData({ ...formData, categoryid: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                  >
                    <option value="">Chọn danh mục</option>
                    {categories.map((cat) => (
                      <option key={cat.categoryid} value={cat.categoryid}>
                        {cat.categoryname}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Cấp độ</label>
                  <select
                    value={formData.level}
                    onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                  >
                    <option value="">Chọn cấp độ</option>
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Ngôn ngữ</label>
                  <input
                    type="text"
                    value={formData.language}
                    onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500"
                    placeholder="VD: Tiếng Việt"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Thời lượng</label>
                  <input
                    type="text"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500"
                    placeholder="VD: 10 giờ"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Hình ảnh khóa học</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                />
                {imagePreview && (
                  <div className="mt-2">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-48 object-cover rounded-lg border"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      {selectedImage ? `File: ${selectedImage.name}` : 'Ảnh hiện tại'}
                    </p>
                  </div>
                )}
                {uploadingImage && (
                  <p className="text-sm text-blue-600 mt-2">Đang upload ảnh...</p>
                )}
              </div>
              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingCourse(null);
                  }}
                  className="px-4 py-2 border rounded-lg hover:bg-gray-100 cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 cursor-pointer"
                >
                  {editingCourse ? 'Cập nhật' : 'Tạo'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// My Students Component
const MyStudents = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({ search: '', courseId: '' });
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    fetchStudents();
    fetchCourses();
  }, [page, filters]);

  const fetchCourses = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:8080/api/v1/teacher/courses?limit=100', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCourses(response.data.data || []);
    } catch (error) {
      console.error('Error fetching courses:', error);
    }
  };

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        ...(filters.search && { search: filters.search }),
        ...(filters.courseId && { courseId: filters.courseId }),
      });

      const response = await axios.get(
        `http://localhost:8080/api/v1/teacher/students?${params}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setStudents(response.data.data);
      setTotalPages(response.data.pagination.totalPages);
    } catch (error) {
      console.error('Error fetching students:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Học viên của tôi</h1>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-md mb-6 flex gap-4">
        <input
          type="text"
          placeholder="Tìm kiếm học viên..."
          value={filters.search}
          onChange={(e) => setFilters({ ...filters, search: e.target.value })}
          className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500"
        />
        <select
          value={filters.courseId}
          onChange={(e) => setFilters({ ...filters, courseId: e.target.value })}
          className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 cursor-pointer"
        >
          <option value="">Tất cả khóa học</option>
          {courses.map((course) => (
            <option key={course.courseid} value={course.courseid}>
              {course.coursename}
            </option>
          ))}
        </select>
      </div>

      {/* Students Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {loading ? (
          <div className="text-center py-12">Đang tải...</div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Học viên
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Khóa học
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Ngày đăng ký
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {students.map((enrollment) => (
                    <tr key={enrollment.enrollmentid}>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {enrollment.student?.profilepicture ? (
                            <img
                              src={enrollment.student.profilepicture}
                              alt={enrollment.student.fullname}
                              className="w-10 h-10 rounded-full"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center font-semibold">
                              {enrollment.student?.fullname?.charAt(0) || 'U'}
                            </div>
                          )}
                          <div>
                            <div className="text-sm font-medium">{enrollment.student?.fullname}</div>
                            <div className="text-xs text-gray-500">{enrollment.student?.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm">{enrollment.course?.coursename}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(enrollment.enrolledat).toLocaleDateString('vi-VN')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {/* Pagination */}
            <div className="bg-gray-50 px-6 py-3 flex items-center justify-between">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="px-4 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 cursor-pointer"
              >
                Trước
              </button>
              <span className="text-sm text-gray-700">
                Trang {page} / {totalPages}
              </span>
              <button
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                disabled={page === totalPages}
                className="px-4 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 cursor-pointer"
              >
                Sau
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

// Pending Submissions Component
const PendingSubmissions = ({ onRefresh }) => {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showGradeModal, setShowGradeModal] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [gradeData, setGradeData] = useState({ grade: '', feedback: '' });

  useEffect(() => {
    fetchSubmissions();
  }, [page]);

  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `http://localhost:8080/api/v1/teacher/submissions/pending?page=${page}&limit=10`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setSubmissions(response.data.data);
      setTotalPages(response.data.pagination.totalPages);
    } catch (error) {
      console.error('Error fetching submissions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGrade = async () => {
    if (!gradeData.grade || gradeData.grade < 0 || gradeData.grade > 10) {
      toast.warning('Vui lòng nhập điểm từ 0 đến 10');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `http://localhost:8080/api/v1/teacher/submissions/${selectedSubmission.submissionid}/grade`,
        gradeData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      toast.success('Chấm điểm thành công!');
      setShowGradeModal(false);
      setSelectedSubmission(null);
      setGradeData({ grade: '', feedback: '' });
      fetchSubmissions();
      if (onRefresh) onRefresh();
    } catch (error) {
      toast.error('Lỗi: ' + (error.response?.data?.message || error.message));
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Bài tập chờ chấm</h1>

      {/* Submissions Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {loading ? (
          <div className="text-center py-12">Đang tải...</div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Học viên
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Khóa học
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Bài tập
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Hạn nộp
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Ngày nộp
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Thao tác
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {submissions.map((submission) => (
                    <tr key={submission.submissionid}>
                      <td className="px-6 py-4 text-sm">{submission.student?.fullname}</td>
                      <td className="px-6 py-4 text-sm">
                        {submission.assignment?.course?.coursename}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium">
                        {submission.assignment?.title}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(submission.assignment?.duedate).toLocaleDateString('vi-VN')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(submission.submittedat).toLocaleDateString('vi-VN')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <button
                          onClick={() => {
                            setSelectedSubmission(submission);
                            setGradeData({ grade: '', feedback: '' });
                            setShowGradeModal(true);
                          }}
                          className="text-emerald-600 hover:text-emerald-800 cursor-pointer"
                        >
                          Chấm điểm
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {/* Pagination */}
            <div className="bg-gray-50 px-6 py-3 flex items-center justify-between">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="px-4 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 cursor-pointer"
              >
                Trước
              </button>
              <span className="text-sm text-gray-700">
                Trang {page} / {totalPages}
              </span>
              <button
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                disabled={page === totalPages}
                className="px-4 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 cursor-pointer"
              >
                Sau
              </button>
            </div>
          </>
        )}
      </div>

      {/* Grade Modal */}
      {showGradeModal && selectedSubmission && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0" onClick={() => setShowGradeModal(false)} />
          <div className="relative bg-white rounded-lg p-6 w-full max-w-md shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-xl font-bold mb-4">Chấm điểm bài tập</h2>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600 mb-1">Học viên:</p>
                <p className="font-medium">{selectedSubmission.student?.fullname}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Bài tập:</p>
                <p className="font-medium">{selectedSubmission.assignment?.title}</p>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Điểm (0-10) *</label>
                <input
                  type="number"
                  value={gradeData.grade}
                  onChange={(e) => setGradeData({ ...gradeData, grade: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500"
                  min="0"
                  max="10"
                  step="0.1"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Nhận xét</label>
                <textarea
                  value={gradeData.feedback}
                  onChange={(e) => setGradeData({ ...gradeData, feedback: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500"
                  rows="4"
                />
              </div>
              <div className="flex gap-2 justify-end">
                <button
                  onClick={() => {
                    setShowGradeModal(false);
                    setSelectedSubmission(null);
                    setGradeData({ grade: '', feedback: '' });
                  }}
                  className="px-4 py-2 border rounded-lg hover:bg-gray-100 cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  onClick={handleGrade}
                  className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 cursor-pointer"
                >
                  Lưu điểm
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Analytics Component
const Analytics = () => {
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:8080/api/v1/teacher/courses?limit=100', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCourses(response.data.data || []);
    } catch (error) {
      console.error('Error fetching courses:', error);
    }
  };

  const fetchAnalytics = async (courseId) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `http://localhost:8080/api/v1/teacher/courses/${courseId}/analytics`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setAnalytics(response.data.data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
      toast.error('Lỗi: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Thống kê</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Course Selector */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-bold mb-4">Chọn khóa học</h2>
            <select
              value={selectedCourse || ''}
              onChange={(e) => {
                const courseId = e.target.value;
                setSelectedCourse(courseId);
                if (courseId) {
                  fetchAnalytics(courseId);
                } else {
                  setAnalytics(null);
                }
              }}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 cursor-pointer"
            >
              <option value="">Chọn khóa học...</option>
              {courses.map((course) => (
                <option key={course.courseid} value={course.courseid}>
                  {course.coursename}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Analytics Display */}
        <div className="lg:col-span-2">
          {loading ? (
            <div className="text-center py-12">Đang tải...</div>
          ) : analytics ? (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold mb-6">Thống kê chi tiết</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Số học viên</p>
                  <p className="text-2xl font-bold">{analytics.enrollmentCount}</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Đã hoàn thành</p>
                  <p className="text-2xl font-bold">{analytics.completionCount}</p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Tỷ lệ hoàn thành</p>
                  <p className="text-2xl font-bold">{analytics.completionRate}%</p>
                </div>
                <div className="bg-orange-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Số bài tập</p>
                  <p className="text-2xl font-bold">{analytics.assignmentCount}</p>
                </div>
                <div className="bg-indigo-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Bài đã nộp</p>
                  <p className="text-2xl font-bold">{analytics.submissionCount}</p>
                </div>
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Đánh giá TB</p>
                  <p className="text-2xl font-bold">{analytics.averageRating} ⭐</p>
                </div>
              </div>
              <div className="bg-emerald-50 p-4 rounded-lg mb-6">
                <p className="text-sm text-gray-600">Doanh thu</p>
                <p className="text-2xl font-bold">
                  {new Intl.NumberFormat('vi-VN', {
                    style: 'currency',
                    currency: 'VND',
                  }).format(analytics.revenue)}
                </p>
              </div>
              {analytics.reviews && analytics.reviews.length > 0 && (
                <div>
                  <h3 className="text-lg font-bold mb-4">Đánh giá gần đây</h3>
                  <div className="space-y-3">
                    {analytics.reviews.map((review) => (
                      <div key={review.reviewid} className="border-b pb-3">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-medium">{review.student?.fullname}</span>
                          <span className="text-yellow-500">
                            {'⭐'.repeat(review.rating || 0)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">{review.comment}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-md p-6 text-center text-gray-500">
              Vui lòng chọn khóa học để xem thống kê
            </div>
          )}
        </div>
      </div>
        </div>
    );
};

// Course Content Management Component
const CourseContentManagement = () => {
  const toast = useToast();
  const { confirm } = useConfirm();
  const [courses, setCourses] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [chapters, setChapters] = useState([]);
  const [expandedChapters, setExpandedChapters] = useState(new Set());
  const [lessons, setLessons] = useState({}); // { chapterId: [lessons] }
  const [quizzes, setQuizzes] = useState({}); // { lessonId: [quizzes] }
  const [loading, setLoading] = useState(false);
  const [showChapterModal, setShowChapterModal] = useState(false);
  const [showLessonModal, setShowLessonModal] = useState(false);
  const [showQuizModal, setShowQuizModal] = useState(false);
  const [editingChapter, setEditingChapter] = useState(null);
  const [editingLesson, setEditingLesson] = useState(null);
  const [editingQuiz, setEditingQuiz] = useState(null);
  const [selectedChapterId, setSelectedChapterId] = useState(null);
  const [selectedLessonId, setSelectedLessonId] = useState(null);
  const [chapterForm, setChapterForm] = useState({ title: '', description: '', sortorder: 0 });
  const [lessonForm, setLessonForm] = useState({ title: '', content: '', videourl: '', sortorder: 0 });
  const [videoUploadMethod, setVideoUploadMethod] = useState('youtube'); // 'youtube' hoặc 'upload'
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [quizForm, setQuizForm] = useState({ title: '', timelimit: 30, maxattempts: 1, showanswersaftersubmission: false });

  useEffect(() => {
    fetchCourses();
  }, []);

  useEffect(() => {
    if (selectedCourseId) {
      fetchChapters();
    }
  }, [selectedCourseId]);

  const fetchCourses = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:8080/api/v1/teacher/courses?limit=100', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCourses(response.data.data || []);
    } catch (error) {
      console.error('Error fetching courses:', error);
    }
  };

  const fetchChapters = async () => {
    if (!selectedCourseId) return;
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `http://localhost:8080/api/v1/chapters/course/${selectedCourseId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const chaptersData = response.data.data || [];
      setChapters(chaptersData);
      
      // Process lessons from include or fetch separately
      const lessonsMap = {};
      for (const chapter of chaptersData) {
        // Use lessons from include if available, otherwise fetch separately
        if (chapter.lessons && Array.isArray(chapter.lessons) && chapter.lessons.length > 0) {
          lessonsMap[chapter.chapterid] = chapter.lessons;
          // Still fetch quizzes for each lesson
          for (const lesson of chapter.lessons) {
            if (lesson.lessonid) {
              fetchQuizzes(lesson.lessonid);
            }
          }
        } else {
          // Fetch lessons separately if not included (or empty array)
          // Set empty array first to avoid undefined
          lessonsMap[chapter.chapterid] = [];
          fetchLessons(chapter.chapterid);
        }
      }
      // Update lessons state with included lessons
      setLessons((prev) => ({ ...prev, ...lessonsMap }));
    } catch (error) {
      console.error('Error fetching chapters:', error);
      toast.error('Lỗi khi tải danh sách chương: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const fetchLessons = async (chapterId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `http://localhost:8080/api/v1/lessons/chapter/${chapterId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const lessonsData = response.data.data || [];
      setLessons((prev) => ({ ...prev, [chapterId]: lessonsData }));
      
      // Fetch quizzes for each lesson
      for (const lesson of lessonsData) {
        if (lesson.lessonid) {
          fetchQuizzes(lesson.lessonid);
        }
      }
    } catch (error) {
      console.error('Error fetching lessons:', error);
      // Don't show alert for 404 - chapter might not have lessons yet
      if (error.response?.status !== 404) {
        console.error('Error fetching lessons for chapter', chapterId, error);
      }
    }
  };

  const fetchQuizzes = async (lessonId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `http://localhost:8080/api/v1/quizzes/lesson/${lessonId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const quizzesData = response.data.data || [];
      setQuizzes((prev) => ({ ...prev, [lessonId]: quizzesData }));
    } catch (error) {
      console.error('Error fetching quizzes:', error);
    }
  };

  const toggleChapter = (chapterId) => {
    const newExpanded = new Set(expandedChapters);
    if (newExpanded.has(chapterId)) {
      newExpanded.delete(chapterId);
    } else {
      newExpanded.add(chapterId);
    }
    setExpandedChapters(newExpanded);
  };

  const handleCreateChapter = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        'http://localhost:8080/api/v1/chapters',
        {
          courseId: parseInt(selectedCourseId),
          ...chapterForm,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      toast.success('Tạo chương thành công!');
      setShowChapterModal(false);
      setChapterForm({ title: '', description: '', sortorder: 0 });
      // Refresh data ngay lập tức
      await fetchChapters();
    } catch (error) {
      toast.error('Lỗi: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleUpdateChapter = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `http://localhost:8080/api/v1/chapters/${editingChapter.chapterid}`,
        chapterForm,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      toast.success('Cập nhật chương thành công!');
      setShowChapterModal(false);
      setEditingChapter(null);
      setChapterForm({ title: '', description: '', sortorder: 0 });
      // Refresh data ngay lập tức
      await fetchChapters();
    } catch (error) {
      toast.error('Lỗi: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleDeleteChapter = async (chapterId) => {
    const confirmed = await confirm({
      title: 'Xác nhận xóa',
      message: 'Bạn có chắc chắn muốn xóa chương này? Tất cả bài học trong chương sẽ bị xóa.',
      confirmText: 'Xóa',
      cancelText: 'Hủy',
    });
    if (!confirmed) return;

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:8080/api/v1/chapters/${chapterId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success('Xóa chương thành công!');
      fetchChapters();
    } catch (error) {
      toast.error('Lỗi: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleVideoFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Kiểm tra loại file
      if (!file.type.startsWith('video/')) {
        toast.warning('Vui lòng chọn file video!');
        return;
      }
      // Kiểm tra kích thước (500MB)
      if (file.size > 500 * 1024 * 1024) {
        toast.warning('File video không được vượt quá 500MB!');
        return;
      }
      setSelectedVideo(file);
    }
  };

  const handleCreateLesson = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // Nếu chọn upload file và có file được chọn
      if (videoUploadMethod === 'upload' && selectedVideo) {
        // Tạo bài học trước (không có videourl)
        const createResponse = await axios.post(
          'http://localhost:8080/api/v1/lessons',
          {
            chapterid: parseInt(selectedChapterId),
            courseid: parseInt(selectedCourseId),
            ...lessonForm,
            videourl: '', // Tạm thời để trống
          },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const newLessonId = createResponse.data.data.lessonid;
        
        // Upload video cho bài học vừa tạo
        setUploadingVideo(true);
        try {
          const formDataVideo = new FormData();
          formDataVideo.append('video', selectedVideo);
          await axios.post(
            `http://localhost:8080/api/v1/lessons/${newLessonId}/upload-video`,
            formDataVideo,
            {
              headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'multipart/form-data',
              },
            }
          );
          toast.success('Tạo bài học và upload video thành công!');
        } catch (uploadError) {
          setUploadingVideo(false);
          toast.warning('Tạo bài học thành công nhưng upload video thất bại: ' + (uploadError.response?.data?.message || uploadError.message));
        }
        setUploadingVideo(false);
      } else {
        // Tạo bài học với YouTube link hoặc không có video
        await axios.post(
          'http://localhost:8080/api/v1/lessons',
          {
            chapterid: parseInt(selectedChapterId),
            courseid: parseInt(selectedCourseId),
            ...lessonForm,
            videourl: videoUploadMethod === 'youtube' ? lessonForm.videourl : '',
          },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        toast.success('Tạo bài học thành công!');
      }
      
      setShowLessonModal(false);
      setSelectedChapterId(null);
      setSelectedVideo(null);
      setVideoUploadMethod('youtube');
      setLessonForm({ title: '', content: '', videourl: '', sortorder: 0 });
      fetchLessons(parseInt(selectedChapterId));
    } catch (error) {
      setUploadingVideo(false);
      toast.error('Lỗi: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleUpdateLesson = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // Nếu chọn upload file và có file mới được chọn
      if (videoUploadMethod === 'upload' && selectedVideo) {
        setUploadingVideo(true);
        try {
          // Upload video trước
          const formDataVideo = new FormData();
          formDataVideo.append('video', selectedVideo);
          const uploadResponse = await axios.post(
            `http://localhost:8080/api/v1/lessons/${editingLesson.lessonid}/upload-video`,
            formDataVideo,
            {
              headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'multipart/form-data',
              },
            }
          );
          // Cập nhật videourl từ response
          lessonForm.videourl = uploadResponse.data.data.videoUrl;
        } catch (uploadError) {
          setUploadingVideo(false);
          toast.error('Lỗi upload video: ' + (uploadError.response?.data?.message || uploadError.message));
          return;
        }
        setUploadingVideo(false);
      }
      
      // Cập nhật bài học
      await axios.put(
        `http://localhost:8080/api/v1/lessons/${editingLesson.lessonid}`,
        {
          ...lessonForm,
          videourl: videoUploadMethod === 'youtube' ? lessonForm.videourl : lessonForm.videourl,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      toast.success('Cập nhật bài học thành công!');
      setShowLessonModal(false);
      setEditingLesson(null);
      setSelectedVideo(null);
      setVideoUploadMethod('youtube');
      setLessonForm({ title: '', content: '', videourl: '', sortorder: 0 });
      fetchLessons(editingLesson.chapterid);
    } catch (error) {
      setUploadingVideo(false);
      toast.error('Lỗi: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleDeleteLesson = async (lessonId, chapterId) => {
    const confirmed = await confirm({
      title: 'Xác nhận xóa',
      message: 'Bạn có chắc chắn muốn xóa bài học này?',
      confirmText: 'Xóa',
      cancelText: 'Hủy',
    });
    if (!confirmed) return;

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:8080/api/v1/lessons/${lessonId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success('Xóa bài học thành công!');
      fetchLessons(chapterId);
    } catch (error) {
      toast.error('Lỗi: ' + (error.response?.data?.message || error.message));
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Quản lý nội dung khóa học</h1>

      {/* Course Selector */}
      <div className="bg-white p-4 rounded-lg shadow-md mb-6">
        <label className="block text-sm font-medium mb-2">Chọn khóa học</label>
        <select
          value={selectedCourseId}
          onChange={(e) => {
            setSelectedCourseId(e.target.value);
            setChapters([]);
            setLessons({});
            setExpandedChapters(new Set());
          }}
          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 cursor-pointer"
        >
          <option value="">-- Chọn khóa học --</option>
          {courses.map((course) => (
            <option key={course.courseid} value={course.courseid}>
              {course.coursename}
            </option>
          ))}
        </select>
      </div>

      {!selectedCourseId && (
        <div className="bg-white rounded-lg shadow-md p-12 text-center text-gray-500">
          Vui lòng chọn khóa học để quản lý nội dung
        </div>
      )}

      {selectedCourseId && (
        <div className="space-y-4">
          {/* Add Chapter Button */}
          <div className="flex justify-end">
            <button
              onClick={() => {
                setEditingChapter(null);
                setChapterForm({ title: '', description: '', sortorder: chapters.length + 1 });
                setShowChapterModal(true);
              }}
              className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 flex items-center gap-2 cursor-pointer"
            >
              <FaPlus /> Thêm chương mới
            </button>
          </div>

          {/* Chapters List */}
          {loading ? (
            <div className="text-center py-12">Đang tải...</div>
          ) : chapters.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-12 text-center text-gray-500">
              Chưa có chương nào. Hãy thêm chương đầu tiên!
            </div>
          ) : (
            <div className="space-y-3">
              {chapters
                .sort((a, b) => (a.sortorder || 0) - (b.sortorder || 0))
                .map((chapter) => (
                  <div key={chapter.chapterid} className="bg-white rounded-lg shadow-md overflow-hidden">
                    <div className="p-4 flex items-center justify-between border-b">
                      <div className="flex items-center gap-3 flex-1">
                        <button
                          onClick={() => toggleChapter(chapter.chapterid)}
                          className="text-gray-500 hover:text-gray-700 cursor-pointer"
                        >
                          {expandedChapters.has(chapter.chapterid) ? (
                            <FaChevronDown />
                          ) : (
                            <FaChevronRight />
                          )}
                        </button>
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg">{chapter.title}</h3>
                          {chapter.description && (
                            <p className="text-sm text-gray-500 mt-1">{chapter.description}</p>
                          )}
                          <p className="text-xs text-gray-400 mt-1">
                            Thứ tự: {chapter.sortorder || 0} | Số bài học: {lessons[chapter.chapterid]?.length || 0}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setSelectedChapterId(chapter.chapterid);
                            setLessonForm({ title: '', content: '', videourl: '', sortorder: (lessons[chapter.chapterid]?.length || 0) + 1 });
                            setVideoUploadMethod('youtube');
                            setSelectedVideo(null);
                            setShowLessonModal(true);
                          }}
                          className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200 flex items-center gap-1 cursor-pointer"
                        >
                          <FaPlus className="text-xs" /> Bài học
                        </button>
                        <button
                          onClick={() => {
                            setEditingChapter(chapter);
                            setChapterForm({
                              title: chapter.title,
                              description: chapter.description || '',
                              sortorder: chapter.sortorder || 0,
                            });
                            setShowChapterModal(true);
                          }}
                          className="px-3 py-1 text-sm text-blue-600 hover:text-blue-800 cursor-pointer"
                        >
                          <FaEdit />
                        </button>
                        <button
                          onClick={() => handleDeleteChapter(chapter.chapterid)}
                          className="px-3 py-1 text-sm text-red-600 hover:text-red-800 cursor-pointer"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </div>

                    {/* Lessons List */}
                    {expandedChapters.has(chapter.chapterid) && (
                      <div className="bg-gray-50 p-4 space-y-2">
                        {lessons[chapter.chapterid]?.length > 0 ? (
                          lessons[chapter.chapterid]
                            .sort((a, b) => (a.sortorder || 0) - (b.sortorder || 0))
                            .map((lesson) => (
                              <div
                                key={lesson.lessonid}
                                className="bg-white rounded border p-3 flex items-center justify-between"
                              >
                                <div className="flex items-center gap-3 flex-1">
                                  <FaVideo className="text-gray-400" />
                                  <div className="flex-1">
                                    <h4 className="font-medium">{lesson.title}</h4>
                                    {lesson.videourl && (
                                      <p className="text-xs text-gray-500 truncate max-w-md">
                                        Video: {lesson.videourl}
                                      </p>
                                    )}
                                    <p className="text-xs text-gray-400">
                                      Thứ tự: {lesson.sortorder || 0} | Quiz: {quizzes[lesson.lessonid]?.length || 0}
                                    </p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={() => {
                                      setSelectedLessonId(lesson.lessonid);
                                      setShowQuizModal(true);
                                    }}
                                    className="px-2 py-1 text-xs bg-purple-100 text-purple-700 rounded hover:bg-purple-200 flex items-center gap-1 cursor-pointer"
                                  >
                                    <FaQuestionCircle className="text-xs" /> Quiz ({quizzes[lesson.lessonid]?.length || 0})
                                  </button>
                                    <button
                                      onClick={() => {
                                        setEditingLesson(lesson);
                                        setLessonForm({
                                          title: lesson.title,
                                          content: lesson.content || '',
                                          videourl: lesson.videourl || '',
                                          sortorder: lesson.sortorder || 0,
                                        });
                                        // Xác định phương thức upload dựa vào videourl
                                        const isYouTube = lesson.videourl && (lesson.videourl.includes('youtube.com') || lesson.videourl.includes('youtu.be'));
                                        setVideoUploadMethod(isYouTube ? 'youtube' : (lesson.videourl ? 'upload' : 'youtube'));
                                        setSelectedVideo(null);
                                        setShowLessonModal(true);
                                      }}
                                    className="px-2 py-1 text-xs text-blue-600 hover:text-blue-800 cursor-pointer"
                                  >
                                    <FaEdit />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteLesson(lesson.lessonid, chapter.chapterid)}
                                    className="px-2 py-1 text-xs text-red-600 hover:text-red-800 cursor-pointer"
                                  >
                                    <FaTrash />
                                  </button>
                                </div>
                              </div>
                            ))
                        ) : (
                          <div className="text-center text-gray-400 text-sm py-4">
                            Chưa có bài học nào
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
            </div>
          )}
        </div>
      )}

      {/* Chapter Modal */}
      {showChapterModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0" onClick={() => setShowChapterModal(false)} />
          <div className="relative bg-white rounded-lg p-6 w-full max-w-md shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-xl font-bold mb-4">
              {editingChapter ? 'Sửa chương' : 'Thêm chương mới'}
            </h2>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                editingChapter ? handleUpdateChapter() : handleCreateChapter();
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-sm font-medium mb-2">Tên chương *</label>
                <input
                  type="text"
                  value={chapterForm.title}
                  onChange={(e) => setChapterForm({ ...chapterForm, title: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Mô tả</label>
                <textarea
                  value={chapterForm.description}
                  onChange={(e) => setChapterForm({ ...chapterForm, description: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500"
                  rows="3"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Thứ tự</label>
                <input
                  type="number"
                  value={chapterForm.sortorder}
                  onChange={(e) => setChapterForm({ ...chapterForm, sortorder: parseInt(e.target.value) || 0 })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500"
                  min="0"
                />
              </div>
              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setShowChapterModal(false);
                    setEditingChapter(null);
                    setChapterForm({ title: '', description: '', sortorder: 0 });
                  }}
                  className="px-4 py-2 border rounded-lg hover:bg-gray-100 cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 cursor-pointer"
                >
                  {editingChapter ? 'Cập nhật' : 'Tạo'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Lesson Modal */}
      {showLessonModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0" onClick={() => setShowLessonModal(false)} />
          <div className="relative bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-xl font-bold mb-4">
              {editingLesson ? 'Sửa bài học' : 'Thêm bài học mới'}
            </h2>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                editingLesson ? handleUpdateLesson() : handleCreateLesson();
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-sm font-medium mb-2">Tên bài học *</label>
                <input
                  type="text"
                  value={lessonForm.title}
                  onChange={(e) => setLessonForm({ ...lessonForm, title: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Nội dung</label>
                <textarea
                  value={lessonForm.content}
                  onChange={(e) => setLessonForm({ ...lessonForm, content: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500"
                  rows="6"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Video bài giảng</label>
                
                {/* Radio buttons để chọn phương thức */}
                <div className="flex gap-4 mb-3">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="videoMethod"
                      value="youtube"
                      checked={videoUploadMethod === 'youtube'}
                      onChange={(e) => {
                        setVideoUploadMethod(e.target.value);
                        setSelectedVideo(null);
                      }}
                      className="cursor-pointer"
                    />
                    <span>YouTube Link</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="videoMethod"
                      value="upload"
                      checked={videoUploadMethod === 'upload'}
                      onChange={(e) => {
                        setVideoUploadMethod(e.target.value);
                        setLessonForm({ ...lessonForm, videourl: '' });
                      }}
                      className="cursor-pointer"
                    />
                    <span>Upload từ máy tính</span>
                  </label>
                </div>

                {/* Hiển thị input tương ứng với phương thức đã chọn */}
                {videoUploadMethod === 'youtube' ? (
                  <input
                    type="text"
                    value={lessonForm.videourl}
                    onChange={(e) => setLessonForm({ ...lessonForm, videourl: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500"
                    placeholder="https://www.youtube.com/watch?v=... hoặc https://youtu.be/..."
                  />
                ) : (
                  <div>
                    <input
                      type="file"
                      accept="video/*"
                      onChange={handleVideoFileChange}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                    />
                    {selectedVideo && (
                      <p className="text-xs text-gray-500 mt-1">
                        Đã chọn: {selectedVideo.name} ({(selectedVideo.size / 1024 / 1024).toFixed(2)} MB)
                      </p>
                    )}
                    {uploadingVideo && (
                      <p className="text-sm text-blue-600 mt-2">Đang upload video... (có thể mất vài phút)</p>
                    )}
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Thứ tự</label>
                <input
                  type="number"
                  value={lessonForm.sortorder}
                  onChange={(e) => setLessonForm({ ...lessonForm, sortorder: parseInt(e.target.value) || 0 })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500"
                  min="0"
                />
              </div>
              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setShowLessonModal(false);
                    setEditingLesson(null);
                    setSelectedChapterId(null);
                    setSelectedVideo(null);
                    setVideoUploadMethod('youtube');
                    setLessonForm({ title: '', content: '', videourl: '', sortorder: 0 });
                  }}
                  className="px-4 py-2 border rounded-lg hover:bg-gray-100 cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 cursor-pointer"
                >
                  {editingLesson ? 'Cập nhật' : 'Tạo'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Quiz Management Modal */}
      {showQuizModal && selectedLessonId && (
        <QuizManagementModal
          lessonId={selectedLessonId}
          quizzes={quizzes[selectedLessonId] || []}
          onClose={() => {
            setShowQuizModal(false);
            setSelectedLessonId(null);
          }}
          onRefresh={async () => await fetchQuizzes(selectedLessonId)}
        />
      )}
        </div>
    );
};

// Quiz Management Modal Component
const QuizManagementModal = ({ lessonId, quizzes, onClose, onRefresh }) => {
  const toast = useToast();
  const { confirm } = useConfirm();
  const [showQuizForm, setShowQuizForm] = useState(false);
  const [showQuestionForm, setShowQuestionForm] = useState(false);
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [quizForm, setQuizForm] = useState({
    title: '',
    timelimit: 30,
    maxattempts: 1,
    showanswersaftersubmission: false,
  });
  const [questionForm, setQuestionForm] = useState({
    questiontext: '',
    explanation: '',
    options: [{ optiontext: '', iscorrect: false }],
  });
  const [quizDetails, setQuizDetails] = useState({}); // { quizId: { questions: [] } }

  const handleCreateQuiz = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        'http://localhost:8080/api/v1/quizzes',
        {
          lessonid: parseInt(lessonId),
          ...quizForm,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      toast.success('Tạo quiz thành công!');
      setShowQuizForm(false);
      setQuizForm({ title: '', timelimit: 30, maxattempts: 1, showanswersaftersubmission: false });
      // Refresh data ngay lập tức
      await onRefresh();
    } catch (error) {
      toast.error('Lỗi: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleDeleteQuiz = async (quizId) => {
    const confirmed = await confirm({
      title: 'Xác nhận xóa',
      message: 'Bạn có chắc chắn muốn xóa quiz này?',
      confirmText: 'Xóa',
      cancelText: 'Hủy',
    });
    if (!confirmed) return;

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:8080/api/v1/quizzes/${quizId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success('Xóa quiz thành công!');
      // Refresh data ngay lập tức
      await onRefresh();
    } catch (error) {
      toast.error('Lỗi: ' + (error.response?.data?.message || error.message));
    }
  };

  const fetchQuizDetails = async (quizId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`http://localhost:8080/api/v1/quizzes/${quizId}/teacher`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setQuizDetails((prev) => ({
        ...prev,
        [quizId]: response.data.data,
      }));
    } catch (error) {
      console.error('Error fetching quiz details:', error);
    }
  };

  const handleCreateQuestion = async () => {
    if (!selectedQuiz) return;
    if (!questionForm.questiontext || questionForm.options.length < 2) {
      toast.warning('Vui lòng nhập câu hỏi và ít nhất 2 đáp án');
      return;
    }

    const hasCorrectAnswer = questionForm.options.some((opt) => opt.iscorrect);
    if (!hasCorrectAnswer) {
      toast.warning('Vui lòng chọn ít nhất một đáp án đúng');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `http://localhost:8080/api/v1/quizzes/${selectedQuiz.quizid}/questions`,
        questionForm,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      toast.success('Tạo câu hỏi thành công!');
      setShowQuestionForm(false);
      setQuestionForm({
        questiontext: '',
        explanation: '',
        options: [{ optiontext: '', iscorrect: false }],
      });
      fetchQuizDetails(selectedQuiz.quizid);
    } catch (error) {
      toast.error('Lỗi: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleDeleteQuestion = async (questionId) => {
    const confirmed = await confirm({
      title: 'Xác nhận xóa',
      message: 'Bạn có chắc chắn muốn xóa câu hỏi này?',
      confirmText: 'Xóa',
      cancelText: 'Hủy',
    });
    if (!confirmed) return;

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:8080/api/v1/quizzes/questions/${questionId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success('Xóa câu hỏi thành công!');
      if (selectedQuiz) {
        fetchQuizDetails(selectedQuiz.quizid);
      }
    } catch (error) {
      toast.error('Lỗi: ' + (error.response?.data?.message || error.message));
    }
  };

  const addOption = () => {
    setQuestionForm({
      ...questionForm,
      options: [...questionForm.options, { optiontext: '', iscorrect: false }],
    });
  };

  const removeOption = (index) => {
    const newOptions = questionForm.options.filter((_, i) => i !== index);
    setQuestionForm({ ...questionForm, options: newOptions });
  };

  const updateOption = (index, field, value) => {
    const newOptions = [...questionForm.options];
    newOptions[index] = { ...newOptions[index], [field]: value };
    setQuestionForm({ ...questionForm, options: newOptions });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0" onClick={onClose} />
      <div className="relative bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">Quản lý Quiz</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl cursor-pointer"
          >
            <FaTimes />
          </button>
        </div>

        {/* Quiz List */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Danh sách Quiz</h3>
            <button
              onClick={() => {
                setSelectedQuiz(null);
                setQuizForm({ title: '', timelimit: 30, maxattempts: 1, showanswersaftersubmission: false });
                setShowQuizForm(true);
              }}
              className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 flex items-center gap-2 cursor-pointer"
            >
              <FaPlus /> Tạo Quiz mới
            </button>
          </div>

          {quizzes.length === 0 ? (
            <div className="text-center py-8 text-gray-500">Chưa có quiz nào</div>
          ) : (
            <div className="space-y-2">
              {quizzes.map((quiz) => (
                <div
                  key={quiz.quizid}
                  className="border rounded-lg p-4 flex items-center justify-between"
                >
                  <div className="flex-1">
                    <h4 className="font-medium">{quiz.title}</h4>
                    <p className="text-sm text-gray-500">
                      Thời gian: {quiz.timelimit} phút | Số lần thử: {quiz.maxattempts} | Câu hỏi:{' '}
                      {quiz.quizquestions?.length || 0}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setSelectedQuiz(quiz);
                        fetchQuizDetails(quiz.quizid);
                      }}
                      className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200 cursor-pointer"
                    >
                      Quản lý câu hỏi
                    </button>
                    <button
                      onClick={() => handleDeleteQuiz(quiz.quizid)}
                      className="px-3 py-1 text-sm text-red-600 hover:text-red-800 cursor-pointer"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Question Management for Selected Quiz */}
        {selectedQuiz && (
          <div className="border-t pt-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">
                Câu hỏi của Quiz: {selectedQuiz.title}
              </h3>
              <button
                onClick={() => {
                  setQuestionForm({
                    questiontext: '',
                    explanation: '',
                    options: [
                      { optiontext: '', iscorrect: false },
                      { optiontext: '', iscorrect: false },
                    ],
                  });
                  setShowQuestionForm(true);
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 cursor-pointer"
              >
                <FaPlus /> Thêm câu hỏi
              </button>
            </div>

            {quizDetails[selectedQuiz.quizid]?.questions?.length > 0 ? (
              <div className="space-y-3">
                {quizDetails[selectedQuiz.quizid].questions.map((question, qIndex) => (
                  <div key={question.questionid} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <p className="font-medium">
                          Câu {qIndex + 1}: {question.questiontext}
                        </p>
                        {question.explanation && (
                          <p className="text-sm text-gray-500 mt-1">
                            Giải thích: {question.explanation}
                          </p>
                        )}
                        <div className="mt-2 space-y-1">
                          {question.quizoptions?.map((option) => (
                            <div
                              key={option.optionid}
                              className={`text-sm ${
                                option.iscorrect ? 'text-green-600 font-medium' : 'text-gray-600'
                              }`}
                            >
                              {option.iscorrect ? '✓ ' : '○ '}
                              {option.optiontext}
                            </div>
                          ))}
                        </div>
                      </div>
                      <button
                        onClick={() => handleDeleteQuestion(question.questionid)}
                        className="text-red-600 hover:text-red-800 cursor-pointer"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">Chưa có câu hỏi nào</div>
            )}
          </div>
        )}

        {/* Create Quiz Form Modal */}
        {showQuizForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0" onClick={() => setShowQuizForm(false)} />
            <div className="relative bg-white rounded-lg p-6 w-full max-w-md shadow-2xl" onClick={(e) => e.stopPropagation()}>
              <h3 className="text-lg font-bold mb-4">Tạo Quiz mới</h3>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleCreateQuiz();
                }}
                className="space-y-4"
              >
                <div>
                  <label className="block text-sm font-medium mb-2">Tên Quiz *</label>
                  <input
                    type="text"
                    value={quizForm.title}
                    onChange={(e) => setQuizForm({ ...quizForm, title: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Thời gian (phút)</label>
                  <input
                    type="number"
                    value={quizForm.timelimit}
                    onChange={(e) => setQuizForm({ ...quizForm, timelimit: parseInt(e.target.value) || 30 })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500"
                    min="1"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Số lần thử tối đa</label>
                  <input
                    type="number"
                    value={quizForm.maxattempts}
                    onChange={(e) => setQuizForm({ ...quizForm, maxattempts: parseInt(e.target.value) || 1 })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500"
                    min="1"
                  />
                </div>
                <div>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={quizForm.showanswersaftersubmission}
                      onChange={(e) =>
                        setQuizForm({ ...quizForm, showanswersaftersubmission: e.target.checked })
                      }
                    />
                    <span className="text-sm">Hiển thị đáp án sau khi nộp bài</span>
                  </label>
                </div>
                <div className="flex gap-2 justify-end">
                  <button
                    type="button"
                    onClick={() => setShowQuizForm(false)}
                    className="px-4 py-2 border rounded-lg hover:bg-gray-100 cursor-pointer"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 cursor-pointer"
                  >
                    Tạo
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Create Question Form Modal */}
        {showQuestionForm && selectedQuiz && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0" onClick={() => setShowQuestionForm(false)} />
            <div className="relative bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>
              <h3 className="text-lg font-bold mb-4">Thêm câu hỏi mới</h3>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleCreateQuestion();
                }}
                className="space-y-4"
              >
                <div>
                  <label className="block text-sm font-medium mb-2">Câu hỏi *</label>
                  <textarea
                    value={questionForm.questiontext}
                    onChange={(e) => setQuestionForm({ ...questionForm, questiontext: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500"
                    rows="3"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Giải thích</label>
                  <textarea
                    value={questionForm.explanation}
                    onChange={(e) => setQuestionForm({ ...questionForm, explanation: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500"
                    rows="2"
                  />
                </div>
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-sm font-medium">Đáp án *</label>
                    <button
                      type="button"
                      onClick={addOption}
                      className="text-sm text-blue-600 hover:text-blue-800 cursor-pointer"
                    >
                      + Thêm đáp án
                    </button>
                  </div>
                  {questionForm.options.map((option, index) => (
                    <div key={index} className="flex items-center gap-2 mb-2">
                      <input
                        type="checkbox"
                        checked={option.iscorrect}
                        onChange={(e) => updateOption(index, 'iscorrect', e.target.checked)}
                        className="w-4 h-4"
                      />
                      <input
                        type="text"
                        value={option.optiontext}
                        onChange={(e) => updateOption(index, 'optiontext', e.target.value)}
                        className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500"
                        placeholder={`Đáp án ${index + 1}`}
                        required
                      />
                      {questionForm.options.length > 2 && (
                        <button
                          type="button"
                          onClick={() => removeOption(index)}
                          className="text-red-600 hover:text-red-800 cursor-pointer"
                        >
                          <FaTrash />
                        </button>
                      )}
                    </div>
                  ))}
                  <p className="text-xs text-gray-500 mt-2">
                    ✓ Chọn checkbox để đánh dấu đáp án đúng
                  </p>
                </div>
                <div className="flex gap-2 justify-end">
                  <button
                    type="button"
                    onClick={() => setShowQuestionForm(false)}
                    className="px-4 py-2 border rounded-lg hover:bg-gray-100 cursor-pointer"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 cursor-pointer"
                  >
                    Tạo câu hỏi
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
        </div>
    );
};

export default Teacher;
