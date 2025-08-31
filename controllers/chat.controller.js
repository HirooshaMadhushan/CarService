const { ChatSession, ChatMessage, FAQ, ResponseTemplate, AdminAvailability } = require('../models/chat.model');
const { Op } = require('sequelize');

class ChatbotService {
  constructor() {
    this.defaultResponses = [
      "Thank you for your message. An admin will be with you shortly.",
      "I understand your inquiry. Let me connect you with someone who can help.",
      "Thanks for reaching out! How can I assist you today?",
      "I'm here to help. Could you provide more details about what you're looking for?"
    ];
  }

  async findBestMatch(userMessage) {
    try {
      const faqs = await FAQ.findAll({ 
        where: { isActive: true },
        order: [['priority', 'DESC']]
      });
      
      let bestMatch = null;
      let highestScore = 0;

      for (const faq of faqs) {
        let score = this.calculateSimilarity(userMessage.toLowerCase(), faq.question.toLowerCase());
        
        if (faq.keywords && Array.isArray(faq.keywords)) {
          for (const keyword of faq.keywords) {
            if (userMessage.toLowerCase().includes(keyword.toLowerCase())) {
              score += 0.4;
            }
          }
        }

        if (score > highestScore && score > 0.4) {
          highestScore = score;
          bestMatch = faq;
        }
      }

      return bestMatch;
    } catch (error) {
      console.error('Error finding FAQ match:', error);
      return null;
    }
  }

  calculateSimilarity(str1, str2) {
    const words1 = str1.split(' ').filter(word => word.length > 2);
    const words2 = str2.split(' ').filter(word => word.length > 2);
    let matches = 0;

    for (const word1 of words1) {
      for (const word2 of words2) {
        if (word1.includes(word2) || word2.includes(word1) || 
            this.levenshteinDistance(word1, word2) <= 2) {
          matches++;
          break;
        }
      }
    }

    return matches / Math.max(words1.length, words2.length);
  }

  levenshteinDistance(str1, str2) {
    const matrix = [];
    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }
    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }
    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }
    return matrix[str2.length][str1.length];
  }

  isGreeting(message) {
    const greetings = ['hello', 'hi', 'hey', 'good morning', 'good afternoon', 'good evening', 'greetings'];
    return greetings.some(greeting => message.toLowerCase().includes(greeting));
  }

  isGoodbye(message) {
    const goodbyes = ['bye', 'goodbye', 'see you', 'farewell', 'thank you', 'thanks'];
    return goodbyes.some(goodbye => message.toLowerCase().includes(goodbye));
  }

  getRandomDefaultResponse() {
    return this.defaultResponses[Math.floor(Math.random() * this.defaultResponses.length)];
  }
}

const chatbotService = new ChatbotService();

