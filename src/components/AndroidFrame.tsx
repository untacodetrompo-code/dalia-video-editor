import React, { ReactNode } from 'react';
import { Smartphone, Monitor } from 'lucide-react';

interface AndroidFrameProps {
  children: ReactNode;
  isFramed: boolean;
  onToggleFrame: () => void;
}

export const AndroidFrame: React.FC<AndroidFrameProps> = ({
  children,
  isFramed,
  onToggleFrame
}) => {
  return (
    <div className="min-h-screen w-full bg-[#07080a] text-neutral-100 flex flex-col items-center justify-center font-sans antialiased selection:bg-neutral-800 selection:text-white">
      {/* Top Desktop Helper Bar (visible on md screens to toggle view mode) */}
      <header className="hidden md:flex items-center justify-between w-full max-w-5xl px-6 py-3 border-b border-neutral-900/60 bg-[#0a0b0e]/80 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <span className="text-xs uppercase tracking-widest text-neutral-500 font-semibold">Prototipo Android</span>
          <span className="text-neutral-700">·</span>
          <span className="text-xs text-neutral-400">Dalia Mobile Video Studio</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onToggleFrame}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-neutral-900 hover:bg-neutral-800 text-neutral-300 border border-neutral-800 transition-colors"
            title="Alternar entre marco de teléfono y pantalla completa"
          >
            {isFramed ? (
              <>
                <Monitor className="w-3.5 h-3.5 text-neutral-400" />
                <span>Modo Pantalla Completa</span>
              </>
            ) : (
              <>
                <Smartphone className="w-3.5 h-3.5 text-neutral-400" />
                <span>Ver Marco de Teléfono</span>
              </>
            )}
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="w-full flex-1 flex items-center justify-center p-0 md:p-6 overflow-hidden">
        {isFramed ? (
          /* Realistic Android Phone Chassis */
          <div className="relative w-full max-w-[412px] h-[100dvh] md:h-[870px] bg-[#0c0d11] md:rounded-[44px] md:border-[10px] md:border-[#1e2029] shadow-2xl shadow-black/80 flex flex-col overflow-hidden md:ring-1 md:ring-neutral-800/80">
            {/* Phone Speaker & Camera Punch-hole */}
            <div className="relative z-30 pt-2 px-6 flex items-center justify-between text-[11px] font-mono text-neutral-400 select-none bg-[#0c0d11] shrink-0">
              <span className="font-semibold tracking-tight text-neutral-200">14:00</span>
              {/* Center Punch-hole Camera */}
              <div className="w-3 h-3 rounded-full bg-black ring-2 ring-neutral-900 shadow-inner mx-auto -ml-3"></div>
              <div className="flex items-center gap-1.5 text-neutral-300 text-[10px]">
                <span className="text-[9px] font-sans font-medium text-neutral-400">5G</span>
                {/* Battery Icon */}
                <div className="w-4 h-2 border border-neutral-400 rounded-[2px] p-[1px] flex items-center">
                  <div className="w-2.5 h-full bg-neutral-300 rounded-[1px]"></div>
                </div>
              </div>
            </div>

            {/* App Screen Container */}
            <div className="relative flex-1 flex flex-col overflow-hidden bg-[#0c0d11]">
              {children}
            </div>

            {/* Android Navigation Gesture Bar */}
            <div className="h-4 pb-2 flex items-center justify-center bg-[#0c0d11] shrink-0">
              <div className="w-28 h-1 bg-neutral-600/70 rounded-full"></div>
            </div>
          </div>
        ) : (
          /* Edge to Edge Responsive Mode */
          <div className="w-full max-w-md h-[100dvh] bg-[#0c0d11] flex flex-col overflow-hidden shadow-2xl">
            {children}
          </div>
        )}
      </main>
    </div>
  );
};
