import React, { useState, useMemo, useCallback } from 'react';
import { PieceColor, PieceType, Square } from '../engine/types';
import { ChessPiece } from './ChessPiece';

interface ChessBoardProps {
  board: ({ type: PieceType; color: PieceColor } | null)[][];
  orientation: PieceColor; // 'w' = White at bottom, 'b' = Black at bottom
  selectedSquare: Square | null;
  legalMoves: { to: Square; captured: boolean; isPromotion: boolean }[];
  lastMove: { from: Square; to: Square } | null;
  checkSquare: Square | null;
  hintMove: { from: Square; to: Square } | null;
  isTabletopMode?: boolean; // If true, Black pieces at top are flipped 180°
  theme?: 'classic-blue' | 'midnight' | 'emerald' | 'wood' | 'slate';
  pieceDesign?: 'flat' | 'classic' | 'modern';
  showCoordinates?: boolean;
  onSquareClick: (square: Square) => void;
  onPieceDrop: (from: Square, to: Square) => void;
}

const FILES = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
const RANKS = ['8', '7', '6', '5', '4', '3', '2', '1'];

/**
 * High-performance, hardware-accelerated ChessBoard component.
 * Memoized to prevent re-rendering when parent timers tick.
 * Optimized for low-end mobile with direct touch handling and fast lookups.
 */
