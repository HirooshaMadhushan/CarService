// models/User.js
module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    name: DataTypes.STRING,
    email: { type: DataTypes.STRING, unique: true },
    password: DataTypes.STRING,
    phone: DataTypes.STRING,
    role: {
      type: DataTypes.ENUM('customer', 'staff', 'admin'),
      defaultValue: 'customer'
    },
    loyaltyPoints: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    }
  });

  User.associate = (models) => {
    // Correct: Reference to Booking (not ServiceBooking)
    User.hasMany(models.Booking, { foreignKey: 'userId' });
  };

  return User;
};
