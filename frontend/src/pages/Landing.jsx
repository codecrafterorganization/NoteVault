import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';

// ─── WebGL Dot-Matrix Particle Background ─────────────────────────────────────
const ParticleCanvas = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (!gl) return; // DOM fallback: just black bg

    let animId;
    let mouse = { x: 0.5, y: 0.5 };

    const vs = `
      attribute vec2 a_position;
      void main() { gl_Position = vec4(a_position, 0.0, 1.0); }
    `;

    const fs = `
      precision mediump float;
      uniform vec2 u_resolution;
      uniform float u_time;
      uniform vec2 u_mouse;

      float dot_field(vec2 uv, float spacing, float radius) {
        vec2 grid = fract(uv / spacing) - 0.5;
        float dist = length(grid);
        return smoothstep(radius, radius - 0.005, dist);
      }

      void main() {
        vec2 uv = gl_FragCoord.xy / u_resolution;
        uv.y = 1.0 - uv.y;

        // Pointer drift warp
        vec2 mouse_offset = (u_mouse - 0.5) * 0.04;
        vec2 warped = uv + mouse_offset * (1.0 - length(uv - u_mouse) * 0.8);

        // Dot spacing: tight grid
        float spacing = 0.035;
        float r = 0.008;

        // Breathing pulse
        float pulse = 0.5 + 0.5 * sin(u_time * 0.6);
        float base_r = r * (0.7 + 0.3 * pulse);

        // Depth fade from center
        float center_dist = length(uv - 0.5);
        float vignette = 1.0 - smoothstep(0.3, 0.9, center_dist);

        // Dot brightness varies with noise-like pattern
        float wave = sin(warped.x * 18.0 + u_time * 0.3) * 0.5 + 0.5;
        wave *= cos(warped.y * 14.0 - u_time * 0.2) * 0.5 + 0.5;

        float dots = dot_field(warped, spacing, base_r);
        float brightness = dots * vignette * (0.15 + 0.08 * wave);

        gl_FragColor = vec4(vec3(brightness), 1.0);
      }
    `;

    const compile = (type, src) => {
      const s = gl.createShader(type);
      gl.shaderSource(s, src);
      gl.compileShader(s);
      return s;
    };

    const prog = gl.createProgram();
    gl.attachShader(prog, compile(gl.VERTEX_SHADER, vs));
    gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, fs));
    gl.linkProgram(prog);
    gl.useProgram(prog);

    // Fullscreen quad
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, 1,1]), gl.STATIC_DRAW);
    const pos = gl.getAttribLocation(prog, 'a_position');
    gl.enableVertexAttribArray(pos);
    gl.vertexAttribPointer(pos, 2, gl.FLOAT, false, 0, 0);

    const uRes = gl.getUniformLocation(prog, 'u_resolution');
    const uTime = gl.getUniformLocation(prog, 'u_time');
    const uMouse = gl.getUniformLocation(prog, 'u_mouse');

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      gl.viewport(0, 0, canvas.width, canvas.height);
    };
    resize();
    window.addEventListener('resize', resize);

    const onMouseMove = (e) => {
      mouse.x = e.clientX / window.innerWidth;
      mouse.y = e.clientY / window.innerHeight;
    };
    window.addEventListener('mousemove', onMouseMove);

    const start = performance.now();
    const render = () => {
      const t = (performance.now() - start) / 1000;
      gl.uniform2f(uRes, canvas.width, canvas.height);
      gl.uniform1f(uTime, t);
      gl.uniform2f(uMouse, mouse.x, mouse.y);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      animId = requestAnimationFrame(render);
    };
    render();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', onMouseMove);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ background: '#0a0a0a' }}
    />
  );
};

// ─── Feature Cards Data ────────────────────────────────────────────────────────
const FEATURES = [
  {
    icon: '📄',
    title: 'Smart Upload',
    desc: 'Upload PDFs, DOCX, or text files. AI instantly extracts and indexes your content.',
    tag: 'Core',
  },
  {
    icon: '🤖',
    title: 'AI Study Buddy',
    desc: 'Chat with your notes. Highlight any text to get instant AI explanations.',
    tag: 'AI',
  },
  {
    icon: '📝',
    title: 'Test Mode',
    desc: 'Auto-generate MCQ + short answer quizzes from any note. Track your score over time.',
    tag: 'Assessment',
  },
  {
    icon: '⚔️',
    title: 'Battle Mode',
    desc: 'Challenge friends or AI opponents in real-time 1v1 quiz battles via WebSocket.',
    tag: 'Multiplayer',
  },
  {
    icon: '🗺️',
    title: 'Concept Maps',
    desc: 'Visual knowledge graphs auto-generated from your notes using AI extraction.',
    tag: 'AI',
  },
  {
    icon: '📋',
    title: 'Cheat Sheets',
    desc: 'One-click AI cheat sheet generation. Get the key formulas and concepts instantly.',
    tag: 'AI',
  },
];

