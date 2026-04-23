import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronLeft, Brain } from 'lucide-react';
import gsap from 'gsap';
import NoteViewer from '../components/NoteViewer';
import ChatPanel from '../components/ChatPanel';
import QuizPanel from '../components/QuizPanel';
import CheatsheetPanel from '../components/CheatsheetPanel';
import GraphPanel from '../components/GraphPanel';
import SandboxPanel from '../components/SandboxPanel';
import SidebarPreview from '../components/SidebarPreview';

const StudySpace = () => {
  const { noteId } = useParams();
  const [selectedText, setSelectedText] = useState('');
  const [activeTab, setActiveTab] = useState('chat'); // 'chat' | 'quiz' | 'cheatsheet' | 'graph' | 'sandbox'
  const containerRef = useRef(null);

  useEffect(() => {
    // GSAP entry animation for the panels
    const panels = containerRef.current.querySelectorAll('.premium-surface');
    gsap.fromTo(panels, 
      { opacity: 0, y: 30, scale: 0.98 },
      { 
        opacity: 1, 
        y: 0, 
        scale: 1, 
        duration: 1.2, 
        stagger: 0.1, 
        ease: "power3.out",
        delay: 0.1 
      }
    );
  }, []);

  return (
    <div ref={containerRef} className="relative w-full h-screen bg-transparent overflow-hidden text-slate-100 flex flex-col">
      {/* Top Header */}
      <header className="h-16 flex items-center px-6 gap-6 relative z-10 shrink-0">
        <Link to="/dashboard" className="p-2 hover:bg-white/[0.05] rounded-xl transition text-slate-400 hover:text-white border border-transparent hover:border-slate-700/50">
          <ChevronLeft size={20} />
        </Link>
        <div className="flex-1 flex items-center justify-between">
           <h1 className="text-lg font-semibold tracking-tight text-white flex items-center gap-3">
              Study Space <span className="px-2 py-0.5 rounded-full bg-slate-800 text-[10px] text-slate-400 border border-slate-700">ID: {noteId || 'local_file'}</span>
           </h1>
           <Link 
              to={`/test/${noteId}`}
              className="flex items-center gap-2 px-4 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-xs font-bold text-white transition-all hover:scale-105"
            >
              <Brain size={14} /> Advanced Test Mode
           </Link>
        </div>
      </header>

      {/* Main Split Layout */}
      <main className="flex-1 flex gap-6 p-6 pt-0 overflow-hidden relative z-10 w-full max-w-[1800px] mx-auto">
        <div className="w-16 shrink-0 h-full hidden lg:block">
           <SidebarPreview collapsed={true} />
        </div>
        
        {/* Left Pane: Note Content */}
        <div className="flex-[3] h-full overflow-hidden">
          <NoteViewer 
            noteId={noteId} 
            onSelectText={setSelectedText} 
          />
        </div>

        {/* Right Pane: AI Tools Container */}
        <div className="flex-[2] h-full flex flex-col gap-4 overflow-hidden">
          {/* Tool Tabs */}
          <div className="flex bg-white/[0.02] border border-slate-700/50 rounded-2xl p-1 gap-1 shrink-0">
            <button 
              onClick={() => setActiveTab('chat')}
              className={`flex-1 py-2 text-sm font-medium rounded-xl transition-all ${activeTab === 'chat' ? 'bg-white/20 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.05]'}`}
            >
              Study Buddy
            </button>
            <button 
              onClick={() => setActiveTab('quiz')}
              className={`flex-1 py-2 text-sm font-medium rounded-xl transition-all ${activeTab === 'quiz' ? 'bg-white/20 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.05]'}`}
            >
              Quizzes
            </button>
            <button 
              onClick={() => setActiveTab('cheatsheet')}
              className={`flex-1 py-2 text-sm font-medium rounded-xl transition-all ${activeTab === 'cheatsheet' ? 'bg-white/10 text-slate-100 shadow-sm' : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.05]'}`}
            >
              Cheat Sheet
            </button>
            <button 
              onClick={() => setActiveTab('graph')}
              className={`flex-1 py-2 text-sm font-medium rounded-xl transition-all ${activeTab === 'graph' ? 'bg-white/10 text-slate-100 shadow-sm' : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.05]'}`}
            >
              Mind Map
            </button>
            <button 
              onClick={() => setActiveTab('sandbox')}
              className={`flex-1 py-2 text-sm font-medium rounded-xl transition-all ${activeTab === 'sandbox' ? 'bg-slate-700/40 text-slate-100 shadow-sm' : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.05]'}`}
            >
              Sandbox
            </button>
          </div>

          <div className="flex-1 overflow-hidden relative">
            {activeTab === 'chat' && <ChatPanel noteId={noteId} highlightedText={selectedText} />}
            {activeTab === 'quiz' && <QuizPanel noteId={noteId} />}
            {activeTab === 'cheatsheet' && <CheatsheetPanel noteId={noteId} />}
            {activeTab === 'graph' && <GraphPanel noteId={noteId} />}
            {activeTab === 'sandbox' && <SandboxPanel highlightedText={selectedText} />}
          </div>
        </div>
      </main>
    </div>
  );
};

export default StudySpace;
