import React from 'react';
import { Scissors, Gauge, Copy, Trash2, X, Music, Eye, EyeOff, Film, Image as ImageIcon, ChevronsRight, ChevronsLeft, Play } from 'lucide-react';
import { VideoClip } from '../../types/editor';

interface TrimPanelProps {
  onClose: () => void;
  selectedClip: VideoClip | null;
  currentTime: number;
  onSplitClip: () => void;
  onUpdateSpeed: (clipId: string, speed: number) => void;
  onAdjustDuration: (clipId: string, delta: number) => void;
  onAdjustTrimStart: (clipId: string, delta: number) => void;
  onSetInPointAtPlayhead: (clipId: string) => void;
  onSetOutPointAtPlayhead: (clipId: string) => void;
  onDuplicateClip: (clipId: string) => void;
  onDeleteClip: (clipId: string) => void;
  onSeparateAudio: (clipId: string) => void;
  onToggleHideClip: (clipId: string) => void;
}

export const TrimPanel: React.FC<TrimPanelProps> = ({
  onClose,
  selectedClip,
  currentTime,
  onSplitClip,
  onUpdateSpeed,
  onAdjustDuration,
  onAdjustTrimStart,
  onSetInPointAtPlayhead,
  onSetOutPointAtPlayhead,
  onDuplicateClip,
  onDeleteClip,
  onSeparateAudio,
  onToggleHideClip,
}) => {
  const speeds = [0.5, 0.75, 1.0, 1.5, 2.0];

  const inPoint = selectedClip ? (selectedClip.trimStart || 0) : 0;
  const outPoint = selectedClip ? inPoint + selectedClip.duration : 0;

  return (
    <div className="absolute inset-x-0 bottom-16 bg-[#13151b] border-t border-neutral-800 rounded-t-2xl z-30 shadow-2xl flex flex-col max-h-[390px] animate-in slide-in-from-bottom-6 duration-200">
      {/* Header */}
      <div className="px-4 py-2.5 flex items-center justify-between border-b border-neutral-800/80">
        <div>
          <h2 className="text-xs font-semibold text-white flex items-center gap-1.5">
            <Scissors className="w-3.5 h-3.5 text-neutral-400" />
            <span>Recortar Video (Inicio y Fin)</span>
          </h2>
          <p className="text-[10px] text-neutral-400">
            Ajusta puntos de entrada (In), salida (Out) y velocidad
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

      <div className="flex-1 overflow-y-auto p-4 space-y-3.5 custom-scrollbar">
        {selectedClip ? (
          <>
            {/* Active clip info + Hide Toggle */}
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-neutral-900 border border-neutral-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-neutral-800 border border-neutral-700 flex items-center justify-center text-neutral-300">
                  {selectedClip.mediaType === 'image' ? (
                    <ImageIcon className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <Film className="w-4 h-4 text-blue-400" />
                  )}
                </div>
                <div>
                  <h4 className="text-xs font-medium text-white truncate max-w-[150px]">
                    {selectedClip.title}
                  </h4>
                  <span className="text-[9px] font-mono text-neutral-400">
                    Duración: {selectedClip.duration.toFixed(1)}s · In: {inPoint.toFixed(1)}s
                  </span>
                </div>
              </div>

              {/* Hide / Show Clip Toggle Button */}
              <button
                onClick={() => onToggleHideClip(selectedClip.id)}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-medium border flex items-center gap-1.5 transition-all active:scale-95 ${
                  selectedClip.isHidden
                    ? 'bg-amber-950/40 border-amber-700/50 text-amber-300'
                    : 'bg-neutral-800 hover:bg-neutral-700 border-neutral-700 text-neutral-200'
                }`}
                title={selectedClip.isHidden ? 'Mostrar en pantalla' : 'Ocultar clip'}
              >
                {selectedClip.isHidden ? (
                  <>
                    <EyeOff className="w-3.5 h-3.5 text-amber-300" />
                    <span>Oculto</span>
                  </>
                ) : (
                  <>
                    <Eye className="w-3.5 h-3.5 text-neutral-300" />
                    <span>Visible</span>
                  </>
                )}
              </button>
            </div>

            {/* In / Out Points Adjustment (Recorte de Inicio y Fin) */}
            <div className="p-3 rounded-xl bg-neutral-900/90 border border-neutral-800 space-y-2">
              <div className="flex items-center justify-between text-[11px] font-medium text-white">
                <span>Punto de Inicio y Fin</span>
                <span className="text-[10px] font-mono text-neutral-400">
                  {selectedClip.duration.toFixed(1)}s conservados
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {/* Set In Point to Playhead */}
                <button
                  onClick={() => onSetInPointAtPlayhead(selectedClip.id)}
                  className="py-2 px-2.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-medium flex items-center justify-center gap-1.5 border border-neutral-700 active:scale-95 transition-all"
                  title="Fijar inicio del video en la posición actual del cabezal"
                >
                  <ChevronsRight className="w-3.5 h-3.5 text-blue-400" />
                  <span>Fijar Inicio ({currentTime.toFixed(1)}s)</span>
                </button>

                {/* Set Out Point to Playhead */}
                <button
                  onClick={() => onSetOutPointAtPlayhead(selectedClip.id)}
                  className="py-2 px-2.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-medium flex items-center justify-center gap-1.5 border border-neutral-700 active:scale-95 transition-all"
                  title="Fijar fin del video en la posición actual del cabezal"
                >
                  <ChevronsLeft className="w-3.5 h-3.5 text-amber-400" />
                  <span>Fijar Fin ({currentTime.toFixed(1)}s)</span>
                </button>
              </div>

              {/* Fine trim steppers */}
              <div className="grid grid-cols-2 gap-2 pt-1 text-[10px] text-neutral-400">
                <div className="flex items-center justify-between bg-neutral-950 p-1 rounded-md border border-neutral-800">
                  <span className="pl-1">Inicio: {inPoint.toFixed(1)}s</span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onAdjustTrimStart(selectedClip.id, -0.5)}
                      disabled={inPoint <= 0}
                      className="px-1.5 py-0.5 rounded bg-neutral-800 disabled:opacity-30 text-white"
                    >
                      -
                    </button>
                    <button
                      onClick={() => onAdjustTrimStart(selectedClip.id, 0.5)}
                      className="px-1.5 py-0.5 rounded bg-neutral-800 text-white"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between bg-neutral-950 p-1 rounded-md border border-neutral-800">
                  <span className="pl-1">Fin: {outPoint.toFixed(1)}s</span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onAdjustDuration(selectedClip.id, -0.5)}
                      disabled={selectedClip.duration <= 1.0}
                      className="px-1.5 py-0.5 rounded bg-neutral-800 disabled:opacity-30 text-white"
                    >
                      -
                    </button>
                    <button
                      onClick={() => onAdjustDuration(selectedClip.id, 0.5)}
                      className="px-1.5 py-0.5 rounded bg-neutral-800 text-white"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Split Video Actions: Split at playhead & Separate Audio */}
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={onSplitClip}
                className="py-2.5 px-2 rounded-xl bg-white hover:bg-neutral-200 text-neutral-900 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all active:scale-98 shadow-sm"
              >
                <Scissors className="w-3.5 h-3.5 text-neutral-900" />
                <span>Dividir en {currentTime.toFixed(1)}s</span>
              </button>

              <button
                onClick={() => onSeparateAudio(selectedClip.id)}
                className="py-2.5 px-2 rounded-xl bg-emerald-950/40 hover:bg-emerald-900/50 text-emerald-300 border border-emerald-700/50 text-xs font-medium flex items-center justify-center gap-1.5 transition-all active:scale-98 shadow-sm"
                title="Extraer el audio del video y moverlo a la pista de audio"
              >
                <Music className="w-3.5 h-3.5 text-emerald-400" />
                <span>Separar Audio</span>
              </button>
            </div>

            {/* Speed Selector */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-medium text-neutral-400 flex items-center gap-1">
                  <Gauge className="w-3 h-3" />
                  <span>Velocidad de reproducción</span>
                </span>
                <span className="text-[10px] font-mono text-neutral-300">
                  {selectedClip.speed}x
                </span>
              </div>
              <div className="grid grid-cols-5 gap-1.5">
                {speeds.map((spd) => (
                  <button
                    key={spd}
                    onClick={() => onUpdateSpeed(selectedClip.id, spd)}
                    className={`py-1 rounded-lg text-xs font-mono font-medium transition-all ${
                      selectedClip.speed === spd
                        ? 'bg-neutral-200 text-neutral-900 shadow-sm'
                        : 'bg-neutral-900 text-neutral-400 hover:text-white hover:bg-neutral-800 border border-neutral-800'
                    }`}
                  >
                    {spd}x
                  </button>
                ))}
              </div>
            </div>

            {/* Secondary actions: Duplicate & Delete */}
            <div className="pt-1 border-t border-neutral-800/80 flex items-center gap-2">
              <button
                onClick={() => onDuplicateClip(selectedClip.id)}
                className="flex-1 py-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-neutral-300 text-xs font-medium border border-neutral-800 flex items-center justify-center gap-1.5 active:scale-95 transition-all"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Duplicar clip</span>
              </button>
              <button
                onClick={() => onDeleteClip(selectedClip.id)}
                className="flex-1 py-1.5 rounded-lg bg-red-950/40 hover:bg-red-900/60 text-red-300 text-xs font-medium border border-red-800/40 flex items-center justify-center gap-1.5 active:scale-95 transition-all"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Eliminar</span>
              </button>
            </div>
          </>
        ) : (
          /* Empty / Guidance state when no clip selected */
          <div className="py-8 text-center text-neutral-400 flex flex-col items-center">
            <div className="w-10 h-10 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-center mb-2.5 text-neutral-500">
              <Scissors className="w-5 h-5" />
            </div>
            <p className="text-xs font-medium text-white mb-1">
              Selecciona un clip para recortar
            </p>
            <p className="text-[11px] text-neutral-400 max-w-[220px]">
              Toca un video en la pista principal para fijar puntos de inicio (In), salida (Out), dividir o separar audio.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
