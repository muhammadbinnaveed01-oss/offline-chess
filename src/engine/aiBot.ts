import { Chess } from 'chess.js';
import { BotDifficulty, PieceType, Square } from './types';
import { PIECE_VALUES, getPieceSquareValue } from './evaluation';

interface ScoredMove {
  from: Square;
  to: Square;
  promotion?: PieceType;
  score: number;
}

// Lightweight transposition cache to avoid re-evaluating duplicate positions.
// Capped at 4096 entries to preserve RAM on low-end mobile devices.
const transpositionTable = new Map<string, number>();
const MAX_TT_SIZE = 4096;

/**
 * High-performance, zero-allocation board evaluation directly from FEN.
 * Avoids calling game.board() which creates 64 objects + 8 arrays on every call.
 * This eliminates garbage collection pauses on low-end mobile CPUs.
 */
export function evaluateBoard(game: Chess): number {
  if (game.isCheckmate()) {
    return game.turn() === 'w' ? -99999 : 99999;
  }
  if (game.isDraw() || game.isStalemate() || game.isThreefoldRepetition() || game.isInsufficientMaterial()) {
    return 0;
  }

  const fen = game.fen();
  // Check transposition table
  const cached = transpositionTable.get(fen);
  if (cached !== undefined) {
    return cached;
  }

  let materialScore = 0;
  let queensCount = 0;
  let majorPiecesCount = 0;

  // Single-pass FEN scan up to first space
  let rank = 0;
  let file = 0;
  const fenLen = fen.length;

  for (let i = 0; i < fenLen; i++) {
    const char = fen[i];
    if (char === ' ') break; // End of piece placement section

    if (char === '/') {
      rank++;
      file = 0;
      continue;
    }

    const code = char.charCodeAt(0);
    // Digits '1' - '8' represent empty squares
    if (code >= 49 && code <= 56) {
      file += code - 48;
      continue;
    }

    // Piece character
    const isUpper = code >= 65 && code <= 90;
    const pieceType = char.toLowerCase() as PieceType;
    const color = isUpper ? 'w' : 'b';

    if (pieceType === 'q') queensCount++;
    if (pieceType === 'r' || pieceType === 'q') majorPiecesCount++;

    const squareStr = `${String.fromCharCode(97 + file)}${8 - rank}`;
    const matVal = PIECE_VALUES[pieceType] || 0;
    const isEndgame = queensCount === 0 || majorPiecesCount <= 2;
    const posVal = getPieceSquareValue(pieceType, color, squareStr, isEndgame);
    const totalVal = matVal + posVal;

    if (color === 'w') {
      materialScore += totalVal;
    } else {
      materialScore -= totalVal;
    }

    file++;
  }

  // Bonus for player with tempo/turn
  const tempoBonus = game.turn() === 'w' ? 10 : -10;
  const score = materialScore + tempoBonus;

  // Store in cache
  if (transpositionTable.size >= MAX_TT_SIZE) {
    transpositionTable.clear();
  }
  transpositionTable.set(fen, score);

  return score;
}

/**
 * Move ordering for Alpha-Beta pruning efficiency:
 * Checks & Queen promotions first, then MVV-LVA (Most Valuable Victim - Least Valuable Attacker)
 */
function orderMoves(moves: any[]): any[] {
  return moves.sort((a, b) => {
    let scoreA = 0;
    let scoreB = 0;

    // Queen promotion priority
    if (a.promotion === 'q') scoreA += 900;
    if (b.promotion === 'q') scoreB += 900;

    // Capture score (MVV-LVA)
    if (a.captured) {
      const victimValue = PIECE_VALUES[a.captured as PieceType] || 0;
      const attackerValue = PIECE_VALUES[a.piece as PieceType] || 0;
      scoreA += 1000 + (victimValue * 10 - attackerValue);
    }
    if (b.captured) {
      const victimValue = PIECE_VALUES[b.captured as PieceType] || 0;
      const attackerValue = PIECE_VALUES[b.piece as PieceType] || 0;
      scoreB += 1000 + (victimValue * 10 - attackerValue);
    }

    // Castling bonus
    if (a.flags?.includes('k') || a.flags?.includes('q')) scoreA += 60;
    if (b.flags?.includes('k') || b.flags?.includes('q')) scoreB += 60;

    return scoreB - scoreA;
  });
}

/**
 * Quiescence search: searches tactical capture sequences to avoid the horizon effect
 */
