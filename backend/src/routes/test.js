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
    // 1. Fetch note content
    const { data: note, error: fetchError } = await supabase
      .from('notes')
      .select('*')
      .eq('id', noteId)
      .single();

    if (fetchError || !note) return res.status(404).json({ success: false, error: 'Note not found.' });

    // 2. Generate questions via AI
    const questions = await TestService.generateTestQuestions(note.content, difficulty);

    // 3. Create session record
    const sessionId = uuidv4();
    const { error: sessionError } = await supabase.from('test_sessions').insert([{
      id: sessionId,
      note_id: noteId,
      difficulty,
      status: 'in_progress',
      total_questions: questions.length
    }]);

    if (sessionError) console.warn('[TestMode] Could not save session to DB:', sessionError.message);

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

  const fullQuestions = global.activeSessions?.[sessionId];
  if (!fullQuestions) return res.status(404).json({ success: false, error: 'Session expired or not found.' });

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
