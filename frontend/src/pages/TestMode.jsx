import API_BASE from '../config.js';
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Brain, Timer, CheckCircle, ArrowRight, ArrowLeft, Loader2, AlertTriangle, XCircle, FileWarning } from 'lucide-react';

const LoadingSpinner = ({ text }) => (
  <div className="w-full h-screen flex flex-col items-center justify-center gap-4">
    <Loader2 size={40} className="text-blue-500 animate-spin" />
    <p className="text-slate-400 font-medium">{text}</p>
  </div>
);

const ErrorMessage = ({ message }) => (
  <div className="w-full max-w-4xl p-4 mb-4 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center gap-3">
    <AlertTriangle size={20} className="text-red-500 shrink-0" />
    <span className="text-red-200 text-sm">{message}</span>
  </div>
);

const EmptyState = ({ title, description, action, actionText }) => (
  <div className="w-full p-8 rounded-3xl bg-white/5 border border-white/10 flex flex-col items-center justify-center gap-4 text-center">
    <FileWarning size={32} className="text-slate-500" />
    <div>
      <h3 className="text-white font-bold">{title}</h3>
      <p className="text-slate-400 text-sm mt-1">{description}</p>
    </div>
    {action && (
      <button onClick={action} className="mt-2 px-6 py-2 rounded-full bg-white/10 hover:bg-white/20 text-white font-medium text-sm transition-colors">
        {actionText}
      </button>
    )}
  </div>
);

