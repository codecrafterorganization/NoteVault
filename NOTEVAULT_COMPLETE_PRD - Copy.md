# 📚 NOTEVAULT — PRODUCT REQUIREMENTS DOCUMENT
## Version 2.0 | Hackathon Edition | Antigravity-Ready

---

## 🎯 PRODUCT VISION

**NoteVault** is an AI-powered study ecosystem that transforms raw, passive notes (handwritten, typed, PDF, image) into an active, intelligent learning system.

**Core Promise:** Upload your notes → AI reads them → You learn faster, smarter, deeper.

---

## 👥 TARGET USERS

| User Type | Pain Point | NoteVault Solution |
|-----------|------------|-------------------|
| College students (B.Tech, MBBS, MBA) | Scattered notes, no structure | Unified AI workspace |
| Competitive exam aspirants (JEE, NEET) | Too much to cover, too little time | Cheat sheets + quiz engine |
| CS / Engineering students | Code snippets in notes, no way to test | Integrated code sandbox |
| Study groups | Everyone has different notes | Group Brain merger |

---

## 🚀 FEATURES — DETAILED SPEC

---

### FEATURE 1: OCR & Multi-Format Note Upload ⭐⭐⭐

**What It Is:**
Convert any format (handwritten image, typed PDF, DOCX) into AI-compatible digital text.

**User Flow:**
```
User → Upload file (image/PDF/DOCX)
     → Backend receives file
     → OCR extracts text (Tesseract.js)
     → Text stored in Supabase
     → Displayed in editor
     → AI features unlock
```

**Accepted Formats:**
- `.jpg`, `.jpeg`, `.png` (handwritten or printed)
- `.pdf` (scanned or digital)
- `.docx` (Word documents)
- Plain text paste (fallback)

**Technical Requirements:**
- OCR Engine: Tesseract.js (client-side or server-side)
- PDF Parser: pdfjs-dist or pdf-parse
- DOCX Parser: mammoth.js
- Max file size: 10MB
- Target accuracy: 90%+ for clear images, 75%+ for handwritten

**API Contract:**
```
POST /api/notes/upload
Content-Type: multipart/form-data

Request:
  file: File (required)
  userId: string (required)
  title: string (optional)
  subject: string (optional)

Response (Success):
{
  success: true,
  noteId: "note_abc123",
  title: "Physics Chapter 3",
  extractedText: "Full extracted content...",
  wordCount: 1247,
  ocrConfidence: 0.91,
  format: "image" | "pdf" | "docx" | "text",
  createdAt: "2024-01-15T10:30:00Z"
}

Response (Error):
{
  success: false,
  error: "OCR_FAILED" | "FILE_TOO_LARGE" | "UNSUPPORTED_FORMAT",
  message: "Human-readable error message"
}
```

**Database Schema:**
```sql
CREATE TABLE notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  title VARCHAR(255) NOT NULL,
  subject VARCHAR(100),
  original_file_url TEXT,
  extracted_text TEXT NOT NULL,
  word_count INTEGER,
  ocr_confidence FLOAT,
  format VARCHAR(20) CHECK (format IN ('image','pdf','docx','text')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Acceptance Criteria:**
- ✅ All 4 formats upload successfully
- ✅ OCR extracts readable text
- ✅ Confidence score returned
- ✅ File stored in Supabase Storage
- ✅ Text stored in Supabase DB
- ✅ Mobile responsive upload UI
- ✅ Progress bar during upload
- ✅ Error messages for invalid files

---

### FEATURE 2: Context-Aware Study Buddy (AI Chat) ⭐⭐⭐

**What It Is:**
A side-by-side AI assistant that has read your specific notes and answers questions based only on that content.

**User Flow:**
```
User → Opens note → Chat panel appears
     → Asks question
     → Backend fetches note context
     → Sends to Gemini API with context
     → AI responds based on NOTE content (not generic)
     → Response displayed in chat
```

**Key Differentiator:**
- Answers are note-specific (not generic AI)
- Can highlight relevant section in note
- Multi-turn conversation (remembers context)
- Suggests follow-up questions

**API Contract:**
```
POST /api/chat/message
Content-Type: application/json

