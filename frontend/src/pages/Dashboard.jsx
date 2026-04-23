import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Book, PenTool, BookOpen, Clock, ChevronRight, Plus, Upload, Brain, LogOut, User } from 'lucide-react';
import gsap from 'gsap';
import SidebarPreview from '../components/SidebarPreview';
import AuthPanel from '../components/AuthPanel';
import KnowledgeGraph from '../components/KnowledgeGraph';
import ToDoList from '../components/ToDoList';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const containerRef = useRef(null);
  const contentRef = useRef(null);

  const [notes, setNotes] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);
  
  const [isMergeMode, setIsMergeMode] = useState(false);
  const [selectedNotes, setSelectedNotes] = useState([]);
  const [isMerging, setIsMerging] = useState(false);

  const dummyNotes = [
    { id: 'dummy-biology', title: 'Biology: Cellular Respiration', type: 'Study Guide', color: 'bg-slate-800 text-slate-300', createdAt: new Date().toISOString() },
    { id: 'dummy-thermo', title: 'Advanced Thermodynamics', type: 'Lecture Notes', color: 'bg-slate-800 text-slate-300', createdAt: new Date().toISOString() },
    { id: 'dummy-chem', title: 'Organic Chemistry II', type: 'Summary', color: 'bg-slate-800 text-slate-300', createdAt: new Date().toISOString() },
    { id: 'dummy-quantum', title: 'Quantum Mechanics Basics', type: 'Formula Sheet', color: 'bg-slate-800 text-slate-300', createdAt: new Date().toISOString() },
  ];

  const fetchNotes = () => {
    fetch('http://localhost:5000/api/notes')
      .then(res => res.json())
      .then(data => {
        if (data.notes && data.notes.length > 0) {
          const mapped = data.notes.map((n, i) => ({
             id: n.id,
             title: n.title || `Note ${i+1}`,
             type: n.fileType || 'Document',
             color: 'bg-slate-800 text-slate-300',
             createdAt: n.createdAt
          }));
          setNotes(mapped.slice(0, 4));
        } else {
          setNotes(dummyNotes);
        }
      })
      .catch(err => {
        console.error("Could not fetch notes:", err);
        setNotes(dummyNotes);
      });
  };

  useEffect(() => {
    fetchNotes();
  }, []);

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', file.name);

    try {
      const res = await fetch('http://localhost:5000/api/notes/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Upload failed');
      
      fetchNotes();
    } catch (error) {
      console.error('Upload Error:', error);
      alert('Failed to upload file');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const toggleNoteSelection = (e, noteId) => {
    e.stopPropagation();
    if (selectedNotes.includes(noteId)) {
      setSelectedNotes(prev => prev.filter(id => id !== noteId));
    } else {
      setSelectedNotes(prev => [...prev, noteId]);
    }
  };

  const handleFuseNotes = async () => {
    if (selectedNotes.length < 2) return alert('Select at least 2 notes to fuse.');
    setIsMerging(true);
    try {
      const res = await fetch('http://localhost:5000/api/notes/merge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ noteIds: selectedNotes })
      });
      const data = await res.json();
      if (data.success && data.noteId) {
        setIsMergeMode(false);
        setSelectedNotes([]);
        navigate(`/study/${data.noteId}`);
      } else {
        alert('Failed to merge notes: ' + (data.error || 'Unknown error'));
      }
    } catch (err) {
      console.error(err);
      alert('Error fusing notes');
    } finally {
      setIsMerging(false);
    }
  };

  useEffect(() => {
    if (isAuthOpen) {
      gsap.to(contentRef.current, {
        scale: 0.98,
        filter: 'blur(5px)',
        opacity: 0.6,
        duration: 0.6,
        ease: "power3.out"
      });
    } else {
      gsap.to(contentRef.current, {
        scale: 1,
        filter: 'blur(0px)',
        opacity: 1,
        duration: 0.6,
        ease: "power3.out"
      });
    }
  }, [isAuthOpen]);

  useEffect(() => {
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
        delay: 0.2 
      }
    );
  }, []);

  return (
    <div ref={containerRef} className="relative w-full min-h-screen bg-transparent overflow-hidden text-slate-100">
      <div ref={contentRef} className="flex w-full h-screen">
        <SidebarPreview onSignIn={() => setIsAuthOpen(true)} onUpload={fetchNotes} />

        <main className="flex-1 flex flex-col h-full bg-transparent relative z-10 p-6 gap-6">
          
          <header className="flex items-center justify-between gap-6 h-14">
            <div className="flex-1 flex flex-col items-start px-4">
               <h1 className="text-xl font-semibold text-white tracking-tight">My Workspace</h1>
               <p className="text-xs text-slate-400 mt-1">Focus Mode Active</p>
            </div>
            
            <div className="flex items-center gap-3">
              <input
                type="file"
                ref={fileInputRef}
                style={{ display: 'none' }}
                onChange={handleUpload}
                accept=".txt,.pdf,.docx"
              />
              <button 
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-slate-200 text-black rounded-xl text-sm font-medium transition-all shadow-lg shadow-white/5 border border-white/20 font-sans"
              >
                {isUploading ? (
                  <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                ) : (
                  <Upload size={16} />
                )}
                {isUploading ? 'Uploading...' : 'Upload Note'}
              </button>

              {isMergeMode ? (
                <>
                  <button 
                    onClick={() => { setIsMergeMode(false); setSelectedNotes([]); }}
                    className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 rounded-xl text-sm font-medium transition-all"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleFuseNotes}
                    disabled={isMerging || selectedNotes.length < 2}
                    className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-white text-slate-900 rounded-xl text-sm font-medium transition-all shadow-[0_0_15px_rgba(255,255,255,0.1)] disabled:opacity-50"
                  >
                    {isMerging ? 'Fusing...' : `Fuse Notes (${selectedNotes.length})`}
                  </button>
                </>
              ) : (
                <button 
                  onClick={() => setIsMergeMode(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-white text-black rounded-xl text-sm font-medium transition-all shadow-[0_0_15px_rgba(255,255,255,0.1)]"
                >
                  <Brain size={16} /> Group Brain
                </button>
              )}

              {/* Auth button - shows user avatar if logged in */}
              {user ? (
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/[0.04] border border-white/[0.08]">
                    {user.photoURL ? (
                      <img src={user.photoURL} alt="avatar" className="w-6 h-6 rounded-full" />
                    ) : (
                      <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center">
                        <User size={12} className="text-slate-300" />
                      </div>
                    )}
                    <span className="text-xs text-slate-300 font-medium max-w-[100px] truncate">
                      {user.displayName || user.email?.split('@')[0]}
                    </span>
                  </div>
                  <button
                    onClick={signOut}
                    className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-all"
                    title="Sign Out"
                  >
                    <LogOut size={14} />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setIsAuthOpen(true)}
                  className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium text-[#111111] bg-[#F4F4F5] hover:bg-white transition-colors duration-150"
                  style={{ boxShadow: 'rgba(0,0,0,0.9) 0px 4px 8px 0px inset, rgba(255,255,255,0.08) 0px 1px 1px 0px' }}
                >
                  Sign In
                </button>
              )}
            </div>
          </header>

          <div className="flex-1 grid grid-cols-12 gap-6 overflow-hidden">
            
            {/* Main Content Area */}
            <div className="col-span-12 lg:col-span-8 flex flex-col gap-6 overflow-hidden">
              <div className="cinematic-glass flex-1 p-8 rounded-3xl flex flex-col gap-8 relative overflow-hidden group premium-surface">
                
                <div className="flex items-center justify-between z-10">
                  <div className="flex flex-col gap-1">
                    <h2 className="text-2xl font-semibold text-white">Recent Library</h2>
                    <p className="text-sm text-slate-400">Pick up where you left off. Click a note to study.</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 z-10 overflow-y-auto no-scrollbar pb-4 text-left">
                  {notes.length === 0 ? (
                    <div className="col-span-2 text-slate-500 text-sm flex items-center justify-center p-6 border border-dashed border-slate-700/50 rounded-xl">
                       <Clock size={16} className="mr-2" />
                       Loading your notes from the vault...
                    </div>
                  ) : (
                    notes.map((note) => {
                      const isSelected = selectedNotes.includes(note.id);
                      return (
                        <div 
                           key={note.id} 
                           onClick={(e) => isMergeMode ? toggleNoteSelection(e, note.id) : navigate(`/study/${note.id}`)}
                         className={`p-5 rounded-2xl border transition-all cursor-pointer group relative ${isSelected ? 'bg-white/[0.08] border-white shadow-[0_0_15px_rgba(255,255,255,0.1)]' : 'bg-white/[0.02] border-slate-700/50 hover:bg-white/[0.05] hover:border-slate-500/80'}`}
                        >
                          {isMergeMode && (
                            <div className={`absolute top-3 right-3 w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${isSelected ? 'bg-white border-white' : 'border-slate-500'}`}>
                              {isSelected && <svg className="w-3 h-3 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                            </div>
                          )}
                          <div className="flex items-center justify-between mb-4">
                             <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${note.color}`}>
                                <BookOpen size={16} />
                             </div>
                             <span className="text-[10px] font-semibold tracking-wider text-slate-500 uppercase">{note.type}</span>
                          </div>
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="text-sm font-semibold text-slate-200 group-hover:text-white transition-colors">{note.title}</h3>
                          {!isMergeMode && (
                            <button 
                              onClick={(e) => { e.stopPropagation(); navigate(`/test/${note.id}`); }}
                              className="p-1.5 hover:bg-white/10 rounded-lg text-slate-500 hover:text-white transition-all border border-transparent hover:border-white/10 group/btn"
                              title="Start Advanced Test"
                            >
                              <Brain size={14} className="group-hover/btn:scale-110 transition-transform" />
                            </button>
                          )}
                        </div>
                        <div className="flex items-center text-xs text-slate-500">
                          <Clock size={12} className="mr-1" />
                          Edited recently
                        </div>
                      </div>
                      );
                    })
                  )}
                </div>
              </div>
              
              {/* Learning Progress Widget */}
              <div className="cinematic-glass p-8 rounded-3xl flex flex-col gap-6 premium-surface">
                <div className="flex items-center justify-between">
                  <div className="flex flex-col gap-1">
                    <h2 className="text-xl font-semibold text-white">Mastery Progress</h2>
                    <p className="text-xs text-slate-400">Your average test performance across all subjects.</p>
                  </div>
                  <button 
                    onClick={() => navigate('/performance')}
                    className="text-xs font-semibold text-white/60 hover:text-white flex items-center gap-1 transition-all"
                  >
                    View History <ChevronRight size={14} />
                  </button>
                </div>

                <div className="flex items-end gap-2 h-24 mt-4">
                  {[45, 62, 58, 85, 72, 90, 88].map((v, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-2">
                       <div 
                         className="w-full bg-white/10 rounded-t-lg transition-all hover:bg-white/30 cursor-pointer relative group"
                         style={{ height: `${v}%` }}
                       >
                          <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-white text-black text-[10px] font-bold px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                            {v}%
                          </div>
                       </div>
                       <span className="text-[9px] text-slate-500 uppercase font-bold">Day {i+1}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* To-Do List Area */}
              <ToDoList />
            </div>

            {/* Side Area - Knowledge Graph */}
            <div className="col-span-12 lg:col-span-4 flex flex-col">
              <div className="cinematic-glass flex-1 p-4 rounded-3xl flex flex-col relative overflow-hidden premium-surface min-h-[400px]">
                 <div className="flex items-center gap-2 mb-2 z-10 p-2">
                    <Book size={18} className="text-slate-400" />
                    <h2 className="text-sm font-semibold text-white tracking-wide">Concept Map</h2>
                 </div>
                 
                 <div className="flex-1 w-full h-full z-10 relative">
                    <KnowledgeGraph 
                      graphData={{
                        nodes: [
                          { id: 'photosynthesis', label: 'Photosynthesis' },
                          { id: 'light_reactions', label: 'Light Reactions' },
                          { id: 'dark_reactions', label: 'Dark Reactions' },
                          { id: 'h2o', label: 'H2O' },
                          { id: 'co2', label: 'CO2' },
                          { id: 'glucose', label: 'Glucose' }
                        ],
                        edges: [
                          { from: 'photosynthesis', to: 'light_reactions', label: 'contains' },
                          { from: 'photosynthesis', to: 'dark_reactions', label: 'contains' },
                          { from: 'light_reactions', to: 'h2o', label: 'requires' },
                          { from: 'dark_reactions', to: 'co2', label: 'requires' },
                          { from: 'dark_reactions', to: 'glucose', label: 'produces' }
                        ]
                      }}
                    />
                 </div>
              </div>
            </div>

          </div>
        </main>
      </div>

      <AuthPanel
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onSuccess={(u) => {
          setIsAuthOpen(false);
          console.log('[Auth] Logged in:', u?.email);
        }}
      />
    </div>
  );
};

export default Dashboard;
