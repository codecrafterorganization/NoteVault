const express = require('express');
const { generateContent } = require('../utils/gemini');
const router = express.Router();

const FALLBACK_QUESTIONS = [
  {
    question: 'What is the powerhouse of the cell?',
    options: ['Nucleus', 'Mitochondria', 'Ribosome', 'Golgi Apparatus'],
    correctAnswer: 'B',
    explanation: 'Mitochondria produce ATP through cellular respiration.',
  },
  {
    question: 'What does DNA stand for?',
    options: ['Deoxyribonucleic Acid', 'Dinitrogen Acid', 'Double Nucleic Acid', 'Dynamic Nucleotide Array'],
    correctAnswer: 'A',
    explanation: 'DNA = Deoxyribonucleic Acid, the molecule carrying genetic information.',
  },
  {
    question: "Newton's Second Law states that Force equals?",
    options: ['mass × velocity', 'mass × acceleration', 'mass / acceleration', 'velocity / time'],
    correctAnswer: 'B',
    explanation: 'F = ma — Force equals mass times acceleration.',
  },
  {
    question: 'What is the speed of light in vacuum?',
    options: ['3×10⁸ m/s', '3×10⁶ m/s', '3×10¹⁰ m/s', '3×10⁴ m/s'],
    correctAnswer: 'A',
    explanation: 'The speed of light c ≈ 3×10⁸ meters per second.',
  },
  {
    question: 'Which gas is most abundant in Earth\'s atmosphere?',
    options: ['Oxygen', 'Carbon Dioxide', 'Nitrogen', 'Argon'],
    correctAnswer: 'C',
    explanation: 'Nitrogen makes up about 78% of Earth\'s atmosphere.',
  },
  {
    question: 'What is the chemical formula for water?',
    options: ['H2O2', 'H2O', 'HO2', 'H3O'],
    correctAnswer: 'B',
    explanation: 'Water is composed of 2 hydrogen atoms and 1 oxygen atom: H₂O.',
  },
  {
    question: 'What is the pH of a neutral solution at 25°C?',
    options: ['0', '7', '14', '10'],
    correctAnswer: 'B',
    explanation: 'A neutral solution has a pH of 7 (neither acidic nor basic).',
  },
  {
    question: 'How many planets are in our Solar System?',
    options: ['7', '8', '9', '10'],
    correctAnswer: 'B',
    explanation: 'There are 8 planets: Mercury, Venus, Earth, Mars, Jupiter, Saturn, Uranus, Neptune.',
  },
  {
    question: 'Who developed the Theory of Relativity?',
    options: ['Isaac Newton', 'Nikola Tesla', 'Albert Einstein', 'Max Planck'],
    correctAnswer: 'C',
    explanation: 'Albert Einstein developed both Special and General Relativity.',
  },
  {
    question: 'What is the atomic number of Carbon?',
    options: ['6', '8', '12', '14'],
    correctAnswer: 'A',
    explanation: 'Carbon has atomic number 6, meaning it has 6 protons in its nucleus.',
  },
  {
    question: 'What is the Pythagorean theorem?',
    options: ['a+b=c', 'a²+b²=c²', 'a×b=c²', 'a/b=c'],
    correctAnswer: 'B',
    explanation: 'In a right triangle: a² + b² = c², where c is the hypotenuse.',
  },
  {
    question: 'What type of bond shares electrons between atoms?',
    options: ['Ionic Bond', 'Covalent Bond', 'Hydrogen Bond', 'Metallic Bond'],
    correctAnswer: 'B',
    explanation: 'Covalent bonds involve sharing of electron pairs between atoms.',
  },
  {
    question: 'What is photosynthesis?',
    options: [
      'Process of cellular respiration',
      'Process plants use to convert light to glucose',
      'Process of protein synthesis',
      'Process of DNA replication',
    ],
    correctAnswer: 'B',
    explanation: 'Photosynthesis: CO₂ + H₂O + light → glucose + O₂.',
  },
  {
    question: 'What is the first element on the periodic table?',
    options: ['Helium', 'Carbon', 'Hydrogen', 'Oxygen'],
    correctAnswer: 'C',
    explanation: 'Hydrogen (H) is element #1 on the periodic table with atomic number 1.',
  },
  {
    question: 'What is the SI unit of electric current?',
    options: ['Volt', 'Watt', 'Ohm', 'Ampere'],
    correctAnswer: 'D',
    explanation: 'The Ampere (A) is the SI unit of electric current.',
  },
  {
    question: 'Which organelle is responsible for protein synthesis?',
    options: ['Lysosome', 'Ribosome', 'Vacuole', 'Centrosome'],
    correctAnswer: 'B',
    explanation: 'Ribosomes are the cellular machines that translate mRNA into proteins.',
  },
  {
    question: 'What is Avogadro\'s number?',
    options: ['6.022×10²³', '9.8 m/s²', '3×10⁸ m/s', '1.6×10⁻¹⁹ C'],
    correctAnswer: 'A',
    explanation: 'Avogadro\'s number ≈ 6.022×10²³ particles per mole.',
  },
  {
    question: 'Which law states that energy cannot be created or destroyed?',
    options: [
      'Second Law of Thermodynamics',
      'First Law of Thermodynamics',
      'Law of Conservation of Momentum',
      'Ohm\'s Law',
    ],
    correctAnswer: 'B',
    explanation: 'The First Law of Thermodynamics: total energy of a closed system is constant.',
  },
  {
    question: 'What does CPU stand for?',
    options: [
      'Central Processing Unit',
      'Core Performance Unit',
      'Computer Processing Utility',
      'Central Processor Utility',
    ],
    correctAnswer: 'A',
    explanation: 'CPU = Central Processing Unit, the brain of a computer.',
  },
  {
    question: 'What is the chemical symbol for Gold?',
    options: ['Go', 'Gd', 'Au', 'Ag'],
    correctAnswer: 'C',
    explanation: 'Gold\'s symbol is Au, from the Latin word "Aurum".',
  },
];

function shuffleArray(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// GET /api/battle/questions — generate 5 battle questions
router.get('/questions', async (req, res) => {
  try {
    const topic = req.query.topic || 'general science, math, and technology';
    
    const prompt = `Generate exactly 5 multiple-choice quiz questions about ${topic}.
Return ONLY a valid JSON array. No markdown, no code blocks, no extra text.
Format:
[
  {
    "question": "Question text here?",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctAnswer": "A",
    "explanation": "Brief explanation"
  }
]
Rules:
- Exactly 5 questions
- Each has exactly 4 options labeled A, B, C, D
- correctAnswer must be "A", "B", "C", or "D"
- Questions should be engaging, university-level
- Return ONLY the JSON array`;

    const raw = await generateContent(prompt, { temperature: 0.5, maxTokens: 800 });
    
    // Strip markdown fences if present
    const cleaned = raw.replace(/```(?:json)?\s*/gi, '').replace(/```/g, '').trim();
    const questions = JSON.parse(cleaned);
    
    if (Array.isArray(questions) && questions.length >= 5) {
      return res.json({ success: true, questions: questions.slice(0, 5) });
    }
    throw new Error('Invalid question format from AI');
  } catch (err) {
    console.warn('[BattleMode] AI question generation failed, using fallback:', err.message);
    const questions = shuffleArray(FALLBACK_QUESTIONS).slice(0, 5);
    return res.json({ success: true, questions, fallback: true });
  }
});

module.exports = router;
