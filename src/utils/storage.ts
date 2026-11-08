import { GameSettings, MoveInfo } from '../engine/types';

const STORAGE_KEY_SAVED_GAME = 'gm_chess_active_game_v1';
const STORAGE_KEY_SETTINGS = 'gm_chess_settings_v1';
const STORAGE_KEY_STATS = 'gm_chess_stats_v1';
const STORAGE_KEY_PLAYER_NAME = 'gm_chess_player_name_v1';

export interface SavedGameState {
  fen: string;
  history: MoveInfo[];
  settings: GameSettings;
  whiteTimeRemaining: number;
  blackTimeRemaining: number;
  lastMoveTimestamp: number;
}

export interface PlayerStats {
  gamesPlayed: number;
  winsVsEasy: number;
  winsVsMedium: number;
  winsVsPro: number;
  lossesVsBot: number;
  drawsVsBot: number;
  passAndPlayGames: number;
}

const DEFAULT_SETTINGS: GameSettings = {
  mode: 'bot',
  botDifficulty: 'medium',
  playerColor: 'w',
  passAndPlayMode: 'auto-rotate',
  timeControl: 600, // 10 min default
  boardTheme: 'classic-blue',
  soundEnabled: true,
  hapticsEnabled: true,
  showLegalMoves: true,
  showCoordinates: true,
  pieceDesign: 'classic',
};

export function loadPlayerName(): string {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_PLAYER_NAME);
    return raw && raw.trim() ? raw.trim() : 'Player 1';
  } catch {
    return 'Player 1';
  }
}

export function savePlayerName(name: string): void {
  try {
    localStorage.setItem(STORAGE_KEY_PLAYER_NAME, name.trim() || 'Player 1');
  } catch {}
}

const DEFAULT_STATS: PlayerStats = {
  gamesPlayed: 0,
  winsVsEasy: 0,
  winsVsMedium: 0,
  winsVsPro: 0,
  lossesVsBot: 0,
  drawsVsBot: 0,
  passAndPlayGames: 0,
};

export function loadSettings(): GameSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_SETTINGS);
    if (!raw) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(settings: GameSettings): void {
  try {
    localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(settings));
  } catch {}
}

export function loadSavedGame(): SavedGameState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_SAVED_GAME);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function saveActiveGame(state: SavedGameState): void {
  try {
    localStorage.setItem(STORAGE_KEY_SAVED_GAME, JSON.stringify(state));
  } catch {}
}

export function clearSavedGame(): void {
  try {
    localStorage.removeItem(STORAGE_KEY_SAVED_GAME);
  } catch {}
}

export function loadStats(): PlayerStats {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_STATS);
    if (!raw) return DEFAULT_STATS;
    return { ...DEFAULT_STATS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_STATS;
  }
}

export function recordGameResult(
  mode: 'bot' | 'pass-and-play',
  botDifficulty: 'easy' | 'medium' | 'pro',
  result: 'win' | 'loss' | 'draw'
): PlayerStats {
  const stats = loadStats();
  stats.gamesPlayed++;

  if (mode === 'pass-and-play') {
    stats.passAndPlayGames++;
  } else {
    if (result === 'win') {
      if (botDifficulty === 'easy') stats.winsVsEasy++;
      else if (botDifficulty === 'medium') stats.winsVsMedium++;
      else if (botDifficulty === 'pro') stats.winsVsPro++;
    } else if (result === 'loss') {
      stats.lossesVsBot++;
    } else {
      stats.drawsVsBot++;
    }
  }

  try {
    localStorage.setItem(STORAGE_KEY_STATS, JSON.stringify(stats));
  } catch {}

  return stats;
}
