import React, { useState } from 'react';
import { Type, AlignCenter, AlignJustify, Palette, Trash2, X, Plus, Check } from 'lucide-react';
import { TextOverlay } from '../../types/editor';

interface TextPanelProps {
  onClose: () => void;
  textOverlays: TextOverlay[];
  onAddText: (text: TextOverlay) => void;
  onRemoveText: (id: string) => void;
  currentTime: number;
}

export const TextPanel: React.FC<TextPanelProps> = ({
  onClose,
  textOverlays,
  onAddText,
  onRemoveText,
  currentTime,
}) => {
  const [inputText, setInputText] = useState('Nuevo Titular');
  const [selectedStyle, setSelectedStyle] = useState<'clean' | 'bold' | 'serif' | 'subtitle'>('subtitle');
  const [selectedPosition, setSelectedPosition] = useState<'top' | 'center' | 'bottom'>('bottom');
  const [selectedColor, setSelectedColor] = useState('#ffffff');
  const [fontSize, setFontSize] = useState(14);

  const colors = [
    { label: 'Blanco', value: '#ffffff' },
    { label: 'Amarillo', value: '#fde047' },
    { label: 'Cian', value: '#38bdf8' },
    { label: 'Rosa', value: '#f43f5e' },
  ];

  const styles = [
    { id: 'subtitle', name: 'Subtítulo', desc: 'Fondo oscuro sutil' },
    { id: 'bold', name: 'Titular', desc: 'Negrita mayúscula' },
    { id: 'serif', name: 'Editorial', desc: 'Estilo clásico serif' },
    { id: 'clean', name: 'Limpio', desc: 'Sin fondo, minimalista' },
  ];

  const handleCreateText = () => {
    if (!inputText.trim()) return;

    const newOverlay: TextOverlay = {
      id: `txt-${Date.now()}`,
      text: inputText.trim(),
      startTime: currentTime,
      duration: 3.5,
      style: selectedStyle,
      position: selectedPosition,
      color: selectedColor,
      fontSize: fontSize,
    };

    onAddText(newOverlay);
  };

  return (
    <div className="absolute inset-x-0 bottom-16 bg-[#13151b] border-t border-neutral-800 rounded-t-2xl z-30 shadow-2xl flex flex-col max-h-[360px] animate-in slide-in-from-bottom-6 duration-200">
      {/* Header */}
      <div className="px-4 py-2.5 flex items-center justify-between border-b border-neutral-800/80">
        <div>
          <h2 className="text-xs font-semibold text-white flex items-center gap-1.5">
            <Type className="w-3.5 h-3.5 text-purple-400" />
            <span>Editor de Texto y Subtítulos</span>
          </h2>
          <p className="text-[10px] text-neutral-400">
            Añade rótulos superpuestos sobre el encuadre 9:16
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
        {/* Text Input */}
        <div>
          <label className="text-[10px] font-medium text-neutral-400 block mb-1">
            Contenido del texto
          </label>
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Escribe el mensaje aquí..."
            className="w-full px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-800 text-white text-xs placeholder:text-neutral-600 focus:outline-none focus:border-neutral-600 transition-colors"
          />
        </div>

        {/* Style Selection */}
        <div>
          <label className="text-[10px] font-medium text-neutral-400 block mb-1">
            Estilo tipográfico
          </label>
          <div className="grid grid-cols-4 gap-1.5">
            {styles.map((st) => (
              <button
                key={st.id}
                onClick={() => setSelectedStyle(st.id as any)}
                className={`py-1.5 px-1 rounded-lg text-center transition-all ${
                  selectedStyle === st.id
                    ? 'bg-neutral-200 text-neutral-900 font-medium shadow-sm'
                    : 'bg-neutral-900 text-neutral-400 hover:text-white hover:bg-neutral-800 border border-neutral-800'
                }`}
              >
                <div className="text-[11px] leading-tight">{st.name}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Position & Color row */}
        <div className="grid grid-cols-2 gap-3">
          {/* Position */}
          <div>
            <label className="text-[10px] font-medium text-neutral-400 block mb-1">
              Posición vertical
            </label>
            <div className="flex rounded-lg bg-neutral-900 p-0.5 border border-neutral-800">
              {(['top', 'center', 'bottom'] as const).map((pos) => (
                <button
                  key={pos}
                  onClick={() => setSelectedPosition(pos)}
                  className={`flex-1 py-1 rounded text-[10px] font-medium capitalize transition-colors ${
                    selectedPosition === pos
                      ? 'bg-neutral-800 text-white shadow-xs'
                      : 'text-neutral-500 hover:text-neutral-300'
                  }`}
                >
                  {pos === 'top' ? 'Arriba' : pos === 'center' ? 'Centro' : 'Abajo'}
                </button>
              ))}
            </div>
          </div>

          {/* Color */}
          <div>
            <label className="text-[10px] font-medium text-neutral-400 block mb-1">
              Color de texto
            </label>
            <div className="flex items-center gap-2 pt-0.5">
              {colors.map((c) => (
                <button
                  key={c.value}
                  onClick={() => setSelectedColor(c.value)}
                  style={{ backgroundColor: c.value }}
                  className={`w-6 h-6 rounded-full border-2 transition-transform active:scale-90 ${
                    selectedColor === c.value ? 'border-white scale-110 shadow-sm' : 'border-transparent'
                  }`}
                  title={c.label}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Action Button: Insert Text */}
        <button
          onClick={handleCreateText}
          className="w-full py-2.5 rounded-xl bg-white hover:bg-neutral-200 text-neutral-900 text-xs font-medium flex items-center justify-center gap-1.5 active:scale-98 transition-all shadow-sm"
        >
          <Plus className="w-3.5 h-3.5 text-neutral-900" />
          <span>Insertar texto en {currentTime.toFixed(1)}s</span>
        </button>

        {/* Existing Overlays List */}
        {textOverlays.length > 0 && (
          <div className="pt-2 border-t border-neutral-800">
            <span className="text-[10px] font-medium text-neutral-400 block mb-1.5">
              Rótulos en el proyecto
            </span>
            <div className="space-y-1.5">
              {textOverlays.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-2 rounded-lg bg-neutral-900/80 border border-neutral-800/80"
                >
                  <span className="text-xs text-white truncate max-w-[200px]">
                    "{item.text}"
                  </span>
                  <button
                    onClick={() => onRemoveText(item.id)}
                    className="w-6 h-6 rounded flex items-center justify-center text-red-400 hover:bg-red-950/40"
                    title="Eliminar texto"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
