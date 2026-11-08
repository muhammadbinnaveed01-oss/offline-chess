import React from 'react';
import { PieceColor, PieceType } from '../engine/types';

interface ChessPieceProps {
  type: PieceType;
  color: PieceColor;
  design?: 'flat' | 'classic' | 'modern';
  className?: string;
  isFlipped?: boolean; // For tabletop pass-and-play mode
}

/**
 * High-contrast, minimalist SVG Chess Pieces optimized for mobile displays.
 * Designed with strict Staunton/Cburnett vector geometry matching the user's reference.
 * Pure white (#ffffff) with crisp slate borders for White, deep rich black (#111827)
 * with sharp contrast accents for Black.
 * Wrapped in React.memo for 60fps performance on low-end mobile devices.
 */
export const ChessPiece: React.FC<ChessPieceProps> = React.memo(({
  type,
  color,
  design = 'classic',
  className = '',
  isFlipped = false,
}) => {
  const isWhite = color === 'w';
  const flipClass = isFlipped ? 'rotate-180 transform' : '';

  // Render specific piece based on type, color, and selected design
  const renderSvg = () => {
    switch (type) {
      // -------------------------------------------------------------
      // PAWN (High-contrast, minimalist, matching user reference image)
      // -------------------------------------------------------------
      case 'p':
        if (design === 'flat') {
          // Flat minimalist silhouette
          return isWhite ? (
            <svg viewBox="0 0 45 45" preserveAspectRatio="xMidYMid meet" className="w-full h-full block pointer-events-none select-none">
              <circle cx="22.5" cy="12" r="5" fill="#ffffff" stroke="#111827" strokeWidth="1.8" />
              <path
                d="M 19,16.5 C 19,21 16,26 15,33 L 30,33 C 29,26 26,21 26,16.5 Z"
                fill="#ffffff"
                stroke="#111827"
                strokeWidth="1.8"
                strokeLinejoin="round"
              />
              <rect x="12" y="34" width="21" height="5" rx="1.5" fill="#ffffff" stroke="#111827" strokeWidth="1.8" />
            </svg>
          ) : (
            <svg viewBox="0 0 45 45" preserveAspectRatio="xMidYMid meet" className="w-full h-full block pointer-events-none select-none">
              <circle cx="22.5" cy="12" r="5" fill="#111827" stroke="#374151" strokeWidth="1.2" />
              <path
                d="M 19,16.5 C 19,21 16,26 15,33 L 30,33 C 29,26 26,21 26,16.5 Z"
                fill="#111827"
                stroke="#374151"
                strokeWidth="1.2"
                strokeLinejoin="round"
              />
              <rect x="12" y="34" width="21" height="5" rx="1.5" fill="#111827" stroke="#374151" strokeWidth="1.2" />
              {/* Subtle contrast highlight on head */}
              <circle cx="21" cy="10.5" r="1.2" fill="#ffffff" opacity="0.8" />
            </svg>
          );
        }

        if (design === 'modern') {
          // Modern sleek curved pawn
          return isWhite ? (
            <svg viewBox="0 0 45 45" preserveAspectRatio="xMidYMid meet" className="w-full h-full block pointer-events-none select-none">
              <circle cx="22.5" cy="11.5" r="5.2" fill="#ffffff" stroke="#0f172a" strokeWidth="1.8" />
              <path
                d="M 17,17 C 18.5,18 26.5,18 28,17 C 27,22 24.5,25 25.5,32 L 19.5,32 C 20.5,25 18,22 17,17 Z"
                fill="#ffffff"
                stroke="#0f172a"
                strokeWidth="1.8"
                strokeLinejoin="round"
              />
              <path
                d="M 12.5,33 C 15,32 30,32 32.5,33 L 33.5,38.5 C 33.5,39.5 11.5,39.5 11.5,38.5 Z"
                fill="#ffffff"
                stroke="#0f172a"
                strokeWidth="1.8"
                strokeLinejoin="round"
              />
            </svg>
          ) : (
            <svg viewBox="0 0 45 45" preserveAspectRatio="xMidYMid meet" className="w-full h-full block pointer-events-none select-none">
              <circle cx="22.5" cy="11.5" r="5.2" fill="#0f172a" stroke="#475569" strokeWidth="1.2" />
              <path
                d="M 17,17 C 18.5,18 26.5,18 28,17 C 27,22 24.5,25 25.5,32 L 19.5,32 C 20.5,25 18,22 17,17 Z"
                fill="#0f172a"
                stroke="#475569"
                strokeWidth="1.2"
                strokeLinejoin="round"
              />
              <path
                d="M 12.5,33 C 15,32 30,32 32.5,33 L 33.5,38.5 C 33.5,39.5 11.5,39.5 11.5,38.5 Z"
                fill="#0f172a"
                stroke="#475569"
                strokeWidth="1.2"
                strokeLinejoin="round"
              />
              <path d="M 18,17.5 C 20.5,18.5 24.5,18.5 27,17.5" fill="none" stroke="#ffffff" strokeWidth="1.2" strokeLinecap="round" />
            </svg>
          );
        }

        // Default 'classic': Authentic Tournament Staunton matching reference image
        return isWhite ? (
          <svg viewBox="0 0 45 45" preserveAspectRatio="xMidYMid meet" className="w-full h-full block pointer-events-none select-none">
            {/* White Pawn: Head, Collar, Stem, and Tiered Pedestal */}
            <path
              d="M 22.5,9 C 20,9 18,11 18,13.5 C 18,14.6 18.4,15.6 19.1,16.4 C 17.5,17.4 16.5,19.2 16.5,21.3 C 16.5,23.3 17.4,25.1 18.8,26.2 C 16.3,27.3 13,30.5 13,36 L 32,36 C 32,30.5 28.7,27.3 26.2,26.2 C 27.6,25.1 28.5,23.3 28.5,21.3 C 28.5,19.2 27.5,17.4 25.9,16.4 C 26.6,15.6 27,14.6 27,13.5 C 27,11 25,9 22.5,9 Z"
              fill="#ffffff"
              stroke="#0f172a"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* Crisp base rim */}
            <path
              d="M 10.5,38.5 C 10.5,36.5 13,36 22.5,36 C 32,36 34.5,36.5 34.5,38.5 C 34.5,40.5 31,40 22.5,40 C 14,40 10.5,40.5 10.5,38.5 Z"
              fill="#ffffff"
              stroke="#0f172a"
              strokeWidth="1.8"
            />
            {/* Elegant collar line */}
            <path
              d="M 18,17 C 19.5,18 25.5,18 27,17"
              fill="none"
              stroke="#0f172a"
              strokeWidth="1.4"
            />
          </svg>
        ) : (
          <svg viewBox="0 0 45 45" preserveAspectRatio="xMidYMid meet" className="w-full h-full block pointer-events-none select-none">
            {/* Black Pawn: High-contrast solid tournament silhouette */}
            <path
              d="M 22.5,9 C 20,9 18,11 18,13.5 C 18,14.6 18.4,15.6 19.1,16.4 C 17.5,17.4 16.5,19.2 16.5,21.3 C 16.5,23.3 17.4,25.1 18.8,26.2 C 16.3,27.3 13,30.5 13,36 L 32,36 C 32,30.5 28.7,27.3 26.2,26.2 C 27.6,25.1 28.5,23.3 28.5,21.3 C 28.5,19.2 27.5,17.4 25.9,16.4 C 26.6,15.6 27,14.6 27,13.5 C 27,11 25,9 22.5,9 Z"
              fill="#0f172a"
              stroke="#334155"
              strokeWidth="1.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M 10.5,38.5 C 10.5,36.5 13,36 22.5,36 C 32,36 34.5,36.5 34.5,38.5 C 34.5,40.5 31,40 22.5,40 C 14,40 10.5,40.5 10.5,38.5 Z"
              fill="#0f172a"
              stroke="#334155"
              strokeWidth="1.2"
            />
            {/* Crisp white accent for readability on dark squares */}
            <path
              d="M 20,12 C 20,10.8 21.2,10 22.5,10"
              fill="none"
              stroke="#ffffff"
              strokeWidth="1.4"
              strokeLinecap="round"
            />
            <path
              d="M 18,17 C 20,18 25,18 27,17"
              fill="none"
              stroke="#ffffff"
              strokeWidth="1.2"
              strokeLinecap="round"
            />
          </svg>
        );

      // -------------------------------------------------------------
      // KNIGHT
      // -------------------------------------------------------------
      case 'n':
        return isWhite ? (
          <svg viewBox="0 0 45 45" preserveAspectRatio="xMidYMid meet" className="w-full h-full block pointer-events-none select-none">
            <path
              d="M 22,10 C 32.5,11 38.5,18 38,39 L 11,39 C 11,29 11.5,23.5 15,20.5 C 13,20.5 10.5,19.5 9.5,16.5 C 8.5,13.5 10,11 12.5,10 C 14,8.5 17.5,8 20,8.5 C 21,9 21.5,9.5 22,10 Z"
              fill="#ffffff"
              stroke="#0f172a"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <circle cx="15.5" cy="14.5" r="1.5" fill="#0f172a" />
            <path d="M 24.5,18 C 26.5,19 28,21.5 28,24" fill="none" stroke="#0f172a" strokeWidth="1.5" strokeLinecap="round" />
            <path d="M 9.5,25.5 C 9.5,25.5 11,26.5 13,26" fill="none" stroke="#0f172a" strokeWidth="1.4" />
            <path d="M 14,20 C 16,21 17,24 17,28" fill="none" stroke="#0f172a" strokeWidth="1.4" />
          </svg>
        ) : (
          <svg viewBox="0 0 45 45" preserveAspectRatio="xMidYMid meet" className="w-full h-full block pointer-events-none select-none">
            <path
              d="M 22,10 C 32.5,11 38.5,18 38,39 L 11,39 C 11,29 11.5,23.5 15,20.5 C 13,20.5 10.5,19.5 9.5,16.5 C 8.5,13.5 10,11 12.5,10 C 14,8.5 17.5,8 20,8.5 C 21,9 21.5,9.5 22,10 Z"
              fill="#0f172a"
              stroke="#334155"
              strokeWidth="1.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <circle cx="15.5" cy="14.5" r="1.5" fill="#ffffff" />
            <path d="M 24.5,18 C 26.5,19 28,21.5 28,24" fill="none" stroke="#ffffff" strokeWidth="1.4" strokeLinecap="round" />
            <path d="M 9.5,25.5 C 9.5,25.5 11,26.5 13,26" fill="none" stroke="#ffffff" strokeWidth="1.4" />
            <path d="M 14,20 C 16,21 17,24 17,28" fill="none" stroke="#ffffff" strokeWidth="1.4" />
          </svg>
        );

      // -------------------------------------------------------------
      // BISHOP
      // -------------------------------------------------------------
      case 'b':
        return isWhite ? (
          <svg viewBox="0 0 45 45" preserveAspectRatio="xMidYMid meet" className="w-full h-full block pointer-events-none select-none">
            <g fill="#ffffff" stroke="#0f172a" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M 9,36 C 12.4,35 19.1,36.4 22.5,34 C 25.9,36.4 32.6,35 36,36 C 36,36 37.6,36.5 39,38 C 38.3,39 37.3,39.5 36,39.5 C 33,39.5 12,39.5 9,39.5 C 7.6,39.5 6.7,39 6,38 C 7.3,36.5 9,36 9,36 Z" />
              <path d="M 15,32 C 17.5,34.5 27.5,34.5 30,32 C 30.5,30.5 30,30 30,30 C 30,27.5 27.5,26 22.5,26 C 17.5,26 15,27.5 15,30 C 15,30 14.5,30.5 15,32 Z" />
              <path d="M 22.5,9 C 18.5,9 15.5,12 15.5,16 C 15.5,19 17.5,22 19,23.5 C 20.5,25 21,25 22.5,25 C 24,25 24.5,25 26,23.5 C 27.5,22 29.5,19 29.5,16 C 29.5,12 26.5,9 22.5,9 Z" />
              <circle cx="22.5" cy="7" r="1.5" />
            </g>
            <path d="M 17.5,16 L 27.5,16 M 22.5,11 L 22.5,21" fill="none" stroke="#0f172a" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        ) : (
          <svg viewBox="0 0 45 45" preserveAspectRatio="xMidYMid meet" className="w-full h-full block pointer-events-none select-none">
            <g fill="#0f172a" stroke="#334155" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M 9,36 C 12.4,35 19.1,36.4 22.5,34 C 25.9,36.4 32.6,35 36,36 C 36,36 37.6,36.5 39,38 C 38.3,39 37.3,39.5 36,39.5 C 33,39.5 12,39.5 9,39.5 C 7.6,39.5 6.7,39 6,38 C 7.3,36.5 9,36 9,36 Z" />
              <path d="M 15,32 C 17.5,34.5 27.5,34.5 30,32 C 30.5,30.5 30,30 30,30 C 30,27.5 27.5,26 22.5,26 C 17.5,26 15,27.5 15,30 C 15,30 14.5,30.5 15,32 Z" />
              <path d="M 22.5,9 C 18.5,9 15.5,12 15.5,16 C 15.5,19 17.5,22 19,23.5 C 20.5,25 21,25 22.5,25 C 24,25 24.5,25 26,23.5 C 27.5,22 29.5,19 29.5,16 C 29.5,12 26.5,9 22.5,9 Z" />
              <circle cx="22.5" cy="7" r="1.5" />
            </g>
            <path d="M 17.5,16 L 27.5,16 M 22.5,11 L 22.5,21" fill="none" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        );

      // -------------------------------------------------------------
      // ROOK
      // -------------------------------------------------------------
      case 'r':
        return isWhite ? (
          <svg viewBox="0 0 45 45" preserveAspectRatio="xMidYMid meet" className="w-full h-full block pointer-events-none select-none">
            <g fill="#ffffff" stroke="#0f172a" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M 9,39 L 36,39 L 36,36 L 9,36 Z" />
              <path d="M 12,36 L 12,32 L 33,32 L 33,36 Z" />
              <path d="M 11,14 L 11,9 L 15,9 L 15,11 L 20,11 L 20,9 L 25,9 L 25,11 L 30,11 L 30,9 L 34,9 L 34,14" />
              <path d="M 34,14 L 31,17 L 14,17 L 11,14" />
              <path d="M 14,17 L 14,29 L 31,29 L 31,17" />
              <path d="M 14,29 L 11,32 L 34,32 L 31,29" />
            </g>
            <line x1="14" y1="21" x2="31" y2="21" stroke="#0f172a" strokeWidth="1.4" />
          </svg>
        ) : (
          <svg viewBox="0 0 45 45" preserveAspectRatio="xMidYMid meet" className="w-full h-full block pointer-events-none select-none">
            <g fill="#0f172a" stroke="#334155" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M 9,39 L 36,39 L 36,36 L 9,36 Z" />
              <path d="M 12,36 L 12,32 L 33,32 L 33,36 Z" />
              <path d="M 11,14 L 11,9 L 15,9 L 15,11 L 20,11 L 20,9 L 25,9 L 25,11 L 30,11 L 30,9 L 34,9 L 34,14" />
              <path d="M 34,14 L 31,17 L 14,17 L 11,14" />
              <path d="M 14,17 L 14,29 L 31,29 L 31,17" />
              <path d="M 14,29 L 11,32 L 34,32 L 31,29" />
            </g>
            <line x1="14" y1="21" x2="31" y2="21" stroke="#ffffff" strokeWidth="1.4" />
          </svg>
        );

      // -------------------------------------------------------------
      // QUEEN
      // -------------------------------------------------------------
      case 'q':
        return isWhite ? (
          <svg viewBox="0 0 45 45" preserveAspectRatio="xMidYMid meet" className="w-full h-full block pointer-events-none select-none">
            <g fill="#ffffff" stroke="#0f172a" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M 9,26 C 17.5,24.5 30,24.5 36,26 L 38.5,13.5 L 31,25 L 30.7,10.5 L 25.5,24.5 L 22.5,10 L 19.5,24.5 L 14.3,10.5 L 14,25 L 6.5,13.5 Z" />
              <path d="M 9,26 C 9,28 10.5,28 11.5,30 C 12.5,31.5 12.5,31 12,33.5 C 10.5,34.5 11,36 11,36 C 11.5,37 12.8,37.5 14,37.5 C 16,37.5 29,37.5 31,37.5 C 32.2,37.5 33.5,37 34,36 C 34,36 34.5,34.5 33,33.5 C 32.5,31 32.5,31.5 33.5,30 C 34.5,28 36,28 36,26 Z" />
              <path d="M 11,39 L 34,39 L 34,36 L 11,36 Z" />
              <circle cx="6" cy="12" r="1.5" />
              <circle cx="14" cy="9" r="1.5" />
              <circle cx="22.5" cy="8" r="1.5" />
              <circle cx="31" cy="9" r="1.5" />
              <circle cx="39" cy="12" r="1.5" />
            </g>
          </svg>
        ) : (
          <svg viewBox="0 0 45 45" preserveAspectRatio="xMidYMid meet" className="w-full h-full block pointer-events-none select-none">
            <g fill="#0f172a" stroke="#334155" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M 9,26 C 17.5,24.5 30,24.5 36,26 L 38.5,13.5 L 31,25 L 30.7,10.5 L 25.5,24.5 L 22.5,10 L 19.5,24.5 L 14.3,10.5 L 14,25 L 6.5,13.5 Z" />
              <path d="M 9,26 C 9,28 10.5,28 11.5,30 C 12.5,31.5 12.5,31 12,33.5 C 10.5,34.5 11,36 11,36 C 11.5,37 12.8,37.5 14,37.5 C 16,37.5 29,37.5 31,37.5 C 32.2,37.5 33.5,37 34,36 C 34,36 34.5,34.5 33,33.5 C 32.5,31 32.5,31.5 33.5,30 C 34.5,28 36,28 36,26 Z" />
              <path d="M 11,39 L 34,39 L 34,36 L 11,36 Z" />
            </g>
            <circle cx="6" cy="12" r="1.5" fill="#ffffff" />
            <circle cx="14" cy="9" r="1.5" fill="#ffffff" />
            <circle cx="22.5" cy="8" r="1.5" fill="#ffffff" />
            <circle cx="31" cy="9" r="1.5" fill="#ffffff" />
            <circle cx="39" cy="12" r="1.5" fill="#ffffff" />
            <path d="M 13,32.5 C 16,34 29,34 32,32.5" fill="none" stroke="#ffffff" strokeWidth="1.2" strokeLinecap="round" />
          </svg>
        );

      // -------------------------------------------------------------
      // KING
      // -------------------------------------------------------------
      case 'k':
        return isWhite ? (
          <svg viewBox="0 0 45 45" preserveAspectRatio="xMidYMid meet" className="w-full h-full block pointer-events-none select-none">
            <g fill="#ffffff" stroke="#0f172a" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22.5" y1="6" x2="22.5" y2="12" stroke="#0f172a" strokeWidth="2" />
              <line x1="19.5" y1="9" x2="25.5" y2="9" stroke="#0f172a" strokeWidth="2" />
              <path d="M 22.5,11.5 C 20,11.5 16.5,13.5 16.5,16 C 16.5,18.5 18,20 22.5,20 C 27,20 28.5,18.5 28.5,16 C 28.5,13.5 25,11.5 22.5,11.5 Z" />
              <path d="M 11.5,37 C 17,40.5 27,40.5 32.5,37 L 32.5,30 C 32.5,30 31.5,28.5 28.5,28 C 25.5,27.5 24,24 22.5,24 C 21,24 19.5,27.5 16.5,28 C 13.5,28.5 12.5,30 12.5,30 Z" />
              <path d="M 11.5,30 C 15.5,26.5 17,21 17,16 C 17,16 19.5,15.5 22.5,15.5 C 25.5,15.5 28,16 28,16 C 28,21 29.5,26.5 33.5,30" />
              <path d="M 11.5,37 L 33.5,37 L 33.5,39.5 L 11.5,39.5 Z" />
            </g>
          </svg>
        ) : (
          <svg viewBox="0 0 45 45" preserveAspectRatio="xMidYMid meet" className="w-full h-full block pointer-events-none select-none">
            <g fill="#0f172a" stroke="#334155" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M 22.5,11.5 C 20,11.5 16.5,13.5 16.5,16 C 16.5,18.5 18,20 22.5,20 C 27,20 28.5,18.5 28.5,16 C 28.5,13.5 25,11.5 22.5,11.5 Z" />
              <path d="M 11.5,37 C 17,40.5 27,40.5 32.5,37 L 32.5,30 C 32.5,30 31.5,28.5 28.5,28 C 25.5,27.5 24,24 22.5,24 C 21,24 19.5,27.5 16.5,28 C 13.5,28.5 12.5,30 12.5,30 Z" />
              <path d="M 11.5,30 C 15.5,26.5 17,21 17,16 C 17,16 19.5,15.5 22.5,15.5 C 25.5,15.5 28,16 28,16 C 28,21 29.5,26.5 33.5,30" />
              <path d="M 11.5,37 L 33.5,37 L 33.5,39.5 L 11.5,39.5 Z" />
            </g>
            <line x1="22.5" y1="6" x2="22.5" y2="12" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" />
            <line x1="19.5" y1="9" x2="25.5" y2="9" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" />
            <path d="M 14,34 C 18,36 27,36 31,34" fill="none" stroke="#ffffff" strokeWidth="1.2" strokeLinecap="round" />
          </svg>
        );
    }
  };

  return (
    <div
      className={`relative flex items-center justify-center w-full h-full p-0.5 select-none pointer-events-none ${flipClass} ${className}`}
      aria-hidden="true"
    >
      {renderSvg()}
    </div>
  );
});

ChessPiece.displayName = 'ChessPiece';
