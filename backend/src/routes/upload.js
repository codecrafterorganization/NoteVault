/**
 * Upload Routes
 * Handles image, PDF, and camera uploads with OCR
 */

const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const { v4: uuidv4 } = require('uuid');

const { extractTextFromImage } = require('../services/ocrService');
const { extractTextFromPDF } = require('../services/pdfService');
const { compressImage } = require('../utils/imageCompressor');
const { summarize, extractKeyPoints, generateTags } = require('../utils/aiService');
const { generateAndStoreEmbedding } = require('../services/embeddingService');
const supabaseModule = require('../config/supabase');
const supabase = supabaseModule?.supabase || supabaseModule;

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|pdf/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (extname && mimetype) {
      return cb(null, true);
    }
    cb(new Error('Only images (JPEG, PNG, GIF) and PDF files are allowed'));
  }
});

/**
 * POST /api/upload/image
 * Upload and process image with OCR
 */
router.post('/image', upload.single('image'), async (req, res) => {
  console.log('[Upload/Image] Request received');
  
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    const userId = req.user?.id || 'anonymous'; // Replace with actual auth
    const tempPath = req.file.path;
    const compressedPath = path.join('uploads', `compressed-${req.file.filename}`);

    // Compress image
    console.log('[Upload/Image] Compressing image...');
    await compressImage(tempPath, compressedPath);

    // Extract text with OCR
    console.log('[Upload/Image] Running OCR...');
    const extractedText = await extractTextFromImage(compressedPath);

    if (!extractedText) {
      return res.status(400).json({ error: 'Could not extract text from image' });
    }

    // Upload to Supabase Storage
    const fileBuffer = await fs.readFile(compressedPath);
    const fileName = `images/${uuidv4()}.jpg`;
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('note-files')
      .upload(fileName, fileBuffer, {
        contentType: 'image/jpeg'
      });

    if (uploadError) {
      console.error('[Upload/Image] Storage error:', uploadError);
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('note-files')
      .getPublicUrl(fileName);

    // Generate AI enhancements
    console.log('[Upload/Image] Generating AI enhancements...');
    let summary, keyPoints, tags;
    
    try {
      [summary, keyPoints, tags] = await Promise.all([
        summarize(extractedText),
        extractKeyPoints(extractedText),
        generateTags(extractedText)
      ]);
    } catch (aiError) {
      console.log('[Upload/Image] AI enhancements failed:', aiError.message);
      summary = '';
      keyPoints = [];
      tags = [];
    }

    // Create note in database
    const { data: note, error: dbError } = await supabase
      .from('notes')
      .insert({
        user_id: userId,
        title: req.body.title || `Image Note ${new Date().toLocaleDateString()}`,
        content: extractedText,
        file_type: 'image',
        file_url: publicUrl,
        metadata: {
          extracted_text: extractedText,
          source_type: 'image',
          summary,
          key_points: keyPoints,
          tags
        }
      })
      .select()
      .single();

    if (dbError) {
      throw dbError;
    }

    // Generate embedding asynchronously
    generateAndStoreEmbedding(note.id, extractedText).catch(err => {
      console.error('[Upload/Image] Embedding generation failed:', err.message);
    });

    // Cleanup temp files
    try {
      await fs.unlink(tempPath);
      await fs.unlink(compressedPath);
    } catch (e) {
      // Ignore cleanup errors
    }

    console.log('[Upload/Image] Success, note created:', note.id);
    res.json({ 
      success: true, 
      note,
      extractedText: extractedText.slice(0, 500) + '...'
    });

  } catch (error) {
    console.error('[Upload/Image] Error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/upload/pdf
 * Upload and process PDF
 */
router.post('/pdf', upload.single('pdf'), async (req, res) => {
  console.log('[Upload/PDF] Request received');
  
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No PDF file provided' });
    }

    const userId = req.user?.id || 'anonymous';
    const tempPath = req.file.path;

    // Extract text from PDF
    console.log('[Upload/PDF] Extracting text...');
    const { text: extractedText, pages } = await extractTextFromPDF(tempPath);

    if (!extractedText) {
      return res.status(400).json({ error: 'Could not extract text from PDF' });
    }

    // Upload to Supabase Storage
    const fileBuffer = await fs.readFile(tempPath);
    const fileName = `pdfs/${uuidv4()}.pdf`;
    
    const { error: uploadError } = await supabase.storage
      .from('note-files')
      .upload(fileName, fileBuffer, {
        contentType: 'application/pdf'
      });

    if (uploadError) {
      console.error('[Upload/PDF] Storage error:', uploadError);
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('note-files')
      .getPublicUrl(fileName);

    // Generate AI enhancements
    console.log('[Upload/PDF] Generating AI enhancements...');
    let summary, keyPoints, tags;
    
    try {
      [summary, keyPoints, tags] = await Promise.all([
        summarize(extractedText),
        extractKeyPoints(extractedText),
        generateTags(extractedText)
      ]);
    } catch (aiError) {
      console.log('[Upload/PDF] AI enhancements failed:', aiError.message);
      summary = '';
      keyPoints = [];
      tags = [];
    }

    // Create note in database
    const { data: note, error: dbError } = await supabase
      .from('notes')
      .insert({
        user_id: userId,
        title: req.body.title || `PDF Note (${pages} pages)`,
        content: extractedText,
        file_type: 'pdf',
        file_url: publicUrl,
        metadata: {
          extracted_text: extractedText,
          source_type: 'pdf',
          summary,
          key_points: keyPoints,
          tags
        }
      })
      .select()
      .single();

    if (dbError) {
      throw dbError;
    }

    // Generate embedding asynchronously
    generateAndStoreEmbedding(note.id, extractedText).catch(err => {
      console.error('[Upload/PDF] Embedding generation failed:', err.message);
    });

    // Cleanup temp file
    try {
      await fs.unlink(tempPath);
    } catch (e) {
      // Ignore
    }

    console.log('[Upload/PDF] Success, note created:', note.id);
    res.json({ 
      success: true, 
      note,
      pages,
      extractedText: extractedText.slice(0, 500) + '...'
    });

  } catch (error) {
    console.error('[Upload/PDF] Error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/upload/camera
 * Process camera capture (base64 image)
 */
router.post('/camera', express.json({ limit: '10mb' }), async (req, res) => {
  console.log('[Upload/Camera] Request received');
  
  try {
    const { image, title } = req.body;
    
    if (!image) {
      return res.json({ success: false, error: 'No image data provided' });
    }

    // Convert base64 to buffer
    const base64Data = image.replace(/^data:image\/\w+;base64,/, '');
    const imageBuffer = Buffer.from(base64Data, 'base64');

    // Save to temp file for OCR
    const tempPath = path.join('uploads', `camera-${uuidv4()}.jpg`);
    await fs.writeFile(tempPath, imageBuffer);

    // Try OCR extraction (non-blocking - use placeholder if fails)
    let extractedText = '';
    try {
      extractedText = await extractTextFromImage(tempPath);
    } catch (ocrErr) {
      console.log('[Upload/Camera] OCR failed, using placeholder:', ocrErr.message);
      extractedText = `[Camera capture - OCR unavailable] Image captured on ${new Date().toLocaleString()}. Please install tesseract.js for text extraction.`;
    }

    if (!extractedText || extractedText.trim().length < 5) {
      extractedText = `[Camera capture] Image uploaded on ${new Date().toLocaleString()}. Text extraction did not find readable content.`;
    }

    // Create note in database
    const note = {
      title: title || `Camera Capture ${new Date().toLocaleString()}`,
      content: extractedText,
      file_type: 'image',
      metadata: {
        source_type: 'camera'
      }
    };

    // Save to Supabase
    const { data: savedNote, error: dbError } = await supabase
      .from('notes')
      .insert(note)
      .select()
      .single();

    if (dbError) throw dbError;

    // Cleanup temp file
    try {
      await fs.unlink(tempPath);
    } catch (e) {
      // Ignore
    }

    console.log('[Upload/Camera] Success, note created:', savedNote.id);
    res.json({ 
      success: true, 
      note: savedNote,
      extractedText: extractedText.slice(0, 500)
    });

  } catch (error) {
    console.error('[Upload/Camera] Error:', error.message);
    res.json({ success: false, error: error.message });
  }
});

module.exports = router;
