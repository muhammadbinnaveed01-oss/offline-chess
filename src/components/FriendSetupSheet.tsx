import React, { useState } from 'react';
import { PassAndPlaySubMode, TimeControl } from '../engine/types';
import { Users, RotateCw, Smartphone, Layers } from 'lucide-react';

interface FriendSetupSheetProps {
  isOpen: boolean;
  initialMode?: PassAndPlaySubMode;
  initialTime?: TimeControl;
  onStart: (mode: PassAndPlaySubMode, timer: TimeControl) => void;
  onClose: () => void;
}

export const FriendSetupSheet: React.FC<FriendSetupSheetProps> = ({
  isOpen,
  initialMode = 'auto-rotate',
  initialTime = 600,
  onStart,
  onClose,
}) => {
  const [mode, setMode] = useState<PassAndPlaySubMode>(initialMode);
  const [timer, setTimer] = useState<TimeControl>(initialTime);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center select-none">
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="relative w-full max-w-[420px] bg-[#1e2229] border-t border-[#2e3440] rounded-t-[32px] p-5 pb-7 shadow-2xl z-50 animate-in slide-in-from-bottom duration-250 text-slate-100">
        <div className="w-12 h-1 bg-slate-500/70 rounded-full mx-auto mb-4" />

        <div className="text-center mb-3">
          <span className="text-xs font-bold tracking-widest text-slate-400 uppercase">
            PLAY WITH FRIEND (LOCAL 2P)
          </span>
        </div>

        {/* Orientation Modes */}
        <div className="space-y-2 mb-4">
          {[
            {
              id: 'auto-rotate',
              label: 'AUTO-ROTATE (PASS & PLAY)',
              desc: 'Board rotates 180° automatically each turn',
              icon: <RotateCw className="w-4 h-4 text-emerald-400 shrink-0" />,
            },
            {
              id: 'tabletop',
              label: 'TABLETOP MODE (FACE-TO-FACE)',
              desc: 'Black pieces & clock inverted upside down',
              icon: <Smartphone className="w-4 h-4 text-blue-400 shrink-0" />,
            },
            {
              id: 'standard',
              label: 'STANDARD PERSPECTIVE',
              desc: 'Stationary board with White at bottom',
              icon: <Layers className="w-4 h-4 text-slate-400 shrink-0" />,
            },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setMode(item.id as PassAndPlaySubMode)}
              className={`w-full py-2.5 px-3.5 rounded-xl flex items-center gap-3 transition-all text-left ${
                mode === item.id
                  ? 'bg-[#293241] border border-blue-500/80 shadow-md ring-1 ring-blue-500/50'
                  : 'bg-[#252a33] hover:bg-[#2b313c] border border-transparent text-slate-300'
              }`}
            >
              {item.icon}
              <div className="min-w-0">
                <div className="font-bold text-xs tracking-wider uppercase text-slate-100">
                  {item.label}
                </div>
                <div className="text-[10px] text-slate-400 truncate">{item.desc}</div>
              </div>
            </button>
          ))}
        </div>

        {/* Timer */}
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

        <button
          onClick={() => onStart(mode, timer)}
          className="w-full py-3.5 rounded-xl font-bold text-sm uppercase tracking-widest bg-[#2b59a2] hover:bg-[#346bc4] text-white shadow-lg active:scale-98 transition-all"
        >
          START MATCH
        </button>
      </div>
    </div>
  );
};
