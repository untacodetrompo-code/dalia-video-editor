import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Project, VideoClip, AudioClip, TextOverlay, ImageOverlay } from '../types/editor';
import { Video, Music, Type, Plus, Scissors, Trash2, ZoomIn, ZoomOut, Eye, EyeOff, Image as ImageIcon, Film, Layers, Clock, ArrowLeft, ArrowRight } from 'lucide-react';

interface TimelineProps {
  project: Project;
  currentTime: number;
  totalDuration: number;
  onSeek: (time: number) => void;
  selectedClipId: string | null;
  onSelectClip: (clipId: string | null) => void;
  selectedOverlayId: string | null;
  onSelectOverlay: (overlayId: string | null) => void;
  onOpenMedia: () => void;
  onOpenOverlay: () => void;
  onSplitClip: () => void;
  onDeleteClip: (id: string) => void;
  onSeparateAudio: (clipId: string) => void;
  onToggleHideClip: (clipId: string) => void;
  onToggleHideVideoTrack: () => void;
  onToggleHideOverlayTrack: () => void;
  onDeleteOverlay: (id: string) => void;
  onAdjustOverlayTiming: (id: string, deltaStart: number, deltaDuration: number) => void;
}

export const Timeline: React.FC<TimelineProps> = ({
  project,
  currentTime,
  totalDuration,
  onSeek,
  selectedClipId,
  onSelectClip,
  selectedOverlayId,
  onSelectOverlay,
  onOpenMedia,
  onOpenOverlay,
  onSplitClip,
  onDeleteClip,
  onSeparateAudio,
  onToggleHideClip,
  onToggleHideVideoTrack,
  onToggleHideOverlayTrack,
  onDeleteOverlay,
  onAdjustOverlayTiming,
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const timelineContentRef = useRef<HTMLDivElement>(null);
  const [zoomLevel, setZoomLevel] = useState<number>(36); // pixels per second
  const [isDraggingPlayhead, setIsDraggingPlayhead] = useState(false);

  // Padding at start so the playhead aligns with 0
  const START_PADDING_PX = 32;

  // Safe duration of at least 8 seconds for timeline canvas
  const effectiveDuration = Math.max(totalDuration, 8);
  const timelineWidth = Math.max(380, effectiveDuration * zoomLevel + START_PADDING_PX * 2);

  // Convert client X position on the timeline to seconds
  const calculateTimeToPosition = useCallback(
    (clientX: number) => {
      if (!timelineContentRef.current) return 0;
      const rect = timelineContentRef.current.getBoundingClientRect();
      const relativeX = clientX - rect.left - START_PADDING_PX;
      const calculatedTime = Math.max(0, Math.min(effectiveDuration, relativeX / zoomLevel));
      return Number(calculatedTime.toFixed(2));
    },
    [zoomLevel, effectiveDuration, START_PADDING_PX]
  );

  // Playhead dragging handlers
  const handlePointerDown = (e: React.PointerEvent) => {
    if (e.button !== 0 && e.pointerType === 'mouse') return;
    setIsDraggingPlayhead(true);
    e.currentTarget.setPointerCapture(e.pointerId);
    const newTime = calculateTimeToPosition(e.clientX);
    onSeek(newTime);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDraggingPlayhead) return;
    const newTime = calculateTimeToPosition(e.clientX);
    onSeek(newTime);
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (isDraggingPlayhead) {
      setIsDraggingPlayhead(false);
      try {
        e.currentTarget.releasePointerCapture(e.pointerId);
      } catch (err) {
        // Safe fallback
      }
    }
  };

  // Playhead position in pixels
  const playheadPositionPx = START_PADDING_PX + currentTime * zoomLevel;

  // Generate ruler tick marks
  const rulerTicks = [];
  const maxSeconds = Math.ceil(effectiveDuration);
  for (let s = 0; s <= maxSeconds; s++) {
    rulerTicks.push(s);
  }

  // Auto-scroll timeline to keep playhead in view during playback
  useEffect(() => {
    if (!scrollContainerRef.current || isDraggingPlayhead) return;
    const container = scrollContainerRef.current;
    const currentScroll = container.scrollLeft;
    const containerWidth = container.clientWidth;

    const minVisible = currentScroll + 40;
    const maxVisible = currentScroll + containerWidth - 60;

    if (playheadPositionPx > maxVisible) {
      container.scrollTo({
        left: playheadPositionPx - containerWidth * 0.7,
        behavior: 'smooth',
      });
    } else if (playheadPositionPx < minVisible && currentScroll > 0) {
      container.scrollTo({
        left: Math.max(0, playheadPositionPx - 60),
        behavior: 'smooth',
      });
    }
  }, [playheadPositionPx, isDraggingPlayhead]);

  // Selected clip & overlay objects
  const selectedClip = project.videoClips.find((c) => c.id === selectedClipId);
  const selectedOverlay = project.imageOverlays?.find((o) => o.id === selectedOverlayId);

  return (
    <div className="flex-1 flex flex-col bg-[#0b0c0f] border-t border-neutral-900 select-none overflow-hidden relative">
      {/* Timeline Mini Toolbar: Quick actions for selected clip or overlay */}
      <div className="h-7 px-2.5 flex items-center justify-between border-b border-neutral-900/80 bg-[#0e1015] text-[10px] text-neutral-400">
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          {selectedOverlay ? (
            /* Selected Image Overlay Quick Strip */
            <div className="flex items-center gap-1.5 text-rose-200">
              <span className="font-medium text-white truncate max-w-[100px] flex items-center gap-1">
                <Layers className="w-3 h-3 text-rose-400" />
                <span>{selectedOverlay.title}</span>
              </span>
              <span className="text-neutral-500">·</span>
              <span className="font-mono text-neutral-400">{selectedOverlay.duration.toFixed(1)}s</span>

              {/* Move Start Time */}
              <button
                onClick={() => onAdjustOverlayTiming(selectedOverlay.id, -0.5, 0)}
                disabled={selectedOverlay.startTime <= 0}
                className="px-1.5 py-0.5 rounded bg-neutral-800 hover:bg-neutral-700 disabled:opacity-30 text-white flex items-center gap-0.5"
                title="Mover inicio 0.5s a la izquierda"
              >
                <ArrowLeft className="w-2.5 h-2.5" />
                <span>-0.5s</span>
              </button>
              <button
                onClick={() => onAdjustOverlayTiming(selectedOverlay.id, 0.5, 0)}
                className="px-1.5 py-0.5 rounded bg-neutral-800 hover:bg-neutral-700 text-white flex items-center gap-0.5"
                title="Mover inicio 0.5s a la derecha"
              >
                <span>+0.5s</span>
                <ArrowRight className="w-2.5 h-2.5" />
              </button>

              {/* Adjust Duration */}
              <button
                onClick={() => onAdjustOverlayTiming(selectedOverlay.id, 0, 0.5)}
                className="px-1.5 py-0.5 rounded bg-rose-950/60 border border-rose-800/40 text-rose-300"
                title="Aumentar duración de la imagen"
              >
                +Duración
              </button>

              <button
                onClick={() => onDeleteOverlay(selectedOverlay.id)}
                className="px-1.5 py-0.5 rounded bg-red-950/40 text-red-300 border border-red-800/30"
                title="Eliminar superposición"
              >
                <Trash2 className="w-2.5 h-2.5" />
              </button>
            </div>
          ) : selectedClip ? (
            /* Selected Video Clip Quick Strip */
            <div className="flex items-center gap-1.5 text-neutral-200">
              <span className="font-medium text-white truncate max-w-[100px]">
                {selectedClip.title}
              </span>

              <button
                onClick={onSplitClip}
                className="px-1.5 py-0.5 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-200 flex items-center gap-1 active:scale-95 transition-all"
                title="Dividir clip en el cabezal"
              >
                <Scissors className="w-2.5 h-2.5" />
                <span>Dividir</span>
              </button>

              <button
                onClick={() => onSeparateAudio(selectedClip.id)}
                className="px-1.5 py-0.5 rounded bg-emerald-950/50 hover:bg-emerald-900/60 text-emerald-300 border border-emerald-800/40 flex items-center gap-1 active:scale-95 transition-all"
                title="Separar audio y video en dos pistas"
              >
                <Music className="w-2.5 h-2.5" />
                <span>Separar Audio</span>
              </button>

              <button
                onClick={() => onToggleHideClip(selectedClip.id)}
                className={`px-1.5 py-0.5 rounded flex items-center gap-1 active:scale-95 transition-all ${
                  selectedClip.isHidden
                    ? 'bg-amber-950/50 text-amber-300 border border-amber-800/40'
                    : 'bg-neutral-800 hover:bg-neutral-700 text-neutral-300'
                }`}
                title={selectedClip.isHidden ? 'Mostrar clip' : 'Ocultar clip en pantalla'}
              >
                {selectedClip.isHidden ? (
                  <>
                    <EyeOff className="w-2.5 h-2.5 text-amber-300" />
                    <span>Oculto</span>
                  </>
                ) : (
                  <>
                    <Eye className="w-2.5 h-2.5" />
                    <span>Visible</span>
                  </>
                )}
              </button>

              <button
                onClick={() => onDeleteClip(selectedClip.id)}
                className="px-1.5 py-0.5 rounded bg-red-950/40 hover:bg-red-900/60 text-red-300 flex items-center gap-1 active:scale-95 border border-red-800/30"
                title="Eliminar clip"
              >
                <Trash2 className="w-2.5 h-2.5" />
              </button>
            </div>
          ) : (
            <span className="text-neutral-500 text-[10px]">
              Toca un video o imagen superpuesta para editar su duración
            </span>
          )}
        </div>

        {/* Zoom Controls */}
        <div className="flex items-center gap-1 shrink-0 ml-1">
          <button
            onClick={() => setZoomLevel((z) => Math.max(20, z - 8))}
            className="w-5 h-5 rounded flex items-center justify-center hover:bg-neutral-800 text-neutral-400 hover:text-white"
            title="Reducir zoom"
            aria-label="Alejar línea de tiempo"
          >
            <ZoomOut className="w-3 h-3" />
          </button>
          <span className="font-mono text-[9px] text-neutral-500">{zoomLevel}px/s</span>
          <button
            onClick={() => setZoomLevel((z) => Math.min(80, z + 8))}
            className="w-5 h-5 rounded flex items-center justify-center hover:bg-neutral-800 text-neutral-400 hover:text-white"
            title="Aumentar zoom"
            aria-label="Acercar línea de tiempo"
          >
            <ZoomIn className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Main Scrollable Timeline Body */}
      <div
        ref={scrollContainerRef}
        className="flex-1 overflow-x-auto overflow-y-hidden relative custom-scrollbar touch-pan-x"
        onPointerDown={(e) => {
          if ((e.target as HTMLElement).closest('.playhead-handle')) return;
          const newTime = calculateTimeToPosition(e.clientX);
          onSeek(newTime);
        }}
      >
        <div
          ref={timelineContentRef}
          className="relative min-h-[170px] h-full flex flex-col py-1"
          style={{ width: `${timelineWidth}px` }}
        >
          {/* 1. Time Ruler */}
          <div
            className="h-6 relative border-b border-neutral-900 bg-[#0d0e12] select-none cursor-pointer"
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
          >
            {rulerTicks.map((second) => {
              const tickLeft = START_PADDING_PX + second * zoomLevel;
              const mins = Math.floor(second / 60);
              const secs = second % 60;
              const label = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

              return (
                <div
                  key={second}
                  className="absolute top-0 bottom-0 flex flex-col items-start pointer-events-none"
                  style={{ left: `${tickLeft}px` }}
                >
                  <div className="h-2.5 w-[1px] bg-neutral-700"></div>
                  <span className="text-[9px] font-mono text-neutral-500 -ml-2.5 mt-0.5 tabular-nums">
                    {label}
                  </span>
                  {second < maxSeconds && (
                    <div
                      className="absolute top-0 h-1.5 w-[1px] bg-neutral-800"
                      style={{ left: `${zoomLevel / 2}px` }}
                    />
                  )}
                </div>
              );
            })}
          </div>

          {/* 2. PISTA 1: Video Principal (Track 1) */}
          <div className="h-13 relative my-0.5 px-0 flex items-center bg-[#101217] border-y border-neutral-900/60">
            {/* Track Header */}
            <div className="sticky left-0 z-10 w-8 h-full bg-[#13151b] border-r border-neutral-800/80 flex flex-col items-center justify-center text-neutral-400 shrink-0 gap-0.5">
              <span className="text-[7px] font-mono uppercase text-neutral-500">Video</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleHideVideoTrack();
                }}
                className={`p-0.5 rounded transition-colors ${
                  project.isVideoTrackHidden ? 'text-amber-400' : 'text-neutral-400 hover:text-white'
                }`}
                title={project.isVideoTrackHidden ? 'Mostrar video' : 'Ocultar video'}
              >
                {project.isVideoTrackHidden ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
              </button>
            </div>

            {/* Video Clips Layer */}
            <div className="relative h-full flex-1 flex items-center">
              {project.videoClips.map((clip) => {
                const clipLeft = START_PADDING_PX + clip.startTime * zoomLevel;
                const clipWidth = clip.duration * zoomLevel;
                const isSelected = selectedClipId === clip.id;

                return (
                  <div
                    key={clip.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectOverlay(null);
                      onSelectClip(isSelected ? null : clip.id);
                      onSeek(clip.startTime);
                    }}
                    className={`absolute top-1 bottom-1 rounded-md overflow-hidden cursor-pointer transition-all border flex items-center px-2 group ${
                      isSelected
                        ? 'border-white ring-2 ring-white/20 bg-neutral-800 shadow-md z-10'
                        : clip.isHidden
                        ? 'border-dashed border-amber-500/60 bg-neutral-950/90 opacity-70'
                        : 'border-neutral-700/80 hover:border-neutral-500 bg-neutral-900/90'
                    }`}
                    style={{
                      left: `${clipLeft}px`,
                      width: `${Math.max(28, clipWidth)}px`,
                      background: clip.imageUrl
                        ? `linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.7)), url(${clip.imageUrl}) center/cover`
                        : undefined,
                    }}
                  >
                    <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:8px_8px] pointer-events-none" />

                    <div className="relative z-10 flex flex-col justify-center min-w-0 pr-1">
                      <div className="flex items-center gap-1">
                        {clip.isHidden && <EyeOff className="w-2.5 h-2.5 text-amber-400 shrink-0" />}
                        {clip.mediaType === 'image' && <ImageIcon className="w-2.5 h-2.5 text-emerald-400 shrink-0" />}
                        {clip.hasExtractedAudio && <Music className="w-2.5 h-2.5 text-emerald-300 shrink-0" />}
                        <span className="text-[10px] font-medium text-white truncate leading-tight">
                          {clip.title}
                        </span>
                      </div>
                      <span className="text-[8px] font-mono text-neutral-400">
                        {clip.duration.toFixed(1)}s {(clip.trimStart || 0) > 0 ? `(In: ${(clip.trimStart || 0).toFixed(1)}s)` : ''}
                      </span>
                    </div>

                    {isSelected && (
                      <>
                        <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-white rounded-l" />
                        <div className="absolute right-0 top-0 bottom-0 w-1.5 bg-white rounded-r" />
                      </>
                    )}
                  </div>
                );
              })}

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenMedia();
                }}
                className="absolute top-1 bottom-1 rounded-md border border-dashed border-neutral-700 hover:border-neutral-500 hover:bg-neutral-800/40 text-neutral-400 hover:text-white flex items-center justify-center gap-1 px-2.5 text-[9px] transition-all"
                style={{
                  left: `${
                    START_PADDING_PX +
                    (project.videoClips.length > 0
                      ? (project.videoClips[project.videoClips.length - 1].startTime +
                          project.videoClips[project.videoClips.length - 1].duration) *
                        zoomLevel +
                        8
                      : 0)
                  }px`,
                }}
              >
                <Plus className="w-3 h-3" />
                <span>Video</span>
              </button>
            </div>
          </div>

          {/* 3. PISTA 2: Superposición de Imagen sobre Video (Track 2) */}
          <div className="h-10 relative my-0.5 px-0 flex items-center bg-[#150f14] border-b border-neutral-900/60">
            {/* Track Header */}
            <div className="sticky left-0 z-10 w-8 h-full bg-[#1b1219] border-r border-rose-950/80 flex flex-col items-center justify-center text-rose-400/90 shrink-0 gap-0.5">
              <span className="text-[7px] font-mono uppercase text-rose-400/70">Foto</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleHideOverlayTrack();
                }}
                className={`p-0.5 rounded transition-colors ${
                  project.isOverlayTrackHidden ? 'text-amber-400' : 'text-rose-400 hover:text-white'
                }`}
                title={project.isOverlayTrackHidden ? 'Mostrar capa de superposición' : 'Ocultar capa de superposición'}
              >
                {project.isOverlayTrackHidden ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
              </button>
            </div>

            {/* Image Overlays Blocks */}
            <div className="relative h-full flex-1 flex items-center">
              {project.imageOverlays?.map((overlay) => {
                const ovLeft = START_PADDING_PX + overlay.startTime * zoomLevel;
                const ovWidth = overlay.duration * zoomLevel;
                const isSelected = selectedOverlayId === overlay.id;

                return (
                  <div
                    key={overlay.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectClip(null);
                      onSelectOverlay(isSelected ? null : overlay.id);
                      onSeek(overlay.startTime);
                    }}
                    className={`absolute top-1 bottom-1 rounded-md overflow-hidden cursor-pointer transition-all border flex items-center px-1.5 gap-1.5 shadow-xs ${
                      isSelected
                        ? 'border-rose-400 ring-2 ring-rose-500/30 bg-rose-950 text-white z-10'
                        : overlay.isHidden
                        ? 'border-dashed border-amber-600/70 bg-neutral-950/80 opacity-60'
                        : 'border-rose-800/80 hover:border-rose-600 bg-rose-950/60 text-rose-100'
                    }`}
                    style={{
                      left: `${ovLeft}px`,
                      width: `${Math.max(30, ovWidth)}px`,
                    }}
                  >
                    <img
                      src={overlay.imageUrl}
                      alt={overlay.title}
                      className="w-5 h-5 rounded object-cover border border-white/20 shrink-0"
                    />
                    <div className="min-w-0 pr-1">
                      <div className="flex items-center gap-1">
                        <span className="text-[9px] font-medium truncate">
                          {overlay.title}
                        </span>
                        <span className="text-[7px] uppercase font-mono px-1 rounded bg-black/40 text-rose-300">
                          {overlay.fit === 'pip' ? 'PiP' : overlay.fit === 'contain' ? 'Ajustar' : 'Cubrir'}
                        </span>
                      </div>
                      <span className="text-[7px] font-mono text-rose-300/80">
                        {overlay.duration.toFixed(1)}s
                      </span>
                    </div>

                    {isSelected && (
                      <>
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-rose-400 rounded-l" />
                        <div className="absolute right-0 top-0 bottom-0 w-1 bg-rose-400 rounded-r" />
                      </>
                    )}
                  </div>
                );
              })}

              {/* Add Overlay Button on Track */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenOverlay();
                }}
                className="absolute top-1 bottom-1 rounded-md border border-dashed border-rose-800/60 hover:border-rose-500 hover:bg-rose-950/40 text-rose-400/90 hover:text-rose-200 flex items-center justify-center gap-1 px-2 text-[9px] transition-all"
                style={{
                  left: `${
                    START_PADDING_PX +
                    (project.imageOverlays && project.imageOverlays.length > 0
                      ? (project.imageOverlays[project.imageOverlays.length - 1].startTime +
                          project.imageOverlays[project.imageOverlays.length - 1].duration) *
                        zoomLevel +
                        8
                      : 0)
                  }px`,
                }}
              >
                <Plus className="w-2.5 h-2.5" />
                <span>+ Superponer Imagen</span>
              </button>
            </div>
          </div>

          {/* 4. PISTA 3: Audio (Track 3) */}
          <div className="h-8 relative my-0.5 flex items-center bg-[#0d1013] border-b border-neutral-900/60">
            <div className="sticky left-0 z-10 w-8 h-full bg-[#11161b] border-r border-neutral-800/80 flex items-center justify-center text-emerald-400/80 shrink-0">
              <Music className="w-3 h-3" />
            </div>

            <div className="relative h-full flex-1 flex items-center">
              {project.audioClips.map((audio) => {
                const audioLeft = START_PADDING_PX + audio.startTime * zoomLevel;
                const audioWidth = audio.duration * zoomLevel;

                return (
                  <div
                    key={audio.id}
                    className="absolute top-1 bottom-1 rounded bg-emerald-950/50 border border-emerald-700/60 flex items-center px-2 overflow-hidden shadow-xs"
                    style={{
                      left: `${audioLeft}px`,
                      width: `${Math.max(30, audioWidth)}px`,
                    }}
                  >
                    <div className="absolute inset-0 flex items-center gap-[2px] px-2 opacity-60 pointer-events-none">
                      {audio.waveform.map((val, idx) => (
                        <div
                          key={idx}
                          className="w-[2px] bg-emerald-400 rounded-full"
                          style={{ height: `${Math.max(4, val * 20)}px` }}
                        />
                      ))}
                    </div>
                    <span className="relative z-10 text-[9px] font-medium text-emerald-200 truncate leading-none">
                      {audio.title}
                    </span>
                  </div>
                );
              })}

              {project.audioClips.length === 0 && (
                <div
                  className="text-[8px] text-neutral-600 pl-4 italic"
                  style={{ left: `${START_PADDING_PX}px` }}
                >
                  Pista de audio adicional vacía · (El audio del video original suena por defecto)
                </div>
              )}
            </div>
          </div>

          {/* 5. PISTA 4: Rótulos de Texto (Track 4) */}
          {project.textOverlays.length > 0 && (
            <div className="h-7 relative my-0.5 flex items-center bg-[#100e16] border-b border-neutral-900/60">
              <div className="sticky left-0 z-10 w-8 h-full bg-[#16121f] border-r border-neutral-800/80 flex items-center justify-center text-purple-400/80 shrink-0">
                <Type className="w-3 h-3" />
              </div>
              <div className="relative h-full flex-1 flex items-center">
                {project.textOverlays.map((txt) => {
                  const txtLeft = START_PADDING_PX + txt.startTime * zoomLevel;
                  const txtWidth = txt.duration * zoomLevel;

                  return (
                    <div
                      key={txt.id}
                      className="absolute top-1 bottom-1 rounded bg-purple-950/50 border border-purple-700/60 flex items-center px-1.5 overflow-hidden"
                      style={{
                        left: `${txtLeft}px`,
                        width: `${Math.max(26, txtWidth)}px`,
                      }}
                    >
                      <span className="text-[8px] font-medium text-purple-200 truncate">
                        {txt.text}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 6. Cabezal de reproducción desplazable (Draggable Playhead) */}
          <div
            className="absolute top-0 bottom-0 pointer-events-none z-30"
            style={{
              left: `${playheadPositionPx}px`,
              transform: 'translateX(-50%)',
            }}
          >
            <div
              className="playhead-handle pointer-events-auto cursor-ew-resize w-6 h-6 flex items-center justify-center -mt-1 group touch-none"
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              title="Arrastra para mover el cabezal"
            >
              <div className="w-3.5 h-3.5 bg-rose-500 rounded-full shadow-lg border-2 border-white ring-2 ring-black/40 group-hover:scale-125 group-active:scale-125 transition-transform"></div>
            </div>
            <div className="w-[2px] h-[calc(100%-12px)] bg-rose-500 mx-auto shadow-sm shadow-rose-950"></div>
          </div>
        </div>
      </div>
    </div>
  );
};
