import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';

class VideoAnalyzer {
  constructor() {
    this.ffmpeg = new FFmpeg();
    this.loaded = false;
  }

  async loadFFmpeg(onProgress) {
    if (this.loaded) return;
    
    try {
      onProgress?.('Chargement de FFmpeg...');
      const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm';
      
      onProgress?.('Téléchargement des fichiers FFmpeg (core, wasm)...');
      
      const coreURL = await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript');
      const wasmURL = await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm');
      
      onProgress?.('Initialisation de FFmpeg...');
      
      await this.ffmpeg.load({
        coreURL,
        wasmURL
      });
      
      this.loaded = true;
      onProgress?.('✅ FFmpeg chargé avec succès');
    } catch (error) {
      console.error('Erreur détaillée lors du chargement de FFmpeg:', error);
      console.error('Message:', error.message);
      console.error('Stack:', error.stack);
      throw new Error(`Impossible de charger FFmpeg: ${error.message || 'Vérifiez votre connexion internet et réessayez.'}`);
    }
  }

  async analyzeVideo(file, onProgress) {
    if (!this.loaded) {
      await this.loadFFmpeg(onProgress);
    }

    if (!file.type.startsWith('video/')) {
      throw new Error('Veuillez sélectionner un fichier vidéo. Les fichiers audio ne sont pas pris en charge pour l\'analyse de flashs.');
    }

    try {
      onProgress?.('Chargement de la vidéo...');
      await this.ffmpeg.writeFile('input.mp4', await fetchFile(file));

      onProgress?.('Extraction des métadonnées...');
      const duration = await this.getVideoDuration(file);
      
      if (duration === 0 || isNaN(duration)) {
        throw new Error('Impossible de lire la durée de la vidéo. Le fichier est peut-être corrompu.');
      }
      
      onProgress?.('Extraction des frames...');
      const fps = 10;
      await this.ffmpeg.exec([
        '-i', 'input.mp4',
        '-vf', `fps=${fps}`,
        '-frame_pts', '1',
        'frame_%04d.png'
      ]);

      onProgress?.('Analyse de la luminance...');
      const luminanceData = await this.extractLuminanceData(fps, duration);

      if (luminanceData.length === 0) {
        throw new Error('Aucune frame n\'a pu être extraite de la vidéo. Le format vidéo n\'est peut-être pas supporté.');
      }

      onProgress?.('Détection des flashs...');
      const flashAnalysis = this.detectFlashes(luminanceData);

      const analysis = {
        luminanceData,
        ...flashAnalysis,
        duration: duration.toFixed(2),
        avgLuminance: (luminanceData.reduce((sum, d) => sum + d.luminance, 0) / luminanceData.length).toFixed(1),
        maxLuminance: Math.max(...luminanceData.map(d => d.luminance)).toFixed(1),
        minLuminance: Math.min(...luminanceData.map(d => d.luminance)).toFixed(1)
      };

      await this.cleanup();
      
      return analysis;
    } catch (error) {
      await this.cleanup();
      console.error('Erreur lors de l\'analyse:', error);
      throw error;
    }
  }

  async getVideoDuration(file) {
    return new Promise((resolve, reject) => {
      const video = document.createElement('video');
      video.preload = 'metadata';
      
      const timeout = setTimeout(() => {
        window.URL.revokeObjectURL(video.src);
        reject(new Error('Délai d\'attente dépassé lors de la lecture des métadonnées. Le fichier vidéo est peut-être corrompu ou dans un format non supporté.'));
      }, 10000);
      
      video.onloadedmetadata = () => {
        clearTimeout(timeout);
        window.URL.revokeObjectURL(video.src);
        resolve(video.duration);
      };
      
      video.onerror = () => {
        clearTimeout(timeout);
        window.URL.revokeObjectURL(video.src);
        reject(new Error('Impossible de lire la vidéo. Le fichier est corrompu ou le format n\'est pas supporté. Formats recommandés: MP4, WebM, AVI.'));
      };
      
      video.onabort = () => {
        clearTimeout(timeout);
        window.URL.revokeObjectURL(video.src);
        reject(new Error('Le chargement de la vidéo a été interrompu. Veuillez réessayer.'));
      };
      
      video.src = URL.createObjectURL(file);
    });
  }

