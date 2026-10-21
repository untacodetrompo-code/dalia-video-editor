import React, { useState, useEffect, useRef, useCallback } from 'react';
import { AndroidFrame } from './components/AndroidFrame';
import { TopBar } from './components/TopBar';
import { VideoPreview } from './components/VideoPreview';
import { PlaybackControls } from './components/PlaybackControls';
import { Timeline } from './components/Timeline';
import { ToolBar } from './components/ToolBar';
import { MediaPanel } from './components/panels/MediaPanel';
import { TrimPanel } from './components/panels/TrimPanel';
import { OverlayPanel } from './components/panels/OverlayPanel';
import { AudioPanel } from './components/panels/AudioPanel';
import { TextPanel } from './components/panels/TextPanel';
import { FilterPanel } from './components/panels/FilterPanel';
import { SettingsModal } from './components/modals/SettingsModal';
import { ExportModal } from './components/modals/ExportModal';
import { ProjectsScreen } from './components/ProjectsScreen';
import { Project, VideoClip, AudioClip, TextOverlay, ImageOverlay, ToolType, AspectRatio, FilterType } from './types/editor';
import { INITIAL_PROJECT, INITIAL_SAVED_PROJECTS } from './data/sampleMedia';

export default function App() {
  const [projects, setProjects] = useState<Project[]>(() => {
    try {
      const saved = localStorage.getItem('dalia_projects_v1');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      // safe fallback
    }
    return INITIAL_SAVED_PROJECTS;
  });

  const [activeProjectId, setActiveProjectId] = useState<string | null>(() => {
    return projects[0]?.id || 'proj-default-1';
  });
  const [isFramed, setIsFramed] = useState<boolean>(true);

  // Auto-persist projects to phone's localStorage
  useEffect(() => {
    try {
      localStorage.setItem('dalia_projects_v1', JSON.stringify(projects));
    } catch (e) {
      // ignore storage quota
    }
  }, [projects]);

  // Playback & Scrubber State
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [activeTool, setActiveTool] = useState<ToolType>(null);
  const [selectedClipId, setSelectedClipId] = useState<string | null>(null);
  const [selectedOverlayId, setSelectedOverlayId] = useState<string | null>(null);

  // Modals
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isExportOpen, setIsExportOpen] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Undo & Redo History Stacks
  const [undoStack, setUndoStack] = useState<Project[]>([]);
  const [redoStack, setRedoStack] = useState<Project[]>([]);

  // Reference for requestAnimationFrame playback
  const animationFrameRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);

  // Save project manually on phone
  const handleSaveProject = () => {
    try {
      localStorage.setItem('dalia_projects_v1', JSON.stringify(projects));
      showToast('Proyecto guardado en el teléfono');
    } catch (e) {
      showToast('Error al guardar proyecto');
    }
  };

  // Current active project
  const currentProject = projects.find((p) => p.id === activeProjectId) || null;

  // Calculate total duration from video clips, overlays, and audio clips
  const totalDuration = currentProject
    ? Math.max(
        currentProject.videoClips.reduce((acc, clip) => Math.max(acc, clip.startTime + clip.duration), 0),
        (currentProject.imageOverlays || []).reduce((acc, ov) => Math.max(acc, ov.startTime + ov.duration), 0),
        currentProject.audioClips.reduce((acc, audio) => Math.max(acc, audio.startTime + audio.duration), 0),
        0
      )
    : 0;

  // Helper for quick toast messages
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 2200);
  };

  // Find active video clip based on currentTime
  const activeClip = currentProject
    ? currentProject.videoClips.find(
        (clip) => currentTime >= clip.startTime && currentTime < clip.startTime + clip.duration
      ) || currentProject.videoClips[currentProject.videoClips.length - 1] || null
    : null;

  // Find active image overlay based on currentTime
  const activeImageOverlay = currentProject
    ? (currentProject.imageOverlays || []).find(
        (ov) => !ov.isHidden && currentTime >= ov.startTime && currentTime < ov.startTime + ov.duration
      ) || null
    : null;

  // Find active text overlay based on currentTime
  const activeText = currentProject
    ? currentProject.textOverlays.find(
        (txt) => currentTime >= txt.startTime && currentTime <= txt.startTime + txt.duration
      ) || null
    : null;

  // Update Project Helper with Undo History Tracking
  const updateCurrentProject = useCallback(
    (updates: Partial<Project>, recordHistory: boolean = true) => {
      if (!activeProjectId) return;
      setProjects((prev) => {
        const current = prev.find((p) => p.id === activeProjectId);
        if (current && recordHistory) {
          setUndoStack((past) => [...past.slice(-25), JSON.parse(JSON.stringify(current))]);
          setRedoStack([]); // reset redo stack when a new action is performed
        }
        return prev.map((p) =>
          p.id === activeProjectId
            ? { ...p, ...updates, updatedAt: 'Recién editado' }
            : p
        );
      });
    },
    [activeProjectId]
  );

  // Undo (Deshacer)
  const handleUndo = useCallback(() => {
    if (undoStack.length === 0 || !activeProjectId || !currentProject) return;
    const previousState = undoStack[undoStack.length - 1];
    const newUndoStack = undoStack.slice(0, -1);

    setRedoStack((future) => [...future, JSON.parse(JSON.stringify(currentProject))]);
    setUndoStack(newUndoStack);

    setProjects((prev) =>
      prev.map((p) => (p.id === activeProjectId ? { ...previousState, updatedAt: 'Recién editado' } : p))
    );
    showToast('Cambio deshecho');
  }, [undoStack, activeProjectId, currentProject]);

  // Redo (Rehacer)
  const handleRedo = useCallback(() => {
    if (redoStack.length === 0 || !activeProjectId || !currentProject) return;
    const nextState = redoStack[redoStack.length - 1];
    const newRedoStack = redoStack.slice(0, -1);

    setUndoStack((past) => [...past, JSON.parse(JSON.stringify(currentProject))]);
    setRedoStack(newRedoStack);

    setProjects((prev) =>
      prev.map((p) => (p.id === activeProjectId ? { ...nextState, updatedAt: 'Recién editado' } : p))
    );
    showToast('Cambio rehecho');
  }, [redoStack, activeProjectId, currentProject]);

  // Playback Loop via requestAnimationFrame
  useEffect(() => {
    if (!isPlaying) {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      return;
    }

    lastTimeRef.current = performance.now();

    const loop = (now: number) => {
      const deltaSec = (now - lastTimeRef.current) / 1000;
      lastTimeRef.current = now;

      setCurrentTime((prevTime) => {
        const nextTime = prevTime + deltaSec;
        if (totalDuration > 0 && nextTime >= totalDuration) {
          // Loop back to start
          return 0;
        }
        return nextTime;
      });

      animationFrameRef.current = requestAnimationFrame(loop);
    };

    animationFrameRef.current = requestAnimationFrame(loop);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isPlaying, totalDuration]);

  // Keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement).tagName === 'INPUT') return;

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        if (e.shiftKey) {
          handleRedo();
        } else {
          handleUndo();
        }
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') {
        e.preventDefault();
        handleRedo();
      } else if (e.code === 'Space') {
        e.preventDefault();
        setIsPlaying((prev) => !prev);
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        setCurrentTime((prev) => Math.max(0, prev - 1));
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        setCurrentTime((prev) => Math.min(totalDuration, prev + 1));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [totalDuration, handleUndo, handleRedo]);

  // Navigation handlers
  const handleTogglePlay = () => {
    if (totalDuration === 0) return;
    setIsPlaying((prev) => !prev);
  };

  const handlePrev = () => {
    if (!currentProject) return;
    const prevClip = [...currentProject.videoClips]
      .reverse()
      .find((c) => c.startTime < currentTime - 0.2);

    if (prevClip) {
      setCurrentTime(prevClip.startTime);
    } else {
      setCurrentTime((prev) => Math.max(0, prev - 1));
    }
  };

  const handleNext = () => {
    if (!currentProject) return;
    const nextClip = currentProject.videoClips.find(
      (c) => c.startTime > currentTime + 0.2
    );

    if (nextClip) {
      setCurrentTime(nextClip.startTime);
    } else {
      setCurrentTime((prev) => Math.min(totalDuration, prev + 1));
    }
  };

  const handleReset = () => {
    setCurrentTime(0);
    setIsPlaying(false);
  };

  // Add multiple clips sequentially
  const handleAddClips = (newClips: VideoClip[]) => {
    if (!currentProject || newClips.length === 0) return;

    let lastEndTime = currentProject.videoClips.reduce(
      (max, c) => Math.max(max, c.startTime + c.duration),
      0
    );

    const indexedClips = newClips.map((clip) => {
      const withStart = { ...clip, startTime: lastEndTime, trimStart: 0 };
      lastEndTime += clip.duration;
      return withStart;
    });

    const updatedClips = [...currentProject.videoClips, ...indexedClips];
    updateCurrentProject({ videoClips: updatedClips });
    setSelectedClipId(indexedClips[0].id);

    if (newClips.length === 1) {
      showToast(`Añadido: "${newClips[0].title}" (${newClips[0].duration}s)`);
    } else {
      showToast(`Se agregaron ${newClips.length} medios a la línea de tiempo`);
    }
  };

  // Separate / Extract Audio from Video Clip
  const handleSeparateAudio = (clipId: string) => {
    if (!currentProject) return;
    const targetClip = currentProject.videoClips.find((c) => c.id === clipId);
    if (!targetClip) return;

    const waveformLength = Math.max(10, Math.min(36, Math.floor(targetClip.duration * 4)));
    const waveform: number[] = [];
    for (let i = 0; i < waveformLength; i++) {
      waveform.push(Number((0.2 + Math.random() * 0.75).toFixed(2)));
    }

    const newAudio: AudioClip = {
      id: `audio-sep-${targetClip.id}-${Date.now()}`,
      title: `Audio · ${targetClip.title}`,
      duration: targetClip.duration,
      startTime: targetClip.startTime,
      category: 'música',
      volume: 1.0,
      waveform,
    };

    const updatedClips = currentProject.videoClips.map((c) =>
      c.id === clipId ? { ...c, hasExtractedAudio: true } : c
    );

    updateCurrentProject({
      videoClips: updatedClips,
      audioClips: [...currentProject.audioClips, newAudio],
    });

    showToast('Audio separado del video en pista de audio');
  };

  // Toggle Hide/Show specific clip
  const handleToggleHideClip = (clipId: string) => {
    if (!currentProject) return;
    const target = currentProject.videoClips.find((c) => c.id === clipId);
    if (!target) return;

    const newHiddenState = !target.isHidden;
    const updatedClips = currentProject.videoClips.map((c) =>
      c.id === clipId ? { ...c, isHidden: newHiddenState } : c
    );

    updateCurrentProject({ videoClips: updatedClips });
    showToast(newHiddenState ? 'Clip ocultado de la vista previa' : 'Clip visible en vista previa');
  };

  // Toggle Hide/Show entire video track
  const handleToggleHideVideoTrack = () => {
    if (!currentProject) return;
    const newState = !currentProject.isVideoTrackHidden;
    updateCurrentProject({ isVideoTrackHidden: newState });
    showToast(newState ? 'Pista de video oculta' : 'Pista de video visible');
  };

  // Toggle Hide/Show image overlay track
  const handleToggleHideOverlayTrack = () => {
    if (!currentProject) return;
    const newState = !currentProject.isOverlayTrackHidden;
    updateCurrentProject({ isOverlayTrackHidden: newState });
    showToast(newState ? 'Capa de superposición oculta' : 'Capa de superposición visible');
  };

  // Trimming In / Out Point Handlers
  const handleAdjustTrimStart = (clipId: string, delta: number) => {
    if (!currentProject) return;
    const updated = currentProject.videoClips.map((c) => {
      if (c.id === clipId) {
        const currentTrim = c.trimStart || 0;
        const newTrim = Math.max(0, Number((currentTrim + delta).toFixed(2)));
        return { ...c, trimStart: newTrim };
      }
      return c;
    });
    updateCurrentProject({ videoClips: updated });
  };

  const handleSetInPointAtPlayhead = (clipId: string) => {
    if (!currentProject) return;
    const clip = currentProject.videoClips.find((c) => c.id === clipId);
    if (!clip) return;

    const relativeTime = currentTime - clip.startTime;
    if (relativeTime < 0 || relativeTime >= clip.duration - 0.5) {
      showToast('Ubica el cabezal dentro del clip para fijar el punto de inicio');
      return;
    }

    const newTrimStart = Number(((clip.trimStart || 0) + relativeTime).toFixed(2));
    const newDuration = Number((clip.duration - relativeTime).toFixed(2));

    const updated = currentProject.videoClips.map((c) =>
      c.id === clipId ? { ...c, trimStart: newTrimStart, duration: newDuration, startTime: currentTime } : c
    );
    updateCurrentProject({ videoClips: updated });
    showToast(`Punto de inicio fijado en ${newTrimStart}s`);
  };

  const handleSetOutPointAtPlayhead = (clipId: string) => {
    if (!currentProject) return;
    const clip = currentProject.videoClips.find((c) => c.id === clipId);
    if (!clip) return;

    const relativeTime = currentTime - clip.startTime;
    if (relativeTime <= 0.5) {
      showToast('El punto final debe ser posterior al inicio');
      return;
    }

    const newDuration = Number(relativeTime.toFixed(2));
    const updated = currentProject.videoClips.map((c) =>
      c.id === clipId ? { ...c, duration: newDuration } : c
    );
    updateCurrentProject({ videoClips: updated });
    showToast(`Punto de fin fijado en ${newDuration}s`);
  };

  const handleSplitClip = () => {
    if (!currentProject) return;
    const targetClip =
      currentProject.videoClips.find(
        (c) => currentTime > c.startTime + 0.3 && currentTime < c.startTime + c.duration - 0.3
      ) ||
      (selectedClipId
        ? currentProject.videoClips.find((c) => c.id === selectedClipId)
        : null);

    if (!targetClip) {
      showToast('Ubica el cabezal dentro de un clip para dividirlo');
      return;
    }

    const splitOffset = currentTime - targetClip.startTime;
    if (splitOffset <= 0.4 || splitOffset >= targetClip.duration - 0.4) {
      showToast('El corte está muy cerca del borde del clip');
      return;
    }

    const firstHalfDuration = Number(splitOffset.toFixed(2));
    const secondHalfDuration = Number((targetClip.duration - splitOffset).toFixed(2));

    const firstHalf: VideoClip = {
      ...targetClip,
      duration: firstHalfDuration,
    };

    const secondHalf: VideoClip = {
      ...targetClip,
      id: `clip-${Date.now()}`,
      title: `${targetClip.title} (Parte 2)`,
      startTime: Number((targetClip.startTime + firstHalfDuration).toFixed(2)),
      trimStart: Number(((targetClip.trimStart || 0) + firstHalfDuration).toFixed(2)),
      duration: secondHalfDuration,
    };

    const clipIndex = currentProject.videoClips.findIndex((c) => c.id === targetClip.id);
    const updatedClips = [...currentProject.videoClips];
    updatedClips.splice(clipIndex, 1, firstHalf, secondHalf);

    updateCurrentProject({ videoClips: updatedClips });
    setSelectedClipId(secondHalf.id);
    showToast('Clip dividido en el cabezal');
  };

  const handleDeleteClip = (clipId: string) => {
    if (!currentProject) return;
    const filtered = currentProject.videoClips.filter((c) => c.id !== clipId);

    let runningTime = 0;
    const reindexed = filtered.map((c) => {
      const updated = { ...c, startTime: runningTime };
      runningTime += c.duration;
      return updated;
    });

    updateCurrentProject({ videoClips: reindexed });
    setSelectedClipId(null);
    showToast('Clip eliminado');
  };

  const handleUpdateSpeed = (clipId: string, speed: number) => {
    if (!currentProject) return;
    const updated = currentProject.videoClips.map((c) => {
      if (c.id === clipId) {
        const newDuration = Number(((c.duration * c.speed) / speed).toFixed(2));
        return { ...c, speed, duration: newDuration };
      }
      return c;
    });

    let runningTime = 0;
    const reindexed = updated.map((c) => {
      const res = { ...c, startTime: runningTime };
      runningTime += c.duration;
      return res;
    });

    updateCurrentProject({ videoClips: reindexed });
    showToast(`Velocidad cambiada a ${speed}x`);
  };

  const handleAdjustDuration = (clipId: string, delta: number) => {
    if (!currentProject) return;
    const updated = currentProject.videoClips.map((c) => {
      if (c.id === clipId) {
        return { ...c, duration: Math.max(1, Number((c.duration + delta).toFixed(2))) };
      }
      return c;
    });

    let running = 0;
    const reindexed = updated.map((c) => {
      const res = { ...c, startTime: running };
      running += c.duration;
      return res;
    });

    updateCurrentProject({ videoClips: reindexed });
  };

  const handleDuplicateClip = (clipId: string) => {
    if (!currentProject) return;
    const clipToDup = currentProject.videoClips.find((c) => c.id === clipId);
    if (!clipToDup) return;

    const duplicated: VideoClip = {
      ...clipToDup,
      id: `clip-dup-${Date.now()}`,
      title: `${clipToDup.title} (Copia)`,
      trimStart: clipToDup.trimStart || 0,
    };

    handleAddClips([duplicated]);
  };

  // Image Overlay Handlers (Superposición de Imágenes sobre Video)
  const handleAddOverlay = (overlay: ImageOverlay) => {
    if (!currentProject) return;
    const currentList = currentProject.imageOverlays || [];
    updateCurrentProject({ imageOverlays: [...currentList, overlay] });
    setSelectedOverlayId(overlay.id);
    showToast(`Imagen superpuesta "${overlay.title}" agregada`);
  };

  const handleUpdateOverlay = (id: string, updates: Partial<ImageOverlay>) => {
    if (!currentProject) return;
    const updated = (currentProject.imageOverlays || []).map((o) =>
      o.id === id ? { ...o, ...updates } : o
    );
    updateCurrentProject({ imageOverlays: updated });
  };

  const handleDeleteOverlay = (id: string) => {
    if (!currentProject) return;
    const updated = (currentProject.imageOverlays || []).filter((o) => o.id !== id);
    updateCurrentProject({ imageOverlays: updated });
    setSelectedOverlayId(null);
    showToast('Superposición eliminada');
  };

  const handleAdjustOverlayTiming = (id: string, deltaStart: number, deltaDuration: number) => {
    if (!currentProject) return;
    const updated = (currentProject.imageOverlays || []).map((o) => {
      if (o.id === id) {
        const newStart = Math.max(0, Number((o.startTime + deltaStart).toFixed(2)));
        const newDuration = Math.max(0.5, Number((o.duration + deltaDuration).toFixed(2)));
        return { ...o, startTime: newStart, duration: newDuration };
      }
      return o;
    });
    updateCurrentProject({ imageOverlays: updated });
  };

  // Audio actions
  const handleAddAudio = (audio: AudioClip) => {
    if (!currentProject) return;
    updateCurrentProject({ audioClips: [...currentProject.audioClips, audio] });
    showToast(`Pista de audio "${audio.title}" agregada`);
  };

  const handleRemoveAudio = (id: string) => {
    if (!currentProject) return;
    updateCurrentProject({
      audioClips: currentProject.audioClips.filter((a) => a.id !== id),
    });
    showToast('Pista de audio eliminada');
  };

  const handleUpdateAudioVolume = (id: string, volume: number) => {
    if (!currentProject) return;
    const updated = currentProject.audioClips.map((a) =>
      a.id === id ? { ...a, volume } : a
    );
    updateCurrentProject({ audioClips: updated });
  };

  // Text actions
  const handleAddText = (textItem: TextOverlay) => {
    if (!currentProject) return;
    updateCurrentProject({ textOverlays: [...currentProject.textOverlays, textItem] });
    showToast('Texto añadido sobre el video');
  };

  const handleRemoveText = (id: string) => {
    if (!currentProject) return;
    updateCurrentProject({
      textOverlays: currentProject.textOverlays.filter((t) => t.id !== id),
    });
    showToast('Texto eliminado');
  };

  // Filter actions
  const handleSelectFilter = (filter: FilterType) => {
    updateCurrentProject({ activeFilter: filter });
    showToast(`Filtro aplicado`);
  };

  const handleUpdateFilterIntensity = (intensity: number) => {
    updateCurrentProject({ filterIntensity: intensity });
  };

  // Project management
  const handleCreateProject = (title: string, aspectRatio: AspectRatio) => {
    const newProj: Project = {
      id: `proj-${Date.now()}`,
      title,
      aspectRatio,
      resolution: '1080p',
      fps: 30,
      updatedAt: 'Ahora',
      activeFilter: 'normal',
      filterIntensity: 80,
      gridOverlay: false,
      videoClips: [],
      imageOverlays: [],
      audioClips: [],
      textOverlays: [],
    };

    setProjects([newProj, ...projects]);
    setActiveProjectId(newProj.id);
    setUndoStack([]);
    setRedoStack([]);
    setCurrentTime(0);
    setIsPlaying(false);
    setSelectedClipId(null);
    setSelectedOverlayId(null);
    showToast(`Proyecto "${title}" creado`);
  };

  const handleDeleteProject = (projId: string) => {
    setProjects(projects.filter((p) => p.id !== projId));
    if (activeProjectId === projId) {
      setActiveProjectId(null);
    }
  };

  const handleClearProjectClips = () => {
    updateCurrentProject({
      videoClips: [],
      imageOverlays: [],
      audioClips: [],
      textOverlays: [],
    });
    setCurrentTime(0);
    setIsPlaying(false);
    setSelectedClipId(null);
    setSelectedOverlayId(null);
    showToast('Línea de tiempo vaciada');
  };

  return (
    <AndroidFrame isFramed={isFramed} onToggleFrame={() => setIsFramed(!isFramed)}>
      {/* Toast Notification HUD */}
      {toastMessage && (
        <div className="absolute top-14 left-1/2 -translate-x-1/2 z-50 px-3 py-1.5 rounded-full bg-neutral-900/95 border border-neutral-700 text-white text-[11px] font-medium shadow-xl pointer-events-none animate-in fade-in zoom-in-95 duration-150 flex items-center gap-1.5 whitespace-nowrap">
          <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Screen Switcher: Projects Screen vs Active Project Editor */}
      {!currentProject ? (
        <ProjectsScreen
          projects={projects}
          onOpenProject={(id) => {
            setActiveProjectId(id);
            setUndoStack([]);
            setRedoStack([]);
            setCurrentTime(0);
            setIsPlaying(false);
            setSelectedClipId(null);
            setSelectedOverlayId(null);
          }}
          onCreateProject={handleCreateProject}
          onDeleteProject={handleDeleteProject}
        />
      ) : (
        <div className="flex-1 flex flex-col h-full bg-[#0b0c0f] overflow-hidden relative">
          {/* 1. Top Bar */}
          <TopBar
            projectTitle={currentProject.title}
            canUndo={undoStack.length > 0}
            canRedo={redoStack.length > 0}
            onUndo={handleUndo}
            onRedo={handleRedo}
            onSaveProject={handleSaveProject}
            onOpenSettings={() => setIsSettingsOpen(true)}
            onOpenExport={() => setIsExportOpen(true)}
            onBackToProjects={() => {
              setIsPlaying(false);
              setActiveProjectId(null);
            }}
          />

          {/* 2. Central Video Preview (9:16 Vertical Multi-layer Compositor) */}
          <VideoPreview
            project={currentProject}
            currentTime={currentTime}
            totalDuration={totalDuration}
            activeClip={activeClip}
            activeImageOverlay={activeImageOverlay}
            activeText={activeText}
            isPlaying={isPlaying}
            onOpenMedia={() => setActiveTool('medios')}
            onTogglePlay={handleTogglePlay}
          />

          {/* 3. Playback Controls */}
          <PlaybackControls
            isPlaying={isPlaying}
            onTogglePlay={handleTogglePlay}
            onPrev={handlePrev}
            onNext={handleNext}
            onReset={handleReset}
            currentTime={currentTime}
            totalDuration={totalDuration}
          />

          {/* 4. Timeline (Video track, Image Overlay track, Audio track, Text track) */}
          <Timeline
            project={currentProject}
            currentTime={currentTime}
            totalDuration={totalDuration}
            onSeek={(t) => setCurrentTime(t)}
            selectedClipId={selectedClipId}
            onSelectClip={(id) => {
              setSelectedClipId(id);
              if (id) setSelectedOverlayId(null);
            }}
            selectedOverlayId={selectedOverlayId}
            onSelectOverlay={(id) => {
              setSelectedOverlayId(id);
              if (id) setSelectedClipId(null);
            }}
            onOpenMedia={() => setActiveTool('medios')}
            onOpenOverlay={() => setActiveTool('superponer')}
            onSplitClip={handleSplitClip}
            onDeleteClip={handleDeleteClip}
            onSeparateAudio={handleSeparateAudio}
            onToggleHideClip={handleToggleHideClip}
            onToggleHideVideoTrack={handleToggleHideVideoTrack}
            onToggleHideOverlayTrack={handleToggleHideOverlayTrack}
            onDeleteOverlay={handleDeleteOverlay}
            onAdjustOverlayTiming={handleAdjustOverlayTiming}
          />

          {/* 5. Bottom Tool Bar (Medios, Recortar, Superponer, Audio, Texto, Filtros) */}
          <ToolBar
            activeTool={activeTool}
            onSelectTool={(tool) => setActiveTool(tool)}
          />

          {/* Tool Panels (Bottom Sheets) */}
          {activeTool === 'medios' && (
            <MediaPanel
              onClose={() => setActiveTool(null)}
              onAddClips={handleAddClips}
              currentTime={currentTime}
            />
          )}

          {activeTool === 'recortar' && (
            <TrimPanel
              onClose={() => setActiveTool(null)}
              selectedClip={
                currentProject.videoClips.find((c) => c.id === selectedClipId) ||
                activeClip
              }
              currentTime={currentTime}
              onSplitClip={handleSplitClip}
              onUpdateSpeed={handleUpdateSpeed}
              onAdjustDuration={handleAdjustDuration}
              onAdjustTrimStart={handleAdjustTrimStart}
              onSetInPointAtPlayhead={handleSetInPointAtPlayhead}
              onSetOutPointAtPlayhead={handleSetOutPointAtPlayhead}
              onDuplicateClip={handleDuplicateClip}
              onDeleteClip={handleDeleteClip}
              onSeparateAudio={handleSeparateAudio}
              onToggleHideClip={handleToggleHideClip}
            />
          )}

          {activeTool === 'superponer' && (
            <OverlayPanel
              onClose={() => setActiveTool(null)}
              selectedOverlay={
                (currentProject.imageOverlays || []).find((o) => o.id === selectedOverlayId) ||
                activeImageOverlay ||
                (currentProject.imageOverlays && currentProject.imageOverlays[0]) ||
                null
              }
              overlays={currentProject.imageOverlays || []}
              currentTime={currentTime}
              onAddOverlay={handleAddOverlay}
              onUpdateOverlay={handleUpdateOverlay}
              onDeleteOverlay={handleDeleteOverlay}
              onSelectOverlay={(id) => setSelectedOverlayId(id)}
            />
          )}

          {activeTool === 'audio' && (
            <AudioPanel
              onClose={() => setActiveTool(null)}
              audioClips={currentProject.audioClips}
              onAddAudio={handleAddAudio}
              onRemoveAudio={handleRemoveAudio}
              onUpdateVolume={handleUpdateAudioVolume}
              currentTime={currentTime}
            />
          )}

          {activeTool === 'texto' && (
            <TextPanel
              onClose={() => setActiveTool(null)}
              textOverlays={currentProject.textOverlays}
              onAddText={handleAddText}
              onRemoveText={handleRemoveText}
              currentTime={currentTime}
            />
          )}

          {activeTool === 'filtros' && (
            <FilterPanel
              onClose={() => setActiveTool(null)}
              activeFilter={currentProject.activeFilter}
              filterIntensity={currentProject.filterIntensity}
              onSelectFilter={handleSelectFilter}
              onUpdateIntensity={handleUpdateFilterIntensity}
            />
          )}

          {/* Settings Modal */}
          {isSettingsOpen && (
            <SettingsModal
              project={currentProject}
              onClose={() => setIsSettingsOpen(false)}
              onUpdateProject={updateCurrentProject}
              onClearProject={handleClearProjectClips}
            />
          )}

          {/* Export Modal */}
          {isExportOpen && (
            <ExportModal
              project={currentProject}
              totalDuration={totalDuration}
              currentTime={currentTime}
              activeClip={activeClip}
              activeImageOverlay={activeImageOverlay}
              onClose={() => setIsExportOpen(false)}
            />
          )}
        </div>
      )}
    </AndroidFrame>
  );
}
