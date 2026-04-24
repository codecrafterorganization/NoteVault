import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Cpu, ChevronLeft, Download, Terminal, CheckCircle2, XCircle, Loader2, Copy, Check } from 'lucide-react';
import gsap from 'gsap';

const OfflineAI = () => {
  const navigate = useNavigate();
  const containerRef = useRef(null);
  
  // Status states: 'waiting' | 'ready' | 'error' | 'checking'
  const [status, setStatus] = useState('waiting');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const tl = gsap.timeline({ defaults: { ease: 'expo.out' } });
    tl.fromTo(containerRef.current.querySelectorAll('.animate-item'),
      { y: 20, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.8, stagger: 0.1 }
    );
  }, []);

  const handleCopy = () => {
    navigator.clipboard.writeText('ollama run gemma:2b');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const checkStatus = async () => {
    setStatus('checking');
    try {
      const response = await fetch('http://localhost:11434/api/tags', {
        method: 'GET',
        // Optional: reduce timeout if needed so it doesn't hang forever
      });
      if (response.ok) {
        setStatus('ready');
      } else {
        setStatus('error');
      }
    } catch (error) {
      setStatus('error');
    }
  };

  return (
    <div ref={containerRef} className="w-full min-h-screen bg-[#050505] text-slate-100 flex flex-col items-center p-8 relative overflow-y-auto no-scrollbar">
      {/* Premium Background Elements */}
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-600/5 rounded-full blur-[150px] pointer-events-none opacity-50" />
      <div className="fixed top-1/3 left-2/3 w-[400px] h-[400px] bg-purple-600/5 rounded-full blur-[120px] pointer-events-none opacity-40" />
      
      <button 
        onClick={() => navigate(-1)}
        className="absolute top-10 left-10 flex items-center gap-2 text-slate-500 hover:text-white transition-all group z-20"
      >
        <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-white/10 transition-colors">
          <ChevronLeft size={16} />
        </div>
        <span className="text-xs font-bold uppercase tracking-widest">Back</span>
      </button>

      <div className="flex flex-col w-full max-w-3xl z-10 mt-16 animate-item">
        
        {/* Header Section */}
        <div className="flex flex-col items-center text-center mb-12">
          <div className="w-20 h-20 rounded-[28px] bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-white/10 flex items-center justify-center mb-6 backdrop-blur-xl shadow-2xl">
            <Cpu size={36} className="text-blue-400" />
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-4 bg-gradient-to-b from-white to-white/60 bg-clip-text text-transparent">
            Offline AI Setup
          </h1>
          <p className="text-lg text-slate-400 font-medium">
            Run AI locally on your system without internet using Ollama.
          </p>
        </div>

        {/* Status Card */}
        <div className="w-full p-6 rounded-3xl bg-white/[0.02] border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-6 mb-8 backdrop-blur-md animate-item">
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border transition-colors ${
              status === 'ready' ? 'bg-emerald-500/10 border-emerald-500/30' :
              status === 'error' ? 'bg-red-500/10 border-red-500/30' :
              status === 'checking' ? 'bg-blue-500/10 border-blue-500/30' :
              'bg-white/5 border-white/10'
            }`}>
              {status === 'ready' && <CheckCircle2 size={24} className="text-emerald-400" />}
              {status === 'error' && <XCircle size={24} className="text-red-400" />}
              {status === 'checking' && <Loader2 size={24} className="text-blue-400 animate-spin" />}
              {status === 'waiting' && <Loader2 size={24} className="text-slate-400" />}
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Status</span>
              <span className={`text-lg font-bold ${
                status === 'ready' ? 'text-emerald-400' :
                status === 'error' ? 'text-red-400' :
                status === 'checking' ? 'text-blue-400' :
                'text-white'
              }`}>
                {status === 'ready' ? 'Offline AI is running' :
                 status === 'error' ? 'Ollama not detected. Please start it.' :
                 status === 'checking' ? 'Checking connection...' :
                 'Waiting for Setup'}
              </span>
            </div>
          </div>
          <button 
            onClick={checkStatus}
            disabled={status === 'checking'}
            className="px-6 py-3 rounded-xl bg-white text-black font-bold text-sm hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:hover:scale-100 flex items-center gap-2"
          >
            Check Offline AI Status
          </button>
        </div>

        {/* Steps Container */}
        <div className="flex flex-col gap-4 animate-item">
          
          {/* Step 1 */}
          <div className="p-8 rounded-3xl bg-white/[0.03] border border-white/5 flex flex-col md:flex-row gap-6 items-start hover:bg-white/[0.04] hover:border-white/10 transition-colors">
            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center font-bold text-white shrink-0">1</div>
            <div className="flex flex-col gap-2">
              <h3 className="text-xl font-bold text-white">Install Ollama</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Download and install Ollama from the official website to run large language models locally.
              </p>
              <a 
                href="https://ollama.com/download" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 mt-2 px-5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs font-bold hover:bg-white/10 transition-colors w-fit"
              >
                <Download size={14} /> Download Ollama
              </a>
            </div>
          </div>

          {/* Step 2 */}
          <div className="p-8 rounded-3xl bg-white/[0.03] border border-white/5 flex flex-col md:flex-row gap-6 items-start hover:bg-white/[0.04] hover:border-white/10 transition-colors">
            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center font-bold text-white shrink-0">2</div>
            <div className="flex flex-col gap-4 w-full">
              <div className="flex flex-col gap-2">
                <h3 className="text-xl font-bold text-white">Run Model Command</h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Open your terminal or command prompt and run the following command to download and start the Gemma 2B model.
                </p>
              </div>
              <div className="flex items-center justify-between p-4 bg-[#0a0a0a] border border-white/10 rounded-2xl w-full">
                <div className="flex items-center gap-3 overflow-x-auto no-scrollbar">
                  <Terminal size={16} className="text-slate-500 shrink-0" />
                  <code className="font-mono text-sm text-blue-400 whitespace-nowrap">ollama run gemma:2b</code>
                </div>
                <button 
                  onClick={handleCopy}
                  className="p-2 bg-white/5 hover:bg-white/10 rounded-lg text-slate-300 transition-colors ml-4 shrink-0"
                  title="Copy command"
                >
                  {copied ? <Check size={16} className="text-emerald-400" /> : <Copy size={16} />}
                </button>
              </div>
            </div>
          </div>

          {/* Step 3 */}
          <div className="p-8 rounded-3xl bg-white/[0.03] border border-white/5 flex flex-col md:flex-row gap-6 items-start hover:bg-white/[0.04] hover:border-white/10 transition-colors">
            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center font-bold text-white shrink-0">3</div>
            <div className="flex flex-col gap-2">
              <h3 className="text-xl font-bold text-white">Verify Setup</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                After running the command, your offline AI will be ready. Click the "Check Offline AI Status" button above to verify the connection.
              </p>
            </div>
          </div>

        </div>
        
        {/* Footer padding */}
        <div className="h-20" />
      </div>
    </div>
  );
};

export default OfflineAI;
