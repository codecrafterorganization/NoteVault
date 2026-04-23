import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search as SearchIcon, FileText, ChevronRight, Hash } from 'lucide-react';
import SidebarPreview from '../components/SidebarPreview';

const Search = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [allNotes, setAllNotes] = useState([]);

  useEffect(() => {
    fetch('http://localhost:5000/api/notes')
      .then(res => res.json())
      .then(data => {
        if (data.notes) setAllNotes(data.notes);
      });
  }, []);

  useEffect(() => {
    if (!query) {
      setResults([]);
      return;
    }
    const filtered = allNotes.filter(n => 
      n.title?.toLowerCase().includes(query.toLowerCase()) || 
      n.content?.toLowerCase().includes(query.toLowerCase())
    );
    setResults(filtered);
  }, [query, allNotes]);

  return (
    <div className="relative w-full h-screen bg-[#0A0D14] overflow-hidden text-slate-100 flex">
      <SidebarPreview onSignIn={() => {}} />
      
      <main className="flex-1 flex flex-col h-full overflow-hidden p-8 gap-8">
        <header className="flex flex-col gap-2 shrink-0">
          <h1 className="text-3xl font-semibold tracking-tight text-white">Universal Search</h1>
          <p className="text-sm text-slate-500">Search through your notes, exams, and generated insights</p>
        </header>

        <div className="relative shrink-0">
          <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
          <input 
            type="text" 
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type anything (e.g. 'Photosynthesis', 'Midterm', 'Thermodynamics')..." 
            className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 pl-14 pr-6 text-lg focus:outline-none focus:border-white/30 transition-all shadow-2xl shadow-black/50"
          />
        </div>

        <div className="flex-1 overflow-y-auto pr-2 flex flex-col gap-6 no-scrollbar pb-12">
           {!query ? (
             <div className="flex-1 flex flex-col items-center justify-center text-slate-600 gap-4">
                <div className="p-8 rounded-full bg-white/5 border border-white/5">
                   <SearchIcon size={40} className="opacity-20" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium text-slate-400">Ready to search your vault</p>
                  <p className="text-xs text-slate-600 mt-1">Start typing to see results instantly</p>
                </div>
             </div>
           ) : results.length === 0 ? (
             <div className="flex-1 flex flex-col items-center justify-center text-slate-600 gap-4 border border-dashed border-slate-800 rounded-3xl">
                <p className="text-sm">No matches found for "{query}"</p>
             </div>
           ) : (
             <div className="flex flex-col gap-3">
                <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 px-2">Matches found ({results.length})</h3>
                {results.map((note) => (
                  <div 
                    key={note.id}
                    onClick={() => navigate(`/study/${note.id}`)}
                    className="flex items-center gap-4 p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.05] hover:border-white/10 transition-all cursor-pointer group"
                  >
                     <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center shrink-0 border border-white/5">
                        <FileText size={20} className="text-slate-400" />
                     </div>
                     <div className="flex-1 flex flex-col gap-0.5">
                        <h4 className="text-sm font-medium text-white group-hover:text-white transition-colors">{note.title}</h4>
                        <div className="flex items-center gap-3">
                          <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">{note.fileType || 'Document'}</span>
                          <div className="flex items-center gap-1 text-[10px] text-slate-600">
                             <Hash size={10} /> {new Date(note.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                     </div>
                     <ChevronRight size={16} className="text-slate-700 group-hover:text-white group-hover:translate-x-1 transition-all" />
                  </div>
                ))}
             </div>
           )}
        </div>
      </main>
    </div>
  );
};

export default Search;

