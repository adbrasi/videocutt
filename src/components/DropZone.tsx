import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, Film } from 'lucide-react';
import { useAppStore } from '@/store';
import { VideoFile } from '@/types';
import { generateId, getVideoMetadata, createVideoThumbnail } from '@/utils';
import { uploadVideoToServer } from '@/utils/upload';

export const DropZone: React.FC = () => {
  const { addVideos, updateVideo } = useAppStore();

  const processVideoFiles = async (files: File[]): Promise<VideoFile[]> => {
    const videoFiles: VideoFile[] = [];
    
    for (const file of files) {
      try {
        // First create video with local metadata
        const metadata = await getVideoMetadata(file);
        const thumbnailUrl = await createVideoThumbnail(file, 0);
        
        const videoFile: VideoFile = {
          id: generateId(),
          file,
          name: file.name,
          duration: metadata.duration,
          fps: metadata.fps,
          resolution: metadata.resolution,
          startTime: 0,
          thumbnailUrl,
          uploadStatus: 'pending',
        };
        
        videoFiles.push(videoFile);
        
        // Add to store immediately so user sees it
        addVideos([videoFile]);
        
        // Start upload in background
        uploadVideoInBackground(videoFile);
        
      } catch (error) {
        console.error(`Error processing ${file.name}:`, error);
      }
    }
    
    return videoFiles;
  };

  const uploadVideoInBackground = async (videoFile: VideoFile) => {
    try {
      updateVideo(videoFile.id, { uploadStatus: 'uploading' });
      
      const uploadResult = await uploadVideoToServer(videoFile.file);
      
      updateVideo(videoFile.id, {
        uploadStatus: 'completed',
        serverPath: uploadResult.serverPath,
        // Update with server metadata if different
        duration: uploadResult.duration,
        fps: uploadResult.fps,
        resolution: uploadResult.resolution,
      });
      
    } catch (error) {
      console.error(`Upload failed for ${videoFile.name}:`, error);
      updateVideo(videoFile.id, { 
        uploadStatus: 'error',
      });
    }
  };

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const videoFiles = acceptedFiles.filter(file => file.type.startsWith('video/'));
    
    if (videoFiles.length === 0) {
      alert('Please drop video files only.');
      return;
    }
    
    try {
      await processVideoFiles(videoFiles);
    } catch (error) {
      console.error('Error processing videos:', error);
      alert('Error processing some video files. Please try again.');
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive, isDragAccept, isDragReject } = useDropzone({
    onDrop,
    accept: {
      'video/*': ['.mp4', '.avi', '.mov', '.mkv', '.webm', '.flv', '.wmv']
    },
    multiple: true
  });

  const getBorderColor = () => {
    if (isDragReject) return 'border-red-500';
    if (isDragAccept) return 'border-primary-500';
    if (isDragActive) return 'border-primary-400';
    return 'border-gray-600';
  };

  const getBackgroundColor = () => {
    if (isDragActive) return 'bg-primary-500/10';
    return 'bg-gray-800/50';
  };

  return (
    <div
      {...getRootProps()}
      className={`
        relative border-2 border-dashed rounded-xl p-12 text-center cursor-pointer
        transition-all duration-200 hover:border-primary-500 hover:bg-primary-500/5
        ${getBorderColor()} ${getBackgroundColor()}
      `}
    >
      <input {...getInputProps()} />
      
      <div className="flex flex-col items-center space-y-4">
        <div className="relative">
          <div className="w-20 h-20 bg-gray-700 rounded-full flex items-center justify-center">
            {isDragActive ? (
              <Film className="w-10 h-10 text-primary-400 animate-pulse" />
            ) : (
              <Upload className="w-10 h-10 text-gray-400" />
            )}
          </div>
          
          {isDragActive && (
            <div className="absolute inset-0 bg-primary-500/20 rounded-full animate-ping" />
          )}
        </div>
        
        <div className="space-y-2">
          {isDragActive ? (
            <p className="text-lg font-medium text-primary-400">
              Drop your videos here!
            </p>
          ) : (
            <>
              <p className="text-lg font-medium text-gray-200">
                Drop videos here or click to browse
              </p>
              <p className="text-gray-400">
                Supports MP4, AVI, MOV, MKV, WebM, FLV, WMV
              </p>
            </>
          )}
          
          {isDragReject && (
            <p className="text-red-400">
              Only video files are supported
            </p>
          )}
        </div>
        
        <div className="text-sm text-gray-500">
          Maximum file size: 500MB per video
        </div>
      </div>
    </div>
  );
};