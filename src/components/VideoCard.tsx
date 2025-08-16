import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Trash2, Tag as TagIcon, Upload, CheckCircle, AlertCircle, Play, Pause } from 'lucide-react';
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
  const [currentTime, setCurrentTime] = useState(0);
  const [videoSrc, setVideoSrc] = useState<string>('');
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const [aspectRatio, setAspectRatio] = useState<number>(16/9);

  // Create video URL from file - stable approach
  useEffect(() => {
    if (video.file) {
      const url = URL.createObjectURL(video.file);
      setVideoSrc(url);
      setIsVideoLoaded(false);
      
      // Don't cleanup until component unmounts
      return () => {
        URL.revokeObjectURL(url);
      };
    }
  }, [video.file.name]); // Only recreate if file name changes

  // Handle video loading and auto-start
  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement || !videoSrc) return;

    const handleLoadedData = () => {
      setIsVideoLoaded(true);
      setCurrentTime(video.startTime);
      
      // Calculate actual aspect ratio
      const ratio = videoElement.videoWidth / videoElement.videoHeight;
      setAspectRatio(ratio);
      
      // Auto-start the video
      videoElement.currentTime = video.startTime;
      videoElement.play().catch(() => {
        // Autoplay might be blocked, that's okay
      });
    };

    const handleError = () => {
      setIsVideoLoaded(false);
    };

    videoElement.addEventListener('loadeddata', handleLoadedData);
    videoElement.addEventListener('error', handleError);

    return () => {
      videoElement.removeEventListener('loadeddata', handleLoadedData);
      videoElement.removeEventListener('error', handleError);
    };
  }, [videoSrc, video.startTime]);

  // Handle automatic video looping with interval-based approach
  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement || !isVideoLoaded) return;

    const handleTimeUpdate = () => {
      const time = videoElement.currentTime;
      setCurrentTime(time);
    };

    // Robust interval-based looping
    const loopInterval = setInterval(() => {
      if (!videoElement) return;
      
      const time = videoElement.currentTime;
      
      // Ensure video is playing
      if (videoElement.paused) {
        videoElement.play().catch(() => {});
      }
      
      // Loop back to start when reaching end time
      if (time >= video.endTime || time < video.startTime) {
        videoElement.currentTime = video.startTime;
        videoElement.play().catch(() => {});
      }
    }, 100); // Check every 100ms

    videoElement.addEventListener('timeupdate', handleTimeUpdate);

    return () => {
      videoElement.removeEventListener('timeupdate', handleTimeUpdate);
      clearInterval(loopInterval);
    };
  }, [video.startTime, video.endTime, isVideoLoaded]);

  // Restart video when time range changes
  useEffect(() => {
    const videoElement = videoRef.current;
    if (videoElement && isVideoLoaded) {
      videoElement.currentTime = video.startTime;
      videoElement.play().catch(() => {
        // Autoplay might be blocked
      });
    }
  }, [video.startTime, video.endTime, isVideoLoaded]);

  const handleStartTimeChange = useCallback((values: number[]) => {
    const newStartTime = values[0];
    
    // Only allow if it doesn't cross the end time boundary
    if (newStartTime < video.endTime - 0.1) {
      const clampedStartTime = Math.max(0, newStartTime);
      updateVideo(video.id, { startTime: clampedStartTime });
      
      // Update video position
      const videoElement = videoRef.current;
      if (videoElement) {
        videoElement.currentTime = clampedStartTime;
        setCurrentTime(clampedStartTime);
      }
    }
    // If it would cross the boundary, just ignore the change
  }, [video.id, video.endTime, updateVideo]);

  const handleEndTimeChange = useCallback((values: number[]) => {
    const newEndTime = values[0];
    
    // Only allow if it doesn't cross the start time boundary  
    if (newEndTime > video.startTime + 0.1) {
      const clampedEndTime = Math.min(video.duration, newEndTime);
      updateVideo(video.id, { endTime: clampedEndTime });
    }
    // If it would cross the boundary, just ignore the change
  }, [video.id, video.startTime, video.duration, updateVideo]);

  const handleTagChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    const tagId = e.target.value || undefined;
    updateVideo(video.id, { tagId });
  }, [video.id, updateVideo]);

  const selectedTag = tags.find(tag => tag.id === video.tagId);
  const clipDuration = video.endTime - video.startTime;

  return (
    <div className="card p-4 animate-fade-in">
      {/* Video Preview */}
      <div 
        className="relative bg-gray-800 rounded-lg overflow-hidden mb-4 w-full"
        style={{ 
          aspectRatio: aspectRatio.toString(),
          maxHeight: '300px' // Limit height for very tall videos
        }}
      >
        <video
          ref={videoRef}
          src={videoSrc}
          className="w-full h-full object-contain"
          muted
          preload="metadata"
          playsInline
          loop={false}
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

        {/* Current time indicator */}
        <div className="absolute bottom-2 right-2 px-2 py-1 rounded text-xs font-medium bg-black/70 text-white">
          {formatTime(currentTime)}
        </div>

        {/* Loading indicator */}
        {!isVideoLoaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <div className="text-white text-sm">Loading video...</div>
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
              max={video.duration}
              min={0}
              step={0.01}
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
              min={0}
              step={0.01}
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