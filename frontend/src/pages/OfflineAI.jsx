import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Cpu, WifiOff, ChevronLeft, Sparkles, Box, Shield, Zap, Globe } from 'lucide-react';
import gsap from 'gsap';

const OfflineAI = () => {
  const navigate = useNavigate();
  const containerRef = useRef(null);
  const iconRef = useRef(null);
  const contentRef = useRef(null);

  useEffect(() => {
    const tl = gsap.timeline({ defaults: { ease: 'expo.out' } });
    
    tl.fromTo(containerRef.current.querySelectorAll('.animate-item'),
      { y: 40, opacity: 0 },
      { y: 0, opacity: 1, duration: 1.2, stagger: 0.15 }
    );

    gsap.to(iconRef.current, {
      y: -15,
      duration: 3,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut"
    });

    // Floating particles animation
    gsap.to(".particle", {
      y: "random(-100, 100)",
      x: "random(-100, 100)",
      duration: "random(10, 20)",
      repeat: -1,
      yoyo: true,
      ease: "none"
    });
  }, []);

  return (
    <div ref={containerRef} className="w-full min-h-screen bg-[#050505] text-slate-100 flex flex-col items-center justify-center p-8 relative overflow-hidden">
      {/* Premium Background Elements */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-600/10 rounded-full blur-[150px] pointer-events-none opacity-50" />
      <div className="absolute top-1/3 left-2/3 w-[400px] h-[400px] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none opacity-40" />
      
      {/* Animated Particles */}
      {[...Array(20)].map((_, i) => (
        <div 
          key={i} 
          className="particle absolute w-1 h-1 bg-white/10 rounded-full pointer-events-none"
          style={{ 
            top: `${Math.random() * 100}%`, 
            left: `${Math.random() * 100}%`,
            opacity: Math.random() * 0.5
          }} 
        />
      ))}

      <button 
        onClick={() => navigate(-1)}
        className="absolute top-10 left-10 flex items-center gap-2 text-slate-500 hover:text-white transition-all group z-20"
      >
        <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-white/10 transition-colors">
          <ChevronLeft size={16} />
        </div>
        <span className="text-xs font-bold uppercase tracking-widest">Back</span>
      </button>

      <div ref={contentRef} className="flex flex-col items-center text-center max-w-2xl z-10">
        {/* Hero Icon */}
        <div ref={iconRef} className="relative mb-12 animate-item">
          <div className="absolute inset-0 bg-blue-500/20 blur-3xl rounded-full" />
          <div className="w-28 h-28 rounded-[40px] bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-white/10 flex items-center justify-center relative backdrop-blur-xl shadow-2xl">
            <Cpu size={56} className="text-blue-400" />
            <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-[#0a0a0a] border border-white/10 rounded-2xl flex items-center justify-center shadow-lg">
              <WifiOff size={20} className="text-purple-400" />
            </div>
          </div>
        </div>

        {/* Coming Soon Tag */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-blue-400 text-[10px] font-black uppercase tracking-[0.2em] mb-8 animate-item backdrop-blur-sm">
          <Sparkles size={12} className="animate-pulse" />
          Neural Edge Engine • Coming Soon
        </div>

        {/* Heading */}
        <h1 className="text-6xl font-black tracking-tighter mb-8 bg-gradient-to-b from-white via-white to-white/30 bg-clip-text text-transparent animate-item leading-[1.1]">
          Offline AI Mode
        </h1>

        {/* Description */}
        <p className="text-xl text-slate-400 font-medium leading-relaxed mb-14 animate-item max-w-lg">
          We are engineering a powerful, decentralized AI experience. Study anywhere, anytime, with total privacy and zero latency.
        </p>

        {/* Features Preview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full animate-item">
           <div className="p-6 rounded-[28px] bg-white/[0.03] border border-white/5 flex flex-col gap-3 items-center hover:bg-white/[0.05] transition-colors group">
              <div className="w-10 h-10 rounded-2xl bg-blue-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Box size={20} className="text-blue-400" />
              </div>
              <span className="text-sm font-bold text-white tracking-tight">On-Device LLM</span>
              <span className="text-[11px] text-slate-500 leading-snug">Private inference running locally on your hardware.</span>
           </div>
           
           <div className="p-6 rounded-[28px] bg-white/[0.03] border border-white/5 flex flex-col gap-3 items-center hover:bg-white/[0.05] transition-colors group">
              <div className="w-10 h-10 rounded-2xl bg-purple-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Shield size={20} className="text-purple-400" />
              </div>
              <span className="text-sm font-bold text-white tracking-tight">Vault Privacy</span>
              <span className="text-[11px] text-slate-500 leading-snug">Your data stays in your vault. No cloud syncing required.</span>
           </div>

           <div className="p-6 rounded-[28px] bg-white/[0.03] border border-white/5 flex flex-col gap-3 items-center hover:bg-white/[0.05] transition-colors group">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Zap size={20} className="text-emerald-400" />
              </div>
              <span className="text-sm font-bold text-white tracking-tight">Zero Latency</span>
              <span className="text-[11px] text-slate-500 leading-snug">Instant responses without internet dependency.</span>
           </div>
        </div>

        {/* CTA */}
        <div className="mt-16 flex flex-col items-center gap-4 animate-item">
          <button 
            onClick={() => navigate('/dashboard')}
            className="px-10 py-4 bg-white text-black font-black text-sm rounded-full hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-white/10 uppercase tracking-widest"
          >
            Return to Dashboard
          </button>
          <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest flex items-center gap-2">
            <Globe size={10} />
            NoteVault Global Network • Version 2.0 Alpha
          </span>
        </div>
      </div>

      {/* Aesthetic Overlays */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] pointer-events-none" />
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
    </div>
  );
};

export default OfflineAI;
