import React, { useState } from 'react';
import { Plus, Video, Film, Trash2, ChevronRight, Clock, Sparkles } from 'lucide-react';
import { Project, AspectRatio } from '../types/editor';

interface ProjectsScreenProps {
  projects: Project[];
  onOpenProject: (projectId: string) => void;
  onCreateProject: (title: string, aspectRatio: AspectRatio) => void;
  onDeleteProject: (projectId: string) => void;
}

export const ProjectsScreen: React.FC<ProjectsScreenProps> = ({
  projects,
  onOpenProject,
  onCreateProject,
  onDeleteProject,
}) => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newProjectTitle, setNewProjectTitle] = useState('Nuevo Reel');
  const [selectedAspect, setSelectedAspect] = useState<AspectRatio>('9:16');

  const handleConfirmCreate = () => {
    onCreateProject(newProjectTitle.trim() || 'Proyecto sin título', selectedAspect);
    setShowCreateModal(false);
    setNewProjectTitle('Nuevo Reel');
  };

  return (
    <div className="flex-1 flex flex-col bg-[#0b0c0f] text-neutral-100 select-none overflow-hidden">
      {/* Top Header */}
      <header className="h-14 px-5 flex items-center justify-between border-b border-neutral-900 bg-[#0e1015]">
        <div>
          <h1 className="text-base font-bold tracking-wider text-white uppercase font-sans">
            Dalia
          </h1>
          <p className="text-[10px] text-neutral-400">Editor de Video Móvil</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-3 py-1.5 rounded-lg bg-white hover:bg-neutral-200 text-neutral-900 text-xs font-semibold flex items-center gap-1.5 shadow-sm active:scale-95 transition-all"
        >
          <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>Nuevo Proyecto</span>
        </button>
      </header>

      {/* Body List of Projects */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
        {/* Hero Create Card */}
        <div
          onClick={() => setShowCreateModal(true)}
          className="p-4 rounded-2xl bg-gradient-to-br from-neutral-900 to-neutral-950 border border-neutral-800/80 hover:border-neutral-700 cursor-pointer transition-all active:scale-[0.99] flex items-center justify-between group shadow-sm"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-white text-neutral-900 flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
              <Plus className="w-6 h-6 stroke-[2]" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">Comenzar Nuevo Proyecto</h3>
              <p className="text-[11px] text-neutral-400">
                Formato vertical 9:16 optimizado para Reels y TikTok
              </p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-neutral-500 group-hover:text-white transition-colors" />
        </div>

        {/* Section Header: Proyectos Recientes */}
        <div>
          <div className="flex items-center justify-between mb-2.5 px-1">
            <h2 className="text-xs font-semibold text-neutral-300 uppercase tracking-wider">
              Proyectos Recientes ({projects.length})
            </h2>
            <span className="text-[10px] text-neutral-400">Guardado local</span>
          </div>

          {projects.length === 0 ? (
            <div className="p-8 text-center text-neutral-400 rounded-2xl border border-neutral-900 bg-neutral-950/40">
              <Film className="w-8 h-8 text-neutral-600 mx-auto mb-2" />
              <p className="text-xs font-medium text-white mb-1">Sin proyectos recientes</p>
              <p className="text-[11px] text-neutral-400">
                Toca 'Nuevo Proyecto' para crear tu primer montaje en Dalia.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {projects.map((proj) => {
                const totalDuration = proj.videoClips.reduce(
                  (sum, c) => sum + c.duration,
                  0
                );
                const firstClip = proj.videoClips[0];

                return (
                  <div
                    key={proj.id}
                    onClick={() => onOpenProject(proj.id)}
                    className="p-3 rounded-xl bg-[#111319] hover:bg-[#151820] border border-neutral-800/80 hover:border-neutral-700 cursor-pointer transition-all active:scale-[0.99] flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {/* Project Preview Thumbnail */}
                      <div
                        className="w-12 h-14 rounded-lg bg-neutral-900 border border-neutral-800 flex items-center justify-center shrink-0 overflow-hidden relative"
                        style={{
                          background: firstClip
                            ? (firstClip as any).previewBg ||
                              'radial-gradient(ellipse at bottom, #b45309 0%, #881337 45%, #0f172a 100%)'
                            : '#171920',
                        }}
                      >
                        <div className="absolute inset-0 bg-black/30" />
                        <span className="relative z-10 text-[9px] font-mono text-white/80 font-bold">
                          {proj.aspectRatio}
                        </span>
                      </div>

                      {/* Project Details */}
                      <div className="min-w-0">
                        <h4 className="text-xs font-medium text-white truncate">
                          {proj.title}
                        </h4>
                        <div className="flex items-center gap-2 text-[10px] text-neutral-400 mt-0.5">
                          <span className="font-mono text-neutral-300">
                            {totalDuration > 0 ? `${totalDuration.toFixed(1)}s` : '0.0s'}
                          </span>
                          <span>·</span>
                          <span>{proj.videoClips.length} clips</span>
                          <span>·</span>
                          <span>{proj.resolution}</span>
                        </div>
                        <span className="text-[9px] text-neutral-400 block mt-0.5">
                          {proj.updatedAt}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (window.confirm(`¿Eliminar proyecto "${proj.title}"?`)) {
                            onDeleteProject(proj.id);
                          }
                        }}
                        className="w-7 h-7 rounded-lg flex items-center justify-center text-neutral-500 hover:text-red-400 hover:bg-neutral-800/60 transition-colors"
                        title="Eliminar proyecto"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                      <ChevronRight className="w-4 h-4 text-neutral-600 group-hover:text-white transition-colors" />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* New Project Creation Modal */}
      {showCreateModal && (
        <div className="absolute inset-0 bg-black/80 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-xs bg-[#13151b] border border-neutral-800 rounded-2xl shadow-2xl p-4 flex flex-col space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-800/80 pb-2">
              <h3 className="text-xs font-semibold text-white">Nuevo Proyecto</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-neutral-400 hover:text-white text-xs"
              >
                Cancelar
              </button>
            </div>

            <div>
              <label className="text-[10px] font-medium text-neutral-400 block mb-1">
                Título del proyecto
              </label>
              <input
                type="text"
                value={newProjectTitle}
                onChange={(e) => setNewProjectTitle(e.target.value)}
                placeholder="Nombre del proyecto"
                autoFocus
                className="w-full px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-800 text-white text-xs focus:outline-none focus:border-neutral-600"
              />
            </div>

            <div>
              <label className="text-[10px] font-medium text-neutral-400 block mb-1.5">
                Proporción de pantalla
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {(
                  [
                    { id: '9:16', label: '9:16', sub: 'Vertical' },
                    { id: '16:9', label: '16:9', sub: 'Horizontal' },
                    { id: '1:1', label: '1:1', sub: 'Cuadrado' },
                  ] as const
                ).map((asp) => (
                  <button
                    key={asp.id}
                    onClick={() => setSelectedAspect(asp.id)}
                    className={`py-2 px-1 rounded-xl text-center border transition-all ${
                      selectedAspect === asp.id
                        ? 'border-white bg-neutral-800 text-white shadow-xs'
                        : 'border-neutral-800 bg-neutral-900 text-neutral-400 hover:text-white'
                    }`}
                  >
                    <div className="text-xs font-bold">{asp.label}</div>
                    <div className="text-[9px] text-neutral-400">{asp.sub}</div>
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleConfirmCreate}
              className="w-full py-2.5 rounded-xl bg-white text-neutral-900 hover:bg-neutral-200 text-xs font-semibold active:scale-95 transition-all shadow-md mt-2"
            >
              Crear y Abrir Editor
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
