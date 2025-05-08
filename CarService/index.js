require('dotenv').config(); // very first line
const express = require('express');
const { connectDB } = require('./config/database');
const { sequelize } = require('./models');
const authRoutes = require('./routes/auth.routes');
const bookingRoutes = require('./routes/booking.routes');

sequelize.sync({ alter: true }); // or { force: true } to reset tables


const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(express.json());

// Routes
app.get('/', (req, res) => {
  res.send('Hello from Node.js with Sequelize!');
});
app.use('/api/auth', authRoutes);
app.use('/api/booking', bookingRoutes);



// Connect Database
connectDB();

// Start server
app.listen(port, () => {
  console.log(`🚀 Server running on http://localhost:${port}`);
});