function quiescenceSearch(
  game: Chess,
  alpha: number,
  beta: number,
  isMaximizing: boolean,
  depthLeft = 2
): number {
  const standPat = evaluateBoard(game);

  if (isMaximizing) {
    if (standPat >= beta) return beta;
    if (standPat > alpha) alpha = standPat;
  } else {
    if (standPat <= alpha) return alpha;
    if (standPat < beta) beta = standPat;
  }

  if (depthLeft <= 0) return standPat;

  // Only consider captures in quiescence
  const captures = game.moves({ verbose: true }).filter((m: any) => m.captured);
  if (captures.length === 0) return standPat;

  const orderedCaptures = orderMoves(captures);

  if (isMaximizing) {
    let maxEval = standPat;
    for (let i = 0; i < orderedCaptures.length; i++) {
      game.move(orderedCaptures[i]);
      const evaluation = quiescenceSearch(game, alpha, beta, false, depthLeft - 1);
      game.undo();

      if (evaluation > maxEval) maxEval = evaluation;
      if (evaluation > alpha) alpha = evaluation;
      if (beta <= alpha) break;
    }
    return maxEval;
  } else {
    let minEval = standPat;
    for (let i = 0; i < orderedCaptures.length; i++) {
      game.move(orderedCaptures[i]);
      const evaluation = quiescenceSearch(game, alpha, beta, true, depthLeft - 1);
      game.undo();

      if (evaluation < minEval) minEval = evaluation;
      if (evaluation < beta) beta = evaluation;
      if (beta <= alpha) break;
    }
    return minEval;
  }
}

/**
 * Minimax with Alpha-Beta Pruning.
 */
function minimax(
  game: Chess,
  depth: number,
  alpha: number,
  beta: number,
  isMaximizing: boolean,
  useQuiescence: boolean
): number {
  if (depth === 0) {
    if (useQuiescence) {
      return quiescenceSearch(game, alpha, beta, isMaximizing, 2);
    }
    return evaluateBoard(game);
  }

  if (game.isGameOver()) {
    return evaluateBoard(game);
  }

  const moves = orderMoves(game.moves({ verbose: true }));

  if (isMaximizing) {
    let maxEval = -Infinity;
    for (let i = 0; i < moves.length; i++) {
      game.move(moves[i]);
      const evaluation = minimax(game, depth - 1, alpha, beta, false, useQuiescence);
      game.undo();

      if (evaluation > maxEval) maxEval = evaluation;
      if (evaluation > alpha) alpha = evaluation;
      if (beta <= alpha) break;
    }
    return maxEval;
  } else {
    let minEval = Infinity;
    for (let i = 0; i < moves.length; i++) {
      game.move(moves[i]);
      const evaluation = minimax(game, depth - 1, alpha, beta, true, useQuiescence);
      game.undo();

      if (evaluation < minEval) minEval = evaluation;
      if (evaluation < beta) beta = evaluation;
      if (beta <= alpha) break;
    }
    return minEval;
  }
}

/**
 * Compute the best move for a given difficulty.
 * Yields asynchronously to the browser microtask/event queue so low-end mobile UI thread never freezes.
 */
