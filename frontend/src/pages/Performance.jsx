import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ChevronLeft, Trophy, Clock, Calendar, ArrowRight, Brain, Activity, 
  TrendingUp, Info, Zap, Flame, Target, Filter, Download, MoreHorizontal
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell
} from 'recharts';
import SidebarPreview from '../components/SidebarPreview';

// --- Realistic Mock Data for UI/UX demonstration ---
const MOCK_PERFORMANCE_DATA = [
  { date: 'Apr 01', score: 65, time: 45 },
  { date: 'Apr 03', score: 72, time: 30 },
  { date: 'Apr 05', score: 68, time: 60 },
  { date: 'Apr 08', score: 85, time: 40 },
  { date: 'Apr 10', score: 82, time: 55 },
  { date: 'Apr 12', score: 91, time: 25 },
  { date: 'Apr 15', score: 88, time: 50 },
  { date: 'Apr 18', score: 94, time: 45 },
  { date: 'Apr 20', score: 92, time: 35 },
  { date: 'Apr 23', score: 98, time: 20 },
];

const MOCK_SESSIONS = [
  { id: 1, title: 'Cell Biology Fundamentals', score: 98, difficulty: 'Intermediate', date: '2 hours ago' },
  { id: 2, title: 'Organic Chemistry: Esters', score: 92, difficulty: 'Advanced', date: '5 hours ago' },
  { id: 3, title: 'Quantum Mechanics Intro', score: 85, difficulty: 'Beginner', date: 'Yesterday' },
  { id: 4, title: 'World War II Timeline', score: 91, difficulty: 'Intermediate', date: '2 days ago' },
];

const ActivityHeatmap = () => {
  // 52 weeks (full year) for a professional look
  const weeks = 40; 
  const days = 7;
  
  const data = useMemo(() => {
    return Array.from({ length: weeks * days }).map((_, i) => ({
      intensity: Math.floor(Math.random() * 5), 
      day: i
    }));
  }, []);

  const getColor = (intensity) => {
    switch (intensity) {
      case 0: return 'bg-[#161b22]'; 
      case 1: return 'bg-[#0e4429]'; 
      case 2: return 'bg-[#006d32]'; 
      case 3: return 'bg-[#26a641]'; 
      case 4: return 'bg-[#39d353]'; 
      default: return 'bg-[#161b22]';
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
           <Flame size={14} className="text-orange-500" />
           <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Learning Velocity Heatmap</span>
        </div>
        <div className="flex items-center gap-1">
           <span className="text-[9px] text-slate-600 font-bold">LACK</span>
           {[0, 1, 2, 3, 4].map(i => (
             <div key={i} className={`w-2.5 h-2.5 rounded-[1px] ${getColor(i)}`} />
           ))}
           <span className="text-[9px] text-slate-600 font-bold">FLOW</span>
        </div>
      </div>
      <div className="flex gap-[3px] overflow-x-auto no-scrollbar pb-2">
        {Array.from({ length: weeks }).map((_, w) => (
          <div key={w} className="flex flex-col gap-[3px] shrink-0">
            {Array.from({ length: days }).map((_, d) => (
              <div 
                key={d} 
                className={`w-[10px] h-[10px] rounded-[1px] ${getColor(data[w * days + d].intensity)} transition-all hover:scale-125 cursor-pointer hover:shadow-[0_0_10px_rgba(57,211,83,0.3)]`}
              />
            ))}
          </div>
        ))}
      </div>
      <div className="flex justify-between text-[9px] font-bold text-slate-600 uppercase tracking-widest px-1">
        <span>Jan</span>
        <span>Mar</span>
        <span>May</span>
        <span>Jul</span>
        <span>Sep</span>
        <span>Nov</span>
      </div>
    </div>
  );
};

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
           <p className="text-[10px] text-slate-400">Memory retention peak detected</p>
        </div>
      </div>
    );
  }
  return null;
};

