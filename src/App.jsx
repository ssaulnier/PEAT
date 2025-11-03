import { useState } from 'react';

function App() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setIsDragging(false);
    const file = event.dataTransfer.files[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleDragOver = (event) => {
    event.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className="app-container">
      <header className="hero-section">
        <div className="hero-content">
          <h1 className="title">
            <span className="title-highlight">PEAT</span> Online
          </h1>
          <p className="subtitle">
            Professional Video & Audio Processing in Your Browser
          </p>
          <div className="feature-badges">
            <span className="badge">🎬 Video Processing</span>
            <span className="badge">🎵 Audio Editing</span>
            <span className="badge">📊 Analytics</span>
          </div>
        </div>
      </header>

      <section className="upload-section">
        <div
          className={`upload-area ${isDragging ? 'dragging' : ''}`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          {!selectedFile ? (
            <>
              <div className="upload-icon">📁</div>
              <h3>Upload Your Media File</h3>
              <p className="upload-description">
                Drag and drop your video or audio file here, or click the button below
              </p>
              <input
                type="file"
                id="file-input"
                accept="video/*,audio/*"
                onChange={handleFileChange}
                style={{ display: 'none' }}
              />
              <label htmlFor="file-input" className="upload-button">
                Choose File
              </label>
              <p className="upload-formats">
                Supported formats: MP4, AVI, MOV, MP3, WAV, and more
              </p>
            </>
          ) : (
            <div className="file-info">
              <div className="file-icon">
                {selectedFile.type.startsWith('video') ? '🎥' : '🎵'}
              </div>
              <h3 className="file-name">{selectedFile.name}</h3>
              <div className="file-details">
                <span className="file-size">{formatFileSize(selectedFile.size)}</span>
                <span className="file-type">{selectedFile.type || 'Unknown type'}</span>
              </div>
              <button
                className="change-file-button"
                onClick={() => setSelectedFile(null)}
              >
                Change File
              </button>
              <button className="process-button">
                Start Processing
              </button>
            </div>
          )}
        </div>
      </section>

      <section className="features-section">
        <h2 className="section-title">Powerful Features</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">⚡</div>
            <h3>Lightning Fast</h3>
            <p>Process media files with FFmpeg running directly in your browser</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🔒</div>
            <h3>Privacy First</h3>
            <p>All processing happens locally - your files never leave your device</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">📈</div>
            <h3>Visual Analytics</h3>
            <p>Beautiful charts and graphs to analyze your media content</p>
          </div>
        </div>
      </section>

      <footer className="app-footer">
        <p>Built with React, Vite & FFmpeg.wasm</p>
      </footer>
    </div>
  );
}

export default App;
