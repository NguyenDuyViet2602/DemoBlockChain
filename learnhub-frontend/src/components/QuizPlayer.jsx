// src/components/QuizPlayer.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaArrowLeft, FaCheckCircle, FaTimesCircle, FaClock } from 'react-icons/fa';
import { useToast } from '../contexts/ToastContext';

const QuizPlayer = ({ quizId, lessonId, onBack }) => {
  const toast = useToast();
  const [quiz, setQuiz] = useState(null);
  const [sessionId, setSessionId] = useState(null);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [timeLeft, setTimeLeft] = useState(null);
  const [timer, setTimer] = useState(null);

  useEffect(() => {
    startQuiz();
    return () => {
      if (timer) {
        clearInterval(timer);
      }
    };
  }, [quizId]);

  const startQuiz = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      // Lấy thông tin quiz
      const quizRes = await axios.get(`http://localhost:8080/api/v1/quizzes/${quizId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setQuiz(quizRes.data.data);

      // Bắt đầu session
      const sessionRes = await axios.post(
        `http://localhost:8080/api/v1/quizzes/${quizId}/start`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setSessionId(sessionRes.data.data.sessionid);

      // Bắt đầu đếm ngược nếu có time limit
      if (quizRes.data.data.quizInfo?.timelimit) {
        const minutes = quizRes.data.data.quizInfo.timelimit;
        setTimeLeft(minutes * 60);
        const interval = setInterval(() => {
          setTimeLeft((prev) => {
            if (prev <= 1) {
              clearInterval(interval);
              handleSubmit(); // Tự động nộp bài khi hết giờ
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
        setTimer(interval);
      }
    } catch (err) {
      console.error('Error starting quiz:', err);
      toast.error('Lỗi: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerChange = (questionId, optionId) => {
    if (submitted) return;
    setAnswers((prev) => ({
      ...prev,
      [questionId]: optionId,
    }));
  };

  const handleSubmit = async () => {
    if (!sessionId || submitted) return;

    // Chuyển đổi answers từ object sang array
    const answersArray = Object.entries(answers).map(([questionId, selectedOptionId]) => ({
      questionId: parseInt(questionId),
      selectedOptionId: parseInt(selectedOptionId),
    }));

    if (answersArray.length === 0) {
      toast.warning('Vui lòng chọn ít nhất một câu trả lời');
      return;
    }

    try {
      setSubmitting(true);
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `http://localhost:8080/api/v1/quizzes/submit/${sessionId}`,
        { answers: answersArray },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setResult(response.data);
      setSubmitted(true);
      if (timer) {
        clearInterval(timer);
      }
    } catch (err) {
      console.error('Error submitting quiz:', err);
      toast.error('Lỗi: ' + (err.response?.data?.message || err.message));
    } finally {
      setSubmitting(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-12 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Đang tải quiz...</p>
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-12 text-center">
        <p className="text-red-600 mb-4">Không tìm thấy quiz</p>
        <button
          onClick={onBack}
          className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
        >
          Quay lại
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-sm p-6 lg:p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 pb-6 border-b border-gray-200">
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              <FaArrowLeft className="text-xl" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{quiz.quizInfo?.title}</h1>
              {quiz.quizInfo?.timelimit && (
                <p className="text-sm text-gray-600 mt-1">
                  Thời gian: {quiz.quizInfo.timelimit} phút
                </p>
              )}
            </div>
          </div>
          {timeLeft !== null && (
            <div className="flex items-center gap-2 px-4 py-2 bg-red-50 border border-red-200 rounded-lg">
              <FaClock className="text-red-600" />
              <span className="font-semibold text-red-600">{formatTime(timeLeft)}</span>
            </div>
          )}
        </div>

        {/* Questions */}
        {!submitted ? (
          <div className="space-y-6">
            {quiz.questions?.map((question, index) => (
              <div key={question.questionid} className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Câu {index + 1}: {question.questiontext}
                </h3>
                <div className="space-y-3">
                  {question.quizoptions?.map((option) => (
                    <label
                      key={option.optionid}
                      className={`flex items-center gap-3 p-4 border rounded-lg cursor-pointer transition-all ${
                        answers[question.questionid] === option.optionid
                          ? 'bg-emerald-50 border-emerald-500'
                          : 'bg-white border-gray-300 hover:bg-gray-50 hover:border-gray-400'
                      }`}
                    >
                      <input
                        type="radio"
                        name={`question-${question.questionid}`}
                        value={option.optionid}
                        checked={answers[question.questionid] === option.optionid}
                        onChange={() => handleAnswerChange(question.questionid, option.optionid)}
                        className="w-5 h-5 text-emerald-600"
                      />
                      <span className="flex-1 text-gray-700">{option.optiontext}</span>
                    </label>
                  ))}
                </div>
              </div>
            ))}

            {/* Submit Button */}
            <div className="flex justify-end pt-6 border-t border-gray-200">
              <button
                onClick={handleSubmit}
                disabled={submitting || Object.keys(answers).length === 0}
                className="px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
              >
                {submitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Đang nộp bài...
                  </>
                ) : (
                  'Nộp bài'
                )}
              </button>
            </div>
          </div>
        ) : (
          /* Results */
          <div className="space-y-6">
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-6 text-center">
              <h2 className="text-2xl font-bold text-emerald-700 mb-2">
                Điểm số: {result?.score?.toFixed(1)}%
              </h2>
              <p className="text-gray-700">
                Bạn đã trả lời đúng {result?.totalCorrect} / {result?.totalQuestions} câu hỏi
              </p>
            </div>

            {/* Review Answers - Note: We don't have correct answers in the response, so we show based on result */}
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-gray-900">Kết quả chi tiết</h3>
              {quiz.questions?.map((question, index) => {
                const selectedOptionId = answers[question.questionid];
                const selectedOption = question.quizoptions?.find(
                  (opt) => opt.optionid === selectedOptionId
                );

                return (
                  <div
                    key={question.questionid}
                    className="bg-gray-50 border border-gray-200 rounded-lg p-6"
                  >
                    <div className="flex items-start gap-3 mb-4">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 mb-2">
                          Câu {index + 1}: {question.questiontext}
                        </h4>
                        {question.explanation && (
                          <p className="text-sm text-gray-600 mb-3">{question.explanation}</p>
                        )}
                      </div>
                    </div>
                    <div className="space-y-2">
                      {question.quizoptions?.map((option) => {
                        const isSelected = option.optionid === selectedOptionId;

                        return (
                          <div
                            key={option.optionid}
                            className={`p-3 rounded-lg border ${
                              isSelected
                                ? 'bg-blue-50 border-blue-300 text-blue-700 font-medium'
                                : 'bg-white border-gray-200 text-gray-700'
                            }`}
                          >
                            {isSelected && '✓ Đã chọn: '}
                            {option.optiontext}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex justify-end pt-6 border-t border-gray-200">
              <button
                onClick={onBack}
                className="px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
              >
                Quay lại bài học
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuizPlayer;

