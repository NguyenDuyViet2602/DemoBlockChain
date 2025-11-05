// src/pages/CourseDetail.jsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import RatingStars from '../components/site/RatingStars';

export default function CourseDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
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

    if (id) {
      fetchCourseDetails();
    }
  }, [id]);

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
            className="rounded-full bg-emerald-600 px-6 py-2 text-white hover:bg-emerald-700"
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

  return (
    <main>
      <section className="container mx-auto px-6 mt-6 grid gap-8 lg:grid-cols-[1fr_360px]">
        {/* Left: Video + details */}
        <div>
          <div className="overflow-hidden rounded-2xl border bg-white shadow-sm">
            <div className="relative">
              {course.thumbnailUrl ? (
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
              {/* Video controls overlay */}
              <div className="absolute inset-x-0 bottom-0 bg-black/60 px-4 pb-3 pt-2 text-white">
                <div className="flex items-center gap-3">
                  <button className="grid size-8 place-items-center rounded-full bg-white/90 text-gray-900 hover:bg-white transition-colors">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </button>
                  <div className="h-2 w-full rounded-full bg-white/30">
                    <div className="h-full w-1/5 rounded-full bg-white" />
                  </div>
                  <span className="text-xs">0:00 / 0:00</span>
                  <div className="ml-auto flex items-center gap-3 opacity-80">
                    <span className="text-xs">HD</span>
                    <span className="text-xs">1x</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Title + meta */}
          <div className="mt-6">
            <h1 className="text-xl font-extrabold tracking-tight">{course.coursename}</h1>
            <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-gray-600">
              {course.teacher && (
                <div className="flex items-center gap-2">
                  <span className="grid size-6 place-items-center rounded-full bg-emerald-100 text-emerald-700">
                    {course.teacher.profilepicture ? (
                      <img src={course.teacher.profilepicture} alt={course.teacher.fullname} className="w-full h-full rounded-full object-cover" />
                    ) : (
                      <span>👤</span>
                    )}
                  </span>
                  <span className="font-medium text-gray-900">{course.teacher.fullname || 'Giảng viên'}</span>
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
                  <RatingStars value={parseFloat(averageRating)} size="sm" />
                  <span className="text-gray-600">({reviews.length})</span>
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
              <div className="space-y-3">
                {course.chapters.map((chapter) => (
                  <div key={chapter.chapterid} className="border rounded-lg p-4">
                    <h3 className="font-medium text-gray-900 mb-2">{chapter.title}</h3>
                    {chapter.lessons && chapter.lessons.length > 0 && (
                      <ul className="space-y-2 ml-4">
                        {chapter.lessons.map((lesson) => (
                          <li key={lesson.lessonid} className="flex items-center gap-2 text-sm text-gray-600">
                            <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span>{lesson.title}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Reviews */}
          <section className="mt-8">
            <h2 className="font-semibold text-lg mb-4">Đánh giá ({reviews.length})</h2>
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
                    <button className="rounded-full border px-5 py-2 text-sm font-medium hover:bg-gray-50 transition-colors">
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
            <button className="mt-4 w-full rounded-full bg-emerald-600 px-4 py-3 text-white font-semibold hover:bg-emerald-700 transition-colors">
              Mua khóa học
            </button>
            <button className="mt-3 w-full rounded-full border px-4 py-3 text-sm font-medium hover:bg-gray-50 transition-colors">
              Thêm vào yêu thích
            </button>
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

