const express = require('express');
const router = express.Router();
const User = require('../models/User');

// Search users
router.get('/search', async (req, res) => {
  try {
    const { query } = req.query;
    
    if (!query) {
      return res.json([]);
    }

    const searchRegex = new RegExp(query, 'i');
    
    const users = await User.find({
      userType: 'student',
      $or: [
        { name: searchRegex },
        { registerNumber: searchRegex },
        { skills: searchRegex }
      ]
    }).select('-password').limit(20);

    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get user by ID
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update user profile
router.put('/:id', async (req, res) => {
  try {
    const updates = req.body;
    delete updates.password;
    delete updates.registerNumber;
    delete updates.userType;

    const user = await User.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true }
    ).select('-password');

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get all students (for browsing)
router.get('/', async (req, res) => {
  try {
    const users = await User.find({ userType: 'student' })
      .select('-password')
      .limit(50);
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
