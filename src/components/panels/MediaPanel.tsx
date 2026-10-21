import React, { useRef, useState } from 'react';
import { SAMPLE_MEDIA_LIBRARY, SampleMediaItem } from '../../data/sampleMedia';
import { VideoClip } from '../../types/editor';
import { Upload, X, Film, Plus, Image as ImageIcon, Video as VideoIcon, Check, Layers } from 'lucide-react';

interface MediaPanelProps {
  onClose: () => void;
  onAddClips: (clips: VideoClip[]) => void;
  currentTime: number;
}

export const MediaPanel: React.FC<MediaPanelProps> = ({
  onClose,
  onAddClips,
  currentTime,
}) => {
  const [activeTab, setActiveTab] = useState<'todos' | 'videos' | 'imagenes' | 'muestras'>('todos');
  const [isProcessing, setIsProcessing] = useState(false);
  const [imageDurationSec, setImageDurationSec] = useState<number>(4.0);

  const multiFileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  // Helper to extract exact media duration
  const processFile = (file: File): Promise<VideoClip> => {
    return new Promise((resolve) => {
      const objectUrl = URL.createObjectURL(file);
      const isVideo = file.type.startsWith('video');

      if (isVideo) {
        const tempVideo = document.createElement('video');
        tempVideo.preload = 'metadata';
        tempVideo.src = objectUrl;

        tempVideo.onloadedmetadata = () => {
          const rawDuration = tempVideo.duration;
          const actualDuration =
            isFinite(rawDuration) && rawDuration > 0
              ? Number(rawDuration.toFixed(2))
              : 5.0;

          resolve({
            id: `clip-vid-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
            title: file.name.replace(/\.[^/.]+$/, '').substring(0, 24),
            duration: actualDuration,
            startTime: 0,
            trimStart: 0,
            sourceDuration: actualDuration,
            thumbnailGradient: 'from-blue-700 via-indigo-900 to-neutral-950',
            sourceType: 'custom',
            mediaType: 'video',
            videoUrl: objectUrl,
            speed: 1.0,
            isHidden: false,
          });
        };

        tempVideo.onerror = () => {
          resolve({
            id: `clip-vid-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
            title: file.name.substring(0, 20),
            duration: 5.0,
            startTime: 0,
            trimStart: 0,
            sourceDuration: 5.0,
            thumbnailGradient: 'from-blue-700 via-indigo-900 to-neutral-950',
            sourceType: 'custom',
            mediaType: 'video',
            videoUrl: objectUrl,
            speed: 1.0,
            isHidden: false,
          });
        };
      } else {
        // Image file
        resolve({
          id: `clip-img-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          title: file.name.replace(/\.[^/.]+$/, '').substring(0, 24),
          duration: imageDurationSec,
          startTime: 0,
          trimStart: 0,
          thumbnailGradient: 'from-emerald-700 via-teal-900 to-neutral-950',
          sourceType: 'custom',
          mediaType: 'image',
          imageUrl: objectUrl,
          speed: 1.0,
          isHidden: false,
        });
      }
    });
  };

  const handleFilesUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsProcessing(true);
    try {
      const fileList = Array.from(files);
      const processedClips: VideoClip[] = [];

      for (const file of fileList) {
        const clip = await processFile(file);
        processedClips.push(clip);
      }

      onAddClips(processedClips);
    } finally {
      setIsProcessing(false);
      // Reset input value so same files can be re-selected if desired
      e.target.value = '';
    }
  };

  const handleSelectSample = (sample: SampleMediaItem) => {
    const newClip: VideoClip = {
      id: `clip-sample-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      title: sample.title,
      duration: sample.duration,
      startTime: 0,
      trimStart: 0,
      thumbnailGradient: sample.gradient,
      sourceType: 'sample',
      mediaType: 'gradient',
      previewBg: sample.previewBg,
      speed: 1.0,
      isHidden: false,
    };

    onAddClips([newClip]);
  };

  return (
    <div className="absolute inset-x-0 bottom-16 bg-[#13151b] border-t border-neutral-800 rounded-t-2xl z-30 shadow-2xl flex flex-col max-h-[380px] animate-in slide-in-from-bottom-6 duration-200">
      {/* Header */}
      <div className="px-4 py-2.5 flex items-center justify-between border-b border-neutral-800/80">
        <div>
          <h2 className="text-xs font-semibold text-white flex items-center gap-1.5">
            <Film className="w-3.5 h-3.5 text-neutral-400" />
            <span>Importar Videos e Imágenes</span>
          </h2>
          <p className="text-[10px] text-neutral-400">
            Sube múltiples archivos o elige de la colección
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

      {/* Upload Action Bar */}
      <div className="px-3 py-2 border-b border-neutral-800/60 bg-[#0f1116] flex items-center gap-1.5 overflow-x-auto no-scrollbar">
        {/* Multi-upload button */}
        <button
          onClick={() => multiFileInputRef.current?.click()}
          disabled={isProcessing}
          className="px-3 py-1.5 rounded-lg bg-white hover:bg-neutral-200 text-neutral-900 text-xs font-semibold flex items-center gap-1.5 shrink-0 active:scale-95 transition-all shadow-sm disabled:opacity-50"
        >
          <Upload className="w-3.5 h-3.5 text-neutral-900 stroke-[2.5]" />
          <span>{isProcessing ? 'Procesando...' : '+ Subir Medios'}</span>
        </button>

        {/* Video only */}
        <button
          onClick={() => videoInputRef.current?.click()}
          disabled={isProcessing}
          className="px-2.5 py-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-neutral-300 text-xs font-medium border border-neutral-800 flex items-center gap-1 shrink-0 active:scale-95 transition-all"
        >
          <VideoIcon className="w-3.5 h-3.5 text-blue-400" />
          <span>Videos</span>
        </button>

        {/* Photos only */}
        <button
          onClick={() => imageInputRef.current?.click()}
          disabled={isProcessing}
          className="px-2.5 py-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-neutral-300 text-xs font-medium border border-neutral-800 flex items-center gap-1 shrink-0 active:scale-95 transition-all"
        >
          <ImageIcon className="w-3.5 h-3.5 text-emerald-400" />
          <span>Fotos / Imágenes</span>
        </button>

        {/* Hidden File Inputs */}
        <input
          ref={multiFileInputRef}
          type="file"
          multiple
          accept="video/*,image/*"
          className="hidden"
          onChange={handleFilesUpload}
        />
        <input
          ref={videoInputRef}
          type="file"
          multiple
          accept="video/*"
          className="hidden"
          onChange={handleFilesUpload}
        />
        <input
          ref={imageInputRef}
          type="file"
          multiple
          accept="image/*"
          className="hidden"
          onChange={handleFilesUpload}
        />
      </div>

      {/* Tabs */}
      <div className="px-4 pt-2 pb-1 flex items-center gap-2 text-xs border-b border-neutral-800/40 shrink-0">
        <span className="text-[10px] text-neutral-500 uppercase tracking-wider font-semibold mr-1">
          Biblioteca:
        </span>
        <button
          onClick={() => setActiveTab('todos')}
          className={`px-2 py-1 rounded-md text-[11px] font-medium transition-colors ${
            activeTab === 'todos'
              ? 'bg-neutral-800 text-white'
              : 'text-neutral-400 hover:text-white'
          }`}
        >
          Plantillas y Muestras
        </button>
      </div>

      {/* Sample Media Grid */}
      <div className="flex-1 overflow-y-auto p-3 grid grid-cols-2 gap-2.5 custom-scrollbar">
        {SAMPLE_MEDIA_LIBRARY.map((item) => (
          <div
            key={item.id}
            onClick={() => handleSelectSample(item)}
            className="group relative rounded-xl overflow-hidden border border-neutral-800 hover:border-neutral-600 bg-neutral-900/80 cursor-pointer transition-all active:scale-[0.98] flex flex-col"
          >
            {/* Visual Thumbnail */}
            <div
              className="h-20 w-full relative flex items-end p-2 transition-transform duration-300 group-hover:scale-105"
              style={{ background: item.previewBg }}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <div className="relative z-10 flex items-center justify-between w-full">
                <span className="text-[10px] font-mono text-white/90 bg-black/60 px-1.5 py-0.5 rounded backdrop-blur-xs">
                  {item.duration}s
                </span>
                <div className="w-5 h-5 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity">
                  <Plus className="w-3 h-3" />
                </div>
              </div>
            </div>

            {/* Title & Info */}
            <div className="p-2 bg-[#101217]">
              <h4 className="text-[11px] font-medium text-white truncate">{item.title}</h4>
              <p className="text-[9px] text-neutral-400 truncate mt-0.5">{item.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