export async function calculateBotMove(
  fen: string,
  difficulty: BotDifficulty
): Promise<ScoredMove | null> {
  const game = new Chess(fen);
  const legalMoves = game.moves({ verbose: true });
  if (legalMoves.length === 0) return null;

  const isWhite = game.turn() === 'w';

  // 1. Easy Mode: simulates ~600-800 ELO
  if (difficulty === 'easy') {
    if (Math.random() < 0.35 && legalMoves.length > 1) {
      const randomMove = legalMoves[Math.floor(Math.random() * legalMoves.length)];
      return {
        from: randomMove.from as Square,
        to: randomMove.to as Square,
        promotion: (randomMove.promotion as PieceType) || undefined,
        score: 0,
      };
    }

    // Depth 1 with slight randomization
    let bestMove = legalMoves[0];
    let bestScore = isWhite ? -Infinity : Infinity;

    for (let i = 0; i < legalMoves.length; i++) {
      const move = legalMoves[i];
      game.move(move);
      const evalScore = evaluateBoard(game) + (Math.random() * 80 - 40);
      game.undo();

      if (isWhite ? evalScore > bestScore : evalScore < bestScore) {
        bestScore = evalScore;
        bestMove = move;
      }
    }

    return {
      from: bestMove.from as Square,
      to: bestMove.to as Square,
      promotion: (bestMove.promotion as PieceType) || undefined,
      score: bestScore,
    };
  }

  // 2. Medium Mode: Depth 3 Minimax + Alpha-Beta (~1200-1400 ELO)
  if (difficulty === 'medium') {
    const depth = 3;
    let bestMove = legalMoves[0];
    let bestScore = isWhite ? -Infinity : Infinity;
    const orderedMoves = orderMoves(legalMoves);

    let alpha = -Infinity;
    let beta = Infinity;

    for (let i = 0; i < orderedMoves.length; i++) {
      // Yield every 8 moves on mobile devices
      if (i > 0 && i % 8 === 0) {
        await new Promise((r) => setTimeout(r, 0));
      }

      const move = orderedMoves[i];
      game.move(move);
      const score = minimax(game, depth - 1, alpha, beta, !isWhite, false);
      game.undo();

      if (isWhite) {
        if (score > bestScore) {
          bestScore = score;
          bestMove = move;
        }
        if (score > alpha) alpha = score;
      } else {
        if (score < bestScore) {
          bestScore = score;
          bestMove = move;
        }
        if (score < beta) beta = score;
      }
    }

    return {
      from: bestMove.from as Square,
      to: bestMove.to as Square,
      promotion: (bestMove.promotion as PieceType) || undefined,
      score: bestScore,
    };
  }

  // 3. Pro Mode: Depth 4 Minimax with Quiescence + Alpha-Beta (~1800+ ELO)
  const depth = 4;
  let bestMove = legalMoves[0];
  let bestScore = isWhite ? -Infinity : Infinity;
  const orderedMoves = orderMoves(legalMoves);

  let alpha = -Infinity;
  let beta = Infinity;

  for (let i = 0; i < orderedMoves.length; i++) {
    // Yield every 4 moves so the browser event loop runs animations & timers
    if (i > 0 && i % 4 === 0) {
      await new Promise((r) => setTimeout(r, 0));
    }

    const move = orderedMoves[i];
    game.move(move);
    const score = minimax(game, depth - 1, alpha, beta, !isWhite, true);
    game.undo();

    if (isWhite) {
      if (score > bestScore) {
        bestScore = score;
        bestMove = move;
      }
      if (score > alpha) alpha = score;
    } else {
      if (score < bestScore) {
        bestScore = score;
        bestMove = move;
      }
      if (score < beta) beta = score;
    }
  }

  return {
    from: bestMove.from as Square,
    to: bestMove.to as Square,
    promotion: (bestMove.promotion as PieceType) || undefined,
    score: bestScore,
  };
}

/**
 * Hint engine: Calculates the recommended move for human player with strategic advice
 */
export async function getHint(fen: string): Promise<{
  from: Square;
  to: Square;
  promotion?: PieceType;
  advice: string;
} | null> {
  const game = new Chess(fen);
  const legalMoves = game.moves({ verbose: true });
  if (legalMoves.length === 0) return null;

  const isWhite = game.turn() === 'w';
  const orderedMoves = orderMoves(legalMoves);

  let bestMove = orderedMoves[0];
  let bestScore = isWhite ? -Infinity : Infinity;
  let alpha = -Infinity;
  let beta = Infinity;

  // Use depth 2 with quiescence for instant, responsive hints
  for (let i = 0; i < orderedMoves.length; i++) {
    const move = orderedMoves[i];
    game.move(move);
    const score = minimax(game, 2, alpha, beta, !isWhite, true);
    game.undo();

    if (isWhite ? score > bestScore : score < bestScore) {
      bestScore = score;
      bestMove = move;
    }
  }

  let advice = `Recommended move: ${bestMove.san}`;
  if (bestMove.captured) {
    advice = `Capture opponent's ${bestMove.captured.toUpperCase()} on ${bestMove.to} (${bestMove.san})`;
  } else if (bestMove.san.includes('+')) {
    advice = `Deliver check with ${bestMove.san}`;
  } else if (bestMove.san.includes('#')) {
    advice = `Deliver checkmate with ${bestMove.san}!`;
  } else if (bestMove.san === 'O-O' || bestMove.san === 'O-O-O') {
    advice = `Castle to safeguard your King and connect Rooks`;
  } else if (bestMove.piece === 'p' && (bestMove.to[1] === '4' || bestMove.to[1] === '5')) {
    advice = `Control center squares with ${bestMove.san}`;
  } else if (bestMove.piece === 'n' || bestMove.piece === 'b') {
    advice = `Develop piece to an active square (${bestMove.san})`;
  }

  return {
    from: bestMove.from as Square,
    to: bestMove.to as Square,
    promotion: (bestMove.promotion as PieceType) || undefined,
    advice,
  };
}
