import React from 'react';
import { Play, Pause, SkipBack, SkipForward, RotateCcw } from 'lucide-react';

interface PlaybackControlsProps {
  isPlaying: boolean;
  onTogglePlay: () => void;
  onPrev: () => void;
  onNext: () => void;
  onReset: () => void;
  currentTime: number;
  totalDuration: number;
}

export const PlaybackControls: React.FC<PlaybackControlsProps> = ({
  isPlaying,
  onTogglePlay,
  onPrev,
  onNext,
  onReset,
  currentTime,
  totalDuration,
}) => {
  // Format seconds to mm:ss:ff
  const formatTimecode = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const secs = Math.floor(sec % 60);
    const frames = Math.floor((sec % 1) * 30); // 30 fps
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}:${String(frames).padStart(2, '0')}`;
  };

  return (
    <div className="h-11 px-4 flex items-center justify-between border-y border-neutral-900 bg-[#0e1015] z-10 shrink-0 select-none">
      {/* Timecode display */}
      <div className="flex items-center gap-1 font-mono text-[11px] tabular-nums text-neutral-400">
        <span className="text-neutral-200 font-semibold">{formatTimecode(currentTime)}</span>
        <span className="text-neutral-600">/</span>
        <span className="text-neutral-500">{formatTimecode(totalDuration)}</span>
      </div>

      {/* Center Playback Buttons */}
      <div className="flex items-center gap-2">
        {/* Reset to Start */}
        <button
          onClick={onReset}
          className="w-8 h-8 rounded-full flex items-center justify-center text-neutral-400 hover:text-white hover:bg-neutral-800/60 active:scale-90 transition-all"
          title="Rebobinar al inicio"
          aria-label="Ir al inicio"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>

        {/* Previous Clip/Second */}
        <button
          onClick={onPrev}
          className="w-8 h-8 rounded-full flex items-center justify-center text-neutral-300 hover:text-white hover:bg-neutral-800/80 active:scale-90 transition-all"
          title="Clip anterior (-1s)"
          aria-label="Clip o segundo anterior"
        >
          <SkipBack className="w-4 h-4 fill-neutral-400/20" />
        </button>

        {/* Play / Pause Toggle Button */}
        <button
          onClick={onTogglePlay}
          className="w-10 h-10 rounded-full flex items-center justify-center bg-white text-neutral-900 hover:bg-neutral-200 active:scale-95 transition-all shadow-md"
          title={isPlaying ? 'Pausar (Espacio)' : 'Reproducir (Espacio)'}
          aria-label={isPlaying ? 'Pausar' : 'Reproducir'}
        >
          {isPlaying ? (
            <Pause className="w-4 h-4 fill-neutral-900" />
          ) : (
            <Play className="w-4 h-4 fill-neutral-900 ml-0.5" />
          )}
        </button>

        {/* Next Clip/Second */}
        <button
          onClick={onNext}
          className="w-8 h-8 rounded-full flex items-center justify-center text-neutral-300 hover:text-white hover:bg-neutral-800/80 active:scale-90 transition-all"
          title="Siguiente clip (+1s)"
          aria-label="Siguiente clip o segundo"
        >
          <SkipForward className="w-4 h-4 fill-neutral-400/20" />
        </button>
      </div>

      {/* Frame indicator & quick loop */}
      <div className="flex items-center gap-1.5 text-neutral-500 text-[10px] font-mono">
        <span className="px-1.5 py-0.5 rounded bg-neutral-900 border border-neutral-800 text-neutral-400">
          30 FPS
        </span>
      </div>
    </div>
  );
};