  async extractLuminanceData(fps, duration) {
    const luminanceData = [];
    const totalFrames = Math.floor(duration * fps);
    
    for (let i = 1; i <= totalFrames; i++) {
      const frameNumber = String(i).padStart(4, '0');
      const filename = `frame_${frameNumber}.png`;
      
      try {
        const data = await this.ffmpeg.readFile(filename);
        const luminance = await this.calculateFrameLuminance(data);
        const timestamp = ((i - 1) / fps).toFixed(2);
        
        luminanceData.push({
          temps: timestamp,
          luminance: luminance
        });
      } catch (error) {
        console.warn(`Frame ${filename} non trouvé, analyse terminée`);
        break;
      }
    }
    
    return luminanceData;
  }

  async calculateFrameLuminance(imageData) {
    return new Promise((resolve) => {
      const blob = new Blob([imageData], { type: 'image/png' });
      const url = URL.createObjectURL(blob);
      const img = new Image();
      
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        
        const imageDataObj = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const pixels = imageDataObj.data;
        
        let totalLuminance = 0;
        for (let i = 0; i < pixels.length; i += 4) {
          const r = pixels[i];
          const g = pixels[i + 1];
          const b = pixels[i + 2];
          const luminance = 0.299 * r + 0.587 * g + 0.114 * b;
          totalLuminance += luminance;
        }
        
        const avgLuminance = totalLuminance / (pixels.length / 4);
        URL.revokeObjectURL(url);
        resolve(avgLuminance);
      };
      
      img.src = url;
    });
  }

  detectFlashes(luminanceData) {
    const transitions = [];
    const timeWindow = 0.5;
    const relativeThreshold = 0.1;
    
    for (let i = 1; i < luminanceData.length; i++) {
      const current = luminanceData[i];
      const previous = luminanceData[i - 1];
      const timeDiff = parseFloat(current.temps) - parseFloat(previous.temps);
      
      if (timeDiff > timeWindow) continue;
      
      const avgLuminance = (current.luminance + previous.luminance) / 2;
      const luminanceDiff = current.luminance - previous.luminance;
      const relativeChange = avgLuminance > 0 ? Math.abs(luminanceDiff) / avgLuminance : 0;
      
      if (relativeChange >= relativeThreshold) {
        transitions.push({
          time: parseFloat(current.temps),
          direction: luminanceDiff > 0 ? 'increase' : 'decrease',
          change: (relativeChange * 100).toFixed(1),
          luminanceDiff: Math.abs(luminanceDiff).toFixed(1)
        });
      }
    }

    const pairedFlashes = [];
    for (let i = 0; i < transitions.length - 1; i++) {
      const first = transitions[i];
      const second = transitions[i + 1];
      
      if (first.direction !== second.direction) {
        const timeDiff = second.time - first.time;
        if (timeDiff <= timeWindow) {
          pairedFlashes.push({
            time: first.time,
            endTime: second.time,
            type: 'general'
          });
          i++;
        }
      }
    }

    let maxFlashesPerSecond = 0;
    const dangerousIntervals = [];
    
    if (pairedFlashes.length > 0) {
      const duration = parseFloat(luminanceData[luminanceData.length - 1].temps);
      
      for (let t = 0; t < duration; t += 0.1) {
        const windowEnd = t + 1.0;
        const flashesInWindow = pairedFlashes.filter(f => 
          f.time >= t && f.time < windowEnd
        ).length;
        
        if (flashesInWindow > maxFlashesPerSecond) {
          maxFlashesPerSecond = flashesInWindow;
        }
        
        if (flashesInWindow > 3) {
          const existing = dangerousIntervals.find(
            interval => Math.abs(interval.start - t) < 0.5
          );
          if (!existing) {
            dangerousIntervals.push({
              start: t.toFixed(1),
              end: windowEnd.toFixed(1),
              count: flashesInWindow
            });
          }
        }
      }
    }

    const isSafe = maxFlashesPerSecond <= 3;

    return {
      flashCount: pairedFlashes.length,
      maxFlashesPerSecond,
      dangerousSeconds: dangerousIntervals,
      flashes: pairedFlashes,
      isSafe,
      compliance: isSafe ? 'WCAG 2.0 conforme' : 'WCAG 2.0 non conforme - Risque de crises photosensibles'
    };
  }

  async cleanup() {
    try {
      const files = await this.ffmpeg.listDir('/');
      for (const file of files) {
        if (file.name.startsWith('frame_') || file.name === 'input.mp4') {
          await this.ffmpeg.deleteFile(file.name);
        }
      }
    } catch (error) {
      console.warn('Erreur lors du nettoyage:', error);
    }
  }
}

export default VideoAnalyzer;
