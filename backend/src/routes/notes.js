const express = require('express');
const multer = require('multer');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');
const supabase = require('../config/supabase');
const { generateMasterGuide } = require('../utils/aiService');
const { getFirebaseUuid } = require('../utils/uidHelper');

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

async function extractText(file) {
  if (!file) return null;
  const mimeType = file.mimetype;
  console.log('[extractText] File type:', mimeType, 'Size:', file.buffer.length);
  
  if (mimeType === 'application/pdf') {
    try {
      const data = await pdfParse(file.buffer);
      console.log('[extractText] PDF extracted, length:', data.text?.length);
      return validateText(data.text, 'PDF');
    } catch (err) {
      console.error('[extractText] PDF parsing failed:', err.message);
      return null;
    }
  }
  
  if (mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
    try {
      const result = await mammoth.extractRawText({ buffer: file.buffer });
      console.log('[extractText] DOCX extracted, length:', result.value?.length);
      return validateText(result.value, 'DOCX');
    } catch (err) {
      console.error('[extractText] DOCX parsing failed:', err.message);
      return null;
    }
  }
  
  if (mimeType.startsWith('text/') || mimeType === 'application/json') {
    return validateText(file.buffer.toString('utf-8'), 'TXT');
  }
  
  console.error('[extractText] Unsupported file type:', mimeType);
  return null;
}

function validateText(text, source) {
  if (!text || text.trim().length === 0) return null;
  const binaryIndicators = ['PK\x03\x04', '[Content_Types].xml', 'word/document.xml', '\x00\x01\x02'];
  for (const indicator of binaryIndicators) {
    if (text.includes(indicator)) return null;
  }
  const readableChars = text.match(/[\x20-\x7E\n\r\t]/g)?.length || 0;
  if ((readableChars / text.length) < 0.8) return null;
  return text.trim();
}

// POST /api/notes/upload
router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    const title = req.body.title || req.file?.originalname || 'Untitled';
    const userId = getFirebaseUuid(req.body.userId);
    let content = req.body.content;
    
    if (req.file) {
      content = await extractText(req.file);
    }
    
    if (!content || content.trim().length === 0) {
      return res.status(400).json({ error: 'Could not extract text from file. Try a text file or PDF.' });
    }

    let fileType = 'text';
    if (req.file) {
      if (req.file.mimetype === 'application/pdf') fileType = 'pdf';
      else if (req.file.mimetype.startsWith('image/')) fileType = 'image';
    }

    const { data: note, error } = await supabase
      .from('notes')
      .insert({
        title,
        content,
        file_type: fileType,
        user_id: userId
      })
      .select()
      .single();

    if (error) {
      console.error('[ERROR] Insert failed:', error);
      return res.status(500).json({ success: false, message: error.message });
    }

    console.log(`[SUCCESS] Note created with ID: ${note.id} for user: ${userId}`);
    return res.status(201).json({
      id: note.id,
      title: note.title,
      fileType: note.file_type,
      content: note.content,
      createdAt: note.uploaded_at
    });
  } catch (err) {
    console.error('[ERROR] Upload controller failed:', err);
    res.status(500).json({ success: false, message: err.message || 'Internal server error' });
  }
});

// GET /api/notes?userId=<firebase_uid>
router.get('/', async (req, res) => {
  try {
    const userId = getFirebaseUuid(req.query.userId);

    let query = supabase
      .from('notes')
      .select('id, title, file_type, uploaded_at, content')
      .order('uploaded_at', { ascending: false });

    // Filter by user — if userId provided, show only their notes
    // If no userId (guest), show notes with null user_id only
    if (userId) {
      query = query.eq('user_id', userId);
    } else {
      query = query.is('user_id', null);
    }

    const { data: notes, error } = await query;

    if (error) {
      console.error('[ERROR] Query failed:', error);
      return res.status(500).json({ success: false, message: error.message });
    }

    console.log(`[SUCCESS] Retrieved ${notes.length} notes for user: ${userId || 'guest'}`);
    
    const mappedNotes = notes.map(n => ({
      id: n.id,
      title: n.title,
      fileType: n.file_type,
      createdAt: n.uploaded_at,
      content: n.content || ''
    }));

    return res.json({ notes: mappedNotes });
  } catch (err) {
    console.error('[ERROR] List notes controller failed:', err);
    res.status(500).json({ success: false, message: err.message || 'Internal server error' });
  }
});

// GET /api/notes/:id
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const { data: note, error } = await supabase
      .from('notes')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !note) {
      console.error('[ERROR] Note not found:', error?.message);
      return res.status(404).json({ success: false, error: 'Note not found' });
    }
    
    return res.json({
      id: note.id,
      title: note.title,
      fileType: note.file_type,
      content: note.content,
      createdAt: note.uploaded_at
    });
  } catch (err) {
    console.error('[ERROR] Get note controller failed:', err);
    res.status(500).json({ success: false, message: err.message || 'Internal server error' });
  }
});

// DELETE /api/notes/:id?userId=<firebase_uid>
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = getFirebaseUuid(req.query.userId);

    let query = supabase.from('notes').delete().eq('id', id);
    // Only delete if owned by this user (security)
    if (userId) query = query.eq('user_id', userId);

    const { error } = await query;

    if (error) {
      console.error('[ERROR] Delete note failed:', error.message);
      return res.status(500).json({ success: false, message: error.message });
    }

    return res.json({ success: true, message: 'Note deleted successfully' });
  } catch (err) {
    console.error('[ERROR] Delete note controller failed:', err);
    res.status(500).json({ success: false, message: err.message || 'Internal server error' });
  }
});

// POST /api/notes/merge
router.post('/merge', async (req, res) => {
  try {
    const { noteIds } = req.body;
    
    if (!noteIds || !Array.isArray(noteIds) || noteIds.length < 2) {
      return res.status(400).json({ success: false, error: 'Please select at least 2 notes to merge.' });
    }

    console.log(`[MERGE] Merging ${noteIds.length} notes:`, noteIds);

    // Fetch the content of all provided note IDs
    const { data: notes, error } = await supabase
      .from('notes')
      .select('id, title, content')
      .in('id', noteIds);

    if (error) {
      console.error('[MERGE ERROR] Query failed:', error);
      return res.status(500).json({ success: false, message: error.message });
    }

    if (!notes || notes.length < 2) {
      return res.status(404).json({ success: false, error: 'Could not fetch enough valid notes to merge.' });
    }

    const noteContents = notes.map(n => n.content);
    
    // Generate the master guide using Gemini
    const masterGuideContent = await generateMasterGuide(noteContents);

    // Create a new note from the result
    const newTitle = `🧠 Group Master Guide (${notes.length} notes)`;
    const userId = getFirebaseUuid(req.body.userId);
    
    const { data: newNote, insertError } = await supabase
      .from('notes')
      .insert({
        title: newTitle,
        content: masterGuideContent,
        file_type: 'text',
        user_id: userId
      })
      .select()
      .single();

    if (insertError) {
      console.error('[MERGE ERROR] Insert failed:', insertError);
      return res.status(500).json({ success: false, message: insertError.message });
    }

    console.log('[MERGE SUCCESS] Master Guide created:', newNote.id);
    return res.status(201).json({ success: true, noteId: newNote.id });

  } catch (err) {
    console.error('[MERGE ERROR] Route failed:', err);
    res.status(500).json({ success: false, message: err.message || 'Internal server error' });
  }
});

module.exports = router;
