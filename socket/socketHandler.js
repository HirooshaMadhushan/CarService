// socket/socketHandler.js
const { ChatMessage, ChatSession, AdminAvailability } = require('../models/chat.model');

class SocketHandler {
  constructor(io) {
    this.io = io;
    this.connectedUsers = new Map(); // sessionId -> socketId
    this.connectedAdmins = new Map(); // adminId -> socketId
    
    this.io.on('connection', (socket) => {
      console.log('User connected:', socket.id);
      
      // Client events
      socket.on('client:join', (data) => this.handleClientJoin(socket, data));
      socket.on('client:message', (data) => this.handleClientMessage(socket, data));
      socket.on('client:typing', (data) => this.handleClientTyping(socket, data));
      
      // Admin events
      socket.on('admin:join', (data) => this.handleAdminJoin(socket, data));
      socket.on('admin:message', (data) => this.handleAdminMessage(socket, data));
      socket.on('admin:typing', (data) => this.handleAdminTyping(socket, data));
      socket.on('admin:online', (data) => this.handleAdminOnline(socket, data));
      socket.on('admin:offline', (data) => this.handleAdminOffline(socket, data));
      
      // General events
      socket.on('disconnect', () => this.handleDisconnect(socket));
    });
  }

  handleClientJoin(socket, { sessionId, clientName }) {
    socket.join(`session_${sessionId}`);
    this.connectedUsers.set(sessionId, socket.id);
    
    // Notify admins about new client
    socket.to('admin_room').emit('client:joined', {
      sessionId,
      clientName,
      timestamp: new Date()
    });
    
    console.log(`Client ${clientName} joined session ${sessionId}`);
  }

  async handleClientMessage(socket, { sessionId, message }) {
    try {
      // Save message to database
      const savedMessage = await ChatMessage.create({
        sessionId,
        message,
        senderType: 'client'
      });

      // Update session activity
      await ChatSession.update(
        { lastActivity: new Date() },
        { where: { sessionId } }
      );

      // Emit to admins
      socket.to('admin_room').emit('client:message', {
        sessionId,
        message: savedMessage.message,
        timestamp: savedMessage.createdAt,
        messageId: savedMessage.id
      });

      // Check if session has assigned admin, if not try to auto-assign
      const session = await ChatSession.findOne({ where: { sessionId } });
      if (!session.assignedAdmin) {
        const availableAdmin = await this.findAvailableAdmin();
        if (availableAdmin) {
          await this.assignAdminToSession(sessionId, availableAdmin.adminId);
          
          // Notify admin about assignment
          const adminSocketId = this.connectedAdmins.get(availableAdmin.adminId);
          if (adminSocketId) {
            this.io.to(adminSocketId).emit('session:assigned', {
              sessionId,
              clientName: session.clientName
            });
          }
        }
      }

      console.log(`Message from client in session ${sessionId}: ${message}`);
    } catch (error) {
      console.error('Error handling client message:', error);
      socket.emit('error', { message: 'Failed to send message' });
    }
  }

  handleClientTyping(socket, { sessionId, isTyping }) {
    socket.to('admin_room').emit('client:typing', {
      sessionId,
      isTyping
    });
  }

  handleAdminJoin(socket, { adminId, adminName }) {
    socket.join('admin_room');
    socket.join(`admin_${adminId}`);
    this.connectedAdmins.set(adminId, socket.id);
    
    // Update admin availability
    this.updateAdminOnlineStatus(adminId, true);
    
    // Notify other admins
    socket.to('admin_room').emit('admin:joined', {
      adminId,
      adminName,
      timestamp: new Date()
    });
    
    console.log(`Admin ${adminName} (${adminId}) joined`);
  }

