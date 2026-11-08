import React, { useState } from 'react';
import { RotateCcw, Lightbulb, Flag } from 'lucide-react';

interface GameControlsProps {
  canUndo: boolean;
  isBotThinking: boolean;
  onUndo: () => void;
  onHint: () => void;
  onResign: () => void;
}

export const GameControls: React.FC<GameControlsProps> = ({
  canUndo,
  isBotThinking,
  onUndo,
  onHint,
  onResign,
}) => {
  const [showResignConfirm, setShowResignConfirm] = useState(false);

  return (
    <div className="w-full max-w-[390px] sm:max-w-[420px] mx-auto select-none">
      {/* Resign confirmation sheet if clicked */}
      {showResignConfirm && (
        <div className="mb-2 p-2.5 bg-rose-950/90 border border-rose-800 rounded-xl flex items-center justify-between text-xs animate-in fade-in">
          <span className="text-rose-200 font-medium">Resign match?</span>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setShowResignConfirm(false)}
              className="px-2 py-1 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                setShowResignConfirm(false);
                onResign();
              }}
              className="px-2 py-1 font-bold rounded-lg bg-rose-600 text-white hover:bg-rose-500"
            >
              Confirm
            </button>
          </div>
        </div>
      )}

      {/* 3 Prominent Action Buttons matching Image 1: UNDO, HINT, RESIGN */}
      <div className="grid grid-cols-3 gap-2 sm:gap-2.5">
        <button
          disabled={!canUndo || isBotThinking}
          onClick={onUndo}
          className="flex flex-col items-center justify-center py-2.5 px-3 rounded-2xl bg-[#23272e] hover:bg-[#2c323b] active:scale-95 disabled:opacity-40 border border-[#2d323b] text-slate-200 font-bold text-xs tracking-wider transition-all shadow-sm"
          title="Undo Move"
          aria-label="Undo"
        >
          <RotateCcw className="w-4 h-4 mb-1 text-slate-300" />
          <span>UNDO</span>
        </button>

        <button
          disabled={isBotThinking}
          onClick={onHint}
          className="flex flex-col items-center justify-center py-2.5 px-3 rounded-2xl bg-[#23272e] hover:bg-[#2c323b] active:scale-95 disabled:opacity-40 border border-[#2d323b] text-slate-200 font-bold text-xs tracking-wider transition-all shadow-sm"
          title="Show Move Hint"
          aria-label="Hint"
        >
          <Lightbulb className="w-4 h-4 mb-1 text-slate-300" />
          <span>HINT</span>
        </button>

        <button
          disabled={isBotThinking}
          onClick={() => setShowResignConfirm(true)}
          className="flex flex-col items-center justify-center py-2.5 px-3 rounded-2xl bg-[#23272e] hover:bg-rose-950/40 active:scale-95 disabled:opacity-40 border border-[#2d323b] hover:border-rose-900 text-slate-200 hover:text-rose-300 font-bold text-xs tracking-wider transition-all shadow-sm"
          title="Resign Game"
          aria-label="Resign"
        >
          <Flag className="w-4 h-4 mb-1 text-slate-300" />
          <span>RESIGN</span>
        </button>
      </div>
    </div>
  );
};
