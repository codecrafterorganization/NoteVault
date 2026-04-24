# ⚡ ANTIGRAVITY MASTER EXECUTION PROMPT
## NoteVault — Complete System Build + All Gaps Fixed
### Version: FINAL | Zero Tolerance for Incomplete Features

---

## 🎯 AGENT IDENTITY & MISSION

You are deployed as **NoteVault System Architect** on Antigravity infrastructure.

**Your mission:** Build and fix the complete NoteVault AI learning system from existing frontend, fixing all identified weaknesses, implementing all features correctly, and committing to GitHub on a strict timeline.

**Your laws:**
1. ❌ NEVER say "done" without running a real test
2. ❌ NEVER skip error handling
3. ❌ NEVER fake data or mock evaluations in production code
4. ❌ NEVER leave a feature partially working
5. ❌ NEVER commit broken code
6. ✅ ALWAYS test each feature before moving to next
7. ✅ ALWAYS commit with meaningful messages after each feature
8. ✅ ALWAYS fix issues before proceeding
9. ✅ ALWAYS handle edge cases

---

## 🚨 CRITICAL GAPS TO FIX FIRST (Before building anything new)

**Read this section COMPLETELY before writing a single line of code.**

### FIX 1: Performance Claims → Be Honest
```
CURRENT (WRONG):
"Sub-1.5 second response guarantee via proprietary IPv4 routing"

THIS IS TECHNICALLY IMPOSSIBLE because:
- Gemini API call alone: 1,000-2,000ms
- Network latency: 50-200ms
- Backend processing: 100-200ms
- Database queries: 50-100ms
- TOTAL MINIMUM: ~1,400ms (no code can beat physics)

FIX → Update all docs, README, and UI to say:
"Typical response time: 2-3 seconds (includes AI reasoning)"

ACTION:
1. Find any text that says "sub-1.5 second" in codebase
2. Replace with "2-3 seconds typical response"
3. Add loading states that make this feel fast (streaming)
4. Commit: "fix: update response time claims to realistic values"
```

### FIX 2: Firebase Auth + Supabase → Clear Separation
```
CURRENT PROBLEM:
Two auth/database systems used ambiguously.
This causes confusion about where data lives.

CORRECT ARCHITECTURE:
Firebase Auth → ONLY for login/logout/user identity
Supabase → ONLY for database + file storage

FLOW:
User logs in → Firebase issues JWT
Frontend sends JWT in headers → Backend verifies
Backend extracts userId → Uses in Supabase queries
NO auth-related data stored in Supabase

IMPLEMENTATION:
// backend/middleware/auth.js
const admin = require('firebase-admin');

const verifyToken = async (req, res, next) => {
  const token = req.headers.authorization?.split('Bearer ')[1];
  if (!token) return res.status(401).json({ error: 'No token provided' });
  
  try {
    const decoded = await admin.auth().verifyIdToken(token);
    req.userId = decoded.uid;
    req.userEmail = decoded.email;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

module.exports = verifyToken;

ACTION:
1. Create this middleware
2. Apply to ALL protected routes
3. Remove any other auth logic
4. Commit: "fix: clarify auth architecture - Firebase JWT + Supabase DB"
```

### FIX 3: Group Brain → Simplify for Hackathon
```
CURRENT PROBLEM:
"5 students merge notes in real-time" is impossible in 48 hours.
Needs: WebSockets, multi-user sessions, conflict resolution = 20+ hours

SIMPLIFIED VERSION (Buildable in 6 hours):
Same user selects 2-3 of their OWN uploaded notes
AI merges them into one Master Guide
Label: "Group Study Mode (Beta)"

IMPLEMENTATION CHANGE:
// Old (impossible)
{ studentIds: ["s1","s2","s3"], noteIds: ["n1","n2","n3"] }

// New (doable)
{ userId: "user_xyz", noteIds: ["n1","n2","n3"] }

ACTION:
1. Update Group Brain API to accept multiple noteIds from same user
2. Remove any real-time collaboration code
3. Add "Beta" label in UI
4. Commit: "fix: simplify group brain to single-user multi-note merge"
```

### FIX 4: Code Sandbox → Use Piston API (No Security Risk)
```
CURRENT PROBLEM:
Self-hosted code execution = massive security vulnerability
Risk: Users run rm -rf /, fork bombs, infinite loops

CORRECT SOLUTION:
Use Piston API (already sandboxed, free, battle-tested)
Endpoint: POST https://emkc.org/api/v2/piston/execute

IMPLEMENTATION:
// backend/services/pistonService.js
const executePiston = async (code, language) => {
  const langMap = {
    'python': { language: 'python', version: '3.10.0' },
    'javascript': { language: 'javascript', version: '18.15.0' },
    'java': { language: 'java', version: '15.0.2' }
  };
  
  const config = langMap[language];
  if (!config) throw new Error('Unsupported language');
  
  const response = await fetch('https://emkc.org/api/v2/piston/execute', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      language: config.language,
      version: config.version,
      files: [{ content: code }],
      stdin: '',
      args: [],
      compile_timeout: 10000,
      run_timeout: 5000
    })
  });
  
  return response.json();
};

ACTION:
1. Create pistonService.js as shown
2. Update /api/sandbox/execute to use Piston
3. Add timeout handling (5 seconds max)
4. Add language validation
5. Commit: "fix: replace self-hosted sandbox with Piston API (security)"
```

