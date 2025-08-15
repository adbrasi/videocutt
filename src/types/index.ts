export interface VideoFile {
  id: string;
  file: File;
  name: string;
  duration: number;
  fps: number;
  resolution: {
    width: number;
    height: number;
  };
  startTime: number;
  endTime: number; // End time for the cut
  tagId?: string;
  thumbnailUrl?: string;
  previewUrl?: string;
  serverPath?: string; // Path on server after upload
  uploadStatus?: 'pending' | 'uploading' | 'completed' | 'error';
}

export interface Tag {
  id: string;
  name: string;
  color: string;
}

export interface GlobalSettings {
  fps: number;
  totalFrames: number;
}

export interface ExportProgress {
  videoId: string;
  progress: number;
  status: 'pending' | 'processing' | 'completed' | 'error';
  error?: string;
}

export interface VideoMetadata {
  duration: number;
  fps: number;
  resolution: {
    width: number;
    height: number;
  };
}