/**
 * Seed Data Script
 * Populates the database with realistic demo data for the ATS platform.
 * Run with: npm run seed (from server directory)
 */

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const connectDB = require('../config/db');

const User = require('../models/User');
const Job = require('../models/Job');
const Candidate = require('../models/Candidate');
const Application = require('../models/Application');
const Interview = require('../models/Interview');

// ─── Demo Users ───
const users = [
  {
    name: 'Admin User',
    email: 'admin@talentflow.ai',
    password: 'admin123',
    role: 'admin',
    department: 'Management',
    phone: '+1 (555) 100-0001'
  },
  {
    name: 'Sarah Johnson',
    email: 'sarah@talentflow.ai',
    password: 'recruiter123',
    role: 'recruiter',
    department: 'Engineering',
    phone: '+1 (555) 100-0002'
  },
  {
    name: 'Michael Chen',
    email: 'michael@talentflow.ai',
    password: 'manager123',
    role: 'hiring_manager',
    department: 'Engineering',
    phone: '+1 (555) 100-0003'
  },
  {
    name: 'Emily Rodriguez',
    email: 'emily@talentflow.ai',
    password: 'recruiter123',
    role: 'recruiter',
    department: 'Product',
    phone: '+1 (555) 100-0004'
  },
  {
    name: 'David Kim',
    email: 'david@talentflow.ai',
    password: 'manager123',
    role: 'hiring_manager',
    department: 'Design',
    phone: '+1 (555) 100-0005'
  }
];

