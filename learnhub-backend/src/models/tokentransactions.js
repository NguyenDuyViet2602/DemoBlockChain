const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('tokentransactions', {
    transactionid: {
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
    txhash: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: "tokentransactions_txhash_key"
    },
    amount: {
      type: DataTypes.DECIMAL(18, 8),
      allowNull: false
    },
    type: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    activity_type: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    activity_id: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    status: {
      type: DataTypes.STRING(20),
      allowNull: true,
      defaultValue: 'pending'
    },
    block_number: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    createdat: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: Sequelize.Sequelize.literal('CURRENT_TIMESTAMP')
    }
  }, {
    sequelize,
    tableName: 'tokentransactions',
    schema: 'public',
    timestamps: false,
    indexes: [
      {
        name: "tokentransactions_txhash_key",
        unique: true,
        fields: [
          { name: "txhash" },
        ]
      },
      {
        name: "tokentransactions_pkey",
        unique: true,
        fields: [
          { name: "transactionid" },
        ]
      },
      {
        name: "tokentransactions_userid_idx",
        fields: [
          { name: "userid" },
        ]
      },
    ]
  });
};

