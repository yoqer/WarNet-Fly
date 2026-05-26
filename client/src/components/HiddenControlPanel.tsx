import React, { useState, useEffect } from 'react';
import { X, AlertCircle, Zap, Radio, Eye, Compass, Settings, BarChart3 } from 'lucide-react';

interface HiddenControlPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HiddenControlPanel: React.FC<HiddenControlPanelProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [systemStatus, setSystemStatus] = useState({
    thermalCamera: 'online',
    swarmComm: 'online',
    objectTracker: 'online',
    landingSystem: 'online',
    sensorFusion: 'online',
  });

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'sensors', label: 'Sensores', icon: Radio },
    { id: 'swarm', label: 'Enjambre', icon: Zap },
    { id: 'tracking', label: 'Rastreo', icon: Eye },
    { id: 'landing', label: 'Aterrizaje', icon: Compass },
    { id: 'settings', label: 'Configuración', icon: Settings },
  ];

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="fixed inset-4 md:inset-8 lg:inset-12 bg-slate-900 border border-cyan-500/50 rounded-lg shadow-2xl z-50 flex flex-col overflow-hidden animate-in fade-in zoom-in duration-300">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-cyan-500/30 bg-slate-800/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-lg flex items-center justify-center">
              <Zap className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-cyan-400">WarNet Command Center</h2>
              <p className="text-xs text-gray-400">Sistema de Control Avanzado</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-700 rounded-lg transition text-gray-400 hover:text-white"
            title="Cerrar (ESC)"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 px-6 pt-4 border-b border-cyan-500/20 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-t-lg text-sm font-medium transition whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-cyan-500/20 text-cyan-400 border-b-2 border-cyan-400'
                    : 'text-gray-400 hover:text-cyan-300'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4 text-cyan-400">Estado del Sistema</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {Object.entries(systemStatus).map(([key, status]) => (
                    <div
                      key={key}
                      className="p-4 bg-slate-800/50 rounded-lg border border-cyan-500/20 hover:border-cyan-500/50 transition"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <div className={`w-2 h-2 rounded-full ${status === 'online' ? 'bg-green-500' : 'bg-red-500'}`} />
                        <span className="text-sm text-gray-400 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                      </div>
                      <p className={`text-sm font-semibold ${status === 'online' ? 'text-green-400' : 'text-red-400'}`}>
                        {status === 'online' ? '✓ En línea' : '✗ Desconectado'}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4 text-cyan-400">Métricas de Rendimiento</h3>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-400">CPU</span>
                      <span className="text-cyan-400 font-semibold">45%</span>
                    </div>
                    <div className="w-full bg-slate-700 rounded-full h-2">
                      <div className="bg-gradient-to-r from-cyan-500 to-blue-600 h-2 rounded-full" style={{ width: '45%' }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-400">Memoria</span>
                      <span className="text-cyan-400 font-semibold">62%</span>
                    </div>
                    <div className="w-full bg-slate-700 rounded-full h-2">
                      <div className="bg-gradient-to-r from-cyan-500 to-blue-600 h-2 rounded-full" style={{ width: '62%' }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-400">Red</span>
                      <span className="text-cyan-400 font-semibold">28%</span>
                    </div>
                    <div className="w-full bg-slate-700 rounded-full h-2">
                      <div className="bg-gradient-to-r from-cyan-500 to-blue-600 h-2 rounded-full" style={{ width: '28%' }} />
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-yellow-900/20 border border-yellow-600/50 rounded-lg p-4 flex gap-3">
                <AlertCircle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-yellow-400">Notificación</p>
                  <p className="text-xs text-yellow-300/80">Último aterrizaje: 2 horas atrás</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'sensors' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-cyan-400">Configuración de Sensores</h3>
              <div className="space-y-4">
                {[
                  { name: 'Cámara Térmica', status: 'Activa', precision: '99.5%' },
                  { name: 'Radar 3D', status: 'Activo', precision: '98.2%' },
                  { name: 'LiDAR', status: 'Activo', precision: '99.8%' },
                  { name: 'GPS/GNSS', status: 'Activo', precision: '95.1%' },
                ].map((sensor, idx) => (
                  <div key={idx} className="p-4 bg-slate-800/50 rounded-lg border border-cyan-500/20">
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-semibold">{sensor.name}</span>
                      <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded">{sensor.status}</span>
                    </div>
                    <p className="text-sm text-gray-400">Precisión: <span className="text-cyan-400">{sensor.precision}</span></p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'swarm' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-cyan-400">Control de Enjambre</h3>
              <div className="bg-slate-800/50 rounded-lg border border-cyan-500/20 p-4 space-y-3">
                <div>
                  <p className="text-sm text-gray-400 mb-1">Dirigibles Conectados</p>
                  <p className="text-2xl font-bold text-cyan-400">8 / 10</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400 mb-1">Formación Actual</p>
                  <p className="text-lg font-semibold">Pirámide Triangular</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400 mb-1">Latencia Promedio</p>
                  <p className="text-lg font-semibold text-green-400">45ms</p>
                </div>
              </div>
              <button className="w-full px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-lg font-semibold hover:shadow-lg hover:shadow-cyan-500/50 transition">
                Cambiar Formación
              </button>
            </div>
          )}

          {activeTab === 'tracking' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-cyan-400">Sistema de Rastreo</h3>
              <div className="bg-slate-800/50 rounded-lg border border-cyan-500/20 p-4 space-y-3">
                <div>
                  <p className="text-sm text-gray-400 mb-1">Objetos Rastreados</p>
                  <p className="text-2xl font-bold text-cyan-400">47 / 100</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400 mb-1">Modo de Rastreo</p>
                  <select className="w-full px-3 py-2 bg-slate-700 border border-cyan-500/30 rounded text-sm text-white">
                    <option>Automático</option>
                    <option>Manual</option>
                    <option>Predictivo</option>
                  </select>
                </div>
                <div>
                  <p className="text-sm text-gray-400 mb-1">Precisión</p>
                  <p className="text-lg font-semibold text-green-400">94.8%</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'landing' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-cyan-400">Sistema de Aterrizaje</h3>
              <div className="bg-slate-800/50 rounded-lg border border-cyan-500/20 p-4 space-y-3">
                <div>
                  <p className="text-sm text-gray-400 mb-1">Modo de Aterrizaje</p>
                  <select className="w-full px-3 py-2 bg-slate-700 border border-cyan-500/30 rounded text-sm text-white">
                    <option>Automático (ML)</option>
                    <option>Manual</option>
                    <option>Asistido</option>
                  </select>
                </div>
                <div>
                  <p className="text-sm text-gray-400 mb-1">Precisión de Aterrizaje</p>
                  <p className="text-lg font-semibold text-green-400">±0.5m</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400 mb-1">Último Aterrizaje</p>
                  <p className="text-sm">Hace 2 horas - <span className="text-green-400">Exitoso</span></p>
                </div>
              </div>
              <button className="w-full px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-lg font-semibold hover:shadow-lg hover:shadow-cyan-500/50 transition">
                Iniciar Secuencia de Aterrizaje
              </button>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-cyan-400">Configuración Avanzada</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Nivel de Sensibilidad</label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    defaultValue="70"
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Intervalo de Actualización (ms)</label>
                  <input
                    type="number"
                    defaultValue="100"
                    className="w-full px-3 py-2 bg-slate-700 border border-cyan-500/30 rounded text-sm text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Modo de Depuración</label>
                  <div className="flex items-center gap-2">
                    <input type="checkbox" id="debug" className="w-4 h-4" />
                    <label htmlFor="debug" className="text-sm text-gray-400">Habilitar logs detallados</label>
                  </div>
                </div>
              </div>
              <button className="w-full px-4 py-2 bg-slate-700 border border-cyan-500/30 rounded-lg font-semibold hover:border-cyan-400 hover:text-cyan-400 transition">
                Guardar Configuración
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-cyan-500/30 bg-slate-800/50 px-6 py-4 flex justify-between items-center text-xs text-gray-400">
          <span>Versión 4.0.0 | Última actualización: hace 2 minutos</span>
          <button
            onClick={onClose}
            className="px-4 py-2 border border-cyan-500/50 rounded hover:border-cyan-400 hover:text-cyan-400 transition text-sm"
          >
            Cerrar Panel
          </button>
        </div>
      </div>
    </>
  );
};

export default HiddenControlPanel;
