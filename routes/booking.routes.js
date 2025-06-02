// routes/booking.routes.js
const express = require('express');
const router = express.Router();

const { createBooking } = require('../controllers/booking.controller');
const authenticate = require('../middlewares/auth.middleware'); // ✅ Import this

router.post('/', authenticate, createBooking); // ✅ Apply middleware here

module.exports = router;
