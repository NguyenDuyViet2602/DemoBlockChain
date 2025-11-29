// src/services/quiz.service.js
const { Op } = require('sequelize');
const {
    sequelize,
    quizzes,
    quizquestions,
    quizoptions,
    quizsessions,
    quizanswers,
    enrollments,
  } = require('../models');
  
  /**
   * Lấy chi tiết một bài quiz (chỉ câu hỏi và lựa chọn)
   * @param {number} quizId - ID của bài quiz.
   * @param {number} studentId - ID của học viên.
   */
  const getQuizDetails = async (quizId, studentId) => {
    // 1. Lấy thông tin cơ bản của quiz
    const quizInfo = await quizzes.findByPk(quizId, {
      attributes: [
        'quizid',
        'lessonid',
        'title',
        'timelimit',
        'maxattempts',
        'quiztype',
      ],
    });
  
    if (!quizInfo) {
      throw new Error('Không tìm thấy bài quiz.');
    }
  
    // 2. Kiểm tra xem học viên đã ghi danh vào khóa học chứa bài quiz này chưa
    // (Giả định rằng lesson đã được liên kết với course)
    // Bạn cần đảm bảo model `lessons` có association 'course'
    // Vì model `quizzes` liên kết với `lessons`, chúng ta cần tìm `courseid` từ `lessonid`
    // (Phần này sẽ cần model `lessons` - tạm thời bỏ qua để đơn giản hóa)
    /*
    const lesson = await lessons.findByPk(quizInfo.lessonid);
    const enrollment = await enrollments.findOne({ 
      where: { studentid: studentId, courseid: lesson.courseid }
    });
    if (!enrollment) {
      throw new Error('Bạn phải ghi danh vào khóa học để làm bài quiz này.');
    }
    */
  
    // 3. Lấy danh sách câu hỏi và các lựa chọn
    // Nếu là quiz tự luận, không cần lấy options
    const isEssay = quizInfo.quiztype === 'essay';
    const questions = await quizquestions.findAll({
      where: { quizid: quizId },
      attributes: ['questionid', 'questiontext', 'explanation'], // Không lấy correctoptionid
      include: isEssay ? [] : [
        {
          model: quizoptions,
          as: 'quizoptions',
          attributes: ['optionid', 'optiontext'], // Không lấy iscorrect
        },
      ],
    });
  
    return { 
      quizInfo: {
        ...quizInfo.toJSON(),
        quiztype: quizInfo.quiztype || 'multiple_choice',
      }, 
      questions 
    };
  };
  
  /**
   * Bắt đầu một phiên làm bài quiz
   * @param {number} quizId - ID của bài quiz.
   * @param {number} studentId - ID của học viên.
   */
  const startQuizSession = async (quizId, studentId) => {
    const quizInfo = await quizzes.findByPk(quizId);
    if (!quizInfo) {
      throw new Error('Không tìm thấy bài quiz.');
    }
    
    // 1. Kiểm tra số lần đã làm (attempts)
    const completedSessions = await quizsessions.count({
      where: {
        quizid: quizId,
        studentid: studentId,
        submittedat: { [Op.ne]: null }, // Đã nộp
      },
    });

    const maxAttempts = quizInfo.maxattempts || 1;
    if (completedSessions >= maxAttempts) {
      throw new Error(`Bạn đã hết số lần làm bài (${maxAttempts} lần).`);
    }

    // 2. Kiểm tra xem đã đạt 70% chưa - nếu rồi thì không cho làm lại
    const bestSession = await quizsessions.findOne({
      where: {
        quizid: quizId,
        studentid: studentId,
        submittedat: { [Op.ne]: null },
      },
      order: [['score', 'DESC']],
    });

    if (bestSession && bestSession.score >= 70) {
      throw new Error('Bạn đã đạt điểm >= 70%. Bạn chỉ có thể xem đáp án, không thể làm lại.');
    }
    
    // 3. Tạo một phiên làm bài mới
    const newSession = await quizsessions.create({
      quizid: quizId,
      studentid: studentId,
      starttime: new Date(),
    });
  
    return newSession;
  };
  
  /**
   * Nộp bài và chấm điểm
   * @param {number} sessionId - ID của phiên làm bài.
   * @param {number} studentId - ID của học viên (để bảo mật).
   * @param {Array<object>} answers - Mảng các câu trả lời, ví dụ: [{ questionId: 1, selectedOptionId: 3 }, ...]
   */
  const submitQuiz = async (sessionId, studentId, answers) => {
    const t = await sequelize.transaction();
    try {
      // 1. Lấy thông tin phiên làm bài
      const session = await quizsessions.findOne({
        where: {
          sessionid: sessionId,
          studentid: studentId,
          submittedat: null, // Đảm bảo chưa nộp
        },
        include: [{
          model: quizzes,
          as: 'quiz',
          attributes: ['quiztype', 'quizid'],
        }],
        transaction: t,
      });
  
      if (!session) {
        throw new Error('Phiên làm bài không hợp lệ hoặc đã được nộp.');
      }

      const quizType = session.quiz?.quiztype || 'multiple_choice';
      let finalScore = null;
      let answerRecords = [];
      let allQuestions = []; // Declare here for use in response
      let score = 0; // Declare score outside if block

      // 2. Xử lý theo loại quiz
      if (quizType === 'multiple_choice') {
        // Quiz trắc nghiệm - tự động chấm điểm
        allQuestions = await quizquestions.findAll({
          where: { quizid: session.quizid },
          attributes: ['questionid', 'correctoptionid'],
          raw: true,
          transaction: t,
        });

        const answerKey = allQuestions.reduce((acc, q) => {
          acc[q.questionid] = q.correctoptionid ? Number(q.correctoptionid) : null;
          return acc;
        }, {});

        // Tạo map từ answers array để dễ lookup
        const answersMap = answers.reduce((acc, ans) => {
          acc[ans.questionId] = ans.selectedOptionId ? Number(ans.selectedOptionId) : null;
          return acc;
        }, {});

        score = 0; // Reset score for multiple choice
        // Chỉ lưu answers cho các câu hỏi đã được trả lời
        for (const question of allQuestions) {
          const selectedOptionId = answersMap[question.questionid];
          const correctOptionId = answerKey[question.questionid];
          
          if (selectedOptionId !== undefined && selectedOptionId !== null) {
            // Đảm bảo so sánh cùng kiểu dữ liệu (number)
            const isCorrect = Number(correctOptionId) === Number(selectedOptionId);
            
            // Log để debug (có thể xóa sau)
            if (process.env.NODE_ENV === 'development') {
              console.log(`Question ${question.questionid}: Selected=${selectedOptionId}, Correct=${correctOptionId}, IsCorrect=${isCorrect}`);
            }
            
            if (isCorrect) {
              score++;
            }

            answerRecords.push({
              sessionid: sessionId,
              questionid: question.questionid,
              selectedoptionid: selectedOptionId,
              iscorrect: isCorrect,
            });
          }
        }

        finalScore = (score / allQuestions.length) * 100;
      } else if (quizType === 'essay') {
        // Quiz tự luận - không tự động chấm, cần teacher grade
        // Lấy tất cả questions để đếm totalQuestions
        allQuestions = await quizquestions.findAll({
          where: { quizid: session.quizid },
          attributes: ['questionid'],
          raw: true,
          transaction: t,
        });
        
        for (const answer of answers) {
          if (answer.essayAnswer || answer.answerText) {
            // Không include selectedoptionid cho essay quiz (để tránh NOT NULL constraint)
            const answerRecord = {
              sessionid: sessionId,
              questionid: answer.questionId,
              essayanswer: answer.essayAnswer || answer.answerText, // Lưu câu trả lời tự luận
              iscorrect: null, // Chưa chấm
            };
            // Chỉ thêm selectedoptionid nếu có giá trị (null sẽ không được include)
            answerRecords.push(answerRecord);
          }
        }
        // Score sẽ là null cho đến khi teacher chấm
      }

      // 3. Lưu tất cả câu trả lời vào CSDL
      if (answerRecords.length > 0) {
        await quizanswers.bulkCreate(answerRecords, { transaction: t });
      }

      // 4. Cập nhật điểm và trạng thái cho phiên làm bài
      await session.update(
        {
          submittedat: new Date(),
          score: finalScore, // null nếu là essay
          endtime: new Date(),
          isgraded: quizType === 'multiple_choice', // Multiple choice tự động chấm = đã chấm
        },
        { transaction: t }
      );
  
      // Prepare response with reward info
      const response = {
        message: 'Nộp bài thành công!',
        sessionId,
        score: finalScore,
        totalCorrect: quizType === 'multiple_choice' ? score : null,
        totalQuestions: quizType === 'multiple_choice' ? allQuestions.length : answers.length,
        reward: null,
      };

      // Commit transaction trước khi distribute reward (reward có thể fail nhưng không ảnh hưởng đến việc nộp bài)
      await t.commit();

      // Check course completion after submitting quiz (nếu đạt >= 70%)
      if (quizType === 'multiple_choice' && finalScore !== null && finalScore >= 70) {
        try {
          const progressService = require('./progress.service');
          const courseId = session.quiz.lesson?.courseid;
          if (courseId) {
            const { sequelize: seq } = require('../models');
            const t2 = await seq.transaction();
            try {
              await progressService.checkAndCompleteCourse(session.studentid, courseId, t2);
              await t2.commit();
            } catch (error) {
              await t2.rollback();
              console.warn('Could not check course completion after quiz submission:', error.message);
            }
          }
        } catch (error) {
          console.warn('Error checking course completion after quiz:', error.message);
        }
      }

      // Add reward info if applicable (sau khi commit để tránh rollback nếu reward fail)
      if (quizType === 'multiple_choice' && finalScore !== null && finalScore >= 70) {
        try {
          const rewardService = require('./reward.service');
          const rewardResult = await rewardService.distributeQuizReward(studentId, session.quizid, finalScore);
          if (rewardResult.success) {
            response.reward = {
              success: true,
              amount: rewardResult.amount,
              txHash: rewardResult.txHash,
              message: rewardResult.message,
            };
            console.log(`✅ Quiz reward distributed: ${rewardResult.amount} LHT to user ${studentId}`);
          } else {
            response.reward = {
              success: false,
              message: rewardResult.message || 'Không thể phân phối reward',
            };
          }
        } catch (error) {
          // Log detailed error for debugging
          console.error('❌ Could not distribute quiz reward:', {
            userId: studentId,
            quizId: session.quizid,
            score: finalScore,
            error: error.message,
            stack: error.stack,
          });
          
          // Provide user-friendly error message
          response.reward = {
            success: false,
            message: error.message.includes('Wallet not connected') 
              ? 'Vui lòng connect wallet để nhận rewards' 
              : 'Không thể phân phối reward. Vui lòng thử lại sau.',
            error: error.message,
          };
        }
      } else if (quizType === 'multiple_choice' && finalScore !== null) {
        response.reward = {
          success: false,
          message: `Điểm số ${finalScore.toFixed(2)}% < 70%. Cần đạt >= 70% để nhận reward.`,
        };
        console.log(`ℹ️  Quiz score ${finalScore.toFixed(2)}% < 70%, no reward distributed`);
      } else if (quizType === 'essay') {
        response.reward = {
          success: false,
          message: 'Bài tự luận đã được nộp. Giảng viên sẽ chấm điểm và thông báo kết quả.',
        };
      }

      return response;
    } catch (error) {
      // Chỉ rollback nếu transaction chưa được commit
      if (t && !t.finished) {
        await t.rollback();
      }
      throw new Error(`Lỗi khi nộp bài: ${error.message}`);
    }
  };
  
  /**
   * Tạo quiz mới (cho teacher)
   * @param {object} quizData - Dữ liệu quiz { lessonid, title, timelimit, maxattempts, showanswersaftersubmission }
   * @param {number} teacherId - ID của teacher
   */
  const createQuiz = async (quizData, teacherId) => {
    // Kiểm tra quyền: teacher phải sở hữu lesson
    const { lessons, courses } = require('../models');
    const lesson = await lessons.findByPk(quizData.lessonid, {
      include: [
        {
          model: courses,
          as: 'course',
          attributes: ['courseid', 'teacherid'],
        },
      ],
    });

    if (!lesson) {
      throw new Error('Không tìm thấy bài học');
    }

    if (lesson.course.teacherid !== teacherId) {
      throw new Error('Bạn không có quyền tạo quiz cho bài học này');
    }

    const newQuiz = await quizzes.create(quizData);
    return newQuiz;
  };

  /**
   * Cập nhật quiz (cho teacher)
   */
  const updateQuiz = async (quizId, quizData, teacherId) => {
    const { lessons, courses } = require('../models');
    const quiz = await quizzes.findByPk(quizId, {
      include: [
        {
          model: lessons,
          as: 'lesson',
          include: [
            {
              model: courses,
              as: 'course',
              attributes: ['courseid', 'teacherid'],
            },
          ],
        },
      ],
    });

    if (!quiz) {
      throw new Error('Không tìm thấy quiz');
    }

    if (quiz.lesson.course.teacherid !== teacherId) {
      throw new Error('Bạn không có quyền sửa quiz này');
    }

    await quiz.update(quizData);
    return quiz;
  };

  /**
   * Xóa quiz (cho teacher)
   */
  const deleteQuiz = async (quizId, teacherId) => {
    const { lessons, courses } = require('../models');
    const quiz = await quizzes.findByPk(quizId, {
      include: [
        {
          model: lessons,
          as: 'lesson',
          include: [
            {
              model: courses,
              as: 'course',
              attributes: ['courseid', 'teacherid'],
            },
          ],
        },
      ],
    });

    if (!quiz) {
      throw new Error('Không tìm thấy quiz');
    }

    if (quiz.lesson.course.teacherid !== teacherId) {
      throw new Error('Bạn không có quyền xóa quiz này');
    }

    // Xóa quiz và các bản ghi liên quan theo thứ tự đúng
    // Thứ tự: quizanswers -> quizsessions -> quizoptions -> quizquestions -> quiz
    const t = await sequelize.transaction();
    try {
      // 1. Lấy tất cả sessions của quiz
      const sessions = await quizsessions.findAll({
        where: { quizid: quizId },
        attributes: ['sessionid'],
        transaction: t,
      });
      const sessionIds = sessions.map(s => s.sessionid);

      // 2. Lấy tất cả questions của quiz
      const questions = await quizquestions.findAll({
        where: { quizid: quizId },
        attributes: ['questionid'],
        transaction: t,
      });
      const questionIds = questions.map(q => q.questionid);

      // 3. Set correctoptionid = NULL cho tất cả questions (tránh foreign key constraint)
      if (questionIds.length > 0) {
        await quizquestions.update(
          { correctoptionid: null },
          { 
            where: { quizid: quizId },
            transaction: t 
          }
        );
      }

      // 4. Xóa quizanswers TRƯỚC (có foreign key đến sessionid và questionid)
      if (sessionIds.length > 0) {
        await quizanswers.destroy({
          where: { sessionid: { [Op.in]: sessionIds } },
          transaction: t,
        });
      }
      // Cũng xóa theo questionid để đảm bảo
      if (questionIds.length > 0) {
        await quizanswers.destroy({
          where: { questionid: { [Op.in]: questionIds } },
          transaction: t,
        });
      }

      // 5. Xóa quizsessions (sau khi đã xóa quizanswers)
      if (sessionIds.length > 0) {
        await quizsessions.destroy({
          where: { quizid: quizId },
          transaction: t,
        });
      }

      // 6. Xóa quizoptions (sau khi đã set correctoptionid = NULL)
      if (questionIds.length > 0) {
        await quizoptions.destroy({
          where: { questionid: { [Op.in]: questionIds } },
          transaction: t,
        });
      }

      // 7. Xóa quizquestions
      if (questionIds.length > 0) {
        await quizquestions.destroy({
          where: { quizid: quizId },
          transaction: t,
        });
      }

      // 8. Cuối cùng xóa quiz
      await quiz.destroy({ transaction: t });

      await t.commit();
      return { message: 'Xóa quiz thành công' };
    } catch (error) {
      await t.rollback();
      console.error('Error deleting quiz:', error);
      console.error('Error stack:', error.stack);
      throw new Error('Lỗi khi xóa quiz: ' + error.message);
    }
  };

  /**
   * Lấy danh sách quiz của một lesson (cho teacher)
   */
  const getQuizzesByLesson = async (lessonId, teacherId) => {
    const { lessons, courses } = require('../models');
    const lesson = await lessons.findByPk(lessonId, {
      include: [
        {
          model: courses,
          as: 'course',
          attributes: ['courseid', 'teacherid'],
        },
      ],
    });

    if (!lesson) {
      throw new Error('Không tìm thấy bài học');
    }

    if (lesson.course.teacherid !== teacherId) {
      throw new Error('Bạn không có quyền xem quiz của bài học này');
    }

    const quizList = await quizzes.findAll({
      where: { lessonid: lessonId },
      include: [
        {
          model: quizquestions,
          as: 'quizquestions',
          include: [
            {
              model: quizoptions,
              as: 'quizoptions',
            },
          ],
        },
      ],
      order: [['createdat', 'DESC']],
    });

    return quizList;
  };

  /**
   * Tạo câu hỏi cho quiz
   */
  const createQuestion = async (quizId, questionData, teacherId) => {
    // Kiểm tra quyền
    const { lessons, courses } = require('../models');
    const quiz = await quizzes.findByPk(quizId, {
      include: [
        {
          model: lessons,
          as: 'lesson',
          include: [
            {
              model: courses,
              as: 'course',
              attributes: ['courseid', 'teacherid'],
            },
          ],
        },
      ],
    });

    if (!quiz) {
      throw new Error('Không tìm thấy quiz');
    }

    if (quiz.lesson.course.teacherid !== teacherId) {
      throw new Error('Bạn không có quyền thêm câu hỏi vào quiz này');
    }

    const { questiontext, explanation, options, correctoptionid } = questionData;

    const t = await sequelize.transaction();
    try {
      // Tạo câu hỏi
      const question = await quizquestions.create(
        {
          quizid: quizId,
          questiontext,
          explanation: explanation || null,
          correctoptionid: null, // Sẽ cập nhật sau khi tạo options
        },
        { transaction: t }
      );

      // Tạo các lựa chọn
      const createdOptions = [];
      let correctOptionId = null;
      
      for (const option of options) {
        const createdOption = await quizoptions.create(
          {
            questionid: question.questionid,
            optiontext: option.optiontext,
            iscorrect: option.iscorrect || false,
          },
          { transaction: t }
        );
        createdOptions.push(createdOption);

        // Nếu đây là đáp án đúng và chưa có đáp án đúng nào được set, lưu lại
        if (option.iscorrect && !correctOptionId) {
          correctOptionId = createdOption.optionid;
        }
      }
      
      // Cập nhật correctoptionid cho question (chỉ một lần, cho option đúng đầu tiên)
      if (correctOptionId) {
        await question.update({ correctoptionid: correctOptionId }, { transaction: t });
      }

      await t.commit();
      return { question, options: createdOptions };
    } catch (error) {
      await t.rollback();
      throw error;
    }
  };

  /**
   * Cập nhật câu hỏi
   */
  const updateQuestion = async (questionId, questionData, teacherId) => {
    const { lessons, courses } = require('../models');
    const question = await quizquestions.findByPk(questionId, {
      include: [
        {
          model: quizzes,
          as: 'quiz',
          include: [
            {
              model: lessons,
              as: 'lesson',
              include: [
                {
                  model: courses,
                  as: 'course',
                  attributes: ['courseid', 'teacherid'],
                },
              ],
            },
          ],
        },
      ],
    });

    if (!question) {
      throw new Error('Không tìm thấy câu hỏi');
    }

    if (question.quiz.lesson.course.teacherid !== teacherId) {
      throw new Error('Bạn không có quyền sửa câu hỏi này');
    }

    await question.update({
      questiontext: questionData.questiontext,
      explanation: questionData.explanation,
    });

    return question;
  };

  /**
   * Xóa câu hỏi
   */
  const deleteQuestion = async (questionId, teacherId) => {
    const { lessons, courses, quizoptions, quizanswers } = require('../models');
    const question = await quizquestions.findByPk(questionId, {
      include: [
        {
          model: quizzes,
          as: 'quiz',
          include: [
            {
              model: lessons,
              as: 'lesson',
              include: [
                {
                  model: courses,
                  as: 'course',
                  attributes: ['courseid', 'teacherid'],
                },
              ],
            },
          ],
        },
      ],
    });

    if (!question) {
      throw new Error('Không tìm thấy câu hỏi');
    }

    if (question.quiz.lesson.course.teacherid !== teacherId) {
      throw new Error('Bạn không có quyền xóa câu hỏi này');
    }

    // Xóa các bản ghi liên quan trước (answers và options)
    // Sử dụng transaction để đảm bảo atomicity
    const t = await sequelize.transaction();
    try {
      // 1. Set correctoptionid = NULL trước (vì có foreign key constraint)
      await question.update(
        { correctoptionid: null },
        { transaction: t }
      );

      // 2. Xóa quizanswers trước (có foreign key đến questionid và selectedoptionid)
      await quizanswers.destroy({
        where: { questionid: questionId },
        transaction: t,
      });

      // 3. Xóa quizoptions (sau khi đã set correctoptionid = NULL)
      await quizoptions.destroy({
        where: { questionid: questionId },
        transaction: t,
      });

      // 4. Cuối cùng xóa question
      await question.destroy({ transaction: t });

      await t.commit();
    } catch (error) {
      await t.rollback();
      console.error('Error deleting question:', error);
      throw new Error('Lỗi khi xóa câu hỏi: ' + error.message);
    }

    return { message: 'Xóa câu hỏi thành công' };
  };

  /**
   * Lấy chi tiết quiz cho teacher (có đáp án đúng)
   */
  const getQuizDetailsForTeacher = async (quizId, teacherId) => {
    const { lessons, courses } = require('../models');
    const quiz = await quizzes.findByPk(quizId, {
      include: [
        {
          model: lessons,
          as: 'lesson',
          include: [
            {
              model: courses,
              as: 'course',
              attributes: ['courseid', 'teacherid'],
            },
          ],
        },
      ],
    });

    if (!quiz) {
      throw new Error('Không tìm thấy quiz');
    }

    if (quiz.lesson.course.teacherid !== teacherId) {
      throw new Error('Bạn không có quyền xem quiz này');
    }

    const questions = await quizquestions.findAll({
      where: { quizid: quizId },
      include: [
        {
          model: quizoptions,
          as: 'quizoptions',
        },
      ],
      order: [['questionid', 'ASC']],
    });

    return {
      quizInfo: {
        quizid: quiz.quizid,
        lessonid: quiz.lessonid,
        title: quiz.title,
        timelimit: quiz.timelimit,
        maxattempts: quiz.maxattempts,
        showanswersaftersubmission: quiz.showanswersaftersubmission,
        quiztype: quiz.quiztype || 'multiple_choice',
      },
      questions: questions.map((q) => q.toJSON()),
    };
  };

  /**
   * Lấy kết quả quiz của học viên (cho teacher)
   */
  const getQuizResults = async (quizId, teacherId) => {
    const { lessons, courses, users } = require('../models');
    const quiz = await quizzes.findByPk(quizId, {
      include: [
        {
          model: lessons,
          as: 'lesson',
          include: [
            {
              model: courses,
              as: 'course',
              attributes: ['courseid', 'teacherid'],
            },
          ],
        },
      ],
    });

    if (!quiz) {
      throw new Error('Không tìm thấy quiz');
    }

    if (quiz.lesson.course.teacherid !== teacherId) {
      throw new Error('Bạn không có quyền xem kết quả quiz này');
    }

    const sessions = await quizsessions.findAll({
      where: { quizid: quizId },
      include: [
        {
          model: users,
          as: 'student',
          attributes: ['userid', 'fullname', 'email'],
        },
      ],
      order: [['submittedat', 'DESC']],
    });

    return sessions;
  };

  /**
   * Lấy danh sách quiz sessions cần chấm (essay quizzes chưa được chấm)
   */
  const getPendingQuizSessions = async (teacherId, page = 1, limit = 10) => {
    const { lessons, courses, users, quizzes } = require('../models');
    
    // Lấy tất cả courses của teacher
    const teacherCourses = await courses.findAll({
      where: { teacherid: teacherId },
      attributes: ['courseid'],
    });
    
    const courseIds = teacherCourses.map(c => c.courseid);
    
    // Lấy tất cả lessons của các courses này
    const teacherLessons = await lessons.findAll({
      where: { courseid: { [Op.in]: courseIds } },
      attributes: ['lessonid'],
    });
    
    const lessonIds = teacherLessons.map(l => l.lessonid);
    
    // Lấy tất cả quizzes của các lessons này (chỉ essay)
    const essayQuizzes = await quizzes.findAll({
      where: {
        lessonid: { [Op.in]: lessonIds },
        quiztype: 'essay',
      },
      attributes: ['quizid'],
    });
    
    const quizIds = essayQuizzes.map(q => q.quizid);
    
    // Lấy sessions chưa được chấm (isgraded = false) và đã submit
    const { count, rows } = await quizsessions.findAndCountAll({
      where: {
        quizid: { [Op.in]: quizIds },
        submittedat: { [Op.ne]: null },
        isgraded: false,
      },
      include: [
        {
          model: users,
          as: 'student',
          attributes: ['userid', 'fullname', 'email'],
        },
        {
          model: quizzes,
          as: 'quiz',
          attributes: ['quizid', 'title', 'quiztype'],
          include: [
            {
              model: lessons,
              as: 'lesson',
              attributes: ['lessonid', 'title'],
              include: [
                {
                  model: courses,
                  as: 'course',
                  attributes: ['courseid', 'coursename'],
                },
              ],
            },
          ],
        },
      ],
      order: [['submittedat', 'DESC']],
      limit: limit,
      offset: (page - 1) * limit,
    });
    
    return {
      sessions: rows,
      pagination: {
        total: count,
        page: page,
        limit: limit,
        totalPages: Math.ceil(count / limit),
      },
    };
  };

  /**
   * Grade essay quiz session
   */
  const gradeQuizSession = async (sessionId, teacherId, score, comment) => {
    const { lessons, courses } = require('../models');
    
    const session = await quizsessions.findOne({
      where: { sessionid: sessionId },
      include: [
        {
          model: quizzes,
          as: 'quiz',
          include: [
            {
              model: lessons,
              as: 'lesson',
              include: [
                {
                  model: courses,
                  as: 'course',
                  attributes: ['courseid', 'teacherid'],
                },
              ],
            },
          ],
        },
      ],
    });
    
    if (!session) {
      throw new Error('Không tìm thấy phiên làm bài');
    }
    
    if (session.quiz.lesson.course.teacherid !== teacherId) {
      throw new Error('Bạn không có quyền chấm bài này');
    }
    
    if (session.quiz.quiztype !== 'essay') {
      throw new Error('Chỉ có thể chấm bài tự luận');
    }
    
    if (session.isgraded) {
      throw new Error('Bài này đã được chấm rồi');
    }
    
    // Update session
    await session.update({
      score: score,
      isgraded: true,
      gradedby: teacherId,
      gradedat: new Date(),
      teachercomment: comment || null,
    });
    
    // If score >= 70%, distribute reward
    if (score >= 70) {
      try {
        const rewardService = require('./reward.service');
        // Convert score to number and ensure it's valid
        const scoreNum = Number(score);
        if (!isNaN(scoreNum) && scoreNum >= 70) {
          await rewardService.distributeQuizReward(session.studentid, session.quizid, scoreNum);
        }
      } catch (error) {
        console.warn('Could not distribute quiz reward after grading:', error.message);
      }
    }
    
    // Check if course should be completed after grading this quiz
    try {
      const progressService = require('./progress.service');
      const courseId = session.quiz.lesson.course.courseid;
      // Use a new transaction for course completion check
      const { sequelize } = require('../models');
      const t = await sequelize.transaction();
      try {
        await progressService.checkAndCompleteCourse(session.studentid, courseId, t);
        await t.commit();
      } catch (error) {
        await t.rollback();
        console.warn('Could not check course completion after grading:', error.message);
      }
    } catch (error) {
      console.warn('Error checking course completion:', error.message);
    }
    
    return session;
  };

  /**
   * Lấy answers của một quiz session (cho teacher grading)
   */
  const getQuizSessionAnswers = async (sessionId, teacherId) => {
    const { lessons, courses, quizquestions, quizanswers } = require('../models');
    
    const session = await quizsessions.findOne({
      where: { sessionid: sessionId },
      include: [
        {
          model: quizzes,
          as: 'quiz',
          include: [
            {
              model: lessons,
              as: 'lesson',
              include: [
                {
                  model: courses,
                  as: 'course',
                  attributes: ['courseid', 'teacherid'],
                },
              ],
            },
          ],
        },
      ],
    });
    
    if (!session) {
      throw new Error('Không tìm thấy phiên làm bài');
    }
    
    if (session.quiz.lesson.course.teacherid !== teacherId) {
      throw new Error('Bạn không có quyền xem bài này');
    }
    
    // Get questions
    const questions = await quizquestions.findAll({
      where: { quizid: session.quizid },
      include: [
        {
          model: quizoptions,
          as: 'quizoptions',
        },
      ],
      order: [['questionid', 'ASC']],
    });
    
    // Get answers
    const answers = await quizanswers.findAll({
      where: { sessionid: sessionId },
    });
    
    // Map answers to questions
    const questionsWithAnswers = questions.map((question) => {
      const answer = answers.find(a => a.questionid === question.questionid);
      return {
        questionid: question.questionid,
        questiontext: question.questiontext,
        explanation: question.explanation,
        quizoptions: question.quizoptions,
        answer: answer ? {
          selectedoptionid: answer.selectedoptionid,
          essayanswer: answer.essayanswer,
          iscorrect: answer.iscorrect,
        } : null,
      };
    });
    
    return {
      session: session.toJSON(),
      questions: questionsWithAnswers,
    };
  };

  module.exports = {
    getQuizDetails,
    startQuizSession,
    submitQuiz,
    createQuiz,
    updateQuiz,
    deleteQuiz,
    getQuizzesByLesson,
    getQuizDetailsForTeacher,
    createQuestion,
    updateQuestion,
    deleteQuestion,
    getQuizResults,
    getPendingQuizSessions,
    gradeQuizSession,
    getQuizSessionAnswers,
  };