Request:
{
  noteId: "note_abc123",
  userId: "user_xyz",
  message: "Explain the light reactions",
  conversationHistory: [
    { role: "user", content: "..." },
    { role: "assistant", content: "..." }
  ]
}

Response:
{
  success: true,
  response: "Based on your notes, light reactions occur in...",
  sourceSection: "Lines 45-67 (approximate)",
  followUpSuggestions: [
    "Can you explain the Calvin Cycle next?",
    "How does ATP form in light reactions?"
  ],
  tokensUsed: 450
}
```

**Database Schema:**
```sql
CREATE TABLE chat_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  note_id UUID NOT NULL REFERENCES notes(id),
  user_id UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES chat_sessions(id),
  role VARCHAR(10) CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Gemini Prompt Template:**
```
SYSTEM:
You are a focused study assistant.
You ONLY answer questions based on the student's notes provided below.
If the question is outside the notes, say: "This isn't covered in your notes. Would you like me to check?"
Be concise, clear, and student-friendly.

NOTES CONTEXT:
{extractedText}

CONVERSATION HISTORY:
{conversationHistory}

USER QUESTION:
{userMessage}

Respond based ONLY on the notes above.
```

**Acceptance Criteria:**
- ✅ Chat loads with note context
- ✅ AI uses note content in responses
- ✅ Multi-turn conversation works
- ✅ Out-of-scope questions handled gracefully
- ✅ Response time < 3 seconds
- ✅ Chat history persists (not just in-memory)
- ✅ Mobile responsive UI

---

### FEATURE 3: Adaptive Quiz Generator ⭐⭐⭐

**What It Is:**
Auto-generate 10 MCQ questions from notes with 3 difficulty levels.

**Difficulty Levels:**
```
EASY (Beginner)
├─ Direct recall questions
├─ Questions from explicit note content
├─ Simple language
└─ Clear, unambiguous options

MEDIUM (Intermediate)
├─ Application-level questions
├─ Requires connecting concepts
├─ Some inference needed
└─ More nuanced options

HARD (Advanced)
├─ Analysis and synthesis
├─ Cross-concept connections
├─ May require reasoning beyond notes
└─ All options are plausible
```

**API Contract:**
```
POST /api/quiz/generate
Content-Type: application/json

Request:
{
  noteId: "note_abc123",
  userId: "user_xyz",
  difficulty: "easy" | "medium" | "hard",
  questionCount: 10
}

Response:
{
  success: true,
  quizId: "quiz_xyz789",
  noteId: "note_abc123",
  difficulty: "medium",
  questions: [
    {
      id: "q1",
      question: "What is the primary function of chloroplasts?",
      options: {
        A: "Cell division",
        B: "Photosynthesis",
        C: "Protein synthesis",
        D: "Respiration"
      },
      correct: "B",
      explanation: "Chloroplasts are the organelles responsible for photosynthesis..."
    }
    // ... 9 more
  ],
  generatedAt: "2024-01-15T10:35:00Z"
}

POST /api/quiz/submit
Request:
{
  quizId: "quiz_xyz789",
  userId: "user_xyz",
  answers: [
    { questionId: "q1", selected: "B" },
    { questionId: "q2", selected: "A" }
    // ... 10 total
  ],
  timeTaken: 480
}

Response:
{
  success: true,
  score: 8,
  total: 10,
  percentage: 80,
  grade: "B+",
  results: [
    {
      questionId: "q1",
      correct: true,
      userAnswer: "B",
      correctAnswer: "B",
      explanation: "Correct! Chloroplasts..."
    }
  ],
  feedback: "Strong performance! Review Q3 and Q7."
}
```

