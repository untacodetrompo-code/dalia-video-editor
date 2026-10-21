import { FilterType, VideoClip, AudioClip, Project } from '../types/editor';

export interface SampleMediaItem {
  id: string;
  title: string;
  category: 'Urbano' | 'Naturaleza' | 'Minimalista' | 'Gourmet' | 'Moda';
  duration: number;
  gradient: string;
  aspect: string;
  tags: string[];
  description: string;
  videoUrl?: string;
  previewBg: string;
}

export const SAMPLE_MEDIA_LIBRARY: SampleMediaItem[] = [
  {
    id: 'sample-1',
    title: 'Atardecer en la Bahía',
    category: 'Naturaleza',
    duration: 4.5,
    gradient: 'from-amber-600 via-rose-700 to-indigo-950',
    aspect: '9:16',
    tags: ['Atardecer', 'Olas', 'Cálido'],
    description: 'Toma vertical con reflejos dorados sobre el agua y bruma suave.',
    previewBg: 'radial-gradient(ellipse at bottom, #b45309 0%, #881337 45%, #0f172a 100%)'
  },
  {
    id: 'sample-2',
    title: 'Arquitectura y Sombra',
    category: 'Minimalista',
    duration: 3.8,
    gradient: 'from-slate-700 via-zinc-800 to-neutral-950',
    aspect: '9:16',
    tags: ['Estructura', 'Luz dura', 'Geometría'],
    description: 'Plano cenital de líneas de hormigón con sombras en movimiento.',
    previewBg: 'linear-gradient(135deg, #334155 0%, #1e293b 50%, #090d16 100%)'
  },
  {
    id: 'sample-3',
    title: 'Café de Especialidad',
    category: 'Gourmet',
    duration: 4.2,
    gradient: 'from-stone-600 via-amber-900 to-stone-950',
    aspect: '9:16',
    tags: ['Detalle', 'Vapor', 'Artesanal'],
    description: 'Extracción lenta de café en taza cerámica con vapor ascendente.',
    previewBg: 'radial-gradient(circle at center, #78350f 10%, #451a03 50%, #0c0a09 100%)'
  },
  {
    id: 'sample-4',
    title: 'Paseo Nocturno Neón',
    category: 'Urbano',
    duration: 5.0,
    gradient: 'from-fuchsia-900 via-purple-950 to-slate-950',
    aspect: '9:16',
    tags: ['Ciudad', 'Luces', 'Bokeh'],
    description: 'Desenfoque cinematográfico de luces de tráfico en asfalto mojado.',
    previewBg: 'radial-gradient(ellipse at top right, #701a75 0%, #3b0764 40%, #020617 100%)'
  },
  {
    id: 'sample-5',
    title: 'Silueta y Viento',
    category: 'Moda',
    duration: 3.5,
    gradient: 'from-teal-800 via-cyan-950 to-neutral-950',
    aspect: '9:16',
    tags: ['Movimiento', 'Textura', 'Editorial'],
    description: 'Retrato de perfil con tela suave ondeando al viento.',
    previewBg: 'linear-gradient(180deg, #115e59 0%, #134e4a 35%, #042f2e 70%, #020617 100%)'
  },
  {
    id: 'sample-6',
    title: 'Paso de Peatones Tokio',
    category: 'Urbano',
    duration: 4.0,
    gradient: 'from-indigo-700 via-slate-800 to-zinc-950',
    aspect: '9:16',
    tags: ['Cruce', 'Ritmo', 'Urbano'],
    description: 'Cámara lenta de peatones cruzando bajo sombrillas transparentes.',
    previewBg: 'linear-gradient(160deg, #3730a3 0%, #1e1b4b 40%, #09090b 100%)'
  }
];

export const SAMPLE_AUDIO_LIBRARY = [
  {
    id: 'audio-1',
    title: 'Aura Minimalista',
    category: 'música' as const,
    duration: 12.5,
    tags: ['Lofi', 'Relajante', 'Vlog'],
    waveform: [0.2, 0.4, 0.7, 0.9, 0.6, 0.8, 0.5, 0.3, 0.6, 0.8, 0.9, 0.7, 0.4, 0.6, 0.8, 0.7, 0.5, 0.3, 0.6, 0.8, 0.9, 0.7, 0.5, 0.4, 0.2, 0.3, 0.5, 0.8, 0.7, 0.4]
  },
  {
    id: 'audio-2',
    title: 'Pulsos Urbanos',
    category: 'música' as const,
    duration: 15.0,
    tags: ['Beat', 'Moderno', 'Dinámico'],
    waveform: [0.3, 0.8, 0.4, 0.9, 0.3, 0.7, 0.8, 0.9, 0.4, 0.7, 0.3, 0.9, 0.8, 0.4, 0.8, 0.9, 0.4, 0.7, 0.3, 0.9, 0.8, 0.6, 0.3, 0.8, 0.4, 0.7, 0.8, 0.5, 0.3, 0.2]
  },
  {
    id: 'audio-3',
    title: 'Transición Whoosh Suave',
    category: 'efectos' as const,
    duration: 1.2,
    tags: ['SFX', 'Corte', 'Cinemático'],
    waveform: [0.1, 0.2, 0.4, 0.8, 0.95, 0.9, 0.6, 0.3, 0.15, 0.05]
  },
  {
    id: 'audio-4',
    title: 'Obturador de Cámara',
    category: 'efectos' as const,
    duration: 0.8,
    tags: ['SFX', 'Click', 'Mecánico'],
    waveform: [0.1, 0.9, 0.4, 0.95, 0.2, 0.05]
  }
];

