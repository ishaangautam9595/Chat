require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const chatRoutes = require('./routes/chatRoutes');
const { Server } = require('socket.io');
const http = require('http');


const app = express();
const errorHandler = require('./middleware/errorHandler');
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL,
    methods: ['GET', 'POST']
  }
});


// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api', chatRoutes);

app.set('io', io);

io.on('connection', (socket) => {
  console.log(`New client connected: ${socket.id}`);

  socket.on('joinChat', (chatId) => {
    console.log(`Client ${socket.id} joined room: ${chatId}`);
    socket.join(chatId);
  });

  socket.on('leaveChat', (chatId) => {
    console.log(`Client ${socket.id} left room: ${chatId}`);
    socket.leave(chatId);
  });

  socket.on('disconnect', () => {
    console.log(`Client disconnected: ${socket.id}`);
  });
});

// Error Handler
app.use(errorHandler);

// MongoDB Connection
mongoose.connect("mongodb+srv://ishaangautam959553:hyggex123@chat.o9ys1gm.mongodb.net/?retryWrites=true&w=majority&appName=Chat", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.error('MongoDB connection error:', err));

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
