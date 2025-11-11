// src/pages/LearnCourse.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  FaCheckCircle,
  FaCircle,
  FaPlay,
  FaVideo,
  FaQuestionCircle,
  FaLock,
  FaChevronDown,
} from 'react-icons/fa';
import QuizPlayer from '../components/QuizPlayer';
import VideoPlayer from '../components/VideoPlayer';
import { useToast } from '../contexts/ToastContext';

const LearnCourse = () => {
  const toast = useToast();
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [markingComplete, setMarkingComplete] = useState(false);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [loadingComments, setLoadingComments] = useState(false);

  const fetchComments = async (lessonId) => {
    try {
      setLoadingComments(true);
      const response = await axios.get(
        `http://localhost:8080/api/v1/comments/lesson/${lessonId}`
      );
      const commentsData = response.data.data || [];
      // Convert to plain objects
      const plainComments = commentsData.map((comment) => {
        const plain = comment.toJSON ? comment.toJSON() : comment;
        if (plain.student) {
          plain.student = plain.student.toJSON ? plain.student.toJSON() : plain.student;
        }
        return plain;
      });
      setComments(plainComments);
    } catch (err) {
      console.error('Error fetching comments:', err);
      setComments([]);
    } finally {
      setLoadingComments(false);
    }
  };

  useEffect(() => {
    if (courseId) {
      fetchCourseData();
    }
  }, [courseId]);

  const fetchCourseData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `http://localhost:8080/api/v1/courses/${courseId}/learn`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const courseData = response.data.data;
      setCourse(courseData);

      // Tự động chọn lesson đầu tiên nếu chưa có lesson nào được chọn
      if (courseData.chapters && courseData.chapters.length > 0) {
        const firstChapter = courseData.chapters[0];
        if (firstChapter.lessons && firstChapter.lessons.length > 0) {
          const firstLesson = firstChapter.lessons[0];
          setSelectedLesson(firstLesson);
          // Load comments for first lesson
          fetchComments(firstLesson.lessonid);
        }
      }
      setError(null);
    } catch (err) {
      console.error('Error fetching course:', err);
      setError(err.response?.data?.message || 'Lỗi khi tải nội dung khóa học');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkComplete = async () => {
    if (!selectedLesson || selectedLesson.isCompleted) return;

    try {
      setMarkingComplete(true);
      const token = localStorage.getItem('token');
      await axios.post(
        'http://localhost:8080/api/v1/progress/complete',
        { lessonId: selectedLesson.lessonid },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      await fetchCourseData();
      toast.success('Đã đánh dấu bài học hoàn thành!');
    } catch (err) {
      console.error('Error marking complete:', err);
      toast.error('Lỗi: ' + (err.response?.data?.message || err.message));
    } finally {
      setMarkingComplete(false);
    }
  };

  const handleLessonClick = (lesson) => {
    setSelectedLesson(lesson);
    setSelectedQuiz(null);
    setCommentText('');
    if (lesson) {
      fetchComments(lesson.lessonid);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim() || !selectedLesson) return;

    try {
      setSubmittingComment(true);
      const token = localStorage.getItem('token');
      await axios.post(
        'http://localhost:8080/api/v1/comments',
        {
          lessonId: selectedLesson.lessonid,
          content: commentText.trim(),
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setCommentText('');
      await fetchComments(selectedLesson.lessonid);
    } catch (err) {
      console.error('Error submitting comment:', err);
      toast.error('Lỗi: ' + (err.response?.data?.message || err.message));
    } finally {
      setSubmittingComment(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
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
    return date.toLocaleDateString('vi-VN');
  };

  const handleQuizClick = (quiz) => {
    setSelectedQuiz(quiz);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang tải...</p>
        </div>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || 'Không tìm thấy khóa học'}</p>
          <button
            onClick={() => navigate('/my-courses')}
            className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
          >
            Quay lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <main className="bg-gray-50 min-h-screen">
      <section className="container mx-auto mt-6 grid gap-8 lg:grid-cols-[1fr_360px] px-4 lg:px-6">
        {/* Left: Video + details */}
        <div>
          {selectedQuiz ? (
            <QuizPlayer
              quizId={selectedQuiz.quizid}
              lessonId={selectedQuiz.lessonid}
              onBack={() => setSelectedQuiz(null)}
            />
          ) : selectedLesson ? (
            <>
              {/* Video Player */}
              <div className="overflow-hidden rounded-2xl border bg-white shadow-sm p-2">
                {selectedLesson.videourl ? (
                  <VideoPlayer
                    videoUrl={selectedLesson.videourl}
                    title={selectedLesson.title}
                    isYouTube={
                      selectedLesson.videourl.includes('youtube.com') ||
                      selectedLesson.videourl.includes('youtu.be')
                    }
                  />
                ) : (
                  <div className="aspect-video w-full bg-gray-900 flex items-center justify-center rounded-lg">
                    <div className="text-center">
                      <FaVideo className="text-6xl text-gray-600 mx-auto mb-2" />
                      <p className="text-gray-400">Chưa có video cho bài học này</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Title + meta */}
              <div className="mt-6">
                <h1 className="text-xl font-extrabold tracking-tight text-gray-900">
                  {selectedLesson.title.toUpperCase()}
                </h1>
                <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-gray-600">
                  {course.teacher && (
                    <div className="flex items-center gap-2">
                      <span className="grid size-6 place-items-center rounded-full bg-emerald-100 text-emerald-700 font-bold">
                        {course.teacher.fullname?.charAt(0) || 'T'}
                      </span>
                      <span className="font-medium text-gray-900">{course.teacher.fullname}</span>
                    </div>
                  )}
                  {selectedLesson.isCompleted && (
                    <div className="flex items-center gap-2 text-emerald-700">
                      <FaCheckCircle className="size-4" />
                      <span className="font-medium">Completed</span>
                    </div>
                  )}
                </div>
              </div>

              {/* About Course */}
              {course.description && (
                <section className="mt-6">
                  <h2 className="font-semibold text-gray-900">About Course</h2>
                  <p className="mt-2 text-sm leading-7 text-gray-600">{course.description}</p>
                </section>
              )}

              {/* Lesson Content */}
              {selectedLesson.content && (
                <section className="mt-6">
                  <h2 className="font-semibold text-gray-900">Nội dung bài học</h2>
                  <div
                    className="mt-2 text-sm leading-7 text-gray-600 prose prose-sm max-w-none"
                    dangerouslySetInnerHTML={{ __html: selectedLesson.content }}
                  />
                </section>
              )}

              {/* Quizzes for this lesson */}
              {selectedLesson.quizzes && selectedLesson.quizzes.length > 0 && (
                <section className="mt-6">
                  <h2 className="font-semibold text-gray-900">Bài kiểm tra</h2>
                  <ul className="mt-3 grid gap-2 text-sm">
                    {selectedLesson.quizzes.map((quiz) => (
                      <li
                        key={quiz.quizid}
                        className="flex items-center gap-2 cursor-pointer hover:text-emerald-700"
                        onClick={() => handleQuizClick(quiz)}
                      >
                        <FaQuestionCircle className="size-4 text-emerald-600" />
                        <a className="underline">{quiz.title}</a>
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              {/* Comments Section */}
              <section className="mt-8">
                <h2 className="font-semibold text-gray-900">Comments</h2>
                
                {/* Comment Form */}
                <form onSubmit={handleSubmitComment} className="mt-4">
                  <textarea
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="Viết bình luận của bạn..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 resize-none"
                    rows="3"
                  />
                  <div className="mt-2 flex justify-end">
                    <button
                      type="submit"
                      disabled={!commentText.trim() || submittingComment}
                      className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {submittingComment ? 'Đang gửi...' : 'Gửi bình luận'}
                    </button>
                  </div>
                </form>

                {/* Comments List */}
                {loadingComments ? (
                  <div className="mt-4 text-center text-gray-500">Đang tải bình luận...</div>
                ) : comments.length === 0 ? (
                  <div className="mt-4 text-sm text-gray-500">Chưa có bình luận nào. Hãy là người đầu tiên bình luận!</div>
                ) : (
                  <ul className="mt-4 space-y-5">
                    {comments.map((comment) => (
                      <li key={comment.commentid} className="flex gap-3">
                        {comment.student?.profilepicture ? (
                          <img
                            src={comment.student.profilepicture}
                            alt={comment.student.fullname}
                            className="h-9 w-9 rounded-full object-cover"
                          />
                        ) : (
                          <div className="h-9 w-9 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-semibold text-sm">
                            {comment.student?.fullname?.charAt(0) || 'U'}
                          </div>
                        )}
                        <div className="flex-1">
                          <p className="text-sm font-medium">
                            <span className="text-emerald-700">{comment.student?.fullname || 'Người dùng'}</span>
                            <span className="text-gray-500 ml-2 text-xs">
                              {formatDate(comment.createdat)}
                            </span>
                          </p>
                          <p className="mt-1 text-sm text-gray-600">{comment.content}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            </>
          ) : (
            <div className="bg-white rounded-2xl border shadow-sm p-12 text-center">
              <FaVideo className="text-6xl text-gray-300 mx-auto mb-4" />
              <h2 className="text-2xl font-semibold text-gray-700 mb-2">
                Chọn bài học để bắt đầu
              </h2>
              <p className="text-gray-500">Vui lòng chọn một bài học từ sidebar để xem nội dung</p>
            </div>
          )}
        </div>

        {/* Right sidebar: Curriculum */}
        <aside className="space-y-6">
          <Curriculum
            course={course}
            selectedLesson={selectedLesson}
            selectedQuiz={selectedQuiz}
            onLessonClick={handleLessonClick}
            onQuizClick={handleQuizClick}
          />
        </aside>
      </section>
    </main>
  );
};

// Curriculum Component
function Curriculum({ course, selectedLesson, selectedQuiz, onLessonClick, onQuizClick }) {
  return (
    <div className="overflow-hidden rounded-2xl border bg-white shadow-sm">
      <div className="border-b p-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-gray-900">Course Curriculum</h3>
        </div>
      </div>
      <div className="p-1">
        <div>
          {course.chapters?.map((chapter, chapterIndex) => (
            <details key={chapter.chapterid} className="group border-b last:border-b-0 rounded-md">
              <summary className="flex cursor-pointer items-center justify-between px-3 py-3 hover:bg-gray-50">
                <div className="text-left">
                  <p className="font-medium text-gray-900">
                    Chapter {chapterIndex + 1}: {chapter.title}
                  </p>
                  <p className="text-xs text-gray-500">
                    {chapter.lessons?.length || 0} lessons
                  </p>
                </div>
                <FaChevronDown className="h-4 w-4 text-gray-400 transition-transform group-open:rotate-180" />
              </summary>
              <div className="px-0 pb-3">
                <ul className="space-y-1">
                  {chapter.lessons?.map((lesson, idx) => {
                    const isActive = selectedLesson?.lessonid === lesson.lessonid;
                    const isCompleted = lesson.isCompleted;
                    const isPlaying = isActive && !selectedQuiz;

                    return (
                      <li key={lesson.lessonid}>
                        <LessonRow
                          title={lesson.title}
                          duration="10m"
                          status={isCompleted ? 'completed' : isPlaying ? 'in_progress' : 'pending'}
                          isActive={isActive}
                          onClick={() => onLessonClick(lesson)}
                        />
                        {/* Quizzes for this lesson */}
                        {lesson.quizzes?.map((quiz) => (
                          <li
                            key={quiz.quizid}
                            className={`ml-7 flex items-center gap-2 px-3 py-2 rounded-md cursor-pointer hover:bg-gray-50 ${
                              selectedQuiz?.quizid === quiz.quizid ? 'bg-purple-50' : ''
                            }`}
                            onClick={() => onQuizClick(quiz)}
                          >
                            <FaQuestionCircle className="size-4 text-purple-600" />
                            <span className="text-sm text-gray-700">{quiz.title}</span>
                          </li>
                        ))}
                      </li>
                    );
                  })}
                </ul>
              </div>
            </details>
          ))}
        </div>
      </div>
      <div className="border-t p-4 text-center text-sm text-gray-500">
        All lessons unlocked. Happy learning! 🎉
      </div>
    </div>
  );
}

// LessonRow Component
function LessonRow({ title, duration, status, isActive, onClick }) {
  return (
    <li
      className={`flex items-center justify-between rounded-md px-3 py-2 cursor-pointer ${
        isActive ? 'bg-emerald-50' : 'hover:bg-gray-50'
      }`}
      onClick={onClick}
    >
      <div className="flex items-center gap-3">
        {status === 'completed' ? (
          <FaCheckCircle className="size-4 text-emerald-600" />
        ) : status === 'in_progress' ? (
          <FaCircle className="size-4 text-pink-600" />
        ) : (
          <FaCircle className="size-4 text-gray-400" />
        )}
        <div>
          <p className={`text-sm ${isActive ? 'font-medium text-gray-900' : 'text-gray-700'}`}>
            {title}
            {status === 'in_progress' && (
              <span className="ml-1 rounded bg-pink-100 px-1.5 py-0.5 text-[10px] font-semibold text-pink-700">
                Playing
              </span>
            )}
            {status === 'completed' && (
              <span className="ml-1 rounded bg-emerald-100 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-700">
                Completed
              </span>
            )}
          </p>
          <p className="text-xs text-gray-500">{duration}</p>
        </div>
      </div>
    </li>
  );
}

export default LearnCourse;
