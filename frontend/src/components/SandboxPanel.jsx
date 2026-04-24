import API_BASE from '../config.js';
import React, { useState, useRef, useEffect } from 'react';
import { Play, RotateCcw, ShieldCheck, Terminal, Copy, Wand2, Check, AlertCircle } from 'lucide-react';
import axios from 'axios';

const SandboxPanel = ({ highlightedText }) => {
  const [code, setCode] = useState('// Write or paste code here...\nconsole.log("Hello from NoteVault!");');
  const [output, setOutput] = useState([]);
  const [language, setLanguage] = useState('javascript');
  const [isRunning, setIsRunning] = useState(false);
  const [isFixing, setIsFixing] = useState(false);
  const [lastError, setLastError] = useState(null);
  const [copied, setCopied] = useState(false);
  const terminalEndRef = useRef(null);

  const scrollToBottom = () => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [output]);

  const runCode = () => {
    setIsRunning(true);
    setLastError(null);
    const newOutput = [];
    
    // Custom console to capture output
    const customConsole = {
      log: (...args) => newOutput.push({ type: 'log', text: args.join(' ') }),
      error: (...args) => newOutput.push({ type: 'error', text: args.join(' ') }),
      warn: (...args) => newOutput.push({ type: 'warn', text: args.join(' ') }),
    };

    if (language === 'javascript') {
      try {
        // Safe evaluation core
        const fun = new Function('console', code);
        fun(customConsole);
      } catch (err) {
        customConsole.error(err.message);
        setLastError(err.message);
      }
    } else {
      // Mock for Python/C++ in hackathon demo
      customConsole.log(`[Simulating ${language} execution...]`);
      customConsole.log(`Output: Results for your logic will appear here in production.`);
    }

    setOutput(prev => [...prev, ...newOutput, { type: 'system', text: `--- Execution Finished ---` }]);
    setIsRunning(false);
  };

  const handleFixCode = async () => {
    if (!lastError && code.length < 10) return;
    setIsFixing(true);
    try {
      const res = await axios.post(API_BASE + '/api/sandbox/fix', {
        code,
        error: lastError || 'Check for potential improvements or bugs.',
        language
      });
      if (res.data.success) {
        setCode(res.data.fixedCode);
        setOutput(prev => [...prev, { type: 'ai', text: `✨ AI Suggestion: ${res.data.explanation}` }]);
        setLastError(null);
      }
    } catch (err) {
      console.error(err);
      setOutput(prev => [...prev, { type: 'error', text: 'AI failed to fix the code snippet.' }]);
    } finally {
      setIsFixing(false);
    }
  };

  const handleCopyFromHighlight = () => {
    if (highlightedText) {
      setCode(highlightedText);
      setOutput(prev => [...prev, { type: 'system', text: 'Imported text from note selection.' }]);
    }
  };

  const clearTerminal = () => setOutput([]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="h-full flex flex-col cinematic-glass rounded-3xl premium-surface overflow-hidden border border-white/5">
      {/* Header */}
      <div className="h-14 border-b border-white/[0.05] flex items-center justify-between px-6 bg-white/[0.02]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center text-indigo-400">
            <Terminal size={18} />
          </div>
          <h3 className="text-sm font-semibold text-white">Code Sandbox</h3>
          
          <select 
            value={language} 
            onChange={(e) => setLanguage(e.target.value)}
            className="ml-4 bg-slate-800 border border-slate-700 text-xs text-slate-300 rounded-lg px-2 py-1 outline-none hover:border-slate-500 transition-all"
          >
            <option value="javascript">JavaScript</option>
            <option value="python">Python (Simulated)</option>
            <option value="cpp">C++ (Simulated)</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          {highlightedText && (
            <button 
              onClick={handleCopyFromHighlight}
              className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium transition-all"
            >
              <Copy size={14} /> Import Highlight
            </button>
          )}
          <button 
            onClick={copyToClipboard}
            className="p-2 hover:bg-white/[0.05] rounded-lg transition text-slate-400 hover:text-white"
          >
            {copied ? <Check size={16} className="text-emerald-400" /> : <Copy size={16} />}
          </button>
        </div>
      </div>

      {/* Main Content Pane */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Editor Area */}
        <div className="flex-1 flex flex-col border-r border-white/5 relative bg-[#0d1117]">
          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="flex-1 w-full bg-transparent p-6 font-mono text-sm text-slate-300 outline-none resize-none no-scrollbar"
            spellCheck="false"
            placeholder="// Paste code here..."
          />
          
          {/* Action Bar Overlay */}
          <div className="absolute bottom-6 right-6 flex items-center gap-3">
            <button 
              onClick={handleFixCode}
              disabled={isFixing || (!lastError && code.length < 10)}
              className={`flex items-center gap-2 px-4 py-2 border rounded-xl text-sm font-semibold transition-all shadow-lg ${lastError ? 'bg-amber-500/10 border-amber-500/50 text-amber-400 hover:bg-amber-500/20 shadow-amber-500/10' : 'bg-indigo-600/10 border-indigo-500/30 text-indigo-400 hover:bg-indigo-500/20 shadow-indigo-500/10'} disabled:opacity-30`}
            >
              {isFixing ? <div className="animate-spin w-4 h-4 border-2 border-current border-t-transparent rounded-full" /> : <Wand2 size={16} />}
              {lastError ? 'Fix Error' : 'AI Review'}
            </button>

            <button 
              onClick={runCode}
              disabled={isRunning}
              className="flex items-center gap-2 px-6 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-sm font-semibold transition-all shadow-lg shadow-emerald-600/20"
            >
              {isRunning ? <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" /> : <Play size={16} fill="currentColor" />}
              Run Code
            </button>
          </div>
        </div>

        {/* Terminal Area */}
        <div className="w-full md:w-72 lg:w-80 flex flex-col bg-black/40 backdrop-blur-xl">
          <div className="h-10 px-4 flex items-center justify-between border-b border-white/5 bg-white/[0.02]">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
              <ShieldCheck size={12} /> Terminal Output
            </span>
            <button onClick={clearTerminal} className="p-1 hover:bg-white/5 rounded transition text-slate-500 hover:text-slate-300">
               <RotateCcw size={12} />
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto no-scrollbar p-4 font-mono text-[13px] leading-relaxed">
            {output.length === 0 ? (
              <div className="text-slate-600 italic">No output yet. Click 'Run' to see results.</div>
            ) : (
              output.map((line, i) => (
                <div key={i} className={`mb-1.5 p-1 rounded ${line.type === 'error' ? 'text-rose-400 bg-rose-400/5' : line.type === 'warn' ? 'text-amber-400 bg-amber-400/5' : line.type === 'system' ? 'text-slate-600 border-t border-white/5 mt-3 pt-3 italic' : line.type === 'ai' ? 'text-indigo-400 bg-indigo-400/5 border-l-2 border-indigo-500 pl-3 my-2' : 'text-emerald-400/90'}`}>
                  {line.type === 'error' && <span className="mr-2">✖</span>}
                  {line.type === 'ai' && <span className="mr-2">✨</span>}
                  {line.text}
                </div>
              ))
            )}
            <div ref={terminalEndRef} />
          </div>
        </div>
      </div>

      {/* Footer / Hint */}
      <div className="h-8 bg-black/60 flex items-center px-4 gap-2 text-[10px] text-slate-500 uppercase tracking-widest border-t border-white/[0.05]">
        <AlertCircle size={12} /> {lastError ? 'Found a bug? The AI Fix button is glowing amber!' : 'You can run standard JS directly in the browser.'}
      </div>
    </div>
  );
};

export default SandboxPanel;
