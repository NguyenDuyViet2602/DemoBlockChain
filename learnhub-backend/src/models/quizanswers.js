const Sequelize = require("sequelize");
module.exports = function (sequelize, DataTypes) {
  return sequelize.define(
    "quizanswers",
    {
      answerid: {
        autoIncrement: true,
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
      },
      sessionid: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "quizsessions",
          key: "sessionid",
        },
      },
      questionid: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "quizquestions",
          key: "questionid",
        },
        onDelete: "CASCADE",
      },
      selectedoptionid: {
        type: DataTypes.INTEGER,
        allowNull: true, // Allow null for essay quizzes
        references: {
          model: "quizoptions",
          key: "optionid",
        },
      },
      essayanswer: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Essay answer text for essay type quizzes',
      },
      iscorrect: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
        defaultValue: false,
      },
      answeredat: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: Sequelize.Sequelize.literal("CURRENT_TIMESTAMP"),
      },
    },
    {
      sequelize,
      tableName: "quizanswers",
      schema: "public",
      timestamps: false,
      indexes: [
        {
          name: "quizanswers_pkey",
          unique: true,
          fields: [{ name: "answerid" }],
        },
      ],
    }
  );
};
