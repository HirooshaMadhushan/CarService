const express = require('express');
const router = express.Router();
const { 
  createBooking, 
  updateBooking, 
  getAllBookings, 
  getBookingById,
  updateBookingStatus,
  getBookingStats 
} = require('../controllers/booking.controller');
const authenticate = require('../middlewares/auth.middleware');

/**
 * @swagger
 * tags:
 *   name: Booking
 *   description: Booking management
 */

// Create new booking
router.post('/', authenticate, createBooking);

// Update booking by ID
router.put('/:id', authenticate, updateBooking);

// Get all bookings
router.get('/', getAllBookings);

// Get booking by ID
router.get('/:id', getBookingById);

// Update booking status
router.patch('/:id/status', updateBookingStatus);

// ✅ Booking statistics
router.get('/stats/summary', getBookingStats);

module.exports = router;
