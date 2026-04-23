import React, { useState } from 'react';
import axios from 'axios';
import { HelpCircle, CheckCircle, XCircle, ArrowRight, Lightbulb, Loader2 } from 'lucide-react';

const QuizPanel = ({ noteId }) => {
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [difficulty, setDifficulty] = useState('Medium');

  const generateQuiz = async () => {
    setIsLoading(true);
    setQuestions([]);
    setIsFinished(false);
    setScore(0);
    setCurrentIndex(0);

    try {
      const res = await axios.post('http://localhost:5000/api/quiz/generate', {
        noteId: noteId || 'default-note',
        questionCount: 5,
        difficulty
      });
      if (res.data.success && res.data.questions?.length > 0) {
        setQuestions(res.data.questions);
      } else {
        alert('Failed to generate quiz. Make sure notes have text content.');
      }
    } catch (err) {
      console.error(err);
      alert('Error connecting to quiz server.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOptionClick = (optionStr) => {
    if (selectedOption) return; // Prevent changing answer
    const choiceLetter = optionStr.charAt(0); // A, B, C, D assuming format "A) Text" or just the index if mapped manually. Wait, backend gives options as plain strings. 
    // We'll pass the full string, but the correct answer is 'A', 'B', 'C', or 'D'.
  };

  // Safe handler that assumes options are an array of strings, 
  // we map index 0->A, 1->B, etc.
  const handleSelectOption = (index) => {
    if (selectedOption !== null) return;
    const letter = String.fromCharCode(65 + index); // 0 -> A, 1 -> B
    setSelectedOption(letter);
    setShowExplanation(true);
    
    if (letter === questions[currentIndex].correctAnswer) {
      setScore(score + 1);
    }
  };

  const nextQuestion = () => {
    if (currentIndex + 1 < questions.length) {
      setCurrentIndex(currentIndex + 1);
      setSelectedOption(null);
      setShowExplanation(false);
    } else {
      setIsFinished(true);
    }
  };

  if (isLoading) {
    return (
      <div className="h-full flex flex-col cinematic-glass rounded-3xl premium-surface flex items-center justify-center">
        <Loader2 size={40} className="text-white animate-spin mb-4" />
        <h3 className="text-xl font-semibold text-white">Generating Quiz...</h3>
        <p className="text-sm text-slate-400 mt-2">Our AI is reading your notes to create MCQs.</p>
      </div>
    );
  }

  if (isFinished) {
    return (
      <div className="h-full flex flex-col cinematic-glass rounded-3xl premium-surface flex items-center justify-center p-8 text-center">
        <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center border border-white/20 mb-6">
          <CheckCircle size={40} className="text-white" />
        </div>
        <h2 className="text-3xl font-bold text-white mb-2">Quiz Complete!</h2>
        <p className="text-lg text-slate-300 mb-8">You scored <span className="font-bold text-emerald-400">{score}</span> out of {questions.length}</p>
        
        <div className="flex gap-2 mb-6">
          {['Easy', 'Medium', 'Hard'].map(level => (
            <button 
              key={level}
              onClick={() => setDifficulty(level)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${difficulty === level ? 'bg-purple-500/20 border-purple-500 text-purple-300' : 'bg-black/20 border-white/10 text-slate-400 hover:border-purple-500/50'}`}
            >
              {level}
            </button>
          ))}
        </div>

        <button onClick={generateQuiz} className="px-6 py-3 bg-white text-black hover:bg-slate-200 rounded-xl transition-all font-semibold shadow-lg shadow-white/10">
          Generate Another Quiz
        </button>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="h-full flex flex-col cinematic-glass rounded-3xl premium-surface flex items-center justify-center">
        <HelpCircle size={48} className="text-slate-500 mb-6" />
        <h2 className="text-2xl font-bold text-white mb-3">Test Your Knowledge</h2>
        <p className="text-slate-400 text-center max-w-sm mb-6">Instantly generate a multi-choice quiz based purely on your uploaded notes.</p>
        
        <div className="flex gap-2 mb-8">
          {['Easy', 'Medium', 'Hard'].map(level => (
            <button 
              key={level}
              onClick={() => setDifficulty(level)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all border ${difficulty === level ? 'bg-purple-500/20 border-purple-500 text-purple-300' : 'bg-black/20 border-white/10 text-slate-400 hover:border-purple-500/50'}`}
            >
              {level}
            </button>
          ))}
        </div>

        <button onClick={generateQuiz} className="px-6 py-3 bg-white text-black hover:bg-slate-200 rounded-xl transition-all font-semibold shadow-lg shadow-white/10">
          🚀 Generate Quiz
        </button>
      </div>
    );
  }

  const q = questions[currentIndex];

  return (
    <div className="h-full flex flex-col cinematic-glass rounded-3xl overflow-hidden premium-surface relative">
      <div className="absolute inset-0 bg-gradient-to-b from-white/[0.03] to-transparent pointer-events-none" />
      
      {/* Quiz Header */}
      <div className="h-16 flex justify-between items-center px-6 border-b border-white/[0.05] relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center border border-white/20">
            <HelpCircle size={16} className="text-white" />
          </div>
          <span className="font-semibold text-white tracking-wide">Knowledge Check</span>
        </div>
        <div className="text-sm font-semibold text-slate-400">
          Question {currentIndex + 1} of {questions.length}
        </div>
      </div>

      {/* Quiz Content */}
      <div className="flex-1 overflow-y-auto no-scrollbar p-8 flex flex-col z-10">
        <h2 className="text-xl font-medium text-white mb-8 leading-relaxed">
          {q.question}
        </h2>

        <div className="flex flex-col gap-4 mb-8">
          {q.options.map((opt, i) => {
            const letter = String.fromCharCode(65 + i);
            const isSelected = selectedOption === letter;
            const isCorrect = letter === q.correctAnswer;
            
            let btnClass = "border-slate-700/50 bg-white/[0.02] hover:bg-white/[0.06] text-slate-300";
            let Icon = null;

            if (selectedOption) {
              if (isCorrect) {
                btnClass = "border-emerald-500/50 bg-emerald-500/10 text-emerald-300";
                Icon = <CheckCircle size={18} className="text-emerald-400" />;
              } else if (isSelected && !isCorrect) {
                btnClass = "border-red-500/50 bg-red-500/10 text-red-300";
                Icon = <XCircle size={18} className="text-red-400" />;
              }
            }

            return (
              <button
                key={i}
                disabled={selectedOption !== null}
                onClick={() => handleSelectOption(i)}
                className={`flex items-center justify-between p-4 rounded-xl border transition-all text-left ${btnClass} ${selectedOption ? 'cursor-default' : 'cursor-pointer'}`}
              >
                <div className="flex items-center gap-4">
                  <span className={`w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold ${selectedOption && (isCorrect || isSelected) ? 'bg-black/30' : 'bg-slate-800 text-slate-400'}`}>
                    {letter}
                  </span>
                  <span>{opt}</span>
                </div>
                {Icon}
              </button>
            );
          })}
        </div>

        {/* Explanation Box */}
        {showExplanation && (
          <div className="mt-auto p-4 rounded-xl bg-white/10 border border-white/20 text-slate-100 animate-in fade-in slide-in-from-bottom-4 flex gap-4">
            <Lightbulb size={20} className="text-white shrink-0 mt-0.5" />
            <div className="flex-1 flex flex-col gap-3">
               <div>
                  <h4 className="font-semibold text-white text-sm mb-1">AI Explanation</h4>
                  <p className="text-sm opacity-90 leading-relaxed">{q.explanation}</p>
               </div>
               <button 
                 onClick={nextQuestion}
                 className="self-end flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors text-sm font-semibold"
               >
                 Next Question <ArrowRight size={16} />
               </button>
            </div>
          </div>
        )}
      </div>

    </div>
  );
};

export default QuizPanel;
