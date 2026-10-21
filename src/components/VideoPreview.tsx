import React, { useRef, useEffect } from 'react';
import { Plus, Video, Sparkles, Image as ImageIcon, EyeOff, Film, Volume2, VolumeX, Layers } from 'lucide-react';
import { Project, VideoClip, TextOverlay, ImageOverlay } from '../types/editor';
import { FILTERS_LIST } from '../data/sampleMedia';

interface VideoPreviewProps {
  project: Project;
  currentTime: number;
  totalDuration: number;
  activeClip: VideoClip | null;
  activeImageOverlay: ImageOverlay | null;
  activeText: TextOverlay | null;
  isPlaying: boolean;
  onOpenMedia: () => void;
  onTogglePlay: () => void;
}

export const VideoPreview: React.FC<VideoPreviewProps> = ({
  project,
  currentTime,
  totalDuration,
  activeClip,
  activeImageOverlay,
  activeText,
  isPlaying,
  onOpenMedia,
  onTogglePlay
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  // Find current active filter CSS string
  const currentFilterConfig = FILTERS_LIST.find((f) => f.id === project.activeFilter);
  const filterStyle = currentFilterConfig
    ? currentFilterConfig.cssFilter(project.filterIntensity)
    : 'none';

  // Format time (mm:ss.ss)
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 10);
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}.${ms}`;
  };

  const isEmpty = project.videoClips.length === 0;
  const isVideoHidden = activeClip?.isHidden || project.isVideoTrackHidden;
  const isOverlayHidden = !activeImageOverlay || activeImageOverlay.isHidden || project.isOverlayTrackHidden;

  // Synchronize HTML5 video element with timeline currentTime, trim offset, and play state
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !activeClip || activeClip.mediaType !== 'video' || !activeClip.videoUrl) return;

    // Calculate local time inside clip accounting for trimStart and speed
    const trimOffset = activeClip.trimStart || 0;
    const clipLocalTime = Math.max(0, (currentTime - activeClip.startTime) * (activeClip.speed || 1.0) + trimOffset);

    // Sync playback rate
    video.playbackRate = activeClip.speed || 1.0;

    // Audio policy: audio remains unmuted by default unless explicitly separated or track is muted
    // Crucial: The audio continues playing even when an image overlay covers the video!
    video.muted = !!activeClip.hasExtractedAudio;

    // Resynchronize video time if drift exceeds threshold
    if (Math.abs(video.currentTime - clipLocalTime) > 0.25) {
      video.currentTime = clipLocalTime;
    }

    if (isPlaying) {
      video.play().catch(() => {
        // Fallback for browser autoplay policies
      });
    } else {
      video.pause();
    }
  }, [currentTime, isPlaying, activeClip]);

  return (
    <div className="relative flex-1 min-h-[220px] max-h-[380px] w-full flex items-center justify-center p-2 bg-[#090a0d] select-none overflow-hidden">
      {/* 9:16 Aspect Ratio Frame */}
      <div
        className="relative h-full aspect-[9/16] bg-[#12141a] rounded-lg overflow-hidden border border-neutral-800/80 shadow-lg flex flex-col items-center justify-center cursor-pointer group"
        onClick={() => {
          if (!isEmpty) onTogglePlay();
        }}
      >
        {isEmpty ? (
          /* Empty State: Instructions on how to begin */
          <div className="flex flex-col items-center justify-center p-6 text-center text-neutral-400">
            <div className="w-12 h-12 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-center text-neutral-300 mb-3 shadow-inner">
              <Video className="w-6 h-6 stroke-[1.5]" />
            </div>
            <h3 className="text-sm font-medium text-white mb-1">
              Tu proyecto está vacío
            </h3>
            <p className="text-[11px] text-neutral-400 max-w-[170px] leading-relaxed mb-4">
              Importa un video de la galería y superpón imágenes en la línea de tiempo.
            </p>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onOpenMedia();
              }}
              className="px-3.5 py-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 active:scale-95 text-white text-xs font-medium flex items-center gap-1.5 transition-all shadow-sm border border-neutral-700"
            >
              <Plus className="w-3.5 h-3.5 text-neutral-200" />
              <span>Importar Video</span>
            </button>
          </div>
        ) : (
          /* Active Preview Canvas (Multi-layer Compositor) */
          <div className="relative w-full h-full overflow-hidden flex items-center justify-center bg-black">
            {/* LAYER 1: BASE VIDEO / BACKGROUND LAYER */}
            {isVideoHidden ? (
              <div className="w-full h-full bg-[#0a0b0e] flex flex-col items-center justify-center text-neutral-500 p-4">
                <div className="w-9 h-9 rounded-full bg-neutral-900/80 border border-neutral-800 flex items-center justify-center mb-1.5">
                  <EyeOff className="w-4 h-4 text-neutral-400" />
                </div>
                <span className="text-[11px] font-medium text-neutral-400">
                  {project.isVideoTrackHidden ? 'Pista de video oculta' : 'Clip de video oculto'}
                </span>
              </div>
            ) : activeClip ? (
              <div className="w-full h-full relative flex items-center justify-center">
                {activeClip.mediaType === 'video' && activeClip.videoUrl ? (
                  /* Native HTML5 Video Element */
                  <video
                    ref={videoRef}
                    src={activeClip.videoUrl}
                    playsInline
                    loop
                    className="w-full h-full object-cover transition-all"
                    style={{ filter: filterStyle }}
                  />
                ) : activeClip.mediaType === 'image' && activeClip.imageUrl ? (
                  /* Base Photo Clip */
                  <div className="w-full h-full relative overflow-hidden flex items-center justify-center bg-neutral-950">
                    <img
                      src={activeClip.imageUrl}
                      alt={activeClip.title}
                      className="w-full h-full object-cover transition-all"
                      style={{ filter: filterStyle }}
                    />
                  </div>
                ) : (
                  /* Sample Procedural Gradient Simulation */
                  <div
                    className="w-full h-full flex flex-col items-center justify-center relative transition-all duration-300"
                    style={{
                      background: (activeClip as any).previewBg ||
                        'radial-gradient(ellipse at bottom, #b45309 0%, #881337 45%, #0f172a 100%)',
                      filter: filterStyle,
                    }}
                  >
                    <div
                      className={`absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/20 pointer-events-none ${
                        isPlaying ? 'opacity-80' : 'opacity-60'
                      }`}
                    />
                    <div className="relative z-10 flex flex-col items-center justify-center text-center p-4">
                      <div className="w-8 h-8 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center border border-white/10 mb-1.5">
                        <Film className="w-4 h-4 text-white/80" />
                      </div>
                      <span className="text-[11px] font-medium text-white/90 drop-shadow-md tracking-tight">
                        {activeClip.title}
                      </span>
                      <span className="text-[9px] text-white/60 font-mono mt-0.5">
                        {activeClip.speed !== 1.0 ? `${activeClip.speed}x · ` : ''}
                        {formatTime(currentTime)}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="w-full h-full bg-neutral-950 flex items-center justify-center text-neutral-600 text-xs">
                Fin del metraje
              </div>
            )}

            {/* LAYER 2: IMAGE OVERLAY (SUPERPOSICIÓN DE IMAGEN SOBRE VIDEO) */}
            {!isOverlayHidden && activeImageOverlay && (
              <div
                className={`absolute inset-0 z-15 pointer-events-none flex transition-all duration-200 ${
                  activeImageOverlay.fit === 'pip'
                    ? activeImageOverlay.position === 'top-right'
                      ? 'items-start justify-end p-3'
                      : activeImageOverlay.position === 'bottom-right'
                      ? 'items-end justify-end p-3'
                      : activeImageOverlay.position === 'top'
                      ? 'items-start justify-center p-3'
                      : activeImageOverlay.position === 'bottom'
                      ? 'items-end justify-center p-3'
                      : 'items-center justify-center p-3'
                    : 'items-center justify-center bg-black'
                }`}
                style={{ opacity: activeImageOverlay.opacity ?? 1.0 }}
              >
                {activeImageOverlay.fit === 'pip' ? (
                  /* Picture-in-Picture (PiP) Floating Box */
                  <div
                    className="relative overflow-hidden rounded-xl border-2 border-white/80 shadow-2xl shadow-black ring-1 ring-black/50 transition-transform"
                    style={{
                      width: `${Math.round((activeImageOverlay.scale || 0.38) * 100)}%`,
                      aspectRatio: '9/16',
                    }}
                  >
                    <img
                      src={activeImageOverlay.imageUrl}
                      alt={activeImageOverlay.title}
                      className="w-full h-full object-cover"
                      style={{ filter: filterStyle }}
                    />
                    <div className="absolute top-1 left-1 px-1 py-0.5 rounded bg-black/70 backdrop-blur-xs text-[7px] font-semibold text-rose-300 uppercase tracking-wider">
                      PiP
                    </div>
                  </div>
                ) : activeImageOverlay.fit === 'contain' ? (
                  /* Contain Mode: Full 9:16 frame, preserving image aspect ratio without cropping */
                  <div className="relative w-full h-full flex items-center justify-center bg-black">
                    <img
                      src={activeImageOverlay.imageUrl}
                      alt={activeImageOverlay.title}
                      className="max-w-full max-h-full object-contain"
                      style={{
                        transform: `scale(${activeImageOverlay.scale || 1.0})`,
                        filter: filterStyle,
                      }}
                    />
                    <div className="absolute top-2.5 left-2.5 z-20 px-1.5 py-0.5 rounded bg-rose-950/80 border border-rose-700/60 text-[8px] font-medium text-rose-200 flex items-center gap-1 backdrop-blur-xs">
                      <Layers className="w-2.5 h-2.5" />
                      <span>Imagen sobre video</span>
                    </div>
                  </div>
                ) : (
                  /* Cover Mode: Fills 9:16 frame entirely (Cutaway/B-Roll) */
                  <div className="relative w-full h-full overflow-hidden flex items-center justify-center bg-black">
                    <img
                      src={activeImageOverlay.imageUrl}
                      alt={activeImageOverlay.title}
                      className="w-full h-full object-cover"
                      style={{
                        transform: `scale(${activeImageOverlay.scale || 1.0})`,
                        filter: filterStyle,
                      }}
                    />
                    <div className="absolute top-2.5 left-2.5 z-20 px-1.5 py-0.5 rounded bg-rose-950/80 border border-rose-700/60 text-[8px] font-medium text-rose-200 flex items-center gap-1 backdrop-blur-xs">
                      <Layers className="w-2.5 h-2.5" />
                      <span>Imagen sobre video</span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* AUDIO STATUS INDICATOR: Confirms original audio is actively playing */}
            {activeClip?.mediaType === 'video' && !activeClip.hasExtractedAudio && (
              <div className="absolute bottom-2 right-2 z-20 px-2 py-0.5 rounded bg-black/70 backdrop-blur-md text-[9px] font-sans text-neutral-300 border border-white/5 flex items-center gap-1">
                <Volume2 className="w-2.5 h-2.5 text-emerald-400" />
                <span className="text-emerald-300/90 font-medium">Audio video activo</span>
              </div>
            )}

            {/* Rule of Thirds Grid Overlay */}
            {project.gridOverlay && (
              <div className="absolute inset-0 pointer-events-none grid grid-cols-3 grid-rows-3 border border-white/15 z-20">
                <div className="border-r border-b border-white/15"></div>
                <div className="border-r border-b border-white/15"></div>
                <div className="border-b border-white/15"></div>
                <div className="border-r border-b border-white/15"></div>
                <div className="border-r border-b border-white/15"></div>
                <div className="border-b border-white/15"></div>
                <div className="border-r border-b border-white/15"></div>
                <div className="border-r border-b border-white/15"></div>
                <div></div>
              </div>
            )}

            {/* Real-time Text Overlay on Preview (Highest Layer) */}
            {activeText && (
              <div
                className={`absolute left-0 right-0 px-4 pointer-events-none z-30 flex justify-center transition-all ${
                  activeText.position === 'top'
                    ? 'top-8'
                    : activeText.position === 'center'
                    ? 'top-1/2 -translate-y-1/2'
                    : 'bottom-9'
                }`}
              >
                <div
                  className={`text-center max-w-[90%] px-3 py-1 rounded backdrop-blur-xs drop-shadow-md ${
                    activeText.style === 'bold'
                      ? 'font-black tracking-wider uppercase'
                      : activeText.style === 'serif'
                      ? 'font-serif italic tracking-wide'
                      : activeText.style === 'subtitle'
                      ? 'bg-black/60 font-medium tracking-tight text-xs'
                      : 'font-normal'
                  }`}
                  style={{
                    color: activeText.color,
                    fontSize: `${activeText.fontSize}px`,
                  }}
                >
                  {activeText.text}
                </div>
              </div>
            )}

            {/* Filter Badge indicator when a filter is applied */}
            {project.activeFilter !== 'normal' && (
              <div className="absolute top-2.5 right-2.5 z-20 flex items-center gap-1 px-1.5 py-0.5 rounded bg-black/60 backdrop-blur-md border border-white/10 text-[9px] text-white/90">
                <Sparkles className="w-2.5 h-2.5 text-amber-300" />
                <span>{currentFilterConfig?.name}</span>
              </div>
            )}
          </div>
        )}

        {/* Floating Timecode HUD */}
        <div className="absolute bottom-2 left-2 z-20 px-2 py-0.5 rounded bg-black/75 backdrop-blur-md text-[10px] font-mono text-neutral-300 border border-white/5 pointer-events-none tabular-nums">
          <span className="text-white font-medium">{formatTime(currentTime)}</span>
          <span className="text-neutral-500 mx-1">/</span>
          <span className="text-neutral-400">{formatTime(totalDuration)}</span>
        </div>
      </div>
    </div>
  );
};
