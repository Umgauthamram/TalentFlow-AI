# TalentFlow AI — Smart ATS Hiring Suite

![TalentFlow AI](https://via.placeholder.com/1200x300/000000/FFFFFF?text=TalentFlow+AI+-+Smart+ATS)

A production-grade, AI-driven Applicant Tracking System (ATS) demonstrating expertise in full-stack development, AI integration, system architecture, user experience, scalability, and intelligent recruitment automation.

## 🌟 Key Features

### Core ATS Platform
- **User Authentication & Role Management:** Secure JWT-based authentication for Admins, Recruiters, and Hiring Managers.
- **Job Posting Management:** Create, manage, and track job postings.
- **Candidate Pipeline:** Kanban-style drag-and-drop pipeline tracking from application to hire.
- **Analytics Dashboard:** Real-time hiring metrics, conversion rates, and trend analysis.
- **Interview Scheduling:** Built-in workflow for scheduling and managing interviews.
- **Responsive UI:** Pixel-perfect implementation for desktop (1440px) and mobile (390px).

### AI Intelligence Module
- **AI Resume Parsing:** Extracts skills, experience, and education using NLP.
- **Semantic Candidate Matching:** Evaluates and matches candidates against job descriptions.
- **Explainable AI Recommendations:** Transparent candidate scoring detailing matched skills and gaps.
- **Smart Shortlisting:** Automated suggestions based on fit scores.

### Premium Experience
- **Enterprise UI/UX:** A distinct, premium landing page designed for HR-Tech branding highlighting intelligent hiring capabilities.

## 🛠️ Technology Stack
- **Frontend:** React.js, Vite, React Router, Recharts, Lucide Icons
- **Backend:** Node.js, Express.js
- **Database:** MongoDB (via Mongoose)
- **Authentication:** JWT (JSON Web Tokens)
- **AI/NLP Parsing:** Custom NLP heuristics & TF-IDF algorithms

## 🚀 Setup Instructions

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (Running locally or via MongoDB Atlas)

### 1. Clone the repository
```bash
git clone https://github.com/your-username/smart-ats.git
cd smart-ats
```

### 2. Backend Setup
```bash
cd server
npm install

# Create your .env file
cp .env.example .env

# Start the backend server
npm run dev
```

### 3. Frontend Setup
```bash
cd client
npm install

# Start the frontend development server
npm run dev
```

### 4. Database Seeding (Demo Data)
To populate the database with realistic jobs, candidates, and AI scores:
```bash
cd server
npm run seed
```

## 🔐 Demo Credentials

Use the following credentials to explore the platform:

- **Admin:** `admin@talentflow.ai` / `admin123`
- **Recruiter:** `sarah@talentflow.ai` / `recruiter123`
- **Hiring Manager:** `michael@talentflow.ai` / `manager123`

## 📡 API Documentation
The backend exposes a RESTful API. Base URL: `http://localhost:5000/api`

- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/jobs` - List all jobs
- `GET /api/candidates` - List all candidates
- `POST /api/ai/parse-resume` - Upload and parse resume PDF
- `GET /api/analytics/dashboard` - Get hiring metrics

## 💻 Responsive Design
The application is fully responsive and tested across different screen sizes:
- **Desktop:** Optimized for 1440px+ wide screens.
- **Mobile:** Optimized for mobile viewing down to 390px.

---
**Disclaimer:** Built for the Namaah Pvt Ltd Intern Assignment.
