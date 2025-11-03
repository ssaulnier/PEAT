import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

function AnalysisReport({ fileName, analysisData }) {
  const luminanceData = analysisData.luminanceData;
  const maxLuminance = parseFloat(analysisData.maxLuminance);
  const minLuminance = parseFloat(analysisData.minLuminance);
  const avgLuminance = analysisData.avgLuminance;
  const flashCount = analysisData.flashCount;
  const generalFlashCount = analysisData.generalFlashCount || 0;
  const redFlashCount = analysisData.redFlashCount || 0;
  const duration = parseFloat(analysisData.duration);
  const maxFlashesPerSecond = analysisData.maxFlashesPerSecond;
  const maxGeneralFlashesPerSecond = analysisData.maxGeneralFlashesPerSecond || 0;
  const maxRedFlashesPerSecond = analysisData.maxRedFlashesPerSecond || 0;
  const dangerousSeconds = analysisData.dangerousSeconds;
  const patterns = analysisData.patterns || [];
  const isSafe = analysisData.isSafe;

  return (
    <div className="analysis-report">
      <h2 className="report-title">📊 Bilan de l'analyse</h2>
      
      <div className="report-section">
        <h3>Fichier analysé</h3>
        <p className="file-analyzed">{fileName}</p>
      </div>

      <div className="report-section">
        <h3>Évolution de la luminance</h3>
        <div className="chart-container">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={luminanceData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
              <XAxis 
                dataKey="temps" 
                label={{ value: 'Temps (s)', position: 'insideBottom', offset: -5 }}
                tick={{ fontSize: 12 }}
                interval={Math.floor(luminanceData.length / 10)}
              />
              <YAxis 
                label={{ value: 'Luminance', angle: -90, position: 'insideLeft' }}
                tick={{ fontSize: 12 }}
                domain={[0, 260]}
              />
              <Tooltip 
                formatter={(value) => [`${value.toFixed(1)}`, 'Luminance']}
                labelFormatter={(label) => `Temps: ${label}s`}
              />
              <Line 
                type="monotone" 
                dataKey="luminance" 
                stroke="#667eea" 
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="report-section">
        <h3>Statistiques</h3>
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-label">Luminance moyenne</div>
            <div className="stat-value">{avgLuminance}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Luminance max</div>
            <div className="stat-value">{maxLuminance.toFixed(1)}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Luminance min</div>
            <div className="stat-value">{minLuminance.toFixed(1)}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Durée analysée</div>
            <div className="stat-value">{duration}s</div>
          </div>
        </div>
      </div>

      <div className="report-section">
        <h3>Détection des risques</h3>
        <div className="risk-analysis">
          <div className={`risk-item ${maxGeneralFlashesPerSecond <= 3 ? 'safe' : 'danger'}`}>
            <span className="risk-icon">{maxGeneralFlashesPerSecond <= 3 ? '✅' : '⚠️'}</span>
            <div className="risk-content">
              <strong>Flashs généraux (General Flashes)</strong>
              <p>
                {generalFlashCount} flashs généraux détectés sur toute la vidéo
              </p>
              <p>
                Fréquence maximale: {maxGeneralFlashesPerSecond} flashs/seconde
                {maxGeneralFlashesPerSecond <= 3 
                  ? ' - ✅ Conforme (seuil WCAG 2.1: max 3 flashs/s)' 
                  : ' - ⚠️ NON CONFORME (seuil WCAG 2.1: max 3 flashs/s)'}
              </p>
              <p style={{ fontSize: '0.85rem', marginTop: '0.25rem', color: '#666' }}>
                Critère: Changement de luminance relative ≥10% avec image sombre {'<'}0.80, dans une fenêtre de 0.5s
              </p>
            </div>
          </div>

          <div className={`risk-item ${maxRedFlashesPerSecond <= 3 ? 'safe' : 'danger'}`}>
            <span className="risk-icon">{maxRedFlashesPerSecond <= 3 ? '✅' : '⚠️'}</span>
            <div className="risk-content">
              <strong>Flashs rouges (Red Flashes)</strong>
              <p>
                {redFlashCount} flashs rouges détectés sur toute la vidéo
              </p>
              <p>
                Fréquence maximale: {maxRedFlashesPerSecond} flashs/seconde
                {maxRedFlashesPerSecond <= 3 
                  ? ' - ✅ Conforme (seuil WCAG 2.1: max 3 flashs/s)' 
                  : ' - ⚠️ NON CONFORME (seuil WCAG 2.1: max 3 flashs/s)'}
              </p>
              <p style={{ fontSize: '0.85rem', marginTop: '0.25rem', color: '#666' }}>
                Les flashs rouges saturés sont particulièrement dangereux même avec peu de changement de luminance
              </p>
            </div>
          </div>

          {patterns.filter(p => p.severity === 'high' || p.severity === 'medium').length > 0 && (
            <div className={`risk-item ${patterns.some(p => p.severity === 'high') ? 'danger' : 'warning'}`}>
              <span className="risk-icon">{patterns.some(p => p.severity === 'high') ? '⚠️' : '⚡'}</span>
              <div className="risk-content">
                <strong>Patterns statiques dangereux</strong>
                <p>
                  {patterns.filter(p => p.severity === 'high').length} pattern(s) à risque élevé détecté(s)
                </p>
                {patterns.filter(p => p.severity === 'high' || p.severity === 'medium').slice(0, 3).map((pattern, idx) => (
                  <p key={idx} style={{ fontSize: '0.85rem', marginTop: '0.25rem', color: '#666' }}>
                    • {pattern.description} (sévérité: {pattern.severity})
                  </p>
                ))}
              </div>
            </div>
          )}

          {dangerousSeconds.length > 0 && (
            <div className="risk-item danger">
              <span className="risk-icon">🔴</span>
              <div className="risk-content">
                <strong>⚠️ ZONES À RISQUE CRITIQUE</strong>
                <div style={{ marginTop: '0.5rem', padding: '0.75rem', background: '#fee2e2', borderRadius: '8px', border: '1px solid #ef4444' }}>
                  {dangerousSeconds.map((interval, idx) => (
                    <p key={idx} style={{ color: '#991b1b', margin: '0.25rem 0', fontSize: '0.9rem' }}>
                      ⚠️ Intervalle {interval.start}s-{interval.end}s: {interval.generalCount} flashs généraux + {interval.redCount} flashs rouges
                    </p>
                  ))}
                </div>
              </div>
            </div>
          )}

          <div className="risk-item safe">
            <span className="risk-icon">ℹ️</span>
            <div className="risk-content">
              <strong>Détails de l'analyse avancée</strong>
              <p>Durée: {duration}s | Frames analysées: {luminanceData.length} | Taux: ~{(luminanceData.length / parseFloat(duration)).toFixed(1)} fps</p>
              <p style={{ fontSize: '0.9rem', marginTop: '0.5rem', color: '#666' }}>
                ✅ Analyse complète WCAG 2.1: Flashs généraux, flashs rouges, zones spatiales (341×256px), et patterns statiques
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="report-conclusion">
        <div className={`conclusion-badge ${isSafe ? 'success' : 'warning'}`}>
          {isSafe ? '✅ Vidéo sûre pour diffusion' : '⚠️ ATTENTION: Risques photosensibles détectés'}
        </div>
        <p className="conclusion-text">
          {isSafe 
            ? 'Cette vidéo est conforme aux directives WCAG 2.1 (Web Content Accessibility Guidelines). Elle respecte tous les critères: ≤3 flashs généraux/s, ≤3 flashs rouges/s, analyse spatiale par zones (341×256px), et aucun pattern statique dangereux détecté. Elle ne présente aucun risque identifié pour les personnes photosensibles.'
            : `⚠️ Cette vidéo N'EST PAS CONFORME aux directives WCAG 2.1. Problèmes détectés: ${maxGeneralFlashesPerSecond > 3 ? `${maxGeneralFlashesPerSecond} flashs généraux/s (max: 3)` : ''}${maxRedFlashesPerSecond > 3 ? `, ${maxRedFlashesPerSecond} flashs rouges/s (max: 3)` : ''}${patterns.some(p => p.severity === 'high') ? ', patterns statiques dangereux' : ''}. Cette vidéo peut provoquer des crises chez les personnes atteintes d'épilepsie photosensible. Modifications OBLIGATOIRES avant diffusion.`}
        </p>
      </div>
    </div>
  );
}

export default AnalysisReport;
