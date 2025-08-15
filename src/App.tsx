import React from 'react';
import { Film } from 'lucide-react';
import { GlobalSettings } from '@/components/GlobalSettings';
import { TagManager } from '@/components/TagManager';
import { VideoGrid } from '@/components/VideoGrid';
import { ExportPanel } from '@/components/ExportPanel';

function App() {
  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center">
                <Film className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-100">Video Prepare</h1>
                <p className="text-sm text-gray-400">AI Video Processing Tool</p>
              </div>
            </div>
            
            <div className="text-sm text-gray-400">
              Streamline your video preparation workflow
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Settings and Tags */}
          <div className="space-y-6">
            <GlobalSettings />
            <TagManager />
          </div>

          {/* Video Grid */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-100">Videos</h2>
            </div>
            <VideoGrid />
          </div>

          {/* Export Panel */}
          <ExportPanel />
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 border-t border-gray-700 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center text-gray-400 text-sm">
            <p>Video Prepare - Professional video processing for AI training datasets</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;