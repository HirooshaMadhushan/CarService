// models/chat.model.js
module.exports = (sequelize, DataTypes) => {
  // Chat Session Model
  const ChatSession = sequelize.define("ChatSession", {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    sessionId: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
    },
    clientName: DataTypes.STRING,
    clientEmail: DataTypes.STRING,
    status: {
      type: DataTypes.ENUM("active", "closed", "waiting"),
      defaultValue: "active",
    },
    assignedAdmin: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    lastActivity: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  }, {
    timestamps: true,
    tableName: "chat_sessions",
  });

  // Chat Message Model
  const ChatMessage = sequelize.define("ChatMessage", {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    sessionId: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    senderType: {
      type: DataTypes.ENUM("client", "admin", "bot"),
      allowNull: false,
    },
    senderId: DataTypes.INTEGER,
    isRead: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    messageType: {
      type: DataTypes.ENUM("text", "image", "file"),
      defaultValue: "text",
    },
  }, {
    timestamps: true,
    tableName: "chat_messages",
  });

  // FAQ Model
  const FAQ = sequelize.define("FAQ", {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    question: { type: DataTypes.TEXT, allowNull: false },
    answer: { type: DataTypes.TEXT, allowNull: false },
    keywords: DataTypes.JSON,
    category: { type: DataTypes.STRING, defaultValue: "general" },
    isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
    priority: { type: DataTypes.INTEGER, defaultValue: 1 },
  }, {
    timestamps: true,
    tableName: "faqs",
  });

  // Response Template Model
  const ResponseTemplate = sequelize.define("ResponseTemplate", {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING, allowNull: false },
    content: { type: DataTypes.TEXT, allowNull: false },
    category: DataTypes.STRING,
    isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
  }, {
    timestamps: true,
    tableName: "response_templates",
  });

  // Admin Availability Model
  const AdminAvailability = sequelize.define("AdminAvailability", {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    adminId: { type: DataTypes.INTEGER, allowNull: false },
    isOnline: { type: DataTypes.BOOLEAN, defaultValue: false },
    lastSeen: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    maxConcurrentChats: { type: DataTypes.INTEGER, defaultValue: 5 },
    currentChatCount: { type: DataTypes.INTEGER, defaultValue: 0 },
  }, {
    timestamps: true,
    tableName: "admin_availability",
  });

  // Relationships
  ChatSession.hasMany(ChatMessage, { foreignKey: "sessionId", sourceKey: "sessionId" });
  ChatMessage.belongsTo(ChatSession, { foreignKey: "sessionId", targetKey: "sessionId" });

  return { ChatSession, ChatMessage, FAQ, ResponseTemplate, AdminAvailability };
};