**Database Schema:**
```sql
CREATE TABLE quizzes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  note_id UUID NOT NULL REFERENCES notes(id),
  user_id UUID NOT NULL REFERENCES users(id),
  difficulty VARCHAR(10) CHECK (difficulty IN ('easy','medium','hard')),
  questions JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE quiz_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id UUID NOT NULL REFERENCES quizzes(id),
  user_id UUID NOT NULL REFERENCES users(id),
  answers JSONB NOT NULL,
  score INTEGER,
  total INTEGER,
  percentage FLOAT,
  time_taken INTEGER,
  submitted_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Acceptance Criteria:**
- ✅ Exactly N questions generated
- ✅ All questions based on note content
- ✅ 4 options per question
- ✅ 1 correct answer per question
- ✅ Explanations included
- ✅ All 3 difficulty levels work
- ✅ Score calculates correctly
- ✅ Per-question feedback shown
- ✅ Quiz history saved
- ✅ Supports retake

---

### FEATURE 4: Automated Cheat-Sheet & PDF Export ⭐⭐⭐

**What It Is:**
One-click generation of a condensed, structured study guide from notes with PDF export.

**Output Structure:**
```
CHEAT SHEET OUTPUT:
├─ Title
├─ Key Concepts (3-5 bullet points each)
├─ Important Formulas (if applicable)
├─ Definitions
├─ Quick Tips / Memory Tricks
└─ Concept Links / Mind Map (text-based)
```

**API Contract:**
```
POST /api/cheatsheet/generate
Request:
{
  noteId: "note_abc123",
  userId: "user_xyz",
  format: "html" | "pdf"
}

Response:
{
  success: true,
  cheatsheetId: "cs_xyz",
  title: "Physics Chapter 3 - Summary",
  htmlContent: "<div>...</div>",
  wordCount: 320,
  pdfUrl: "https://supabase.../cheatsheet_xyz.pdf",
  sections: ["Key Concepts", "Formulas", "Definitions"],
  generatedAt: "2024-01-15T10:40:00Z"
}

GET /api/cheatsheet/:cheatsheetId/download
Response: PDF file (application/pdf)
```

**Database Schema:**
```sql
CREATE TABLE cheatsheets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  note_id UUID NOT NULL REFERENCES notes(id),
  user_id UUID NOT NULL REFERENCES users(id),
  title VARCHAR(255),
  html_content TEXT NOT NULL,
  pdf_url TEXT,
  word_count INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Acceptance Criteria:**
- ✅ Summary is 20-30% of original length
- ✅ NOT a copy-paste of original
- ✅ All major concepts covered
- ✅ HTML renders correctly
- ✅ PDF exports without errors
- ✅ PDF is printable (A4 format)
- ✅ PDF stored in Supabase Storage
- ✅ Download button works

---

### FEATURE 5: Group Brain (Knowledge Fusion) ⭐⭐

**What It Is:**
Merge multiple students' notes on the same topic into one unified Master Guide.

**User Flow:**
```
Students A, B, C upload their notes
         ↓
User selects multiple notes (same topic)
         ↓
AI analyzes each note
         ↓
Identifies: Unique content per note
            Duplicate content (deduplicates)
            Gaps (what's missing in each)
         ↓
Generates unified Master Guide
         ↓
Highlights who contributed what
```

**API Contract:**
```
POST /api/groupbrain/merge
Request:
{
  userId: "user_xyz",
  noteIds: ["note_1", "note_2", "note_3"],
  topic: "Photosynthesis"
}

Response:
{
  success: true,
  mergedGuideId: "mg_abc",
  topic: "Photosynthesis",
  sourcesCount: 3,
  masterGuide: {
    htmlContent: "<div>...</div>",
    sections: [
      {
        title: "Introduction",
        content: "...",
        sources: ["note_1", "note_3"]
      }
    ]
  },
  insights: {
    commonTopics: ["ATP", "Calvin Cycle"],
    uniqueToNote1: ["Lab observations"],
    gaps: ["Photorespiration not covered by anyone"],
    duplicates: 12
  },
  pdfUrl: "...",
  createdAt: "..."
}
```

