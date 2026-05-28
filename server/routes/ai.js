const express = require('express');
const router = express.Router();
const Candidate = require('../models/Candidate');
const Job = require('../models/Job');
const Application = require('../models/Application');
const { protect } = require('../middleware/auth');
const { parseResume } = require('../services/resumeParser');
const { scoreCandidate, rankCandidates, suggestShortlist, detectDuplicates, generateInsights } = require('../services/scoringEngine');

// POST /api/ai/parse-resume — parse resume text
router.post('/parse-resume', protect, async (req, res) => {
  try {
    const { resumeText, candidateId } = req.body;

    if (!resumeText) {
      return res.status(400).json({ success: false, message: 'Resume text is required' });
    }

    const parsedData = parseResume(resumeText);

    // If candidateId provided, update the candidate
    if (candidateId) {
      await Candidate.findByIdAndUpdate(candidateId, {
        parsedData,
        resumeText
      });
    }

    res.json({
      success: true,
      parsedData,
      message: 'Resume parsed successfully'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/ai/match/:jobId — match candidates to a job
router.post('/match/:jobId', protect, async (req, res) => {
  try {
    const job = await Job.findById(req.params.jobId);
    if (!job) return res.status(404).json({ success: false, message: 'Job not found' });

    // Get all applications for this job with candidates
    const applications = await Application.find({ job: job._id })
      .populate('candidate');

    const results = [];

    for (const app of applications) {
      if (!app.candidate) continue;

      const score = scoreCandidate(app.candidate, job);

      // Update the application with AI score
      await Application.findByIdAndUpdate(app._id, { aiScore: score });

      results.push({
        applicationId: app._id,
        candidateId: app.candidate._id,
        candidateName: app.candidate.name,
        score
      });
    }

    // Sort by overall score
    results.sort((a, b) => b.score.overall - a.score.overall);

    res.json({
      success: true,
      results,
      totalMatched: results.length
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/ai/score/:applicationId — get/calculate AI score
router.get('/score/:applicationId', protect, async (req, res) => {
  try {
    const application = await Application.findById(req.params.applicationId)
      .populate('candidate')
      .populate('job');

    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    const score = scoreCandidate(application.candidate, application.job);

    // Update the score
    application.aiScore = score;
    await application.save();

    res.json({
      success: true,
      score,
      candidateName: application.candidate.name,
      jobTitle: application.job.title
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/ai/rank/:jobId — rank all candidates for a job
router.post('/rank/:jobId', protect, async (req, res) => {
  try {
    const job = await Job.findById(req.params.jobId);
    if (!job) return res.status(404).json({ success: false, message: 'Job not found' });

    const applications = await Application.find({ job: job._id }).populate('candidate');
    const candidates = applications.map(a => a.candidate).filter(Boolean);

    const ranked = rankCandidates(candidates, job);
    const shortlistSuggestion = suggestShortlist(ranked);

    // Update application scores
    for (const item of ranked) {
      const app = applications.find(a => 
        a.candidate && a.candidate._id.toString() === item.candidate._id.toString()
      );
      if (app) {
        await Application.findByIdAndUpdate(app._id, { aiScore: item.score });
      }
    }

    res.json({
      success: true,
      rankings: ranked.map(r => ({
        rank: r.rank,
        candidateId: r.candidate._id,
        candidateName: r.candidate.name,
        score: r.score,
        recommendation: r.recommendation
      })),
      shortlistSuggestion
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/ai/insights/:candidateId — resume insights
router.get('/insights/:candidateId', protect, async (req, res) => {
  try {
    const candidate = await Candidate.findById(req.params.candidateId);
    if (!candidate) {
      return res.status(404).json({ success: false, message: 'Candidate not found' });
    }

    const insights = generateInsights(candidate);

    res.json({
      success: true,
      candidateName: candidate.name,
      insights
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/ai/detect-duplicates — check for duplicates
router.post('/detect-duplicates', protect, async (req, res) => {
  try {
    const candidates = await Candidate.find().select('name email phone');
    const duplicates = detectDuplicates(candidates);

    // Mark duplicates in database
    for (const dup of duplicates) {
      await Candidate.findByIdAndUpdate(dup.candidate, {
        isDuplicate: true,
        duplicateOf: dup.duplicateOf
      });
    }

    res.json({
      success: true,
      duplicates,
      totalChecked: candidates.length,
      duplicatesFound: duplicates.length
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
