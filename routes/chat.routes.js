const express = require('express');
const ChatController = require('../controllers/chat.controller');
const router = express.Router();
const { FAQ, ResponseTemplate } = require('../models/chat.model');

// Client Routes
router.post('/start', ChatController.startChat);
router.post('/message', ChatController.sendMessage);
router.get('/history/:sessionId', ChatController.getChatHistory);
router.patch('/close/:sessionId', ChatController.closeChat);

// Admin Routes
router.post('/admin/message', ChatController.adminSendMessage);

// FIXED: Handle optional adminId with query param instead of :adminId?
router.get('/admin/sessions', (req, res) => {
  const adminId = req.query.adminId || null;
  return ChatController.getActiveSessions(req, res, adminId);
});

router.put('/admin/availability/:adminId', ChatController.updateAdminAvailability);

// FAQ Management Routes (Admin only)
router.post('/admin/faq', async (req, res) => {
  try {
    const { question, answer, keywords, category, priority } = req.body;
    if (!question || !answer) {
      return res.status(400).json({ error: 'Question and answer are required' });
    }
    const faq = await FAQ.create({
      question,
      answer,
      keywords: keywords || [],
      category: category || 'general',
      priority: priority || 1
    });
    res.json({ success: true, faq });
  } catch (error) {
    console.error('Create FAQ error:', error);
    res.status(500).json({ error: 'Failed to create FAQ' });
  }
});

router.get('/admin/faqs', async (req, res) => {
  try {
    const faqs = await FAQ.findAll({
      order: [['priority', 'DESC'], ['createdAt', 'DESC']]
    });
    res.json({ success: true, faqs });
  } catch (error) {
    console.error('Get FAQs error:', error);
    res.status(500).json({ error: 'Failed to get FAQs' });
  }
});

router.put('/admin/faq/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { question, answer, keywords, category, priority, isActive } = req.body;

    const faq = await FAQ.findByPk(id);
    if (!faq) return res.status(404).json({ error: 'FAQ not found' });

    await faq.update({
      question: question || faq.question,
      answer: answer || faq.answer,
      keywords: keywords || faq.keywords,
      category: category || faq.category,
      priority: priority || faq.priority,
      isActive: isActive !== undefined ? isActive : faq.isActive
    });

    res.json({ success: true, faq });
  } catch (error) {
    console.error('Update FAQ error:', error);
    res.status(500).json({ error: 'Failed to update FAQ' });
  }
});

router.delete('/admin/faq/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const faq = await FAQ.findByPk(id);
    if (!faq) return res.status(404).json({ error: 'FAQ not found' });
    await faq.destroy();
    res.json({ success: true, message: 'FAQ deleted successfully' });
  } catch (error) {
    console.error('Delete FAQ error:', error);
    res.status(500).json({ error: 'Failed to delete FAQ' });
  }
});

// Response Templates Routes (Admin only)
router.post('/admin/templates', async (req, res) => {
  try {
    const { name, content, category } = req.body;
    if (!name || !content) {
      return res.status(400).json({ error: 'Name and content are required' });
    }
    const template = await ResponseTemplate.create({
      name,
      content,
      category: category || 'general'
    });
    res.json({ success: true, template });
  } catch (error) {
    console.error('Create template error:', error);
    res.status(500).json({ error: 'Failed to create template' });
  }
});

router.get('/admin/templates', async (req, res) => {
  try {
    const templates = await ResponseTemplate.findAll({
      where: { isActive: true },
      order: [['name', 'ASC']]
    });
    res.json({ success: true, templates });
  } catch (error) {
    console.error('Get templates error:', error);
    res.status(500).json({ error: 'Failed to get templates' });
  }
});

// Analytics Routes (Admin only)
router.get('/admin/analytics', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const { ChatSession, ChatMessage } = require('../models/chat.model');
    const { Op, fn, col } = require('sequelize');

    let dateFilter = {};
    if (startDate && endDate) {
      dateFilter = {
        createdAt: { [Op.between]: [new Date(startDate), new Date(endDate)] }
      };
    }

    const totalSessions = await ChatSession.count({ where: dateFilter });
    const activeSessions = await ChatSession.count({ where: { ...dateFilter, status: 'active' } });
    const closedSessions = await ChatSession.count({ where: { ...dateFilter, status: 'closed' } });

    const totalMessages = await ChatMessage.count({ where: dateFilter });
    const clientMessages = await ChatMessage.count({ where: { ...dateFilter, senderType: 'client' } });
    const adminMessages = await ChatMessage.count({ where: { ...dateFilter, senderType: 'admin' } });
    const botMessages = await ChatMessage.count({ where: { ...dateFilter, senderType: 'bot' } });

    const avgResponseTime = await ChatMessage.findAll({
      where: { ...dateFilter, senderType: { [Op.in]: ['admin', 'bot'] } },
      attributes: [
        [fn('AVG', fn('TIMESTAMPDIFF', 'SECOND', col('createdAt'), col('updatedAt'))), 'avgTime']
      ]
    });

    res.json({
      success: true,
      analytics: {
        sessions: { total: totalSessions, active: activeSessions, closed: closedSessions },
        messages: { total: totalMessages, client: clientMessages, admin: adminMessages, bot: botMessages },
        avgResponseTime: avgResponseTime[0]?.dataValues?.avgTime || 0
      }
    });
  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({ error: 'Failed to get analytics' });
  }
});

module.exports = router;
