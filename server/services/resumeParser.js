/**
 * Resume Parser Service
 * Extracts structured data from resume text using pattern matching and heuristics.
 * Falls back gracefully when no AI API is available.
 */

// Common skill keywords database
const SKILL_DATABASE = {
  programming: ['javascript', 'python', 'java', 'c++', 'c#', 'typescript', 'ruby', 'go', 'rust', 'php', 'swift', 'kotlin', 'scala', 'r', 'matlab', 'perl', 'dart', 'lua'],
  frontend: ['react', 'reactjs', 'react.js', 'angular', 'vue', 'vuejs', 'vue.js', 'svelte', 'next.js', 'nextjs', 'nuxt', 'gatsby', 'html', 'css', 'sass', 'less', 'tailwind', 'bootstrap', 'material-ui', 'chakra', 'redux', 'mobx', 'webpack', 'vite', 'jquery'],
  backend: ['node.js', 'nodejs', 'express', 'express.js', 'django', 'flask', 'fastapi', 'spring', 'spring boot', 'rails', 'laravel', 'asp.net', 'graphql', 'rest', 'restful', 'microservices', 'grpc'],
  database: ['mongodb', 'postgresql', 'mysql', 'redis', 'elasticsearch', 'dynamodb', 'firebase', 'supabase', 'cassandra', 'oracle', 'sql server', 'sqlite', 'neo4j', 'couchdb'],
  cloud: ['aws', 'azure', 'gcp', 'google cloud', 'heroku', 'vercel', 'netlify', 'digitalocean', 'docker', 'kubernetes', 'terraform', 'cloudformation', 'ci/cd', 'jenkins', 'github actions'],
  ai_ml: ['machine learning', 'deep learning', 'tensorflow', 'pytorch', 'keras', 'scikit-learn', 'nlp', 'computer vision', 'openai', 'langchain', 'hugging face', 'pandas', 'numpy'],
  tools: ['git', 'github', 'gitlab', 'bitbucket', 'jira', 'confluence', 'figma', 'sketch', 'postman', 'swagger', 'linux', 'agile', 'scrum', 'kanban'],
  soft_skills: ['leadership', 'communication', 'teamwork', 'problem-solving', 'analytical', 'project management', 'mentoring', 'collaboration']
};

// Flatten skills for quick lookup
const ALL_SKILLS = {};
Object.entries(SKILL_DATABASE).forEach(([category, skills]) => {
  skills.forEach(skill => {
    ALL_SKILLS[skill.toLowerCase()] = category;
  });
});

