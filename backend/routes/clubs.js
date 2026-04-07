const express = require('express');
const router = express.Router();
const User = require('../models/User');

// Get all clubs
router.get('/', async (req, res) => {
  try {
    const clubs = await User.find({ userType: 'club' }).select('-password');
    res.json(clubs);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get club by ID
router.get('/:id', async (req, res) => {
  try {
    const club = await User.findById(req.params.id).select('-password');
    if (!club || club.userType !== 'club') {
      return res.status(404).json({ message: 'Club not found' });
    }
    res.json(club);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Add hiring post
router.post('/:id/hirings', async (req, res) => {
  try {
    const { title, description, requirements } = req.body;
    
    const club = await User.findById(req.params.id);
    if (!club || club.userType !== 'club') {
      return res.status(404).json({ message: 'Club not found' });
    }

    club.hirings.push({
      title,
      description,
      requirements,
      postedDate: new Date(),
      status: 'open'
    });

    await club.save();
    res.json(club);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update hiring status
router.put('/:clubId/hirings/:hiringId', async (req, res) => {
  try {
    const { status } = req.body;
    
    const club = await User.findById(req.params.clubId);
    if (!club || club.userType !== 'club') {
      return res.status(404).json({ message: 'Club not found' });
    }

    const hiring = club.hirings.id(req.params.hiringId);
    if (!hiring) {
      return res.status(404).json({ message: 'Hiring not found' });
    }

    hiring.status = status;
    await club.save();
    res.json(club);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
