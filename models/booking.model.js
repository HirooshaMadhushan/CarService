// models/Booking.js
module.exports = (sequelize, DataTypes) => {
  const Booking = sequelize.define('Booking', {
    vehicleNumber: DataTypes.STRING,
    serviceDate: DataTypes.DATEONLY,
    timeSlot: DataTypes.STRING,
    mealOption: DataTypes.ENUM('breakfast', 'lunch', 'none'),

    // New fields for meal details directly in Booking
    mealItemName: DataTypes.STRING,     // e.g. "Pancakes"
    mealQuantity: DataTypes.INTEGER,    // e.g. 2

    status: {
      type: DataTypes.ENUM('booked', 'in-progress', 'completed', 'cancelled'),
      defaultValue: 'booked'
    },
    notificationStatus: DataTypes.STRING,

    // ✅ New column
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isEmail: true,
      },
    },
  });

  Booking.associate = (models) => {
    Booking.belongsTo(models.User, { foreignKey: 'userId' });
  };

  return Booking;
};
