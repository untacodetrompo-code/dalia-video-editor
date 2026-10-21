import React from 'react';
import { Wand2, X, Check, Sliders } from 'lucide-react';
import { FilterType } from '../../types/editor';
import { FILTERS_LIST } from '../../data/sampleMedia';

interface FilterPanelProps {
  onClose: () => void;
  activeFilter: FilterType;
  filterIntensity: number;
  onSelectFilter: (filter: FilterType) => void;
  onUpdateIntensity: (intensity: number) => void;
}

export const FilterPanel: React.FC<FilterPanelProps> = ({
  onClose,
  activeFilter,
  filterIntensity,
  onSelectFilter,
  onUpdateIntensity,
}) => {
  return (
    <div className="absolute inset-x-0 bottom-16 bg-[#13151b] border-t border-neutral-800 rounded-t-2xl z-30 shadow-2xl flex flex-col max-h-[350px] animate-in slide-in-from-bottom-6 duration-200">
      {/* Header */}
      <div className="px-4 py-2.5 flex items-center justify-between border-b border-neutral-800/80">
        <div>
          <h2 className="text-xs font-semibold text-white flex items-center gap-1.5">
            <Wand2 className="w-3.5 h-3.5 text-amber-300" />
            <span>Filtros y Gradación de Color</span>
          </h2>
          <p className="text-[10px] text-neutral-400">
            Aplica un estilo visual uniforme a todos los clips
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
        {/* Intensity Slider (only if a filter other than normal is chosen) */}
        {activeFilter !== 'normal' && (
          <div className="p-2.5 rounded-xl bg-neutral-900 border border-neutral-800 space-y-1.5">
            <div className="flex items-center justify-between text-[10px]">
              <span className="text-neutral-400 flex items-center gap-1">
                <Sliders className="w-3 h-3 text-amber-300" />
                <span>Intensidad del filtro</span>
              </span>
              <span className="font-mono text-white font-medium">{filterIntensity}%</span>
            </div>
            <input
              type="range"
              min="10"
              max="100"
              step="5"
              value={filterIntensity}
              onChange={(e) => onUpdateIntensity(parseInt(e.target.value))}
              className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-white"
            />
          </div>
        )}

        {/* Filter Cards Carousel/Grid */}
        <div>
          <label className="text-[10px] font-medium text-neutral-400 block mb-2">
            Selecciona un estilo cromático
          </label>
          <div className="grid grid-cols-2 gap-2">
            {FILTERS_LIST.map((f) => {
              const isSelected = activeFilter === f.id;

              return (
                <div
                  key={f.id}
                  onClick={() => onSelectFilter(f.id)}
                  className={`p-2 rounded-xl border cursor-pointer transition-all active:scale-[0.98] flex items-center gap-2.5 ${
                    isSelected
                      ? 'border-white bg-neutral-800/90 shadow-sm'
                      : 'border-neutral-800 bg-neutral-900/60 hover:bg-neutral-800/40 hover:border-neutral-700'
                  }`}
                >
                  {/* Swatch */}
                  <div
                    className={`w-9 h-9 rounded-lg shrink-0 border border-white/10 ${f.previewThumbnailClass} flex items-center justify-center`}
                  >
                    {isSelected && <Check className="w-4 h-4 text-white drop-shadow" />}
                  </div>

                  <div className="min-w-0 flex-1">
                    <h4 className="text-xs font-medium text-white truncate">{f.name}</h4>
                    <p className="text-[9px] text-neutral-400 truncate mt-0.5">
                      {f.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
