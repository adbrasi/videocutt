import React from 'react';
import { Settings, Video, Clock } from 'lucide-react';
import { useAppStore } from '@/store';

export const GlobalSettings: React.FC = () => {
  const { globalSettings, updateGlobalSettings } = useAppStore();

  const handleFpsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fps = parseInt(e.target.value);
    if (fps > 0 && fps <= 120) {
      updateGlobalSettings({ fps });
    }
  };

  const handleTotalFramesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const totalFrames = parseInt(e.target.value);
    if (totalFrames > 0 && totalFrames <= 10000) {
      updateGlobalSettings({ totalFrames });
    }
  };

  const duration = globalSettings.totalFrames / globalSettings.fps;

  return (
    <div className="card p-6 mb-6">
      <div className="flex items-center gap-3 mb-4">
        <Settings className="w-6 h-6 text-primary-400" />
        <h2 className="text-xl font-bold text-gray-100">Global Settings</h2>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium text-gray-300">
            <Video className="w-4 h-4" />
            Target FPS
          </label>
          <input
            type="number"
            min="1"
            max="120"
            value={globalSettings.fps}
            onChange={handleFpsChange}
            className="input w-full"
            placeholder="24"
          />
          <p className="text-xs text-gray-400">Output frame rate for exported videos</p>
        </div>
        
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium text-gray-300">
            <Clock className="w-4 h-4" />
            Target Frames (Default)
          </label>
          <input
            type="number"
            min="1"
            max="10000"
            value={globalSettings.totalFrames}
            onChange={handleTotalFramesChange}
            className="input w-full"
            placeholder="120"
          />
          <p className="text-xs text-gray-400">Default frame count (each video can have custom duration)</p>
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-300">Duration</label>
          <div className="input bg-gray-700 text-gray-300">
            {duration.toFixed(2)}s
          </div>
          <p className="text-xs text-gray-400">Calculated output duration</p>
        </div>
      </div>
    </div>
  );
};