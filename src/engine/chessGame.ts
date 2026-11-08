import { Chess } from 'chess.js';
import { GameOverReason, GameOverState, MaterialScore, MoveInfo, PieceColor, PieceType, Square } from './types';
import { PIECE_VALUES } from './evaluation';

export class ChessGame {
  private chess: Chess;
  private historyList: MoveInfo[] = [];

  constructor(fen?: string) {
    this.chess = new Chess(fen);
  }

  public getFen(): string {
    return this.chess.fen();
  }

  public getTurn(): PieceColor {
    return this.chess.turn() as PieceColor;
  }

  public getBoard(): ({ type: PieceType; color: PieceColor } | null)[][] {
    return this.chess.board() as any;
  }

  public getPiece(square: Square): { type: PieceType; color: PieceColor } | null {
    return (this.chess.get(square as any) as any) || null;
  }

  public getHistory(): MoveInfo[] {
    return [...this.historyList];
  }

  public isInCheck(): boolean {
    return this.chess.inCheck();
  }

  /**
   * Find the current turn's king square
   */
  public getKingSquare(color: PieceColor): Square | null {
    const board = this.chess.board();
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const piece = board[r][c];
        if (piece && piece.type === 'k' && piece.color === color) {
          const file = String.fromCharCode(97 + c);
          const rank = 8 - r;
          return `${file}${rank}` as Square;
        }
      }
    }
    return null;
  }

  /**
   * Get all legal moves from a given square
   */
  public getLegalMovesFrom(square: Square): {
    to: Square;
    captured: boolean;
    isPromotion: boolean;
  }[] {
    const moves = this.chess.moves({ square: square as any, verbose: true });
    return moves.map((m: any) => ({
      to: m.to as Square,
      captured: !!m.captured,
      isPromotion: !!m.promotion,
    }));
  }

  /**
   * Check if a proposed move from -> to requires pawn promotion choice
   */
  public isPromotionMove(from: Square, to: Square): boolean {
    const piece = this.getPiece(from);
    if (!piece || piece.type !== 'p') return false;

    // White pawn reaching rank 8 or Black pawn reaching rank 1
    if (piece.color === 'w' && to[1] === '8') return true;
    if (piece.color === 'b' && to[1] === '1') return true;

    return false;
  }

  /**
   * Attempt to make a move
   */
  public makeMove(
    from: Square,
    to: Square,
    promotion: PieceType = 'q'
  ): MoveInfo | null {
    try {
      const move = this.chess.move({
        from: from as any,
        to: to as any,
        promotion: promotion as any,
      });

      if (!move) return null;

      const moveInfo: MoveInfo = {
        from: move.from as Square,
        to: move.to as Square,
        piece: move.piece as PieceType,
        color: move.color as PieceColor,
        captured: (move.captured as PieceType) || undefined,
        promotion: (move.promotion as PieceType) || undefined,
        san: move.san,
        flags: move.flags,
      };

      this.historyList.push(moveInfo);
      return moveInfo;
    } catch {
      return null;
    }
  }

  /**
   * Undo the last move (or last N moves)
   */
  public undo(plies = 1): MoveInfo[] {
    const undone: MoveInfo[] = [];
    for (let i = 0; i < plies; i++) {
      const move = this.chess.undo();
      if (move) {
        const last = this.historyList.pop();
        if (last) undone.push(last);
      }
    }
    return undone;
  }

  /**
   * Reset game to starting position
   */
  public reset(): void {
    this.chess.reset();
    this.historyList = [];
  }

  /**
   * Calculate captured pieces and material score difference
   */
  public getMaterialScore(): MaterialScore {
    // Standard starting pieces for each side
    const initialCounts: Record<PieceType, number> = {
      p: 8,
      n: 2,
      b: 2,
      r: 2,
      q: 1,
      k: 1,
    };

    const currentCounts: Record<'w' | 'b', Record<PieceType, number>> = {
      w: { p: 0, n: 0, b: 0, r: 0, q: 0, k: 0 },
      b: { p: 0, n: 0, b: 0, r: 0, q: 0, k: 0 },
    };

    const board = this.chess.board();
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const piece = board[r][c];
        if (piece) {
          currentCounts[piece.color as 'w' | 'b'][piece.type as PieceType]++;
        }
      }
    }

    const whiteCaptured: PieceType[] = []; // Pieces captured by White (i.e. missing Black pieces)
    const blackCaptured: PieceType[] = []; // Pieces captured by Black (i.e. missing White pieces)

    const pieceOrder: PieceType[] = ['q', 'r', 'b', 'n', 'p'];

    let whiteMaterial = 0;
    let blackMaterial = 0;

    for (const type of pieceOrder) {
      const missingBlack = Math.max(0, initialCounts[type] - currentCounts.b[type]);
      for (let i = 0; i < missingBlack; i++) {
        whiteCaptured.push(type);
      }

      const missingWhite = Math.max(0, initialCounts[type] - currentCounts.w[type]);
      for (let i = 0; i < missingWhite; i++) {
        blackCaptured.push(type);
      }

      whiteMaterial += currentCounts.w[type] * (PIECE_VALUES[type] || 0);
      blackMaterial += currentCounts.b[type] * (PIECE_VALUES[type] || 0);
    }

    const diff = Math.round(Math.abs(whiteMaterial - blackMaterial) / 100);
    const leadingColor =
      whiteMaterial > blackMaterial ? 'w' : blackMaterial > whiteMaterial ? 'b' : null;

    return {
      whiteMaterial,
      blackMaterial,
      whiteCaptured,
      blackCaptured,
      advantage: {
        color: leadingColor,
        diff,
      },
    };
  }

  /**
   * Check game over state and reason
   */
  public getGameOverState(): GameOverState {
    if (this.chess.isCheckmate()) {
      // The side whose turn it is has been checkmated
      const loser = this.chess.turn() as PieceColor;
      const winner = loser === 'w' ? 'b' : 'w';
      return {
        isOver: true,
        winner,
        reason: 'checkmate',
        description: `Checkmate! ${winner === 'w' ? 'White' : 'Black'} wins by checkmate.`,
      };
    }

    if (this.chess.isStalemate()) {
      return {
        isOver: true,
        winner: 'draw',
        reason: 'stalemate',
        description: 'Stalemate! No legal moves available. The game is a draw.',
      };
    }

    if (this.chess.isThreefoldRepetition()) {
      return {
        isOver: true,
        winner: 'draw',
        reason: 'threefold-repetition',
        description: 'Draw by threefold repetition of the board position.',
      };
    }

    if (this.chess.isInsufficientMaterial()) {
      return {
        isOver: true,
        winner: 'draw',
        reason: 'insufficient-material',
        description: 'Draw by insufficient material to deliver checkmate.',
      };
    }

    // 50-move rule (100 half-moves)
    if (this.chess.isDraw()) {
      return {
        isOver: true,
        winner: 'draw',
        reason: '50-move-rule',
        description: 'Draw by 50-move rule (no captures or pawn advances in 50 moves).',
      };
    }

    return {
      isOver: false,
      winner: null,
      reason: null,
      description: '',
    };
  }
}
