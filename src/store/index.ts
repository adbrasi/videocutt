import { create } from 'zustand';
import { VideoFile, Tag, GlobalSettings, ExportProgress } from '@/types';

interface AppState {
  videos: VideoFile[];
  tags: Tag[];
  globalSettings: GlobalSettings;
  exportProgress: ExportProgress[];
  
  // Video actions
  addVideos: (videos: VideoFile[]) => void;
  removeVideo: (id: string) => void;
  updateVideo: (id: string, updates: Partial<VideoFile>) => void;
  
  // Tag actions
  addTag: (tag: Tag) => void;
  removeTag: (id: string) => void;
  updateTag: (id: string, updates: Partial<Tag>) => void;
  
  // Settings actions
  updateGlobalSettings: (settings: Partial<GlobalSettings>) => void;
  
  // Export actions
  setExportProgress: (progress: ExportProgress[]) => void;
  updateExportProgress: (videoId: string, updates: Partial<ExportProgress>) => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  videos: [],
  tags: [],
  globalSettings: {
    fps: 24,
    totalFrames: 120,
  },
  exportProgress: [],
  
  addVideos: (videos) => set((state) => ({
    videos: [...state.videos, ...videos],
  })),
  
  removeVideo: (id) => set((state) => ({
    videos: state.videos.filter((video) => video.id !== id),
  })),
  
  updateVideo: (id, updates) => set((state) => ({
    videos: state.videos.map((video) =>
      video.id === id ? { ...video, ...updates } : video
    ),
  })),
  
  addTag: (tag) => set((state) => ({
    tags: [...state.tags, tag],
  })),
  
  removeTag: (id) => set((state) => ({
    tags: state.tags.filter((tag) => tag.id !== id),
    videos: state.videos.map((video) =>
      video.tagId === id ? { ...video, tagId: undefined } : video
    ),
  })),
  
  updateTag: (id, updates) => set((state) => ({
    tags: state.tags.map((tag) =>
      tag.id === id ? { ...tag, ...updates } : tag
    ),
  })),
  
  updateGlobalSettings: (settings) => set((state) => ({
    globalSettings: { ...state.globalSettings, ...settings },
  })),
  
  setExportProgress: (progress) => set({ exportProgress: progress }),
  
  updateExportProgress: (videoId, updates) => set((state) => ({
    exportProgress: state.exportProgress.map((progress) =>
      progress.videoId === videoId ? { ...progress, ...updates } : progress
    ),
  })),
}));