import React, { useState, useEffect, useRef } from 'react';
import { Send, Bot, User, Sparkles, Loader2 } from 'lucide-react';
import axios from 'axios';

const ChatPanel = ({ noteId, highlightedText }) => {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hi there! I am NoteVault AI. Selecting any text on the left will instantly explain it, or you can ask me questions about your notes directly.' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef(null);

  // Auto-fill when text is highlighted
  useEffect(() => {
    if (highlightedText && highlightedText.length > 5) {
      handleExplain(highlightedText);
    }
  }, [highlightedText]);

  // Scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleExplain = async (text) => {
    if (isLoading) return;
    setIsLoading(true);
    setMessages(prev => [...prev, { role: 'user', content: `Can you explain this part: "${text}"?` }]);

    try {
      const res = await axios.post('http://localhost:5000/api/explain', {
        noteId: noteId || 'default-note',
        selectedText: text
      });
      if (res.data.success) {
        setMessages(prev => [...prev, { role: 'assistant', content: res.data.explanation, provider: res.data.provider }]);
      } else {
        setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, I encountered an error explaining that.' }]);
      }
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Failed to connect to AI server.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input;
    setInput('');
    setIsLoading(true);
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);

    try {
      const res = await axios.post('http://localhost:5000/api/chat/ask', {
        noteId: noteId || 'default-note',
        question: userMessage
      });
      
      if (res.data.success) {
        setMessages(prev => [...prev, { role: 'assistant', content: res.data.answer, provider: res.data.provider }]);
      } else {
        setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, error from the server.' }]);
      }
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', content: 'I am unable to reach the backend service.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col cinematic-glass rounded-3xl overflow-hidden premium-surface relative">
      <div className="absolute inset-0 bg-gradient-to-b from-white/[0.02] to-transparent pointer-events-none" />
      
      <div className="h-16 flex items-center px-6 border-b border-white/[0.05] relative z-10 gap-3">
        <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center border border-white/20">
          <Sparkles size={14} className="text-white" />
        </div>
        <div>
          <h2 className="text-sm font-semibold tracking-wide text-white">Study Buddy</h2>
          <p className="text-[10px] text-slate-400 font-medium">Online • Reading Context</p>
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto no-scrollbar p-6 flex flex-col gap-6 scroll-smooth z-10">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex gap-4 max-w-[90%] ${msg.role === 'user' ? 'self-end bg-white/[0.04] p-4 rounded-2xl rounded-tr-sm border border-slate-700/30' : 'self-start'}`}>
            {msg.role === 'assistant' && (
              <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center border border-slate-700 flex-shrink-0 mt-1">
                <Bot size={16} className="text-white" />
              </div>
            )}
            <div className={`flex flex-col gap-1 ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500">
                {msg.role === 'user' ? 'You' : msg.provider ? `NoteVault AI (${msg.provider})` : 'NoteVault AI'}
              </span>
              <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">{msg.content}</p>
            </div>
            {msg.role === 'user' && (
              <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center border border-white/20 flex-shrink-0 mt-1">
                <User size={16} className="text-white" />
              </div>
            )}
          </div>
        ))}
        {isLoading && (
          <div className="flex gap-4 max-w-[90%] self-start opacity-70">
            <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center border border-slate-700 flex-shrink-0 mt-1">
              <Loader2 size={16} className="text-white animate-spin" />
            </div>
            <div className="flex items-center text-sm text-slate-400 p-2">
              Processing...
            </div>
          </div>
        )}
      </div>

      <div className="p-4 bg-black/20 border-t border-white/[0.05] z-10">
        <form onSubmit={handleSend} className="relative w-full input-wrapper">
          <input
             type="text"
             value={input}
             onChange={(e) => setInput(e.target.value)}
             placeholder="Ask a question about your notes..."
             className="mono-input-line pl-4 pr-12 text-sm py-4 h-auto"
          />
          <button 
             type="submit" 
             disabled={!input.trim() || isLoading}
             className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-white/[0.05] hover:bg-white/[0.1] text-slate-300 disabled:opacity-30 rounded-lg transition-colors border border-white/[0.05]"
          >
             <Send size={16} />
          </button>
          <div className="input-focus-line"></div>
        </form>
      </div>
    </div>
  );
};

export default ChatPanel;
