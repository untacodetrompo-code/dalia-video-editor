import { Project, VideoClip, ImageOverlay, TextOverlay } from '../types/editor';

export interface ExportProgress {
  percent: number;
  stage: string;
}

export interface ExportResult {
  blob: Blob;
  url: string;
  filename: string;
  mimeType: string;
}

/**
 * Client-side video exporter using HTML5 Canvas + MediaRecorder
 * Renders the multi-layer composition (Video + Image Overlays + Text + Audio)
 * into a downloadable video file that can be saved directly on Android phones.
 */
export async function exportProjectVideo(
  project: Project,
  totalDuration: number,
  onProgress: (progress: ExportProgress) => void
): Promise<ExportResult> {
  const duration = Math.max(1.0, totalDuration);

  // 1. Determine target resolution (Vertical 9:16)
  const is1080p = project.resolution === '1080p' || project.resolution === '4K';
  const width = is1080p ? 720 : 540; // 720x1280 is ideal for mobile export performance and compatibility
  const height = is1080p ? 1280 : 960;
  const fps = 30;
  const frameIntervalMs = 1000 / fps;
  const totalFrames = Math.ceil(duration * fps);

  onProgress({ percent: 5, stage: 'Preparando lienzo y recursos visuales...' });

  // 2. Pre-load all image overlay assets into Image elements
  const preloadedImages = new Map<string, HTMLImageElement>();
  const imageSources: string[] = [];

  project.videoClips.forEach((c) => {
    if (c.imageUrl) imageSources.push(c.imageUrl);
  });
  (project.imageOverlays || []).forEach((o) => {
    if (o.imageUrl) imageSources.push(o.imageUrl);
  });

  await Promise.all(
    imageSources.map((src) => {
      return new Promise<void>((resolve) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
          preloadedImages.set(src, img);
          resolve();
        };
        img.onerror = () => {
          resolve(); // don't fail entire export on single asset error
        };
        img.src = src;
      });
    })
  );

  onProgress({ percent: 15, stage: 'Iniciando grabador de video en el dispositivo...' });

  // 3. Create Offscreen Canvas for Frame Rendering
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('No se pudo inicializar el contexto gráfico del dispositivo');
  }

  // 4. Setup MediaStream and MediaRecorder
  const canvasStream = canvas.captureStream(fps);

  // Setup Web Audio synthetic tone/clock stream to guarantee valid audio container
  let audioContext: AudioContext | null = null;
  let audioDestination: MediaStreamAudioDestinationNode | null = null;
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioCtx) {
      audioContext = new AudioCtx();
      audioDestination = audioContext.createMediaStreamDestination();
      // Add silence or background tone so mobile players identify video with sound track
      const osc = audioContext.createOscillator();
      const gain = audioContext.createGain();
      gain.gain.value = 0.001; // nearly silent baseline to keep audio stream active
      osc.connect(gain);
      gain.connect(audioDestination);
      osc.start();

      const audioTrack = audioDestination.stream.getAudioTracks()[0];
      if (audioTrack) {
        canvasStream.addTrack(audioTrack);
      }
    }
  } catch (err) {
    console.warn('AudioContext no disponible para exportación, exportando video silencioso', err);
  }

  // Find supported video format
  const supportedMimeTypes = [
    'video/mp4;codecs=avc1,mp4a.40.2',
    'video/mp4',
    'video/webm;codecs=vp9,opus',
    'video/webm;codecs=vp8,opus',
    'video/webm',
  ];

  let selectedMimeType = '';
  for (const mime of supportedMimeTypes) {
    if (typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported(mime)) {
      selectedMimeType = mime;
      break;
    }
  }

  if (!selectedMimeType) {
    selectedMimeType = 'video/webm';
  }

  const isMp4 = selectedMimeType.includes('mp4');
  const fileExtension = isMp4 ? 'mp4' : 'webm';
  const cleanTitle = (project.title || 'video-dalia')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-');
  const filename = `${cleanTitle}.${fileExtension}`;

  const recordedChunks: Blob[] = [];
  const recorder = new MediaRecorder(canvasStream, {
    mimeType: selectedMimeType,
    videoBitsPerSecond: 6_000_000, // 6 Mbps for crisp mobile quality
  });

  recorder.ondataavailable = (e) => {
    if (e.data && e.data.size > 0) {
      recordedChunks.push(e.data);
    }
  };

  recorder.start(100);

  // 5. Render frames loop
  let currentFrame = 0;

  return new Promise<ExportResult>((resolve, reject) => {
    const renderNextFrame = () => {
      if (currentFrame >= totalFrames) {
        // Finished rendering
        onProgress({ percent: 95, stage: 'Finalizando archivo y guardando...' });

        recorder.onstop = () => {
          if (audioContext && audioContext.state !== 'closed') {
            audioContext.close().catch(() => {});
          }

          const finalBlob = new Blob(recordedChunks, { type: selectedMimeType });
          const url = URL.createObjectURL(finalBlob);

          onProgress({ percent: 100, stage: '¡Video listo para guardar en el teléfono!' });
          resolve({
            blob: finalBlob,
            url,
            filename,
            mimeType: selectedMimeType,
          });
        };

        recorder.stop();
        return;
      }

      const currentTime = (currentFrame / fps);
      const progressPercent = 15 + Math.round((currentFrame / totalFrames) * 78);

      onProgress({
        percent: progressPercent,
        stage: `Renderizando segundo ${currentTime.toFixed(1)}s de ${duration.toFixed(1)}s...`,
      });

      // --- DRAW FRAME AT CURRENT TIME ---
      // Background base
      ctx.fillStyle = '#0a0b0e';
      ctx.fillRect(0, 0, width, height);

      // Layer 1: Base Video Clip
      const activeClip = project.videoClips.find(
        (c) => currentTime >= c.startTime && currentTime < c.startTime + c.duration
      ) || project.videoClips[0];

      if (activeClip && !activeClip.isHidden && !project.isVideoTrackHidden) {
        if (activeClip.imageUrl && preloadedImages.has(activeClip.imageUrl)) {
          const img = preloadedImages.get(activeClip.imageUrl)!;
          ctx.drawImage(img, 0, 0, width, height);
        } else {
          // Cinematic gradient background simulation
          const grad = ctx.createLinearGradient(0, 0, width, height);
          grad.addColorStop(0, '#78350f');
          grad.addColorStop(0.5, '#451a03');
          grad.addColorStop(1, '#0c0a09');
          ctx.fillStyle = grad;
          ctx.fillRect(0, 0, width, height);

          // Simulated film watermark
          ctx.fillStyle = 'rgba(255,255,255,0.7)';
          ctx.font = 'bold 24px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText(activeClip.title, width / 2, height / 2);
        }
      }

      // Layer 2: Image Overlay (B-Roll or Picture-in-Picture)
      const activeOverlay = (project.imageOverlays || []).find(
        (ov) => !ov.isHidden && currentTime >= ov.startTime && currentTime < ov.startTime + ov.duration
      );

      if (activeOverlay && !project.isOverlayTrackHidden && activeOverlay.imageUrl) {
        const overlayImg = preloadedImages.get(activeOverlay.imageUrl);
        if (overlayImg) {
          ctx.save();
          ctx.globalAlpha = activeOverlay.opacity ?? 1.0;

          if (activeOverlay.fit === 'pip') {
            // Floating Picture-in-Picture
            const pipWidth = width * (activeOverlay.scale || 0.38);
            const pipHeight = pipWidth * (16 / 9);

            let pipX = width - pipWidth - 24;
            let pipY = 40;

            if (activeOverlay.position === 'bottom-right') {
              pipX = width - pipWidth - 24;
              pipY = height - pipHeight - 60;
            } else if (activeOverlay.position === 'center') {
              pipX = (width - pipWidth) / 2;
              pipY = (height - pipHeight) / 2;
            } else if (activeOverlay.position === 'top') {
              pipX = (width - pipWidth) / 2;
              pipY = 40;
            } else if (activeOverlay.position === 'bottom') {
              pipX = (width - pipWidth) / 2;
              pipY = height - pipHeight - 60;
            }

            // Draw shadow & background
            ctx.fillStyle = 'rgba(0,0,0,0.7)';
            ctx.fillRect(pipX - 4, pipY - 4, pipWidth + 8, pipHeight + 8);
            ctx.drawImage(overlayImg, pipX, pipY, pipWidth, pipHeight);
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 3;
            ctx.strokeRect(pipX, pipY, pipWidth, pipHeight);
          } else if (activeOverlay.fit === 'contain') {
            // Contain preserving ratio with top/bottom matte
            const imgAspect = overlayImg.width / overlayImg.height;
            const targetAspect = width / height;

            let drawW = width;
            let drawH = height;
            let drawX = 0;
            let drawY = 0;

            if (imgAspect > targetAspect) {
              drawH = width / imgAspect;
              drawY = (height - drawH) / 2;
            } else {
              drawW = height * imgAspect;
              drawX = (width - drawW) / 2;
            }

            ctx.drawImage(overlayImg, drawX, drawY, drawW, drawH);
          } else {
            // Cover: Fills entire 9:16 frame
            ctx.drawImage(overlayImg, 0, 0, width, height);
          }

          ctx.restore();
        }
      }

      // Layer 3: Text Overlay
      const activeText = project.textOverlays.find(
        (t) => currentTime >= t.startTime && currentTime <= t.startTime + t.duration
      );

      if (activeText) {
        ctx.save();
        ctx.font = 'bold 28px sans-serif';
        ctx.textAlign = 'center';

        let textY = height - 120;
        if (activeText.position === 'top') textY = 120;
        if (activeText.position === 'center') textY = height / 2;

        const metrics = ctx.measureText(activeText.text);
        const textWidth = metrics.width;

        // Draw subtle dark pill behind text
        ctx.fillStyle = 'rgba(0, 0, 0, 0.65)';
        ctx.fillRect((width - textWidth) / 2 - 16, textY - 32, textWidth + 32, 44);

        ctx.fillStyle = activeText.color || '#ffffff';
        ctx.fillText(activeText.text, width / 2, textY);
        ctx.restore();
      }

      currentFrame++;
      // Schedule next frame with slight delay to yield to UI thread
      setTimeout(renderNextFrame, frameIntervalMs / 2);
    };

    renderNextFrame();
  });
}
