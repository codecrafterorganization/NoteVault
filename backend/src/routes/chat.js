const express = require('express');
const { body, validationResult } = require('express-validator');
const { askQuestion, getLastProvider } = require('../utils/aiService');
const supabase = require('../config/supabase');

const router = express.Router();

const askValidation = [
  body('noteId').notEmpty().withMessage('noteId is required.'),
  body('question').isString().trim().notEmpty().withMessage('question is required.'),
];

// POST /api/chat/ask
router.post('/ask', askValidation, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.error('[chat/ask] Validation failed:', errors.array());
    return res.json({ success: false, error: 'Validation failed.', details: errors.array() });
  }

  try {
    const { noteId, question } = req.body;
    console.log('[chat/ask] Request received. noteId:', noteId, 'question:', question);

    let noteContent = '';

    // Handle dummy notes for demo
    const DUMMY_CONTENT = {
      'dummy-biology': 'Cellular respiration is the process by which cells break down glucose to produce ATP. It involves glycolysis, pyruvate oxidation, Krebs cycle, and electron transport chain. Net yield is approximately 36-38 ATP per glucose molecule.',
      'dummy-thermo': 'Thermodynamics covers laws of energy transfer. First Law: energy conservation (ΔU = Q - W). Second Law: entropy always increases. Gibbs Free Energy ΔG = ΔH - TΔS determines spontaneity.',
      'dummy-chem': 'Organic Chemistry covers functional groups, reaction mechanisms including SN1, SN2, E1, E2 eliminations. Aldehydes oxidize to carboxylic acids. Aromatic compounds undergo electrophilic aromatic substitution.',
      'dummy-quantum': 'Quantum mechanics describes particle-wave duality. Heisenberg uncertainty principle: Δx·Δp ≥ ℏ/2. Schrödinger equation: Hψ = Eψ. Quantum numbers n, l, ml, ms describe electron states.'
    };

    if (noteId.startsWith('dummy-')) {
      noteContent = DUMMY_CONTENT[noteId] || 'This is a general science topic. Please ask specific questions.';
    } else {
      const { data: note, error: fetchError } = await supabase.from('notes').select('*').eq('id', noteId).single();
      if (fetchError || !note) {
        console.error('[chat/ask] Note not found in DB.', fetchError?.message);
        return res.json({ success: false, error: 'Note not found.' });
      }
      noteContent = note.content || '';
    }
    const answer = await askQuestion(noteContent, question);
    
    // Save to Supabase
    const { error: insertError } = await supabase.from('chat_messages').insert([
      { note_id: noteId, role: 'user', content: question },
      { note_id: noteId, role: 'assistant', content: answer }
    ]);

    if (insertError) {
      console.warn('[chat/ask] Could not save messages to DB (ensure tables exist):', insertError.message);
    }

    return res.json({ success: true, answer, noteId, question, provider: getLastProvider() });
  } catch (err) {
    console.error('[chat/ask] ROUTE ERROR:', err);
    return res.json({ 
      success: false, 
      message: 'AI temporarily unavailable. Please try again.',
      error: err.message
    });
  }
});

// GET /api/chat/:noteId/history
router.get('/:noteId/history', async (req, res) => {
  try {
    const { noteId } = req.params;
    const { data: messages, error } = await supabase
      .from('chat_messages')
      .select('role, content, created_at')
      .eq('note_id', noteId)
      .order('created_at', { ascending: true });

    if (error) {
      // Fallback if table doesn't exist yet so UI doesn't crash
      console.warn('[chat/history] Could not fetch from DB:', error.message);
      return res.json({ messages: [] });
    }

    // Format to match old structure
    const formattedMessages = (messages || []).map(m => ({
      role: m.role,
      content: m.content,
      timestamp: m.created_at
    }));

    res.json({ messages: formattedMessages });
  } catch (err) {
    console.error('[chat/history] Error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