export interface FilterOption {
  id: FilterType;
  name: string;
  description: string;
  cssFilter: (intensity: number) => string;
  previewThumbnailClass: string;
}

export const FILTERS_LIST: FilterOption[] = [
  {
    id: 'normal',
    name: 'Original',
    description: 'Sin modificaciones cromáticas.',
    cssFilter: () => 'none',
    previewThumbnailClass: 'bg-gradient-to-tr from-slate-600 to-slate-400'
  },
  {
    id: 'noir',
    name: 'Noir 35mm',
    description: 'Blanco y negro contrastado con gradación tonal densa.',
    cssFilter: (i) => `grayscale(${i}%) contrast(${100 + i * 0.35}%) brightness(${100 - i * 0.05}%)`,
    previewThumbnailClass: 'bg-gradient-to-tr from-black via-zinc-600 to-white'
  },
  {
    id: 'warm',
    name: 'Calidez Ámbar',
    description: 'Resalta luces doradas y suaviza los tonos de piel.',
    cssFilter: (i) => `sepia(${i * 0.4}%) saturate(${100 + i * 0.2}%) hue-rotate(-${i * 0.1}deg) brightness(${100 + i * 0.05}%)`,
    previewThumbnailClass: 'bg-gradient-to-tr from-amber-700 via-orange-500 to-yellow-200'
  },
  {
    id: 'cinematic',
    name: 'Cinemático Teal',
    description: 'Look contemporáneo con sombras azuladas y luces cálidas.',
    cssFilter: (i) => `contrast(${100 + i * 0.2}%) saturate(${100 + i * 0.15}%) hue-rotate(${i * 0.1}deg)`,
    previewThumbnailClass: 'bg-gradient-to-tr from-cyan-900 via-teal-600 to-amber-300'
  },
  {
    id: 'vintage',
    name: 'Kodak Portra',
    description: 'Textura nostálgica con sombras desvanecidas y grano suave.',
    cssFilter: (i) => `sepia(${i * 0.25}%) contrast(${100 - i * 0.1}%) brightness(${100 + i * 0.1}%) saturate(${100 - i * 0.15}%)`,
    previewThumbnailClass: 'bg-gradient-to-tr from-rose-900 via-amber-800 to-orange-200'
  },
  {
    id: 'cool',
    name: 'Frío Nórdico',
    description: 'Tonalidad fría y limpia inspirada en el cine escandinavo.',
    cssFilter: (i) => `hue-rotate(${i * 0.3}deg) saturate(${100 - i * 0.2}%) brightness(${100 + i * 0.05}%)`,
    previewThumbnailClass: 'bg-gradient-to-tr from-slate-900 via-sky-800 to-blue-200'
  },
  {
    id: 'high_contrast',
    name: 'Alto Impacto',
    description: 'Contraste dramático para videos de acción o ritmo acelerado.',
    cssFilter: (i) => `contrast(${100 + i * 0.6}%) saturate(${100 + i * 0.3}%)`,
    previewThumbnailClass: 'bg-gradient-to-tr from-black via-red-950 to-neutral-200'
  }
];

export interface SampleOverlayItem {
  id: string;
  title: string;
  category: string;
  imageUrl: string;
  defaultFit: 'cover' | 'contain' | 'pip';
  defaultScale: number;
}

export const SAMPLE_IMAGE_OVERLAYS: SampleOverlayItem[] = [
  {
    id: 'ov-sample-1',
    title: 'B-Roll: Café Filtrado',
    category: 'Detalle',
    imageUrl: 'https://images.unsplash.com/photo-1509785307050-d4066910ec1e?w=800&auto=format&fit=crop&q=80',
    defaultFit: 'cover',
    defaultScale: 1.0,
  },
  {
    id: 'ov-sample-2',
    title: 'B-Roll: Arquitectura',
    category: 'Minimal',
    imageUrl: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=800&auto=format&fit=crop&q=80',
    defaultFit: 'contain',
    defaultScale: 1.0,
  },
  {
    id: 'ov-sample-3',
    title: 'Recuadro PiP: Creador',
    category: 'Flotante PiP',
    imageUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&auto=format&fit=crop&q=80',
    defaultFit: 'pip',
    defaultScale: 0.38,
  },
];

