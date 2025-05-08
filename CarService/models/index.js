const { Sequelize, DataTypes } = require('sequelize');
const { DB_NAME, DB_USER, DB_PASSWORD, DB_HOST } = process.env;

const sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASSWORD, {
  host: DB_HOST,
  dialect: 'mysql',
  logging: false
});

// Initialize models
const User = require('./user.model')(sequelize, DataTypes);
const ServicePackage = require('./servicePackage.model')(sequelize, DataTypes);
const Booking = require('./booking.model')(sequelize, DataTypes);
const MealOption = require('./mealOption.model')(sequelize, DataTypes);
const Notification = require('./notification.model')(sequelize, DataTypes);

// Associations
User.hasMany(Booking);
Booking.belongsTo(User);

ServicePackage.hasMany(Booking);
Booking.belongsTo(ServicePackage);

MealOption.hasMany(Booking);
Booking.belongsTo(MealOption);

User.hasMany(Notification);
Notification.belongsTo(User);

Booking.hasMany(Notification);
Notification.belongsTo(Booking);

// Export
module.exports = {
  sequelize,
  User,
  ServicePackage,
  Booking,
  MealOption,
  Notification
};
