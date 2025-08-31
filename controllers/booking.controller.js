const { Booking } = require('../models');

/**
 * Create a new booking
 */
const createBooking = async (req, res) => {
  const {
    vehicleNumber,
    serviceDate,
    timeSlot,
    mealOption,
    mealItemName,
    mealQuantity,
    servicePackageId,  // Also missing this
    email              // Add this
  } = req.body;
  const userId = req.user?.id;

  if (!userId) {
    return res.status(401).json({ message: 'Unauthorized. Please login.' });
  }

  try {
    const booking = await Booking.create({
      vehicleNumber,
      serviceDate,
      timeSlot,
      mealOption,
      mealItemName: mealOption !== 'none' ? mealItemName : null,
      mealQuantity: mealOption !== 'none' ? mealQuantity : null,
      servicePackageId,  // Add this
      email,             // Add this
      userId
    });

    res.status(201).json({ message: 'Booking created successfully', booking });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * Update booking by ID
 */
const updateBooking = async (req, res) => {
  const { id } = req.params;
  const {
    vehicleNumber,
    serviceDate,
    timeSlot,
    mealOption,
    mealItemName,
    mealQuantity
  } = req.body;

  try {
    const bookingToUpdate = await Booking.findByPk(id);

    if (!bookingToUpdate) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (req.user?.id !== bookingToUpdate.userId) {
      return res.status(403).json({ message: 'Forbidden. You cannot update this booking.' });
    }

    await bookingToUpdate.update({
      vehicleNumber,
      serviceDate,
      timeSlot,
      mealOption,
      mealItemName: mealOption !== 'none' ? mealItemName : null,
      mealQuantity: mealOption !== 'none' ? mealQuantity : null
    });

    res.status(200).json({
      message: 'Booking updated successfully',
      booking: bookingToUpdate
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Get all bookings
 */
const getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.findAll();
    res.status(200).json(bookings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Get booking by ID
 */
const getBookingById = async (req, res) => {
  const { id } = req.params;
  try {
    const booking = await Booking.findByPk(id);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    if (req.user?.id !== booking.userId) {
      return res.status(403).json({ message: 'Forbidden. You cannot access this booking.' });
    }
    res.status(200).json({
      message: 'Booking retrieved successfully',
      data: booking
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Update booking status
 */
const updateBookingStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  try {
    const booking = await Booking.findByPk(id);     
    if (!booking) { 
      return res.status(404).json({ message: 'Booking not found' });  
    }   
    await booking.update({ status });
    res.status(200).json({
      message: 'Booking status updated successfully',
      data: booking
    });
  } 
  catch (error) {
    res.status(500).json({ error: error.message });
  } 
};

/**
 * Booking statistics
 */
const getBookingStats = async (req, res) => {
  try {
    const totalBookings = await Booking.count();
    const booked = await Booking.count({ where: { status: 'booked' } });
    const inProgress = await Booking.count({ where: { status: 'in-progress' } });
    const completed = await Booking.count({ where: { status: 'completed' } });
    const cancelled = await Booking.count({ where: { status: 'cancelled' } });

    res.status(200).json({
      totalBookings,
      booked,
      inProgress,
      completed,
      cancelled
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { 
  createBooking, 
  updateBooking, 
  getAllBookings, 
  getBookingById, 
  updateBookingStatus,
  getBookingStats
};