// ─── Demo Jobs ───
const jobs = [
  {
    title: 'Senior React Developer',
    department: 'Engineering',
    location: 'San Francisco, CA',
    type: 'full-time',
    experience: '4-6 years',
    salary: { min: 140000, max: 180000, currency: 'USD' },
    description: 'We are looking for a Senior React Developer to join our front-end team. You will be responsible for building and maintaining high-performance web applications using React.js and modern JavaScript frameworks. You will collaborate closely with product designers and backend engineers to deliver exceptional user experiences.',
    requirements: ['Bachelor\'s degree in Computer Science or equivalent', '4+ years of React.js experience', 'Strong TypeScript skills', 'Experience with state management (Redux, Context API)', 'Understanding of RESTful APIs and GraphQL', 'Familiarity with testing frameworks (Jest, React Testing Library)'],
    responsibilities: ['Build reusable components and front-end libraries', 'Optimize components for maximum performance', 'Collaborate with backend team on API design', 'Mentor junior developers', 'Participate in code reviews'],
    skills: ['react', 'javascript', 'typescript', 'redux', 'css', 'html', 'git', 'jest', 'graphql', 'webpack'],
    benefits: ['Health insurance', 'Stock options', 'Remote work', 'Learning budget'],
    status: 'active',
    priority: 'high'
  },
  {
    title: 'Full Stack Engineer',
    department: 'Engineering',
    location: 'New York, NY',
    type: 'full-time',
    experience: '3-5 years',
    salary: { min: 120000, max: 160000, currency: 'USD' },
    description: 'Join our engineering team as a Full Stack Engineer. You will work on both frontend and backend systems, building scalable microservices and responsive web applications. Our stack includes React, Node.js, PostgreSQL, and AWS.',
    requirements: ['3+ years full-stack development experience', 'Proficiency in React and Node.js', 'Database design experience (SQL and NoSQL)', 'Cloud deployment experience (AWS preferred)', 'CI/CD pipeline knowledge'],
    responsibilities: ['Design and implement full-stack features', 'Write clean, maintainable code', 'Deploy and monitor applications', 'Collaborate with cross-functional teams'],
    skills: ['react', 'node.js', 'express', 'postgresql', 'mongodb', 'aws', 'docker', 'javascript', 'typescript', 'git'],
    benefits: ['401k matching', 'Health insurance', 'Flexible hours', 'Gym membership'],
    status: 'active',
    priority: 'high'
  },
  {
    title: 'UX/UI Designer',
    department: 'Design',
    location: 'Remote',
    type: 'remote',
    experience: '2-4 years',
    salary: { min: 90000, max: 130000, currency: 'USD' },
    description: 'We are seeking a talented UX/UI Designer to create intuitive and beautiful user interfaces for our SaaS platform. You will work closely with product managers and engineers to translate user needs into compelling design solutions.',
    requirements: ['2+ years of UX/UI design experience', 'Proficiency in Figma or Sketch', 'Portfolio demonstrating strong design skills', 'Understanding of design systems', 'User research experience'],
    responsibilities: ['Create wireframes, prototypes, and high-fidelity designs', 'Conduct user research and usability testing', 'Maintain and evolve the design system', 'Collaborate with engineering on implementation'],
    skills: ['figma', 'sketch', 'css', 'html', 'javascript', 'adobe xd'],
    benefits: ['Remote work', 'Health insurance', 'Design conference budget', 'Equipment allowance'],
    status: 'active',
    priority: 'medium'
  },
  {
    title: 'DevOps Engineer',
    department: 'Engineering',
    location: 'Austin, TX',
    type: 'full-time',
    experience: '3-5 years',
    salary: { min: 130000, max: 170000, currency: 'USD' },
    description: 'Looking for a DevOps Engineer to build and maintain our cloud infrastructure. You will automate deployment pipelines, manage Kubernetes clusters, and ensure high availability of our services.',
    requirements: ['3+ years DevOps experience', 'Strong AWS/GCP knowledge', 'Kubernetes and Docker expertise', 'Infrastructure as Code (Terraform)', 'CI/CD pipeline experience'],
    responsibilities: ['Manage cloud infrastructure', 'Automate deployment processes', 'Monitor system performance', 'Implement security best practices'],
    skills: ['aws', 'docker', 'kubernetes', 'terraform', 'linux', 'python', 'jenkins', 'git', 'ci/cd'],
    benefits: ['Health insurance', 'Stock options', 'Relocation assistance'],
    status: 'active',
    priority: 'medium'
  },
  {
    title: 'Product Manager',
    department: 'Product',
    location: 'San Francisco, CA',
    type: 'full-time',
    experience: '5-8 years',
    salary: { min: 150000, max: 200000, currency: 'USD' },
    description: 'We need an experienced Product Manager to lead our core platform product. You will define product strategy, prioritize features, and work with engineering and design to deliver value to our customers.',
    requirements: ['5+ years of product management experience', 'Experience with B2B SaaS products', 'Strong analytical and communication skills', 'Agile/Scrum experience', 'MBA preferred'],
    responsibilities: ['Define product roadmap and strategy', 'Write PRDs and user stories', 'Analyze metrics and user feedback', 'Coordinate cross-functional teams'],
    skills: ['agile', 'scrum', 'jira', 'analytics', 'sql', 'communication', 'leadership'],
    benefits: ['Executive health plan', 'Stock options', 'Unlimited PTO'],
    status: 'active',
    priority: 'urgent'
  },
  {
    title: 'Data Scientist',
    department: 'Data',
    location: 'Seattle, WA',
    type: 'full-time',
    experience: '2-4 years',
    salary: { min: 120000, max: 160000, currency: 'USD' },
    description: 'Join our Data Science team to build ML models that power our recommendation engine. You will work with large datasets, develop predictive models, and deploy solutions to production.',
    requirements: ['Master\'s degree in Statistics, CS, or related field', 'Experience with Python and ML frameworks', 'Strong SQL skills', 'Experience with deep learning'],
    responsibilities: ['Build and deploy ML models', 'Analyze large datasets', 'Collaborate with engineering on model integration', 'Present findings to stakeholders'],
    skills: ['python', 'machine learning', 'tensorflow', 'pytorch', 'sql', 'pandas', 'numpy', 'scikit-learn', 'deep learning'],
    benefits: ['Research budget', 'Conference travel', 'Health insurance'],
    status: 'active',
    priority: 'medium'
  },
  {
    title: 'Marketing Manager',
    department: 'Marketing',
    location: 'Chicago, IL',
    type: 'full-time',
    experience: '4-6 years',
    salary: { min: 95000, max: 130000, currency: 'USD' },
    description: 'Lead our marketing efforts including content strategy, demand generation, and brand management. Drive growth through data-driven marketing campaigns.',
    requirements: ['4+ years marketing experience', 'B2B SaaS marketing background', 'HubSpot/Marketo experience', 'Content marketing expertise'],
    responsibilities: ['Develop marketing strategy', 'Manage marketing budget', 'Lead content creation', 'Analyze campaign performance'],
    skills: ['communication', 'leadership', 'analytics', 'project management'],
    benefits: ['Health insurance', 'Flexible hours', 'Education stipend'],
    status: 'paused',
    priority: 'low'
  },
  {
    title: 'Backend Engineer (Python)',
    department: 'Engineering',
    location: 'Remote',
    type: 'remote',
    experience: '3-5 years',
    salary: { min: 130000, max: 165000, currency: 'USD' },
    description: 'We are looking for a Python Backend Engineer to build robust APIs and microservices. You will work with Django/FastAPI, PostgreSQL, and Redis to power our growing platform.',
    requirements: ['3+ years Python backend experience', 'Django or FastAPI proficiency', 'PostgreSQL and Redis experience', 'Microservices architecture knowledge', 'API design best practices'],
    responsibilities: ['Design and implement APIs', 'Optimize database queries', 'Write comprehensive tests', 'Document API endpoints'],
    skills: ['python', 'django', 'fastapi', 'postgresql', 'redis', 'docker', 'git', 'linux', 'rest'],
    benefits: ['Remote work', 'Health insurance', 'Home office budget'],
    status: 'active',
    priority: 'high'
  }
];

