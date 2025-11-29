const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('walletaddresses', {
    walletid: {
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
    address: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: "walletaddresses_address_key"
    },
    network: {
      type: DataTypes.STRING(50),
      allowNull: true,
      defaultValue: 'polygon'
    },
    createdat: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: Sequelize.Sequelize.literal('CURRENT_TIMESTAMP')
    }
  }, {
    sequelize,
    tableName: 'walletaddresses',
    schema: 'public',
    timestamps: false,
    indexes: [
      {
        name: "walletaddresses_address_key",
        unique: true,
        fields: [
          { name: "address" },
        ]
      },
      {
        name: "walletaddresses_pkey",
        unique: true,
        fields: [
          { name: "walletid" },
        ]
      },
      {
        name: "walletaddresses_userid_idx",
        fields: [
          { name: "userid" },
        ]
      },
    ]
  });
};