const TestMode = () => {
  const { noteId } = useParams();
  const navigate = useNavigate();
  
  const [status, setStatus] = useState('idle'); // idle | loading | success | error
  const [step, setStep] = useState('select'); // select | loading | testing | evaluating | results
  
  const [difficulty, setDifficulty] = useState('medium');
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState([]); // Array of { questionId, selected }
  const [quizId, setQuizId] = useState(null);
  
  const [timeTaken, setTimeTaken] = useState(0);
  const [results, setResults] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  
  const [allNotes, setAllNotes] = useState([]);
  const [selectedNoteId, setSelectedNoteId] = useState(noteId !== 'general' ? noteId : null);

  const timerRef = useRef(null);

  const levels = [
    { id: 'easy', name: 'Easy', desc: 'Direct recall • Simple language • Clear options' },
    { id: 'medium', name: 'Medium', desc: 'Application • Connect concepts • Inference' },
    { id: 'hard', name: 'Hard', desc: 'Analysis • Synthesis • Nuanced plausible options' }
  ];

  useEffect(() => {
    if (noteId === 'general') {
      fetch(API_BASE + '/api/notes')
        .then(res => res.json())
        .then(data => {
          if (data.notes && data.notes.length > 0) {
            setAllNotes(data.notes.filter(n => n.content || n.extracted_text));
          }
        })
        .catch(console.error);
    }
  }, [noteId]);

  // Timer tracking
  useEffect(() => {
    if (step === 'testing') {
      timerRef.current = setInterval(() => {
        setTimeTaken(prev => prev + 1);
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [step]);

  const startTest = async () => {
    const targetId = selectedNoteId || noteId;
    if (!targetId || targetId === 'general') {
      setErrorMsg('Please select a note to test on.');
      return;
    }

    setStep('loading');
    setErrorMsg(null);
    try {
      const res = await fetch(API_BASE + '/api/quiz/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ noteId: targetId, difficulty, questionCount: 10 })
      });
      const data = await res.json();
      
      if (data.success) {
        setQuestions(data.questions);
        setQuizId(data.quizId);
        setTimeTaken(0);
        setAnswers([]);
        setCurrentIndex(0);
        setStep('testing');
      } else {
        setErrorMsg(data.error || 'Failed to generate quiz. Please try again.');
        setStep('select');
      }
    } catch (err) {
      console.error(err);
      setErrorMsg('Could not reach the server. Make sure the backend is running.');
      setStep('select');
    }
  };

  const handleOptionSelect = (optionKey) => {
    const questionId = questions[currentIndex].id;
    setAnswers(prev => {
      const existingIndex = prev.findIndex(a => a.questionId === questionId);
      if (existingIndex >= 0) {
        const newAnswers = [...prev];
        newAnswers[existingIndex] = { questionId, selected: optionKey };
        return newAnswers;
      } else {
        return [...prev, { questionId, selected: optionKey }];
      }
    });
  };

  const submitTest = async () => {
    setStep('evaluating');
    try {
      const res = await fetch(API_BASE + '/api/quiz/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quizId, answers, timeTaken })
      });
      const data = await res.json();
      if (data.success) {
        setResults(data);
        setStep('results');
      } else {
        setErrorMsg('Evaluation failed.');
        setStep('testing');
      }
    } catch (err) {
      console.error(err);
      setErrorMsg('Error submitting quiz.');
      setStep('testing');
    }
  };

  // --- RENDERS ---

  if (step === 'loading') {
    return <LoadingSpinner text="Generating your personalized adaptive quiz..." />;
  }

  if (step === 'evaluating') {
    return <LoadingSpinner text="Evaluating your answers with Gemini..." />;
  }

  if (step === 'select') {
    return (
      <div className="relative z-10 w-full h-screen flex flex-col p-8 gap-12 items-center overflow-y-auto no-scrollbar">
        <div className="flex flex-col items-center gap-4 text-center mt-8">
          <div className="w-16 h-16 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center">
            <Brain size={32} className="text-blue-400" />
          </div>
          <h1 className="text-4xl font-bold text-white tracking-tight">Adaptive Quiz Generator</h1>
          <p className="text-slate-400 max-w-md">Our AI will generate exactly 10 targeted multiple-choice questions from your notes based on your chosen difficulty.</p>
        </div>

        {errorMsg && <ErrorMessage message={errorMsg} />}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl">
          {levels.map(l => (
            <div 
              key={l.id}
              onClick={() => setDifficulty(l.id)}
              className={`p-6 rounded-3xl border transition-all cursor-pointer flex flex-col gap-4 ${difficulty === l.id ? 'bg-blue-500/10 border-blue-500 shadow-lg shadow-blue-500/20' : 'bg-white/[0.02] border-white/5 hover:border-white/20'}`}
            >
              <h3 className="text-xl font-bold text-white">{l.name}</h3>
              <p className="text-sm text-slate-400 leading-relaxed">{l.desc}</p>
            </div>
          ))}
        </div>

        {noteId === 'general' && (
          <div className="w-full max-w-4xl flex flex-col gap-4 mt-4">
             <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest text-center">Select Note for Exam</h3>
             {allNotes.length === 0 ? (
               <EmptyState title="No notes found" description="Upload a note first to generate a quiz." action={() => navigate('/dashboard')} actionText="Go to Dashboard" />
             ) : (
               <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {allNotes.map(n => (
                    <div 
                      key={n.id}
                      onClick={() => setSelectedNoteId(n.id)}
                      className={`p-3 rounded-xl border text-[11px] font-medium transition-all cursor-pointer truncate ${selectedNoteId === n.id ? 'bg-white text-black border-white' : 'bg-white/5 border-white/5 text-slate-400 hover:border-white/10'}`}
                    >
                      {n.title}
                    </div>
                  ))}
               </div>
             )}
          </div>
        )}

        <button 
          onClick={startTest}
          disabled={!selectedNoteId && noteId === 'general'}
          className="mt-8 px-8 py-4 bg-white text-black rounded-full font-bold shadow-[0_0_40px_rgba(255,255,255,0.3)] hover:scale-105 transition-transform disabled:opacity-50 disabled:hover:scale-100"
        >
          Generate Quiz
        </button>
      </div>
    );
  }

  if (step === 'testing') {
    const currentQ = questions[currentIndex];
    const currentAnswer = answers.find(a => a.questionId === currentQ.id)?.selected;

    return (
      <div className="relative z-10 w-full h-screen flex flex-col items-center p-8 overflow-y-auto no-scrollbar">
        {/* Header */}
        <div className="w-full max-w-3xl flex justify-between items-center mb-8 bg-white/5 p-4 rounded-2xl border border-white/10">
           <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center font-bold text-white">
               {currentIndex + 1}
             </div>
             <div className="flex flex-col">
               <span className="text-xs text-slate-400 font-bold tracking-widest uppercase">Question</span>
               <span className="text-sm font-medium text-white">{currentIndex + 1} of {questions.length}</span>
             </div>
           </div>
           
           <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10">
             <Timer size={16} className="text-slate-400" />
             <span className="text-sm font-medium text-white">{Math.floor(timeTaken / 60)}:{(timeTaken % 60).toString().padStart(2, '0')}</span>
           </div>
        </div>

        {errorMsg && <ErrorMessage message={errorMsg} />}

        {/* Question Area */}
        <div className="w-full max-w-3xl flex-1 flex flex-col gap-8">
          <h2 className="text-2xl md:text-3xl font-medium text-white leading-relaxed">
            {currentQ.question}
          </h2>

          <div className="grid grid-cols-1 gap-4 mt-4">
            {Object.entries(currentQ.options).map(([key, value]) => {
              const isSelected = currentAnswer === key;
              return (
                <div 
                  key={key}
                  onClick={() => handleOptionSelect(key)}
                  className={`p-6 rounded-2xl border transition-all cursor-pointer flex gap-4 items-center ${isSelected ? 'bg-blue-500/10 border-blue-500' : 'bg-white/5 border-white/10 hover:border-white/30 hover:bg-white/10'}`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${isSelected ? 'bg-blue-500 text-white' : 'bg-white/10 text-slate-300'}`}>
                    {key}
                  </div>
                  <div className="text-slate-200 text-lg flex-1 leading-snug">{value}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer Navigation */}
        <div className="w-full max-w-3xl flex justify-between items-center mt-8 pt-8 border-t border-white/10">
          <button 
            onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
            disabled={currentIndex === 0}
            className="flex items-center gap-2 px-6 py-3 rounded-full font-medium text-white bg-white/5 hover:bg-white/10 transition-colors disabled:opacity-30"
          >
            <ArrowLeft size={18} /> Previous
          </button>
          
          <div className="text-sm font-medium text-slate-400">
            {answers.length} of {questions.length} answered
          </div>

          {currentIndex === questions.length - 1 ? (
            <button 
              onClick={submitTest}
              className="flex items-center gap-2 px-8 py-3 rounded-full font-bold text-black bg-white hover:bg-slate-200 transition-colors shadow-[0_0_20px_rgba(255,255,255,0.2)]"
            >
              Submit Quiz <CheckCircle size={18} />
            </button>
          ) : (
            <button 
              onClick={() => setCurrentIndex(prev => Math.min(questions.length - 1, prev + 1))}
              className="flex items-center gap-2 px-6 py-3 rounded-full font-medium text-white bg-white/10 hover:bg-white/20 transition-colors"
            >
              Next <ArrowRight size={18} />
            </button>
          )}
        </div>
      </div>
    );
  }

  if (step === 'results' && results) {
    return (
      <div className="relative z-10 w-full min-h-screen flex flex-col items-center p-8 overflow-y-auto">
        <div className="w-full max-w-3xl flex flex-col gap-12 mt-8">
          
          <div className="flex flex-col md:flex-row items-center gap-8 p-8 rounded-3xl bg-white/5 border border-white/10 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-emerald-500" />
            
            <div className="flex-1 text-center md:text-left flex flex-col gap-2">
              <h1 className="text-4xl font-bold text-white tracking-tight">Quiz Complete!</h1>
              <p className="text-slate-400 text-lg">{results.feedback}</p>
              <div className="flex items-center justify-center md:justify-start gap-4 mt-4">
                 <div className="px-3 py-1 rounded-full bg-white/10 text-xs font-bold text-slate-300 uppercase tracking-widest border border-white/10">
                   Difficulty: {difficulty}
                 </div>
                 <div className="px-3 py-1 rounded-full bg-white/10 text-xs font-bold text-slate-300 uppercase tracking-widest border border-white/10">
                   Time: {Math.floor(results.timeTaken / 60)}:{(results.timeTaken % 60).toString().padStart(2, '0')}
                 </div>
              </div>
            </div>

            <div className="flex flex-col items-center justify-center w-32 h-32 rounded-full bg-white/5 border-4 border-white/10 relative">
               <span className="text-4xl font-bold text-white">{results.percentage}%</span>
               <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Grade {results.grade}</span>
            </div>
          </div>

          <div className="flex flex-col gap-6">
            <h2 className="text-xl font-bold text-white border-b border-white/10 pb-4">Detailed Review</h2>
            
            {results.results.map((r, i) => (
              <div key={r.questionId} className={`p-6 rounded-2xl border ${r.correct ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-red-500/5 border-red-500/20'} flex flex-col gap-4`}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex gap-4">
                    <div className={`w-8 h-8 shrink-0 rounded-full flex items-center justify-center font-bold ${r.correct ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                      {i + 1}
                    </div>
                    <div className="flex flex-col gap-2">
                      <h3 className="text-lg font-medium text-white leading-snug">{r.question}</h3>
                      <div className="flex flex-wrap gap-2 text-sm mt-2">
                         <span className="px-3 py-1 rounded-md bg-white/5 border border-white/10 text-slate-300">
                           Your Answer: <strong>{r.userAnswer}</strong>
                         </span>
                         {!r.correct && (
                           <span className="px-3 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                             Correct Answer: <strong>{r.correctAnswer}</strong>
                           </span>
                         )}
                      </div>
                    </div>
                  </div>
                  <div className="shrink-0 mt-1">
                    {r.correct ? <CheckCircle className="text-emerald-500" size={24} /> : <XCircle className="text-red-500" size={24} />}
                  </div>
                </div>
                
                <div className="ml-12 p-4 rounded-xl bg-white/5 border border-white/5 text-sm text-slate-300 leading-relaxed">
                  <strong>Explanation:</strong> {r.explanation}
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-center mt-4 mb-12">
            <button 
              onClick={() => {
                setStep('select');
                setResults(null);
                setQuestions([]);
              }}
              className="px-8 py-4 rounded-full bg-white/10 text-white font-bold hover:bg-white/20 transition-all border border-white/10"
            >
              Take Another Quiz
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default TestMode;
