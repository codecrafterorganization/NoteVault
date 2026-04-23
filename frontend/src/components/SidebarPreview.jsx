import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, BookOpen, Search, Settings, User, Brain, Activity } from 'lucide-react';
import gsap from 'gsap';

const SidebarPreview = () => {
  const brandRef = useRef(null);
  const navigate = useNavigate();

  const handleNavClick = (label) => {
    if (label === 'Dashboard') navigate('/dashboard');
    else if (label === 'Performance') navigate('/performance');
    else if (label === 'Test Mode') navigate('/test/general');
    else if (label === 'My Notebooks') navigate('/notebooks');
    else if (label === 'Search Library') navigate('/search');
    else if (label === 'Settings') navigate('/settings');
    else {
      alert(`The ${label} feature is coming soon! 🚀`);
    }
  };

  useEffect(() => {
    if (brandRef.current) {
      gsap.fromTo(
        brandRef.current.children,
        { y: 15, opacity: 0, filter: 'blur(4px)' },
        {
          y: 0,
          opacity: 1,
          filter: 'blur(0px)',
          duration: 1.2,
          stagger: 0.1,
          ease: 'power3.out',
          delay: 0.5,
        }
      );
    }
  }, []);

  return (
    <aside className="w-64 h-full hidden lg:flex flex-col p-6 gap-8 border-r border-slate-800 bg-[#0A0D14] z-20">
      {/* Brand */}
      <div className="flex items-center gap-3 px-2">
        <div className="flex-shrink-0">
          <svg width="32" height="32" viewBox="0 0 100 100" fill="none" className="animate-pulse-slow">
            <path d="M20 30 Q 35 25, 50 40 L 50 85 Q 35 70, 20 75 Z" stroke="#F8FAFC" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="rgba(255,255,255,0.05)" />
            <path d="M80 30 Q 65 25, 50 40 L 50 85 Q 65 70, 80 75 Z" stroke="#F8FAFC" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="rgba(255,255,255,0.05)" />
            <line x1="50" y1="40" x2="50" y2="85" stroke="#F8FAFC" strokeWidth="3" strokeLinecap="round" />
            <path d="M50 20 L55 30 L50 40 L45 30 Z" fill="rgba(255, 255, 255, 0.8)" stroke="#FFFFFF" strokeWidth="2" strokeLinejoin="round" />
          </svg>
        </div>
        <div className="flex flex-col">
          <span ref={brandRef} className="text-xl font-bold tracking-tight leading-none text-white flex overflow-hidden py-1">
            {"NoteVault".split('').map((char, index) => (
              <span key={index} className="inline-block">{char}</span>
            ))}
          </span>
        </div>
      </div>

      {/* Navigation Groups */}
      <div className="flex-1 flex flex-col gap-10">
        <div className="flex flex-col gap-2">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] px-2 mb-2">Workspace</span>
          <div onClick={() => handleNavClick('Dashboard')} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-400 hover:bg-slate-800/40 hover:text-white transition-all cursor-pointer group">
            <Home size={16} className="group-hover:text-slate-300" />
            <span className="text-xs font-medium">Dashboard</span>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] px-2 mb-2">Library</span>
          <div onClick={() => handleNavClick('My Notebooks')} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-400 hover:bg-slate-800/40 hover:text-white transition-all cursor-pointer group">
            <BookOpen size={16} className="group-hover:text-slate-300" />
            <span className="text-xs font-medium">My Notebooks</span>
          </div>
          <div onClick={() => handleNavClick('Search Library')} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-400 hover:bg-slate-800/40 hover:text-white transition-all cursor-pointer group">
            <Search size={16} className="group-hover:text-slate-300" />
            <span className="text-xs font-medium">Search Library</span>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] px-2 mb-2">Assessment</span>
          <div onClick={() => handleNavClick('Test Mode')} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-400 hover:bg-slate-800/40 hover:text-white transition-all cursor-pointer group">
            <Brain size={16} className="group-hover:text-slate-300" />
            <span className="text-xs font-medium">Test Mode</span>
          </div>
          <div onClick={() => handleNavClick('Performance')} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-400 hover:bg-slate-800/40 hover:text-white transition-all cursor-pointer group">
            <Activity size={16} className="group-hover:text-slate-300" />
            <span className="text-xs font-medium">Performance</span>
          </div>
          <div onClick={() => handleNavClick('Settings')} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-400 hover:bg-slate-800/40 hover:text-white transition-all cursor-pointer group">
            <Settings size={16} className="group-hover:text-slate-300" />
            <span className="text-xs font-medium">Settings</span>
          </div>
        </div>
      </div>

      {/* Footer / User Profile */}
      <div className="mt-auto flex flex-col gap-4">
        <div className="flex items-center gap-3 px-2">
          <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center border border-slate-700">
            <User size={14} className="text-slate-400" />
          </div>
          <div className="flex flex-col">
            <span className="text-[11px] font-semibold text-slate-200">Guest Account</span>
            <span className="text-[9px] text-slate-500">Not synced</span>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default SidebarPreview;
