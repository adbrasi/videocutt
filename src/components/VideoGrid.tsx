import React from 'react';
import { VideoCard } from './VideoCard';
import { DropZone } from './DropZone';
import { useAppStore } from '@/store';

export const VideoGrid: React.FC = () => {
  const { videos } = useAppStore();

  if (videos.length === 0) {
    return (
      <div className="space-y-6">
        <DropZone />
        <div className="text-center text-gray-400">
          <p className="text-lg">No videos loaded yet</p>
          <p className="text-sm">Drop your video files above to get started</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <DropZone />
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
        {videos.map((video) => (
          <VideoCard key={video.id} video={video} />
        ))}
      </div>
      
      <div className="text-center text-gray-400 text-sm">
        {videos.length} video{videos.length !== 1 ? 's' : ''} loaded
      </div>
    </div>
  );
};