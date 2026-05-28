const express = require('express');
const router = express.Router();
const Application = require('../models/Application');
const Job = require('../models/Job');
const Candidate = require('../models/Candidate');
const { protect } = require('../middleware/auth');
const { sendApplicationStatusUpdate } = require('../services/emailService');

// GET /api/applications — list all
router.get('/', protect, async (req, res) => {
  try {
    const { job, stage, isShortlisted, page = 1, limit = 50, sort = '-appliedAt' } = req.query;

    const query = {};
    if (job) query.job = job;
    if (stage) query.stage = stage;
    if (isShortlisted !== undefined) query.isShortlisted = isShortlisted === 'true';

    const total = await Application.countDocuments(query);
    const applications = await Application.find(query)
      .populate('candidate', 'name email phone location currentTitle currentCompany parsedData tags source avatar')
      .populate('job', 'title department status type location')
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.json({
      success: true,
      applications,
      pagination: { total, page: parseInt(page), pages: Math.ceil(total / limit) }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/applications — create application
router.post('/', protect, async (req, res) => {
  try {
    const { job: jobId, candidate: candidateId, stage } = req.body;

    // Verify job and candidate exist
    const job = await Job.findById(jobId);
    if (!job) return res.status(404).json({ success: false, message: 'Job not found' });

    const candidate = await Candidate.findById(candidateId);
    if (!candidate) return res.status(404).json({ success: false, message: 'Candidate not found' });

    // Check for duplicate application
    const existing = await Application.findOne({ job: jobId, candidate: candidateId });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Candidate already applied to this job' });
    }

    const application = await Application.create({
      job: jobId,
      candidate: candidateId,
      stage: stage || 'applied'
    });

    // Increment applicant count
    await Job.findByIdAndUpdate(jobId, { $inc: { applicantCount: 1 } });

    await application.populate('candidate', 'name email phone location currentTitle');
    await application.populate('job', 'title department');

    res.status(201).json({ success: true, application });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT /api/applications/:id/stage — update pipeline stage
router.put('/:id/stage', protect, async (req, res) => {
  try {
    const { stage } = req.body;
    const validStages = ['applied', 'screening', 'interview', 'assessment', 'offer', 'hired', 'rejected'];
    
    if (!validStages.includes(stage)) {
      return res.status(400).json({ success: false, message: `Invalid stage. Valid: ${validStages.join(', ')}` });
    }

    const application = await Application.findByIdAndUpdate(
      req.params.id,
      { stage },
      { new: true }
    ).populate('candidate', 'name email').populate('job', 'title');

    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    // Send status update email
    if (application.candidate && application.candidate.email) {
      sendApplicationStatusUpdate({
        candidateEmail: application.candidate.email,
        candidateName: application.candidate.name,
        jobTitle: application.job.title,
        newStatus: stage
      }).catch(err => console.error('Email error:', err));
    }

    res.json({ success: true, application });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT /api/applications/:id/shortlist
router.put('/:id/shortlist', protect, async (req, res) => {
  try {
    const application = await Application.findById(req.params.id);
    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    application.isShortlisted = !application.isShortlisted;
    await application.save();

    res.json({ success: true, application });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT /api/applications/:id/score — update AI score
router.put('/:id/score', protect, async (req, res) => {
  try {
    const application = await Application.findByIdAndUpdate(
      req.params.id,
      { aiScore: req.body.aiScore },
      { new: true }
    );

    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    res.json({ success: true, application });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/applications/:id/notes — add note
router.post('/:id/notes', protect, async (req, res) => {
  try {
    const application = await Application.findById(req.params.id);
    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    application.notes.push({
      author: req.user._id,
      authorName: req.user.name,
      text: req.body.text
    });

    await application.save();
    res.json({ success: true, application });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
