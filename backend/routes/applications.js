const express = require('express');
const router = express.Router();
const Application = require('../models/Application');

// Submit application
router.post('/', async (req, res) => {
  try {
    const { studentId, clubId, hiringId, hiringTitle, message } = req.body;

    const existingApplication = await Application.findOne({
      student: studentId,
      club: clubId,
      hiringId
    });

    if (existingApplication) {
      return res.status(400).json({ message: 'Already applied to this position' });
    }

    const application = new Application({
      student: studentId,
      club: clubId,
      hiringId,
      hiringTitle,
      message
    });

    await application.save();
    
    const populatedApp = await Application.findById(application._id)
      .populate('student', 'name registerNumber skills bio')
      .populate('club', 'name');

    res.status(201).json(populatedApp);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get applications for a club
router.get('/club/:clubId', async (req, res) => {
  try {
    const applications = await Application.find({ club: req.params.clubId })
      .populate('student', 'name registerNumber skills bio email phone')
      .sort({ appliedAt: -1 });

    res.json(applications);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get applications by a student
router.get('/student/:studentId', async (req, res) => {
  try {
    const applications = await Application.find({ student: req.params.studentId })
      .populate('club', 'name clubDescription')
      .sort({ appliedAt: -1 });

    res.json(applications);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update application status
router.put('/:id', async (req, res) => {
  try {
    const { status } = req.body;
    
    const application = await Application.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    )
    .populate('student', 'name registerNumber')
    .populate('club', 'name');

    res.json(application);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
