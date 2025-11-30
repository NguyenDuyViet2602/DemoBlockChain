// src/pages/Forum.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaArrowLeft, FaPlus, FaReply, FaUser } from 'react-icons/fa';
import { useToast } from '../contexts/ToastContext';

const Forum = () => {
  const toast = useToast();
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [discussions, setDiscussions] = useState([]);
  const [selectedDiscussion, setSelectedDiscussion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showNewDiscussionForm, setShowNewDiscussionForm] = useState(false);
  const [newDiscussionTitle, setNewDiscussionTitle] = useState('');
  const [replyContent, setReplyContent] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (courseId) {
      fetchDiscussions();
    }
  }, [courseId]);

  const fetchDiscussions = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `http://localhost:8080/api/v1/forums/course/${courseId}`
      );
      setDiscussions(response.data.data || []);
    } catch (err) {
      console.error('Error fetching discussions:', err);
      toast.error('Lỗi khi tải diễn đàn');
    } finally {
      setLoading(false);
    }
  };

  const fetchDiscussionDetails = async (discussionId) => {
    try {
      const response = await axios.get(
        `http://localhost:8080/api/v1/forums/discussions/${discussionId}`
      );
      setSelectedDiscussion(response.data.data);
    } catch (err) {
      console.error('Error fetching discussion details:', err);
      toast.error('Lỗi khi tải chi tiết chủ đề');
    }
  };

  const handleCreateDiscussion = async (e) => {
    e.preventDefault();
    if (!newDiscussionTitle.trim()) {
      toast.warning('Vui lòng nhập tiêu đề chủ đề');
      return;
    }

    try {
      setSubmitting(true);
      const token = localStorage.getItem('token');
      await axios.post(
        'http://localhost:8080/api/v1/forums/discussions',
        {
          courseId: Number(courseId),
          title: newDiscussionTitle.trim(),
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setNewDiscussionTitle('');
      setShowNewDiscussionForm(false);
      await fetchDiscussions();
      toast.success('Tạo chủ đề thành công!');
    } catch (err) {
      console.error('Error creating discussion:', err);
      toast.error(err.response?.data?.message || 'Lỗi khi tạo chủ đề');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitReply = async (e) => {
    e.preventDefault();
    if (!replyContent.trim() || !selectedDiscussion) {
      toast.warning('Vui lòng nhập nội dung phản hồi');
      return;
    }

    try {
      setSubmitting(true);
      const token = localStorage.getItem('token');
      const response = await axios.post(
        'http://localhost:8080/api/v1/forums/replies',
        {
          discussionId: selectedDiscussion.discussion.discussionid,
          content: replyContent.trim(),
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      
      setReplyContent('');
      await fetchDiscussionDetails(selectedDiscussion.discussion.discussionid);
      
      // Check if reward was distributed
      if (response.data?.reward) {
        if (response.data.reward.success) {
          toast.success(`Gửi phản hồi thành công! Bạn đã nhận ${response.data.reward.amount} LHT!`);
        } else {
          toast.warning(`Gửi phản hồi thành công! ${response.data.reward.message || ''}`);
        }
      } else {
        toast.success('Gửi phản hồi thành công!');
      }
    } catch (err) {
      console.error('Error submitting reply:', err);
      toast.error(err.response?.data?.message || 'Lỗi khi gửi phản hồi');
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <main className="container mx-auto px-6 py-12">
        <div className="text-center">Đang tải...</div>
      </main>
    );
  }

  if (selectedDiscussion) {
    return (
      <main className="container mx-auto px-6 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Back button */}
          <button
            onClick={() => setSelectedDiscussion(null)}
            className="mb-6 flex items-center gap-2 text-emerald-600 hover:text-emerald-700"
          >
            <FaArrowLeft /> Quay lại danh sách chủ đề
          </button>

          {/* Discussion Header */}
          <div className="bg-white rounded-lg border p-6 mb-6">
            <h1 className="text-2xl font-bold mb-4">{selectedDiscussion.discussion.title}</h1>
            <div className="flex items-center gap-3 text-sm text-gray-600">
              {selectedDiscussion.discussion.createdby_user?.profilepicture ? (
                <img
                  src={selectedDiscussion.discussion.createdby_user.profilepicture}
                  alt={selectedDiscussion.discussion.createdby_user.fullname}
                  className="w-8 h-8 rounded-full"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
                  <FaUser className="text-emerald-600" />
                </div>
              )}
              <span className="font-medium">
                {selectedDiscussion.discussion.createdby_user?.fullname || 'Người dùng'}
              </span>
              <span>•</span>
              <span>{formatDate(selectedDiscussion.discussion.createdat)}</span>
            </div>
          </div>

          {/* Replies */}
          <div className="space-y-4 mb-6">
            {selectedDiscussion.replies && selectedDiscussion.replies.length > 0 ? (
              selectedDiscussion.replies.map((reply) => (
                <div key={reply.replyid} className="bg-white rounded-lg border p-4">
                  <div className="flex gap-3">
                    {reply.user?.profilepicture ? (
                      <img
                        src={reply.user.profilepicture}
                        alt={reply.user.fullname}
                        className="w-10 h-10 rounded-full"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                        <FaUser className="text-emerald-600" />
                      </div>
                    )}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-medium text-emerald-700">
                          {reply.user?.fullname || 'Người dùng'}
                        </span>
                        <span className="text-xs text-gray-500">
                          {formatDate(reply.createdat)}
                        </span>
                      </div>
                      <p className="text-gray-700 whitespace-pre-wrap">{reply.content}</p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-white rounded-lg border p-8 text-center text-gray-500">
                Chưa có phản hồi nào. Hãy là người đầu tiên trả lời!
              </div>
            )}
          </div>

          {/* Reply Form */}
          <div className="bg-white rounded-lg border p-6">
            <h2 className="text-lg font-semibold mb-4">Gửi phản hồi</h2>
            <form onSubmit={handleSubmitReply}>
              <textarea
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                placeholder="Viết phản hồi của bạn..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 resize-none"
                rows="4"
              />
              <div className="mt-4 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setReplyContent('')}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={!replyContent.trim() || submitting}
                  className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? 'Đang gửi...' : 'Gửi phản hồi'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="container mx-auto px-6 py-12">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <button
              onClick={() => navigate(-1)}
              className="mb-4 flex items-center gap-2 text-emerald-600 hover:text-emerald-700"
            >
              <FaArrowLeft /> Quay lại
            </button>
            <h1 className="text-2xl font-bold">Diễn đàn khóa học</h1>
            <p className="text-gray-600 mt-1">Thảo luận và chia sẻ kiến thức</p>
          </div>
          <button
            onClick={() => setShowNewDiscussionForm(true)}
            className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 flex items-center gap-2"
          >
            <FaPlus /> Tạo chủ đề mới
          </button>
        </div>

        {/* New Discussion Form */}
        {showNewDiscussionForm && (
          <div className="bg-white rounded-lg border p-6 mb-6">
            <h2 className="text-lg font-semibold mb-4">Tạo chủ đề mới</h2>
            <form onSubmit={handleCreateDiscussion}>
              <input
                type="text"
                value={newDiscussionTitle}
                onChange={(e) => setNewDiscussionTitle(e.target.value)}
                placeholder="Nhập tiêu đề chủ đề..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 mb-4"
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowNewDiscussionForm(false);
                    setNewDiscussionTitle('');
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={!newDiscussionTitle.trim() || submitting}
                  className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? 'Đang tạo...' : 'Tạo chủ đề'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Discussions List */}
        {discussions.length === 0 ? (
          <div className="bg-white rounded-lg border p-12 text-center">
            <p className="text-gray-500 mb-4">Chưa có chủ đề thảo luận nào.</p>
            <button
              onClick={() => setShowNewDiscussionForm(true)}
              className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
            >
              Tạo chủ đề đầu tiên
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {discussions.map((discussion) => (
              <div
                key={discussion.discussionid}
                className="bg-white rounded-lg border p-6 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => fetchDiscussionDetails(discussion.discussionid)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold mb-2">{discussion.title}</h3>
                    <div className="flex items-center gap-3 text-sm text-gray-600">
                      {discussion.createdby_user?.profilepicture ? (
                        <img
                          src={discussion.createdby_user.profilepicture}
                          alt={discussion.createdby_user.fullname}
                          className="w-6 h-6 rounded-full"
                        />
                      ) : (
                        <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center">
                          <FaUser className="text-emerald-600 text-xs" />
                        </div>
                      )}
                      <span>{discussion.createdby_user?.fullname || 'Người dùng'}</span>
                      <span>•</span>
                      <span>{formatDate(discussion.createdat)}</span>
                    </div>
                  </div>
                  <FaReply className="text-gray-400" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
};

export default Forum;