  async handleAdminMessage(socket, { sessionId, message, adminId }) {
    try {
      // Save message to database
      const savedMessage = await ChatMessage.create({
        sessionId,
        message,
        senderType: 'admin',
        senderId: adminId
      });

      // Update session activity
      await ChatSession.update(
        { lastActivity: new Date() },
        { where: { sessionId } }
      );

      // Emit to client
      socket.to(`session_${sessionId}`).emit('admin:message', {
        message: savedMessage.message,
        timestamp: savedMessage.createdAt,
        adminId,
        messageId: savedMessage.id
      });

      // Emit to other admins
      socket.to('admin_room').emit('admin:message_sent', {
        sessionId,
        message: savedMessage.message,
        adminId,
        timestamp: savedMessage.createdAt
      });

      console.log(`Message from admin ${adminId} to session ${sessionId}: ${message}`);
    } catch (error) {
      console.error('Error handling admin message:', error);
      socket.emit('error', { message: 'Failed to send message' });
    }
  }

  handleAdminTyping(socket, { sessionId, isTyping, adminId }) {
    socket.to(`session_${sessionId}`).emit('admin:typing', {
      isTyping,
      adminId
    });
  }

  async handleAdminOnline(socket, { adminId }) {
    await this.updateAdminOnlineStatus(adminId, true);
    socket.to('admin_room').emit('admin:status_changed', {
      adminId,
      isOnline: true
    });
  }

  async handleAdminOffline(socket, { adminId }) {
    await this.updateAdminOnlineStatus(adminId, false);
    socket.to('admin_room').emit('admin:status_changed', {
      adminId,
      isOnline: false
    });
  }

  async handleDisconnect(socket) {
    // Find and remove disconnected user/admin
    for (const [sessionId, socketId] of this.connectedUsers.entries()) {
      if (socketId === socket.id) {
        this.connectedUsers.delete(sessionId);
        socket.to('admin_room').emit('client:disconnected', { sessionId });
        console.log(`Client from session ${sessionId} disconnected`);
        break;
      }
    }

    for (const [adminId, socketId] of this.connectedAdmins.entries()) {
      if (socketId === socket.id) {
        this.connectedAdmins.delete(adminId);
        await this.updateAdminOnlineStatus(adminId, false);
        socket.to('admin_room').emit('admin:disconnected', { adminId });
        console.log(`Admin ${adminId} disconnected`);
        break;
      }
    }

    console.log('User disconnected:', socket.id);
  }

  async findAvailableAdmin() {
    try {
      const availableAdmin = await AdminAvailability.findOne({
        where: {
          isOnline: true,
          currentChatCount: {
            [require('sequelize').Op.lt]: require('sequelize').col('maxConcurrentChats')
          }
        },
        order: [['currentChatCount', 'ASC']] // Assign to admin with least chats
      });

      return availableAdmin;
    } catch (error) {
      console.error('Error finding available admin:', error);
      return null;
    }
  }

  async assignAdminToSession(sessionId, adminId) {
    try {
      await ChatSession.update(
        { assignedAdmin: adminId },
        { where: { sessionId } }
      );

      await AdminAvailability.update(
        { currentChatCount: require('sequelize').literal('currentChatCount + 1') },
        { where: { adminId } }
      );

      console.log(`Assigned admin ${adminId} to session ${sessionId}`);
    } catch (error) {
      console.error('Error assigning admin to session:', error);
    }
  }

  async updateAdminOnlineStatus(adminId, isOnline) {
    try {
      const [availability] = await AdminAvailability.findOrCreate({
        where: { adminId },
        defaults: {
          isOnline,
          lastSeen: new Date(),
          maxConcurrentChats: 5,
          currentChatCount: 0
        }
      });

      await availability.update({
        isOnline,
        lastSeen: new Date()
      });
    } catch (error) {
      console.error('Error updating admin online status:', error);
    }
  }

  // Utility methods for external use
  sendMessageToSession(sessionId, message, senderType = 'bot') {
    this.io.to(`session_${sessionId}`).emit('bot:message', {
      message,
      timestamp: new Date(),
      senderType
    });
  }

  notifyAdmins(event, data) {
    this.io.to('admin_room').emit(event, data);
  }

  getConnectedClientsCount() {
    return this.connectedUsers.size;
  }

  getConnectedAdminsCount() {
    return this.connectedAdmins.size;
  }
}

module.exports = SocketHandler;