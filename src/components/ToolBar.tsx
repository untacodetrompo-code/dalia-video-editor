import React from 'react';
import { Film, Scissors, Layers, Music, Type, Wand2 } from 'lucide-react';
import { ToolType } from '../types/editor';

interface ToolBarProps {
  activeTool: ToolType;
  onSelectTool: (tool: ToolType) => void;
}

interface ToolItem {
  id: ToolType;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

export const ToolBar: React.FC<ToolBarProps> = ({ activeTool, onSelectTool }) => {
  const tools: ToolItem[] = [
    { id: 'medios', label: 'Medios', icon: Film },
    { id: 'recortar', label: 'Recortar', icon: Scissors },
    { id: 'superponer', label: 'Superponer', icon: Layers },
    { id: 'audio', label: 'Audio', icon: Music },
    { id: 'texto', label: 'Texto', icon: Type },
    { id: 'filtros', label: 'Filtros', icon: Wand2 },
  ];

  return (
    <nav className="h-16 px-1.5 bg-[#0e1015] border-t border-neutral-900 grid grid-cols-6 items-center z-20 shrink-0 select-none">
      {tools.map((tool) => {
        const Icon = tool.icon;
        const isActive = activeTool === tool.id;

        return (
          <button
            key={tool.label}
            onClick={() => onSelectTool(isActive ? null : tool.id)}
            className={`min-h-[44px] flex flex-col items-center justify-center rounded-xl py-1 px-0.5 transition-all active:scale-95 ${
              isActive
                ? 'text-white bg-neutral-800/80 shadow-xs'
                : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/30'
            }`}
            title={`Abrir panel de ${tool.label}`}
            aria-label={tool.label}
          >
            <div className="relative">
              <Icon
                className={`w-5 h-5 transition-transform ${
                  isActive ? 'scale-110 text-white' : 'text-neutral-400'
                }`}
              />
              {isActive && (
                <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-white" />
              )}
            </div>
            <span
              className={`text-[9.5px] tracking-tight mt-1 transition-colors whitespace-nowrap truncate max-w-full ${
                isActive ? 'font-semibold text-white' : 'font-normal text-neutral-400'
              }`}
            >
              {tool.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
};
