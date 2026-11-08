import React from 'react';
import { X, BookOpen, Shield, Crown, Swords } from 'lucide-react';

interface RulesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RulesModal: React.FC<RulesModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 select-none">
      <div
        className="fixed inset-0 bg-black/75 backdrop-blur-xs"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="relative w-full max-w-sm bg-[#1e2229] border border-slate-700/80 rounded-3xl p-5 shadow-2xl z-50 animate-in zoom-in-95 text-slate-100 max-h-[85vh] flex flex-col">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3 shrink-0">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-blue-400" />
            <h3 className="font-bold text-sm tracking-wide uppercase">Chess Rules & Guide</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto space-y-3.5 text-xs text-slate-300 pr-1">
          <div className="p-3 rounded-xl bg-[#252a33] border border-slate-800">
            <div className="font-bold text-slate-100 flex items-center gap-1.5 mb-1">
              <Crown className="w-3.5 h-3.5 text-amber-400" />
              <span>Objective: Checkmate</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Place the opponent's King under an inescapable attack (Checkmate) to win the game.
            </p>
          </div>

          <div className="p-3 rounded-xl bg-[#252a33] border border-slate-800">
            <div className="font-bold text-slate-100 flex items-center gap-1.5 mb-1">
              <Shield className="w-3.5 h-3.5 text-indigo-400" />
              <span>Special Moves</span>
            </div>
            <ul className="text-[11px] text-slate-400 space-y-1 list-disc list-inside">
              <li><strong>Castling:</strong> King moves 2 squares towards Rook.</li>
              <li><strong>En Passant:</strong> Capture a pawn that advanced two squares.</li>
              <li><strong>Promotion:</strong> Pawn reaching rank 8 promotes to Queen, Rook, Bishop, or Knight.</li>
            </ul>
          </div>

          <div className="p-3 rounded-xl bg-[#252a33] border border-slate-800">
            <div className="font-bold text-slate-100 flex items-center gap-1.5 mb-1">
              <Swords className="w-3.5 h-3.5 text-rose-400" />
              <span>Offline Bot Levels</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              <strong>Easy:</strong> Friendly beginner (~700 ELO).<br />
              <strong>Medium:</strong> Solid tactical depth (~1300 ELO).<br />
              <strong>Pro:</strong> Alpha-Beta pruning with Quiescence (~1800+ ELO).
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="mt-4 w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 font-bold text-xs uppercase tracking-wider text-white shrink-0"
        >
          Got it
        </button>
      </div>
    </div>
  );
};
