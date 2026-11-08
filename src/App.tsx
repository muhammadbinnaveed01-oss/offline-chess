import React, { useState, useEffect, useCallback } from 'react';
import { ChessGame } from './engine/chessGame';
import { calculateBotMove, getHint } from './engine/aiBot';
import {
  BotDifficulty,
  GameOverState,
  GameSettings,
  MaterialScore,
  MoveInfo,
  PassAndPlaySubMode,
  PieceColor,
  PieceType,
  Square,
  TimeControl,
} from './engine/types';
import { soundManager } from './utils/audio';
import {
  clearSavedGame,
  loadPlayerName,
  loadSettings,
  loadStats,
  recordGameResult,
  savePlayerName,
  saveSettings,
} from './utils/storage';

import { PhoneShell } from './components/PhoneShell';
import { ChessBoard } from './components/ChessBoard';
import { GameHeader } from './components/GameHeader';
import { GameControls } from './components/GameControls';
import { PromotionModal } from './components/PromotionModal';
import { GameOverModal } from './components/GameOverModal';
import { BotSetupSheet } from './components/BotSetupSheet';
import { FriendSetupSheet } from './components/FriendSetupSheet';
import { SettingsSheet } from './components/SettingsSheet';
import { ProfileScreen } from './components/ProfileScreen';
import { RulesModal } from './components/RulesModal';
import { MoveHistoryDrawer } from './components/MoveHistoryDrawer';
import { Settings, User, Home, BookOpen, Clock, Users } from 'lucide-react';

