// models/clientMessage.js
module.exports = (sequelize, DataTypes) => {
  const ClientMessage = sequelize.define("ClientMessage", {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    clientName: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    rating: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1,
        max: 5
      }
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM("pending", "accepted"),
      allowNull: false,
      defaultValue: "pending"
    }
  }, {
    tableName: "client_messages",
    timestamps: true // adds createdAt & updatedAt
  });

  return ClientMessage;
};
