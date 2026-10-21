import React, { useState } from 'react';
import { X, Sliders, Check, Grid, Trash2 } from 'lucide-react';
import { Project, AspectRatio } from '../../types/editor';

interface SettingsModalProps {
  project: Project;
  onClose: () => void;
  onUpdateProject: (updates: Partial<Project>) => void;
  onClearProject: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  project,
  onClose,
  onUpdateProject,
  onClearProject,
}) => {
  const [title, setTitle] = useState(project.title);
  const [aspect, setAspect] = useState<AspectRatio>(project.aspectRatio);
  const [resolution, setResolution] = useState(project.resolution);
  const [fps, setFps] = useState<30 | 60>(project.fps);
  const [gridOverlay, setGridOverlay] = useState(project.gridOverlay);

  const handleSave = () => {
    onUpdateProject({
      title: title.trim() || 'Proyecto sin título',
      aspectRatio: aspect,
      resolution: resolution,
      fps: fps,
      gridOverlay: gridOverlay,
    });
    onClose();
  };

  return (
    <div className="absolute inset-0 bg-black/75 backdrop-blur-xs z-50 flex items-center justify-center p-4 select-none animate-in fade-in duration-150">
      <div className="w-full max-w-sm bg-[#13151b] border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="px-4 py-3 flex items-center justify-between border-b border-neutral-800/80">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-neutral-300" />
            <h3 className="text-xs font-semibold text-white">Ajustes del Proyecto</h3>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full flex items-center justify-center text-neutral-400 hover:text-white hover:bg-neutral-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-4 space-y-4 max-h-[460px] overflow-y-auto custom-scrollbar">
          {/* Project Title */}
          <div>
            <label className="text-[10px] font-medium text-neutral-400 block mb-1">
              Nombre del proyecto
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-800 text-white text-xs focus:outline-none focus:border-neutral-600"
            />
          </div>

          {/* Aspect Ratio */}
          <div>
            <label className="text-[10px] font-medium text-neutral-400 block mb-1">
              Relación de aspecto
            </label>
            <div className="grid grid-cols-3 gap-1.5">
              {(
                [
                  { id: '9:16', label: 'Vertical (9:16)', desc: 'TikTok/Reels' },
                  { id: '16:9', label: 'Horizontal (16:9)', desc: 'YouTube' },
                  { id: '1:1', label: 'Cuadrado (1:1)', desc: 'Post' },
                ] as const
              ).map((item) => (
                <button
                  key={item.id}
                  onClick={() => setAspect(item.id)}
                  className={`p-2 rounded-xl text-center border transition-all ${
                    aspect === item.id
                      ? 'border-white bg-neutral-800 text-white shadow-xs'
                      : 'border-neutral-800 bg-neutral-900 text-neutral-400 hover:text-white'
                  }`}
                >
                  <div className="text-xs font-semibold">{item.id}</div>
                  <div className="text-[9px] text-neutral-400 mt-0.5 truncate">
                    {item.desc}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Resolution & FPS */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] font-medium text-neutral-400 block mb-1">
                Resolución
              </label>
              <select
                value={resolution}
                onChange={(e) => setResolution(e.target.value as any)}
                className="w-full px-2.5 py-1.5 rounded-lg bg-neutral-900 border border-neutral-800 text-white text-xs focus:outline-none"
              >
                <option value="720p">720p HD</option>
                <option value="1080p">1080p Full HD</option>
                <option value="4K">4K Ultra HD</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] font-medium text-neutral-400 block mb-1">
                Cuadros por segundo
              </label>
              <div className="flex rounded-lg bg-neutral-900 p-0.5 border border-neutral-800">
                <button
                  onClick={() => setFps(30)}
                  className={`flex-1 py-1 rounded text-xs font-mono font-medium ${
                    fps === 30 ? 'bg-neutral-800 text-white' : 'text-neutral-400'
                  }`}
                >
                  30 FPS
                </button>
                <button
                  onClick={() => setFps(60)}
                  className={`flex-1 py-1 rounded text-xs font-mono font-medium ${
                    fps === 60 ? 'bg-neutral-800 text-white' : 'text-neutral-400'
                  }`}
                >
                  60 FPS
                </button>
              </div>
            </div>
          </div>

          {/* Grid Overlay Toggle */}
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-neutral-900 border border-neutral-800">
            <div className="flex items-center gap-2">
              <Grid className="w-4 h-4 text-neutral-400" />
              <div>
                <span className="text-xs font-medium text-white block">
                  Cuadrícula de encuadre
                </span>
                <span className="text-[9px] text-neutral-400">
                  Guía de regla de los tercios en el visor
                </span>
              </div>
            </div>
            <button
              onClick={() => setGridOverlay(!gridOverlay)}
              className={`w-10 h-5 rounded-full transition-colors relative p-0.5 ${
                gridOverlay ? 'bg-white' : 'bg-neutral-700'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full transition-transform ${
                  gridOverlay
                    ? 'translate-x-5 bg-neutral-900'
                    : 'translate-x-0 bg-neutral-300'
                }`}
              />
            </button>
          </div>

          {/* Clear project (empty state test) */}
          <div className="pt-2 border-t border-neutral-800/80">
            <button
              onClick={() => {
                if (window.confirm('¿Deseas vaciar la línea de tiempo del proyecto?')) {
                  onClearProject();
                  onClose();
                }
              }}
              className="w-full py-2 px-3 rounded-xl bg-neutral-900 hover:bg-red-950/40 text-neutral-400 hover:text-red-300 border border-neutral-800 text-xs font-medium flex items-center justify-center gap-1.5 transition-all"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Vaciar metraje del proyecto</span>
            </button>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-4 py-3 bg-[#0f1116] border-t border-neutral-800/80 flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded-lg text-xs font-medium text-neutral-400 hover:text-white"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-1.5 rounded-lg text-xs font-medium bg-white text-neutral-900 hover:bg-neutral-200 active:scale-95 transition-all"
          >
            Guardar cambios
          </button>
        </div>
      </div>
    </div>
  );
};
