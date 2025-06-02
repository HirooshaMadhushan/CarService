module.exports = (sequelize, DataTypes) => {
    const ServicePackage = sequelize.define('ServicePackage', {
      name: DataTypes.STRING,
      description: DataTypes.TEXT,
      price: DataTypes.FLOAT,
      estimatedDuration: DataTypes.INTEGER, // in minutes
      availableFor: DataTypes.STRING // e.g. 'Car', 'Van'
    });
  
    return ServicePackage;
  };
  