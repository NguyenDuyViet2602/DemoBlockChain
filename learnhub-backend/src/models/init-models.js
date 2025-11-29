var DataTypes = require("sequelize").DataTypes;
var _assignments = require("./assignments");
var _cart = require("./cart");
var _categories = require("./categories");
var _certificates = require("./certificates");
var _chapters = require("./chapters");
var _coursecompletions = require("./coursecompletions");
var _coursereviews = require("./coursereviews");
var _courses = require("./courses");
var _enrollments = require("./enrollments");
var _favorites = require("./favorites");
var _forumdiscussions = require("./forumdiscussions");
var _forumreplies = require("./forumreplies");
var _lessoncomments = require("./lessoncomments");
var _lessonprogress = require("./lessonprogress");
var _lessons = require("./lessons");
var _livesessions = require("./livesessions");
var _messages = require("./messages");
var _notifications = require("./notifications");
var _orderdetails = require("./orderdetails");
var _orders = require("./orders");
var _promotions = require("./promotions");
var _quizanswers = require("./quizanswers");
var _quizoptions = require("./quizoptions");
var _quizquestions = require("./quizquestions");
var _quizsessions = require("./quizsessions");
var _quizzes = require("./quizzes");
var _reports = require("./reports");
var _schedules = require("./schedules");
var _submissions = require("./submissions");
var _teacherrequests = require("./teacherrequests");
var _userdetails = require("./userdetails");
var _users = require("./users");
var _walletaddresses = require("./walletaddresses");
var _tokentransactions = require("./tokentransactions");
var _rewardsearned = require("./rewardsearned");
var _nftcertificates = require("./nftcertificates");

