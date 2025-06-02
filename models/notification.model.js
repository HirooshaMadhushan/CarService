module.exports = (sequelize, DataTypes) => {
    const Notification = sequelize.define('Notification', {
      message: DataTypes.STRING,
      sentAt: DataTypes.DATE,
      status: DataTypes.ENUM('delivered', 'failed')
    });
  
    return Notification;
  };
  