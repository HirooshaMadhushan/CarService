// models/Booking.js
module.exports = (sequelize, DataTypes) => {
  const Booking = sequelize.define('Booking', {
    vehicleNumber: DataTypes.STRING,
    serviceDate: DataTypes.DATEONLY,
    timeSlot: DataTypes.STRING,
    mealOption: DataTypes.ENUM('breakfast', 'lunch', 'none'),
    status: {
      type: DataTypes.ENUM('booked', 'in-progress', 'completed', 'cancelled'),
      defaultValue: 'booked'
    },
    notificationStatus: DataTypes.STRING
  });

  Booking.associate = (models) => {
    Booking.belongsTo(models.User, { foreignKey: 'userId' });
    Booking.hasMany(models.MealItem, { foreignKey: 'bookingId' }); // associate meals
  };

  return Booking;
};
