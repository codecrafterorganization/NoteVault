const express = require('express');
const { body, validationResult } = require('express-validator');
const { generateCheatsheet, getLastProvider } = require('../utils/aiService');
const supabase = require('../config/supabase');

const router = express.Router();

router.post('/generate', [
  body('noteId').notEmpty().withMessage('noteId is required.')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.json({ success: false, error: 'Validation failed.', details: errors.array() });
  }

  try {
    const { noteId } = req.body;
    console.log('[cheatsheet/generate] Request received. noteId:', noteId);

    const DUMMY_CONTENT = {
      'dummy-biology': 'Cellular respiration breaks glucose into ATP through glycolysis, pyruvate oxidation, Krebs cycle, and electron transport chain. Total yield ~36-38 ATP per glucose. Equation: C₆H₁₂O₆ + 6O₂ → 6CO₂ + 6H₂O + ATP.',
      'dummy-thermo': 'Thermodynamics laws: 0th (thermal equilibrium), 1st (ΔU=Q-W, energy conservation), 2nd (entropy increases), 3rd (entropy→0 at 0K). Gibbs: ΔG=ΔH-TΔS. Carnot efficiency: η=1-Tcold/Thot.',
      'dummy-chem': 'Organic chem key reactions: SN1 (3° substrate, racemization), SN2 (1° substrate, inversion). Oxidation: 1° alcohol→aldehyde→carboxylic acid. EAS on benzene: activating groups are ortho/para directors.',
      'dummy-quantum': 'Quantum mechanics: de Broglie λ=h/mv. Uncertainty: Δx·Δp≥ℏ/2. Schrödinger: Hψ=Eψ. Quantum numbers: n(energy), l(shape), ml(orientation), ms(spin). Pauli exclusion: unique quantum state per electron.'
    };

    let noteContent;
    if (noteId.startsWith('dummy-')) {
      noteContent = DUMMY_CONTENT[noteId] || 'Study material for this topic.';
    } else {
      const { data: note, error: fetchError } = await supabase.from('notes').select('*').eq('id', noteId).single();
      if (fetchError || !note) {
        console.error('[cheatsheet/generate] Note not found.', fetchError?.message);
        return res.json({ success: false, error: 'Note not found.' });
      }
      noteContent = note.content || '';
    }
    if (noteContent.length < 10) {
      return res.json({ success: false, error: 'Note content too short. Please upload a note with more content.' });
    }
    
    // FORCE BYPASS CACHE FOR DEBUGGING
    console.log('[cheatsheet/generate] Bypassing cache to ensure fresh generation.');
    await supabase.from('cheatsheets').delete().eq('note_id', noteId);
    
    const cheatsheet = await generateCheatsheet(noteContent);
    
    if (!cheatsheet || cheatsheet.length < 50) {
      console.error('[cheatsheet/generate] AI returned empty or very short response.');
      return res.json({ 
        success: false, 
        error: 'AI returned an empty response. This might be a temporary API glitch.',
        debug: { length: cheatsheet?.length, noteLength: noteContent.length }
      });
    }
    
    // Save to database
    const { error: insertError } = await supabase.from('cheatsheets').insert([{
      note_id: noteId,
      content: cheatsheet
    }]);

    if (insertError) {
      console.warn('[cheatsheet/generate] Could not save to DB (ensure table exists):', insertError.message);
    }

    return res.json({ success: true, noteId, cheatsheet, provider: getLastProvider() });
  } catch (err) {
    console.error('[cheatsheet/generate] ROUTE ERROR:', err);
    return res.json({ 
      success: false, 
      message: 'AI temporarily unavailable. Please try again.',
      error: err.message
    });
  }
});

module.exports = router;
