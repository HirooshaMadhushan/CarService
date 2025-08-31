require('dotenv').config(); // very first line
const express = require('express');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
const { connectDB } = require('./config/database');
const { sequelize } = require('./models');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./swagger'); // adjust path if needed

const contactRouter = require('./routes/contact.router');
const authRoutes = require('./routes/auth.routes');
const bookingRoutes = require('./routes/booking.routes');
const packageRoutes = require('./routes/package.routes');
const reviewRoutes = require('./routes/review.routes');
const chatRoutes = require('./routes/chat.routes'); // Add chat routes
const userRoutes = require("./routes/user.routes");

const SocketHandler = require('./socket/socketHandler'); // Socket.IO handler

// Sync database
sequelize.sync(); // or { force: true } to reset tables

const app = express();
const server = http.createServer(app);
const port = process.env.PORT || 3000;

// ✅ Allow multiple frontend URLs
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174'
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true, // if you want to allow cookies/session
}));

// Socket.IO setup with CORS
const io = socketIo(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Initialize Socket.IO handler
const socketHandler = new SocketHandler(io);

// Make io and socketHandler available to routes
app.set('io', io);
app.set('socketHandler', socketHandler);

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Middleware
app.use(express.json());

// Routes
app.get('/', (req, res) => {
  res.send('Hello from Node.js with Sequelize and Socket.IO Chat!');
});

app.use('/api/auth', authRoutes);
app.use('/api/booking', bookingRoutes);
app.use('/api/package', packageRoutes);
app.use('/api/contact', contactRouter);
app.use('/api/review', reviewRoutes);
app.use('/api/chat', chatRoutes); // Add chat routes
app.use("/api/users", userRoutes);

// Real-time status endpoint
app.get('/api/chat/status', (req, res) => {
  res.json({
    success: true,
    status: {
      connectedClients: socketHandler.getConnectedClientsCount(),
      connectedAdmins: socketHandler.getConnectedAdminsCount(),
      serverTime: new Date().toISOString()
    }
  });
});

// Connect Database
connectDB();

// Start server
server.listen(port, () => {
  console.log(`🚀 Server running on http://localhost:${port}`);
  console.log(`📡 Socket.IO enabled for real-time chat`);
});