/**
 * Scoring Engine Service
 * Multi-factor candidate scoring with explainable AI recommendations.
 * Provides ranking, shortlisting suggestions, and duplicate detection.
 */

const { generateMatch } = require('./matchingEngine');

/**
 * Score a single candidate against a job
 */
function scoreCandidate(candidate, job) {
  return generateMatch(candidate, job);
}

/**
 * Rank multiple candidates for a job
 */
function rankCandidates(candidates, job) {
  const scored = candidates.map(candidate => ({
    candidate,
    score: scoreCandidate(candidate, job)
  }));

  // Sort by overall score descending
  scored.sort((a, b) => b.score.overall - a.score.overall);

  // Assign rank
  return scored.map((item, index) => ({
    ...item,
    rank: index + 1,
    recommendation: getRecommendation(item.score.overall, index, scored.length)
  }));
}

/**
 * Get recommendation text based on score and rank
 */
function getRecommendation(score, rank, totalCandidates) {
  if (score >= 85) return 'Highly Recommended — Strong match across all criteria';
  if (score >= 70) return 'Recommended — Good fit with minor gaps';
  if (score >= 55) return 'Consider — Moderate match, may require further evaluation';
  if (score >= 40) return 'Below Average — Significant gaps in requirements';
  return 'Not Recommended — Poor alignment with job requirements';
}

/**
 * Generate smart shortlist suggestions
 */
function suggestShortlist(rankedCandidates, maxShortlist = 10) {
  const shortlist = [];
  const reasons = [];

  for (const item of rankedCandidates) {
    if (shortlist.length >= maxShortlist) break;

    const score = item.score;
    
    // Auto-shortlist criteria
    if (score.overall >= 65) {
      shortlist.push(item);
      
      const reasonParts = [];
      if (score.skillMatch >= 70) reasonParts.push('strong skill match');
      if (score.experienceMatch >= 80) reasonParts.push('relevant experience');
      if (score.educationMatch >= 80) reasonParts.push('qualified education');
      
      reasons.push({
        candidateId: item.candidate._id,
        reason: reasonParts.length > 0 
          ? `Shortlisted for: ${reasonParts.join(', ')}` 
          : 'Meets minimum qualification threshold'
      });
    }
  }

  return {
    shortlist,
    reasons,
    totalEvaluated: rankedCandidates.length,
    shortlistedCount: shortlist.length,
    summary: `${shortlist.length} of ${rankedCandidates.length} candidates recommended for shortlisting`
  };
}

/**
 * Detect duplicate candidates using fuzzy matching
 */
function detectDuplicates(candidates) {
  const duplicates = [];
  const seen = new Map();

  for (const candidate of candidates) {
    const normalizedEmail = (candidate.email || '').toLowerCase().trim();
    const normalizedName = (candidate.name || '').toLowerCase().trim().replace(/\s+/g, ' ');
    const normalizedPhone = (candidate.phone || '').replace(/[\s\-\(\)\.]/g, '');

    // Check email match
    if (normalizedEmail && seen.has(`email:${normalizedEmail}`)) {
      duplicates.push({
        candidate: candidate._id,
        duplicateOf: seen.get(`email:${normalizedEmail}`),
        matchType: 'email',
        confidence: 100
      });
      continue;
    }

    // Check phone match
    if (normalizedPhone && normalizedPhone.length >= 10 && seen.has(`phone:${normalizedPhone}`)) {
      duplicates.push({
        candidate: candidate._id,
        duplicateOf: seen.get(`phone:${normalizedPhone}`),
        matchType: 'phone',
        confidence: 95
      });
      continue;
    }

    // Check name similarity (fuzzy)
    for (const [key, existingId] of seen.entries()) {
      if (key.startsWith('name:')) {
        const existingName = key.replace('name:', '');
        const similarity = calculateNameSimilarity(normalizedName, existingName);
        if (similarity > 0.9) {
          duplicates.push({
            candidate: candidate._id,
            duplicateOf: existingId,
            matchType: 'name',
            confidence: Math.round(similarity * 100)
          });
          break;
        }
      }
    }

    // Store for future comparisons
    if (normalizedEmail) seen.set(`email:${normalizedEmail}`, candidate._id);
    if (normalizedPhone) seen.set(`phone:${normalizedPhone}`, candidate._id);
    if (normalizedName) seen.set(`name:${normalizedName}`, candidate._id);
  }

  return duplicates;
}

/**
 * Calculate name similarity using Jaccard index on character bigrams
 */
function calculateNameSimilarity(name1, name2) {
  if (name1 === name2) return 1;
  if (!name1 || !name2) return 0;

  const bigrams1 = new Set();
  const bigrams2 = new Set();

  for (let i = 0; i < name1.length - 1; i++) bigrams1.add(name1.slice(i, i + 2));
  for (let i = 0; i < name2.length - 1; i++) bigrams2.add(name2.slice(i, i + 2));

  const intersection = new Set([...bigrams1].filter(x => bigrams2.has(x)));
  const union = new Set([...bigrams1, ...bigrams2]);

  return union.size === 0 ? 0 : intersection.size / union.size;
}

/**
 * Generate resume insights
 */
function generateInsights(candidate) {
  const parsedData = candidate.parsedData || {};
  const insights = {
    strengths: [],
    improvements: [],
    keyMetrics: {},
    skillDistribution: {}
  };

  const skills = parsedData.skills || [];
  const experience = parsedData.experience || [];
  const education = parsedData.education || [];

  // Key metrics
  insights.keyMetrics = {
    totalSkills: skills.length,
    totalExperience: parsedData.totalYearsExperience || 0,
    totalPositions: experience.length,
    educationLevel: education.length > 0 ? education[0].degree : 'Unknown',
    certifications: (parsedData.certifications || []).length,
    languages: (parsedData.languages || []).length
  };

  // Skill distribution by category
  const { ALL_SKILLS } = require('./resumeParser');
  const distribution = {};
  for (const skill of skills) {
    const name = (skill.name || skill).toLowerCase();
    const category = ALL_SKILLS[name] || 'other';
    distribution[category] = (distribution[category] || 0) + 1;
  }
  insights.skillDistribution = distribution;

  // Strengths
  if (skills.length >= 10) insights.strengths.push('Diverse skill set with broad technical coverage');
  if (skills.filter(s => s.level === 'expert' || s.level === 'advanced').length >= 3) {
    insights.strengths.push('Multiple advanced/expert-level skills');
  }
  if ((parsedData.totalYearsExperience || 0) >= 5) {
    insights.strengths.push('Significant professional experience');
  }
  if (experience.length >= 3) {
    insights.strengths.push('Proven career progression across multiple roles');
  }
  if ((parsedData.certifications || []).length > 0) {
    insights.strengths.push('Professional certifications demonstrate commitment to growth');
  }

  // Improvements
  if (skills.length < 5) insights.improvements.push('Limited skills detected — resume may need more detail');
  if (!parsedData.summary) insights.improvements.push('Missing professional summary/objective');
  if (experience.length === 0) insights.improvements.push('No work experience entries detected');
  if (education.length === 0) insights.improvements.push('No education details found');

  return insights;
}

module.exports = {
  scoreCandidate,
  rankCandidates,
  suggestShortlist,
  detectDuplicates,
  generateInsights
};
