import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Trophy, Clock, Calendar, ArrowRight, Brain, Activity } from 'lucide-react';
import SidebarPreview from '../components/SidebarPreview';

const Performance = () => {
  const navigate = useNavigate();
  const [sessions, setSessions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Fetch test sessions from backend
    fetch('http://localhost:5000/api/test/sessions')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setSessions(data.sessions);
        }
      })
      .catch(err => console.error("Error fetching performance data:", err))
      .finally(() => setIsLoading(false));
  }, []);

  const stats = {
    avgScore: sessions.length > 0 ? Math.round(sessions.reduce((acc, s) => acc + (s.score || 0), 0) / sessions.length) : 0,
    testsCompleted: sessions.length,
    highestScore: sessions.length > 0 ? Math.max(...sessions.map(s => s.score || 0)) : 0
  };

  return (
    <div className="relative w-full h-screen bg-[#0A0D14] overflow-hidden text-slate-100 flex">
      <SidebarPreview onSignIn={() => {}} />
      
      <main className="flex-1 flex flex-col h-full overflow-hidden p-8 gap-8">
        <header className="flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate('/dashboard')}
              className="p-2 hover:bg-white/5 rounded-xl border border-transparent hover:border-slate-800 transition-all text-slate-400 hover:text-white"
            >
              <ChevronLeft size={20} />
            </button>
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-white">Performance Analytics</h1>
              <p className="text-sm text-slate-500">Tracking your academic evolution</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
             <div className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl flex items-center gap-2">
                <Brain size={16} className="text-slate-400" />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-300">Level: Intermediate</span>
             </div>
          </div>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-6 shrink-0">
           <div className="cinematic-glass p-6 rounded-3xl premium-surface flex flex-col gap-2">
              <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/10">
                 <Trophy size={20} className="text-white" />
              </div>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Average Score</span>
              <span className="text-3xl font-bold text-white">{stats.avgScore}%</span>
           </div>
           <div className="cinematic-glass p-6 rounded-3xl premium-surface flex flex-col gap-2">
              <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/10">
                 <Activity size={20} className="text-white" />
              </div>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Tests Completed</span>
              <span className="text-3xl font-bold text-white">{stats.testsCompleted}</span>
           </div>
           <div className="cinematic-glass p-6 rounded-3xl premium-surface flex flex-col gap-2">
              <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/10">
                 <Brain size={20} className="text-white" />
              </div>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Highest Score</span>
              <span className="text-3xl font-bold text-white">{stats.highestScore}%</span>
           </div>
        </div>

        {/* Sessions History */}
        <div className="flex-1 overflow-hidden flex flex-col gap-4">
           <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest px-2">History</h2>
           <div className="flex-1 overflow-y-auto pr-2 flex flex-col gap-3 no-scrollbar">
              {isLoading ? (
                 <div className="flex-1 flex items-center justify-center text-slate-600 text-sm">
                    Analyzing your test history...
                 </div>
              ) : sessions.length === 0 ? (
                 <div className="flex-1 flex flex-col items-center justify-center text-slate-600 gap-4 border border-dashed border-slate-800 rounded-3xl">
                    <p className="text-sm">No test sessions recorded yet.</p>
                    <button 
                      onClick={() => navigate('/dashboard')}
                      className="px-6 py-2 bg-white text-black font-bold text-xs rounded-full hover:scale-105 transition-transform"
                    >
                      Start your first test
                    </button>
                 </div>
              ) : (
                sessions.map((s) => (
                  <div key={s.id} className="cinematic-glass p-5 rounded-2xl premium-surface flex items-center justify-between group hover:bg-white/[0.04] transition-all border-white/5 hover:border-white/10">
                     <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-lg font-bold ${s.score >= 80 ? 'bg-white text-black' : 'bg-slate-800 text-white'}`}>
                           {s.score}%
                        </div>
                        <div className="flex flex-col">
                           <span className="text-sm font-semibold text-white group-hover:translate-x-1 transition-transform">{s.note_title || 'General Test'}</span>
                           <div className="flex items-center gap-3 text-[10px] text-slate-500 mt-1">
                              <span className="flex items-center gap-1"><Calendar size={12}/> {new Date(s.created_at).toLocaleDateString()}</span>
                              <span className="flex items-center gap-1 uppercase tracking-tighter font-bold text-slate-400">{s.difficulty}</span>
                           </div>
                        </div>
                     </div>
                     <button 
                       onClick={() => navigate(`/study/${s.note_id}`)}
                       className="p-3 bg-white/0 hover:bg-white/5 rounded-full text-slate-500 hover:text-white transition-all opacity-0 group-hover:opacity-100 translate-x-4 group-hover:translate-x-0"
                     >
                        <ArrowRight size={18} />
                     </button>
                  </div>
                ))
              )}
           </div>
        </div>
      </main>
    </div>
  );
};

export default Performance;

