import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Swords, ArrowLeft } from 'lucide-react';
import SidebarPreview from '../components/SidebarPreview';
import BattleLobby from '../components/battle/BattleLobby';
import BattleArena from '../components/battle/BattleArena';
import BattleResults from '../components/battle/BattleResults';

// Views: 'username' | 'lobby' | 'arena' | 'results'
const BattleMode = () => {
  const navigate = useNavigate();
  const [view, setView] = useState('username');
  const [username, setUsername] = useState('');
  const [usernameInput, setUsernameInput] = useState('');
  const [battleState, setBattleState] = useState(null);
  const [resultsState, setResultsState] = useState(null);

  const handleJoinLobby = (e) => {
    e.preventDefault();
    if (!usernameInput.trim()) return;
    setUsername(usernameInput.trim());
    setView('lobby');
  };

  const handleBattleStart = ({ roomId, questions, opponentUsername }) => {
    setBattleState({ roomId, questions, opponentUsername, isAIMode: false });
    setView('arena');
  };

  const handleAIChallenge = (questions) => {
    setBattleState({ roomId: null, questions, opponentUsername: 'Gemini AI', isAIMode: true });
    setView('arena');
  };

  const handleBattleEnd = (results) => {
    setResultsState(results);
    setView('results');
  };

  const handlePlayAgain = () => {
    setBattleState(null);
    setResultsState(null);
    setView('lobby');
  };

  return (
    <div className="relative w-full min-h-screen bg-transparent text-slate-100 flex">
      <SidebarPreview onSignIn={() => {}} />

      <main className="flex-1 flex flex-col h-screen overflow-y-auto bg-transparent p-6 gap-6">
        {/* Header */}
        <header className="flex items-center gap-4 h-14 shrink-0">
          {view !== 'lobby' && view !== 'username' && (
            <button
              onClick={() => { setBattleState(null); setView('lobby'); }}
              className="p-2 rounded-xl hover:bg-white/5 text-slate-400 hover:text-white transition-all"
            >
              <ArrowLeft size={18} />
            </button>
          )}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center">
              <Swords size={18} className="text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white">Battle Mode</h1>
              <p className="text-xs text-slate-500">
                {view === 'username' && 'Set your battle name'}
                {view === 'lobby' && 'Find an opponent'}
                {view === 'arena' && '⚔️ Battle in progress'}
                {view === 'results' && 'Battle complete'}
              </p>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 flex items-start justify-center">
          {/* Username Entry */}
          {view === 'username' && (
            <div className="w-full max-w-md">
              <div className="p-8 rounded-3xl bg-white/[0.03] border border-white/10">
                <div className="flex flex-col items-center gap-6 text-center">
                  <div className="w-20 h-20 rounded-3xl bg-white/5 border-2 border-white/10 flex items-center justify-center">
                    <Swords size={36} className="text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-white">Enter Battle</h2>
                    <p className="text-slate-400 text-sm mt-2">Choose your battle name to compete with others in real-time quiz battles!</p>
                  </div>
                  <form onSubmit={handleJoinLobby} className="w-full flex flex-col gap-4">
                    <input
                      type="text"
                      value={usernameInput}
                      onChange={(e) => setUsernameInput(e.target.value)}
                      placeholder="Your battle name..."
                      maxLength={20}
                      autoFocus
                      className="w-full px-4 py-3 rounded-2xl bg-white/[0.05] border border-white/10 text-white placeholder-slate-600 outline-none focus:border-white/30 transition-all text-center font-bold text-lg"
                    />
                    <button
                      type="submit"
                      disabled={!usernameInput.trim()}
                      className="w-full py-3 rounded-2xl bg-white text-black font-bold text-base hover:bg-slate-200 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      <Swords size={18} />
                      Enter Battle Arena
                    </button>
                  </form>
                  <p className="text-xs text-slate-600">You can challenge real players or fight the AI</p>
                </div>
              </div>
            </div>
          )}

          {/* Lobby */}
          {view === 'lobby' && (
            <BattleLobby
              username={username}
              onBattleStart={handleBattleStart}
              onAIChallenge={handleAIChallenge}
            />
          )}

          {/* Arena */}
          {view === 'arena' && battleState && (
            <BattleArena
              questions={battleState.questions}
              myUsername={username}
              opponentUsername={battleState.opponentUsername}
              roomId={battleState.roomId}
              isAIMode={battleState.isAIMode}
              onBattleEnd={handleBattleEnd}
            />
          )}

          {/* Results */}
          {view === 'results' && resultsState && (
            <BattleResults
              {...resultsState}
              onPlayAgain={handlePlayAgain}
              onGoHome={() => navigate('/dashboard')}
            />
          )}
        </div>
      </main>
    </div>
  );
};

export default BattleMode;