### FIX 5: Mobile Responsive Strategy
```
CURRENT PROBLEM:
Split-screen chat doesn't work on 375px mobile screen.

RESPONSIVE RULES:
Desktop (1024px+): 50/50 split-screen (note | chat)
Tablet (768-1023px): 60/40 split
Mobile (< 768px): TAB-BASED NAVIGATION
  [Note] [Chat] [Quiz] tabs at bottom
  Full width each

IMPLEMENTATION (Tailwind):
// ChatLayout.jsx
<div className="flex flex-col md:flex-row h-screen">
  {/* Left: Note Viewer */}
  <div className={`
    w-full md:w-1/2 
    ${activeTab !== 'note' && 'hidden md:block'}
  `}>
    <NoteViewer />
  </div>
  
  {/* Right: Chat */}
  <div className={`
    w-full md:w-1/2
    ${activeTab !== 'chat' && 'hidden md:block'}
  `}>
    <ChatPanel />
  </div>
  
  {/* Mobile Tab Bar (visible only on mobile) */}
  <div className="fixed bottom-0 left-0 right-0 flex md:hidden bg-white border-t">
    <button onClick={() => setActiveTab('note')}>📄 Note</button>
    <button onClick={() => setActiveTab('chat')}>💬 Chat</button>
    <button onClick={() => setActiveTab('quiz')}>📝 Quiz</button>
  </div>
</div>

ACTION:
1. Implement responsive layout as shown
2. Test on 375px, 768px, 1024px
3. Verify all features work on mobile
4. Commit: "fix: implement mobile-first responsive layout"
```

### FIX 6: Proper Error States Everywhere
```
CURRENT PROBLEM:
No specification of what happens when things fail.

REQUIRED FOR EVERY FEATURE:
1. Loading State: Spinner + descriptive text
2. Success State: Content + action buttons
3. Error State: Clear message + retry option
4. Empty State: No data + call to action

COMPONENT PATTERN (required for ALL async components):
const FeatureComponent = () => {
  const [status, setStatus] = useState('idle'); // idle|loading|success|error
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  
  return (
    <>
      {status === 'idle' && <IdleUI />}
      {status === 'loading' && <LoadingSpinner text="Generating..." />}
      {status === 'success' && <SuccessUI data={data} />}
      {status === 'error' && <ErrorUI message={error} onRetry={retry} />}
    </>
  );
};

ACTION:
1. Create reusable LoadingSpinner component
2. Create reusable ErrorMessage component
3. Create reusable EmptyState component
4. Apply to ALL feature components
5. Commit: "feat: add proper loading/error/empty states to all features"
```

---

## 🏗️ SYSTEM ARCHITECTURE (BUILD THIS EXACTLY)

```
notevault/
├── frontend/                    # React + Vite
│   ├── src/
│   │   ├── components/
│   │   │   ├── ui/
│   │   │   │   ├── LoadingSpinner.jsx
│   │   │   │   ├── ErrorMessage.jsx
│   │   │   │   ├── EmptyState.jsx
│   │   │   │   └── Button.jsx
│   │   │   ├── note/
│   │   │   │   ├── NoteUpload.jsx
│   │   │   │   ├── NoteViewer.jsx
│   │   │   │   └── NoteList.jsx
│   │   │   ├── chat/
│   │   │   │   ├── ChatPanel.jsx
│   │   │   │   ├── ChatMessage.jsx
│   │   │   │   └── ChatInput.jsx
│   │   │   ├── quiz/
│   │   │   │   ├── QuizGenerator.jsx
│   │   │   │   ├── QuizQuestion.jsx
│   │   │   │   └── QuizResults.jsx
│   │   │   ├── cheatsheet/
│   │   │   │   ├── CheatSheetGenerator.jsx
│   │   │   │   └── CheatSheetDisplay.jsx
│   │   │   ├── sandbox/
│   │   │   │   ├── CodeEditor.jsx
│   │   │   │   └── CodeOutput.jsx
│   │   │   └── groupbrain/
│   │   │       └── GroupBrainMerger.jsx
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx
│   │   │   ├── StudyPage.jsx
│   │   │   ├── QuizPage.jsx
│   │   │   ├── CheatSheetPage.jsx
│   │   │   ├── CodePage.jsx
│   │   │   └── GroupBrainPage.jsx
│   │   ├── services/
│   │   │   ├── api.js           # Base Axios config
│   │   │   ├── noteService.js
│   │   │   ├── chatService.js
│   │   │   ├── quizService.js
│   │   │   ├── cheatsheetService.js
│   │   │   └── sandboxService.js
│   │   └── hooks/
│   │       ├── useNote.js
│   │       ├── useChat.js
│   │       └── useQuiz.js
│
├── backend/                     # Node.js + Express
│   ├── src/
│   │   ├── routes/
│   │   │   ├── noteRoutes.js
│   │   │   ├── chatRoutes.js
│   │   │   ├── quizRoutes.js
│   │   │   ├── cheatsheetRoutes.js
│   │   │   ├── sandboxRoutes.js
│   │   │   ├── groupbrainRoutes.js
│   │   │   └── analyticsRoutes.js
│   │   ├── controllers/
│   │   │   ├── noteController.js
│   │   │   ├── chatController.js
│   │   │   ├── quizController.js
│   │   │   ├── cheatsheetController.js
│   │   │   ├── sandboxController.js
│   │   │   └── groupbrainController.js
│   │   ├── services/
│   │   │   ├── geminiService.js  # All Gemini API calls
│   │   │   ├── ocrService.js     # Tesseract + PDF parsing
│   │   │   ├── pdfService.js     # html2pdf generation
│   │   │   ├── pistonService.js  # Code execution
│   │   │   └── supabaseService.js
│   │   ├── middleware/
│   │   │   ├── auth.js           # Firebase JWT verification
│   │   │   ├── errorHandler.js
│   │   │   ├── rateLimiter.js
│   │   │   └── upload.js         # Multer config
│   │   └── config/
│   │       ├── supabase.js
│   │       ├── firebase.js
│   │       └── gemini.js
│   └── server.js
```

---

## 🔧 IMPLEMENTATION PHASES (SEQUENTIAL — DO NOT SKIP)

---

### PHASE 0: Environment & Setup (30 min)

