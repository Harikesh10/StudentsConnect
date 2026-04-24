require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// Root health check
app.get('/', (req, res) => {
  res.json({ status: 'ok', message: 'Sathyabama Connect API is running' });
});

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/messages', require('./routes/messages'));
app.use('/api/clubs', require('./routes/clubs'));
app.use('/api/applications', require('./routes/applications'));
// Bot is now handled by the Python chatbot server (backend/chatbot/app.py) on port 5001

// Socket.IO for real-time chat
const User = require('./models/User');
const Message = require('./models/Message');

// Track connected users: { userId: socketId }
const onlineUsers = new Map();

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('user-online', async (userId) => {
    try {
      onlineUsers.set(userId, socket.id);
      socket.userId = userId; // Store userId on socket for disconnect
      await User.findByIdAndUpdate(userId, { isOnline: true, lastSeen: new Date() });
      io.emit('user-status-change', { userId, isOnline: true });
    } catch (error) {
      console.error('Error updating user status:', error);
    }
  });

  socket.on('join-chat', (userId) => {
    socket.join(userId);
  });

  socket.on('send-message', async (data) => {
    try {
      const message = new Message({
        sender: data.senderId,
        receiver: data.receiverId,
        content: data.content
      });
      await message.save();

      const populatedMessage = await Message.findById(message._id)
        .populate('sender', 'name registerNumber userType')
        .populate('receiver', 'name registerNumber userType');

      // Send to receiver
      io.to(data.receiverId).emit('receive-message', populatedMessage);
      // Send confirmation back to sender
      io.to(data.senderId).emit('message-sent', populatedMessage);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  });

  // Typing indicators
  socket.on('typing', (data) => {
    io.to(data.receiverId).emit('user-typing', { senderId: data.senderId });
  });

  socket.on('stop-typing', (data) => {
    io.to(data.receiverId).emit('user-stop-typing', { senderId: data.senderId });
  });

  socket.on('disconnect', async () => {
    console.log('User disconnected:', socket.id);
    const userId = socket.userId;
    if (userId) {
      onlineUsers.delete(userId);
      try {
        await User.findByIdAndUpdate(userId, { isOnline: false, lastSeen: new Date() });
        io.emit('user-status-change', { userId, isOnline: false });
      } catch (error) {
        console.error('Error updating user status on disconnect:', error);
      }
    }
  });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
