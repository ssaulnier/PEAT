import { useState } from 'react';
import AnalysisReport from './AnalysisReport';

function App() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStatus, setProcessingStatus] = useState('');
  const [showReport, setShowReport] = useState(false);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      setIsProcessing(false);
      setProcessingStatus('');
      setShowReport(false);
    }
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setIsDragging(false);
    const file = event.dataTransfer.files[0];
    if (file) {
      setSelectedFile(file);
      setIsProcessing(false);
      setProcessingStatus('');
      setShowReport(false);
    }
  };

  const handleDragOver = (event) => {
    event.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleProcessing = async () => {
    setIsProcessing(true);
    setProcessingStatus('🔄 Analyse en cours...');
    setShowReport(false);
    
    setTimeout(() => {
      setProcessingStatus('✅ Analyse terminée !');
      setIsProcessing(false);
      setShowReport(true);
    }, 2000);
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Octets';
    const k = 1024;
    const sizes = ['Octets', 'Ko', 'Mo', 'Go'];
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
            Photosensitive Epilepsy Analysis Tool
          </p>
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
              <h3>Télécharger votre fichier vidéo</h3>
              <p className="upload-description">
                Glissez-déposez votre fichier vidéo ou audio ici, ou cliquez sur le bouton ci-dessous
              </p>
              <input
                type="file"
                id="file-input"
                accept="video/*,audio/*"
                onChange={handleFileChange}
                style={{ display: 'none' }}
              />
              <label htmlFor="file-input" className="upload-button">
                Choisir un fichier
              </label>
              <p className="upload-formats">
                Formats supportés : MP4, AVI, MOV, MP3, WAV, et plus
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
                <span className="file-type">{selectedFile.type || 'Type inconnu'}</span>
              </div>
              
              {processingStatus && (
                <div className="processing-status">
                  <p>{processingStatus}</p>
                </div>
              )}
              
              <button
                className="change-file-button"
                onClick={() => {
                  setSelectedFile(null);
                  setProcessingStatus('');
                }}
                disabled={isProcessing}
              >
                Changer de fichier
              </button>
              <button 
                className="process-button"
                onClick={handleProcessing}
                disabled={isProcessing}
              >
                {isProcessing ? '⏳ Analyse...' : 'Démarrer l\'analyse'}
              </button>
            </div>
          )}
        </div>
      </section>

      {showReport && selectedFile && (
        <section className="report-section-container">
          <AnalysisReport fileName={selectedFile.name} />
        </section>
      )}

      <section className="features-section">
        <h2 className="section-title">Fonctionnalités principales</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">⚡</div>
            <h3>Ultra rapide</h3>
            <p>Analyse vos fichiers vidéo avec FFmpeg directement dans votre navigateur</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🔒</div>
            <h3>Confidentialité garantie</h3>
            <p>Tout le traitement se fait localement - vos fichiers ne quittent jamais votre appareil</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">📈</div>
            <h3>Analyses visuelles</h3>
            <p>Graphiques et analyses détaillées pour identifier les risques photosensibles</p>
          </div>
        </div>
      </section>

      <footer className="app-footer">
        <p>Développé avec React, Vite & FFmpeg.wasm</p>
      </footer>
    </div>
  );
}

export default App;
