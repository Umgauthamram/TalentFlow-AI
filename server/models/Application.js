const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
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
  stage: {
    type: String,
    enum: ['applied', 'screening', 'interview', 'assessment', 'offer', 'hired', 'rejected'],
    default: 'applied'
  },
  aiScore: {
    overall: { type: Number, default: 0, min: 0, max: 100 },
    skillMatch: { type: Number, default: 0, min: 0, max: 100 },
    experienceMatch: { type: Number, default: 0, min: 0, max: 100 },
    educationMatch: { type: Number, default: 0, min: 0, max: 100 },
    cultureFit: { type: Number, default: 0, min: 0, max: 100 },
    explanation: { type: String, default: '' },
    matchedSkills: [{ type: String }],
    missingSkills: [{ type: String }],
    keywords: [{
      word: { type: String },
      relevance: { type: Number, min: 0, max: 100 }
    }],
    strengths: [{ type: String }],
    concerns: [{ type: String }]
  },
  notes: [{
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    authorName: { type: String },
    text: { type: String },
    createdAt: { type: Date, default: Date.now }
  }],
  isShortlisted: {
    type: Boolean,
    default: false
  },
  rejectionReason: {
    type: String,
    default: ''
  },
  appliedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Compound index: one application per candidate per job
applicationSchema.index({ job: 1, candidate: 1 }, { unique: true });
applicationSchema.index({ stage: 1 });
applicationSchema.index({ 'aiScore.overall': -1 });

module.exports = mongoose.model('Application', applicationSchema);