// ─── Landing Page ─────────────────────────────────────────────────────────────
const Landing = () => {
  const navigate = useNavigate();
  const containerRef = useRef(null);
  const heroRef = useRef(null);
  const featuresRef = useRef(null);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Hero entrance
      gsap.fromTo('.nv-hero-badge',
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out', delay: 0.3 }
      );
      gsap.fromTo('.nv-hero-title',
        { y: 40, opacity: 0 },
        { y: 0, opacity: 1, duration: 1, ease: 'power3.out', delay: 0.5, stagger: 0.1 }
      );
      gsap.fromTo('.nv-hero-sub',
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.9, ease: 'power3.out', delay: 0.9 }
      );
      gsap.fromTo('.nv-hero-cta',
        { y: 20, opacity: 0, scale: 0.95 },
        { y: 0, opacity: 1, scale: 1, duration: 0.8, ease: 'back.out(1.5)', delay: 1.1 }
      );
      gsap.fromTo('.nv-hero-stat',
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.7, ease: 'power2.out', delay: 1.4, stagger: 0.1 }
      );
      // Feature cards
      gsap.fromTo('.nv-feature-card',
        { y: 40, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.7, ease: 'power3.out', delay: 1.6, stagger: 0.08 }
      );
    }, containerRef);

    // Scroll detection for nav style
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll);

    return () => {
      ctx.revert();
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  const handleEnter = () => {
    gsap.to(heroRef.current, {
      y: -20,
      opacity: 0,
      duration: 0.6,
      ease: 'power2.inOut',
      onComplete: () => navigate('/dashboard'),
    });
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full min-h-screen overflow-y-auto overflow-x-hidden text-[#F4F4F5]"
      style={{ background: '#0a0a0a' }}
    >
      {/* WebGL particle background */}
      <ParticleCanvas />

      {/* Vignette overlay */}
      <div className="absolute inset-0 pointer-events-none z-[1]"
        style={{ background: 'radial-gradient(ellipse 80% 70% at 50% 40%, transparent 30%, #0a0a0a 100%)' }} />

      {/* ── Navbar ─────────────────────────────────────────────────────── */}
      <nav className={`fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-4 transition-all duration-300 ${scrolled ? 'bg-black/60 backdrop-blur-xl border-b border-white/5' : ''}`}>
        <div className="flex items-center gap-2.5">
          <svg width="22" height="22" viewBox="0 0 100 100" fill="none">
            <path d="M20 30 Q35 25,50 40 L50 85 Q35 70,20 75 Z" stroke="#F4F4F5" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" fill="rgba(255,255,255,0.04)" />
            <path d="M80 30 Q65 25,50 40 L50 85 Q65 70,80 75 Z" stroke="#F4F4F5" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" fill="rgba(255,255,255,0.04)" />
            <line x1="50" y1="40" x2="50" y2="85" stroke="#F4F4F5" strokeWidth="4" strokeLinecap="round" />
          </svg>
          <span className="text-sm font-semibold tracking-tight text-white">NoteVault</span>
        </div>
        <button
          onClick={handleEnter}
          className="text-xs font-medium text-[#71717A] hover:text-white transition-colors duration-150 tracking-wide"
        >
          Open App →
        </button>
      </nav>

      {/* ── Hero Section ───────────────────────────────────────────────── */}
      <section
        ref={heroRef}
        className="relative z-10 min-h-screen flex flex-col items-center justify-center text-center px-6 pt-24 pb-12"
      >
        {/* Badge */}
        <div className="nv-hero-badge inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/[0.08] bg-white/[0.04] text-[#71717A] text-xs font-medium tracking-widest uppercase mb-8">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          AI-Powered Study Platform
        </div>

        {/* Title */}
        <h1 className="nv-hero-title text-[clamp(40px,7vw,88px)] font-medium leading-[1.05] tracking-[-0.025em] text-[#F4F4F5] max-w-4xl" style={{ letterSpacing: '-0.025em' }}>
          Your second brain
          <br />
          <span className="text-[#71717A]">for studying smarter.</span>
        </h1>

        {/* Subtitle */}
        <p className="nv-hero-sub mt-8 text-[15px] text-[#71717A] leading-relaxed max-w-xl">
          Upload notes, chat with AI, generate quizzes, battle friends — all in one focused workspace. Built for students who want results.
        </p>

        {/* CTAs */}
        <div className="nv-hero-cta flex flex-col sm:flex-row items-center gap-3 mt-10">
          <button
            onClick={handleEnter}
            className="px-7 py-3 rounded-full text-sm font-medium text-[#111111] bg-[#F4F4F5] border border-white/60 hover:bg-white transition-colors duration-150"
            style={{ boxShadow: 'rgba(0,0,0,0.9) 0px 4px 8px 0px inset, rgba(255,255,255,0.08) 0px 1px 1px 0px' }}
          >
            Start for free
          </button>
          <button
            onClick={handleEnter}
            className="px-7 py-3 rounded-full text-sm font-medium text-[#71717A] hover:text-[#F4F4F5] transition-colors duration-150 border border-white/[0.08]"
          >
            View demo →
          </button>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-8 mt-12">
          {[
            { label: 'AI Features', val: '6+' },
            { label: 'Real-time Battle', val: '1v1' },
            { label: 'Upload Types', val: 'PDF, DOCX, TXT' },
          ].map((s, i) => (
            <div key={i} className="nv-hero-stat flex flex-col items-center gap-1">
              <span className="text-2xl font-semibold text-[#F4F4F5] tracking-tight">{s.val}</span>
              <span className="text-[11px] text-[#71717A] tracking-widest uppercase">{s.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features Section ────────────────────────────────────────────── */}
      <section
        ref={featuresRef}
        className="relative z-10 px-6 pb-24 max-w-6xl mx-auto"
      >
        {/* Section header */}
        <div className="text-center mb-12">
          <p className="text-[11px] font-medium text-[#71717A] tracking-[0.2em] uppercase mb-3">Everything You Need</p>
          <h2 className="text-[clamp(28px,4vw,48px)] font-medium text-[#F4F4F5] tracking-tight">
            One vault. All your learning.
          </h2>
        </div>

        {/* Feature grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {FEATURES.map((feat, i) => (
            <div
              key={i}
              className="nv-feature-card group relative p-8 rounded-[32px] border border-white/[0.06] transition-all duration-150 cursor-pointer hover:border-white/[0.15]"
              style={{
                background: 'linear-gradient(135deg, #111111, #0a0a0a)',
                boxShadow: 'rgba(0,0,0,0.8) 0px 2px 6px 0px inset, rgba(255,255,255,0.05) 0px 1px 1px 0px',
              }}
              onClick={handleEnter}
            >
              {/* Gradient border shell */}
              <div className="absolute inset-0 rounded-[32px] opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.04), transparent)', pointerEvents: 'none' }}
              />

              {/* Tag */}
              <div className="inline-flex items-center px-2.5 py-0.5 rounded-full border border-white/[0.08] text-[10px] font-medium text-[#71717A] tracking-widest uppercase mb-4">
                {feat.tag}
              </div>

              {/* Icon */}
              <div className="text-3xl mb-4">{feat.icon}</div>

              {/* Text */}
              <h3 className="text-base font-semibold text-[#F4F4F5] mb-2 tracking-tight">{feat.title}</h3>
              <p className="text-[13px] text-[#71717A] leading-relaxed">{feat.desc}</p>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <button
            onClick={handleEnter}
            className="px-8 py-3.5 rounded-full text-sm font-medium text-[#111111] bg-[#F4F4F5] hover:bg-white transition-colors duration-150"
            style={{ boxShadow: 'rgba(0,0,0,0.9) 0px 4px 8px 0px inset, rgba(255,255,255,0.08) 0px 1px 1px 0px' }}
          >
            Open NoteVault — It's free
          </button>
          <p className="text-[11px] text-[#71717A] mt-3">No account required to start</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/[0.04] py-6 px-8 flex items-center justify-between">
        <span className="text-[11px] text-[#71717A] tracking-widest uppercase">NoteVault © 2025</span>
        <span className="text-[11px] text-[#71717A]">AI-Powered Learning</span>
      </footer>
    </div>
  );
};

export default Landing;