```
ACTIONS:
□ Create .env file with required variables:
  GEMINI_API_KEY=
  SUPABASE_URL=
  SUPABASE_ANON_KEY=
  SUPABASE_SERVICE_KEY=
  FIREBASE_PROJECT_ID=
  FIREBASE_PRIVATE_KEY=
  FIREBASE_CLIENT_EMAIL=
  PORT=5000

□ Install backend dependencies:
  npm install express cors helmet morgan multer
  npm install @supabase/supabase-js firebase-admin
  npm install tesseract.js pdfjs-dist mammoth
  npm install @google/generative-ai
  npm install express-rate-limit joi dotenv
  npm install -D nodemon

□ Install frontend dependencies:
  npm install axios lucide-react recharts
  npm install html2pdf.js
  npm install @monaco-editor/react  ← for code editor

□ Run database migrations:
  Execute all CREATE TABLE statements from PRD.md

□ Verify connections:
  - Supabase connection: node -e "require('./src/config/supabase')"
  - Firebase: node -e "require('./src/config/firebase')"
  - Gemini: Test with simple prompt

VALIDATION:
□ npm run dev → No errors
□ Supabase tables visible in dashboard
□ Firebase project configured
□ All env variables set

GIT COMMIT:
git commit -m "feat: complete environment setup and dependencies"
git push origin main
```

---

### PHASE 1: Notes Upload + OCR (1.5 hours)

```
BUILD: POST /api/notes/upload

STEP 1: Multer Configuration
// backend/src/middleware/upload.js
const multer = require('multer');
const path = require('path');

const storage = multer.memoryStorage(); // Store in memory, not disk

const fileFilter = (req, file, cb) => {
  const allowed = ['.jpg','.jpeg','.png','.pdf','.docx','.txt'];
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowed.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error(`File type ${ext} not supported`), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB
});

module.exports = upload;

STEP 2: OCR Service
// backend/src/services/ocrService.js
const Tesseract = require('tesseract.js');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');
const path = require('path');

const extractText = async (fileBuffer, mimeType, filename) => {
  const ext = path.extname(filename).toLowerCase();
  
  try {
    if (['.jpg','.jpeg','.png'].includes(ext)) {
      // Image OCR
      const { data: { text, confidence } } = await Tesseract.recognize(
        fileBuffer, 'eng',
        { logger: m => console.log('OCR:', m.status) }
      );
      return { text: text.trim(), confidence: confidence / 100, method: 'ocr' };
    }
    
    if (ext === '.pdf') {
      const data = await pdfParse(fileBuffer);
      if (data.text.trim().length > 50) {
        // Digital PDF
        return { text: data.text.trim(), confidence: 1.0, method: 'pdf-parse' };
      } else {
        // Scanned PDF → OCR
        const { data: { text, confidence } } = await Tesseract.recognize(
          fileBuffer, 'eng'
        );
        return { text: text.trim(), confidence: confidence / 100, method: 'ocr-pdf' };
      }
    }
    
    if (ext === '.docx') {
      const { value: text } = await mammoth.extractRawText({ buffer: fileBuffer });
      return { text: text.trim(), confidence: 1.0, method: 'docx-parse' };
    }
    
    if (ext === '.txt') {
      return { text: fileBuffer.toString('utf8'), confidence: 1.0, method: 'text' };
    }
    
    throw new Error('Unsupported file type');
  } catch (err) {
    throw new Error(`Text extraction failed: ${err.message}`);
  }
};

module.exports = { extractText };

STEP 3: Note Controller
// backend/src/controllers/noteController.js
const { createClient } = require('@supabase/supabase-js');
const { extractText } = require('../services/ocrService');

const uploadNote = async (req, res) => {
  try {
    const { userId } = req; // From auth middleware
    const file = req.file;
    
    // Validate
    if (!file) return res.status(400).json({ success: false, error: 'No file uploaded' });
    
    // Extract text
    const { text, confidence, method } = await extractText(
      file.buffer, file.mimetype, file.originalname
    );
    
    if (!text || text.length < 20) {
      return res.status(422).json({
        success: false,
        error: 'Could not extract readable text. Try a clearer image.'
      });
    }
    
    // Upload original file to Supabase Storage
    const supabase = require('../config/supabase');
    const filename = `${userId}/${Date.now()}_${file.originalname}`;
    const { data: storageData, error: storageError } = await supabase.storage
      .from('notes')
      .upload(filename, file.buffer, { contentType: file.mimetype });
    
    if (storageError) throw storageError;
    
    const { data: urlData } = supabase.storage.from('notes').getPublicUrl(filename);
    
    // Save to database
    const { data: note, error: dbError } = await supabase
      .from('notes')
      .insert({
        user_id: userId,
        title: req.body.title || file.originalname.replace(/\.[^.]+$/, ''),
        subject: req.body.subject || null,
        original_file_url: urlData.publicUrl,
        extracted_text: text,
        word_count: text.split(/\s+/).length,
        ocr_confidence: confidence,
        format: ['jpg','jpeg','png'].includes(file.originalname.split('.').pop()) ? 'image' : 
                file.originalname.endsWith('.pdf') ? 'pdf' : 
                file.originalname.endsWith('.docx') ? 'docx' : 'text'
      })
      .select()
      .single();
    
    if (dbError) throw dbError;
    
    return res.status(201).json({
      success: true,
      noteId: note.id,
      title: note.title,
      extractedText: text,
      wordCount: note.word_count,
      ocrConfidence: confidence,
      extractionMethod: method,
      fileUrl: urlData.publicUrl,
      createdAt: note.created_at
    });
    
  } catch (err) {
    console.error('Upload error:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
};

TESTING (Run These):
□ Upload clear JPG image → extractedText.length > 50 ✓
□ Upload scanned PDF → text extracted via OCR ✓
□ Upload DOCX → text extracted via mammoth ✓
□ Upload invalid file (.exe) → 400 error with message ✓
□ Upload > 10MB file → 400 error "file too large" ✓
□ Check Supabase storage → file visible ✓
□ Check Supabase DB → row created ✓

GIT COMMITS (In Order):
git commit -m "feat: create note upload middleware (multer, file filter)"
git commit -m "feat: implement OCR service (image, pdf, docx, txt)"
git commit -m "feat: implement note upload endpoint with Supabase storage"
git commit -m "test: verify all file format uploads working"
git push origin main
```

