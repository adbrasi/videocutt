import React, { useState } from 'react';
import { Download, FolderOpen, CheckCircle, AlertCircle, Loader } from 'lucide-react';
import { useAppStore } from '@/store';

export const ExportPanel: React.FC = () => {
  const { videos, tags, globalSettings, exportProgress, setExportProgress } = useAppStore();
  const [outputPath, setOutputPath] = useState('');
  const [isExporting, setIsExporting] = useState(false);
  
  const handleSelectOutputPath = async () => {
    try {
      // In a real electron app, you would use dialog.showOpenDialog
      // For web version, we'll use a simple input
      const path = prompt('Enter output directory path:');
      if (path) {
        setOutputPath(path);
      }
    } catch (error) {
      console.error('Error selecting output path:', error);
    }
  };

  const handleExport = async () => {
    if (!outputPath.trim()) {
      alert('Please select an output directory first.');
      return;
    }

    if (videos.length === 0) {
      alert('No videos to export.');
      return;
    }

    // Check if all videos are uploaded
    const notUploaded = videos.filter(video => video.uploadStatus !== 'completed');
    if (notUploaded.length > 0) {
      alert(`Please wait for all videos to finish uploading. ${notUploaded.length} videos are still uploading or failed to upload.`);
      return;
    }

    setIsExporting(true);
    
    try {
      // Prepare export data
      const exportData = {
        videos: videos.map(video => ({
          id: video.id,
          name: video.name,
          path: video.serverPath, // Use server path instead of file name
          startTime: video.startTime,
          tagName: video.tagId ? tags.find(tag => tag.id === video.tagId)?.name : undefined,
        })),
        globalSettings,
        outputPath: outputPath.trim(),
      };

      // Initialize progress
      const initialProgress = videos.map(video => ({
        videoId: video.id,
        progress: 0,
        status: 'pending' as const,
      }));
      setExportProgress(initialProgress);

      // Make API call to export
      const response = await fetch('/api/export', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(exportData),
      });

      if (!response.ok) {
        throw new Error(`Export failed: ${response.statusText}`);
      }

      const result = await response.json();
      
      // Update progress with results
      const finalProgress = result.results.map((result: any) => ({
        videoId: result.id,
        progress: 100,
        status: result.status,
        error: result.error,
      }));
      setExportProgress(finalProgress);

      const successCount = result.results.filter((r: any) => r.status === 'completed').length;
      const errorCount = result.results.filter((r: any) => r.status === 'error').length;

      if (errorCount === 0) {
        alert(`✅ Export completed successfully! ${successCount} videos processed.`);
      } else {
        alert(`⚠️ Export completed with ${errorCount} errors. ${successCount} videos processed successfully.`);
      }

    } catch (error) {
      console.error('Export error:', error);
      alert(`❌ Export failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      
      // Reset progress on error
      setExportProgress([]);
    } finally {
      setIsExporting(false);
    }
  };

  const getProgressStats = () => {
    const completed = exportProgress.filter(p => p.status === 'completed').length;
    const errors = exportProgress.filter(p => p.status === 'error').length;
    const processing = exportProgress.filter(p => p.status === 'processing').length;
    const pending = exportProgress.filter(p => p.status === 'pending').length;
    
    return { completed, errors, processing, pending, total: exportProgress.length };
  };

  const stats = getProgressStats();

  return (
    <div className="card p-6">
      <div className="flex items-center gap-3 mb-6">
        <Download className="w-6 h-6 text-primary-400" />
        <h2 className="text-xl font-bold text-gray-100">Export Videos</h2>
      </div>

      <div className="space-y-4">
        {/* Output Path Selection */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-300">
            Output Directory
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={outputPath}
              onChange={(e) => setOutputPath(e.target.value)}
              placeholder="Enter output directory (e.g., C:\Users\YourName\Videos or /home/user/videos)..."
              className="input flex-1"
            />
            <button
              onClick={handleSelectOutputPath}
              className="btn-secondary flex items-center gap-2"
              disabled={isExporting}
            >
              <FolderOpen className="w-4 h-4" />
              Browse
            </button>
          </div>
          <p className="text-xs text-gray-400">
            Videos will be organized into subfolders based on their tags. Windows paths (C:\...) are automatically converted for WSL compatibility.
          </p>
        </div>

        {/* Export Summary */}
        <div className="bg-gray-700/50 rounded-lg p-4 space-y-2">
          <h3 className="font-medium text-gray-200">Export Summary</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-400">Videos:</span>
              <span className="ml-2 text-gray-200">{videos.length}</span>
            </div>
            <div>
              <span className="text-gray-400">Tags:</span>
              <span className="ml-2 text-gray-200">{tags.length}</span>
            </div>
            <div>
              <span className="text-gray-400">Target FPS:</span>
              <span className="ml-2 text-gray-200">{globalSettings.fps}</span>
            </div>
            <div>
              <span className="text-gray-400">Duration:</span>
              <span className="ml-2 text-gray-200">
                {(globalSettings.totalFrames / globalSettings.fps).toFixed(1)}s
              </span>
            </div>
          </div>
        </div>

        {/* Progress Display */}
        {exportProgress.length > 0 && (
          <div className="bg-gray-700/50 rounded-lg p-4 space-y-3">
            <h3 className="font-medium text-gray-200">Export Progress</h3>
            
            <div className="grid grid-cols-4 gap-2 text-sm">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <span className="text-gray-300">Completed: {stats.completed}</span>
              </div>
              <div className="flex items-center gap-2">
                <Loader className="w-4 h-4 text-blue-400" />
                <span className="text-gray-300">Processing: {stats.processing}</span>
              </div>
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-400" />
                <span className="text-gray-300">Errors: {stats.errors}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-gray-500" />
                <span className="text-gray-300">Pending: {stats.pending}</span>
              </div>
            </div>

            {/* Overall Progress Bar */}
            <div className="w-full bg-gray-600 rounded-full h-2">
              <div
                className="bg-primary-500 h-2 rounded-full transition-all duration-300"
                style={{
                  width: `${stats.total > 0 ? ((stats.completed + stats.errors) / stats.total) * 100 : 0}%`
                }}
              />
            </div>
          </div>
        )}

        {/* Export Button */}
        <button
          onClick={handleExport}
          disabled={isExporting || videos.length === 0 || !outputPath.trim()}
          className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isExporting ? (
            <>
              <Loader className="w-4 h-4 animate-spin" />
              Exporting...
            </>
          ) : (
            <>
              <Download className="w-4 h-4" />
              Export {videos.length} Video{videos.length !== 1 ? 's' : ''}
            </>
          )}
        </button>

        {videos.length === 0 && (
          <p className="text-center text-gray-400 text-sm">
            Add some videos to enable export functionality
          </p>
        )}
      </div>
    </div>
  );
};