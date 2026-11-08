import React from 'react';
import { Volume2, VolumeX, Crown, Palette, Check } from 'lucide-react';
import { ChessPiece } from './ChessPiece';

interface SettingsSheetProps {
  isOpen: boolean;
  soundEnabled: boolean;
  boardTheme: 'classic-blue' | 'wood' | 'emerald' | 'midnight' | 'slate';
  pieceDesign: 'flat' | 'classic' | 'modern';
  onToggleSound: () => void;
  onSelectTheme: (theme: 'classic-blue' | 'wood' | 'emerald' | 'midnight' | 'slate') => void;
  onSelectPieceDesign: (design: 'flat' | 'classic' | 'modern') => void;
  onClose: () => void;
}

export const SettingsSheet: React.FC<SettingsSheetProps> = ({
  isOpen,
  soundEnabled,
  boardTheme,
  pieceDesign,
  onToggleSound,
  onSelectTheme,
  onSelectPieceDesign,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center select-none">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Bottom Sheet Card matching Image 4 */}
      <div className="relative w-full max-w-[420px] bg-[#1e2229] border-t border-[#2e3440] rounded-t-[32px] p-5 pb-8 shadow-2xl z-50 animate-in slide-in-from-bottom duration-250 text-slate-100">
        {/* Drag handle matching Image 4 */}
        <div className="w-12 h-1 bg-slate-500/70 rounded-full mx-auto mb-3" />

        <h3 className="text-xs font-bold tracking-widest text-slate-400 uppercase mb-4">
          SETTINGS
        </h3>

        {/* 1. Sound (Mute) matching Image 4 */}
        <div className="flex items-center justify-between py-2 border-b border-slate-800/80 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#252a33] flex items-center justify-center text-slate-300">
              {soundEnabled ? (
                <Volume2 className="w-4 h-4 text-slate-300" />
              ) : (
                <VolumeX className="w-4 h-4 text-slate-400" />
              )}
            </div>
            <div>
              <div className="font-semibold text-xs text-slate-100">Sound (Mute)</div>
              <div className="text-[10px] text-slate-400">
                {soundEnabled ? 'Enabled' : 'Mute'}
              </div>
            </div>
          </div>

          {/* Toggle Switch */}
          <button
            onClick={onToggleSound}
            className={`w-11 h-6 rounded-full transition-colors relative ${
              soundEnabled ? 'bg-blue-600' : 'bg-slate-700'
            }`}
            aria-label="Toggle Sound"
          >
            <div
              className={`w-4 h-4 rounded-full bg-white transition-transform absolute top-1 ${
                soundEnabled ? 'left-6' : 'left-1'
              }`}
            />
          </button>
        </div>

        {/* 2. PIECE DESIGN matching Image 4 (with NEW badge) */}
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2.5">
            <Crown className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-xs font-bold tracking-wider text-slate-400 uppercase">
              PIECE DESIGN
            </span>
            <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-blue-500/20 text-blue-400 border border-blue-500/40">
              NEW
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'flat', label: 'Flat', pieceType: 'p' as const },
              { id: 'classic', label: 'Classic', pieceType: 'n' as const },
              { id: 'modern', label: 'Modern', pieceType: 'k' as const },
            ].map((p) => (
              <button
                key={p.id}
                onClick={() => onSelectPieceDesign(p.id as any)}
                className={`py-2 px-3 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all ${
                  pieceDesign === p.id
                    ? 'bg-[#293241] border-blue-500/80 ring-1 ring-blue-500/50'
                    : 'bg-[#252a33] hover:bg-[#2b313c] border-transparent'
                }`}
              >
                <div className="w-6 h-6">
                  <ChessPiece type={p.pieceType} color="w" design={p.id as any} />
                </div>
                <span className="text-[11px] font-medium text-slate-300">{p.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* 3. BOARD THEME matching Image 4 */}
        <div>
          <div className="flex items-center gap-2 mb-2.5">
            <Palette className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-xs font-bold tracking-wider text-slate-400 uppercase">
              BOARD THEME
            </span>
          </div>

          <div className="flex items-center gap-3">
            {[
              { id: 'classic-blue', color: 'bg-[#7085a8]' },
              { id: 'wood', color: 'bg-[#b58863]' },
              { id: 'emerald', color: 'bg-[#2d6a4f]' },
              { id: 'midnight', color: 'bg-[#1e293b]' },
            ].map((th) => (
              <button
                key={th.id}
                onClick={() => onSelectTheme(th.id as any)}
                className={`w-9 h-9 rounded-full ${th.color} flex items-center justify-center shadow-md transition-transform hover:scale-105 ${
                  boardTheme === th.id
                    ? 'ring-2 ring-white ring-offset-2 ring-offset-[#1e2229] scale-105'
                    : 'opacity-85'
                }`}
                title={th.id}
              >
                {boardTheme === th.id && <Check className="w-4 h-4 text-white stroke-[3]" />}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
