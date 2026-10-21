import React from 'react';
import { Music, Volume2, VolumeX, Plus, Trash2, X, Sparkles } from 'lucide-react';
import { AudioClip } from '../../types/editor';
import { SAMPLE_AUDIO_LIBRARY } from '../../data/sampleMedia';

interface AudioPanelProps {
  onClose: () => void;
  audioClips: AudioClip[];
  onAddAudio: (clip: AudioClip) => void;
  onRemoveAudio: (id: string) => void;
  onUpdateVolume: (id: string, volume: number) => void;
  currentTime: number;
}

export const AudioPanel: React.FC<AudioPanelProps> = ({
  onClose,
  audioClips,
  onAddAudio,
  onRemoveAudio,
  onUpdateVolume,
  currentTime,
}) => {
  const currentAudio = audioClips[0] || null;

  const handleSelectTrack = (track: typeof SAMPLE_AUDIO_LIBRARY[0]) => {
    const newAudio: AudioClip = {
      id: `audio-${Date.now()}`,
      title: track.title,
      duration: track.duration,
      startTime: currentTime,
      category: track.category,
      volume: 0.8,
      waveform: track.waveform,
    };
    onAddAudio(newAudio);
  };

  return (
    <div className="absolute inset-x-0 bottom-16 bg-[#13151b] border-t border-neutral-800 rounded-t-2xl z-30 shadow-2xl flex flex-col max-h-[350px] animate-in slide-in-from-bottom-6 duration-200">
      {/* Header */}
      <div className="px-4 py-2.5 flex items-center justify-between border-b border-neutral-800/80">
        <div>
          <h2 className="text-xs font-semibold text-white flex items-center gap-1.5">
            <Music className="w-3.5 h-3.5 text-emerald-400" />
            <span>Pistas de Audio y Efectos</span>
          </h2>
          <p className="text-[10px] text-neutral-400">
            Añade música o efectos de sonido en la línea de tiempo
          </p>
        </div>
        <button
          onClick={onClose}
          className="w-7 h-7 rounded-full flex items-center justify-center text-neutral-400 hover:text-white hover:bg-neutral-800"
          aria-label="Cerrar panel"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
        {/* Active Audio Clip Volume & Controls if present */}
        {currentAudio && (
          <div className="p-3 rounded-xl bg-neutral-900 border border-neutral-800">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-emerald-950/80 border border-emerald-800/60 flex items-center justify-center text-emerald-300">
                  <Music className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h4 className="text-xs font-medium text-white truncate max-w-[170px]">
                    {currentAudio.title}
                  </h4>
                  <span className="text-[9px] text-neutral-400 font-mono">
                    Duración: {currentAudio.duration}s
                  </span>
                </div>
              </div>
              <button
                onClick={() => onRemoveAudio(currentAudio.id)}
                className="w-7 h-7 rounded-lg flex items-center justify-center text-red-400 hover:bg-red-950/50"
                title="Quitar pista de audio"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Volume slider */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-[10px]">
                <span className="text-neutral-400 flex items-center gap-1">
                  {currentAudio.volume === 0 ? (
                    <VolumeX className="w-3 h-3 text-red-400" />
                  ) : (
                    <Volume2 className="w-3 h-3 text-emerald-400" />
                  )}
                  <span>Volumen</span>
                </span>
                <span className="font-mono text-neutral-200">
                  {Math.round(currentAudio.volume * 100)}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={currentAudio.volume}
                onChange={(e) =>
                  onUpdateVolume(currentAudio.id, parseFloat(e.target.value))
                }
                className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
              />
            </div>
          </div>
        )}

        {/* Royalty-Free Sound Library */}
        <div>
          <label className="text-[10px] font-medium text-neutral-400 block mb-2">
            Música y Efectos Predefinidos
          </label>
          <div className="space-y-2">
            {SAMPLE_AUDIO_LIBRARY.map((track) => (
              <div
                key={track.id}
                className="flex items-center justify-between p-2.5 rounded-xl bg-neutral-900/80 hover:bg-neutral-800/80 border border-neutral-800 transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-neutral-800 flex items-center justify-center text-neutral-300">
                    <Music className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h5 className="text-xs font-medium text-white">{track.title}</h5>
                    <div className="flex items-center gap-1.5 text-[9px] text-neutral-400">
                      <span className="capitalize">{track.category}</span>
                      <span>·</span>
                      <span className="font-mono">{track.duration}s</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => handleSelectTrack(track)}
                  className="px-2.5 py-1 rounded-md bg-neutral-800 hover:bg-neutral-700 text-white text-[10px] font-medium flex items-center gap-1 active:scale-95 transition-all"
                >
                  <Plus className="w-3 h-3" />
                  <span>Añadir</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