const Performance = () => {
  const navigate = useNavigate();
  const [sessions, setSessions] = useState([]);
  const [performanceData, setPerformanceData] = useState(MOCK_PERFORMANCE_DATA);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/test/sessions');
        const data = await res.json();
        if (data.success && data.sessions && data.sessions.length > 0) {
          setSessions(data.sessions);
          
          // Generate performance graph data from real sessions
          const graphData = data.sessions
            .slice(0, 10)
            .reverse()
            .map(s => ({
              date: new Date(s.created_at).toLocaleDateString('en-US', { month: 'short', day: '2-digit' }),
              score: s.score || 0,
              time: 30 // Approximate
            }));
          setPerformanceData(graphData);
        } else {
          // Fallback to mocks if no real data
          setSessions(MOCK_SESSIONS);
        }
      } catch (err) {
        console.error('Failed to fetch sessions:', err);
        setSessions(MOCK_SESSIONS);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSessions();
  }, []);

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
                 <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                 <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">Intelligence Quotient Status: Optimizing</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
             {sessions.length > 0 && sessions[0].id && !String(sessions[0].id).includes('mock') && (
               <div className="px-3 py-1 bg-white/5 border border-white/10 rounded-lg text-[8px] font-black text-slate-500 uppercase tracking-widest">
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
                <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Efficiency: {sessions.length > 0 ? (sessions.reduce((a, b) => a + (b.score || 0), 0) / sessions.length).toFixed(1) : '98.4'}%</span>
             </div>
          </div>
        </header>

        <div className="flex-1 grid grid-cols-12 gap-8 overflow-hidden">
           {/* Left Sidebar Info */}
           <div className="col-span-12 lg:col-span-4 flex flex-col gap-8 overflow-y-auto pr-2 no-scrollbar">
              {/* Rank Card */}
              <div className="p-8 rounded-[36px] bg-gradient-to-br from-[#111] to-[#080808] border border-white/5 flex flex-col gap-6 relative overflow-hidden group shadow-2xl">
                 <div className="absolute top-0 right-0 p-12 bg-emerald-500/5 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2" />
                 <div className="flex items-center justify-between z-10">
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Cognitive Standing</span>
                    <Trophy size={18} className="text-yellow-500" />
                 </div>
                 <div className="flex items-end gap-3 z-10">
                    <span className="text-6xl font-black text-white italic tracking-tighter">TOP 2%</span>
                    <div className="flex flex-col mb-1.5">
                       <span className="text-emerald-400 text-xs font-black uppercase">+4.8%</span>
                       <span className="text-[8px] text-slate-600 font-bold uppercase">vs last month</span>
                    </div>
                 </div>
                 <div className="grid grid-cols-2 gap-3 z-10 mt-2">
                    <div className="p-5 rounded-[24px] bg-white/[0.02] border border-white/5 flex flex-col gap-1">
                       <span className="text-[9px] font-bold text-slate-600 uppercase tracking-widest">Avg Precision</span>
                       <span className="text-2xl font-black text-white italic">94.2%</span>
                    </div>
                    <div className="p-5 rounded-[24px] bg-white/[0.02] border border-white/5 flex flex-col gap-1">
                       <span className="text-[9px] font-bold text-slate-600 uppercase tracking-widest">Current Streak</span>
                       <span className="text-2xl font-black text-white italic">18 <span className="text-[10px] text-slate-500">days</span></span>
                    </div>
                 </div>
              </div>

              {/* Heatmap Card */}
              <div className="p-8 rounded-[36px] bg-white/[0.02] border border-white/5 shadow-inner">
                 <ActivityHeatmap />
              </div>

              {/* Mastery Card */}
              <div className="p-8 rounded-[36px] bg-white/[0.02] border border-white/5 flex flex-col gap-6">
                 <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Skill Convergence</span>
                    <Target size={18} className="text-blue-500" />
                 </div>
                 <div className="flex flex-col gap-5">
                    {[
                      { label: 'Analytical Synthesis', progress: 92, color: 'bg-emerald-500' },
                      { label: 'Recall Velocity', progress: 78, color: 'bg-blue-500' },
                      { label: 'Concept Mapping', progress: 64, color: 'bg-purple-500' }
                    ].map((m, i) => (
                      <div key={i} className="flex flex-col gap-2">
                         <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                            <span className="text-slate-400 italic">{m.label}</span>
                            <span className="text-slate-500">{m.progress}%</span>
                         </div>
                         <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                            <div className={`h-full ${m.color} rounded-full relative shadow-[0_0_10px_rgba(16,185,129,0.2)]`} style={{ width: `${m.progress}%` }} />
                         </div>
                      </div>
                    ))}
                 </div>
              </div>
           </div>

           {/* Main Content Area */}
           <div className="col-span-12 lg:col-span-8 flex flex-col gap-8 overflow-hidden">
              {/* Line Chart Section */}
              <div className="flex-1 p-8 rounded-[36px] bg-[#0c0e12] border border-white/5 flex flex-col gap-8 relative group overflow-hidden shadow-2xl">
                 <div className="flex items-center justify-between z-10">
                    <div className="flex flex-col">
                       <h3 className="text-xl font-black text-white uppercase italic tracking-tight">Performance Velocity</h3>
                       <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest mt-1">Long-term cognitive development tracking</p>
                    </div>
                    <div className="flex items-center gap-2">
                       <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-black text-emerald-400 uppercase tracking-widest">
                          <TrendingUp size={12} />
                          Bullish Growth
                       </div>
                    </div>
                 </div>

                 <div className="flex-1 w-full min-h-[300px]">
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
                 </div>
              </div>

              {/* Activity Log List */}
              <div className="h-[240px] flex flex-col gap-5">
                 <div className="flex items-center justify-between px-3">
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Recent Intelligence Syncs</span>
                    <button className="text-[10px] font-black text-emerald-500 uppercase tracking-widest hover:text-emerald-400 transition-colors">History Protocol</button>
                 </div>
                 <div className="flex-1 overflow-y-auto flex flex-col gap-3 pr-2 no-scrollbar">
                    {MOCK_SESSIONS.map((s) => (
                      <div key={s.id} className="p-5 rounded-[28px] bg-white/[0.02] border border-white/5 flex items-center justify-between hover:bg-white/[0.04] transition-all group cursor-pointer">
                         <div className="flex items-center gap-5">
                            <div className="w-12 h-12 rounded-2xl bg-[#111] border border-white/5 flex items-center justify-center text-sm font-black italic text-white shadow-xl group-hover:scale-110 transition-transform">
                               {s.score}%
                            </div>
                            <div className="flex flex-col">
                               <span className="text-sm font-bold text-white tracking-tight">{s.title}</span>
                               <div className="flex items-center gap-3 mt-1">
                                  <span className="text-[9px] text-slate-600 font-black uppercase tracking-widest">{s.difficulty}</span>
                                  <div className="w-1 h-1 rounded-full bg-slate-800" />
                                  <span className="text-[9px] text-slate-600 font-bold uppercase tracking-widest">{s.date}</span>
                               </div>
                            </div>
                         </div>
                         <div className="flex items-center gap-4">
                            <div className="px-3 py-1.5 rounded-xl bg-white/[0.03] text-[9px] font-black text-slate-500 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0">
                               Analyze Breakdown
                            </div>
                            <MoreHorizontal size={18} className="text-slate-700 group-hover:text-white transition-colors" />
                         </div>
                      </div>
                    ))}
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