export const ChessBoard: React.FC<ChessBoardProps> = React.memo(({
  board,
  orientation,
  selectedSquare,
  legalMoves,
  lastMove,
  checkSquare,
  hintMove,
  isTabletopMode = false,
  theme = 'classic-blue',
  pieceDesign = 'classic',
  showCoordinates = true,
  onSquareClick,
  onPieceDrop,
}) => {
  const [draggedSquare, setDraggedSquare] = useState<Square | null>(null);

  // Exact theme definitions matching the reference images
  const themeColors = useMemo(() => {
    switch (theme) {
      case 'midnight':
        return {
          light: 'bg-slate-700/60 text-slate-400',
          dark: 'bg-slate-900/90 text-slate-500',
          border: 'border-slate-800',
        };
      case 'emerald':
        return {
          light: 'bg-[#d8f3dc] text-[#2d6a4f]',
          dark: 'bg-[#2d6a4f] text-[#b7e4c7]',
          border: 'border-[#1b4332]',
        };
      case 'wood':
        return {
          light: 'bg-[#f0d9b5] text-[#b58863]',
          dark: 'bg-[#b58863] text-[#f0d9b5]',
          border: 'border-[#8c6239]',
        };
      case 'slate':
        return {
          light: 'bg-zinc-300 text-zinc-600',
          dark: 'bg-zinc-700 text-zinc-400',
          border: 'border-zinc-800',
        };
      case 'classic-blue':
      default:
        return {
          light: 'bg-[#dee3e6] text-[#7085a8]',
          dark: 'bg-[#7085a8] text-[#dee3e6]',
          border: 'border-[#516485]',
        };
    }
  }, [theme]);

  const displayedFiles = useMemo(() => (orientation === 'w' ? FILES : [...FILES].reverse()), [orientation]);
  const displayedRanks = useMemo(() => (orientation === 'w' ? RANKS : [...RANKS].reverse()), [orientation]);

  // Fast O(1) target lookup using a Map
  const legalTargetsMap = useMemo(() => {
    const map = new Map<Square, { captured: boolean; isPromotion: boolean }>();
    for (let i = 0; i < legalMoves.length; i++) {
      map.set(legalMoves[i].to, legalMoves[i]);
    }
    return map;
  }, [legalMoves]);

  const handleDragStart = useCallback((e: React.DragEvent, square: Square) => {
    setDraggedSquare(square);
    e.dataTransfer.setData('text/plain', square);
    e.dataTransfer.effectAllowed = 'move';
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }, []);

  const handleDrop = useCallback((e: React.DragEvent, targetSquare: Square) => {
    e.preventDefault();
    const sourceSquare = (e.dataTransfer.getData('text/plain') as Square) || draggedSquare;
    setDraggedSquare(null);
    if (sourceSquare && sourceSquare !== targetSquare) {
      onPieceDrop(sourceSquare, targetSquare);
    }
  }, [draggedSquare, onPieceDrop]);

  // Compute square coordinates (0-7 col, 0-7 row) for SVG arrow overlay
  const getSquareCenter = useCallback((sq: Square) => {
    const file = sq[0];
    const rank = sq[1];
    let col = file.charCodeAt(0) - 97;
    let row = 8 - parseInt(rank, 10);
    if (orientation === 'b') {
      col = 7 - col;
      row = 7 - row;
    }
    return {
      x: (col + 0.5) * 12.5,
      y: (row + 0.5) * 12.5,
    };
  }, [orientation]);

  const arrowCoords = useMemo(() => {
    if (!lastMove) return null;
    return {
      from: getSquareCenter(lastMove.from),
      to: getSquareCenter(lastMove.to),
    };
  }, [lastMove, getSquareCenter]);

  return (
    <div
      className={`relative w-full aspect-square max-w-[390px] sm:max-w-[420px] mx-auto rounded-lg overflow-hidden shadow-2xl border-2 ${themeColors.border} select-none touch-manipulation transform-gpu`}
      role="grid"
      aria-label="Interactive Chessboard"
    >
      <div className="grid grid-cols-8 grid-rows-8 w-full h-full relative">
        {displayedRanks.map((rank, rowIdx) => {
          return displayedFiles.map((file, colIdx) => {
            const square = `${file}${rank}` as Square;
            const fileIdx = file.charCodeAt(0) - 97;
            const rankIdx = 8 - parseInt(rank, 10);
            const piece = board[rankIdx]?.[fileIdx];

            const isLight = (fileIdx + rankIdx) % 2 !== 0;
            const isSelected = selectedSquare === square;
            const isLegalTarget = legalTargetsMap.has(square);
            const isLastMoveFrom = lastMove?.from === square;
            const isLastMoveTo = lastMove?.to === square;
            const isCheck = checkSquare === square;
            const isHintFrom = hintMove?.from === square;
            const isHintTo = hintMove?.to === square;

            // In tabletop mode, Black pieces at top of board are rendered upside down
            const shouldFlipPiece = isTabletopMode && piece?.color === 'b';

            return (
              <div
                key={square}
                data-square={square}
                className={`relative flex items-center justify-center transition-colors duration-150 cursor-pointer ${
                  isLight ? themeColors.light : themeColors.dark
                } ${
                  /* Matching Image 1: Golden yellow border box on last move from & to */
                  isLastMoveFrom || isLastMoveTo
                    ? 'ring-2 ring-inset ring-amber-400 bg-amber-400/20'
                    : ''
                } ${isSelected ? 'ring-2 ring-inset ring-sky-400 bg-sky-400/30' : ''} ${
                  /* Matching Image 1: King in check glow with red radial aura */
                  isCheck
                    ? 'bg-gradient-to-t from-red-600 to-rose-500/90 shadow-[inset_0_0_15px_rgba(220,38,38,0.9)] animate-pulse'
                    : ''
                } ${isHintFrom || isHintTo ? 'ring-2 ring-emerald-400 bg-emerald-500/30' : ''}`}
                onClick={() => onSquareClick(square)}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, square)}
                role="gridcell"
                aria-label={`Square ${square}${piece ? ` with ${piece.color === 'w' ? 'White' : 'Black'} ${piece.type}` : ''}`}
              >
                {/* Edge Coordinates matching Image: 1-8 on left edge, a-h along bottom edge */}
                {showCoordinates && (
                  <>
                    {colIdx === 0 && (
                      <span className="absolute top-0.5 left-1 text-[9px] sm:text-[10px] font-bold opacity-75 pointer-events-none select-none">
                        {rank}
                      </span>
                    )}
                    {rowIdx === 7 && (
                      <span className="absolute bottom-0.5 right-1 text-[9px] sm:text-[10px] font-bold opacity-75 pointer-events-none select-none">
                        {file}
                      </span>
                    )}
                  </>
                )}

                {/* Piece rendering with hardware-accelerated touch */}
                {piece && (
                  <div
                    draggable
                    onDragStart={(e) => handleDragStart(e, square)}
                    className="w-full h-full flex items-center justify-center cursor-grab active:cursor-grabbing z-10 touch-manipulation transform-gpu"
                  >
                    <ChessPiece
                      type={piece.type}
                      color={piece.color}
                      design={pieceDesign}
                      isFlipped={shouldFlipPiece}
                    />
                  </div>
                )}

                {/* Legal Move indicator: Clean centered dot */}
                {isLegalTarget && !piece && (
                  <div className="absolute w-3 h-3 sm:w-3.5 sm:h-3.5 rounded-full bg-emerald-400/80 shadow-md ring-2 ring-emerald-300/60 pointer-events-none z-10" />
                )}

                {/* Legal Move indicator: Ring around enemy capturable piece */}
                {isLegalTarget && piece && (
                  <div className="absolute inset-0.5 rounded-sm ring-4 ring-rose-500/80 bg-rose-500/25 pointer-events-none animate-pulse z-10" />
                )}

                {/* Hint target pulsing dot */}
                {isHintTo && !piece && (
                  <div className="absolute w-4 h-4 rounded-full bg-emerald-400 ring-4 ring-emerald-300/70 animate-ping pointer-events-none z-10" />
                )}
              </div>
            );
          });
        })}

        {/* Directional Move Arrow Overlay matching Image 1 */}
        {arrowCoords && (
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none z-20"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient id="moveArrowGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.85" />
                <stop offset="100%" stopColor="#ef4444" stopOpacity="0.9" />
              </linearGradient>
              <marker
                id="arrowhead"
                markerWidth="3.5"
                markerHeight="3.5"
                refX="2.8"
                refY="1.75"
                orient="auto"
              >
                <polygon points="0 0, 3.5 1.75, 0 3.5" fill="#ef4444" opacity="0.9" />
              </marker>
            </defs>
            <line
              x1={`${arrowCoords.from.x}%`}
              y1={`${arrowCoords.from.y}%`}
              x2={`${arrowCoords.to.x}%`}
              y2={`${arrowCoords.to.y}%`}
              stroke="url(#moveArrowGrad)"
              strokeWidth="1.4"
              strokeLinecap="round"
              markerEnd="url(#arrowhead)"
              opacity="0.85"
            />
          </svg>
        )}
      </div>
    </div>
  );
});

ChessBoard.displayName = 'ChessBoard';
