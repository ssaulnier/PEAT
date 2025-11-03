# 🎬 PEAT Online

> Photosensitive Epilepsy Analysis Tool - Outil d'analyse d'épilepsie photosensible

[![Built with React](https://img.shields.io/badge/React-18.3-61dafb?style=flat&logo=react)](https://reactjs.org/)
[![Powered by Vite](https://img.shields.io/badge/Vite-6.4-646cff?style=flat&logo=vite)](https://vitejs.dev/)
[![FFmpeg.wasm](https://img.shields.io/badge/FFmpeg-wasm-green?style=flat)](https://ffmpegwasm.netlify.app/)

## ✨ Fonctionnalités

- 🎥 **Analyse vidéo** - Détection des risques photosensibles dans les vidéos
- 📊 **Analyses visuelles** - Graphiques et analyses détaillées
- 🔒 **Confidentialité garantie** - Tout le traitement se fait localement dans votre navigateur
- ⚡ **Ultra rapide** - Propulsé par WebAssembly pour des performances optimales
- 🌍 **Interface française** - Application entièrement en français

## 🚀 Quick Start

### Prerequisites

- Node.js 20+ installed
- npm or yarn package manager

### Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd peat-online

# Install dependencies
npm install

# Start development server
npm run dev
```

The app will be available at `http://localhost:5000`

## 📦 Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build locally |

## 🛠️ Tech Stack

- **Frontend Framework**: [React 18](https://reactjs.org/) - Modern UI library
- **Build Tool**: [Vite 6](https://vitejs.dev/) - Next generation frontend tooling
- **Media Processing**: [FFmpeg.wasm](https://ffmpegwasm.netlify.app/) - FFmpeg compiled to WebAssembly
- **Data Visualization**: [Recharts](https://recharts.org/) - Composable charting library
- **Styling**: CSS3 with modern features (gradients, animations, grid)

## 📁 Project Structure

```
peat-online/
├── src/
│   ├── App.jsx         # Main application component
│   ├── main.jsx        # React entry point
│   └── index.css       # Global styles
├── index.html          # HTML template
├── vite.config.js      # Vite configuration
├── package.json        # Dependencies and scripts
└── README.md           # This file
```

## 🎨 Design Philosophy

PEAT Online features a modern, gradient-based design with:

- **Purple gradient theme** - Professional and eye-catching
- **Glassmorphism effects** - Modern UI with backdrop blur
- **Smooth animations** - Fade-in effects for better UX
- **Responsive design** - Works on all screen sizes
- **Card-based layout** - Clean and organized information

## 🔧 Configuration

### Vite Configuration

The app is configured to run on port 5000 with:
- Host binding to `0.0.0.0` for network access
- Hot Module Replacement (HMR) via WebSocket
- Optimized build output with code splitting

### Environment Variables

No environment variables are required for basic usage. The app runs entirely client-side.

## 🌐 Deployment

### Production Build

```bash
npm run build
```

This creates an optimized production build in the `dist/` folder.

### Deployment Options

- **Replit**: Click the "Publish" button in your Replit project
- **Vercel**: `vercel deploy`
- **Netlify**: Drag and drop the `dist/` folder
- **GitHub Pages**: Use `gh-pages` branch deployment

## 🤝 Contributing

Contributions are welcome! Here's how you can help:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is open source and available under the MIT License.

## 🙏 Acknowledgments

- [FFmpeg.wasm](https://ffmpegwasm.netlify.app/) - Browser-based video processing
- [React](https://reactjs.org/) - UI framework
- [Vite](https://vitejs.dev/) - Build tool
- [Recharts](https://recharts.org/) - Data visualization

## 📧 Contact

For questions or feedback, please open an issue on GitHub.

---

**Built with ❤️ using React, Vite & FFmpeg.wasm**
