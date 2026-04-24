const express = require('express');
const router = express.Router();
const Message = require('../models/Message');

// Get all conversations for a user
// IMPORTANT: This route must be defined BEFORE /:userId1/:userId2
// otherwise Express matches "conversations" as userId1
router.get('/conversations/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    const messages = await Message.find({
      $or: [{ sender: userId }, { receiver: userId }]
    })
    .populate('sender', 'name registerNumber userType isOnline')
    .populate('receiver', 'name registerNumber userType isOnline')
    .sort({ createdAt: -1 });

    // Get unique conversations
    const conversationsMap = new Map();
    
    messages.forEach(msg => {
      const otherUser = msg.sender._id.toString() === userId 
        ? msg.receiver 
        : msg.sender;
      
      const otherId = otherUser._id.toString();
      
      if (!conversationsMap.has(otherId)) {
        conversationsMap.set(otherId, {
          user: otherUser,
          lastMessage: msg,
          unreadCount: 0
        });
      }
      
      if (msg.receiver._id.toString() === userId && !msg.read) {
        conversationsMap.get(otherId).unreadCount++;
      }
    });

    const conversations = Array.from(conversationsMap.values());
    res.json(conversations);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Mark messages as read
router.put('/read/:userId1/:userId2', async (req, res) => {
  try {
    const { userId1, userId2 } = req.params;
    
    await Message.updateMany(
      { sender: userId2, receiver: userId1, read: false },
      { read: true }
    );

    res.json({ message: 'Messages marked as read' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get conversation between two users
// This catch-all two-param route must be LAST
router.get('/:userId1/:userId2', async (req, res) => {
  try {
    const { userId1, userId2 } = req.params;
    
    const messages = await Message.find({
      $or: [
        { sender: userId1, receiver: userId2 },
        { sender: userId2, receiver: userId1 }
      ]
    })
    .populate('sender', 'name registerNumber userType')
    .populate('receiver', 'name registerNumber userType')
    .sort({ createdAt: 1 });

    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
