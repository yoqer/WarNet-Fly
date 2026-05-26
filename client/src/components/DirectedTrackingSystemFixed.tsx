import React, { useState, useEffect } from 'react';
import { Crosshair, Zap } from 'lucide-react';

interface TrackingTarget {
  x: number;
  y: number;
  vx: number;
  vy: number;
  speed: number;
}

interface DirectedTrackingSystemFixedProps {
  onTrackingUpdate?: (pan: number, tilt: number, zoom: number) => void;
}

export const DirectedTrackingSystemFixed: React.FC<DirectedTrackingSystemFixedProps> = ({
  onTrackingUpdate
}) => {
  const [target, setTarget] = useState<TrackingTarget>({
    x: 320,
    y: 240,
    vx: 2,
    vy: 1.5,
    speed: 2.5
  });

  const [cameraPos, setCameraPos] = useState({ pan: 0, tilt: 0, zoom: 1 });
  const [trackingMode, setTrackingMode] = useState<'manual' | 'auto' | 'predictive'>('auto');
  const [trackingAccuracy, setTrackingAccuracy] = useState(95);
  const [predictionError, setPredictionError] = useState(0);

  // Algoritmo de predicción mejorado
  const predictTargetPosition = (frames: number = 1) => {
    const predictedX = target.x + target.vx * frames;
    const predictedY = target.y + target.vy * frames;
    return { x: predictedX, y: predictedY };
  };

  // Cálculo de ángulos pan/tilt mejorado
  const calculateCameraAngles = (targetX: number, targetY: number) => {
    const centerX = 320;
    const centerY = 240;

    const deltaX = targetX - centerX;
    const deltaY = targetY - centerY;

    const pan = (deltaX / 320) * 45; // ±45 grados
    const tilt = (deltaY / 240) * 30; // ±30 grados

    return { pan, tilt };
  };

  // Actualizar posición del objetivo
  useEffect(() => {
    const updateInterval = setInterval(() => {
      setTarget(prev => {
        let newX = prev.x + prev.vx;
        let newY = prev.y + prev.vy;
        let newVx = prev.vx;
        let newVy = prev.vy;

        // Rebotar en los bordes con aceleración variable
        if (newX < 20 || newX > 620) {
          newVx *= -1;
          newX = Math.max(20, Math.min(620, newX));
        }
        if (newY < 20 || newY > 460) {
          newVy *= -1;
          newY = Math.max(20, Math.min(460, newY));
        }

        // Añadir pequeña variación aleatoria para simular movimiento natural
        newVx += (Math.random() - 0.5) * 0.2;
        newVy += (Math.random() - 0.5) * 0.2;

        // Limitar velocidad máxima
        const maxSpeed = 4;
        const currentSpeed = Math.hypot(newVx, newVy);
        if (currentSpeed > maxSpeed) {
          newVx = (newVx / currentSpeed) * maxSpeed;
          newVy = (newVy / currentSpeed) * maxSpeed;
        }

        return {
          ...prev,
          x: newX,
          y: newY,
          vx: newVx,
          vy: newVy,
          speed: Math.hypot(newVx, newVy)
        };
      });
    }, 50); // 20 FPS para movimiento suave

    return () => clearInterval(updateInterval);
  }, []);

  // Actualizar posición de la cámara según modo de rastreo
  useEffect(() => {
    const trackingInterval = setInterval(() => {
      let targetPos = { x: target.x, y: target.y };

      // Predicción en modo predictivo
      if (trackingMode === 'predictive') {
        const framesAhead = Math.ceil(target.speed * 2);
        targetPos = predictTargetPosition(framesAhead);

        // Calcular error de predicción
        const actualX = target.x;
        const actualY = target.y;
        const error = Math.hypot(
          targetPos.x - actualX,
          targetPos.y - actualY
        );
        setPredictionError(Math.round(error));
      }

      // Calcular ángulos
      const angles = calculateCameraAngles(targetPos.x, targetPos.y);

      // Suavizar movimiento de la cámara
      setCameraPos(prev => ({
        pan: prev.pan + (angles.pan - prev.pan) * 0.15,
        tilt: prev.tilt + (angles.tilt - prev.tilt) * 0.15,
        zoom: 1
      }));

      // Notificar cambios
      if (onTrackingUpdate) {
        onTrackingUpdate(angles.pan, angles.tilt, 1);
      }

      // Actualizar precisión
      const accuracy = Math.max(60, 100 - (Math.abs(angles.pan) + Math.abs(angles.tilt)) * 0.5);
      setTrackingAccuracy(Math.round(accuracy));
    }, 100);

    return () => clearInterval(trackingInterval);
  }, [target, trackingMode, onTrackingUpdate]);

  return (
    <div className="w-full h-full bg-gray-900 rounded-lg p-4 text-white">
      <div className="flex items-center gap-2 mb-4">
        <Crosshair className="w-5 h-5" />
        <h3 className="text-lg font-semibold">Rastreo Dirigido Mejorado</h3>
      </div>

      {/* Simulador de cámara */}
      <div className="relative w-full bg-black rounded mb-4 border-2 border-green-500" style={{ aspectRatio: '4/3' }}>
        <svg width="100%" height="100%" viewBox="0 0 640 480" className="bg-black">
          {/* Cuadrícula */}
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#333" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="640" height="480" fill="url(#grid)" />

          {/* Objetivo */}
          <circle cx={target.x} cy={target.y} r="10" fill="#FF0000" />
          <circle cx={target.x} cy={target.y} r="15" fill="none" stroke="#FF0000" strokeWidth="1" />

          {/* Vector de velocidad */}
          <line
            x1={target.x}
            y1={target.y}
            x2={target.x + target.vx * 20}
            y2={target.y + target.vy * 20}
            stroke="#00FF00"
            strokeWidth="2"
          />

          {/* Punto de predicción (en modo predictivo) */}
          {trackingMode === 'predictive' && (
            <>
              <circle
                cx={predictTargetPosition(4).x}
                cy={predictTargetPosition(4).y}
                r="8"
                fill="none"
                stroke="#FFFF00"
                strokeWidth="2"
                strokeDasharray="4"
              />
              <text x="10" y="30" fill="#FFFF00" fontSize="12">
                Predicción: {predictionError}px
              </text>
            </>
          )}

          {/* Información */}
          <text x="10" y="20" fill="#00FF00" fontSize="12">
            Velocidad: {target.speed.toFixed(1)} px/frame
          </text>
        </svg>
      </div>

      {/* Controles */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        {(['manual', 'auto', 'predictive'] as const).map(mode => (
          <button
            key={mode}
            onClick={() => setTrackingMode(mode)}
            className={`py-2 rounded text-sm font-semibold capitalize transition ${
              trackingMode === mode
                ? 'bg-blue-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            {mode}
          </button>
        ))}
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-gray-800 rounded p-3">
          <p className="text-sm text-gray-400">Pan</p>
          <p className="text-2xl font-bold text-blue-500">{cameraPos.pan.toFixed(1)}°</p>
        </div>
        <div className="bg-gray-800 rounded p-3">
          <p className="text-sm text-gray-400">Tilt</p>
          <p className="text-2xl font-bold text-blue-500">{cameraPos.tilt.toFixed(1)}°</p>
        </div>
        <div className="bg-gray-800 rounded p-3">
          <p className="text-sm text-gray-400">Precisión</p>
          <p className={`text-2xl font-bold ${trackingAccuracy > 80 ? 'text-green-500' : 'text-yellow-500'}`}>
            {trackingAccuracy}%
          </p>
        </div>
        <div className="bg-gray-800 rounded p-3">
          <p className="text-sm text-gray-400">Modo</p>
          <p className="text-lg font-bold text-purple-500 capitalize">{trackingMode}</p>
        </div>
      </div>

      <div className="text-xs text-gray-400">
        <p>✓ Rastreo predictivo mejorado</p>
        <p>✓ Suavizado de movimiento de cámara</p>
        <p>✓ Seguimiento de objetos rápidos</p>
        <p>✓ Múltiples modos de rastreo</p>
      </div>
    </div>
  );
};