export default function App() {
  // Navigation: 'home' | 'game' | 'profile'
  const [currentView, setCurrentView] = useState<'home' | 'game' | 'profile'>('home');

  // Game settings, stats, and custom player name
  const [settings, setSettings] = useState<GameSettings>(() => loadSettings());
  const [stats, setStats] = useState(() => loadStats());
  const [playerName, setPlayerName] = useState<string>(() => {
    const saved = loadPlayerName();
    return saved === 'Player 1' ? 'FAIZ' : saved; // Default to FAIZ per user's reference image 5
  });
  const [pieceDesign, setPieceDesign] = useState<'flat' | 'classic' | 'modern'>(
    () => settings.pieceDesign || 'classic'
  );

  // Chess engine instance
  const [game, setGame] = useState<ChessGame>(() => new ChessGame());

  // Reactive board state
  const [board, setBoard] = useState(game.getBoard());
  const [turn, setTurn] = useState<PieceColor>(game.getTurn());
  const [history, setHistory] = useState<MoveInfo[]>([]);
  const [materialScore, setMaterialScore] = useState<MaterialScore>(() => game.getMaterialScore());

  // Board interaction states
  const [selectedSquare, setSelectedSquare] = useState<Square | null>(null);
  const [legalMoves, setLegalMoves] = useState<{ to: Square; captured: boolean; isPromotion: boolean }[]>([]);
  const [lastMove, setLastMove] = useState<{ from: Square; to: Square } | null>(null);
  const [checkSquare, setCheckSquare] = useState<Square | null>(null);
  const [hintMove, setHintMove] = useState<{ from: Square; to: Square; advice: string } | null>(null);
  const [hintNotification, setHintNotification] = useState<string | null>(null);

  // Promotion pending state
  const [pendingPromotion, setPendingPromotion] = useState<{ from: Square; to: Square } | null>(null);

  // Clocks / Timers
  const [whiteTime, setWhiteTime] = useState<number>(settings.timeControl);
  const [blackTime, setBlackTime] = useState<number>(settings.timeControl);

  // AI thinking state
  const [isBotThinking, setIsBotThinking] = useState(false);

  // Game over state
  const [gameOverState, setGameOverState] = useState<GameOverState>({
    isOver: false,
    winner: null,
    reason: null,
    description: '',
  });
  const [showGameOverModal, setShowGameOverModal] = useState(false);

  // Bottom Sheets & Modals matching reference images
  const [showBotSetup, setShowBotSetup] = useState(false);
  const [showFriendSetup, setShowFriendSetup] = useState(false);
  const [showSettingsSheet, setShowSettingsSheet] = useState(false);
  const [showRulesModal, setShowRulesModal] = useState(false);
  const [showHistoryDrawer, setShowHistoryDrawer] = useState(false);

  // Sync audio preferences
  useEffect(() => {
    soundManager.setSoundEnabled(settings.soundEnabled);
    soundManager.setHapticsEnabled(settings.hapticsEnabled);
    saveSettings(settings);
  }, [settings]);

  // Support ?autostart=1 query parameter for automated verification
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('autostart') === '1') {
        startBotGame('pro', 'w', 600);
      }
    }
  }, []);

  // Sync King check square whenever board updates
  useEffect(() => {
    if (game.isInCheck()) {
      const currentKing = game.getKingSquare(turn);
      setCheckSquare(currentKing);
    } else {
      setCheckSquare(null);
    }
  }, [turn, game]);

  // Handle countdown timers
  useEffect(() => {
    if (currentView !== 'game' || settings.timeControl === 0 || gameOverState.isOver) {
      return;
    }

    const timer = setInterval(() => {
      if (turn === 'w') {
        setWhiteTime((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            handleTimeout('w');
            return 0;
          }
          return prev - 1;
        });
      } else {
        setBlackTime((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            handleTimeout('b');
            return 0;
          }
          return prev - 1;
        });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [currentView, turn, settings.timeControl, gameOverState.isOver]);

  // Timeout handler
  const handleTimeout = (timedOutColor: PieceColor) => {
    const winner: PieceColor = timedOutColor === 'w' ? 'b' : 'w';
    const state: GameOverState = {
      isOver: true,
      winner,
      reason: 'timeout',
      description: `${timedOutColor === 'w' ? 'White' : 'Black'} ran out of time! ${
        winner === 'w' ? 'White' : 'Black'
      } wins on time.`,
    };
    finishGame(state);
  };

  // Bot move trigger
  useEffect(() => {
    if (
      currentView !== 'game' ||
      settings.mode !== 'bot' ||
      gameOverState.isOver ||
      isBotThinking
    ) {
      return;
    }

    const botColor: PieceColor = settings.playerColor === 'w' ? 'b' : 'w';
    if (turn === botColor) {
      triggerBotMove();
    }
  }, [turn, currentView, settings.mode, settings.playerColor, gameOverState.isOver]);

  // Trigger AI move with natural delay
  const triggerBotMove = useCallback(async () => {
    setIsBotThinking(true);
    const delay = Math.floor(Math.random() * 350) + 400;
    const currentFen = game.getFen();

    setTimeout(async () => {
      try {
        const move = await calculateBotMove(currentFen, settings.botDifficulty);
        if (move) {
          executeMove(move.from, move.to, move.promotion || 'q');
        }
      } catch (err) {
        console.error('Error calculating bot move', err);
      } finally {
        setIsBotThinking(false);
      }
    }, delay);
  }, [game, settings.botDifficulty, settings.playerColor]);

  const finishGame = useCallback((endState: GameOverState) => {
    setGameOverState(endState);
    setShowGameOverModal(true);
    clearSavedGame();

    const isWin =
      settings.mode === 'bot'
        ? endState.winner === settings.playerColor
        : endState.winner !== null;

    soundManager.playGameOver(isWin);
    soundManager.triggerHaptic('heavy');

    const result =
      endState.winner === 'draw'
        ? 'draw'
        : endState.winner === settings.playerColor
        ? 'win'
        : 'loss';

    const updatedStats = recordGameResult(settings.mode, settings.botDifficulty, result);
    setStats(updatedStats);
  }, [settings.mode, settings.botDifficulty, settings.playerColor]);

  // Execute a verified legal move
  const executeMove = useCallback((from: Square, to: Square, promotionPiece: PieceType = 'q') => {
    const moveInfo = game.makeMove(from, to, promotionPiece);
    if (!moveInfo) return false;

    if (moveInfo.flags.includes('k') || moveInfo.flags.includes('q')) {
      soundManager.playCastle();
      soundManager.triggerHaptic('medium');
    } else if (moveInfo.captured) {
      soundManager.playCapture();
      soundManager.triggerHaptic('medium');
    } else if (moveInfo.promotion) {
      soundManager.playPromotion();
      soundManager.triggerHaptic('success');
    } else {
      soundManager.playMove();
      soundManager.triggerHaptic('light');
    }

    setBoard(game.getBoard());
    setTurn(game.getTurn());
    setHistory(game.getHistory());
    setMaterialScore(game.getMaterialScore());
    setLastMove({ from, to });
    setSelectedSquare(null);
    setLegalMoves([]);
    setHintMove(null);
    setHintNotification(null);

    const endState = game.getGameOverState();
    if (endState.isOver) {
      finishGame(endState);
      return true;
    }

    if (game.isInCheck()) {
      soundManager.playCheck();
      soundManager.triggerHaptic('warning');
    }

    return true;
  }, [game, finishGame]);

  const handleSquareClick = useCallback((square: Square) => {
    if (currentView !== 'game') return;
    if (gameOverState.isOver || isBotThinking) return;

    if (settings.mode === 'bot' && turn !== settings.playerColor) {
      return;
    }

    const clickedPiece = game.getPiece(square);

    if (selectedSquare) {
      if (selectedSquare === square) {
        setSelectedSquare(null);
        setLegalMoves([]);
        return;
      }

      const isLegal = legalMoves.some((m) => m.to === square);
      if (isLegal) {
        if (game.isPromotionMove(selectedSquare, square)) {
          setPendingPromotion({ from: selectedSquare, to: square });
          return;
        }

        executeMove(selectedSquare, square);
        return;
      }

      if (clickedPiece && clickedPiece.color === turn) {
        setSelectedSquare(square);
        const moves = game.getLegalMovesFrom(square);
        setLegalMoves(moves);
        return;
      }

      setSelectedSquare(null);
      setLegalMoves([]);
      return;
    }

    if (clickedPiece && clickedPiece.color === turn) {
      setSelectedSquare(square);
      const moves = game.getLegalMovesFrom(square);
      setLegalMoves(moves);
    }
  }, [currentView, gameOverState.isOver, isBotThinking, settings.mode, turn, settings.playerColor, game, selectedSquare, legalMoves, executeMove]);

  const handlePieceDrop = useCallback((from: Square, to: Square) => {
    if (currentView !== 'game') return;
    if (gameOverState.isOver || isBotThinking) return;
    if (settings.mode === 'bot' && turn !== settings.playerColor) return;

    const legal = game.getLegalMovesFrom(from);
    const targetMove = legal.find((m) => m.to === to);
    if (!targetMove) return;

    if (game.isPromotionMove(from, to)) {
      setPendingPromotion({ from, to });
      return;
    }

    executeMove(from, to);
  }, [currentView, gameOverState.isOver, isBotThinking, settings.mode, turn, settings.playerColor, game, executeMove]);

  const handleSelectPromotion = (piece: PieceType) => {
    if (!pendingPromotion) return;
    const { from, to } = pendingPromotion;
    setPendingPromotion(null);
    executeMove(from, to, piece);
  };

  const handleUndo = () => {
    if (isBotThinking || history.length === 0) return;
    const plies = settings.mode === 'bot' && history.length >= 2 ? 2 : 1;
    game.undo(plies);

    setBoard(game.getBoard());
    setTurn(game.getTurn());
    setHistory(game.getHistory());
    setMaterialScore(game.getMaterialScore());
    setSelectedSquare(null);
    setLegalMoves([]);
    setHintMove(null);
    setHintNotification(null);

    const hist = game.getHistory();
    if (hist.length > 0) {
      const last = hist[hist.length - 1];
      setLastMove({ from: last.from, to: last.to });
    } else {
      setLastMove(null);
    }
  };

  const handleHint = async () => {
    if (isBotThinking || gameOverState.isOver) return;
    try {
      const hint = await getHint(game.getFen());
      if (hint) {
        setHintMove(hint);
        setHintNotification(hint.advice);
        soundManager.triggerHaptic('light');
        setTimeout(() => setHintNotification(null), 4000);
      }
    } catch (err) {
      console.error('Error generating hint', err);
    }
  };

  const handleResign = () => {
    const resigner = turn;
    const winner: PieceColor = resigner === 'w' ? 'b' : 'w';
    const state: GameOverState = {
      isOver: true,
      winner,
      reason: 'resignation',
      description: `${resigner === 'w' ? 'White' : 'Black'} has resigned. ${
        winner === 'w' ? 'White' : 'Black'
      } is victorious.`,
    };
    finishGame(state);
  };

  // Start vs Bot match from Image 3
  const startBotGame = (
    difficulty: BotDifficulty,
    color: PieceColor,
    timer: TimeControl
  ) => {
    const newSettings: GameSettings = {
      ...settings,
      mode: 'bot',
      botDifficulty: difficulty,
      playerColor: color,
      timeControl: timer,
    };
    const newGame = new ChessGame();
    setGame(newGame);
    setBoard(newGame.getBoard());
    setTurn('w');
    setHistory([]);
    setMaterialScore(newGame.getMaterialScore());
    setSelectedSquare(null);
    setLegalMoves([]);
    setLastMove(null);
    setCheckSquare(null);
    setHintMove(null);
    setHintNotification(null);
    setWhiteTime(timer);
    setBlackTime(timer);
    setGameOverState({ isOver: false, winner: null, reason: null, description: '' });
    setShowGameOverModal(false);
    setSettings(newSettings);
    setShowBotSetup(false);
    setCurrentView('game');
  };

  // Start Pass-and-Play match
  const startFriendGame = (subMode: PassAndPlaySubMode, timer: TimeControl) => {
    const newSettings: GameSettings = {
      ...settings,
      mode: 'pass-and-play',
      passAndPlayMode: subMode,
      timeControl: timer,
    };
    const newGame = new ChessGame();
    setGame(newGame);
    setBoard(newGame.getBoard());
    setTurn('w');
    setHistory([]);
    setMaterialScore(newGame.getMaterialScore());
    setSelectedSquare(null);
    setLegalMoves([]);
    setLastMove(null);
    setCheckSquare(null);
    setHintMove(null);
    setHintNotification(null);
    setWhiteTime(timer);
    setBlackTime(timer);
    setGameOverState({ isOver: false, winner: null, reason: null, description: '' });
    setShowGameOverModal(false);
    setSettings(newSettings);
    setShowFriendSetup(false);
    setCurrentView('game');
  };

  const handleSavePlayerName = (newName: string) => {
    const trimmed = newName.trim() || 'FAIZ';
    setPlayerName(trimmed);
    savePlayerName(trimmed);
  };

  // Determine board orientation
  const getBoardOrientation = (): PieceColor => {
    if (settings.mode === 'pass-and-play') {
      if (settings.passAndPlayMode === 'auto-rotate') {
        return turn;
      }
      return 'w';
    }
    return settings.playerColor;
  };

  const isTabletop =
    settings.mode === 'pass-and-play' && settings.passAndPlayMode === 'tabletop';

  const boardOrientation = getBoardOrientation();
  const topPlayerColor: PieceColor = boardOrientation === 'w' ? 'b' : 'w';
  const bottomPlayerColor: PieceColor = boardOrientation === 'w' ? 'w' : 'b';

  return (
    <PhoneShell>
      {/* 1. PROFILE SCREEN VIEW (Matching Image 5) */}
      {currentView === 'profile' && (
        <ProfileScreen
          playerName={playerName}
          stats={stats}
          onBack={() => setCurrentView('home')}
          onOpenSettings={() => setShowSettingsSheet(true)}
          onSavePlayerName={handleSavePlayerName}
        />
      )}

      {/* 2. HOME SCREEN VIEW (Matching Image 2) */}
      {currentView === 'home' && (
        <div className="flex-1 flex flex-col justify-between p-4 bg-[#1a1d24]">
          {/* Top Bar matching Image 2: Avatar on left, Settings gear on right */}
          <div className="h-12 flex items-center justify-between shrink-0">
            <button
              onClick={() => setCurrentView('profile')}
              className="w-10 h-10 rounded-full bg-[#2d323b] border border-slate-700/60 flex items-center justify-center text-slate-300 hover:scale-105 active:scale-95 transition-all shadow-md"
              aria-label="Open Profile"
            >
              <User className="w-5 h-5" />
            </button>

            <button
              onClick={() => setShowSettingsSheet(true)}
              className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800/60 active:scale-95 transition-all"
              aria-label="Settings"
            >
              <Settings className="w-6 h-6 text-slate-300" />
            </button>
          </div>

          {/* Center Chessboard in background matching Image 2 */}
          <div className="flex-1 flex items-center justify-center my-auto py-2">
            <ChessBoard
              board={board}
              orientation="w"
              selectedSquare={null}
              legalMoves={[]}
              lastMove={null}
              checkSquare={null}
              hintMove={null}
              theme={settings.boardTheme}
              pieceDesign={pieceDesign}
              showCoordinates={settings.showCoordinates}
              onSquareClick={() => setShowBotSetup(true)}
              onPieceDrop={() => {}}
            />
          </div>

          {/* Bottom Action Cards matching Image 2 */}
          <div className="space-y-3 mb-2 shrink-0">
            {/* Button 1: PLAY VS BOT matching Image 2 */}
            <button
              onClick={() => setShowBotSetup(true)}
              className="w-full py-3.5 px-4 rounded-2xl font-bold text-xs sm:text-sm tracking-wider uppercase bg-[#2b4c7e] hover:bg-[#345b96] text-white flex items-center justify-center gap-3 shadow-lg active:scale-98 transition-all"
            >
              <span className="text-xl">🤖</span>
              <span>PLAY VS BOT</span>
            </button>

            {/* Button 2: PLAY WITH FRIEND matching Image 2 */}
            <button
              onClick={() => setShowFriendSetup(true)}
              className="w-full py-3.5 px-4 rounded-2xl font-bold text-xs sm:text-sm tracking-wider uppercase bg-[#23272e] hover:bg-[#2c323b] text-slate-200 border border-[#2d323b] flex items-center justify-center gap-3 shadow-md active:scale-98 transition-all"
            >
              <Users className="w-5 h-5 text-slate-300" />
              <span>PLAY WITH FRIEND</span>
            </button>
          </div>

          {/* Bottom Navigation Footer matching Image 2 */}
          <div className="h-12 border-t border-slate-800/80 -mx-4 -mb-4 px-6 flex items-center justify-around bg-[#1a1d24] shrink-0 text-slate-400">
            <button
              onClick={() => setCurrentView('home')}
              className="p-2 text-white transition-colors"
              title="Home"
              aria-label="Home"
            >
              <Home className="w-5 h-5" />
            </button>

            <button
              onClick={() => setShowRulesModal(true)}
              className="p-2 hover:text-white transition-colors"
              title="Rules & Tactics"
              aria-label="Rules and Guide"
            >
              <BookOpen className="w-5 h-5" />
            </button>

            <button
              onClick={() => setShowHistoryDrawer(true)}
              className="p-2 hover:text-white transition-colors"
              title="Move History"
              aria-label="Move History"
            >
              <Clock className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* 3. ACTIVE IN-GAME SCREEN VIEW (Matching Image 1) */}
      {currentView === 'game' && (
        <div className="flex-1 flex flex-col justify-between p-3 sm:p-4 bg-[#1a1d24] gap-2">
          {/* Top Bar matching Image 1: Avatar on left, OFFLINE CHESS title, Settings on right */}
          <div className="h-11 flex items-center justify-between shrink-0">
            <button
              onClick={() => setCurrentView('profile')}
              className="w-9 h-9 rounded-full bg-[#2d323b] border border-slate-700/60 flex items-center justify-center text-slate-300 hover:scale-105 active:scale-95 transition-all shadow-md"
              aria-label="Profile"
            >
              <User className="w-4 h-4" />
            </button>

            <h1 className="font-black text-sm tracking-widest text-slate-100 uppercase">
              OFFLINE CHESS
            </h1>

            <button
              onClick={() => setShowSettingsSheet(true)}
              className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800/60 active:scale-95 transition-all"
              aria-label="Settings"
            >
              <Settings className="w-5 h-5 text-slate-300" />
            </button>
          </div>

          {/* Top Opponent Card matching Image 1 */}
          <GameHeader
            playerColor={topPlayerColor}
            isCurrentTurn={turn === topPlayerColor}
            timeRemaining={topPlayerColor === 'w' ? whiteTime : blackTime}
            hasTimer={settings.timeControl > 0}
            isBot={settings.mode === 'bot' && topPlayerColor !== settings.playerColor}
            botDifficulty={settings.botDifficulty}
            isThinking={isBotThinking && turn === topPlayerColor}
            capturedPieces={
              topPlayerColor === 'w' ? materialScore.whiteCaptured : materialScore.blackCaptured
            }
            materialAdvantage={
              materialScore.advantage.color === topPlayerColor
                ? materialScore.advantage.diff
                : 0
            }
            isFlipped={isTabletop}
            customName={settings.mode === 'pass-and-play' ? 'PLAYER 2' : undefined}
          />

          {/* Hint Advice Banner (if active) */}
          {hintNotification && (
            <div className="w-full max-w-[390px] sm:max-w-[420px] mx-auto px-3 py-1.5 bg-emerald-950/90 border border-emerald-800 text-emerald-300 text-xs font-semibold rounded-xl flex items-center justify-between shadow-lg">
              <span>💡 {hintNotification}</span>
              <button
                onClick={() => setHintNotification(null)}
                className="text-emerald-400 hover:text-white text-xs font-bold pl-2"
              >
                ✕
              </button>
            </div>
          )}

          {/* Center Chessboard matching Image 1 */}
          <div className="flex-1 flex items-center justify-center my-auto py-1">
            <ChessBoard
              board={board}
              orientation={boardOrientation}
              selectedSquare={selectedSquare}
              legalMoves={legalMoves}
              lastMove={lastMove}
              checkSquare={checkSquare}
              hintMove={hintMove}
              isTabletopMode={isTabletop}
              theme={settings.boardTheme}
              pieceDesign={pieceDesign}
              showCoordinates={settings.showCoordinates}
              onSquareClick={handleSquareClick}
              onPieceDrop={handlePieceDrop}
            />
          </div>

          {/* Bottom Player Card matching Image 1 */}
          <GameHeader
            playerColor={bottomPlayerColor}
            isCurrentTurn={turn === bottomPlayerColor}
            timeRemaining={bottomPlayerColor === 'w' ? whiteTime : blackTime}
            hasTimer={settings.timeControl > 0}
            isBot={settings.mode === 'bot' && bottomPlayerColor !== settings.playerColor}
            botDifficulty={settings.botDifficulty}
            isThinking={isBotThinking && turn === bottomPlayerColor}
            capturedPieces={
              bottomPlayerColor === 'w' ? materialScore.whiteCaptured : materialScore.blackCaptured
            }
            materialAdvantage={
              materialScore.advantage.color === bottomPlayerColor
                ? materialScore.advantage.diff
                : 0
            }
            customName={playerName}
          />

          {/* Bottom Action Bar matching Image 1: UNDO, HINT, RESIGN */}
          <GameControls
            canUndo={history.length > 0}
            isBotThinking={isBotThinking}
            onUndo={handleUndo}
            onHint={handleHint}
            onResign={handleResign}
          />
        </div>
      )}

      {/* Play vs Bot Bottom Sheet matching Image 3 */}
      <BotSetupSheet
        isOpen={showBotSetup}
        initialDifficulty={settings.botDifficulty}
        initialColor={settings.playerColor}
        initialTime={settings.timeControl}
        onStart={startBotGame}
        onClose={() => setShowBotSetup(false)}
      />

      {/* Play with Friend Bottom Sheet */}
      <FriendSetupSheet
        isOpen={showFriendSetup}
        initialMode={settings.passAndPlayMode}
        initialTime={settings.timeControl}
        onStart={startFriendGame}
        onClose={() => setShowFriendSetup(false)}
      />

      {/* Settings Bottom Sheet matching Image 4 */}
      <SettingsSheet
        isOpen={showSettingsSheet}
        soundEnabled={settings.soundEnabled}
        boardTheme={settings.boardTheme}
        pieceDesign={pieceDesign}
        onToggleSound={() =>
          setSettings((s) => ({ ...s, soundEnabled: !s.soundEnabled }))
        }
        onSelectTheme={(th) => {
          setSettings((s) => {
            const updated = { ...s, boardTheme: th };
            saveSettings(updated);
            return updated;
          });
        }}
        onSelectPieceDesign={(d) => {
          setPieceDesign(d);
          setSettings((s) => {
            const updated = { ...s, pieceDesign: d };
            saveSettings(updated);
            return updated;
          });
        }}
        onClose={() => setShowSettingsSheet(false)}
      />

      {/* Rules & Tactics Modal */}
      <RulesModal isOpen={showRulesModal} onClose={() => setShowRulesModal(false)} />

      {/* Move History Drawer */}
      <MoveHistoryDrawer
        moves={history}
        isOpen={showHistoryDrawer}
        onClose={() => setShowHistoryDrawer(false)}
      />

      {/* Pawn Promotion Modal */}
      {pendingPromotion && (
        <PromotionModal
          color={turn}
          onSelectPiece={handleSelectPromotion}
          onCancel={() => {
            setPendingPromotion(null);
            setSelectedSquare(null);
            setLegalMoves([]);
          }}
        />
      )}

      {/* Game Over Modal */}
      {showGameOverModal && (
        <GameOverModal
          gameOverState={gameOverState}
          humanPlayerColor={settings.playerColor}
          isBotMode={settings.mode === 'bot'}
          totalMoves={history.length}
          onRematch={() => {
            if (settings.mode === 'bot') {
              startBotGame(settings.botDifficulty, settings.playerColor, settings.timeControl);
            } else {
              startFriendGame(settings.passAndPlayMode, settings.timeControl);
            }
          }}
          onReviewBoard={() => setShowGameOverModal(false)}
          onGoHome={() => {
            setShowGameOverModal(false);
            setCurrentView('home');
          }}
        />
      )}
    </PhoneShell>
  );
}
