import React, { useState } from 'react';
import { MoveInfo } from '../engine/types';
import { X, Copy, Check } from 'lucide-react';

interface MoveHistoryDrawerProps {
  moves: MoveInfo[];
  isOpen: boolean;
  onClose: () => void;
}

export const MoveHistoryDrawer: React.FC<MoveHistoryDrawerProps> = ({
  moves,
  isOpen,
  onClose,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  // Group moves into pairs (White move, Black move)
  const movePairs: { num: number; white: string; black?: string }[] = [];
  for (let i = 0; i < moves.length; i += 2) {
    movePairs.push({
      num: Math.floor(i / 2) + 1,
      white: moves[i].san,
      black: moves[i + 1]?.san,
    });
  }

  // Generate PGN text
  const generatePgn = () => {
    return movePairs
      .map((pair) => `${pair.num}. ${pair.white}${pair.black ? ' ' + pair.black : ''}`)
      .join(' ');
  };

  const handleCopyPgn = () => {
    const pgn = generatePgn();
    navigator.clipboard.writeText(pgn);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in"
      role="dialog"
      aria-modal="true"
      aria-label="Move History and PGN"
    >
      <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-2xl flex flex-col max-h-[80vh] animate-in zoom-in-95">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
          <h3 className="text-base font-bold text-slate-100">Move History ({moves.length} plies)</h3>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
            aria-label="Close Move History"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Moves list */}
        <div className="flex-1 overflow-y-auto space-y-1 pr-1 font-mono text-xs">
          {movePairs.length === 0 ? (
            <div className="text-slate-500 text-center py-8">No moves played yet.</div>
          ) : (
            movePairs.map((pair) => (
              <div
                key={pair.num}
                className="grid grid-cols-6 py-1.5 px-2 rounded-lg hover:bg-slate-800/60 text-slate-300"
              >
                <span className="col-span-1 text-slate-500 font-bold">{pair.num}.</span>
                <span className="col-span-2 text-indigo-300 font-semibold">{pair.white}</span>
                <span className="col-span-3 text-slate-200">{pair.black || ''}</span>
              </div>
            ))
          )}
        </div>

        {/* Footer with Copy PGN */}
        <div className="pt-3 border-t border-slate-800 mt-3 flex items-center justify-between">
          <button
            onClick={handleCopyPgn}
            disabled={moves.length === 0}
            className="px-3 py-2 text-xs font-medium rounded-xl bg-slate-800 hover:bg-slate-700 text-indigo-300 border border-slate-700 flex items-center gap-1.5 disabled:opacity-40"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied PGN!' : 'Copy PGN'}</span>
          </button>

          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
