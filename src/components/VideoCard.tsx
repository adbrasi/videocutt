import React, { useState, useRef, useEffect } from 'react';
import { Trash2, Tag as TagIcon, Upload, CheckCircle, AlertCircle } from 'lucide-react';
import * as Slider from '@radix-ui/react-slider';
import { VideoFile } from '@/types';
import { useAppStore } from '@/store';
import { formatTime, formatFileSize } from '@/utils';

interface VideoCardProps {
  video: VideoFile;
}

export const VideoCard: React.FC<VideoCardProps> = ({ video }) => {
  const { removeVideo, updateVideo, tags } = useAppStore();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoUrl, setVideoUrl] = useState<string>('');
  const [currentPreviewTime, setCurrentPreviewTime] = useState(video.startTime);

  // Create and manage video URL
  useEffect(() => {
    if (video.file) {
      const url = URL.createObjectURL(video.file);
      setVideoUrl(url);
      
      return () => {
        URL.revokeObjectURL(url);
      };
    }
  }, [video.file]);

  // Auto-start infinite live preview
  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement || !videoUrl) return;

    const startPreview = () => {
      videoElement.currentTime = video.startTime;
      videoElement.play().catch(() => {
        // Autoplay failed, retry in a moment
        setTimeout(startPreview, 1000);
      });
    };

    // Start playing when video loads
    videoElement.addEventListener('loadeddata', startPreview);
    
    // Loop between start and end time
    const handleTimeUpdate = () => {
      if (videoElement.currentTime >= video.endTime) {
        videoElement.currentTime = video.startTime;
      }
      setCurrentPreviewTime(videoElement.currentTime);
    };

    videoElement.addEventListener('timeupdate', handleTimeUpdate);

    return () => {
      videoElement.removeEventListener('loadeddata', startPreview);
      videoElement.removeEventListener('timeupdate', handleTimeUpdate);
    };
  }, [videoUrl, video.startTime, video.endTime]);

  // Update preview when start/end times change
  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement) return;

    // If current time is outside the new range, reset to start
    if (videoElement.currentTime < video.startTime || videoElement.currentTime >= video.endTime) {
      videoElement.currentTime = video.startTime;
    }
  }, [video.startTime, video.endTime]);

  const handleStartTimeChange = (values: number[]) => {
    const newStartTime = values[0];
    
    // Ensure start time doesn't exceed end time
    const maxStartTime = video.endTime - 0.5; // Minimum 0.5 second clip
    const clampedStartTime = Math.min(newStartTime, maxStartTime);
    
    updateVideo(video.id, { startTime: clampedStartTime });
    
    // Update video position immediately
    if (videoRef.current) {
      videoRef.current.currentTime = clampedStartTime;
    }
  };

  const handleEndTimeChange = (values: number[]) => {
    const newEndTime = values[0];
    
    // Ensure end time doesn't go below start time
    const minEndTime = video.startTime + 0.5; // Minimum 0.5 second clip
    const clampedEndTime = Math.max(newEndTime, minEndTime);
    
    updateVideo(video.id, { endTime: clampedEndTime });
  };

  const handleTagChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const tagId = e.target.value || undefined;
    updateVideo(video.id, { tagId });
  };

  const selectedTag = tags.find(tag => tag.id === video.tagId);
  const clipDuration = video.endTime - video.startTime;

  return (
    <div className="card p-4 animate-fade-in">
      {/* Video Preview */}
      <div className="relative aspect-video bg-gray-800 rounded-lg overflow-hidden mb-4">
        <video
          ref={videoRef}
          src={videoUrl}
          className="w-full h-full object-cover"
          muted
          loop={false} // We handle looping manually
          preload="metadata"
          onError={(e) => {
            console.warn('Video loading error:', e);
          }}
        />
        
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

        {/* Live preview time indicator */}
        <div className="absolute bottom-2 right-2 px-2 py-1 rounded text-xs font-medium bg-black/70 text-white">
          {formatTime(currentPreviewTime)}
        </div>
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

        {/* Time Range Controls */}
        <div className="space-y-3">
          {/* Start Time Slider */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-300">Start Time</span>
              <span className="text-gray-400">{formatTime(video.startTime)}</span>
            </div>
            
            <Slider.Root
              className="relative flex items-center select-none touch-none w-full h-5"
              value={[video.startTime]}
              max={video.duration - 0.5}
              min={0}
              step={0.1}
              onValueChange={handleStartTimeChange}
            >
              <Slider.Track className="bg-gray-700 relative grow rounded-full h-2">
                <Slider.Range className="absolute bg-green-500 rounded-full h-full" />
              </Slider.Track>
              <Slider.Thumb
                className="block w-4 h-4 bg-green-500 rounded-full shadow-lg hover:bg-green-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-gray-900"
                aria-label="Start time"
              />
            </Slider.Root>
          </div>

          {/* End Time Slider */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-300">End Time</span>
              <span className="text-gray-400">{formatTime(video.endTime)}</span>
            </div>
            
            <Slider.Root
              className="relative flex items-center select-none touch-none w-full h-5"
              value={[video.endTime]}
              max={video.duration}
              min={video.startTime + 0.5}
              step={0.1}
              onValueChange={handleEndTimeChange}
            >
              <Slider.Track className="bg-gray-700 relative grow rounded-full h-2">
                <Slider.Range className="absolute bg-red-500 rounded-full h-full" />
              </Slider.Track>
              <Slider.Thumb
                className="block w-4 h-4 bg-red-500 rounded-full shadow-lg hover:bg-red-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-gray-900"
                aria-label="End time"
              />
            </Slider.Root>
          </div>

          {/* Clip Duration Display */}
          <div className="text-sm bg-gray-700/50 rounded p-2">
            <div className="flex justify-between">
              <span className="text-gray-300">Clip Duration:</span>
              <span className="text-white font-medium">{formatTime(clipDuration)}</span>
            </div>
            <div className="flex justify-between mt-1">
              <span className="text-gray-300">Range:</span>
              <span className="text-gray-400">
                {formatTime(video.startTime)} → {formatTime(video.endTime)}
              </span>
            </div>
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