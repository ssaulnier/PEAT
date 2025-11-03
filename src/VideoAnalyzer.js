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

      onProgress?.('Analyse des frames (luminance, couleurs, zones)...');
      const frameDataList = await this.extractFrameData(fps, duration);

      if (frameDataList.length === 0) {
        throw new Error('Aucune frame n\'a pu être extraite de la vidéo. Le format vidéo n\'est peut-être pas supporté.');
      }

      onProgress?.('Détection des flashs et patterns...');
      const flashAnalysis = this.detectFlashes(frameDataList);

      const analysis = {
        luminanceData: frameDataList.map(f => ({ temps: f.temps, luminance: f.luminance })),
        ...flashAnalysis,
        duration: duration.toFixed(2),
        avgLuminance: (frameDataList.reduce((sum, d) => sum + d.luminance, 0) / frameDataList.length).toFixed(1),
        maxLuminance: Math.max(...frameDataList.map(d => d.luminance)).toFixed(1),
        minLuminance: Math.min(...frameDataList.map(d => d.luminance)).toFixed(1)
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
        reject(new Error('Délai d\'attente dépassé lors de la lecture des métadonnées.'));
      }, 10000);
      
      video.onloadedmetadata = () => {
        clearTimeout(timeout);
        window.URL.revokeObjectURL(video.src);
        resolve(video.duration);
      };
      
      video.onerror = () => {
        clearTimeout(timeout);
        window.URL.revokeObjectURL(video.src);
        reject(new Error('Impossible de lire la vidéo. Le fichier est corrompu ou le format n\'est pas supporté.'));
      };
      
      video.src = URL.createObjectURL(file);
    });
  }

  async extractFrameData(fps, duration) {
    const frameDataList = [];
    const totalFrames = Math.floor(duration * fps);
    
    for (let i = 1; i <= totalFrames; i++) {
      const frameNumber = String(i).padStart(4, '0');
      const filename = `frame_${frameNumber}.png`;
      
      try {
        const data = await this.ffmpeg.readFile(filename);
        const frameData = await this.analyzeFrame(data);
        const timestamp = ((i - 1) / fps).toFixed(2);
        
        frameDataList.push({
          temps: timestamp,
          ...frameData
        });
      } catch (error) {
        console.warn(`Frame ${filename} non trouvé, analyse terminée`);
        break;
      }
    }
    
    return frameDataList;
  }

  async analyzeFrame(imageData) {
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
        let totalRedSaturation = 0;
        const pixelCount = pixels.length / 4;
        
        for (let i = 0; i < pixels.length; i += 4) {
          const r = pixels[i];
          const g = pixels[i + 1];
          const b = pixels[i + 2];
          
          const luminance = 0.299 * r + 0.587 * g + 0.114 * b;
          totalLuminance += luminance;
          
          const max = Math.max(r, g, b);
          const min = Math.min(r, g, b);
          const saturation = max > 0 ? (max - min) / max : 0;
          
          if (r > g && r > b && saturation > 0.5) {
            totalRedSaturation += saturation;
          }
        }
        
        const zones = this.analyzeZones(imageDataObj, canvas.width, canvas.height);
        const patterns = this.detectStaticPatterns(imageDataObj, canvas.width, canvas.height);
        
        URL.revokeObjectURL(url);
        resolve({
          luminance: totalLuminance / pixelCount,
          redSaturation: totalRedSaturation / pixelCount,
          zones: zones,
          patterns: patterns,
          width: canvas.width,
          height: canvas.height
        });
      };
      
      img.src = url;
    });
  }
  
  analyzeZones(imageData, width, height) {
    const zoneWidth = 341;
    const zoneHeight = 256;
    const zones = [];
    
    const cols = Math.ceil(width / zoneWidth);
    const rows = Math.ceil(height / zoneHeight);
    
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const x = col * zoneWidth;
        const y = row * zoneHeight;
        const w = Math.min(zoneWidth, width - x);
        const h = Math.min(zoneHeight, height - y);
        
        let zoneLuminance = 0;
        let saturatedRedPixelCount = 0;
        let pixelCount = 0;
        
        for (let py = y; py < y + h; py++) {
          for (let px = x; px < x + w; px++) {
            const idx = (py * width + px) * 4;
            const r = imageData.data[idx];
            const g = imageData.data[idx + 1];
            const b = imageData.data[idx + 2];
            
            const luminance = 0.299 * r + 0.587 * g + 0.114 * b;
            zoneLuminance += luminance;
            
            const max = Math.max(r, g, b);
            const min = Math.min(r, g, b);
            const saturation = max > 0 ? (max - min) / max : 0;
            
            if (r > g && r > b && saturation > 0.5) {
              saturatedRedPixelCount++;
            }
            
            pixelCount++;
          }
        }
        
        const redAreaProportion = saturatedRedPixelCount / pixelCount;
        
        zones.push({
          id: `${row}_${col}`,
          x, y, w, h,
          luminance: zoneLuminance / pixelCount,
          redAreaProportion: redAreaProportion
        });
      }
    }
    
    return zones;
  }

  detectStaticPatterns(imageData, width, height) {
    const patterns = [];
    const sampleStep = 4;
    let highContrastTransitionCount = 0;
    let totalSamples = 0;
    
    for (let y = 0; y < height - sampleStep; y += sampleStep) {
      for (let x = 0; x < width - sampleStep; x += sampleStep) {
        const idx1 = (y * width + x) * 4;
        const idx2 = (y * width + (x + sampleStep)) * 4;
        const idx3 = ((y + sampleStep) * width + x) * 4;
        
        if (idx2 >= imageData.data.length || idx3 >= imageData.data.length) continue;
        
        const lum1 = 0.299 * imageData.data[idx1] + 0.587 * imageData.data[idx1 + 1] + 0.114 * imageData.data[idx1 + 2];
        const lum2 = 0.299 * imageData.data[idx2] + 0.587 * imageData.data[idx2 + 1] + 0.114 * imageData.data[idx2 + 2];
        const lum3 = 0.299 * imageData.data[idx3] + 0.587 * imageData.data[idx3 + 1] + 0.114 * imageData.data[idx3 + 2];
        
        const horizontalDiff = Math.abs(lum1 - lum2);
        const verticalDiff = Math.abs(lum1 - lum3);
        
        if (horizontalDiff > 100 || verticalDiff > 100) {
          highContrastTransitionCount++;
        }
        totalSamples++;
      }
    }
    
    if (totalSamples === 0) return patterns;
    
    const patternRatio = highContrastTransitionCount / totalSamples;
    if (patternRatio > 0.3) {
      patterns.push({
        type: 'high_contrast_pattern',
        severity: patternRatio > 0.5 ? 'high' : 'medium',
        description: `Motif à fort contraste sur ${(patternRatio * 100).toFixed(0)}% de la frame`
      });
    }
    
    return patterns;
  }

  detectFlashes(frameDataList) {
    const timeWindow = 0.5;
    const relativeThreshold = 0.1;
    const darkImageThreshold = 0.80;
    const redSaturationThreshold = 0.5;
    const minZoneWidth = 341;
    const minZoneHeight = 256;
    
    const allZoneTransitions = [];
    const patterns = [];
    
    for (let i = 1; i < frameDataList.length; i++) {
      const current = frameDataList[i];
      const previous = frameDataList[i - 1];
      const timeDiff = parseFloat(current.temps) - parseFloat(previous.temps);
      
      if (timeDiff > timeWindow) continue;
      
      const frameGeneralZones = [];
      const frameRedZones = [];
      
      if (current.zones && previous.zones) {
        for (let z = 0; z < current.zones.length; z++) {
          const currZone = current.zones[z];
          const prevZone = previous.zones[z];
          
          if (!currZone || !prevZone) continue;
          
          const zoneCurrentRel = currZone.luminance / 255;
          const zonePrevRel = prevZone.luminance / 255;
          const zoneDarker = Math.min(zoneCurrentRel, zonePrevRel);
          const zoneLumDiff = Math.abs(zoneCurrentRel - zonePrevRel);
          
          if (zoneLumDiff >= relativeThreshold && zoneDarker < darkImageThreshold) {
            frameGeneralZones.push({
              zoneId: currZone.id,
              area: currZone.w * currZone.h,
              direction: currZone.luminance > prevZone.luminance ? 'increase' : 'decrease'
            });
          }
          
          const redAreaThreshold = 0.25;
          if ((currZone.redAreaProportion >= redAreaThreshold || prevZone.redAreaProportion >= redAreaThreshold)) {
            const redAreaDiff = Math.abs(currZone.redAreaProportion - prevZone.redAreaProportion);
            if (redAreaDiff >= 0.1) {
              frameRedZones.push({
                zoneId: currZone.id,
                area: currZone.w * currZone.h,
                direction: currZone.redAreaProportion > prevZone.redAreaProportion ? 'increase' : 'decrease'
              });
            }
          }
        }
        
        const increasingGeneralZones = frameGeneralZones.filter(z => z.direction === 'increase');
        const decreasingGeneralZones = frameGeneralZones.filter(z => z.direction === 'decrease');
        const increasingGeneralArea = increasingGeneralZones.reduce((sum, z) => sum + z.area, 0);
        const decreasingGeneralArea = decreasingGeneralZones.reduce((sum, z) => sum + z.area, 0);
        
        if (increasingGeneralArea >= minZoneWidth * minZoneHeight) {
          allZoneTransitions.push({
            time: parseFloat(current.temps),
            type: 'general',
            direction: 'increase',
            zones: increasingGeneralZones,
            totalArea: increasingGeneralArea
          });
        }
        
        if (decreasingGeneralArea >= minZoneWidth * minZoneHeight) {
          allZoneTransitions.push({
            time: parseFloat(current.temps),
            type: 'general',
            direction: 'decrease',
            zones: decreasingGeneralZones,
            totalArea: decreasingGeneralArea
          });
        }
        
        const increasingRedZones = frameRedZones.filter(z => z.direction === 'increase');
        const decreasingRedZones = frameRedZones.filter(z => z.direction === 'decrease');
        const increasingRedArea = increasingRedZones.reduce((sum, z) => sum + z.area, 0);
        const decreasingRedArea = decreasingRedZones.reduce((sum, z) => sum + z.area, 0);
        
        if (increasingRedArea >= minZoneWidth * minZoneHeight) {
          allZoneTransitions.push({
            time: parseFloat(current.temps),
            type: 'red',
            direction: 'increase',
            zones: increasingRedZones,
            totalArea: increasingRedArea
          });
        }
        
        if (decreasingRedArea >= minZoneWidth * minZoneHeight) {
          allZoneTransitions.push({
            time: parseFloat(current.temps),
            type: 'red',
            direction: 'decrease',
            zones: decreasingRedZones,
            totalArea: decreasingRedArea
          });
        }
      }
      
      if (current.patterns && current.patterns.length > 0) {
        patterns.push(...current.patterns.map(p => ({
          ...p,
          time: parseFloat(current.temps)
        })));
      }
    }
    
    const generalTransitions = allZoneTransitions.filter(t => t.type === 'general');
    const redTransitions = allZoneTransitions.filter(t => t.type === 'red');
    
    const allGeneralFlashes = this.pairTransitions(generalTransitions, timeWindow).map(f => ({ ...f, type: 'general' }));
    const allRedFlashes = this.pairTransitions(redTransitions, timeWindow).map(f => ({ ...f, type: 'red' }));
    
    const allFlashes = [...allGeneralFlashes, ...allRedFlashes].sort((a, b) => a.time - b.time);
    
    const { maxGeneral, maxRed, dangerousIntervals } = this.analyzeFlashRates(
      allGeneralFlashes,
      allRedFlashes,
      frameDataList.length > 0 ? parseFloat(frameDataList[frameDataList.length - 1].temps) : 0
    );
    
    const dangerousPatterns = this.detectDangerousPatterns(frameDataList, timeWindow);
    const allPatterns = [...patterns, ...dangerousPatterns];
    
    const isSafe = maxGeneral <= 3 && maxRed <= 3 && allPatterns.filter(p => p.severity === 'high').length === 0;
    
    return {
      flashCount: allFlashes.length,
      generalFlashCount: allGeneralFlashes.length,
      redFlashCount: allRedFlashes.length,
      maxFlashesPerSecond: Math.max(maxGeneral, maxRed),
      maxGeneralFlashesPerSecond: maxGeneral,
      maxRedFlashesPerSecond: maxRed,
      dangerousSeconds: dangerousIntervals,
      flashes: allFlashes,
      patterns: allPatterns,
      isSafe,
      compliance: isSafe 
        ? 'WCAG 2.1 conforme (flashs généraux, rouges, zones spatiales ≥341×256px et patterns)' 
        : 'WCAG 2.1 non conforme - Risque de crises photosensibles'
    };
  }
  
  detectDangerousPatterns(frameDataList, minDuration) {
    const patterns = [];
    let consecutiveHighContrastFrames = 0;
    let patternStartTime = null;
    
    for (let i = 0; i < frameDataList.length; i++) {
      const frame = frameDataList[i];
      const hasHighContrastPattern = frame.patterns && frame.patterns.some(p => p.severity === 'high');
      
      if (hasHighContrastPattern) {
        if (consecutiveHighContrastFrames === 0) {
          patternStartTime = parseFloat(frame.temps);
        }
        consecutiveHighContrastFrames++;
      } else {
        if (consecutiveHighContrastFrames > 0) {
          const endTime = parseFloat(frameDataList[i - 1].temps);
          const duration = endTime - patternStartTime;
          
          if (duration >= minDuration) {
            patterns.push({
              type: 'persistent_high_contrast_pattern',
              severity: 'high',
              description: `Motif à fort contraste persistant pendant ${duration.toFixed(1)}s`,
              startTime: patternStartTime,
              endTime: endTime,
              duration: duration
            });
          }
          
          consecutiveHighContrastFrames = 0;
          patternStartTime = null;
        }
      }
    }
    
    if (consecutiveHighContrastFrames > 0 && frameDataList.length > 0) {
      const endTime = parseFloat(frameDataList[frameDataList.length - 1].temps);
      const duration = endTime - patternStartTime;
      
      if (duration >= minDuration) {
        patterns.push({
          type: 'persistent_high_contrast_pattern',
          severity: 'high',
          description: `Motif à fort contraste persistant jusqu'à la fin (${duration.toFixed(1)}s)`,
          startTime: patternStartTime,
          endTime: endTime,
          duration: duration
        });
      }
    }
    
    return patterns;
  }
  
  pairTransitions(transitions, timeWindow) {
    const paired = [];
    for (let i = 0; i < transitions.length - 1; i++) {
      const first = transitions[i];
      const second = transitions[i + 1];
      
      if (first.direction !== second.direction) {
        const timeDiff = second.time - first.time;
        if (timeDiff <= timeWindow) {
          paired.push({
            time: first.time,
            endTime: second.time,
            type: first.type
          });
          i++;
        }
      }
    }
    return paired;
  }
  
  analyzeFlashRates(generalFlashes, redFlashes, duration) {
    let maxGeneral = 0;
    let maxRed = 0;
    const dangerousIntervals = [];
    
    for (let t = 0; t < duration; t += 0.1) {
      const windowEnd = t + 1.0;
      
      const generalCount = generalFlashes.filter(f => f.time >= t && f.time < windowEnd).length;
      const redCount = redFlashes.filter(f => f.time >= t && f.time < windowEnd).length;
      
      if (generalCount > maxGeneral) maxGeneral = generalCount;
      if (redCount > maxRed) maxRed = redCount;
      
      if (generalCount > 3 || redCount > 3) {
        const existing = dangerousIntervals.find(interval => Math.abs(interval.start - t) < 0.5);
        if (!existing) {
          dangerousIntervals.push({
            start: t.toFixed(1),
            end: windowEnd.toFixed(1),
            count: generalCount + redCount,
            generalCount,
            redCount
          });
        }
      }
    }
    
    return { maxGeneral, maxRed, dangerousIntervals };
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