const ChatController = {
  // Start a new chat session
  startChat: async (req, res) => {
    try {
      const { clientName, clientEmail } = req.body;
      const sessionId = `chat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      const session = await ChatSession.create({
        sessionId,
        clientName: clientName || 'Anonymous',
        clientEmail: clientEmail || null,
        status: 'active'
      });

      // Send welcome message
      await ChatMessage.create({
        sessionId,
        message: "Hello! Welcome to our support chat. How can I help you today?",
        senderType: 'bot'
      });

      res.json({
        success: true,
        sessionId,
        message: "Chat session started successfully"
      });
    } catch (error) {
      console.error('Start chat error:', error);
      res.status(500).json({ error: 'Failed to start chat session' });
    }
  },

  // Send message from client
  sendMessage: async (req, res) => {
    try {
      const { sessionId, message } = req.body;

      if (!sessionId || !message) {
        return res.status(400).json({ error: 'SessionId and message are required' });
      }

      // Save client message
      await ChatMessage.create({
        sessionId,
        message,
        senderType: 'client'
      });

      // Update session last activity
      await ChatSession.update(
        { lastActivity: new Date() },
        { where: { sessionId } }
      );

      // Check if there's an available admin
      const availableAdmin = await AdminAvailability.findOne({
        where: {
          isOnline: true,
          currentChatCount: { [Op.lt]: sequelize.col('maxConcurrentChats') }
        }
      });

      let response = '';
      let senderType = 'bot';

      if (availableAdmin) {
        // Assign to admin if available
        await ChatSession.update(
          { assignedAdmin: availableAdmin.adminId },
          { where: { sessionId } }
        );
        
        await AdminAvailability.update(
          { currentChatCount: sequelize.literal('currentChatCount + 1') },
          { where: { adminId: availableAdmin.adminId } }
        );

        response = "I've connected you with one of our support agents. They'll be with you shortly!";
      } else {
        // Use bot response
        if (chatbotService.isGreeting(message)) {
          response = "Hello! Thank you for contacting us. How can I assist you today?";
        } else if (chatbotService.isGoodbye(message)) {
          response = "Thank you for using our chat service. Have a great day!";
          await ChatSession.update({ status: 'closed' }, { where: { sessionId } });
        } else {
          // Try to find FAQ match
          const faqMatch = await chatbotService.findBestMatch(message);
          if (faqMatch) {
            response = faqMatch.answer;
          } else {
            response = chatbotService.getRandomDefaultResponse();
          }
        }
      }

      // Save bot response
      const botMessage = await ChatMessage.create({
        sessionId,
        message: response,
        senderType,
        senderId: availableAdmin ? availableAdmin.adminId : null
      });

      res.json({
        success: true,
        message: response,
        timestamp: botMessage.createdAt,
        assignedToAdmin: !!availableAdmin
      });

    } catch (error) {
      console.error('Send message error:', error);
      res.status(500).json({ error: 'Failed to send message' });
    }
  },

  // Admin send message
  adminSendMessage: async (req, res) => {
    try {
      const { sessionId, message, adminId } = req.body;

      if (!sessionId || !message || !adminId) {
        return res.status(400).json({ error: 'SessionId, message, and adminId are required' });
      }

      const adminMessage = await ChatMessage.create({
        sessionId,
        message,
        senderType: 'admin',
        senderId: adminId
      });

      await ChatSession.update(
        { lastActivity: new Date() },
        { where: { sessionId } }
      );

      res.json({
        success: true,
        message: 'Message sent successfully',
        messageData: adminMessage
      });

    } catch (error) {
      console.error('Admin send message error:', error);
      res.status(500).json({ error: 'Failed to send admin message' });
    }
  },

  // Get chat history
  getChatHistory: async (req, res) => {
    try {
      const { sessionId } = req.params;

      const messages = await ChatMessage.findAll({
        where: { sessionId },
        order: [['createdAt', 'ASC']]
      });

      const session = await ChatSession.findOne({
        where: { sessionId }
      });

      res.json({
        success: true,
        session,
        messages
      });

    } catch (error) {
      console.error('Get chat history error:', error);
      res.status(500).json({ error: 'Failed to get chat history' });
    }
  },

  // Admin get all active chats
  getActiveSessions: async (req, res) => {
    try {
      const { adminId } = req.params;

      const sessions = await ChatSession.findAll({
        where: {
          status: 'active',
          assignedAdmin: adminId || null
        },
        include: [{
          model: ChatMessage,
          order: [['createdAt', 'DESC']],
          limit: 1
        }],
        order: [['lastActivity', 'DESC']]
      });

      res.json({
        success: true,
        sessions
      });

    } catch (error) {
      console.error('Get active sessions error:', error);
      res.status(500).json({ error: 'Failed to get active sessions' });
    }
  },

  // Update admin availability
  updateAdminAvailability: async (req, res) => {
    try {
      const { adminId } = req.params;
      const { isOnline, maxConcurrentChats } = req.body;

      const [availability, created] = await AdminAvailability.findOrCreate({
        where: { adminId },
        defaults: {
          isOnline: isOnline || false,
          maxConcurrentChats: maxConcurrentChats || 5,
          lastSeen: new Date()
        }
      });

      if (!created) {
        await availability.update({
          isOnline: isOnline !== undefined ? isOnline : availability.isOnline,
          maxConcurrentChats: maxConcurrentChats || availability.maxConcurrentChats,
          lastSeen: new Date()
        });
      }

      res.json({
        success: true,
        availability
      });

    } catch (error) {
      console.error('Update admin availability error:', error);
      res.status(500).json({ error: 'Failed to update availability' });
    }
  },

  // Close chat session
  closeChat: async (req, res) => {
    try {
      const { sessionId } = req.params;

      await ChatSession.update(
        { status: 'closed' },
        { where: { sessionId } }
      );

      // Update admin chat count
      const session = await ChatSession.findOne({ where: { sessionId } });
      if (session && session.assignedAdmin) {
        await AdminAvailability.update(
          { currentChatCount: sequelize.literal('currentChatCount - 1') },
          { where: { adminId: session.assignedAdmin } }
        );
      }

      res.json({
        success: true,
        message: 'Chat session closed'
      });

    } catch (error) {
      console.error('Close chat error:', error);
      res.status(500).json({ error: 'Failed to close chat' });
    }
  }
};

module.exports = ChatController;