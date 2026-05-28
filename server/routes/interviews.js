const express = require('express');
const router = express.Router();
const Interview = require('../models/Interview');
const Application = require('../models/Application');
const Candidate = require('../models/Candidate');
const { protect } = require('../middleware/auth');
const { sendInterviewScheduled } = require('../services/emailService');

// GET /api/interviews
router.get('/', protect, async (req, res) => {
  try {
    const { status, type, startDate, endDate, page = 1, limit = 50 } = req.query;

    const query = {};
    if (status) query.status = status;
    if (type) query.type = type;
    if (startDate || endDate) {
      query.scheduledAt = {};
      if (startDate) query.scheduledAt.$gte = new Date(startDate);
      if (endDate) query.scheduledAt.$lte = new Date(endDate);
    }

    const total = await Interview.countDocuments(query);
    const interviews = await Interview.find(query)
      .populate('candidate', 'name email phone currentTitle')
      .populate('job', 'title department')
      .populate('interviewers', 'name email')
      .sort('scheduledAt')
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.json({
      success: true,
      interviews,
      pagination: { total, page: parseInt(page), pages: Math.ceil(total / limit) }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/interviews — schedule
router.post('/', protect, async (req, res) => {
  try {
    const interviewData = { ...req.body };
    
    // If application ID is missing, try to find an existing application or create one
    if (!interviewData.application) {
      let app = await Application.findOne({ candidate: interviewData.candidate, job: interviewData.job });
      if (!app) {
        app = await Application.create({
          candidate: interviewData.candidate,
          job: interviewData.job,
          stage: 'interview'
        });
      }
      interviewData.application = app._id;
    }
    
    const interview = await Interview.create(interviewData);

    await interview.populate('candidate', 'name email phone');
    await interview.populate('job', 'title department');
    await interview.populate('interviewers', 'name email');

    // Update application stage to interview
    if (interview.application) {
      await Application.findByIdAndUpdate(interview.application, { stage: 'interview' });
    }

    // Send email notification
    if (interview.candidate && interview.candidate.email) {
      sendInterviewScheduled({
        candidateEmail: interview.candidate.email,
        candidateName: interview.candidate.name,
        jobTitle: interview.job ? interview.job.title : 'Position',
        interviewDate: interview.scheduledAt,
        interviewType: interview.type,
        meetingLink: interview.meetingLink,
        interviewerNames: interview.interviewerNames || []
      }).catch(err => console.error('Interview email error:', err));
    }

    res.status(201).json({ success: true, interview });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT /api/interviews/:id
router.put('/:id', protect, async (req, res) => {
  try {
    const interview = await Interview.findByIdAndUpdate(
      req.params.id,
      { ...req.body },
      { new: true, runValidators: true }
    )
      .populate('candidate', 'name email phone')
      .populate('job', 'title department')
      .populate('interviewers', 'name email');

    if (!interview) {
      return res.status(404).json({ success: false, message: 'Interview not found' });
    }

    res.json({ success: true, interview });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE /api/interviews/:id
router.delete('/:id', protect, async (req, res) => {
  try {
    const interview = await Interview.findByIdAndDelete(req.params.id);
    if (!interview) {
      return res.status(404).json({ success: false, message: 'Interview not found' });
    }
    res.json({ success: true, message: 'Interview cancelled' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
