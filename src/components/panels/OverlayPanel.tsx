import React, { useRef, useState } from 'react';
import { Layers, Upload, X, Trash2, Plus, Eye, EyeOff, LayoutTemplate, Move, Maximize2, Sparkles, Check } from 'lucide-react';
import { ImageOverlay, OverlayFit, OverlayPosition } from '../../types/editor';
import { SAMPLE_IMAGE_OVERLAYS, SampleOverlayItem } from '../../data/sampleMedia';

interface OverlayPanelProps {
  onClose: () => void;
  selectedOverlay: ImageOverlay | null;
  overlays: ImageOverlay[];
  currentTime: number;
  onAddOverlay: (overlay: ImageOverlay) => void;
  onUpdateOverlay: (id: string, updates: Partial<ImageOverlay>) => void;
  onDeleteOverlay: (id: string) => void;
  onSelectOverlay: (id: string | null) => void;
}

export const OverlayPanel: React.FC<OverlayPanelProps> = ({
  onClose,
  selectedOverlay,
  overlays,
  currentTime,
  onAddOverlay,
  onUpdateOverlay,
  onDeleteOverlay,
  onSelectOverlay,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const objectUrl = URL.createObjectURL(file);
    const newOverlay: ImageOverlay = {
      id: `ov-${Date.now()}`,
      title: file.name.replace(/\.[^/.]+$/, '').substring(0, 20),
      imageUrl: objectUrl,
      startTime: currentTime,
      duration: 3.5,
      fit: 'cover',
      position: 'center',
      scale: 1.0,
      opacity: 1.0,
      isHidden: false,
    };

    onAddOverlay(newOverlay);
    onSelectOverlay(newOverlay.id);
    e.target.value = '';
  };

  const handleSelectSample = (sample: SampleOverlayItem) => {
    const newOverlay: ImageOverlay = {
      id: `ov-${Date.now()}`,
      title: sample.title,
      imageUrl: sample.imageUrl,
      startTime: currentTime,
      duration: 3.0,
      fit: sample.defaultFit,
      position: sample.defaultFit === 'pip' ? 'top-right' : 'center',
      scale: sample.defaultScale,
      opacity: 1.0,
      isHidden: false,
    };

    onAddOverlay(newOverlay);
    onSelectOverlay(newOverlay.id);
  };

  const fitOptions: { id: OverlayFit; label: string; desc: string }[] = [
    { id: 'cover', label: 'Cubrir 9:16 (Llenar)', desc: 'Cubre todo el encuadre vertical' },
    { id: 'contain', label: 'Ajustar (Sin cortar)', desc: 'Mantiene proporción exacta de foto' },
    { id: 'pip', label: 'Flotante PiP', desc: 'Ventana sobre el video visible' },
  ];

  const positionOptions: { id: OverlayPosition; label: string }[] = [
    { id: 'center', label: 'Centro' },
    { id: 'top', label: 'Arriba' },
    { id: 'bottom', label: 'Abajo' },
    { id: 'top-right', label: 'Esquina Der.' },
    { id: 'bottom-right', label: 'Inf. Der.' },
  ];

  return (
    <div className="absolute inset-x-0 bottom-16 bg-[#13151b] border-t border-neutral-800 rounded-t-2xl z-30 shadow-2xl flex flex-col max-h-[390px] animate-in slide-in-from-bottom-6 duration-200">
      {/* Header */}
      <div className="px-4 py-2.5 flex items-center justify-between border-b border-neutral-800/80">
        <div>
          <h2 className="text-xs font-semibold text-white flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-rose-400" />
            <span>Superposición de Imagen sobre Video</span>
          </h2>
          <p className="text-[10px] text-neutral-400">
            Muestra fotos o recuadros PiP manteniendo el audio del video
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
        {/* Import Image Action Bar */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex-1 py-2 px-3 rounded-xl bg-white hover:bg-neutral-200 text-neutral-900 text-xs font-semibold flex items-center justify-center gap-1.5 shadow-sm active:scale-98 transition-all"
          >
            <Upload className="w-3.5 h-3.5 text-neutral-900 stroke-[2.5]" />
            <span>+ Subir Imagen de Galería</span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileUpload}
          />
        </div>

        {/* Selected Overlay Adjustments */}
        {selectedOverlay ? (
          <div className="p-3 rounded-xl bg-neutral-900 border border-neutral-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 min-w-0">
                <img
                  src={selectedOverlay.imageUrl}
                  alt={selectedOverlay.title}
                  className="w-8 h-8 rounded-lg object-cover border border-neutral-700 shrink-0"
                />
                <div className="min-w-0">
                  <h4 className="text-xs font-semibold text-white truncate max-w-[150px]">
                    {selectedOverlay.title}
                  </h4>
                  <span className="text-[9px] font-mono text-neutral-400 block">
                    Desde {selectedOverlay.startTime.toFixed(1)}s · Duración: {selectedOverlay.duration.toFixed(1)}s
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() =>
                    onUpdateOverlay(selectedOverlay.id, { isHidden: !selectedOverlay.isHidden })
                  }
                  className={`p-1.5 rounded-lg border text-xs ${
                    selectedOverlay.isHidden
                      ? 'bg-amber-950/40 border-amber-700/60 text-amber-300'
                      : 'bg-neutral-800 border-neutral-700 text-neutral-300'
                  }`}
                  title={selectedOverlay.isHidden ? 'Mostrar imagen' : 'Ocultar imagen'}
                >
                  {selectedOverlay.isHidden ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
                <button
                  onClick={() => onDeleteOverlay(selectedOverlay.id)}
                  className="p-1.5 rounded-lg bg-red-950/40 border border-red-800/40 text-red-300 hover:bg-red-900/60"
                  title="Eliminar superposición"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* 1. Modo de Adaptación / Ajuste 9:16 */}
            <div>
              <label className="text-[10px] font-medium text-neutral-400 block mb-1">
                Ajuste al formato vertical 9:16
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {fitOptions.map((fit) => (
                  <button
                    key={fit.id}
                    onClick={() => onUpdateOverlay(selectedOverlay.id, { fit: fit.id })}
                    className={`py-1.5 px-1 rounded-lg text-center transition-all ${
                      selectedOverlay.fit === fit.id
                        ? 'bg-neutral-200 text-neutral-900 font-semibold shadow-xs'
                        : 'bg-neutral-950 text-neutral-400 hover:text-white border border-neutral-800'
                    }`}
                  >
                    <div className="text-[10px] font-medium leading-tight">{fit.label}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* 2. Posición (especialmente para PiP) */}
            <div>
              <label className="text-[10px] font-medium text-neutral-400 block mb-1">
                Posición en pantalla
              </label>
              <div className="grid grid-cols-5 gap-1">
                {positionOptions.map((pos) => (
                  <button
                    key={pos.id}
                    onClick={() => onUpdateOverlay(selectedOverlay.id, { position: pos.id })}
                    className={`py-1 rounded text-center transition-colors text-[9px] ${
                      selectedOverlay.position === pos.id
                        ? 'bg-rose-900/60 text-white border border-rose-600 font-medium'
                        : 'bg-neutral-950 text-neutral-400 hover:text-white border border-neutral-800'
                    }`}
                  >
                    {pos.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 3. Escala y Duración */}
            <div className="grid grid-cols-2 gap-2 pt-1 border-t border-neutral-800/80">
              {/* Escala */}
              <div>
                <div className="flex items-center justify-between text-[10px] mb-1">
                  <span className="text-neutral-400">Escala / Tamaño</span>
                  <span className="font-mono text-neutral-200">
                    {Math.round((selectedOverlay.scale || 1.0) * 100)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0.2"
                  max="1.5"
                  step="0.05"
                  value={selectedOverlay.scale || 1.0}
                  onChange={(e) =>
                    onUpdateOverlay(selectedOverlay.id, { scale: parseFloat(e.target.value) })
                  }
                  className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-rose-500"
                />
              </div>

              {/* Duración */}
              <div>
                <div className="flex items-center justify-between text-[10px] mb-1">
                  <span className="text-neutral-400">Duración</span>
                  <span className="font-mono text-neutral-200">
                    {selectedOverlay.duration.toFixed(1)}s
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() =>
                      onUpdateOverlay(selectedOverlay.id, {
                        duration: Math.max(0.5, selectedOverlay.duration - 0.5),
                      })
                    }
                    className="flex-1 py-1 rounded bg-neutral-950 hover:bg-neutral-800 text-white border border-neutral-800 text-[10px]"
                  >
                    -0.5s
                  </button>
                  <button
                    onClick={() =>
                      onUpdateOverlay(selectedOverlay.id, {
                        duration: selectedOverlay.duration + 0.5,
                      })
                    }
                    className="flex-1 py-1 rounded bg-neutral-950 hover:bg-neutral-800 text-white border border-neutral-800 text-[10px]"
                  >
                    +0.5s
                  </button>
                </div>
              </div>
            </div>

            {/* Set start point to playhead */}
            <button
              onClick={() => onUpdateOverlay(selectedOverlay.id, { startTime: currentTime })}
              className="w-full py-1.5 rounded-lg bg-neutral-950 hover:bg-neutral-800 text-neutral-300 text-[11px] font-medium border border-neutral-800 flex items-center justify-center gap-1"
            >
              <span>Mover inicio a cabezal ({currentTime.toFixed(1)}s)</span>
            </button>
          </div>
        ) : (
          <div className="p-3 text-center text-neutral-400 rounded-xl bg-neutral-900/60 border border-neutral-800">
            <span className="text-xs font-medium text-white block mb-0.5">
              Sin imagen superpuesta seleccionada
            </span>
            <span className="text-[10px] text-neutral-500">
              Sube una foto o selecciona una muestra para colocarla en la capa visual.
            </span>
          </div>
        )}

        {/* Sample Overlays Carousel */}
        <div>
          <label className="text-[10px] font-medium text-neutral-400 block mb-1.5">
            Muestras de B-Roll y PiP para probar
          </label>
          <div className="grid grid-cols-3 gap-2">
            {SAMPLE_IMAGE_OVERLAYS.map((sample) => (
              <div
                key={sample.id}
                onClick={() => handleSelectSample(sample)}
                className="group relative rounded-xl overflow-hidden border border-neutral-800 hover:border-neutral-600 bg-neutral-900 cursor-pointer transition-all active:scale-95 flex flex-col"
              >
                <div className="h-16 w-full relative">
                  <img
                    src={sample.imageUrl}
                    alt={sample.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent" />
                  <div className="absolute bottom-1 left-1.5 right-1 text-[8px] font-medium text-white truncate">
                    {sample.title}
                  </div>
                </div>
                <div className="p-1 bg-[#101217] text-center text-[8px] font-mono text-neutral-400">
                  {sample.category}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
