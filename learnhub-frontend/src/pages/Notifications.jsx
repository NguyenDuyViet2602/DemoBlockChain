// src/pages/Notifications.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaBell, FaCheck, FaTrash, FaCheckCircle } from 'react-icons/fa';
import { useToast } from '../contexts/ToastContext';
import { useConfirm } from '../contexts/ConfirmContext';

const Notifications = () => {
  const toast = useToast();
  const { confirm } = useConfirm();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'unread', 'read'
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [unreadCount, setUnreadCount] = useState(0);
  const navigate = useNavigate();
  const limit = 20;

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/');
      return;
    }
    fetchNotifications();
    fetchUnreadCount();
  }, [activeTab, page]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const readParam = activeTab === 'unread' ? 'false' : activeTab === 'read' ? 'true' : null;
      
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });
      if (readParam !== null) {
        params.append('read', readParam);
      }

      const response = await axios.get(
        `http://localhost:8080/api/v1/notifications?${params.toString()}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setNotifications(response.data.data || []);
      setTotalPages(response.data.pagination?.totalPages || 1);
      setError(null);
    } catch (err) {
      console.error('Error fetching notifications:', err);
      setError('Lỗi khi tải thông báo');
    } finally {
      setLoading(false);
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:8080/api/v1/notifications/unread-count', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUnreadCount(response.data.data.unreadCount || 0);
    } catch (err) {
      console.error('Error fetching unread count:', err);
    }
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `http://localhost:8080/api/v1/notifications/${notificationId}/read`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setNotifications(prev =>
        prev.map(notif =>
          notif.notificationid === notificationId
            ? { ...notif, isread: true }
            : notif
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Error marking as read:', err);
      toast.error('Lỗi khi đánh dấu đã đọc');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        'http://localhost:8080/api/v1/notifications/read-all',
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setNotifications(prev => prev.map(notif => ({ ...notif, isread: true })));
      setUnreadCount(0);
      toast.success('Đã đánh dấu tất cả thông báo là đã đọc');
    } catch (err) {
      console.error('Error marking all as read:', err);
      toast.error('Lỗi khi đánh dấu tất cả đã đọc');
    }
  };

  const handleDelete = async (notificationId) => {
    const confirmed = await confirm({
      title: 'Xác nhận xóa',
      message: 'Bạn có chắc muốn xóa thông báo này?',
      confirmText: 'Xóa',
      cancelText: 'Hủy',
    });
    
    if (!confirmed) return;

    try {
      const token = localStorage.getItem('token');
      await axios.delete(
        `http://localhost:8080/api/v1/notifications/${notificationId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setNotifications(prev => prev.filter(notif => notif.notificationid !== notificationId));
      if (notifications.find(n => n.notificationid === notificationId && !n.isread)) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (err) {
      console.error('Error deleting notification:', err);
      toast.error('Lỗi khi xóa thông báo');
    }
  };

  const handleDeleteAllRead = async () => {
    const confirmed = await confirm({
      title: 'Xác nhận xóa',
      message: 'Bạn có chắc muốn xóa tất cả thông báo đã đọc?',
      confirmText: 'Xóa',
      cancelText: 'Hủy',
    });
    
    if (!confirmed) return;

    try {
      const token = localStorage.getItem('token');
      await axios.delete(
        'http://localhost:8080/api/v1/notifications/read-all',
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (activeTab === 'read' || activeTab === 'all') {
        setNotifications(prev => prev.filter(notif => !notif.isread));
      }
      toast.success('Đã xóa tất cả thông báo đã đọc');
    } catch (err) {
      console.error('Error deleting all read:', err);
      toast.error('Lỗi khi xóa thông báo');
    }
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Vừa xong';
    if (minutes < 60) return `${minutes} phút trước`;
    if (hours < 24) return `${hours} giờ trước`;
    if (days < 7) return `${days} ngày trước`;
    return date.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setPage(1);
  };

  if (loading && notifications.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang tải...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-6 max-w-4xl">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Thông báo</h1>
          <p className="text-gray-600">Quản lý tất cả thông báo của bạn</p>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => handleTabChange('all')}
              className={`flex-1 px-4 py-3 text-sm font-medium transition-colors cursor-pointer ${
                activeTab === 'all'
                  ? 'text-emerald-600 border-b-2 border-emerald-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Tất cả
            </button>
            <button
              onClick={() => handleTabChange('unread')}
              className={`flex-1 px-4 py-3 text-sm font-medium transition-colors cursor-pointer relative ${
                activeTab === 'unread'
                  ? 'text-emerald-600 border-b-2 border-emerald-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Chưa đọc
              {unreadCount > 0 && (
                <span className="ml-2 px-2 py-0.5 text-xs font-bold text-white bg-red-500 rounded-full">
                  {unreadCount}
                </span>
              )}
            </button>
            <button
              onClick={() => handleTabChange('read')}
              className={`flex-1 px-4 py-3 text-sm font-medium transition-colors cursor-pointer ${
                activeTab === 'read'
                  ? 'text-emerald-600 border-b-2 border-emerald-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Đã đọc
            </button>
          </div>

          {/* Actions */}
          <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
            <div className="text-sm text-gray-600">
              {notifications.length} thông báo
            </div>
            <div className="flex gap-2">
              {unreadCount > 0 && activeTab !== 'read' && (
                <button
                  onClick={handleMarkAllAsRead}
                  className="px-3 py-1.5 text-sm font-medium text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer flex items-center gap-2"
                >
                  <FaCheckCircle className="w-4 h-4" />
                  Đánh dấu tất cả đã đọc
                </button>
              )}
              {activeTab === 'read' && (
                <button
                  onClick={handleDeleteAllRead}
                  className="px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer flex items-center gap-2"
                >
                  <FaTrash className="w-4 h-4" />
                  Xóa tất cả đã đọc
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Notifications List */}
        {error ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={fetchNotifications}
              className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 cursor-pointer"
            >
              Thử lại
            </button>
          </div>
        ) : notifications.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <FaBell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-700 mb-2">
              {activeTab === 'unread' 
                ? 'Không có thông báo chưa đọc' 
                : activeTab === 'read'
                ? 'Không có thông báo đã đọc'
                : 'Chưa có thông báo nào'}
            </h2>
            <p className="text-gray-500">
              {activeTab === 'unread'
                ? 'Tất cả thông báo của bạn đã được đọc.'
                : 'Bạn sẽ nhận được thông báo khi có hoạt động mới.'}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {notifications.map((notification) => (
              <div
                key={notification.notificationid}
                className={`bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow ${
                  !notification.isread ? 'border-l-4 border-l-emerald-600' : ''
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                    !notification.isread ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-100 text-gray-400'
                  }`}>
                    <FaBell className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm ${!notification.isread ? 'font-semibold text-gray-900' : 'text-gray-700'}`}>
                      {notification.message}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {formatTime(notification.createdat)}
                    </p>
                  </div>
                  <div className="flex-shrink-0 flex items-center gap-2">
                    {!notification.isread && (
                      <button
                        onClick={() => handleMarkAsRead(notification.notificationid)}
                        className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                        title="Đánh dấu đã đọc"
                      >
                        <FaCheck className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(notification.notificationid)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                      title="Xóa"
                    >
                      <FaTrash className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-6 flex items-center justify-center gap-2">
            <button
              onClick={() => setPage(prev => Math.max(1, prev - 1))}
              disabled={page === 1}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
            >
              Trước
            </button>
            <span className="px-4 py-2 text-sm text-gray-600">
              Trang {page} / {totalPages}
            </span>
            <button
              onClick={() => setPage(prev => Math.min(totalPages, prev + 1))}
              disabled={page === totalPages}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
            >
              Sau
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;

