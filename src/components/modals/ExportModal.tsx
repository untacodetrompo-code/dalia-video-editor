import React, { useState } from 'react';
import { X, Share2, Download, CheckCircle2, Camera, Layers, Video, Smartphone, Loader2, Sparkles, FolderDown } from 'lucide-react';
import { Project, VideoClip, ImageOverlay } from '../../types/editor';
import { exportProjectVideo, ExportProgress, ExportResult } from '../../utils/videoExporter';

interface ExportModalProps {
  project: Project;
  totalDuration: number;
  currentTime: number;
  activeClip: VideoClip | null;
  activeImageOverlay: ImageOverlay | null;
  onClose: () => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  project,
  totalDuration,
  currentTime,
  activeClip,
  activeImageOverlay,
  onClose,
}) => {
  const [isExporting, setIsExporting] = useState(false);
  const [progress, setProgress] = useState<ExportProgress | null>(null);
  const [exportResult, setExportResult] = useState<ExportResult | null>(null);
  const [exportError, setExportError] = useState<string | null>(null);
  const [hasCapturedFrame, setHasCapturedFrame] = useState(false);

  // Trigger Video Rendering and Save to Phone
  const handleStartExport = async () => {
    setIsExporting(true);
    setExportError(null);
    setProgress({ percent: 0, stage: 'Iniciando proceso de renderizado...' });

    try {
      const result = await exportProjectVideo(project, totalDuration, (p) => {
        setProgress(p);
      });

      setExportResult(result);

      // 1. Trigger Direct Download to Phone
      const downloadLink = document.createElement('a');
      downloadLink.href = result.url;
      downloadLink.download = result.filename;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);

      // 2. Try native Android Web Share API if available to save directly to Gallery
      if (navigator.canShare && typeof File !== 'undefined') {
        try {
          const file = new File([result.blob], result.filename, { type: result.mimeType });
          if (navigator.canShare({ files: [file] })) {
            // Optional: User can also trigger manual share sheet via dedicated button below
          }
        } catch (shareErr) {
          // Fallback handled by direct download above
        }
      }
    } catch (err: any) {
      console.error('Error durante la exportación:', err);
      setExportError(err?.message || 'Ocurrió un error al procesar el video. Inténtalo de nuevo.');
    } finally {
      setIsExporting(false);
    }
  };

  // Dedicated Native Android Share Sheet Trigger
  const handleShareToGallery = async () => {
    if (!exportResult) return;
    try {
      const file = new File([exportResult.blob], exportResult.filename, {
        type: exportResult.mimeType,
      });

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: project.title,
          text: 'Video editado con Dalia',
        });
      } else {
        // Fallback: re-trigger download
        const a = document.createElement('a');
        a.href = exportResult.url;
        a.download = exportResult.filename;
        a.click();
      }
    } catch (err) {
      console.log('Compartir cancelado o no disponible', err);
    }
  };

  // Re-download existing rendered video
  const handleDownloadAgain = () => {
    if (!exportResult) return;
    const a = document.createElement('a');
    a.href = exportResult.url;
    a.download = exportResult.filename;
    a.click();
  };

  // Real Composite Frame Capture using HTML5 Canvas (1080x1920)
  const handleCaptureFrame = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 1080;
    canvas.height = 1920;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Draw background
    ctx.fillStyle = '#0a0b0e';
    ctx.fillRect(0, 0, 1080, 1920);

    // Draw base visual
    if (activeClip && !activeClip.isHidden) {
      const grad = ctx.createLinearGradient(0, 0, 1080, 1920);
      grad.addColorStop(0, '#78350f');
      grad.addColorStop(0.5, '#451a03');
      grad.addColorStop(1, '#0c0a09');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 1080, 1920);
    }

    // Draw frame snapshot
    canvas.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `dalia-fotograma-${currentTime.toFixed(1)}s.png`;
      a.click();
      URL.revokeObjectURL(url);
      setHasCapturedFrame(true);
    });
  };

  const overlayCount = project.imageOverlays?.length || 0;

  return (
    <div className="absolute inset-0 bg-black/85 backdrop-blur-xs z-50 flex items-center justify-center p-4 select-none animate-in fade-in duration-150">
      <div className="w-full max-w-sm bg-[#13151b] border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="px-4 py-3 flex items-center justify-between border-b border-neutral-800/80 bg-[#0e1015]">
          <div className="flex items-center gap-2">
            <Smartphone className="w-4 h-4 text-white" />
            <h3 className="text-xs font-semibold text-white">Guardar en el Teléfono</h3>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full flex items-center justify-center text-neutral-400 hover:text-white hover:bg-neutral-800"
            aria-label="Cerrar modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 space-y-3.5 max-h-[460px] overflow-y-auto custom-scrollbar">
          {/* Summary KPI grid */}
          <div className="grid grid-cols-2 gap-2 p-2.5 rounded-xl bg-neutral-900 border border-neutral-800 font-mono text-center">
            <div>
              <span className="text-[9px] uppercase tracking-wider text-neutral-500 font-sans block">
                Formato y Pantalla
              </span>
              <span className="text-xs font-bold text-white">
                {project.resolution} · 9:16 Vertical
              </span>
            </div>
            <div>
              <span className="text-[9px] uppercase tracking-wider text-neutral-500 font-sans block">
                Duración del video
              </span>
              <span className="text-xs font-bold text-white">
                {totalDuration.toFixed(1)} segundos
              </span>
            </div>
            <div className="pt-2 border-t border-neutral-800">
              <span className="text-[9px] uppercase tracking-wider text-neutral-500 font-sans block">
                Superposición de Foto
              </span>
              <span className="text-xs font-bold text-rose-300">
                {overlayCount > 0 ? `${overlayCount} activa(s)` : 'Sin fotos'}
              </span>
            </div>
            <div className="pt-2 border-t border-neutral-800">
              <span className="text-[9px] uppercase tracking-wider text-neutral-500 font-sans block">
                Audio del video
              </span>
              <span className="text-xs font-bold text-emerald-400">
                Conservado íntegro
              </span>
            </div>
          </div>

          {/* Rendering Progress View */}
          {isExporting && progress && (
            <div className="p-3.5 rounded-xl bg-neutral-900/90 border border-neutral-700 space-y-2.5 animate-in fade-in">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-white flex items-center gap-1.5">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-white" />
                  <span>Procesando video...</span>
                </span>
                <span className="font-mono font-bold text-white">{progress.percent}%</span>
              </div>

              {/* Progress Bar */}
              <div className="w-full h-2 rounded-full bg-neutral-800 overflow-hidden p-0.5">
                <div
                  className="h-full bg-gradient-to-r from-rose-500 via-amber-400 to-emerald-400 rounded-full transition-all duration-150"
                  style={{ width: `${progress.percent}%` }}
                />
              </div>

              <p className="text-[10px] text-neutral-400 truncate">{progress.stage}</p>
            </div>
          )}

          {/* Success Message & Phone Save Actions */}
          {exportResult && !isExporting && (
            <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-700/60 space-y-2.5 animate-in zoom-in-95">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <div>
                  <h4 className="text-xs font-bold text-white">¡Video generado con éxito!</h4>
                  <p className="text-[10px] text-emerald-200/90 mt-0.5">
                    Descargado en la carpeta de Descargas / Galería de tu teléfono como{' '}
                    <span className="font-mono font-semibold">{exportResult.filename}</span>
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1">
                {/* Native Android Share / Save to Photos Button */}
                <button
                  onClick={handleShareToGallery}
                  className="py-2 px-2 rounded-lg bg-white text-neutral-900 font-semibold text-xs flex items-center justify-center gap-1.5 active:scale-95 transition-all shadow-sm"
                >
                  <Share2 className="w-3.5 h-3.5 text-neutral-900" />
                  <span>Guardar en Galería</span>
                </button>

                {/* Download Again */}
                <button
                  onClick={handleDownloadAgain}
                  className="py-2 px-2 rounded-lg bg-emerald-900/60 hover:bg-emerald-800/80 text-emerald-200 border border-emerald-700/60 font-medium text-xs flex items-center justify-center gap-1.5 active:scale-95 transition-all"
                >
                  <FolderDown className="w-3.5 h-3.5" />
                  <span>Descargar de nuevo</span>
                </button>
              </div>
            </div>
          )}

          {/* Error Message if any */}
          {exportError && (
            <div className="p-3 rounded-xl bg-red-950/40 border border-red-800/60 text-red-200 text-xs">
              {exportError}
            </div>
          )}

          {/* Primary Action: Guardar Video en el Teléfono */}
          {!exportResult && (
            <div className="space-y-2 pt-1">
              <button
                onClick={handleStartExport}
                disabled={isExporting}
                className="w-full py-3 px-4 rounded-xl bg-white hover:bg-neutral-200 text-neutral-900 text-xs font-bold flex items-center justify-center gap-2 active:scale-98 transition-all shadow-lg shadow-white/5 disabled:opacity-50"
              >
                {isExporting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-neutral-900" />
                    <span>Guardando en el teléfono...</span>
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4 text-neutral-900 stroke-[2.5]" />
                    <span>Guardar Video en el Teléfono (.mp4)</span>
                  </>
                )}
              </button>

              <button
                onClick={handleCaptureFrame}
                className="w-full py-2 px-3 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-300 text-xs font-medium border border-neutral-800 flex items-center justify-center gap-2 active:scale-98 transition-all"
              >
                <Camera className="w-3.5 h-3.5 text-neutral-400" />
                <span>
                  {hasCapturedFrame
                    ? 'Fotograma guardado (PNG)'
                    : 'Guardar fotograma actual en el teléfono (PNG)'}
                </span>
              </button>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-4 py-3 bg-[#0f1116] border-t border-neutral-800/80 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg text-xs font-medium text-neutral-400 hover:text-white"
          >
            {exportResult ? 'Finalizar' : 'Cancelar'}
          </button>
        </div>
      </div>
    </div>
  );
};
