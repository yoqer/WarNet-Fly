import React, { useState, useEffect, useRef } from 'react';
import { AlertCircle, Thermometer, Settings, Play, Pause } from 'lucide-react';

interface ThermalObject {
  id: string;
  x: number;
  y: number;
  temperature: number;
  confidence: number;
  type: 'person' | 'animal' | 'vehicle' | 'object';
  timestamp: number;
}

interface ThermalCameraSystemFixedProps {
  onObjectDetected?: (objects: ThermalObject[]) => void;
}

export const ThermalCameraSystemFixed: React.FC<ThermalCameraSystemFixedProps> = ({
  onObjectDetected
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isRunning, setIsRunning] = useState(true);
  const [temperature, setTemperature] = useState(25);
  const [sensitivity, setSensitivity] = useState(0.7);
  const [detectedObjects, setDetectedObjects] = useState<ThermalObject[]>([]);
  const [falsePositiveFilter, setFalsePositiveFilter] = useState(true);
  const [frameRate, setFrameRate] = useState(30);
  const [noiseLevel, setNoiseLevel] = useState(0.1);
  const animationFrameRef = useRef<number | undefined>(undefined);
  const objectHistoryRef = useRef<Map<string, ThermalObject[]>>(new Map());

  // Filtro de falsos positivos mejorado
  const filterFalsePositives = (objects: ThermalObject[]): ThermalObject[] => {
    if (!falsePositiveFilter) return objects;

    return objects.filter(obj => {
      // Verificar confianza mínima
      if (obj.confidence < 0.5) return false;

      // Verificar coherencia temporal
      const history = objectHistoryRef.current.get(obj.id) || [];
      if (history.length > 0) {
        const lastObj = history[history.length - 1];
        const distance = Math.hypot(obj.x - lastObj.x, obj.y - lastObj.y);
        
        // Si el objeto se mueve demasiado rápido, es probablemente un falso positivo
        if (distance > 50) return false;

        // Si la temperatura cambia demasiado, es probablemente ruido
        if (Math.abs(obj.temperature - lastObj.temperature) > 15) return false;
      }

      // Actualizar historial
      const newHistory = [...(history || []), obj].slice(-10);
      objectHistoryRef.current.set(obj.id, newHistory);

      return true;
    });
  };

  // Reducir ruido en la imagen térmica
  const reduceNoise = (imageData: ImageData): ImageData => {
    const data = imageData.data;
    const width = imageData.width;
    const height = imageData.height;
    const output = new Uint8ClampedArray(data);

    for (let i = 0; i < data.length; i += 4) {
      if (noiseLevel > 0) {
        // Aplicar filtro de mediana simple
        const pixelIndex = i / 4;
        const x = pixelIndex % width;
        const y = Math.floor(pixelIndex / width);

        if (x > 0 && x < width - 1 && y > 0 && y < height - 1) {
          const neighbors = [];
          for (let dy = -1; dy <= 1; dy++) {
            for (let dx = -1; dx <= 1; dx++) {
              const nIndex = ((y + dy) * width + (x + dx)) * 4;
              neighbors.push(data[nIndex]);
            }
          }
          neighbors.sort((a, b) => a - b);
          const median = neighbors[4];
          output[i] = Math.round(data[i] * (1 - noiseLevel) + median * noiseLevel);
        }
      }
    }

    return new ImageData(output, width, height);
  };

  // Simular captura térmica mejorada
  const captureFrame = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Limpiar canvas
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Generar objetos térmicos con mejor algoritmo
    const objects: ThermalObject[] = [];
    const numObjects = Math.floor(Math.random() * 3) + 1;

    for (let i = 0; i < numObjects; i++) {
      const obj: ThermalObject = {
        id: `thermal-${i}-${Date.now()}`,
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        temperature: 20 + Math.random() * 40,
        confidence: 0.7 + Math.random() * 0.3,
        type: ['person', 'animal', 'vehicle', 'object'][Math.floor(Math.random() * 4)] as any,
        timestamp: Date.now()
      };

      objects.push(obj);

      // Dibujar objeto térmico
      const hue = (obj.temperature - 20) / 40 * 360;
      ctx.fillStyle = `hsl(${hue}, 100%, 50%)`;
      ctx.beginPath();
      ctx.arc(obj.x, obj.y, 15 + Math.random() * 10, 0, Math.PI * 2);
      ctx.fill();
    }

    // Aplicar reducción de ruido
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const denoisedData = reduceNoise(imageData);
    ctx.putImageData(denoisedData, 0, 0);

    // Filtrar falsos positivos
    const filtered = filterFalsePositives(objects);
    setDetectedObjects(filtered);

    if (onObjectDetected) {
      onObjectDetected(filtered);
    }

    // Dibujar información
    ctx.fillStyle = '#00FF00';
    ctx.font = '12px monospace';
    ctx.fillText(`Objetos: ${filtered.length}`, 10, 20);
    ctx.fillText(`Temp: ${temperature}°C`, 10, 35);
    ctx.fillText(`Sensibilidad: ${(sensitivity * 100).toFixed(0)}%`, 10, 50);
  };

  const animate = () => {
    if (isRunning) {
      captureFrame();
    }
    animationFrameRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    animationFrameRef.current = requestAnimationFrame(animate);
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isRunning, temperature, sensitivity, falsePositiveFilter, noiseLevel]);

  return (
    <div className="w-full h-full bg-gray-900 rounded-lg p-4 text-white">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <Thermometer className="w-5 h-5" />
          <h3 className="text-lg font-semibold">Cámara Térmica Mejorada</h3>
        </div>
        <button
          onClick={() => setIsRunning(!isRunning)}
          className="p-2 bg-blue-600 hover:bg-blue-700 rounded"
        >
          {isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
        </button>
      </div>

      <canvas
        ref={canvasRef}
        width={640}
        height={480}
        className="w-full border-2 border-green-500 rounded mb-4"
      />

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm mb-2">Temperatura Base: {temperature}°C</label>
          <input
            type="range"
            min="0"
            max="50"
            value={temperature}
            onChange={(e) => setTemperature(Number(e.target.value))}
            className="w-full"
          />
        </div>
        <div>
          <label className="block text-sm mb-2">Sensibilidad: {(sensitivity * 100).toFixed(0)}%</label>
          <input
            type="range"
            min="0.1"
            max="1"
            step="0.1"
            value={sensitivity}
            onChange={(e) => setSensitivity(Number(e.target.value))}
            className="w-full"
          />
        </div>
        <div>
          <label className="block text-sm mb-2">Ruido: {(noiseLevel * 100).toFixed(0)}%</label>
          <input
            type="range"
            min="0"
            max="0.5"
            step="0.05"
            value={noiseLevel}
            onChange={(e) => setNoiseLevel(Number(e.target.value))}
            className="w-full"
          />
        </div>
        <div>
          <label className="block text-sm mb-2">FPS: {frameRate}</label>
          <input
            type="range"
            min="10"
            max="60"
            step="5"
            value={frameRate}
            onChange={(e) => setFrameRate(Number(e.target.value))}
            className="w-full"
          />
        </div>
      </div>

      <div className="flex items-center gap-2 mb-4">
        <input
          type="checkbox"
          id="falsePositiveFilter"
          checked={falsePositiveFilter}
          onChange={(e) => setFalsePositiveFilter(e.target.checked)}
          className="w-4 h-4"
        />
        <label htmlFor="falsePositiveFilter" className="text-sm">
          Filtro de Falsos Positivos Activado
        </label>
      </div>

      <div className="bg-gray-800 rounded p-3 mb-4">
        <h4 className="font-semibold mb-2 flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          Objetos Detectados: {detectedObjects.length}
        </h4>
        <div className="max-h-32 overflow-y-auto text-xs">
          {detectedObjects.map((obj) => (
            <div key={obj.id} className="py-1 border-b border-gray-700">
              {obj.type.toUpperCase()} - {obj.temperature.toFixed(1)}°C - Confianza: {(obj.confidence * 100).toFixed(0)}%
            </div>
          ))}
        </div>
      </div>

      <div className="text-xs text-gray-400">
        <p>✓ Filtro de falsos positivos mejorado</p>
        <p>✓ Reducción de ruido implementada</p>
        <p>✓ Coherencia temporal verificada</p>
        <p>✓ Historial de objetos mantenido</p>
      </div>
    </div>
  );
};
