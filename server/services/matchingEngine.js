/**
 * Matching Engine Service
 * TF-IDF based semantic matching between candidate skills and job requirements.
 * Provides explainable match scores without requiring external AI APIs.
 */

/**
 * Calculate TF-IDF similarity between two text documents
 */
function calculateTFIDF(doc1, doc2) {
  const words1 = tokenize(doc1);
  const words2 = tokenize(doc2);

  if (words1.length === 0 || words2.length === 0) return 0;

  // Build term frequency maps
  const tf1 = termFrequency(words1);
  const tf2 = termFrequency(words2);

  // Build combined vocabulary
  const vocab = new Set([...Object.keys(tf1), ...Object.keys(tf2)]);

  // Calculate cosine similarity
  let dotProduct = 0;
  let mag1 = 0;
  let mag2 = 0;

  for (const term of vocab) {
    const v1 = tf1[term] || 0;
    const v2 = tf2[term] || 0;
    dotProduct += v1 * v2;
    mag1 += v1 * v1;
    mag2 += v2 * v2;
  }

  const magnitude = Math.sqrt(mag1) * Math.sqrt(mag2);
  return magnitude === 0 ? 0 : dotProduct / magnitude;
}

/**
 * Calculate skill match between candidate and job
 */
function matchSkills(candidateSkills, jobSkills) {
  if (!jobSkills || jobSkills.length === 0) {
    return { score: 50, matched: [], missing: [] };
  }

  const candidateSkillNames = candidateSkills.map(s => 
    (typeof s === 'string' ? s : s.name).toLowerCase().trim()
  );
  
  const jobSkillNames = jobSkills.map(s => s.toLowerCase().trim());

  const matched = [];
  const missing = [];

  for (const required of jobSkillNames) {
    const isMatched = candidateSkillNames.some(cs => {
      return cs === required || 
             cs.includes(required) || 
             required.includes(cs) ||
             calculateLevenshteinSimilarity(cs, required) > 0.8;
    });

    if (isMatched) {
      matched.push(required);
    } else {
      missing.push(required);
    }
  }

  const score = jobSkillNames.length > 0 
    ? Math.round((matched.length / jobSkillNames.length) * 100) 
    : 50;

  return { score, matched, missing };
}

/**
 * Calculate experience match
 */
function matchExperience(candidateYears, requiredExperience) {
  if (!requiredExperience) return 70;
  
  // Parse required experience string like "3-5 years"
  const match = requiredExperience.match(/(\d+)(?:\s*[-–]\s*(\d+))?\s*(?:years?|yrs?)/i);
  if (!match) return 70;

  const minYears = parseInt(match[1]);
  const maxYears = match[2] ? parseInt(match[2]) : minYears + 2;

  if (candidateYears >= minYears && candidateYears <= maxYears) return 100;
  if (candidateYears > maxYears) return 85; // Overqualified slightly
  if (candidateYears >= minYears - 1) return 70; // Close to minimum
  if (candidateYears >= minYears - 2) return 50;
  return Math.max(20, Math.round((candidateYears / minYears) * 60));
}

/**
 * Calculate education match
 */
function matchEducation(candidateEducation, jobRequirements) {
  if (!candidateEducation || candidateEducation.length === 0) return 40;
  if (!jobRequirements || jobRequirements.length === 0) return 70;

  const levelHierarchy = { 'PhD': 4, 'Master': 3, 'Bachelor': 2, 'Associate': 1 };
  
  const candidateLevel = Math.max(...candidateEducation.map(e => levelHierarchy[e.degree] || 0));
  
  // Check if job requires specific degree
  const requiresPhD = jobRequirements.some(r => /ph\.?d|doctorate/i.test(r));
  const requiresMaster = jobRequirements.some(r => /master|mba|m\.?s/i.test(r));
  const requiresBachelor = jobRequirements.some(r => /bachelor|b\.?s|degree/i.test(r));

  if (requiresPhD) return candidateLevel >= 4 ? 100 : candidateLevel >= 3 ? 60 : 30;
  if (requiresMaster) return candidateLevel >= 3 ? 100 : candidateLevel >= 2 ? 70 : 40;
  if (requiresBachelor) return candidateLevel >= 2 ? 100 : candidateLevel >= 1 ? 60 : 40;

  return candidateLevel >= 2 ? 80 : 60;
}

/**
 * Generate comprehensive match result
 */
