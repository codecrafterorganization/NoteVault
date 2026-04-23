/**
 * TestService — powered by Groq (LLaMA 3.3 70B)
 * Handles test generation and answer evaluation.
 */

const groq = require('../utils/groq');

const TestService = {
  /**
   * Generate questions based on difficulty level
   */
  async generateTestQuestions(noteContent, difficulty) {
    let mcqCount = 0, saCount = 0, laCount = 0;

    if (difficulty === 'Beginner') {
      mcqCount = 10;
    } else if (difficulty === 'Intermediate') {
      mcqCount = 8;
      saCount  = 7;
    } else {
      mcqCount = 12;
      laCount  = 8;
    }

    const prompt = `You are an elite academic examiner. Generate a ${difficulty}-level test from the study material below.

REQUIREMENTS:
- ${mcqCount} Multiple Choice Questions (MCQ): include 4 options (A-D), correctAnswer letter, and a brief explanation.
${saCount > 0 ? `- ${saCount} Short Answer Questions (SHORT_ANSWER): provide a "rubric" with 2-3 key points expected.` : ''}
${laCount > 0 ? `- ${laCount} Long Answer Questions (LONG_ANSWER): provide a "rubric" with 4-5 key points expected.` : ''}

OUTPUT FORMAT: Return ONLY a valid JSON object — no markdown, no commentary.
{
  "questions": [
    {
      "id": "q1",
      "type": "MCQ",
      "text": "...",
      "options": ["A. ...", "B. ...", "C. ...", "D. ..."],
      "correctAnswer": "A",
      "explanation": "..."
    },
    {
      "id": "q11",
      "type": "SHORT_ANSWER",
      "text": "...",
      "rubric": "Key points: 1) ... 2) ... 3) ..."
    }
  ]
}

STUDY MATERIAL:
${(noteContent || 'General knowledge test — create questions on common academic topics.').substring(0, 8000)}

Generate the ${difficulty} test now (JSON only):`;

    const raw = await groq.generateContent(prompt, {
      maxTokens: 4096,
      temperature: 0.3,
    });

    try {
      const parsed = groq.parseJSON(raw);
      if (!parsed.questions || !Array.isArray(parsed.questions)) {
        throw new Error('No questions array in response');
      }
      console.log(`[TestService] Generated ${parsed.questions.length} questions.`);
      return parsed.questions;
    } catch (e) {
      console.error('[TestService] JSON parse failed:', e.message);
      console.error('[TestService] Raw response (first 500 chars):', raw.substring(0, 500));
      throw new Error('AI returned an unstructured response. Please try again.');
    }
  },

  /**
   * Evaluate a single subjective answer
   */
  async evaluateAnswer(questionText, rubric, studentAnswer, type) {
    const prompt = `You are an AI grader. Evaluate the student's answer strictly and fairly.

QUESTION: ${questionText}
RUBRIC: ${rubric}
STUDENT ANSWER: ${studentAnswer || '(no answer provided)'}
TYPE: ${type}

Return ONLY a JSON object:
{
  "score": <integer 0-100>,
  "feedback": "<2-3 sentences of constructive feedback>",
  "tips": ["tip1", "tip2", "tip3"],
  "conceptsCovered": ["..."],
  "conceptsMissing": ["..."]
}`;

    const raw = await groq.generateContent(prompt, {
      maxTokens: 512,
      temperature: 0.2,
      model: groq.FAST_MODEL, // Use fast model for evaluation
    });

    try {
      return groq.parseJSON(raw);
    } catch (e) {
      return {
        score: 50,
        feedback: 'Answer received but deep evaluation could not be parsed. Please review manually.',
        tips: ['Review the core concept once more'],
        conceptsCovered: [],
        conceptsMissing: [],
      };
    }
  },
};

module.exports = TestService;