// ─── Demo Candidates ───
const candidates = [
  {
    name: 'Alex Thompson',
    email: 'alex.thompson@email.com',
    phone: '+1 (555) 200-0001',
    location: 'San Francisco, CA',
    currentTitle: 'Senior Frontend Developer',
    currentCompany: 'TechCorp Inc.',
    source: 'linkedin',
    tags: ['react', 'senior', 'frontend'],
    parsedData: {
      summary: 'Experienced frontend developer with 6 years of expertise in React.js, TypeScript, and modern web technologies. Passionate about building performant and accessible user interfaces.',
      skills: [
        { name: 'React', level: 'expert', yearsOfExperience: 5 },
        { name: 'TypeScript', level: 'advanced', yearsOfExperience: 4 },
        { name: 'JavaScript', level: 'expert', yearsOfExperience: 6 },
        { name: 'Redux', level: 'advanced', yearsOfExperience: 4 },
        { name: 'CSS', level: 'advanced', yearsOfExperience: 6 },
        { name: 'HTML', level: 'expert', yearsOfExperience: 6 },
        { name: 'GraphQL', level: 'intermediate', yearsOfExperience: 2 },
        { name: 'Jest', level: 'advanced', yearsOfExperience: 3 },
        { name: 'Webpack', level: 'intermediate', yearsOfExperience: 3 },
        { name: 'Git', level: 'advanced', yearsOfExperience: 6 },
        { name: 'Node.js', level: 'intermediate', yearsOfExperience: 2 }
      ],
      experience: [
        { title: 'Senior Frontend Developer', company: 'TechCorp Inc.', duration: '2021 - Present', description: 'Led frontend architecture for a SaaS platform serving 50K+ users. Built reusable component library using React and TypeScript.' },
        { title: 'Frontend Developer', company: 'WebSolutions', duration: '2019 - 2021', description: 'Developed responsive web applications using React.js and Redux. Improved page load performance by 40%.' },
        { title: 'Junior Developer', company: 'StartupXYZ', duration: '2018 - 2019', description: 'Built landing pages and internal tools using React and vanilla JavaScript.' }
      ],
      education: [
        { degree: 'Bachelor', institution: 'UC Berkeley', year: '2018', field: 'Computer Science' }
      ],
      certifications: ['AWS Certified Cloud Practitioner', 'Meta Frontend Developer Certificate'],
      languages: ['English', 'Spanish'],
      totalYearsExperience: 6
    }
  },
  {
    name: 'Priya Patel',
    email: 'priya.patel@email.com',
    phone: '+1 (555) 200-0002',
    location: 'New York, NY',
    currentTitle: 'Full Stack Developer',
    currentCompany: 'InnovateTech',
    source: 'referral',
    tags: ['fullstack', 'react', 'node'],
    parsedData: {
      summary: 'Versatile full-stack developer with 4 years of experience building web applications with React, Node.js, and PostgreSQL. Strong problem-solving skills and a passion for clean code.',
      skills: [
        { name: 'React', level: 'advanced', yearsOfExperience: 4 },
        { name: 'Node.js', level: 'advanced', yearsOfExperience: 4 },
        { name: 'Express', level: 'advanced', yearsOfExperience: 3 },
        { name: 'PostgreSQL', level: 'intermediate', yearsOfExperience: 3 },
        { name: 'MongoDB', level: 'intermediate', yearsOfExperience: 2 },
        { name: 'JavaScript', level: 'advanced', yearsOfExperience: 4 },
        { name: 'TypeScript', level: 'intermediate', yearsOfExperience: 2 },
        { name: 'Docker', level: 'intermediate', yearsOfExperience: 2 },
        { name: 'AWS', level: 'beginner', yearsOfExperience: 1 },
        { name: 'Git', level: 'advanced', yearsOfExperience: 4 }
      ],
      experience: [
        { title: 'Full Stack Developer', company: 'InnovateTech', duration: '2022 - Present', description: 'Develop and maintain a B2B SaaS platform. Implemented microservices architecture using Node.js.' },
        { title: 'Web Developer', company: 'DigitalAgency', duration: '2020 - 2022', description: 'Built custom web solutions for clients using React and Express.' }
      ],
      education: [
        { degree: 'Master', institution: 'NYU', year: '2020', field: 'Computer Science' }
      ],
      certifications: [],
      languages: ['English', 'Hindi'],
      totalYearsExperience: 4
    }
  },
  {
    name: 'James Wilson',
    email: 'james.wilson@email.com',
    phone: '+1 (555) 200-0003',
    location: 'Austin, TX',
    currentTitle: 'DevOps Engineer',
    currentCompany: 'CloudScale',
    source: 'job_board',
    tags: ['devops', 'aws', 'kubernetes'],
    parsedData: {
      summary: 'DevOps engineer with 5 years of experience in cloud infrastructure, container orchestration, and CI/CD pipeline automation. AWS certified with strong Linux administration skills.',
      skills: [
        { name: 'AWS', level: 'expert', yearsOfExperience: 5 },
        { name: 'Docker', level: 'expert', yearsOfExperience: 4 },
        { name: 'Kubernetes', level: 'advanced', yearsOfExperience: 3 },
        { name: 'Terraform', level: 'advanced', yearsOfExperience: 3 },
        { name: 'Linux', level: 'expert', yearsOfExperience: 5 },
        { name: 'Python', level: 'intermediate', yearsOfExperience: 3 },
        { name: 'Jenkins', level: 'advanced', yearsOfExperience: 4 },
        { name: 'Git', level: 'advanced', yearsOfExperience: 5 },
        { name: 'CI/CD', level: 'expert', yearsOfExperience: 4 }
      ],
      experience: [
        { title: 'Senior DevOps Engineer', company: 'CloudScale', duration: '2021 - Present', description: 'Manage multi-region AWS infrastructure. Reduced deployment time by 70% through CI/CD automation.' },
        { title: 'DevOps Engineer', company: 'TechStartup', duration: '2019 - 2021', description: 'Set up Kubernetes clusters and containerized applications. Implemented monitoring with Prometheus and Grafana.' }
      ],
      education: [
        { degree: 'Bachelor', institution: 'University of Texas', year: '2019', field: 'Computer Science' }
      ],
      certifications: ['AWS Solutions Architect Professional', 'CKA - Certified Kubernetes Administrator'],
      languages: ['English'],
      totalYearsExperience: 5
    }
  },
  {
    name: 'Maria Garcia',
    email: 'maria.garcia@email.com',
    phone: '+1 (555) 200-0004',
    location: 'Remote',
    currentTitle: 'UX Designer',
    currentCompany: 'DesignStudio',
    source: 'website',
    tags: ['design', 'ux', 'figma'],
    parsedData: {
      summary: 'Creative UX/UI designer with 3 years of experience creating user-centered designs for web and mobile applications. Skilled in Figma, user research, and design systems.',
      skills: [
        { name: 'Figma', level: 'expert', yearsOfExperience: 3 },
        { name: 'Sketch', level: 'advanced', yearsOfExperience: 2 },
        { name: 'CSS', level: 'intermediate', yearsOfExperience: 2 },
        { name: 'HTML', level: 'intermediate', yearsOfExperience: 2 },
        { name: 'JavaScript', level: 'beginner', yearsOfExperience: 1 }
      ],
      experience: [
        { title: 'UX Designer', company: 'DesignStudio', duration: '2022 - Present', description: 'Lead UX design for enterprise SaaS products. Created design system used across 5 product teams.' },
        { title: 'Junior UX Designer', company: 'CreativeAgency', duration: '2021 - 2022', description: 'Designed wireframes and prototypes for client projects.' }
      ],
      education: [
        { degree: 'Bachelor', institution: 'RISD', year: '2021', field: 'Design' }
      ],
      certifications: ['Google UX Design Certificate'],
      languages: ['English', 'Spanish'],
      totalYearsExperience: 3
    }
  },
  {
    name: 'Robert Chang',
    email: 'robert.chang@email.com',
    phone: '+1 (555) 200-0005',
    location: 'Seattle, WA',
    currentTitle: 'Data Scientist',
    currentCompany: 'DataDriven Inc.',
    source: 'linkedin',
    tags: ['data-science', 'python', 'ml'],
    parsedData: {
      summary: 'Data scientist with 3 years of experience in machine learning, NLP, and predictive modeling. Published researcher with expertise in deep learning frameworks.',
      skills: [
        { name: 'Python', level: 'expert', yearsOfExperience: 5 },
        { name: 'Machine Learning', level: 'advanced', yearsOfExperience: 3 },
        { name: 'TensorFlow', level: 'advanced', yearsOfExperience: 2 },
        { name: 'PyTorch', level: 'intermediate', yearsOfExperience: 2 },
        { name: 'Pandas', level: 'expert', yearsOfExperience: 4 },
        { name: 'NumPy', level: 'expert', yearsOfExperience: 4 },
        { name: 'Scikit-learn', level: 'advanced', yearsOfExperience: 3 },
        { name: 'SQL', level: 'advanced', yearsOfExperience: 3 },
        { name: 'Deep Learning', level: 'intermediate', yearsOfExperience: 2 }
      ],
      experience: [
        { title: 'Data Scientist', company: 'DataDriven Inc.', duration: '2022 - Present', description: 'Built recommendation models that increased user engagement by 25%. Developed NLP pipeline for text classification.' },
        { title: 'ML Engineer Intern', company: 'BigTech', duration: '2021 - 2022', description: 'Developed computer vision models for product quality inspection.' }
      ],
      education: [
        { degree: 'Master', institution: 'University of Washington', year: '2021', field: 'Data Science' },
        { degree: 'Bachelor', institution: 'UCLA', year: '2019', field: 'Mathematics' }
      ],
      certifications: ['Google Machine Learning Engineer'],
      languages: ['English', 'Mandarin'],
      totalYearsExperience: 3
    }
  },
  {
    name: 'Sarah Martinez',
    email: 'sarah.martinez@email.com',
    phone: '+1 (555) 200-0006',
    location: 'San Francisco, CA',
    currentTitle: 'Product Manager',
    currentCompany: 'SaaSPlatform',
    source: 'referral',
    tags: ['product', 'strategy', 'saas'],
    parsedData: {
      summary: 'Product manager with 7 years of experience in B2B SaaS. Track record of launching successful products that drive revenue growth. Strong analytical and cross-functional leadership skills.',
      skills: [
        { name: 'Agile', level: 'expert', yearsOfExperience: 6 },
        { name: 'Scrum', level: 'expert', yearsOfExperience: 5 },
        { name: 'Jira', level: 'expert', yearsOfExperience: 6 },
        { name: 'SQL', level: 'intermediate', yearsOfExperience: 3 },
        { name: 'Analytics', level: 'advanced', yearsOfExperience: 5 },
        { name: 'Leadership', level: 'expert', yearsOfExperience: 7 },
        { name: 'Communication', level: 'expert', yearsOfExperience: 7 }
      ],
      experience: [
        { title: 'Senior Product Manager', company: 'SaaSPlatform', duration: '2020 - Present', description: 'Lead product strategy for core platform. Grew ARR from $5M to $15M.' },
        { title: 'Product Manager', company: 'EnterpriseCo', duration: '2017 - 2020', description: 'Managed product roadmap for enterprise collaboration tools.' }
      ],
      education: [
        { degree: 'Master', institution: 'Stanford University', year: '2017', field: 'Business' },
        { degree: 'Bachelor', institution: 'MIT', year: '2015', field: 'Computer Science' }
      ],
      certifications: ['Certified Scrum Product Owner'],
      languages: ['English', 'French'],
      totalYearsExperience: 7
    }
  },
  {
    name: 'Kevin O\'Brien',
    email: 'kevin.obrien@email.com',
    phone: '+1 (555) 200-0007',
    location: 'Chicago, IL',
    currentTitle: 'Frontend Developer',
    currentCompany: 'WebWorks',
    source: 'job_board',
    tags: ['react', 'frontend', 'junior'],
    parsedData: {
      summary: 'Frontend developer with 2 years of experience. Proficient in React.js and modern CSS. Eager to grow in a challenging technical environment.',
      skills: [
        { name: 'React', level: 'intermediate', yearsOfExperience: 2 },
        { name: 'JavaScript', level: 'intermediate', yearsOfExperience: 2 },
        { name: 'CSS', level: 'advanced', yearsOfExperience: 3 },
        { name: 'HTML', level: 'advanced', yearsOfExperience: 3 },
        { name: 'Git', level: 'intermediate', yearsOfExperience: 2 },
        { name: 'Bootstrap', level: 'intermediate', yearsOfExperience: 2 }
      ],
      experience: [
        { title: 'Frontend Developer', company: 'WebWorks', duration: '2023 - Present', description: 'Build responsive websites using React and CSS.' },
        { title: 'Intern', company: 'TechAgency', duration: '2022 - 2023', description: 'Assisted with frontend development tasks.' }
      ],
      education: [
        { degree: 'Bachelor', institution: 'University of Illinois', year: '2022', field: 'Computer Science' }
      ],
      certifications: [],
      languages: ['English'],
      totalYearsExperience: 2
    }
  },
  {
    name: 'Lisa Wang',
    email: 'lisa.wang@email.com',
    phone: '+1 (555) 200-0008',
    location: 'New York, NY',
    currentTitle: 'Backend Engineer',
    currentCompany: 'FinTechCo',
    source: 'linkedin',
    tags: ['backend', 'python', 'django'],
    parsedData: {
      summary: 'Backend engineer specializing in Python and Django with 4 years of experience building scalable APIs and microservices for fintech applications.',
      skills: [
        { name: 'Python', level: 'expert', yearsOfExperience: 5 },
        { name: 'Django', level: 'advanced', yearsOfExperience: 4 },
        { name: 'FastAPI', level: 'intermediate', yearsOfExperience: 2 },
        { name: 'PostgreSQL', level: 'advanced', yearsOfExperience: 4 },
        { name: 'Redis', level: 'intermediate', yearsOfExperience: 2 },
        { name: 'Docker', level: 'intermediate', yearsOfExperience: 2 },
        { name: 'Git', level: 'advanced', yearsOfExperience: 4 },
        { name: 'Linux', level: 'intermediate', yearsOfExperience: 3 },
        { name: 'REST', level: 'advanced', yearsOfExperience: 4 }
      ],
      experience: [
        { title: 'Backend Engineer', company: 'FinTechCo', duration: '2021 - Present', description: 'Design and implement RESTful APIs handling 10K+ requests/second. Built payment processing microservices.' },
        { title: 'Python Developer', company: 'DataCorp', duration: '2020 - 2021', description: 'Developed data pipelines and internal APIs using Django.' }
      ],
      education: [
        { degree: 'Bachelor', institution: 'Columbia University', year: '2020', field: 'Computer Science' }
      ],
      certifications: ['AWS Certified Developer Associate'],
      languages: ['English', 'Mandarin'],
      totalYearsExperience: 4
    }
  },
  {
    name: 'Daniel Foster',
    email: 'daniel.foster@email.com',
    phone: '+1 (555) 200-0009',
    location: 'Denver, CO',
    currentTitle: 'React Developer',
    currentCompany: 'AppBuilder',
    source: 'website',
    tags: ['react', 'frontend', 'mobile'],
    parsedData: {
      summary: 'React developer with 3 years of experience and additional expertise in React Native for mobile development. Passionate about creating smooth, responsive user interfaces.',
      skills: [
        { name: 'React', level: 'advanced', yearsOfExperience: 3 },
        { name: 'JavaScript', level: 'advanced', yearsOfExperience: 4 },
        { name: 'TypeScript', level: 'intermediate', yearsOfExperience: 2 },
        { name: 'Redux', level: 'intermediate', yearsOfExperience: 2 },
        { name: 'CSS', level: 'advanced', yearsOfExperience: 4 },
        { name: 'HTML', level: 'advanced', yearsOfExperience: 4 },
        { name: 'Node.js', level: 'intermediate', yearsOfExperience: 2 },
        { name: 'Git', level: 'advanced', yearsOfExperience: 3 },
        { name: 'Jest', level: 'intermediate', yearsOfExperience: 2 }
      ],
      experience: [
        { title: 'React Developer', company: 'AppBuilder', duration: '2022 - Present', description: 'Build cross-platform applications using React and React Native.' },
        { title: 'Web Developer', company: 'FreelanceStudio', duration: '2020 - 2022', description: 'Freelance web development for small businesses.' }
      ],
      education: [
        { degree: 'Bachelor', institution: 'Colorado State University', year: '2020', field: 'Information Technology' }
      ],
      certifications: ['Meta React Native Specialization'],
      languages: ['English'],
      totalYearsExperience: 3
    }
  },
  {
    name: 'Aisha Nguyen',
    email: 'aisha.nguyen@email.com',
    phone: '+1 (555) 200-0010',
    location: 'Portland, OR',
    currentTitle: 'Full Stack Engineer',
    currentCompany: 'GreenTech',
    source: 'referral',
    tags: ['fullstack', 'react', 'python'],
    parsedData: {
      summary: 'Full stack engineer with experience in both JavaScript and Python ecosystems. Built products from zero to production for 2 startups. Strong in system design and agile methodologies.',
      skills: [
        { name: 'React', level: 'advanced', yearsOfExperience: 3 },
        { name: 'Python', level: 'advanced', yearsOfExperience: 4 },
        { name: 'Node.js', level: 'intermediate', yearsOfExperience: 2 },
        { name: 'Django', level: 'intermediate', yearsOfExperience: 2 },
        { name: 'PostgreSQL', level: 'intermediate', yearsOfExperience: 3 },
        { name: 'MongoDB', level: 'intermediate', yearsOfExperience: 2 },
        { name: 'Docker', level: 'intermediate', yearsOfExperience: 2 },
        { name: 'AWS', level: 'intermediate', yearsOfExperience: 2 },
        { name: 'JavaScript', level: 'advanced', yearsOfExperience: 4 },
        { name: 'TypeScript', level: 'intermediate', yearsOfExperience: 1 },
        { name: 'Git', level: 'advanced', yearsOfExperience: 4 }
      ],
      experience: [
        { title: 'Full Stack Engineer', company: 'GreenTech', duration: '2022 - Present', description: 'Lead engineer for sustainability tracking platform. Built real-time dashboard using React and WebSockets.' },
        { title: 'Software Developer', company: 'HealthStartup', duration: '2020 - 2022', description: 'Built telemedicine platform from scratch using Django and React.' }
      ],
      education: [
        { degree: 'Bachelor', institution: 'Oregon State University', year: '2020', field: 'Computer Science' }
      ],
      certifications: [],
      languages: ['English', 'Vietnamese'],
      totalYearsExperience: 4
    }
  }
];

