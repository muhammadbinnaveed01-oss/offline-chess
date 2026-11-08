import React from 'react';
import { BotDifficulty, PieceColor, PieceType } from '../engine/types';
import { ChessPiece } from './ChessPiece';
import { Bot, User, Users } from 'lucide-react';

interface GameHeaderProps {
  playerColor: PieceColor; // 'w' or 'b'
  isCurrentTurn: boolean;
  timeRemaining: number; // in seconds
  hasTimer: boolean;
  isBot: boolean;
  botDifficulty?: BotDifficulty;
  isThinking?: boolean;
  capturedPieces: PieceType[];
  materialAdvantage: number; // >0 if this player is ahead
  isFlipped?: boolean; // For tabletop mode upside down header
  customName?: string;
}

export const GameHeader: React.FC<GameHeaderProps> = ({
  playerColor,
  isCurrentTurn,
  timeRemaining,
  hasTimer,
  isBot,
  botDifficulty = 'pro',
  isThinking = false,
  capturedPieces,
  materialAdvantage,
  isFlipped = false,
  customName,
}) => {
  const isWhite = playerColor === 'w';

  // Format seconds into MM:SS (e.g. 08:42)
  const formatTime = (secs: number) => {
    if (secs <= 0) return '00:00';
    const mins = Math.floor(secs / 60);
    const remSecs = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remSecs.toString().padStart(2, '0')}`;
  };

  const difficultyLabel = {
    easy: 'BOT (EASY)',
    medium: 'BOT (MED)',
    pro: 'BOT (PRO)',
  }[botDifficulty];

  const pieceOppositeColor: PieceColor = isWhite ? 'b' : 'w';

  return (
    <div
      className={`w-full max-w-[390px] sm:max-w-[420px] mx-auto px-3.5 py-2.5 rounded-2xl bg-[#23272e] border border-[#2d323b] shadow-md transition-all select-none ${
        isCurrentTurn ? 'ring-1 ring-blue-500/50 shadow-blue-500/5' : 'opacity-95'
      } ${isFlipped ? 'rotate-180 transform' : ''}`}
    >
      <div className="flex items-center justify-between">
        {/* Left: Avatar & Name */}
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-[#2d323b] border border-[#3b424e] flex items-center justify-center shrink-0 text-slate-300">
            {isBot ? (
              <span className="text-xl">🤖</span>
            ) : (
              <User className="w-5 h-5 text-slate-300" />
            )}
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-sm tracking-wide text-slate-100 uppercase truncate">
                {isBot ? difficultyLabel : customName ? customName : isWhite ? 'PLAYER (WHITE)' : 'PLAYER (BLACK)'}
              </span>
              {/* Active Red Dot matching Image 1 */}
              {isCurrentTurn && (
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse shrink-0" />
              )}
            </div>

            {/* Material Advantage / Score under name matching Image 1: 👥 +3 */}
            <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-0.5 font-medium">
              <Users className="w-3.5 h-3.5 opacity-70" />
              <span>{materialAdvantage > 0 ? `+${materialAdvantage}` : '0'}</span>
              {isThinking && (
                <span className="text-[10px] text-blue-400 font-semibold animate-pulse ml-1">
                  • thinking...
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Right: Countdown Timer & Captured pieces below it matching Image 1 */}
        <div className="flex flex-col items-end shrink-0">
          {hasTimer ? (
            <span className="text-base sm:text-lg font-mono font-bold tracking-tight text-slate-100">
              {formatTime(timeRemaining)}
            </span>
          ) : (
            <span className="text-sm font-mono text-slate-400">∞</span>
          )}

          {/* Captured Pieces Tray directly below timer matching Image 1 */}
          <div className="flex items-center -space-x-1 mt-1 h-4 overflow-hidden">
            {capturedPieces.slice(0, 8).map((pt, idx) => (
              <div key={idx} className="w-4 h-4 shrink-0 drop-shadow-sm">
                <ChessPiece type={pt} color={pieceOppositeColor} />
              </div>
            ))}
            {capturedPieces.length > 8 && (
              <span className="text-[10px] text-slate-400 font-mono pl-1">
                +{capturedPieces.length - 8}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