---

### PHASE 2: AI Chat with Note Context (1.5 hours)

```
BUILD: POST /api/chat/message + GET /api/chat/history/:noteId

STEP 1: Gemini Service
// backend/src/services/geminiService.js
const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

const chatWithContext = async (noteContent, conversationHistory, userMessage) => {
  const systemPrompt = `You are a focused, patient study assistant.
CRITICAL RULE: Answer ONLY based on the note content below. 
If the question is outside the notes, respond: "This topic isn't in your notes. Would you like me to explain it from general knowledge?"
Be concise, clear, and encouraging. Use examples when helpful.

=== STUDENT'S NOTES ===
${noteContent.substring(0, 8000)} // Limit to 8000 chars to stay within context
=== END OF NOTES ===`;

  // Build conversation history for Gemini
  const history = conversationHistory.map(msg => ({
    role: msg.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: msg.content }]
  }));

  const chat = model.startChat({
    history,
    generationConfig: {
      maxOutputTokens: 500,
      temperature: 0.3 // Lower = more focused, less hallucination
    }
  });

  const fullMessage = `${systemPrompt}\n\nUser question: ${userMessage}`;
  const result = await chat.sendMessage(fullMessage);
  
  return result.response.text();
};

module.exports = { chatWithContext };

STEP 2: Chat Controller
const sendMessage = async (req, res) => {
  const { noteId, message, conversationHistory = [] } = req.body;
  const { userId } = req;
  
  // Get note content from DB
  const { data: note } = await supabase
    .from('notes')
    .select('extracted_text, title')
    .eq('id', noteId)
    .eq('user_id', userId)
    .single();
  
  if (!note) return res.status(404).json({ error: 'Note not found' });
  
  // Get or create chat session
  let { data: session } = await supabase
    .from('chat_sessions')
    .select('id')
    .eq('note_id', noteId)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();
  
  if (!session) {
    const { data: newSession } = await supabase
      .from('chat_sessions')
      .insert({ note_id: noteId, user_id: userId })
      .select()
      .single();
    session = newSession;
  }
  
  // AI response
  const aiResponse = await chatWithContext(
    note.extracted_text,
    conversationHistory,
    message
  );
  
  // Save both messages
  await supabase.from('chat_messages').insert([
    { session_id: session.id, role: 'user', content: message },
    { session_id: session.id, role: 'assistant', content: aiResponse }
  ]);
  
  return res.json({
    success: true,
    response: aiResponse,
    sessionId: session.id
  });
};

TESTING:
□ Send question about note content → Relevant AI answer ✓
□ Send question outside notes → "Not in your notes..." response ✓
□ Send 5 messages → History maintained, context preserved ✓
□ Invalid noteId → 404 error ✓
□ Empty message → 400 error ✓
□ Check DB → Messages saved ✓
□ Response time measured: log and verify typically 2-4 seconds ✓

GIT COMMITS:
git commit -m "feat: implement Gemini AI service with note context"
git commit -m "feat: implement chat endpoint with session management"
git commit -m "feat: add chat history endpoint"
git commit -m "test: verify AI chat responds using note content"
git push origin main
```

---

### PHASE 3: Adaptive Quiz Generator (1.5 hours)

```
BUILD: POST /api/quiz/generate + POST /api/quiz/submit

STEP 1: Quiz Generation Prompt Engineering
// In geminiService.js
const generateQuiz = async (noteContent, difficulty, questionCount = 10) => {
  const difficultyInstructions = {
    easy: `
      - Ask about facts directly stated in the notes
      - Simple, clear question language
      - Incorrect options are clearly wrong but plausible
      - One obviously correct answer`,
    medium: `
      - Require understanding and application of concepts
      - Test connections between ideas in the notes
      - Options are all plausible but one is best
      - Some questions may require inference`,
    hard: `
      - Require analysis and synthesis of multiple concepts
      - Test deep understanding
      - All options are plausible and nuanced
      - Questions require reasoning, not just recall`
  };
  
  const prompt = `
You are an expert educator creating a quiz from student notes.

DIFFICULTY: ${difficulty.toUpperCase()}
${difficultyInstructions[difficulty]}

STUDENT NOTES:
${noteContent.substring(0, 6000)}

Generate exactly ${questionCount} multiple choice questions.

CRITICAL RULES:
1. Every question MUST come from the notes above — no outside knowledge
2. Each question has exactly 4 options (A, B, C, D)
3. Only ONE option is correct
4. Explanations must reference the notes

