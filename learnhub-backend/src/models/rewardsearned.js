const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('rewardsearned', {
    rewardid: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    userid: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'userid'
      }
    },
    activity_type: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    activity_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    amount: {
      type: DataTypes.DECIMAL(18, 8),
      allowNull: false
    },
    transactionid: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'tokentransactions',
        key: 'transactionid'
      }
    },
    earnedat: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: Sequelize.Sequelize.literal('CURRENT_TIMESTAMP')
    }
  }, {
    sequelize,
    tableName: 'rewardsearned',
    schema: 'public',
    timestamps: false,
    indexes: [
      {
        name: "rewardsearned_pkey",
        unique: true,
        fields: [
          { name: "rewardid" },
        ]
      },
      {
        name: "rewardsearned_userid_idx",
        fields: [
          { name: "userid" },
        ]
      },
      {
        name: "rewardsearned_activity_idx",
        fields: [
          { name: "activity_type" },
          { name: "activity_id" },
        ]
      },
    ]
  });
};

