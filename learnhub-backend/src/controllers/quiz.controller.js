// src/controllers/quiz.controller.js
const quizService = require('../services/quiz.service');

// [GET] /api/v1/quizzes/:id
const handleGetQuizDetails = async (req, res, next) => {
  try {
    const { id } = req.params;
    const studentId = req.user.id;
    const data = await quizService.getQuizDetails(Number(id), studentId);
    res.status(200).json({
      message: 'Lấy chi tiết bài quiz thành công.',
      data,
    });
  } catch (error) {
    if (error.message.includes('Không tìm thấy')) {
      return res.status(404).json({ message: error.message });
    }
    next(error);
  }
};

// [POST] /api/v1/quizzes/:id/start
const handleStartSession = async (req, res, next) => {
  try {
    const { id } = req.params; // quizId
    const studentId = req.user.id;
    const session = await quizService.startQuizSession(Number(id), studentId);
    res.status(201).json({
      message: 'Bắt đầu phiên làm bài quiz thành công.',
      data: session, // Trả về sessionid
    });
  } catch (error) {
    if (error.message.includes('Không tìm thấy')) {
      return res.status(404).json({ message: error.message });
    }
    // Handle cases where user cannot retake quiz (already passed or max attempts)
    if (error.message.includes('đạt điểm >= 70%') || 
        error.message.includes('hết số lần làm bài') ||
        error.message.includes('không thể làm lại')) {
      return res.status(400).json({ 
        message: error.message,
        code: 'QUIZ_LIMIT_REACHED'
      });
    }
    next(error);
  }
};

// [POST] /api/v1/quizzes/submit/:sessionId
const handleSubmitQuiz = async (req, res, next) => {
  try {
    const { sessionId } = req.params;
    const studentId = req.user.id;
    const { answers } = req.body; // Mong đợi một mảng câu trả lời

    if (!answers || !Array.isArray(answers) || answers.length === 0) {
      return res.status(400).json({ message: 'Vui lòng cung cấp câu trả lời.' });
    }

    const result = await quizService.submitQuiz(
      Number(sessionId),
      studentId,
      answers
    );
    res.status(200).json(result);
  } catch (error) {
    if (error.message.includes('không hợp lệ')) {
      return res.status(404).json({ message: error.message });
    }
    next(error);
  }
};

// Teacher Quiz Management
// [POST] /api/v1/quizzes (body: { lessonid, title, timelimit, maxattempts, showanswersaftersubmission })
const handleCreateQuiz = async (req, res, next) => {
  try {
    const teacherId = req.user.id;
    const quizData = req.body;

    if (!quizData.lessonid || !quizData.title) {
      return res.status(400).json({ message: 'Vui lòng cung cấp lessonid và title' });
    }

    // Chỉ Teacher và Admin mới được tạo quiz
    if (req.user.role !== 'Teacher' && req.user.role !== 'Admin') {
      return res.status(403).json({ message: 'Chỉ có Giáo viên hoặc Admin mới được tạo quiz' });
    }

    const newQuiz = await quizService.createQuiz(quizData, teacherId);
    res.status(201).json({
      message: 'Tạo quiz thành công',
      data: newQuiz,
    });
  } catch (error) {
    if (error.message.includes('không có quyền') || error.message.includes('Không tìm thấy')) {
      return res.status(403).json({ message: error.message });
    }
    next(error);
  }
};

// [PUT] /api/v1/quizzes/:id
const handleUpdateQuiz = async (req, res, next) => {
  try {
    const { id } = req.params;
    const teacherId = req.user.id;
    const quizData = req.body;

    if (req.user.role !== 'Teacher' && req.user.role !== 'Admin') {
      return res.status(403).json({ message: 'Chỉ có Giáo viên hoặc Admin mới được sửa quiz' });
    }

    const updatedQuiz = await quizService.updateQuiz(Number(id), quizData, teacherId);
    res.status(200).json({
      message: 'Cập nhật quiz thành công',
      data: updatedQuiz,
    });
  } catch (error) {
    if (error.message.includes('không có quyền') || error.message.includes('Không tìm thấy')) {
      return res.status(403).json({ message: error.message });
    }
    next(error);
  }
};

