const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('nftcertificates', {
    nftid: {
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
    courseid: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'courses',
        key: 'courseid'
      }
    },
    token_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: "nftcertificates_token_id_key"
    },
    contract_address: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    metadata_url: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    mintedat: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: Sequelize.Sequelize.literal('CURRENT_TIMESTAMP')
    }
  }, {
    sequelize,
    tableName: 'nftcertificates',
    schema: 'public',
    timestamps: false,
    indexes: [
      {
        name: "nftcertificates_token_id_key",
        unique: true,
        fields: [
          { name: "token_id" },
        ]
      },
      {
        name: "nftcertificates_pkey",
        unique: true,
        fields: [
          { name: "nftid" },
        ]
      },
      {
        name: "nftcertificates_userid_idx",
        fields: [
          { name: "userid" },
        ]
      },
      {
        name: "nftcertificates_courseid_idx",
        fields: [
          { name: "courseid" },
        ]
      },
    ]
  });
};

