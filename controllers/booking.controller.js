// controllers/booking.controller.js
const { Booking, MealItem } = require('../models');

const createBooking = async (req, res) => {
  const { vehicleNumber, serviceDate, timeSlot, mealOption, mealItems } = req.body;
  const userId = req.user.id;

  try {
    // Create booking
    const booking = await Booking.create({
      vehicleNumber,
      serviceDate,
      timeSlot,
      mealOption,
      userId
    });

    // Save meal items only if mealOption is not "none"
    if (mealOption !== 'none' && Array.isArray(mealItems)) {
      const meals = mealItems.map((item) => ({
        itemName: item.itemName,
        quantity: item.quantity,
        bookingId: booking.id
      }));
      await MealItem.bulkCreate(meals);
    }

    res.status(201).json({ message: 'Booking created successfully', booking });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Make sure to export correctly
module.exports = { createBooking };