Return ONLY valid JSON (no markdown, no backticks, no explanation):
{
  "questions": [
    {
      "id": "q1",
      "question": "Question text?",
      "options": {
        "A": "Option A",
        "B": "Option B",
        "C": "Option C",
        "D": "Option D"
      },
      "correct": "B",
      "explanation": "B is correct because [reference to notes]..."
    }
  ]
}`;

  const result = await model.generateContent(prompt);
  const raw = result.response.text();
  
  // Parse and validate
  let parsed;
  try {
    // Remove any accidental markdown formatting
    const cleaned = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    parsed = JSON.parse(cleaned);
  } catch (e) {
    throw new Error('AI returned invalid JSON. Retrying...');
  }
  
  // Validate structure
  if (!parsed.questions || parsed.questions.length === 0) {
    throw new Error('No questions generated');
  }
  
  // Validate each question
  parsed.questions.forEach((q, i) => {
    if (!q.question) throw new Error(`Question ${i+1} missing text`);
    if (!q.options?.A || !q.options?.B || !q.options?.C || !q.options?.D) {
      throw new Error(`Question ${i+1} missing options`);
    }
    if (!['A','B','C','D'].includes(q.correct)) {
      throw new Error(`Question ${i+1} has invalid correct answer`);
    }
  });
  
  return parsed.questions;
};

STEP 2: Quiz Controller
const generateQuizController = async (req, res) => {
  const { noteId, difficulty, questionCount = 10 } = req.body;
  const { userId } = req;
  
  if (!['easy','medium','hard'].includes(difficulty)) {
    return res.status(400).json({ error: 'Invalid difficulty. Use: easy, medium, hard' });
  }
  
  const { data: note } = await supabase
    .from('notes')
    .select('extracted_text')
    .eq('id', noteId)
    .eq('user_id', userId)
    .single();
  
  if (!note) return res.status(404).json({ error: 'Note not found' });
  
  let questions;
  let attempts = 0;
  const maxAttempts = 3;
  
  while (attempts < maxAttempts) {
    try {
      questions = await generateQuiz(note.extracted_text, difficulty, questionCount);
      break; // Success
    } catch (err) {
      attempts++;
      if (attempts === maxAttempts) {
        return res.status(500).json({ error: 'Quiz generation failed after 3 attempts' });
      }
    }
  }
  
  // Save quiz (without correct answers in response)
  const { data: quiz } = await supabase
    .from('quizzes')
    .insert({
      note_id: noteId,
      user_id: userId,
      difficulty,
      questions // Full questions stored in DB including correct answers
    })
    .select()
    .single();
  
  // Return questions WITHOUT correct answers to frontend
  const sanitized = questions.map(q => ({
    id: q.id,
    question: q.question,
    options: q.options
    // NO correct, NO explanation yet
  }));
  
  return res.status(201).json({
    success: true,
    quizId: quiz.id,
    difficulty,
    questions: sanitized,
    totalQuestions: sanitized.length
  });
};

STEP 3: Submit Quiz
const submitQuiz = async (req, res) => {
  const { quizId, answers, timeTaken } = req.body;
  const { userId } = req;
  
  // Get quiz with answers from DB
  const { data: quiz } = await supabase
    .from('quizzes')
    .select('questions, note_id')
    .eq('id', quizId)
    .single();
  
  if (!quiz) return res.status(404).json({ error: 'Quiz not found' });
  
  // Score the quiz
  const results = quiz.questions.map(q => {
    const userAnswer = answers.find(a => a.questionId === q.id)?.selected;
    const isCorrect = userAnswer === q.correct;
    return {
      questionId: q.id,
      question: q.question,
      userAnswer: userAnswer || 'Not answered',
      correctAnswer: q.correct,
      correct: isCorrect,
      explanation: q.explanation
    };
  });
  
  const score = results.filter(r => r.correct).length;
  const percentage = Math.round((score / results.length) * 100);
  
  // Save attempt
  await supabase.from('quiz_attempts').insert({
    quiz_id: quizId,
    user_id: userId,
    answers,
    score,
    total: results.length,
    percentage,
    time_taken: timeTaken
  });
  
  // Update performance metrics
  const today = new Date().toISOString().split('T')[0];
  await supabase.from('performance_metrics').upsert({
    user_id: userId,
    date: today,
    quizzes_taken: 1,
    avg_score: percentage
  }, { onConflict: 'user_id, date' });
  
  return res.json({
    success: true,
    score,
    total: results.length,
    percentage,
    grade: percentage >= 90 ? 'A' : percentage >= 80 ? 'B+' : percentage >= 70 ? 'B' : percentage >= 60 ? 'C' : 'F',
    results,
    timeTaken
  });
};

TESTING:
□ Generate easy quiz → 10 simple recall questions ✓
□ Generate medium quiz → Questions require understanding ✓
□ Generate hard quiz → Analytical questions ✓
□ Verify correct answers NOT in generate response ✓
□ Submit all correct answers → 100% score ✓
□ Submit all wrong answers → 0% score ✓
□ Submit partial answers → Correct percentage ✓
□ Quiz attempt saved in DB ✓
□ Performance metrics updated ✓

GIT COMMITS:
git commit -m "feat: implement quiz generation with difficulty levels"
git commit -m "feat: add quiz submission and scoring logic"
git commit -m "feat: update performance metrics on quiz completion"
git commit -m "test: verify all 3 difficulty levels and scoring"
git push origin main
```

---

### PHASE 4: Cheat Sheet Generator + PDF Export (1.5 hours)

```
BUILD: POST /api/cheatsheet/generate

STEP 1: Cheat Sheet Prompt
const generateCheatSheet = async (noteContent, title) => {
  const prompt = `
You are an expert at creating study guides.
Create a ONE-PAGE "high-yield" cheat sheet from these notes.

STUDENT NOTES:
${noteContent.substring(0, 6000)}

RULES:
1. Condense 10 pages into 1 page
2. Do NOT copy-paste sentences from original
3. Rewrite in condensed, memorable form
4. Include ALL major concepts
5. Use bullet points for clarity
6. Include formulas if applicable
7. Keep total under 350 words

Return ONLY valid HTML (no markdown, no backticks):
<div class="cheatsheet">
  <h1 class="cs-title">${title}</h1>
  
  <div class="cs-section">
    <h2>🔑 Key Concepts</h2>
    <ul>
      <li><strong>Concept:</strong> Brief explanation</li>
    </ul>
  </div>
  
  <div class="cs-section">
    <h2>📐 Formulas & Rules</h2>
    <ul>
      <li>Formula: Explanation</li>
    </ul>
  </div>
  
  <div class="cs-section">
    <h2>💡 Quick Tips</h2>
    <ul>
      <li>Remember: ...</li>
    </ul>
  </div>
  
  <div class="cs-section">
    <h2>🔗 Concept Links</h2>
    <p>A → B → C (flow or relationship)</p>
  </div>
