import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

function AnalysisReport({ fileName, analysisData }) {
  const luminanceData = analysisData.luminanceData;
  const maxLuminance = parseFloat(analysisData.maxLuminance);
  const minLuminance = parseFloat(analysisData.minLuminance);
  const avgLuminance = analysisData.avgLuminance;
  const flashCount = analysisData.flashCount;
  const duration = parseFloat(analysisData.duration);
  const maxFlashesPerSecond = analysisData.maxFlashesPerSecond;
  const dangerousSeconds = analysisData.dangerousSeconds;
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
          <div className={`risk-item ${isSafe ? 'safe' : 'danger'}`}>
            <span className="risk-icon">{isSafe ? '✅' : '⚠️'}</span>
            <div className="risk-content">
              <strong>Flashs généraux (General Flashes)</strong>
              <p>
                {flashCount} flashs généraux détectés sur toute la vidéo
              </p>
              <p>
                Fréquence maximale: {maxFlashesPerSecond} flashs/seconde
                {isSafe 
                  ? ' - ✅ Conforme (seuil: max 3 flashs/seconde)' 
                  : ' - ⚠️ NON CONFORME (seuil: max 3 flashs/seconde)'}
              </p>
              {dangerousSeconds.length > 0 && (
                <div style={{ marginTop: '0.75rem', padding: '0.75rem', background: '#fee2e2', borderRadius: '8px', border: '1px solid #ef4444' }}>
                  <p style={{ color: '#991b1b', fontWeight: 'bold', margin: 0 }}>
                    ⚠️ ZONES À RISQUE ÉLEVÉ DÉTECTÉES :
                  </p>
                  <p style={{ color: '#991b1b', margin: '0.5rem 0 0 0', fontSize: '0.9rem' }}>
                    {dangerousSeconds.map(interval => 
                      `Intervalle ${interval.start}s-${interval.end}s (${interval.count} flashs en 1 seconde)`
                    ).join(' • ')}
                  </p>
                </div>
              )}
            </div>
          </div>
          <div className={`risk-item ${flashCount < 10 ? 'safe' : 'warning'}`}>
            <span className="risk-icon">{flashCount < 10 ? '✅' : '⚠️'}</span>
            <div className="risk-content">
              <strong>Changements de luminance</strong>
              <p>
                {flashCount < 10 
                  ? 'Les variations de luminance restent dans les limites acceptables' 
                  : `${flashCount} changements brusques de luminance détectés (>10% de changement relatif en 0.5s)`}
              </p>
              <p style={{ fontSize: '0.85rem', marginTop: '0.25rem', color: '#666' }}>
                Seuil WCAG 2.0: Variation de luminance relative {'>'} 10% en moins de 0.5 seconde
              </p>
            </div>
          </div>
          <div className="risk-item safe">
            <span className="risk-icon">ℹ️</span>
            <div className="risk-content">
              <strong>Détails de l'analyse</strong>
              <p>Durée: {duration}s | Frames analysées: {luminanceData.length} | Taux: ~{(luminanceData.length / parseFloat(duration)).toFixed(1)} fps</p>
              <p style={{ fontSize: '0.9rem', marginTop: '0.5rem', color: '#666' }}>
                Basé sur les directives WCAG 2.0 pour la prévention des crises photosensibles
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
            ? 'Cette vidéo est conforme aux directives WCAG 2.0 (Web Content Accessibility Guidelines). Elle ne contient pas plus de 3 flashs généraux par seconde et ne présente aucun risque identifié pour les personnes photosensibles.'
            : `⚠️ Cette vidéo N'EST PAS CONFORME aux directives WCAG 2.0. Elle contient jusqu'à ${maxFlashesPerSecond} flashs par seconde, dépassant le seuil de sécurité de 3 flashs/seconde. Cette vidéo peut provoquer des crises chez les personnes atteintes d'épilepsie photosensible. Modifications recommandées avant diffusion.`}
        </p>
      </div>
    </div>
  );
}

export default AnalysisReport;
