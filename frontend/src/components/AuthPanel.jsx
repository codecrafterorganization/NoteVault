import React, { useState, useEffect, useRef } from 'react';
import { X, ArrowRight, Chrome } from 'lucide-react';
import { loginWithEmail, registerWithEmail, loginWithGoogle } from '../lib/firebase';

// ─── WebGL Mini Particle (same as Landing but smaller) ──────────────────────
const MiniParticle = () => {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const gl = canvas.getContext('webgl');
    if (!gl) return;
    let animId;
    let mouse = { x: 0.5, y: 0.5 };
    const vs = `attribute vec2 a_position; void main(){gl_Position=vec4(a_position,0.,1.);}`;
    const fs = `
      precision mediump float;
      uniform vec2 u_res; uniform float u_time; uniform vec2 u_mouse;
      float d(vec2 uv,float sp,float r){vec2 g=fract(uv/sp)-.5;return smoothstep(r,r-.004,length(g));}
      void main(){
        vec2 uv=gl_FragCoord.xy/u_res; uv.y=1.-uv.y;
        float sp=.045; float r=.01*(0.7+0.3*sin(u_time*.5));
        float vg=1.-smoothstep(.3,.9,length(uv-.5));
        float w=sin(uv.x*15.+u_time*.2)*.5+.5; w*=cos(uv.y*12.-u_time*.15)*.5+.5;
        float dots=d(uv,sp,r)*vg*(0.12+0.07*w);
        gl_FragColor=vec4(vec3(dots),1.);
      }`;
    const compile=(t,s)=>{const sh=gl.createShader(t);gl.shaderSource(sh,s);gl.compileShader(sh);return sh;};
    const prog=gl.createProgram();
    gl.attachShader(prog,compile(gl.VERTEX_SHADER,vs));
    gl.attachShader(prog,compile(gl.FRAGMENT_SHADER,fs));
    gl.linkProgram(prog); gl.useProgram(prog);
    const buf=gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER,buf);
    gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,1,1]),gl.STATIC_DRAW);
    const pos=gl.getAttribLocation(prog,'a_position');
    gl.enableVertexAttribArray(pos); gl.vertexAttribPointer(pos,2,gl.FLOAT,false,0,0);
    const uR=gl.getUniformLocation(prog,'u_res');
    const uT=gl.getUniformLocation(prog,'u_time');
    const uM=gl.getUniformLocation(prog,'u_mouse');
    const resize=()=>{canvas.width=canvas.offsetWidth;canvas.height=canvas.offsetHeight;gl.viewport(0,0,canvas.width,canvas.height);};
    resize();
    const start=performance.now();
    const render=()=>{
      const t=(performance.now()-start)/1000;
      gl.uniform2f(uR,canvas.width,canvas.height); gl.uniform1f(uT,t); gl.uniform2f(uM,mouse.x,mouse.y);
      gl.drawArrays(gl.TRIANGLE_STRIP,0,4); animId=requestAnimationFrame(render);
    };
    render();
    return ()=>cancelAnimationFrame(animId);
  },[]);
  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" style={{background:'#0a0a0a'}} />;
};

