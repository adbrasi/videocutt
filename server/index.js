const express = require('express');
const multer = require('multer');
const ffmpeg = require('fluent-ffmpeg');
const cors = require('cors');
const path = require('path');
const fs = require('fs').promises;
const { v4: uuidv4 } = require('uuid');

// Check if FFmpeg is available
function checkFFmpegAvailability() {
  return new Promise((resolve) => {
    ffmpeg.getAvailableFormats((err, formats) => {
      if (err) {
        console.error('⚠️  FFmpeg not found. Please install FFmpeg to process videos.');
        console.error('   On Ubuntu/Debian: sudo apt install ffmpeg');
        console.error('   On Windows: Download from https://ffmpeg.org/download.html');
        console.error('   On macOS: brew install ffmpeg');
        resolve(false);
      } else {
        console.log('✅ FFmpeg found and ready');
        resolve(true);
      }
    });
  });
}

let ffmpegAvailable = false;

const app = express();
const PORT = 3005;

// Middleware
app.use(cors());
app.use(express.json());

// Configure multer for video uploads
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadsDir = path.join(__dirname, 'uploads');
    try {
      await fs.mkdir(uploadsDir, { recursive: true });
      cb(null, uploadsDir);
    } catch (error) {
      cb(error);
    }
  },
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}-${file.originalname}`;
    cb(null, uniqueName);
  }
});

const upload = multer({ 
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('video/')) {
      cb(null, true);
    } else {
      cb(new Error('Only video files are allowed'));
    }
  },
  limits: {
    fileSize: 500 * 1024 * 1024 // 500MB limit
  }
});

// Get video metadata
function getVideoMetadata(filePath) {
  return new Promise((resolve, reject) => {
    if (!ffmpegAvailable) {
      reject(new Error('FFmpeg not available. Please install FFmpeg to process videos.'));
      return;
    }
    
    ffmpeg.ffprobe(filePath, (err, metadata) => {
      if (err) {
        reject(err);
        return;
      }
      
      const videoStream = metadata.streams.find(stream => stream.codec_type === 'video');
      if (!videoStream) {
        reject(new Error('No video stream found'));
        return;
      }
      
      resolve({
        duration: parseFloat(metadata.format.duration),
        fps: eval(videoStream.r_frame_rate) || 30,
        resolution: {
          width: videoStream.width,
          height: videoStream.height
        }
      });
    });
  });
}

// Generate thumbnail
function generateThumbnail(inputPath, outputPath, timeOffset = 0) {
  return new Promise((resolve, reject) => {
    ffmpeg(inputPath)
      .seekInput(timeOffset)
      .frames(1)
      .output(outputPath)
      .on('end', () => resolve(outputPath))
      .on('error', reject)
      .run();
  });
}

// Process video (cut, change FPS, remove audio)
function processVideo(inputPath, outputPath, startTime, duration, targetFps) {
  return new Promise((resolve, reject) => {
    ffmpeg(inputPath)
      .seekInput(startTime)
      .duration(duration)
      .fps(targetFps)
      .noAudio()
      .videoCodec('libx264')
      .addOption('-preset', 'fast')
      .addOption('-crf', '23')
      .output(outputPath)
      .on('progress', (progress) => {
        // Emit progress updates if needed
        console.log(`Processing: ${progress.percent}% done`);
      })
      .on('end', () => resolve(outputPath))
      .on('error', reject)
      .run();
  });
}

// Routes

// Upload and analyze video
app.post('/api/upload', upload.single('video'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No video file provided' });
    }
    
    const filePath = req.file.path;
    let metadata = {
      duration: 30, // Default values when FFmpeg is not available
      fps: 30,
      resolution: { width: 1920, height: 1080 }
    };
    
    // Try to get metadata if FFmpeg is available
    if (ffmpegAvailable) {
      try {
        metadata = await getVideoMetadata(filePath);
      } catch (error) {
        console.warn('Could not extract metadata, using defaults:', error.message);
      }
    } else {
      console.log('FFmpeg not available, using default metadata for', req.file.originalname);
    }
    
    // Try to generate thumbnail if FFmpeg is available
    let thumbnailUrl = null;
    if (ffmpegAvailable) {
      try {
        const thumbnailDir = path.join(__dirname, 'thumbnails');
        await fs.mkdir(thumbnailDir, { recursive: true });
        const thumbnailPath = path.join(thumbnailDir, `${req.file.filename}.jpg`);
        await generateThumbnail(filePath, thumbnailPath);
        thumbnailUrl = `/api/thumbnail/${req.file.filename}.jpg`;
      } catch (error) {
        console.warn('Could not generate thumbnail:', error.message);
      }
    }
    
    res.json({
      id: req.file.filename,
      name: req.file.originalname,
      path: filePath,
      thumbnail: thumbnailUrl,
      ...metadata
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Serve thumbnails
app.get('/api/thumbnail/:filename', (req, res) => {
  const thumbnailPath = path.join(__dirname, 'thumbnails', req.params.filename);
  res.sendFile(thumbnailPath);
});

// Process videos for export
app.post('/api/export', async (req, res) => {
  try {
    const { videos, globalSettings, outputPath } = req.body;
    
    console.log('Export request received:', {
      videosCount: videos?.length,
      globalSettings,
      outputPath
    });
    
    if (!ffmpegAvailable) {
      return res.status(400).json({ 
        error: 'FFmpeg is not available. Please install FFmpeg to export videos. See README.md for installation instructions.' 
      });
    }
    
    if (!videos || !Array.isArray(videos)) {
      return res.status(400).json({ error: 'Videos array is required' });
    }
    
    const results = [];
    
    for (const video of videos) {
      try {
        console.log(`Processing video: ${video.id}, path: ${video.path}`);
        
        if (!video.path) {
          throw new Error('Video path is missing');
        }
        
        const inputPath = video.path;
        const duration = globalSettings.totalFrames / globalSettings.fps;
        
        // Validate input file exists
        try {
          await fs.access(inputPath);
        } catch (error) {
          throw new Error(`Input file not found: ${inputPath}`);
        }
        
        // Convert Windows path to WSL path if needed
        let convertedOutputPath = outputPath;
        if (outputPath.match(/^[A-Z]:\\/)) {
          // Convert Windows path like C:\Users\... to /mnt/c/Users/...
          convertedOutputPath = outputPath
            .replace(/^([A-Z]):\\/, (match, drive) => `/mnt/${drive.toLowerCase()}/`)
            .replace(/\\/g, '/');
          console.log(`Converted Windows path: ${outputPath} -> ${convertedOutputPath}`);
        }
        
        // Create tag subfolder if needed
        let outputDir = convertedOutputPath;
        if (video.tagName) {
          outputDir = path.join(convertedOutputPath, video.tagName);
          await fs.mkdir(outputDir, { recursive: true });
        }
        
        const outputFilePath = path.join(outputDir, `processed_${video.name}`);
        
        console.log(`Processing: ${inputPath} -> ${outputFilePath}`);
        
        await processVideo(
          inputPath,
          outputFilePath,
          video.startTime,
          duration,
          globalSettings.fps
        );
        
        results.push({
          id: video.id,
          status: 'completed',
          outputPath: outputFilePath
        });
        
        console.log(`Successfully processed video ${video.id}`);
        
      } catch (error) {
        console.error(`Error processing video ${video.id}:`, error);
        results.push({
          id: video.id,
          status: 'error',
          error: error.message
        });
      }
    }
    
    console.log('Export completed:', results);
    res.json({ results });
  } catch (error) {
    console.error('Export error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get processing progress (for future real-time updates)
app.get('/api/progress/:jobId', (req, res) => {
  // This would typically check a job queue or database
  // For now, return a simple response
  res.json({ progress: 100, status: 'completed' });
});

// Cleanup old files
async function cleanupOldFiles() {
  const uploadsDir = path.join(__dirname, 'uploads');
  const thumbnailsDir = path.join(__dirname, 'thumbnails');
  
  try {
    const uploads = await fs.readdir(uploadsDir);
    const thumbnails = await fs.readdir(thumbnailsDir);
    
    const now = Date.now();
    const oneHour = 60 * 60 * 1000;
    
    // Clean up files older than 1 hour
    for (const file of uploads) {
      const filePath = path.join(uploadsDir, file);
      const stats = await fs.stat(filePath);
      if (now - stats.mtime.getTime() > oneHour) {
        await fs.unlink(filePath);
        console.log(`Cleaned up old upload: ${file}`);
      }
    }
    
    for (const file of thumbnails) {
      const filePath = path.join(thumbnailsDir, file);
      const stats = await fs.stat(filePath);
      if (now - stats.mtime.getTime() > oneHour) {
        await fs.unlink(filePath);
        console.log(`Cleaned up old thumbnail: ${file}`);
      }
    }
  } catch (error) {
    console.error('Cleanup error:', error);
  }
}

// Run cleanup every 30 minutes
setInterval(cleanupOldFiles, 30 * 60 * 1000);

app.listen(PORT, async () => {
  console.log(`Video Prepare server running on http://localhost:${PORT}`);
  ffmpegAvailable = await checkFFmpegAvailability();
});