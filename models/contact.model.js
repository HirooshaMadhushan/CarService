// models/contact.js
module.exports = (sequelize, DataTypes) => {
  const Contact = sequelize.define("Contact", {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    email: {
      type: DataTypes.STRING(150),
      allowNull: false,
      validate: {
        isEmail: true
      }
    },
    phone: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    subject: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM("unread", "read", "replied"),
      allowNull: false,
      defaultValue: "unread"
    }
  }, {
    tableName: "contacts",
    timestamps: true // createdAt & updatedAt
  });

  return Contact;
};