// ─── Seed Function ───
async function seedDatabase() {
  try {
    console.log('🌱 Starting database seed...\n');

    await connectDB();

    // Clear existing data
    console.log('🗑️  Clearing existing data...');
    await User.deleteMany({});
    await Job.deleteMany({});
    await Candidate.deleteMany({});
    await Application.deleteMany({});
    await Interview.deleteMany({});

    // Create users
    console.log('👤 Creating users...');
    const createdUsers = await User.create(users);
    console.log(`   ✅ ${createdUsers.length} users created`);

    const recruiter = createdUsers.find(u => u.role === 'recruiter');
    const hiringManager = createdUsers.find(u => u.role === 'hiring_manager');

    // Create jobs (assign to recruiter)
    console.log('📋 Creating jobs...');
    const jobsWithUser = jobs.map(j => ({ ...j, postedBy: recruiter._id }));
    const createdJobs = await Job.create(jobsWithUser);
    console.log(`   ✅ ${createdJobs.length} jobs created`);

    // Create candidates
    console.log('🧑 Creating candidates...');
    const candidatesWithUser = candidates.map(c => ({ ...c, addedBy: recruiter._id }));
    const createdCandidates = await Candidate.create(candidatesWithUser);
    console.log(`   ✅ ${createdCandidates.length} candidates created`);

    // Create applications (map candidates to jobs)
    console.log('📝 Creating applications...');
    const { scoreCandidate } = require('../services/scoringEngine');

    const applicationMappings = [
      // Senior React Dev applicants
      { jobIdx: 0, candidateIdx: 0, stage: 'interview' },
      { jobIdx: 0, candidateIdx: 6, stage: 'screening' },
      { jobIdx: 0, candidateIdx: 8, stage: 'applied' },
      // Full Stack Engineer applicants
      { jobIdx: 1, candidateIdx: 1, stage: 'assessment' },
      { jobIdx: 1, candidateIdx: 9, stage: 'interview' },
      { jobIdx: 1, candidateIdx: 0, stage: 'screening' },
      // UX/UI Designer applicants
      { jobIdx: 2, candidateIdx: 3, stage: 'offer' },
      // DevOps Engineer applicants
      { jobIdx: 3, candidateIdx: 2, stage: 'interview' },
      // Product Manager applicants
      { jobIdx: 4, candidateIdx: 5, stage: 'assessment' },
      // Data Scientist applicants
      { jobIdx: 5, candidateIdx: 4, stage: 'interview' },
      // Backend Engineer applicants
      { jobIdx: 7, candidateIdx: 7, stage: 'screening' },
      { jobIdx: 7, candidateIdx: 9, stage: 'applied' },
      // Cross-applications
      { jobIdx: 1, candidateIdx: 8, stage: 'applied' },
      { jobIdx: 0, candidateIdx: 1, stage: 'applied' },
    ];

    const createdApplications = [];
    for (const mapping of applicationMappings) {
      const job = createdJobs[mapping.jobIdx];
      const candidate = createdCandidates[mapping.candidateIdx];

      // Calculate AI score
      const aiScore = scoreCandidate(candidate, job);

      const app = await Application.create({
        job: job._id,
        candidate: candidate._id,
        stage: mapping.stage,
        aiScore,
        isShortlisted: aiScore.overall >= 65,
        appliedAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000)
      });

      createdApplications.push(app);

      // Update job applicant count
      await Job.findByIdAndUpdate(job._id, { $inc: { applicantCount: 1 } });
    }
    console.log(`   ✅ ${createdApplications.length} applications created with AI scores`);

    // Create some interviews
    console.log('📅 Creating interviews...');
    const interviewApps = createdApplications.filter(a => 
      ['interview', 'assessment'].includes(a.stage)
    );

    const interviewTypes = ['video', 'phone', 'technical', 'onsite', 'panel'];
    const createdInterviews = [];

    for (const app of interviewApps) {
      const interview = await Interview.create({
        application: app._id,
        job: app.job,
        candidate: app.candidate,
        interviewers: [hiringManager._id],
        interviewerNames: [hiringManager.name],
        scheduledAt: new Date(Date.now() + Math.random() * 14 * 24 * 60 * 60 * 1000),
        duration: 60,
        type: interviewTypes[Math.floor(Math.random() * interviewTypes.length)],
        status: 'scheduled',
        meetingLink: 'https://meet.talentflow.ai/' + Math.random().toString(36).substring(7)
      });
      createdInterviews.push(interview);
    }
    console.log(`   ✅ ${createdInterviews.length} interviews scheduled`);

    // Summary
    console.log('\n═══════════════════════════════════════════');
    console.log('🎉 Database seeded successfully!');
    console.log('═══════════════════════════════════════════');
    console.log('\n📌 Demo Credentials:');
    console.log('   Admin:           admin@talentflow.ai / admin123');
    console.log('   Recruiter:       sarah@talentflow.ai / recruiter123');
    console.log('   Hiring Manager:  michael@talentflow.ai / manager123');
    console.log('═══════════════════════════════════════════\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seed error:', error);
    process.exit(1);
  }
}

seedDatabase();