**Database Schema:**
```sql
CREATE TABLE merged_guides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_by UUID NOT NULL REFERENCES users(id),
  topic VARCHAR(255),
  source_note_ids UUID[] NOT NULL,
  html_content TEXT NOT NULL,
  pdf_url TEXT,
  insights JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Acceptance Criteria:**
- ✅ Can select 2-5 notes for merge
- ✅ Duplicates removed from output
- ✅ Gaps identified and listed
- ✅ Master guide covers all unique content
- ✅ Sources attributed correctly
- ✅ PDF exportable
- ✅ Saved to database

---

### FEATURE 6: Integrated Code Sandbox ⭐⭐

**What It Is:**
An in-browser code editor that detects code snippets in notes and lets students run them without leaving the app.

**Supported Languages (MVP):**
- Python
- JavaScript
- Java (optional, via API)

**User Flow:**
```
User opens note with code snippet
              ↓
Code block highlighted/detected
              ↓
"Run Code" button appears
              ↓
User clicks → Code editor opens (right panel)
              ↓
User can modify code
              ↓
Click "Run" → Output appears
              ↓
If error: AI "Fix Code" button appears
              ↓
AI explains error + suggests fix
```

**API Contract:**
```
POST /api/sandbox/execute
Request:
{
  code: "print('Hello World')",
  language: "python",
  userId: "user_xyz"
}

Response:
{
  success: true,
  output: "Hello World\n",
  error: null,
  executionTime: 0.23,
  memoryUsed: "12MB"
}

POST /api/sandbox/fix
Request:
{
  code: "prnt('Hello')",
  language: "python",
  error: "NameError: name 'prnt' is not defined",
  userId: "user_xyz"
}

Response:
{
  success: true,
  explanation: "You have a typo: 'prnt' should be 'print'",
  fixedCode: "print('Hello')",
  changes: ["Line 1: 'prnt' → 'print'"]
}
```

**Execution Security:**
- Timeout: 5 seconds max
- Memory limit: 64MB
- No system calls
- No file system access
- Use Piston API (hosted sandboxed execution) — safer for hackathon

**Acceptance Criteria:**
- ✅ Code editor renders with syntax highlighting
- ✅ Python execution works
- ✅ JavaScript execution works
- ✅ Errors displayed clearly
- ✅ AI fix works on errors
- ✅ Timeout handled gracefully
- ✅ No server security risks

---

## 🗄️ COMPLETE DATABASE SCHEMA

```sql
-- Users (Firebase Auth handles auth, this tracks metadata)
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  display_name VARCHAR(100),
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_active TIMESTAMPTZ DEFAULT NOW()
);

-- Notes (Core entity)
CREATE TABLE notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  subject VARCHAR(100),
  original_file_url TEXT,
  extracted_text TEXT NOT NULL,
  word_count INTEGER,
  ocr_confidence FLOAT,
  format VARCHAR(20),
  tags TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Chat Sessions
CREATE TABLE chat_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  note_id UUID NOT NULL REFERENCES notes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Chat Messages
CREATE TABLE chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES chat_sessions(id) ON DELETE CASCADE,
  role VARCHAR(10) CHECK (role IN ('user', 'assistant')) NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Quizzes
CREATE TABLE quizzes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  note_id UUID NOT NULL REFERENCES notes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  difficulty VARCHAR(10) CHECK (difficulty IN ('easy','medium','hard')) NOT NULL,
  questions JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Quiz Attempts
CREATE TABLE quiz_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id UUID NOT NULL REFERENCES quizzes(id),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  answers JSONB NOT NULL,
  score INTEGER,
  total INTEGER,
  percentage FLOAT,
  time_taken INTEGER,
  submitted_at TIMESTAMPTZ DEFAULT NOW()
);

-- Cheat Sheets
CREATE TABLE cheatsheets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  note_id UUID NOT NULL REFERENCES notes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255),
  html_content TEXT NOT NULL,
  pdf_url TEXT,
  word_count INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Merged Guides (Group Brain)
CREATE TABLE merged_guides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  topic VARCHAR(255),
  source_note_ids UUID[] NOT NULL,
  html_content TEXT NOT NULL,
  pdf_url TEXT,
  insights JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Performance Metrics (for progress tracking)