// Education keywords
const DEGREE_PATTERNS = [
  { pattern: /\b(ph\.?d|doctorate|doctor of philosophy)\b/i, level: 'PhD' },
  { pattern: /\b(m\.?s\.?|master'?s?|mba|m\.?tech|m\.?eng|m\.?sc)\b/i, level: 'Master' },
  { pattern: /\b(b\.?s\.?|bachelor'?s?|b\.?tech|b\.?eng|b\.?sc|b\.?a\.?|b\.?com)\b/i, level: 'Bachelor' },
  { pattern: /\b(associate'?s?|diploma|a\.?s\.?)\b/i, level: 'Associate' }
];

const UNIVERSITY_KEYWORDS = ['university', 'institute', 'college', 'school', 'academy', 'iit', 'nit', 'mit', 'stanford', 'harvard', 'caltech'];

/**
 * Parse resume text into structured data
 */
function parseResume(text) {
  if (!text || typeof text !== 'string') {
    return getEmptyParsedData();
  }

  const cleanText = text.replace(/\r\n/g, '\n').replace(/\t/g, ' ');
  const lines = cleanText.split('\n').map(l => l.trim()).filter(l => l.length > 0);

  const parsed = {
    summary: extractSummary(cleanText, lines),
    skills: extractSkills(cleanText),
    experience: extractExperience(cleanText, lines),
    education: extractEducation(cleanText, lines),
    certifications: extractCertifications(cleanText, lines),
    languages: extractLanguages(cleanText),
    totalYearsExperience: 0
  };

  // Calculate total years
  parsed.totalYearsExperience = calculateTotalExperience(parsed.experience, cleanText);

  return parsed;
}

function getEmptyParsedData() {
  return {
    summary: '',
    skills: [],
    experience: [],
    education: [],
    certifications: [],
    languages: [],
    totalYearsExperience: 0
  };
}

function extractSummary(text, lines) {
  // Look for summary/objective section
  const summaryHeaders = ['summary', 'objective', 'about', 'profile', 'about me', 'professional summary', 'career objective'];
  
  for (let i = 0; i < lines.length; i++) {
    const lower = lines[i].toLowerCase();
    if (summaryHeaders.some(h => lower.includes(h) && lines[i].length < 50)) {
      // Collect next 1-5 lines until another section header
      const summaryLines = [];
      for (let j = i + 1; j < Math.min(i + 6, lines.length); j++) {
        if (isSectionHeader(lines[j])) break;
        if (lines[j].length > 10) summaryLines.push(lines[j]);
      }
      if (summaryLines.length > 0) return summaryLines.join(' ');
    }
  }

  // Fallback: use first meaningful paragraph
  for (const line of lines.slice(0, 10)) {
    if (line.length > 50 && !line.match(/@|phone|address|linkedin/i)) {
      return line;
    }
  }

  return '';
}

function extractSkills(text) {
  const found = [];
  const textLower = text.toLowerCase();

  Object.entries(ALL_SKILLS).forEach(([skill, category]) => {
    // Use word boundary matching for skills
    const escaped = skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`\\b${escaped}\\b`, 'i');
    if (regex.test(textLower)) {
      found.push({
        name: skill.charAt(0).toUpperCase() + skill.slice(1),
        level: guessSkillLevel(textLower, skill),
        yearsOfExperience: guessSkillYears(textLower, skill)
      });
    }
  });

  return found;
}

function guessSkillLevel(text, skill) {
  const escaped = skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  
  // Check for expert-level indicators near the skill
  const expertPattern = new RegExp(`(expert|advanced|senior|lead|principal|architect).*${escaped}|${escaped}.*(expert|advanced|senior|lead)`, 'i');
  if (expertPattern.test(text)) return 'expert';

  const intermediatePattern = new RegExp(`(intermediate|mid|proficient).*${escaped}|${escaped}.*(intermediate|mid|proficient)`, 'i');
  if (intermediatePattern.test(text)) return 'intermediate';

  // Count mentions as a proxy for proficiency
  const mentions = (text.match(new RegExp(escaped, 'gi')) || []).length;
  if (mentions >= 5) return 'expert';
  if (mentions >= 3) return 'advanced';
  if (mentions >= 2) return 'intermediate';
  return 'intermediate';
}

function guessSkillYears(text, skill) {
  const escaped = skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const yearPattern = new RegExp(`(\\d+)\\+?\\s*(?:years?|yrs?)\\s*(?:of\\s*)?(?:experience\\s*(?:in|with)?\\s*)?${escaped}|${escaped}\\s*[-–:]?\\s*(\\d+)\\+?\\s*(?:years?|yrs?)`, 'i');
  const match = text.match(yearPattern);
  if (match) return parseInt(match[1] || match[2]);
  return 0;
}

function extractExperience(text, lines) {
  const experiences = [];
  const expHeaders = ['experience', 'work experience', 'employment', 'professional experience', 'work history', 'career history'];
  
  let inExpSection = false;
  let current = null;

  for (let i = 0; i < lines.length; i++) {
    const lower = lines[i].toLowerCase();

    if (expHeaders.some(h => lower.includes(h) && lines[i].length < 50)) {
      inExpSection = true;
      continue;
    }

    if (inExpSection) {
      // Check if we hit another major section
      if (isSectionHeader(lines[i]) && !expHeaders.some(h => lower.includes(h))) {
        if (current) experiences.push(current);
        break;
      }

      // Detect job title + company pattern
      const titleCompanyMatch = lines[i].match(/^(.+?)(?:\s+(?:at|@|-|–|,|—)\s+)(.+?)$/i);
      const dateMatch = lines[i].match(/((?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s*\d{0,4}\s*[-–]\s*(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s*\d{0,4}|(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s*\d{4}\s*[-–]\s*(?:Present|Current|\d{4})|(?:20|19)\d{2}\s*[-–]\s*(?:Present|Current|(?:20|19)\d{2}))/i);

      if (titleCompanyMatch || dateMatch) {
        if (current) experiences.push(current);
        current = {
          title: titleCompanyMatch ? titleCompanyMatch[1].trim() : lines[i].replace(dateMatch ? dateMatch[0] : '', '').trim(),
          company: titleCompanyMatch ? titleCompanyMatch[2].trim() : '',
          duration: dateMatch ? dateMatch[1].trim() : '',
          startDate: '',
          endDate: '',
          description: ''
        };
      } else if (current && lines[i].length > 10) {
        current.description += (current.description ? ' ' : '') + lines[i];
      }
    }
  }

  if (current) experiences.push(current);

  // If no structured experience found, try generic detection
  if (experiences.length === 0) {
    const genericDatePattern = /(?:20|19)\d{2}\s*[-–]\s*(?:Present|Current|(?:20|19)\d{2})/gi;
    const matches = text.match(genericDatePattern);
    if (matches) {
      matches.slice(0, 5).forEach(match => {
        experiences.push({
          title: 'Position',
          company: '',
          duration: match,
          startDate: '',
          endDate: '',
          description: ''
        });
      });
    }
  }

  return experiences.slice(0, 10);
}

function extractEducation(text, lines) {
  const education = [];
  const eduHeaders = ['education', 'academic', 'qualification', 'academics'];
  
  let inEduSection = false;

  for (let i = 0; i < lines.length; i++) {
    const lower = lines[i].toLowerCase();

    if (eduHeaders.some(h => lower.includes(h) && lines[i].length < 40)) {
      inEduSection = true;
      continue;
    }

    if (inEduSection) {
      if (isSectionHeader(lines[i]) && !eduHeaders.some(h => lower.includes(h))) break;

      // Check for degree patterns
      for (const { pattern, level } of DEGREE_PATTERNS) {
        if (pattern.test(lines[i])) {
          const yearMatch = lines[i].match(/(20|19)\d{2}/);
          const uniLine = findUniversityLine(lines, i);
          education.push({
            degree: level,
            institution: uniLine || '',
            year: yearMatch ? yearMatch[0] : '',
            field: extractField(lines[i])
          });
          break;
        }
      }
    }
  }

  // Also scan entire text for degree mentions if section parsing found nothing
  if (education.length === 0) {
    for (const { pattern, level } of DEGREE_PATTERNS) {
      const match = text.match(pattern);
      if (match) {
        education.push({
          degree: level,
          institution: '',
          year: '',
          field: ''
        });
      }
    }
  }

  return education.slice(0, 5);
}

function findUniversityLine(lines, startIdx) {
  for (let i = Math.max(0, startIdx - 1); i <= Math.min(lines.length - 1, startIdx + 2); i++) {
    if (UNIVERSITY_KEYWORDS.some(kw => lines[i].toLowerCase().includes(kw))) {
      return lines[i];
    }
  }
  return '';
}

function extractField(line) {
  const fields = ['computer science', 'engineering', 'information technology', 'business', 'finance', 'marketing', 'design', 'mathematics', 'physics', 'chemistry', 'biology', 'economics', 'data science', 'artificial intelligence'];
  for (const field of fields) {
    if (line.toLowerCase().includes(field)) return field.charAt(0).toUpperCase() + field.slice(1);
  }
  return '';
}

function extractCertifications(text, lines) {
  const certs = [];
  const certHeaders = ['certification', 'certificates', 'certifications', 'professional certifications', 'licenses'];
  const certKeywords = ['certified', 'certification', 'certificate', 'aws certified', 'google certified', 'microsoft certified', 'pmp', 'scrum master', 'cissp', 'comptia'];

  let inCertSection = false;

  for (let i = 0; i < lines.length; i++) {
    const lower = lines[i].toLowerCase();

    if (certHeaders.some(h => lower.includes(h) && lines[i].length < 50)) {
      inCertSection = true;
      continue;
    }

    if (inCertSection) {
      if (isSectionHeader(lines[i]) && !certHeaders.some(h => lower.includes(h))) break;
      if (lines[i].length > 5) certs.push(lines[i]);
    }
  }

  // If no cert section, scan for cert keywords
  if (certs.length === 0) {
    for (const line of lines) {
      if (certKeywords.some(kw => line.toLowerCase().includes(kw)) && line.length > 10) {
        certs.push(line);
      }
    }
  }

  return certs.slice(0, 10);
}

function extractLanguages(text) {
  const languages = ['english', 'spanish', 'french', 'german', 'mandarin', 'chinese', 'japanese', 'korean', 'arabic', 'portuguese', 'russian', 'hindi', 'italian', 'dutch', 'swedish', 'turkish', 'bengali', 'tamil', 'telugu', 'urdu', 'kannada', 'malayalam', 'marathi', 'gujarati', 'punjabi'];
  const found = [];
  const textLower = text.toLowerCase();

  for (const lang of languages) {
    if (textLower.includes(lang)) {
      found.push(lang.charAt(0).toUpperCase() + lang.slice(1));
    }
  }

  return found;
}

function calculateTotalExperience(experiences, text) {
  // Try to find explicit "X years of experience" mention
  const explicitMatch = text.match(/(\d+)\+?\s*(?:years?|yrs?)\s*(?:of\s*)?(?:professional\s*)?experience/i);
  if (explicitMatch) return parseInt(explicitMatch[1]);

  // Calculate from date ranges
  let totalYears = 0;
  for (const exp of experiences) {
    if (exp.duration) {
      const years = parseDurationYears(exp.duration);
      totalYears += years;
    }
  }

  return Math.round(totalYears) || 0;
}

function parseDurationYears(duration) {
  const rangeMatch = duration.match(/((?:20|19)\d{2})\s*[-–]\s*((?:20|19)\d{2}|Present|Current)/i);
  if (rangeMatch) {
    const start = parseInt(rangeMatch[1]);
    const end = rangeMatch[2].match(/present|current/i) ? new Date().getFullYear() : parseInt(rangeMatch[2]);
    return Math.max(0, end - start);
  }
  return 1; // Default to 1 year if can't parse
}

function isSectionHeader(line) {
  const headers = ['experience', 'education', 'skills', 'projects', 'certification', 'summary', 'objective', 'achievements', 'awards', 'publications', 'references', 'interests', 'hobbies', 'languages', 'volunteer', 'professional', 'technical'];
  const lower = line.toLowerCase().trim();
  return line.length < 40 && headers.some(h => lower.startsWith(h) || lower === h);
}

module.exports = { parseResume, SKILL_DATABASE, ALL_SKILLS };
