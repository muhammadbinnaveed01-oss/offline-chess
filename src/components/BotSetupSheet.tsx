import React, { useState } from 'react';
import { BotDifficulty, PieceColor, PlayerColorChoice, TimeControl } from '../engine/types';
import { ChessPiece } from './ChessPiece';

interface BotSetupSheetProps {
  isOpen: boolean;
  initialDifficulty?: BotDifficulty;
  initialColor?: PlayerColorChoice;
  initialTime?: TimeControl;
  onStart: (difficulty: BotDifficulty, color: PieceColor, timer: TimeControl) => void;
  onClose: () => void;
}

export const BotSetupSheet: React.FC<BotSetupSheetProps> = ({
  isOpen,
  initialDifficulty = 'medium',
  initialColor = 'random',
  initialTime = 600,
  onStart,
  onClose,
}) => {
  const [difficulty, setDifficulty] = useState<BotDifficulty>(initialDifficulty);
  const [colorChoice, setColorChoice] = useState<PlayerColorChoice>(initialColor);
  const [timer, setTimer] = useState<TimeControl>(initialTime);

  if (!isOpen) return null;

  const handleStartGame = () => {
    let resolvedColor: PieceColor = 'w';
    if (colorChoice === 'random') {
      resolvedColor = Math.random() < 0.5 ? 'w' : 'b';
    } else {
      resolvedColor = colorChoice;
    }
    onStart(difficulty, resolvedColor, timer);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center select-none">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Bottom Sheet Card matching Image 3 */}
      <div className="relative w-full max-w-[420px] bg-[#1e2229] border-t border-[#2e3440] rounded-t-[32px] p-5 pb-7 shadow-2xl z-50 animate-in slide-in-from-bottom duration-250 text-slate-100">
        {/* Top Drag Handle matching Image 3 */}
        <div className="w-12 h-1 bg-slate-500/70 rounded-full mx-auto mb-4" />

        {/* 1. Bot Difficulty Cards */}
        <div className="space-y-2 mb-4">
          {[
            { id: 'easy', label: 'EASY', dot: 'bg-emerald-400' },
            { id: 'medium', label: 'MEDIUM', dot: 'bg-amber-400' },
            { id: 'pro', label: 'PRO', dot: 'bg-rose-500' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setDifficulty(item.id as BotDifficulty)}
              className={`w-full py-2.5 px-4 rounded-xl flex items-center gap-3 transition-all ${
                difficulty === item.id
                  ? 'bg-[#293241] border border-blue-500/80 shadow-md ring-1 ring-blue-500/50'
                  : 'bg-[#252a33] hover:bg-[#2b313c] border border-transparent text-slate-300'
              }`}
            >
              <span className={`w-2.5 h-2.5 rounded-full ${item.dot} shrink-0`} />
              <span className="font-bold text-xs tracking-wider uppercase text-slate-100">
                {item.label}
              </span>
            </button>
          ))}
        </div>

        {/* 2. PLAY AS Section matching Image 3 */}
        <div className="text-center mb-4">
          <span className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2">
            PLAY AS
          </span>
          <div className="grid grid-cols-3 gap-2">
            {/* White */}
            <button
              onClick={() => setColorChoice('w')}
              className={`h-11 rounded-xl flex items-center justify-center transition-all ${
                colorChoice === 'w'
                  ? 'bg-[#293241] border border-blue-500/80 ring-1 ring-blue-500/50'
                  : 'bg-[#252a33] hover:bg-[#2b313c] border border-transparent'
              }`}
              title="Play as White"
            >
              <div className="w-6 h-6">
                <ChessPiece type="p" color="w" />
              </div>
            </button>

            {/* Random / Split White & Black */}
            <button
              onClick={() => setColorChoice('random')}
              className={`h-11 rounded-xl flex items-center justify-center transition-all ${
                colorChoice === 'random'
                  ? 'bg-[#293241] border border-blue-500/80 ring-1 ring-blue-500/50'
                  : 'bg-[#252a33] hover:bg-[#2b313c] border border-transparent'
              }`}
              title="Play as Random Color"
            >
              <div className="relative w-6 h-6 flex">
                <div className="w-3 h-6 overflow-hidden">
                  <div className="w-6 h-6">
                    <ChessPiece type="p" color="w" />
                  </div>
                </div>
                <div className="w-3 h-6 overflow-hidden -ml-3">
                  <div className="w-6 h-6 -ml-3">
                    <ChessPiece type="p" color="b" />
                  </div>
                </div>
              </div>
            </button>

            {/* Black */}
            <button
              onClick={() => setColorChoice('b')}
              className={`h-11 rounded-xl flex items-center justify-center transition-all ${
                colorChoice === 'b'
                  ? 'bg-[#293241] border border-blue-500/80 ring-1 ring-blue-500/50'
                  : 'bg-[#252a33] hover:bg-[#2b313c] border border-transparent'
              }`}
              title="Play as Black"
            >
              <div className="w-6 h-6">
                <ChessPiece type="p" color="b" />
              </div>
            </button>
          </div>
        </div>

        {/* 3. TIMER Section matching Image 3 (∞, 5m, 10m, 30m) */}
        <div className="text-center mb-5">
          <span className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2">
            TIMER
          </span>
          <div className="grid grid-cols-4 gap-2">
            {[
              { val: 0, label: '∞' },
              { val: 300, label: '5m' },
              { val: 600, label: '10m' },
              { val: 1800, label: '30m' },
            ].map((t) => (
              <button
                key={t.val}
                onClick={() => setTimer(t.val as TimeControl)}
                className={`py-2 rounded-xl text-xs font-bold font-mono transition-all ${
                  timer === t.val
                    ? 'bg-[#293241] border border-blue-500/80 text-blue-400 ring-1 ring-blue-500/50'
                    : 'bg-[#252a33] hover:bg-[#2b313c] border border-transparent text-slate-300'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* 4. Primary Blue START Button matching Image 3 */}
        <button
          onClick={handleStartGame}
          className="w-full py-3.5 rounded-xl font-bold text-sm uppercase tracking-widest bg-[#2b59a2] hover:bg-[#346bc4] text-white shadow-lg active:scale-98 transition-all"
        >
          START
        </button>
      </div>
    </div>
  );
};
