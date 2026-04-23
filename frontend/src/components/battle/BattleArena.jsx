import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Clock, CheckCircle, XCircle, Zap } from 'lucide-react';
import { socket } from '../../lib/socket';

const QUESTION_TIME = 30; // seconds per question
const POINTS_PER_CORRECT = 10;

const OPTION_LABELS = ['A', 'B', 'C', 'D'];

const BattleArena = ({
  questions,
  myUsername,
  opponentUsername,
  roomId,
  isAIMode,
  onBattleEnd,
}) => {
  const [currentQ, setCurrentQ] = useState(0);
  const [myScore, setMyScore] = useState(0);
  const [opponentScore, setOpponentScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [isLocked, setIsLocked] = useState(false);
  const [timeLeft, setTimeLeft] = useState(QUESTION_TIME);
  const [results, setResults] = useState([]); // per-question results
  const timerRef = useRef(null);
  const aiTimerRef = useRef(null);

  const question = questions[currentQ];

  // Simulate AI opponent answering
  const simulateAIAnswer = useCallback(() => {
    // AI answers after 5–20 seconds with ~55% accuracy
    const delay = 5000 + Math.random() * 15000;
    aiTimerRef.current = setTimeout(() => {
      const isCorrect = Math.random() > 0.45;
      if (isCorrect) {
        setOpponentScore((prev) => {
          const next = prev + POINTS_PER_CORRECT;
          return next;
        });
      }
    }, delay);
  }, []);

  // Move to next question or end battle
  const advance = useCallback(
    (answerGiven, wasCorrect) => {
      clearInterval(timerRef.current);
      clearTimeout(aiTimerRef.current);

      const result = {
        questionIndex: currentQ,
        question: question.question,
        selected: answerGiven,
        correct: question.correctAnswer,
        wasCorrect,
        explanation: question.explanation,
      };
      setResults((prev) => [...prev, result]);

      if (currentQ + 1 >= questions.length) {
        // Battle over
        setTimeout(() => {
          if (!isAIMode && roomId) {
            socket.emit('battle_end', { roomId });
          }
          onBattleEnd({
            myScore: myScore + (wasCorrect ? POINTS_PER_CORRECT : 0),
            opponentScore,
            results: [...results, result],
            myUsername,
            opponentUsername,
          });
        }, 1500);
      } else {
        setTimeout(() => {
          setCurrentQ((q) => q + 1);
          setSelectedAnswer(null);
          setIsLocked(false);
          setTimeLeft(QUESTION_TIME);
        }, 1500);
      }
    },
    [currentQ, myScore, opponentScore, question, questions.length, results, isAIMode, roomId, myUsername, opponentUsername, onBattleEnd]
  );

  // Answer selected
  const handleAnswer = (optionLabel) => {
    if (isLocked) return;
    setIsLocked(true);
    setSelectedAnswer(optionLabel);

    const wasCorrect = optionLabel === question.correctAnswer;
    if (wasCorrect) {
      const newScore = myScore + POINTS_PER_CORRECT;
      setMyScore(newScore);
      if (!isAIMode && roomId) {
        socket.emit('update_score', { roomId, score: newScore });
      }
    }
    advance(optionLabel, wasCorrect);
  };

  // Timer countdown
  useEffect(() => {
    setTimeLeft(QUESTION_TIME);
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timerRef.current);
          if (!isLocked) advance(null, false); // time out = wrong
          return 0;
        }
        return t - 1;
      });
    }, 1000);

    if (isAIMode) simulateAIAnswer();

    return () => {
      clearInterval(timerRef.current);
      clearTimeout(aiTimerRef.current);
    };
  }, [currentQ]);

  // Multiplayer score sync
  useEffect(() => {
    if (isAIMode) return;
    const handleScoreUpdate = ({ scores }) => {
      // Find opponent's score (not ours)
      const opScore = Object.entries(scores).find(([id]) => id !== socket.id)?.[1] ?? 0;
      setOpponentScore(opScore);
    };
    socket.on('score_update', handleScoreUpdate);
    return () => socket.off('score_update', handleScoreUpdate);
  }, [isAIMode]);

  const getOptionStyle = (label) => {
    if (!isLocked) {
      return 'border-white/10 text-slate-300 hover:border-white/40 hover:bg-white/[0.05] hover:text-white cursor-pointer';
    }
    if (label === question.correctAnswer) {
      return 'border-emerald-500/70 bg-emerald-500/10 text-emerald-300';
    }
    if (label === selectedAnswer && label !== question.correctAnswer) {
      return 'border-red-500/70 bg-red-500/10 text-red-300';
    }
    return 'border-white/5 text-slate-600 opacity-40';
  };

  const timerPct = (timeLeft / QUESTION_TIME) * 100;
  const timerColor = timeLeft > 10 ? 'bg-emerald-500' : timeLeft > 5 ? 'bg-yellow-500' : 'bg-red-500';

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col gap-6">
      {/* Scoreboard */}
      <div className="grid grid-cols-3 gap-4">
        {/* My Score */}
        <div className="flex flex-col items-center p-4 rounded-2xl bg-white/[0.04] border border-white/10">
          <span className="text-xs text-slate-400 mb-1 font-medium truncate max-w-full">{myUsername}</span>
          <span className="text-3xl font-black text-white">{myScore}</span>
          <span className="text-[10px] text-slate-500 mt-1">pts</span>
        </div>

        {/* VS + Timer */}
        <div className="flex flex-col items-center justify-center gap-2">
          <span className="text-xl font-black text-slate-400">VS</span>
          <div className={`flex items-center gap-1 text-sm font-bold px-3 py-1 rounded-full ${timeLeft <= 5 ? 'text-red-400 animate-pulse' : 'text-slate-300'}`}>
            <Clock size={14} />
            {timeLeft}s
          </div>
        </div>

        {/* Opponent Score */}
        <div className="flex flex-col items-center p-4 rounded-2xl bg-white/[0.04] border border-white/10">
          <span className="text-xs text-slate-400 mb-1 font-medium truncate max-w-full">{opponentUsername}</span>
          <span className="text-3xl font-black text-white">{opponentScore}</span>
          <span className="text-[10px] text-slate-500 mt-1">pts</span>
        </div>
      </div>

      {/* Timer Bar */}
      <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-1000 ease-linear ${timerColor}`}
          style={{ width: `${timerPct}%` }}
        />
      </div>

      {/* Question Card */}
      <div className="p-6 rounded-3xl bg-white/[0.03] border border-white/10">
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">
            Question {currentQ + 1} / {questions.length}
          </span>
          <span className="px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-[10px] text-slate-400 font-semibold uppercase">
            {POINTS_PER_CORRECT} pts
          </span>
        </div>
        <h3 className="text-lg font-semibold text-white leading-relaxed">{question?.question}</h3>
      </div>

      {/* Options */}
      <div className="grid grid-cols-1 gap-3">
        {question?.options?.map((opt, idx) => {
          const label = OPTION_LABELS[idx];
          const style = getOptionStyle(label);
          const isCorrect = isLocked && label === question.correctAnswer;
          const isWrong = isLocked && label === selectedAnswer && !isCorrect;

          return (
            <button
              key={idx}
              onClick={() => handleAnswer(label)}
              disabled={isLocked}
              className={`flex items-center gap-4 p-4 rounded-2xl border transition-all ${style}`}
            >
              <span className="w-8 h-8 rounded-xl border border-current flex items-center justify-center text-xs font-bold shrink-0">
                {label}
              </span>
              <span className="text-sm font-medium text-left flex-1">{opt}</span>
              {isCorrect && <CheckCircle size={18} className="text-emerald-400 shrink-0" />}
              {isWrong && <XCircle size={18} className="text-red-400 shrink-0" />}
            </button>
          );
        })}
      </div>

      {/* Explanation (shown after answering) */}
      {isLocked && question?.explanation && (
        <div className="flex items-start gap-3 p-4 rounded-2xl bg-white/[0.03] border border-white/10">
          <Zap size={16} className="text-yellow-400 shrink-0 mt-0.5" />
          <p className="text-sm text-slate-300">{question.explanation}</p>
        </div>
      )}
    </div>
  );
};

export default BattleArena;
