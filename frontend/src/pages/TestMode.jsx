import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Brain, Timer, CheckCircle, Upload, ArrowRight, ArrowLeft, Loader2, AlertTriangle, Flag } from 'lucide-react';

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
  const [timeLeft, setTimeLeft] = useState(3600);
  const [results, setResults] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [flagged, setFlagged] = useState(new Set());
  
  const [allNotes, setAllNotes] = useState([]);
  const [selectedNoteId, setSelectedNoteId] = useState(noteId !== 'general' ? noteId : null);
  const [errorMsg, setErrorMsg] = useState(null);
  
  const containerRef = useRef(null);

  // Level Selection Info
  const levels = [
    { name: 'Beginner', desc: '10 MCQs • Core concepts • Quick review', time: 'No limit' },
    { name: 'Intermediate', desc: '8 MCQs + 7 Short Answers • Hand-written support', time: 'No limit' },
    { name: 'Advanced', desc: '12 MCQs + 8 Long Answers • Critical analysis', time: '60 minutes' }
  ];

  useEffect(() => {
    if (noteId === 'general') {
      fetch('http://localhost:5000/api/notes')
        .then(res => res.json())
        .then(data => {
          if (data.notes && data.notes.length > 0) {
            const usableNotes = data.notes.filter(n => n.content && n.content.trim().length >= 50);
            setAllNotes(usableNotes);
          } else {
            setAllNotes([]);
          }
        })
        .catch(err => {
          console.error(err);
          setAllNotes([]);
        });
    }
  }, [noteId]);

  // Timer for Advanced mode
  useEffect(() => {
    if (step !== 'testing' || difficulty !== 'Advanced') return;
    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) { clearInterval(interval); submitTest(); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [step, difficulty]);

  const timerColor = timeLeft <= 300 ? 'text-red-400 bg-red-500/10 border-red-500/30' : timeLeft <= 600 ? 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30' : 'text-white bg-white/5 border-white/10';

  const startTest = async () => {
    const targetId = selectedNoteId || noteId;
    if (!targetId || targetId === 'general') return alert('Please select a note to test on.');

    setStep('evaluating');
    setErrorMsg(null);
    try {
      const res = await fetch('http://localhost:5000/api/test/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ noteId: targetId, difficulty })
      });
      const data = await res.json();
      if (data.success) {
        setQuestions(data.questions);
        setSessionId(data.sessionId);
        setStep('testing');
        if (difficulty === 'Advanced') setTimeLeft(3600);
      } else {
        setErrorMsg(data.error || 'Failed to generate test. Please try a different note.');
        setStep('select');
      }
    } catch (err) {
      console.error(err);
      setErrorMsg('Could not reach the server. Make sure the backend is running.');
      setStep('select');
    }
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setShowConfirm(true);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) setCurrentIndex(currentIndex - 1);
  };

  const toggleFlag = () => {
    setFlagged(prev => {
      const next = new Set(prev);
      next.has(currentIndex) ? next.delete(currentIndex) : next.add(currentIndex);
      return next;
    });
  };

  const answeredCount = questions.filter(q => answers[q.id]).length;

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
      <div className="w-full h-screen flex flex-col p-8 gap-12 items-center overflow-y-auto no-scrollbar">
        <div className="flex flex-col items-center gap-4 text-center mt-8">
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

        {noteId === 'general' && (
          <div className="w-full flex flex-col gap-4 mt-4">
             <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest text-center">Select Note for Exam</h3>
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
          </div>
        )}

        {/* Error Banner */}
        {errorMsg && (
          <div className="w-full flex items-center gap-3 px-5 py-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-sm">
            <AlertTriangle size={18} className="shrink-0" />
            <span>{errorMsg}</span>
            <button onClick={() => setErrorMsg(null)} className="ml-auto text-red-400/50 hover:text-red-400 text-xs">✕</button>
          </div>
        )}

        <button 
          onClick={startTest}
          disabled={noteId === 'general' && !selectedNoteId}
          className="mt-8 px-12 py-4 bg-white text-black font-bold rounded-full hover:scale-105 transition-all shadow-xl shadow-white/10 disabled:opacity-50"
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
    const answerText = answers[q.id] || '';
    const charCount = answerText.length;
    const wordCount = answerText.trim() ? answerText.trim().split(/\s+/).length : 0;

    return (
      <div className="w-full h-screen flex flex-col p-6 max-w-5xl mx-auto overflow-hidden">
        <header className="flex justify-between items-center mb-4 shrink-0">
          <div className="flex items-center gap-4">
             <div className="px-3 py-1 bg-white/5 border border-white/10 rounded-lg text-xs font-bold text-slate-400">
                {currentIndex + 1} / {questions.length}
             </div>
             <h2 className="text-sm font-bold text-white uppercase tracking-widest">{difficulty} LEVEL</h2>
             <button onClick={toggleFlag} className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest border transition-all ${flagged.has(currentIndex) ? 'bg-yellow-500/20 border-yellow-500/30 text-yellow-400' : 'bg-white/5 border-white/10 text-slate-500 hover:text-white'}`}>
               <Flag size={12} /> {flagged.has(currentIndex) ? 'Flagged' : 'Flag'}
             </button>
          </div>
          {difficulty === 'Advanced' && (
            <div className={`flex items-center gap-2 px-4 py-2 border rounded-full font-mono text-sm transition-colors ${timerColor}`}>
              <Timer size={16} /> {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
              {timeLeft <= 300 && <span className="text-[9px] font-bold uppercase animate-pulse">⚠ Hurry!</span>}
            </div>
          )}
        </header>

        {/* Question Navigator Dots */}
        <div className="flex items-center gap-1.5 mb-4 flex-wrap">
          {questions.map((qItem, i) => (
            <button
              key={i}
              onClick={() => setCurrentIndex(i)}
              className={`w-7 h-7 rounded-lg text-[10px] font-bold border transition-all ${
                i === currentIndex ? 'bg-white text-black border-white scale-110' :
                flagged.has(i) ? 'bg-yellow-500/20 border-yellow-500/30 text-yellow-400' :
                answers[qItem.id] ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400' :
                'bg-white/5 border-white/10 text-slate-500 hover:border-white/20'
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>

        {/* Progress Bar */}
        <div className="w-full h-1 bg-white/5 rounded-full mb-6 overflow-hidden">
           <div className="h-full bg-white transition-all duration-500 ease-out" style={{ width: `${(answeredCount / questions.length) * 100}%` }} />
        </div>

        <div className="flex-1 overflow-y-auto no-scrollbar flex flex-col gap-8 pb-28">
          <div className="flex items-start gap-3">
            <span className="text-[10px] font-bold text-slate-600 uppercase mt-1">{q.type === 'MCQ' ? 'MCQ' : q.type === 'SHORT_ANSWER' ? 'Short' : 'Long'}</span>
            <h3 className="text-2xl font-medium text-white leading-relaxed">{q.text}</h3>
          </div>
          
          {q.type === 'MCQ' ? (
            <div className="grid grid-cols-1 gap-4">
              {q.options.map((opt, i) => {
                const letter = String.fromCharCode(65 + i);
                return (
                  <button key={i} onClick={() => setAnswers(prev => ({ ...prev, [q.id]: letter }))}
                    className={`flex items-center gap-4 p-5 rounded-2xl border transition-all text-left ${answers[q.id] === letter ? 'bg-white/10 border-white text-white' : 'bg-white/[0.02] border-white/5 text-slate-400 hover:border-white/20'}`}>
                    <span className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold ${answers[q.id] === letter ? 'bg-white text-black' : 'bg-white/5 text-slate-500'}`}>{letter}</span>
                    <span className="text-lg">{opt}</span>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              <textarea value={answerText} onChange={(e) => setAnswers(prev => ({ ...prev, [q.id]: e.target.value }))}
                placeholder="Type your answer here..."
                className="w-full min-h-[250px] bg-white/[0.02] border border-white/10 rounded-3xl p-6 text-white focus:outline-none focus:border-white/30 transition-all resize-none leading-relaxed" />
              <div className="flex justify-between items-center">
                 <div className="flex items-center gap-4">
                   <p className="text-[10px] text-slate-500 uppercase tracking-widest">
                     {q.type === 'SHORT_ANSWER' ? `${charCount} chars (min 20)` : `${wordCount} words (min 100)`}
                   </p>
                   {((q.type === 'SHORT_ANSWER' && charCount >= 20) || (q.type !== 'SHORT_ANSWER' && wordCount >= 100)) && (
                     <span className="text-[10px] text-emerald-400 font-bold">✓ Met</span>
                   )}
                 </div>
                 <label className="flex items-center gap-2 cursor-pointer px-4 py-2 bg-white/5 hover:bg-white/10 rounded-xl text-xs text-slate-300 border border-white/10 transition-all">
                    <Upload size={14} />
                    {isUploading ? 'Extracting...' : 'Upload Handwritten'}
                    <input type="file" className="hidden" onChange={handleOCR} accept="image/*" />
                 </label>
              </div>
            </div>
          )}
        </div>

        {/* Footer with Prev/Next */}
        <footer className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black via-black/90 to-transparent flex justify-center gap-4 z-20">
          {currentIndex > 0 && (
            <button onClick={handlePrev} className="flex items-center gap-2 px-8 py-4 border border-white/20 text-white rounded-full hover:bg-white/5 transition-all">
              <ArrowLeft size={18} /> Previous
            </button>
          )}
          <button onClick={handleNext}
            className="flex items-center gap-3 px-12 py-4 bg-white text-black font-bold rounded-full hover:scale-105 transition-all shadow-xl shadow-white/10">
            {currentIndex === questions.length - 1 ? 'Finish Exam' : 'Next Question'} <ArrowRight size={20} />
          </button>
        </footer>

        {/* Submit Confirmation Modal */}
        {showConfirm && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-[#111] border border-white/10 rounded-3xl p-8 max-w-md w-full flex flex-col gap-6">
              <h3 className="text-xl font-bold text-white">Submit Exam?</h3>
              <p className="text-sm text-slate-400">You cannot modify answers after submission.</p>
              <div className="flex flex-col gap-2 text-sm">
                <div className="flex justify-between text-slate-300">
                  <span>Answered</span>
                  <span className="font-bold text-white">{answeredCount} / {questions.length}</span>
                </div>
                {questions.length - answeredCount > 0 && (
                  <div className="flex justify-between text-yellow-400">
                    <span>Unanswered</span>
                    <span className="font-bold">{questions.length - answeredCount}</span>
                  </div>
                )}
                {flagged.size > 0 && (
                  <div className="flex justify-between text-yellow-400">
                    <span>Flagged for review</span>
                    <span className="font-bold">{flagged.size}</span>
                  </div>
                )}
              </div>
              <div className="flex gap-3 mt-2">
                <button onClick={() => setShowConfirm(false)} className="flex-1 px-6 py-3 border border-white/20 rounded-full text-white text-sm hover:bg-white/5 transition-all">
                  Go Back
                </button>
                <button onClick={() => { setShowConfirm(false); submitTest(); }} className="flex-1 px-6 py-3 bg-white text-black font-bold rounded-full text-sm hover:scale-105 transition-all">
                  Submit
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  if (step === 'results') {
    const mcqResults = results.results.filter(r => r.type === 'MCQ');
    const writtenResults = results.results.filter(r => r.type !== 'MCQ');
    const mcqCorrect = mcqResults.filter(r => r.evaluation?.correct || r.evaluation?.score === 100).length;
    const writtenAvg = writtenResults.length > 0 ? Math.round(writtenResults.reduce((a, r) => a + (r.evaluation?.score || 0), 0) / writtenResults.length) : null;
    const grade = results.score >= 90 ? 'A+' : results.score >= 80 ? 'A' : results.score >= 70 ? 'B+' : results.score >= 60 ? 'B' : results.score >= 50 ? 'C' : 'D';

    return (
      <div className="w-full min-h-screen flex flex-col p-8 gap-8 max-w-4xl mx-auto overflow-y-auto no-scrollbar">
        <header className="flex flex-col items-center gap-4 text-center">
          <div className="w-20 h-20 rounded-full bg-white/10 flex items-center justify-center border border-white/20 mb-2">
            <CheckCircle size={40} className="text-white" />
          </div>
          <h1 className="text-4xl font-bold text-white tracking-tight">Assessment Complete</h1>
          <div className="text-7xl font-black text-white mt-4">{results.score}%</div>
          <p className="text-slate-400">Grade: <span className="text-white font-bold">{grade}</span> · {difficulty} Level</p>
        </header>

        {/* Score Breakdown Summary */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {mcqResults.length > 0 && (
            <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/5 text-center">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">MCQ Accuracy</p>
              <p className="text-2xl font-black text-white">{mcqCorrect}/{mcqResults.length}</p>
            </div>
          )}
          {writtenAvg !== null && (
            <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/5 text-center">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Written Avg</p>
              <p className="text-2xl font-black text-white">{writtenAvg}/100</p>
            </div>
          )}
          <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/5 text-center">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Questions</p>
            <p className="text-2xl font-black text-white">{results.results.length}</p>
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <h2 className="text-xl font-bold text-white border-b border-white/10 pb-4">Detailed Breakdown</h2>
          {results.results.map((r, i) => (
            <div key={i} className="p-6 rounded-3xl bg-white/[0.02] border border-white/5 flex flex-col gap-4">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <span className="text-[9px] font-bold text-slate-600 uppercase bg-white/5 px-2 py-0.5 rounded">{r.type}</span>
                  <h4 className="text-sm font-bold text-white max-w-md">{r.text}</h4>
                </div>
                <div className={`px-3 py-1 rounded-full text-[10px] font-bold ${(r.evaluation?.score || 0) > 70 ? 'bg-emerald-500/20 text-emerald-400' : (r.evaluation?.score || 0) > 40 ? 'bg-yellow-500/20 text-yellow-400' : 'bg-red-500/20 text-red-400'}`}>
                   {r.evaluation?.score ?? 0}/100
                </div>
              </div>
              
              {r.evaluation?.feedback && (
                <div className="p-4 bg-white/[0.03] rounded-2xl border border-white/5">
                  <p className="text-xs text-slate-400 italic mb-2">AI Feedback:</p>
                  <p className="text-sm text-slate-200 leading-relaxed">{r.evaluation.feedback}</p>
                </div>
              )}

              {r.evaluation?.tips && (
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

              {r.type === 'MCQ' && r.evaluation?.correctAnswer && (
                <p className="text-xs text-slate-500">Correct Answer: <span className="text-white font-bold">{r.evaluation.correctAnswer}</span></p>
              )}
            </div>
          ))}
        </div>

        <div className="flex justify-center gap-4 mt-8 pb-12">
          <button onClick={() => navigate('/performance')} className="px-8 py-3 border border-white/20 rounded-full text-white text-sm hover:bg-white/5 transition-all">
            View Performance
          </button>
          <button onClick={() => navigate('/dashboard')} className="px-8 py-3 border border-white/20 rounded-full text-white text-sm hover:bg-white/5 transition-all">
            Return to Workspace
          </button>
          <button onClick={() => { setStep('select'); setAnswers({}); setCurrentIndex(0); setFlagged(new Set()); }} className="px-8 py-3 bg-white text-black font-bold rounded-full text-sm hover:scale-105 transition-all">
            Retake Exam
          </button>
        </div>
      </div>
    );
  }

  return null;
};

export default TestMode;
