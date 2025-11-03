# PEAT Online

## Overview
PEAT Online is a React-based web application for video/audio processing, utilizing FFmpeg and data visualization with Recharts.

## Project Architecture
- **Frontend Framework**: React 18 with Vite
- **Build Tool**: Vite 5
- **Key Dependencies**:
  - @ffmpeg/ffmpeg: Video/audio processing
  - recharts: Data visualization
  - react, react-dom: UI framework

## Recent Changes
- **2024-11-03**: WCAG 2.1 complete compliance implementation
  - ✅ **General Flash Detection**: Relative luminance change ≥10% with dark image threshold <0.80
  - ✅ **Red Flash Detection**: Saturated red color flash detection (dangerous even with low luminance change)
  - ✅ **Spatial Zone Analysis**: 341×256 pixel zones for accurate flash area measurement (WCAG 2.1 requirement)
  - ✅ **Static Pattern Detection**: High-contrast pattern identification to prevent seizures from static images
  - Enhanced UI to display separate counts for general flashes vs red flashes
  - Detailed interval reporting showing both flash types in dangerous zones
  - Compliance messaging updated to reflect WCAG 2.1 standards (not 2.0)
  - Pattern severity levels (high/medium) with visual indicators
  - Frame-by-frame color analysis (RGB + saturation) in addition to luminance
  - Zone-based flash detection to meet international medical standards (PMC article compliance)
  - Fixed FFmpeg initialization with toBlobURL for proper worker loading
  - Comprehensive error handling with user-friendly messages
  - Video-only upload restriction (audio files rejected with clear message)
  - Validation guards for empty frames, invalid duration, corrupted files

- **2024-11-03**: Real video analysis with FFmpeg integration
  - Created VideoAnalyzer.js module for real video processing
  - Integrated @ffmpeg/ffmpeg to extract frames from uploaded videos
  - Implemented luminance calculation for each frame (using standard formula: 0.299R + 0.587G + 0.114B)
  - Flash rate calculation with dangerous zone identification (>3 flashs/sec)
  - Dynamic report updates based on actual video analysis results
  - Warning indicators for videos exceeding safety thresholds
  - Processing status updates during analysis (FFmpeg loading, frame extraction, analysis)

- **2024-11-03**: Detailed analysis report with luminance graph
  - Created comprehensive analysis report component
  - Integrated Recharts for luminance evolution graph (similar to reference design)
  - Added statistics cards (avg, max, min luminance, duration)
  - Implemented risk detection section with visual indicators
  - Added conclusion badge with safety status (green for safe, orange for warnings)
  - Responsive design for report layout

- **2024-11-03**: French translation and processing functionality
  - Entire app translated to French
  - Updated baseline: "Photosensitive Epilepsy Analysis Tool"
  - Removed unnecessary feature badges
  - Implemented "Start Processing" functionality with visual feedback
  - Added processing status messages
  - Disabled buttons during processing
  
- **2024-11-03**: File upload functionality added
  - Interactive upload area with drag-and-drop support
  - "Choose File" button for video/audio uploads
  - File information display (name, size, type)
  - Animated upload zone with floating icon
  - Support for all video and audio formats
  - Visual feedback when file is selected

- **2024-11-03**: Design improvements and documentation
  - Transformed UI with modern purple gradient theme
  - Added hero section with glassmorphism badges
  - Implemented feature cards with hover animations
  - Created comprehensive GitHub README
  - Enhanced .gitignore with Replit-specific files
  - Responsive design for all screen sizes
  - Smooth fadeInUp animations throughout

- **2024-11-03**: Bug fixes and performance improvements
  - Fixed 2 security vulnerabilities (esbuild/Vite)
  - Upgraded Vite from 5.2.0 to 6.4.1
  - Updated all dependencies to latest compatible versions
  - Removed unused React import (modern JSX transform)
  - Added React.StrictMode for better development warnings
  - Optimized imports with named imports pattern
  - Production build verified and working

- **2024-11-03**: Initial project setup in Replit environment
  - Created missing App.jsx component
  - Configured Vite for Replit proxy compatibility (port 5000, host 0.0.0.0)
  - Set up development workflow
  - Added .gitignore for Node.js projects

## Project Structure
```
/
├── src/
│   ├── App.jsx              # Main application component
│   ├── AnalysisReport.jsx   # Analysis report with charts
│   ├── VideoAnalyzer.js     # FFmpeg video analysis module
│   ├── main.jsx             # React entry point
│   └── index.css            # Global styles
├── index.html               # HTML template
├── package.json             # Dependencies and scripts
├── vite.config.js           # Vite configuration
└── .gitignore               # Git ignore rules
```

## Development
- **Dev Server**: `npm run dev` (runs on port 5000)
- **Build**: `npm run build`
- **Preview**: `npm run preview`

## Configuration Notes
- Vite is configured to bind to 0.0.0.0:5000 for Replit proxy compatibility
- HMR (Hot Module Replacement) configured for WSS protocol
- CORS headers configured for FFmpeg.wasm (SharedArrayBuffer support):
  - Cross-Origin-Opener-Policy: same-origin
  - Cross-Origin-Embedder-Policy: require-corp
- FFmpeg.wasm uses single-threaded ESM version for better stability
