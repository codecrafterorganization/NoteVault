import React, { useState, useEffect, useRef } from 'react';
import { Users, Wifi, WifiOff, Swords, Bot, Trophy, Clock, X, Check } from 'lucide-react';
import { socket } from '../../lib/socket';

const BattleLobby = ({ username, onBattleStart, onAIChallenge }) => {
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [connected, setConnected] = useState(false);
  const [challenge, setChallenge] = useState(null); // incoming challenge popup
  const [pendingChallenge, setPendingChallenge] = useState(null); // challenge we sent
  const [questions, setQuestions] = useState([]);
  const declineTimer = useRef(null);

  // Fetch questions from backend
  const fetchQuestions = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/battle/questions');
      const data = await res.json();
      if (data.success) return data.questions;
    } catch (e) { /* fallback */ }
    return [];
  };

  useEffect(() => {
    // Connect socket
    socket.connect();

    socket.on('connect', () => {
      setConnected(true);
      socket.emit('join_lobby', { username });
    });

    socket.on('disconnect', () => setConnected(false));

    socket.on('lobby_update', (users) => {
      // Exclude ourselves from the list
      setOnlineUsers(users.filter(u => u.socketId !== socket.id));
    });

    socket.on('incoming_challenge', ({ challengerSocketId, challengerUsername }) => {
      setChallenge({ challengerSocketId, challengerUsername });
      // Auto-dismiss after 30s
      declineTimer.current = setTimeout(() => setChallenge(null), 30000);
    });

    socket.on('challenge_declined', ({ declinedBy }) => {
      setPendingChallenge(null);
      alert(`${declinedBy} declined your challenge.`);
    });

    socket.on('battle_start', ({ roomId, questions: q }) => {
      setChallenge(null);
      setPendingChallenge(null);
      onBattleStart({ roomId, questions: q, opponentUsername: pendingChallenge?.targetUsername || challenge?.challengerUsername });
    });

    return () => {
      clearTimeout(declineTimer.current);
      socket.off('connect');
      socket.off('disconnect');
      socket.off('lobby_update');
      socket.off('incoming_challenge');
      socket.off('challenge_declined');
      socket.off('battle_start');
      socket.disconnect();
    };
  }, [username]);

  const handleChallenge = async (targetUser) => {
    const q = await fetchQuestions();
    setQuestions(q);
    setPendingChallenge({ targetSocketId: targetUser.socketId, targetUsername: targetUser.username });
    socket.emit('send_challenge', { targetSocketId: targetUser.socketId });
  };

  const handleAccept = async () => {
    clearTimeout(declineTimer.current);
    const q = questions.length > 0 ? questions : await fetchQuestions();
    socket.emit('accept_challenge', { challengerSocketId: challenge.challengerSocketId, questions: q });
    setChallenge(null);
  };

  const handleDecline = () => {
    clearTimeout(declineTimer.current);
    socket.emit('decline_challenge', { challengerSocketId: challenge.challengerSocketId });
    setChallenge(null);
  };

  const handleAIChallenge = async () => {
    const q = await fetchQuestions();
    onAIChallenge(q);
  };

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center">
            <Swords size={20} className="text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Battle Lobby</h2>
            <p className="text-xs text-slate-400">Playing as <span className="text-white font-semibold">{username}</span></p>
          </div>
        </div>
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border ${connected ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-red-500/10 border-red-500/30 text-red-400'}`}>
          {connected ? <Wifi size={12} /> : <WifiOff size={12} />}
          {connected ? 'Online' : 'Connecting...'}
        </div>
      </div>

      {/* AI Challenge Card */}
      <button
        onClick={handleAIChallenge}
        className="group w-full p-5 rounded-2xl bg-gradient-to-r from-slate-800 to-slate-700 border border-white/10 hover:border-white/30 transition-all hover:scale-[1.01] text-left relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-white/[0.02] to-transparent group-hover:from-white/[0.05] transition-all" />
        <div className="flex items-center gap-4 relative z-10">
          <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center shrink-0">
            <Bot size={24} className="text-white" />
          </div>
          <div>
            <h3 className="font-bold text-white text-base">⚡ AI Challenge</h3>
            <p className="text-sm text-slate-400 mt-0.5">Play instantly against AI • No friends needed • 5 questions</p>
          </div>
          <div className="ml-auto px-3 py-1 rounded-full bg-white text-black text-xs font-bold shrink-0">
            PLAY NOW
          </div>
        </div>
      </button>

      {/* Online Players */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-widest">
          <Users size={12} />
          Online Players ({onlineUsers.length})
        </div>

        {onlineUsers.length === 0 ? (
          <div className="text-center py-10 border border-dashed border-slate-700/50 rounded-2xl">
            <Trophy size={32} className="text-slate-600 mx-auto mb-3" />
            <p className="text-slate-500 text-sm">No other players online yet.</p>
            <p className="text-slate-600 text-xs mt-1">Open this in another tab to test multiplayer!</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {onlineUsers.map((user) => (
              <div key={user.socketId} className="flex items-center gap-4 p-4 rounded-2xl bg-white/[0.03] border border-white/[0.08] hover:border-white/20 transition-all">
                <div className="relative">
                  <div className="w-10 h-10 rounded-full bg-slate-700 border border-slate-600 flex items-center justify-center text-sm font-bold text-white">
                    {user.username[0].toUpperCase()}
                  </div>
                  <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-400 border-2 border-[#0A0D14]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-white text-sm truncate">{user.username}</p>
                  <p className="text-xs text-slate-500">Ready to battle</p>
                </div>
                {pendingChallenge?.targetSocketId === user.socketId ? (
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-xs font-semibold">
                    <Clock size={12} className="animate-spin" />
                    Waiting...
                  </div>
                ) : (
                  <button
                    onClick={() => handleChallenge(user)}
                    disabled={!!pendingChallenge}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white text-black text-xs font-bold hover:bg-slate-200 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <Swords size={12} />
                    Challenge
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Incoming Challenge Popup */}
      {challenge && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-[#0f1320] border border-white/20 rounded-3xl p-8 max-w-sm w-full mx-4 shadow-2xl">
            <div className="flex flex-col items-center text-center gap-6">
              <div className="w-16 h-16 rounded-full bg-white/10 border-2 border-white/20 flex items-center justify-center">
                <Swords size={28} className="text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Battle Challenge!</h3>
                <p className="text-slate-400 mt-2">
                  <span className="text-white font-semibold">{challenge.challengerUsername}</span> is challenging you to a 5-question quiz battle!
                </p>
                <p className="text-xs text-slate-600 mt-2">30 seconds per question • First to answer wins points</p>
              </div>
              <div className="flex gap-3 w-full">
                <button
                  onClick={handleDecline}
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 font-semibold transition-all"
                >
                  <X size={16} />
                  Decline
                </button>
                <button
                  onClick={handleAccept}
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-white text-black hover:bg-slate-200 font-bold transition-all"
                >
                  <Check size={16} />
                  Accept!
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BattleLobby;
