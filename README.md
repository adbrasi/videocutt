# Video Prepare

A modern web application for preparing videos for AI video generation model training. Features batch processing, tagging system, and professional video handling with FFmpeg.

## Features

### 🎯 **Core Functionality**
- **Global Settings**: Set uniform FPS and total frame count for all videos
- **Individual Controls**: Start time slider per video with real-time preview
- **Smart Tagging**: Create colored tags for organizing videos into subfolders
- **Live Previews**: Hover-based video previews with efficient memory management
- **Batch Processing**: Export all videos with applied settings simultaneously

### 🎨 **Modern Interface**
- **Responsive Grid**: Auto-adjusting layout (1-6 columns based on screen size)
- **Dark Theme**: Professional dark UI with smooth animations
- **Drag & Drop**: Intuitive file uploading with visual feedback
- **Real-time Updates**: Instant preview of settings changes

### ⚡ **Performance**
- **Efficient Memory Usage**: Smart preview loading/unloading
- **FFmpeg Integration**: Professional video processing (cutting, FPS resampling, audio removal)
- **Parallel Processing**: Handle multiple videos simultaneously
- **Automatic Cleanup**: Temporary files cleaned up automatically

## Quick Start

### Prerequisites
- Node.js 18+ 
- **FFmpeg installed on your system** (see [FFMPEG_SETUP.md](./FFMPEG_SETUP.md) for installation instructions)
- Modern web browser

### Important: FFmpeg Installation
This application requires FFmpeg for video processing. If you see errors about FFmpeg not being found, please install it first:
- **Windows**: Download from https://ffmpeg.org or use `winget install FFmpeg`
- **macOS**: `brew install ffmpeg`
- **Linux**: `sudo apt install ffmpeg` (Ubuntu/Debian) or equivalent for your distro

See [FFMPEG_SETUP.md](./FFMPEG_SETUP.md) for detailed installation instructions.

### Installation

1. **Clone and install dependencies:**
```bash
cd video-prepare
npm install
```

2. **Start the development server:**
```bash
npm run dev
```

3. **Open your browser:**
- Frontend: http://localhost:3000
- Backend: http://localhost:3001

## Usage

### 1. **Upload Videos**
- Drag and drop video files onto the upload area
- Supports: MP4, AVI, MOV, MKV, WebM, FLV, WMV
- Maximum file size: 500MB per video

### 2. **Configure Global Settings**
- **Target FPS**: Set the output frame rate (1-120 FPS)
- **Total Frames**: Define how many frames each output video will have
- Duration is automatically calculated

### 3. **Create Tags**
- Click "Add Tag" to create colored organization labels
- Each tag creates a subfolder during export
- Assign tags to videos for automatic organization

### 4. **Adjust Individual Videos**
- **Start Time Slider**: Set where each video cut begins
- **Live Preview**: Hover over videos to see real-time previews
- **Tag Assignment**: Select tags from dropdown for each video
- End time is automatically calculated based on global settings

### 5. **Export**
- Select output directory
- Videos are processed and organized into tag-based subfolders
- All videos get:
  - Cut to specified start time and duration
  - Converted to target FPS
  - Audio removed
  - Saved with consistent naming

## Technical Details

### Architecture
- **Frontend**: React 18 + TypeScript + Tailwind CSS
- **Backend**: Node.js + Express + FFmpeg
- **State Management**: Zustand for global state
- **Video Processing**: fluent-ffmpeg wrapper around native FFmpeg

### Performance Optimizations
- **Smart Memory Management**: Videos only load during hover
- **Thumbnail Generation**: Static thumbnails for initial display
- **Batch Processing**: Queue system prevents memory overload
- **Automatic Cleanup**: Temporary files removed after processing

### File Structure
```
video-prepare/
├── src/
│   ├── components/         # React components
│   ├── store/             # Zustand state management
│   ├── types/             # TypeScript definitions
│   ├── utils/             # Helper functions
│   └── main.tsx           # App entry point
├── server/                # Express backend
├── public/                # Static assets
└── package.json           # Dependencies
```

## Development

### Commands
```bash
npm run dev          # Start both frontend and backend
npm run client       # Frontend only (Vite)
npm run server       # Backend only (Node.js)
npm run build        # Production build
npm run lint         # Code linting
npm run type-check   # TypeScript checking
```

### Dependencies
**Frontend:**
- React + TypeScript for UI
- Tailwind CSS for styling
- Zustand for state management
- react-dropzone for file uploads
- @radix-ui/react-slider for range controls
- react-colorful for color picking

**Backend:**
- Express.js for API
- fluent-ffmpeg for video processing
- multer for file uploads
- CORS for cross-origin requests

## License

MIT License - feel free to use for your AI video training projects!# videocutt
