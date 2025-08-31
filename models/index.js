const { Sequelize, DataTypes } = require("sequelize");
const { DB_NAME, DB_USER, DB_PASSWORD, DB_HOST } = process.env;

// ================= Database Connection =================
const sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASSWORD, {
  host: DB_HOST,
  dialect: "mysql",
  logging: false,
});

// ================= Load Existing Models =================
const User = require("./user.model")(sequelize, DataTypes);
const ServicePackage = require("./servicePackage.model")(sequelize, DataTypes);
const Booking = require("./booking.model")(sequelize, DataTypes);
const Contact = require("./contact.model")(sequelize, DataTypes);
const Notification = require("./notification.model")(sequelize, DataTypes);
const ClientMessage = require("./review.model")(sequelize, DataTypes); // ✅ new model

// ================= Load Chat Models =================
const {
  ChatSession,
  ChatMessage,
  FAQ,
  ResponseTemplate,
  AdminAvailability,
} = require("./chat.model")(sequelize, DataTypes); // ✅ now initialized

// ================= Associations =================
// User ↔ Booking
User.hasMany(Booking, { foreignKey: "userId" });
Booking.belongsTo(User, { foreignKey: "userId" });

// ServicePackage ↔ Booking
ServicePackage.hasMany(Booking, { foreignKey: "servicePackageId" });
Booking.belongsTo(ServicePackage, { foreignKey: "servicePackageId" });

// User ↔ Notification
User.hasMany(Notification, { foreignKey: "userId" });
Notification.belongsTo(User, { foreignKey: "userId" });

// Booking ↔ Notification
Booking.hasMany(Notification, { foreignKey: "bookingId" });
Notification.belongsTo(Booking, { foreignKey: "bookingId" });

// ChatSession ↔ ChatMessage
ChatSession.hasMany(ChatMessage, {
  foreignKey: "sessionId",
  sourceKey: "sessionId",
});
ChatMessage.belongsTo(ChatSession, {
  foreignKey: "sessionId",
  targetKey: "sessionId",
});

// User ↔ AdminAvailability
User.hasOne(AdminAvailability, { foreignKey: "adminId" });
AdminAvailability.belongsTo(User, { foreignKey: "adminId" });

// ================= Export All Models =================
module.exports = {
  sequelize,
  User,
  ServicePackage,
  Booking,
  Contact,
  Notification,
  ClientMessage,
  ChatSession,
  ChatMessage,
  FAQ,
  ResponseTemplate,
  AdminAvailability,
};