CREATE TABLE performance_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  quizzes_taken INTEGER DEFAULT 0,
  avg_score FLOAT,
  notes_uploaded INTEGER DEFAULT 0,
  cheatsheets_generated INTEGER DEFAULT 0,
  study_minutes INTEGER DEFAULT 0,
  UNIQUE(user_id, date)
);
```

---

## 🔗 COMPLETE API REFERENCE

```
BASE URL: /api

NOTES:
  POST   /api/notes/upload         Upload and OCR a note
  GET    /api/notes                List user's notes
  GET    /api/notes/:id            Get single note
  PUT    /api/notes/:id            Update note title/tags
  DELETE /api/notes/:id            Delete note

CHAT:
  POST   /api/chat/message         Send message (with note context)
  GET    /api/chat/history/:noteId Get chat history for a note
  DELETE /api/chat/session/:id     Clear chat session

QUIZ:
  POST   /api/quiz/generate        Generate quiz from note
  POST   /api/quiz/submit          Submit quiz answers
  GET    /api/quiz/history         User's quiz history
  GET    /api/quiz/:id             Get specific quiz

CHEAT SHEET:
  POST   /api/cheatsheet/generate  Generate cheat sheet
  GET    /api/cheatsheet/:id       Get cheat sheet
  GET    /api/cheatsheet/:id/download  Download as PDF
  GET    /api/cheatsheet/history   User's cheat sheets

GROUP BRAIN:
  POST   /api/groupbrain/merge     Merge multiple notes
  GET    /api/groupbrain/:id       Get merged guide
  GET    /api/groupbrain/history   User's merged guides

CODE SANDBOX:
  POST   /api/sandbox/execute      Execute code
  POST   /api/sandbox/fix          AI-fix code with error

ANALYTICS:
  GET    /api/analytics/progress   Progress over time
  GET    /api/analytics/activity   Activity heatmap data
  GET    /api/analytics/summary    User stats summary
```

---

## 🛠️ TECH STACK (DETAILED)

```
FRONTEND:
├─ Framework: React 18 + Vite
├─ Styling: Tailwind CSS
├─ Animations: GSAP
├─ Icons: Lucide React
├─ HTTP Client: Axios
├─ PDF Export: html2pdf.js
├─ Code Editor: CodeMirror or Monaco Editor
├─ Charts: Recharts or Chart.js
└─ Routing: React Router v6

BACKEND:
├─ Runtime: Node.js 18+
├─ Framework: Express.js
├─ Middleware: CORS, Helmet, Morgan
├─ File Upload: Multer
├─ Validation: Joi or Zod
└─ Rate Limiting: express-rate-limit

DATABASE & STORAGE:
├─ Database: Supabase (PostgreSQL)
├─ File Storage: Supabase Storage
└─ Realtime (optional): Supabase Realtime

AUTHENTICATION:
├─ Provider: Firebase Authentication
└─ Method: Google OAuth + Email/Password

AI & ML:
├─ LLM: Google Gemini 1.5 Flash API
├─ OCR: Tesseract.js (images)
├─ PDF Parser: pdfjs-dist
├─ DOCX Parser: mammoth.js
└─ Code Execution: Piston API

DEPLOYMENT:
├─ Frontend: Vercel
├─ Backend: Railway or Render
└─ CDN: Cloudflare (optional)
```

---

## ⚠️ KNOWN GAPS & WEAKNESSES TO FIX

### Gap 1: No Clear Performance Claims
```
PROBLEM: "Sub-1.5 second guarantee" is false.
FIX: State realistic times:
  - Chat response: 2-3 seconds (Gemini latency)
  - Quiz generation: 3-5 seconds
  - Cheat sheet: 4-6 seconds
  - OCR: 2-8 seconds (file size dependent)
```

### Gap 2: Group Brain Too Complex for MVP
```
PROBLEM: Real-time merge from 5 students is too complex.
FIX: Simplify for hackathon:
  - Allow 1 user to select 2-3 of their OWN notes
  - Merge those into master guide
  - Label as "Beta Feature"
  - No real-time collaboration needed
