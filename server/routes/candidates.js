const express = require('express');
const router = express.Router();
const Candidate = require('../models/Candidate');
const Application = require('../models/Application');
const { protect } = require('../middleware/auth');
const { upload } = require('../middleware/upload');

// GET /api/candidates — list with search/filter
router.get('/', protect, async (req, res) => {
  try {
    const { search, source, tags, page = 1, limit = 20, sort = '-createdAt' } = req.query;

    const query = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { currentTitle: { $regex: search, $options: 'i' } },
        { currentCompany: { $regex: search, $options: 'i' } },
        { 'parsedData.summary': { $regex: search, $options: 'i' } }
      ];
    }
    if (source) query.source = source;
    if (tags) query.tags = { $in: tags.split(',') };

    const total = await Candidate.countDocuments(query);
    const candidates = await Candidate.find(query)
      .select('-resumeText')
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.json({
      success: true,
      candidates,
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

// GET /api/candidates/:id
router.get('/:id', protect, async (req, res) => {
  try {
    const candidate = await Candidate.findById(req.params.id);
    if (!candidate) {
      return res.status(404).json({ success: false, message: 'Candidate not found' });
    }

    // Get all applications for this candidate
    const applications = await Application.find({ candidate: candidate._id })
      .populate('job', 'title department status')
      .sort('-appliedAt');

    res.json({
      success: true,
      candidate,
      applications
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/candidates — add new candidate
router.post('/', protect, upload.single('resume'), async (req, res) => {
  try {
    const candidateData = {
      ...req.body,
      addedBy: req.user._id
    };

    if (req.body.parsedData && typeof req.body.parsedData === 'string') {
      candidateData.parsedData = JSON.parse(req.body.parsedData);
    }

    if (req.body.tags && typeof req.body.tags === 'string') {
      candidateData.tags = req.body.tags.split(',').map(t => t.trim());
    }

    if (req.file) {
      candidateData.resumeUrl = `/uploads/resumes/${req.file.filename}`;
    }

    const candidate = await Candidate.create(candidateData);

    res.status(201).json({ success: true, candidate });
  } catch (error) {
    console.error('Create candidate error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT /api/candidates/:id
router.put('/:id', protect, async (req, res) => {
  try {
    const updateData = { ...req.body };
    
    if (updateData.parsedData && typeof updateData.parsedData === 'string') {
      updateData.parsedData = JSON.parse(updateData.parsedData);
    }

    const candidate = await Candidate.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!candidate) {
      return res.status(404).json({ success: false, message: 'Candidate not found' });
    }

    res.json({ success: true, candidate });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE /api/candidates/:id
router.delete('/:id', protect, async (req, res) => {
  try {
    const candidate = await Candidate.findByIdAndDelete(req.params.id);
    if (!candidate) {
      return res.status(404).json({ success: false, message: 'Candidate not found' });
    }

    await Application.deleteMany({ candidate: req.params.id });

    res.json({ success: true, message: 'Candidate deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