export const INITIAL_PROJECT: Project = {
  id: 'proj-default-1',
  title: 'Mi Primer Reel · Dalia',
  aspectRatio: '9:16',
  resolution: '1080p',
  fps: 30,
  updatedAt: 'Hoy, 14:00',
  activeFilter: 'cinematic',
  filterIntensity: 80,
  gridOverlay: false,
  imageOverlays: [
    {
      id: 'ov-1',
      title: 'B-Roll: Café Filtrado',
      imageUrl: 'https://images.unsplash.com/photo-1509785307050-d4066910ec1e?w=800&auto=format&fit=crop&q=80',
      startTime: 3.5,
      duration: 3.0,
      fit: 'cover',
      position: 'center',
      scale: 1.0,
      opacity: 1.0,
      isHidden: false,
    }
  ],
  videoClips: [
    {
      id: 'clip-1',
      title: 'Atardecer en la Bahía',
      duration: 4.5,
      startTime: 0,
      trimStart: 0,
      thumbnailGradient: 'from-amber-600 via-rose-700 to-indigo-950',
      sourceType: 'sample',
      mediaType: 'gradient',
      previewBg: 'radial-gradient(ellipse at bottom, #b45309 0%, #881337 45%, #0f172a 100%)',
      speed: 1.0
    },
    {
      id: 'clip-2',
      title: 'Arquitectura y Sombra',
      duration: 3.5,
      startTime: 4.5,
      trimStart: 0,
      thumbnailGradient: 'from-slate-700 via-zinc-800 to-neutral-950',
      sourceType: 'sample',
      mediaType: 'gradient',
      previewBg: 'linear-gradient(135deg, #334155 0%, #1e293b 50%, #090d16 100%)',
      speed: 1.0
    },
    {
      id: 'clip-3',
      title: 'Café de Especialidad',
      duration: 4.0,
      startTime: 8.0,
      trimStart: 0,
      thumbnailGradient: 'from-stone-600 via-amber-900 to-stone-950',
      sourceType: 'sample',
      mediaType: 'gradient',
      previewBg: 'radial-gradient(circle at center, #78350f 10%, #451a03 50%, #0c0a09 100%)',
      speed: 1.0
    }
  ],
  audioClips: [
    {
      id: 'audio-c-1',
      title: 'Aura Minimalista (Lofi)',
      duration: 12.0,
      startTime: 0,
      category: 'música',
      volume: 0.85,
      waveform: [0.2, 0.4, 0.7, 0.9, 0.6, 0.8, 0.5, 0.3, 0.6, 0.8, 0.9, 0.7, 0.4, 0.6, 0.8, 0.7, 0.5, 0.3, 0.6, 0.8, 0.9, 0.7, 0.5, 0.4, 0.2, 0.3, 0.5, 0.8, 0.7, 0.4]
    }
  ],
  textOverlays: [
    {
      id: 'txt-1',
      text: 'DALIA · CREATIVIDAD MÓVIL',
      startTime: 0.5,
      duration: 3.5,
      style: 'subtitle',
      position: 'bottom',
      color: '#ffffff',
      fontSize: 14
    }
  ]
};

export const INITIAL_SAVED_PROJECTS: Project[] = [
  INITIAL_PROJECT,
  {
    id: 'proj-urban-2',
    title: 'Paseo Nocturno en Tokio',
    aspectRatio: '9:16',
    resolution: '1080p',
    fps: 60,
    updatedAt: 'Ayer, 18:30',
    activeFilter: 'noir',
    filterIntensity: 90,
    gridOverlay: false,
    imageOverlays: [],
    videoClips: [
      {
        id: 'clip-tokyo-1',
        title: 'Paseo Nocturno Neón',
        duration: 5.0,
        startTime: 0,
        trimStart: 0,
        thumbnailGradient: 'from-fuchsia-900 via-purple-950 to-slate-950',
        sourceType: 'sample',
        mediaType: 'gradient',
        previewBg: 'radial-gradient(ellipse at top right, #701a75 0%, #3b0764 40%, #020617 100%)',
        speed: 1.0
      },
      {
        id: 'clip-tokyo-2',
        title: 'Paso de Peatones Tokio',
        duration: 4.0,
        startTime: 5.0,
        trimStart: 0,
        thumbnailGradient: 'from-indigo-700 via-slate-800 to-zinc-950',
        sourceType: 'sample',
        mediaType: 'gradient',
        previewBg: 'linear-gradient(160deg, #3730a3 0%, #1e1b4b 40%, #09090b 100%)',
        speed: 1.0
      }
    ],
    audioClips: [
      {
        id: 'audio-c-2',
        title: 'Pulsos Urbanos',
        duration: 9.0,
        startTime: 0,
        category: 'música',
        volume: 0.9,
        waveform: [0.3, 0.8, 0.4, 0.9, 0.3, 0.7, 0.8, 0.9, 0.4, 0.7, 0.3, 0.9, 0.8, 0.4, 0.8, 0.9, 0.4, 0.7, 0.3, 0.9, 0.8, 0.6, 0.3, 0.8, 0.4, 0.7, 0.8, 0.5, 0.3, 0.2]
      }
    ],
    textOverlays: [
      {
        id: 'txt-tokyo-1',
        text: 'NOCHE EN SHIBUYA',
        startTime: 0,
        duration: 4.0,
        style: 'bold',
        position: 'center',
        color: '#ffffff',
        fontSize: 20
      }
    ]
  }
];
