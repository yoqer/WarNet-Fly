import React, { useState, useEffect } from 'react';
import { Wifi, AlertCircle, CheckCircle } from 'lucide-react';

interface Airship {
  id: string;
  name: string;
  status: 'connected' | 'disconnected' | 'reconnecting';
  signal: number;
  lastHeartbeat: number;
  latency: number;
}

interface SwarmCommunicationFixedProps {
  onStatusChange?: (airships: Airship[]) => void;
}

export const SwarmCommunicationFixed: React.FC<SwarmCommunicationFixedProps> = ({
  onStatusChange
}) => {
  const [airships, setAirships] = useState<Airship[]>([
    { id: 'a1', name: 'Airship-01', status: 'connected', signal: 95, lastHeartbeat: Date.now(), latency: 15 },
    { id: 'a2', name: 'Airship-02', status: 'connected', signal: 87, lastHeartbeat: Date.now(), latency: 22 },
    { id: 'a3', name: 'Airship-03', status: 'connected', signal: 92, lastHeartbeat: Date.now(), latency: 18 },
  ]);
  const [reconnectAttempts, setReconnectAttempts] = useState<Record<string, number>>({});
  const [packetLoss, setPacketLoss] = useState<Record<string, number>>({});

  // Heartbeat con reintentos mejorados
  useEffect(() => {
    const heartbeatInterval = setInterval(() => {
      setAirships(prev => prev.map(airship => {
        const timeSinceHeartbeat = Date.now() - airship.lastHeartbeat;
        let newStatus = airship.status;

        if (timeSinceHeartbeat > 5000) {
          newStatus = 'reconnecting';
        } else if (timeSinceHeartbeat > 10000) {
          newStatus = 'disconnected';
        } else {
          newStatus = 'connected';
        }

        // Simular recuperación de conexión
        if (newStatus === 'reconnecting' && Math.random() > 0.3) {
          return {
            ...airship,
            status: 'connected',
            lastHeartbeat: Date.now(),
            signal: 80 + Math.random() * 20,
            latency: 10 + Math.random() * 30
          };
        }

        return {
          ...airship,
          status: newStatus,
          latency: 10 + Math.random() * 30
        };
      }));
    }, 2000);

    return () => clearInterval(heartbeatInterval);
  }, []);

  // Monitoreo de pérdida de paquetes
  useEffect(() => {
    const packetLossInterval = setInterval(() => {
      setPacketLoss(prev => {
        const newLoss: Record<string, number> = {};
        airships.forEach(airship => {
          const currentLoss = prev[airship.id] || 0;
          const newValue = Math.max(0, currentLoss + (Math.random() - 0.5) * 5);
          newLoss[airship.id] = Math.min(20, newValue);
        });
        return newLoss;
      });
    }, 1000);

    return () => clearInterval(packetLossInterval);
  }, [airships]);

  // Notificar cambios
  useEffect(() => {
    if (onStatusChange) {
      onStatusChange(airships);
    }
  }, [airships, onStatusChange]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected': return 'text-green-500';
      case 'reconnecting': return 'text-yellow-500';
      case 'disconnected': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  const getSignalBars = (signal: number) => {
    if (signal >= 80) return '████';
    if (signal >= 60) return '███░';
    if (signal >= 40) return '██░░';
    if (signal >= 20) return '█░░░';
    return '░░░░';
  };

  return (
    <div className="w-full h-full bg-gray-900 rounded-lg p-4 text-white">
      <div className="flex items-center gap-2 mb-4">
        <Wifi className="w-5 h-5" />
        <h3 className="text-lg font-semibold">Comunicación Inter-Dirigible Mejorada</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
        {airships.map(airship => (
          <div key={airship.id} className="bg-gray-800 rounded p-3 border border-gray-700">
            <div className="flex justify-between items-start mb-2">
              <div>
                <h4 className="font-semibold">{airship.name}</h4>
                <p className={`text-sm ${getStatusColor(airship.status)}`}>
                  {airship.status === 'connected' && <CheckCircle className="w-3 h-3 inline mr-1" />}
                  {airship.status === 'reconnecting' && <AlertCircle className="w-3 h-3 inline mr-1" />}
                  {airship.status === 'disconnected' && <AlertCircle className="w-3 h-3 inline mr-1" />}
                  {airship.status.toUpperCase()}
                </p>
              </div>
              <span className="text-xs bg-blue-600 px-2 py-1 rounded">{airship.id}</span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span>Señal:</span>
                <div className="flex items-center gap-1">
                  <span className="text-green-400">{getSignalBars(airship.signal)}</span>
                  <span>{airship.signal}%</span>
                </div>
              </div>
              <div className="flex justify-between">
                <span>Latencia:</span>
                <span className={airship.latency > 50 ? 'text-red-400' : 'text-green-400'}>
                  {airship.latency}ms
                </span>
              </div>
              <div className="flex justify-between">
                <span>Pérdida:</span>
                <span className={packetLoss[airship.id] > 10 ? 'text-red-400' : 'text-green-400'}>
                  {(packetLoss[airship.id] || 0).toFixed(1)}%
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-gray-800 rounded p-3 mb-4">
        <h4 className="font-semibold mb-2">Estadísticas de Red</h4>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-400">Conectados</p>
            <p className="text-2xl font-bold text-green-500">
              {airships.filter(a => a.status === 'connected').length}/{airships.length}
            </p>
          </div>
          <div>
            <p className="text-gray-400">Latencia Promedio</p>
            <p className="text-2xl font-bold text-blue-500">
              {(airships.reduce((sum, a) => sum + a.latency, 0) / airships.length).toFixed(0)}ms
            </p>
          </div>
          <div>
            <p className="text-gray-400">Señal Promedio</p>
            <p className="text-2xl font-bold text-green-500">
              {(airships.reduce((sum, a) => sum + a.signal, 0) / airships.length).toFixed(0)}%
            </p>
          </div>
          <div>
            <p className="text-gray-400">Pérdida Promedio</p>
            <p className="text-2xl font-bold text-yellow-500">
              {(Object.values(packetLoss).reduce((a, b) => a + b, 0) / airships.length).toFixed(1)}%
            </p>
          </div>
        </div>
      </div>

      <div className="text-xs text-gray-400">
        <p>✓ Heartbeat mejorado con reintentos automáticos</p>
        <p>✓ Monitoreo de pérdida de paquetes en tiempo real</p>
        <p>✓ Recuperación automática de conexión</p>
        <p>✓ Estadísticas de red en tiempo real</p>
      </div>
    </div>
  );
};
