import test from 'node:test';
import assert from 'node:assert/strict';
import { ChessGame } from './chessGame';
import { calculateBotMove, evaluateBoard, getHint } from './aiBot';

test('ChessGame initializes starting board with 32 pieces and White to move', () => {
  const game = new ChessGame();
  assert.equal(game.getTurn(), 'w');
  assert.equal(game.isInCheck(), false);
  const kingSquare = game.getKingSquare('w');
  assert.equal(kingSquare, 'e1');
  const blackKing = game.getKingSquare('b');
  assert.equal(blackKing, 'e8');
  assert.equal(game.getHistory().length, 0);
});

test('Legal moves calculation returns correct targets for opening pawn', () => {
  const game = new ChessGame();
  const e2Moves = game.getLegalMovesFrom('e2');
  const targetSquares = e2Moves.map((m) => m.to).sort();
  assert.deepEqual(targetSquares, ['e3', 'e4']);
});

test('Move execution updates board and changes turn', () => {
  const game = new ChessGame();
  const move = game.makeMove('e2', 'e4');
  assert.ok(move);
  assert.equal(move.san, 'e4');
  assert.equal(game.getTurn(), 'b');
  assert.equal(game.getPiece('e4')?.type, 'p');
  assert.equal(game.getPiece('e2'), null);
});

test('Special Move: Castling kingside works when legal', () => {
  // Setup position ready for White kingside castling: 1. e4 e5 2. Nf3 Nc6 3. Bc4 Bc5
  const game = new ChessGame();
  game.makeMove('e2', 'e4');
  game.makeMove('e7', 'e5');
  game.makeMove('g1', 'f3');
  game.makeMove('b8', 'c6');
  game.makeMove('f1', 'c4');
  game.makeMove('f8', 'c5');

  const legalMovesFromE1 = game.getLegalMovesFrom('e1');
  assert.ok(legalMovesFromE1.some((m) => m.to === 'g1'));

  const castleMove = game.makeMove('e1', 'g1');
  assert.ok(castleMove);
  assert.equal(castleMove.san, 'O-O');
  assert.equal(game.getPiece('g1')?.type, 'k');
  assert.equal(game.getPiece('f1')?.type, 'r');
});

test('Special Move: En Passant capture works', () => {
  const game = new ChessGame();
  game.makeMove('e2', 'e4');
  game.makeMove('a7', 'a6');
  game.makeMove('e4', 'e5');
  game.makeMove('d7', 'd5'); // Black double pushes adjacent pawn

  const legalMoves = game.getLegalMovesFrom('e5');
  assert.ok(legalMoves.some((m) => m.to === 'd6'));

  const enPassantMove = game.makeMove('e5', 'd6');
  assert.ok(enPassantMove);
  assert.equal(game.getPiece('d6')?.type, 'p');
  assert.equal(game.getPiece('d5'), null); // Captured Black pawn removed!
});

test('Special Move: Pawn Promotion triggers and executes correctly', () => {
  // FEN where White pawn on e7 is about to promote
  const fen = '8/4P3/8/8/8/8/8/4K2k w - - 0 1';
  const game = new ChessGame(fen);

  assert.equal(game.isPromotionMove('e7', 'e8'), true);
  const move = game.makeMove('e7', 'e8', 'q');
  assert.ok(move);
  assert.equal(move.promotion, 'q');
  assert.equal(game.getPiece('e8')?.type, 'q');
});

test('Detects Scholar\'s Mate (Checkmate)', () => {
  const game = new ChessGame();
  game.makeMove('e2', 'e4');
  game.makeMove('e7', 'e5');
  game.makeMove('d1', 'h5');
  game.makeMove('b8', 'c6');
  game.makeMove('f1', 'c4');
  game.makeMove('g8', 'f6');
  game.makeMove('h5', 'f7'); // Checkmate

  const state = game.getGameOverState();
  assert.equal(state.isOver, true);
  assert.equal(state.winner, 'w');
  assert.equal(state.reason, 'checkmate');
});

test('Material calculation accurately counts captured pieces and advantage', () => {
  const game = new ChessGame();
  game.makeMove('e2', 'e4');
  game.makeMove('d7', 'd5');
  game.makeMove('e4', 'd5'); // White captures Black pawn

  const material = game.getMaterialScore();
  assert.equal(material.whiteCaptured.length, 1);
  assert.equal(material.whiteCaptured[0], 'p');
  assert.equal(material.advantage.color, 'w');
  assert.equal(material.advantage.diff, 1);
});

test('AI Bot produces valid legal moves for all 3 difficulty tiers', async () => {
  const startFen = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';

  const easyMove = await calculateBotMove(startFen, 'easy');
  assert.ok(easyMove);
  assert.ok(easyMove.from && easyMove.to);

  const mediumMove = await calculateBotMove(startFen, 'medium');
  assert.ok(mediumMove);
  assert.ok(mediumMove.from && mediumMove.to);

  const proMove = await calculateBotMove(startFen, 'pro');
  assert.ok(proMove);
  assert.ok(proMove.from && proMove.to);
});

test('Hint engine provides strategic recommendation and explanation', async () => {
  const startFen = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
  const hint = await getHint(startFen);
  assert.ok(hint);
  assert.ok(hint.from);
  assert.ok(hint.to);
  assert.ok(hint.advice.length > 0);
});
