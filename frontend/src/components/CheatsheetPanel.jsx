import API_BASE from '../config.js';
import React, { useState, useRef } from 'react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import { FileText, Download, Loader2 } from 'lucide-react';
import html2pdf from 'html2pdf.js';

const CheatsheetPanel = ({ noteId }) => {
  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const contentRef = useRef(null);

  const generateCheatsheet = async () => {
    setIsLoading(true);
    setContent('');
    try {
      const res = await axios.post(API_BASE + '/api/cheatsheet/generate', {
        noteId: noteId || 'default-note'
      });
      if (res.data.success && res.data.cheatsheet) {
        setContent(res.data.cheatsheet);
      } else {
        alert('Could not generate cheatsheet.');
      }
    } catch (err) {
      console.error(err);
      alert('Error connecting to cheatsheet server.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="h-full flex flex-col cinematic-glass rounded-3xl premium-surface flex items-center justify-center">
        <Loader2 size={40} className="text-orange-500 animate-spin mb-4" />
        <h3 className="text-xl font-semibold text-white">Compressing Knowledge...</h3>
        <p className="text-sm text-slate-400 mt-2">Generating your single-page master guide.</p>
      </div>
    );
  }

  if (!content) {
    return (
      <div className="h-full flex flex-col cinematic-glass rounded-3xl premium-surface flex items-center justify-center text-center p-8">
        <FileText size={48} className="text-slate-500 mb-6" />
        <h2 className="text-2xl font-bold text-white mb-3">Cheat Sheet Generator</h2>
        <p className="text-slate-400 max-w-sm mb-8">Condense 10 pages of messy notes into a single, beautiful master page filled with core formulas, concepts, and tips.</p>
        <button onClick={generateCheatsheet} className="px-6 py-3 bg-white text-black hover:bg-slate-200 rounded-xl transition-all font-semibold shadow-lg">
          📄 Generate Cheat Sheet
        </button>
      </div>
    );
  }

  const speakContent = () => {
    if (!content) return;
    window.speechSynthesis.cancel();
    const cleanText = content.replace(/[#*]/g, '');
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = 'en-US';
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    window.speechSynthesis.speak(utterance);
  };

  const handleExportPDF = () => {
    if (!contentRef.current) return;
    // Hide scrollbar briefly for printing if we want (not strictly necessary with html2pdf)
    const element = contentRef.current;
    const opt = {
      margin:       [0.5, 0.5, 0.5, 0.5],
      filename:     'NoteVault_Cheatsheet.pdf',
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { scale: 2, useCORS: true, backgroundColor: '#1e1e1e' },
      jsPDF:        { unit: 'in', format: 'a4', orientation: 'portrait' }
    };

    html2pdf().set(opt).from(element).save();
  };

  return (
    <div className="h-full flex flex-col cinematic-glass rounded-3xl overflow-hidden premium-surface relative">
      <div className="absolute inset-0 bg-gradient-to-br from-orange-500/[0.03] to-transparent pointer-events-none" />
      
      {/* Header */}
      <div className="h-16 flex justify-between items-center px-6 border-b border-white/[0.05] relative z-10 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center border border-orange-500/20">
            <FileText size={16} className="text-orange-400" />
          </div>
          <span className="font-semibold text-white tracking-wide">Master Cheat Sheet</span>
        </div>
        <div className="flex items-center gap-2">
           <button onClick={speakContent} className="flex items-center gap-2 px-3 py-1.5 bg-sky-500/10 hover:bg-sky-500/20 hover:text-sky-300 text-sky-400 border border-sky-500/20 rounded-lg transition-colors text-sm font-medium">
             🎧 Listen to Podcast
           </button>
           <button onClick={handleExportPDF} className="flex items-center gap-2 px-3 py-1.5 bg-white/[0.05] hover:bg-white/[0.1] rounded-lg transition-colors text-sm font-medium text-slate-300">
             <Download size={14} /> Export PDF
           </button>
        </div>
      </div>

      {/* Markdown Content Viewer */}
      <div className="flex-1 overflow-y-auto no-scrollbar p-8 z-10 bg-black/40">
        <div ref={contentRef} className="prose prose-invert prose-orange max-w-none prose-headings:font-bold prose-h1:text-2xl prose-h2:text-xl prose-h3:text-lg prose-p:text-slate-300 prose-li:text-slate-300 prose-a:text-orange-400 p-8 rounded-2xl">
          <ReactMarkdown>{content}</ReactMarkdown>
        </div>
      </div>
    </div>
  );
};

export default CheatsheetPanel;
