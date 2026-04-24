import API_BASE from '../config.js';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ChevronLeft, Trophy, Clock, ArrowRight, Brain, Activity, 
  TrendingUp, Zap, Target, Download, MoreHorizontal, BookOpen, AlertCircle
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import SidebarPreview from '../components/SidebarPreview';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#0c0e12] border border-white/10 rounded-2xl p-4 shadow-2xl backdrop-blur-xl">
        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">{label}</p>
        <div className="flex flex-col gap-1">
           <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="text-sm font-bold text-white">Score: {payload[0].value}%</span>
           </div>
           <p className="text-[10px] text-slate-400">{payload[0]?.payload?.note_title || 'Test session'}</p>
        </div>
      </div>
    );
  }
  return null;
};

const EmptyState = ({ message }) => (
  <div className="flex flex-col items-center justify-center h-full gap-4 text-slate-600">
    <AlertCircle size={32} className="opacity-40" />
    <p className="text-sm font-semibold text-center">{message}</p>
  </div>
);

const Performance = () => {
  const navigate = useNavigate();
  const [sessions, setSessions] = useState([]);
  const [performanceData, setPerformanceData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({ avgScore: 0, totalSessions: 0, bestScore: 0 });

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const res = await fetch(API_BASE + '/api/test/sessions');
        const data = await res.json();
        if (data.success && data.sessions && data.sessions.length > 0) {
          const allSessions = data.sessions;
          setSessions(allSessions);

          // Compute real stats
          const scores = allSessions.filter(s => s.score != null).map(s => s.score);
          const avgScore = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
          const bestScore = scores.length > 0 ? Math.max(...scores) : 0;
          setStats({ avgScore, totalSessions: allSessions.length, bestScore });

          // Build graph from real sessions (oldest to newest, max 12)
          const graphData = [...allSessions]
            .filter(s => s.score != null && s.created_at)
            .reverse()
            .slice(0, 12)
            .map(s => ({
              date: new Date(s.created_at).toLocaleDateString('en-US', { month: 'short', day: '2-digit' }),
              score: s.score,
              note_title: s.note_title || s.notes?.title || 'Test'
            }));
          setPerformanceData(graphData);
        }
      } catch (err) {
        console.error('Failed to fetch sessions:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSessions();
  }, []);

  const hasData = !isLoading && sessions.length > 0;
  const hasGraph = performanceData.length > 0;

  // Today's sessions
  const todaySessions = sessions.filter(s => {
    if (!s.created_at) return false;
    const sessionDate = new Date(s.created_at).toDateString();
    return sessionDate === new Date().toDateString();
  });

  return (
    <div className="relative w-full h-screen bg-[#050505] overflow-hidden text-slate-100 flex font-sans">
      <SidebarPreview onSignIn={() => {}} />
      
      <main className="flex-1 flex flex-col h-full overflow-hidden p-8 gap-8">
        {/* Header */}
        <header className="flex items-center justify-between shrink-0">
          <div className="flex items-center gap-6">
            <button 
              onClick={() => navigate('/dashboard')}
              className="w-10 h-10 flex items-center justify-center bg-white/[0.03] hover:bg-white/[0.08] rounded-xl border border-white/10 transition-all text-slate-400 hover:text-white group"
            >
              <ChevronLeft size={20} className="group-hover:-translate-x-0.5 transition-transform" />
            </button>
            <div>
              <h1 className="text-3xl font-black tracking-tight text-white uppercase italic">Neural Performance</h1>
              <div className="flex items-center gap-2 mt-1">
                 <div className={`w-1.5 h-1.5 rounded-full ${hasData ? 'bg-emerald-500 animate-pulse' : 'bg-slate-600'}`} />
                 <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">
                   {hasData ? 'Live Data · Real Sessions' : 'No sessions yet'}
                 </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
             {hasData && (
               <div className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-[8px] font-black text-emerald-400 uppercase tracking-widest">
                 Live Feed Active
               </div>
             )}
             <button className="flex items-center gap-2 px-4 py-2 bg-white/[0.03] border border-white/10 rounded-xl text-[10px] font-bold text-slate-400 uppercase tracking-widest hover:bg-white/5 transition-colors">
                <Download size={14} />
                Export Data
             </button>
             <div className="h-8 w-px bg-white/10" />
             <div className="px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center gap-2">
                <Zap size={14} className="text-emerald-400" />
                <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">
                  Avg Score: {hasData ? `${stats.avgScore}%` : '—'}
                </span>
             </div>
          </div>
        </header>

        <div className="flex-1 grid grid-cols-12 gap-8 overflow-hidden">
           {/* Left Sidebar Info */}
           <div className="col-span-12 lg:col-span-4 flex flex-col gap-8 overflow-y-auto pr-2 no-scrollbar">
              {/* Stats Card */}
              <div className="p-8 rounded-[36px] bg-gradient-to-br from-[#111] to-[#080808] border border-white/5 flex flex-col gap-6 relative overflow-hidden group shadow-2xl">
                 <div className="absolute top-0 right-0 p-12 bg-emerald-500/5 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2" />
                 <div className="flex items-center justify-between z-10">
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Performance Summary</span>
                    <Trophy size={18} className="text-yellow-500" />
                 </div>
                 {hasData ? (
                   <>
                     <div className="flex items-end gap-3 z-10">
                        <span className="text-6xl font-black text-white italic tracking-tighter">{stats.bestScore}%</span>
                        <div className="flex flex-col mb-1.5">
                           <span className="text-emerald-400 text-xs font-black uppercase">Best Score</span>
                           <span className="text-[8px] text-slate-600 font-bold uppercase">all time</span>
                        </div>
                     </div>
                     <div className="grid grid-cols-2 gap-3 z-10 mt-2">
                        <div className="p-5 rounded-[24px] bg-white/[0.02] border border-white/5 flex flex-col gap-1">
                           <span className="text-[9px] font-bold text-slate-600 uppercase tracking-widest">Avg Score</span>
                           <span className="text-2xl font-black text-white italic">{stats.avgScore}%</span>
                        </div>
                        <div className="p-5 rounded-[24px] bg-white/[0.02] border border-white/5 flex flex-col gap-1">
                           <span className="text-[9px] font-bold text-slate-600 uppercase tracking-widest">Total Tests</span>
                           <span className="text-2xl font-black text-white italic">{stats.totalSessions}</span>
                        </div>
                     </div>
                   </>
                 ) : (
                   <div className="z-10 flex flex-col items-center justify-center py-8 gap-3">
                     <BookOpen size={28} className="text-slate-700" />
                     <p className="text-sm text-slate-500 text-center">Complete your first test to see stats here</p>
                   </div>
                 )}
              </div>

              {/* Today's Sessions */}
              <div className="p-8 rounded-[36px] bg-white/[0.02] border border-white/5 flex flex-col gap-6">
                 <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Today's Activity</span>
                    <Activity size={18} className="text-emerald-500" />
                 </div>
                 {todaySessions.length > 0 ? (
                   <div className="flex flex-col gap-3">
                     {todaySessions.map((s, i) => (
                       <div key={i} className="flex items-center justify-between p-3 rounded-2xl bg-white/[0.02] border border-white/5">
                         <div className="flex flex-col">
                           <span className="text-xs font-bold text-white truncate max-w-[140px]">{s.note_title || s.notes?.title || 'Test'}</span>
                           <span className="text-[9px] text-slate-600 uppercase font-bold">{s.difficulty || '—'}</span>
                         </div>
                         <span className="text-sm font-black text-emerald-400">{s.score ?? '—'}%</span>
                       </div>
                     ))}
                   </div>
                 ) : (
                   <div className="flex flex-col items-center justify-center py-6 gap-2 text-slate-600">
                     <Clock size={22} className="opacity-40" />
                     <p className="text-xs text-center">No tests taken today yet</p>
                   </div>
                 )}
              </div>

              {/* Real Score Breakdown */}
              {hasData && (
                <div className="p-8 rounded-[36px] bg-white/[0.02] border border-white/5 flex flex-col gap-6">
                   <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Score Distribution</span>
                      <Target size={18} className="text-blue-500" />
                   </div>
                   <div className="flex flex-col gap-5">
                      {[
                        { label: 'Excellent (80–100%)', count: sessions.filter(s => s.score >= 80).length, color: 'bg-emerald-500' },
                        { label: 'Good (60–79%)', count: sessions.filter(s => s.score >= 60 && s.score < 80).length, color: 'bg-blue-500' },
                        { label: 'Needs Work (<60%)', count: sessions.filter(s => s.score != null && s.score < 60).length, color: 'bg-orange-500' }
                      ].map((m, i) => (
                        <div key={i} className="flex flex-col gap-2">
                           <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                              <span className="text-slate-400 italic">{m.label}</span>
                              <span className="text-slate-500">{m.count}</span>
                           </div>
                           <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                              <div 
                                className={`h-full ${m.color} rounded-full`} 
                                style={{ width: sessions.length > 0 ? `${(m.count / sessions.length) * 100}%` : '0%' }} 
                              />
                           </div>
                        </div>
                      ))}
                   </div>
                </div>
              )}
           </div>

           {/* Main Content Area */}
           <div className="col-span-12 lg:col-span-8 flex flex-col gap-8 overflow-hidden">
              {/* Line Chart Section */}
              <div className="flex-1 p-8 rounded-[36px] bg-[#0c0e12] border border-white/5 flex flex-col gap-8 relative group overflow-hidden shadow-2xl">
                 <div className="flex items-center justify-between z-10">
                    <div className="flex flex-col">
                       <h3 className="text-xl font-black text-white uppercase italic tracking-tight">Performance Velocity</h3>
                       <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest mt-1">
                         {hasGraph ? `Last ${performanceData.length} test sessions` : 'Complete tests to see your trend'}
                       </p>
                    </div>
                    {hasGraph && (
                      <div className="flex items-center gap-2">
                         <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-black text-emerald-400 uppercase tracking-widest">
                            <TrendingUp size={12} />
                            Real Data
                         </div>
                      </div>
                    )}
                 </div>

                 <div className="flex-1 w-full min-h-[300px]">
                   {isLoading ? (
                     <div className="flex items-center justify-center h-full">
                       <div className="animate-spin w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full" />
                     </div>
                   ) : hasGraph ? (
                     <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={performanceData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                           <defs>
                              <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                                 <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                                 <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                              </linearGradient>
                           </defs>
                           <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                           <XAxis 
                              dataKey="date" 
                              stroke="#ffffff10"
                              fontSize={9}
                              fontWeight={700}
                              axisLine={false}
                              tickLine={false}
                              dy={10}
                           />
                           <YAxis 
                              domain={[0, 100]} 
                              stroke="#ffffff10" 
                              fontSize={9}
                              fontWeight={700}
                              tickFormatter={(v) => `${v}%`}
                              axisLine={false}
                              tickLine={false}
                              dx={-10}
                           />
                           <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(255,255,255,0.05)', strokeWidth: 1 }} />
                           <Area 
                              type="monotone" 
                              dataKey="score" 
                              stroke="#10b981" 
                              strokeWidth={4}
                              fillOpacity={1} 
                              fill="url(#colorScore)" 
                              animationDuration={2500}
                              strokeLinecap="round"
                           />
                        </AreaChart>
                     </ResponsiveContainer>
                   ) : (
                     <EmptyState message="Take a test on any note to see your performance graph here" />
                   )}
                 </div>
              </div>

              {/* Activity Log List */}
              <div className="h-[240px] flex flex-col gap-5">
                 <div className="flex items-center justify-between px-3">
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Recent Test Sessions</span>
                    <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">{sessions.length} Total</span>
                 </div>
                 <div className="flex-1 overflow-y-auto flex flex-col gap-3 pr-2 no-scrollbar">
                    {isLoading ? (
                      <div className="flex items-center justify-center h-full">
                        <div className="animate-spin w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full" />
                      </div>
                    ) : sessions.length > 0 ? (
                      sessions.slice(0, 8).map((s, idx) => (
                        <div key={s.id || idx} className="p-5 rounded-[28px] bg-white/[0.02] border border-white/5 flex items-center justify-between hover:bg-white/[0.04] transition-all group cursor-pointer">
                           <div className="flex items-center gap-5">
                              <div className="w-12 h-12 rounded-2xl bg-[#111] border border-white/5 flex items-center justify-center text-sm font-black italic text-white shadow-xl group-hover:scale-110 transition-transform">
                                 {s.score != null ? `${s.score}%` : '—'}
                              </div>
                              <div className="flex flex-col">
                                 <span className="text-sm font-bold text-white tracking-tight">{s.note_title || s.notes?.title || 'Untitled Test'}</span>
                                 <div className="flex items-center gap-3 mt-1">
                                    <span className="text-[9px] text-slate-600 font-black uppercase tracking-widest">{s.difficulty || 'Unknown'}</span>
                                    <div className="w-1 h-1 rounded-full bg-slate-800" />
                                    <span className="text-[9px] text-slate-600 font-bold uppercase tracking-widest">
                                      {s.created_at ? new Date(s.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—'}
                                    </span>
                                 </div>
                              </div>
                           </div>
                           <div className="flex items-center gap-4">
                              <div className={`px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${s.status === 'completed' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-white/5 text-slate-500'}`}>
                                {s.status || 'unknown'}
                              </div>
                              <MoreHorizontal size={18} className="text-slate-700 group-hover:text-white transition-colors" />
                           </div>
                        </div>
                      ))
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full gap-3 text-slate-600">
                        <BookOpen size={28} className="opacity-40" />
                        <p className="text-sm font-semibold text-center">No test sessions yet.<br/>Go to a note and start a test!</p>
                      </div>
                    )}
                 </div>
              </div>
           </div>
        </div>
      </main>

      {/* Grain Overlay */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.02] pointer-events-none" />
    </div>
  );
};

export default Performance;