// [DELETE] /api/v1/quizzes/:id
const handleDeleteQuiz = async (req, res, next) => {
  try {
    const { id } = req.params;
    const teacherId = req.user.id;

    if (req.user.role !== 'Teacher' && req.user.role !== 'Admin') {
      return res.status(403).json({ message: 'Chỉ có Giáo viên hoặc Admin mới được xóa quiz' });
    }

    await quizService.deleteQuiz(Number(id), teacherId);
    res.status(200).json({ message: 'Xóa quiz thành công' });
  } catch (error) {
    if (error.message.includes('không có quyền') || error.message.includes('Không tìm thấy')) {
      return res.status(403).json({ message: error.message });
    }
    next(error);
  }
};

// [GET] /api/v1/quizzes/lesson/:lessonId
const handleGetQuizzesByLesson = async (req, res, next) => {
  try {
    const { lessonId } = req.params;
    const teacherId = req.user.id;

    if (req.user.role !== 'Teacher' && req.user.role !== 'Admin') {
      return res.status(403).json({ message: 'Chỉ có Giáo viên hoặc Admin mới được xem quiz' });
    }

    const quizzes = await quizService.getQuizzesByLesson(Number(lessonId), teacherId);
    res.status(200).json({
      message: 'Lấy danh sách quiz thành công',
      data: quizzes,
    });
  } catch (error) {
    if (error.message.includes('không có quyền') || error.message.includes('Không tìm thấy')) {
      return res.status(403).json({ message: error.message });
    }
    next(error);
  }
};

// [POST] /api/v1/quizzes/:quizId/questions
const handleCreateQuestion = async (req, res, next) => {
  try {
    const { quizId } = req.params;
    const teacherId = req.user.id;
    const questionData = req.body;

    if (!questionData.questiontext || !questionData.options || !Array.isArray(questionData.options)) {
      return res.status(400).json({ message: 'Vui lòng cung cấp questiontext và options' });
    }

    if (req.user.role !== 'Teacher' && req.user.role !== 'Admin') {
      return res.status(403).json({ message: 'Chỉ có Giáo viên hoặc Admin mới được thêm câu hỏi' });
    }

    const result = await quizService.createQuestion(Number(quizId), questionData, teacherId);
    res.status(201).json({
      message: 'Tạo câu hỏi thành công',
      data: result,
    });
  } catch (error) {
    if (error.message.includes('không có quyền') || error.message.includes('Không tìm thấy')) {
      return res.status(403).json({ message: error.message });
    }
    next(error);
  }
};

// [PUT] /api/v1/quizzes/questions/:questionId
const handleUpdateQuestion = async (req, res, next) => {
  try {
    const { questionId } = req.params;
    const teacherId = req.user.id;
    const questionData = req.body;

    if (req.user.role !== 'Teacher' && req.user.role !== 'Admin') {
      return res.status(403).json({ message: 'Chỉ có Giáo viên hoặc Admin mới được sửa câu hỏi' });
    }

    const updatedQuestion = await quizService.updateQuestion(Number(questionId), questionData, teacherId);
    res.status(200).json({
      message: 'Cập nhật câu hỏi thành công',
      data: updatedQuestion,
    });
  } catch (error) {
    if (error.message.includes('không có quyền') || error.message.includes('Không tìm thấy')) {
      return res.status(403).json({ message: error.message });
    }
    next(error);
  }
};

// [DELETE] /api/v1/quizzes/questions/:questionId
const handleDeleteQuestion = async (req, res, next) => {
  try {
    const { questionId } = req.params;
    const teacherId = req.user.id;

    if (req.user.role !== 'Teacher' && req.user.role !== 'Admin') {
      return res.status(403).json({ message: 'Chỉ có Giáo viên hoặc Admin mới được xóa câu hỏi' });
    }

    await quizService.deleteQuestion(Number(questionId), teacherId);
    res.status(200).json({ message: 'Xóa câu hỏi thành công' });
  } catch (error) {
    if (error.message.includes('không có quyền') || error.message.includes('Không tìm thấy')) {
      return res.status(403).json({ message: error.message });
    }
    next(error);
  }
};

