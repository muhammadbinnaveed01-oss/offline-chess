import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { GameOverState, PieceColor } from '../engine/types';
import { Trophy, Award, RotateCcw, Home, Eye } from 'lucide-react';

interface GameOverModalProps {
  gameOverState: GameOverState;
  humanPlayerColor: PieceColor;
  isBotMode: boolean;
  totalMoves: number;
  onRematch: () => void;
  onReviewBoard: () => void;
  onGoHome: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  gameOverState,
  humanPlayerColor,
  isBotMode,
  totalMoves,
  onRematch,
  onReviewBoard,
  onGoHome,
}) => {
  const isDraw = gameOverState.winner === 'draw';
  const playerWon = isBotMode
    ? gameOverState.winner === humanPlayerColor
    : gameOverState.winner !== null;

  useEffect(() => {
    if (playerWon && !isDraw) {
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#6366f1', '#eab308', '#10b981', '#38bdf8'],
        });
      } catch {}
    }
  }, [playerWon, isDraw]);

  const getTitle = () => {
    if (isDraw) return 'Game Drawn';
    if (isBotMode) {
      return playerWon ? 'Victory!' : 'Defeat';
    }
    return gameOverState.winner === 'w' ? 'White Wins!' : 'Black Wins!';
  };

  const getSubtitle = () => {
    switch (gameOverState.reason) {
      case 'checkmate':
        return 'Victory by Checkmate';
      case 'stalemate':
        return 'Stalemate — No legal moves';
      case 'timeout':
        return 'Won on time';
      case 'resignation':
        return 'Opponent resigned';
      case 'threefold-repetition':
        return 'Draw by Threefold Repetition';
      case 'insufficient-material':
        return 'Draw by Insufficient Material';
      case '50-move-rule':
        return 'Draw by 50-Move Rule';
      default:
        return 'Game Over';
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in"
      role="dialog"
      aria-modal="true"
      aria-label="Game Over Summary"
    >
      <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl text-center animate-in zoom-in-95">
        <div className="mx-auto w-16 h-16 rounded-2xl flex items-center justify-center mb-4 bg-gradient-to-tr from-indigo-500/20 to-purple-500/20 border border-indigo-500/30">
          {playerWon && !isDraw ? (
            <Trophy className="w-9 h-9 text-amber-400 animate-bounce" />
          ) : isDraw ? (
            <Award className="w-9 h-9 text-indigo-400" />
          ) : (
            <Award className="w-9 h-9 text-slate-400" />
          )}
        </div>

        <h2 className="text-2xl font-black text-slate-100 tracking-tight">{getTitle()}</h2>
        <p className="text-sm font-medium text-indigo-400 mt-1 mb-4">{getSubtitle()}</p>

        <p className="text-xs text-slate-400 bg-slate-950/60 p-3 rounded-xl border border-slate-800/80 mb-5 leading-relaxed">
          {gameOverState.description || 'The game has concluded.'}
        </p>

        <div className="flex items-center justify-around py-3 px-4 rounded-xl bg-slate-800/50 border border-slate-800 mb-6 text-xs text-slate-300">
          <div>
            <div className="text-slate-500 text-[10px] uppercase font-bold tracking-wider">Moves</div>
            <div className="text-base font-bold text-slate-100">{totalMoves}</div>
          </div>
          <div className="w-px h-7 bg-slate-700" />
          <div>
            <div className="text-slate-500 text-[10px] uppercase font-bold tracking-wider">Status</div>
            <div className="text-base font-bold text-slate-100 capitalize">
              {gameOverState.reason?.replace('-', ' ') || 'Finished'}
            </div>
          </div>
        </div>

        <div className="space-y-2.5">
          <button
            onClick={onRematch}
            className="w-full py-3 px-4 rounded-xl font-semibold text-sm bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 active:scale-98 transition-all"
          >
            <RotateCcw className="w-4 h-4" />
            Play Rematch
          </button>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={onReviewBoard}
              className="py-2.5 px-3 rounded-xl font-medium text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center justify-center gap-1.5 active:scale-98 transition-colors"
            >
              <Eye className="w-3.5 h-3.5" />
              Review Board
            </button>

            <button
              onClick={onGoHome}
              className="py-2.5 px-3 rounded-xl font-medium text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center justify-center gap-1.5 active:scale-98 transition-colors"
            >
              <Home className="w-3.5 h-3.5" />
              Main Menu
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
