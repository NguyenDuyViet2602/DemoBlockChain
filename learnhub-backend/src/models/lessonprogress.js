const Sequelize = require("sequelize");
module.exports = function (sequelize, DataTypes) {
  return sequelize.define(
    "lessonprogress",
    {
      progressid: {
        autoIncrement: true,
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
      },
      studentid: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "users",
          key: "userid",
        },
      },
      lessonid: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "lessons",
          key: "lessonid",
        },
        onDelete: "CASCADE",
      },
      iscompleted: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
        defaultValue: false,
      },
      completedat: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      watchtime: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 0,
        comment: 'Video watch time in seconds',
      },
    },
    {
      sequelize,
      tableName: "lessonprogress",
      schema: "public",
      timestamps: false,
      indexes: [
        {
          name: "lessonprogress_pkey",
          unique: true,
          fields: [{ name: "progressid" }],
        },
      ],
    }
  );
};
