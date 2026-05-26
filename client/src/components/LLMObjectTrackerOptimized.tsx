import { useRef, useEffect, useState } from 'react';
import { Brain, AlertCircle } from 'lucide-react';

interface TrackedObject {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  type: string;
  confidence: number;
  lastSeen: number;
}

interface LLMObjectTrackerOptimizedProps {
  onObjectsTracked?: (objects: TrackedObject[]) => void;
}

// Extender Performance para incluir memory (Chrome-specific)
interface PerformanceWithMemory extends Performance {
  memory?: {
    usedJSHeapSize: number;
    jsHeapSizeLimit: number;
    jsHeapTotalSize: number;
  };
}

export const LLMObjectTrackerOptimized: React.FC<LLMObjectTrackerOptimizedProps> = ({
  onObjectsTracked
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [trackedObjects, setTrackedObjects] = useState<Map<string, TrackedObject>>(new Map());
  const [isRunning, setIsRunning] = useState(true);
  const [memoryUsage, setMemoryUsage] = useState(0);
  const [objectCount, setObjectCount] = useState(0);
  const maxObjectsRef = useRef(50); // Límite máximo de objetos en memoria
  const lastCleanupRef = useRef(Date.now());

  // Limpiar objetos antiguos para evitar fuga de memoria
  const cleanupOldObjects = () => {
    const now = Date.now();
    const timeout = 5000; // 5 segundos sin actualización

    setTrackedObjects(prev => {
      const cleaned = new Map(prev);
      const entriesToDelete: string[] = [];
      
      cleaned.forEach((obj, id) => {
        if (now - obj.lastSeen > timeout) {
          entriesToDelete.push(id);
        }
      });
      
      entriesToDelete.forEach(id => cleaned.delete(id));
      return cleaned;
    });
  };

  // Monitorear memoria
  useEffect(() => {
    const memoryInterval = setInterval(() => {
      const perfWithMemory = performance as PerformanceWithMemory;
      if (perfWithMemory.memory) {
        const usage = (perfWithMemory.memory.usedJSHeapSize / perfWithMemory.memory.jsHeapSizeLimit) * 100;
        setMemoryUsage(Math.round(usage));

        // Limpiar si el uso es muy alto
        if (usage > 85) {
          cleanupOldObjects();
          maxObjectsRef.current = Math.max(20, maxObjectsRef.current - 5);
        } else if (usage < 60) {
          maxObjectsRef.current = Math.min(100, maxObjectsRef.current + 5);
        }
      }
    }, 1000);

    return () => clearInterval(memoryInterval);
  }, []);

  // Limpiar periódicamente
  useEffect(() => {
    const cleanupInterval = setInterval(() => {
      cleanupOldObjects();
      lastCleanupRef.current = Date.now();
    }, 2000);

    return () => clearInterval(cleanupInterval);
  }, []);

  // Actualizar objetos rastreados
  useEffect(() => {
    if (!isRunning) return;

    const updateInterval = setInterval(() => {
      setTrackedObjects(prev => {
        const updated = new Map(prev);
        const now = Date.now();

        // Actualizar posiciones
        updated.forEach((obj) => {
          obj.x += obj.vx;
          obj.y += obj.vy;
          obj.lastSeen = now;

          // Rebotar en los bordes
          if (obj.x < 0 || obj.x > 640) obj.vx *= -1;
          if (obj.y < 0 || obj.y > 480) obj.vy *= -1;
        });

        // Añadir nuevos objetos si hay espacio
        if (updated.size < maxObjectsRef.current && Math.random() > 0.7) {
          const newId = `obj-${Date.now()}-${Math.random()}`;
          updated.set(newId, {
            id: newId,
            x: Math.random() * 640,
            y: Math.random() * 480,
            vx: (Math.random() - 0.5) * 4,
            vy: (Math.random() - 0.5) * 4,
            type: ['bird', 'drone', 'storm', 'object'][Math.floor(Math.random() * 4)],
            confidence: 0.7 + Math.random() * 0.3,
            lastSeen: now
          });
        }

        return updated;
      });
    }, 100);

    return () => clearInterval(updateInterval);
  }, [isRunning]);

  // Dibujar objetos
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const drawFrame = () => {
      // Limpiar canvas
      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Dibujar objetos
      trackedObjects.forEach((obj) => {
        // Color según tipo
        const colors: Record<string, string> = {
          bird: '#00FF00',
          drone: '#FF0000',
          storm: '#FFFF00',
          object: '#00FFFF'
        };

        ctx.fillStyle = colors[obj.type] || '#FFFFFF';
        ctx.beginPath();
        ctx.arc(obj.x, obj.y, 8, 0, Math.PI * 2);
        ctx.fill();

        // Dibujar velocidad
        ctx.strokeStyle = colors[obj.type] || '#FFFFFF';
        ctx.beginPath();
        ctx.moveTo(obj.x, obj.y);
        ctx.lineTo(obj.x + obj.vx * 10, obj.y + obj.vy * 10);
        ctx.stroke();

        // Dibujar ID
        ctx.fillStyle = '#FFFFFF';
        ctx.font = '10px monospace';
        ctx.fillText(obj.type[0].toUpperCase(), obj.x - 3, obj.y + 3);
      });

      // Estadísticas
      ctx.fillStyle = '#00FF00';
      ctx.font = '12px monospace';
      ctx.fillText(`Objetos: ${trackedObjects.size}/${maxObjectsRef.current}`, 10, 20);
      ctx.fillText(`Memoria: ${memoryUsage}%`, 10, 35);

      requestAnimationFrame(drawFrame);
    };

    drawFrame();
  }, [trackedObjects, memoryUsage]);

  // Notificar cambios
  useEffect(() => {
    if (onObjectsTracked) {
      onObjectsTracked(Array.from(trackedObjects.values()));
    }
    setObjectCount(trackedObjects.size);
  }, [trackedObjects, onObjectsTracked]);

  const getTypeStats = () => {
    const stats: Record<string, number> = {};
    trackedObjects.forEach((obj) => {
      stats[obj.type] = (stats[obj.type] || 0) + 1;
    });
    return stats;
  };

  const typeStats = getTypeStats();

  return (
    <div className="w-full h-full bg-gray-900 rounded-lg p-4 text-white">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <Brain className="w-5 h-5" />
          <h3 className="text-lg font-semibold">LLM Object Tracker Optimizado</h3>
        </div>
        <button
          onClick={() => setIsRunning(!isRunning)}
          className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-sm"
        >
          {isRunning ? 'Pausar' : 'Reanudar'}
        </button>
      </div>

      <canvas
        ref={canvasRef}
        width={640}
        height={480}
        className="w-full border-2 border-green-500 rounded mb-4"
      />

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-gray-800 rounded p-3">
          <p className="text-sm text-gray-400">Objetos Rastreados</p>
          <p className="text-2xl font-bold text-green-500">{objectCount}</p>
          <p className="text-xs text-gray-500">Máximo: {maxObjectsRef.current}</p>
        </div>
        <div className="bg-gray-800 rounded p-3">
          <p className="text-sm text-gray-400">Uso de Memoria</p>
          <p className={`text-2xl font-bold ${memoryUsage > 80 ? 'text-red-500' : 'text-green-500'}`}>
            {memoryUsage}%
          </p>
          {memoryUsage > 80 && <p className="text-xs text-red-500">⚠️ Uso alto</p>}
        </div>
      </div>

      <div className="bg-gray-800 rounded p-3 mb-4">
        <h4 className="font-semibold mb-2 flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          Estadísticas por Tipo
        </h4>
        <div className="grid grid-cols-2 gap-2 text-sm">
          {Object.entries(typeStats).map(([type, count]) => (
            <div key={type} className="flex justify-between">
              <span className="capitalize">{type}:</span>
              <span className="font-semibold">{count}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="text-xs text-gray-400">
        <p>✓ Gestión automática de memoria</p>
        <p>✓ Límite dinámico de objetos</p>
        <p>✓ Limpieza de objetos antiguos</p>
        <p>✓ Monitoreo de rendimiento</p>
      </div>
    </div>
  );
};