</div>`;

  const result = await model.generateContent(prompt);
  return result.response.text();
};

STEP 2: PDF Generation
// backend/src/services/pdfService.js
const puppeteer = require('puppeteer'); // OR use html-pdf-node

const generatePDF = async (htmlContent, title) => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
  const page = await browser.newPage();
  
  const fullHTML = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        * { box-sizing: border-box; font-family: Arial, sans-serif; }
        body { margin: 20px; font-size: 11px; }
        .cheatsheet { max-width: 700px; }
        .cs-title { font-size: 20px; font-weight: bold; border-bottom: 2px solid #333; }
        .cs-section { margin: 10px 0; }
        .cs-section h2 { font-size: 13px; color: #2563EB; margin: 5px 0; }
        ul { margin: 0; padding-left: 15px; }
        li { margin: 2px 0; line-height: 1.4; }
        strong { color: #1D4ED8; }
      </style>
    </head>
    <body>${htmlContent}</body>
    </html>`;
  
  await page.setContent(fullHTML);
  const pdfBuffer = await page.pdf({
    format: 'A4',
    margin: { top: '15mm', right: '15mm', bottom: '15mm', left: '15mm' },
    printBackground: true
  });
  
  await browser.close();
  return pdfBuffer;
};

TESTING:
□ Generate cheat sheet → HTML renders in browser ✓
□ Verify word count < 400 (not a copy-paste) ✓
□ Verify major concepts from note are included ✓
□ PDF downloads without error ✓
□ PDF is readable on A4 ✓
□ PDF stored in Supabase Storage ✓
□ Download URL works ✓

GIT COMMITS:
git commit -m "feat: implement cheat sheet generation with structured HTML output"
git commit -m "feat: add PDF export with proper A4 formatting"
git commit -m "test: verify cheat sheet quality and PDF download"
git push origin main
```

---

### PHASE 5: Code Sandbox (Piston API — 1 hour)

```
BUILD: POST /api/sandbox/execute + POST /api/sandbox/fix

STEP 1: Piston Execution Service
// backend/src/services/pistonService.js
const executeCode = async (code, language) => {
  const PISTON_URL = 'https://emkc.org/api/v2/piston/execute';
  
  const langConfig = {
    python: { language: 'python', version: '3.10.0' },
    javascript: { language: 'javascript', version: '18.15.0' },
    java: { language: 'java', version: '15.0.2' },
    cpp: { language: 'c++', version: '10.2.0' }
  };
  
  const config = langConfig[language.toLowerCase()];
  if (!config) throw new Error(`Language "${language}" not supported. Try: python, javascript, java`);
  
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000); // 10s timeout
  
  try {
    const response = await fetch(PISTON_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        language: config.language,
        version: config.version,
        files: [{ name: `main.${language}`, content: code }],
        stdin: '',
        args: [],
        compile_timeout: 10000,
        run_timeout: 5000
      }),
      signal: controller.signal
    });
    
    const data = await response.json();
    
    return {
      success: true,
      output: data.run?.stdout || '',
      error: data.run?.stderr || data.compile?.stderr || null,
      exitCode: data.run?.code || 0,
      executionTime: data.run?.wall_time || 0
    };
  } finally {
    clearTimeout(timeout);
  }
};

module.exports = { executeCode };

STEP 2: AI Code Fixer
const fixCode = async (code, language, errorMessage) => {
  const prompt = `
You are a coding expert and teacher.
A student has this ${language} code with an error:

CODE:
\`\`\`${language}
${code}
\`\`\`

ERROR:
${errorMessage}

Provide:
1. Simple explanation of what's wrong (1-2 sentences, student-friendly)
2. The fixed code
3. What changed (list of changes)

Return ONLY valid JSON:
{
  "explanation": "The error is...",
  "fixedCode": "corrected code here",
  "changes": ["change 1", "change 2"]
}`;

  const result = await model.generateContent(prompt);
  const raw = result.response.text().replace(/```json\n?/g,'').replace(/```\n?/g,'').trim();
  return JSON.parse(raw);
};

TESTING:
□ Execute valid Python: print("hello") → "hello" output ✓
□ Execute valid JS: console.log("hi") → "hi" output ✓
□ Execute broken Python: prnt("hi") → Error message ✓
□ Fix broken Python → Fixed code returned ✓
□ Timeout test (infinite loop): `` while True: pass `` → Timeout error ✓
□ Invalid language: "ruby" → Clear error message ✓

GIT COMMITS:
git commit -m "feat: implement code execution via Piston API"
git commit -m "feat: add AI code fixer for error explanation"
git commit -m "test: verify Python, JavaScript execution and error handling"
git push origin main
```

---

### PHASE 6: Group Brain — Simplified (1 hour)

```
BUILD: POST /api/groupbrain/merge

const mergeNotes = async (noteIds, userId, topic) => {
  // Get all notes content
  const { data: notes } = await supabase
    .from('notes')
    .select('title, extracted_text')
    .in('id', noteIds)
    .eq('user_id', userId); // SAME user only (simplified)
  
  if (notes.length < 2) throw new Error('Select at least 2 notes');
  
  const notesContent = notes.map((n, i) => `
=== NOTE ${i+1}: "${n.title}" ===
${n.extracted_text.substring(0, 3000)}
`).join('\n\n');

  const prompt = `
You are an expert study guide creator.
Merge these ${notes.length} student notes on "${topic}" into ONE comprehensive master guide.

${notesContent}

RULES:
1. Combine all unique information
2. Remove duplicate content
3. Organize logically (introduction → concepts → details → summary)
4. Identify what's MISSING (topics not covered by any note)
5. Keep all important details

Return ONLY this JSON:
{
  "masterGuide": {
    "title": "Master Guide: ${topic}",
    "htmlContent": "<div>...</div>",
    "sections": ["Section 1", "Section 2"]
  },
  "insights": {
    "totalWordsCombined": 1200,
    "uniqueTopicsFound": ["topic1", "topic2"],
    "duplicatesRemoved": 15,
    "gaps": ["Topic X not covered by any note"]
  }
}`;

  const result = await model.generateContent(prompt);
  const raw = result.response.text().replace(/```json\n?/g,'').replace(/```\n?/g,'').trim();
  return JSON.parse(raw);
};

