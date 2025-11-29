// src/api/v1/quiz.route.js
const express = require('express');
const router = express.Router();
const quizController = require('../../controllers/quiz.controller');
const authMiddleware = require('../../middlewares/auth.middleware');

// Tất cả API quiz đều yêu cầu đăng nhập
router.use(authMiddleware);

// === Teacher Quiz Management Routes ===
// POST /api/v1/quizzes - Tạo quiz mới
router.post('/', quizController.handleCreateQuiz);

// GET /api/v1/quizzes/lesson/:lessonId - Lấy danh sách quiz của lesson (phải đặt trước /:id)
router.get('/lesson/:lessonId', quizController.handleGetQuizzesByLesson);

// POST /api/v1/quizzes/submit/:sessionId - Nộp bài và chấm điểm (phải đặt trước /:id và /sessions)
router.post('/submit/:sessionId', quizController.handleSubmitQuiz);

// GET /api/v1/quizzes/sessions/pending - Lấy danh sách quiz sessions cần chấm (essay) (phải đặt trước /sessions/:sessionId)
router.get('/sessions/pending', quizController.handleGetPendingQuizSessions);

// GET /api/v1/quizzes/sessions/:sessionId/answers - Lấy answers của quiz session
router.get('/sessions/:sessionId/answers', quizController.handleGetQuizSessionAnswers);

// POST /api/v1/quizzes/sessions/:sessionId/grade - Chấm điểm essay quiz
router.post('/sessions/:sessionId/grade', quizController.handleGradeQuizSession);

// POST /api/v1/quizzes/:quizId/questions - Tạo câu hỏi cho quiz (phải đặt trước /:id)
router.post('/:quizId/questions', quizController.handleCreateQuestion);

// GET /api/v1/quizzes/:id/teacher - Lấy chi tiết quiz cho teacher (phải đặt trước /:id)
router.get('/:id/teacher', quizController.handleGetQuizDetailsForTeacher);

// GET /api/v1/quizzes/:quizId/results - Lấy kết quả quiz của học viên (phải đặt trước /:id)
router.get('/:quizId/results', quizController.handleGetQuizResults);

// PUT /api/v1/quizzes/questions/:questionId - Cập nhật câu hỏi
router.put('/questions/:questionId', quizController.handleUpdateQuestion);

// DELETE /api/v1/quizzes/questions/:questionId - Xóa câu hỏi
router.delete('/questions/:questionId', quizController.handleDeleteQuestion);

// === Student Quiz Routes ===
// GET /api/v1/quizzes/:id - Lấy chi tiết bài quiz (câu hỏi, lựa chọn)
router.get('/:id', quizController.handleGetQuizDetails);

// POST /api/v1/quizzes/:id/start - Bắt đầu một phiên làm bài mới
router.post('/:id/start', quizController.handleStartSession);

// PUT /api/v1/quizzes/:id - Cập nhật quiz
router.put('/:id', quizController.handleUpdateQuiz);

// DELETE /api/v1/quizzes/:id - Xóa quiz
router.delete('/:id', quizController.handleDeleteQuiz);

module.exports = router;