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
    origin: "http://localhost:3000",
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

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/messages', require('./routes/messages'));
app.use('/api/clubs', require('./routes/clubs'));
app.use('/api/applications', require('./routes/applications'));
app.use('/api/bot', require('./routes/bot'));

// Socket.IO for real-time chat
const User = require('./models/User');

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('user-online', async (userId) => {
    try {
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
    const Message = require('./models/Message');
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

      io.to(data.receiverId).emit('receive-message', populatedMessage);
      io.to(data.senderId).emit('message-sent', populatedMessage);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  });

  socket.on('disconnect', async () => {
    console.log('User disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
