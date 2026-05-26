import React, { useState, useRef } from 'react';
import { Video, Play, Download, Settings, Loader } from 'lucide-react';

interface VideoComposition {
  id: string;
  name: string;
  durationInFrames: number;
  fps: number;
  width: number;
  height: number;
  data?: Record<string, any>;
}

interface VideoGeneratorConfig {
  enableRemotion: boolean;
  autoRender: boolean;
  outputFormat: 'mp4' | 'webm' | 'gif';
  quality: 'low' | 'medium' | 'high';
  fps: number;
}

/**
 * Video Generator Component
 * 
 * Integra Remotion para generación de videos programáticos
 * - Composiciones basadas en React
 * - Renderizado offline
 * - Exportación en múltiples formatos
 * - Parámetros dinámicos
 */

export const VideoGenerator: React.FC<{
  isEnabled?: boolean;
  onVideoGenerated?: (videoUrl: string, metadata: any) => void;
}> = ({ isEnabled = false, onVideoGenerated }) => {
  const [compositions, setCompositions] = useState<VideoComposition[]>([
    {
      id: 'mission-report',
      name: 'Mission Report Video',
      durationInFrames: 300,
      fps: 30,
      width: 1920,
      height: 1080,
    },
    {
      id: 'sensor-analysis',
      name: 'Sensor Analysis Video',
      durationInFrames: 600,
      fps: 30,
      width: 1280,
      height: 720,
    },
    {
      id: 'trajectory-animation',
      name: 'Trajectory Animation',
      durationInFrames: 450,
      fps: 60,
      width: 1920,
      height: 1080,
    },
  ]);

  const [selectedComposition, setSelectedComposition] = useState<string>('mission-report');
  const [isRendering, setIsRendering] = useState(false);
  const [renderProgress, setRenderProgress] = useState(0);
  const [generatedVideos, setGeneratedVideos] = useState<Array<{ id: string; url: string; name: string }>>([]);
  const [config, setConfig] = useState<VideoGeneratorConfig>({
    enableRemotion: true,
    autoRender: false,
    outputFormat: 'mp4',
    quality: 'high',
    fps: 30,
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  /**
   * Renderizar video
   */
  const handleRenderVideo = async () => {
    if (!selectedComposition) return;

    try {
      setIsRendering(true);
      setRenderProgress(0);

      const composition = compositions.find(c => c.id === selectedComposition);
      if (!composition) return;

      // Simular renderizado (en producción, llamaría a Remotion CLI)
      const totalFrames = composition.durationInFrames;
      for (let i = 0; i <= totalFrames; i += 10) {
        setRenderProgress(Math.round((i / totalFrames) * 100));
        await new Promise(resolve => setTimeout(resolve, 50));
      }

      // Crear blob simulado del video
      const videoBlob = new Blob(['video data'], { type: 'video/mp4' });
      const videoUrl = URL.createObjectURL(videoBlob);

      const videoId = `video-${Date.now()}`;
      const newVideo = {
        id: videoId,
        url: videoUrl,
        name: `${composition.name} - ${new Date().toLocaleTimeString()}`,
      };

      setGeneratedVideos([...generatedVideos, newVideo]);
      onVideoGenerated?.(videoUrl, {
        compositionId: composition.id,
        duration: composition.durationInFrames / composition.fps,
        format: config.outputFormat,
        quality: config.quality,
      });

      setRenderProgress(100);
    } catch (error) {
      console.error('Rendering error:', error);
    } finally {
      setIsRendering(false);
    }
  };

  /**
   * Descargar video
   */
  const handleDownloadVideo = (videoUrl: string, name: string) => {
    const a = document.createElement('a');
    a.href = videoUrl;
    a.download = `${name}.${config.outputFormat}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  /**
   * Agregar composición personalizada
   */
  const handleAddComposition = () => {
    const newComposition: VideoComposition = {
      id: `custom-${Date.now()}`,
      name: 'Custom Composition',
      durationInFrames: 300,
      fps: 30,
      width: 1920,
      height: 1080,
    };
    setCompositions([...compositions, newComposition]);
  };

  if (!isEnabled) {
    return null;
  }

  return (
    <div className="fixed bottom-20 right-8 z-40 w-96 bg-slate-900 border border-slate-700 rounded-lg shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-slate-800 border-b border-slate-700 p-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Video className="w-5 h-5 text-purple-500" />
          <span className="text-sm font-semibold text-white">Video Generator</span>
        </div>
      </div>

      {/* Contenido */}
      <div className="p-4 space-y-4 max-h-96 overflow-y-auto">
        {/* Selección de Composición */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-2">
            Composición
          </label>
          <select
            value={selectedComposition}
            onChange={(e) => setSelectedComposition(e.target.value)}
            className="w-full bg-slate-800 border border-slate-600 rounded px-3 py-2 text-white text-sm"
          >
            {compositions.map(comp => (
              <option key={comp.id} value={comp.id}>
                {comp.name}
              </option>
            ))}
          </select>
        </div>

        {/* Configuración */}
        <div className="space-y-2 p-3 bg-slate-800 rounded">
          <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
            <input
              type="checkbox"
              checked={config.autoRender}
              onChange={(e) => setConfig({ ...config, autoRender: e.target.checked })}
              className="w-3 h-3"
            />
            Auto-renderizar
          </label>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Formato
            </label>
            <select
              value={config.outputFormat}
              onChange={(e) => setConfig({ ...config, outputFormat: e.target.value as any })}
              className="w-full bg-slate-700 border border-slate-600 rounded px-2 py-1 text-white text-xs"
            >
              <option value="mp4">MP4</option>
              <option value="webm">WebM</option>
              <option value="gif">GIF</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Calidad
            </label>
            <select
              value={config.quality}
              onChange={(e) => setConfig({ ...config, quality: e.target.value as any })}
              className="w-full bg-slate-700 border border-slate-600 rounded px-2 py-1 text-white text-xs"
            >
              <option value="low">Baja</option>
              <option value="medium">Media</option>
              <option value="high">Alta</option>
            </select>
          </div>
        </div>

        {/* Barra de Progreso */}
        {isRendering && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-300">Renderizando...</span>
              <span className="text-purple-400">{renderProgress}%</span>
            </div>
            <div className="w-full bg-slate-700 rounded-full h-2 overflow-hidden">
              <div
                className="bg-purple-500 h-full transition-all duration-300"
                style={{ width: `${renderProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* Botones de Acción */}
        <div className="flex gap-2">
          <button
            onClick={handleRenderVideo}
            disabled={isRendering}
            className="flex-1 px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded font-medium text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isRendering ? (
              <>
                <Loader className="w-4 h-4 animate-spin" />
                Renderizando
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                Renderizar
              </>
            )}
          </button>
          <button
            onClick={handleAddComposition}
            className="px-3 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded font-medium text-sm transition-colors"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>

        {/* Videos Generados */}
        {generatedVideos.length > 0 && (
          <div className="border-t border-slate-700 pt-3">
            <h4 className="text-xs font-semibold text-slate-300 mb-2">Videos Generados</h4>
            <div className="space-y-2">
              {generatedVideos.map(video => (
                <div
                  key={video.id}
                  className="flex items-center justify-between p-2 bg-slate-800 rounded text-xs"
                >
                  <span className="text-slate-300 truncate">{video.name}</span>
                  <button
                    onClick={() => handleDownloadVideo(video.url, video.name)}
                    className="p-1 text-purple-400 hover:text-purple-300 transition-colors"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="bg-slate-800 border-t border-slate-700 p-3 text-xs text-slate-400">
        <p>Remotion Video Generator - Renderizado local</p>
      </div>

      <input ref={fileInputRef} type="file" hidden accept="video/*" />
    </div>
  );
};

export default VideoGenerator;
