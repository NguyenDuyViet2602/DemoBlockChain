// src/pages/CourseDetail.jsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import RatingStars from '../components/site/RatingStars';
import VideoPlayer from '../components/VideoPlayer';
import { useToast } from '../contexts/ToastContext';

export default function CourseDetail() {
  const toast = useToast();
  const { id } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('token'));
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [expandedChapters, setExpandedChapters] = useState(new Set());
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [hasProgress, setHasProgress] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(false);

  const fetchCourseDetails = async () => {
    try {
      setLoading(true);
      const [courseRes, reviewsRes] = await Promise.all([
        axios.get(`http://localhost:8080/api/v1/courses/${id}`),
        axios.get(`http://localhost:8080/api/v1/reviews/${id}`).catch(() => ({ data: { data: [] } }))
      ]);

      setCourse(courseRes.data?.data || null);
      setReviews(reviewsRes.data?.data || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching course:', err);
      setError(err.response?.status === 404 ? 'Khóa học không tồn tại' : 'Lỗi khi tải thông tin khóa học');
    } finally {
      setLoading(false);
    }
  };

  const checkEnrollmentAndProgress = async () => {
    if (!isLoggedIn || !id) return;
    
    try {
      setCheckingStatus(true);
      const token = localStorage.getItem('token');
      
      // Check enrollment
      const enrollmentsRes = await axios.get('http://localhost:8080/api/v1/enrollments/my-courses', {
        headers: { Authorization: `Bearer ${token}` }
      }).catch(() => ({ data: { data: [] } }));
      
      const enrolledCourses = enrollmentsRes.data?.data || [];
      const enrolled = enrolledCourses.some(c => c.courseid === parseInt(id));
      setIsEnrolled(enrolled);
      
      // Check progress if enrolled
      if (enrolled) {
        const progressRes = await axios.get(`http://localhost:8080/api/v1/progress/course/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        }).catch(() => ({ data: { data: [] } }));
        
        const completedLessons = progressRes.data?.data || [];
        setHasProgress(completedLessons.length > 0);
      }
      
      // Check favorite status
      const favoritesRes = await axios.get('http://localhost:8080/api/v1/favorites', {
        headers: { Authorization: `Bearer ${token}` }
      }).catch(() => ({ data: { data: [] } }));
      
      const favorites = favoritesRes.data?.data || [];
      const favorited = favorites.some(f => f.courseid === parseInt(id));
      setIsFavorite(favorited);
    } catch (err) {
      console.error('Error checking enrollment/progress:', err);
    } finally {
      setCheckingStatus(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchCourseDetails();
    }
    const loggedIn = !!localStorage.getItem('token');
    setIsLoggedIn(loggedIn);
  }, [id]);

  useEffect(() => {
    if (isLoggedIn && id) {
      checkEnrollmentAndProgress();
    } else {
      setIsEnrolled(false);
      setHasProgress(false);
      setIsFavorite(false);
    }
  }, [isLoggedIn, id]);

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!reviewRating || reviewRating < 1 || reviewRating > 5) {
      toast.warning('Vui lòng chọn số sao đánh giá từ 1 đến 5');
      return;
    }

    if (!isLoggedIn) {
      toast.warning('Vui lòng đăng nhập để đánh giá khóa học');
      return;
    }

    try {
      setSubmittingReview(true);
      const token = localStorage.getItem('token');
      await axios.post(
        `http://localhost:8080/api/v1/reviews/${id}`,
        {
          rating: reviewRating,
          comment: reviewComment.trim() || null,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      
      // Reset form
      setReviewRating(0);
      setReviewComment('');
      setShowReviewForm(false);
      
      // Refresh reviews
      await fetchCourseDetails();
      toast.success('Cảm ơn bạn đã đánh giá khóa học!');
    } catch (err) {
      console.error('Error submitting review:', err);
      toast.error(err.response?.data?.message || 'Lỗi khi gửi đánh giá. ' + err.message);
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleToggleFavorite = async () => {
    if (!isLoggedIn) {
      toast.warning('Vui lòng đăng nhập để thêm vào yêu thích');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (isFavorite) {
        // Remove from favorites
        await axios.delete(`http://localhost:8080/api/v1/favorites/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setIsFavorite(false);
        toast.success('Đã xóa khỏi danh sách yêu thích');
      } else {
        // Add to favorites
        await axios.post(
          `http://localhost:8080/api/v1/favorites`,
          { courseId: parseInt(id) },
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );
        setIsFavorite(true);
        toast.success('Đã thêm vào danh sách yêu thích');
      }
    } catch (err) {
      console.error('Error toggling favorite:', err);
      toast.error(err.response?.data?.message || 'Lỗi khi cập nhật yêu thích');
    }
  };

  const handlePurchaseOrLearn = async () => {
    if (!isLoggedIn) {
      toast.warning('Vui lòng đăng nhập để mua khóa học');
      return;
    }

    if (isEnrolled) {
      // Navigate to learning page
      navigate(`/learn/${id}`);
      return;
    }

    // Nếu khóa học miễn phí, enroll trực tiếp
    if (course && course.price === 0) {
      try {
        const token = localStorage.getItem('token');
        await axios.post(
          'http://localhost:8080/api/v1/enrollments',
          { courseId: parseInt(id) },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        toast.success('Đăng ký khóa học miễn phí thành công!');
        setIsEnrolled(true);
        navigate(`/learn/${id}`);
      } catch (err) {
        console.error('Error enrolling:', err);
        toast.error(err.response?.data?.message || 'Lỗi khi đăng ký khóa học');
      }
      return;
    }

    // Khóa học có phí - thêm vào giỏ hàng và đi đến checkout
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        'http://localhost:8080/api/v1/cart',
        { courseId: parseInt(id) },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      navigate('/checkout');
    } catch (err) {
      console.error('Error adding to cart:', err);
      if (err.response?.data?.message?.includes('đã có trong giỏ hàng')) {
        // Đã có trong giỏ hàng, đi thẳng đến checkout
        navigate('/checkout');
      } else {
        toast.error(err.response?.data?.message || 'Lỗi khi thêm vào giỏ hàng');
      }
    }
  };

  const handleAddToCart = async () => {
    if (!isLoggedIn) {
      toast.warning('Vui lòng đăng nhập để thêm vào giỏ hàng');
      return;
    }

    if (course && course.price === 0) {
      toast.info('Khóa học miễn phí, vui lòng bấm "Đăng ký miễn phí"');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.post(
        'http://localhost:8080/api/v1/cart',
        { courseId: parseInt(id) },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Đã thêm vào giỏ hàng!');
    } catch (err) {
      console.error('Error adding to cart:', err);
      if (err.response?.data?.message?.includes('đã có trong giỏ hàng')) {
        toast.info('Khóa học này đã có trong giỏ hàng của bạn');
      } else {
        toast.error(err.response?.data?.message || 'Lỗi khi thêm vào giỏ hàng');
      }
    }
  };

  if (loading) {
    return (
      <main className="container mx-auto px-6 py-12">
        <div className="text-center">Đang tải...</div>
      </main>
    );
  }

  if (error || !course) {
    return (
      <main className="container mx-auto px-6 py-12">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || 'Khóa học không tồn tại'}</p>
          <button
            onClick={() => navigate('/')}
            className="rounded-full bg-emerald-600 px-6 py-2 text-white hover:bg-emerald-700 cursor-pointer"
          >
            Về trang chủ
          </button>
        </div>
      </main>
    );
  }

  // Tính toán các thống kê
  const totalLessons = course.chapters?.reduce((sum, ch) => sum + (ch.lessons?.length || 0), 0) || 0;
  const totalChapters = course.chapters?.length || 0;
  const coursePrice = course.price === 0 ? 'Miễn phí' : `${course.price.toLocaleString()} VND`;
  const oldPrice = course.originalPrice || course.oldPrice;
  const discount = oldPrice && course.price ? Math.round(((oldPrice - course.price) / oldPrice) * 100) : 0;
  const averageRating = reviews.length > 0 
    ? (reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviews.length).toFixed(1)
    : 0;

  // Lấy video đầu tiên của khóa học
  const getFirstVideo = () => {
    if (course.chapters && course.chapters.length > 0) {
      const firstChapter = course.chapters[0];
      if (firstChapter.lessons && firstChapter.lessons.length > 0) {
        const firstLesson = firstChapter.lessons[0];
        return firstLesson.videourl || null;
      }
    }
    return null;
  };

  const firstVideoUrl = getFirstVideo();
  const isYouTubeVideo = firstVideoUrl && (firstVideoUrl.includes('youtube.com') || firstVideoUrl.includes('youtu.be'));

  return (
    <main>
      <section className="container mx-auto px-6 mt-6 grid gap-8 lg:grid-cols-[1fr_360px]">
        {/* Left: Video + details */}
        <div>
          <div className="overflow-hidden rounded-2xl border bg-white shadow-sm">
            {firstVideoUrl ? (
              <VideoPlayer
                videoUrl={firstVideoUrl}
                title={course.coursename}
                isYouTube={isYouTubeVideo}
              />
            ) : course.thumbnailUrl ? (
              <img
                src={course.thumbnailUrl}
                alt={course.coursename}
                className="aspect-video w-full object-cover"
              />
            ) : (
              <div className="aspect-video w-full bg-gray-200 flex items-center justify-center">
                <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            )}
          </div>

          {/* Title + meta */}
          <div className="mt-6">
            <h1 className="text-xl font-extrabold tracking-tight">{course.coursename}</h1>
            <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-gray-600">
              {course.teacher && (
                <div className="flex items-center gap-2">
                  <span className="grid size-6 place-items-center rounded-full bg-emerald-100 text-emerald-700">
                    {course.teacher.profilepicture ? (
                      <img src={course.teacher.profilepicture} alt={course.teacher.fullname || 'Giảng viên'} className="w-full h-full rounded-full object-cover" />
                    ) : (
                      <span>👤</span>
                    )}
                  </span>
                  <span className="font-medium text-gray-900">
                    {course.teacher.fullname || course.teacher.username || 'Giảng viên'}
                  </span>
                </div>
              )}
              {!course.teacher && (
                <div className="flex items-center gap-2">
                  <span className="grid size-6 place-items-center rounded-full bg-emerald-100 text-emerald-700">
                    <span>👤</span>
                  </span>
                  <span className="font-medium text-gray-900">Giảng viên</span>
                </div>
              )}
              {course.category && (
                <div className="flex items-center gap-1 text-gray-600">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                  <span>{course.category.categoryname}</span>
                </div>
              )}
              {averageRating > 0 && (
                <div className="flex items-center gap-1">
                  <RatingStars value={parseFloat(averageRating)} reviewCount={reviews.length} size="sm" />
                </div>
              )}
            </div>
          </div>

          {/* About */}
          <section className="mt-6">
            <h2 className="font-semibold text-lg">Giới thiệu khóa học</h2>
            <p className="mt-2 text-sm leading-7 text-gray-600 whitespace-pre-line">
              {course.description || 'Chưa có mô tả cho khóa học này.'}
            </p>
          </section>

          {/* Course Content - Chapters and Lessons */}
          {course.chapters && course.chapters.length > 0 && (
            <section className="mt-8">
              <h2 className="font-semibold text-lg mb-4">Nội dung khóa học</h2>
              <div className="space-y-2">
                {course.chapters.map((chapter, chapterIndex) => {
                  const isExpanded = expandedChapters.has(chapter.chapterid);
                  const lessonCount = chapter.lessons?.length || 0;
                  
                  return (
                    <div key={chapter.chapterid} className="border rounded-lg overflow-hidden">
                      <button
                        onClick={() => {
                          const newExpanded = new Set(expandedChapters);
                          if (isExpanded) {
                            newExpanded.delete(chapter.chapterid);
                          } else {
                            newExpanded.add(chapter.chapterid);
                          }
                          setExpandedChapters(newExpanded);
                        }}
                        className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors cursor-pointer"
                      >
                        <div className="flex items-center gap-3 flex-1 text-left">
                          <span className="text-sm font-medium text-gray-500">
                            Chương {chapterIndex + 1}:
                          </span>
                          <span className="font-medium text-gray-900">{chapter.title}</span>
                          {lessonCount > 0 && (
                            <span className="text-xs text-gray-500">({lessonCount} bài học)</span>
                          )}
                        </div>
                        <svg
                          className={`w-5 h-5 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                      {isExpanded && chapter.lessons && chapter.lessons.length > 0 && (
                        <div className="border-t bg-gray-50">
                          <ul className="py-2">
                            {chapter.lessons.map((lesson, lessonIndex) => (
                              <li
                                key={lesson.lessonid}
                                className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-100 transition-colors"
                              >
                                <svg className="w-4 h-4 text-emerald-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span className="text-gray-500 text-xs w-6">{lessonIndex + 1}.</span>
                                <span className="flex-1">{lesson.title}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* Reviews */}
          <section className="mt-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-lg">Đánh giá ({reviews.length})</h2>
              {isLoggedIn && !showReviewForm && (
                <button
                  onClick={() => setShowReviewForm(true)}
                  className="px-4 py-2 text-sm font-medium text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                >
                  Viết đánh giá
                </button>
              )}
            </div>

            {/* Review Form */}
            {showReviewForm && isLoggedIn && (
              <div className="mb-6 p-4 bg-gray-50 rounded-lg border">
                <h3 className="text-sm font-semibold mb-3">Viết đánh giá của bạn</h3>
                <form onSubmit={handleSubmitReview}>
                  <div className="mb-3">
                    <label className="block text-sm font-medium mb-2">Đánh giá sao *</label>
                    <div className="flex items-center gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setReviewRating(star)}
                          className={`text-2xl transition-colors cursor-pointer ${
                            star <= reviewRating ? 'text-amber-500' : 'text-gray-300'
                          }`}
                        >
                          ★
                        </button>
                      ))}
                      {reviewRating > 0 && (
                        <span className="text-sm text-gray-600 ml-2">{reviewRating} sao</span>
                      )}
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="block text-sm font-medium mb-2">Bình luận (tùy chọn)</label>
                    <textarea
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                      placeholder="Chia sẻ trải nghiệm của bạn về khóa học này..."
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 resize-none"
                      rows="4"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      disabled={!reviewRating || submittingReview}
                      className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
                    >
                      {submittingReview ? 'Đang gửi...' : 'Gửi đánh giá'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowReviewForm(false);
                        setReviewRating(0);
                        setReviewComment('');
                      }}
                      className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                    >
                      Hủy
                    </button>
                  </div>
                </form>
              </div>
            )}

            {reviews.length > 0 ? (
              <>
                <ul className="space-y-5">
                  {reviews.map((review) => (
                    <li key={review.reviewid} className="flex gap-3">
                      <div className="flex-shrink-0">
                        {review.student?.profilepicture ? (
                          <img
                            src={review.student.profilepicture}
                            alt={review.student.fullname || 'Người dùng'}
                            className="h-9 w-9 rounded-full object-cover"
                          />
                        ) : (
                          <div className="h-9 w-9 rounded-full bg-gray-200 flex items-center justify-center">
                            <span className="text-gray-500 text-sm">👤</span>
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="text-sm font-medium text-emerald-700">
                            {review.student?.fullname || 'Người dùng'}
                          </p>
                          {review.rating && (
                            <RatingStars value={review.rating} size="sm" />
                          )}
                        </div>
                        {review.comment && (
                          <p className="mt-1 text-sm text-gray-600">{review.comment}</p>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
                {reviews.length > 5 && (
                  <div className="mt-6">
                    <button className="rounded-full border px-5 py-2 text-sm font-medium hover:bg-gray-50 transition-colors cursor-pointer">
                      Xem thêm đánh giá
                    </button>
                  </div>
                )}
              </>
            ) : (
              <p className="text-sm text-gray-500">Chưa có đánh giá nào cho khóa học này.</p>
            )}
          </section>
        </div>

        {/* Right sidebar */}
        <aside className="space-y-6">
          <div className="overflow-hidden rounded-2xl border bg-white p-5 shadow-sm sticky top-20">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-xl font-bold text-emerald-600">{coursePrice}</div>
                {oldPrice && oldPrice > course.price && (
                  <div className="text-xs text-gray-500 line-through">
                    {oldPrice.toLocaleString()} VND
                  </div>
                )}
              </div>
              {discount > 0 && (
                <span className="rounded-md bg-emerald-100 px-2 py-1 text-xs font-semibold text-emerald-700">
                  -{discount}%
                </span>
              )}
            </div>
            <button
              onClick={handlePurchaseOrLearn}
              className="mt-4 w-full rounded-full bg-emerald-600 px-4 py-3 text-white font-semibold hover:bg-emerald-700 transition-colors cursor-pointer"
            >
              {isEnrolled
                ? (hasProgress ? 'Tiếp tục học' : 'Bắt đầu học')
                : (course && course.price === 0 ? 'Đăng ký miễn phí' : 'Mua khóa học')
              }
            </button>
            {isLoggedIn && !isEnrolled && course && course.price > 0 && (
              <button
                onClick={handleAddToCart}
                className="mt-3 w-full rounded-full border border-emerald-600 px-4 py-3 text-emerald-600 font-semibold hover:bg-emerald-50 transition-colors cursor-pointer"
              >
                Thêm vào giỏ hàng
              </button>
            )}
            {isLoggedIn && (
              <button
                onClick={handleToggleFavorite}
                className={`mt-3 w-full rounded-full border px-4 py-3 text-sm font-medium transition-colors cursor-pointer ${
                  isFavorite
                    ? 'bg-red-50 border-red-300 text-red-600 hover:bg-red-100'
                    : 'hover:bg-gray-50'
                }`}
              >
                {isFavorite ? 'Đã thêm vào yêu thích' : 'Thêm vào yêu thích'}
              </button>
            )}
            <ul className="mt-4 space-y-2 text-sm text-gray-600">
              <li className="flex items-center gap-2">
                <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
                {totalChapters} Chương
              </li>
              <li className="flex items-center gap-2">
                <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                {totalLessons} Bài học
              </li>
              <li className="flex items-center gap-2">
                <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Thời lượng: Đang cập nhật
              </li>
              <li className="flex items-center gap-2">
                <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                </svg>
                Tiếng Việt
              </li>
            </ul>
          </div>
        </aside>
      </section>
    </main>
  );
}

