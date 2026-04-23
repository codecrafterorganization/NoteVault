const axios = require('axios');

// Initialize Gemini API
const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.warn('[Gemini] Warning: GEMINI_API_KEY not set. AI features will not work.');
} else {
  console.log('[Gemini] API Key loaded successfully.');
}

// Default model configuration
const DEFAULT_MODEL = 'gemini-flash-latest';

// Track API failures
let apiCallCount = 0;
const MAX_API_CALLS = 1000;

/**
 * Generate content using Gemini AI
 * @param {string} prompt - The prompt to send to Gemini
 * @param {Object} options - Optional configuration
 * @returns {Promise<string>} - The generated response text
 */
async function generateContent(prompt, options = {}) {
  // Always get the latest key from env in case it was updated
  const currentApiKey = process.env.GEMINI_API_KEY;
  
  if (!currentApiKey) {
    console.error('[Gemini] ERROR: GEMINI_API_KEY not found in environment.');
    return generateFallbackResponse(prompt);
  }

  try {
    const modelStr = options.model || DEFAULT_MODEL;
    console.log(`[Gemini] Attempting ${modelStr} (Key: ${currentApiKey.substring(0, 8)}...)`);
    
    const result = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/${modelStr}:generateContent?key=${currentApiKey}`,
      {
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: options.temperature ?? 0.7,
          maxOutputTokens: options.maxTokens || 1024,
        }
      },
      { timeout: 15000 } // 15s timeout
    );

    const text = result.data.candidates[0].content.parts[0].text;
    apiCallCount++;
    console.log('[Gemini] Success ✓');
    return text;
  } catch (error) {
    const status = error.response?.status;
    const errorData = error.response?.data?.error || {};
    console.error('[Gemini] API ERROR:', status, errorData.message || error.message);

    // If it's a 404, maybe the model name is wrong for this key
    if (status === 404 && !options.model) {
      console.log('[Gemini] 404 - Retrying with gemini-pro-latest...');
      return generateContent(prompt, { ...options, model: 'gemini-pro-latest' });
    }

    return generateFallbackResponse(prompt);
  }
}

/**
 * Generate fallback response when API is unavailable
 */
function generateFallbackResponse(prompt) {
  console.log('[Gemini] Generating fallback response');
  console.log('[Gemini] Prompt preview:', prompt.substring(0, 100));
  
  // Extract note content from prompt - handle different prompt formats
  // Format 1: "Notes:" for chat/cheatsheet
  // Format 2: "STUDY MATERIAL:" for quiz
  // Format 3: content between triple quotes
  let noteContent = '';
  
  const noteMatch = prompt.match(/Notes:\s*\n?([\s\S]*?)(?:\n\nQuestion:|\n\nCreate|Output format|$)/i);
  const studyMaterialMatch = prompt.match(/STUDY MATERIAL:\s*\n?([\s\S]*?)(?:\n\nGenerate|Generate the quiz|Output format|$)/i);
  const tripleQuoteMatch = prompt.match(/"""\s*([\s\S]*?)\s*"""/);
  
  if (noteMatch) {
    noteContent = noteMatch[1].trim();
  } else if (studyMaterialMatch) {
    noteContent = studyMaterialMatch[1].trim();
  } else if (tripleQuoteMatch) {
    noteContent = tripleQuoteMatch[1].trim();
  } else {
    // Last resort: try to extract any substantial text from the prompt
    const lines = prompt.split('\n');
    const contentLines = lines.filter(l => l.length > 20 && !l.includes('Rules:') && !l.includes('Format:'));
    if (contentLines.length > 0) {
      noteContent = contentLines.slice(-5).join(' '); // Take last few substantial lines
    }
  }
  
  console.log('[Gemini] Extracted content length:', noteContent.length);
  console.log('[Gemini] Extracted preview:', noteContent.substring(0, 100));
  
  // Extract question from prompt
  const questionMatch = prompt.match(/Question:\s*([\s\S]*?)(?:\n\nAnswer|$)/i);
  const question = questionMatch ? questionMatch[1].trim() : '';
  
  // Check prompt type and generate appropriate response based ONLY on the system instructions
  const instructions = prompt.substring(0, 200);
  
  if (instructions.includes('cheat sheet') || instructions.includes('HIGH-QUALITY cheat sheet')) {
    return generateFallbackCheatSheet(noteContent);
  }
  
  if (instructions.includes('multiple-choice questions') || instructions.includes('Generate 5 multiple-choice questions')) {
    return generateFallbackQuiz(noteContent);
  }

  if (instructions.includes('Explain the following text')) {
    return `[⚡ Network Timeout: Fast Mode] The text means: ${noteContent.substring(0, 100)}...`;
  }
  
  // Default: Q&A response
  return generateFallbackAnswer(noteContent, question);
}

function generateFallbackAnswer(noteContent, question) {
  // Extract key sentences that might relate to the question
  const sentences = noteContent.split(/[.!?]+/).filter(s => s.trim().length > 10);
  
  // Simple keyword matching
  const questionWords = question.toLowerCase().split(/\s+/);
  let bestMatch = sentences[0] || noteContent.substring(0, 200);
  
  for (const sentence of sentences) {
    const matchCount = questionWords.filter(w => sentence.toLowerCase().includes(w) && w.length > 3).length;
    if (matchCount > 0) {
      bestMatch = sentence;
      break;
    }
  }
  
  return `Based on your notes: ${bestMatch.trim()}`;
}

function generateFallbackCheatSheet(noteContent) {
  const sentences = noteContent.split(/[.!?]+/).filter(s => s.trim().length > 10).slice(0, 5);
  
  let cheatSheet = `## [Demo Mode] Study Notes Summary\n\n## Key Points\n`;
  sentences.forEach((s, i) => {
    cheatSheet += `- ${s.trim()}\n`;
  });
  
  cheatSheet += `\n## Important Concepts\n- Main concept from your notes\n`;
  cheatSheet += `\n## Short Summary\nThis covers the main points from your uploaded notes.\n\n`;
  cheatSheet += `*(Note: Using fallback mode due to API quota limits. For full AI-powered summaries, please try again tomorrow.)*`;
  
  return cheatSheet;
}

function generateFallbackQuiz(noteContent) {
  // Generate simple questions from sentences
  const sentences = noteContent.split(/[.!?]+/).filter(s => s.trim().length > 20).slice(0, 3);
  
  const questions = sentences.map((sentence, i) => {
    const words = sentence.split(/\s+/);
    const keyWord = words.find(w => w.length > 5) || 'concept';
    
    return {
      question: `What does your note say about "${keyWord.replace(/[^a-zA-Z]/g, '')}"?`,
      options: [
        sentence.substring(0, 50),
        "A different concept from the notes",
        "Related information",
        "None of the above"
      ],
      correctAnswer: "A",
      explanation: `According to your notes: ${sentence}`
    };
  });
  
  return JSON.stringify(questions);
}

/**
 * Answer question based on note content
 * @param {string} noteContent - The content of the note
 * @param {string} question - The user's question
 * @returns {Promise<string>} - The AI answer
 */
async function askQuestion(noteContent, question) {
  // DEBUG LOGS
  console.log('[askQuestion] Question:', question);
  console.log('[askQuestion] Note Length:', noteContent?.length);
  console.log('[askQuestion] Preview:', noteContent?.substring(0, 200));
  
  if (!noteContent || noteContent.length < 10) {
    console.error('[askQuestion] ERROR: Note content is empty or too short!');
    return 'Error: No note content available to answer the question.';
  }
  
  // Trim content to manageable size
  const trimmedContent = noteContent.slice(0, 4000);
  
  const prompt = `You are Chanakya AI, a smart study assistant.

Your job is to answer questions using the provided notes.

Rules:
- Use the notes as PRIMARY source
- Try to find relevant meaning, not exact word match
- You are allowed to slightly rephrase and explain concepts
- If answer is partially available, explain based on that
- Only say "This information is not available in the uploaded notes" if absolutely nothing relevant exists
- Answer clearly and simply like a teacher
- Keep your answer VERY concise (3-4 sentences max) to ensure extremely fast response times

Notes:
${trimmedContent}

Question:
${question}

Answer like a helpful teacher:`;

  return await generateContent(prompt, { temperature: 0.8, maxTokens: 300 });
}

/**
 * Explain selected text in simple language
 * @param {string} selectedText - The text to explain
 * @param {string} noteContent - Context from the note (optional)
 * @returns {Promise<string>} - The explanation
 */
async function explainText(selectedText, noteContent = '') {
  const contextPart = noteContent ? `\n\nContext from notes:\n${noteContent}` : '';
  
  const prompt = `You are a helpful tutor. Explain the following text in simple, student-friendly language.

TEXT TO EXPLAIN:
"${selectedText}"${contextPart}

Provide a clear explanation that a student can easily understand. Break down complex concepts if needed.`;

  return await generateContent(prompt, { maxTokens: 250 });
}

/**
 * Generate quiz from note content
 * @param {string} noteContent - The content to generate quiz from
 * @param {string} difficulty - The difficulty level (Easy, Medium, Hard)
 * @returns {Promise<string>} - JSON string with quiz questions
 */
async function generateQuiz(noteContent, difficulty = 'Medium') {
  const prompt = `You are an expert educator creating multiple-choice quizzes.

Generate 5 ${difficulty.toUpperCase()} difficulty multiple-choice questions from the following study material. 
Ensure the cognitive complexity matches the ${difficulty} level (e.g., Easy = basic recall, Medium = comprehension/application, Hard = analysis/evaluation).

IMPORTANT: Respond ONLY with a valid JSON array. Do not include markdown formatting, code blocks, or any other text.

Format:
[
  {
    "question": "What is the capital of France?",
    "options": ["London", "Berlin", "Paris", "Madrid"],
    "correctAnswer": "C",
    "explanation": "Paris is the capital of France."
  }
]

Requirements:
- Return ONLY the JSON array
- No markdown code blocks (no \`\`\`json)
- No extra text before or after
- Exactly 5 questions
- Each question has 4 options (A, B, C, D)
- correctAnswer must be "A", "B", "C", or "D"
- Include brief explanation for each answer

STUDY MATERIAL:
${noteContent.substring(0, 5000)}

Generate the ${difficulty} quiz now:`;

  return await generateContent(prompt, { temperature: 0.3, maxTokens: 600 });
}

/**
 * Generate cheat sheet from note content
 * @param {string} noteContent - The content to summarize
 * @returns {Promise<string>} - The formatted cheat sheet
 */
async function generateCheatsheet(noteContent) {
  // DEBUG LOGS
  console.log('[generateCheatsheet] Note Length:', noteContent?.length);
  console.log('[generateCheatsheet] Preview:', noteContent?.substring(0, 200));
  
  if (!noteContent || noteContent.length < 10) {
    console.error('[generateCheatsheet] ERROR: Note content is empty or too short!');
    return 'Error: No note content available to generate cheat sheet.';
  }
  
  const trimmedContent = noteContent.slice(0, 15000);
  
  const prompt = `You are an elite academic tutor. Create a COMPREHENSIVE, DEEP-DIVE cheat sheet from the provided notes.
DO NOT provide a short summary. Provide a full study guide.

Notes:
${trimmedContent}

Rules:
- Exhaustively cover all key terms, formulas, and concepts
- Use clear Markdown headings (##) and bold text
- If the notes are in Hindi or Hinglish, keep the explanation in a similar friendly mix
- Ensure the output is at least 500-800 words long if the notes allow

Structure:
## Executive Overview
## Deep Dive: Core Concepts
## Detailed Key Points
## Essential Summary & Final Review`;

  console.log('[Gemini] Generating High-Detail Cheat Sheet...');
  return await generateContent(prompt, { 
    model: 'gemini-pro-latest',
    temperature: 0.8, 
    maxTokens: 2048 
  });
}

/**
 * Generate a Master Guide from multiple grouped notes
 * @param {string[]} noteContentsArray - Array of note contents
 * @returns {Promise<string>} - Merged master guide in markdown
 */
async function generateMasterGuide(noteContentsArray) {
  if (!noteContentsArray || noteContentsArray.length === 0) return 'No notes provided.';
  
  // Truncate to avoid blowing up context, Gemini 1.5 flash can handle millions but we safeguard for time
  const combinedNotes = noteContentsArray.map((content, idx) => `--- NOTE ${idx+1} ---\n${content.substring(0, 8000)}`).join('\n\n');

  const prompt = `You are an expert curriculum designer and syllabus compiler.
Multiple students have uploaded notes on related topics. Your job is to create one definitive "Master Guide" that fuses all information, deduplicates overlapping points, and fills in logical gaps between the notes.

Below are the contents from different notes:
${combinedNotes}

Output an incredibly well-structured, comprehensive Master Study Guide using Markdown.
Requirements:
1. Title should start with an emoji.
2. Provide a 'Master Overview' section synthesizing what this guide covers.
3. Group related concepts logically together.
4. Bold essential terms and formulas.
5. Create a 'Fills Gaps' section where you add a tiny bit of necessary context if the notes missed a step connecting two concepts.

Create the Master Guide now:`;

  return await generateContent(prompt, { temperature: 0.4, maxTokens: 2500 });
}

/**
 * Fix code snippet based on error message
 * @param {string} code - The broken code
 * @param {string} error - The error message
 * @param {string} language - Programming language
 * @returns {Promise<Object>} - Fixed code and explanation
 */
async function fixCodeSnippet(code, error, language = 'javascript') {
  const prompt = `You are a world-class software engineer. Fix the following ${language} code.
  
  ERROR MESSAGE:
  ${error}
  
  BROKEN CODE:
  \`\`\`${language}
  ${code}
  \`\`\`
  
  RULES:
  1. Return a JSON object with two fields: "fixedCode" and "explanation".
  2. The explanation should be a short one-liner for a student.
  3. Response must be ONLY valid JSON. No markdown.
  
  Fix the code now:`;

  const response = await generateContent(prompt, { temperature: 0.2, maxTokens: 800 });
  try {
    const match = response.match(/```(?:json)?\s*([\s\S]*?)```/);
    const jsonStr = match ? match[1] : response;
    return JSON.parse(jsonStr);
  } catch (e) {
    console.error('[fixCodeSnippet] JSON Parse failed:', e.message);
    return { fixedCode: code, explanation: "I couldn't parse the fix, please try rephrasing." };
  }
}

/**
 * Summarize text
 */
async function summarize(text) {
  const prompt = `Summarize the following notes in 3-4 concise, professional sentences that capture the main essence:\n\n${text.slice(0, 10000)}\n\nSummary:`;
  return await generateContent(prompt, { temperature: 0.5, maxTokens: 300 });
}

/**
 * Extract key points
 */
async function extractKeyPoints(text) {
  const prompt = `Extract 5-7 most important key points from the following notes. Return ONLY a JSON array of strings.\n\nNotes: ${text.slice(0, 10000)}\n\nKey points (JSON array):`;
  const response = await generateContent(prompt, { temperature: 0.3, maxTokens: 500 });
  try {
    const match = response.match(/\[[\s\S]*\]/);
    return match ? JSON.parse(match[0]) : JSON.parse(response);
  } catch (e) {
    return text.split('\n').filter(l => l.trim().length > 30).slice(0, 5);
  }
}

/**
 * Generate tags
 */
async function generateTags(text) {
  const prompt = `Generate 4-6 relevant one-word lowercase tags for the following notes. Return ONLY a JSON array of strings.\n\nNotes: ${text.slice(0, 5000)}\n\nTags (JSON array):`;
  const response = await generateContent(prompt, { temperature: 0.3, maxTokens: 100 });
  try {
    const match = response.match(/\[[\s\S]*\]/);
    return match ? JSON.parse(match[0]) : JSON.parse(response);
  } catch (e) {
    return ['notes', 'study', 'ai'];
  }
}

module.exports = {
  generateContent,
  askQuestion,
  explainText,
  generateQuiz,
  generateCheatsheet,
  generateMasterGuide,
  fixCodeSnippet,
  summarize,
  extractKeyPoints,
  generateTags
};
