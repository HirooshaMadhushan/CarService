// routes/clientMessage.routes.js
const express = require('express');
const router = express.Router();
const {
  createClientMessage,
  updateClientMessage,
  getAllClientMessages,
  getClientMessageById,
  deleteClientMessage
} = require('../controllers/review.controller');
const authenticate = require('../middlewares/auth.middleware'); // optional for protected routes

// Create a new client message
router.post('/',createClientMessage);

// Update a client message by ID
router.put('/:id',updateClientMessage);

// Get all client messages
router.get('/', getAllClientMessages);

// Get a client message by ID
router.get('/:id', getClientMessageById);

// Delete a client message by ID
router.delete('/:id', deleteClientMessage);

module.exports = router;
