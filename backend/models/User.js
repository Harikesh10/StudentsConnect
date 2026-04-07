const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  registerNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  userType: {
    type: String,
    enum: ['student', 'faculty', 'club'],
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  // Student specific fields
  skills: [{
    type: String,
    trim: true
  }],
  bio: {
    type: String,
    default: ''
  },
  projects: [{
    title: String,
    description: String,
    link: String
  }],
  // Faculty specific fields
  department: {
    type: String,
    trim: true
  },
  // Club specific fields
  clubDescription: {
    type: String
  },
  clubType: {
    type: String
  },
  hirings: [{
    title: String,
    description: String,
    requirements: String,
    postedDate: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ['open', 'closed'],
      default: 'open'
    }
  }],
  // Common fields
  email: String,
  phone: String,
  isOnline: {
    type: Boolean,
    default: false
  },
  lastSeen: {
    type: Date,
    default: Date.now
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('User', userSchema);