function generateMatch(candidate, job) {
  const parsedData = candidate.parsedData || {};
  const candidateSkills = parsedData.skills || [];
  const jobSkills = job.skills || [];
  const jobRequirements = job.requirements || [];

  // Skill matching
  const skillResult = matchSkills(candidateSkills, jobSkills);
  
  // Experience matching
  const expScore = matchExperience(
    parsedData.totalYearsExperience || 0, 
    job.experience
  );

  // Education matching
  const eduScore = matchEducation(parsedData.education, jobRequirements);

  // Text similarity between resume and job description
  const resumeText = [
    parsedData.summary || '',
    candidateSkills.map(s => s.name || s).join(' '),
    (parsedData.experience || []).map(e => `${e.title} ${e.description || ''}`).join(' ')
  ].join(' ');

  const jobText = [
    job.description || '',
    jobSkills.join(' '),
    jobRequirements.join(' ')
  ].join(' ');

  const textSimilarity = Math.round(calculateTFIDF(resumeText, jobText) * 100);

  // Culture fit approximation based on keyword alignment
  const cultureFit = Math.round((textSimilarity * 0.4 + skillResult.score * 0.4 + expScore * 0.2));

  // Weighted overall score
  const overall = Math.round(
    skillResult.score * 0.40 +
    expScore * 0.30 +
    eduScore * 0.15 +
    cultureFit * 0.15
  );

  // Extract relevant keywords
  const keywords = extractKeywords(resumeText, jobText);

  // Generate explanation
  const explanation = generateExplanation(overall, skillResult, expScore, eduScore, candidate, job);

  // Strengths and concerns
  const strengths = [];
  const concerns = [];

  if (skillResult.score >= 70) strengths.push(`Strong skill match (${skillResult.matched.length}/${skillResult.matched.length + skillResult.missing.length} required skills)`);
  if (expScore >= 80) strengths.push(`Experience level aligns well with requirements`);
  if (eduScore >= 80) strengths.push(`Education qualifications meet or exceed requirements`);
  if (textSimilarity >= 60) strengths.push(`Resume content highly relevant to job description`);

  if (skillResult.missing.length > 0) concerns.push(`Missing skills: ${skillResult.missing.slice(0, 5).join(', ')}`);
  if (expScore < 50) concerns.push(`Experience may be below minimum requirements`);
  if (eduScore < 50) concerns.push(`Education level may not meet requirements`);

  return {
    overall: Math.min(100, Math.max(0, overall)),
    skillMatch: skillResult.score,
    experienceMatch: expScore,
    educationMatch: eduScore,
    cultureFit,
    explanation,
    matchedSkills: skillResult.matched,
    missingSkills: skillResult.missing,
    keywords,
    strengths,
    concerns
  };
}

/**
 * Extract important keywords and their relevance
 */
function extractKeywords(resumeText, jobText) {
  const jobWords = tokenize(jobText);
  const resumeWords = new Set(tokenize(resumeText));
  const jobTF = termFrequency(jobWords);

  // Get top job keywords and check if they appear in resume
  return Object.entries(jobTF)
    .filter(([word]) => word.length > 3)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 15)
    .map(([word, freq]) => ({
      word,
      relevance: resumeWords.has(word) ? Math.min(100, Math.round(freq * 100)) : Math.round(freq * 30)
    }));
}

/**
 * Generate human-readable explanation
 */
function generateExplanation(overall, skillResult, expScore, eduScore, candidate, job) {
  const name = candidate.name || 'This candidate';
  const parts = [];

  if (overall >= 80) {
    parts.push(`${name} is an excellent match for the ${job.title} position.`);
  } else if (overall >= 60) {
    parts.push(`${name} is a good match for the ${job.title} position with some gaps to consider.`);
  } else if (overall >= 40) {
    parts.push(`${name} shows moderate alignment with the ${job.title} position requirements.`);
  } else {
    parts.push(`${name} may not be the strongest fit for the ${job.title} position based on current qualifications.`);
  }

  if (skillResult.matched.length > 0) {
    parts.push(`Matched skills include ${skillResult.matched.slice(0, 5).join(', ')}.`);
  }

  if (skillResult.missing.length > 0) {
    parts.push(`Key missing skills: ${skillResult.missing.slice(0, 3).join(', ')}.`);
  }

  if (expScore >= 80) {
    parts.push(`Experience level is well-suited for this role.`);
  } else if (expScore < 50) {
    parts.push(`May need additional experience for this role.`);
  }

  return parts.join(' ');
}

// --- Utility Functions ---

function tokenize(text) {
  return text.toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 2 && !STOP_WORDS.has(w));
}

function termFrequency(words) {
  const tf = {};
  const total = words.length;
  for (const word of words) {
    tf[word] = (tf[word] || 0) + 1;
  }
  // Normalize
  for (const word in tf) {
    tf[word] = tf[word] / total;
  }
  return tf;
}

function calculateLevenshteinSimilarity(s1, s2) {
  if (s1 === s2) return 1;
  const longer = s1.length > s2.length ? s1 : s2;
  const shorter = s1.length > s2.length ? s2 : s1;
  if (longer.length === 0) return 1;
  
  const costs = [];
  for (let i = 0; i <= shorter.length; i++) {
    let lastValue = i;
    for (let j = 0; j <= longer.length; j++) {
      if (i === 0) {
        costs[j] = j;
      } else if (j > 0) {
        let newValue = costs[j - 1];
        if (shorter.charAt(i - 1) !== longer.charAt(j - 1)) {
          newValue = Math.min(Math.min(newValue, lastValue), costs[j]) + 1;
        }
        costs[j - 1] = lastValue;
        lastValue = newValue;
      }
    }
    if (i > 0) costs[longer.length] = lastValue;
  }
  
  return (longer.length - costs[longer.length]) / longer.length;
}

const STOP_WORDS = new Set(['the', 'and', 'for', 'are', 'but', 'not', 'you', 'all', 'can', 'her', 'was', 'one', 'our', 'out', 'day', 'had', 'has', 'his', 'how', 'its', 'may', 'new', 'now', 'old', 'see', 'way', 'who', 'did', 'get', 'let', 'say', 'she', 'too', 'use', 'will', 'with', 'this', 'that', 'have', 'from', 'been', 'were', 'they', 'them', 'their', 'what', 'when', 'make', 'like', 'just', 'over', 'such', 'take', 'than', 'very', 'some', 'into', 'most', 'other', 'about', 'which', 'would', 'there', 'could', 'should', 'these', 'also', 'work', 'able', 'well', 'more', 'each', 'years', 'year', 'using', 'including', 'working', 'role', 'team']);

module.exports = { generateMatch, matchSkills, matchExperience, matchEducation, calculateTFIDF };
