import React from 'react';
import { PieceColor, PieceType } from '../engine/types';
import { ChessPiece } from './ChessPiece';

interface PromotionModalProps {
  color: PieceColor;
  onSelectPiece: (piece: PieceType) => void;
  onCancel: () => void;
}

export const PromotionModal: React.FC<PromotionModalProps> = ({
  color,
  onSelectPiece,
  onCancel,
}) => {
  const pieces: { type: PieceType; label: string }[] = [
    { type: 'q', label: 'Queen' },
    { type: 'r', label: 'Rook' },
    { type: 'b', label: 'Bishop' },
    { type: 'n', label: 'Knight' },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in"
      role="dialog"
      aria-modal="true"
      aria-label="Promote Pawn"
    >
      <div className="w-full max-w-xs bg-slate-900 border border-slate-700/80 rounded-2xl p-5 shadow-2xl text-center animate-in zoom-in-95">
        <h3 className="text-base font-bold text-slate-100 mb-1">Pawn Promotion</h3>
        <p className="text-xs text-slate-400 mb-4">Select a piece to promote your pawn:</p>

        <div className="grid grid-cols-4 gap-2 mb-4">
          {pieces.map((item) => (
            <button
              key={item.type}
              onClick={() => onSelectPiece(item.type)}
              className="group flex flex-col items-center justify-center p-2 rounded-xl bg-slate-800/80 hover:bg-indigo-600/30 border border-slate-700 hover:border-indigo-500 transition-all active:scale-95"
              aria-label={`Promote to ${item.label}`}
            >
              <div className="w-12 h-12 flex items-center justify-center group-hover:scale-110 transition-transform">
                <ChessPiece type={item.type} color={color} />
              </div>
              <span className="text-[11px] font-medium text-slate-300 group-hover:text-indigo-300 mt-1">
                {item.label}
              </span>
            </button>
          ))}
        </div>

        <button
          onClick={onCancel}
          className="w-full py-2 text-xs font-medium text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-800 transition-colors"
        >
          Cancel Move
        </button>
      </div>
    </div>
  );
};
