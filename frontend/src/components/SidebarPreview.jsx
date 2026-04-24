import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Home, BookOpen, Search, Settings, User,
  Brain, Activity, Swords, Upload,
  FileText, Map, Zap, LogIn, LogOut, X,
  WifiOff, Cpu
} from 'lucide-react';
import gsap from 'gsap';
import { useAuth } from '../context/AuthContext';

// ─── Feature Groups ────────────────────────────────────────────────────────────
const NAV_GROUPS = [
  {
    label: 'Workspace',
    items: [
      { id: 'dashboard', label: 'Dashboard', icon: Home, route: '/dashboard', desc: 'Your study hub' },
    ],
  },
  {
    label: 'Library',
    items: [
      { id: 'notebooks', label: 'My Notebooks', icon: BookOpen, route: '/notebooks', desc: 'All uploaded notes' },
      { id: 'search', label: 'Search Library', icon: Search, route: '/search', desc: 'Find anything fast' },
    ],
  },
  {
    label: 'AI Tools',
    items: [
      { id: 'study', label: 'Study Buddy', icon: Zap, route: null, desc: 'Chat with your notes', action: 'study' },
      { id: 'cheatsheet', label: 'Cheat Sheets', icon: FileText, route: null, desc: 'AI-generated summaries', action: 'cheatsheet' },
      { id: 'offline', label: 'Offline AI', icon: Cpu, route: '/offline-ai', desc: 'Study without internet' },
    ],
  },
  {
    label: 'Assessment',
    items: [
      { id: 'testmode', label: 'Test Mode', icon: Brain, route: '/test/general', desc: 'Adaptive Quiz Generator' },
      { id: 'battle', label: 'Battle Mode', icon: Swords, route: '/battle', desc: 'Real-time 1v1 battles', badge: 'NEW' },
      { id: 'performance', label: 'Performance', icon: Activity, route: '/performance', desc: 'Track your progress' },
    ],
  },
];

// ─── Upload Modal ─────────────────────────────────────────────────────────────
const UploadModal = ({ onClose, onUploaded }) => {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef(null);

  const handleFile = async (file) => {
    if (!file) return;
    setUploading(true);
    const fd = new FormData();
    fd.append('file', file);
    fd.append('title', file.name);
    try {
      const res = await fetch('http://localhost:5000/api/notes/upload', { method: 'POST', body: fd });
      const data = await res.json();
      if (data.id || data.note) { onUploaded?.(); onClose(); }
      else alert('Upload failed: ' + (data.message || 'Unknown error'));
    } catch (e) {
      alert('Upload failed: ' + e.message);
    } finally {
      setUploading(false);
    }
  };

  const onDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#111111] border border-white/10 rounded-[32px] p-8 w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-semibold text-white text-base">Upload Note</h3>
          <button onClick={onClose} className="p-1.5 hover:bg-white/5 rounded-lg text-[#71717A] hover:text-white transition-colors">
            <X size={16} />
          </button>
        </div>

        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={onDrop}
          onClick={() => inputRef.current?.click()}
          className={`flex flex-col items-center justify-center gap-4 p-10 rounded-2xl border-2 border-dashed cursor-pointer transition-all ${dragOver ? 'border-white/40 bg-white/5' : 'border-white/[0.08] hover:border-white/20'}`}
        >
          <Upload size={28} className="text-[#71717A]" />
          <div className="text-center">
            <p className="text-sm font-medium text-[#F4F4F5]">Drop file here or click to browse</p>
            <p className="text-xs text-[#71717A] mt-1">PDF, DOCX, TXT supported</p>
          </div>
          <input ref={inputRef} type="file" className="hidden" accept=".pdf,.docx,.txt" onChange={(e) => handleFile(e.target.files[0])} />
        </div>

        {uploading && (
          <div className="flex items-center gap-3 mt-4 p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
            <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin shrink-0" />
            <span className="text-xs text-[#71717A]">Uploading and processing with AI...</span>
          </div>
        )}
      </div>
    </div>
  );
};

