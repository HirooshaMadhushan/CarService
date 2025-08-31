// controllers/clientMessage.controller.js
const { ClientMessage } = require('../models');

// Create a new client message
const createClientMessage = async (req, res) => {
  const { clientName, message,rating } = req.body;

  try {
    const newMessage = await ClientMessage.create({ clientName, message,rating });
    res.status(201).json({ message: 'Client message created successfully', data: newMessage });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update a client message (status or content)
const updateClientMessage = async (req, res) => {
  const { id } = req.params;
  const { clientName, message, status } = req.body;

  try {
    const clientMsg = await ClientMessage.findByPk(id);
    if (!clientMsg) return res.status(404).json({ message: 'Client message not found' });

    await clientMsg.update({ clientName, message, status });
    res.status(200).json({ message: 'Client message updated successfully', data: clientMsg });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all client messages
const getAllClientMessages = async (req, res) => {
  try {
    const messages = await ClientMessage.findAll({ order: [['createdAt', 'DESC']] });
    res.status(200).json({ message: 'Client messages retrieved successfully', data: messages });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get a client message by ID
const getClientMessageById = async (req, res) => {
  const { id } = req.params;

  try {
    const clientMsg = await ClientMessage.findByPk(id);
    if (!clientMsg) return res.status(404).json({ message: 'Client message not found' });

    res.status(200).json({ message: 'Client message retrieved successfully', data: clientMsg });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete a client message
const deleteClientMessage = async (req, res) => {
  const { id } = req.params;

  try {
    const clientMsg = await ClientMessage.findByPk(id);
    if (!clientMsg) return res.status(404).json({ message: 'Client message not found' });

    await clientMsg.destroy();
    res.status(200).json({ message: 'Client message deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createClientMessage,
  updateClientMessage,
  getAllClientMessages,
  getClientMessageById,
  deleteClientMessage
};
