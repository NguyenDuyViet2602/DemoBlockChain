// src/pages/Admin.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  FaHome,
  FaUsers,
  FaChalkboardTeacher,
  FaBook,
  FaShoppingCart,
  FaFolder,
  FaStar,
  FaBars,
  FaTimes,
} from 'react-icons/fa';

const Admin = () => {
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
      const response = await axios.get('http://localhost:8080/api/v1/admin/dashboard/stats', {
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
    { id: 'users', label: 'Quản lý người dùng', icon: FaUsers },
    { id: 'teacher-requests', label: 'Yêu cầu Teacher', icon: FaChalkboardTeacher },
    { id: 'courses', label: 'Quản lý khóa học', icon: FaBook },
    { id: 'orders', label: 'Quản lý đơn hàng', icon: FaShoppingCart },
    { id: 'categories', label: 'Quản lý danh mục', icon: FaFolder },
    { id: 'reviews', label: 'Quản lý đánh giá', icon: FaStar },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardStats stats={stats} loading={loading} />;
      case 'users':
        return <UserManagement />;
      case 'teacher-requests':
        return <TeacherRequestManagement />;
      case 'courses':
        return <CourseManagement />;
      case 'orders':
        return <OrderManagement />;
      case 'categories':
        return <CategoryManagement />;
      case 'reviews':
        return <ReviewManagement />;
      default:
        return <DashboardStats stats={stats} loading={loading} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div
        className={`fixed top-16 left-0 h-[calc(100vh-4rem)] bg-white border-r transition-all duration-300 z-30 ${
          sidebarOpen ? 'w-64' : 'w-0 overflow-hidden'
        }`}
      >
        <div className="p-4">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-800">Admin Panel</h2>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-gray-500 hover:text-gray-700"
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
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
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
            className="text-gray-700 hover:text-gray-900"
          >
            <FaBars className="text-xl" />
          </button>
          <h1 className="text-xl font-bold text-gray-800">Admin Panel</h1>
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
      title: 'Tổng người dùng',
      value: stats.totalUsers,
      color: 'bg-blue-500',
      icon: '👥',
    },
    {
      title: 'Học viên',
      value: stats.totalStudents,
      color: 'bg-green-500',
      icon: '🎓',
    },
    {
      title: 'Giảng viên',
      value: stats.totalTeachers,
      color: 'bg-purple-500',
      icon: '👨‍🏫',
    },
    {
      title: 'Tổng khóa học',
      value: stats.totalCourses,
      color: 'bg-orange-500',
      icon: '📚',
    },
    {
      title: 'Khóa học chờ duyệt',
      value: stats.pendingCourses,
      color: 'bg-yellow-500',
      icon: '⏳',
    },
    {
      title: 'Tổng đơn hàng',
      value: stats.totalOrders,
      color: 'bg-indigo-500',
      icon: '🛒',
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
      title: 'Yêu cầu Teacher',
      value: stats.pendingTeacherRequests,
      color: 'bg-pink-500',
      icon: '📝',
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

// User Management Component
const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({ role: '', search: '' });

  useEffect(() => {
    fetchUsers();
  }, [page, filters]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        ...(filters.role && { role: filters.role }),
        ...(filters.search && { search: filters.search }),
      });

      const response = await axios.get(
        `http://localhost:8080/api/v1/admin/users?${params}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setUsers(response.data.data);
      setTotalPages(response.data.pagination.totalPages);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateRole = async (userId, newRole) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `http://localhost:8080/api/v1/admin/users/${userId}/role`,
        { role: newRole },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      fetchUsers();
      alert('Cập nhật role thành công!');
    } catch (error) {
      alert('Lỗi khi cập nhật role: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa người dùng này?')) return;

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:8080/api/v1/admin/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchUsers();
      alert('Xóa người dùng thành công!');
    } catch (error) {
      alert('Lỗi khi xóa người dùng: ' + (error.response?.data?.message || error.message));
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Quản lý người dùng</h1>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-md mb-6 flex gap-4 flex-wrap">
        <input
          type="text"
          placeholder="Tìm kiếm theo tên hoặc email..."
          value={filters.search}
          onChange={(e) => setFilters({ ...filters, search: e.target.value })}
          className="flex-1 min-w-[200px] px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
        />
        <select
          value={filters.role}
          onChange={(e) => setFilters({ ...filters, role: e.target.value })}
          className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
        >
          <option value="">Tất cả roles</option>
          <option value="Student">Student</option>
          <option value="Teacher">Teacher</option>
          <option value="Admin">Admin</option>
        </select>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {loading ? (
          <div className="text-center py-12">Đang tải...</div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tên
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ngày tạo
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Thao tác
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.map((user) => (
                    <tr key={user.userid}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {user.userid}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {user.fullname}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {user.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <select
                          value={user.role}
                          onChange={(e) => handleUpdateRole(user.userid, e.target.value)}
                          className="text-sm border rounded px-2 py-1 focus:ring-2 focus:ring-emerald-500"
                        >
                          <option value="Student">Student</option>
                          <option value="Teacher">Teacher</option>
                          <option value="Admin">Admin</option>
                        </select>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(user.createdat).toLocaleDateString('vi-VN')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <button
                          onClick={() => handleDeleteUser(user.userid)}
                          className="text-red-600 hover:text-red-800"
                        >
                          Xóa
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
                className="px-4 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
              >
                Trước
              </button>
              <span className="text-sm text-gray-700">
                Trang {page} / {totalPages}
              </span>
              <button
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                disabled={page === totalPages}
                className="px-4 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
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

// Teacher Request Management Component
const TeacherRequestManagement = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    fetchRequests();
  }, [page, statusFilter]);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        ...(statusFilter && { status: statusFilter }),
      });

      const response = await axios.get(
        `http://localhost:8080/api/v1/admin/teacher-requests?${params}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setRequests(response.data.data);
      setTotalPages(response.data.pagination.totalPages);
    } catch (error) {
      console.error('Error fetching requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (requestId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `http://localhost:8080/api/v1/admin/teacher-requests/${requestId}/approve`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      fetchRequests();
      alert('Duyệt yêu cầu thành công!');
    } catch (error) {
      alert('Lỗi: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleReject = async (requestId) => {
    if (!window.confirm('Bạn có chắc chắn muốn từ chối yêu cầu này?')) return;

    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `http://localhost:8080/api/v1/admin/teacher-requests/${requestId}/reject`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      fetchRequests();
      alert('Từ chối yêu cầu thành công!');
    } catch (error) {
      alert('Lỗi: ' + (error.response?.data?.message || error.message));
    }
  };

  const getStatusBadge = (status) => {
    const colors = {
      Pending: 'bg-yellow-100 text-yellow-800',
      Approved: 'bg-green-100 text-green-800',
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
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Quản lý yêu cầu Teacher</h1>

      {/* Filter */}
      <div className="bg-white p-4 rounded-lg shadow-md mb-6">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500"
        >
          <option value="">Tất cả trạng thái</option>
          <option value="Pending">Pending</option>
          <option value="Approved">Approved</option>
          <option value="Rejected">Rejected</option>
        </select>
      </div>

      {/* Requests Table */}
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
                      ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Người dùng
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Kinh nghiệm
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Chuyên môn
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
                  {requests.map((request) => (
                    <tr key={request.requestid}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">{request.requestid}</td>
                      <td className="px-6 py-4 text-sm">
                        <div>
                          <div className="font-medium">{request.user?.fullname}</div>
                          <div className="text-gray-500">{request.user?.email}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                        {request.experience}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                        {request.specialization}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(request.status)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                        {request.status === 'Pending' && (
                          <>
                            <button
                              onClick={() => handleApprove(request.requestid)}
                              className="text-green-600 hover:text-green-800"
                            >
                              Duyệt
                            </button>
                            <button
                              onClick={() => handleReject(request.requestid)}
                              className="text-red-600 hover:text-red-800"
                            >
                              Từ chối
                            </button>
                          </>
                        )}
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
                className="px-4 py-2 border rounded-lg disabled:opacity-50"
              >
                Trước
              </button>
              <span className="text-sm text-gray-700">
                Trang {page} / {totalPages}
              </span>
              <button
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                disabled={page === totalPages}
                className="px-4 py-2 border rounded-lg disabled:opacity-50"
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

// Course Management Component
const CourseManagement = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({ status: '', search: '' });

  useEffect(() => {
    fetchCourses();
  }, [page, filters]);

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
        `http://localhost:8080/api/v1/admin/courses?${params}`,
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

  const handleUpdateStatus = async (courseId, status) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `http://localhost:8080/api/v1/admin/courses/${courseId}/status`,
        { status },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      fetchCourses();
      alert('Cập nhật trạng thái thành công!');
    } catch (error) {
      alert('Lỗi: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleDelete = async (courseId) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa khóa học này?')) return;

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:8080/api/v1/admin/courses/${courseId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchCourses();
      alert('Xóa khóa học thành công!');
    } catch (error) {
      alert('Lỗi: ' + (error.response?.data?.message || error.message));
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
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Quản lý khóa học</h1>

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
          className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500"
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
                      ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Tên khóa học
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Giảng viên
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Giá
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
                      <td className="px-6 py-4 whitespace-nowrap text-sm">{course.courseid}</td>
                      <td className="px-6 py-4 text-sm font-medium">{course.coursename}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {course.teacher?.fullname || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {new Intl.NumberFormat('vi-VN', {
                          style: 'currency',
                          currency: 'VND',
                        }).format(course.price)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(course.status)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                        <select
                          value={course.status}
                          onChange={(e) => handleUpdateStatus(course.courseid, e.target.value)}
                          className="text-sm border rounded px-2 py-1 focus:ring-2 focus:ring-emerald-500"
                        >
                          <option value="Approved">Approved</option>
                          <option value="Pending">Pending</option>
                          <option value="Rejected">Rejected</option>
                        </select>
                        <button
                          onClick={() => handleDelete(course.courseid)}
                          className="ml-2 text-red-600 hover:text-red-800"
                        >
                          Xóa
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
                className="px-4 py-2 border rounded-lg disabled:opacity-50"
              >
                Trước
              </button>
              <span className="text-sm text-gray-700">
                Trang {page} / {totalPages}
              </span>
              <button
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                disabled={page === totalPages}
                className="px-4 py-2 border rounded-lg disabled:opacity-50"
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

// Order Management Component
const OrderManagement = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    fetchOrders();
  }, [page, statusFilter]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        ...(statusFilter && { status: statusFilter }),
      });

      const response = await axios.get(
        `http://localhost:8080/api/v1/admin/orders?${params}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setOrders(response.data.data);
      setTotalPages(response.data.pagination.totalPages);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (orderId, status) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `http://localhost:8080/api/v1/admin/orders/${orderId}/status`,
        { status },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      fetchOrders();
      alert('Cập nhật trạng thái thành công!');
    } catch (error) {
      alert('Lỗi: ' + (error.response?.data?.message || error.message));
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Quản lý đơn hàng</h1>

      {/* Filter */}
      <div className="bg-white p-4 rounded-lg shadow-md mb-6">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500"
        >
          <option value="">Tất cả trạng thái</option>
          <option value="Pending">Pending</option>
          <option value="Completed">Completed</option>
          <option value="Cancelled">Cancelled</option>
        </select>
      </div>

      {/* Orders Table */}
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
                      ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Người dùng
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Tổng tiền
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Trạng thái
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Ngày tạo
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Thao tác
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {orders.map((order) => (
                    <tr key={order.orderid}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">{order.orderid}</td>
                      <td className="px-6 py-4 text-sm">
                        <div>
                          <div className="font-medium">{order.user?.fullname}</div>
                          <div className="text-gray-500">{order.user?.email}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        {new Intl.NumberFormat('vi-VN', {
                          style: 'currency',
                          currency: 'VND',
                        }).format(order.totalamount)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <select
                          value={order.status}
                          onChange={(e) => handleUpdateStatus(order.orderid, e.target.value)}
                          className="text-sm border rounded px-2 py-1 focus:ring-2 focus:ring-emerald-500"
                        >
                          <option value="Pending">Pending</option>
                          <option value="Completed">Completed</option>
                          <option value="Cancelled">Cancelled</option>
                        </select>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(order.createdat).toLocaleDateString('vi-VN')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <button className="text-blue-600 hover:text-blue-800">Chi tiết</button>
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
                className="px-4 py-2 border rounded-lg disabled:opacity-50"
              >
                Trước
              </button>
              <span className="text-sm text-gray-700">
                Trang {page} / {totalPages}
              </span>
              <button
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                disabled={page === totalPages}
                className="px-4 py-2 border rounded-lg disabled:opacity-50"
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

// Category Management Component
const CategoryManagement = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({ categoryname: '', description: '' });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:8080/api/v1/admin/categories', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCategories(response.data.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      if (editingCategory) {
        await axios.put(
          `http://localhost:8080/api/v1/admin/categories/${editingCategory.categoryid}`,
          formData,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        alert('Cập nhật danh mục thành công!');
      } else {
        await axios.post('http://localhost:8080/api/v1/admin/categories', formData, {
          headers: { Authorization: `Bearer ${token}` },
        });
        alert('Tạo danh mục thành công!');
      }
      setShowModal(false);
      setEditingCategory(null);
      setFormData({ categoryname: '', description: '' });
      fetchCategories();
    } catch (error) {
      alert('Lỗi: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
    setFormData({
      categoryname: category.categoryname,
      description: category.description || '',
    });
    setShowModal(true);
  };

  const handleDelete = async (categoryId) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa danh mục này?')) return;

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:8080/api/v1/admin/categories/${categoryId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchCategories();
      alert('Xóa danh mục thành công!');
    } catch (error) {
      alert('Lỗi: ' + (error.response?.data?.message || error.message));
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Quản lý danh mục</h1>
        <button
          onClick={() => {
            setEditingCategory(null);
            setFormData({ categoryname: '', description: '' });
            setShowModal(true);
          }}
          className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
        >
          + Thêm danh mục
        </button>
      </div>

      {/* Categories List */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {loading ? (
          <div className="text-center py-12">Đang tải...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Tên danh mục
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Mô tả
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {categories.map((category) => (
                  <tr key={category.categoryid}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">{category.categoryid}</td>
                    <td className="px-6 py-4 text-sm font-medium">{category.categoryname}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{category.description || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                      <button
                        onClick={() => handleEdit(category)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        Sửa
                      </button>
                      <button
                        onClick={() => handleDelete(category.categoryid)}
                        className="text-red-600 hover:text-red-800"
                      >
                        Xóa
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">
              {editingCategory ? 'Sửa danh mục' : 'Thêm danh mục'}
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Tên danh mục</label>
                <input
                  type="text"
                  value={formData.categoryname}
                  onChange={(e) => setFormData({ ...formData, categoryname: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Mô tả</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500"
                  rows="3"
                />
              </div>
              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingCategory(null);
                    setFormData({ categoryname: '', description: '' });
                  }}
                  className="px-4 py-2 border rounded-lg hover:bg-gray-100"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
                >
                  {editingCategory ? 'Cập nhật' : 'Tạo'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// Review Management Component
const ReviewManagement = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchReviews();
  }, [page]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `http://localhost:8080/api/v1/admin/reviews?page=${page}&limit=10`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setReviews(response.data.data);
      setTotalPages(response.data.pagination.totalPages);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (reviewId) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa đánh giá này?')) return;

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:8080/api/v1/admin/reviews/${reviewId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchReviews();
      alert('Xóa đánh giá thành công!');
    } catch (error) {
      alert('Lỗi: ' + (error.response?.data?.message || error.message));
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Quản lý đánh giá</h1>

      {/* Reviews Table */}
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
                      ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Khóa học
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Học viên
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Đánh giá
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Bình luận
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Thao tác
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {reviews.map((review) => (
                    <tr key={review.reviewid}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">{review.reviewid}</td>
                      <td className="px-6 py-4 text-sm font-medium">
                        {review.course?.coursename}
                      </td>
                      <td className="px-6 py-4 text-sm">{review.student?.fullname}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-1">
                          {'⭐'.repeat(review.rating || 0)}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                        {review.comment || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <button
                          onClick={() => handleDelete(review.reviewid)}
                          className="text-red-600 hover:text-red-800"
                        >
                          Xóa
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
                className="px-4 py-2 border rounded-lg disabled:opacity-50"
              >
                Trước
              </button>
              <span className="text-sm text-gray-700">
                Trang {page} / {totalPages}
              </span>
              <button
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                disabled={page === totalPages}
                className="px-4 py-2 border rounded-lg disabled:opacity-50"
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

export default Admin;