```

### Gap 3: Code Sandbox Security
```
PROBLEM: Self-hosted execution is a security liability.
FIX: Use Piston API (free, sandboxed):
  - Pre-built sandbox, no security risk
  - Supports Python, JavaScript, Java, C++
  - Free tier available
  - API: https://emkc.org/api/v2/piston/execute
```

### Gap 4: Firebase + Supabase Confusion
```
PROBLEM: Two auth systems is confusing.
FIX: 
  - Firebase Auth: ONLY for authentication (login/logout)
  - Supabase: ONLY for database and file storage
  - Backend verifies Firebase JWT, stores userId in Supabase
  - Clear separation of concerns
```

### Gap 5: Missing Error States
```
PROBLEM: No mention of error handling anywhere.
FIX: Every feature needs:
  - Loading state
  - Success state
  - Error state (user-friendly message)
  - Empty state (no notes yet)
```

### Gap 6: No Offline Mode
```
PROBLEM: Complete absence of offline functionality.
FIX FOR MVP: 
  - Add "Coming Soon" banner in settings
  - Cache last viewed note in localStorage
  - Clear message: "Offline mode coming in v2.0"
```

### Gap 7: Mobile UX Not Specified
```
PROBLEM: Split-screen chat doesn't work on mobile.
FIX:
  - Desktop: True split-screen (50/50)
  - Tablet: 60/40 split
  - Mobile: Tab-based (Note | Chat tabs)
  - All features mobile responsive
```

---

## 📊 SUCCESS METRICS (Hackathon Demo)

```
FEATURE COMPLETION:
├─ OCR Upload: ✅ Working
├─ AI Chat: ✅ Working
├─ Quiz Generator: ✅ Working
├─ Cheat Sheet: ✅ Working
├─ Group Brain: ⭐ Simplified version
└─ Code Sandbox: ⭐ Using Piston API

PERFORMANCE:
├─ Page load: < 2 seconds
├─ Chat response: 2-3 seconds
├─ Quiz generation: < 5 seconds
├─ OCR: < 8 seconds

CODE QUALITY:
├─ No console errors
├─ All APIs respond 2xx
├─ Mobile responsive
└─ Clean Git history (20+ commits)
```

---

## 🎬 DEMO SCRIPT (3 Minutes)

```
[0:00-0:30] Upload Phase
"I'll upload a handwritten physics note."
→ Upload → OCR extracts text → "Note ready!"

[0:30-1:00] Chat Phase
"Now I'll ask my Study Buddy about it."
→ Ask question → AI answers based on note

[1:00-1:30] Quiz Phase
"Let's test what I know."
→ Generate medium quiz → Answer 3 questions → Score

[1:30-2:00] Cheat Sheet Phase
"Exam in 1 hour? Here's my cheat sheet."
→ Generate → Beautiful one-pager → Download PDF

[2:00-2:30] Code Sandbox (CS Demo)
"My notes have Python code — let me run it."
→ Code runs → Error → AI fixes it

[2:30-3:00] Closing
"Everything in one tab. No more switching."
```

---

## 📅 BUILD TIMELINE (48-72 Hours)

```
HOUR 0-6: Foundation
├─ Project setup (React + Vite + Tailwind + Node.js + Express)
├─ Supabase database schema created
├─ Firebase Auth configured
└─ Basic routing working

HOUR 6-18: Core Features
├─ File upload + OCR working
├─ Note storage and retrieval
├─ Gemini API integrated
└─ Chat interface working

HOUR 18-30: Feature Build
├─ Quiz generator (all 3 difficulties)
├─ Quiz submission + scoring
├─ Cheat sheet generation
└─ PDF export

HOUR 30-42: Advanced Features
├─ Group Brain (simplified)
├─ Code Sandbox (Piston API)
├─ Analytics basic
└─ Performance tracking

HOUR 42-48: Polish + Deploy
├─ Full testing
├─ UI polish
├─ Deploy to Vercel + Railway
└─ Demo preparation
```

---

**This PRD is the single source of truth for NoteVault. All features must be implemented EXACTLY as specified here.**