// ─── Main Auth Panel ─────────────────────────────────────────────────────────
const AuthPanel = ({ isOpen, onClose, onSuccess }) => {
  const [mode, setMode] = useState('login'); // 'login' | 'signup'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState('');

  const panelRef = useRef(null);
  const overlayRef = useRef(null);
  const contentRef = useRef(null);

  // Open / Close panel animation using CSS transitions (no GSAP lag)
  useEffect(() => {
    const panel = panelRef.current;
    const overlay = overlayRef.current;
    if (!panel || !overlay) return;

    if (isOpen) {
      // Show overlay instantly, slide panel from right
      overlay.style.opacity = '1';
      overlay.style.pointerEvents = 'auto';
      panel.style.transform = 'translateX(0)';
      panel.style.opacity = '1';
    } else {
      overlay.style.opacity = '0';
      overlay.style.pointerEvents = 'none';
      panel.style.transform = 'translateX(100%)';
      panel.style.opacity = '0';
    }
  }, [isOpen]);

  // Reset form when opening
  useEffect(() => {
    if (isOpen) {
      setError('');
      setEmail('');
      setPassword('');
      setName('');
    }
  }, [isOpen, mode]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      let cred;
      if (mode === 'login') {
        cred = await loginWithEmail(email, password);
      } else {
        cred = await registerWithEmail(email, password, name);
      }
      onSuccess?.(cred.user);
      onClose();
    } catch (err) {
      setError(getFirebaseError(err.code));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setGoogleLoading(true);
    setError('');
    try {
      const result = await loginWithGoogle();
      onSuccess?.(result.user);
      onClose();
    } catch (err) {
      if (err.code !== 'auth/popup-closed-by-user') {
        setError(getFirebaseError(err.code));
      }
    } finally {
      setGoogleLoading(false);
    }
  };

  const switchMode = () => {
    setMode(m => m === 'login' ? 'signup' : 'login');
    setError('');
  };

  return (
    <>
      {/* Backdrop */}
      <div
        ref={overlayRef}
        onClick={onClose}
        className="fixed inset-0 z-40 bg-black/50 backdrop-blur-[2px]"
        style={{
          opacity: 0,
          pointerEvents: 'none',
          transition: 'opacity 0.3s ease',
        }}
      />

      {/* Right-side Panel */}
      <div
        ref={panelRef}
        className="fixed top-0 right-0 h-full w-full sm:w-[440px] z-50 flex flex-col overflow-hidden"
        style={{
          transform: 'translateX(100%)',
          opacity: 0,
          transition: 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.4s ease',
          background: '#0a0a0a',
          borderLeft: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        {/* WebGL bg on the panel */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          <MiniParticle />
        </div>

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 z-20 w-8 h-8 flex items-center justify-center rounded-full text-[#71717A] hover:text-[#F4F4F5] hover:bg-white/[0.06] transition-all duration-150"
        >
          <X size={15} />
        </button>

        {/* Content */}
        <div ref={contentRef} className="relative z-10 flex flex-col justify-center h-full px-10 py-12">
          {/* Brand mark */}
          <div className="flex items-center gap-2 mb-12">
            <svg width="18" height="18" viewBox="0 0 100 100" fill="none">
              <path d="M20 30 Q35 25,50 40 L50 85 Q35 70,20 75 Z" stroke="#F4F4F5" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" fill="rgba(255,255,255,0.04)"/>
              <path d="M80 30 Q65 25,50 40 L50 85 Q65 70,80 75 Z" stroke="#F4F4F5" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" fill="rgba(255,255,255,0.04)"/>
              <line x1="50" y1="40" x2="50" y2="85" stroke="#F4F4F5" strokeWidth="6" strokeLinecap="round"/>
            </svg>
            <span className="text-sm font-semibold text-[#F4F4F5] tracking-tight">NoteVault</span>
          </div>

          {/* Heading */}
          <div className="mb-8">
            <h2 className="text-[28px] font-medium text-[#F4F4F5] tracking-tight leading-tight">
              {mode === 'login' ? 'Welcome back.' : 'Create account.'}
            </h2>
            <p className="text-sm text-[#71717A] mt-2">
              {mode === 'login'
                ? 'Sign in to sync your notes and progress.'
                : 'Join NoteVault and start learning smarter.'}
            </p>
          </div>

          {/* Google Sign In */}
          <button
            onClick={handleGoogle}
            disabled={googleLoading}
            className="w-full flex items-center justify-center gap-3 py-3 rounded-full border border-white/[0.1] text-[#F4F4F5] text-sm font-medium hover:bg-white/[0.04] transition-all duration-150 mb-6 disabled:opacity-50"
          >
            {googleLoading ? (
              <div className="w-4 h-4 border-2 border-white/20 border-t-white/80 rounded-full animate-spin" />
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
            )}
            Continue with Google
          </button>

          {/* Divider */}
          <div className="flex items-center gap-4 mb-6">
            <div className="flex-1 h-[1px] bg-white/[0.06]" />
            <span className="text-[11px] text-[#71717A] uppercase tracking-widest">or</span>
            <div className="flex-1 h-[1px] bg-white/[0.06]" />
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {mode === 'signup' && (
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] text-[#71717A] uppercase tracking-widest">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  required
                  placeholder="John Doe"
                  className="w-full bg-transparent border-b border-white/[0.1] py-2.5 text-sm text-[#F4F4F5] placeholder-[#3f3f46] outline-none focus:border-white/30 transition-colors duration-150"
                />
              </div>
            )}

            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] text-[#71717A] uppercase tracking-widest">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                placeholder="you@example.com"
                className="w-full bg-transparent border-b border-white/[0.1] py-2.5 text-sm text-[#F4F4F5] placeholder-[#3f3f46] outline-none focus:border-white/30 transition-colors duration-150"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] text-[#71717A] uppercase tracking-widest">Password</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                minLength={6}
                className="w-full bg-transparent border-b border-white/[0.1] py-2.5 text-sm text-[#F4F4F5] placeholder-[#3f3f46] outline-none focus:border-white/30 transition-colors duration-150"
              />
            </div>

            {error && (
              <p className="text-xs text-red-400 py-2">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="mt-2 w-full flex items-center justify-center gap-2 py-3 rounded-full text-sm font-medium text-[#111111] bg-[#F4F4F5] hover:bg-white transition-colors duration-150 disabled:opacity-50"
              style={{ boxShadow: 'rgba(0,0,0,0.9) 0px 4px 8px 0px inset, rgba(255,255,255,0.08) 0px 1px 1px 0px' }}
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin" />
              ) : (
                <>
                  {mode === 'login' ? 'Sign In' : 'Create Account'}
                  <ArrowRight size={14} />
                </>
              )}
            </button>
          </form>

          {/* Switch mode */}
          <div className="mt-8 pt-8 border-t border-white/[0.04] text-center">
            <button
              onClick={switchMode}
              className="text-xs text-[#71717A] hover:text-[#F4F4F5] transition-colors duration-150"
            >
              {mode === 'login'
                ? "Don't have an account? Sign up →"
                : 'Already have an account? Sign in →'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

// ─── Firebase error messages ──────────────────────────────────────────────────
function getFirebaseError(code) {
  const map = {
    'auth/user-not-found':     'No account found with this email.',
    'auth/wrong-password':     'Incorrect password. Please try again.',
    'auth/email-already-in-use': 'This email is already registered. Sign in instead.',
    'auth/weak-password':      'Password must be at least 6 characters.',
    'auth/invalid-email':      'Please enter a valid email address.',
    'auth/invalid-credential': 'Invalid email or password.',
    'auth/too-many-requests':  'Too many attempts. Please wait a moment.',
    'auth/network-request-failed': 'Network error. Check your connection.',
  };
  return map[code] || 'Something went wrong. Please try again.';
}

export default AuthPanel;