// ─── Sidebar ─────────────────────────────────────────────────────────────────
const SidebarPreview = ({ onUpload, onSignIn }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const sidebarRef = useRef(null);
  const [showUpload, setShowUpload] = useState(false);
  const [hoveredItem, setHoveredItem] = useState(null);
  const { user, signOut } = useAuth();

  const currentRoute = location.pathname;

  useEffect(() => {
    if (sidebarRef.current) {
      gsap.fromTo(
        sidebarRef.current.querySelectorAll('.nav-item'),
        { x: -10, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.5, stagger: 0.04, ease: 'power2.out', delay: 0.2 }
      );
    }
  }, []);

  const handleClick = (item) => {
    if (item.action === 'study') {
      // Navigate to last note or demo note
      navigate('/study/dummy-biology');
    } else if (item.action === 'cheatsheet') {
      navigate('/study/dummy-biology');
    } else if (item.action === 'graph') {
      navigate('/study/dummy-biology');
    } else if (item.route) {
      navigate(item.route);
    }
  };

  const isActive = (item) => {
    if (!item.route) return false;
    return currentRoute === item.route || currentRoute.startsWith(item.route.split(':')[0]);
  };

  return (
    <>
      {showUpload && (
        <UploadModal
          onClose={() => setShowUpload(false)}
          onUploaded={() => { onUpload?.(); navigate('/notebooks'); }}
        />
      )}

      <aside
        ref={sidebarRef}
        className="w-[220px] h-full hidden lg:flex flex-col border-r border-white/[0.04] bg-[#0a0a0a] z-20 shrink-0"
      >
        {/* Brand */}
        <div className="flex items-center gap-2.5 px-5 py-5 border-b border-white/[0.04]">
          <svg width="20" height="20" viewBox="0 0 100 100" fill="none">
            <path d="M20 30 Q35 25,50 40 L50 85 Q35 70,20 75 Z" stroke="#F4F4F5" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" fill="rgba(255,255,255,0.04)" />
            <path d="M80 30 Q65 25,50 40 L50 85 Q65 70,80 75 Z" stroke="#F4F4F5" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" fill="rgba(255,255,255,0.04)" />
            <line x1="50" y1="40" x2="50" y2="85" stroke="#F4F4F5" strokeWidth="5" strokeLinecap="round" />
          </svg>
          <span className="text-sm font-semibold text-white tracking-tight">NoteVault</span>
        </div>

        {/* Upload Quick Action */}
        <div className="px-3 pt-4 pb-2">
          <button
            onClick={() => setShowUpload(true)}
            className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-white/[0.05] border border-white/[0.08] text-[#F4F4F5] text-xs font-medium hover:bg-white/[0.09] transition-all duration-150"
          >
            <Upload size={13} className="text-[#71717A]" />
            Upload Note
          </button>
        </div>

        {/* Navigation Groups */}
        <nav className="flex-1 overflow-y-auto no-scrollbar px-3 py-2">
          {NAV_GROUPS.map((group) => (
            <div key={group.label} className="mb-5">
              <p className="text-[9px] font-semibold text-[#71717A]/60 uppercase tracking-[0.18em] px-2 mb-1.5">{group.label}</p>
              <div className="flex flex-col gap-0.5">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item);
                  return (
                    <div
                      key={item.id}
                      className="nav-item relative"
                      onMouseEnter={() => setHoveredItem(item.id)}
                      onMouseLeave={() => setHoveredItem(null)}
                    >
                      <button
                        onClick={() => handleClick(item)}
                        className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-left transition-all duration-150 group ${
                          active
                            ? 'bg-white/[0.07] text-white'
                            : 'text-[#71717A] hover:text-[#F4F4F5] hover:bg-white/[0.04]'
                        }`}
                      >
                        <Icon size={14} className={active ? 'text-white' : 'text-[#71717A] group-hover:text-[#F4F4F5]'} />
                        <span className="text-xs font-medium flex-1">{item.label}</span>
                        {item.badge && (
                          <span className="text-[8px] font-bold text-[#71717A] bg-white/[0.06] border border-white/[0.08] px-1.5 py-0.5 rounded-full uppercase tracking-wide">
                            {item.badge}
                          </span>
                        )}
                        {active && <div className="w-1 h-1 rounded-full bg-white/50" />}
                      </button>

                      {/* Tooltip on hover showing description */}
                      {hoveredItem === item.id && item.desc && (
                        <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 z-50 px-2.5 py-1.5 rounded-xl bg-[#1a1a1a] border border-white/[0.08] shadow-xl whitespace-nowrap pointer-events-none">
                          <p className="text-[11px] text-[#F4F4F5]">{item.desc}</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Footer / User */}
        <div className="px-3 py-4 border-t border-white/[0.04] flex flex-col gap-2">
          {user ? (
            /* Logged-in user */
            <>
              <div className="flex items-center gap-2.5 px-2 py-1.5">
                {user.photoURL ? (
                  <img src={user.photoURL} alt="avatar" className="w-7 h-7 rounded-full shrink-0" />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-[#1a1a1a] border border-white/[0.08] flex items-center justify-center shrink-0">
                    <User size={12} className="text-[#71717A]" />
                  </div>
                )}
                <div className="flex flex-col min-w-0 flex-1">
                  <span className="text-[11px] font-medium text-[#F4F4F5] truncate">
                    {user.displayName || user.email?.split('@')[0]}
                  </span>
                  <span className="text-[9px] text-[#71717A] truncate">{user.email}</span>
                </div>
                <button
                  onClick={signOut}
                  className="p-1 rounded-lg text-[#71717A] hover:text-[#F4F4F5] hover:bg-white/[0.06] transition-all"
                  title="Sign Out"
                >
                  <LogOut size={11} />
                </button>
              </div>
            </>
          ) : (
            /* Guest - show Sign In */
            <>
              <button
                onClick={() => onSignIn ? onSignIn() : null}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-[#71717A] hover:text-[#F4F4F5] hover:bg-white/[0.04] transition-all duration-150"
              >
                <LogIn size={13} />
                Sign In
              </button>
              <div className="flex items-center gap-2.5 px-2 py-1">
                <div className="w-7 h-7 rounded-full bg-[#1a1a1a] border border-white/[0.08] flex items-center justify-center shrink-0">
                  <User size={12} className="text-[#71717A]" />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-[11px] font-medium text-[#F4F4F5] truncate">Guest Account</span>
                  <span className="text-[9px] text-[#71717A]">Not signed in</span>
                </div>
              </div>
            </>
          )}
        </div>
      </aside>
    </>
  );
};

export default SidebarPreview;
