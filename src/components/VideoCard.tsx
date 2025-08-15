import React, { useState, useRef, useEffect } from 'react';
import { Trash2, Play, Pause, Tag as TagIcon, Upload, CheckCircle, AlertCircle } from 'lucide-react';
import * as Slider from '@radix-ui/react-slider';
import { VideoFile } from '@/types';
import { useAppStore } from '@/store';
import { formatTime, formatFileSize } from '@/utils';

interface VideoCardProps {
  video: VideoFile;
}

export const VideoCard: React.FC<VideoCardProps> = ({ video }) => {
  const { removeVideo, updateVideo, tags, globalSettings } = useAppStore();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string>('');

  useEffect(() => {
    if (video.file) {
      const url = URL.createObjectURL(video.file);
      setVideoUrl(url);
      
      return () => {
        URL.revokeObjectURL(url);
      };
    }
  }, [video.file]);

  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement) return;

    if (isHovered && !isPlaying) {
      videoElement.currentTime = video.startTime;
      videoElement.play().then(() => {
        setIsPlaying(true);
      }).catch(() => {
        // Autoplay failed
      });
    } else if (!isHovered && isPlaying) {
      videoElement.pause();
      setIsPlaying(false);
    }
  }, [isHovered, video.startTime]);

  const handleStartTimeChange = (values: number[]) => {
    const newStartTime = values[0];
    const maxStartTime = Math.max(0, video.duration - (globalSettings.totalFrames / globalSettings.fps));
    
    if (newStartTime <= maxStartTime) {
      updateVideo(video.id, { startTime: newStartTime });
      
      if (videoRef.current) {
        videoRef.current.currentTime = newStartTime;
      }
    }
  };

  const handleTagChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const tagId = e.target.value || undefined;
    updateVideo(video.id, { tagId });
  };

  const maxStartTime = Math.max(0, video.duration - (globalSettings.totalFrames / globalSettings.fps));
  const endTime = video.startTime + (globalSettings.totalFrames / globalSettings.fps);
  const selectedTag = tags.find(tag => tag.id === video.tagId);

  return (
    <div
      className="card p-4 animate-fade-in"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Video Preview */}
      <div className="relative aspect-video bg-gray-800 rounded-lg overflow-hidden mb-4">
        <video
          ref={videoRef}
          src={videoUrl}
          className="w-full h-full object-cover"
          muted
          loop
          preload="metadata"
          onError={(e) => {
            console.warn('Video loading error:', e);
          }}
        />
        
        {/* Overlay with play/pause indicator */}
        <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
          {isPlaying ? (
            <Pause className="w-12 h-12 text-white/80" />
          ) : (
            <Play className="w-12 h-12 text-white/80" />
          )}
        </div>
        
        {/* Upload status indicator */}
        <div className="absolute top-2 left-2 flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-black/50">
          {video.uploadStatus === 'uploading' && (
            <>
              <Upload className="w-3 h-3 animate-pulse text-blue-400" />
              <span className="text-blue-400">Uploading...</span>
            </>
          )}
          {video.uploadStatus === 'completed' && (
            <>
              <CheckCircle className="w-3 h-3 text-green-400" />
              <span className="text-green-400">Ready</span>
            </>
          )}
          {video.uploadStatus === 'error' && (
            <>
              <AlertCircle className="w-3 h-3 text-red-400" />
              <span className="text-red-400">Error</span>
            </>
          )}
          {video.uploadStatus === 'pending' && (
            <>
              <Upload className="w-3 h-3 text-gray-400" />
              <span className="text-gray-400">Pending</span>
            </>
          )}
        </div>

        {/* Tag indicator */}
        {selectedTag && (
          <div
            className="absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-medium"
            style={{ backgroundColor: selectedTag.color + '20', color: selectedTag.color }}
          >
            {selectedTag.name}
          </div>
        )}
      </div>

      {/* Video Info */}
      <div className="space-y-3">
        <div>
          <h3 className="font-medium text-gray-100 truncate" title={video.name}>
            {video.name}
          </h3>
          <div className="flex items-center justify-between text-sm text-gray-400 mt-1">
            <span>{video.resolution.width}×{video.resolution.height}</span>
            <span>{formatFileSize(video.file.size)}</span>
            <span>{formatTime(video.duration)}</span>
          </div>
        </div>

        {/* Start Time Slider */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-300">Start Time</span>
            <span className="text-gray-400">
              {formatTime(video.startTime)} → {formatTime(endTime)}
            </span>
          </div>
          
          <Slider.Root
            className="relative flex items-center select-none touch-none w-full h-5"
            value={[video.startTime]}
            max={maxStartTime}
            step={0.1}
            onValueChange={handleStartTimeChange}
          >
            <Slider.Track className="bg-gray-700 relative grow rounded-full h-2">
              <Slider.Range className="absolute bg-primary-500 rounded-full h-full" />
            </Slider.Track>
            <Slider.Thumb
              className="block w-4 h-4 bg-primary-500 rounded-full shadow-lg hover:bg-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-gray-900"
              aria-label="Start time"
            />
          </Slider.Root>
          
          <div className="text-xs text-gray-400">
            Output: {(globalSettings.totalFrames / globalSettings.fps).toFixed(1)}s 
            ({globalSettings.totalFrames} frames at {globalSettings.fps} FPS)
          </div>
        </div>

        {/* Tag Selection */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm text-gray-300">
            <TagIcon className="w-4 h-4" />
            Tag
          </label>
          <select
            value={video.tagId || ''}
            onChange={handleTagChange}
            className="input w-full"
          >
            <option value="">No tag</option>
            {tags.map((tag) => (
              <option key={tag.id} value={tag.id}>
                {tag.name}
              </option>
            ))}
          </select>
        </div>

        {/* Remove Button */}
        <button
          onClick={() => removeVideo(video.id)}
          className="btn-danger w-full flex items-center justify-center gap-2"
        >
          <Trash2 className="w-4 h-4" />
          Remove
        </button>
      </div>
    </div>
  );
};