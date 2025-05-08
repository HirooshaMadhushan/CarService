// models/MealItem.js
module.exports = (sequelize, DataTypes) => {
  const MealItem = sequelize.define('MealItem', {
    itemName: DataTypes.STRING,
    quantity: DataTypes.INTEGER
  });

  MealItem.associate = (models) => {
    MealItem.belongsTo(models.Booking, { foreignKey: 'bookingId' });
  };

  return MealItem;
};
