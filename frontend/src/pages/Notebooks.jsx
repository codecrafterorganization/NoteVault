import API_BASE from '../config.js';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Clock, ChevronRight, Search, FileText } from 'lucide-react';
import SidebarPreview from '../components/SidebarPreview';

const Notebooks = () => {
  const navigate = useNavigate();
  const [notes, setNotes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const dummyNotes = [
    { id: 'dummy-biology', title: 'Biology: Cellular Respiration', fileType: 'Study Guide', createdAt: new Date().toISOString() },
    { id: 'dummy-thermo', title: 'Advanced Thermodynamics', fileType: 'Lecture Notes', createdAt: new Date().toISOString() },
    { id: 'dummy-chem', title: 'Organic Chemistry II', fileType: 'Summary', createdAt: new Date().toISOString() },
    { id: 'dummy-quantum', title: 'Quantum Mechanics Basics', fileType: 'Formula Sheet', createdAt: new Date().toISOString() },
    { id: 'dummy-history', title: 'Modern World History', fileType: 'Essay', createdAt: new Date().toISOString() },
    { id: 'dummy-macro', title: 'Macroeconomics 101', fileType: 'Review', createdAt: new Date().toISOString() },
  ];

  useEffect(() => {
    fetch(API_BASE + '/api/notes')
      .then(res => res.json())
      .then(data => {
        if (data.notes && data.notes.length > 0) {
          setNotes(data.notes);
        } else {
          setNotes(dummyNotes);
        }
      })
      .catch(err => {
        console.error("Error fetching notes:", err);
        setNotes(dummyNotes);
      })
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div className="relative w-full h-screen bg-[#0A0D14] overflow-hidden text-slate-100 flex">
      <SidebarPreview onSignIn={() => {}} />
      
      <main className="flex-1 flex flex-col h-full overflow-hidden p-8 gap-8">
        <header className="flex flex-col gap-2 shrink-0">
          <h1 className="text-3xl font-semibold tracking-tight text-white">My Notebooks</h1>
          <p className="text-sm text-slate-500">All your consolidated knowledge in one place</p>
        </header>

        <div className="relative shrink-0">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
          <input 
            type="text" 
            placeholder="Search through your notebooks..." 
            className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-6 text-sm focus:outline-none focus:border-white/30 transition-all"
          />
        </div>

        <div className="flex-1 overflow-y-auto pr-2 flex flex-col gap-4 no-scrollbar pb-12">
           {isLoading ? (
             <div className="flex-1 flex items-center justify-center text-slate-600 text-sm">
                Opening your vault...
             </div>
           ) : notes.length === 0 ? (
             <div className="flex-1 flex flex-col items-center justify-center text-slate-600 gap-4 border border-dashed border-slate-800 rounded-3xl">
                <FileText size={48} className="opacity-20" />
                <p className="text-sm">No notes found. Upload your first document from the Dashboard.</p>
             </div>
           ) : (
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {notes.map((note) => (
                  <div 
                    key={note.id}
                    onClick={() => navigate(`/study/${note.id}`)}
                    className="cinematic-glass p-6 rounded-3xl premium-surface flex flex-col gap-4 group cursor-pointer hover:bg-white/[0.04] transition-all border-white/5 hover:border-white/10"
                  >
                     <div className="flex justify-between items-start">
                        <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/10">
                           <BookOpen size={20} className="text-slate-300" />
                        </div>
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest bg-white/5 px-2 py-1 rounded-md">
                           {note.fileType || 'Document'}
                        </span>
                     </div>
                     <div className="flex flex-col gap-1">
                        <h3 className="text-lg font-semibold text-white group-hover:text-white transition-colors truncate">{note.title}</h3>
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                           <Clock size={12} />
                           <span>{new Date(note.createdAt).toLocaleDateString()}</span>
                        </div>
                     </div>
                     <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Open Note</span>
                        <ChevronRight size={14} className="text-slate-500 group-hover:translate-x-1 transition-transform" />
                     </div>
                  </div>
                ))}
             </div>
           )}
        </div>
      </main>
    </div>
  );
};

export default Notebooks;

