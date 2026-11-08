export type PieceColor = 'w' | 'b';
export type PieceType = 'p' | 'n' | 'b' | 'r' | 'q' | 'k';

export type Square = 
  | 'a8' | 'b8' | 'c8' | 'd8' | 'e8' | 'f8' | 'g8' | 'h8'
  | 'a7' | 'b7' | 'c7' | 'd7' | 'e7' | 'f7' | 'g7' | 'h7'
  | 'a6' | 'b6' | 'c6' | 'd6' | 'e6' | 'f6' | 'g6' | 'h6'
  | 'a5' | 'b5' | 'c5' | 'd5' | 'e5' | 'f5' | 'g5' | 'h5'
  | 'a4' | 'b4' | 'c4' | 'd4' | 'e4' | 'f4' | 'g4' | 'h4'
  | 'a3' | 'b3' | 'c3' | 'd3' | 'e3' | 'f3' | 'g3' | 'h3'
  | 'a2' | 'b2' | 'c2' | 'd2' | 'e2' | 'f2' | 'g2' | 'h2'
  | 'a1' | 'b1' | 'c1' | 'd1' | 'e1' | 'f1' | 'g1' | 'h1';

export type BotDifficulty = 'easy' | 'medium' | 'pro';
export type GameMode = 'bot' | 'pass-and-play';
export type PassAndPlaySubMode = 'standard' | 'auto-rotate' | 'tabletop';
export type PlayerColorChoice = 'w' | 'b' | 'random';
export type TimeControl = 0 | 300 | 600 | 900; // 0 = No timer, 300 = 5m, 600 = 10m, 900 = 15m

export interface GameSettings {
  mode: GameMode;
  botDifficulty: BotDifficulty;
  playerColor: PieceColor; // In bot mode: player's color
  passAndPlayMode: PassAndPlaySubMode;
  timeControl: TimeControl;
  boardTheme: 'classic-blue' | 'midnight' | 'emerald' | 'wood' | 'slate';
  soundEnabled: boolean;
  hapticsEnabled: boolean;
  showLegalMoves: boolean;
  showCoordinates: boolean;
  pieceDesign?: 'flat' | 'classic' | 'modern';
}

export interface MoveInfo {
  from: Square;
  to: Square;
  piece: PieceType;
  color: PieceColor;
  captured?: PieceType;
  promotion?: PieceType;
  san: string;
  flags: string;
}

export type GameOverReason = 
  | 'checkmate'
  | 'stalemate'
  | 'threefold-repetition'
  | 'insufficient-material'
  | '50-move-rule'
  | 'timeout'
  | 'resignation';

export interface GameOverState {
  isOver: boolean;
  winner: PieceColor | 'draw' | null;
  reason: GameOverReason | null;
  description: string;
}

export interface MaterialScore {
  whiteMaterial: number;
  blackMaterial: number;
  whiteCaptured: PieceType[];
  blackCaptured: PieceType[];
  advantage: {
    color: PieceColor | null;
    diff: number;
  };
}
