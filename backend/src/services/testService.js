const gemini = require('../utils/gemini');

/**
 * Service to handle Advanced Test Mode logic
 */
const TestService = {
  /**
   * Generate questions based on level
   */
  async generateTestQuestions(noteContent, difficulty) {
    let mcqCount = 0;
    let saCount = 0;
    let laCount = 0;

    if (difficulty === 'Beginner') {
      mcqCount = 10;
    } else if (difficulty === 'Intermediate') {
      mcqCount = 8;
      saCount = 7;
    } else {
      mcqCount = 12;
      laCount = 8;
    }

    const prompt = `You are an elite academic examiner. Generate a comprehensive ${difficulty} level test based on the following notes.
    
    LEVEL REQUIREMENTS:
    - ${mcqCount} Multiple Choice Questions (MCQ) - Format: Question, 4 options, Correct Letter (A-D), Explanation.
    ${saCount > 0 ? `- ${saCount} Short Answer Questions (SA) - 2-3 sentences expected. Provide a "rubric" or key points for each.` : ''}
    ${laCount > 0 ? `- ${laCount} Long Answer Questions (LA) - Detailed analysis, 200+ words expected. Provide a "rubric" or key points for each.` : ''}

    IMPORTANT: Respond ONLY with a valid JSON object.
    Format:
    {
      "questions": [
        {
          "id": "q1",
          "type": "MCQ",
          "text": "...",
          "options": ["...", "...", "...", "..."],
          "correctAnswer": "A",
          "explanation": "..."
        },
        {
          "id": "q11",
          "type": "SHORT_ANSWER",
          "text": "...",
          "rubric": "Key points to cover..."
        }
      ]
    }

    STUDY MATERIAL:
    ${noteContent.substring(0, 6000)}

    Generate the ${difficulty} test now:`;

    const response = await gemini.generateContent(prompt, { temperature: 0.3, maxTokens: 3000 });
    try {
      const match = response.match(/```(?:json)?\s*([\s\S]*?)```/);
      const jsonStr = match ? match[1] : response;
      return JSON.parse(jsonStr).questions;
    } catch (e) {
      console.error('[TestService] Failed to parse generated questions:', e.message);
      throw new Error('AI failed to generate a structured test. Please try again.');
    }
  },

  /**
   * Evaluate a single subjective answer
   */
  async evaluateAnswer(questionText, rubric, studentAnswer, type) {
    const prompt = `You are an AI grader. Evaluate the student's answer based on the provided question and rubric.
    
    QUESTION: ${questionText}
    RUBRIC/KEY POINTS: ${rubric}
    STUDENT ANSWER: ${studentAnswer}
    TYPE: ${type} (Short Answer or Long Answer)

    Return ONLY a JSON object with:
    {
      "score": (0-100),
      "feedback": "2-3 sentences of feedback",
      "tips": ["Tip 1", "Tip 2", "Tip 3"],
      "conceptsCovered": ["...", "..."],
      "conceptsMissing": ["...", "..."]
    }

    Evaluate objectively:`;

    const response = await gemini.generateContent(prompt, { temperature: 0.2, maxTokens: 500 });
    try {
      const match = response.match(/```(?:json)?\s*([\s\S]*?)```/);
      const jsonStr = match ? match[1] : response;
      return JSON.parse(jsonStr);
    } catch (e) {
      return {
        score: 50,
        feedback: "Could not perform deep evaluation, but answer was received.",
        tips: ["Review the main concept again"],
        conceptsCovered: [],
        conceptsMissing: []
      };
    }
  }
};

module.exports = TestService;
