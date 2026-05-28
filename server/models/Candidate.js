const mongoose = require('mongoose');

const candidateSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Candidate name is required'],
    trim: true,
    maxlength: 150
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    lowercase: true,
    trim: true
  },
  phone: {
    type: String,
    default: ''
  },
  location: {
    type: String,
    default: ''
  },
  currentTitle: {
    type: String,
    default: ''
  },
  currentCompany: {
    type: String,
    default: ''
  },
  resumeUrl: {
    type: String,
    default: ''
  },
  resumeText: {
    type: String,
    default: ''
  },
  parsedData: {
    summary: { type: String, default: '' },
    skills: [{
      name: { type: String },
      level: { type: String, enum: ['beginner', 'intermediate', 'advanced', 'expert'], default: 'intermediate' },
      yearsOfExperience: { type: Number, default: 0 }
    }],
    experience: [{
      title: { type: String },
      company: { type: String },
      duration: { type: String },
      startDate: { type: String },
      endDate: { type: String },
      description: { type: String }
    }],
    education: [{
      degree: { type: String },
      institution: { type: String },
      year: { type: String },
      field: { type: String }
    }],
    certifications: [{ type: String }],
    languages: [{ type: String }],
    totalYearsExperience: { type: Number, default: 0 }
  },
  source: {
    type: String,
    enum: ['linkedin', 'referral', 'website', 'job_board', 'direct', 'agency', 'other'],
    default: 'website'
  },
  tags: [{ type: String, trim: true }],
  socialLinks: {
    linkedin: { type: String, default: '' },
    github: { type: String, default: '' },
    portfolio: { type: String, default: '' }
  },
  isDuplicate: {
    type: Boolean,
    default: false
  },
  duplicateOf: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Candidate',
    default: null
  },
  addedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Text index for search
candidateSchema.index({ name: 'text', email: 'text', 'parsedData.summary': 'text' });
candidateSchema.index({ email: 1 });

module.exports = mongoose.model('Candidate', candidateSchema);
