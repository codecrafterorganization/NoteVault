const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

// FIX NODE 18+ IPv6 DNS HANG ISSUES
// This single line completely eliminates the 10-15s delay on Google/Nvidia APIs 
// caused by failing IPv6 routing on specific Windows/Wi-Fi configurations.
require('dns').setDefaultResultOrder('ipv4first');

const express = require('express');

// DEBUG: Verify environment variables
console.log('[DEBUG] Environment loaded from server/.env');
console.log('[DEBUG] GEMINI_API_KEY:', process.env.GEMINI_API_KEY ? 'SET (length: ' + process.env.GEMINI_API_KEY.length + ')' : 'UNDEFINED/EMPTY');
console.log('[DEBUG] NVIDIA_API_KEY:', process.env.NVIDIA_API_KEY ? 'SET (length: ' + process.env.NVIDIA_API_KEY.length + ')' : 'UNDEFINED/EMPTY');
console.log('[DEBUG] PORT:', process.env.PORT || '5000 (default)');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const notesRouter = require('./routes/notes');
const chatRouter = require('./routes/chat');
const explainRouter = require('./routes/explain');
const quizRouter = require('./routes/quiz');
const cheatsheetRouter = require('./routes/cheatsheet');
const uploadRouter = require('./routes/upload');
const searchRouter = require('./routes/search');
const graphRouter = require('./routes/graph');
const sandboxRouter = require('./routes/sandbox');
const errorHandler = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 8080;

// ─── Security & Parsing ───────────────────────────────────────────────────────
app.use(helmet());
app.use(
  cors({
    origin: true,  // Allow all origins for development
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ─── Global Rate Limit ────────────────────────────────────────────────────────
const globalLimiter = rateLimit({
  windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 min
  max: Number(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' },
});
app.use(globalLimiter);

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), version: '1.0.0' });
});

// ─── Gemini API Test ────────────────────────────────────────────────────────────
const { generateContent } = require('./utils/gemini');
app.get('/api/test', async (_req, res) => {
  try {
    console.log('[TEST] Testing Gemini API...');
    console.log('[TEST] API KEY present:', !!process.env.GEMINI_API_KEY);
    console.log('[TEST] API KEY first 10 chars:', process.env.GEMINI_API_KEY?.substring(0, 10) + '...');
    
    const result = await generateContent('Say "Gemini API is working!" and nothing else.');
    console.log('[TEST] Gemini response:', result);
    res.json({ success: true, apiKeyPresent: !!process.env.GEMINI_API_KEY, geminiResponse: result });
  } catch (err) {
    console.error('[TEST] Gemini test failed:', err.message);
    res.status(500).json({ 
      success: false, 
      apiKeyPresent: !!process.env.GEMINI_API_KEY,
      apiKeyPrefix: process.env.GEMINI_API_KEY?.substring(0, 10) + '...',
      error: err.message 
    });
  }
});

// ─── List Available Models ─────────────────────────────────────────────────────
app.get('/api/models', async (_req, res) => {
  try {
    const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models?key=' + process.env.GEMINI_API_KEY);
    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── API Routes ───────────────────────────────────────────────────────────────
// Auth handled by Firebase in frontend
app.use('/api/notes', notesRouter);
app.use('/api/chat', chatRouter);
app.use('/api/explain', explainRouter);
app.use('/api/quiz', quizRouter);
app.use('/api/test', testRouter);
app.use('/api/cheatsheet', cheatsheetRouter);
app.use('/api/upload', uploadRouter);
app.use('/api/search', searchRouter);
app.use('/api/graph', graphRouter);
app.use('/api/sandbox', sandboxRouter);

// ─── 404 Handler ─────────────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ error: 'Route not found.' });
});

// ─── Global Error Handler ─────────────────────────────────────────────────────
app.use(errorHandler);

// ─── Start ────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🚀 NoteVault Server running on http://localhost:${PORT}`);
  console.log(`   Environment : ${process.env.NODE_ENV || 'development'}`);
  console.log(`   Health check: http://localhost:${PORT}/health\n`);
});

module.exports = app;
