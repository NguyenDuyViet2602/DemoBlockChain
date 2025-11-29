// src/controllers/progress.controller.js
const progressService = require('../services/progress.service');

// [POST] /api/v1/progress/complete
const handleMarkAsComplete = async (req, res, next) => {
  try {
    const studentId = req.user.id;
    const { lessonId } = req.body;

    if (!lessonId) {
      return res.status(400).json({ message: 'Vui lòng cung cấp lessonId.' });
    }

    const result = await progressService.markLessonAsComplete(
      studentId,
      Number(lessonId)
    );
    res
      .status(200)
      .json({ 
        message: 'Đánh dấu bài học hoàn thành!', 
        data: result.progress || result, // Support both old and new format
        reward: result.reward, // Include reward info in response
      });
  } catch (error) {
    if (error.message.includes('Không tìm thấy') || error.message.includes('ghi danh')) {
      return res.status(403).json({ message: error.message });
    }
    next(error);
  }
};

// [GET] /api/v1/progress/course/:courseId
const handleGetCourseProgress = async (req, res, next) => {
  try {
    const studentId = req.user.id;
    const { courseId } = req.params;

    const progressIds = await progressService.getCourseProgress(
      studentId,
      Number(courseId)
    );
    res.status(200).json({
      message: 'Lấy tiến độ khóa học thành công.',
      data: progressIds, // Trả về mảng các lessonId đã hoàn thành
    });
  } catch (error) {
     if (error.message.includes('chưa ghi danh')) {
      return res.status(403).json({ message: error.message });
    }
    next(error);
  }
};

// [POST] /api/v1/progress/watch-time
const handleUpdateWatchTime = async (req, res, next) => {
  try {
    const studentId = req.user.id;
    const { lessonId, watchTime } = req.body;

    if (!lessonId || watchTime === undefined) {
      return res.status(400).json({ 
        message: 'Vui lòng cung cấp lessonId và watchTime (seconds).' 
      });
    }

    const progress = await progressService.updateWatchTime(
      studentId,
      Number(lessonId),
      Number(watchTime)
    );
    
    res.status(200).json({ 
      message: 'Cập nhật thời gian xem video thành công!', 
      data: progress 
    });
  } catch (error) {
    if (error.message.includes('Không tìm thấy') || error.message.includes('ghi danh')) {
      return res.status(403).json({ message: error.message });
    }
    next(error);
  }
};

// [POST] /api/v1/progress/check-course-completion/:courseId
const handleCheckCourseCompletion = async (req, res, next) => {
  try {
    const studentId = req.user.id;
    const { courseId } = req.params;

    if (!courseId) {
      return res.status(400).json({ message: 'Vui lòng cung cấp courseId.' });
    }

    // Manually trigger course completion check
    // Note: checkAndCompleteCourse manages its own transaction internally
    // We need to pass a transaction, but it will commit it internally
    const { sequelize } = require('../models');
    const t = await sequelize.transaction();
    try {
      await progressService.checkAndCompleteCourse(studentId, Number(courseId), t);
      // checkAndCompleteCourse commits the transaction internally, so we don't need to commit again
      // But we need to check if it's already committed
      if (!t.finished) {
        await t.commit();
      }
    } catch (error) {
      // Only rollback if transaction is still active (not already committed)
      if (t && !t.finished) {
        await t.rollback();
      }
      throw error;
    }
    
    // Check if course is now completed (after transaction is committed)
    const { coursecompletions } = require('../models');
    const completion = await coursecompletions.findOne({
      where: {
        studentid: studentId,
        courseid: Number(courseId),
      },
    });

    res.status(200).json({
      message: completion 
        ? 'Khóa học đã được đánh dấu hoàn thành!' 
        : 'Đang kiểm tra điều kiện hoàn thành khóa học...',
      isCompleted: !!completion,
      completedAt: completion?.completedat || null,
    });
  } catch (error) {
    if (error.message.includes('Không tìm thấy') || error.message.includes('ghi danh')) {
      return res.status(403).json({ message: error.message });
    }
    next(error);
  }
};

module.exports = {
  handleMarkAsComplete,
  handleGetCourseProgress,
  handleUpdateWatchTime,
  handleCheckCourseCompletion,
};