// [GET] /api/v1/quizzes/:id/teacher - Lấy chi tiết quiz cho teacher (có đáp án đúng)
const handleGetQuizDetailsForTeacher = async (req, res, next) => {
  try {
    const { id } = req.params;
    const teacherId = req.user.id;

    if (req.user.role !== 'Teacher' && req.user.role !== 'Admin') {
      return res.status(403).json({ message: 'Chỉ có Giáo viên hoặc Admin mới được xem chi tiết quiz' });
    }

    const data = await quizService.getQuizDetailsForTeacher(Number(id), teacherId);
    res.status(200).json({
      message: 'Lấy chi tiết quiz thành công',
      data,
    });
  } catch (error) {
    if (error.message.includes('không có quyền') || error.message.includes('Không tìm thấy')) {
      return res.status(403).json({ message: error.message });
    }
    next(error);
  }
};

// [GET] /api/v1/quizzes/:quizId/results
const handleGetQuizResults = async (req, res, next) => {
  try {
    const { quizId } = req.params;
    const teacherId = req.user.id;

    if (req.user.role !== 'Teacher' && req.user.role !== 'Admin') {
      return res.status(403).json({ message: 'Chỉ có Giáo viên hoặc Admin mới được xem kết quả' });
    }

    const results = await quizService.getQuizResults(Number(quizId), teacherId);
    res.status(200).json({
      message: 'Lấy kết quả quiz thành công',
      data: results,
    });
  } catch (error) {
    if (error.message.includes('không có quyền') || error.message.includes('Không tìm thấy')) {
      return res.status(403).json({ message: error.message });
    }
    next(error);
  }
};

// [GET] /api/v1/quizzes/sessions/pending
const handleGetPendingQuizSessions = async (req, res, next) => {
  try {
    const teacherId = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    if (req.user.role !== 'Teacher' && req.user.role !== 'Admin') {
      return res.status(403).json({ message: 'Chỉ có Giáo viên hoặc Admin mới được xem' });
    }

    const result = await quizService.getPendingQuizSessions(teacherId, page, limit);
    res.status(200).json({
      message: 'Lấy danh sách bài tự luận chờ chấm thành công',
      data: result.sessions,
      pagination: result.pagination,
    });
  } catch (error) {
    next(error);
  }
};

// [GET] /api/v1/quizzes/sessions/:sessionId/answers
const handleGetQuizSessionAnswers = async (req, res, next) => {
  try {
    const { sessionId } = req.params;
    const teacherId = req.user.id;

    if (req.user.role !== 'Teacher' && req.user.role !== 'Admin') {
      return res.status(403).json({ message: 'Chỉ có Giáo viên hoặc Admin mới được xem' });
    }

    const result = await quizService.getQuizSessionAnswers(sessionId, teacherId);
    res.status(200).json({
      message: 'Lấy câu trả lời thành công',
      data: result,
    });
  } catch (error) {
    if (error.message.includes('Không tìm thấy') || error.message.includes('không có quyền')) {
      return res.status(403).json({ message: error.message });
    }
    next(error);
  }
};

// [POST] /api/v1/quizzes/sessions/:sessionId/grade
const handleGradeQuizSession = async (req, res, next) => {
  try {
    const { sessionId } = req.params;
    const teacherId = req.user.id;
    const { score, comment } = req.body;

    if (req.user.role !== 'Teacher' && req.user.role !== 'Admin') {
      return res.status(403).json({ message: 'Chỉ có Giáo viên hoặc Admin mới được chấm bài' });
    }

    if (!score || score < 0 || score > 100) {
      return res.status(400).json({ message: 'Điểm số phải từ 0 đến 100' });
    }

    const session = await quizService.gradeQuizSession(sessionId, teacherId, score, comment);
    res.status(200).json({
      message: 'Chấm điểm thành công!',
      data: session,
    });
  } catch (error) {
    if (error.message.includes('Không tìm thấy') || error.message.includes('không có quyền')) {
      return res.status(403).json({ message: error.message });
    }
    next(error);
  }
};

module.exports = {
  handleGetQuizDetails,
  handleStartSession,
  handleSubmitQuiz,
  handleCreateQuiz,
  handleUpdateQuiz,
  handleDeleteQuiz,
  handleGetQuizzesByLesson,
  handleGetQuizDetailsForTeacher,
  handleCreateQuestion,
  handleUpdateQuestion,
  handleDeleteQuestion,
  handleGetQuizResults,
  handleGetPendingQuizSessions,
  handleGetQuizSessionAnswers,
  handleGradeQuizSession,
};