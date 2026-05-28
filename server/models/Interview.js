const mongoose = require('mongoose');

const interviewSchema = new mongoose.Schema({
  application: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Application',
    required: true
  },
  job: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job',
    required: true
  },
  candidate: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Candidate',
    required: true
  },
  interviewers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  interviewerNames: [{ type: String }],
  scheduledAt: {
    type: Date,
    required: [true, 'Interview date/time is required']
  },
  duration: {
    type: Number,
    default: 60, // minutes
    min: 15,
    max: 480
  },
  type: {
    type: String,
    enum: ['phone', 'video', 'onsite', 'technical', 'panel', 'hr'],
    default: 'video'
  },
  status: {
    type: String,
    enum: ['scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled', 'rescheduled', 'no_show'],
    default: 'scheduled'
  },
  meetingLink: {
    type: String,
    default: ''
  },
  location: {
    type: String,
    default: ''
  },
  feedback: {
    type: String,
    default: ''
  },
  rating: {
    type: Number,
    min: 1,
    max: 5,
    default: null
  },
  notes: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

interviewSchema.index({ scheduledAt: 1 });
interviewSchema.index({ status: 1 });

module.exports = mongoose.model('Interview', interviewSchema);
