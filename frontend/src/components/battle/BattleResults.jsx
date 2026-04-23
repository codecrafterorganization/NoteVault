import React from 'react';
import { Trophy, Swords, RotateCcw, Home, CheckCircle, XCircle } from 'lucide-react';

const BattleResults = ({ myScore, opponentScore, myUsername, opponentUsername, results, onPlayAgain, onGoHome }) => {
  const myWon = myScore > opponentScore;
  const isDraw = myScore === opponentScore;
  const correct = results.filter((r) => r.wasCorrect).length;

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col gap-6 pb-8">
      {/* Winner Banner */}
      <div className={`flex flex-col items-center gap-4 p-8 rounded-3xl border ${
        isDraw
          ? 'bg-yellow-500/5 border-yellow-500/20'
          : myWon
          ? 'bg-emerald-500/5 border-emerald-500/20'
          : 'bg-red-500/5 border-red-500/20'
      }`}>
        <div className={`w-20 h-20 rounded-full flex items-center justify-center border-2 ${
          isDraw ? 'border-yellow-500/40 bg-yellow-500/10' : myWon ? 'border-emerald-500/40 bg-emerald-500/10' : 'border-red-500/40 bg-red-500/10'
        }`}>
          <Trophy size={36} className={isDraw ? 'text-yellow-400' : myWon ? 'text-emerald-400' : 'text-red-400'} />
        </div>

        <div className="text-center">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">
            {isDraw ? '⚖️ Draw!' : myWon ? '🏆 Victory!' : '💀 Defeat!'}
          </p>
          <h2 className="text-3xl font-black text-white">
            {isDraw ? "It's a Tie!" : myWon ? `${myUsername} Wins!` : `${opponentUsername} Wins!`}
          </h2>
          <p className="text-slate-400 text-sm mt-2">
            You answered {correct} / {results.length} questions correctly
          </p>
        </div>

        {/* Score Display */}
        <div className="grid grid-cols-3 gap-4 w-full mt-2">
          <div className={`flex flex-col items-center p-4 rounded-2xl ${myWon && !isDraw ? 'bg-emerald-500/10 border border-emerald-500/20' : 'bg-white/[0.03] border border-white/10'}`}>
            <span className="text-xs text-slate-400 mb-1 truncate max-w-full">{myUsername}</span>
            <span className="text-3xl font-black text-white">{myScore}</span>
            {myWon && !isDraw && <span className="text-[10px] text-emerald-400 font-bold mt-1">WINNER</span>}
          </div>
          <div className="flex items-center justify-center">
            <Swords size={24} className="text-slate-600" />
          </div>
          <div className={`flex flex-col items-center p-4 rounded-2xl ${!myWon && !isDraw ? 'bg-emerald-500/10 border border-emerald-500/20' : 'bg-white/[0.03] border border-white/10'}`}>
            <span className="text-xs text-slate-400 mb-1 truncate max-w-full">{opponentUsername}</span>
            <span className="text-3xl font-black text-white">{opponentScore}</span>
            {!myWon && !isDraw && <span className="text-[10px] text-emerald-400 font-bold mt-1">WINNER</span>}
          </div>
        </div>
      </div>

      {/* Question Breakdown */}
      <div className="flex flex-col gap-3">
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Question Breakdown</h3>
        {results.map((r, i) => (
          <div key={i} className={`flex items-start gap-4 p-4 rounded-2xl border ${r.wasCorrect ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-red-500/5 border-red-500/20'}`}>
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${r.wasCorrect ? 'bg-emerald-500/20' : 'bg-red-500/20'}`}>
              {r.wasCorrect
                ? <CheckCircle size={16} className="text-emerald-400" />
                : <XCircle size={16} className="text-red-400" />
              }
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-200 mb-1 line-clamp-2">Q{i + 1}: {r.question}</p>
              {!r.wasCorrect && (
                <p className="text-xs text-slate-500">
                  Your answer: <span className="text-red-400">{r.selected || 'Time out'}</span> • Correct: <span className="text-emerald-400">{r.correct}</span>
                </p>
              )}
              {r.explanation && (
                <p className="text-xs text-slate-500 mt-1 italic">{r.explanation}</p>
              )}
            </div>
            <span className={`text-sm font-bold shrink-0 ${r.wasCorrect ? 'text-emerald-400' : 'text-slate-600'}`}>
              {r.wasCorrect ? '+10' : '0'}
            </span>
          </div>
        ))}
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={onGoHome}
          className="flex items-center justify-center gap-2 py-3 rounded-2xl bg-white/[0.05] border border-white/10 text-slate-300 hover:text-white hover:bg-white/[0.1] transition-all font-semibold text-sm"
        >
          <Home size={16} />
          Dashboard
        </button>
        <button
          onClick={onPlayAgain}
          className="flex items-center justify-center gap-2 py-3 rounded-2xl bg-white text-black hover:bg-slate-200 transition-all font-bold text-sm"
        >
          <RotateCcw size={16} />
          Play Again
        </button>
      </div>
    </div>
  );
};

export default BattleResults;
