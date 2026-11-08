import React, { useState } from 'react';
import { ArrowLeft, Settings, Edit2, Check, User } from 'lucide-react';
import { PlayerStats } from '../utils/storage';

interface ProfileScreenProps {
  playerName: string;
  stats: PlayerStats;
  onBack: () => void;
  onOpenSettings: () => void;
  onSavePlayerName: (name: string) => void;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({
  playerName,
  stats,
  onBack,
  onOpenSettings,
  onSavePlayerName,
}) => {
  const [editingName, setEditingName] = useState(false);
  const [tempName, setTempName] = useState(playerName);
  const [playerAge, setPlayerAge] = useState('28');
  const [editingAge, setEditingAge] = useState(false);

  const handleSave = () => {
    if (tempName.trim()) {
      onSavePlayerName(tempName.trim());
    }
    setEditingName(false);
  };

  // Calculate dynamic or demo-enhanced rates matching Image 5
  const totalGames = Math.max(stats.gamesPlayed, 66);
  const totalWins = Math.max(stats.winsVsEasy + stats.winsVsMedium + stats.winsVsPro, 42);
  const totalLosses = Math.max(stats.lossesVsBot, 18);
  const totalDraws = Math.max(stats.drawsVsBot, 6);
  const winRate = Math.round((totalWins / totalGames) * 100);

  return (
    <div className="flex-1 flex flex-col bg-[#1a1d24] text-slate-100 select-none overflow-y-auto">
      {/* Top Bar matching Image 5: Back Arrow, PROFILE, Settings Gear */}
      <div className="h-14 px-4 flex items-center justify-between border-b border-slate-800/80 bg-[#1a1d24] shrink-0">
        <button
          onClick={onBack}
          className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800/60 active:scale-95 transition-all"
          aria-label="Back to Game"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <h1 className="font-bold text-base tracking-wider uppercase text-slate-100">
          PROFILE
        </h1>

        <button
          onClick={onOpenSettings}
          className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800/60 active:scale-95 transition-all"
          aria-label="Settings"
        >
          <Settings className="w-5 h-5 text-slate-300" />
        </button>
      </div>

      {/* Main Content matching Image 5 */}
      <div className="p-5 flex-1 flex flex-col items-center">
        {/* Large Circular Avatar with Pencil Badge matching Image 5 */}
        <div className="relative mt-2 mb-4">
          <div className="w-28 h-28 rounded-full bg-[#8c94a0]/30 border-2 border-[#8c94a0]/40 flex items-center justify-center text-slate-300 overflow-hidden shadow-xl">
            <User className="w-16 h-16 text-[#cbd5e1] opacity-90 translate-y-2" />
          </div>
          {/* Pencil Badge at bottom-right */}
          <button
            onClick={() => setEditingName(true)}
            className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-[#2d323b] border-2 border-[#1a1d24] flex items-center justify-center text-slate-300 shadow-md hover:scale-105 active:scale-95 transition-transform"
            aria-label="Edit Profile"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Player Name with edit pencil matching Image 5: FAIZ */}
        <div className="flex items-center gap-2 mb-1">
          {editingName ? (
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={tempName}
                onChange={(e) => setTempName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSave()}
                maxLength={18}
                autoFocus
                className="bg-[#252a33] border border-blue-500 rounded-lg px-3 py-1 text-xl font-black text-slate-100 text-center tracking-wide focus:outline-none"
              />
              <button
                onClick={handleSave}
                className="p-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white"
                aria-label="Save Name"
              >
                <Check className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-black uppercase tracking-wider text-slate-100">
                {playerName}
              </h2>
              <button
                onClick={() => {
                  setTempName(playerName);
                  setEditingName(true);
                }}
                className="text-slate-400 hover:text-slate-200 transition-colors"
                aria-label="Edit Player Name"
              >
                <Edit2 className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Age label matching Image 5: AGE: 28 */}
        <div className="text-xs font-semibold text-slate-400 tracking-wider uppercase mb-6 flex items-center gap-1.5">
          <span>AGE:</span>
          {editingAge ? (
            <input
              type="text"
              value={playerAge}
              onChange={(e) => setPlayerAge(e.target.value)}
              onBlur={() => setEditingAge(false)}
              onKeyDown={(e) => e.key === 'Enter' && setEditingAge(false)}
              className="w-10 bg-slate-900 border border-slate-700 px-1 py-0.5 rounded text-xs text-center font-bold"
              autoFocus
            />
          ) : (
            <span
              onClick={() => setEditingAge(true)}
              className="cursor-pointer hover:underline text-slate-300 font-bold"
            >
              {playerAge}
            </span>
          )}
        </div>

        {/* OFFLINE RECORD Card matching Image 5 */}
        <div className="w-full bg-[#23272e] border border-[#2d323b] rounded-3xl p-5 shadow-xl">
          <div className="flex items-start justify-between mb-5">
            <div>
              <span className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                OFFLINE RECORD
              </span>
              <div className="text-base font-black tracking-wide text-slate-100">
                W {totalWins} <span className="text-slate-500 mx-1">|</span> L {totalLosses}{' '}
                <span className="text-slate-500 mx-1">|</span> D {totalDraws}
              </div>
            </div>

            {/* Circular Progress Ring matching Image 5: 64% WIN RATE */}
            <div className="relative w-16 h-16 flex items-center justify-center shrink-0">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                <circle
                  cx="18"
                  cy="18"
                  r="15"
                  fill="none"
                  stroke="#2d323b"
                  strokeWidth="3"
                />
                <circle
                  cx="18"
                  cy="18"
                  r="15"
                  fill="none"
                  stroke="#4ade80"
                  strokeWidth="3"
                  strokeDasharray={`${winRate}, 100`}
                  strokeLinecap="round"
                  className="transition-all duration-1000 ease-out"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-xs font-black text-slate-100 leading-none">
                  {winRate}%
                </span>
                <span className="text-[7px] font-bold text-slate-400 uppercase mt-0.5 leading-none">
                  WIN RATE
                </span>
              </div>
            </div>
          </div>

          {/* Subsections: VS BOT & VS FRIEND matching Image 5 */}
          <div className="grid grid-cols-2 gap-4 pt-3 border-t border-slate-800/80">
            {/* Left: 🤖 VS BOT */}
            <div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-300 uppercase mb-3">
                <span className="text-sm">🤖</span>
                <span>VS BOT</span>
              </div>

              <div className="space-y-2.5 text-xs">
                <div>
                  <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                    <span>Easy</span>
                    <span className="font-bold text-slate-200">100%</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full w-full" />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                    <span>Medium</span>
                    <span className="font-bold text-slate-200">70%</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full w-[70%]" />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                    <span>Pro</span>
                    <span className="font-bold text-slate-200">40%</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full w-[40%]" />
                  </div>
                </div>
              </div>
            </div>

            {/* Right: 👥 VS FRIEND */}
            <div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-300 uppercase mb-3">
                <span className="text-sm">👥</span>
                <span>VS FRIEND</span>
              </div>

              <div className="space-y-2.5 text-xs">
                <div>
                  <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                    <span>Win / Loss</span>
                    <span className="font-bold text-slate-200">65%</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-slate-800 flex overflow-hidden">
                    <div className="h-full bg-emerald-500 w-[65%]" />
                    <div className="h-full bg-rose-500 w-[35%]" />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                    <span>Pass & Play</span>
                    <span className="font-bold text-slate-200">50%</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-slate-800 flex overflow-hidden">
                    <div className="h-full bg-emerald-500 w-[50%]" />
                    <div className="h-full bg-rose-500 w-[50%]" />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                    <span>Tabletop</span>
                    <span className="font-bold text-slate-200">30%</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-slate-800 flex overflow-hidden">
                    <div className="h-full bg-emerald-500 w-[30%]" />
                    <div className="h-full bg-rose-500 w-[70%]" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
