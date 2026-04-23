const express = require('express');
const { v4: uuidv4 } = require('uuid');
const Tesseract = require('tesseract.js');
const TestService = require('../services/testService');
const supabase = require('../config/supabase');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

const router = express.Router();

/**
 * POST /api/test/generate
 * Starts a new test session
 */
router.post('/generate', async (req, res) => {
  const { noteId, difficulty = 'Beginner' } = req.body;

  try {
    let noteContent = '';
    
    if (noteId.startsWith('dummy-')) {
      // Mock content for demo purposes
      noteContent = `This is a sample study guide about ${noteId.replace('dummy-', '').replace(/-/g, ' ')}. 
      It covers core concepts, historical context, and modern applications. 
      Important topics include efficiency, systemic integration, and theoretical frameworks.`;
    } else {
      // 1. Fetch note content
      const { data: note, error: fetchError } = await supabase
        .from('notes')
        .select('*')
        .eq('id', noteId)
        .single();

      if (fetchError || !note) return res.status(404).json({ success: false, error: 'Note not found.' });
      noteContent = note.content;

      // ✅ Guard: If content is empty/null, tell the user clearly
      if (!noteContent || noteContent.trim().length < 50) {
        return res.status(400).json({ 
          success: false, 
          error: 'This note has no extracted content. Please re-upload the file — the AI needs readable text to generate a test.' 
        });
      }
    }

    // 2. Generate questions via AI
    const questions = await TestService.generateTestQuestions(noteContent, difficulty);

    // 3. Create session record
    const sessionId = uuidv4();
    if (!noteId.startsWith('dummy-')) {
      const { error: sessionError } = await supabase.from('test_sessions').insert([{
        id: sessionId,
        note_id: noteId,
        difficulty,
        status: 'in_progress',
        total_questions: questions.length,
        questions_json: JSON.stringify(questions) // Store for persistence across restarts
      }]);

      if (sessionError) console.warn('[TestMode] Could not save session to DB:', sessionError.message);
    }

    res.json({
      success: true,
      sessionId,
      questions: questions.map(q => {
        const { correctAnswer, rubric, explanation, ...publicQ } = q;
        return publicQ;
      }),
      // Store full questions temporarily in memory or separate table for evaluation
      // For this MVP, we return the session and the UI will send back answers for evaluation
    });

    // In a real prod app, we'd store the correct answers securely on the server/DB linked to sessionId
    global.activeSessions = global.activeSessions || {};
    global.activeSessions[sessionId] = questions;

  } catch (err) {
    console.error('[TestMode] Generate Error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/test/ocr
 * Extracts text from uploaded image
 */
router.post('/ocr', upload.single('image'), async (req, res) => {
  if (!req.file) return res.status(400).json({ success: false, error: 'No image uploaded' });

  try {
    const { data: { text } } = await Tesseract.recognize(req.file.path, 'eng');
    res.json({ success: true, text });
  } catch (err) {
    console.error('[OCR Error]', err);
    res.status(500).json({ success: false, error: 'Failed to extract text' });
  }
});

/**
 * POST /api/test/submit
 * Submits and evaluates a test session
 */
router.post('/submit', async (req, res) => {
  const { sessionId, answers } = req.body; // answers: { [qId]: answer }

  // Try memory first, fallback to DB
  let fullQuestions = global.activeSessions?.[sessionId];
  
  if (!fullQuestions) {
    console.log('[TestMode] Session not in memory, fetching from DB...');
    const { data: session, error } = await supabase
      .from('test_sessions')
      .select('questions_json')
      .eq('id', sessionId)
      .single();
      
    if (!error && session?.questions_json) {
      try {
        fullQuestions = typeof session.questions_json === 'string' 
          ? JSON.parse(session.questions_json) 
          : session.questions_json;
      } catch (e) {
        console.error('[TestMode] Failed to parse questions from DB');
      }
    }
  }

  if (!fullQuestions) return res.status(404).json({ success: false, error: 'Session expired or not found. Please try generating a new test.' });

  try {
    let totalScore = 0;
    const results = [];

    for (const q of fullQuestions) {
      const userAnswer = answers[q.id] || '';
      let evaluation = null;

      if (q.type === 'MCQ') {
        const isCorrect = userAnswer === q.correctAnswer;
        const score = isCorrect ? 100 : 0;
        totalScore += score;
        evaluation = {
          score,
          correct: isCorrect,
          correctAnswer: q.correctAnswer,
          explanation: q.explanation
        };
      } else {
        // SA or LA
        evaluation = await TestService.evaluateAnswer(q.text, q.rubric, userAnswer, q.type);
        totalScore += evaluation.score;
      }

      results.push({
        questionId: q.id,
        type: q.type,
        text: q.text,
        userAnswer,
        evaluation
      });
    }

    const finalScore = Math.round(totalScore / fullQuestions.length);

    // Update session in DB
    await supabase.from('test_sessions').update({
      status: 'completed',
      score: finalScore,
      end_time: new Date().toISOString()
    }).eq('id', sessionId);

    res.json({
      success: true,
      score: finalScore,
      results
    });

    delete global.activeSessions[sessionId];
  } catch (err) {
    console.error('[TestMode] Submit Error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/test/sessions
 * Retrieves all test sessions for performance tracking
 */
router.get('/sessions', async (req, res) => {
  try {
    const { data: sessions, error } = await supabase
      .from('test_sessions')
      .select(`
        *,
        notes ( title )
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;

    const mapped = sessions.map(s => ({
      ...s,
      note_title: s.notes?.title
    }));

    res.json({ success: true, sessions: mapped });
  } catch (err) {
    console.error('[TestMode] Sessions Fetch Error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
