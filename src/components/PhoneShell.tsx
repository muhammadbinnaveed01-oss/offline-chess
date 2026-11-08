import React from 'react';
import { Wifi, BatteryMedium } from 'lucide-react';

interface PhoneShellProps {
  children: React.ReactNode;
}

export const PhoneShell: React.FC<PhoneShellProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-[#111317] flex items-center justify-center sm:p-4 select-none">
      {/* Outer Phone Mockup Frame on Desktop / Full Screen on Mobile */}
      <div className="w-full max-w-[420px] h-screen sm:h-[860px] max-h-[100dvh] bg-[#1a1d24] sm:rounded-[42px] sm:border-[8px] sm:border-[#2d3139] sm:shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col relative text-slate-100 font-sans">
        {/* Top Speaker & Camera Punch-hole on Desktop frame */}
        <div className="hidden sm:block absolute top-2 left-1/2 -translate-x-1/2 w-28 h-4 bg-[#23272e] rounded-full z-40">
          <div className="w-2.5 h-2.5 bg-[#0f1115] rounded-full mx-auto mt-0.5 border border-slate-700/40" />
        </div>

        {/* Android Top Status Bar (Matching Image: 10:09, Wifi, Battery) */}
        <div className="h-7 px-6 pt-1 flex items-center justify-between text-xs font-semibold text-slate-300 z-30 shrink-0 bg-[#1a1d24]">
          <span className="tracking-tight text-[11px] font-mono">10:09</span>
          <div className="flex items-center gap-1.5 opacity-80">
            <Wifi className="w-3.5 h-3.5" />
            <BatteryMedium className="w-4 h-4" />
          </div>
        </div>

        {/* Inner Phone Content */}
        <div className="flex-1 flex flex-col relative overflow-hidden bg-[#1a1d24]">
          {children}
        </div>
      </div>
    </div>
  );
};
