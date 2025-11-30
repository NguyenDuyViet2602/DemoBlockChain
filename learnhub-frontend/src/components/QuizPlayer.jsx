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
  const [essayAnswers, setEssayAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [timeLeft, setTimeLeft] = useState(null);
  const [timer, setTimer] = useState(null);
  const [canStartQuiz, setCanStartQuiz] = useState(true);
  const [errorMessage, setErrorMessage] = useState(null);
  const [viewMode, setViewMode] = useState(false); // View answers only mode

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
      setErrorMessage(null);
      const token = localStorage.getItem('token');

      // Lấy thông tin quiz
      const quizRes = await axios.get(`http://localhost:8080/api/v1/quizzes/${quizId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const quizData = quizRes.data.data;
      setQuiz(quizData);

      // Bắt đầu session
      try {
        const sessionRes = await axios.post(
          `http://localhost:8080/api/v1/quizzes/${quizId}/start`,
          {},
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setSessionId(sessionRes.data.data.sessionid);
        setCanStartQuiz(true);
      } catch (startError) {
        // Check if error is about 70% lock or max attempts
        const errorMsg = startError.response?.data?.message || startError.message;
        if (errorMsg.includes('70%') || errorMsg.includes('đạt điểm')) {
          setCanStartQuiz(false);
          setViewMode(true);
          setErrorMessage(errorMsg);
          // Load previous results to show answers
          await loadPreviousResults();
        } else if (errorMsg.includes('hết số lần') || errorMsg.includes('maxAttempts')) {
          setCanStartQuiz(false);
          setErrorMessage(errorMsg);
        } else {
          throw startError;
        }
        return;
      }

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
    if (submitted || viewMode) return;
    setAnswers((prev) => ({
      ...prev,
      [questionId]: optionId,
    }));
  };

  const handleEssayAnswerChange = (questionId, text) => {
    if (submitted || viewMode) return;
    setEssayAnswers((prev) => ({
      ...prev,
      [questionId]: text,
    }));
  };

  const loadPreviousResults = async () => {
    try {
      const token = localStorage.getItem('token');
      // Get quiz results to show previous answers
      // This would need a new API endpoint or modify existing one
      // For now, we'll just show the quiz questions
    } catch (err) {
      console.error('Error loading previous results:', err);
    }
  };

  const handleSubmit = async () => {
    if (!sessionId || submitted) return;

    // Determine quiz type
    const quizType = quiz?.quizInfo?.quiztype || 'multiple_choice';
    
    // Chuyển đổi answers từ object sang array
    let answersArray = [];
    
    if (quizType === 'multiple_choice') {
      answersArray = Object.entries(answers).map(([questionId, selectedOptionId]) => ({
        questionId: parseInt(questionId),
        selectedOptionId: parseInt(selectedOptionId),
      }));
    } else if (quizType === 'essay') {
      answersArray = Object.entries(essayAnswers).map(([questionId, essayAnswer]) => ({
        questionId: parseInt(questionId),
        essayAnswer: essayAnswer,
        answerText: essayAnswer, // Alternative field name
      }));
    }

    if (answersArray.length === 0) {
      toast.warning('Vui lòng trả lời ít nhất một câu hỏi');
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

  const quizType = quiz?.quizInfo?.quiztype || 'multiple_choice';
  const isEssay = quizType === 'essay';

  // If can't start quiz (70% lock or max attempts), show view mode
  if (!canStartQuiz && !sessionId) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm p-6 lg:p-8">
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
                <p className="text-sm text-gray-600 mt-1">
                  {isEssay ? 'Bài tự luận' : 'Bài trắc nghiệm'}
                </p>
              </div>
            </div>
          </div>

          {errorMessage && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <p className="text-yellow-800">{errorMessage}</p>
              <p className="text-sm text-yellow-700 mt-2">
                Bạn chỉ có thể xem đáp án, không thể làm lại.
              </p>
            </div>
          )}

          {/* Show questions and previous answers */}
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-gray-900">Xem đáp án</h3>
            {quiz.questions?.map((question, index) => (
              <div key={question.questionid} className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                <h4 className="font-semibold text-gray-900 mb-4">
                  Câu {index + 1}: {question.questiontext}
                </h4>
                {isEssay ? (
                  <div className="bg-white border border-gray-300 rounded-lg p-4">
                    <p className="text-sm text-gray-600 mb-2">Câu trả lời của bạn:</p>
                    <p className="text-gray-700">
                      {essayAnswers[question.questionid] || 'Chưa có câu trả lời'}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {question.quizoptions?.map((option) => (
                      <div
                        key={option.optionid}
                        className="p-3 rounded-lg border bg-white border-gray-200 text-gray-700"
                      >
                        {option.optiontext}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="flex justify-end pt-6 border-t border-gray-200 mt-6">
            <button
              onClick={onBack}
              className="px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
            >
              Quay lại bài học
            </button>
          </div>
        </div>
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
                <div className="flex items-center gap-3 mt-1">
                  {quiz.quizInfo?.timelimit && (
                    <p className="text-sm text-gray-600">
                      Thời gian: {quiz.quizInfo.timelimit} phút
                    </p>
                  )}
                  {quiz.quizInfo?.maxattempts && (
                    <p className="text-sm text-gray-600">
                      • Số lần làm: {quiz.quizInfo.maxattempts}
                    </p>
                  )}
                  <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded">
                    {isEssay ? 'Tự luận' : 'Trắc nghiệm'}
                  </span>
                </div>
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
                {isEssay ? (
                  <div>
                    <textarea
                      value={essayAnswers[question.questionid] || ''}
                      onChange={(e) => handleEssayAnswerChange(question.questionid, e.target.value)}
                      placeholder="Nhập câu trả lời của bạn..."
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 resize-none"
                      rows="6"
                    />
                    <p className="text-xs text-gray-500 mt-2">
                      Câu trả lời sẽ được giảng viên chấm điểm sau khi bạn nộp bài.
                    </p>
                  </div>
                ) : (
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
                )}
              </div>
            ))}

            {/* Submit Button */}
            <div className="flex justify-end pt-6 border-t border-gray-200">
              <button
                onClick={handleSubmit}
                disabled={submitting || (isEssay ? Object.keys(essayAnswers).length === 0 : Object.keys(answers).length === 0)}
                className="px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
              >
                {submitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Đang nộp bài...
                  </>
                ) : isEssay ? (
                  'Nộp bài (Chờ giảng viên chấm)'
                ) : (
                  'Nộp bài'
                )}
              </button>
            </div>
          </div>
        ) : (
          /* Results */
          <div className="space-y-6">
            {isEssay ? (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
                <h2 className="text-2xl font-bold text-blue-700 mb-2">
                  Đã nộp bài tự luận
                </h2>
                <p className="text-gray-700">
                  Bài làm của bạn đã được gửi. Giảng viên sẽ chấm điểm và thông báo kết quả cho bạn.
                </p>
                {result?.reward && (
                  <div className="mt-4 p-3 bg-green-100 rounded-lg">
                    <p className="text-green-800 font-medium">{result.reward.message}</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-6 text-center">
                <h2 className="text-2xl font-bold text-emerald-700 mb-2">
                  Điểm số: {result?.score?.toFixed(1)}%
                </h2>
                <p className="text-gray-700">
                  Bạn đã trả lời đúng {result?.totalCorrect} / {result?.totalQuestions} câu hỏi
                </p>
                {result?.reward && (
                  <div className="mt-4 p-3 bg-green-100 rounded-lg">
                    <p className="text-green-800 font-medium">{result.reward.message}</p>
                  </div>
                )}
              </div>
            )}

            {/* Review Answers */}
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-gray-900">Kết quả chi tiết</h3>
              {quiz.questions?.map((question, index) => {
                if (isEssay) {
                  const essayAnswer = essayAnswers[question.questionid];
                  return (
                    <div
                      key={question.questionid}
                      className="bg-gray-50 border border-gray-200 rounded-lg p-6"
                    >
                      <h4 className="font-semibold text-gray-900 mb-4">
                        Câu {index + 1}: {question.questiontext}
                      </h4>
                      <div className="bg-white border border-gray-300 rounded-lg p-4">
                        <p className="text-sm text-gray-600 mb-2">Câu trả lời của bạn:</p>
                        <p className="text-gray-700 whitespace-pre-wrap">{essayAnswer || 'Chưa có câu trả lời'}</p>
                      </div>
                      <p className="text-xs text-gray-500 mt-2">
                        Đang chờ giảng viên chấm điểm...
                      </p>
                    </div>
                  );
                }

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

