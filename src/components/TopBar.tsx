import React from 'react';
import { ChevronLeft, Sliders, Share2, Undo2, Redo2, Save, Download } from 'lucide-react';

interface TopBarProps {
  projectTitle: string;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onSaveProject: () => void;
  onOpenSettings: () => void;
  onOpenExport: () => void;
  onBackToProjects: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  projectTitle,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onSaveProject,
  onOpenSettings,
  onOpenExport,
  onBackToProjects,
}) => {
  return (
    <header className="h-12 px-3 flex items-center justify-between border-b border-neutral-900 bg-[#0e1015] z-20 shrink-0 select-none">
      {/* Left Slot: Back navigation + Undo & Redo Controls */}
      <div className="flex items-center gap-1">
        <button
          onClick={onBackToProjects}
          className="w-8 h-8 rounded-full flex items-center justify-center text-neutral-400 hover:text-white hover:bg-neutral-800/60 active:scale-95 transition-all"
          title="Volver a proyectos"
          aria-label="Volver a la lista de proyectos"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <div className="h-4 w-[1px] bg-neutral-800 mx-0.5" />

        {/* Undo Button (Deshacer) */}
        <button
          onClick={onUndo}
          disabled={!canUndo}
          className="w-7 h-7 rounded-full flex items-center justify-center text-neutral-400 hover:text-white hover:bg-neutral-800/60 active:scale-95 disabled:opacity-25 disabled:pointer-events-none transition-all"
          title="Deshacer cambio (Ctrl+Z)"
          aria-label="Deshacer"
        >
          <Undo2 className="w-4 h-4" />
        </button>

        {/* Redo Button (Rehacer) */}
        <button
          onClick={onRedo}
          disabled={!canRedo}
          className="w-7 h-7 rounded-full flex items-center justify-center text-neutral-400 hover:text-white hover:bg-neutral-800/60 active:scale-95 disabled:opacity-25 disabled:pointer-events-none transition-all"
          title="Rehacer cambio (Ctrl+Y / Ctrl+Shift+Z)"
          aria-label="Rehacer"
        >
          <Redo2 className="w-4 h-4" />
        </button>
      </div>

      {/* Center Slot: Brand Name "Dalia" and subtle project name */}
      <div className="flex flex-col items-center justify-center pointer-events-none px-1">
        <h1 className="text-sm font-semibold tracking-wide text-white uppercase font-sans">
          Dalia
        </h1>
        <span className="text-[10px] text-neutral-400 max-w-[120px] truncate leading-tight">
          {projectTitle}
        </span>
      </div>

      {/* Right Slot: Save project, Settings & Export video */}
      <div className="flex items-center gap-1.5 justify-end">
        {/* Quick Save Project to Phone */}
        <button
          onClick={onSaveProject}
          className="w-7 h-7 rounded-full flex items-center justify-center text-neutral-400 hover:text-white hover:bg-neutral-800/60 active:scale-95 transition-all"
          title="Guardar proyecto en el teléfono"
          aria-label="Guardar proyecto"
        >
          <Save className="w-3.5 h-3.5 text-neutral-300" />
        </button>

        {/* Settings */}
        <button
          onClick={onOpenSettings}
          className="w-7 h-7 rounded-full flex items-center justify-center text-neutral-400 hover:text-white hover:bg-neutral-800/60 active:scale-95 transition-all"
          title="Ajustes del proyecto"
          aria-label="Ajustes"
        >
          <Sliders className="w-3.5 h-3.5" />
        </button>

        {/* Export / Guardar Video */}
        <button
          onClick={onOpenExport}
          className="px-2.5 py-1 text-xs font-semibold text-neutral-900 bg-white hover:bg-neutral-200 active:scale-95 transition-all rounded-md flex items-center gap-1 shadow-sm"
          title="Guardar video en el teléfono"
        >
          <Download className="w-3 h-3 text-neutral-900 stroke-[2.5]" />
          <span>Guardar</span>
        </button>
      </div>
    </header>
  );
};
