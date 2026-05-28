const express = require('express');
const router = express.Router();
const Job = require('../models/Job');
const Application = require('../models/Application');
const { protect } = require('../middleware/auth');
const { roleCheck } = require('../middleware/roleCheck');

// GET /api/jobs — list all jobs with filters
router.get('/', protect, async (req, res) => {
  try {
    const { status, department, type, search, page = 1, limit = 20, sort = '-createdAt' } = req.query;

    const query = {};
    if (status) query.status = status;
    if (department) query.department = department;
    if (type) query.type = type;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { department: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const total = await Job.countDocuments(query);
    const jobs = await Job.find(query)
      .populate('postedBy', 'name email avatar')
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.json({
      success: true,
      jobs,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit),
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/jobs/:id
router.get('/:id', protect, async (req, res) => {
  try {
    const job = await Job.findById(req.params.id).populate('postedBy', 'name email avatar');
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }

    // Get applicant count
    const applicantCount = await Application.countDocuments({ job: job._id });

    res.json({
      success: true,
      job: { ...job.toObject(), applicantCount }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/jobs — create job
router.post('/', protect, roleCheck('admin', 'recruiter'), async (req, res) => {
  try {
    const jobData = {
      ...req.body,
      postedBy: req.user._id
    };

    const job = await Job.create(jobData);
    await job.populate('postedBy', 'name email avatar');

    res.status(201).json({ success: true, job });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT /api/jobs/:id
router.put('/:id', protect, roleCheck('admin', 'recruiter'), async (req, res) => {
  try {
    const job = await Job.findByIdAndUpdate(
      req.params.id,
      { ...req.body },
      { new: true, runValidators: true }
    ).populate('postedBy', 'name email avatar');

    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }

    res.json({ success: true, job });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE /api/jobs/:id
router.delete('/:id', protect, roleCheck('admin'), async (req, res) => {
  try {
    const job = await Job.findByIdAndDelete(req.params.id);
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }

    // Also delete related applications
    await Application.deleteMany({ job: req.params.id });

    res.json({ success: true, message: 'Job deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/jobs/:id/applicants
router.get('/:id/applicants', protect, async (req, res) => {
  try {
    const applications = await Application.find({ job: req.params.id })
      .populate('candidate', 'name email phone location currentTitle currentCompany parsedData tags source')
      .sort('-aiScore.overall')
      .lean();

    res.json({ success: true, applications });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