TESTING:
□ Select 2 notes → Merged guide generated ✓
□ Content from both notes appears in guide ✓
□ Duplicates count > 0 (realistic) ✓
□ Gaps identified ✓
□ Select 1 note → Error "Select at least 2" ✓

GIT COMMITS:
git commit -m "feat: implement simplified group brain (same-user multi-note merge)"
git commit -m "test: verify note merging and insight generation"
git push origin main
```

---

### PHASE 7: Progress Analytics (1 hour)

```
BUILD: GET /api/analytics/progress + GET /api/analytics/activity

const getProgress = async (userId, days = 30) => {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  const { data: metrics } = await supabase
    .from('performance_metrics')
    .select('*')
    .eq('user_id', userId)
    .gte('date', startDate.toISOString().split('T')[0])
    .order('date', { ascending: true });
  
  const summary = {
    totalQuizzes: metrics.reduce((s, m) => s + (m.quizzes_taken || 0), 0),
    avgScore: metrics.length > 0 
      ? Math.round(metrics.reduce((s, m) => s + (m.avg_score || 0), 0) / metrics.length)
      : 0,
    activeDays: metrics.length,
    notesUploaded: metrics.reduce((s, m) => s + (m.notes_uploaded || 0), 0)
  };
  
  const trend = metrics.map(m => ({
    date: m.date,
    score: m.avg_score || 0,
    quizzes: m.quizzes_taken || 0
  }));
  
  return { summary, trend };
};

const getActivityHeatmap = async (userId) => {
  const { data: metrics } = await supabase
    .from('performance_metrics')
    .select('date, quizzes_taken, notes_uploaded')
    .eq('user_id', userId);
  
  const heatmap = {};
  metrics.forEach(m => {
    heatmap[m.date] = {
      count: (m.quizzes_taken || 0) + (m.notes_uploaded || 0),
      quizzes: m.quizzes_taken || 0,
      notes: m.notes_uploaded || 0
    };
  });
  
  return heatmap;
};

FRONTEND COMPONENTS (Build These):
1. ProgressChart.jsx - Line chart (recharts) showing score over time
2. ActivityHeatmap.jsx - Calendar grid (GitHub-style) showing daily activity

TESTING:
□ Take 3 quizzes on day 1 → Day 1 has activity ✓
□ Upload 2 notes → Activity count increases ✓
□ Get progress for last 30 days → Array of 30 objects ✓
□ Heatmap shows correct dates ✓
□ Empty user → Summary all zeros ✓

GIT COMMITS:
git commit -m "feat: implement progress analytics endpoint"
git commit -m "feat: implement activity heatmap endpoint"
git commit -m "feat: add frontend progress chart and heatmap components"
git push origin main
```

---

### PHASE 8: Full Integration Testing (1-2 hours)

```
THIS IS THE MOST CRITICAL PHASE. NO SHORTCUTS.

RUN THESE TESTS IN ORDER:

TEST SUITE 1: Complete User Journey
──────────────────────────────────
Step 1: Upload note
  curl -X POST /api/notes/upload \
    -F "file=@test_physics.jpg" \
    -F "userId=test_user" \
    -F "title=Physics Notes"
  
  VERIFY:
  ✓ Response has noteId
  ✓ extractedText.length > 100
  ✓ File in Supabase storage

Step 2: Chat about note
  curl -X POST /api/chat/message \
    -d '{"noteId":"...", "message":"What is photosynthesis?"}'
  
  VERIFY:
  ✓ Response uses note content
  ✓ Not a generic AI answer
  ✓ Response time < 5 seconds

Step 3: Generate easy quiz
  curl -X POST /api/quiz/generate \
    -d '{"noteId":"...", "difficulty":"easy", "questionCount":10}'
  
  VERIFY:
  ✓ 10 questions returned
  ✓ No correct answers in response
  ✓ All questions have 4 options

Step 4: Submit quiz
  curl -X POST /api/quiz/submit \
    -d '{"quizId":"...", "answers":[...]}'
  
  VERIFY:
  ✓ Score calculated correctly
  ✓ Per-question feedback included
  ✓ Result saved in DB

Step 5: Generate cheat sheet
  curl -X POST /api/cheatsheet/generate \
    -d '{"noteId":"..."}'
  
  VERIFY:
  ✓ HTML content not empty
  ✓ wordCount between 150-400
  ✓ PDF URL accessible

Step 6: Execute code
  curl -X POST /api/sandbox/execute \
    -d '{"code":"print(\"hello\")", "language":"python"}'
  
  VERIFY:
  ✓ output = "hello\n"
  ✓ error = null

Step 7: Check analytics
  curl /api/analytics/progress?userId=test_user
  curl /api/analytics/activity?userId=test_user
  
  VERIFY:
  ✓ Progress has trend array
  ✓ Heatmap has today's date

TEST SUITE 2: Error Scenarios
─────────────────────────────
□ Upload no file → 400 "No file uploaded"
□ Upload .exe → 400 "File type not supported"
□ Chat with wrong noteId → 404 "Note not found"
□ Generate quiz with wrong difficulty → 400 "Invalid difficulty"
□ Execute invalid language → 400 "Language not supported"
□ All errors have: success:false + meaningful error message

