import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ChevronLeft, Brain, Timer, CheckCircle, Upload, ArrowRight, Loader2, AlertTriangle } from 'lucide-react';
import gsap from 'gsap';

const TestMode = () => {
  const { noteId } = useParams();
  const navigate = useNavigate();
  
  const [step, setStep] = useState('select'); // 'select' | 'testing' | 'evaluating' | 'results'
  const [difficulty, setDifficulty] = useState('Intermediate');
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [sessionId, setSessionId] = useState(null);
  
  const [isUploading, setIsUploading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(3600); // 60 mins for advanced
  const [results, setResults] = useState(null);
  
  const containerRef = useRef(null);

  // Level Selection Info
  const levels = [
    { name: 'Beginner', desc: '10 MCQs • Core concepts • Quick review', time: 'No limit' },
    { name: 'Intermediate', desc: '8 MCQs + 7 Short Answers • Hand-written support', time: 'No limit' },
    { name: 'Advanced', desc: '12 MCQs + 8 Long Answers • Critical analysis', time: '60 minutes' }
  ];

  const startTest = async () => {
    setStep('evaluating'); // Use evaluating as a loading state for generation
    try {
      const res = await fetch('http://localhost:5000/api/test/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ noteId, difficulty })
      });
      const data = await res.json();
      if (data.success) {
        setQuestions(data.questions);
        setSessionId(data.sessionId);
        setStep('testing');
        if (difficulty === 'Advanced') setTimeLeft(3600);
      } else {
        alert('Error: ' + data.error);
        setStep('select');
      }
    } catch (err) {
      console.error(err);
      setStep('select');
    }
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      submitTest();
    }
  };

  const submitTest = async () => {
    setStep('evaluating');
    try {
      const res = await fetch('http://localhost:5000/api/test/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, answers })
      });
      const data = await res.json();
      if (data.success) {
        setResults(data);
        setStep('results');
      } else {
        alert('Evaluation failed.');
        setStep('testing');
      }
    } catch (err) {
      console.error(err);
      setStep('testing');
    }
  };

  const handleOCR = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setIsUploading(true);
    const formData = new FormData();
    formData.append('image', file);
    try {
      const res = await fetch('http://localhost:5000/api/test/ocr', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (data.success) {
        setAnswers(prev => ({ ...prev, [questions[currentIndex].id]: data.text }));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsUploading(false);
    }
  };

  if (step === 'select') {
    return (
      <div className="w-full h-screen flex flex-col p-8 gap-8 items-center justify-center max-w-4xl mx-auto">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="w-16 h-16 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center">
            <Brain size={32} className="text-white" />
          </div>
          <h1 className="text-4xl font-bold text-white tracking-tight">Advanced Test Mode</h1>
          <p className="text-slate-400 max-w-md">Our AI will analyze your notes to create a custom exam. Choose your difficulty level to begin.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
          {levels.map(l => (
            <div 
              key={l.name}
              onClick={() => setDifficulty(l.name)}
              className={`p-6 rounded-3xl border transition-all cursor-pointer flex flex-col gap-4 ${difficulty === l.name ? 'bg-white/10 border-white shadow-lg' : 'bg-white/[0.02] border-white/5 hover:border-white/20'}`}
            >
              <h3 className="text-xl font-bold text-white">{l.name}</h3>
              <p className="text-xs text-slate-400 leading-relaxed">{l.desc}</p>
              <div className="mt-auto flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-slate-500">
                <Timer size={12} /> {l.time}
              </div>
            </div>
          ))}
        </div>

        <button 
          onClick={startTest}
          className="mt-8 px-12 py-4 bg-white text-black font-bold rounded-full hover:scale-105 transition-all shadow-xl shadow-white/10"
        >
          Initialize Exam
        </button>
      </div>
    );
  }

  if (step === 'evaluating') {
    return (
      <div className="w-full h-screen flex flex-col items-center justify-center gap-6">
        <Loader2 size={48} className="text-white animate-spin" />
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white">AI Examiner at Work</h2>
          <p className="text-slate-400 mt-2">Processing notes and calculating results...</p>
        </div>
      </div>
    );
  }

  if (step === 'testing') {
    const q = questions[currentIndex];
    return (
      <div className="w-full h-screen flex flex-col p-6 max-w-5xl mx-auto overflow-hidden">
        <header className="flex justify-between items-center mb-8 shrink-0">
          <div className="flex items-center gap-4">
             <div className="px-3 py-1 bg-white/5 border border-white/10 rounded-lg text-xs font-bold text-slate-400">
                {currentIndex + 1} / {questions.length}
             </div>
             <h2 className="text-sm font-bold text-white uppercase tracking-widest">{difficulty} LEVEL</h2>
          </div>
          {difficulty === 'Advanced' && (
            <div className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-full text-white font-mono text-sm">
              <Timer size={16} /> {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
            </div>
          )}
        </header>

        <div className="flex-1 overflow-y-auto no-scrollbar flex flex-col gap-8 pb-20">
          <h3 className="text-2xl font-medium text-white leading-relaxed">{q.text}</h3>
          
          {q.type === 'MCQ' ? (
            <div className="grid grid-cols-1 gap-4">
              {q.options.map((opt, i) => {
                const letter = String.fromCharCode(65 + i);
                return (
                  <button
                    key={i}
                    onClick={() => setAnswers(prev => ({ ...prev, [q.id]: letter }))}
                    className={`flex items-center gap-4 p-5 rounded-2xl border transition-all text-left ${answers[q.id] === letter ? 'bg-white/10 border-white text-white' : 'bg-white/[0.02] border-white/5 text-slate-400 hover:border-white/20'}`}
                  >
                    <span className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold ${answers[q.id] === letter ? 'bg-white text-black' : 'bg-white/5 text-slate-500'}`}>{letter}</span>
                    <span className="text-lg">{opt}</span>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              <textarea 
                value={answers[q.id] || ''}
                onChange={(e) => setAnswers(prev => ({ ...prev, [q.id]: e.target.value }))}
                placeholder="Type your answer here..."
                className="w-full min-h-[250px] bg-white/[0.02] border border-white/10 rounded-3xl p-6 text-white focus:outline-none focus:border-white/30 transition-all resize-none leading-relaxed"
              />
              <div className="flex justify-between items-center">
                 <p className="text-[10px] text-slate-500 uppercase tracking-widest">
                   {q.type === 'SHORT_ANSWER' ? 'Goal: 20+ chars' : 'Goal: 100+ words'}
                 </p>
                 <label className="flex items-center gap-2 cursor-pointer px-4 py-2 bg-white/5 hover:bg-white/10 rounded-xl text-xs text-slate-300 border border-white/10 transition-all">
                    <Upload size={14} />
                    {isUploading ? 'Extracting...' : 'Upload Handwritten Answer'}
                    <input type="file" className="hidden" onChange={handleOCR} accept="image/*" />
                 </label>
              </div>
            </div>
          )}
        </div>

        <footer className="fixed bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-black via-black/90 to-transparent flex justify-center z-20">
          <button 
             onClick={handleNext}
             className="flex items-center gap-3 px-12 py-4 bg-white text-black font-bold rounded-full hover:scale-105 transition-all shadow-xl shadow-white/10"
          >
            {currentIndex === questions.length - 1 ? 'Finish Exam' : 'Next Question'} <ArrowRight size={20} />
          </button>
        </footer>
      </div>
    );
  }

  if (step === 'results') {
    return (
      <div className="w-full min-h-screen flex flex-col p-8 gap-8 max-w-4xl mx-auto overflow-y-auto no-scrollbar">
        <header className="flex flex-col items-center gap-4 text-center">
          <div className="w-20 h-20 rounded-full bg-white/10 flex items-center justify-center border border-white/20 mb-2">
            <CheckCircle size={40} className="text-white" />
          </div>
          <h1 className="text-4xl font-bold text-white tracking-tight">Assessment Complete</h1>
          <div className="text-7xl font-black text-white mt-4">{results.score}%</div>
          <p className="text-slate-400">Total accuracy across {difficulty} modules</p>
        </header>

        <div className="flex flex-col gap-6">
          <h2 className="text-xl font-bold text-white border-b border-white/10 pb-4">Detailed Breakdown</h2>
          {results.results.map((r, i) => (
            <div key={i} className="p-6 rounded-3xl bg-white/[0.02] border border-white/5 flex flex-col gap-4">
              <div className="flex justify-between items-start">
                <h4 className="text-sm font-bold text-white max-w-md">{r.text}</h4>
                <div className={`px-3 py-1 rounded-full text-[10px] font-bold ${r.evaluation.score > 70 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                   {r.evaluation.score}/100
                </div>
              </div>
              
              <div className="p-4 bg-white/[0.03] rounded-2xl border border-white/5">
                <p className="text-xs text-slate-400 italic mb-2">AI Feedback:</p>
                <p className="text-sm text-slate-200 leading-relaxed">{r.evaluation.feedback}</p>
              </div>

              {r.evaluation.tips && (
                <div className="flex flex-col gap-2">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Improvement Tips:</p>
                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {r.evaluation.tips.map((tip, idx) => (
                      <li key={idx} className="text-xs text-slate-400 flex items-start gap-2">
                        <span className="text-white">•</span> {tip}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="flex justify-center gap-4 mt-8 pb-12">
          <button onClick={() => navigate('/dashboard')} className="px-8 py-3 border border-white/20 rounded-full text-white text-sm hover:bg-white/5 transition-all">
            Return to Workspace
          </button>
          <button onClick={() => setStep('select')} className="px-8 py-3 bg-white text-black font-bold rounded-full text-sm hover:scale-105 transition-all">
            Retake Exam
          </button>
        </div>
      </div>
    );
  }

  return null;
};

export default TestMode;
