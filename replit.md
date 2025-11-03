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
│   ├── App.jsx         # Main application component
│   ├── main.jsx        # React entry point
│   └── index.css       # Global styles
├── index.html          # HTML template
├── package.json        # Dependencies and scripts
├── vite.config.js      # Vite configuration
└── .gitignore          # Git ignore rules
```

## Development
- **Dev Server**: `npm run dev` (runs on port 5000)
- **Build**: `npm run build`
- **Preview**: `npm run preview`

## Configuration Notes
- Vite is configured to bind to 0.0.0.0:5000 for Replit proxy compatibility
- HMR (Hot Module Replacement) configured for WSS protocol
