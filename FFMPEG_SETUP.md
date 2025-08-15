# FFmpeg Installation Guide

The Video Prepare application requires FFmpeg to process videos. Here's how to install it:

## Windows
1. Download FFmpeg from https://ffmpeg.org/download.html
2. Extract the files to a folder (e.g., `C:\ffmpeg`)
3. Add the `bin` folder to your system PATH
4. Restart your terminal/command prompt

### Quick Windows Install with Chocolatey:
```bash
choco install ffmpeg
```

### Quick Windows Install with Winget:
```bash
winget install FFmpeg
```

## macOS
```bash
brew install ffmpeg
```

## Ubuntu/Debian
```bash
sudo apt update
sudo apt install ffmpeg
```

## CentOS/RHEL/Fedora
```bash
sudo yum install ffmpeg
# or
sudo dnf install ffmpeg
```

## Verify Installation
After installation, verify FFmpeg is working:
```bash
ffmpeg -version
ffprobe -version
```

## Troubleshooting
- Make sure FFmpeg is in your system PATH
- Restart your terminal after installation
- On Windows, you may need to restart the entire application

Once FFmpeg is installed, restart the Video Prepare server and you should see:
```
✅ FFmpeg found and ready
```