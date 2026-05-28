const express = require('express');
const router = express.Router();
const Job = require('../models/Job');
const Candidate = require('../models/Candidate');
const Application = require('../models/Application');
const Interview = require('../models/Interview');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

// GET /api/analytics/overview — dashboard KPIs
router.get('/overview', protect, async (req, res) => {
  try {
    const [totalJobs, activeJobs, totalCandidates, totalApplications, totalInterviews, totalUsers] = await Promise.all([
      Job.countDocuments(),
      Job.countDocuments({ status: 'active' }),
      Candidate.countDocuments(),
      Application.countDocuments(),
      Interview.countDocuments(),
      User.countDocuments()
    ]);

    // Pipeline distribution
    const pipelineStats = await Application.aggregate([
      { $group: { _id: '$stage', count: { $sum: 1 } } }
    ]);

    // Recent applications (last 30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const recentApplications = await Application.countDocuments({
      appliedAt: { $gte: thirtyDaysAgo }
    });

    // Shortlisted count
    const shortlisted = await Application.countDocuments({ isShortlisted: true });

    // Hired count
    const hired = await Application.countDocuments({ stage: 'hired' });

    // Avg AI score
    const avgScoreResult = await Application.aggregate([
      { $match: { 'aiScore.overall': { $gt: 0 } } },
      { $group: { _id: null, avgScore: { $avg: '$aiScore.overall' } } }
    ]);
    const avgAiScore = avgScoreResult.length > 0 ? Math.round(avgScoreResult[0].avgScore) : 0;

    // Upcoming interviews
    const upcomingInterviews = await Interview.countDocuments({
      scheduledAt: { $gte: new Date() },
      status: { $in: ['scheduled', 'confirmed'] }
    });

    res.json({
      success: true,
      overview: {
        totalJobs,
        activeJobs,
        totalCandidates,
        totalApplications,
        recentApplications,
        totalInterviews,
        upcomingInterviews,
        shortlisted,
        hired,
        avgAiScore,
        totalUsers,
        pipelineStats: pipelineStats.reduce((acc, curr) => {
          acc[curr._id] = curr.count;
          return acc;
        }, {})
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/analytics/pipeline — pipeline funnel data
router.get('/pipeline', protect, async (req, res) => {
  try {
    const stages = ['applied', 'screening', 'interview', 'assessment', 'offer', 'hired', 'rejected'];
    
    const pipeline = await Application.aggregate([
      { $group: { _id: '$stage', count: { $sum: 1 } } }
    ]);

    const pipelineData = stages.map(stage => ({
      stage,
      count: pipeline.find(p => p._id === stage)?.count || 0,
      label: stage.charAt(0).toUpperCase() + stage.slice(1)
    }));

    // Conversion rates
    const total = pipelineData.reduce((sum, p) => sum + p.count, 0);
    const funnelData = pipelineData.map(p => ({
      ...p,
      percentage: total > 0 ? Math.round((p.count / total) * 100) : 0
    }));

    res.json({ success: true, pipeline: funnelData });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/analytics/hiring-trends — trends over time
router.get('/hiring-trends', protect, async (req, res) => {
  try {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const trends = await Application.aggregate([
      { $match: { appliedAt: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: {
            year: { $year: '$appliedAt' },
            month: { $month: '$appliedAt' }
          },
          applications: { $sum: 1 },
          hired: {
            $sum: { $cond: [{ $eq: ['$stage', 'hired'] }, 1, 0] }
          },
          avgScore: { $avg: '$aiScore.overall' }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const formattedTrends = trends.map(t => ({
      month: `${monthNames[t._id.month - 1]} ${t._id.year}`,
      applications: t.applications,
      hired: t.hired,
      avgScore: Math.round(t.avgScore || 0)
    }));

    res.json({ success: true, trends: formattedTrends });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/analytics/source-effectiveness
router.get('/source-effectiveness', protect, async (req, res) => {
  try {
    const sourceStats = await Candidate.aggregate([
      { $group: { _id: '$source', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // For each source, get hiring rate
    const sourceData = await Promise.all(sourceStats.map(async (source) => {
      const candidates = await Candidate.find({ source: source._id }).select('_id');
      const candidateIds = candidates.map(c => c._id);
      
      const hired = await Application.countDocuments({
        candidate: { $in: candidateIds },
        stage: 'hired'
      });

      const totalApps = await Application.countDocuments({
        candidate: { $in: candidateIds }
      });

      return {
        source: source._id || 'unknown',
        candidates: source.count,
        applications: totalApps,
        hired,
        conversionRate: totalApps > 0 ? Math.round((hired / totalApps) * 100) : 0
      };
    }));

    res.json({ success: true, sources: sourceData });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/analytics/department-stats
router.get('/department-stats', protect, async (req, res) => {
  try {
    const deptStats = await Job.aggregate([
      { $group: { _id: '$department', jobs: { $sum: 1 }, totalApplicants: { $sum: '$applicantCount' } } },
      { $sort: { jobs: -1 } }
    ]);

    res.json({ success: true, departments: deptStats });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
