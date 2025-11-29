// src/services/progress.service.js
const { Op } = require('sequelize');
const {
    lessonprogress,
    lessons,
    enrollments,
    coursecompletions, // Thêm model này
    certificates, // Thêm model này
    courses,
    quizzes,
    quizsessions,
    sequelize,
  } = require('../models');
const notificationService = require('./notification.service');
const rewardService = require('./reward.service');
  
  /**
   * HÀM NỘI BỘ: Tự động kiểm tra và hoàn thành khóa học
   */
  const checkAndCompleteCourse = async (studentId, courseId, transaction) => {
    // 1. Đếm TỔNG SỐ bài học của khóa học
    const totalLessons = await lessons.count({
      where: { courseid: courseId },
      transaction,
    });
  
    if (totalLessons === 0) {
      return; // Khóa học chưa có bài học, bỏ qua
    }
  
    // 2. Đếm số bài học HỌC VIÊN ĐÃ HOÀN THÀNH trong khóa này
    const completedLessonsCount = await lessonprogress.count({
      where: {
        studentid: studentId,
        iscompleted: true,
      },
      include: {
        model: lessons,
        as: 'lesson',
        where: { courseid: courseId },
        attributes: [],
      },
      transaction,
    });
  
    // 3. Kiểm tra tất cả quizzes phải đạt >= 70%
    // Lấy tất cả lessons trong course
    const courseLessons = await lessons.findAll({
      where: { courseid: courseId },
      attributes: ['lessonid'],
      transaction,
    });

    const lessonIds = courseLessons.map(l => l.lessonid);
    
    // Lấy tất cả quizzes của các lessons này
    const courseQuizzes = await quizzes.findAll({
      where: {
        lessonid: { [Op.in]: lessonIds },
      },
      attributes: ['quizid', 'quiztype'],
      transaction,
    });

    // Kiểm tra xem học viên đã làm và đạt >= 70% tất cả quizzes chưa
    let allQuizzesPassed = true;
    if (courseQuizzes.length > 0) {
      for (const quiz of courseQuizzes) {
        let bestSession;
        
        if (quiz.quiztype === 'essay') {
          // Với essay quiz: cần teacher chấm (isgraded = true)
          bestSession = await quizsessions.findOne({
            where: {
              quizid: quiz.quizid,
              studentid: studentId,
              submittedat: { [Op.ne]: null },
              isgraded: true, // Essay cần được chấm
            },
            order: [['score', 'DESC']],
            transaction,
          });
        } else {
          // Với multiple choice quiz: tự động chấm khi submit (không cần isgraded)
          bestSession = await quizsessions.findOne({
            where: {
              quizid: quiz.quizid,
              studentid: studentId,
              submittedat: { [Op.ne]: null }, // Đã submit
            },
            order: [['score', 'DESC']],
            transaction,
          });
        }

        // Nếu không có session hoặc điểm < 70% thì chưa pass
        if (!bestSession || bestSession.score < 70) {
          allQuizzesPassed = false;
          break;
        }
      }
    }

    // 4. So sánh: phải hoàn thành TẤT CẢ lessons VÀ TẤT CẢ quizzes >= 70%
    if (completedLessonsCount === totalLessons && allQuizzesPassed) {
      // 5. Nếu đủ điều kiện -> Tạo CourseCompletion (nếu chưa có)
      const [completion, created] = await coursecompletions.findOrCreate({
        where: {
          studentid: studentId,
          courseid: courseId,
        },
        defaults: {
          studentid: studentId,
          courseid: courseId,
          completedat: new Date(),
        },
        transaction,
      });

      // 5. Tạo Certificate (nếu chưa có)
      await certificates.findOrCreate({
        where: {
          studentid: studentId,
          courseid: courseId,
        },
        defaults: {
          studentid: studentId,
          courseid: courseId,
          issuedat: new Date(),
        },
        transaction,
      });

      // 6. Tạo notification khi hoàn thành khóa học (chỉ khi mới hoàn thành)
      if (created) {
        try {
          const course = await courses.findByPk(courseId, { transaction });
          if (course) {
            await notificationService.createNotification(
              studentId,
              `Chúc mừng! Bạn đã hoàn thành khóa học "${course.coursename}". Bạn đã nhận được chứng chỉ!`
            );
          }
        } catch (error) {
          console.error('Error creating course completion notification:', error);
        }
      }
    }
    
    // 7. Commit transaction trước khi distribute reward (reward có thể fail nhưng không ảnh hưởng đến course completion)
    // Chỉ commit nếu transaction chưa được commit
    if (transaction && !transaction.finished) {
      await transaction.commit();
    }
    
    // 8. Try to distribute reward AFTER commit (chỉ khi mới hoàn thành)
    // Cần check lại vì created chỉ available trong if block
    if (completedLessonsCount === totalLessons && allQuizzesPassed) {
      const existingCompletion = await coursecompletions.findOne({
        where: {
          studentid: studentId,
          courseid: courseId,
        },
      });
      
      // Check if this completion was just created (within last minute)
      if (existingCompletion) {
        const completionAge = Date.now() - new Date(existingCompletion.completedat).getTime();
        const isNewCompletion = completionAge < 60000; // Less than 1 minute ago
        
        if (isNewCompletion) {
          console.log(`🎁 Attempting to distribute course reward for course #${courseId} to user ${studentId}...`);
          try {
            const rewardResult = await rewardService.distributeCourseReward(studentId, courseId);
            console.log(`✅ Course reward distributed: ${rewardResult.amount} LHT to user ${studentId} for course #${courseId}`);
          } catch (error) {
            console.warn('⚠️  Could not distribute course reward:', {
              userId: studentId,
              courseId: courseId,
              error: error.message,
            });
            if (error.message.includes('Wallet not connected') || error.message.includes('not found') || error.message.includes('has not connected')) {
              console.warn('   → User needs to connect wallet to receive rewards');
            } else if (error.message.includes('already claimed') || error.message.includes('already distributed')) {
              console.warn('   → Reward already claimed for this course');
            } else {
              console.error('   → Unexpected error:', error);
            }
          }
        }
      }
    }
  };
  
  /**
   * Kiểm tra xem học viên đã ghi danh vào khóa học chứa bài học này chưa
   * @param {number} studentId
   * @param {number} lessonId
   */
  const checkEnrollment = async (studentId, lessonId) => {
    const lesson = await lessons.findByPk(lessonId, {
      attributes: ['courseid'],
    });
    if (!lesson) {
      throw new Error('Không tìm thấy bài học.');
    }
  
    const enrollment = await enrollments.findOne({
      where: {
        studentid: studentId,
        courseid: lesson.courseid,
      },
    });
  
    if (!enrollment) {
      throw new Error(
        'Bạn phải ghi danh khóa học để xem hoặc hoàn thành bài học này.'
      );
    }
  
    return lesson.courseid; // Trả về courseId để dùng sau
  };
  
  /**
   * Cập nhật video watch time
   * @param {number} studentId
   * @param {number} lessonId
   * @param {number} watchTime - Watch time in seconds
   */
  const updateWatchTime = async (studentId, lessonId, watchTime) => {
    const courseId = await checkEnrollment(studentId, lessonId);
    
    const [progress, created] = await lessonprogress.findOrCreate({
      where: {
        studentid: studentId,
        lessonid: lessonId,
      },
      defaults: {
        studentid: studentId,
        lessonid: lessonId,
        watchtime: watchTime || 0,
        iscompleted: false,
      },
    });

    if (!created) {
      await progress.update({
        watchtime: Math.max(progress.watchtime || 0, watchTime || 0),
      });
    }

    return progress;
  };

  /**
   * Đánh dấu một bài học là đã hoàn thành
   * @param {number} studentId
   * @param {number} lessonId
   */
  const markLessonAsComplete = async (studentId, lessonId) => {
    // 1. Kiểm tra quyền ghi danh (quan trọng)
    const courseId = await checkEnrollment(studentId, lessonId);
  
    // ✨ SỬ DỤNG TRANSACTION ĐỂ ĐẢM BẢO AN TOÀN DỮ LIỆU ✨
    const t = await sequelize.transaction();
    try {
      // 2. Dùng findOrCreate để tạo hoặc tìm bản ghi tiến độ
      const [progress, created] = await lessonprogress.findOrCreate({
        where: {
          studentid: studentId,
          lessonid: lessonId,
        },
        defaults: {
          studentid: studentId,
          lessonid: lessonId,
          iscompleted: false,
          watchtime: 0,
        },
        transaction: t,
      });

      // 3. Kiểm tra điều kiện: phải xem video >= 30 giây
      const currentWatchTime = progress.watchtime || 0;
      if (currentWatchTime < 30) {
        await t.rollback();
        throw new Error(`Bạn cần xem video ít nhất 30 giây để hoàn thành bài học. Hiện tại: ${currentWatchTime} giây`);
      }
  
      // 4. Nếu bản ghi đã tồn tại nhưng chưa hoàn thành, cập nhật nó
      if (!created && !progress.iscompleted) {
        await progress.update(
          {
            iscompleted: true,
            completedat: new Date(),
          },
          { transaction: t }
        );
      } else if (created) {
        // Nếu mới tạo, cập nhật luôn
        await progress.update(
          {
            iscompleted: true,
            completedat: new Date(),
          },
          { transaction: t }
        );
      }
  
      // 4. ✨ GỌI HÀM KIỂM TRA HOÀN THÀNH KHÓA HỌC ✨
      // checkAndCompleteCourse có thể commit transaction nếu course được hoàn thành
      await checkAndCompleteCourse(studentId, courseId, t);

      // 5. Commit transaction trước khi tạo notification và distribute reward
      // Chỉ commit nếu transaction chưa được commit (checkAndCompleteCourse có thể đã commit rồi)
      if (t && !t.finished) {
        await t.commit();
      }
      
      // 6. Tạo notification khi hoàn thành bài học (sau khi commit, không dùng transaction)
      try {
        const lesson = await lessons.findByPk(lessonId);
        if (lesson) {
          await notificationService.createNotification(
            studentId,
            `Bạn đã hoàn thành bài học "${lesson.title}". Tiếp tục phát huy nhé!`
          );
        }
      } catch (error) {
        console.error('Error creating lesson completion notification:', error);
      }

      // 7. Try to distribute reward AFTER commit (so lesson completion is saved even if reward fails)
      // Database và smart contract sẽ tự động check duplicate, không cần check ở đây
      // 7. Try to distribute reward AFTER commit (so lesson completion is saved even if reward fails)
      // Database và smart contract sẽ tự động check duplicate, không cần check ở đây
      let rewardInfo = null;
      console.log(`🎁 Attempting to distribute reward for lesson #${lessonId} to user ${studentId}...`);
      try {
        const rewardResult = await rewardService.distributeLessonReward(studentId, lessonId);
        rewardInfo = {
          success: true,
          amount: rewardResult.amount,
          txHash: rewardResult.txHash,
          message: rewardResult.message,
        };
        console.log(`✅ Lesson reward distributed: ${rewardResult.amount} LHT to user ${studentId} for lesson #${lessonId}`);
      } catch (error) {
        // Don't fail the transaction if reward distribution fails (user might not have wallet connected or already claimed)
        console.warn('⚠️  Could not distribute lesson reward:', {
          userId: studentId,
          lessonId: lessonId,
          error: error.message,
        });
        // Log specific error types for debugging
        if (error.message.includes('Wallet not connected') || error.message.includes('not found') || error.message.includes('has not connected')) {
          rewardInfo = {
            success: false,
            message: 'Vui lòng connect wallet để nhận rewards.',
          };
          console.warn('   → User needs to connect wallet to receive rewards');
        } else if (error.message.includes('already claimed') || error.message.includes('already distributed')) {
          rewardInfo = {
            success: false,
            message: `Reward đã được phân phối cho bài học này (lesson #${lessonId}). Mỗi bài học chỉ được nhận reward 1 lần.`,
          };
          console.warn(`   → Reward already claimed for lesson #${lessonId}`);
        } else {
          rewardInfo = {
            success: false,
            message: 'Không thể phân phối reward. Vui lòng thử lại sau.',
          };
          console.error('   → Unexpected error:', error);
        }
      }

      return { progress, reward: rewardInfo };
    } catch (error) {
      // 6. Nếu có lỗi, rollback tất cả (chỉ nếu transaction chưa commit)
      if (t && !t.finished) {
        await t.rollback();
      }
      throw new Error(`Lỗi khi đánh dấu hoàn thành: ${error.message}`);
    }
  };
  
  /**
   * Lấy tất cả tiến độ bài học của học viên trong một khóa học
   * @param {number} studentId
   * @param {number} courseId
   */
  const getCourseProgress = async (studentId, courseId) => {
    // 1. Kiểm tra xem học viên có ghi danh khóa này không
    const enrollment = await enrollments.findOne({
      where: { studentid: studentId, courseid: courseId },
    });
    if (!enrollment) {
      throw new Error('Bạn chưa ghi danh khóa học này.');
    }
  
    // 2. Lấy danh sách các lessonId đã hoàn thành
    const completedLessons = await lessonprogress.findAll({
      where: {
        studentid: studentId,
        iscompleted: true,
      },
      attributes: ['lessonid'],
      include: {
        model: lessons,
        as: 'lesson',
        where: { courseid: courseId },
        attributes: [],
      },
    });
  
    return completedLessons.map((item) => item.lessonid);
  };
  
  module.exports = {
    markLessonAsComplete,
    updateWatchTime,
    getCourseProgress,
    checkAndCompleteCourse, // Export để có thể gọi từ quiz.service.js
  };