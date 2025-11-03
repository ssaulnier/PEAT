function App() {
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
