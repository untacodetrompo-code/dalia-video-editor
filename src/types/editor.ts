export type AspectRatio = '9:16' | '16:9' | '1:1';
export type ToolType = 'medios' | 'recortar' | 'superponer' | 'audio' | 'texto' | 'filtros' | null;

export type FilterType = 
  | 'normal' 
  | 'noir' 
  | 'warm' 
  | 'cool' 
  | 'vintage' 
  | 'cinematic' 
  | 'high_contrast';

export type OverlayFit = 'cover' | 'contain' | 'pip';
export type OverlayPosition = 'center' | 'top' | 'bottom' | 'top-right' | 'bottom-right';

export interface VideoClip {
  id: string;
  title: string;
  duration: number; // in seconds
  startTime: number; // position on timeline in seconds
  trimStart?: number; // internal offset in seconds (Punto de entrada)
  sourceDuration?: number; // total duration of the original file
  thumbnailGradient: string;
  sourceType: 'sample' | 'custom';
  mediaType: 'video' | 'image' | 'gradient';
  videoUrl?: string; // sample video or user uploaded
  imageUrl?: string;
  previewBg?: string;
  speed: number;
  isHidden?: boolean; // toggle to hide video or image
  hasExtractedAudio?: boolean; // whether audio was split into audio track
}

export interface ImageOverlay {
  id: string;
  title: string;
  imageUrl: string;
  startTime: number; // in timeline seconds
  duration: number; // duration on timeline in seconds
  fit: OverlayFit; // 'cover' (llena frame 9:16) | 'contain' (sin deformar) | 'pip' (flotante)
  position: OverlayPosition; // 'center' | 'top' | 'bottom' | 'top-right' | 'bottom-right'
  scale: number; // 0.2 to 1.0
  opacity: number; // 0.1 to 1.0
  borderRadius?: number; // px
  isHidden?: boolean;
}

export interface AudioClip {
  id: string;
  title: string;
  duration: number;
  startTime: number;
  category: 'música' | 'efectos' | 'voz';
  volume: number; // 0 to 1
  waveform: number[]; // relative heights 0-1 for waveform rendering
}

export interface TextOverlay {
  id: string;
  text: string;
  startTime: number;
  duration: number;
  style: 'clean' | 'bold' | 'serif' | 'subtitle';
  position: 'top' | 'center' | 'bottom';
  color: string;
  backgroundColor?: string;
  fontSize: number; // px
}

export interface Project {
  id: string;
  title: string;
  aspectRatio: AspectRatio;
  resolution: '720p' | '1080p' | '4K';
  fps: 30 | 60;
  updatedAt: string;
  videoClips: VideoClip[];
  imageOverlays: ImageOverlay[]; // Pista de superposición visual sobre video
  audioClips: AudioClip[];
  textOverlays: TextOverlay[];
  activeFilter: FilterType;
  filterIntensity: number; // 0 to 100
  gridOverlay: boolean;
  isVideoTrackHidden?: boolean;
  isOverlayTrackHidden?: boolean;
}