TEST SUITE 3: Performance
──────────────────────────
□ Upload + OCR: < 8 seconds ✓
□ Chat response: < 5 seconds ✓
□ Quiz generation: < 6 seconds ✓
□ Cheat sheet: < 8 seconds ✓
□ Code execution: < 6 seconds ✓

TEST SUITE 4: Mobile Responsiveness
─────────────────────────────────────
□ Open Chrome DevTools → Toggle mobile view (375px)
□ All pages load without horizontal scroll
□ Chat tabs work (Note | Chat | Quiz)
□ Buttons are tappable (min 44px height)
□ Text is readable (min 14px)
□ Upload works on mobile

FINAL VALIDATION:
□ Zero console.log errors in backend
□ Zero console errors in browser
□ All 6 features demo-able without crashing
□ Git log shows 20+ meaningful commits
□ README.md has setup instructions

GIT COMMITS:
git commit -m "test: complete integration test suite (all features)"
git commit -m "fix: resolve issues found in integration testing"
git commit -m "chore: final cleanup and production readiness check"
git push origin main
```

---

## 🔄 MANDATORY GIT WORKFLOW

### Commit Message Format
```
feat: new feature added
fix: bug resolved
test: testing done
style: UI improvement
perf: performance improvement
docs: documentation update
chore: cleanup/maintenance
```

### Timing
```
MINIMUM COMMITS: 25+
FREQUENCY: Every 30-45 minutes
PUSH: After every commit

MILESTONE TAGS:
git tag -a v1-notes -m "Notes upload working"
git tag -a v1-chat -m "AI chat working"
git tag -a v1-quiz -m "Quiz generator working"
git tag -a v1-full -m "All features working"
```

---

## ✅ FINAL ACCEPTANCE CRITERIA

A feature is COMPLETE only if ALL these pass:

```
📤 NOTE UPLOAD:
□ Image (JPG/PNG) → OCR → text extracted
□ PDF (digital) → parsed → text extracted
□ PDF (scanned) → OCR → text extracted
□ DOCX → parsed → text extracted
□ Invalid file → clear error shown
□ File stored in Supabase Storage
□ Text stored in Supabase DB
□ Confidence score returned

💬 AI CHAT:
□ Uses note content (not generic)
□ Multi-turn conversation works
□ Out-of-scope handled gracefully
□ History saved in DB
□ < 5 seconds response
□ Mobile tab layout works

📝 QUIZ:
□ 10 questions generated
□ All 3 difficulties work
□ Correct answers NOT in generate response
□ Scoring 100% accurate
□ Per-question explanations shown
□ Attempt saved in DB
□ Performance metrics updated

📋 CHEAT SHEET:
□ Summary under 400 words
□ NOT copy-paste of original
□ HTML renders correctly
□ PDF downloads
□ PDF is printable A4
□ Stored in Supabase Storage

💻 CODE SANDBOX:
□ Python runs correctly
□ JavaScript runs correctly
□ Errors display clearly
□ AI fix works
□ Timeout handled (10s max)
□ No security vulnerabilities

🧠 GROUP BRAIN:
□ 2+ notes merge correctly
□ Duplicates removed
□ Gaps identified
□ Master guide comprehensive
□ PDF exportable

📊 ANALYTICS:
□ Quiz scores tracked daily
□ Progress graph shows trend
□ Activity heatmap shows daily activity
□ Summary stats accurate

🔒 SECURITY:
□ All routes require Firebase JWT
□ Users can only access own notes
□ File size limits enforced
□ Code execution sandboxed (Piston)
□ Rate limiting on AI endpoints

📱 MOBILE:
□ All pages responsive (375px+)
□ Chat uses tab layout on mobile
□ Buttons minimum 44px height
□ Text readable (14px+)
□ Upload works on mobile

🔧 CODE QUALITY:
□ No console errors (backend)
□ No browser errors (frontend)
□ All imports working
□ No unused variables
□ Error messages are user-friendly
□ Loading states on all async ops
□ Empty states for no data
```

---

## 🎬 DEMO SCRIPT (3 Minutes — Rehearse This)

```
[0:00-0:30] Upload
"Watch — I'm uploading a messy handwritten physics note.
NoteVault reads it in seconds."
→ Show OCR working live

[0:30-1:00] Chat
"My Study Buddy has READ this note.
Watch it answer based on my content."
→ Ask question → Show answer uses note
→ Ask off-topic question → Show graceful response

[1:00-1:30] Quiz
"One click — 10 adaptive questions generated.
Medium difficulty."
→ Answer 3 questions → Show score
"80% in 30 seconds. Not bad."

[1:30-2:00] Cheat Sheet
"Exam in 1 hour. Here's my lifesaver."
→ Generate → Show one-pager → Download PDF
"10 pages → 1 page → Printable."

[2:00-2:30] Code Sandbox
"CS students — run code directly from notes."
→ Run Python → Show output
→ Introduce error → Show AI fix

[2:30-3:00] Close
"No tab switching. No ChatGPT. No Quizlet.
One workspace. Everything included.
Built in 48 hours."
```

---

## 🏁 SUCCESS CRITERIA

You succeed when:
1. ✅ All 6 features work without crashing
2. ✅ Zero console errors in production
3. ✅ All gaps from the audit are fixed
4. ✅ 25+ meaningful Git commits
5. ✅ Mobile responsive (375px+)
6. ✅ 3-minute demo runs flawlessly
7. ✅ README has clear setup instructions
8. ✅ All APIs return proper errors (never 500 without handling)
9. ✅ No fake data in any response
10. ✅ Performance tracking actually tracks

**NOW START. Phase 0 first. Do not skip. Test every phase. Commit constantly. Build something judges remember.**

🚀