function initModels(sequelize) {
  var assignments = _assignments(sequelize, DataTypes);
  var cart = _cart(sequelize, DataTypes);
  var categories = _categories(sequelize, DataTypes);
  var certificates = _certificates(sequelize, DataTypes);
  var chapters = _chapters(sequelize, DataTypes);
  var coursecompletions = _coursecompletions(sequelize, DataTypes);
  var coursereviews = _coursereviews(sequelize, DataTypes);
  var courses = _courses(sequelize, DataTypes);
  var enrollments = _enrollments(sequelize, DataTypes);
  var favorites = _favorites(sequelize, DataTypes);
  var forumdiscussions = _forumdiscussions(sequelize, DataTypes);
  var forumreplies = _forumreplies(sequelize, DataTypes);
  var lessoncomments = _lessoncomments(sequelize, DataTypes);
  var lessonprogress = _lessonprogress(sequelize, DataTypes);
  var lessons = _lessons(sequelize, DataTypes);
  var livesessions = _livesessions(sequelize, DataTypes);
  var messages = _messages(sequelize, DataTypes);
  var notifications = _notifications(sequelize, DataTypes);
  var orderdetails = _orderdetails(sequelize, DataTypes);
  var orders = _orders(sequelize, DataTypes);
  var promotions = _promotions(sequelize, DataTypes);
  var quizanswers = _quizanswers(sequelize, DataTypes);
  var quizoptions = _quizoptions(sequelize, DataTypes);
  var quizquestions = _quizquestions(sequelize, DataTypes);
  var quizsessions = _quizsessions(sequelize, DataTypes);
  var quizzes = _quizzes(sequelize, DataTypes);
  var reports = _reports(sequelize, DataTypes);
  var schedules = _schedules(sequelize, DataTypes);
  var submissions = _submissions(sequelize, DataTypes);
  var teacherrequests = _teacherrequests(sequelize, DataTypes);
  var userdetails = _userdetails(sequelize, DataTypes);
  var users = _users(sequelize, DataTypes);
  var walletaddresses = _walletaddresses(sequelize, DataTypes);
  var tokentransactions = _tokentransactions(sequelize, DataTypes);
  var rewardsearned = _rewardsearned(sequelize, DataTypes);
  var nftcertificates = _nftcertificates(sequelize, DataTypes);

  submissions.belongsTo(assignments, { as: "assignment", foreignKey: "assignmentid"});
  assignments.hasMany(submissions, { as: "submissions", foreignKey: "assignmentid"});
  courses.belongsTo(categories, { as: "category", foreignKey: "categoryid"});
  categories.hasMany(courses, { as: "courses", foreignKey: "categoryid"});
  lessons.belongsTo(chapters, { as: "chapter", foreignKey: "chapterid"});
  chapters.hasMany(lessons, { as: "lessons", foreignKey: "chapterid"});
  assignments.belongsTo(courses, { as: "course", foreignKey: "courseid"});
  courses.hasMany(assignments, { as: "assignments", foreignKey: "courseid"});
  cart.belongsTo(courses, { as: "course", foreignKey: "courseid"});
  courses.hasMany(cart, { as: "carts", foreignKey: "courseid"});
  certificates.belongsTo(courses, { as: "course", foreignKey: "courseid"});
  courses.hasMany(certificates, { as: "certificates", foreignKey: "courseid"});
  chapters.belongsTo(courses, { as: "course", foreignKey: "courseid"});
  courses.hasMany(chapters, { as: "chapters", foreignKey: "courseid"});
  coursecompletions.belongsTo(courses, { as: "course", foreignKey: "courseid"});
  courses.hasMany(coursecompletions, { as: "coursecompletions", foreignKey: "courseid"});
  coursereviews.belongsTo(courses, { as: "course", foreignKey: "courseid"});
  courses.hasMany(coursereviews, { as: "coursereviews", foreignKey: "courseid"});
  enrollments.belongsTo(courses, { as: "course", foreignKey: "courseid"});
  courses.hasMany(enrollments, { as: "enrollments", foreignKey: "courseid"});
  favorites.belongsTo(courses, { as: "course", foreignKey: "courseid"});
  courses.hasMany(favorites, { as: "favorites", foreignKey: "courseid"});
  forumdiscussions.belongsTo(courses, { as: "course", foreignKey: "courseid"});
  courses.hasMany(forumdiscussions, { as: "forumdiscussions", foreignKey: "courseid"});
  lessons.belongsTo(courses, { as: "course", foreignKey: "courseid"});
  courses.hasMany(lessons, { as: "lessons", foreignKey: "courseid"});
  livesessions.belongsTo(courses, { as: "course", foreignKey: "courseid"});
  courses.hasMany(livesessions, { as: "livesessions", foreignKey: "courseid"});
  orderdetails.belongsTo(courses, { as: "course", foreignKey: "courseid"});
  courses.hasMany(orderdetails, { as: "orderdetails", foreignKey: "courseid"});
  reports.belongsTo(courses, { as: "course", foreignKey: "courseid"});
  courses.hasMany(reports, { as: "reports", foreignKey: "courseid"});
  schedules.belongsTo(courses, { as: "course", foreignKey: "courseid"});
  courses.hasMany(schedules, { as: "schedules", foreignKey: "courseid"});
  forumreplies.belongsTo(forumdiscussions, { as: "discussion", foreignKey: "discussionid"});
  forumdiscussions.hasMany(forumreplies, { as: "forumreplies", foreignKey: "discussionid"});
  lessoncomments.belongsTo(lessons, { as: "lesson", foreignKey: "lessonid"});
  lessons.hasMany(lessoncomments, { as: "lessoncomments", foreignKey: "lessonid"});
  lessonprogress.belongsTo(lessons, { as: "lesson", foreignKey: "lessonid"});
  lessons.hasMany(lessonprogress, { as: "lessonprogresses", foreignKey: "lessonid"});
  quizzes.belongsTo(lessons, { as: "lesson", foreignKey: "lessonid"});
  lessons.hasMany(quizzes, { as: "quizzes", foreignKey: "lessonid"});
  orderdetails.belongsTo(orders, { as: "order", foreignKey: "orderid"});
  orders.hasMany(orderdetails, { as: "orderdetails", foreignKey: "orderid"});
  orders.belongsTo(promotions, { as: "promotion", foreignKey: "promotionid"});
  promotions.hasMany(orders, { as: "orders", foreignKey: "promotionid"});
  quizanswers.belongsTo(quizoptions, { as: "selectedoption", foreignKey: "selectedoptionid"});
  quizoptions.hasMany(quizanswers, { as: "quizanswers", foreignKey: "selectedoptionid"});
  quizanswers.belongsTo(quizquestions, { as: "question", foreignKey: "questionid"});
  quizquestions.hasMany(quizanswers, { as: "quizanswers", foreignKey: "questionid"});
  quizoptions.belongsTo(quizquestions, { as: "question", foreignKey: "questionid"});
  quizquestions.hasMany(quizoptions, { as: "quizoptions", foreignKey: "questionid"});
  quizanswers.belongsTo(quizsessions, { as: "session", foreignKey: "sessionid"});
  quizsessions.hasMany(quizanswers, { as: "quizanswers", foreignKey: "sessionid"});
  quizquestions.belongsTo(quizzes, { as: "quiz", foreignKey: "quizid"});
  quizzes.hasMany(quizquestions, { as: "quizquestions", foreignKey: "quizid"});
  quizsessions.belongsTo(quizzes, { as: "quiz", foreignKey: "quizid"});
  quizzes.hasMany(quizsessions, { as: "quizsessions", foreignKey: "quizid"});
  cart.belongsTo(users, { as: "user", foreignKey: "userid"});
  users.hasMany(cart, { as: "carts", foreignKey: "userid"});
  certificates.belongsTo(users, { as: "student", foreignKey: "studentid"});
  users.hasMany(certificates, { as: "certificates", foreignKey: "studentid"});
  coursecompletions.belongsTo(users, { as: "student", foreignKey: "studentid"});
  users.hasMany(coursecompletions, { as: "coursecompletions", foreignKey: "studentid"});
  coursereviews.belongsTo(users, { as: "student", foreignKey: "studentid"});
  users.hasMany(coursereviews, { as: "coursereviews", foreignKey: "studentid"});
  courses.belongsTo(users, { as: "teacher", foreignKey: "teacherid"});
  users.hasMany(courses, { as: "courses", foreignKey: "teacherid"});
  enrollments.belongsTo(users, { as: "student", foreignKey: "studentid"});
  users.hasMany(enrollments, { as: "enrollments", foreignKey: "studentid"});
  favorites.belongsTo(users, { as: "user", foreignKey: "userid"});
  users.hasMany(favorites, { as: "favorites", foreignKey: "userid"});
  forumdiscussions.belongsTo(users, { as: "createdby_user", foreignKey: "createdby"});
  users.hasMany(forumdiscussions, { as: "forumdiscussions", foreignKey: "createdby"});
  forumreplies.belongsTo(users, { as: "user", foreignKey: "userid"});
  users.hasMany(forumreplies, { as: "forumreplies", foreignKey: "userid"});
  lessoncomments.belongsTo(users, { as: "student", foreignKey: "studentid"});
  users.hasMany(lessoncomments, { as: "lessoncomments", foreignKey: "studentid"});
  lessonprogress.belongsTo(users, { as: "student", foreignKey: "studentid"});
  users.hasMany(lessonprogress, { as: "lessonprogresses", foreignKey: "studentid"});
  livesessions.belongsTo(users, { as: "teacher", foreignKey: "teacherid"});
  users.hasMany(livesessions, { as: "livesessions", foreignKey: "teacherid"});
  messages.belongsTo(users, { as: "receiver", foreignKey: "receiverid"});
  users.hasMany(messages, { as: "messages", foreignKey: "receiverid"});
  messages.belongsTo(users, { as: "sender", foreignKey: "senderid"});
  users.hasMany(messages, { as: "sender_messages", foreignKey: "senderid"});
  notifications.belongsTo(users, { as: "user", foreignKey: "userid"});
  users.hasMany(notifications, { as: "notifications", foreignKey: "userid"});
  orders.belongsTo(users, { as: "user", foreignKey: "userid"});
  users.hasMany(orders, { as: "orders", foreignKey: "userid"});
  quizsessions.belongsTo(users, { as: "student", foreignKey: "studentid"});
  users.hasMany(quizsessions, { as: "quizsessions", foreignKey: "studentid"});
  reports.belongsTo(users, { as: "student", foreignKey: "studentid"});
  users.hasMany(reports, { as: "reports", foreignKey: "studentid"});
  schedules.belongsTo(users, { as: "teacher", foreignKey: "teacherid"});
  users.hasMany(schedules, { as: "schedules", foreignKey: "teacherid"});
  submissions.belongsTo(users, { as: "student", foreignKey: "studentid"});
  users.hasMany(submissions, { as: "submissions", foreignKey: "studentid"});
  teacherrequests.belongsTo(users, { as: "user", foreignKey: "userid"});
  users.hasMany(teacherrequests, { as: "teacherrequests", foreignKey: "userid"});
  userdetails.belongsTo(users, { as: "user", foreignKey: "userid"});
  users.hasMany(userdetails, { as: "userdetails", foreignKey: "userid"});
  walletaddresses.belongsTo(users, { as: "user", foreignKey: "userid"});
  users.hasMany(walletaddresses, { as: "walletaddresses", foreignKey: "userid"});
  tokentransactions.belongsTo(users, { as: "user", foreignKey: "userid"});
  users.hasMany(tokentransactions, { as: "tokentransactions", foreignKey: "userid"});
  rewardsearned.belongsTo(users, { as: "user", foreignKey: "userid"});
  users.hasMany(rewardsearned, { as: "rewardsearned", foreignKey: "userid"});
  rewardsearned.belongsTo(tokentransactions, { as: "transaction", foreignKey: "transactionid"});
  tokentransactions.hasMany(rewardsearned, { as: "rewardsearned", foreignKey: "transactionid"});
  nftcertificates.belongsTo(users, { as: "user", foreignKey: "userid"});
  users.hasMany(nftcertificates, { as: "nftcertificates", foreignKey: "userid"});
  nftcertificates.belongsTo(courses, { as: "course", foreignKey: "courseid"});
  courses.hasMany(nftcertificates, { as: "nftcertificates", foreignKey: "courseid"});

  return {
    assignments,
    cart,
    categories,
    certificates,
    chapters,
    coursecompletions,
    coursereviews,
    courses,
    enrollments,
    favorites,
    forumdiscussions,
    forumreplies,
    lessoncomments,
    lessonprogress,
    lessons,
    livesessions,
    messages,
    notifications,
    orderdetails,
    orders,
    promotions,
    quizanswers,
    quizoptions,
    quizquestions,
    quizsessions,
    quizzes,
    reports,
    schedules,
    submissions,
    teacherrequests,
    userdetails,
    users,
    walletaddresses,
    tokentransactions,
    rewardsearned,
    nftcertificates,
  };
}
module.exports = initModels;
module.exports.initModels = initModels;
module.exports.default = initModels;
